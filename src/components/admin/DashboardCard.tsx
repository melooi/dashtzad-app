import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toPersianNumbers } from "@/lib/price";

export function DashboardCard({
  label,
  value,
  icon: Icon,
  href,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  href?: string;
  highlight?: boolean;
}) {
  const flagged = highlight && value > 0;
  const inner = (
    <div
      className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-dz-a-canvas p-5 transition-all duration-200 dark:bg-dz-a-night-card ${
        href ? "shadow-xs hover:-translate-y-1 hover:shadow-card" : ""
      } ${flagged ? "border-dz-a-warning/40 dark:border-dz-a-warning/30" : "border-dz-a-primary-100 dark:border-dz-a-night-border"}`}
    >
      {/* accent rail on the leading edge */}
      <span
        className={`absolute inset-y-0 start-0 w-1 transition-colors ${
          flagged
            ? "bg-dz-a-warning/60"
            : "bg-dz-a-primary-100 group-hover:bg-dz-a-primary-400 dark:bg-dz-a-night-border dark:group-hover:bg-dz-a-primary-500"
        }`}
      />
      <div
        className={`flex size-12 items-center justify-center rounded-xl bg-linear-to-br transition-colors ${
          flagged
            ? "from-dz-a-warning/20 to-dz-a-warning/5 text-dz-a-warning dark:text-dz-a-warning-300"
            : "from-dz-a-primary-50 to-dz-a-primary-100/50 text-dz-a-primary-600 group-hover:from-dz-a-primary-100 group-hover:to-dz-a-primary-200/50 dark:from-dz-a-primary-400/10 dark:to-dz-a-primary-400/5 dark:text-dz-a-primary-300"
        }`}
      >
        <Icon className="size-6" />
      </div>
      <div className="min-w-0">
        <div className="font-heading text-3xl font-bold tabular-nums tracking-tight text-dz-a-primary-800 dark:text-dz-a-night-fg">
          {toPersianNumbers(value)}
        </div>
        <div className="truncate text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">{label}</div>
      </div>
      {flagged && (
        <span className="ms-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-dz-a-warning/15 px-2 py-0.5 text-[10px] font-bold text-dz-a-warning dark:text-dz-a-warning-300">
          <span className="size-1.5 animate-pulse rounded-full bg-dz-a-warning dark:bg-dz-a-warning-300" aria-hidden />
          نیازمند رسیدگی
        </span>
      )}
      {href && !flagged && (
        <ChevronLeft className="ms-auto size-4 shrink-0 text-dz-a-primary-300 transition-colors group-hover:text-dz-a-primary-500 dark:text-dz-a-night-faint dark:group-hover:text-dz-a-primary-300" />
      )}
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
