"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import {
  ImagePlus,
  Replace,
  Trash2,
  AlignCenter,
  AlignRight,
  AlignLeft,
  Maximize2,
  Link as LinkIcon,
  Unlink,
  GripVertical,
} from "lucide-react";
import { MediaPickerDialog } from "@/components/admin/media/MediaPickerDialog";

const ALIGNS = [
  { key: "center", label: "وسط", Icon: AlignCenter },
  { key: "right", label: "راست", Icon: AlignRight },
  { key: "left", label: "چپ", Icon: AlignLeft },
  { key: "wide", label: "تمام‌عرض", Icon: Maximize2 },
] as const;

/** In-editor view for a single image block (dz-media--image). */
export function MediaImageView({ node, updateAttributes, deleteNode, editor }: NodeViewProps) {
  const [pick, setPick] = useState(false);
  const src = typeof node.attrs.src === "string" ? node.attrs.src : "";
  const alt = typeof node.attrs.alt === "string" ? node.attrs.alt : "";
  const caption = typeof node.attrs.caption === "string" ? node.attrs.caption : "";
  const href = typeof node.attrs.href === "string" ? node.attrs.href : "";
  const align = typeof node.attrs.align === "string" ? node.attrs.align : "center";
  const editable = editor.isEditable;

  const setLink = () => {
    const input = window.prompt("نشانی پیوند تصویر (اختیاری، https://…)", href || "https://");
    if (input === null) return;
    updateAttributes({ href: input.trim() || null });
  };

  return (
    <NodeViewWrapper
      as="figure"
      className={`dz-media dz-media--image dz-media--${align} dz-media--editing`}
      contentEditable={false}
      dir="rtl"
    >
      {src ? (
        <div className="relative">
          <img src={src} alt={alt} className="block w-full" />

          {/* Caption overlay — bottom-right of image */}
          {caption && (
            <span className="pointer-events-none absolute bottom-0 inset-e-0 m-2 max-w-[70%] rounded-lg bg-black/60 px-2 py-1 text-end text-xs leading-5 text-white backdrop-blur-sm">
              {caption}
            </span>
          )}

          {/* Drag handle — visible on hover in editor */}
          {editable && (
            <div
              data-drag-handle
              className="absolute inset-s-0 top-1/2 -translate-y-1/2 -translate-x-full cursor-grab rounded-s-lg bg-white/80 px-1 py-2 shadow-sm dark:bg-dz-a-night-elevated/80"
              title="بکش تا جابه‌جا کنی"
            >
              <GripVertical className="size-4 text-dz-a-primary-400" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => editable && setPick(true)}
          className="dz-media__placeholder focus-ring flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-dz-a-primary-300 bg-dz-a-primary-50/40 px-4 py-8 text-sm text-dz-a-primary-500 transition-colors hover:border-dz-a-primary-400 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:bg-white/2 dark:text-dz-a-night-muted"
        >
          <ImagePlus className="size-6" />
          انتخاب تصویر از کتابخانه‌ی رسانه
        </button>
      )}

      {/* Static figcaption for non-editing mode */}
      {caption && !editable && <figcaption>{caption}</figcaption>}

      {/* Controls — edit mode only */}
      {editable && (
        <div className="dz-media__controls mt-2 flex flex-col gap-2" contentEditable={false}>
          {/* Toolbar row */}
          <div className="flex flex-wrap items-center gap-1">
            {src && (
              <button
                type="button"
                onClick={() => setPick(true)}
                title="تعویض تصویر"
                aria-label="تعویض تصویر"
                className="focus-ring inline-flex items-center gap-1 rounded-lg border border-dz-a-primary-200 px-2 py-1 text-xs text-dz-a-primary-700 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
              >
                <Replace className="size-3.5" /> تعویض
              </button>
            )}
            <span className="mx-0.5 h-5 w-px bg-dz-a-primary-100 dark:bg-dz-a-night-border" aria-hidden />
            {ALIGNS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => updateAttributes({ align: key })}
                title={`چیدمان: ${label}`}
                aria-label={`چیدمان ${label}`}
                aria-pressed={align === key}
                className={`focus-ring inline-flex size-7 items-center justify-center rounded-lg transition-colors ${
                  align === key
                    ? "bg-dz-a-primary-100 text-dz-a-primary-800 dark:bg-dz-a-primary-500/25 dark:text-dz-a-night-fg"
                    : "text-dz-a-primary-600 hover:bg-dz-a-primary-50 dark:text-dz-a-night-muted dark:hover:bg-white/5"
                }`}
              >
                <Icon className="size-3.5" />
              </button>
            ))}
            <span className="mx-0.5 h-5 w-px bg-dz-a-primary-100 dark:bg-dz-a-night-border" aria-hidden />
            <button
              type="button"
              onClick={setLink}
              title={href ? "ویرایش پیوند" : "افزودن پیوند"}
              aria-label="پیوند تصویر"
              aria-pressed={Boolean(href)}
              className={`focus-ring inline-flex size-7 items-center justify-center rounded-lg transition-colors ${
                href
                  ? "bg-dz-a-primary-100 text-dz-a-primary-800 dark:bg-dz-a-primary-500/25 dark:text-dz-a-night-fg"
                  : "text-dz-a-primary-600 hover:bg-dz-a-primary-50 dark:text-dz-a-night-muted dark:hover:bg-white/5"
              }`}
            >
              <LinkIcon className="size-3.5" />
            </button>
            {href && (
              <button
                type="button"
                onClick={() => updateAttributes({ href: null })}
                title="حذف پیوند"
                aria-label="حذف پیوند"
                className="focus-ring inline-flex size-7 items-center justify-center rounded-lg text-dz-a-primary-600 hover:bg-dz-a-primary-50 dark:text-dz-a-night-muted dark:hover:bg-white/5"
              >
                <Unlink className="size-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={deleteNode}
              title="حذف تصویر"
              aria-label="حذف تصویر"
              className="focus-ring ms-auto inline-flex size-7 items-center justify-center rounded-lg text-dz-a-error/80 hover:bg-dz-a-error/10 dark:text-dz-a-error-300"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>

          {/* Alt + Caption inputs */}
          {src && (
            <div className="grid gap-1.5 sm:grid-cols-2">
              <input
                value={alt}
                onChange={(e) => updateAttributes({ alt: e.target.value })}
                placeholder="متن جایگزین (alt)"
                aria-label="متن جایگزین تصویر"
                className="rounded-lg border border-dz-a-primary-200 bg-white px-2 py-1 text-xs text-dz-a-primary-900 outline-none focus:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
              />
              <input
                value={caption}
                onChange={(e) => updateAttributes({ caption: e.target.value })}
                placeholder="کپشن (اختیاری)"
                aria-label="کپشن تصویر"
                className="rounded-lg border border-dz-a-primary-200 bg-white px-2 py-1 text-xs text-dz-a-primary-900 outline-none focus:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
              />
            </div>
          )}
        </div>
      )}

      <MediaPickerDialog
        open={pick}
        usage="GENERAL"
        onClose={() => setPick(false)}
        onPick={(asset) => {
          updateAttributes({
            mediaId: asset.id,
            src: asset.url,
            // Don't use filename as alt — let admin enter meaningful alt text
            alt: alt || asset.alt || "",
            caption: caption || asset.caption || "",
            width: asset.width ?? null,
            height: asset.height ?? null,
          });
          setPick(false);
        }}
      />
    </NodeViewWrapper>
  );
}
