// Phone helpers: digit normalization + Iranian mobile validation.

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Convert Persian/Arabic digits to English (0-9). */
export function normalizeDigits(input: string): string {
  return (input ?? "")
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

export const IRAN_MOBILE_RE = /^09\d{9}$/;

/**
 * Normalize a phone number to the canonical `09XXXXXXXXX` form:
 * - converts Persian/Arabic digits
 * - strips spaces/dashes
 * - handles +98 / 0098 / 98 prefixes
 */
export function normalizePhoneNumber(input: string): string {
  let s = normalizeDigits(input ?? "")
    .trim()
    .replace(/[\s\-()]/g, "");

  if (s.startsWith("+98")) s = "0" + s.slice(3);
  else if (s.startsWith("0098")) s = "0" + s.slice(4);
  else if (s.startsWith("98") && s.length === 12) s = "0" + s.slice(2);

  return s;
}

export function isValidIranianMobile(s: string): boolean {
  return IRAN_MOBILE_RE.test(s);
}
