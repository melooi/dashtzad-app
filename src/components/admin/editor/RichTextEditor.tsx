"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Eye, Code2, ShieldAlert } from "lucide-react";
import { buildEditorExtensions, EDITOR_CONTENT_CLASS } from "./editor-utils";
import { RichTextToolbar } from "./RichTextToolbar";
import { HtmlSourceEditor } from "./HtmlSourceEditor";
import { sanitizeRichHtml, toEditorHtml } from "@/lib/richtext/sanitize";

export type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
  error?: boolean;
  mode?: "visual" | "code";
  /** id of the field label, for accessible naming of the editable surface. */
  ariaLabelledBy?: string;
  /** ArticleType (CONTENT-CP1) — surfaces this type's recommended blocks. */
  articleType?: string | null;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 200,
  disabled = false,
  error = false,
  mode: initialMode = "visual",
  ariaLabelledBy,
  articleType,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "code">(initialMode);
  const [notice, setNotice] = useState<string | null>(null);
  // Remembers the last HTML we emitted, so the value→editor sync effect can tell
  // our own change (echoed back through the form) from a real external change.
  const lastEmitted = useRef<string>(toEditorHtml(value));

  const editor = useEditor({
    extensions: buildEditorExtensions(placeholder),
    content: toEditorHtml(value),
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: EDITOR_CONTENT_CLASS,
        dir: "rtl",
        spellcheck: "false",
        ...(ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {}),
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.isEmpty ? "" : e.getHTML();
      lastEmitted.current = html;
      onChange(html);
    },
  });

  // Keep editable state in sync with the disabled prop.
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  // External value change (e.g. react-hook-form reset on load/save) → reload.
  useEffect(() => {
    if (!editor || mode !== "visual") return;
    if (value === lastEmitted.current) return; // our own change, ignore
    const incoming = toEditorHtml(value);
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (incoming !== current) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
    lastEmitted.current = value;
  }, [value, editor, mode]);

  const switchToCode = useCallback(() => {
    setNotice(null);
    if (editor) {
      const html = editor.isEmpty ? "" : editor.getHTML();
      lastEmitted.current = html;
      onChange(html);
    }
    setMode("code");
  }, [editor, onChange]);

  const switchToVisual = useCallback(() => {
    const clean = sanitizeRichHtml(value);
    setNotice(clean !== value ? "محتوای ناایمن یا نامعتبر هنگام بازگشت به نمای دیداری پاک‌سازی شد." : null);
    lastEmitted.current = clean;
    onChange(clean);
    if (editor) editor.commands.setContent(toEditorHtml(clean), { emitUpdate: false });
    setMode("visual");
  }, [editor, value, onChange]);

  const shellClass = `overflow-hidden rounded-xl border bg-white shadow-xs transition-[box-shadow,border-color] focus-within:ring-3 dark:bg-dz-a-night-card dark:shadow-none ${
    error
      ? "border-dz-a-error focus-within:border-dz-a-error focus-within:ring-dz-a-error/15 dark:border-dz-a-error/70 dark:focus-within:ring-dz-a-error/25"
      : "border-dz-a-primary-200 focus-within:border-dz-a-primary-500 focus-within:ring-dz-a-primary-500/15 dark:border-dz-a-night-border dark:focus-within:border-dz-a-primary-400 dark:focus-within:ring-dz-a-primary-400/25"
  } ${disabled ? "pointer-events-none opacity-60" : ""}`;

  const segBtn = (active: boolean) =>
    `focus-ring inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
      active
        ? "bg-white text-dz-a-primary-800 shadow-xs dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
        : "text-dz-a-primary-500 hover:text-dz-a-primary-700 dark:text-dz-a-night-muted dark:hover:text-dz-a-night-fg"
    }`;

  return (
    <div className={shellClass}>
      {/* bar: toolbar (visual) / hint (code) + mode toggle */}
      <div className="flex items-start justify-between gap-2 border-b border-dz-a-primary-100 bg-dz-a-primary-50/40 px-1.5 py-1.5 dark:border-dz-a-night-border dark:bg-white/2">
        <div className="min-w-0 flex-1">
          {mode === "visual" && editor ? (
            <RichTextToolbar editor={editor} articleType={articleType} />
          ) : (
            <p className="px-1.5 py-2 text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">
              حالت کد — ویرایش مستقیم HTML (هنگام ذخیره و بازگشت پاک‌سازی می‌شود)
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5 self-start rounded-lg border border-dz-a-primary-200 p-0.5 dark:border-dz-a-night-border">
          <button type="button" onClick={switchToVisual} className={segBtn(mode === "visual")} aria-pressed={mode === "visual"}>
            <Eye className="size-3.5" />
            <span className="hidden sm:inline">دیداری</span>
          </button>
          <button type="button" onClick={switchToCode} className={segBtn(mode === "code")} aria-pressed={mode === "code"}>
            <Code2 className="size-3.5" />
            <span className="hidden sm:inline">کد</span>
          </button>
        </div>
      </div>

      {/* content */}
      {mode === "visual" ? (
        <div
          className="cursor-text px-4 py-3"
          style={{ minHeight }}
          onClick={() => editor?.chain().focus().run()}
        >
          <EditorContent editor={editor} />
        </div>
      ) : (
        <HtmlSourceEditor
          value={value}
          onChange={onChange}
          onBlur={() => {
            const clean = sanitizeRichHtml(value);
            if (clean !== value) onChange(clean);
          }}
          disabled={disabled}
          minHeight={minHeight}
        />
      )}

      {notice && (
        <div className="flex items-center gap-1.5 border-t border-dz-a-warning/30 bg-dz-a-warning/10 px-3 py-1.5 text-xs text-dz-a-warning dark:border-dz-a-warning-300/30 dark:bg-dz-a-warning-300/10 dark:text-dz-a-warning-300">
          <ShieldAlert className="size-3.5 shrink-0" />
          {notice}
        </div>
      )}
    </div>
  );
}
