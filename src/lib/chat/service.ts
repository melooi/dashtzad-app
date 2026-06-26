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
} from "@/lib/chat/types";

const PREVIEW_MAX = 120;
const BODY_MAX = 4000;
const PRESENCE_TTL_MS = 120_000; // operator counts as online if seen within 2m

type AttachmentInput = { url: string; name: string; mime: string; size: number } | null | undefined;

function preview(body: string): string {
  const t = body.trim().replace(/\s+/g, " ");
  return t.length > PREVIEW_MAX ? `${t.slice(0, PREVIEW_MAX - 1)}…` : t;
}

/** Trim + hard-cap a message body. Returns "" for whitespace-only input. */
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

// ---- public config (storefront-safe subset) ----

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

  // Effective availability = admin master switch AND at least one operator present.
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
    // Internal notes are operator-only — never shown to the visitor.
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
        unreadForAdmin: { increment: 1 },
        status: conv.status === "RESOLVED" ? "OPEN" : conv.status,
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
      user: { select: { name: true, phoneNumber: true, _count: { select: { orders: true } } } },
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
    unreadForAdmin: c.unreadForAdmin,
    assignedToName: c.assignedTo?.name?.trim() || null,
    departmentId: c.departmentId,
    departmentName: c.department?.name ?? null,
    rating: c.rating ?? null,
    orderCount: c.user?._count?.orders ?? 0,
  }));
}

export async function getAdminConversation(id: string): Promise<AdminConversationDetail | null> {
  const c = await prisma.conversation.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, phoneNumber: true } },
      assignedTo: { select: { name: true } },
      department: { select: { name: true } },
      messages: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true } } } },
    },
  });
  if (!c) return null;

  const orders = c.userId
    ? await prisma.order.findMany({
        where: { userId: c.userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, orderNumber: true, status: true, total_rial: true, createdAt: true },
      })
    : [];

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
    orders: orders.map((o) => ({
      id: o.id,
      code: o.orderNumber,
      status: o.status,
      totalRial: o.total_rial,
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
        // Internal notes don't notify the visitor or advance the conversation.
        ...(isNote
          ? {}
          : {
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
