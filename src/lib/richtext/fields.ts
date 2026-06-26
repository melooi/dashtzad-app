// ============================================================
// Zod helpers for rich-text (HTML) fields (ADMIN-RICH-EDITOR-CP1).
//
// These sanitize HTML inside the schema transform, so the SAME safe-HTML
// guarantee applies on the client resolver AND in the server action that
// re-parses the payload (defense in depth — dangerous markup never reaches DB).
//
// Length limits are generous (HTML markup inflates character counts) but
// bounded, so an admin can't paste an unbounded blob into the column.
// ============================================================

import { z } from "zod";
import { isEmptyRichHtml, sanitizeRichHtml } from "@/lib/richtext/sanitize";

const tooLong = (max: number) => `محتوا نباید بیش از ${max} نویسه باشد.`;

/**
 * Required rich-text field → always a non-empty sanitized HTML `string`.
 * Fails validation when the content has no visible text.
 */
export function requiredRichHtml(opts: { max: number; requiredMessage: string; maxMessage?: string }) {
  const { max, requiredMessage, maxMessage } = opts;
  return z
    .string()
    .transform((v) => sanitizeRichHtml(v))
    .refine((html) => html.length <= max, { message: maxMessage ?? tooLong(max) })
    .refine((html) => !isEmptyRichHtml(html), { message: requiredMessage });
}

/**
 * Optional rich-text field → sanitized HTML `string`, or `null` when empty.
 * For nullable DB columns (e.g. Category.description, Product.story).
 */
export function optionalRichHtml(opts: { max: number; maxMessage?: string }) {
  const { max, maxMessage } = opts;
  return z
    .string()
    .transform((v) => sanitizeRichHtml(v))
    .refine((html) => html.length <= max, { message: maxMessage ?? tooLong(max) })
    .transform((html) => (isEmptyRichHtml(html) ? null : html));
}

/**
 * Rich-text field for a NON-NULL column that may be empty → sanitized HTML
 * `string` ("" allowed). For required-but-emptyable columns (Product.description).
 */
export function richHtmlString(opts: { max: number; maxMessage?: string }) {
  const { max, maxMessage } = opts;
  return z
    .string()
    .transform((v) => sanitizeRichHtml(v))
    .refine((html) => html.length <= max, { message: maxMessage ?? tooLong(max) })
    .transform((html) => (isEmptyRichHtml(html) ? "" : html));
}
