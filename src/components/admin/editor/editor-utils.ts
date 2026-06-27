// ============================================================
// Editor configuration helpers (ADMIN-RICH-EDITOR-CP1).
// Builds the TipTap extension set, constrained to the sanitizer allowlist:
// only paragraph / h2-h3 / bold / italic / underline / link / lists /
// blockquote (Dashtzad variants) / callout / divider. No code, no strike,
// no images — anything the editor can't produce, the sanitizer would strip.
// ============================================================

import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension } from "@tiptap/core";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import { Callout, DashtzadAttributes, DashtzadSpeechQuote } from "./extensions";
import { DashtzadImage, DashtzadGallery } from "./media-extensions";
import { DashtzadTimeline, DashtzadFaq, DashtzadCard } from "./structured-extensions";

// Ctrl+Alt+1-6 for H1-H6, Ctrl+Alt+0 for paragraph (mirrors WP / Rank Math shortcuts)
const DashtzadKeyboardShortcuts = Extension.create({
  name: "dashtzadKeyboardShortcuts",
  addKeyboardShortcuts() {
    return {
      "Mod-Alt-1": () => this.editor.commands.toggleHeading({ level: 1 }),
      "Mod-Alt-2": () => this.editor.commands.toggleHeading({ level: 2 }),
      "Mod-Alt-3": () => this.editor.commands.toggleHeading({ level: 3 }),
      "Mod-Alt-4": () => this.editor.commands.toggleHeading({ level: 4 }),
      "Mod-Alt-5": () => this.editor.commands.toggleHeading({ level: 5 }),
      "Mod-Alt-6": () => this.editor.commands.toggleHeading({ level: 6 }),
      "Mod-Alt-0": () => this.editor.commands.setParagraph(),
      "Mod-Shift-Period": () => this.editor.commands.toggleBlockquote(),
    };
  },
});

/** Class applied to the editable surface so it shares the public `.dz-rich` look. */
export const EDITOR_CONTENT_CLASS = "dz-rich dz-rich--editing";

export const DEFAULT_PLACEHOLDER = "متن خود را اینجا بنویسید…";

/** The TipTap extensions powering both the visual editor and paste cleanup. */
export function buildEditorExtensions(placeholder?: string) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      // Outside the allowlist → disable so the editor never produces them.
      code: false,
      codeBlock: false,
      strike: false,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https", "mailto", "tel"],
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      },
      // underline stays enabled (StarterKit default).
    }),
    Placeholder.configure({
      placeholder: placeholder || DEFAULT_PLACEHOLDER,
      showOnlyWhenEditable: true,
    }),
    DashtzadAttributes,
    Callout,
    DashtzadSpeechQuote,
    DashtzadImage,
    DashtzadGallery,
    // Table (CONTENT-CP1) — resizing off so no data-colwidth (sanitizer-safe).
    Table.configure({ resizable: false, HTMLAttributes: { class: "dz-table" } }),
    TableRow,
    TableHeader,
    TableCell,
    // Structured magazine blocks (CONTENT-CP1).
    DashtzadTimeline,
    DashtzadFaq,
    DashtzadCard,
    // Heading & paragraph keyboard shortcuts (Ctrl/Cmd+Alt+1-6, +0, Shift+.).
    DashtzadKeyboardShortcuts,
  ];
}
