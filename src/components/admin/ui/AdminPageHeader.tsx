import type { ReactNode } from "react";
import { AdminBreadcrumbs, type Crumb } from "./AdminBreadcrumbs";

/** Page title row: breadcrumbs + heading + (optional) description and actions. */
export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-dz-primary-100 dark:border-dz-night-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        {breadcrumbs && <AdminBreadcrumbs items={breadcrumbs} />}
        <h1 className="font-heading text-2xl font-bold text-dz-primary-800 dark:text-dz-night-fg">{title}</h1>
        {description && <p className="text-sm text-dz-primary-500 dark:text-dz-night-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div>}
    </div>
  );
}
