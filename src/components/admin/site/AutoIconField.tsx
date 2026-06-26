"use client";

import { useState } from "react";
import { fieldClass } from "@/components/admin/ui/AdminField";
import { NAV_ICON_OPTIONS, NAV_ICONS } from "@/lib/storefront/nav-icons";

// Icon control with an "auto" default: when the tick is on (default), the icon
// is left empty and the storefront picks a MEANINGFUL icon automatically
// (by label / href / context, never blank). Untick to choose from the curated
// allow-list. Empty value === auto. (FRONT-HF-LOCK-CP1: free text → allow-list.)
export function AutoIconField({
  value,
  onChange,
  label = "آیکن",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const [auto, setAuto] = useState(!value);

  const toggle = (checked: boolean) => {
    setAuto(checked);
    if (checked) onChange(""); // auto → store empty
  };

  const Preview = value && NAV_ICONS[value] ? NAV_ICONS[value] : null;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-dz-a-primary-800 dark:text-dz-a-night-fg">
        <input
          type="checkbox"
          checked={auto}
          onChange={(e) => toggle(e.target.checked)}
          className="size-4 accent-dz-a-primary-600"
        />
        انتخاب خودکار {label} (پیشنهادی)
      </label>
      {!auto && (
        <div className="flex items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-dz-a-primary-100 bg-dz-a-primary-50/60 text-dz-a-primary-600 dark:border-dz-a-night-border dark:bg-white/5 dark:text-dz-a-night-fg">
            {Preview ? <Preview className="size-4.5" aria-hidden /> : <span className="text-xs text-dz-a-primary-300">—</span>}
          </span>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={fieldClass()}
            aria-label={`انتخاب ${label}`}
          >
            <option value="">— انتخاب آیکن —</option>
            {NAV_ICON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
