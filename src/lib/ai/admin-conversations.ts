/**
 * Admin-side AI conversation management (Chat Center). Read + light metadata
 * updates (status / priority / tags / assignment / internal note). This never
 * touches message content — it's conversation triage for operators.
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
  AiConversationStatus,
  AiPriority,
} from "@/generated/prisma/enums";

export interface AdminConvFilter {
  status?: AiConversationStatus | "ALL";
  priority?: AiPriority | "ALL";
  query?: string | null;
  take?: number;
}

export async function listAdminAiConversations(filter: AdminConvFilter = {}) {
  const where: Prisma.AiConversationWhereInput = {};
  if (filter.status && filter.status !== "ALL") where.status = filter.status;
  if (filter.priority && filter.priority !== "ALL") where.priority = filter.priority;
  if (filter.query && filter.query.trim()) {
    const q = filter.query.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { intent: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }
  const rows = await prisma.aiConversation.findMany({
    where,
    orderBy: { lastMessageAt: "desc" },
    take: Math.min(filter.take ?? 50, 100),
    include: { _count: { select: { messages: true, handoffs: true } } },
  });
  return rows.map((c) => ({
    id: c.id,
    channel: c.channel,
    status: c.status,
    priority: c.priority,
    intent: c.intent,
    tags: c.tags,
    title: c.title,
    customerId: c.customerId,
    operatorId: c.operatorId,
    messageCount: c._count.messages,
    handoffCount: c._count.handoffs,
    lastMessageAtISO: c.lastMessageAt.toISOString(),
    createdAtISO: c.createdAt.toISOString(),
  }));
}

export async function getAdminAiConversation(id: string) {
  const conv = await prisma.aiConversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      toolCalls: { orderBy: { createdAt: "asc" } },
      handoffs: { orderBy: { createdAt: "desc" } },
      feedback: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!conv) return null;
  return {
    id: conv.id,
    channel: conv.channel,
    status: conv.status,
    priority: conv.priority,
    intent: conv.intent,
    tags: conv.tags,
    operatorNote: conv.operatorNote,
    title: conv.title,
    customerId: conv.customerId,
    visitorId: conv.visitorId,
    operatorId: conv.operatorId,
    createdAtISO: conv.createdAt.toISOString(),
    messages: conv.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      data: m.contentJson ?? null,
      model: m.model,
      tokensInput: m.tokensInput,
      tokensOutput: m.tokensOutput,
      moderationFlagged: m.moderationFlagged,
      createdAtISO: m.createdAt.toISOString(),
    })),
    toolCalls: conv.toolCalls.map((t) => ({
      id: t.id,
      toolName: t.toolName,
      status: t.status,
      latencyMs: t.latencyMs,
      error: t.errorMessage,
      createdAtISO: t.createdAt.toISOString(),
    })),
    handoffs: conv.handoffs.map((h) => ({
      id: h.id,
      status: h.status,
      reason: h.reason,
      conversationId: h.conversationId,
      createdAtISO: h.createdAt.toISOString(),
    })),
    feedback: conv.feedback.map((f) => ({ id: f.id, rating: f.rating, comment: f.comment })),
  };
}

export interface AdminConvUpdate {
  status?: AiConversationStatus;
  priority?: AiPriority;
  tags?: string[];
  operatorNote?: string | null;
  operatorId?: string | null;
}

export async function updateAdminAiConversation(id: string, patch: AdminConvUpdate) {
  const data: Prisma.AiConversationUpdateInput = {};
  if (patch.status) data.status = patch.status;
  if (patch.priority) data.priority = patch.priority;
  if (patch.tags) data.tags = { set: patch.tags.slice(0, 20).map((t) => t.slice(0, 40)) };
  if (patch.operatorNote !== undefined) data.operatorNote = patch.operatorNote;
  if (patch.operatorId !== undefined) data.operatorId = patch.operatorId;
  return prisma.aiConversation.update({ where: { id }, data });
}
