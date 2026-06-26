// ============================================================
// Media Library — high-level storage service (MEDIA-CP1, server-only).
//
// Orchestrates validation + the active storage adapter. Returns data ready to
// persist on a MediaAsset row; DB writes happen in the route handler / actions.
// ============================================================

import { getStorageAdapter } from "./storage";
import {
  folderForDate,
  safeFilename,
  sanitizeDimension,
  validateUpload,
} from "./validation";
import type { DeleteTarget } from "./types";

export type IncomingFile = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  /** Optional client-detected dimensions (we don't decode images server-side in CP1). */
  width?: unknown;
  height?: unknown;
};

export type StoredRecord = {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  storage: "LOCAL" | "VERCEL_BLOB" | "S3";
  path: string;
  url: string;
  publicId: string | null;
  folder: string;
};

export type StoreResult =
  | { ok: true; record: StoredRecord }
  | { ok: false; error: string };

/** Validate + persist a file via the active adapter; returns record-ready data. */
export async function storeUpload(file: IncomingFile, now: Date): Promise<StoreResult> {
  const check = validateUpload({
    originalName: file.originalName,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
  });
  if (!check.ok) return check;

  const folder = folderForDate(now);
  const filename = safeFilename(file.originalName, file.mimeType);

  try {
    const adapter = getStorageAdapter();
    const saved = await adapter.save({
      buffer: file.buffer,
      filename,
      folder,
      mimeType: file.mimeType,
    });

    return {
      ok: true,
      record: {
        filename,
        originalName: file.originalName.slice(0, 255),
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        width: sanitizeDimension(file.width),
        height: sanitizeDimension(file.height),
        storage: saved.storage,
        path: saved.path,
        url: saved.url,
        publicId: saved.publicId,
        folder,
      },
    };
  } catch {
    // Never surface adapter internals/stack traces to the client.
    return { ok: false, error: "ذخیره‌ی فایل ناموفق بود." };
  }
}

/** Remove the stored binary for an asset. DB row removal is the caller's job. */
export async function removeStoredFile(target: DeleteTarget): Promise<{ ok: boolean; error?: string }> {
  try {
    const adapter = getStorageAdapter();
    await adapter.remove(target);
    return { ok: true };
  } catch {
    return { ok: false, error: "حذف فایل از حافظه ناموفق بود." };
  }
}
