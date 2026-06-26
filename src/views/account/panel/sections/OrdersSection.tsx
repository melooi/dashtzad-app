"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package, Calendar, ChevronLeft, Store, Truck } from "lucide-react";
import { SectionHead } from "../SectionHead";
import { StatusPill } from "../StatusPill";
import { Money } from "../Money";
import { PanelEmpty, PanelError, PanelLoading, TonePill } from "../ui";
import { PAYMENT_STATUS } from "../labels";
import { jsonGet } from "../fetcher";
import { ACCOUNT_QUERY_KEYS, type OrderListItem } from "@/lib/account/types";
import type { OrderStatus } from "@/generated/prisma/enums";
import { toPersianNumbers } from "@/lib/price";
import { formatJalali } from "@/lib/date";

const ACTIVE: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "SHIPPED"];
type Tab = "current" | "history" | "all";

function Thumbs({ order }: { order: OrderListItem }) {
  return (
    <div className="flex flex-row-reverse">
      {order.thumbs.map((t, i) => (
        <span
          key={i}
          className={`grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-store-border bg-store-surface-warm ring-2 ring-store-surface ${i > 0 ? "-mr-3" : ""}`}
        >
          {t.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.image} alt={t.title} className="size-full object-contain p-1" />
          ) : (
            <span className="px-0.5 text-center text-[9px] leading-tight text-store-text-faint">
              {t.title}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

function OrderCard({ order }: { order: OrderListItem }) {
  const pay = order.paymentStatus ? PAYMENT_STATUS[order.paymentStatus] : null;
  return (
    <div className="rounded-2xl border border-store-border bg-store-surface p-4 shadow-store-xs md:p-5">
      <div className="flex flex-wrap items-center gap-2 border-b border-store-border pb-3">
        <span className="font-bold text-store-text">
          سفارش #{toPersianNumbers(order.orderNumber)}
        </span>
        <span className="flex items-center gap-1 text-xs text-store-text-faint">
          <Calendar className="size-3.5" /> {formatJalali(order.createdAtISO)}
        </span>
        <span className="ms-auto flex items-center gap-1.5">
          {pay && <TonePill tone={pay.tone}>{pay.label}</TonePill>}
          <StatusPill status={order.status} />
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4 pt-3">
        <Thumbs order={order} />
        <div className="min-w-[8rem] flex-1">
          <div className="text-sm text-store-text-faint">
            <span className="num">{toPersianNumbers(order.itemCount)}</span> کالا
          </div>
          {order.trackingCode && (
            <div className="mt-1 flex items-center gap-1 text-xs text-store-text-faint">
              <Truck className="size-3.5" /> کد رهگیری: {toPersianNumbers(order.trackingCode)}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-store-text-faint">مبلغ</div>
          <div className="font-heading text-lg font-bold text-store-text">
            <Money rial={order.totalRial} strong />
          </div>
        </div>
        <Link
          href={`/orders/${order.id}`}
          className="store-btn store-btn-secondary w-full justify-center md:w-auto"
        >
          مشاهده جزئیات <ChevronLeft className="size-4" />
        </Link>
      </div>
    </div>
  );
}

export function OrdersSection() {
  const [tab, setTab] = useState<Tab>("current");
  const q = useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.orders,
    queryFn: () => jsonGet<{ orders: OrderListItem[] }>("/api/account/orders"),
  });

  const orders = q.data?.orders ?? [];
  const current = orders.filter((o) => ACTIVE.includes(o.status));
  const history = orders.filter((o) => !ACTIVE.includes(o.status));
  const list = tab === "current" ? current : tab === "history" ? history : orders;
  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: "current", label: "جاری", n: current.length },
    { id: "history", label: "تاریخچه", n: history.length },
    { id: "all", label: "همه", n: orders.length },
  ];

  return (
    <div>
      <SectionHead
        title="سفارش‌های من"
        sub="سفارش‌های جاری و تاریخچه خریدهایت را اینجا دنبال کن"
        action={
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`store-chip ${tab === t.id ? "is-on" : ""}`}
              >
                {t.label}
                <span className="num">{toPersianNumbers(t.n)}</span>
              </button>
            ))}
          </div>
        }
      />

      {q.isLoading ? (
        <PanelLoading />
      ) : q.isError ? (
        <PanelError onRetry={() => q.refetch()} />
      ) : list.length === 0 ? (
        <PanelEmpty
          icon={<Package className="size-7" />}
          title={tab === "current" ? "سفارش جاری نداری" : "سفارشی نیست"}
          desc="با خرید از فروشگاه دشت‌زاد، سفارش‌هایت اینجا نمایش داده می‌شوند."
          action={
            <Link href="/products" className="store-btn store-btn-primary">
              <Store className="size-4" /> رفتن به فروشگاه
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
