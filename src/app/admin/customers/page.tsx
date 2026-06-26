import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { listCustomers } from "@/lib/admin/customer";
import { formatToman, toPersianNumbers } from "@/lib/price";
import { formatJalali } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const customers = await listCustomers(q);

  return (
    <div>
      <AdminPageHeader title="مشتریان" description="فهرست مشتریان و دسترسی به نمای ۳۶۰ هر مشتری" />

      <form method="get" className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-inline-start-3 top-1/2 size-4 -translate-y-1/2 text-dz-primary-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="جستجوی نام، موبایل یا ایمیل…"
            className="w-full rounded-xl border border-dz-primary-200 bg-white py-2.5 ps-9 pe-3 text-sm text-dz-primary-900 outline-none focus:border-dz-primary-500 dark:border-dz-night-border dark:bg-dz-night-elevated dark:text-dz-night-fg"
          />
        </div>
        <button type="submit" className="rounded-xl bg-dz-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-dz-primary-700">
          جستجو
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-dz-primary-100 bg-white dark:border-dz-night-border dark:bg-dz-night-card">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="border-b border-dz-primary-100 text-dz-primary-500 dark:border-dz-night-border dark:text-dz-night-muted">
            <tr className="text-right">
              <th className="px-4 py-3 font-medium">نام</th>
              <th className="px-4 py-3 font-medium">موبایل</th>
              <th className="px-4 py-3 font-medium">عضویت</th>
              <th className="px-4 py-3 font-medium">سفارش‌ها</th>
              <th className="px-4 py-3 font-medium">مجموع خرید</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dz-primary-50 dark:divide-dz-night-line">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-dz-primary-400">
                  مشتری‌ای یافت نشد.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="text-dz-primary-800 hover:bg-dz-primary-50/40 dark:text-dz-night-fg dark:hover:bg-dz-night-elevated/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${c.id}`} className="font-bold text-dz-primary-700 hover:underline dark:text-dz-primary-300">
                      {c.name ?? "—"}
                    </Link>
                    {c.isAdmin && (
                      <span className="ms-2">
                        <AdminStatusBadge tone="blue">مدیر</AdminStatusBadge>
                      </span>
                    )}
                  </td>
                  <td dir="ltr" className="px-4 py-3 text-right">{toPersianNumbers(c.phoneNumber)}</td>
                  <td className="px-4 py-3 text-dz-primary-500 dark:text-dz-night-muted">
                    {formatJalali(c.createdAtISO)}
                  </td>
                  <td className="px-4 py-3">{toPersianNumbers(c.orderCount)}</td>
                  <td className="px-4 py-3">
                    {formatToman(c.totalSpentRial)} <span className="store-toman" aria-label="تومان" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
