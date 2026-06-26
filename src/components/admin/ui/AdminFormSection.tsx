import type { ReactNode } from "react";

/** A titled card grouping related form fields. */
export function AdminFormSection({
  id,
  title,
  description,
  children,
}: {
  /** optional anchor id so AdminFormNavigator can scroll to this section. */
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="@container scroll-mt-24 rounded-2xl border border-dz-primary-100 dark:border-dz-night-border bg-white dark:bg-dz-night-card p-5 shadow-xs sm:p-6"
    >
      <div className="mb-5 border-b border-dz-primary-50 dark:border-dz-night-line pb-3.5">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-dz-primary-800 dark:text-dz-night-fg">
          <span className="h-4 w-1 rounded-full bg-dz-primary-300 dark:bg-dz-primary-500" aria-hidden />
          {title}
        </h2>
        {description && <p className="mt-1.5 ps-3 text-xs leading-5 text-dz-primary-400 dark:text-dz-night-faint">{description}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
