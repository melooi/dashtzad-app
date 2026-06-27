"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { notifyIndexNow } from "@/lib/seo/indexnow";
import { convertTomanToRial } from "@/lib/admin/product-pricing";
import { generateVariantSku, ensureUniqueSku, type PackagingTypeKey } from "@/lib/admin/product-variant";
import {
  productFormSchema,
  variantRowSchema,
  type ProductFormInput,
} from "@/lib/admin/products";
import {
  assertProductSlugUnique,
  productDeleteBlockReason,
  nextAvailableProductSlug,
  reconcileProductVariants,
  processQuickAddRows,
  type QuickAddResult,
} from "@/lib/admin/product-service";

// NOTE: do NOT re-export types from a "use server" module — Turbopack turns a
// re-exported binding into a runtime reference (ReferenceError). Importers get
// QuickAddResult directly from "@/lib/admin/product-service".

const LIST = "/admin/collections/products";

export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

export async function createProduct(raw: ProductFormInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productFormSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده نامعتبر است." };
  const v = parsed.data;

  const slugErr = await assertProductSlugUnique(v.slug);
  if (slugErr) return { ok: false, error: slugErr };

  const basePriceRial = convertTomanToRial(v.basePriceToman);
  const created = await prisma.product.create({
    data: {
      title: v.title,
      slug: v.slug,
      description: v.description,
      brand: v.brand,
      story: v.story,
      price_rial: basePriceRial, // legacy field kept in sync with base price
      basePrice_rial: basePriceRial,
      basePriceUnit: v.basePriceUnit,
      tags: v.tags,
      isActive: v.isActive,
      categoryId: v.categoryId,
      // PRODUCT-CARD-CP1
      saleMode: v.saleMode,
      contactPhone: v.contactPhone ?? null,
      installmentEnabled: v.installmentEnabled,
    },
  });
  revalidatePath(LIST);
  if (v.isActive) notifyIndexNow(`/products/${created.slug}`);
  return { ok: true, id: created.id };
}

export async function updateProduct(id: string, raw: ProductFormInput): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "محصول یافت نشد." };

  const parsed = productFormSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "داده نامعتبر است." };
  const v = parsed.data;

  const slugErr = await assertProductSlugUnique(v.slug, id);
  if (slugErr) return { ok: false, error: slugErr };

  const basePriceRial = convertTomanToRial(v.basePriceToman);
  await prisma.product.update({
    where: { id },
    data: {
      title: v.title,
      slug: v.slug,
      description: v.description,
      brand: v.brand,
      story: v.story,
      price_rial: basePriceRial,
      basePrice_rial: basePriceRial,
      basePriceUnit: v.basePriceUnit,
      tags: v.tags,
      isActive: v.isActive,
      categoryId: v.categoryId,
      // PRODUCT-CARD-CP1
      saleMode: v.saleMode,
      contactPhone: v.contactPhone ?? null,
      installmentEnabled: v.installmentEnabled,
    },
  });
  revalidatePath(LIST);
  revalidatePath(`${LIST}/${id}`);
  if (v.isActive) notifyIndexNow(`/products/${v.slug}`);
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  const reason = await productDeleteBlockReason(id);
  if (reason) return { ok: false, error: reason };
  await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  revalidatePath(LIST);
  return { ok: true, id };
}

