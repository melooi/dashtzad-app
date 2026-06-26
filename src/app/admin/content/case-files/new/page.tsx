import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { CaseFileForm } from "@/components/admin/content/CaseFileForm";

export const dynamic = "force-dynamic";

export default async function NewCaseFilePage() {
  await requireAdmin();
  return (
    <div>
      <AdminPageHeader
        title="پرونده‌ی جدید"
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "پرونده‌ها", href: "/admin/content/case-files" },
          { label: "جدید" },
        ]}
      />
      <CaseFileForm mode="create" />
    </div>
  );
}
