/**
 * Read-only DB scans for the admin analyst engine.
 * Each function queries one business domain and returns a plain data object.
 * Never reads OpenAI, never mutates data.
 */

import { prisma } from "@/lib/prisma";

export interface InventoryScan {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  productsNoImages: number;
  variantsTotal: number;
  variantsOutOfStock: number;
  productsNoActiveVariants: number;
}

export interface OrdersScan {
  allTime: { count: number; totalRevenue_rial: number };
  last30Days: {
    count: number;
    totalRevenue_rial: number;
    avgOrderValue_rial: number;
    pending: number;
    paid: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    refunded: number;
  };
}

export interface CustomersScan {
  totalCustomers: number;
  activeCustomers90Days: number;
  newCustomers30Days: number;
}

export interface ContentScan {
  articlesPublished: number;
  articlesDraft: number;
  faqGroups: number;
  faqItems: number;
  pendingRecipeSuggestions: number;
  pendingComments: number;
  pendingReviews: number;
}

export interface ChatScan {
  humanConversations: { total: number; open: number; pending: number; resolved: number };
  aiConversations: {
    total: number;
    active: number;
    awaitingHuman: number;
    resolved: number;
    closed: number;
  };
  handoffs: number;
  feedbackCount: number;
  avgFeedbackScore: number | null;
}

export interface PricingScan {
  productsZeroPrice: number;
  variantsZeroPrice: number;
  productsWithDiscount: number;
  avgProductPrice_toman: number;
  minVariantPrice_toman: number;
  maxVariantPrice_toman: number;
}

export interface ScanSnapshot {
  scannedAt: string;
  inventory: InventoryScan;
  orders: OrdersScan;
  customers: CustomersScan;
  content: ContentScan;
  chat: ChatScan;
  pricing: PricingScan;
}

async function scanInventory(): Promise<InventoryScan> {
  const [total, active, inactive, noImages, variantsTotal, variantsOutOfStock, productsNoActiveVariants] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: false } }),
      prisma.product.count({ where: { images: { none: {} } } }),
      prisma.productVariant.count(),
      prisma.productVariant.count({ where: { stock: 0, isActive: true } }),
      prisma.product.count({ where: { variants: { none: { isActive: true } } } }),
    ]);

  return {
    totalProducts: total,
    activeProducts: active,
    inactiveProducts: inactive,
    productsNoImages: noImages,
    variantsTotal,
    variantsOutOfStock,
    productsNoActiveVariants,
  };
}

async function scanOrders(): Promise<OrdersScan> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [allCount, allRevRaw, last30, last30StatusCounts] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total_rial: true } }),
    prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.groupBy({
      by: ["status"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { _all: true },
      _sum: { total_rial: true },
    }),
  ]);

  const byStatus: Record<string, { count: number; revenue: number }> = {};
  for (const row of last30StatusCounts) {
    byStatus[row.status] = {
      count: row._count._all,
      revenue: row._sum.total_rial ?? 0,
    };
  }

  const last30Revenue = Object.values(byStatus).reduce((s, r) => s + r.revenue, 0);

  return {
    allTime: {
      count: allCount,
      totalRevenue_rial: allRevRaw._sum.total_rial ?? 0,
    },
    last30Days: {
      count: last30,
      totalRevenue_rial: last30Revenue,
      avgOrderValue_rial: last30 > 0 ? Math.round(last30Revenue / last30) : 0,
      pending: byStatus["PENDING"]?.count ?? 0,
      paid: byStatus["PAID"]?.count ?? 0,
      processing: byStatus["PROCESSING"]?.count ?? 0,
      shipped: byStatus["SHIPPED"]?.count ?? 0,
      delivered: byStatus["DELIVERED"]?.count ?? 0,
      cancelled: byStatus["CANCELLED"]?.count ?? 0,
      refunded: byStatus["REFUNDED"]?.count ?? 0,
    },
  };
}

