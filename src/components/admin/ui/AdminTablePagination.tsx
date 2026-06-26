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

  const linkClass =
    "focus-ring rounded-lg border border-dz-primary-200 dark:border-dz-night-border p-2 text-dz-primary-700 dark:text-dz-night-fg transition-colors hover:border-dz-primary-300 dark:hover:border-dz-primary-500/50 hover:bg-dz-primary-50 dark:hover:bg-white/5 aria-disabled:pointer-events-none aria-disabled:opacity-40";

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-dz-primary-500 dark:text-dz-night-muted">
        نمایش {toPersianNumbers(from)} تا {toPersianNumbers(to)} از {toPersianNumbers(total)}
      </p>
      <div className="flex items-center gap-2">
        <Link href={href(page - 1)} aria-disabled={page <= 1} className={linkClass} aria-label="قبلی">
          <ChevronRight className="size-4" />
        </Link>
        <span className="rounded-lg bg-dz-primary-50 dark:bg-white/5 px-3 py-1.5 text-xs text-dz-primary-600 dark:text-dz-primary-300">
          صفحه {toPersianNumbers(page)} از {toPersianNumbers(totalPages)}
        </span>
        <Link
          href={href(page + 1)}
          aria-disabled={page >= totalPages}
          className={linkClass}
          aria-label="بعدی"
        >
          <ChevronLeft className="size-4" />
        </Link>
      </div>
    </div>
  );
}
