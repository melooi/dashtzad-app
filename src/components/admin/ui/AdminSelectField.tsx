"use client";

import { useFormContext } from "react-hook-form";
import { AdminField, fieldClass } from "./AdminField";

export function AdminSelectField({
  name,
  label,
  options,
  placeholder,
  hint,
  required,
}: {
  name: string;
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
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
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </AdminField>
  );
}
