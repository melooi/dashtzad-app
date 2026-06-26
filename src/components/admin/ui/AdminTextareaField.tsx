"use client";

import { useFormContext } from "react-hook-form";
import { AdminField, fieldClass } from "./AdminField";

export function AdminTextareaField({
  name,
  label,
  hint,
  placeholder,
  required,
  rows = 4,
}: {
  name: string;
  label?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <AdminField label={label} htmlFor={name} error={error} hint={hint} required={required}>
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        className={`${fieldClass(error)} resize-y leading-7`}
        {...register(name)}
      />
    </AdminField>
  );
}
