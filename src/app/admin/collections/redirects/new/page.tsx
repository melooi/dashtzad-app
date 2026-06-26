import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { RedirectForm } from "@/components/admin/site/RedirectForm";

export const dynamic = "force-dynamic";

export default async function NewRedirectPage() {
  await requireAdmin();
  return (
    <div>
      <AdminPageHeader
        title="افزودن ریدایرکت"
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "ریدایرکت‌ها", href: "/admin/collections/redirects" },
          { label: "افزودن" },
        ]}
      />
      <RedirectForm mode="create" />
    </div>
  );
}
