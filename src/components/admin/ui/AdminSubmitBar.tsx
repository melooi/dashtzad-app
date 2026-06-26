"use client";

import Link from "next/link";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { toPersianNumbers } from "@/lib/price";

/**
 * Sticky action bar at the bottom of every admin form. Three states:
 *  1) saved   → muted, unobtrusive ("همه‌ی تغییرات ذخیره شده است").
 *  2) dirty   → clear "unsaved changes" + save/cancel.
 *  3) error   → shows the validation-error count + a "go to first error" jump.
 * `errorCount` and `onGoToFirstError` are optional, so existing usages keep
 * working unchanged. When errorCount > 0 and no handler is passed, the bar
 * scrolls to the first `[aria-invalid="true"]` field itself.
 */
export function AdminSubmitBar({
  submitting,
  dirty,
  cancelHref,
  onCancel,
  cancelLabel = "انصراف",
  saveLabel = "ذخیره",
  errorCount = 0,
  onGoToFirstError,
}: {
  submitting: boolean;
  dirty?: boolean;
  /** navigation-style cancel (link). Use this OR onCancel. */
  cancelHref?: string;
  /** button-style cancel/revert (e.g. for single-page settings). */
  onCancel?: () => void;
  cancelLabel?: string;
  saveLabel?: string;
  errorCount?: number;
  onGoToFirstError?: () => void;
}) {
  const hasErrors = errorCount > 0;

  const goToFirstError = () => {
    if (onGoToFirstError) return onGoToFirstError();
    if (typeof document === "undefined") return;
    const el = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus({ preventScroll: true });
    }
  };

  // dirty=undefined means the parent hasn't wired it up; treat as "unknown".
  const isDirty = dirty === true;
  const isSaved = dirty === false;

  const dotClass = hasErrors ? "bg-dz-a-error" : isDirty ? "bg-dz-a-warning" : isSaved ? "bg-dz-a-success" : "bg-dz-a-primary-200";
  // Colored top edge mirrors the state at a glance, even peripherally.
  const edgeClass = hasErrors
    ? "border-t-dz-a-error/60"
    : isDirty
      ? "border-t-dz-a-warning/60"
      : isSaved
        ? "border-t-dz-a-success/50"
        : "border-t-dz-a-primary-100 dark:border-t-dz-a-night-border";
  const statusText = hasErrors
    ? `${toPersianNumbers(errorCount)} خطا مانع ذخیره شده است.`
    : isDirty
      ? "تغییرات ذخیره‌نشده دارید."
      : isSaved
        ? "همه‌ی تغییرات ذخیره شده است."
        : "";
  const statusColor = hasErrors
    ? "text-dz-a-error dark:text-dz-a-error-300"
    : "text-dz-a-primary-400 dark:text-dz-a-night-faint";

  return (
    <div className={`sticky bottom-0 z-10 -mx-1 mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl border border-t-2 border-dz-a-primary-100 dark:border-dz-a-night-border bg-white/95 dark:bg-dz-a-night-elevated/85 px-4 py-3 backdrop-blur transition-colors supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-dz-a-night-elevated/85 ${edgeClass}`}>
      <div className="flex items-center gap-3">
        <span className={`flex items-center gap-2 text-xs ${statusColor}`}>
          <span className={`size-1.5 rounded-full ${dotClass}`} aria-hidden />
          {statusText}
        </span>
        {hasErrors && (
          <button
            type="button"
            onClick={goToFirstError}
            className="focus-ring inline-flex items-center gap-1 rounded-lg border border-dz-a-error/40 px-2.5 py-1 text-xs font-medium text-dz-a-error transition-colors hover:bg-dz-a-error/10 dark:text-dz-a-error-300"
          >
            <AlertCircle className="size-3.5" />
            رفتن به اولین خطا
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {cancelHref ? (
          <Link
            href={cancelHref}
            className="focus-ring rounded-xl border border-dz-a-primary-200 dark:border-dz-a-night-border px-4 py-2.5 text-sm text-dz-a-primary-700 dark:text-dz-a-night-fg transition-colors hover:border-dz-a-primary-300 dark:hover:border-dz-a-primary-500/50 hover:bg-dz-a-primary-50 dark:hover:bg-white/5"
          >
            {cancelLabel}
          </Link>
        ) : onCancel && isDirty ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="focus-ring rounded-xl border border-dz-a-primary-200 dark:border-dz-a-night-border px-4 py-2.5 text-sm text-dz-a-primary-700 dark:text-dz-a-night-fg transition-colors hover:border-dz-a-primary-300 dark:hover:border-dz-a-primary-500/50 hover:bg-dz-a-primary-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        ) : null}
        <button
          type="submit"
          disabled={submitting || (isSaved && !hasErrors)}
          className="focus-ring inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-dz-a-primary-700 active:bg-dz-a-primary-800 disabled:cursor-not-allowed disabled:bg-dz-a-primary-300 dark:disabled:bg-dz-a-primary-800"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {submitting ? "در حال ذخیره…" : saveLabel}
        </button>
      </div>
    </div>
  );
}
