import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { storeUpload } from "@/lib/media/service";
import { getChatSettings } from "@/lib/admin/global-service";

// CHAT-CP2 — chat attachment upload (images, validated + size-capped by the
// shared media pipeline). Used by both the storefront widget and the admin
// composer. fs writes require the Node runtime.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const settings = await getChatSettings();
  // Visitors may upload only while chat is enabled; admins always may.
  if (!settings.enabled && user?.role !== "ADMIN") {
    return NextResponse.json({ error: "گفت‌وگو غیرفعال است." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "فایلی ارسال نشده است." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await storeUpload(
    {
      buffer,
      originalName: file.name || "image",
      mimeType: file.type || "application/octet-stream",
      sizeBytes: buffer.byteLength,
    },
    new Date(),
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Persist a MediaAsset row so chat attachments live in the media library too.
  // Non-fatal if it fails — the binary is already stored and the URL is usable.
  try {
    await prisma.mediaAsset.create({
      data: { ...result.record, usage: "GENERAL", uploadedById: user?.id ?? null },
    });
  } catch {
    /* ignore — still return the URL */
  }

  return NextResponse.json(
    {
      ok: true,
      url: result.record.url,
      name: result.record.originalName,
      mime: result.record.mimeType,
      size: result.record.sizeBytes,
    },
    { status: 201 },
  );
}
