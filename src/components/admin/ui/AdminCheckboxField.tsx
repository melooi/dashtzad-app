"use client";

import { useFormContext } from "react-hook-form";

/** Checkbox bound to RHF context (e.g. isActive). */
export function AdminCheckboxField({
  name,
  label,
  hint,
}: {
  name: string;
  label: string;
  hint?: string;
}) {
  const { register } = useFormContext();
  return (
    <div className="flex flex-col gap-1">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-dz-primary-800 dark:text-dz-night-fg">
        <input type="checkbox" {...register(name)} className="size-4 accent-dz-primary-600" />
        {label}
      </label>
      {hint && <span className="text-xs text-dz-primary-400 dark:text-dz-night-faint">{hint}</span>}
    </div>
  );
}
