/**
 * AI chat session, conversation and message persistence — the data layer behind
 * the customer chatbot APIs. Handles guest + logged-in sessions, per-session
 * access control (so one visitor can't read another's conversation), rate
 * limiting, and message history. No OpenAI calls happen here.
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { AiChannel, AiMessageRole } from "@/generated/prisma/enums";
import { checkRateLimit, hashIp, type RateLimitResult } from "@/lib/ai/guardrails";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const AI_SESSION_COOKIE = "dz_ai_session";

// Per-session message rate limit (first abuse guard; in-memory, see guardrails).
const RATE_LIMIT = { limit: 20, windowMs: 60_000 };

export interface SessionInit {
  channel?: AiChannel;
  customerId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

export async function createAiSession(init: SessionInit) {
  return prisma.aiSession.create({
    data: {
      channel: init.channel ?? "STOREFRONT",
      customerId: init.customerId ?? null,
      visitorId: crypto.randomUUID(),
      ipHash: hashIp(init.ip) ?? null,
      userAgent: init.userAgent?.slice(0, 400) ?? null,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
}

export async function getAiSession(token: string | undefined | null) {
  if (!token) return null;
  const session = await prisma.aiSession.findUnique({ where: { token } });
  if (!session) return null;
  if (session.expiresAt && session.expiresAt.getTime() < Date.now()) return null;
  return session;
}

/**
 * Resolve the caller's session: reuse a valid cookie token, else mint a new one.
 * If a customer just logged in, link the session to their id. Returns the
 * session plus whether the cookie should be (re)written.
 */
export async function resolveAiSession(
  token: string | undefined | null,
  init: SessionInit,
): Promise<{ session: Awaited<ReturnType<typeof createAiSession>>; isNew: boolean }> {
  const existing = await getAiSession(token);
  if (existing) {
    // Late-bind a customer id + refresh last-seen.
    const session = await prisma.aiSession.update({
      where: { id: existing.id },
      data: {
        lastSeenAt: new Date(),
        customerId: init.customerId ?? existing.customerId,
      },
    });
    return { session, isNew: false };
  }
  const session = await createAiSession(init);
  return { session, isNew: true };
}

export function checkChatRateLimit(sessionToken: string, perMinute?: number): RateLimitResult {
  const limit = perMinute && perMinute > 0 ? perMinute : RATE_LIMIT.limit;
  return checkRateLimit(`ai-chat:${sessionToken}`, { limit, windowMs: RATE_LIMIT.windowMs });
}

// ---- conversations --------------------------------------------------------

export interface CreateConversationInit {
  sessionId: string;
  channel: AiChannel;
  customerId?: string | null;
  visitorId?: string | null;
}

export async function createAiConversation(init: CreateConversationInit) {
  return prisma.aiConversation.create({
    data: {
      sessionId: init.sessionId,
      channel: init.channel,
      customerId: init.customerId ?? null,
      visitorId: init.visitorId ?? null,
      status: "ACTIVE",
    },
  });
}

export type AiConversationWithMessages = Prisma.AiConversationGetPayload<{
  include: { messages: true };
}>;

export async function getAiConversation(id: string) {
  return prisma.aiConversation.findUnique({ where: { id } });
}

export async function getAiConversationWithMessages(
  id: string,
): Promise<AiConversationWithMessages | null> {
  return prisma.aiConversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function listAiConversations(scope: {
  sessionId?: string | null;
  customerId?: string | null;
}) {
  const or: Prisma.AiConversationWhereInput[] = [];
  if (scope.customerId) or.push({ customerId: scope.customerId });
  if (scope.sessionId) or.push({ sessionId: scope.sessionId });
  if (or.length === 0) return [];
  return prisma.aiConversation.findMany({
    where: { OR: or },
    orderBy: { lastMessageAt: "desc" },
    take: 50,
  });
}

/**
 * A conversation is accessible iff it belongs to this session OR to this
 * logged-in customer. Guests are bound to their session cookie.
 */
export function conversationAccessible(
  conv: { sessionId: string | null; customerId: string | null },
  who: { sessionId?: string | null; customerId?: string | null },
): boolean {
  if (who.customerId && conv.customerId && conv.customerId === who.customerId) return true;
  if (who.sessionId && conv.sessionId && conv.sessionId === who.sessionId) return true;
  return false;
}

// ---- messages -------------------------------------------------------------

export interface AppendMessageInit {
  conversationId: string;
  role: AiMessageRole;
  content: string;
  contentJson?: Prisma.InputJsonValue;
  model?: string | null;
  providerResponseId?: string | null;
  tokensInput?: number | null;
  tokensOutput?: number | null;
  latencyMs?: number | null;
  moderationFlagged?: boolean;
}

export async function appendAiMessage(init: AppendMessageInit) {
  const [message] = await prisma.$transaction([
    prisma.aiMessage.create({
      data: {
        conversationId: init.conversationId,
        role: init.role,
        content: init.content,
        contentJson: init.contentJson,
        model: init.model ?? null,
        providerResponseId: init.providerResponseId ?? null,
        tokensInput: init.tokensInput ?? null,
        tokensOutput: init.tokensOutput ?? null,
        latencyMs: init.latencyMs ?? null,
        moderationFlagged: init.moderationFlagged ?? false,
      },
    }),
    prisma.aiConversation.update({
      where: { id: init.conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);
  return message;
}

export async function setConversationMeta(
  id: string,
  data: { intent?: string; priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT"; title?: string },
) {
  return prisma.aiConversation.update({
    where: { id },
    data: {
      ...(data.intent ? { intent: data.intent } : {}),
      ...(data.priority ? { priority: data.priority } : {}),
      ...(data.title ? { title: data.title.slice(0, 200) } : {}),
    },
  });
}

// ---- serialization (client-safe) ------------------------------------------

export interface MessageDTO {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  data: unknown | null;
  createdAtISO: string;
}

const ROLE_MAP: Record<AiMessageRole, MessageDTO["role"]> = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
  DEVELOPER: "system",
  TOOL: "tool",
};

export function serializeMessage(m: {
  id: string;
  role: AiMessageRole;
  content: string;
  contentJson: unknown;
  createdAt: Date;
}): MessageDTO {
  return {
    id: m.id,
    role: ROLE_MAP[m.role],
    content: m.content,
    data: m.contentJson ?? null,
    createdAtISO: m.createdAt.toISOString(),
  };
}

export interface ConversationDTO {
  id: string;
  status: string;
  intent: string | null;
  priority: string;
  title: string | null;
  lastMessageAtISO: string;
  createdAtISO: string;
}

export function serializeConversation(c: {
  id: string;
  status: string;
  intent: string | null;
  priority: string;
  title: string | null;
  lastMessageAt: Date;
  createdAt: Date;
}): ConversationDTO {
  return {
    id: c.id,
    status: c.status,
    intent: c.intent,
    priority: c.priority,
    title: c.title,
    lastMessageAtISO: c.lastMessageAt.toISOString(),
    createdAtISO: c.createdAt.toISOString(),
  };
}
