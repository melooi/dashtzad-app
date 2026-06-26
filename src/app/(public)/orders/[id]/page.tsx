import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Receipt,
  CreditCard,
  MapPin,
  Truck,
  Check,
  Ban,
} from "lucide-react";
import { requireAuth } from "@/lib/auth/guards";
import { getOrderDetail } from "@/lib/account/orders";
import { StatusPill } from "@/views/account/panel/StatusPill";
import { Money } from "@/views/account/panel/Money";
import { ReorderButton } from "@/views/account/ReorderButton";
import { toPersianNumbers } from "@/lib/price";
import { formatJalali } from "@/lib/date";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "جزئیات سفارش | دشت‌زاد",
  robots: { index: false },
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  // Ownership is enforced in the query (userId filter) — no cross-user access.
  const order = await getOrderDetail(id, { userId: user.id });
  if (!order) notFound();

  const cancelled = order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 text-store-text md:py-10">
      <Link
        href="/account"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-store-text-muted hover:text-store-primary"
      >
        <ChevronRight className="size-4" /> بازگشت به حساب کاربری
      </Link>

      {/* header */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-store-border bg-store-surface p-5 shadow-store-xs">
        <span className="grid size-12 place-items-center rounded-2xl bg-store-primary-soft text-store-primary-hover">
          <Receipt className="size-6" />
        </span>
        <div>
          <div className="font-heading text-xl font-bold">
            سفارش #{toPersianNumbers(order.orderNumber)}
          </div>
          <div className="text-sm text-store-text-faint">ثبت در {formatJalali(order.createdAtISO)}</div>
        </div>
        <span className="ms-auto">
          <StatusPill status={order.status} />
        </span>
      </div>

      {cancelled && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-store-clay-soft px-4 py-3 text-sm font-medium text-store-clay-deep">
          <Ban className="size-4" /> این سفارش {order.status === "REFUNDED" ? "مرجوع" : "لغو"} شده است.
        </div>
      )}

      {/* timeline */}
      {!cancelled && (
        <div className="mt-4 rounded-2xl border border-store-border bg-store-surface p-5 shadow-store-xs">
          <div className="mb-4 flex items-center gap-2 font-bold">
            <Truck className="size-[18px] text-store-primary" /> وضعیت سفارش
          </div>
          <ol className="flex flex-col gap-0">
            {order.timeline.map((step, i) => (
              <li key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-full ${
                      step.done
                        ? "bg-store-primary text-white"
                        : "border-2 border-store-border bg-store-surface text-store-text-faint"
                    }`}
                  >
                    {step.done ? (
                      <Check className="size-4" />
                    ) : (
                      <span className="size-2 rounded-full bg-store-border-strong" />
                    )}
                  </span>
                  {i < order.timeline.length - 1 && (
                    <span
                      className={`my-1 w-0.5 flex-1 ${step.done ? "bg-store-primary" : "bg-store-border"}`}
                    />
                  )}
                </div>
                <div className="pb-5">
                  <div
                    className={`font-medium ${step.current ? "text-store-primary-hover" : "text-store-text"}`}
                  >
                    {step.label}
                    {step.current && (
                      <span className="ms-2 rounded-full bg-store-primary-soft px-2 py-0.5 text-xs font-bold text-store-primary-hover">
                        مرحلهٔ کنونی
                      </span>
                    )}
                  </div>
                  {step.atISO && (
                    <div className="text-xs text-store-text-faint">{formatJalali(step.atISO)}</div>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {order.trackingCode && (
            <div className="mt-1 flex items-center justify-between rounded-xl bg-store-surface-soft px-4 py-3 text-sm">
              <span className="font-bold">کد رهگیری پستی</span>
              <span dir="ltr" className="font-bold text-store-primary-hover">
                {toPersianNumbers(order.trackingCode)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* items */}
      <div className="mt-4 rounded-2xl border border-store-border bg-store-surface p-5 shadow-store-xs">
        <div className="mb-3 font-bold">اقلام سفارش</div>
        <ul className="flex flex-col gap-3">
          {order.lines.map((l, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-store-border bg-store-surface-warm">
                {l.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.image} alt={l.title} className="size-full object-contain p-1" />
                ) : (
                  <span className="px-1 text-center text-[10px] text-store-text-faint">{l.title}</span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-store-text">{l.title}</div>
                {l.variantLabel && (
                  <div className="text-xs text-store-text-faint">{l.variantLabel}</div>
                )}
                <div className="text-xs text-store-text-faint">
                  {toPersianNumbers(l.quantity)} × <Money rial={l.unitPriceRial} />
                </div>
              </div>
              <div className="font-bold">
                <Money rial={l.lineTotalRial} strong />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2 border-t border-store-border pt-4 text-sm">
          <div className="flex justify-between text-store-text-muted">
            <span>جمع کالاها</span>
            <Money rial={order.subtotalRial} />
          </div>
          {order.discountRial > 0 && (
            <div className="flex justify-between text-store-text-muted">
              <span>تخفیف</span>
              <span className="text-store-primary-hover">
                − <Money rial={order.discountRial} />
              </span>
            </div>
          )}
          <div className="flex justify-between text-store-text-muted">
            <span>هزینه ارسال</span>
            {order.shippingRial > 0 ? (
              <Money rial={order.shippingRial} />
            ) : (
              <span className="font-bold text-store-primary-hover">رایگان</span>
            )}
          </div>
          <div className="flex justify-between border-t border-store-border pt-2 text-base font-bold">
            <span>مبلغ کل</span>
            <Money rial={order.totalRial} strong />
          </div>
        </div>
      </div>

      {/* payment + address */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-store-border bg-store-surface p-5 shadow-store-xs">
          <div className="mb-3 flex items-center gap-2 font-bold">
            <CreditCard className="size-[18px] text-store-primary" /> پرداخت
          </div>
          {order.payment ? (
            <div className="space-y-1 text-sm text-store-text-muted">
              <p>درگاه: {order.payment.provider}</p>
              <p>
                وضعیت:{" "}
                {order.payment.status === "SUCCESS"
                  ? "پرداخت موفق"
                  : order.payment.status === "FAILED"
                    ? "ناموفق"
                    : "در انتظار پرداخت"}
              </p>
              {order.payment.refId && (
                <p dir="ltr" className="text-right">
                  کد پیگیری: {toPersianNumbers(order.payment.refId)}
                </p>
              )}
              {order.payment.paidAtISO && <p>تاریخ پرداخت: {formatJalali(order.payment.paidAtISO)}</p>}
            </div>
          ) : (
            <p className="text-sm text-store-text-faint">اطلاعات پرداختی ثبت نشده است.</p>
          )}
        </div>

        <div className="rounded-2xl border border-store-border bg-store-surface p-5 shadow-store-xs">
          <div className="mb-3 flex items-center gap-2 font-bold">
            <MapPin className="size-[18px] text-store-primary" /> آدرس تحویل
          </div>
          {order.address ? (
            <div className="space-y-1 text-sm text-store-text-muted">
              <p className="font-medium text-store-text">{order.address.receiverName}</p>
              <p className="leading-7">
                {order.address.province}، {order.address.city}، {order.address.line}
                {order.address.plaque ? `، پلاک ${toPersianNumbers(order.address.plaque)}` : ""}
                {order.address.unit ? `، واحد ${toPersianNumbers(order.address.unit)}` : ""}
              </p>
              <p className="text-xs text-store-text-faint">
                کد پستی: {toPersianNumbers(order.address.postalCode)} ·{" "}
                {toPersianNumbers(order.address.phone)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-store-text-faint">آدرسی ثبت نشده است.</p>
          )}
        </div>
      </div>

      {order.reorder.length > 0 && (
        <div className="mt-5">
          <ReorderButton items={order.reorder} />
        </div>
      )}
    </main>
  );
}
