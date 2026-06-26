"use client";

import { useFormContext } from "react-hook-form";
import { AdminField, fieldClass } from "./AdminField";

export type RelationOption = { value: string; label: string; disabled?: boolean };

/**
 * Select for a relation (e.g. parent category). Always offers an explicit
 * "none" choice. Options are computed by the parent form (filtered by type,
 * self/descendants excluded) so this stays generic.
 */
export function AdminRelationSelect({
  name,
  label,
  options,
  hint,
  emptyLabel = "— بدون والد —",
  required,
}: {
  name: string;
  label?: string;
  options: RelationOption[];
  hint?: string;
  emptyLabel?: string;
  required?: boolean;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <AdminField label={label} htmlFor={name} error={error} hint={hint} required={required}>
      <select id={name} className={fieldClass(error)} {...register(name)}>
        <option value="">{emptyLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </AdminField>
  );
}
