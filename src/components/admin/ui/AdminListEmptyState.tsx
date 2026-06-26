import type { ReactNode } from "react";
import Link from "next/link";
import { FilterX, Inbox } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

/**
 * Two-mode empty state for admin list pages:
 *  - mode="empty"      → nothing has been created yet. Shows why the page is
 *                        empty + the primary CTA (and an optional help link).
 *  - mode="no-results" → filters/search matched nothing. Shows a "clear
 *                        filters" link plus the primary action.
 * The page decides the mode from its searchParams (active filters → no-results).
 */
export function AdminListEmptyState({
  mode,
  icon,
  title,
  description,
  action,
  clearFiltersHref,
  helpHref,
  helpLabel,
}: {
  mode: "empty" | "no-results";
  icon?: ReactNode;
  /** no-data title; ignored for no-results (which has a fixed title). */
  title?: string;
  description?: string;
  /** primary CTA node (e.g. the page's "add" button). */
  action?: ReactNode;
  /** base list URL without query — renders the "clear filters" button. */
  clearFiltersHref?: string;
  helpHref?: string;
  helpLabel?: string;
}) {
  if (mode === "no-results") {
    return (
      <AdminEmptyState
        compact
        icon={icon ?? <FilterX className="size-7" />}
        title="نتیجه‌ای پیدا نشد"
        description={description ?? "با فیلترها یا عبارت جست‌وجوی فعلی موردی پیدا نشد. فیلترها را پاک کنید یا عبارت دیگری را امتحان کنید."}
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            {clearFiltersHref && (
              <Link
                href={clearFiltersHref}
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-dz-a-primary-200 bg-white px-4 py-2.5 text-sm font-medium text-dz-a-primary-700 transition-colors hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg dark:hover:bg-white/5"
              >
                <FilterX className="size-4" />
                پاک کردن فیلترها
              </Link>
            )}
            {action}
          </div>
        }
      />
    );
  }

  return (
    <AdminEmptyState
      icon={icon ?? <Inbox className="size-7" />}
      title={title ?? "هنوز داده‌ای ثبت نشده است"}
      description={description}
      action={
        action || helpHref ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {action}
            {helpHref && (
              <Link
                href={helpHref}
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-dz-a-primary-200 bg-white px-4 py-2.5 text-sm font-medium text-dz-a-primary-700 transition-colors hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-fg dark:hover:bg-white/5"
              >
                {helpLabel ?? "راهنما"}
              </Link>
            )}
          </div>
        ) : undefined
      }
    />
  );
}
