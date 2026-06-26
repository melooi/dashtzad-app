import type { ReactNode } from "react";

export type BadgeTone = "green" | "blue" | "amber" | "gray" | "red";

const TONES: Record<BadgeTone, string> = {
  green:
    "bg-dz-primary-50 text-dz-primary-700 border-dz-primary-200 dark:bg-dz-primary-400/15 dark:text-dz-primary-300 dark:border-dz-primary-400/25",
  blue: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-400/15 dark:text-sky-300 dark:border-sky-400/25",
  amber:
    "bg-dz-warning/10 text-dz-warning border-dz-warning/30 dark:bg-dz-warning/15 dark:text-dz-warning-300 dark:border-dz-warning/30",
  gray: "bg-dz-primary-50/70 text-dz-primary-500 border-dz-primary-200 dark:bg-white/5 dark:text-dz-night-muted dark:border-dz-night-border",
  red: "bg-dz-error/10 text-dz-error border-dz-error/30 dark:bg-dz-error/15 dark:text-dz-error-300 dark:border-dz-error/30",
};

/** Small pill for type/status columns — reused across collections. */
export function AdminStatusBadge({
  tone = "gray",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
