import type { ReactNode } from "react";

/** Section title with the storefront "olive bar" treatment (existing system). */
export function SectionHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="store-section-bar" aria-hidden />
          <h1 className="font-heading text-2xl font-bold text-store-text">{title}</h1>
        </div>
        {sub && <p className="mt-2 ps-4 text-sm text-store-text-faint">{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
