import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { ChatSmsTab } from "@/components/admin/chat/ChatSmsTab";
import { listSmsTemplates, listSmsLogs } from "@/lib/sms/service";
import { getIntegrationConfigStatus } from "@/lib/admin/integration-config";

export const dynamic = "force-dynamic";

export default async function AdminSmsPage() {
  await requireAdmin();

  const [templates, logs, integrationStatus] = await Promise.all([
    listSmsTemplates(),
    listSmsLogs(50),
    getIntegrationConfigStatus(),
  ]);

  const providerStatus = {
    kavenegar: integrationStatus["kavenegar"]?.apiKey ?? false,
    rahpayam: integrationStatus["rahpayam"]?.apiKey ?? false,
  };

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="پیامک"
        description="ارسال پیامک، مدیریت قالب‌ها و لاگ ارسال‌ها از طریق کاوه‌نگار و راه‌پیام."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "پیامک" },
        ]}
      />
      <ChatSmsTab templates={templates} logs={logs} providerStatus={providerStatus} />
    </div>
  );
}
