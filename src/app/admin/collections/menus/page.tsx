import Link from "next/link";
import { Plus, Pencil, Menu } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { formatJalali } from "@/lib/date";
import { MENU_LOCATION_LABELS } from "@/lib/admin/site-experience";
import { toPersianNumbers } from "@/lib/price";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminDataTable, type TableColumn } from "@/components/admin/ui/AdminDataTable";
import { AdminListEmptyState } from "@/components/admin/ui/AdminListEmptyState";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  title: string;
  slug: string;
  locationLabel: string;
  itemCount: number;
  isActive: boolean;
  updatedAtLabel: string;
};

export default async function MenusListPage() {
  await requireAdmin();
  const list = await prisma.menu.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: { _count: { select: { items: true } } },
  });
  const rows: Row[] = list.map((m) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    locationLabel: MENU_LOCATION_LABELS[m.location] ?? m.location,
    itemCount: m._count.items,
    isActive: m.isActive,
    updatedAtLabel: formatJalali(m.updatedAt),
  }));

  const columns: TableColumn<Row>[] = [
    { key: "title", header: "عنوان", render: (r) => <span className="font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">{r.title}</span> },
    { key: "slug", header: "نامک", render: (r) => <span dir="ltr" className="font-mono text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">{r.slug}</span> },
    { key: "location", header: "جایگاه", render: (r) => <span className="text-xs text-dz-a-primary-600 dark:text-dz-a-primary-300">{r.locationLabel}</span> },
    { key: "count", header: "تعداد", align: "center", render: (r) => <span>{toPersianNumbers(r.itemCount)}</span> },
    { key: "active", header: "وضعیت", align: "center", render: (r) => <AdminStatusBadge tone={r.isActive ? "green" : "gray"}>{r.isActive ? "فعال" : "غیرفعال"}</AdminStatusBadge> },
    { key: "updatedAt", header: "ویرایش", render: (r) => <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">{r.updatedAtLabel}</span> },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (r) => (
        <Link href={`/admin/collections/menus/${r.id}`} className="inline-flex rounded-lg p-1.5 text-dz-a-primary-500 dark:text-dz-a-night-muted hover:bg-dz-a-primary-50 dark:hover:bg-white/5 hover:text-dz-a-primary-700 dark:hover:text-dz-a-night-fg" title="مدیریت">
          <Pencil className="size-4" />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="منوها"
        description="منوهای هدر، فوتر و موبایل و موارد داخل آن‌ها."
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "منوها" }]}
        actions={
          <Link href="/admin/collections/menus/new" className="inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-dz-a-primary-700">
            <Plus className="size-4" /> افزودن منو
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
            icon={<Menu className="size-7" />}
            title="هنوز منویی ثبت نشده است"
            description="منوهای هدر، فوتر و موبایل را بسازید و آیتم‌های داخل آن‌ها را مدیریت کنید."
            action={
              <Link href="/admin/collections/menus/new" className="inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-dz-a-primary-700">
                <Plus className="size-4" /> افزودن منو
              </Link>
            }
          />
        }
      />
    </div>
  );
}
