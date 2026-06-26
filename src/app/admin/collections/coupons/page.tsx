import Link from "next/link";
import { Plus, TicketPercent } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { couponsCollection } from "@/lib/admin/collections";
import {
  COUPON_TYPE_LABELS,
  getCouponStatus,
  summarizeCouponRule,
  type CouponStatusKey,
} from "@/lib/admin/coupons";
import { formatToman, toPersianNumbers } from "@/lib/price";
import { formatJalali } from "@/lib/date";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminToolbar } from "@/components/admin/ui/AdminToolbar";
import { AdminSearchInput } from "@/components/admin/ui/AdminSearchInput";
import { AdminFilterBar } from "@/components/admin/ui/AdminFilterBar";
import { AdminTablePagination } from "@/components/admin/ui/AdminTablePagination";
import { AdminListEmptyState } from "@/components/admin/ui/AdminListEmptyState";
import { CouponsTable, type CouponRow } from "@/components/admin/coupons/CouponsTable";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;
const STATUS_KEYS: CouponStatusKey[] = ["ACTIVE", "INACTIVE", "EXPIRED", "SCHEDULED", "EXHAUSTED"];

export default async function CouponsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const typeParam = sp.type === "PERCENT" || sp.type === "FIXED" ? sp.type : undefined;
  const statusParam = STATUS_KEYS.includes(sp.status as CouponStatusKey)
    ? (sp.status as CouponStatusKey)
    : undefined;
  const sort =
    sp.sort === "code" || sp.sort === "active" || sp.sort === "ending" ? sp.sort : "newest";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.CouponWhereInput = {
    ...(typeParam ? { type: typeParam } : {}),
    ...(q
      ? {
          OR: [
            { code: { contains: q, mode: "insensitive" } },
            { title: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  // Status is a COMPUTED value (isActive + dates + usage), so status filtering
  // and the "active"/"ending" sorts are resolved in memory. Coupons are a
  // low-volume collection, so fetching the filtered set is safe.
  const all = await prisma.coupon.findMany({ where });
  const now = new Date();

  const withStatus = all.map((c) => ({ coupon: c, status: getCouponStatus(c, now) }));
  const filtered = statusParam
    ? withStatus.filter((x) => x.status.key === statusParam)
    : withStatus;

  filtered.sort((a, b) => {
    switch (sort) {
      case "code":
        return a.coupon.code.localeCompare(b.coupon.code, "en");
      case "active": {
        // Active coupons first, then by most recent.
        const av = a.status.key === "ACTIVE" ? 0 : 1;
        const bv = b.status.key === "ACTIVE" ? 0 : 1;
        if (av !== bv) return av - bv;
        return b.coupon.createdAt.getTime() - a.coupon.createdAt.getTime();
      }
      case "ending":
        return a.coupon.expiresAt.getTime() - b.coupon.expiresAt.getTime();
      default: // newest
        return b.coupon.createdAt.getTime() - a.coupon.createdAt.getTime();
    }
  });

  const total = filtered.length;
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const hasActiveFilters = Boolean(q || typeParam || statusParam);

  const addButton = (
    <Link
      href={`${couponsCollection.route}/new`}
      className="inline-flex items-center gap-2 rounded-xl bg-dz-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dz-primary-700"
    >
      <Plus className="size-4" />
      {couponsCollection.addLabel}
    </Link>
  );

  const rows: CouponRow[] = pageItems.map(({ coupon: c, status }) => ({
    id: c.id,
    code: c.code,
    title: c.title ?? null,
    typeKey: c.type,
    typeLabel: COUPON_TYPE_LABELS[c.type] ?? c.type,
    valueLabel:
      c.type === "PERCENT"
        ? `${toPersianNumbers(c.amount)}٪`
        : `${formatToman(c.amount)} تومان`,
    ruleSummary: summarizeCouponRule(c),
    usageLabel: `${toPersianNumbers(c.usageCount)} / ${toPersianNumbers(c.usageLimit)}`,
    statusLabel: status.label,
    statusTone: status.tone,
    datesLabel: c.startsAt
      ? `${formatJalali(c.startsAt)} تا ${formatJalali(c.expiresAt)}`
      : `تا ${formatJalali(c.expiresAt)}`,
    isActive: c.isActive,
  }));

  return (
    <div>
      <AdminPageHeader
        title={couponsCollection.label}
        description="کدهای تخفیف فروشگاه را تعریف و مدیریت کنید."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: couponsCollection.label },
        ]}
        actions={addButton}
      />

      <AdminToolbar>
        <AdminSearchInput placeholder={couponsCollection.searchableHint} />
        <AdminFilterBar
          filters={couponsCollection.filters}
          sort={{ paramKey: "sort", label: "مرتب‌سازی", options: couponsCollection.sorts }}
        />
      </AdminToolbar>

      {total === 0 ? (
        <AdminListEmptyState
          mode={hasActiveFilters ? "no-results" : "empty"}
          icon={<TicketPercent className="size-7" />}
          title="هنوز کوپنی ساخته نشده است"
          description="با کوپن‌ها می‌توانید تخفیف درصدی یا مبلغی برای مشتریان تعریف کنید — برای کل سبد یا با شرط حداقل خرید."
          action={addButton}
          clearFiltersHref={couponsCollection.route}
        />
      ) : (
        <>
          <CouponsTable rows={rows} />
          <AdminTablePagination
            page={page}
            perPage={PER_PAGE}
            total={total}
            basePath={couponsCollection.route}
            query={{
              q: q || undefined,
              type: typeParam,
              status: statusParam,
              sort: sort === "newest" ? undefined : sort,
            }}
          />
        </>
      )}
    </div>
  );
}
