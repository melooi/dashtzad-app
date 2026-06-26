import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-dz-primary-600 text-white shadow-xs hover:bg-dz-primary-700 active:bg-dz-primary-800 disabled:bg-dz-primary-300",
  secondary:
    "bg-dz-primary-100 text-dz-primary-800 hover:bg-dz-primary-200 disabled:opacity-60",
  outline:
    "border border-dz-primary-300 text-dz-primary-700 hover:border-dz-primary-400 hover:bg-dz-primary-50 disabled:opacity-60",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", className = "", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-medium transition-colors duration-200 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
});
