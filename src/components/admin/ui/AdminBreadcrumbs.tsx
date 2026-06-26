import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export type Crumb = { label: string; href?: string };

/** RTL breadcrumb trail. The chevron points left (reading direction in RTL). */
export function AdminBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسیر" className="flex flex-wrap items-center gap-1 text-xs text-dz-primary-400 dark:text-dz-night-faint">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {item.href && !last ? (
              <Link href={item.href} className="hover:text-dz-primary-700 dark:hover:text-dz-night-fg">
                {item.label}
              </Link>
            ) : (
              <span className={last ? "text-dz-primary-600 dark:text-dz-primary-300" : ""}>{item.label}</span>
            )}
            {!last && <ChevronLeft className="size-3.5" />}
          </span>
        );
      })}
    </nav>
  );
}
