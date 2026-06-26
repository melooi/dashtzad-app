// ============================================================
// Rich-text sanitization + plain-text helpers (ADMIN-RICH-EDITOR-CP1).
//
// Single source of truth for what HTML is allowed to enter the database and
// be rendered publicly. Isomorphic: uses the browser DOMPurify on the client
// and the jsdom-backed DOMPurify on the server (same allowlist both sides).
//
// This module has NO React / TipTap imports, so it is safe to import from
// server actions, Zod schemas, and the public RichTextRenderer.
// ============================================================

import DOMPurify from "isomorphic-dompurify";

/**
 * The ONLY classes allowed to survive sanitization. Anything else on a
 * class attribute is stripped. These are the Dashtzad rich-content styles
 * (see `.dz-rich` in globals.css).
 */
export const ALLOWED_DZ_CLASSES = new Set<string>([
  "dz-rich",
  // quotes
  "dz-quote",
  "dz-quote--heritage",
  "dz-quote--editorial",
  "dz-quote--speech-author",
  "dz-quote__caption",
  "dz-quote__avatar",
  "dz-quote__author",
  "dz-quote__role",
  // lists
  "dz-list",
  "dz-list--leaf",
  "dz-list--check",
  "dz-list--cross",
  "dz-list--steps",
  // callouts
  "dz-callout",
  "dz-callout--note",
  "dz-callout--warning",
  "dz-callout--tip",
  "dz-callout--experience",
  "dz-callout--definition",
  "dz-callout--quick-fact",
  "dz-callout--myth",
  "dz-callout--fact",
  "dz-callout--mistake",
  "dz-callout--nutrition",
  "dz-callout--medical",
  "dz-callout--consult",
  "dz-callout--evidence",
  "dz-callout--source",
  "dz-callout__title",
  "dz-callout__body",
  // media (single image + gallery/album)
  "dz-media",
  "dz-media--image",
  "dz-media--center",
  "dz-media--right",
  "dz-media--left",
  "dz-media--wide",
  "dz-gallery",
  "dz-gallery--grid-2",
  "dz-gallery--grid-3",
  "dz-gallery--featured",
  "dz-gallery--scroll-mobile",
  "dz-gallery__item",
  "dz-gallery__title",
  // table (CONTENT-CP1) — comparison table / feature grid
  "dz-table",
  // structured magazine blocks (CONTENT-CP1)
  "dz-timeline",
  "dz-timeline__item",
  "dz-timeline__label",
  "dz-timeline__body",
  "dz-faq",
  "dz-faq__item",
  "dz-faq__q",
  "dz-faq__a",
  // FAQ page answer blocks (FRONT-FAQ-TERMS)
  "dz-faq-facts",
  "dz-faq-fact",
  "dz-faq-fact--clay",
  "dz-faq-fact--gold",
  "dz-faq-note",
  "dz-faq-note--clay",
  "dz-faq-note--gold",
  "dz-faq-steps",
  "dz-faq-link",
  "dz-icon",
  "dz-card",
  "dz-card--origin",
  "dz-card--culture",
  "dz-card--announcement",
  "dz-card--launch",
  "dz-card--cta",
  "dz-card__media",
  "dz-card__body",
  "dz-card__eyebrow",
  "dz-card__title",
  "dz-card__text",
  "dz-card__link",
]);

/** Allowed callout kinds. Mirrors the Callout TipTap node + CSS. */
export const CALLOUT_TYPES = [
  "note",
  "warning",
  "tip",
  "experience",
  "definition",
  "quick-fact",
  "myth",
  "fact",
  "mistake",
  "nutrition",
  "medical",
  "consult",
  "evidence",
  "source",
] as const;
export type CalloutType = (typeof CALLOUT_TYPES)[number];

export const CALLOUT_LABELS: Record<CalloutType, string> = {
  note: "نکته",
  warning: "هشدار",
  tip: "پیشنهاد",
  experience: "تجربه دشت‌زاد",
  definition: "تعریف",
  "quick-fact": "آیا می‌دانستید؟",
  myth: "تصور رایج",
  fact: "واقعیت",
  mistake: "اشتباه رایج",
  nutrition: "اطلاعات تغذیه‌ای",
  medical: "هشدار سلامت",
  consult: "با پزشک مشورت کنید",
  evidence: "خلاصه شواهد",
  source: "منبع",
};

