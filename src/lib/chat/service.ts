// CHAT-CP1/CP2 — server-only chat data access. All reads/writes go through here
// so the inbox helper columns stay in sync and both surfaces share one set of
// rules. Non-realtime: the storefront polls; the admin refreshes. No fake data.

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getChatSettings } from "@/lib/admin/global-service";
import type { ConversationStatus } from "@/generated/prisma/enums";
import type { Conversation, ChatMessage } from "@/generated/prisma/client";
import type {
  ChatPublicConfig,
  ChatFaqItem,
  ConversationView,
  MessageView,
  AdminConversationListItem,
  AdminConversationDetail,
  Department,
  OperatorPresence,
  OperatorStats,
  AiNextAction,
} from "@/lib/chat/types";
import type { ConversationAnalysis } from "./ai";

const PREVIEW_MAX = 120;
const BODY_MAX = 4000;
const PRESENCE_TTL_MS = 120_000; // 2 min
const TYPING_TTL_MS = 5_000;     // 5 sec

type AttachmentInput = { url: string; name: string; mime: string; size: number } | null | undefined;

function preview(body: string): string {
  const t = body.trim().replace(/\s+/g, " ");
  return t.length > PREVIEW_MAX ? `${t.slice(0, PREVIEW_MAX - 1)}…` : t;
}

export function cleanBody(body: string): string {
  return (body ?? "").trim().slice(0, BODY_MAX);
}

function attachmentData(att: AttachmentInput) {
  if (!att?.url) return {};
  return {
    attachmentUrl: att.url,
    attachmentName: att.name || "فایل",
    attachmentMime: att.mime || "",
    attachmentSize: att.size || 0,
  };
}

function previewFor(body: string, att: AttachmentInput): string {
  const clean = body.trim();
  if (clean) return preview(clean);
  if (att?.url) return `📎 ${att.name || "فایل"}`;
  return "";
}

function presenceCutoff(): Date {
  return new Date(Date.now() - PRESENCE_TTL_MS);
}

async function countOnlineOperators(): Promise<number> {
  return prisma.user.count({
    where: { role: "ADMIN", chatOnline: true, chatLastSeenAt: { gte: presenceCutoff() } },
  });
}

// ---- public config ----

export async function getChatPublicConfig(): Promise<ChatPublicConfig> {
  const s = await getChatSettings();

  let faq: ChatFaqItem[] = [];
  if (s.faqGroupId) {
    try {
      const group = await prisma.fAQGroup.findUnique({
        where: { id: s.faqGroupId },
        include: {
          items: {
            where: { isActive: true },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            take: 8,
          },
        },
      });
      if (group?.isActive) faq = group.items.map((it) => ({ question: it.question, answer: it.answer }));
    } catch {
      faq = [];
    }
  }

  const operatorsOnline = s.operatorsOnline && (await countOnlineOperators()) > 0;

  return {
    enabled: s.enabled,
    showMobileNav: s.showStorefrontMobileNav,
    showDesktopLauncher: s.showStorefrontDesktopLauncher,
    mobileCtaLabel: s.mobileCtaLabel,
    desktopCtaLabel: s.desktopCtaLabel,
    botName: s.botName,
    operatorName: s.operatorName,
    welcomeTitle: s.welcomeTitle,
    welcomeBody: s.welcomeBody,
    composerPlaceholder: s.composerPlaceholder,
    responseTimeLabel: s.responseTimeLabel,
    operatorsOnline,
    workingHoursLabel: s.workingHoursLabel,
    offlineTitle: s.offlineTitle,
    offlineBody: s.offlineBody,
    quickActions: s.quickActions.filter((q) => q.label.trim()),
    fallbackLinks: s.fallbackLinks.filter((l) => l.label.trim() && l.href.trim()),
    faq,
    proactiveEnabled: s.proactiveEnabled,
    proactiveDelaySeconds: s.proactiveDelaySeconds,
    proactiveMessage: s.proactiveMessage,
    preChatMode: s.preChatMode,
    soundEnabled: s.soundEnabled,
  };
}

