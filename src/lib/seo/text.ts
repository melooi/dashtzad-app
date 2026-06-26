// ============================================================
// SEO text safety helpers (SEO-CP1). Keep meta clean and bounded.
// ============================================================

/** Strip HTML tags + collapse whitespace so descriptions are plain text. */
export function stripHtmlForMeta(input: string | null | undefined): string {
  return String(input ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate to `max` chars on a word boundary, adding an ellipsis (…). */
export function truncateMetaText(input: string | null | undefined, max = 160): string {
  const clean = stripHtmlForMeta(input);
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd() + "…";
}

export type MetaQuality = "empty" | "short" | "good" | "long";

/** Classify a meta string length against recommended bounds. */
export function validateMetaLength(value: string, min: number, max: number): MetaQuality {
  const len = (value ?? "").length;
  if (len === 0) return "empty";
  if (len < min) return "short";
  if (len > max) return "long";
  return "good";
}

/** Recommended length bounds per field (chars). */
export const META_BOUNDS = {
  title: { min: 30, max: 60 },
  description: { min: 70, max: 160 },
} as const;

/** XML-escape a value for use inside an XML/RSS feed. */
export function escapeXml(input: string | null | undefined): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