/**
 * Strict allowlist. DOMPurify drops every tag/attribute not listed here, plus
 * (by default) all script, event handlers, and unsafe URI schemes. We keep the
 * FORBID_* lists too as belt-and-braces, even though the allowlist already wins.
 */
const SANITIZE_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "a",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "hr",
    "div",
    "span",
    // Speech-author quote + media blocks use semantic figure/figcaption.
    "figure",
    "figcaption",
    "img",
    // Table (CONTENT-CP1) — comparison table / feature grid.
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "src", "alt", "loading", "width", "height", "data-media-id", "colspan", "rowspan"],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  // Never allow these, regardless of allowlist evolution.
  FORBID_TAGS: [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
    "textarea",
    "button",
    "svg",
    "math",
    "link",
    "meta",
    "base",
    "noscript",
    "template",
  ],
  FORBID_ATTR: ["style", "id", "srcset"],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
} as const;

// ---- Hooks: enforce class allowlist + safe-link attributes. ----
// addHook is global to the DOMPurify instance; this module is the only caller,
// so we install once per runtime and clear any prior hooks (HMR safety).
type PurifyWithHooks = typeof DOMPurify & {
  __dzHooksInstalled?: boolean;
};
const purify = DOMPurify as PurifyWithHooks;

if (!purify.__dzHooksInstalled) {
  DOMPurify.removeAllHooks();
  DOMPurify.addHook("afterSanitizeAttributes", (node: Element) => {
    // Filter class tokens down to the Dashtzad allowlist.
    if (node.hasAttribute("class")) {
      const kept = (node.getAttribute("class") ?? "")
        .split(/\s+/)
        .filter((c) => ALLOWED_DZ_CLASSES.has(c) || c.startsWith("ri-"));
      if (kept.length) node.setAttribute("class", kept.join(" "));
      else node.removeAttribute("class");
    }
    // Force safe link attributes on any surviving anchor with an href.
    if (node.tagName === "A" && node.hasAttribute("href")) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer nofollow");
    }
    // Media Library only: images must be same-origin relative paths
    // (e.g. /uploads/media/…). Drop external / protocol-relative / data URIs.
    if (node.tagName === "IMG") {
      const src = node.getAttribute("src") ?? "";
      if (!src.startsWith("/") || src.startsWith("//")) {
        node.remove();
        return;
      }
      node.setAttribute("loading", "lazy");
    }
  });
  purify.__dzHooksInstalled = true;
}

/**
 * Sanitize untrusted/admin-authored HTML to the Dashtzad allowlist.
 * Safe for both the save path (server action / Zod) and the render path.
 */
export function sanitizeRichHtml(input: string | null | undefined): string {
  const raw = typeof input === "string" ? input : "";
  if (raw.trim() === "") return "";
  return DOMPurify.sanitize(raw, SANITIZE_CONFIG) as unknown as string;
}

/** Does this string contain at least one HTML tag? (legacy plain-text detection) */
export function looksLikeHtml(value: string | null | undefined): boolean {
  return /<\/?[a-z][^>]*>/i.test(String(value ?? ""));
}

/** Strip tags + decode a few entities → plain text. For previews / JSON-LD / meta. */
export function htmlToPlainText(input: string | null | undefined): string {
  return String(input ?? "")
    .replace(/<(?:br|\/p|\/h[1-6]|\/li|\/blockquote|\/div|\/figcaption)>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when the HTML has no visible text content (e.g. "", "<p></p>", "<hr>"). */
export function isEmptyRichHtml(input: string | null | undefined): boolean {
  return htmlToPlainText(input).length === 0;
}

/** Escape text for safe inlining into HTML. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Convert legacy plain text (newline-separated) into simple paragraph HTML so
 * existing textarea content opens correctly inside the visual editor:
 * blank lines → new <p>, single newline → <br>.
 */
export function plainTextToHtml(input: string | null | undefined): string {
  const text = String(input ?? "").replace(/\r\n/g, "\n").trim();
  if (text === "") return "";
  return text
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/**
 * Normalize a stored value into editor-ready HTML. Already-HTML passes through;
 * legacy plain text is upgraded to paragraph HTML. Idempotent on HTML input.
 */
export function toEditorHtml(value: string | null | undefined): string {
  const v = String(value ?? "");
  if (v.trim() === "") return "";
  return looksLikeHtml(v) ? v : plainTextToHtml(v);
}
