import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { BannerForm } from "@/components/admin/site/BannerForm";

export const dynamic = "force-dynamic";

export default async function NewBannerPage() {
  await requireAdmin();
  return (
    <div>
      <AdminPageHeader
        title="افزودن بنر"
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "بنرها", href: "/admin/collections/banners" },
          { label: "افزودن" },
        ]}
      />
      <BannerForm mode="create" />
    </div>
  );
}
