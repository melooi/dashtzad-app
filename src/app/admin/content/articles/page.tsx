import Link from "next/link";
import { Plus, Pencil, FileText, ChefHat, Library } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { formatJalali } from "@/lib/date";
import { ARTICLE_TYPE_OPTIONS, articleTypeLabel } from "@/lib/admin/article-types";
import { ARTICLE_STATUS_LABELS } from "@/lib/admin/articles";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { AdminSearchInput } from "@/components/admin/ui/AdminSearchInput";
import { AdminFilterBar } from "@/components/admin/ui/AdminFilterBar";
import { AdminDataTable, type TableColumn } from "@/components/admin/ui/AdminDataTable";
import { AdminListEmptyState } from "@/components/admin/ui/AdminListEmptyState";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";

export const dynamic = "force-dynamic";

const TYPE_VALUES: string[] = ARTICLE_TYPE_OPTIONS.map((o) => o.value);
const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی‌ترین" },
  { value: "title", label: "عنوان (الفبا)" },
  { value: "type", label: "نوع مقاله" },
];

type Row = {
  id: string;
  title: string;
  typeLabel: string;
  categoryTitle: string;
  status: string;
  authorName: string;
  dateLabel: string;
};

export default async function ArticlesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const type = sp.type && TYPE_VALUES.includes(sp.type) ? sp.type : undefined;
  const status = sp.status === "DRAFT" || sp.status === "PUBLISHED" ? sp.status : undefined;
  const sort = sp.sort ?? "newest";

  const where: Prisma.PostWhereInput = {
    ...(type ? { articleType: type as Prisma.PostWhereInput["articleType"] } : {}),
    ...(status ? { status: status as Prisma.PostWhereInput["status"] } : {}),
    ...(q
      ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] }
      : {}),
  };

  const orderBy: Prisma.PostOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "title"
        ? { title: "asc" }
        : sort === "type"
          ? { articleType: "asc" }
          : { createdAt: "desc" };

  const list = await prisma.post.findMany({
    where: { ...where, deletedAt: null },
    orderBy,
    include: { author: { select: { name: true } }, category: { select: { title: true } } },
    take: 200,
  });

  const rows: Row[] = list.map((p) => ({
    id: p.id,
    title: p.title,
    typeLabel: articleTypeLabel(p.articleType),
    categoryTitle: p.category?.title ?? "—",
    status: p.status,
    authorName: p.author?.name ?? "—",
    dateLabel: formatJalali(p.publishedAt ?? p.createdAt),
  }));

  const columns: TableColumn<Row>[] = [
    { key: "title", header: "عنوان", render: (r) => <span className="font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">{r.title}</span> },
    { key: "type", header: "نوع مقاله", render: (r) => <span className="text-xs text-dz-a-primary-600 dark:text-dz-a-primary-300">{r.typeLabel}</span> },
    { key: "category", header: "دسته", render: (r) => <span className="text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">{r.categoryTitle}</span> },
    { key: "author", header: "نویسنده", render: (r) => <span className="text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">{r.authorName}</span> },
    {
      key: "status",
      header: "وضعیت",
      align: "center",
      render: (r) => (
        <AdminStatusBadge tone={r.status === "PUBLISHED" ? "green" : "gray"}>{ARTICLE_STATUS_LABELS[r.status] ?? r.status}</AdminStatusBadge>
      ),
    },
    { key: "date", header: "تاریخ", render: (r) => <span className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">{r.dateLabel}</span> },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (r) => (
        <Link href={`/admin/content/articles/${r.id}`} className="inline-flex rounded-lg p-1.5 text-dz-a-primary-500 hover:bg-dz-a-primary-50 hover:text-dz-a-primary-700 dark:text-dz-a-night-muted dark:hover:bg-white/5 dark:hover:text-dz-a-night-fg" title="ویرایش">
          <Pencil className="size-4" />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="نوشته‌ها"
        description="مقاله، دستور پخت و پرونده — بر اساس نوع، دسته و وضعیت."
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "نوشته‌ها" }]}
      />

      {/* Quick-create section */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href="/admin/content/articles/new?type=TASTE_STORY"
          className="group flex items-center gap-3 rounded-2xl border border-dz-a-primary-200 bg-white px-4 py-3.5 transition-colors hover:border-dz-a-primary-400 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:hover:border-dz-a-primary-500/50 dark:hover:bg-white/5"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-dz-a-primary-100 text-dz-a-primary-600 group-hover:bg-dz-a-primary-200 dark:bg-white/10 dark:text-dz-a-primary-300 dark:group-hover:bg-white/15">
            <FileText className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg">مقاله‌ی جدید</p>
            <p className="truncate text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">مجله، دانستنی، سلامت…</p>
          </div>
          <Plus className="ms-auto size-4 shrink-0 text-dz-a-primary-400 group-hover:text-dz-a-primary-600 dark:text-dz-a-night-muted dark:group-hover:text-dz-a-night-fg" />
        </Link>

        <Link
          href="/admin/content/articles/new?type=RECIPE"
          className="group flex items-center gap-3 rounded-2xl border border-dz-a-primary-200 bg-white px-4 py-3.5 transition-colors hover:border-dz-a-primary-400 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:hover:border-dz-a-primary-500/50 dark:hover:bg-white/5"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-dz-a-primary-100 text-dz-a-primary-600 group-hover:bg-dz-a-primary-200 dark:bg-white/10 dark:text-dz-a-primary-300 dark:group-hover:bg-white/15">
            <ChefHat className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg">دستور پخت جدید</p>
            <p className="truncate text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">با کارت دستور، مواد و مراحل</p>
          </div>
          <Plus className="ms-auto size-4 shrink-0 text-dz-a-primary-400 group-hover:text-dz-a-primary-600 dark:text-dz-a-night-muted dark:group-hover:text-dz-a-night-fg" />
        </Link>

        <Link
          href="/admin/content/case-files/new"
          className="group flex items-center gap-3 rounded-2xl border border-dz-a-primary-200 bg-white px-4 py-3.5 transition-colors hover:border-dz-a-primary-400 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:hover:border-dz-a-primary-500/50 dark:hover:bg-white/5"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-dz-a-primary-100 text-dz-a-primary-600 group-hover:bg-dz-a-primary-200 dark:bg-white/10 dark:text-dz-a-primary-300 dark:group-hover:bg-white/15">
            <Library className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg">پرونده‌ی جدید</p>
            <p className="truncate text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">مجموعه‌ای از نوشته‌های مرتبط</p>
          </div>
          <Plus className="ms-auto size-4 shrink-0 text-dz-a-primary-400 group-hover:text-dz-a-primary-600 dark:text-dz-a-night-muted dark:group-hover:text-dz-a-night-fg" />
        </Link>
      </div>

      <AdminToolbar>
        <AdminSearchInput placeholder="جستجو بر اساس عنوان یا نامک…" />
        <AdminFilterBar
          filters={[
            { paramKey: "type", label: "نوع مقاله", options: [{ value: "", label: "همه‌ی انواع" }, ...ARTICLE_TYPE_OPTIONS] },
            { paramKey: "status", label: "وضعیت", options: [{ value: "", label: "همه‌ی وضعیت‌ها" }, { value: "PUBLISHED", label: "منتشرشده" }, { value: "DRAFT", label: "پیش‌نویس" }] },
            { paramKey: "sort", label: "مرتب‌سازی", options: SORT_OPTIONS },
          ]}
        />
      </AdminToolbar>
      <AdminDataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        empty={
          <AdminListEmptyState
            mode={Boolean(q || type || status) ? "no-results" : "empty"}
            icon={<FileText className="size-7" />}
            title="هنوز نوشته‌ای ثبت نشده است"
            description="اولین نوشته را بسازید؛ می‌توانید نوع (مقاله، دستور پخت، پرونده)، دسته و وضعیت انتشار را مشخص کنید."
            action={
              <Link href="/admin/content/articles/new" className="inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-dz-a-primary-700">
                <Plus className="size-4" /> مقاله‌ی جدید
              </Link>
            }
            clearFiltersHref="/admin/content/articles"
          />
        }
      />
    </div>
  );
}
