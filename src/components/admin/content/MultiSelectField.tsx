"use client";

import { useMemo, useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Search, X, Check } from "lucide-react";

export type MultiOption = { value: string; label: string; hint?: string };

export function MultiSelectField({
  name,
  options,
  emptyText = "موردی برای انتخاب نیست.",
  searchPlaceholder = "جستجو…",
}: {
  name: string;
  options: MultiOption[];
  emptyText?: string;
  searchPlaceholder?: string;
}) {
  const { watch, setValue } = useFormContext();
  const selected: string[] = watch(name) ?? [];
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options]);

  const filtered = useMemo(() => {
    const term = q.trim();
    if (!term) return [];
    return options
      .filter((o) => !selected.includes(o.value) && o.label.includes(term))
      .slice(0, 30);
  }, [options, selected, q]);

  const setSel = (next: string[]) => setValue(name, next, { shouldDirty: true });
  const add = (v: string) => {
    if (!selected.includes(v)) setSel([...selected, v]);
    setQ("");
    inputRef.current?.focus();
  };
  const remove = (v: string) => setSel(selected.filter((x) => x !== v));

  if (options.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-dz-a-primary-200 bg-dz-a-primary-50/30 p-4 text-xs text-dz-a-primary-400 dark:border-dz-a-night-border dark:bg-white/2 dark:text-dz-a-night-faint">
        {emptyText}
      </p>
    );
  }

  const showResults = q.trim().length > 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-dz-a-primary-300 dark:text-dz-a-night-faint" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
          autoComplete="off"
          className="w-full rounded-xl border border-dz-a-primary-200 bg-white py-2 ps-3 pe-9 text-sm text-dz-a-primary-900 outline-none transition-colors focus:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
        />
      </div>

      {/* Results — only when typing */}
      {showResults && (
        <div className="overflow-hidden rounded-xl border border-dz-a-primary-100 shadow-sm dark:border-dz-a-night-border">
          {filtered.length === 0 ? (
            <p className="p-3 text-center text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
              نتیجه‌ای یافت نشد.
            </p>
          ) : (
            <ul className="divide-y divide-dz-a-primary-50 dark:divide-dz-a-night-line">
              {filtered.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => add(o.value)}
                    className="focus-ring flex w-full items-center gap-2 px-3 py-2.5 text-start text-sm text-dz-a-primary-700 transition-colors hover:bg-dz-a-primary-50 dark:text-dz-a-night-fg dark:hover:bg-white/5"
                  >
                    <Check className="size-3.5 shrink-0 text-dz-a-primary-300 dark:text-dz-a-night-faint" />
                    <span className="flex-1">{o.label}</span>
                    {o.hint && (
                      <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
                        {o.hint}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-lg bg-dz-a-primary-100 px-2 py-1 text-xs text-dz-a-primary-800 dark:bg-dz-a-primary-500/25 dark:text-dz-a-night-fg"
            >
              {byValue.get(v)?.label ?? v}
              <button
                type="button"
                onClick={() => remove(v)}
                aria-label="حذف"
                className="focus-ring rounded text-dz-a-primary-500 hover:text-dz-a-error dark:text-dz-a-night-muted"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
