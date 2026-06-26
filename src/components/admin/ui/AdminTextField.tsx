"use client";

import { useFormContext } from "react-hook-form";
import { AdminField, fieldClass } from "./AdminField";

export function AdminTextField({
  name,
  label,
  hint,
  placeholder,
  required,
  dir,
  type = "text",
  inputMode,
}: {
  name: string;
  label?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  dir?: "rtl" | "ltr";
  type?: string;
  inputMode?: "text" | "numeric" | "decimal";
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <AdminField label={label} htmlFor={name} error={error} hint={hint} required={required}>
      <input
        id={name}
        type={type}
        dir={dir}
        inputMode={inputMode}
        placeholder={placeholder}
        className={fieldClass(error)}
        {...register(name)}
      />
    </AdminField>
  );
}
