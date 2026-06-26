"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { ImagePlus, Replace, Trash2, X } from "lucide-react";
import { MediaPickerDialog } from "@/components/admin/media/MediaPickerDialog";
import { CARD_VARIANTS, CARD_VARIANT_LABELS, type CardVariant } from "./structured-extensions";

const inputCls =
  "w-full rounded-lg border border-dz-primary-200 bg-white px-2.5 py-1.5 text-sm text-dz-primary-900 outline-none focus:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg";

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** In-editor view for the card block (dz-card). Image comes from Media Library. */
export function CardView({ node, updateAttributes, deleteNode, editor }: NodeViewProps) {
  const [pick, setPick] = useState(false);
  const a = node.attrs;
  const variant = str(a.variant) || "origin";
  const src = str(a.src);
  const editable = editor.isEditable;

  return (
    <NodeViewWrapper
      as="div"
      className="dz-card--editing my-4 rounded-xl border border-dz-primary-200 bg-dz-primary-50/30 p-3 dark:border-dz-night-border dark:bg-white/2"
      contentEditable={false}
      dir="rtl"
    >
      <div className="mb-2 flex items-center gap-2">
        <select
          value={variant}
          disabled={!editable}
          onChange={(e) => updateAttributes({ variant: e.target.value as CardVariant })}
          aria-label="نوع کارت"
          className="focus-ring h-8 rounded-lg border border-dz-primary-200 bg-white px-2 text-xs font-medium text-dz-primary-700 outline-none dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg"
        >
          {CARD_VARIANTS.map((v) => (
            <option key={v} value={v}>
              {CARD_VARIANT_LABELS[v]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={deleteNode}
          title="حذف کارت"
          aria-label="حذف کارت"
          className="focus-ring ms-auto inline-flex size-7 items-center justify-center rounded-lg text-dz-error/80 hover:bg-dz-error/10 dark:text-dz-error-300"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {/* image */}
        {src ? (
          <div className="relative overflow-hidden rounded-lg border border-dz-primary-100 dark:border-dz-night-line">
            <img src={src} alt={str(a.alt)} className="h-32 w-full object-cover" />
            <div className="absolute end-1.5 top-1.5 flex gap-1">
              <button
                type="button"
                onClick={() => setPick(true)}
                title="تعویض تصویر"
                aria-label="تعویض تصویر"
                className="focus-ring inline-flex size-7 items-center justify-center rounded-lg bg-white/90 text-dz-primary-700 hover:bg-white dark:bg-dz-night-card/90 dark:text-dz-night-fg"
              >
                <Replace className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => updateAttributes({ mediaId: null, src: "", alt: "" })}
                title="حذف تصویر"
                aria-label="حذف تصویر"
                className="focus-ring inline-flex size-7 items-center justify-center rounded-lg bg-white/90 text-dz-error hover:bg-white dark:bg-dz-night-card/90 dark:text-dz-error-300"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        ) : (
          editable && (
            <button
              type="button"
              onClick={() => setPick(true)}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-dz-primary-300 bg-white px-3 py-4 text-xs text-dz-primary-500 hover:bg-dz-primary-50 dark:border-dz-night-border dark:bg-dz-night-card dark:text-dz-night-muted dark:hover:bg-white/5"
            >
              <ImagePlus className="size-4" /> افزودن تصویر (اختیاری)
            </button>
          )
        )}

        <input
          value={str(a.eyebrow)}
          disabled={!editable}
          onChange={(e) => updateAttributes({ eyebrow: e.target.value })}
          placeholder="روتیتر (اختیاری) — مثلاً «خاستگاه»"
          aria-label="روتیتر کارت"
          className={`${inputCls} text-xs`}
        />
        <input
          value={str(a.title)}
          disabled={!editable}
          onChange={(e) => updateAttributes({ title: e.target.value })}
          placeholder="عنوان کارت"
          aria-label="عنوان کارت"
          className={`${inputCls} font-medium`}
        />
        <textarea
          value={str(a.text)}
          disabled={!editable}
          onChange={(e) => updateAttributes({ text: e.target.value })}
          placeholder="متن کارت…"
          aria-label="متن کارت"
          rows={2}
          className={`${inputCls} resize-y`}
        />
        <div className="grid gap-1.5 sm:grid-cols-2">
          <input
            value={str(a.linkLabel)}
            disabled={!editable}
            onChange={(e) => updateAttributes({ linkLabel: e.target.value })}
            placeholder="متن دکمه (اختیاری)"
            aria-label="متن دکمه کارت"
            className={`${inputCls} text-xs`}
          />
          <input
            value={str(a.href)}
            disabled={!editable}
            onChange={(e) => updateAttributes({ href: e.target.value })}
            placeholder="/products یا https://…"
            aria-label="نشانی لینک کارت"
            dir="ltr"
            className={`${inputCls} text-xs`}
          />
        </div>
      </div>

      <MediaPickerDialog
        open={pick}
        usage="BLOG"
        onClose={() => setPick(false)}
        onPick={(asset) => {
          updateAttributes({
            mediaId: asset.id,
            src: asset.url,
            alt: str(a.alt) || asset.alt || asset.originalName || "",
          });
          setPick(false);
        }}
      />
    </NodeViewWrapper>
  );
}
