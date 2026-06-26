import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  optional?: boolean;
  icon?: ReactNode;
  error?: string;
  hint?: string;
};

/**
 * Labeled input built from existing store-* tokens (no new style). Used by the
 * panel's edit forms.
 */
export function Field({ label, optional, icon, error, hint, className = "", ...props }: Props) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-store-text">
        {label}
        {optional && <span className="font-normal text-store-text-faint"> (اختیاری)</span>}
      </span>
      <span
        className={`flex items-center gap-2 rounded-xl border bg-store-surface px-3.5 transition-colors focus-within:border-store-primary ${
          error ? "border-store-clay" : "border-store-border"
        }`}
      >
        {icon && <span className="shrink-0 text-store-text-faint">{icon}</span>}
        <input
          className={`w-full bg-transparent py-2.5 text-store-text outline-none placeholder:text-store-text-faint ${className}`}
          {...props}
        />
      </span>
      {error ? (
        <span className="text-xs text-store-clay">{error}</span>
      ) : hint ? (
        <span className="text-xs text-store-text-faint">{hint}</span>
      ) : null}
    </label>
  );
}
