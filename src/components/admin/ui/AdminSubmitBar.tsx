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

  const dotClass = hasErrors ? "bg-dz-error" : dirty ? "bg-dz-warning" : "bg-dz-success";
  const statusText = hasErrors
    ? `${toPersianNumbers(errorCount)} خطا مانع ذخیره شده است.`
    : dirty
      ? "تغییرات ذخیره‌نشده دارید."
      : "همه‌ی تغییرات ذخیره شده است.";
  const statusColor = hasErrors
    ? "text-dz-error dark:text-dz-error-300"
    : "text-dz-primary-400 dark:text-dz-night-faint";

  return (
    <div className="sticky bottom-0 z-10 -mx-1 mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl border border-dz-primary-100 dark:border-dz-night-border bg-white/95 dark:bg-dz-night-elevated/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-dz-night-elevated/85">
      <div className="flex items-center gap-3">
        <span className={`flex items-center gap-2 text-xs ${statusColor}`}>
          <span className={`size-1.5 rounded-full ${dotClass}`} aria-hidden />
          {statusText}
        </span>
        {hasErrors && (
          <button
            type="button"
            onClick={goToFirstError}
            className="focus-ring inline-flex items-center gap-1 rounded-lg border border-dz-error/40 px-2.5 py-1 text-xs font-medium text-dz-error transition-colors hover:bg-dz-error/10 dark:text-dz-error-300"
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
            className="focus-ring rounded-xl border border-dz-primary-200 dark:border-dz-night-border px-4 py-2.5 text-sm text-dz-primary-700 dark:text-dz-night-fg transition-colors hover:border-dz-primary-300 dark:hover:border-dz-primary-500/50 hover:bg-dz-primary-50 dark:hover:bg-white/5"
          >
            {cancelLabel}
          </Link>
        ) : onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={!dirty || submitting}
            className="focus-ring rounded-xl border border-dz-primary-200 dark:border-dz-night-border px-4 py-2.5 text-sm text-dz-primary-700 dark:text-dz-night-fg transition-colors hover:border-dz-primary-300 dark:hover:border-dz-primary-500/50 hover:bg-dz-primary-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="focus-ring inline-flex items-center gap-2 rounded-xl bg-dz-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-dz-primary-700 active:bg-dz-primary-800 disabled:cursor-not-allowed disabled:bg-dz-primary-300 dark:disabled:bg-dz-primary-800"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {submitting ? "در حال ذخیره…" : saveLabel}
        </button>
      </div>
    </div>
  );
}
