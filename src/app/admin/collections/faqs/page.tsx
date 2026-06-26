import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { formatJalali } from "@/lib/date";
import { FAQ_PLACEMENT_LABELS } from "@/lib/admin/site-experience";
import { toPersianNumbers } from "@/lib/price";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminDataTable, type TableColumn } from "@/components/admin/ui/AdminDataTable";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  title: string;
  placementLabel: string;
  itemCount: number;
  isActive: boolean;
  updatedAtLabel: string;
};

export default async function FaqsListPage() {
  await requireAdmin();
  const list = await prisma.fAQGroup.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    include: { _count: { select: { items: true } } },
  });
  const rows: Row[] = list.map((g) => ({
    id: g.id,
    title: g.title,
    placementLabel: FAQ_PLACEMENT_LABELS[g.placement] ?? g.placement,
    itemCount: g._count.items,
    isActive: g.isActive,
    updatedAtLabel: formatJalali(g.updatedAt),
  }));

  const columns: TableColumn<Row>[] = [
    { key: "title", header: "گروه", render: (r) => <span className="font-medium text-dz-primary-800 dark:text-dz-night-fg">{r.title}</span> },
    { key: "placement", header: "جایگاه", render: (r) => <span className="text-xs text-dz-primary-600 dark:text-dz-primary-300">{r.placementLabel}</span> },
    { key: "count", header: "تعداد سوال", align: "center", render: (r) => <span>{toPersianNumbers(r.itemCount)}</span> },
    { key: "active", header: "وضعیت", align: "center", render: (r) => <AdminStatusBadge tone={r.isActive ? "green" : "gray"}>{r.isActive ? "فعال" : "غیرفعال"}</AdminStatusBadge> },
    { key: "updatedAt", header: "ویرایش", render: (r) => <span className="text-xs text-dz-primary-400 dark:text-dz-night-faint">{r.updatedAtLabel}</span> },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (r) => (
        <Link href={`/admin/collections/faqs/${r.id}`} className="inline-flex rounded-lg p-1.5 text-dz-primary-500 dark:text-dz-night-muted hover:bg-dz-primary-50 dark:hover:bg-white/5 hover:text-dz-primary-700 dark:hover:text-dz-night-fg" title="مدیریت">
          <Pencil className="size-4" />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="سوالات متداول"
        description="گروه‌های سوالات متداول و مدیریت سوال‌های هر گروه."
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "سوالات متداول" }]}
        actions={
          <Link href="/admin/collections/faqs/new" className="inline-flex items-center gap-2 rounded-xl bg-dz-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-dz-primary-700">
            <Plus className="size-4" /> افزودن گروه
          </Link>
        }
      />
      <AdminDataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        empty={<p className="p-10 text-center text-sm text-dz-primary-400 dark:text-dz-night-faint">هنوز گروهی ثبت نشده.</p>}
      />
    </div>
  );
}
