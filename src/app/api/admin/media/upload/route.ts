import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { storeUpload } from "@/lib/media/service";
import { serializeAsset } from "@/lib/admin/media";
import { MEDIA_USAGE_VALUES } from "@/lib/media/shared";
import type { MediaUsage } from "@/generated/prisma/client";

// fs writes require the Node runtime (the LOCAL adapter touches the filesystem).
export const runtime = "nodejs";

/**
 * Admin-only image upload. Accepts multipart/form-data with a single `file`,
 * plus optional `usage`, `width`, `height` fields. Validates, stores via the
 * active storage adapter, and persists a MediaAsset row. Errors are safe
 * Persian messages — never raw stack traces.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });
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

  const usageRaw = String(form.get("usage") ?? "");
  const usage: MediaUsage | null = (MEDIA_USAGE_VALUES as string[]).includes(usageRaw)
    ? (usageRaw as MediaUsage)
    : null;

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await storeUpload(
    {
      buffer,
      originalName: file.name || "image",
      mimeType: file.type || "application/octet-stream",
      sizeBytes: buffer.byteLength,
      width: form.get("width") ?? undefined,
      height: form.get("height") ?? undefined,
    },
    new Date(),
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const created = await prisma.mediaAsset.create({
      data: {
        ...result.record,
        usage,
        uploadedById: user.id,
      },
    });
    return NextResponse.json({ ok: true, asset: serializeAsset(created) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "ثبت رکورد رسانه ناموفق بود." }, { status: 500 });
  }
}
