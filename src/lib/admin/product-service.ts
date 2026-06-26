import { prisma } from "@/lib/prisma";
import { slugifyLatinOnly, ensureUniqueSlug } from "@/lib/admin/slug";
import {
  calculateVariantPrice,
  convertTomanToRial,
  type BaseUnit,
} from "@/lib/admin/product-pricing";
import {
  generateVariantSku,
  ensureUniqueSku,
  type PackagingTypeKey,
} from "@/lib/admin/product-variant";
import type { VariantRowInput } from "@/lib/admin/products";

// Pure product business logic (no auth/revalidation) so it can be reused by the
// server actions and the quick-add bulk save.

/** Slug uniqueness for products (excludes self on edit). */
export async function assertProductSlugUnique(
  slug: string,
  excludeId?: string,
): Promise<string | null> {
  const owner = await prisma.product.findUnique({ where: { slug } });
  if (owner && owner.id !== excludeId) {
    return "این نامک قبلاً برای محصول دیگری استفاده شده است.";
  }
  return null;
}

/**
 * Reason a product cannot be deleted, or null. Checks BOTH the product's own
 * cart/order usage AND any of its variants' usage (productVariantId).
 */
export async function productDeleteBlockReason(id: string): Promise<string | null> {
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!product) return "محصول یافت نشد.";

  const [orderItems, cartItems, variantOrderItems, variantCartItems] = await Promise.all([
    prisma.orderItem.count({ where: { productId: id } }),
    prisma.cartItem.count({ where: { productId: id } }),
    prisma.orderItem.count({ where: { variant: { productId: id } } }),
    prisma.cartItem.count({ where: { variant: { productId: id } } }),
  ]);

  if (orderItems > 0 || variantOrderItems > 0) {
    return "این محصول یا یکی از مدل‌های فروش آن در سفارش‌ها استفاده شده و قابل حذف نیست.";
  }
  if (cartItems > 0 || variantCartItems > 0) {
    return "این محصول یا یکی از مدل‌های فروش آن در سبد خرید کاربران است و فعلاً قابل حذف نیست.";
  }
  return null;
}

/** Reason a single variant cannot be deleted (cart/order dependency), or null. */
export async function variantDeleteBlockReason(id: string): Promise<string | null> {
  const variant = await prisma.productVariant.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true, cartItems: true } } },
  });
  if (!variant) return null;
  if (variant._count.orderItems > 0 || variant._count.cartItems > 0) {
    return "این مدل در سفارش/سبد استفاده شده است.";
  }
  return null;
}

export async function nextAvailableProductSlug(slug: string): Promise<string> {
  return ensureUniqueSlug(`${slug}-copy`, async (candidate) => {
    const clash = await prisma.product.findUnique({ where: { slug: candidate } });
    return clash !== null;
  });
}

type WeightRow = { id: string; gramValue: number };
type PackagingRow = { id: string; type: PackagingTypeKey; cost_rial: number };

/**
 * Reconcile a product's variants against the rows submitted from the matrix.
 * Prices are recomputed server-side from preset gram + packaging cost (never
 * trusts client prices). Returns blocked deletions (cart/order dependency).
 */
