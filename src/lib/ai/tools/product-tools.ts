/**
 * Read-only product tools. Each calls Prisma directly and returns compact,
 * factual data (Toman prices, stock, ratings). No mutations, no secrets.
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ToolDefinition } from "@/lib/ai/tool-registry";
import { productToCard, PRODUCT_CARD_INCLUDE } from "@/lib/ai/tools/helpers";

const LIMIT_MAX = 8;

function clampLimit(n: number | null, fallback = 5): number {
  if (n == null || !Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(LIMIT_MAX, Math.trunc(n)));
}

const searchProducts: ToolDefinition = {
  name: "search_products",
  category: "PRODUCT",
  description: "جستجوی محصولات دشت‌زاد بر اساس کلمه‌ی کلیدی و دسته. فقط محصولات فعال را برمی‌گرداند.",
  parameters: z.object({
    query: z.string().describe("کلمه‌ی کلیدی جستجو، مثل «زعفران» یا «آجیل»"),
    category: z.string().nullable().describe("اسلاگ دسته (اختیاری)"),
    limit: z.number().nullable().describe("حداکثر تعداد نتایج (۱ تا ۸)"),
  }),
  readOnly: true,
  handler: async (args) => {
    const { query, category, limit } = args as { query: string; category: string | null; limit: number | null };
    const q = (query ?? "").trim();
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { tags: { has: q } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(category ? { category: { slug: category } } : {}),
      },
      include: PRODUCT_CARD_INCLUDE,
      take: clampLimit(limit),
      orderBy: [{ numReviews: "desc" }, { createdAt: "desc" }],
    });
    return { count: products.length, products: products.map((p) => productToCard(p)) };
  },
};

const getProductBySlug: ToolDefinition = {
  name: "get_product_by_slug",
  category: "PRODUCT",
  description: "دریافت جزئیات یک محصول با اسلاگ آن.",
  parameters: z.object({ slug: z.string().describe("اسلاگ محصول") }),
  readOnly: true,
  handler: async (args) => {
    const { slug } = args as { slug: string };
    const p = await prisma.product.findUnique({ where: { slug }, include: PRODUCT_CARD_INCLUDE });
    if (!p || !p.isActive) return { found: false };
    return { found: true, product: { ...productToCard(p), description: p.description?.slice(0, 600) ?? null } };
  },
};

const getProductPrice: ToolDefinition = {
  name: "get_product_price",
  category: "PRODUCT",
  description: "دریافت قیمت فعلی یک محصول (به تومان) با اسلاگ.",
  parameters: z.object({ slug: z.string() }),
  readOnly: true,
  handler: async (args) => {
    const { slug } = args as { slug: string };
    const p = await prisma.product.findUnique({ where: { slug }, include: PRODUCT_CARD_INCLUDE });
    if (!p || !p.isActive) return { found: false };
    const c = productToCard(p);
    return {
      found: true,
      title: c.title,
      priceToman: c.priceToman,
      priceLabel: c.priceLabel,
      offPriceToman: c.offPriceToman,
      offPriceLabel: c.offPriceLabel,
      discountPercent: c.discountPercent,
      saleMode: c.saleMode,
    };
  },
};

const getProductStock: ToolDefinition = {
  name: "get_product_stock",
  category: "PRODUCT",
  description: "بررسی موجودی یک محصول با اسلاگ.",
  parameters: z.object({ slug: z.string() }),
  readOnly: true,
  handler: async (args) => {
    const { slug } = args as { slug: string };
    const p = await prisma.product.findUnique({ where: { slug }, include: PRODUCT_CARD_INCLUDE });
    if (!p || !p.isActive) return { found: false };
    const c = productToCard(p);
    return { found: true, title: c.title, inStock: c.inStock, saleMode: c.saleMode };
  },
};

const getRelatedProducts: ToolDefinition = {
  name: "get_related_products",
  category: "PRODUCT",
  description: "محصولات مرتبط (هم‌دسته) با یک محصول.",
  parameters: z.object({ slug: z.string(), limit: z.number().nullable() }),
  readOnly: true,
  handler: async (args) => {
    const { slug, limit } = args as { slug: string; limit: number | null };
    const p = await prisma.product.findUnique({ where: { slug }, select: { id: true, categoryId: true } });
    if (!p) return { found: false, products: [] };
    const related = await prisma.product.findMany({
      where: { categoryId: p.categoryId, isActive: true, id: { not: p.id } },
      include: PRODUCT_CARD_INCLUDE,
      take: clampLimit(limit, 4),
      orderBy: { numReviews: "desc" },
    });
    return { found: true, products: related.map((r) => productToCard(r)) };
  },
};

const getProductReviewsSummary: ToolDefinition = {
  name: "get_product_reviews_summary",
  category: "PRODUCT",
  description: "خلاصه‌ی نظرات و امتیاز یک محصول.",
  parameters: z.object({ slug: z.string() }),
  readOnly: true,
  handler: async (args) => {
    const { slug } = args as { slug: string };
    const p = await prisma.product.findUnique({
      where: { slug },
      select: { title: true, rating: true, numReviews: true },
    });
    if (!p) return { found: false };
    const histogram = await prisma.productReview.groupBy({
      by: ["rating"],
      where: { product: { slug }, status: "APPROVED" },
      _count: true,
    });
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of histogram) dist[row.rating] = row._count;
    return {
      found: true,
      title: p.title,
      rating: p.numReviews > 0 ? Number(p.rating.toFixed(1)) : null,
      numReviews: p.numReviews,
      distribution: dist,
    };
  },
};

const compareProducts: ToolDefinition = {
  name: "compare_products",
  category: "PRODUCT",
  description: "مقایسه‌ی چند محصول بر اساس قیمت، موجودی و امتیاز.",
  parameters: z.object({ slugs: z.array(z.string()).describe("فهرست اسلاگ محصولات (۲ تا ۴)") }),
  readOnly: true,
  handler: async (args) => {
    const { slugs } = args as { slugs: string[] };
    const list = (slugs ?? []).slice(0, 4);
    const products = await prisma.product.findMany({
      where: { slug: { in: list }, isActive: true },
      include: PRODUCT_CARD_INCLUDE,
    });
    return { products: products.map((p) => productToCard(p)) };
  },
};

const suggestProductPack: ToolDefinition = {
  name: "suggest_product_pack",
  category: "PRODUCT",
  description:
    "پیشنهاد یک بسته‌ی چند محصولی (مثلاً برای هدیه یا پذیرایی). انتخاب بر اساس محبوبیت و موجودی است (heuristic).",
  parameters: z.object({
    category: z.string().nullable().describe("اسلاگ دسته‌ی موردنظر (اختیاری)"),
    budgetToman: z.number().nullable().describe("سقف بودجه به تومان (اختیاری)"),
    size: z.number().nullable().describe("تعداد اقلام بسته (پیش‌فرض ۳)"),
  }),
  readOnly: true,
  handler: async (args) => {
    const { category, budgetToman, size } = args as {
      category: string | null;
      budgetToman: number | null;
      size: number | null;
    };
    const take = clampLimit(size, 3);
    const candidates = await prisma.product.findMany({
      where: {
        isActive: true,
        countInStock: { gt: 0 },
        ...(category ? { category: { slug: category } } : {}),
      },
      include: PRODUCT_CARD_INCLUDE,
      take: 20,
      orderBy: [{ numReviews: "desc" }, { rating: "desc" }],
    });
    const budgetRial = budgetToman != null ? budgetToman * 10 : null;
    const picks = candidates
      .map((p) => productToCard(p))
      .filter((c) => c.inStock && (budgetRial == null || (c.offPriceToman ?? c.priceToman ?? 0) * 10 <= budgetRial))
      .slice(0, take);
    return {
      note: "پیشنهاد heuristic بر اساس محبوبیت/موجودی؛ بهینه‌سازی معنایی در مرحله‌ی بعد (retrieval).",
      products: picks,
    };
  },
};

export const PRODUCT_TOOLS: ToolDefinition[] = [
  searchProducts,
  getProductBySlug,
  getProductPrice,
  getProductStock,
  getRelatedProducts,
  getProductReviewsSummary,
  compareProducts,
  suggestProductPack,
];