// ---- mappers ----

function toMessageView(m: ChatMessage): MessageView {
  return {
    id: m.id,
    role: m.senderRole,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    attachment: m.attachmentUrl
      ? { url: m.attachmentUrl, name: m.attachmentName ?? "فایل", mime: m.attachmentMime ?? "", size: m.attachmentSize ?? 0 }
      : null,
  };
}

function toConversationView(c: Conversation & { messages: ChatMessage[] }): ConversationView {
  return {
    token: c.publicToken,
    status: c.status,
    subject: c.subject,
    operatorName: null,
    seenByOperator: c.unreadForAdmin === 0,
    rating: c.rating ?? null,
    messages: c.messages.filter((m) => !m.isInternalNote).map(toMessageView),
  };
}

// ---- visitor side ----

export async function createVisitorConversation(input: {
  firstMessage: string;
  subject?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  attachment?: AttachmentInput;
}): Promise<ConversationView | null> {
  const body = cleanBody(input.firstMessage);
  if (!body && !input.attachment?.url) return null;
  const user = await getCurrentUser();
  const now = new Date();
  const conv = await prisma.conversation.create({
    data: {
      status: "NEW",
      source: "storefront",
      subject: input.subject?.trim() || null,
      userId: user?.id ?? null,
      guestName: user ? null : input.guestName?.trim() || null,
      guestPhone: user ? null : input.guestPhone?.trim() || null,
      lastMessageAt: now,
      lastMessagePreview: previewFor(body, input.attachment),
      lastSenderRole: "VISITOR",
      unreadForAdmin: 1,
      messages: {
        create: { senderRole: "VISITOR", body, authorId: user?.id ?? null, ...attachmentData(input.attachment) },
      },
    },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  return toConversationView(conv);
}

export async function appendVisitorMessage(
  token: string,
  body: string,
  attachment?: AttachmentInput,
): Promise<ConversationView | null> {
  const clean = cleanBody(body);
  if (!clean && !attachment?.url) return null;
  const conv = await prisma.conversation.findUnique({ where: { publicToken: token } });
  if (!conv) return null;
  const user = await getCurrentUser();
  await prisma.$transaction([
    prisma.chatMessage.create({
      data: { conversationId: conv.id, senderRole: "VISITOR", body: clean, authorId: user?.id ?? null, ...attachmentData(attachment) },
    }),
    prisma.conversation.update({
      where: { id: conv.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: previewFor(clean, attachment),
        lastSenderRole: "VISITOR",
        unreadForAdmin: { increment: 1 },
        status: conv.status === "RESOLVED" ? "OPEN" : conv.status,
        visitorTypingAt: null,
      },
    }),
  ]);
  return getConversationByToken(token, { markVisitorRead: true });
}

export async function getConversationByToken(
  token: string,
  opts?: { markVisitorRead?: boolean },
): Promise<ConversationView | null> {
  const conv = await prisma.conversation.findUnique({
    where: { publicToken: token },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conv) return null;
  if (opts?.markVisitorRead && conv.unreadForVisitor > 0) {
    await prisma.conversation.update({ where: { id: conv.id }, data: { unreadForVisitor: 0 } });
  }
  return toConversationView(conv);
}

export async function rateConversation(
  token: string,
  rating: number,
  comment?: string | null,
): Promise<ConversationView | null> {
  const conv = await prisma.conversation.findUnique({ where: { publicToken: token } });
  if (!conv) return null;
  const r = Math.max(1, Math.min(5, Math.round(rating)));
  await prisma.conversation.update({
    where: { id: conv.id },
    data: { rating: r, ratingComment: comment?.trim() || null, ratedAt: new Date() },
  });
  return getConversationByToken(token);
}

/** Called by visitor while typing — sets a heartbeat so admin can show indicator. */
export async function setVisitorTyping(token: string): Promise<void> {
  await prisma.conversation.updateMany({
    where: { publicToken: token },
    data: { visitorTypingAt: new Date() },
  });
}

// ---- admin / operator side ----

export async function listAdminConversations(
  status?: ConversationStatus | "ALL",
  departmentId?: string | null,
): Promise<AdminConversationListItem[]> {
  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") where.status = status;
  if (departmentId) where.departmentId = departmentId;
  const rows = await prisma.conversation.findMany({
    where,
    orderBy: { lastMessageAt: "desc" },
    take: 200,
    include: {
      user: { select: { name: true, phoneNumber: true, customerTier: true } },
      assignedTo: { select: { name: true } },
      department: { select: { name: true } },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    status: c.status,
    source: c.source,
    subject: c.subject,
    displayName: c.user?.name?.trim() || c.guestName?.trim() || "مهمان",
    phone: c.user?.phoneNumber ?? c.guestPhone ?? null,
    isGuest: !c.userId,
    lastMessagePreview: c.lastMessagePreview,
    lastMessageAt: c.lastMessageAt.toISOString(),
    lastSenderRole: c.lastSenderRole ?? null,
    unreadForAdmin: c.unreadForAdmin,
    assignedToName: c.assignedTo?.name?.trim() || null,
    departmentId: c.departmentId,
    departmentName: c.department?.name ?? null,
    rating: c.rating ?? null,
    sentiment: c.sentiment ?? null,
    aiPriority: c.aiPriority ?? null,
    topicLabel: c.topicLabel ?? null,
    aiAnalyzedAt: c.aiAnalyzedAt?.toISOString() ?? null,
    customerTier: c.user?.customerTier ?? null,
  }));
}

export async function getAdminConversation(id: string): Promise<AdminConversationDetail | null> {
  const c = await prisma.conversation.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, phoneNumber: true, customerTier: true, createdAt: true } },
      assignedTo: { select: { name: true } },
      department: { select: { name: true } },
      messages: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true } } } },
    },
  });
  if (!c) return null;

  const uid = c.userId;

  // Parallel: orders, order stats, default address, customer notes
  const [orders, orderStats, defaultAddress, customerNotes] = await Promise.all([
    uid
      ? prisma.order.findMany({
          where: { userId: uid },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true, orderNumber: true, status: true, total_rial: true, createdAt: true,
            _count: { select: { items: true } },
          },
        })
      : Promise.resolve([]),
    uid
      ? prisma.order.aggregate({ where: { userId: uid }, _count: { id: true }, _sum: { total_rial: true }, _max: { createdAt: true } })
      : Promise.resolve(null),
    uid
      ? prisma.address.findFirst({ where: { userId: uid, isDefault: true }, select: { city: true } })
      : Promise.resolve(null),
    uid
      ? prisma.customerNote.findMany({
          where: { userId: uid },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, body: true, createdAt: true, author: { select: { name: true } } },
        })
      : Promise.resolve([]),
  ]);

  const typingTtl = new Date(Date.now() - TYPING_TTL_MS);
  const isVisitorTyping = c.visitorTypingAt && c.visitorTypingAt >= typingTtl;

  return {
    id: c.id,
    token: c.publicToken,
    status: c.status,
    source: c.source,
    subject: c.subject,
    displayName: c.user?.name?.trim() || c.guestName?.trim() || "مهمان",
    phone: c.user?.phoneNumber ?? c.guestPhone ?? null,
    isGuest: !c.userId,
    userId: c.userId,
    assignedToId: c.assignedToId,
    assignedToName: c.assignedTo?.name?.trim() || null,
    departmentId: c.departmentId,
    departmentName: c.department?.name ?? null,
    rating: c.rating ?? null,
    ratingComment: c.ratingComment ?? null,
    seenByVisitor: c.unreadForVisitor === 0,
    createdAt: c.createdAt.toISOString(),
    sentiment: c.sentiment ?? null,
    aiPriority: c.aiPriority ?? null,
    topicLabel: c.topicLabel ?? null,
    aiSummary: c.aiSummary ?? null,
    aiNextAction: (c.aiNextAction as AiNextAction | null) ?? null,
    aiAnalyzedAt: c.aiAnalyzedAt?.toISOString() ?? null,
    visitorTypingAt: isVisitorTyping ? c.visitorTypingAt!.toISOString() : null,
    customerTier: c.user?.customerTier ?? null,
    // Customer profile extras
    userCreatedAt: c.user?.createdAt?.toISOString() ?? null,
    userCity: defaultAddress?.city ?? null,
    totalOrderCount: orderStats?._count.id ?? 0,
    totalPurchaseRial: orderStats?._sum.total_rial ?? 0,
    lastOrderAt: orderStats?._max.createdAt?.toISOString() ?? null,
    customerNotes: customerNotes.map((n) => ({
      id: n.id,
      body: n.body,
      authorName: n.author.name?.trim() || "اپراتور",
      createdAt: n.createdAt.toISOString(),
    })),
    orders: orders.map((o) => ({
      id: o.id,
      code: o.orderNumber,
      status: o.status,
      totalRial: o.total_rial,
      itemCount: o._count.items,
      createdAt: o.createdAt.toISOString(),
    })),
    messages: c.messages.map((m) => ({
      id: m.id,
      role: m.senderRole,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      authorName: m.author?.name?.trim() || null,
      isInternalNote: m.isInternalNote,
      attachment: m.attachmentUrl
        ? { url: m.attachmentUrl, name: m.attachmentName ?? "فایل", mime: m.attachmentMime ?? "", size: m.attachmentSize ?? 0 }
        : null,
    })),
  };
}

