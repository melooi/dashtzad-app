"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { ImagePlus, X, ImageOff } from "lucide-react";
import { fieldClass } from "@/components/admin/ui/AdminField";
import type { MediaUsage } from "@/generated/prisma/client";
import type { MediaAssetDTO } from "@/lib/admin/media";
import { MediaPickerDialog } from "./MediaPickerDialog";

/**
 * Reusable image picker bound to a controlled string URL. Keeps manual URL
 * entry available (withUrlInput) while letting admins choose from the library.
 * Returns the asset URL via onChange; onPickAsset gives full metadata if needed.
 */
export function MediaPicker({
  value,
  onChange,
  usage,
  withUrlInput = true,
  placeholder = "نشانی تصویر یا انتخاب از رسانه‌ها",
  onPickAsset,
}: {
  value: string;
  onChange: (url: string) => void;
  usage?: MediaUsage;
  withUrlInput?: boolean;
  placeholder?: string;
  onPickAsset?: (asset: MediaAssetDTO) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-start gap-2">
      {/* Preview */}
      <div className="flex size-[58px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dz-a-primary-200 bg-dz-a-primary-50/50 dark:border-dz-a-night-border dark:bg-white/5">
        {value ? (
          <img src={value} alt="" className="size-full object-contain" />
        ) : (
          <ImageOff className="size-5 text-dz-a-primary-300 dark:text-dz-a-night-faint" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {withUrlInput && (
          <input
            type="text"
            dir="ltr"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${fieldClass()} font-mono`}
          />
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-dz-a-primary-200 px-3 py-1.5 text-xs font-medium text-dz-a-primary-700 transition-colors hover:border-dz-a-primary-300 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-primary-300 dark:hover:bg-white/5"
          >
            <ImagePlus className="size-3.5" /> انتخاب از رسانه‌ها
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-dz-a-error/30 px-3 py-1.5 text-xs text-dz-a-error transition-colors hover:bg-dz-a-error/10 dark:text-dz-a-error-300"
            >
              <X className="size-3.5" /> حذف
            </button>
          )}
        </div>
      </div>

      <MediaPickerDialog
        open={open}
        usage={usage}
        onClose={() => setOpen(false)}
        onPick={(asset) => {
          onChange(asset.url);
          onPickAsset?.(asset);
          setOpen(false);
        }}
      />
    </div>
  );
}
