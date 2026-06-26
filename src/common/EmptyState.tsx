import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-dz-primary-200 p-12 text-center">
      {icon && <div className="text-dz-primary-400">{icon}</div>}
      <h2 className="text-lg font-bold text-dz-primary-800">{title}</h2>
      {description && <p className="text-sm text-dz-primary-600">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
