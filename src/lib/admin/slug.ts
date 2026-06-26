// ============================================================
// Global URL & Slug policy (locked, ADMIN-CP2.6).
//
// Stored slugs are ALWAYS lowercase Latin kebab-case: [a-z0-9] separated by
// single hyphens. No Persian/Arabic letters, no Persian/Arabic digits, no
// spaces, underscores, emojis or unsafe URL characters are ever stored.
//
// Auto-generation transliterates Persian → Latin and normalizes digits;
// manual input is validated by SLUG_PATTERN and rejected if non-Latin
// (Persian/Arabic digits are normalized automatically, not rejected).
// ============================================================

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Convert Persian/Arabic digits to English (0-9). */
export function normalizeDigits(input: string): string {
  return (input ?? "")
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

// Character-level Persian/Arabic → Latin map (phonetic-ish). Unknown characters
// are left untouched so digits/Latin/separators pass through; the final
// slugify pass strips anything outside [a-z0-9-].
const LETTER_MAP: Record<string, string> = {
  "آ": "a", "ا": "a", "أ": "a", "إ": "a", "ء": "", "ئ": "y", "ؤ": "o",
  "ب": "b", "پ": "p", "ت": "t", "ث": "s", "ج": "j", "چ": "ch", "ح": "h", "خ": "kh",
  "د": "d", "ذ": "z", "ر": "r", "ز": "z", "ژ": "zh", "س": "s", "ش": "sh", "ص": "s",
  "ض": "z", "ط": "t", "ظ": "z", "ع": "a", "غ": "gh", "ف": "f", "ق": "gh",
  "ک": "k", "ك": "k", "گ": "g", "ل": "l", "م": "m", "ن": "n", "و": "o",
  "ه": "h", "ة": "h", "ی": "i", "ي": "i", "ى": "i",
};

/** Transliterate Persian/Arabic letters to Latin, character by character. */
export function transliteratePersianToLatin(input: string): string {
  let out = "";
  for (const ch of input) {
    out += ch in LETTER_MAP ? LETTER_MAP[ch] : ch;
  }
  return out;
}

// Small, extensible dictionary of common commerce terms so weight/packaging
// titles produce clean, readable slugs. Everything not listed falls back to
// character transliteration. Admins can always edit the generated slug.
const TERM_MAP: Record<string, string> = {
  "زعفران": "zaferan",
  "نگین": "negin",
  "سرگل": "sargol",
  "برنج": "berenj",
  "هاشمی": "hashemi",
  "طارم": "tarom",
  "آجیل": "ajil",
  "مخلوط": "makhlot",
  "خشکبار": "khoshkbar",
  "زعفرانی": "zaferani",
  "گرم": "g",
  "گرمی": "g",
  "کیلوگرم": "kg",
  "کیلو": "kilo",
  "کیلویی": "kilo",
  "عدد": "unit",
  "عددی": "unit",
  "بسته": "baste",
};

// Whitespace + zero-width / bidi separators used to split words.
const SEPARATORS = /[\s‌‍‎‏]+/;

/**
 * Build a policy-compliant Latin kebab slug from arbitrary text. Steps:
 * normalize digits → split words → dictionary or transliteration per word →
 * glue numeric+unit (5 + g → 5g) → join with hyphens → strip to [a-z0-9-].
 */
export function slugifyLatinOnly(input: string): string {
  const normalized = normalizeDigits(input ?? "").trim();
  if (!normalized) return "";

  const words = normalized.split(SEPARATORS).filter(Boolean);
  const mapped = words
    .map((w) => (w in TERM_MAP ? TERM_MAP[w] : transliteratePersianToLatin(w)))
    .map((w) => w.toLowerCase())
    .filter(Boolean);

  // Glue a unit abbreviation (g/kg) onto a preceding pure-number word: "5g".
  const pieces: string[] = [];
  for (const m of mapped) {
    const prev = pieces[pieces.length - 1];
    if ((m === "g" || m === "kg") && prev && /^[0-9]+$/.test(prev)) {
      pieces[pieces.length - 1] = prev + m;
    } else {
      pieces.push(m);
    }
  }

  return pieces
    .join("-")
    .replace(/[^a-z0-9-]+/g, "-") // anything still non-Latin → hyphen
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Back-compat alias — same Latin-only behaviour. */
export const slugify = slugifyLatinOnly;

/** Validation pattern: lowercase Latin kebab-case ([a-z0-9] + single hyphens). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

/**
 * Generic uniqueness helper: returns `base`, or `base-2`, `base-3`, … — the
 * first value for which `exists` resolves false. Shared by every collection
 * that needs a unique slug/SKU.
 */
export async function ensureUniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  let candidate = base;
  let n = 1;
  while (await exists(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}