async function scanCustomers(): Promise<CustomersScan> {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [total, newCount, activeIds] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "USER", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.findMany({
      where: { createdAt: { gte: ninetyDaysAgo } },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ]);

  return {
    totalCustomers: total,
    activeCustomers90Days: activeIds.length,
    newCustomers30Days: newCount,
  };
}

async function scanContent(): Promise<ContentScan> {
  const [published, draft, faqGroups, faqItems, recipeSuggestions, pendingComments, pendingReviews] =
    await Promise.all([
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.post.count({ where: { status: "DRAFT" } }),
      prisma.fAQGroup.count({ where: { isActive: true } }),
      prisma.fAQItem.count({ where: { isActive: true } }),
      prisma.recipeSuggestion.count({ where: { status: "PENDING" } }),
      prisma.postComment.count({ where: { status: "PENDING" } }),
      prisma.productReview.count({ where: { status: "PENDING" } }),
    ]);

  return {
    articlesPublished: published,
    articlesDraft: draft,
    faqGroups,
    faqItems,
    pendingRecipeSuggestions: recipeSuggestions,
    pendingComments,
    pendingReviews,
  };
}

async function scanChat(): Promise<ChatScan> {
  const [
    humanTotal, humanOpen, humanPending, humanResolved,
    aiTotal, aiActive, aiAwaiting, aiResolved, aiClosed,
    handoffs,
    feedbackStats,
  ] = await Promise.all([
    prisma.conversation.count(),
    prisma.conversation.count({ where: { status: "OPEN" } }),
    prisma.conversation.count({ where: { status: "PENDING" } }),
    prisma.conversation.count({ where: { status: "RESOLVED" } }),
    prisma.aiConversation.count(),
    prisma.aiConversation.count({ where: { status: "ACTIVE" } }),
    prisma.aiConversation.count({ where: { status: "AWAITING_HUMAN" } }),
    prisma.aiConversation.count({ where: { status: "RESOLVED" } }),
    prisma.aiConversation.count({ where: { status: "CLOSED" } }),
    prisma.aiHandoff.count(),
    prisma.aiFeedback.count(),
  ]);

  return {
    humanConversations: { total: humanTotal, open: humanOpen, pending: humanPending, resolved: humanResolved },
    aiConversations: { total: aiTotal, active: aiActive, awaitingHuman: aiAwaiting, resolved: aiResolved, closed: aiClosed },
    handoffs,
    feedbackCount: feedbackStats,
    avgFeedbackScore: null,
  };
}

async function scanPricing(): Promise<PricingScan> {
  const [
    productsZero,
    variantsZero,
    withDiscount,
    avgProduct,
    variantAgg,
  ] = await Promise.all([
    prisma.product.count({ where: { price_rial: 0 } }),
    prisma.productVariant.count({ where: { price_rial: 0, isActive: true } }),
    prisma.product.count({ where: { discountPercent: { gt: 0 } } }),
    prisma.product.aggregate({ _avg: { price_rial: true }, where: { isActive: true } }),
    prisma.productVariant.aggregate({
      _min: { price_rial: true },
      _max: { price_rial: true },
      where: { isActive: true, price_rial: { gt: 0 } },
    }),
  ]);

  const toToman = (rial: number | null | undefined) =>
    rial ? Math.round(rial / 10) : 0;

  return {
    productsZeroPrice: productsZero,
    variantsZeroPrice: variantsZero,
    productsWithDiscount: withDiscount,
    avgProductPrice_toman: toToman(avgProduct._avg.price_rial),
    minVariantPrice_toman: toToman(variantAgg._min.price_rial),
    maxVariantPrice_toman: toToman(variantAgg._max.price_rial),
  };
}

/** Run all 6 scans concurrently and return a single snapshot. */
export async function runAllScans(): Promise<ScanSnapshot> {
  const [inventory, orders, customers, content, chat, pricing] = await Promise.all([
    scanInventory(),
    scanOrders(),
    scanCustomers(),
    scanContent(),
    scanChat(),
    scanPricing(),
  ]);

  return {
    scannedAt: new Date().toISOString(),
    inventory,
    orders,
    customers,
    content,
    chat,
    pricing,
  };
}
