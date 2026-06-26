import { requireAdmin } from "@/lib/auth/guards";
import { getGlobalConfig } from "@/lib/admin/globals";
import { readGlobalRaw, loadFieldContext, ctxFlagsForGlobal } from "@/lib/admin/global-service";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { GlobalForm } from "@/components/admin/globals/GlobalForm";

export const dynamic = "force-dynamic";

// CHAT-CP1 — chat settings reuse the shared config-driven GlobalForm engine
// (clean fields, dark-mode-safe, repeatable lists — never raw JSON).
export default async function ChatSettingsPage() {
  await requireAdmin();
  const cfg = getGlobalConfig("chatSettings")!;
  const [data, ctx] = await Promise.all([
    readGlobalRaw("chatSettings"),
    loadFieldContext(ctxFlagsForGlobal("chatSettings")),
  ]);

  return (
    <div>
      <AdminPageHeader
        title={cfg.label}
        description={cfg.description}
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "چت و پشتیبانی", href: "/admin/chat" },
          { label: "تنظیمات" },
        ]}
      />
      <GlobalForm globalKey="chatSettings" initialData={data} ctx={ctx} />
    </div>
  );
}
