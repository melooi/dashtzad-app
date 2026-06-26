"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";

export type ChipOption = { id: string; label: string; chip: string; sub?: string };

/**
 * Spreadsheet multi-select cell: shows selected items as compact chips and
 * opens a searchable checklist popover. Keyboard: Enter/Space opens,
 * Backspace/Delete clears, Escape closes. Other keys bubble for grid nav.
 */
export function MultiChipCell({
  options,
  selectedIds,
  onChange,
  placeholder,
  dataCell,
  ariaLabel,
  popoverHeader,
  maxChips = 3,
}: {
  options: ChipOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
  dataCell: string;
  ariaLabel: string;
  popoverHeader?: ReactNode;
  maxChips?: number;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

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

  const toggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

  const selectedChips = options.filter((o) => selectedIds.includes(o.id));
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
            onChange([]);
          }
        }}
        className="flex min-h-[30px] w-full flex-wrap items-center gap-1 rounded-md border border-dz-a-primary-200 px-1.5 py-1 text-start outline-none transition-colors hover:border-dz-a-primary-300 focus:relative focus:z-20 focus:border-dz-a-primary-500 focus:ring-2 focus:ring-dz-a-primary-500/30 dark:border-dz-a-night-border dark:hover:border-dz-a-primary-500/50 dark:focus:border-dz-a-primary-400 dark:focus:ring-dz-a-primary-400/30"
      >
        {selectedChips.length === 0 && <span className="px-1 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">{placeholder}</span>}
        {selectedChips.slice(0, maxChips).map((o) => (
          <span key={o.id} className="rounded-md bg-dz-a-primary-100 px-1.5 py-0.5 text-[11px] font-medium text-dz-a-primary-700 ring-1 ring-dz-a-primary-200/70 dark:bg-dz-a-primary-400/15 dark:text-dz-a-primary-200 dark:ring-dz-a-primary-400/25">
            {o.chip}
          </span>
        ))}
        {selectedChips.length > maxChips && (
          <span className="text-[11px] text-dz-a-primary-400 dark:text-dz-a-night-faint">+{selectedChips.length - maxChips}</span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-30 mt-1 w-60 rounded-xl border border-dz-a-primary-100 bg-white p-1.5 shadow-card ring-1 ring-dz-a-primary-50 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:ring-dz-a-night-border">
          {popoverHeader}
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
          <div className="max-h-44 overflow-y-auto">
            {filtered.map((o) => {
              const on = selectedIds.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggle(o.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-start text-xs transition-colors hover:bg-dz-a-primary-50 dark:hover:bg-white/5 ${
                    on ? "bg-dz-a-primary-50/70 font-medium text-dz-a-primary-700 dark:bg-white/5 dark:text-dz-a-primary-200" : "text-dz-a-primary-800 dark:text-dz-a-night-fg"
                  }`}
                >
                  <span className="truncate">
                    {o.label}
                    {o.sub && <span className="mr-1 text-dz-a-primary-400 dark:text-dz-a-night-faint">— {o.sub}</span>}
                  </span>
                  {on && <Check className="size-3.5 shrink-0 text-dz-a-primary-600 dark:text-dz-a-primary-300" />}
                </button>
              );
            })}
            {filtered.length === 0 && <p className="px-2 py-2 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">موردی نیست</p>}
          </div>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-1 flex w-full items-center justify-center gap-1 rounded-md py-1 text-[11px] text-dz-a-primary-400 hover:bg-dz-a-primary-50 hover:text-dz-a-error dark:text-dz-a-night-faint dark:hover:bg-white/5 dark:hover:text-dz-a-error-300"
            >
              <X className="size-3" /> پاک کردن
            </button>
          )}
        </div>
      )}
    </div>
  );
}
