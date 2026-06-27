import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { productsCollection } from "@/lib/admin/collections";
import { rialToToman } from "@/lib/price";
import type { ProductFormInput } from "@/lib/admin/products";
import { getSeoMetaForForm } from "@/lib/admin/seo-service";
import { getSeoDefaults } from "@/lib/admin/global-service";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { HesabfaProductButton } from "@/components/admin/hesabfa/HesabfaProductButton";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true, alt: true } },
    },
  });
  if (!product) notFound();

  const [categories, weightPresets, packagingOptions, seoMeta, seoDefaults] = await Promise.all([
    prisma.category.findMany({ where: { type: "PRODUCT", deletedAt: null }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    prisma.weightPreset.findMany({ where: { isActive: true }, select: { id: true, title: true, gramValue: true, compatibility: true }, orderBy: { sortOrder: "asc" } }),
    prisma.packagingOption.findMany({ where: { isActive: true }, select: { id: true, title: true, type: true, cost_rial: true, compatibility: true }, orderBy: { sortOrder: "asc" } }),
    getSeoMetaForForm("PRODUCT", id),
    getSeoDefaults(),
  ]);

  const basePriceRial = product.basePrice_rial ?? product.price_rial;

  const defaultValues: ProductFormInput = {
    title: product.title,
    slug: product.slug,
    categoryId: product.categoryId,
    brand: product.brand ?? "",
    isActive: product.isActive,
    tags: product.tags.join("، "),
    basePriceToman: String(rialToToman(basePriceRial)),
    basePriceUnit: product.basePriceUnit,
    description: product.description ?? "",
    story: product.story ?? "",
    // PRODUCT-CARD-CP1
    saleMode: product.saleMode,
    contactPhone: product.contactPhone ?? "",
    installmentEnabled: product.installmentEnabled,
  };

  return (
    <div>
      <AdminPageHeader
        title={product.title}
        description="ویرایش محصول و مدل‌های فروش"
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: productsCollection.label, href: productsCollection.route },
          { label: product.title },
        ]}
        actions={<HesabfaProductButton productId={product.id} initialCode={product.hesabfaCode} />}
      />
      <ProductForm
        mode="edit"
        productId={product.id}
        defaultValues={defaultValues}
        categories={categories}
        initialImages={product.images}
        seo={{
          meta: seoMeta,
          autoImage: null,
          defaults: {
            titleTemplate: seoDefaults.titleTemplate,
            canonicalBase: seoDefaults.canonicalBase,
            defaultOgImageUrl: seoDefaults.defaultOgImageUrl,
          },
        }}
        variantData={{
          categoryId: product.categoryId,
          basePriceRial,
          basePriceUnit: product.basePriceUnit,
          weightPresets,
          packagingOptions,
          existingVariants: product.variants.map((v) => ({
            id: v.id,
            weightPresetId: v.weightPresetId,
            packagingOptionId: v.packagingOptionId,
            sku: v.sku,
            stock: v.stock,
            isActive: v.isActive,
            isPriceLocked: v.isPriceLocked,
            price_rial: v.price_rial,
            offPrice_rial: v.offPrice_rial,
            marketingBadge: v.marketingBadge,
            sortOrder: v.sortOrder,
          })),
        }}
      />
    </div>
  );
}
