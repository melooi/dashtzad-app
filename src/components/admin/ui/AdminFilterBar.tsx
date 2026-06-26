"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterX } from "lucide-react";

export type FilterDef = {
  paramKey: string;
  label: string;
  options: { value: string; label: string }[];
};

export type SortDef = { paramKey: string; label: string; options: { value: string; label: string }[] };

/**
 * URL-driven filters + optional sort select, plus a "clear filters" button that
 * appears only when something is active. Reusable across collections.
 */
export function AdminFilterBar({
  filters = [],
  sort,
  resetKeys,
}: {
  filters?: FilterDef[];
  sort?: SortDef;
  /** which param keys "clear filters" should remove (defaults to filters + q + sort) */
  resetKeys?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const keys = resetKeys ?? [...filters.map((f) => f.paramKey), ...(sort ? [sort.paramKey] : []), "q"];
  const hasActive = keys.some((k) => searchParams.get(k));

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    for (const k of keys) params.delete(k);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const selectClass =
    "focus-ring cursor-pointer rounded-xl border border-dz-primary-200 dark:border-dz-night-border bg-white dark:bg-dz-night-elevated px-3 py-2.5 text-sm text-dz-primary-800 dark:text-dz-night-fg shadow-xs outline-none transition-colors hover:border-dz-primary-300 dark:hover:border-dz-primary-500/50 focus:border-dz-primary-500";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => (
        <select
          key={f.paramKey}
          aria-label={f.label}
          value={searchParams.get(f.paramKey) ?? ""}
          onChange={(e) => setParam(f.paramKey, e.target.value)}
          className={selectClass}
        >
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}

      {sort && (
        <select
          aria-label={sort.label}
          value={searchParams.get(sort.paramKey) ?? sort.options[0]?.value ?? ""}
          onChange={(e) => setParam(sort.paramKey, e.target.value)}
          className={selectClass}
        >
          {sort.options.map((o) => (
            <option key={o.value} value={o.value}>
              {sort.label}: {o.label}
            </option>
          ))}
        </select>
      )}

      {hasActive && (
        <button
          type="button"
          onClick={clearAll}
          className="focus-ring flex items-center gap-1.5 rounded-xl border border-dz-primary-200 dark:border-dz-night-border px-3 py-2.5 text-sm text-dz-primary-600 dark:text-dz-primary-300 transition-colors hover:border-dz-primary-300 dark:hover:border-dz-primary-500/50 hover:bg-dz-primary-50 dark:hover:bg-white/5"
        >
          <FilterX className="size-4" />
          پاک کردن فیلترها
        </button>
      )}
    </div>
  );
}
