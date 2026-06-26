// ============================================================
// Inline pricing input parsing + validation (PRICING-INLINE-CP1).
//
// Shared by the client cells (live feedback) AND the server actions
// (authoritative, defense-in-depth). Pure module — safe on both sides.
//
// Money rule (locked, SKILL §D): admin types Toman, DB stores Rial (×10).
// All parse results here are in *Toman*; conversion to Rial happens via
// convertTomanToRial so the ×10 rule lives in exactly one place.
// ============================================================

import { normalizeDigits } from "@/lib/admin/slug";

/** Persian, user-facing validation messages (single source of truth). */
export const PRICE_MESSAGES = {
  invalid: "قیمت معتبر نیست",
  offTooHigh: "قیمت تخفیفی باید کمتر از قیمت اصلی باشد",
  negativeStock: "موجودی نمی‌تواند منفی باشد",
  stockInvalid: "موجودی معتبر نیست",
  saveFailed: "ذخیره نشد؛ دوباره تلاش کنید",
  notFound: "مورد یافت نشد.",
} as const;

/** Above this Toman amount we ask the admin to confirm (likely a typo). */
export const HUGE_TOMAN_THRESHOLD = 100_000_000;

/** Persian/Arabic digits → English; strip thousands separators and spaces. */
export function normalizeNumericInput(raw: string): string {
  return normalizeDigits(String(raw ?? "")).replace(/[٬،,\s_]/g, "").trim();
}

export type ParseOk<T> = { ok: true; value: T; warn?: boolean };
export type ParseErr = { ok: false; error: string };
export type ParseResult<T> = ParseOk<T> | ParseErr;

/** Required positive Toman amount (rejects empty, zero, negative, non-numeric). */
export function parseTomanRequired(raw: string): ParseResult<number> {
  const cleaned = normalizeNumericInput(raw);
  const negative = /-/.test(cleaned);
  const digits = cleaned.replace(/[^\d]/g, "");
  if (digits === "") return { ok: false, error: PRICE_MESSAGES.invalid };
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n) || negative || n <= 0) return { ok: false, error: PRICE_MESSAGES.invalid };
  return { ok: true, value: n, warn: n > HUGE_TOMAN_THRESHOLD };
}

/** Optional positive Toman amount; empty → null (clears the value). */
export function parseTomanNullable(raw: string): ParseResult<number | null> {
  const cleaned = normalizeNumericInput(raw);
  const digits = cleaned.replace(/[^\d]/g, "");
  if (digits === "") return { ok: true, value: null };
  const negative = /-/.test(cleaned);
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n) || negative || n <= 0) return { ok: false, error: PRICE_MESSAGES.invalid };
  return { ok: true, value: n, warn: n > HUGE_TOMAN_THRESHOLD };
}

/** Packaging cost: like required but allows 0 (free packaging is legitimate). */
export function parsePackagingToman(raw: string): ParseResult<number> {
  const cleaned = normalizeNumericInput(raw);
  const negative = /-/.test(cleaned);
  const digits = cleaned.replace(/[^\d]/g, "");
  if (digits === "") return { ok: false, error: PRICE_MESSAGES.invalid };
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n) || negative || n < 0) return { ok: false, error: PRICE_MESSAGES.invalid };
  return { ok: true, value: n, warn: n > HUGE_TOMAN_THRESHOLD };
}

/** Non-negative integer stock. */
export function parseStock(raw: string): ParseResult<number> {
  const cleaned = normalizeNumericInput(raw);
  const negative = /-/.test(cleaned);
  const digits = cleaned.replace(/[^\d]/g, "");
  if (digits === "") return { ok: false, error: PRICE_MESSAGES.stockInvalid };
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n)) return { ok: false, error: PRICE_MESSAGES.stockInvalid };
  if (negative) return { ok: false, error: PRICE_MESSAGES.negativeStock };
  return { ok: true, value: n };
}
