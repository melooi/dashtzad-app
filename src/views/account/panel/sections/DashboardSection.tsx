"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
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
  RotateCcw,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { StatusPill } from "../StatusPill";
import { Money } from "../Money";
import { jsonGet } from "../fetcher";
import type { ViewId } from "../nav";
import { toPersianNumbers } from "@/lib/price";
import { formatJalali } from "@/lib/date";
import { ACCOUNT_QUERY_KEYS, type AccountOverview, type AccountProfile, type OrderListItem, type RepeatProductItem } from "@/lib/account/types";

function firstName(name: string | null) {
  return name?.trim().split(/\s+/)[0] || "دوست";
}

function RepeatPurchases() {
  const q = useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.repeatProducts,
    queryFn: () => jsonGet<{ items: RepeatProductItem[] }>("/api/account/repeat-products"),
  });
  const items = q.data?.items ?? [];
  if (q.isLoading || items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-store-border bg-store-surface shadow-store-xs">
      <div className="flex items-center justify-between border-b border-store-border px-5 py-3.5">
        <span className="flex items-center gap-2 font-bold text-store-text">
          <RotateCcw className="size-4.5 text-store-primary" />
          خریدهای پرتکرار شما
        </span>
        <Link
          href="/products"
          className="flex items-center gap-1 text-sm font-medium text-store-primary hover:text-store-primary-hover"
        >
          فروشگاه <ChevronLeft className="size-4" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto p-4 pb-5">
        {items.map((p) => (
          <Link
            key={p.productId}
            href={`/products/${p.slug}`}
            className="group flex w-36 shrink-0 flex-col gap-2 rounded-xl border border-store-border bg-store-surface-soft p-3 transition-colors hover:border-store-primary"
          >
            <span className="grid h-28 w-full place-items-center overflow-hidden rounded-lg bg-store-surface">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt={p.title} className="size-full object-contain p-1" />
              ) : (
                <Package className="size-7 text-store-text-faint" />
              )}
            </span>
            <p className="line-clamp-2 text-xs font-medium leading-5 text-store-text group-hover:text-store-primary">
              {p.title}
            </p>
            <div className="mt-auto text-sm font-bold text-store-text">
              <Money rial={p.priceRial} strong />
            </div>
            {p.basePriceRial > p.priceRial && (
              <div className="text-xs text-store-text-faint line-through">
                <Money rial={p.basePriceRial} />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
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

function OnboardingChecklist({
  overview,
  onNavigate,
}: {
  overview: AccountOverview;
  onNavigate: (id: ViewId) => void;
}) {
  const c = overview.counts;
  const steps: { done: boolean; label: string; cta: string; to: ViewId }[] = [
    {
      done: overview.profileCompletion >= 80,
      label: "تکمیل اطلاعات حساب",
      cta: "تکمیل کن",
      to: "account",
    },
    {
      done: c.addresses > 0,
      label: "ثبت آدرس تحویل",
      cta: "افزودن آدرس",
      to: "addresses",
    },
    {
      done: c.orders > 0,
      label: "اولین خرید از دشت‌زاد",
      cta: "رفتن به فروشگاه",
      to: "orders",
    },
    {
      done: c.wishlist > 0,
      label: "افزودن محصول به علاقه‌مندی‌ها",
      cta: "مرور محصولات",
      to: "wishlist",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  return (
    <div className="rounded-2xl border border-store-border bg-store-surface shadow-store-xs">
      <div className="flex items-center justify-between border-b border-store-border px-5 py-3.5">
        <span className="font-bold text-store-text">شروع با دشت‌زاد</span>
        <span className="text-sm text-store-text-faint">
          {toPersianNumbers(doneCount)} از {toPersianNumbers(steps.length)} تکمیل شد
        </span>
      </div>
      <div className="h-1.5 bg-store-border">
        <div
          className="h-full rounded-full bg-store-primary transition-all"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>
      <ul className="divide-y divide-store-border px-5">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-3 py-3.5">
            {s.done ? (
              <CheckCircle2 className="size-5 shrink-0 text-store-primary" />
            ) : (
              <Circle className="size-5 shrink-0 text-store-border-strong" />
            )}
            <span
              className={`flex-1 text-sm font-medium ${s.done ? "text-store-text-faint line-through" : "text-store-text"}`}
            >
              {s.label}
            </span>
            {!s.done && (
              <button
                type="button"
                onClick={() => onNavigate(s.to)}
                className="shrink-0 text-xs font-bold text-store-primary hover:text-store-primary-hover"
              >
                {s.cta} ←
              </button>
            )}
          </li>
        ))}
      </ul>
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

      {/* onboarding checklist — shown to new users until all 4 steps done */}
      {overview && <OnboardingChecklist overview={overview} onNavigate={onNavigate} />}

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

      <RepeatPurchases />
    </div>
  );
}
