// ============================================================
// SEO health overview (SEO-CP2). Real, internal technical signals only —
// NOT Google Search Console / Merchant data. Server-only.
// ============================================================

import { prisma } from "@/lib/prisma";
import { getSeoDefaults } from "@/lib/admin/global-service";

const MIN_DESC = 50; // chars below which a product description is "too short"

export type SeoOverview = Awaited<ReturnType<typeof getSeoOverview>>;

export async function getSeoOverview() {
  const [
    activeProducts,
    variantsActive,
    postsPublished,
    categoriesProduct,
    faqGroupsActive,
    faqItemsActive,
    redirectsActive,
    seoMetaRows,
    seoDefaults,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, description: true, images: { take: 1, select: { id: true } } },
    }),
    prisma.productVariant.count({ where: { isActive: true } }),
    prisma.post.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.category.count({ where: { type: "PRODUCT", deletedAt: null } }),
    prisma.fAQGroup.count({ where: { isActive: true, deletedAt: null } }),
    prisma.fAQItem.count({ where: { isActive: true, deletedAt: null } }),
    prisma.redirect.count({ where: { isActive: true } }),
    prisma.seoMeta.findMany({ select: { entityType: true, entityId: true } }),
    getSeoDefaults(),
  ]);

  const productsActive = activeProducts.length;
  const productsNoImage = activeProducts.filter((p) => p.images.length === 0).length;
  const productsNoDescription = activeProducts.filter(
    (p) => (p.description ?? "").trim().length < MIN_DESC,
  ).length;

  const productOverrideIds = new Set(
    seoMetaRows.filter((r) => r.entityType === "PRODUCT").map((r) => r.entityId),
  );
  const productsWithOverride = activeProducts.filter((p) => productOverrideIds.has(p.id)).length;
  const productsNoOverride = productsActive - productsWithOverride;

  const overridesByType = {
    PRODUCT: productOverrideIds.size,
    CATEGORY: seoMetaRows.filter((r) => r.entityType === "CATEGORY").length,
    POST: seoMetaRows.filter((r) => r.entityType === "POST").length,
    FAQ_GROUP: seoMetaRows.filter((r) => r.entityType === "FAQ_GROUP").length,
    HOMEPAGE: seoMetaRows.filter((r) => r.entityType === "HOMEPAGE").length,
  };

  // Sitemap composition (mirror of app/sitemap.ts).
  const STATIC_PAGES = 6; // /, /products, /blog, /about, /contact, /terms
  const sitemapTotal = STATIC_PAGES + productsActive + categoriesProduct + postsPublished;

  const canonicalBase = (seoDefaults.canonicalBase || "").trim();
  const warnings = {
    canonicalMissing: !canonicalBase,
    canonicalNotHttps: !!canonicalBase && !/^https:\/\//i.test(canonicalBase),
    descriptionShort: (seoDefaults.defaultDescription ?? "").length < 70,
    ogImageMissing: !(seoDefaults.defaultOgImageUrl || "").trim(),
    noProductDescription: productsNoDescription > 0,
    noProductImage: productsNoImage > 0,
  };

  return {
    productsActive,
    productsNoImage,
    productsNoDescription,
    productsNoOverride,
    productsWithOverride,
    variantsActive,
    postsPublished,
    categoriesProduct,
    faqGroupsActive,
    faqItemsActive,
    redirectsActive,
    overridesByType,
    sitemap: {
      total: sitemapTotal,
      staticPages: STATIC_PAGES,
      products: productsActive,
      categories: categoriesProduct,
      posts: postsPublished,
      hasImages: productsActive - productsNoImage > 0,
    },
    seoDefaults,
    canonicalBase,
    warnings,
  };
}