export async function updateConversationAi(
  conversationId: string,
  analysis: ConversationAnalysis,
): Promise<void> {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      sentiment: analysis.sentiment,
      aiPriority: analysis.priority,
      topicLabel: analysis.topicLabel,
      aiSummary: analysis.summary,
      aiNextAction: analysis.nextAction ?? undefined,
      aiAnalyzedAt: new Date(),
    },
  });
}

export async function appendOperatorMessage(
  conversationId: string,
  body: string,
  operatorId: string,
  opts?: { isInternalNote?: boolean; attachment?: AttachmentInput },
): Promise<void> {
  const clean = cleanBody(body);
  if (!clean && !opts?.attachment?.url) return;
  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conv) return;
  const isNote = opts?.isInternalNote ?? false;
  await prisma.$transaction([
    prisma.chatMessage.create({
      data: {
        conversationId,
        senderRole: "OPERATOR",
        body: clean,
        authorId: operatorId,
        isInternalNote: isNote,
        ...attachmentData(opts?.attachment),
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: isNote
          ? `📝 ${previewFor(clean, opts?.attachment)}`
          : previewFor(clean, opts?.attachment),
        ...(isNote
          ? {}
          : {
              lastSenderRole: "OPERATOR",
              unreadForVisitor: { increment: 1 },
              unreadForAdmin: 0,
              status: conv.status === "NEW" ? "OPEN" : conv.status,
              assignedToId: conv.assignedToId ?? operatorId,
            }),
      },
    }),
  ]);
}

