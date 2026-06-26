"use client";

import { Calendar, LogOut } from "lucide-react";
import { NAV, type ViewId } from "./nav";
import { formatJalali } from "@/lib/date";
import { toPersianNumbers } from "@/lib/price";
import type { AccountProfile } from "@/lib/account/types";

export function Sidebar({
  user,
  view,
  onNavigate,
  onLogout,
  counts,
}: {
  user: AccountProfile;
  view: ViewId;
  onNavigate: (id: ViewId) => void;
  onLogout: () => void;
  counts: Partial<Record<ViewId, number>>;
}) {
  const initial = user.name?.trim()?.[0] ?? "د";

  return (
    <aside className="md:sticky md:top-24">
      <div className="rounded-2xl border border-store-border bg-store-surface p-4 shadow-store-xs">
        {/* user card */}
        <div className="flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-store-primary font-heading text-lg font-bold text-store-text-inverse">
            {initial}
          </span>
          <div className="min-w-0">
            <div className="truncate font-bold text-store-text">
              {user.name || "کاربر دشت‌زاد"}
            </div>
            <div dir="ltr" className="truncate text-left text-sm text-store-text-faint">
              {toPersianNumbers(user.phoneNumber)}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-store-surface-soft px-3 py-2 text-xs text-store-text-muted">
          <Calendar className="size-3.5 shrink-0" aria-hidden />
          عضو از {formatJalali(user.createdAtISO)}
        </div>

        {/* nav — horizontal scroll on mobile, vertical on desktop */}
        <nav className="mt-4 flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
          {NAV.map((n) => {
            const active = view === n.id;
            const Icon = n.icon;
            const count = counts[n.id];
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => onNavigate(n.id)}
                aria-current={active ? "page" : undefined}
                className={`store-focus flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors md:w-full ${
                  active
                    ? "bg-store-primary-soft font-bold text-store-primary-hover"
                    : "text-store-text-muted hover:bg-store-surface-soft hover:text-store-text"
                }`}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className="whitespace-nowrap">{n.label}</span>
                {count != null && count > 0 && (
                  <span
                    className={`ms-auto hidden rounded-full px-1.5 py-0.5 text-xs font-bold md:inline ${
                      active
                        ? "bg-store-primary text-store-text-inverse"
                        : "bg-store-surface-soft text-store-text-faint"
                    }`}
                  >
                    {toPersianNumbers(count)}
                  </span>
                )}
              </button>
            );
          })}

          <div className="my-1 hidden h-px bg-store-border md:block" />

          <button
            type="button"
            onClick={onLogout}
            className="store-focus flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-store-clay-deep transition-colors hover:bg-store-clay-soft md:w-full"
          >
            <LogOut className="size-[18px] shrink-0" />
            <span className="whitespace-nowrap">خروج از حساب</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
