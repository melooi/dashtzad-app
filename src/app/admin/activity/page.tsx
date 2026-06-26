import { Activity } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

export const dynamic = "force-dynamic";

// Activity/audit logging is not wired yet — there is no Activity/Audit model or
// service in the schema. This page is intentionally a read-only, honest empty
// state rather than fabricated activity rows.
export default async function ActivityPage() {
  await requireAdmin();

  return (
    <div>
      <AdminPageHeader
        title="فعالیت‌ها"
        description="گزارش رویدادهای پنل مدیریت."
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "فعالیت‌ها" }]}
      />
      <AdminEmptyState
        title="گزارش فعالیت‌ها هنوز فعال نشده است"
        description="ثبت رویدادهای پنل (audit log) هنوز به سیستم متصل نیست؛ مدلی برای ذخیره‌ی فعالیت‌ها در پایگاه‌داده تعریف نشده. تا زمان فعال‌سازی، این بخش هیچ داده‌ای نمایش نمی‌دهد."
        icon={<Activity className="size-7" />}
      />
    </div>
  );
}
