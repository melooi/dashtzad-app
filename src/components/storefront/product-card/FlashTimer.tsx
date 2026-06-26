"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { toPersianNumbers } from "@/lib/price";

/**
 * Flash-sale countdown (شگفت‌انگیز) — bottom-inline-end of the card media.
 * Mirrors design-export .dz-product-card__timer. Renders ONLY when a REAL
 * sale-end timestamp is provided; never a faked countdown.
 */
function fmt(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return toPersianNumbers(`${pad(h)}:${pad(m)}:${pad(s)}`);
}

export function FlashTimer({ endsAt }: { endsAt: string }) {
  const end = new Date(endsAt).getTime();
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((end - Date.now()) / 1000)));

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end]);

  if (remaining <= 0) return null;

  return (
    <span className="store-card__timer" role="timer" aria-label="زمان باقی‌مانده‌ی شگفت‌انگیز">
      <Zap className="size-3" aria-hidden fill="currentColor" />
      شگفت‌انگیز
      <b suppressHydrationWarning>{fmt(remaining)}</b>
    </span>
  );
}
