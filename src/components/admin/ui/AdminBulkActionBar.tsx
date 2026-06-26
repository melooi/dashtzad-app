"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { toPersianNumbers } from "@/lib/price";

/**
 * Floating bar shown when ≥1 row is selected. Holds bulk actions (passed as
 * children). Reused by every collection list — and the foundation CP3's
 * quick-add product sheet will extend for bulk save.
 */
export function AdminBulkActionBar({
  count,
  onClear,
  children,
}: {
  count: number;
  onClear: () => void;
  children?: ReactNode;
}) {
  if (count === 0) return null;

  return (
    <div className="sticky bottom-4 z-20 mx-auto mt-4 flex w-fit max-w-[calc(100vw-2rem)] flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl border border-dz-a-primary-200 dark:border-dz-a-night-border bg-white/95 dark:bg-dz-a-night-elevated/85 px-4 py-2.5 shadow-card backdrop-blur">
      <span className="flex items-center gap-2 text-sm font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">
        <span className="flex size-6 items-center justify-center rounded-full bg-dz-a-primary-600 text-xs font-bold text-white">
          {toPersianNumbers(count)}
        </span>
        مورد انتخاب شده
      </span>
      <div className="flex items-center gap-2">{children}</div>
      <button
        type="button"
        onClick={onClear}
        aria-label="لغو انتخاب"
        className="focus-ring rounded-lg p-1 text-dz-a-primary-400 dark:text-dz-a-night-faint hover:text-dz-a-primary-700 dark:hover:text-dz-a-night-fg"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
