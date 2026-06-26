import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";
import { toPersianNumbers } from "@/lib/price";

export type SeoLevel = "good" | "review" | "incomplete" | "off" | "neutral";

const LEVELS: Record<SeoLevel, { label: string; pill: string; rail: string; iconBg: string }> = {
  good: { label: "خوب", pill: "bg-dz-success/10 text-dz-success dark:text-dz-success-300", rail: "bg-dz-success/50", iconBg: "bg-dz-success/10 text-dz-success dark:text-dz-success-300" },
  review: { label: "نیازمند بررسی", pill: "bg-dz-warning/10 text-dz-warning dark:text-dz-warning-300", rail: "bg-dz-warning/50", iconBg: "bg-dz-warning/10 text-dz-warning dark:text-dz-warning-300" },
  incomplete: { label: "ناقص", pill: "bg-dz-error/10 text-dz-error dark:text-dz-error-300", rail: "bg-dz-error/50", iconBg: "bg-dz-error/10 text-dz-error dark:text-dz-error-300" },
  off: { label: "غیرفعال", pill: "bg-dz-primary-50 dark:bg-white/5 text-dz-primary-400 dark:text-dz-night-faint", rail: "bg-dz-primary-200 dark:bg-dz-night-border", iconBg: "bg-dz-primary-50 dark:bg-white/5 text-dz-primary-400 dark:text-dz-night-faint" },
  neutral: { label: "", pill: "", rail: "bg-dz-primary-200 dark:bg-dz-night-border", iconBg: "bg-dz-primary-50 dark:bg-white/5 text-dz-primary-600 dark:text-dz-primary-300" },
};

/** Health stat card with an olive accent rail + quality pill. */
export function SeoStatCard({
  label,
  value,
  level = "neutral",
  hint,
  href,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  level?: SeoLevel;
  hint?: string;
  href?: string;
  icon?: LucideIcon;
}) {
  const L = LEVELS[level];
  const inner = (
    <div className={`group relative flex h-full items-start gap-3 overflow-hidden rounded-2xl border border-dz-primary-100 dark:border-dz-night-border bg-white dark:bg-dz-night-card p-4 shadow-xs transition-all ${href ? "hover:-translate-y-0.5 hover:shadow-card" : ""}`}>
      <span className={`absolute inset-y-0 start-0 w-1 ${L.rail}`} aria-hidden />
      {Icon && (
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${L.iconBg}`}>
          <Icon className="size-4.5" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading text-xl font-bold text-dz-primary-800 dark:text-dz-night-fg">
            {typeof value === "number" ? toPersianNumbers(value) : value}
          </span>
          {level !== "neutral" && L.label && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${L.pill}`}>{L.label}</span>
          )}
        </div>
        <div className="mt-0.5 text-sm text-dz-primary-600 dark:text-dz-primary-300">{label}</div>
        {hint && <div className="mt-1 text-xs leading-5 text-dz-primary-400 dark:text-dz-night-faint">{hint}</div>}
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="focus-ring rounded-2xl">
      {inner}
    </Link>
  ) : (
    inner
  );
}

/** Titled section card with a brand accent + optional action slot. */
export function SeoSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-dz-primary-100 dark:border-dz-night-border bg-white dark:bg-dz-night-card p-5 shadow-xs sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-dz-primary-50 dark:border-dz-night-line pb-3.5">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-base font-bold text-dz-primary-800 dark:text-dz-night-fg">
            <span className="h-4 w-1 rounded-full bg-dz-primary-300 dark:bg-dz-primary-500" aria-hidden />
            {title}
          </h2>
          {description && <p className="mt-1.5 ps-3 text-xs leading-5 text-dz-primary-400 dark:text-dz-night-faint">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}

/** Persian helper / disclaimer note. */
export function SeoNote({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" }) {
  const cls =
    tone === "warn"
      ? "border-dz-warning/30 bg-dz-warning/5 dark:bg-dz-warning/10 text-dz-warning dark:text-dz-warning-300"
      : "border-dz-primary-100 dark:border-dz-night-border bg-dz-primary-50/50 dark:bg-white/5 text-dz-primary-600 dark:text-dz-primary-300";
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs leading-6 ${cls}`}>
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/** Key/value info row. */
export function SeoRow({ label, value, mono = false }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-dz-primary-50 dark:border-dz-night-line py-2.5 last:border-0">
      <span className="shrink-0 text-sm text-dz-primary-500 dark:text-dz-night-muted">{label}</span>
      <span className={`min-w-0 truncate text-sm text-dz-primary-800 dark:text-dz-night-fg ${mono ? "font-mono text-xs" : ""}`} dir={mono ? "ltr" : undefined}>
        {value}
      </span>
    </div>
  );
}

/** Status pill, standalone. */
export function SeoPill({ level, children }: { level: SeoLevel; children?: ReactNode }) {
  const L = LEVELS[level];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${L.pill}`}>
      {children ?? L.label}
    </span>
  );
}
