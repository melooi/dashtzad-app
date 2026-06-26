import Link from "next/link";
import { Plus, Pencil, ArrowLeftRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { formatJalali } from "@/lib/date";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminDataTable, type TableColumn } from "@/components/admin/ui/AdminDataTable";
import { AdminListEmptyState } from "@/components/admin/ui/AdminListEmptyState";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  source: string;
  destination: string;
  statusCode: number;
  isActive: boolean;
  updatedAtLabel: string;
};

export default async function RedirectsListPage() {
  await requireAdmin();
  const list = await prisma.redirect.findMany({ orderBy: { updatedAt: "desc" } });
  const rows: Row[] = list.map((r) => ({
    id: r.id,
    source: r.source,
    destination: r.destination,
    statusCode: r.statusCode,
    isActive: r.isActive,
    updatedAtLabel: formatJalali(r.updatedAt),
  }));

  const columns: TableColumn<Row>[] = [
    { key: "source", header: "مبدأ", render: (r) => <span dir="ltr" className="font-mono text-dz-a-primary-800 dark:text-dz-a-night-fg">{r.source}</span> },
    { key: "destination", header: "مقصد", render: (r) => <span dir="ltr" className="font-mono text-dz-a-primary-600 dark:text-dz-a-primary-300">{r.destination}</span> },
    { key: "statusCode", header: "کد", align: "center", render: (r) => <span dir="ltr">{r.statusCode}</span> },
    { key: "active", header: "وضعیت", align: "center", render: (r) => <AdminStatusBadge tone={r.isActive ? "green" : "gray"}>{r.isActive ? "فعال" : "غیرفعال"}</AdminStatusBadge> },
    { key: "updatedAt", header: "ویرایش", render: (r) => <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">{r.updatedAtLabel}</span> },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (r) => (
        <Link href={`/admin/collections/redirects/${r.id}`} className="inline-flex rounded-lg p-1.5 text-dz-a-primary-500 dark:text-dz-a-night-muted hover:bg-dz-a-primary-50 dark:hover:bg-white/5 hover:text-dz-a-primary-700 dark:hover:text-dz-a-night-fg" title="ویرایش">
          <Pencil className="size-4" />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="ریدایرکت‌ها"
        description="مدیریت تغییر مسیر URLها (۳۰۱/۳۰۲). اعمالِ زنده در فرانت‌اند (middleware) در گام بعدی فعال می‌شود."
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "ریدایرکت‌ها" }]}
        actions={
          <Link href="/admin/collections/redirects/new" className="inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-dz-a-primary-700">
            <Plus className="size-4" /> افزودن ریدایرکت
          </Link>
        }
      />
      <AdminDataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        empty={
          <AdminListEmptyState
            mode="empty"
            icon={<ArrowLeftRight className="size-7" />}
            title="هنوز ریدایرکتی ثبت نشده است"
            description="تغییر مسیر URLها (۳۰۱/۳۰۲) را برای حفظ سئو هنگام تغییر آدرس‌ها تعریف کنید."
            action={
              <Link href="/admin/collections/redirects/new" className="inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-dz-a-primary-700">
                <Plus className="size-4" /> افزودن ریدایرکت
              </Link>
            }
          />
        }
      />
    </div>
  );
}
