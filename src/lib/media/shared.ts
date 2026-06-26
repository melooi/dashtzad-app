// ============================================================
// Media Library — shared, framework-agnostic constants & helpers (MEDIA-CP1).
//
// This module is SAFE to import from both client and server. It MUST NOT import
// node built-ins (fs/path/crypto) or Prisma — keep those in server-only files
// (config.ts, validation.ts, local-storage.ts, service.ts).
// ============================================================

import type { MediaUsage } from "@/generated/prisma/enums";

/** Allowed image MIME types for upload (CP1). SVG is intentionally excluded —
 *  see MEDIA-QA.md (deferred until a sanitizer is in place). GIF is allowed as
 *  a static image type. */
export const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AcceptedMime = (typeof ACCEPTED_MIME_TYPES)[number];

/** `accept` attribute for <input type="file">. */
export const ACCEPT_ATTR = ACCEPTED_MIME_TYPES.join(",");

/** Max upload size in bytes (default 8MB). Mirrored by the server validator. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Persian labels for each usage bucket. */
export const MEDIA_USAGE_LABELS: Record<MediaUsage, string> = {
  PRODUCT: "محصول",
  BANNER: "بنر",
  HOMEPAGE: "صفحه خانه",
  BRAND: "برند",
  SEO: "سئو",
  BLOG: "وبلاگ",
  RECIPE: "دستور پخت",
  GENERAL: "عمومی",
};

export const MEDIA_USAGE_VALUES: MediaUsage[] = [
  "PRODUCT",
  "BANNER",
  "HOMEPAGE",
  "BRAND",
  "SEO",
  "BLOG",
  "RECIPE",
  "GENERAL",
];

export const MEDIA_USAGE_OPTIONS = MEDIA_USAGE_VALUES.map((value) => ({
  value,
  label: MEDIA_USAGE_LABELS[value],
}));

export type MediaSort = "newest" | "oldest" | "largest" | "name";

export const MEDIA_SORT_OPTIONS: { value: MediaSort; label: string }[] = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی‌ترین" },
  { value: "largest", label: "بزرگ‌ترین فایل" },
  { value: "name", label: "نام" },
];

/** Human-readable byte size in Persian-friendly units (LTR-safe number). */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return "۰ بایت";
  const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  const rounded = i === 0 ? value : Math.round(value * 10) / 10;
  return `${rounded.toLocaleString("fa-IR")} ${units[i]}`;
}

/** Short MIME label (e.g. "image/webp" → "WEBP"). */
export function mimeLabel(mime: string): string {
  return mime.split("/")[1]?.toUpperCase() ?? mime.toUpperCase();
}
