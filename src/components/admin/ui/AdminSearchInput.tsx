"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

/** Debounced search box that writes `?q=` into the URL and resets to page 1. */
export function AdminSearchInput({
  placeholder = "جستجو…",
  paramKey = "q",
}: {
  placeholder?: string;
  paramKey?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(paramKey) ?? "");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) params.set(paramKey, trimmed);
      else params.delete(paramKey);
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative min-w-[220px] flex-1">
      <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-dz-a-primary-400 dark:text-dz-a-night-faint" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        type="search"
        className="w-full rounded-xl border border-dz-a-primary-200 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-elevated py-2.5 pr-9 pl-9 text-sm text-dz-a-primary-900 dark:text-dz-a-night-fg shadow-xs outline-none transition-[color,box-shadow,border-color] placeholder:text-dz-a-primary-300 dark:placeholder:text-dz-a-night-faint hover:border-dz-a-primary-300 dark:hover:border-dz-a-primary-500/50 focus:border-dz-a-primary-500 focus:ring-3 focus:ring-dz-a-primary-500/15"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="پاک کردن جستجو"
          className="focus-ring absolute top-1/2 left-2 -translate-y-1/2 rounded-md p-1 text-dz-a-primary-400 dark:text-dz-a-night-faint hover:text-dz-a-primary-700 dark:hover:text-dz-a-night-fg"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
