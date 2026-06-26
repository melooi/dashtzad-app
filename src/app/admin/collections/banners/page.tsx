import Link from "next/link";
import { Plus, Pencil, GalleryHorizontal } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { formatJalali } from "@/lib/date";
import { BANNER_PLACEMENT_OPTIONS, BANNER_PLACEMENT_LABELS } from "@/lib/admin/site-experience";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { AdminSearchInput } from "@/components/admin/ui/AdminSearchInput";
import { AdminFilterBar } from "@/components/admin/ui/AdminFilterBar";
import { AdminDataTable, type TableColumn } from "@/components/admin/ui/AdminDataTable";
import { AdminListEmptyState } from "@/components/admin/ui/AdminListEmptyState";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  title: string;
  placementLabel: string;
  isActive: boolean;
  windowLabel: string;
  updatedAtLabel: string;
};

const PLACEMENTS = BANNER_PLACEMENT_OPTIONS.map((o) => o.value);

export default async function BannersListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const placement = sp.placement && PLACEMENTS.includes(sp.placement) ? sp.placement : undefined;

  const hasActiveFilters = Boolean(q || placement);
  const addButton = (
    <Link href="/admin/collections/banners/new" className="inline-flex items-center gap-2 rounded-xl bg-dz-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-dz-primary-700">
      <Plus className="size-4" /> افزودن بنر
    </Link>
  );

  const where: Prisma.BannerWhereInput = {
    ...(placement ? { placement: placement as Prisma.BannerWhereInput["placement"] } : {}),
    ...(q
      ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] }
      : {}),
  };

  const list = await prisma.banner.findMany({ where, orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] });
  const rows: Row[] = list.map((b) => ({
    id: b.id,
    title: b.title,
    placementLabel: BANNER_PLACEMENT_LABELS[b.placement] ?? b.placement,
    isActive: b.isActive,
    windowLabel:
      b.startsAt || b.endsAt
        ? `${b.startsAt ? formatJalali(b.startsAt) : "…"} – ${b.endsAt ? formatJalali(b.endsAt) : "…"}`
        : "همیشه",
    updatedAtLabel: formatJalali(b.updatedAt),
  }));

  const columns: TableColumn<Row>[] = [
    { key: "title", header: "عنوان", render: (r) => <span className="font-medium text-dz-primary-800 dark:text-dz-night-fg">{r.title}</span> },
    { key: "placement", header: "جایگاه", render: (r) => <span className="text-xs text-dz-primary-600 dark:text-dz-primary-300">{r.placementLabel}</span> },
    { key: "window", header: "بازه‌ی نمایش", render: (r) => <span className="text-xs text-dz-primary-500 dark:text-dz-night-muted">{r.windowLabel}</span> },
    { key: "active", header: "وضعیت", align: "center", render: (r) => <AdminStatusBadge tone={r.isActive ? "green" : "gray"}>{r.isActive ? "فعال" : "غیرفعال"}</AdminStatusBadge> },
    { key: "updatedAt", header: "ویرایش", render: (r) => <span className="text-xs text-dz-primary-400 dark:text-dz-night-faint">{r.updatedAtLabel}</span> },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (r) => (
        <Link href={`/admin/collections/banners/${r.id}`} className="inline-flex rounded-lg p-1.5 text-dz-primary-500 dark:text-dz-night-muted hover:bg-dz-primary-50 dark:hover:bg-white/5 hover:text-dz-primary-700 dark:hover:text-dz-night-fg" title="ویرایش">
          <Pencil className="size-4" />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="بنرها"
        description="بنرهای تبلیغاتی سایت بر اساس جایگاه و بازه‌ی زمانی."
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "بنرها" }]}
        actions={addButton}
      />
      <AdminToolbar>
        <AdminSearchInput placeholder="جستجو بر اساس عنوان یا نامک…" />
        <AdminFilterBar
          filters={[{ paramKey: "placement", label: "جایگاه", options: [{ value: "", label: "همه‌ی جایگاه‌ها" }, ...BANNER_PLACEMENT_OPTIONS] }]}
        />
      </AdminToolbar>
      <AdminDataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        empty={
          <AdminListEmptyState
            mode={hasActiveFilters ? "no-results" : "empty"}
            icon={<GalleryHorizontal className="size-7" />}
            title="هنوز بنری ثبت نشده است"
            description="بنرهای تبلیغاتی سایت را بر اساس جایگاه و بازه‌ی زمانی تعریف کنید."
            action={addButton}
            clearFiltersHref="/admin/collections/banners"
          />
        }
      />
    </div>
  );
}
