"use server";

// CHAT-CP1/CP2 — admin/operator server actions. All guard with requireAdmin and
// revalidate the inbox + detail paths so the workspace reflects the new state.

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import {
  appendOperatorMessage,
  setConversationStatus,
  assignConversation,
  setConversationDepartment,
  markConversationReadByAdmin,
  setOperatorPresence,
  heartbeatOperator,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  cleanBody,
} from "@/lib/chat/service";
import { suggestOperatorReply } from "@/lib/chat/ai";
import type { ConversationStatus } from "@/generated/prisma/enums";
import type { ChatAttachment } from "@/lib/chat/types";

export type AdminChatResult = { ok: true } | { ok: false; error: string };
export type AiReplyResult = { ok: true; draft: string } | { ok: false; error: string };

function revalidate(conversationId?: string): void {
  revalidatePath("/admin/chat");
  if (conversationId) revalidatePath(`/admin/chat/${conversationId}`);
}

export async function replyAction(
  conversationId: string,
  body: string,
  attachment?: ChatAttachment,
): Promise<AdminChatResult> {
  const admin = await requireAdmin();
  if (!cleanBody(body) && !attachment?.url) return { ok: false, error: "متن پاسخ خالی است." };
  await appendOperatorMessage(conversationId, body, admin.id, { attachment });
  revalidate(conversationId);
  return { ok: true };
}

export async function noteAction(conversationId: string, body: string): Promise<AdminChatResult> {
  const admin = await requireAdmin();
  if (!cleanBody(body)) return { ok: false, error: "متن یادداشت خالی است." };
  await appendOperatorMessage(conversationId, body, admin.id, { isInternalNote: true });
  revalidate(conversationId);
  return { ok: true };
}

export async function changeStatusAction(
  conversationId: string,
  status: ConversationStatus,
): Promise<AdminChatResult> {
  await requireAdmin();
  await setConversationStatus(conversationId, status);
  revalidate(conversationId);
  return { ok: true };
}

export async function assignAction(
  conversationId: string,
  userId: string | null,
): Promise<AdminChatResult> {
  await requireAdmin();
  await assignConversation(conversationId, userId);
  revalidate(conversationId);
  return { ok: true };
}

export async function assignToMeAction(conversationId: string): Promise<AdminChatResult> {
  const admin = await requireAdmin();
  await assignConversation(conversationId, admin.id);
  revalidate(conversationId);
  return { ok: true };
}

export async function assignDepartmentAction(
  conversationId: string,
  departmentId: string | null,
): Promise<AdminChatResult> {
  await requireAdmin();
  await setConversationDepartment(conversationId, departmentId);
  revalidate(conversationId);
  return { ok: true };
}

export async function markReadAction(conversationId: string): Promise<AdminChatResult> {
  await requireAdmin();
  await markConversationReadByAdmin(conversationId);
  revalidate();
  return { ok: true };
}

export async function presenceAction(online: boolean): Promise<AdminChatResult> {
  const admin = await requireAdmin();
  await setOperatorPresence(admin.id, online);
  revalidate();
  return { ok: true };
}

export async function heartbeatAction(): Promise<AdminChatResult> {
  const admin = await requireAdmin();
  await heartbeatOperator(admin.id);
  return { ok: true };
}

export async function suggestReplyAction(conversationId: string): Promise<AiReplyResult> {
  await requireAdmin();
  return suggestOperatorReply(conversationId);
}

// ---- department management ----

export async function createDepartmentAction(input: {
  name: string;
  color?: string | null;
  isActive?: boolean;
  operatorIds?: string[];
}): Promise<AdminChatResult> {
  await requireAdmin();
  if (!input.name.trim()) return { ok: false, error: "نام دپارتمان الزامی است." };
  await createDepartment(input);
  revalidatePath("/admin/chat/departments");
  revalidate();
  return { ok: true };
}

export async function updateDepartmentAction(
  id: string,
  input: { name: string; color?: string | null; isActive?: boolean; operatorIds?: string[] },
): Promise<AdminChatResult> {
  await requireAdmin();
  if (!input.name.trim()) return { ok: false, error: "نام دپارتمان الزامی است." };
  await updateDepartment(id, input);
  revalidatePath("/admin/chat/departments");
  revalidate();
  return { ok: true };
}

export async function deleteDepartmentAction(id: string): Promise<AdminChatResult> {
  await requireAdmin();
  await deleteDepartment(id);
  revalidatePath("/admin/chat/departments");
  revalidate();
  return { ok: true };
}
