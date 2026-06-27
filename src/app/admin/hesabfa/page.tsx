import { requireAdmin } from "@/lib/auth/guards";
import { getIntegrationConfigStatus } from "@/lib/admin/integration-config";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { HesabfaClient } from "@/components/admin/hesabfa/HesabfaClient";

export const dynamic = "force-dynamic";

export default async function HesabfaPage() {
  await requireAdmin();

  const configStatus = await getIntegrationConfigStatus();
  const isConnected =
    configStatus["hesabfa"]?.apiKey === true &&
    configStatus["hesabfa"]?.loginToken === true;

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="حسابفا"
        description="مدیریت مشتریان، اقلام، فاکتورها و اسناد حسابداری از طریق API حسابفا."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "حسابفا" },
        ]}
      />
      <HesabfaClient isConnected={isConnected} />
    </div>
  );
}
