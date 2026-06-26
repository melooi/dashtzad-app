// ============================================================
// Media Library — upload validation & safe naming (MEDIA-CP1, server-only).
// All user-facing errors are Persian and never leak internals/stack traces.
// ============================================================

import { randomUUID } from "node:crypto";
import { normalizeDigits } from "@/lib/admin/slug";
import { ACCEPTED_MIME_TYPES, MAX_UPLOAD_BYTES, MIME_EXTENSION } from "./config";
import { formatBytes } from "./shared";

export type UploadCandidate = {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
};

export type ValidationResult = { ok: true } | { ok: false; error: string };

/** Validate a candidate upload by MIME, size and emptiness. */
export function validateUpload(c: UploadCandidate): ValidationResult {
  if (!c.sizeBytes || c.sizeBytes <= 0) {
    return { ok: false, error: "فایل خالی است." };
  }
  if (c.sizeBytes > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `حجم فایل بیش از حد مجاز است (حداکثر ${formatBytes(MAX_UPLOAD_BYTES)}).`,
    };
  }
  if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(c.mimeType)) {
    return {
      ok: false,
      error: "نوع فایل پشتیبانی نمی‌شود. فقط JPG، PNG، WEBP و GIF مجاز است.",
    };
  }
  // Defence in depth: a forged name like "evil.php.jpg" is fine (we rename it),
  // but reject names carrying path separators or traversal before any handling.
  if (/[\\/]|\.\./.test(c.originalName)) {
    return { ok: false, error: "نام فایل نامعتبر است." };
  }
  return { ok: true };
}

/** Latin-safe extension for a validated MIME (falls back to "bin"). */
export function extensionForMime(mimeType: string): string {
  return MIME_EXTENSION[mimeType] ?? "bin";
}

/**
 * Generate a collision-free, latin-only, path-safe on-disk filename.
 * The human originalName is kept separately on the record for display.
 * Example: "عکس محصول.JPG" → "aks-mhsol-3f9c1a2b.jpg"
 */
export function safeFilename(originalName: string, mimeType: string): string {
  const ext = extensionForMime(mimeType);

  const base = normalizeDigits(originalName)
    .replace(/\.[^.]+$/, "") // drop original extension
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .replace(/[^a-z0-9]+/g, "-") // anything non-latin/digit → hyphen
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const unique = randomUUID().slice(0, 8);
  const stem = base || "image";
  return `${stem}-${unique}.${ext}`;
}

/** Build the "YYYY/MM" folder for a given date. */
export function folderForDate(date: Date): string {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${yyyy}/${mm}`;
}

/** Clamp an optional client-supplied dimension to a sane positive int or null. */
export function sanitizeDimension(value: unknown): number | null {
  const n = typeof value === "string" ? parseInt(value, 10) : typeof value === "number" ? value : NaN;
  if (!Number.isFinite(n) || n <= 0 || n > 100000) return null;
  return Math.floor(n);
}
