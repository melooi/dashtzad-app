import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSeoDefaults } from "@/lib/admin/global-service";
import { buildAbsoluteUrl } from "@/lib/seo/urls";

export const dynamic = "force-dynamic";

// Advanced sitemap (SEO-CP1): static pages + active products (with image
// sitemap) + active product categories + published posts. Excludes admin/auth/
// cart/checkout/account/api and all inactive/draft content.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await getSeoDefaults().catch(() => null);
  const base = seo?.canonicalBase || undefined;
  const abs = (path: string) => buildAbsoluteUrl(path, base);

  const [products, posts, categories, postCategories, series] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      select: {
        slug: true,
        updatedAt: true,
        images: { orderBy: { sortOrder: "asc" }, take: 5, select: { url: true } },
      },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { type: "PRODUCT", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { type: "POST", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.contentSeries.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: abs("/"), changeFrequency: "daily", priority: 1.0 },
    { url: abs("/products"), changeFrequency: "daily", priority: 0.9 },
    { url: abs("/blog"), changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/blog/case-files"), changeFrequency: "weekly", priority: 0.6 },
    { url: abs("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: abs("/contact"), changeFrequency: "monthly", priority: 0.5 },
    { url: abs("/terms"), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Category views are served by /products?cat=<slug> (Latin slug).
  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: abs(`/products?cat=${c.slug}`),
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: abs(`/products/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
    images: p.images.length ? p.images.map((i) => buildAbsoluteUrl(i.url, base)) : undefined,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: abs(`/blog/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Magazine category pages (/blog/category/<slug>) — Latin slug.
  const blogCategoryPages: MetadataRoute.Sitemap = postCategories.map((c) => ({
    url: abs(`/blog/category/${c.slug}`),
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  // Case-file (series) hubs.
  const seriesPages: MetadataRoute.Sitemap = series.map((s) => ({
    url: abs(`/blog/case-files/${s.slug}`),
    lastModified: s.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...postPages, ...blogCategoryPages, ...seriesPages];
}
