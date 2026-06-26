"use client";

import { useEffect, useId, useRef } from "react";
import { Loader2 } from "lucide-react";

/** Lightweight modal confirm. Controlled by the parent (open + handlers). */
export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Move focus into dialog when opened; restore on close.
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => { prev?.focus(); };
  }, [open]);

  // Escape closes the dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dz-primary-900/50 dark:bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClick={() => !loading && onCancel()}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-dz-primary-100 dark:border-dz-night-border bg-white dark:bg-dz-night-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={titleId} className="font-heading text-lg font-bold text-dz-primary-800 dark:text-dz-night-fg">{title}</h3>
        {description && (
          <p id={descId} className="mt-2 text-sm leading-6 text-dz-primary-500 dark:text-dz-night-muted">{description}</p>
        )}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="focus-ring rounded-xl border border-dz-primary-200 dark:border-dz-night-border px-4 py-2 text-sm text-dz-primary-700 dark:text-dz-night-fg transition-colors hover:bg-dz-primary-50 dark:hover:bg-white/5 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`focus-ring inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors disabled:opacity-60 ${
              danger ? "bg-dz-error hover:bg-dz-error/90" : "bg-dz-primary-600 hover:bg-dz-primary-700"
            }`}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
