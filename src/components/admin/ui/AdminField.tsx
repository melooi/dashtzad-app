import type { ReactNode } from "react";

/** Shared input styling so every admin field looks identical. */
export function fieldClass(error?: unknown): string {
  return `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-dz-a-primary-900 shadow-xs outline-none transition-[color,box-shadow,border-color] placeholder:text-dz-a-primary-300 focus:ring-3 disabled:cursor-not-allowed disabled:bg-dz-a-primary-50/60 disabled:text-dz-a-primary-500 dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg dark:shadow-none dark:placeholder:text-dz-a-night-faint dark:disabled:bg-white/5 dark:disabled:text-dz-a-night-faint ${
    error
      ? "border-dz-a-error focus:border-dz-a-error focus:ring-dz-a-error/15 dark:border-dz-a-error/70 dark:focus:border-dz-a-error dark:focus:ring-dz-a-error/25"
      : "border-dz-a-primary-200 hover:border-dz-a-primary-300 focus:border-dz-a-primary-500 focus:ring-dz-a-primary-500/15 dark:border-dz-a-night-border dark:hover:border-dz-a-primary-500/60 dark:focus:border-dz-a-primary-400 dark:focus:ring-dz-a-primary-400/25"
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
        <label htmlFor={htmlFor} className="text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
          {label}
          {required && <span className="text-dz-a-error dark:text-dz-a-error-300"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">{hint}</span>}
      {error && <span className="text-xs text-dz-a-error dark:text-dz-a-error-300">{error}</span>}
    </div>
  );
}
