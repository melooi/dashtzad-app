import { requireAdmin } from "@/lib/auth/guards";
import { getIntegrationConfigStatus, getEffectiveValue } from "@/lib/admin/integration-config";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { SantralClient } from "@/components/admin/santral/SantralClient";

export const dynamic = "force-dynamic";

export default async function SantralPage() {
  await requireAdmin();

  const [configStatus, pbxNumber] = await Promise.all([
    getIntegrationConfigStatus(),
    getEffectiveValue("santral", "pbxNumber"),
  ]);

  const isConnected = configStatus["santral"]?.apiKey === true;

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="سانترال همکاران"
        description="مدیریت مرکز تماس، دفترچهٔ تماس، OTP صوتی و رویدادهای زندهٔ سانترال."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "سانترال همکاران" },
        ]}
      />
      <SantralClient isConnected={isConnected} pbxNumber={pbxNumber ?? ""} />
    </div>
  );
}
