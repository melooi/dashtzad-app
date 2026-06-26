"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headset } from "lucide-react";
import { toPersianNumbers } from "@/lib/price";

/**
 * CHAT-CP1 — branded admin floating launcher. Mirrors the storefront launcher's
 * shape/position (bottom-right in RTL) but in the dz palette. Hides itself while
 * already inside the inbox, and is dark-mode safe.
 */
export function AdminChatLauncher({ openCount, label }: { openCount: number; label: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin/chat")) return null;

  return (
    <Link
      href="/admin/chat"
      aria-label={label}
      className="focus-ring group fixed bottom-6 start-6 z-30 inline-flex items-center gap-3 rounded-full bg-dz-a-primary-600 py-2 ps-2 pe-5 text-white shadow-[0_0.75rem_2rem_rgba(20,22,14,0.28)] transition-all duration-300 hover:bg-dz-a-primary-700 hover:shadow-[0_1rem_2.5rem_rgba(20,22,14,0.34)] active:scale-[0.98]"
    >
      <span className="relative grid size-10 place-items-center rounded-full bg-white/15">
        <Headset className="size-5" aria-hidden />
        {openCount > 0 && (
          <span className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-dz-a-primary-600 bg-dz-a-warning text-[0.62rem] font-bold text-dz-a-primary-900">
            {toPersianNumbers(openCount)}
          </span>
        )}
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[0.95rem] font-bold">{label}</span>
        <span className="text-[0.7rem] font-medium text-white/80">
          {openCount > 0 ? `${toPersianNumbers(openCount)} گفت‌وگوی باز` : "پشتیبانی"}
        </span>
      </span>
    </Link>
  );
}
