// ============================================================
// Media TipTap nodes (ADMIN-RICH-MEDIA-CP1): single image + gallery/album.
//
// Both are atom block nodes whose data lives in `rendered: false` attributes
// (so nothing leaks onto the root element); the node's own renderHTML emits the
// semantic, sanitizer-friendly markup, and parseHTML rebuilds the attributes:
//
//   image   → <figure class="dz-media dz-media--image dz-media--{align}" data-media-id>
//               <a?><img src alt loading width height></a?><figcaption?>
//   gallery → <figure class="dz-media dz-gallery dz-gallery--{layout}">
//               <figcaption.dz-gallery__title?> + <figure.dz-gallery__item data-media-id>…
//
// Editing is handled by the React NodeViews (MediaImageView / MediaGalleryView),
// which source every image from the existing Media Library (no manual URLs).
// ============================================================

import { Node, ReactNodeViewRenderer, mergeAttributes } from "@tiptap/react";
import { MediaImageView } from "./MediaImageView";
import { MediaGalleryView } from "./MediaGalleryView";

const IMAGE_ALIGNS = ["center", "right", "left", "wide"];
const GALLERY_LAYOUTS = ["grid-2", "grid-3", "featured", "scroll-mobile"];

/** Single image block. */
export const DashtzadImage = Node.create({
  name: "dzImage",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      mediaId: { default: null, rendered: false },
      src: { default: "", rendered: false },
      alt: { default: "", rendered: false },
      caption: { default: "", rendered: false },
      href: { default: null, rendered: false },
      align: { default: "center", rendered: false },
      width: { default: null, rendered: false },
      height: { default: null, rendered: false },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure.dz-media--image",
        getAttrs: (el) => {
          const img = el.querySelector("img");
          const a = el.querySelector("a");
          const cap = el.querySelector(":scope > figcaption");
          const cls = el.getAttribute("class") ?? "";
          const am = cls.match(/dz-media--(center|right|left|wide)/);
          const w = img?.getAttribute("width");
          const h = img?.getAttribute("height");
          return {
            mediaId: el.getAttribute("data-media-id"),
            src: img?.getAttribute("src") ?? "",
            alt: img?.getAttribute("alt") ?? "",
            caption: cap?.textContent?.trim() ?? "",
            href: a?.getAttribute("href") ?? null,
            align: am ? am[1] : "center",
            width: w ? Number(w) : null,
            height: h ? Number(h) : null,
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const src = typeof node.attrs.src === "string" ? node.attrs.src : "";
    const alt = typeof node.attrs.alt === "string" ? node.attrs.alt : "";
    const caption = typeof node.attrs.caption === "string" ? node.attrs.caption.trim() : "";
    const href = typeof node.attrs.href === "string" ? node.attrs.href.trim() : "";
    const align = IMAGE_ALIGNS.includes(node.attrs.align) ? node.attrs.align : "center";
    const mediaId = typeof node.attrs.mediaId === "string" ? node.attrs.mediaId : "";

    const imgAttrs: Record<string, string> = { src, alt, loading: "lazy" };
    if (node.attrs.width) imgAttrs.width = String(node.attrs.width);
    if (node.attrs.height) imgAttrs.height = String(node.attrs.height);

    const figAttrs: Record<string, string> = { class: `dz-media dz-media--image dz-media--${align}` };
    if (mediaId) figAttrs["data-media-id"] = mediaId;

    const imgEl = href ? ["a", { href }, ["img", imgAttrs]] : ["img", imgAttrs];

    return [
      "figure",
      mergeAttributes(HTMLAttributes, figAttrs),
      imgEl,
      ...(caption ? [["figcaption", {}, caption]] : []),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaImageView);
  },
});

/** Image gallery / album block. */
export const DashtzadGallery = Node.create({
  name: "dzGallery",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      items: { default: [], rendered: false },
      layout: { default: "grid-3", rendered: false },
      title: { default: "", rendered: false },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure.dz-gallery",
        getAttrs: (el) => {
          const cls = el.getAttribute("class") ?? "";
          const lm = cls.match(/dz-gallery--(grid-2|grid-3|featured|scroll-mobile)/);
          const titleEl = el.querySelector(":scope > .dz-gallery__title");
          const items = Array.from(el.querySelectorAll(":scope > figure.dz-gallery__item"))
            .map((item) => {
              const img = item.querySelector("img");
              const cap = item.querySelector(":scope > figcaption");
              const w = img?.getAttribute("width");
              const h = img?.getAttribute("height");
              return {
                id: item.getAttribute("data-media-id"),
                src: img?.getAttribute("src") ?? "",
                alt: img?.getAttribute("alt") ?? "",
                caption: cap?.textContent?.trim() ?? "",
                width: w ? Number(w) : null,
                height: h ? Number(h) : null,
              };
            })
            .filter((it) => it.src);
          return { layout: lm ? lm[1] : "grid-3", title: titleEl?.textContent?.trim() ?? "", items };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const layout = GALLERY_LAYOUTS.includes(node.attrs.layout) ? node.attrs.layout : "grid-3";
    const title = typeof node.attrs.title === "string" ? node.attrs.title.trim() : "";
    const items = Array.isArray(node.attrs.items) ? node.attrs.items : [];

    const itemEls = items
      .filter((it) => it && typeof it.src === "string" && it.src)
      .map((it) => {
        const imgAttrs: Record<string, string> = {
          src: it.src,
          alt: typeof it.alt === "string" ? it.alt : "",
          loading: "lazy",
        };
        if (it.width) imgAttrs.width = String(it.width);
        if (it.height) imgAttrs.height = String(it.height);
        const itemAttrs: Record<string, string> = { class: "dz-gallery__item" };
        if (it.id) itemAttrs["data-media-id"] = String(it.id);
        const cap = typeof it.caption === "string" ? it.caption.trim() : "";
        return ["figure", itemAttrs, ["img", imgAttrs], ...(cap ? [["figcaption", {}, cap]] : [])];
      });

    return [
      "figure",
      mergeAttributes(HTMLAttributes, { class: `dz-media dz-gallery dz-gallery--${layout}` }),
      ...(title ? [["figcaption", { class: "dz-gallery__title" }, title]] : []),
      ...itemEls,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaGalleryView);
  },
});
