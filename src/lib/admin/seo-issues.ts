// ============================================================
// SEO Issue Queue (PHASE-2). Server-only. Enumerates INDIVIDUAL entities that
// have fixable SEO problems and deep-links each to its admin edit page. Built
// from real data only — no fabricated issues. Mirrors the thresholds used by
// lib/admin/seo-overview.ts so the queue and the overview stay consistent.
// ============================================================

import { prisma } from "@/lib/prisma";

const MIN_DESC = 50; // product description shorter than this is "too short"

export type SeoIssueRow = {
  entityType: "PRODUCT" | "POST";
  id: string;
  title: string;
  /** admin edit page for this entity */
  editHref: string;
  /** public URL when published (optional) */
  viewHref?: string;
  /** human-readable issue labels (Persian) */
  issues: string[];
};

export type SeoIssues = {
  rows: SeoIssueRow[];
  total: number;
  truncated: boolean;
};

/** Collect entities with SEO issues, capped to `limit` rows. */
export async function getSeoIssues(limit = 60): Promise<SeoIssues> {
  const [products, posts] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        images: { take: 1, select: { id: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { id: true, title: true, slug: true, coverImage: true, briefText: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const rows: SeoIssueRow[] = [];

  for (const p of products) {
    const issues: string[] = [];
    if (p.images.length === 0) issues.push("بدون تصویر");
    if ((p.description ?? "").trim().length < MIN_DESC) issues.push("توضیح کوتاه (سئو)");
    if (issues.length > 0) {
      rows.push({
        entityType: "PRODUCT",
        id: p.id,
        title: p.title,
        editHref: `/admin/collections/products/${p.id}`,
        viewHref: p.slug ? `/products/${p.slug}` : undefined,
        issues,
      });
    }
  }

  for (const post of posts) {
    const issues: string[] = [];
    if (!(post.coverImage ?? "").trim()) issues.push("بدون تصویر شاخص");
    if (!(post.briefText ?? "").trim()) issues.push("بدون خلاصه/لید");
    if (issues.length > 0) {
      rows.push({
        entityType: "POST",
        id: post.id,
        title: post.title,
        editHref: `/admin/content/articles/${post.id}`,
        viewHref: post.slug ? `/blog/${post.slug}` : undefined,
        issues,
      });
    }
  }

  const total = rows.length;
  return { rows: rows.slice(0, limit), total, truncated: total > limit };
}
