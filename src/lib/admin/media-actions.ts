"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { removeStoredFile } from "@/lib/media/service";
import { MEDIA_USAGE_VALUES } from "@/lib/media/shared";
import { listMediaAssets, serializeAsset, type MediaAssetDTO, type MediaQuery } from "./media";
import type { MediaUsage } from "@/generated/prisma/client";

const MEDIA_PATH = "/admin/media";

export type MediaActionResult =
  | { ok: true; asset: MediaAssetDTO }
  | { ok: false; error: string };

export type MediaDeleteResult = { ok: true } | { ok: false; error: string };

const metaSchema = z.object({
  alt: z.string().trim().max(300).optional().nullable(),
  title: z.string().trim().max(200).optional().nullable(),
  caption: z.string().trim().max(500).optional().nullable(),
  usage: z.enum(MEDIA_USAGE_VALUES as [string, ...string[]]).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
});

export type MediaMetaInput = z.input<typeof metaSchema>;

/** Update editable metadata (alt/title/caption/usage/tags) on an asset. */
export async function updateMediaMeta(id: string, raw: MediaMetaInput): Promise<MediaActionResult> {
  await requireAdmin();
  const parsed = metaSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "داده‌ها نامعتبر است." };

  const existing = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "فایل یافت نشد." };

  const d = parsed.data;
  const updated = await prisma.mediaAsset.update({
    where: { id },
    data: {
      alt: d.alt ?? null,
      title: d.title ?? null,
      caption: d.caption ?? null,
      // usage may be intentionally cleared (null) or left untouched (undefined).
      ...(d.usage !== undefined ? { usage: (d.usage as MediaUsage | null) ?? null } : {}),
      ...(d.tags !== undefined ? { tags: d.tags.map((t) => t.trim()).filter(Boolean) } : {}),
    },
  });

  revalidatePath(MEDIA_PATH);
  return { ok: true, asset: serializeAsset(updated) };
}

/**
 * Delete an asset: remove the DB row, then the stored binary (LOCAL only, and
 * only within the configured media root — see local-storage.ts). If the file
 * removal fails the row is still gone; we report it so the admin knows.
 */
export async function deleteMediaAsset(id: string): Promise<MediaDeleteResult> {
  await requireAdmin();
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return { ok: false, error: "فایل یافت نشد." };

  await prisma.mediaAsset.delete({ where: { id } });

  const fileRes = await removeStoredFile({
    storage: asset.storage,
    path: asset.path,
    publicId: asset.publicId,
  });

  revalidatePath(MEDIA_PATH);
  if (!fileRes.ok) {
    return { ok: false, error: "رکورد حذف شد اما حذف فایل از حافظه ناموفق بود." };
  }
  return { ok: true };
}

/** On-demand search used by the MediaPicker dialog. Admin-guarded. */
export async function searchMedia(query: MediaQuery): Promise<MediaAssetDTO[]> {
  await requireAdmin();
  return listMediaAssets({ ...query, take: query.take ?? 120 });
}
