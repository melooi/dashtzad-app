// ============================================================
// Media Library — storage configuration (MEDIA-CP1, server-only).
// ============================================================

import path from "node:path";
import type { MediaStorage } from "@/generated/prisma/enums";

export { ACCEPTED_MIME_TYPES, MAX_UPLOAD_BYTES } from "./shared";

/** Public URL prefix the browser uses for local files. */
export const MEDIA_PUBLIC_PREFIX = "/uploads/media";

/** Storage-relative key prefix persisted to MediaAsset.path (never absolute). */
export const MEDIA_PATH_PREFIX = "media";

/** Absolute on-disk root for LOCAL storage. Lives under /public so Next serves
 *  it statically. This path is server-side only and is NEVER stored or exposed. */
export const LOCAL_MEDIA_ROOT = path.join(process.cwd(), "public", "uploads", "media");

/** MIME → file extension for generated filenames (latin-safe). */
export const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Which storage backend is active. CP1 only implements LOCAL; the env switch is
 * here so VERCEL_BLOB / S3 adapters can be selected later without code edits.
 */
export function getStorageKind(): MediaStorage {
  const raw = (process.env.MEDIA_STORAGE ?? "LOCAL").toUpperCase();
  if (raw === "VERCEL_BLOB" || raw === "S3") return raw;
  return "LOCAL";
}

/** Whether local filesystem storage is the active backend (dev/self-host only). */
export function isLocalStorage(): boolean {
  return getStorageKind() === "LOCAL";
}
