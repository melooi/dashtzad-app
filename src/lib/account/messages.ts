// Customer "my messages" — a thin, ownership-enforced view over the existing
// CHAT-CP1 conversation system (same concept as the storefront chat widget).
import { prisma } from "@/lib/prisma";
import { appendVisitorMessage, getConversationByToken } from "@/lib/chat/service";
import type { ConversationListItemDTO, ConversationThreadDTO } from "./types";

export async function listMyConversations(userId: string): Promise<ConversationListItemDTO[]> {
  const rows = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { lastMessageAt: "desc" },
    select: {
      id: true,
      subject: true,
      status: true,
      lastMessagePreview: true,
      lastMessageAt: true,
      unreadForVisitor: true,
    },
  });
  return rows.map((c) => ({
    id: c.id,
    subject: c.subject,
    status: c.status,
    lastMessagePreview: c.lastMessagePreview,
    lastMessageAtISO: c.lastMessageAt.toISOString(),
    unread: c.unreadForVisitor,
  }));
}

export async function countUnreadMessages(userId: string): Promise<number> {
  const agg = await prisma.conversation.aggregate({
    where: { userId },
    _sum: { unreadForVisitor: true },
  });
  return agg._sum.unreadForVisitor ?? 0;
}

/** Ownership-checked thread; marks the visitor side read. Returns null if not owned. */
export async function getMyThread(
  userId: string,
  conversationId: string,
): Promise<ConversationThreadDTO | null> {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    select: { publicToken: true },
  });
  if (!conv) return null;
  const view = await getConversationByToken(conv.publicToken, { markVisitorRead: true });
  if (!view) return null;
  return {
    id: conversationId,
    token: view.token,
    subject: view.subject,
    status: view.status,
    messages: view.messages.map((m) => ({
      id: m.id,
      role: m.role,
      body: m.body,
      createdAtISO: m.createdAt,
    })),
  };
}

/** Reply as the owning customer (reuses the visitor append + denormalization). */
export async function replyAsOwner(
  userId: string,
  conversationId: string,
  body: string,
): Promise<ConversationThreadDTO | null> {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    select: { publicToken: true },
  });
  if (!conv) return null;
  await appendVisitorMessage(conv.publicToken, body);
  return getMyThread(userId, conversationId);
}
