// Customer order queries — ownership-enforced. Used by the account panel,
// the order detail page, and (with isAdmin) the admin customer 360.
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/enums";
import type { OrderDetail, OrderListItem, OrderTimelineStep, RepeatProductItem } from "./types";

const ACTIVE_STATUSES: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "SHIPPED"];

/** Orders considered "on the way" for dashboard counts. */
export const ON_THE_WAY: OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED"];

const orderListInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          isActive: true,
          price_rial: true,
          offPrice_rial: true,
          images: { orderBy: { sortOrder: "asc" as const }, take: 1, select: { url: true } },
        },
      },
    },
  },
  payment: { select: { status: true } },
} as const;

type OrderListRow = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  trackingCode: string | null;
  total_rial: number;
  createdAt: Date;
  items: {
    quantity: number;
    title: string;
    productId: string;
    product: {
      id: string;
      slug: string;
      isActive: boolean;
      price_rial: number;
      offPrice_rial: number | null;
      images: { url: string }[];
    } | null;
  }[];
  payment: { status: "PENDING" | "SUCCESS" | "FAILED" } | null;
};

function toListItem(o: OrderListRow): OrderListItem {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.payment?.status ?? null,
    createdAtISO: o.createdAt.toISOString(),
    totalRial: o.total_rial,
    itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
    thumbs: o.items.slice(0, 3).map((i) => ({ title: i.title, image: i.product?.images?.[0]?.url ?? null })),
    trackingCode: o.trackingCode,
    reorder: o.items
      .filter((i) => i.product?.isActive)
      .map((i) => ({
        productId: i.productId,
        slug: i.product!.slug,
        title: i.title,
        image: i.product?.images?.[0]?.url ?? null,
        priceRial: i.product!.offPrice_rial ?? i.product!.price_rial,
        basePriceRial: i.product!.price_rial,
        quantity: i.quantity,
      })),
  };
}

/** All of a user's orders, newest first. */
export async function listOrders(userId: string): Promise<OrderListItem[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: orderListInclude,
  });
  return orders.map((o) => toListItem(o as unknown as OrderListRow));
}

/** Most recent active (non-final) order, for the dashboard "active order" card. */
export async function getActiveOrder(userId: string): Promise<OrderListItem | null> {
  const o = await prisma.order.findFirst({
    where: { userId, status: { in: ACTIVE_STATUSES } },
    orderBy: { createdAt: "desc" },
    include: orderListInclude,
  });
  return o ? toListItem(o as unknown as OrderListRow) : null;
}

/** Latest order regardless of status. */
export async function getLatestOrder(userId: string): Promise<OrderListItem | null> {
  const o = await prisma.order.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: orderListInclude,
  });
  return o ? toListItem(o as unknown as OrderListRow) : null;
}

const STEP_ORDER: { key: string; label: string; status: OrderStatus }[] = [
  { key: "placed", label: "ثبت سفارش", status: "PENDING" },
  { key: "paid", label: "پرداخت", status: "PAID" },
  { key: "processing", label: "آماده‌سازی", status: "PROCESSING" },
  { key: "shipped", label: "ارسال", status: "SHIPPED" },
  { key: "delivered", label: "تحویل", status: "DELIVERED" },
];

const RANK: Record<OrderStatus, number> = {
  PENDING: 0,
  PAID: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  REFUNDED: -1,
};

function buildTimeline(
  status: OrderStatus,
  history: { status: OrderStatus; createdAt: Date }[],
): OrderTimelineStep[] {
  const firstAt = (s: OrderStatus) =>
    history.find((h) => h.status === s)?.createdAt?.toISOString() ?? null;
  const rank = RANK[status];
  return STEP_ORDER.map((step, i) => {
    const stepRank = RANK[step.status];
    const done = rank >= 0 && rank > stepRank;
    const current = rank >= 0 && rank === stepRank;
    return {
      key: step.key,
      label: step.label,
      done: done || current,
      current,
      atISO: firstAt(step.status) ?? (i === 0 ? null : null),
    };
  });
}

