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
          ? "border-dz-a-success/40 bg-dz-a-success/10 text-dz-a-success dark:text-dz-a-success-300"
          : "border-dz-a-primary-200 text-dz-a-primary-500 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-muted dark:hover:bg-white/5"
      }`}
    >
      <span className={`size-2 rounded-full ${online ? "bg-dz-a-success" : "bg-dz-a-primary-300 dark:bg-dz-a-night-faint"}`} aria-hidden />
      {online ? "آنلاین" : "آفلاین"}
    </button>
  );
}
