"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { ImagePlus, Trash2, ChevronRight, ChevronLeft, Images } from "lucide-react";
import { MediaPickerDialog } from "@/components/admin/media/MediaPickerDialog";

export type GalleryItem = {
  id: string | null;
  src: string;
  alt: string;
  caption: string;
  width?: number | null;
  height?: number | null;
};

const LAYOUTS = [
  { key: "grid-2", label: "۲ ستونه" },
  { key: "grid-3", label: "۳ ستونه" },
  { key: "featured", label: "تصویر شاخص" },
  { key: "scroll-mobile", label: "اسکرول موبایل" },
] as const;

/** In-editor view for an image gallery / album (dz-gallery). Multi-select from
 * the Media Library, reorder, remove, per-image caption, layout picker. */
export function MediaGalleryView({ node, updateAttributes, deleteNode, editor }: NodeViewProps) {
  const [pick, setPick] = useState(false);
  const items: GalleryItem[] = Array.isArray(node.attrs.items) ? node.attrs.items : [];
  const layout = typeof node.attrs.layout === "string" ? node.attrs.layout : "grid-3";
  const title = typeof node.attrs.title === "string" ? node.attrs.title : "";
  const editable = editor.isEditable;

  const setItems = (next: GalleryItem[]) => updateAttributes({ items: next });

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };
  const removeAt = (i: number) => setItems(items.filter((_, k) => k !== i));
  const setCaption = (i: number, caption: string) =>
    setItems(items.map((it, k) => (k === i ? { ...it, caption } : it)));
  const setAlt = (i: number, alt: string) =>
    setItems(items.map((it, k) => (k === i ? { ...it, alt } : it)));

  return (
    <NodeViewWrapper
      as="figure"
      className={`dz-media dz-gallery dz-gallery--${layout} dz-gallery--editing`}
      contentEditable={false}
      dir="rtl"
    >
      {editable && (
        <div className="dz-gallery__bar mb-2 flex flex-wrap items-center gap-2" contentEditable={false}>
          <Images className="size-4 shrink-0 text-dz-a-primary-500 dark:text-dz-a-night-muted" aria-hidden />
          <input
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            placeholder="عنوان گالری (اختیاری)"
            aria-label="عنوان گالری"
            className="min-w-0 flex-1 rounded-lg border border-dz-a-primary-200 bg-white px-2 py-1 text-xs font-medium text-dz-a-primary-900 outline-none focus:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
          />
          <select
            value={layout}
            onChange={(e) => updateAttributes({ layout: e.target.value })}
            title="چیدمان گالری"
            aria-label="چیدمان گالری"
            className="focus-ring h-7 rounded-lg border border-dz-a-primary-200 bg-white px-1.5 text-xs text-dz-a-primary-700 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
          >
            {LAYOUTS.map((l) => (
              <option key={l.key} value={l.key}>
                {l.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setPick(true)}
            className="focus-ring inline-flex items-center gap-1 rounded-lg border border-dz-a-primary-200 px-2 py-1 text-xs font-medium text-dz-a-primary-700 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
          >
            <ImagePlus className="size-3.5" /> افزودن تصاویر
          </button>
          <button
            type="button"
            onClick={deleteNode}
            title="حذف گالری"
            aria-label="حذف گالری"
            className="focus-ring inline-flex size-7 items-center justify-center rounded-lg text-dz-a-error/80 hover:bg-dz-a-error/10 dark:text-dz-a-error-300"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}

      {items.length === 0 ? (
        editable ? (
          <button
            type="button"
            onClick={() => setPick(true)}
            className="focus-ring flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-dz-a-primary-300 bg-dz-a-primary-50/40 px-4 py-8 text-sm text-dz-a-primary-500 hover:border-dz-a-primary-400 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:bg-white/2 dark:text-dz-a-night-muted"
          >
            <Images className="size-6" /> افزودن تصاویر از کتابخانه‌ی رسانه
          </button>
        ) : null
      ) : editable ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {items.map((it, i) => (
            <li
              key={`${it.id ?? it.src}-${i}`}
              className="flex flex-col gap-1 rounded-lg border border-dz-a-primary-100 bg-white p-1.5 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated"
            >
              <img src={it.src} alt={it.alt} className="h-20 w-full rounded object-cover" />
              <input
                value={it.caption}
                onChange={(e) => setCaption(i, e.target.value)}
                placeholder="کپشن"
                aria-label={`کپشن تصویر ${i + 1}`}
                className="w-full rounded border border-dz-a-primary-100 bg-white px-1.5 py-0.5 text-[11px] text-dz-a-primary-800 outline-none focus:border-dz-a-primary-400 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"
              />
              <input
                value={it.alt}
                onChange={(e) => setAlt(i, e.target.value)}
                placeholder="alt"
                aria-label={`متن جایگزین تصویر ${i + 1}`}
                className="w-full rounded border border-dz-a-primary-100 bg-white px-1.5 py-0.5 text-[11px] text-dz-a-primary-700 outline-none focus:border-dz-a-primary-400 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  title="جابه‌جایی به بعد"
                  aria-label="جابه‌جایی به بعد"
                  className="focus-ring rounded p-0.5 text-dz-a-primary-500 disabled:opacity-30 dark:text-dz-a-night-muted"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  title="حذف تصویر"
                  aria-label="حذف تصویر"
                  className="focus-ring rounded p-0.5 text-dz-a-error/80 hover:bg-dz-a-error/10 dark:text-dz-a-error-300"
                >
                  <Trash2 className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  title="جابه‌جایی به قبل"
                  aria-label="جابه‌جایی به قبل"
                  className="focus-ring rounded p-0.5 text-dz-a-primary-500 disabled:opacity-30 dark:text-dz-a-night-muted"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <MediaPickerDialog
        open={pick}
        usage="GENERAL"
        multiple
        onClose={() => setPick(false)}
        onPickMany={(assets) => {
          const additions: GalleryItem[] = assets
            .filter((a) => !items.some((it) => it.id === a.id))
            .map((a) => ({
              id: a.id,
              src: a.url,
              alt: a.alt || a.originalName || "",
              caption: a.caption || "",
              width: a.width,
              height: a.height,
            }));
          setItems([...items, ...additions]);
          setPick(false);
        }}
      />
    </NodeViewWrapper>
  );
}
