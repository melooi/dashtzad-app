import { requireAdmin } from "@/lib/auth/guards";
import { getChatSettings } from "@/lib/admin/global-service";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { CannedRepliesManager } from "@/components/admin/chat/CannedRepliesManager";
import { ChatHeaderActions } from "@/components/admin/chat/ChatHeaderActions";

export const dynamic = "force-dynamic";

export default async function CannedRepliesPage() {
  await requireAdmin();
  const settings = await getChatSettings();
  const cannedReplies = settings.cannedReplies;

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="پیام‌های آماده"
        description="پاسخ‌های سریع برای اپراتورها — در کادر پاسخ قابل درج هستند."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "چت و پشتیبانی", href: "/admin/chat" },
          { label: "پیام‌های آماده" },
        ]}
        actions={<ChatHeaderActions />}
      />
      <CannedRepliesManager initialReplies={cannedReplies} />
    </div>
  );
}
