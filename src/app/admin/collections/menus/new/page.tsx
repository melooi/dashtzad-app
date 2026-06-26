import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { MenuForm } from "@/components/admin/site/MenuForm";

export const dynamic = "force-dynamic";

export default async function NewMenuPage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-2xl">
      <AdminPageHeader
        title="افزودن منو"
        description="ابتدا منو را بسازید، سپس موارد آن را اضافه کنید."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "منوها", href: "/admin/collections/menus" },
          { label: "افزودن" },
        ]}
      />
      <MenuForm mode="create" />
    </div>
  );
}
