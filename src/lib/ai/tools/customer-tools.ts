/**
 * Read-only customer tools. All require an authenticated customer and operate
 * strictly on `ctx.actor.customerId`. PII (full phone/email) is returned only to
 * the customer themselves; the assistant is instructed not to read it aloud
 * unnecessarily.
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ToolContext, ToolDefinition } from "@/lib/ai/tool-registry";

function requireCustomer(ctx: ToolContext): string {
  const id = ctx.actor.customerId;
  if (!id) throw new Error("customer tools require an authenticated customer");
  return id;
}

const getCustomerProfile: ToolDefinition = {
  name: "get_customer_profile",
  category: "CUSTOMER",
  description: "دریافت اطلاعات حسابِ مشتریِ واردشده (نام، تکمیل پروفایل).",
  parameters: z.object({}),
  readOnly: true,
  requiresAuth: true,
  handler: async (_args, ctx) => {
    const id = requireCustomer(ctx);
    const u = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true, phoneNumber: true, createdAt: true },
    });
    if (!u) return { found: false };
    return {
      found: true,
      name: u.name ?? null,
      hasEmail: Boolean(u.email),
      // masked phone — never echo full number unprompted
      phoneMasked: u.phoneNumber ? `${u.phoneNumber.slice(0, 4)}****${u.phoneNumber.slice(-2)}` : null,
      memberSinceISO: u.createdAt.toISOString(),
    };
  },
};

const getCustomerOrders: ToolDefinition = {
  name: "get_customer_orders",
  category: "CUSTOMER",
  description: "فهرست سفارش‌های مشتریِ واردشده (جدیدترین‌ها).",
  parameters: z.object({ limit: z.number().nullable() }),
  readOnly: true,
  requiresAuth: true,
  handler: async (args, ctx) => {
    const id = requireCustomer(ctx);
    const { limit } = args as { limit: number | null };
    const take = Math.max(1, Math.min(10, limit ?? 5));
    const orders = await prisma.order.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take,
      select: { orderNumber: true, status: true, total_rial: true, createdAt: true },
    });
    return {
      count: orders.length,
      orders: orders.map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        totalToman: Math.round(o.total_rial / 10),
        createdAtISO: o.createdAt.toISOString(),
      })),
    };
  },
};

const getCustomerOpenTickets: ToolDefinition = {
  name: "get_customer_open_tickets",
  category: "CUSTOMER",
  description: "گفت‌وگوهای پشتیبانیِ بازِ مشتریِ واردشده.",
  parameters: z.object({}),
  readOnly: true,
  requiresAuth: true,
  handler: async (_args, ctx) => {
    const id = requireCustomer(ctx);
    const convos = await prisma.conversation.findMany({
      where: { userId: id, status: { in: ["NEW", "OPEN", "PENDING"] } },
      orderBy: { lastMessageAt: "desc" },
      take: 10,
      select: { subject: true, status: true, lastMessagePreview: true, lastMessageAt: true },
    });
    return {
      count: convos.length,
      tickets: convos.map((c) => ({
        subject: c.subject ?? "گفت‌وگوی پشتیبانی",
        status: c.status,
        preview: c.lastMessagePreview ?? null,
        lastMessageAtISO: c.lastMessageAt.toISOString(),
      })),
    };
  },
};

export const CUSTOMER_TOOLS: ToolDefinition[] = [
  getCustomerProfile,
  getCustomerOrders,
  getCustomerOpenTickets,
];
