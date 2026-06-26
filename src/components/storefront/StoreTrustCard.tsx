import type { ReactNode } from "react";

/**
 * Small trust signal card (اصالت محصول، بسته‌بندی مطمئن، …) in the store-*
 * palette. Static, brand-true copy — real Dashtzad promises, not fabricated
 * stats or ratings.
 */
export function StoreTrustCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-store-border bg-store-surface p-4 shadow-store-xs">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-store-primary-soft text-store-primary-hover">
        {icon}
      </span>
      <div>
        <h3 className="text-sm font-bold text-store-text">{title}</h3>
        {text && <p className="mt-0.5 text-xs leading-5 text-store-text-faint">{text}</p>}
      </div>
    </div>
  );
}
