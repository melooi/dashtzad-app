"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminChatLauncher } from "@/components/admin/chat/AdminChatLauncher";

// Admin chrome: sidebar + top header + scrollable content. RTL by inheritance
// from the root <html dir="rtl">.
//
// Responsive: on lg+ the sidebar is an in-flow column. Below lg it collapses to
// an off-canvas drawer that slides in from the right (RTL side) over a backdrop,
// opened by the header's menu button and closed by Esc / backdrop / nav click.
export function AdminShell({
  user,
  chat,
  children,
}: {
  user: { name: string | null };
  chat?: { showLauncher: boolean; openCount: number; label: string };
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

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
    <div className="flex h-screen overflow-hidden bg-dz-canvas dark:bg-dz-night">
      {/* Backdrop — mobile/tablet only, sits beneath the drawer (z-50). */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-dz-primary-900/40 backdrop-blur-sm lg:hidden dark:bg-black/60"
          aria-hidden
          onClick={closeDrawer}
        />
      )}

      <AdminSidebar open={drawerOpen} onNavigate={closeDrawer} onClose={closeDrawer} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader name={user.name} onOpenMenu={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">{children}</div>
        </main>
      </div>

      {chat?.showLauncher && <AdminChatLauncher openCount={chat.openCount} label={chat.label} />}
    </div>
  );
}
