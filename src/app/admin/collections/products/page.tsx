import Link from "next/link";
import { Plus, Zap, Package } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { productsCollection } from "@/lib/admin/collections";
import { BASE_UNIT_LABELS } from "@/lib/admin/products";
import { formatToman, toPersianNumbers } from "@/lib/price";
import { formatJalali } from "@/lib/date";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { AdminSearchInput } from "@/components/admin/ui/AdminSearchInput";
import { AdminFilterBar } from "@/components/admin/ui/AdminFilterBar";
import { AdminTablePagination } from "@/components/admin/ui/AdminTablePagination";
import { AdminListEmptyState } from "@/components/admin/ui/AdminListEmptyState";
import { ProductsTable, type ProductRow } from "@/components/admin/products/ProductsTable";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;
const INCLUDE = {
  category: { select: { title: true } },
  variants: { select: { price_rial: true, stock: true } },
} satisfies Prisma.ProductInclude;
type ProductWithRels = Prisma.ProductGetPayload<{ include: typeof INCLUDE }>;

export default async function ProductsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const activeParam = sp.active === "1" ? true : sp.active === "0" ? false : undefined;
  const categoryParam = sp.category || undefined;
  const sort = sp.sort === "title" ? "title" : "updated";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(activeParam !== undefined ? { isActive: activeParam } : {}),
    ...(categoryParam ? { categoryId: categoryParam } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy = sort === "title" ? { title: "asc" as const } : { updatedAt: "desc" as const };
  const [total, list, productCategories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, include: INCLUDE, orderBy, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    prisma.category.findMany({ where: { type: "PRODUCT" }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  const rows: ProductRow[] = list.map((p: ProductWithRels) => {
    const prices = p.variants.map((v) => v.price_rial);
    const stockTotal = p.variants.reduce((s, v) => s + v.stock, 0) || p.countInStock;
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      categoryTitle: p.category.title,
      basePriceLabel: formatToman(p.basePrice_rial ?? p.price_rial),
      unitLabel: BASE_UNIT_LABELS[p.basePriceUnit] ?? p.basePriceUnit,
      variantCount: p.variants.length,
      stockTotal,
      priceRangeLabel: min === max ? formatToman(min) : `${formatToman(min)} – ${formatToman(max)}`,
      isActive: p.isActive,
      updatedAtLabel: formatJalali(p.updatedAt),
    };
  });

  const categoryFilter = {
    paramKey: "category",
    label: "دسته",
    options: [{ value: "", label: "همه‌ی دسته‌ها" }, ...productCategories.map((c) => ({ value: c.id, label: c.title }))],
  };

  const hasActiveFilters = Boolean(q || activeParam !== undefined || categoryParam);
  const addButton = (
    <Link href={`${productsCollection.route}/new`} className="inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-dz-a-primary-700">
      <Plus className="size-4" />
      افزودن محصول
    </Link>
  );

  return (
    <div>
      <AdminPageHeader
        title={productsCollection.label}
        description="محصولات و مدل‌های فروش (وزن × بسته‌بندی) را مدیریت کنید."
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: productsCollection.label }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`${productsCollection.route}/quick-add`} className="inline-flex items-center gap-2 rounded-xl border border-dz-a-primary-300 dark:border-dz-a-night-border px-4 py-2.5 text-sm font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg hover:bg-dz-a-primary-50 dark:hover:bg-white/5">
              <Zap className="size-4" />
              افزودن سریع
            </Link>
            <Link href={`${productsCollection.route}/new`} className="inline-flex items-center gap-2 rounded-xl bg-dz-a-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-dz-a-primary-700">
              <Plus className="size-4" />
              افزودن محصول
            </Link>
          </div>
        }
      />

      <AdminToolbar>
        <AdminSearchInput placeholder={productsCollection.searchableHint} />
        <AdminFilterBar
          filters={[...productsCollection.filters, categoryFilter]}
          sort={{ paramKey: "sort", label: "مرتب‌سازی", options: productsCollection.sorts }}
        />
      </AdminToolbar>

      {total === 0 ? (
        <AdminListEmptyState
          mode={hasActiveFilters ? "no-results" : "empty"}
          icon={<Package className="size-7" />}
          title="هنوز محصولی ثبت نشده است"
          description="اولین محصول فروشگاه را اضافه کنید؛ هر محصول می‌تواند چند مدل فروش (وزن × بسته‌بندی) داشته باشد. برای ثبت سریع از «افزودن سریع» استفاده کنید."
          action={addButton}
          clearFiltersHref={productsCollection.route}
        />
      ) : (
        <>
          <ProductsTable rows={rows} />
          <AdminTablePagination
            page={page}
            perPage={PER_PAGE}
            total={total}
            basePath={productsCollection.route}
            query={{ q: q || undefined, active: sp.active, category: categoryParam, sort: sort === "updated" ? undefined : sort }}
          />
          <p className="mt-2 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">{toPersianNumbers(total)} محصول</p>
        </>
      )}
    </div>
  );
}
