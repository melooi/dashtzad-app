import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toPersianNumbers } from "@/lib/price";

// Server-friendly pagination: builds hrefs from the current query.
export function Pagination({
  page,
  totalPages,
  basePath,
  query = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="صفحه‌بندی">
      {page > 1 && (
        <Link href={href(page - 1)} className="rounded-lg border border-dz-primary-200 p-2 text-dz-primary-700 hover:bg-dz-primary-50">
          <ChevronRight className="size-4" />
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={`min-w-9 rounded-lg border px-3 py-2 text-center text-sm ${
            p === page
              ? "border-dz-primary-600 bg-dz-primary-600 text-white"
              : "border-dz-primary-200 text-dz-primary-700 hover:bg-dz-primary-50"
          }`}
        >
          {toPersianNumbers(p)}
        </Link>
      ))}
      {page < totalPages && (
        <Link href={href(page + 1)} className="rounded-lg border border-dz-primary-200 p-2 text-dz-primary-700 hover:bg-dz-primary-50">
          <ChevronLeft className="size-4" />
        </Link>
      )}
    </nav>
  );
}
