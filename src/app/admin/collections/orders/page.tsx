import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { AdminListEmptyState } from "@/components/admin/ui/AdminListEmptyState";
import {
  ADMIN_ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  listAdminOrders,
  orderStatusTone,
} from "@/lib/admin/orders";
import { formatToman, toPersianNumbers } from "@/lib/price";
import { formatJalali } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = ADMIN_ORDER_STATUSES.find((s) => s.value === sp.status)?.value;
  const orders = await listAdminOrders({ q, status });
  const hasActiveFilters = Boolean(q || status);

  return (
    <div>
      <AdminPageHeader
        title="سفارش‌ها"
        description="مدیریت سفارش‌های مشتریان، تغییر وضعیت و کد رهگیری"
      />

      <form method="get" className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-56">
          <Search className="pointer-events-none absolute inset-inline-start-3 top-1/2 size-4 -translate-y-1/2 text-dz-primary-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="جستجوی شماره سفارش، نام یا موبایل…"
            className="w-full rounded-xl border border-dz-primary-200 bg-white py-2.5 ps-9 pe-3 text-sm text-dz-primary-900 outline-none focus:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-xl border border-dz-primary-200 bg-white px-3 py-2.5 text-sm text-dz-primary-900 outline-none focus:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg"
        >
          <option value="">همهٔ وضعیت‌ها</option>
          {ADMIN_ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-xl bg-dz-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-dz-primary-700">
          اعمال
        </button>
      </form>

      {orders.length === 0 ? (
        <AdminListEmptyState
          mode={hasActiveFilters ? "no-results" : "empty"}
          icon={<ShoppingCart className="size-7" />}
          title="هنوز سفارشی ثبت نشده است"
          description="سفارش‌های مشتریان پس از تکمیل خرید این‌جا نمایش داده می‌شوند. سفارش از سمت پنل ساخته نمی‌شود."
          clearFiltersHref="/admin/collections/orders"
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-dz-primary-100 bg-white dark:border-dz-night-border dark:bg-dz-night-card">
          <table className="w-full min-w-[44rem] text-sm">
            <thead className="border-b border-dz-primary-100 text-dz-primary-500 dark:border-dz-night-border dark:text-dz-night-muted">
              <tr className="text-right">
                <th className="px-4 py-3 font-medium">شماره</th>
                <th className="px-4 py-3 font-medium">مشتری</th>
                <th className="px-4 py-3 font-medium">تاریخ</th>
                <th className="px-4 py-3 font-medium">اقلام</th>
                <th className="px-4 py-3 font-medium">مبلغ</th>
                <th className="px-4 py-3 font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dz-primary-50 dark:divide-dz-night-line">
              {orders.map((o) => (
                <tr key={o.id} className="text-dz-primary-800 hover:bg-dz-primary-50/40 dark:text-dz-night-fg dark:hover:bg-dz-night-elevated/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/collections/orders/${o.id}`} className="font-bold text-dz-primary-700 hover:underline dark:text-dz-primary-300">
                      #{toPersianNumbers(o.orderNumber)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>{o.customerName}</div>
                    <div dir="ltr" className="text-right text-xs text-dz-primary-400">
                      {toPersianNumbers(o.customerPhone)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dz-primary-500 dark:text-dz-night-muted">
                    {formatJalali(o.createdAtISO)}
                  </td>
                  <td className="px-4 py-3">{toPersianNumbers(o.itemCount)}</td>
                  <td className="px-4 py-3">
                    {formatToman(o.totalRial)} <span className="store-toman" aria-label="تومان" />
                  </td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge tone={orderStatusTone(o.status)}>
                      {ORDER_STATUS_LABEL[o.status]}
                    </AdminStatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
