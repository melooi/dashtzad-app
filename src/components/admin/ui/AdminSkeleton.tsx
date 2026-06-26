/**
 * Loading placeholders for admin routes. Rendered by route-level loading.tsx
 * files so the user sees structure (not a blank flash) while server components
 * fetch. One shared pulse wrapper keeps the shimmer in sync.
 */

const BLOCK = "rounded bg-dz-a-primary-100 dark:bg-dz-a-night-line";

/** List/table page placeholder: title + toolbar + N table rows. */
export function AdminTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className={`mb-6 h-8 w-48 ${BLOCK}`} />
      <div className="mb-4 h-14 rounded-2xl bg-dz-a-primary-50 dark:bg-dz-a-night-card" />
      <div className="overflow-hidden rounded-2xl border border-dz-a-primary-100 dark:border-dz-a-night-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-dz-a-primary-50 px-4 py-3.5 last:border-0 dark:border-dz-a-night-line"
          >
            <div className={`size-9 ${BLOCK}`} />
            <div className={`h-4 flex-1 ${BLOCK}`} />
            <div className={`hidden h-4 w-24 sm:block ${BLOCK}`} />
            <div className={`h-4 w-16 ${BLOCK}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Dashboard placeholder: title + a grid of metric cards. */
export function AdminCardsSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="animate-pulse">
      <div className={`mb-2 h-8 w-40 ${BLOCK}`} />
      <div className={`mb-7 h-4 w-72 ${BLOCK}`} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-dz-a-primary-100 bg-white p-5 dark:border-dz-a-night-border dark:bg-dz-a-night-card"
          >
            <div className="size-12 rounded-xl bg-dz-a-primary-100 dark:bg-dz-a-night-line" />
            <div className="flex-1">
              <div className={`mb-2 h-6 w-16 ${BLOCK}`} />
              <div className={`h-3 w-24 ${BLOCK}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Edit/create form placeholder: a couple of titled section cards. */
export function AdminFormSkeleton({ sections = 3 }: { sections?: number }) {
  return (
    <div className="animate-pulse">
      <div className={`mb-6 h-8 w-56 ${BLOCK}`} />
      <div className="flex flex-col gap-5">
        {Array.from({ length: sections }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-dz-a-primary-100 bg-white p-6 dark:border-dz-a-night-border dark:bg-dz-a-night-card"
          >
            <div className={`mb-5 h-5 w-40 ${BLOCK}`} />
            <div className="flex flex-col gap-4">
              <div className={`h-11 w-full ${BLOCK}`} />
              <div className={`h-11 w-full ${BLOCK}`} />
              <div className={`h-11 w-2/3 ${BLOCK}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
