import type { ReactNode } from "react";
import { Construction } from "lucide-react";

// Placeholder used by collection/global pages until their CRUD is built, and
// for "no rows yet" states. An action slot (e.g. a "create" button) makes the
// empty state actionable rather than a dead end.
export function AdminEmptyState({
  title,
  description = "این بخش در حال آماده‌سازی است و به‌زودی فعال می‌شود.",
  icon,
  action,
  compact = false,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-dz-primary-200 bg-dz-primary-50/30 p-12 text-center dark:border-dz-night-border dark:bg-white/2 ${
        compact ? "" : "h-full min-h-[60vh]"
      }`}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-dz-primary-300 shadow-xs ring-1 ring-dz-primary-100 dark:bg-dz-night-elevated dark:text-dz-primary-300 dark:ring-dz-night-border">
        {icon ?? <Construction className="size-7" />}
      </div>
      <h2 className="mt-1 font-heading text-lg font-bold text-dz-primary-800 dark:text-dz-night-fg">{title}</h2>
      <p className="max-w-md text-sm leading-6 text-dz-primary-500 dark:text-dz-night-muted">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
