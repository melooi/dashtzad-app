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
      className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-white p-5 transition-all dark:bg-dz-night-card ${
        href ? "shadow-xs hover:-translate-y-0.5 hover:shadow-card" : ""
      } ${flagged ? "border-dz-warning/40 dark:border-dz-warning/30" : "border-dz-primary-100 dark:border-dz-night-border"}`}
    >
      {/* subtle olive accent rail on the leading edge */}
      <span
        className={`absolute inset-y-0 start-0 w-1 transition-colors ${
          flagged
            ? "bg-dz-warning/60"
            : "bg-dz-primary-100 group-hover:bg-dz-primary-400 dark:bg-dz-night-border dark:group-hover:bg-dz-primary-500"
        }`}
      />
      <div
        className={`flex size-12 items-center justify-center rounded-xl ${
          flagged
            ? "bg-dz-warning/15 text-dz-warning dark:bg-dz-warning/15 dark:text-dz-warning-300"
            : "bg-dz-primary-50 text-dz-primary-600 group-hover:bg-dz-primary-100 dark:bg-dz-primary-400/10 dark:text-dz-primary-300 dark:group-hover:bg-dz-primary-400/20"
        }`}
      >
        <Icon className="size-6" />
      </div>
      <div className="min-w-0">
        <div className="font-heading text-2xl font-bold text-dz-primary-800 dark:text-dz-night-fg">
          {toPersianNumbers(value)}
        </div>
        <div className="truncate text-sm text-dz-primary-500 dark:text-dz-night-muted">{label}</div>
      </div>
      {flagged && (
        <span className="ms-auto shrink-0 rounded-full bg-dz-warning/15 px-2 py-0.5 text-[10px] font-bold text-dz-warning dark:text-dz-warning-300">
          نیازمند رسیدگی
        </span>
      )}
      {href && !flagged && (
        <ChevronLeft className="ms-auto size-4 shrink-0 text-dz-primary-300 transition-colors group-hover:text-dz-primary-500 dark:text-dz-night-faint dark:group-hover:text-dz-primary-300" />
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
