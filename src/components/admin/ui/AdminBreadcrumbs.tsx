import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export type Crumb = { label: string; href?: string };

/** RTL breadcrumb trail. The chevron points left (reading direction in RTL). */
export function AdminBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسیر" className="flex flex-wrap items-center gap-1 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {item.href && !last ? (
              <Link href={item.href} className="hover:text-dz-a-primary-700 dark:hover:text-dz-a-night-fg">
                {item.label}
              </Link>
            ) : (
              <span className={last ? "text-dz-a-primary-600 dark:text-dz-a-primary-300" : ""}>{item.label}</span>
            )}
            {!last && <ChevronLeft className="size-3.5" />}
          </span>
        );
      })}
    </nav>
  );
}
