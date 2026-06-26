import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminThemeScript } from "@/components/admin/AdminThemeScript";
import { getChatSettings } from "@/lib/admin/global-service";
import { getAdminChatCounts } from "@/lib/chat/service";

export const metadata: Metadata = {
  title: "پنل مدیریت | دشت‌زاد",
  robots: { index: false, follow: false },
};

// Guards every /admin route with the existing OTP/session auth (role=ADMIN).
// Unauthenticated → /auth ; non-admin USER → / (see requireAdmin).
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const chatSettings = await getChatSettings();
  const showLauncher = chatSettings.enabled && chatSettings.showAdminLauncher;
  const { open } = showLauncher ? await getAdminChatCounts() : { open: 0 };

  return (
    <>
      <AdminThemeScript />
      <AdminShell
        user={{ name: user.name }}
        chat={{ showLauncher, openCount: open, label: "چت و پشتیبانی" }}
      >
        {children}
      </AdminShell>
    </>
  );
}
