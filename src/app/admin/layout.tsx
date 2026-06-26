import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminShell } from "@/components/admin/AdminShell";
import { getChatSettings } from "@/lib/admin/global-service";
import { getAdminChatCounts } from "@/lib/chat/service";
import { prisma } from "@/lib/prisma";

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
  const newContactCount = await prisma.contactMessage.count({ where: { status: "NEW" } });

  return (
    <>
      <AdminShell
        user={{ name: user.name }}
        notifications={{ chatCount: open, contactCount: newContactCount }}
      >
        {children}
      </AdminShell>
    </>
  );
}