export async function setConversationStatus(
  conversationId: string,
  status: ConversationStatus,
): Promise<void> {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status, resolvedAt: status === "RESOLVED" ? new Date() : null },
  });
}

export async function assignConversation(
  conversationId: string,
  userId: string | null,
): Promise<void> {
  await prisma.conversation.update({ where: { id: conversationId }, data: { assignedToId: userId } });
}

export async function setConversationDepartment(
  conversationId: string,
  departmentId: string | null,
): Promise<void> {
  await prisma.conversation.update({ where: { id: conversationId }, data: { departmentId } });
}

export async function markConversationReadByAdmin(conversationId: string): Promise<void> {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { unreadForAdmin: 0 },
  });
}

export async function getAdminChatCounts(): Promise<{ open: number; unread: number }> {
  const [open, unreadAgg] = await Promise.all([
    prisma.conversation.count({ where: { status: { in: ["NEW", "OPEN", "PENDING"] } } }),
    prisma.conversation.aggregate({ _sum: { unreadForAdmin: true } }),
  ]);
  return { open, unread: unreadAgg._sum.unreadForAdmin ?? 0 };
}

export async function listOperators(): Promise<{ id: string; name: string }[]> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return admins.map((a) => ({ id: a.id, name: a.name?.trim() || "اپراتور" }));
}

