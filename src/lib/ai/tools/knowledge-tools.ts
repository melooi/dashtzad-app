/**
 * Read-only knowledge tools: FAQ, policies, blog posts, recipes, product guides.
 *
 * CP-B uses keyword search over existing content (functional, not fake). CP-C
 * (retrieval) upgrades these to semantic search via embeddings without changing
 * the tool contract — each result already carries source type, title, url.
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTermsContent } from "@/lib/admin/global-service";
import type { ToolDefinition } from "@/lib/ai/tool-registry";

function clamp(n: number | null, fallback = 4, max = 8): number {
  if (n == null || !Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(max, Math.trunc(n)));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const searchFaq: ToolDefinition = {
  name: "search_faq",
  category: "KNOWLEDGE",
  description: "جستجوی پرسش‌های متداول دشت‌زاد.",
  parameters: z.object({ query: z.string(), limit: z.number().nullable() }),
  readOnly: true,
  handler: async (args) => {
    const { query, limit } = args as { query: string; limit: number | null };
    const q = (query ?? "").trim();
    const items = await prisma.fAQItem.findMany({
      where: {
        isActive: true,
        group: { isActive: true },
        ...(q
          ? { OR: [{ question: { contains: q, mode: "insensitive" } }, { answer: { contains: q, mode: "insensitive" } }] }
          : {}),
      },
      select: { question: true, answer: true, group: { select: { title: true } } },
      take: clamp(limit),
      orderBy: [{ sortOrder: "asc" }],
    });
    return {
      sourceType: "FAQ",
      count: items.length,
      results: items.map((i) => ({ title: i.question, answer: i.answer, group: i.group.title })),
    };
  },
};

const POLICY_SECTIONS: Record<string, keyof Awaited<ReturnType<typeof getTermsContent>>> = {
  بازگشت: "return",
  مرجوع: "return",
  ارسال: "ship",
  پرداخت: "pay",
  حریم: "privacy",
  privacy: "privacy",
  shipping: "ship",
  return: "return",
  payment: "pay",
};

const searchPolicies: ToolDefinition = {
  name: "search_policies",
  category: "KNOWLEDGE",
  description: "جستجوی قوانین و سیاست‌ها (بازگشت کالا، ارسال، پرداخت، حریم خصوصی، قوانین کلی).",
  parameters: z.object({ query: z.string() }),
  readOnly: true,
  handler: async (args) => {
    const { query } = args as { query: string };
    const terms = await getTermsContent();
    const q = (query ?? "").trim().toLowerCase();
    // Pick a focused section if the query hints at one, else scan all.
    const sectionKey = Object.entries(POLICY_SECTIONS).find(([k]) => q.includes(k.toLowerCase()))?.[1];
    const sections: Array<{ key: string; html: unknown }> = sectionKey
      ? [{ key: sectionKey, html: terms[sectionKey] }]
      : (["general", "buy", "pay", "ship", "return", "privacy"] as const).map((k) => ({ key: k, html: terms[k] }));
    const results = sections
      .map((s) => ({ section: s.key, text: stripHtml(String(s.html ?? "")).slice(0, 700) }))
      .filter((s) => s.text.length > 0 && (!q || s.text.toLowerCase().includes(q) || sectionKey));
    return { sourceType: "POLICY", count: results.length, results };
  },
};

const searchBlogPosts: ToolDefinition = {
  name: "search_blog_posts",
  category: "KNOWLEDGE",
  description: "جستجوی مقالات و مطالب مجله‌ی دشت‌زاد.",
  parameters: z.object({ query: z.string(), limit: z.number().nullable() }),
  readOnly: true,
  handler: async (args) => {
    const { query, limit } = args as { query: string; limit: number | null };
    const q = (query ?? "").trim();
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        articleType: { not: "RECIPE" },
        ...(q
          ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { briefText: { contains: q, mode: "insensitive" } }, { tags: { has: q } }] }
          : {}),
      },
      select: { title: true, slug: true, briefText: true },
      take: clamp(limit),
      orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
    });
    return {
      sourceType: "POST",
      count: posts.length,
      results: posts.map((p) => ({ title: p.title, url: `/blog/${p.slug}`, summary: p.briefText?.slice(0, 240) ?? "" })),
    };
  },
};

const searchRecipes: ToolDefinition = {
  name: "search_recipes",
  category: "KNOWLEDGE",
  description: "جستجوی دستورهای پخت دشت‌زاد.",
  parameters: z.object({ query: z.string(), limit: z.number().nullable() }),
  readOnly: true,
  handler: async (args) => {
    const { query, limit } = args as { query: string; limit: number | null };
    const q = (query ?? "").trim();
    const recipes = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        articleType: "RECIPE",
        ...(q
          ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { briefText: { contains: q, mode: "insensitive" } }, { tags: { has: q } }] }
          : {}),
      },
      select: { title: true, slug: true, briefText: true, readingTime: true },
      take: clamp(limit),
      orderBy: [{ viewCount: "desc" }],
    });
    return {
      sourceType: "RECIPE",
      count: recipes.length,
      results: recipes.map((r) => ({ title: r.title, url: `/blog/${r.slug}`, summary: r.briefText?.slice(0, 240) ?? "" })),
    };
  },
};

const searchProductGuides: ToolDefinition = {
  name: "search_product_guides",
  category: "KNOWLEDGE",
  description: "جستجوی راهنماهای محصول (داستان و توضیحات محصولات).",
  parameters: z.object({ query: z.string(), limit: z.number().nullable() }),
  readOnly: true,
  handler: async (args) => {
    const { query, limit } = args as { query: string; limit: number | null };
    const q = (query ?? "").trim();
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        AND: [
          q
            ? {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { story: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
          { OR: [{ story: { not: null } }, { description: { not: "" } }] },
        ],
      },
      select: { title: true, slug: true, story: true, description: true },
      take: clamp(limit),
    });
    return {
      sourceType: "GUIDE",
      count: products.length,
      results: products.map((p) => ({
        title: p.title,
        url: `/products/${p.slug}`,
        guide: stripHtml(p.story || p.description || "").slice(0, 400),
      })),
    };
  },
};

export const KNOWLEDGE_TOOLS: ToolDefinition[] = [
  searchFaq,
  searchPolicies,
  searchBlogPosts,
  searchRecipes,
  searchProductGuides,
];
