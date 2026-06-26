import type { ReactNode } from "react";

/** Shared input styling so every admin field looks identical. */
export function fieldClass(error?: unknown): string {
  return `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-dz-primary-900 shadow-xs outline-none transition-[color,box-shadow,border-color] placeholder:text-dz-primary-300 focus:ring-3 disabled:cursor-not-allowed disabled:bg-dz-primary-50/60 disabled:text-dz-primary-500 dark:bg-dz-night-elevated dark:text-dz-night-fg dark:shadow-none dark:placeholder:text-dz-night-faint dark:disabled:bg-white/5 dark:disabled:text-dz-night-faint ${
    error
      ? "border-dz-error focus:border-dz-error focus:ring-dz-error/15 dark:border-dz-error/70 dark:focus:border-dz-error dark:focus:ring-dz-error/25"
      : "border-dz-primary-200 hover:border-dz-primary-300 focus:border-dz-primary-500 focus:ring-dz-primary-500/15 dark:border-dz-night-border dark:hover:border-dz-primary-500/60 dark:focus:border-dz-primary-400 dark:focus:ring-dz-primary-400/25"
  }`;
}

/** Label + hint + error wrapper shared by all admin field components. */
export function AdminField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-dz-primary-800 dark:text-dz-night-fg">
          {label}
          {required && <span className="text-dz-error dark:text-dz-error-300"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="text-xs text-dz-primary-400 dark:text-dz-night-faint">{hint}</span>}
      {error && <span className="text-xs text-dz-error dark:text-dz-error-300">{error}</span>}
    </div>
  );
}
