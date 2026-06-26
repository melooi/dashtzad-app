/**
 * Support tools. The model-facing ones (request_human_support,
 * handoff_to_operator, create_support_ticket) create a row in the EXISTING
 * operator inbox — a safe, expected, customer-initiated action (NOT
 * destructive/financial/publishing). The internal ones (summarize/classify/
 * detect_angry) are programmatic helpers, hidden from the customer model.
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ToolContext, ToolDefinition } from "@/lib/ai/tool-registry";
import { createHandoff, buildTranscriptSummary } from "@/lib/ai/handoff";
import { classifyTicket, detectAngry } from "@/lib/ai/intent";
import { aiAvailable } from "@/lib/ai/availability";

function requireConversation(ctx: ToolContext): string {
  if (!ctx.conversationId) throw new Error("support tool requires a conversation context");
  return ctx.conversationId;
}

const requestHumanSupport: ToolDefinition = {
  name: "request_human_support",
  category: "SUPPORT",
  description:
    "انتقال گفت‌وگو به پشتیبانِ انسانی. وقتی استفاده کن که مشتری انسان می‌خواهد، موضوع حساس/شکایتی است، یا از پاسخ مطمئن نیستی.",
  parameters: z.object({ reason: z.string().nullable().describe("دلیل کوتاهِ انتقال") }),
  readOnly: false,
  handler: async (args, ctx) => {
    const aiConversationId = requireConversation(ctx);
    const { reason } = args as { reason: string | null };
    const result = await createHandoff({ aiConversationId, reason });
    return {
      handed_off: true,
      message: "گفت‌وگو به پشتیبانیِ انسانی منتقل شد؛ همکاران ما به‌زودی پاسخ می‌دهند.",
      ticketToken: result.conversationToken,
    };
  },
};

const handoffToOperator: ToolDefinition = {
  name: "handoff_to_operator",
  category: "SUPPORT",
  description: "انتقال صریح گفت‌وگو به یک اپراتورِ انسانی همراه با خلاصه‌ی گفت‌وگو.",
  parameters: z.object({
    reason: z.string().nullable(),
    priority: z.enum(["low", "normal", "high", "urgent"]).nullable(),
  }),
  readOnly: false,
  handler: async (args, ctx) => {
    const aiConversationId = requireConversation(ctx);
    const { reason, priority } = args as {
      reason: string | null;
      priority: "low" | "normal" | "high" | "urgent" | null;
    };
    const map = { low: "LOW", normal: "NORMAL", high: "HIGH", urgent: "URGENT" } as const;
    const result = await createHandoff({
      aiConversationId,
      reason,
      priority: priority ? map[priority] : undefined,
    });
    return { handed_off: true, ticketToken: result.conversationToken };
  },
};

const createSupportTicket: ToolDefinition = {
  name: "create_support_ticket",
  category: "SUPPORT",
  description: "ثبت یک تیکت پشتیبانی برای پیگیریِ بعدی (وقتی پاسخ فوری ممکن نیست).",
  parameters: z.object({
    subject: z.string().describe("موضوع کوتاه تیکت"),
    message: z.string().describe("شرح درخواست مشتری"),
  }),
  readOnly: false,
  handler: async (args, ctx) => {
    const aiConversationId = requireConversation(ctx);
    const { subject, message } = args as { subject: string; message: string };
    const result = await createHandoff({
      aiConversationId,
      reason: subject?.slice(0, 120) || "تیکت پشتیبانی",
      summary: message?.slice(0, 2000),
    });
    return { created: true, ticketToken: result.conversationToken };
  },
};

// ---- internal helpers (not exposed to the customer model) -----------------

const summarizeConversation: ToolDefinition = {
  name: "summarize_conversation",
  category: "SUPPORT",
  description: "خلاصه‌ی گفت‌وگوی فعلی (برای انتقال/تیکت). ابزار داخلی.",
  parameters: z.object({}),
  readOnly: true,
  internal: true,
  handler: async (_args, ctx) => {
    const id = requireConversation(ctx);
    const summary = await buildTranscriptSummary(id);
    return { summary, aiAvailable: aiAvailable() };
  },
};

const classifyTicketTool: ToolDefinition = {
  name: "classify_ticket",
  category: "SUPPORT",
  description: "دسته‌بندی تیکت پشتیبانی. ابزار داخلی.",
  parameters: z.object({ text: z.string() }),
  readOnly: true,
  internal: true,
  handler: async (args, ctx) => {
    const { text } = args as { text: string };
    const result = await classifyTicket(text, { conversationId: ctx.conversationId });
    return result ?? { available: false };
  },
};

const detectAngryCustomer: ToolDefinition = {
  name: "detect_angry_customer",
  category: "SUPPORT",
  description: "تشخیص عصبانیت مشتری. ابزار داخلی.",
  parameters: z.object({ text: z.string() }),
  readOnly: true,
  internal: true,
  handler: async (args, ctx) => {
    const { text } = args as { text: string };
    return detectAngry(text, { conversationId: ctx.conversationId });
  },
};

export const SUPPORT_TOOLS: ToolDefinition[] = [
  requestHumanSupport,
  handoffToOperator,
  createSupportTicket,
  summarizeConversation,
  classifyTicketTool,
  detectAngryCustomer,
];
