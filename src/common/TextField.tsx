import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

// Works with react-hook-form via {...register("name")} which forwards a ref.
export const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { label, error, className = "", id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm text-dz-primary-800">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-dz-primary-900 outline-none transition-colors duration-200 focus:border-dz-primary-500 ${
          error ? "border-dz-error" : "border-dz-primary-200"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-dz-error">{error}</span>}
    </div>
  );
});
