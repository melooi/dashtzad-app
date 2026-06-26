// Small shared presentational atoms for account-panel sections (store-* system).
import type { ReactNode } from "react";
import { Loader2, Star } from "lucide-react";
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

export function PanelLoading({ label = "در حال بارگذاری…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-store-text-faint">
      <Loader2 className="size-4 animate-spin" />
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
