import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { FaqGroupForm } from "@/components/admin/site/FaqGroupForm";

export const dynamic = "force-dynamic";

export default async function NewFaqGroupPage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-2xl">
      <AdminPageHeader
        title="افزودن گروه سوالات"
        description="ابتدا گروه را بسازید، سپس سوال‌ها را اضافه کنید."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "سوالات متداول", href: "/admin/collections/faqs" },
          { label: "افزودن" },
        ]}
      />
      <FaqGroupForm mode="create" />
    </div>
  );
}
