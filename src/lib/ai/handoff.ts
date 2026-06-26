/**
 * Human handoff bridge. When the AI assistant can't (or shouldn't) continue, it
 * creates a row in the EXISTING operator inbox (`Conversation` + `ChatMessage`)
 * so operators keep their one workflow — and records an `AiHandoff` linking the
 * two. The live-chat system is untouched; we only insert rows it already
 * understands (a SYSTEM message carrying the AI transcript summary).
 */

import { prisma } from "@/lib/prisma";
import type { AiPriority } from "@/generated/prisma/enums";

export interface HandoffInput {
  aiConversationId: string;
  reason?: string | null;
  /** Pre-built summary; if omitted a transcript-based one is generated. */
  summary?: string | null;
  priority?: AiPriority;
  guestName?: string | null;
  guestPhone?: string | null;
}

export interface HandoffResult {
  handoffId: string;
  conversationId: string; // the operator-inbox Conversation.id
  conversationToken: string;
  status: "REQUESTED";
}

/** Build a plain-text transcript summary from AI messages (deterministic fallback). */
export async function buildTranscriptSummary(aiConversationId: string): Promise<string> {
  const messages = await prisma.aiMessage.findMany({
    where: { conversationId: aiConversationId, role: { in: ["USER", "ASSISTANT"] } },
    orderBy: { createdAt: "asc" },
    take: 40,
    select: { role: true, content: true },
  });
  const lines = messages
    .filter((m) => m.content.trim())
    .map((m) => `${m.role === "USER" ? "مشتری" : "دستیار"}: ${m.content.trim()}`);
  return lines.join("\n").slice(0, 4000);
}

/**
 * Create the operator-inbox conversation + AiHandoff. Idempotent-ish: if the AI
 * conversation already has an open handoff, returns it instead of duplicating.
 */
export async function createHandoff(input: HandoffInput): Promise<HandoffResult> {
  const existing = await prisma.aiHandoff.findFirst({
    where: { aiConversationId: input.aiConversationId, status: { in: ["REQUESTED", "ACCEPTED"] } },
    orderBy: { createdAt: "desc" },
  });
  if (existing && existing.conversationId) {
    const conv = await prisma.conversation.findUnique({
      where: { id: existing.conversationId },
      select: { publicToken: true },
    });
    if (conv) {
      return {
        handoffId: existing.id,
        conversationId: existing.conversationId,
        conversationToken: conv.publicToken,
        status: "REQUESTED",
      };
    }
  }

  const ai = await prisma.aiConversation.findUnique({ where: { id: input.aiConversationId } });
  if (!ai) throw new Error("AI conversation not found for handoff");

  const summary = input.summary ?? (await buildTranscriptSummary(input.aiConversationId));
  const reason = input.reason?.trim() || "درخواست گفت‌وگو با پشتیبانِ انسانی";
  const systemBody =
    `🤖 انتقال از دستیار هوشمند دشت‌زاد\n` +
    `دلیل: ${reason}\n\n` +
    `— خلاصه‌ی گفت‌وگو —\n${summary || "(بدون پیام)"}`;

  // Create the operator-inbox conversation seeded with a SYSTEM summary message.
  const conversation = await prisma.conversation.create({
    data: {
      status: "NEW",
      source: "ai-handoff",
      subject: ai.title?.slice(0, 120) ?? "انتقال از دستیار هوشمند",
      userId: ai.customerId ?? null,
      guestName: input.guestName ?? null,
      guestPhone: input.guestPhone ?? null,
      lastMessageAt: new Date(),
      lastMessagePreview: reason.slice(0, 120),
      unreadForAdmin: 1,
      messages: { create: { senderRole: "SYSTEM", body: systemBody } },
    },
    select: { id: true, publicToken: true },
  });

  const handoff = await prisma.aiHandoff.create({
    data: {
      aiConversationId: input.aiConversationId,
      conversationId: conversation.id,
      reason,
      summary: summary || null,
      status: "REQUESTED",
      priority: input.priority ?? ai.priority,
    },
  });

  // Mark the AI conversation as handed off (engine should stop auto-answering).
  await prisma.aiConversation.update({
    where: { id: input.aiConversationId },
    data: { status: "AWAITING_HUMAN" },
  });

  return {
    handoffId: handoff.id,
    conversationId: conversation.id,
    conversationToken: conversation.publicToken,
    status: "REQUESTED",
  };
}
