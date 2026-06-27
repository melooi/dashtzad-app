// Small shared presentational atoms for account-panel sections (store-* system).
import type { ReactNode } from "react";
import { Star } from "lucide-react";
import type { Tone } from "./nav";

const TONE_PILL: Record<Tone, string> = {
  green: "bg-store-primary-soft text-store-primary-hover",
  gold: "bg-store-amber-soft text-store-gold-deep",
  clay: "bg-store-clay-soft text-store-clay-deep",
  muted: "bg-store-surface-soft text-store-text-faint",
};

export function TonePill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${TONE_PILL[tone]}`}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton atoms                                                       */
/* ------------------------------------------------------------------ */

function Bone({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-store-border ${className}`} />;
}

/** Skeleton for order cards (OrdersSection, DashboardSection) */
export function SkeletonOrderCard() {
  return (
    <div className="rounded-2xl border border-store-border bg-store-surface p-4 shadow-store-xs md:p-5">
      <div className="flex items-center gap-3 border-b border-store-border pb-3">
        <Bone className="h-4 w-28" />
        <Bone className="h-4 w-16" />
        <Bone className="ms-auto h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-4 pt-3">
        <div className="flex">
          {[0, 1, 2].map((i) => (
            <Bone key={i} className={`size-12 rounded-xl ${i > 0 ? "-mr-3" : ""}`} />
          ))}
        </div>
        <Bone className="h-4 w-16 flex-1" />
        <Bone className="h-6 w-24" />
        <Bone className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

/** Skeleton for product grid cards (Wishlist, Recent) */
export function SkeletonProductGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-store-border bg-store-surface p-3">
          <Bone className="mb-3 h-36 w-full rounded-xl" />
          <Bone className="mb-2 h-4 w-3/4" />
          <Bone className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for simple list rows (addresses, messages, reviews) */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-store-border bg-store-surface p-4 shadow-store-xs">
          <div className="flex items-start gap-3">
            <Bone className="size-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-1/2" />
              <Bone className="h-3 w-3/4" />
              <Bone className="h-3 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Dashboard stat tiles skeleton */
export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-store-border bg-store-surface p-3 md:p-4">
          <Bone className="mb-3 size-10 rounded-xl" />
          <Bone className="mb-2 h-7 w-12" />
          <Bone className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function PanelLoading({ label = "در حال بارگذاری…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-store-text-faint">
      <div className="size-4 animate-spin rounded-full border-2 border-store-border border-t-store-primary" />
      {label}
    </div>
  );
}

export function PanelError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-store-border bg-store-surface p-10 text-center">
      <p className="text-sm text-store-text-muted">دریافت اطلاعات با خطا مواجه شد.</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="store-btn store-btn-secondary">
          تلاش دوباره
        </button>
      )}
    </div>
  );
}

export function PanelEmpty({
  icon,
  title,
  desc,
  action,
}: {
  icon: ReactNode;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-store-border bg-store-surface p-10 text-center md:p-12">
      <span className="grid size-16 place-items-center rounded-2xl bg-store-primary-soft text-store-primary-hover">
        {icon}
      </span>
      <div className="font-heading text-lg font-bold text-store-text">{title}</div>
      {desc && <p className="max-w-md text-sm leading-7 text-store-text-faint">{desc}</p>}
      {action && <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} از ۵`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-3.5 ${i <= value ? "fill-store-gold text-store-gold" : "text-store-border-strong"}`}
        />
      ))}
    </span>
  );
}
