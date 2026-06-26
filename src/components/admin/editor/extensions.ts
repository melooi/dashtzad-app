// ============================================================
// Custom Dashtzad TipTap extensions (ADMIN-RICH-EDITOR-CP1).
//
// - Callout: the one genuinely-custom block node (نکته/هشدار/پیشنهاد/تجربه).
// - DashtzadAttributes: adds variant classes to the BUILT-IN blockquote and
//   bulletList nodes via global attributes — so we never replace StarterKit's
//   nodes (no duplicate-extension conflicts). The CSS in globals.css (.dz-rich)
//   turns these classes into the warm card / editorial / leaf-marker styles.
//
// All output stays inside the sanitizer allowlist (class tokens + div/blockquote/ul).
// ============================================================

import { Extension, Node, ReactNodeViewRenderer, mergeAttributes } from "@tiptap/react";
import { CALLOUT_TYPES } from "@/lib/richtext/sanitize";
import { SpeechQuoteView } from "./SpeechQuoteView";

const CALLOUT_TYPE_SET = new Set<string>(CALLOUT_TYPES);

/**
 * Note / callout block. Wraps one or more blocks and tags them with a type
 * class. The localized label (نکته/هشدار/…) is drawn by CSS ::before, so the
 * stored HTML stays minimal: `<div class="dz-callout dz-callout--note">…</div>`.
 */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      type: {
        default: "note",
        parseHTML: (element) => {
          const cls = element.getAttribute("class") ?? "";
          const match = cls.match(/dz-callout--([a-z-]+)/);
          return match && CALLOUT_TYPE_SET.has(match[1]) ? match[1] : "note";
        },
        // Type is carried by the class (see renderHTML below); nothing to add here.
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div.dz-callout" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const type = CALLOUT_TYPE_SET.has(node.attrs.type) ? node.attrs.type : "note";
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: `dz-callout dz-callout--${type}` }),
      0,
    ];
  },
});

/**
 * Speech-author quote (dz-quote--speech-author): a warm speech-bubble card with
 * a tail and an optional author / role / avatar-initial meta line. Serialized as
 * semantic figure > blockquote > figcaption (no fake data — author/role omitted
 * when empty). Editing is handled inline by the React NodeView (SpeechQuoteView).
 */
export const DashtzadSpeechQuote = Node.create({
  name: "dzSpeechQuote",
  group: "block",
  content: "paragraph+",
  defining: true,

  addAttributes() {
    return {
      author: {
        default: null,
        parseHTML: (el) => el.querySelector(".dz-quote__author")?.textContent?.trim() || null,
        // Rendered inside figcaption by renderHTML, not as a figure attribute.
        renderHTML: () => ({}),
      },
      role: {
        default: null,
        parseHTML: (el) => el.querySelector(".dz-quote__role")?.textContent?.trim() || null,
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    // Quote body lives inside <blockquote>; author/role recovered from figcaption.
    return [{ tag: "figure.dz-quote--speech-author", contentElement: "blockquote" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const author = typeof node.attrs.author === "string" ? node.attrs.author.trim() : "";
    const role = typeof node.attrs.role === "string" ? node.attrs.role.trim() : "";
    const initial = author ? Array.from(author)[0] : "";
    const figureAttrs = mergeAttributes(HTMLAttributes, {
      class: "dz-quote dz-quote--speech-author",
    });

    if (!author && !role) {
      return ["figure", figureAttrs, ["blockquote", {}, 0]];
    }
    return [
      "figure",
      figureAttrs,
      ["blockquote", {}, 0],
      [
        "figcaption",
        {},
        ["span", { class: "dz-quote__avatar" }, initial],
        ...(author ? [["span", { class: "dz-quote__author" }, author]] : []),
        ...(role ? [["span", { class: "dz-quote__role" }, role]] : []),
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SpeechQuoteView);
  },
});

/**
 * Variant classes for built-in nodes:
 *  - blockquote  → dz-quote / dz-quote--heritage / dz-quote--editorial
 *  - bulletList  → dz-list--leaf / dz-list--check / dz-list--cross
 *  - orderedList → dz-list--steps (numbered step-by-step list)
 */
export const DashtzadAttributes = Extension.create({
  name: "dashtzadAttributes",

  addGlobalAttributes() {
    return [
      {
        types: ["blockquote"],
        attributes: {
          dzQuoteVariant: {
            default: null,
            parseHTML: (element) => {
              const cls = element.getAttribute("class") ?? "";
              if (cls.includes("dz-quote--editorial")) return "editorial";
              if (cls.includes("dz-quote--heritage")) return "heritage";
              return null;
            },
            renderHTML: (attributes) => {
              if (!attributes.dzQuoteVariant) return {};
              return { class: `dz-quote dz-quote--${attributes.dzQuoteVariant}` };
            },
          },
        },
      },
      {
        types: ["bulletList"],
        attributes: {
          dzVariant: {
            default: null,
            parseHTML: (element) =>
              element.classList.contains("dz-list--leaf")
                ? "leaf"
                : element.classList.contains("dz-list--check")
                  ? "check"
                  : element.classList.contains("dz-list--cross")
                    ? "cross"
                    : null,
            renderHTML: (attributes) =>
              attributes.dzVariant === "leaf"
                ? { class: "dz-list--leaf" }
                : attributes.dzVariant === "check"
                  ? { class: "dz-list--check" }
                  : attributes.dzVariant === "cross"
                    ? { class: "dz-list--cross" }
                    : {},
          },
        },
      },
      {
        types: ["orderedList"],
        attributes: {
          dzVariant: {
            default: null,
            parseHTML: (element) =>
              element.classList.contains("dz-list--steps") ? "steps" : null,
            renderHTML: (attributes) =>
              attributes.dzVariant === "steps" ? { class: "dz-list--steps" } : {},
          },
        },
      },
    ];
  },
});
