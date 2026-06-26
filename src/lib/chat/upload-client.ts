// CHAT-CP2 — client helper to upload a chat attachment (image). Used by both
// the storefront widget and the admin composer. Returns a ready ChatAttachment.

import type { ChatAttachment } from "@/lib/chat/types";

export type UploadResult =
  | { ok: true; attachment: NonNullable<ChatAttachment> }
  | { ok: false; error: string };

export async function uploadChatFile(file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await fetch("/api/chat/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok || !data?.ok) return { ok: false, error: data?.error ?? "آپلود فایل ناموفق بود." };
    return { ok: true, attachment: { url: data.url, name: data.name, mime: data.mime, size: data.size } };
  } catch {
    return { ok: false, error: "خطا در آپلود فایل." };
  }
}
