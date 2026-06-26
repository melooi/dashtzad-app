"use client";

import Link from "next/link";
import {
  Package,
  Truck,
  Heart,
  Wallet,
  MessageSquareText,
  Star,
  ShoppingBag,
  ChevronLeft,
  MapPin,
  Plus,
  Store,
  UserCheck,
} from "lucide-react";
import { StatusPill } from "../StatusPill";
import { Money } from "../Money";
import type { ViewId } from "../nav";
import { toPersianNumbers } from "@/lib/price";
import { formatJalali } from "@/lib/date";
import type { AccountOverview, AccountProfile, OrderListItem } from "@/lib/account/types";

function firstName(name: string | null) {
  return name?.trim().split(/\s+/)[0] || "دوست";
}

function OrderThumbs({ order }: { order: OrderListItem }) {
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

export function DashboardSection({
  user,
  overview,
  isLoading,
  onNavigate,
}: {
  user: AccountProfile;
  overview?: AccountOverview;
  isLoading: boolean;
  onNavigate: (id: ViewId) => void;
}) {
  const c = overview?.counts;
  const order = overview?.activeOrder ?? overview?.latestOrder ?? null;
  const completion = overview?.profileCompletion ?? 0;

  const stats: { icon: typeof Package; tint: string; value: string; label: string; to: ViewId }[] = [
    { icon: Package, tint: "bg-store-primary-soft text-store-primary-hover", value: toPersianNumbers(c?.orders ?? 0), label: "سفارش", to: "orders" },
    { icon: Truck, tint: "bg-store-clay-soft text-store-clay-deep", value: toPersianNumbers(c?.onTheWay ?? 0), label: "در حال ارسال", to: "orders" },
    { icon: MessageSquareText, tint: "bg-store-amber-soft text-store-gold-deep", value: toPersianNumbers(c?.unreadMessages ?? 0), label: "پیام نو", to: "messages" },
    { icon: Heart, tint: "bg-store-clay-soft text-store-clay-deep", value: toPersianNumbers(c?.wishlist ?? 0), label: "علاقه‌مندی", to: "wishlist" },
    { icon: Star, tint: "bg-store-amber-soft text-store-gold-deep", value: toPersianNumbers(c?.pendingReviews ?? 0), label: "در انتظار دیدگاه", to: "reviews" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* hero + profile completion */}
      <div className="rounded-2xl border border-store-border bg-linear-to-bl from-store-primary-soft to-store-surface p-5 md:p-6">
        <h1 className="font-heading text-xl font-bold text-store-text md:text-2xl">
          سلام {firstName(user.name)} جان، خوش آمدی
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-store-text-muted">
          از اینجا سفارش‌ها را پیگیری کن، آدرس‌ها و علاقه‌مندی‌هایت را مدیریت کن و اعتبارت را ببین.
        </p>
        {completion < 100 && (
          <div className="mt-4 rounded-xl bg-store-surface/70 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium text-store-text">
                <UserCheck className="size-4 text-store-primary" /> تکمیل پروفایل
              </span>
              <span className="font-bold text-store-primary-hover">
                {toPersianNumbers(completion)}٪
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-store-border">
              <div className="h-full rounded-full bg-store-primary" style={{ width: `${completion}%` }} />
            </div>
            <button
              type="button"
              onClick={() => onNavigate("account")}
              className="mt-2 text-xs font-bold text-store-primary hover:text-store-primary-hover"
            >
              تکمیل اطلاعات حساب ←
            </button>
          </div>
        )}
      </div>

      {/* stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => onNavigate(s.to)}
              className="store-focus flex flex-col items-start gap-2 rounded-2xl border border-store-border bg-store-surface p-3 text-right shadow-store-xs transition-colors hover:border-store-primary md:p-4"
            >
              <span className={`grid size-10 place-items-center rounded-xl ${s.tint}`}>
                <Icon className="size-5" />
              </span>
              <span className="font-heading text-xl font-bold text-store-text">{s.value}</span>
              <span className="text-xs text-store-text-faint">{s.label}</span>
            </button>
          );
        })}
        {/* credit tile (value is money) */}
        <button
          type="button"
          onClick={() => onNavigate("wallet")}
          className="store-focus flex flex-col items-start gap-2 rounded-2xl border border-store-border bg-store-surface p-3 text-right shadow-store-xs transition-colors hover:border-store-primary md:p-4"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-store-primary-soft text-store-primary-hover">
            <Wallet className="size-5" />
          </span>
          <span className="font-heading text-lg font-bold text-store-text">
            <Money rial={overview?.creditRial ?? 0} strong />
          </span>
          <span className="text-xs text-store-text-faint">اعتبار دشت‌زاد</span>
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* active / latest order with quick tracking */}
        <div className="rounded-2xl border border-store-border bg-store-surface shadow-store-xs">
          <div className="flex items-center justify-between border-b border-store-border px-5 py-3.5">
            <span className="flex items-center gap-2 font-bold text-store-text">
              <ShoppingBag className="size-[18px] text-store-primary" />
              {overview?.activeOrder ? "سفارش جاری" : "آخرین سفارش"}
            </span>
            {order && (
              <button
                type="button"
                onClick={() => onNavigate("orders")}
                className="flex items-center gap-1 text-sm font-medium text-store-primary hover:text-store-primary-hover"
              >
                همه سفارش‌ها <ChevronLeft className="size-4" />
              </button>
            )}
          </div>
          <div className="p-5">
            {isLoading ? (
              <div className="py-6 text-center text-sm text-store-text-faint">در حال بارگذاری…</div>
            ) : order ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <OrderThumbs order={order} />
                  <div className="min-w-[10rem] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-store-text">
                        #{toPersianNumbers(order.orderNumber)}
                      </span>
                      <StatusPill status={order.status} />
                    </div>
                    <div className="mt-1 text-sm text-store-text-faint">
                      {toPersianNumbers(order.itemCount)} کالا · {formatJalali(order.createdAtISO)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading text-lg font-bold text-store-text">
                      <Money rial={order.totalRial} strong />
                    </div>
                  </div>
                </div>
                <Link href={`/orders/${order.id}`} className="store-btn store-btn-primary">
                  <Truck className="size-4" /> پیگیری سفارش
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-store-primary-soft text-store-primary-hover">
                  <ShoppingBag className="size-6" />
                </span>
                <div className="font-bold text-store-text">هنوز سفارشی نداری</div>
                <Link href="/products" className="store-btn store-btn-primary">
                  <Store className="size-4" /> رفتن به فروشگاه
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* default address */}
        <div className="rounded-2xl border border-store-border bg-store-surface shadow-store-xs">
          <div className="flex items-center justify-between border-b border-store-border px-5 py-3.5">
            <span className="flex items-center gap-2 font-bold text-store-text">
              <MapPin className="size-[18px] text-store-primary" /> آدرس پیش‌فرض
            </span>
            <button
              type="button"
              onClick={() => onNavigate("addresses")}
              className="flex items-center gap-1 text-sm font-medium text-store-primary hover:text-store-primary-hover"
            >
              مدیریت <ChevronLeft className="size-4" />
            </button>
          </div>
          <div className="p-5">
            {overview?.defaultAddress ? (
              <div className="text-sm leading-7 text-store-text-muted">
                <div className="font-bold text-store-text">
                  {overview.defaultAddress.title || "آدرس"} · {overview.defaultAddress.receiverName}
                </div>
                <p>
                  {overview.defaultAddress.province}، {overview.defaultAddress.city}،{" "}
                  {overview.defaultAddress.line}
                </p>
                <p className="text-xs text-store-text-faint">
                  کد پستی: {toPersianNumbers(overview.defaultAddress.postalCode)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-store-primary-soft text-store-primary-hover">
                  <MapPin className="size-6" />
                </span>
                <div className="font-bold text-store-text">آدرسی ثبت نشده</div>
                <button type="button" onClick={() => onNavigate("addresses")} className="store-btn store-btn-primary">
                  <Plus className="size-4" /> تکمیل آدرس
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
