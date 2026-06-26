import type { ReactNode } from "react";

/** Container for list controls (search + filters). Wraps responsively. */
export function AdminToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-dz-a-primary-100 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card p-3 shadow-xs">
      {children}
    </div>
  );
}