/** Products the user has ordered before, deduped, most-bought first. */
export async function listRepeatProducts(
  userId: string,
  limit = 8,
): Promise<RepeatProductItem[]> {
  const orders = await prisma.order.findMany({
    where: { userId, status: { notIn: ["CANCELLED", "REFUNDED"] } },
    select: {
      items: {
        select: {
          productId: true,
          product: {
            select: {
              slug: true,
              title: true,
              isActive: true,
              price_rial: true,
              offPrice_rial: true,
              images: {
                orderBy: { sortOrder: "asc" as const },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
  });

  const map = new Map<string, { slug: string; title: string; image: string | null; priceRial: number; basePriceRial: number; count: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      if (!item.productId || !item.product?.isActive) continue;
      const prev = map.get(item.productId);
      if (prev) {
        prev.count++;
      } else {
        map.set(item.productId, {
          slug: item.product.slug,
          title: item.product.title,
          image: item.product.images?.[0]?.url ?? null,
          priceRial: item.product.offPrice_rial ?? item.product.price_rial,
          basePriceRial: item.product.price_rial,
          count: 1,
        });
      }
    }
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([productId, v]) => ({
      productId,
      slug: v.slug,
      title: v.title,
      image: v.image,
      priceRial: v.priceRial,
      basePriceRial: v.basePriceRial,
      orderCount: v.count,
    }));
}

/**
 * Full order detail. For customers pass the userId to enforce ownership; for
 * admin pass `{ admin: true }`. Returns null when not found / not owned.
 */
export async function getOrderDetail(
  orderId: string,
  opts: { userId?: string; admin?: boolean },
): Promise<OrderDetail | null> {
  const order = await prisma.order.findFirst({
    where: opts.admin ? { id: orderId } : { id: orderId, userId: opts.userId },
    include: {
      address: true,
      payment: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      items: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              isActive: true,
              price_rial: true,
              offPrice_rial: true,
              images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
            },
          },
          variant: {
            select: { weight: { select: { title: true } }, packaging: { select: { title: true } } },
          },
        },
      },
    },
  });
  if (!order) return null;

  const lines = order.items.map((it) => {
    const variantLabel =
      [it.variant?.weight?.title, it.variant?.packaging?.title].filter(Boolean).join(" · ") ||
      it.variantSku ||
      null;
    return {
      title: it.title,
      image: it.product?.images?.[0]?.url ?? null,
      variantLabel,
      quantity: it.quantity,
      unitPriceRial: it.unitPrice_rial,
      lineTotalRial: it.lineTotal_rial,
    };
  });

  const reorder = order.items
    .filter((it) => it.product?.isActive)
    .map((it) => {
      const p = it.product!;
      return {
        productId: it.productId,
        slug: p.slug,
        title: it.title,
        image: p.images?.[0]?.url ?? null,
        priceRial: p.offPrice_rial ?? p.price_rial,
        basePriceRial: p.price_rial,
        quantity: it.quantity,
      };
    });

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAtISO: order.createdAt.toISOString(),
    trackingCode: order.trackingCode,
    subtotalRial: order.subtotal_rial,
    discountRial: order.discount_rial,
    shippingRial: order.shipping_rial,
    totalRial: order.total_rial,
    note: order.note,
    payment: order.payment
      ? {
          status: order.payment.status,
          provider: order.payment.provider,
          refId: order.payment.refId,
          cardPan: order.payment.cardPan,
          paidAtISO: order.payment.paidAt?.toISOString() ?? null,
        }
      : null,
    address: order.address
      ? {
          id: order.address.id,
          title: order.address.title,
          receiverName: order.address.receiverName,
          phone: order.address.phone,
          province: order.address.province,
          city: order.address.city,
          postalCode: order.address.postalCode,
          line: order.address.line,
          plaque: order.address.plaque,
          unit: order.address.unit,
          deliveryNote: order.address.deliveryNote,
          isDefault: order.address.isDefault,
        }
      : null,
    lines,
    timeline: buildTimeline(order.status, order.statusHistory),
    reorder,
  };
}
