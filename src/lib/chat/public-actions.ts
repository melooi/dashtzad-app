"use server";

// CHAT-CP1/CP2 — visitor-facing server actions, callable from the storefront
// widget (client). Respect the master `enabled` flag and the current session.

import { getChatSettings } from "@/lib/admin/global-service";
import {
  createVisitorConversation,
  appendVisitorMessage,
  getConversationByToken,
  rateConversation,
  cleanBody,
} from "@/lib/chat/service";
import type { ConversationView, ChatAttachment } from "@/lib/chat/types";

export type ChatActionResult =
  | { ok: true; conversation: ConversationView }
  | { ok: false; error: string };

async function disabledError(): Promise<string | null> {
  const s = await getChatSettings();
  return s.enabled ? null : "گفت‌وگو در حال حاضر غیرفعال است.";
}

export async function startConversationAction(input: {
  firstMessage: string;
  subject?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  attachment?: ChatAttachment;
}): Promise<ChatActionResult> {
  const off = await disabledError();
  if (off) return { ok: false, error: off };
  if (!cleanBody(input.firstMessage) && !input.attachment?.url)
    return { ok: false, error: "متن پیام خالی است." };
  const conversation = await createVisitorConversation(input);
  if (!conversation) return { ok: false, error: "ارسال پیام ناموفق بود. دوباره تلاش کنید." };
  return { ok: true, conversation };
}

export async function sendVisitorMessageAction(input: {
  token: string;
  body: string;
  attachment?: ChatAttachment;
}): Promise<ChatActionResult> {
  const off = await disabledError();
  if (off) return { ok: false, error: off };
  if (!input.token) return { ok: false, error: "گفت‌وگو یافت نشد." };
  if (!cleanBody(input.body) && !input.attachment?.url)
    return { ok: false, error: "متن پیام خالی است." };
  const conversation = await appendVisitorMessage(input.token, input.body, input.attachment);
  if (!conversation) return { ok: false, error: "ارسال پیام ناموفق بود. دوباره تلاش کنید." };
  return { ok: true, conversation };
}

export async function fetchConversationAction(token: string): Promise<ChatActionResult> {
  if (!token) return { ok: false, error: "گفت‌وگو یافت نشد." };
  const conversation = await getConversationByToken(token, { markVisitorRead: true });
  if (!conversation) return { ok: false, error: "گفت‌وگو یافت نشد." };
  return { ok: true, conversation };
}

export async function rateConversationAction(input: {
  token: string;
  rating: number;
  comment?: string;
}): Promise<ChatActionResult> {
  if (!input.token) return { ok: false, error: "گفت‌وگو یافت نشد." };
  const conversation = await rateConversation(input.token, input.rating, input.comment);
  if (!conversation) return { ok: false, error: "ثبت امتیاز ناموفق بود." };
  return { ok: true, conversation };
}
