// ============================================================
// Structured magazine TipTap nodes (CONTENT-CP1):
//   - dzTimeline  → خط زمان / chapters (case-file, food-culture)
//   - dzFaq       → پرسش‌های پرتکرار (did-you-know, encyclopedia)
//   - dzCard      → کارت (خاستگاه / فرهنگ / اعلان / معرفی / CTA)
//
// Each is an atom block whose data lives in `rendered: false` attributes (so
// nothing leaks onto the root element). renderHTML emits semantic,
// sanitizer-friendly markup (div/figure + allowlisted dz-* classes), and
// parseHTML rebuilds the attributes from that markup — so they round-trip
// through sanitizeRichHtml() on both save and public render. Editing is handled
// by the React NodeViews; the public look is pure CSS in `.dz-rich`.
// ============================================================

import { Node, ReactNodeViewRenderer, mergeAttributes } from "@tiptap/react";
import { TimelineView } from "./TimelineView";
import { FaqView } from "./FaqView";
import { CardView } from "./CardView";

export const CARD_VARIANTS = ["origin", "culture", "announcement", "launch", "cta"] as const;
export type CardVariant = (typeof CARD_VARIANTS)[number];

export const CARD_VARIANT_LABELS: Record<CardVariant, string> = {
  origin: "کارت خاستگاه",
  culture: "کارت فرهنگی",
  announcement: "کارت اعلان",
  launch: "کارت معرفی",
  cta: "فراخوان (CTA)",
};

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Timeline / chapters block. items: [{label, text}] */
export const DashtzadTimeline = Node.create({
  name: "dzTimeline",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return { items: { default: [], rendered: false } };
  },

  parseHTML() {
    return [
      {
        tag: "div.dz-timeline",
        getAttrs: (el) => {
          const items = Array.from(el.querySelectorAll(":scope > .dz-timeline__item"))
            .map((it) => ({
              label: it.querySelector(".dz-timeline__label")?.textContent?.trim() ?? "",
              text: it.querySelector(".dz-timeline__body")?.textContent?.trim() ?? "",
            }))
            .filter((it) => it.label || it.text);
          return { items };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const items = Array.isArray(node.attrs.items) ? node.attrs.items : [];
    const itemEls = items
      .filter((it) => it && (it.label || it.text))
      .map((it) => [
        "div",
        { class: "dz-timeline__item" },
        ["span", { class: "dz-timeline__label" }, str(it.label)],
        ["div", { class: "dz-timeline__body" }, str(it.text)],
      ]);
    return ["div", mergeAttributes(HTMLAttributes, { class: "dz-timeline" }), ...itemEls];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TimelineView);
  },
});

/** FAQ block. items: [{q, a}] */
export const DashtzadFaq = Node.create({
  name: "dzFaq",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return { items: { default: [], rendered: false } };
  },

  parseHTML() {
    return [
      {
        tag: "div.dz-faq",
        getAttrs: (el) => {
          const items = Array.from(el.querySelectorAll(":scope > .dz-faq__item"))
            .map((it) => ({
              q: it.querySelector(".dz-faq__q")?.textContent?.trim() ?? "",
              a: it.querySelector(".dz-faq__a")?.textContent?.trim() ?? "",
            }))
            .filter((it) => it.q || it.a);
          return { items };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const items = Array.isArray(node.attrs.items) ? node.attrs.items : [];
    const itemEls = items
      .filter((it) => it && (it.q || it.a))
      .map((it) => [
        "div",
        { class: "dz-faq__item" },
        ["p", { class: "dz-faq__q" }, str(it.q)],
        ["div", { class: "dz-faq__a" }, str(it.a)],
      ]);
    return ["div", mergeAttributes(HTMLAttributes, { class: "dz-faq" }), ...itemEls];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FaqView);
  },
});

/** Card block: optional Media-Library image + eyebrow/title/text + optional link. */
export const DashtzadCard = Node.create({
  name: "dzCard",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      variant: { default: "origin", rendered: false },
      eyebrow: { default: "", rendered: false },
      title: { default: "", rendered: false },
      text: { default: "", rendered: false },
      href: { default: "", rendered: false },
      linkLabel: { default: "", rendered: false },
      mediaId: { default: null, rendered: false },
      src: { default: "", rendered: false },
      alt: { default: "", rendered: false },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure.dz-card",
        getAttrs: (el) => {
          const cls = el.getAttribute("class") ?? "";
          const vm = cls.match(/dz-card--([a-z]+)/);
          const img = el.querySelector(".dz-card__media img");
          const link = el.querySelector("a.dz-card__link");
          return {
            variant: vm && (CARD_VARIANTS as readonly string[]).includes(vm[1]) ? vm[1] : "origin",
            eyebrow: el.querySelector(".dz-card__eyebrow")?.textContent?.trim() ?? "",
            title: el.querySelector(".dz-card__title")?.textContent?.trim() ?? "",
            text: el.querySelector(".dz-card__text")?.textContent?.trim() ?? "",
            href: img ? "" : "",
            linkLabel: link?.textContent?.trim() ?? "",
            mediaId: img?.getAttribute("data-media-id") ?? null,
            src: img?.getAttribute("src") ?? "",
            alt: img?.getAttribute("alt") ?? "",
            ...(link ? { href: link.getAttribute("href") ?? "" } : {}),
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const a = node.attrs;
    const variant = (CARD_VARIANTS as readonly string[]).includes(a.variant) ? a.variant : "origin";
    const src = str(a.src);
    const children: unknown[] = [];

    if (src) {
      const imgAttrs: Record<string, string> = { src, alt: str(a.alt), loading: "lazy" };
      if (a.mediaId) imgAttrs["data-media-id"] = String(a.mediaId);
      children.push(["div", { class: "dz-card__media" }, ["img", imgAttrs]]);
    }

    const body: unknown[] = [];
    if (str(a.eyebrow)) body.push(["p", { class: "dz-card__eyebrow" }, str(a.eyebrow)]);
    if (str(a.title)) body.push(["p", { class: "dz-card__title" }, str(a.title)]);
    if (str(a.text)) body.push(["p", { class: "dz-card__text" }, str(a.text)]);
    if (str(a.href)) body.push(["a", { class: "dz-card__link", href: str(a.href) }, str(a.linkLabel) || str(a.href)]);
    children.push(["div", { class: "dz-card__body" }, ...body]);

    return ["figure", mergeAttributes(HTMLAttributes, { class: `dz-card dz-card--${variant}` }), ...children];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CardView);
  },
});
