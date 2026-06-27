"use client";

import { Phone } from "lucide-react";
import { useVoip } from "@/components/admin/VoipProvider";

export function CallButton({
  num,
  name = "",
  size = "sm",
}: {
  num: string;
  name?: string;
  size?: "xs" | "sm";
}) {
  const { startCall } = useVoip();
  if (!num) return null;

  const cls =
    size === "xs"
      ? "inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-400/10 dark:text-emerald-400"
      : "inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-400/10 dark:text-emerald-400";

  return (
    <button
      onClick={() => startCall(num, name)}
      className={cls}
      title={`تماس با ${num}`}
    >
      <Phone className="size-3.5" />
      تماس
    </button>
  );
}
