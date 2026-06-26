"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";
import { AdminToastProvider } from "@/components/admin/ui/AdminToast";

const SIDEBAR_KEY = "dz-admin-sidebar";

export function AdminShell({
  user,
  notifications,
  children,
}: {
  user: { name: string | null };
  notifications?: { chatCount: number; contactCount: number };
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY) === "collapsed");
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, next ? "collapsed" : "expanded");
      return next;
    });
  };

  // Esc closes the mobile drawer; body scroll is locked while it's open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <AdminToastProvider>
      <div className="flex h-screen overflow-hidden bg-dz-a-canvas dark:bg-dz-a-night">
        {/* Backdrop — mobile/tablet only, sits beneath the drawer (z-50). */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-dz-a-primary-900/40 backdrop-blur-sm lg:hidden dark:bg-black/60"
            aria-hidden
            onClick={closeDrawer}
          />
        )}

        <AdminSidebar
          open={drawerOpen}
          onNavigate={closeDrawer}
          onClose={closeDrawer}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminHeader name={user.name} onOpenMenu={() => setDrawerOpen(true)} notifications={notifications} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">{children}</div>
          </main>
        </div>

        <AdminCommandPalette />
      </div>
    </AdminToastProvider>
  );
}
