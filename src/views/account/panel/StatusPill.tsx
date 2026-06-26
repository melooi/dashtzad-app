import type { OrderStatus } from "@/generated/prisma/client";
import { ORDER_STATUS, type Tone } from "./nav";

const TONE: Record<Tone, string> = {
  green: "bg-store-primary-soft text-store-primary-hover",
  gold: "bg-store-amber-soft text-store-gold-deep",
  clay: "bg-store-clay-soft text-store-clay-deep",
  muted: "bg-store-surface-soft text-store-text-faint",
};

const DOT: Record<Tone, string> = {
  green: "bg-store-primary",
  gold: "bg-store-gold",
  clay: "bg-store-clay",
  muted: "bg-store-text-faint",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${TONE[s.tone]}`}
    >
      <span className={`size-1.5 rounded-full ${DOT[s.tone]}`} aria-hidden />
      {s.label}
    </span>
  );
}
