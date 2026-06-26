"use client";

import { Check } from "lucide-react";

export type VariantOption = {
  id: string;
  title: string;
  /** No active variant exists for this option (in the current context). */
  disabled?: boolean;
  /** Variant exists but is out of stock — selectable, visually muted. */
  soldOut?: boolean;
};

/**
 * A labeled group of variant options as an accessible radio group. Uses real
 * (visually hidden) <input type="radio"> so arrow-key navigation, focus and
 * screen-reader semantics come for free — no custom key handling.
 */
export function VariantOptionGroup({
  name,
  label,
  hint,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  hint?: string;
  options: VariantOption[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-store-text">{label}</span>
        {hint && <span className="text-xs text-store-text-faint">{hint}</span>}
      </legend>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <label
              key={opt.id}
              className={[
                "relative inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm transition-all",
                "has-focus-visible:ring-2 has-focus-visible:ring-store-primary/55 has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-store-bg",
                opt.disabled
                  ? "cursor-not-allowed border-store-border bg-store-surface-soft/60 text-store-disabled line-through"
                  : selected
                    ? "border-store-primary bg-store-primary font-medium text-white"
                    : "border-store-border bg-store-surface text-store-text-muted hover:border-store-primary hover:bg-store-primary-soft/40",
                !opt.disabled && opt.soldOut && !selected ? "opacity-60" : "",
              ].join(" ")}
            >
              <input
                type="radio"
                name={name}
                value={opt.id}
                checked={selected}
                disabled={opt.disabled}
                onChange={() => onChange(opt.id)}
                className="sr-only"
              />
              {selected && <Check className="size-3.5" aria-hidden />}
              {opt.title}
              {opt.soldOut && !opt.disabled && (
                <span className={`text-[10px] ${selected ? "text-white/80" : "text-store-text-faint"}`}>ناموجود</span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
