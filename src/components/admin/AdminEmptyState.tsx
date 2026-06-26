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
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-dz-a-primary-200 bg-dz-a-primary-50/30 p-12 text-center dark:border-dz-a-night-border dark:bg-white/2 ${
        compact ? "" : "h-full min-h-[60vh]"
      }`}
    >
      <div className="flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-white to-dz-a-primary-50 text-dz-a-primary-400 shadow-sm ring-1 ring-dz-a-primary-100 dark:from-dz-a-night-elevated dark:to-dz-a-primary-900/20 dark:text-dz-a-primary-300 dark:ring-dz-a-night-border">
        {icon ?? <Construction className="size-7" />}
      </div>
      <h2 className="mt-1 font-heading text-lg font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">{title}</h2>
      <p className="max-w-md text-sm leading-6 text-dz-a-primary-500 dark:text-dz-a-night-muted">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
