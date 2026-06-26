import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export type Crumb = { name: string; href?: string };

/**
 * Visual breadcrumb trail for storefront pages (store-* palette). Presentation
 * only — the SEO BreadcrumbList JSON-LD is emitted separately and stays the
 * source of truth for search engines.
 */
export function StoreBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسیر صفحه" className="text-sm text-store-text-faint">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.name}-${i}`} className="flex items-center gap-1">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className="rounded transition-colors hover:text-store-primary focus-visible:outline-2 focus-visible:outline-store-primary"
                >
                  {c.name}
                </Link>
              ) : (
                <span className={last ? "font-medium text-store-text-muted" : ""} aria-current={last ? "page" : undefined}>
                  {c.name}
                </span>
              )}
              {!last && <ChevronLeft className="size-3.5 text-store-border-strong" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