export async function reconcileProductVariants(
  productId: string,
  rows: VariantRowInput[],
): Promise<{ saved: number; blocked: string[] }> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { saved: 0, blocked: [] };

  const basePriceRial = product.basePrice_rial ?? product.price_rial;
  const basePriceUnit = product.basePriceUnit as BaseUnit;

  const [weights, packagings, existing] = await Promise.all([
    prisma.weightPreset.findMany({ select: { id: true, gramValue: true } }),
    prisma.packagingOption.findMany({ select: { id: true, type: true, cost_rial: true } }),
    prisma.productVariant.findMany({ where: { productId }, select: { id: true } }),
  ]);
  const weightById = new Map<string, WeightRow>(weights.map((w) => [w.id, w]));
  const pkgById = new Map<string, PackagingRow>(packagings.map((p) => [p.id, p as PackagingRow]));

  const keptIds = new Set<string>();
  let saved = 0;

  for (const row of rows) {
    const weight = weightById.get(row.weightPresetId);
    if (!weight) continue;
    const pkg = row.packagingOptionId ? pkgById.get(row.packagingOptionId) : null;
    const gramValue = weight.gramValue;

    const calculated = calculateVariantPrice({
      basePriceRial,
      basePriceUnit,
      gramValue,
      packagingCostRial: pkg?.cost_rial ?? 0,
    });
    const priceRial =
      row.isPriceLocked && row.manualPriceToman != null
        ? convertTomanToRial(row.manualPriceToman)
        : calculated;
    const offRial =
      row.offPriceToman != null && row.offPriceToman > 0
        ? convertTomanToRial(row.offPriceToman)
        : null;

    const data = {
      weightPresetId: row.weightPresetId,
      packagingOptionId: row.packagingOptionId ?? null,
      weightValue: gramValue,
      weightUnit: "GRAM" as const,
      gramValue,
      calculatedPrice_rial: calculated,
      price_rial: priceRial,
      offPrice_rial: offRial,
      stock: row.stock,
      isActive: row.isActive,
      isPriceLocked: row.isPriceLocked,
      marketingBadge: row.marketingBadge ?? null,
      sortOrder: row.sortOrder,
    };

    if (row.id) {
      await prisma.productVariant.update({ where: { id: row.id }, data });
      keptIds.add(row.id);
    } else {
      const baseSku = generateVariantSku(product.slug, gramValue, pkg?.type ?? null);
      const sku = await ensureUniqueSku(baseSku, async (s) => {
        const clash = await prisma.productVariant.findUnique({ where: { sku: s } });
        return clash !== null;
      });
      const created = await prisma.productVariant.create({ data: { ...data, productId, sku } });
      keptIds.add(created.id);
    }
    saved += 1;
  }

  // Delete variants the admin removed — unless they have cart/order dependency.
  const blocked: string[] = [];
  for (const v of existing) {
    if (keptIds.has(v.id)) continue;
    const reason = await variantDeleteBlockReason(v.id);
    if (reason) {
      blocked.push(v.id);
      continue;
    }
    await prisma.productVariant.delete({ where: { id: v.id } });
  }

  return { saved, blocked };
}

// ============================================================
// Recalculation (PRICING-INLINE-CP1) — reuses the pricing engine.
// calculatedPrice_rial is ALWAYS refreshed (engine output); price_rial is
// only refreshed for UNLOCKED variants (locked = admin's manual price stays).
// ============================================================

/**
 * Recompute every variant of a product from the product's current base price +
 * each variant's gram weight + its packaging cost. Locked variants keep their
 * manual price_rial; their calculatedPrice_rial is still refreshed so the UI can
 * show the engine relationship. Returns the new min/max effective price range.
 */
export async function recalcProductVariants(
  productId: string,
): Promise<{ updated: number; minRial: number | null; maxRial: number | null }> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: { include: { packaging: { select: { cost_rial: true } } } } },
  });
  if (!product) return { updated: 0, minRial: null, maxRial: null };

  const basePriceRial = product.basePrice_rial ?? product.price_rial;
  const basePriceUnit = product.basePriceUnit as BaseUnit;

  const effective: number[] = [];
  let updated = 0;
  for (const v of product.variants) {
    const calculated = calculateVariantPrice({
      basePriceRial,
      basePriceUnit,
      gramValue: v.gramValue,
      packagingCostRial: v.packaging?.cost_rial ?? 0,
    });
    const data: { calculatedPrice_rial: number; price_rial?: number } = {
      calculatedPrice_rial: calculated,
    };
    if (!v.isPriceLocked) data.price_rial = calculated;
    await prisma.productVariant.update({ where: { id: v.id }, data });
    effective.push(v.isPriceLocked ? v.price_rial : calculated);
    updated += 1;
  }

  return {
    updated,
    minRial: effective.length ? Math.min(...effective) : null,
    maxRial: effective.length ? Math.max(...effective) : null,
  };
}

/**
 * Recompute all products that use a given packaging option (after its cost
 * changes). Locked variants are untouched; unlocked ones follow the engine.
 */
export async function recalcVariantsUsingPackaging(packagingId: string): Promise<number> {
  const affected = await prisma.productVariant.findMany({
    where: { packagingOptionId: packagingId },
    select: { productId: true },
  });
  const productIds = [...new Set(affected.map((v) => v.productId))];
  for (const id of productIds) await recalcProductVariants(id);
  return productIds.length;
}

