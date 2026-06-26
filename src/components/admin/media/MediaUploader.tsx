"use client";

import { useId, useRef, useState } from "react";
import { UploadCloud, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import type { MediaAssetDTO } from "@/lib/admin/media";
import { uploadMediaFile } from "@/lib/media/upload-client";
import { ACCEPT_ATTR, ACCEPTED_MIME_TYPES, MAX_UPLOAD_BYTES, formatBytes } from "@/lib/media/shared";

type Item = {
  key: string;
  name: string;
  status: "uploading" | "done" | "error";
  error?: string;
};

let seq = 0;

/** Drag-and-drop + file-button uploader. Calls `onUploaded` for each success. */
export function MediaUploader({
  usage,
  onUploaded,
  compact = false,
}: {
  usage?: string | null;
  onUploaded: (asset: MediaAssetDTO) => void;
  compact?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  const setItem = (key: string, patch: Partial<Item>) =>
    setItems((list) => list.map((it) => (it.key === key ? { ...it, ...patch } : it)));

  const handleFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    for (const file of arr) {
      const key = `u${seq++}`;
      // Cheap client-side pre-checks for instant feedback (server re-validates).
      if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) {
        setItems((l) => [{ key, name: file.name, status: "error", error: "نوع فایل مجاز نیست." }, ...l]);
        continue;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setItems((l) => [
          { key, name: file.name, status: "error", error: `حجم بیش از ${formatBytes(MAX_UPLOAD_BYTES)} است.` },
          ...l,
        ]);
        continue;
      }
      setItems((l) => [{ key, name: file.name, status: "uploading" }, ...l]);
      void uploadMediaFile(file, usage).then((res) => {
        if (res.ok) {
          setItem(key, { status: "done" });
          onUploaded(res.asset);
          // Auto-clear the success chip after a moment to keep the tray tidy.
          setTimeout(() => setItems((l) => l.filter((it) => it.key !== key)), 2500);
        } else {
          setItem(key, { status: "error", error: res.error });
        }
      });
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`focus-ring flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition-colors ${
          compact ? "px-4 py-6" : "px-6 py-10"
        } ${
          dragging
            ? "border-dz-a-primary-500 bg-dz-a-primary-50 dark:border-dz-a-primary-400 dark:bg-white/5"
            : "border-dz-a-primary-200 bg-white hover:border-dz-a-primary-300 hover:bg-dz-a-primary-50/50 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:hover:border-dz-a-primary-500/50 dark:hover:bg-white/5"
        }`}
      >
        <span className="flex size-11 items-center justify-center rounded-xl bg-dz-a-primary-50 text-dz-a-primary-500 ring-1 ring-dz-a-primary-100 dark:bg-white/5 dark:text-dz-a-primary-300 dark:ring-dz-a-night-border">
          <UploadCloud className="size-5" />
        </span>
        <span className="text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
          فایل را اینجا رها کنید یا برای انتخاب کلیک کنید
        </span>
        <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
          JPG، PNG، WEBP، GIF — حداکثر {formatBytes(MAX_UPLOAD_BYTES)}
        </span>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {items.map((it) => (
            <li
              key={it.key}
              className="flex items-center gap-2 rounded-xl border border-dz-a-primary-100 bg-white px-3 py-2 text-sm dark:border-dz-a-night-border dark:bg-dz-a-night-card"
            >
              {it.status === "uploading" && <Loader2 className="size-4 shrink-0 animate-spin text-dz-a-primary-500" />}
              {it.status === "done" && <CheckCircle2 className="size-4 shrink-0 text-dz-a-success dark:text-dz-a-success-300" />}
              {it.status === "error" && <AlertCircle className="size-4 shrink-0 text-dz-a-error dark:text-dz-a-error-300" />}
              <span className="flex-1 truncate text-dz-a-primary-700 dark:text-dz-a-night-fg" dir="ltr">
                {it.name}
              </span>
              {it.status === "error" && (
                <span className="text-xs text-dz-a-error dark:text-dz-a-error-300">{it.error}</span>
              )}
              {it.status !== "uploading" && (
                <button
                  type="button"
                  onClick={() => setItems((l) => l.filter((x) => x.key !== it.key))}
                  aria-label="بستن"
                  className="focus-ring rounded p-0.5 text-dz-a-primary-400 hover:text-dz-a-primary-700 dark:text-dz-a-night-faint dark:hover:text-dz-a-night-fg"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
