"use client";

import { useEffect, useState } from "react";
import { formatTimeFa, formatRelativeFa } from "@/lib/date";

/**
 * Renders a timestamp without a hydration mismatch: first paint shows the
 * deterministic time-of-day (server & client agree), then after mount it
 * switches to a live relative label ("۵ دقیقه پیش").
 */
export function ChatTime({ iso, mode = "relative" }: { iso: string; mode?: "relative" | "time" }) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const label = mounted && mode === "relative" ? formatRelativeFa(iso) : formatTimeFa(iso);
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {label}
    </time>
  );
}
