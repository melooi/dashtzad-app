import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { formatJalali } from "@/lib/date";
import { toPersianNumbers } from "@/lib/price";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { AdminSearchInput } from "@/components/admin/ui/AdminSearchInput";
import { AdminDataTable, type TableColumn } from "@/components/admin/ui/AdminDataTable";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";

export const dynamic = "force-dynamic";

type Row = { id: string; title: string; status: string; count: number; updatedAtLabel: string };

export default async function CaseFilesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  const where: Prisma.ContentSeriesWhereInput = q
    ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] }
    : {};

  const list = await prisma.contentSeries.findMany({
    where: { ...where, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    include: { _count: { select: { posts: true } } },
  });

  const rows: Row[] = list.map((s) => ({
    id: s.id,
    title: s.title,
    status: s.status,
    count: s._count.posts,
    updatedAtLabel: formatJalali(s.updatedAt),
  }));

  const columns: TableColumn<Row>[] = [
    { key: "title", header: "عنوان", render: (r) => <span className="font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">{r.title}</span> },
    { key: "count", header: "مقاله‌ها", align: "center", render: (r) => <span className="text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">{toPersianNumbers(r.count)}</span> },
    { key: "status", header: "وضعیت", align: "center", render: (r) => <AdminStatusBadge tone={r.status === "PUBLISHED" ? "green" : "gray"}>{r.status === "PUBLISHED" ? "منتشرشده" : "پیش‌نویس"}</AdminStatusBadge> },
    { key: "updatedAt", header: "ویرایش", render: (r) => <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">{r.updatedAtLabel}</span> },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (r) => (
        <Link href={`/admin/content/case-files/${r.id}`} className="inline-flex rounded-lg p-1.5 text-dz-a-primary-500 hover:bg-dz-a-primary-50 hover:text-dz-a-primary-700 dark:text-dz-a-night-muted dark:hover:bg-white/5 dark:hover:text-dz-a-night-fg" title="ویرایش">
          <Pencil className="size-4" />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="پرونده‌ها"
        description="پرونده‌های ویژه — هاب‌هایی که چند مقاله‌ی مرتبط را گرد هم می‌آورند."
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "پرونده‌ها" }]}
        actions={
          <Link href="/admin/content/case-files/new" className="inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-dz-a-primary-700">
            <Plus className="size-4" /> پرونده‌ی جدید
          </Link>
        }
      />
      <AdminToolbar>
        <AdminSearchInput placeholder="جستجو بر اساس عنوان یا نامک…" />
      </AdminToolbar>
      <AdminDataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        empty={<p className="p-10 text-center text-sm text-dz-a-primary-400 dark:text-dz-a-night-faint">هنوز پرونده‌ای ثبت نشده.</p>}
      />
    </div>
  );
}
