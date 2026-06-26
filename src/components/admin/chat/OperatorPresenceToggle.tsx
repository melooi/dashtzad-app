"use client";

import { useEffect, useState, useTransition } from "react";
import { presenceAction, heartbeatAction } from "@/app/admin/chat/actions";

const HEARTBEAT_MS = 45000;

/**
 * CHAT-CP2 — operator online/offline switch. While online it heartbeats so the
 * storefront "online" state stays accurate (presence has a 2-minute TTL).
 */
export function OperatorPresenceToggle({ initialOnline }: { initialOnline: boolean }) {
  const [online, setOnline] = useState(initialOnline);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!online) return;
    heartbeatAction();
    const id = setInterval(() => heartbeatAction(), HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [online]);

  const toggle = () =>
    start(async () => {
      const next = !online;
      setOnline(next);
      await presenceAction(next);
    });

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={online}
      title={online ? "آنلاین — برای قطع کلیک کنید" : "آفلاین — برای آنلاین‌شدن کلیک کنید"}
      className={`focus-ring inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
        online
          ? "border-dz-success/40 bg-dz-success/10 text-dz-success dark:text-dz-success-300"
          : "border-dz-primary-200 text-dz-primary-500 hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-muted dark:hover:bg-white/5"
      }`}
    >
      <span className={`size-2 rounded-full ${online ? "bg-dz-success" : "bg-dz-primary-300 dark:bg-dz-night-faint"}`} aria-hidden />
      {online ? "آنلاین" : "آفلاین"}
    </button>
  );
}
