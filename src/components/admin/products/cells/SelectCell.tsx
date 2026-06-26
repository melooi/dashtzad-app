"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type SelectOption = { value: string; label: string; sub?: string };

/**
 * Spreadsheet single-select cell: a compact button that opens a small
 * searchable popover. Keyboard: Enter/Space opens, Escape closes,
 * Backspace/Delete clears. Other keys bubble for grid navigation.
 */
export function SelectCell({
  value,
  options,
  onChange,
  placeholder,
  searchable = true,
  dataCell,
  ariaLabel,
}: {
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  placeholder: string;
  searchable?: boolean;
  dataCell: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery("");
    btnRef.current?.focus();
  };

  const filtered = query
    ? options.filter((o) => o.label.includes(query) || o.sub?.includes(query))
    : options;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        data-cell={dataCell}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (open) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          } else if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault();
            e.stopPropagation();
            onChange("");
          }
        }}
        className={`flex w-full items-center justify-between gap-1 rounded-md border px-2 py-1.5 text-xs outline-none transition-colors hover:border-dz-a-primary-300 focus:relative focus:z-20 focus:border-dz-a-primary-500 focus:ring-2 focus:ring-dz-a-primary-500/30 dark:hover:border-dz-a-primary-500/50 dark:focus:border-dz-a-primary-400 dark:focus:ring-dz-a-primary-400/30 ${
          selected ? "border-dz-a-primary-200 text-dz-a-primary-800 dark:border-dz-a-night-border dark:text-dz-a-night-fg" : "border-dz-a-primary-200 text-dz-a-primary-400 dark:border-dz-a-night-border dark:text-dz-a-night-faint"
        }`}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown className="size-3 shrink-0 text-dz-a-primary-400 dark:text-dz-a-night-faint" />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-30 mt-1 w-56 rounded-xl border border-dz-a-primary-100 bg-white p-1.5 shadow-card ring-1 ring-dz-a-primary-50 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:ring-dz-a-night-border">
          {searchable && (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  close();
                }
              }}
              placeholder="جستجو…"
              className="mb-1.5 w-full rounded-md border border-dz-a-primary-200 px-2 py-1 text-xs outline-none focus:border-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night dark:text-dz-a-night-fg dark:placeholder:text-dz-a-night-faint dark:focus:border-dz-a-primary-400"
            />
          )}
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  close();
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-start text-xs transition-colors hover:bg-dz-a-primary-50 dark:hover:bg-white/5 ${
                  o.value === value ? "bg-dz-a-primary-50/70 font-medium text-dz-a-primary-700 dark:bg-white/5 dark:text-dz-a-primary-200" : "text-dz-a-primary-800 dark:text-dz-a-night-fg"
                }`}
              >
                <span className="truncate">
                  {o.label}
                  {o.sub && <span className="mr-1 text-dz-a-primary-400 dark:text-dz-a-night-faint">— {o.sub}</span>}
                </span>
                {o.value === value && <Check className="size-3.5 shrink-0 text-dz-a-primary-600 dark:text-dz-a-primary-300" />}
              </button>
            ))}
            {filtered.length === 0 && <p className="px-2 py-2 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">موردی نیست</p>}
          </div>
        </div>
      )}
    </div>
  );
}
