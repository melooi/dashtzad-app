import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toPersianNumbers } from "@/lib/price";

/**
 * Server-rendered pagination for admin lists. Preserves the current query
 * (search/filter/sort) and shows a Persian "نمایش X تا Y از Z" summary.
 */
export function AdminTablePagination({
  page,
  perPage,
  total,
  basePath,
  query = {},
}: {
  page: number;
  perPage: number;
  total: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  const baseClass =
    "focus-ring rounded-lg border p-2 transition-colors";
  const activeClass =
    "border-dz-primary-200 dark:border-dz-night-border text-dz-primary-700 dark:text-dz-night-fg hover:border-dz-primary-300 dark:hover:border-dz-primary-500/50 hover:bg-dz-primary-50 dark:hover:bg-white/5";
  const disabledClass =
    "border-dz-primary-100 dark:border-dz-night-border text-dz-primary-300 dark:text-dz-night-faint cursor-not-allowed select-none";

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-dz-primary-500 dark:text-dz-night-muted">
        نمایش {toPersianNumbers(from)} تا {toPersianNumbers(to)} از {toPersianNumbers(total)}
      </p>
      <div className="flex items-center gap-2">
        {prevDisabled ? (
          <span className={`${baseClass} ${disabledClass}`} aria-disabled="true" aria-label="قبلی">
            <ChevronRight className="size-4" />
          </span>
        ) : (
          <Link href={href(page - 1)} className={`${baseClass} ${activeClass}`} aria-label="قبلی">
            <ChevronRight className="size-4" />
          </Link>
        )}

        <span className="rounded-lg bg-dz-primary-50 dark:bg-white/5 px-3 py-1.5 text-xs text-dz-primary-600 dark:text-dz-primary-300">
          صفحه {toPersianNumbers(page)} از {toPersianNumbers(totalPages)}
        </span>

        {nextDisabled ? (
          <span className={`${baseClass} ${disabledClass}`} aria-disabled="true" aria-label="بعدی">
            <ChevronLeft className="size-4" />
          </span>
        ) : (
          <Link href={href(page + 1)} className={`${baseClass} ${activeClass}`} aria-label="بعدی">
            <ChevronLeft className="size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