export async function duplicateProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  const src = await prisma.product.findUnique({
    where: { id },
    include: { variants: { include: { packaging: true } } },
  });
  if (!src) return { ok: false, error: "محصول یافت نشد." };

  const slug = await nextAvailableProductSlug(src.slug);
  const created = await prisma.product.create({
    data: {
      title: `${src.title} (کپی)`,
      slug,
      description: src.description,
      brand: src.brand,
      story: src.story,
      price_rial: src.price_rial,
      basePrice_rial: src.basePrice_rial,
      basePriceUnit: src.basePriceUnit,
      tags: src.tags,
      isActive: false, // duplicates start inactive
      categoryId: src.categoryId,
    },
  });

  // Copy variants with fresh unique, packaging-aware SKUs.
  for (const variant of src.variants) {
    const pkgType = (variant.packaging?.type as PackagingTypeKey | undefined) ?? null;
    const baseSku = generateVariantSku(slug, variant.gramValue, pkgType);
    const sku = await ensureUniqueSku(baseSku, async (s) => {
      const clash = await prisma.productVariant.findUnique({ where: { sku: s } });
      return clash !== null;
    });
    await prisma.productVariant.create({
      data: {
        productId: created.id,
        weightPresetId: variant.weightPresetId,
        packagingOptionId: variant.packagingOptionId,
        weightValue: variant.weightValue,
        weightUnit: variant.weightUnit,
        gramValue: variant.gramValue,
        sku,
        calculatedPrice_rial: variant.calculatedPrice_rial,
        price_rial: variant.price_rial,
        offPrice_rial: variant.offPrice_rial,
        stock: variant.stock,
        isActive: variant.isActive,
        isPriceLocked: variant.isPriceLocked,
        marketingBadge: variant.marketingBadge,
        sortOrder: variant.sortOrder,
      },
    });
  }

  revalidatePath(LIST);
  return { ok: true, id: created.id };
}

// ---- Variant matrix save ----
export async function saveProductVariants(
  productId: string,
  rows: unknown,
): Promise<{ ok: boolean; saved?: number; blocked?: number; error?: string }> {
  await requireAdmin();
  const parsed = z.array(variantRowSchema).safeParse(rows);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ردیف نامعتبر است." };

  const { saved, blocked } = await reconcileProductVariants(productId, parsed.data);
  revalidatePath(`${LIST}/${productId}`);
  return { ok: true, saved, blocked: blocked.length };
}

// ---- Quick add (bulk) ----
const quickRowSchema = z.object({
  title: z.string().trim().min(2, "عنوان حداقل ۲ نویسه باشد."),
  categoryId: z.string().uuid("دسته‌بندی را انتخاب کنید."),
  basePriceToman: z.coerce.number().int("قیمت نامعتبر است.").min(1, "قیمت پایه را وارد کنید."),
  basePriceUnit: z.enum(["GRAM", "KILOGRAM", "UNIT"]),
  weightPresetIds: z.array(z.string().uuid()).default([]),
  packagingOptionIds: z.array(z.string().uuid()).default([]),
  stock: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export async function quickAddProducts(rows: unknown): Promise<QuickAddResult[]> {
  await requireAdmin();
  const parsed = z.array(quickRowSchema).safeParse(rows);
  if (!parsed.success) {
    return [{ index: 0, ok: false, title: "—", error: parsed.error.issues[0]?.message ?? "داده نامعتبر است." }];
  }

  const results = await processQuickAddRows(parsed.data);
  revalidatePath(LIST);
  return results;
}

// ---- Product images ----

export async function addProductImageAction(
  productId: string,
  url: string,
  alt?: string,
): Promise<ActionResult> {
  await requireAdmin();
  if (!productId || !url) return { ok: false, error: "داده ناقص است." };
  const maxOrder = await prisma.productImage.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });
  await prisma.productImage.create({
    data: { productId, url, alt: alt ?? null, sortOrder: (maxOrder._max.sortOrder ?? -1) + 1 },
  });
  revalidatePath(`${LIST}/${productId}`);
  return { ok: true, id: productId };
}

export async function removeProductImageAction(
  imageId: string,
  productId: string,
): Promise<ActionResult> {
  await requireAdmin();
  if (!imageId || !productId) return { ok: false, error: "داده ناقص است." };
  await prisma.productImage.delete({ where: { id: imageId } });
  revalidatePath(`${LIST}/${productId}`);
  return { ok: true, id: productId };
}