// ============================================================
// Quick add (bulk) — testable core (no auth/revalidation).
// Each row is atomic: Product + ALL variants, or nothing.
// ============================================================

export type QuickAddRow = {
  title: string;
  categoryId: string;
  basePriceToman: number;
  basePriceUnit: string;
  weightPresetIds: string[];
  packagingOptionIds: string[];
  stock: number;
  isActive: boolean;
};

export type QuickAddResult = {
  index: number;
  ok: boolean;
  id?: string;
  title: string;
  slug?: string;
  variants?: number;
  error?: string;
};

export async function processQuickAddRows(rows: QuickAddRow[]): Promise<QuickAddResult[]> {
  const [weights, packagings] = await Promise.all([
    prisma.weightPreset.findMany({ where: { isActive: true }, select: { id: true, gramValue: true } }),
    prisma.packagingOption.findMany({ where: { isActive: true }, select: { id: true, type: true, cost_rial: true } }),
  ]);
  const weightById = new Map(weights.map((w) => [w.id, w]));
  const pkgById = new Map(packagings.map((p) => [p.id, p]));

  const results: QuickAddResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Quick-add must produce sellable variants → at least one weight is required.
    if (row.weightPresetIds.length === 0) {
      results.push({ index: i, ok: false, title: row.title, error: "برای افزودن سریع، حداقل یک وزن انتخاب کنید." });
      continue;
    }
    // Reject (never silently skip) invalid/inactive weight or packaging IDs.
    if (row.weightPresetIds.some((id) => !weightById.has(id))) {
      results.push({ index: i, ok: false, title: row.title, error: "وزن انتخاب‌شده نامعتبر یا غیرفعال است." });
      continue;
    }
    if (row.packagingOptionIds.some((id) => !pkgById.has(id))) {
      results.push({ index: i, ok: false, title: row.title, error: "بسته‌بندی انتخاب‌شده نامعتبر یا غیرفعال است." });
      continue;
    }

    const basePriceRial = convertTomanToRial(row.basePriceToman);
    const unit = row.basePriceUnit as BaseUnit;
    const pkgChoices: (string | null)[] = row.packagingOptionIds.length ? row.packagingOptionIds : [null];

    try {
      const created = await prisma.$transaction(async (tx) => {
        const slug = await ensureUniqueSlug(slugifyLatinOnly(row.title), async (s) => {
          const clash = await tx.product.findUnique({ where: { slug: s } });
          return clash !== null;
        });
        const product = await tx.product.create({
          data: {
            title: row.title,
            slug,
            description: "",
            price_rial: basePriceRial,
            basePrice_rial: basePriceRial,
            basePriceUnit: row.basePriceUnit as BaseUnit,
            tags: [],
            isActive: row.isActive,
            categoryId: row.categoryId,
          },
        });

        let variantCount = 0;
        let sortOrder = 0;
        for (const wId of row.weightPresetIds) {
          const w = weightById.get(wId)!;
          for (const pId of pkgChoices) {
            const pkg = pId ? pkgById.get(pId)! : null;
            const calculated = calculateVariantPrice({
              basePriceRial,
              basePriceUnit: unit,
              gramValue: w.gramValue,
              packagingCostRial: pkg?.cost_rial ?? 0,
            });
            const baseSku = generateVariantSku(slug, w.gramValue, (pkg?.type as PackagingTypeKey | undefined) ?? null);
            const sku = await ensureUniqueSku(baseSku, async (s) => {
              const clash = await tx.productVariant.findUnique({ where: { sku: s } });
              return clash !== null;
            });
            await tx.productVariant.create({
              data: {
                productId: product.id,
                weightPresetId: wId,
                packagingOptionId: pId,
                weightValue: w.gramValue,
                weightUnit: "GRAM",
                gramValue: w.gramValue,
                sku,
                calculatedPrice_rial: calculated,
                price_rial: calculated,
                stock: row.stock,
                isActive: row.isActive,
                sortOrder: sortOrder++,
              },
            });
            variantCount += 1;
          }
        }
        return { id: product.id, slug, variantCount };
      });

      results.push({ index: i, ok: true, id: created.id, title: row.title, slug: created.slug, variants: created.variantCount });
    } catch {
      results.push({ index: i, ok: false, title: row.title, error: "ذخیره این ردیف ناموفق بود (هیچ داده‌ای ثبت نشد)." });
    }
  }

  return results;
}
