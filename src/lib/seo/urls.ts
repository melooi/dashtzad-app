// ============================================================
// SEO URL & canonical helpers (SEO-CP1).
// Pure, dependency-free. URLs/canonicals are ALWAYS Latin — Persian/Arabic
// digits in a path are normalized to ASCII before building a URL (slug policy).
// ============================================================

import { normalizeDigits } from "@/lib/admin/slug";
import { BASE_URL } from "@/lib/seo";

/** Env/base fallback URL (no trailing slash). Override with canonicalBase. */
export function getBaseUrl(canonicalBase?: string | null): string {
  const base = (canonicalBase?.trim() || BASE_URL || "http://localhost:3000").trim();
  return base.replace(/\/+$/, "");
}

/**
 * Normalize a path: convert Persian/Arabic digits, ensure a single leading
 * slash, collapse duplicate slashes, and strip a trailing slash (except root).
 */
export function normalizePath(path: string): string {
  let p = normalizeDigits(String(path ?? "")).trim();
  if (!p) return "/";
  // Keep query/hash intact while normalizing only the path portion.
  const [rawPath, ...rest] = p.split(/(?=[?#])/);
  let pathname = rawPath.startsWith("http") ? rawPath : `/${rawPath}`;
  pathname = pathname.replace(/\/{2,}/g, "/");
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, "");
  p = pathname + rest.join("");
  return p;
}

/** Join base + path safely, preventing double slashes. */
export function joinUrlSafe(base: string, path: string): string {
  const b = getBaseUrl(base);
  if (/^https?:\/\//i.test(path)) return path;
  return `${b}${normalizePath(path)}`;
}

/** Build an absolute URL from a path (or pass-through an already-absolute URL). */
export function buildAbsoluteUrl(path: string, canonicalBase?: string | null): string {
  if (/^https?:\/\//i.test(path)) return path;
  return joinUrlSafe(getBaseUrl(canonicalBase), path);
}

/**
 * Canonical URL for a path. An explicit, valid absolute override wins; otherwise
 * the path is made absolute against the canonical base. Always Latin & clean.
 */
export function buildCanonical(
  path: string,
  override?: string | null,
  canonicalBase?: string | null,
): string {
  if (override && /^https?:\/\//i.test(override.trim())) {
    return override.trim().replace(/\/+$/, "") || override.trim();
  }
  return buildAbsoluteUrl(path, canonicalBase);
}

/** Whether a string is a safe absolute http(s) URL we can emit. */
export function isSafeAbsoluteUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
