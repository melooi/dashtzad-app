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
      className="@container scroll-mt-24 rounded-2xl border border-dz-a-primary-100 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card p-5 shadow-xs sm:p-6"
    >
      <div className="mb-5 border-b border-dz-a-primary-50 dark:border-dz-a-night-line pb-3.5">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
          <span className="h-4 w-1 rounded-full bg-dz-a-primary-300 dark:bg-dz-a-primary-500" aria-hidden />
          {title}
        </h2>
        {description && <p className="mt-1.5 ps-3 text-xs leading-5 text-dz-a-primary-400 dark:text-dz-a-night-faint">{description}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
