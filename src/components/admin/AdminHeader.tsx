"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Headset, LogOut, Menu, MessageSquare, Search, UserCog } from "lucide-react";
import { AdminThemeToggle } from "./AdminThemeToggle";
import { AdminConfirmDialog } from "@/components/admin/ui/AdminConfirmDialog";
import { OPEN_COMMAND_EVENT } from "@/components/admin/AdminCommandPalette";
import { toPersianNumbers } from "@/lib/price";

export function AdminHeader({
  name,
  onOpenMenu,
  notifications,
}: {
  name: string | null;
  onOpenMenu?: () => void;
  notifications?: { chatCount: number; contactCount: number };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const logout = async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth");
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-dz-a-primary-100 bg-dz-a-canvas/85 px-4 backdrop-blur supports-backdrop-filter:bg-dz-a-canvas/70 sm:gap-4 sm:px-6 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated/85 dark:supports-backdrop-filter:bg-dz-a-night-elevated/70">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="باز کردن منو"
          className="focus-ring -ms-1 rounded-lg p-2 text-dz-a-primary-600 transition-colors hover:bg-dz-a-primary-50 hover:text-dz-a-primary-800 dark:text-dz-a-night-muted dark:hover:bg-white/5 dark:hover:text-dz-a-night-fg lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent(OPEN_COMMAND_EVENT))}
          aria-label="جست‌وجوی سریع"
          className="focus-ring flex items-center gap-2 rounded-lg border border-dz-a-primary-200 px-2.5 py-1.5 text-sm text-dz-a-primary-400 transition-colors hover:bg-dz-a-primary-50 hover:text-dz-a-primary-600 sm:px-3 dark:border-dz-a-night-border dark:text-dz-a-night-faint dark:hover:bg-white/5 dark:hover:text-dz-a-night-muted"
        >
          <Search className="size-4" />
          <span className="hidden md:inline">جست‌وجو…</span>
          <kbd className="hidden rounded border border-dz-a-primary-200 px-1 font-sans text-[10px] leading-4 md:inline dark:border-dz-a-night-border">
            ⌘K
          </kbd>
        </button>

        <div className="ms-auto flex items-center gap-2 sm:gap-3">
          {/* Notification icons */}
          {(notifications?.chatCount ?? 0) > 0 && (
            <Link
              href="/admin/chat"
              aria-label={`${notifications!.chatCount} گفتگوی باز`}
              className="focus-ring relative rounded-lg p-2 text-dz-a-primary-500 transition-colors hover:bg-dz-a-primary-50 hover:text-dz-a-primary-700 dark:text-dz-a-night-muted dark:hover:bg-white/5 dark:hover:text-dz-a-night-fg"
            >
              <Headset className="size-5" />
              <span className="absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-dz-a-error text-[10px] font-bold text-white">
                {notifications!.chatCount > 9 ? "۹+" : toPersianNumbers(notifications!.chatCount)}
              </span>
            </Link>
          )}
          {(notifications?.contactCount ?? 0) > 0 && (
            <Link
              href="/admin/collections/contact-messages?status=NEW"
              aria-label={`${notifications!.contactCount} پیام جدید فرم تماس`}
              className="focus-ring relative rounded-lg p-2 text-dz-a-primary-500 transition-colors hover:bg-dz-a-primary-50 hover:text-dz-a-primary-700 dark:text-dz-a-night-muted dark:hover:bg-white/5 dark:hover:text-dz-a-night-fg"
            >
              <MessageSquare className="size-5" />
              <span className="absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-dz-a-warning text-[10px] font-bold text-white">
                {notifications!.contactCount > 9 ? "۹+" : toPersianNumbers(notifications!.contactCount)}
              </span>
            </Link>
          )}
          <AdminThemeToggle />
          <span className="hidden items-center gap-2 rounded-lg bg-dz-a-primary-50 px-3 py-1.5 text-sm text-dz-a-primary-800 sm:flex dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg">
            <span className="flex size-6 items-center justify-center rounded-full bg-dz-a-primary-600/10 text-dz-a-primary-600 dark:bg-dz-a-primary-400/15 dark:text-dz-a-primary-300">
              <UserCog className="size-3.5" />
            </span>
            {name ?? "مدیر"}
          </span>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={loading}
            aria-label={loading ? "در حال خروج…" : "خروج از حساب"}
            className="focus-ring flex items-center gap-1.5 rounded-lg border border-dz-a-primary-200 px-2.5 py-1.5 text-sm text-dz-a-primary-700 transition-colors hover:border-dz-a-error/40 hover:bg-dz-a-error/5 hover:text-dz-a-error disabled:opacity-60 sm:px-3 dark:border-dz-a-night-border dark:text-dz-a-night-muted dark:hover:border-dz-a-error/40 dark:hover:bg-dz-a-error/10 dark:hover:text-dz-a-error-300"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">{loading ? "در حال خروج…" : "خروج"}</span>
          </button>
        </div>
      </header>

      <AdminConfirmDialog
        open={confirmOpen}
        title="خروج از پنل مدیریت"
        description="آیا مطمئن هستید؟ تغییرات ذخیره‌نشده‌ی فرم‌های باز از دست می‌روند."
        confirmLabel="خروج"
        cancelLabel="انصراف"
        danger
        loading={loading}
        onConfirm={logout}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
