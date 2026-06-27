import Link from "next/link";
import { Plus, FolderTree } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { categoriesCollection } from "@/lib/admin/collections";
import { CATEGORY_TYPE_LABELS } from "@/lib/admin/categories";
import { orderTree } from "@/lib/admin/tree";
import { formatJalali } from "@/lib/date";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { AdminSearchInput } from "@/components/admin/ui/AdminSearchInput";
import { AdminFilterBar } from "@/components/admin/ui/AdminFilterBar";
import { AdminTablePagination } from "@/components/admin/ui/AdminTablePagination";
import { AdminListEmptyState } from "@/components/admin/ui/AdminListEmptyState";
import { CategoriesTable, type CategoryRow } from "@/components/admin/categories/CategoriesTable";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;
const INCLUDE = {
  parent: { select: { title: true } },
  _count: { select: { children: true, products: true, posts: true } },
} satisfies Prisma.CategoryInclude;

type CategoryWithCounts = Prisma.CategoryGetPayload<{ include: typeof INCLUDE }>;

export default async function CategoriesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const typeParam = sp.type === "PRODUCT" || sp.type === "POST" ? sp.type : undefined;
  const sort = sp.sort === "title" || sp.sort === "updated" ? sp.sort : "tree";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.CategoryWhereInput = {
    ...(typeParam ? { type: typeParam } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const useTree = sort === "tree" && !q;

  let total = 0;
  let pageRows: Array<CategoryWithCounts & { depth: number }> = [];

  if (useTree) {
    const all = await prisma.category.findMany({ where: { ...where, deletedAt: null }, include: INCLUDE });
    const ordered = orderTree(all, (a, b) => a.title.localeCompare(b.title, "fa"));
    total = ordered.length;
    pageRows = ordered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  } else {
    const orderBy = sort === "title" ? { title: "asc" as const } : { updatedAt: "desc" as const };
    total = await prisma.category.count({ where: { ...where, deletedAt: null } });
    const list = await prisma.category.findMany({
      where: { ...where, deletedAt: null },
      include: INCLUDE,
      orderBy,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    });
    pageRows = list.map((c) => ({ ...c, depth: 0 }));
  }

  const rows: CategoryRow[] = pageRows.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    type: c.type,
    typeLabel: CATEGORY_TYPE_LABELS[c.type] ?? c.type,
    parentTitle: c.parent?.title ?? null,
    depth: c.depth,
    childCount: c._count.children,
    usageCount: c.type === "PRODUCT" ? c._count.products : c._count.posts,
    usageUnit: c.type === "PRODUCT" ? "محصول" : "نوشته",
    updatedAtLabel: formatJalali(c.updatedAt),
  }));

  const hasActiveFilters = Boolean(q || typeParam);
  const addButton = (
    <Link
      href={`${categoriesCollection.route}/new`}
      className="inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dz-a-primary-700"
    >
      <Plus className="size-4" />
      {categoriesCollection.addLabel}
    </Link>
  );

  return (
    <div>
      <AdminPageHeader
        title={categoriesCollection.label}
        description="ساختار دسته‌بندی محصولات و نوشته‌ها را مدیریت کنید."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: categoriesCollection.label },
        ]}
        actions={addButton}
      />

      <AdminToolbar>
        <AdminSearchInput placeholder={categoriesCollection.searchableHint} />
        <AdminFilterBar
          filters={categoriesCollection.filters}
          sort={{ paramKey: "sort", label: "مرتب‌سازی", options: categoriesCollection.sorts }}
        />
      </AdminToolbar>

      {total === 0 ? (
        <AdminListEmptyState
          mode={hasActiveFilters ? "no-results" : "empty"}
          icon={<FolderTree className="size-7" />}
          title="هنوز دسته‌بندی‌ای ثبت نشده است"
          description="ساختار دسته‌بندی محصولات و نوشته‌ها را بسازید؛ دسته‌ها می‌توانند تو‌در‌تو باشند."
          action={addButton}
          clearFiltersHref={categoriesCollection.route}
        />
      ) : (
        <>
          <CategoriesTable rows={rows} />
          <AdminTablePagination
            page={page}
            perPage={PER_PAGE}
            total={total}
            basePath={categoriesCollection.route}
            query={{ q: q || undefined, type: typeParam, sort: sort === "tree" ? undefined : sort }}
          />
        </>
      )}
    </div>
  );
}
