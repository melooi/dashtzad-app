"use client";

import { CheckCircle2, X } from "lucide-react";

/** Inline success banner with optional dismiss. */
export function AdminSuccessNotice({
  message,
  onDismiss,
}: {
  message?: string | null;
  onDismiss?: () => void;
}) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dz-success/30 bg-dz-success/5 dark:bg-dz-success/10 px-4 py-3 text-sm text-dz-success dark:text-dz-success-300">
      <CheckCircle2 className="size-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="بستن" className="opacity-70 hover:opacity-100">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