/** Today's stats for the current operator. */
export async function getOperatorStats(operatorId: string): Promise<OperatorStats> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todayTotal, todayResolved] = await Promise.all([
    prisma.conversation.count({
      where: { assignedToId: operatorId, updatedAt: { gte: todayStart } },
    }),
    prisma.conversation.count({
      where: { assignedToId: operatorId, status: "RESOLVED", resolvedAt: { gte: todayStart } },
    }),
  ]);

  return { todayTotal, todayResolved, avgResponseMinutes: null };
}

// ---- presence ----

export async function setOperatorPresence(userId: string, online: boolean): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { chatOnline: online, chatLastSeenAt: new Date() } });
}

export async function heartbeatOperator(userId: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { chatLastSeenAt: new Date() } });
}

export async function getOperatorPresence(): Promise<OperatorPresence[]> {
  const cutoff = presenceCutoff();
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true, name: true, chatOnline: true, chatLastSeenAt: true },
    orderBy: { name: "asc" },
  });
  return admins.map((a) => ({
    id: a.id,
    name: a.name?.trim() || "اپراتور",
    online: a.chatOnline && !!a.chatLastSeenAt && a.chatLastSeenAt >= cutoff,
  }));
}

// ---- departments ----

export async function listDepartments(activeOnly = false): Promise<Department[]> {
  const rows = await prisma.department.findMany({
    where: activeOnly ? { isActive: true } : {},
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, color: true },
  });
  return rows;
}

export type DepartmentAdminRow = {
  id: string;
  name: string;
  color: string | null;
  isActive: boolean;
  sortOrder: number;
  operatorIds: string[];
  conversationCount: number;
};

export async function listDepartmentsAdmin(): Promise<DepartmentAdminRow[]> {
  const rows = await prisma.department.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      operators: { select: { id: true } },
      _count: { select: { conversations: true } },
    },
  });
  return rows.map((d) => ({
    id: d.id,
    name: d.name,
    color: d.color,
    isActive: d.isActive,
    sortOrder: d.sortOrder,
    operatorIds: d.operators.map((o) => o.id),
    conversationCount: d._count.conversations,
  }));
}

export async function createDepartment(input: {
  name: string;
  color?: string | null;
  isActive?: boolean;
  operatorIds?: string[];
}): Promise<void> {
  const max = await prisma.department.aggregate({ _max: { sortOrder: true } });
  await prisma.department.create({
    data: {
      name: input.name.trim(),
      color: input.color?.trim() || null,
      isActive: input.isActive ?? true,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
      operators: input.operatorIds?.length ? { connect: input.operatorIds.map((id) => ({ id })) } : undefined,
    },
  });
}

export async function updateDepartment(
  id: string,
  input: { name: string; color?: string | null; isActive?: boolean; operatorIds?: string[] },
): Promise<void> {
  await prisma.department.update({
    where: { id },
    data: {
      name: input.name.trim(),
      color: input.color?.trim() || null,
      isActive: input.isActive ?? true,
      operators: input.operatorIds ? { set: input.operatorIds.map((oid) => ({ id: oid })) } : undefined,
    },
  });
}

export async function deleteDepartment(id: string): Promise<void> {
  await prisma.department.delete({ where: { id } });
}
