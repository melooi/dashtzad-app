"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Check, ImageOff } from "lucide-react";
import type { MediaAssetDTO } from "@/lib/admin/media";
import type { MediaUsage } from "@/generated/prisma/client";
import { searchMedia } from "@/lib/admin/media-actions";
import { MEDIA_USAGE_LABELS } from "@/lib/media/shared";
import { toPersianNumbers } from "@/lib/price";
import { MediaGrid } from "./MediaGrid";
import { MediaUploader } from "./MediaUploader";

/** Modal asset browser used by MediaPicker. Search + upload + select.
 * `multiple` enables additive multi-select for gallery blocks (non-breaking:
 * single-select callers keep using `onPick`). */
export function MediaPickerDialog({
  open,
  usage,
  multiple = false,
  onClose,
  onPick,
  onPickMany,
}: {
  open: boolean;
  usage?: MediaUsage;
  multiple?: boolean;
  onClose: () => void;
  onPick?: (asset: MediaAssetDTO) => void;
  onPickMany?: (assets: MediaAssetDTO[]) => void;
}) {
  const [assets, setAssets] = useState<MediaAssetDTO[]>([]);
  const [q, setQ] = useState("");
  const [scopeUsage, setScopeUsage] = useState(Boolean(usage));
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MediaAssetDTO | null>(null);
  const [multiSelected, setMultiSelected] = useState<MediaAssetDTO[]>([]);

  // (Re)load when opened or when search/scope change (debounced).
  useEffect(() => {
    if (!open) return;
    let active = true;
    const handle = setTimeout(async () => {
      if (!active) return;
      setLoading(true);
      const rows = await searchMedia({
        q: q.trim() || undefined,
        usage: scopeUsage ? usage : undefined,
      });
      if (active) {
        setAssets(rows);
        setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [open, q, scopeUsage, usage]);

  // Reset transient state on close.
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setSelected(null);
        setMultiSelected([]);
        setQ("");
      }, 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  const onUploaded = (asset: MediaAssetDTO) => {
    setAssets((list) => [asset, ...list.filter((a) => a.id !== asset.id)]);
    if (multiple) {
      setMultiSelected((cur) => (cur.some((x) => x.id === asset.id) ? cur : [...cur, asset]));
    } else {
      setSelected(asset);
    }
  };

  const toggleAsset = (a: MediaAssetDTO) => {
    if (multiple) {
      setMultiSelected((cur) =>
        cur.some((x) => x.id === a.id) ? cur.filter((x) => x.id !== a.id) : [...cur, a],
      );
    } else {
      setSelected(a);
    }
  };

  const confirm = () => {
    if (multiple) {
      if (multiSelected.length > 0) onPickMany?.(multiSelected);
    } else if (selected) {
      onPick?.(selected);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-dz-a-primary-900/50 p-4 backdrop-blur-sm dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-label="انتخاب از کتابخانه‌ی رسانه"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-dz-a-primary-100 bg-white shadow-2xl dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dz-a-primary-100 px-4 py-3 dark:border-dz-a-night-border">
          <h2 className="font-heading text-sm font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">کتابخانه‌ی رسانه</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="focus-ring rounded-lg p-1.5 text-dz-a-primary-400 hover:bg-dz-a-primary-50 hover:text-dz-a-primary-700 dark:text-dz-a-night-faint dark:hover:bg-white/5 dark:hover:text-dz-a-night-fg"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 border-b border-dz-a-primary-100 px-4 py-3 dark:border-dz-a-night-border">
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجو…"
              aria-label="جستجوی رسانه"
              className="w-full rounded-xl border border-dz-a-primary-200 bg-white px-3.5 py-2 text-sm text-dz-a-primary-900 outline-none placeholder:text-dz-a-primary-300 focus:border-dz-a-primary-500 focus:ring-3 focus:ring-dz-a-primary-500/15 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg dark:placeholder:text-dz-a-night-faint"
            />
            {usage && (
              <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-dz-a-primary-600 dark:text-dz-a-night-muted">
                <input type="checkbox" checked={scopeUsage} onChange={(e) => setScopeUsage(e.target.checked)} className="size-3.5 accent-dz-a-primary-600" />
                فقط «{MEDIA_USAGE_LABELS[usage]}»
              </label>
            )}
          </div>
          <MediaUploader compact usage={usage} onUploaded={onUploaded} />
        </div>

        {/* Body */}
        <div className="min-h-[200px] flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-dz-a-primary-400 dark:text-dz-a-night-faint">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-sm text-dz-a-primary-400 dark:text-dz-a-night-faint">
              <ImageOff className="size-7" />
              رسانه‌ای یافت نشد. از کادر بالا یک تصویر آپلود کنید.
            </div>
          ) : (
            <MediaGrid
              assets={assets}
              selectedId={selected?.id ?? null}
              selectedIds={multiple ? multiSelected.map((a) => a.id) : undefined}
              view="grid"
              picking
              onSelect={toggleAsset}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-dz-a-primary-100 px-4 py-3 dark:border-dz-a-night-border">
          <span className="truncate text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint" dir="ltr">
            {multiple
              ? multiSelected.length > 0
                ? `${toPersianNumbers(multiSelected.length)} تصویر انتخاب شد`
                : ""
              : selected
                ? selected.originalName
                : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-xl border border-dz-a-primary-200 px-4 py-2 text-sm text-dz-a-primary-700 transition-colors hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
            >
              انصراف
            </button>
            <button
              type="button"
              disabled={multiple ? multiSelected.length === 0 : !selected}
              onClick={confirm}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-dz-a-primary-700 active:bg-dz-a-primary-800 disabled:bg-dz-a-primary-300 dark:disabled:bg-dz-a-primary-800"
            >
              <Check className="size-4" />
              {multiple
                ? `افزودن${multiSelected.length > 0 ? ` (${toPersianNumbers(multiSelected.length)})` : ""}`
                : "انتخاب این تصویر"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
