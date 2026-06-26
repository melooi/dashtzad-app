/**
 * Read-only order tools. CRITICAL: every lookup is scoped to the authenticated
 * customer (`ctx.actor.customerId`). A client-supplied user id is NEVER trusted,
 * so one customer can never read another's orders. Guests are blocked by the
 * registry (`requiresAuth: true`).
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABEL } from "@/lib/admin/order-status";
import { formatToman } from "@/lib/price";
import type { ToolContext, ToolDefinition } from "@/lib/ai/tool-registry";

const PAYMENT_LABEL: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  SUCCESS: "پرداخت موفق",
  FAILED: "پرداخت ناموفق",
};

const ACTIVE = ["PENDING", "PAID", "PROCESSING", "SHIPPED"] as const;

/** Resolve the target order for this customer: by orderNumber, else the latest active. */
async function resolveOrder(customerId: string, orderNumber: string | null) {
  if (orderNumber && orderNumber.trim()) {
    return prisma.order.findFirst({
      where: { userId: customerId, orderNumber: orderNumber.trim() },
      include: { payment: true },
    });
  }
  return prisma.order.findFirst({
    where: { userId: customerId, status: { in: [...ACTIVE] } },
    orderBy: { createdAt: "desc" },
    include: { payment: true },
  });
}

function requireCustomer(ctx: ToolContext): string {
  const id = ctx.actor.customerId;
  if (!id) throw new Error("order tools require an authenticated customer");
  return id;
}

const getOrderStatus: ToolDefinition = {
  name: "get_order_status",
  category: "ORDER",
  description: "وضعیت یک سفارش مشتری. اگر شماره‌ی سفارش داده نشود، آخرین سفارشِ در جریان بررسی می‌شود.",
  parameters: z.object({ orderNumber: z.string().nullable().describe("شماره‌ی سفارش (اختیاری)") }),
  readOnly: true,
  requiresAuth: true,
  handler: async (args, ctx) => {
    const customerId = requireCustomer(ctx);
    const { orderNumber } = args as { orderNumber: string | null };
    const order = await resolveOrder(customerId, orderNumber);
    if (!order) return { found: false, message: "سفارشی با این مشخصات برای شما پیدا نشد." };
    return {
      found: true,
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: ORDER_STATUS_LABEL[order.status],
      totalLabel: formatToman(order.total_rial),
      trackingCode: order.trackingCode ?? null,
      createdAtISO: order.createdAt.toISOString(),
    };
  },
};

const getOrderItems: ToolDefinition = {
  name: "get_order_items",
  category: "ORDER",
  description: "اقلام یک سفارش مشتری.",
  parameters: z.object({ orderNumber: z.string().describe("شماره‌ی سفارش") }),
  readOnly: true,
  requiresAuth: true,
  handler: async (args, ctx) => {
    const customerId = requireCustomer(ctx);
    const { orderNumber } = args as { orderNumber: string };
    const order = await prisma.order.findFirst({
      where: { userId: customerId, orderNumber: orderNumber.trim() },
      include: { items: true },
    });
    if (!order) return { found: false };
    return {
      found: true,
      orderNumber: order.orderNumber,
      items: order.items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        unitPriceLabel: formatToman(i.unitPrice_rial),
        lineTotalLabel: formatToman(i.lineTotal_rial),
      })),
    };
  },
};

const getPaymentStatus: ToolDefinition = {
  name: "get_payment_status",
  category: "ORDER",
  description: "وضعیت پرداخت یک سفارش مشتری.",
  parameters: z.object({ orderNumber: z.string() }),
  readOnly: true,
  requiresAuth: true,
  handler: async (args, ctx) => {
    const customerId = requireCustomer(ctx);
    const { orderNumber } = args as { orderNumber: string };
    const order = await prisma.order.findFirst({
      where: { userId: customerId, orderNumber: orderNumber.trim() },
      include: { payment: true },
    });
    if (!order) return { found: false };
    const status = order.payment?.status ?? "PENDING";
    return {
      found: true,
      orderNumber: order.orderNumber,
      paymentStatus: status,
      paymentLabel: PAYMENT_LABEL[status] ?? status,
      totalLabel: formatToman(order.total_rial),
    };
  },
};

const getShippingStatus: ToolDefinition = {
  name: "get_shipping_status",
  category: "ORDER",
  description: "وضعیت ارسال و کد رهگیری یک سفارش مشتری.",
  parameters: z.object({ orderNumber: z.string() }),
  readOnly: true,
  requiresAuth: true,
  handler: async (args, ctx) => {
    const customerId = requireCustomer(ctx);
    const { orderNumber } = args as { orderNumber: string };
    const order = await prisma.order.findFirst({
      where: { userId: customerId, orderNumber: orderNumber.trim() },
      select: { orderNumber: true, status: true, trackingCode: true },
    });
    if (!order) return { found: false };
    return {
      found: true,
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: ORDER_STATUS_LABEL[order.status],
      shipped: ["SHIPPED", "DELIVERED"].includes(order.status),
      trackingCode: order.trackingCode ?? null,
    };
  },
};

export const ORDER_TOOLS: ToolDefinition[] = [
  getOrderStatus,
  getOrderItems,
  getPaymentStatus,
  getShippingStatus,
];
