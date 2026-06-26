import Link from "next/link";
import { notFound } from "next/navigation";
import { User } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getOrderDetail } from "@/lib/account/orders";
import { ORDER_STATUS_LABEL, orderStatusTone } from "@/lib/admin/orders";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { OrderAdminControls } from "@/components/admin/orders/OrderAdminControls";
import { formatToman, toPersianNumbers } from "@/lib/price";
import { formatJalali } from "@/lib/date";

export const dynamic = "force-dynamic";

function Toman({ rial }: { rial: number }) {
  return (
    <span className="whitespace-nowrap">
      {formatToman(rial)} <span className="store-toman" aria-label="تومان" />
    </span>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [order, meta] = await Promise.all([
    getOrderDetail(id, { admin: true }),
    prisma.order.findUnique({
      where: { id },
      select: { userId: true, user: { select: { name: true, phoneNumber: true } } },
    }),
  ]);
  if (!order || !meta) notFound();

  return (
    <div>
      <AdminPageHeader
        title={`سفارش #${toPersianNumbers(order.orderNumber)}`}
        description={`ثبت در ${formatJalali(order.createdAtISO)}`}
        breadcrumbs={[
          { label: "سفارش‌ها", href: "/admin/collections/orders" },
          { label: `#${toPersianNumbers(order.orderNumber)}` },
        ]}
        actions={
          <AdminStatusBadge tone={orderStatusTone(order.status)}>
            {ORDER_STATUS_LABEL[order.status]}
          </AdminStatusBadge>
        }
      />

      <div className="flex flex-col gap-5">
        <OrderAdminControls orderId={order.id} status={order.status} trackingCode={order.trackingCode} />

        {/* customer */}
        <div className="flex items-center gap-3 rounded-2xl border border-dz-a-primary-100 bg-white p-4 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
          <span className="grid size-10 place-items-center rounded-xl bg-dz-a-primary-100 text-dz-a-primary-700 dark:bg-dz-a-primary-400/15 dark:text-dz-a-primary-300">
            <User className="size-5" />
          </span>
          <div>
            <div className="font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
              {meta.user.name ?? "—"}
            </div>
            <div dir="ltr" className="text-right text-sm text-dz-a-primary-400">
              {toPersianNumbers(meta.user.phoneNumber)}
            </div>
          </div>
          <Link
            href={`/admin/customers/${meta.userId}`}
            className="ms-auto rounded-xl border border-dz-a-primary-200 px-4 py-2 text-sm font-medium text-dz-a-primary-700 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg"
          >
            پروفایل مشتری
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
          {/* items + totals */}
          <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-5 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
            <h2 className="mb-3 font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">اقلام</h2>
            <ul className="divide-y divide-dz-a-primary-50 dark:divide-dz-a-night-line">
              {order.lines.map((l, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="text-dz-a-primary-800 dark:text-dz-a-night-fg">
                    {l.title}
                    {l.variantLabel && <span className="text-dz-a-primary-400"> · {l.variantLabel}</span>}
                    <span className="text-dz-a-primary-400"> × {toPersianNumbers(l.quantity)}</span>
                  </div>
                  <Toman rial={l.lineTotalRial} />
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1.5 border-t border-dz-a-primary-100 pt-3 text-sm dark:border-dz-a-night-border">
              <div className="flex justify-between text-dz-a-primary-500 dark:text-dz-a-night-muted">
                <span>جمع کالاها</span>
                <Toman rial={order.subtotalRial} />
              </div>
              {order.discountRial > 0 && (
                <div className="flex justify-between text-dz-a-primary-500 dark:text-dz-a-night-muted">
                  <span>تخفیف</span>
                  <span>− <Toman rial={order.discountRial} /></span>
                </div>
              )}
              <div className="flex justify-between text-dz-a-primary-500 dark:text-dz-a-night-muted">
                <span>ارسال</span>
                {order.shippingRial > 0 ? <Toman rial={order.shippingRial} /> : <span>رایگان</span>}
              </div>
              <div className="flex justify-between border-t border-dz-a-primary-100 pt-1.5 font-bold text-dz-a-primary-800 dark:border-dz-a-night-border dark:text-dz-a-night-fg">
                <span>مبلغ کل</span>
                <Toman rial={order.totalRial} />
              </div>
            </div>
          </div>

          {/* address + payment + history */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-5 text-sm dark:border-dz-a-night-border dark:bg-dz-a-night-card">
              <h2 className="mb-2 font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">آدرس تحویل</h2>
              {order.address ? (
                <div className="space-y-1 text-dz-a-primary-600 dark:text-dz-a-night-muted">
                  <p className="font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
                    {order.address.receiverName}
                  </p>
                  <p className="leading-7">
                    {order.address.province}، {order.address.city}، {order.address.line}
                  </p>
                  <p className="text-xs">کد پستی: {toPersianNumbers(order.address.postalCode)}</p>
                </div>
              ) : (
                <p className="text-dz-a-primary-400">ثبت نشده</p>
              )}
            </div>

            <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-5 text-sm dark:border-dz-a-night-border dark:bg-dz-a-night-card">
              <h2 className="mb-2 font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">پرداخت</h2>
              {order.payment ? (
                <div className="space-y-1 text-dz-a-primary-600 dark:text-dz-a-night-muted">
                  <p>درگاه: {order.payment.provider}</p>
                  <p>
                    وضعیت:{" "}
                    {order.payment.status === "SUCCESS"
                      ? "موفق"
                      : order.payment.status === "FAILED"
                        ? "ناموفق"
                        : "در انتظار"}
                  </p>
                </div>
              ) : (
                <p className="text-dz-a-primary-400">ثبت نشده</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
