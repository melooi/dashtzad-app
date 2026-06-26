"use server";

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
  updateConversationAi,
} from "@/lib/chat/service";
import { suggestOperatorReply, analyzeConversation } from "@/lib/chat/ai";
import { getChatSettings, writeGlobal } from "@/lib/admin/global-service";
import { chatSettingsSchema } from "@/lib/admin/globals";
import { storeUpload } from "@/lib/media/service";
import { prisma } from "@/lib/prisma";
import type { ConversationStatus } from "@/generated/prisma/enums";
import type { CannedReply } from "@/lib/chat/types";

function revalidate(conversationId?: string) {
  revalidatePath("/admin/chat");
  if (conversationId) revalidatePath(`/admin/chat/${conversationId}`);
}

// ---- message actions ----

export async function replyAction(
  conversationId: string,
  body: string,
  attachment?: { url: string; name: string; mime: string; size: number } | null,
) {
  const admin = await requireAdmin();
  await appendOperatorMessage(conversationId, body, admin.id, { isInternalNote: false, attachment });
  revalidate(conversationId);
}

export async function noteAction(conversationId: string, body: string) {
  const admin = await requireAdmin();
  await appendOperatorMessage(conversationId, body, admin.id, { isInternalNote: true });
  revalidate(conversationId);
}

// ---- status / assignment ----

export async function changeStatusAction(conversationId: string, status: ConversationStatus) {
  await requireAdmin();
  await setConversationStatus(conversationId, status);
  revalidate(conversationId);
}

export async function assignAction(conversationId: string, userId: string | null) {
  await requireAdmin();
  await assignConversation(conversationId, userId);
  revalidate(conversationId);
}

export async function assignToMeAction(conversationId: string) {
  const admin = await requireAdmin();
  await assignConversation(conversationId, admin.id);
  revalidate(conversationId);
}

export async function assignDepartmentAction(conversationId: string, departmentId: string | null) {
  await requireAdmin();
  await setConversationDepartment(conversationId, departmentId);
  revalidate(conversationId);
}

export async function markReadAction(conversationId: string) {
  await requireAdmin();
  await markConversationReadByAdmin(conversationId);
}

// ---- AI actions ----

export async function suggestReplyAction(conversationId: string) {
  await requireAdmin();
  return suggestOperatorReply(conversationId);
}

export async function analyzeAction(conversationId: string) {
  await requireAdmin();
  const result = await analyzeConversation(conversationId);
  if (result.ok) {
    await updateConversationAi(conversationId, result.analysis);
    revalidate(conversationId);
  }
  return result;
}

export async function executeNextActionAction(conversationId: string, template: string) {
  const admin = await requireAdmin();
  await appendOperatorMessage(conversationId, template, admin.id, { isInternalNote: false });
  revalidate(conversationId);
}

// ---- presence ----

export async function presenceAction(online: boolean) {
  const admin = await requireAdmin();
  await setOperatorPresence(admin.id, online);
}

export async function heartbeatAction() {
  const admin = await requireAdmin();
  await heartbeatOperator(admin.id);
}

// ---- upload ----

export async function uploadChatFile(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file) return { ok: false as const, error: "فایلی ارسال نشد" };
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await storeUpload(
    { buffer, originalName: file.name, mimeType: file.type, sizeBytes: file.size },
    new Date(),
  );
  if (!result.ok) return { ok: false as const, error: result.error };
  return { ok: true as const, url: result.record.url, name: file.name, mime: file.type, size: file.size };
}

// ---- departments ----

export async function createDepartmentAction(input: {
  name: string;
  color?: string | null;
  isActive?: boolean;
  operatorIds?: string[];
}) {
  try {
    await requireAdmin();
    await createDepartment(input);
    revalidatePath("/admin/chat/departments");
    revalidatePath("/admin/chat");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: String(e) };
  }
}

export async function updateDepartmentAction(
  id: string,
  input: { name: string; color?: string | null; isActive?: boolean; operatorIds?: string[] },
) {
  try {
    await requireAdmin();
    await updateDepartment(id, input);
    revalidatePath("/admin/chat/departments");
    revalidatePath("/admin/chat");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: String(e) };
  }
}

export async function deleteDepartmentAction(id: string) {
  try {
    await requireAdmin();
    await deleteDepartment(id);
    revalidatePath("/admin/chat/departments");
    revalidatePath("/admin/chat");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: String(e) };
  }
}

// ---- customer notes ----

export async function addCustomerNoteAction(userId: string, body: string) {
  const admin = await requireAdmin();
  if (!body.trim()) return { ok: false as const, error: "یادداشت خالی است" };
  await prisma.customerNote.create({
    data: { userId, authorId: admin.id, body: body.trim() },
  });
  revalidatePath("/admin/chat");
  return { ok: true as const };
}

export async function deleteCustomerNoteAction(noteId: string) {
  await requireAdmin();
  await prisma.customerNote.delete({ where: { id: noteId } });
  revalidatePath("/admin/chat");
  return { ok: true as const };
}

// ---- canned replies ----

export async function saveCannedRepliesAction(replies: CannedReply[]) {
  await requireAdmin();
  const settings = await getChatSettings();
  const updated = chatSettingsSchema.safeParse({ ...settings, cannedReplies: replies });
  if (!updated.success) throw new Error("داده‌های نامعتبر");
  await writeGlobal("chatSettings", updated.data);
  revalidatePath("/admin/chat/canned-replies");
}
