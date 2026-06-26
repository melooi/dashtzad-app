// CHAT-CP1 — shared chat vocabulary used by BOTH the storefront widget and the
// admin inbox. Pure types + label/tone maps only (no server imports), so this
// can be imported from any client or server module and keeps the two surfaces
// speaking one language.

import type { ConversationStatus, ChatSenderRole } from "@/generated/prisma/enums";

export type { ConversationStatus, ChatSenderRole };

export type ChatQuickAction = { label: string; icon: string };
export type ChatFallbackLink = { label: string; href: string; icon: string };
export type ChatFaqItem = { question: string; answer: string };
export type ChatAttachment = { url: string; name: string; mime: string; size: number } | null;
export type CannedReply = { title: string; shortcut: string; body: string };
export type AiConvInsight = {
  topic: string;
  sentiment: "angry" | "upset" | "neutral" | "happy";
  summary: string;
  suggestions: string[];
};
export type Department = { id: string; name: string; color: string | null };
export type OperatorPresence = { id: string; name: string; online: boolean };

export type PreChatMode = "off" | "optional" | "required";

/** The slice of chatSettings the public storefront widget is allowed to see. */
export type ChatPublicConfig = {
  enabled: boolean;
  showMobileNav: boolean;
  showDesktopLauncher: boolean;
  mobileCtaLabel: string;
  desktopCtaLabel: string;
  botName: string;
  operatorName: string;
  welcomeTitle: string;
  welcomeBody: string;
  composerPlaceholder: string;
  responseTimeLabel: string;
  operatorsOnline: boolean;
  workingHoursLabel: string;
  offlineTitle: string;
  offlineBody: string;
  quickActions: ChatQuickAction[];
  fallbackLinks: ChatFallbackLink[];
  // CHAT-CP2
  faq: ChatFaqItem[];
  proactiveEnabled: boolean;
  proactiveDelaySeconds: number;
  proactiveMessage: string;
  preChatMode: PreChatMode;
  soundEnabled: boolean;
};

export type MessageView = {
  id: string;
  role: ChatSenderRole;
  body: string;
  createdAt: string; // ISO
  attachment: ChatAttachment;
};

/** A visitor-facing conversation snapshot (returned by public actions). */
export type ConversationView = {
  token: string;
  status: ConversationStatus;
  subject: string | null;
  operatorName: string | null;
  // CHAT-CP2 — read receipt + CSAT
  seenByOperator: boolean;
  rating: number | null;
  messages: MessageView[];
};

// ---- admin-facing shapes ----

export type CustomerTier = "new" | "reg" | "loyal" | "whole";

export function getCustomerTier(orderCount: number): CustomerTier {
  if (orderCount === 0) return "new";
  if (orderCount <= 2) return "reg";
  if (orderCount <= 9) return "loyal";
  return "whole";
}

export const TIER_LABEL: Record<CustomerTier, string> = {
  new: "تازه",
  reg: "معمولی",
  loyal: "وفادار",
  whole: "عمده",
};

export const TIER_CLS: Record<CustomerTier, string> = {
  new: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  reg: "bg-dz-primary-50 text-dz-primary-500 dark:bg-white/5 dark:text-dz-night-muted",
  loyal: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  whole: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
};

export type AdminConversationListItem = {
  id: string;
  status: ConversationStatus;
  source: string;
  subject: string | null;
  displayName: string;
  phone: string | null;
  isGuest: boolean;
  lastMessagePreview: string | null;
  lastMessageAt: string; // ISO
  unreadForAdmin: number;
  assignedToName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  rating: number | null;
  orderCount: number;
};

export type AdminMessageView = MessageView & { authorName: string | null; isInternalNote: boolean };

export type AdminOrderSummary = {
  id: string;
  code: string;
  status: string;
  totalRial: number;
  createdAt: string;
};

export type AdminConversationDetail = {
  id: string;
  token: string;
  status: ConversationStatus;
  source: string;
  subject: string | null;
  displayName: string;
  phone: string | null;
  isGuest: boolean;
  userId: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  rating: number | null;
  ratingComment: string | null;
  seenByVisitor: boolean;
  createdAt: string;
  orders: AdminOrderSummary[];
  messages: AdminMessageView[];
};

// ---- status vocabulary (single source of truth) ----

export const CONVERSATION_STATUSES: ConversationStatus[] = ["NEW", "OPEN", "PENDING", "RESOLVED"];

export const STATUS_LABEL: Record<ConversationStatus, string> = {
  NEW: "جدید",
  OPEN: "باز",
  PENDING: "در انتظار",
  RESOLVED: "حل‌شده",
};

/** Maps a status to an AdminStatusBadge tone (admin dz palette). */
export const STATUS_BADGE_TONE: Record<ConversationStatus, "green" | "blue" | "amber" | "gray" | "red"> = {
  NEW: "blue",
  OPEN: "green",
  PENDING: "amber",
  RESOLVED: "gray",
};
