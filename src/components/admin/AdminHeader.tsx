"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink, LogOut, Menu, UserCog } from "lucide-react";
import { AdminThemeToggle } from "./AdminThemeToggle";
import { AdminConfirmDialog } from "@/components/admin/ui/AdminConfirmDialog";

export function AdminHeader({
  name,
  onOpenMenu,
}: {
  name: string | null;
  onOpenMenu?: () => void;
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
      <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-dz-primary-100 bg-white/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/70 sm:gap-4 sm:px-6 dark:border-dz-night-border dark:bg-dz-night-elevated/85 dark:supports-[backdrop-filter]:bg-dz-night-elevated/70">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="باز کردن منو"
          className="focus-ring -ms-1 rounded-lg p-2 text-dz-primary-600 transition-colors hover:bg-dz-primary-50 hover:text-dz-primary-800 dark:text-dz-night-muted dark:hover:bg-white/5 dark:hover:text-dz-night-fg lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <Link
          href="/"
          target="_blank"
          className="focus-ring flex items-center gap-1.5 rounded-lg border border-dz-primary-200 px-2.5 py-1.5 text-sm text-dz-primary-700 transition-colors hover:bg-dz-primary-50 hover:text-dz-primary-900 sm:px-3 dark:border-dz-night-border dark:text-dz-night-muted dark:hover:bg-white/5 dark:hover:text-dz-night-fg"
        >
          <ExternalLink className="size-4 text-dz-primary-500 dark:text-dz-night-faint" />
          <span className="hidden sm:inline">مشاهده‌ی سایت</span>
        </Link>

        <div className="ms-auto flex items-center gap-2 sm:gap-3">
          <AdminThemeToggle />
          <span className="hidden items-center gap-2 rounded-lg bg-dz-primary-50 px-3 py-1.5 text-sm text-dz-primary-800 sm:flex dark:bg-dz-night-elevated dark:text-dz-night-fg">
            <span className="flex size-6 items-center justify-center rounded-full bg-dz-primary-600/10 text-dz-primary-600 dark:bg-dz-primary-400/15 dark:text-dz-primary-300">
              <UserCog className="size-3.5" />
            </span>
            {name ?? "مدیر"}
          </span>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={loading}
            aria-label={loading ? "در حال خروج…" : "خروج از حساب"}
            className="focus-ring flex items-center gap-1.5 rounded-lg border border-dz-primary-200 px-2.5 py-1.5 text-sm text-dz-primary-700 transition-colors hover:border-dz-error/40 hover:bg-dz-error/5 hover:text-dz-error disabled:opacity-60 sm:px-3 dark:border-dz-night-border dark:text-dz-night-muted dark:hover:border-dz-error/40 dark:hover:bg-dz-error/10 dark:hover:text-dz-error-300"
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
