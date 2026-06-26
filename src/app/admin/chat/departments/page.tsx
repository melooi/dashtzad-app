import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { DepartmentsManager } from "@/components/admin/chat/DepartmentsManager";
import { listDepartmentsAdmin, listOperators } from "@/lib/chat/service";

export const dynamic = "force-dynamic";

export default async function ChatDepartmentsPage() {
  await requireAdmin();
  const [departments, operators] = await Promise.all([listDepartmentsAdmin(), listOperators()]);

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="دپارتمان‌های چت"
        description="تیم‌ها را تعریف کنید و اپراتورها را به آن‌ها اختصاص دهید. گفت‌وگوها را می‌توان به دپارتمان‌ها مسیردهی کرد."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "چت و پشتیبانی", href: "/admin/chat" },
          { label: "دپارتمان‌ها" },
        ]}
        actions={
          <Link
            href="/admin/chat"
            className="focus-ring inline-flex items-center gap-2 rounded-xl border border-dz-a-primary-200 px-4 py-2.5 text-sm font-medium text-dz-a-primary-700 transition-colors hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
          >
            <ArrowRight className="size-4" aria-hidden />
            بازگشت به صندوق
          </Link>
        }
      />
      <DepartmentsManager departments={departments} operators={operators} />
    </div>
  );
}
