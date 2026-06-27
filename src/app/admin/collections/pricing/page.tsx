import { Lock, Boxes, Package, Layers } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { BASE_UNIT_LABELS, PACKAGING_TYPE_LABELS } from "@/lib/admin/products";
import { formatToman, toPersianNumbers, toPersianNumbersWithComma, rialToToman } from "@/lib/price";
import { formatJalali } from "@/lib/date";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminTablePagination } from "@/components/admin/ui/AdminTablePagination";
import {
  ProductPricingTable,
  type ProductPriceRow,
} from "@/components/admin/pricing/ProductPricingTable";
import {
  PackagingCostTable,
  type PackagingCostRow,
} from "@/components/admin/pricing/PackagingCostTable";

export const dynamic = "force-dynamic";

const PER_PAGE = 50;

function capacityLabel(grams: number): string {
  const n = Number.isInteger(grams) ? toPersianNumbersWithComma(grams) : toPersianNumbers(grams);
  return `${n} گرم`;
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * PER_PAGE;

  const [products, totalProducts, packagings, variantCount, lockedCount] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      skip,
      take: PER_PAGE,
      include: {
        variants: {
          orderBy: { sortOrder: "asc" },
          include: {
            weight: { select: { title: true } },
            packaging: { select: { title: true } },
          },
        },
      },
    }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.packagingOption.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.productVariant.count(),
    prisma.productVariant.count({ where: { isPriceLocked: true } }),
  ]);

  const productRows: ProductPriceRow[] = products.map((p) => {
    const prices = p.variants.map((v) => v.price_rial);
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;
    return {
      id: p.id,
      title: p.title,
      basePriceToman: rialToToman(p.basePrice_rial ?? p.price_rial),
      unitLabel: BASE_UNIT_LABELS[p.basePriceUnit] ?? p.basePriceUnit,
      variantCount: p.variants.length,
      rangeLabel: prices.length
        ? min === max
          ? formatToman(min)
          : `${formatToman(min)} – ${formatToman(max)}`
        : "—",
      lockedCount: p.variants.filter((v) => v.isPriceLocked).length,
      variants: p.variants.map((v) => {
        const weightTitle = v.weight?.title ?? `${toPersianNumbers(v.gramValue)} گرم`;
        const modelLabel = v.packaging?.title ? `${weightTitle} • ${v.packaging.title}` : weightTitle;
        return {
          id: v.id,
          modelLabel,
          sku: v.sku,
          calculatedToman: rialToToman(v.calculatedPrice_rial),
          priceToman: rialToToman(v.price_rial),
          offPriceToman: v.offPrice_rial != null ? rialToToman(v.offPrice_rial) : null,
          stock: v.stock,
          isActive: v.isActive,
          isPriceLocked: v.isPriceLocked,
        };
      }),
    };
  });

  const packagingRows: PackagingCostRow[] = packagings.map((p) => ({
    id: p.id,
    title: p.title,
    typeLabel: PACKAGING_TYPE_LABELS[p.type] ?? p.type,
    capacityLabel: capacityLabel(p.capacityGram),
    costToman: rialToToman(p.cost_rial),
    isActive: p.isActive,
    updatedAtLabel: formatJalali(p.updatedAt),
  }));

  const stats = [
    { label: "محصولات", value: totalProducts, icon: Package },
    { label: "مدل‌های فروش", value: variantCount, icon: Layers },
    { label: "قیمت‌های قفل‌شده (دستی)", value: lockedCount, icon: Lock },
    { label: "گزینه‌های بسته‌بندی", value: packagings.length, icon: Boxes },
  ];

  return (
    <div>
      <AdminPageHeader
        title="قیمت‌گذاری"
        description="میز کار قیمت‌گذاری: قیمت پایه، قیمت مدل‌ها و هزینه‌ی بسته‌بندی را مستقیم و درجا ویرایش کنید."
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "قیمت‌گذاری" }]}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-2xl border border-dz-a-primary-100 bg-white p-4 dark:border-dz-a-night-border dark:bg-dz-a-night-card"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-dz-a-primary-50 text-dz-a-primary-600 dark:bg-white/5 dark:text-dz-a-primary-300">
                <Icon className="size-5" />
              </div>
              <div>
                <div className="font-heading text-xl font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
                  {toPersianNumbers(s.value)}
                </div>
                <div className="text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">قیمت محصولات</h2>
        <p className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
          روی سلول کلیک کنید؛ Enter ذخیره، Esc لغو، Tab سلول بعدی.
        </p>
      </div>
      <ProductPricingTable rows={productRows} />
      {totalProducts > PER_PAGE && (
        <AdminTablePagination
          page={page}
          perPage={PER_PAGE}
          total={totalProducts}
          basePath="/admin/collections/pricing"
        />
      )}

      <h2 className="mt-8 mb-2 font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
        هزینه‌ی بسته‌بندی‌ها
      </h2>
      <PackagingCostTable rows={packagingRows} />

      <p className="mt-6 rounded-xl border border-dz-a-primary-100 bg-dz-a-primary-50/40 p-4 text-xs leading-6 text-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-white/5 dark:text-dz-a-night-muted">
        قیمت‌ها به <span className="font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">تومان</span> وارد می‌شوند و در دیتابیس به
        ریال ذخیره می‌شوند. تغییر قیمت پایه یا هزینه‌ی بسته‌بندی، قیمت مدل‌های فروشِ
        <span className="font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg"> قفل‌نشده</span> را به‌صورت خودکار بازمحاسبه
        می‌کند؛ قیمت‌های <span className="font-medium text-dz-a-warning dark:text-dz-a-warning-300">قفل‌شده (دستی)</span> دست‌نخورده می‌مانند.
      </p>
    </div>
  );
}
