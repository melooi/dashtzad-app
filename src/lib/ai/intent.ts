/**
 * Conversation triage via Structured Outputs: intent, priority, angry-customer
 * detection, and ticket classification. Degrades gracefully — when AI is
 * unavailable every function returns a safe neutral result instead of throwing,
 * so callers never break.
 */

import { z } from "zod";
import { aiAvailable } from "@/lib/ai/availability";
import { createStructured, zodToStrictJsonSchema } from "@/lib/ai/structured-output";
import { safetyClassifierPrompt } from "@/lib/ai/prompts";
import { getAiConfig } from "@/lib/ai/env";

// ---- intent / priority / anger -------------------------------------------

const triageSchema = z.object({
  intent: z.enum([
    "order_status",
    "product_question",
    "product_recommendation",
    "recipe",
    "policy_question",
    "complaint",
    "smalltalk",
    "other",
  ]),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  angry: z.boolean(),
  needsHuman: z.boolean(),
  shortTitle: z.string(),
});

export type Triage = z.infer<typeof triageSchema>;

const NEUTRAL_TRIAGE: Triage = {
  intent: "other",
  priority: "normal",
  angry: false,
  needsHuman: false,
  shortTitle: "",
};

const PRIORITY_MAP: Record<Triage["priority"], "LOW" | "NORMAL" | "HIGH" | "URGENT"> = {
  low: "LOW",
  normal: "NORMAL",
  high: "HIGH",
  urgent: "URGENT",
};

export function toDbPriority(p: Triage["priority"]): "LOW" | "NORMAL" | "HIGH" | "URGENT" {
  return PRIORITY_MAP[p];
}

/**
 * Classify a customer message. Returns NEUTRAL_TRIAGE in degraded mode or on any
 * error (best-effort; triage must never block the chat turn).
 */
export async function triageMessage(
  text: string,
  ctx: { conversationId?: string | null } = {},
): Promise<Triage> {
  if (!aiAvailable() || !text.trim()) return NEUTRAL_TRIAGE;
  try {
    const { data } = await createStructured<Triage>({
      model: getAiConfig().fastModel,
      instructions: `${safetyClassifierPrompt()}\nپیام مشتری را تحلیل کن و خروجی ساختاریافته بده. shortTitle یک عنوان کوتاه فارسی (حداکثر ۶ کلمه) است.`,
      input: text.slice(0, 2000),
      schemaName: "triage",
      jsonSchema: zodToStrictJsonSchema(triageSchema),
      zodSchema: triageSchema,
      reasoningEffort: "low",
      maxOutputTokens: 400,
      conversationId: ctx.conversationId ?? undefined,
    });
    return data;
  } catch (err) {
    console.warn("[ai/intent] triage failed, using neutral:", err);
    return NEUTRAL_TRIAGE;
  }
}

// ---- ticket classification ------------------------------------------------

const ticketSchema = z.object({
  category: z.enum(["orders", "payment", "shipping", "products", "returns", "account", "other"]),
  severity: z.enum(["low", "medium", "high"]),
  summary: z.string(),
});
export type TicketClassification = z.infer<typeof ticketSchema>;

export async function classifyTicket(
  text: string,
  ctx: { conversationId?: string | null } = {},
): Promise<TicketClassification | null> {
  if (!aiAvailable() || !text.trim()) return null;
  try {
    const { data } = await createStructured<TicketClassification>({
      model: getAiConfig().fastModel,
      instructions: "این گفت‌وگوی پشتیبانی را دسته‌بندی کن و خلاصه‌ی یک‌جمله‌ای فارسی بده.",
      input: text.slice(0, 3000),
      schemaName: "ticket_classification",
      jsonSchema: zodToStrictJsonSchema(ticketSchema),
      zodSchema: ticketSchema,
      reasoningEffort: "low",
      maxOutputTokens: 300,
      conversationId: ctx.conversationId ?? undefined,
    });
    return data;
  } catch (err) {
    console.warn("[ai/intent] classifyTicket failed:", err);
    return null;
  }
}

/** Lightweight anger signal (keyword fallback when AI is unavailable). */
const ANGER_HINTS = ["عصبانی", "شکایت", "افتضاح", "بی‌کیفیت", "کلاهبردار", "پول من", "هیچ‌کس جواب", "مزخرف"];

export async function detectAngry(
  text: string,
  ctx: { conversationId?: string | null } = {},
): Promise<{ angry: boolean; source: "ai" | "heuristic" }> {
  if (aiAvailable() && text.trim()) {
    const t = await triageMessage(text, ctx);
    return { angry: t.angry, source: "ai" };
  }
  const angry = ANGER_HINTS.some((h) => text.includes(h));
  return { angry, source: "heuristic" };
}
