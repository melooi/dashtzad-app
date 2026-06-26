import type { ReactNode } from "react";

export type BadgeTone = "green" | "blue" | "amber" | "gray" | "red";

const TONES: Record<BadgeTone, string> = {
  // Semantic — always these colors regardless of admin accent palette
  green: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-300 dark:border-emerald-400/25",
  blue:  "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-400/15 dark:text-sky-300 dark:border-sky-400/25",
  amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/25",
  gray:  "bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-dz-a-night-muted dark:border-dz-a-night-border",
  red:   "bg-red-50 text-red-700 border-red-200 dark:bg-red-400/15 dark:text-red-300 dark:border-red-400/25",
};

/** Dot color per tone */
const DOTS: Record<BadgeTone, string> = {
  green: "bg-emerald-500 dark:bg-emerald-400",
  blue:  "bg-sky-500 dark:bg-sky-400",
  amber: "bg-amber-500 dark:bg-amber-400",
  gray:  "bg-slate-400 dark:bg-dz-a-night-faint",
  red:   "bg-red-500 dark:bg-red-400",
};

/** Small pill for type/status columns — reused across collections. A leading
 * colored dot conveys status without relying on the pill's subtle fill alone. */
export function AdminStatusBadge({
  tone = "gray",
  children,
  dot = true,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  /** Show the leading status dot (default true). */
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}
    >
      {dot && <span className={`size-1.5 rounded-full ${DOTS[tone]}`} aria-hidden />}
      {children}
    </span>
  );
}
