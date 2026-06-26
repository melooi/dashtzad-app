import type { ReactNode } from "react";

type Tone = "success" | "danger" | "neutral";

const TONES: Record<Tone, string> = {
  success: "bg-store-primary-soft text-store-primary-hover",
  danger: "bg-store-clay-soft text-store-clay-deep",
  neutral: "bg-store-primary-soft text-store-primary-hover",
};

/**
 * Shared centered status page (payment success/failed, 404, empty results).
 * One layout so these screens never drift apart.
 */
export function StoreStatusPage({
  icon,
  tone = "neutral",
  title,
  description,
  actions,
}: {
  icon: ReactNode;
  tone?: Tone;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center text-store-text">
      <span className={`flex size-20 items-center justify-center rounded-3xl ${TONES[tone]}`}>{icon}</span>
      <h1 className="font-heading text-2xl font-bold text-store-text">{title}</h1>
      {description && <p className="max-w-md leading-7 text-store-text-muted">{description}</p>}
      {actions && <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>}
    </main>
  );
}
