"use client";

import { useState } from "react";
import { Building2, CreditCard, Wallet2, Truck, Tag, ChevronDown, Shield, Lock } from "lucide-react";
import type { CartItem } from "@/lib/cart";
import { Price } from "@/components/Price";

/* ── constants ──────────────────────────────────────────────────────── */

const PAYMENT_METHODS = [
  {
    id: "bank",
    label: "درگاه بانکی سامان (SEP)",
    sub: "پرداخت از تمامی کارت‌های عضو شتاب",
    icon: Building2,
    iconClass: "bg-blue-50 text-blue-600",
    available: true,
  },
  {
    id: "installment",
    label: "پرداخت قسطی با اسنپ‌پی",
    sub: "تأیید آنی — بدون نیاز به مدارک",
    icon: CreditCard,
    iconClass: "bg-orange-50 text-orange-500",
    available: false,
    badge: "به زودی",
    badgeClass: "bg-store-surface-soft text-store-text-faint",
  },
  {
    id: "wallet",
    label: "کیف پول اسمارتیز",
    sub: "موجودی: ۰ تومان",
    icon: Wallet2,
    iconClass: "bg-green-50 text-green-600",
    available: false,
    badge: "شارژ کنید",
    badgeClass: "bg-store-primary-soft text-store-primary-hover",
  },
  {
    id: "cod",
    label: "پرداخت در محل",
    sub: "تهران و کرج — تحویل به پیک در هنگام دریافت",
    icon: Truck,
    iconClass: "bg-store-surface-soft text-store-text-muted",
    available: true,
  },
] as const;
type PayMethod = (typeof PAYMENT_METHODS)[number]["id"];

function toPersian(n: number | string) {
  return String(n).replace(/\d/g, (c) => "۰۱۲۳۴۵۶۷۸۹"[+c]);
}

/* ── types ──────────────────────────────────────────────────────── */

export type PaymentStepData = {
  paymentMethod: PayMethod;
  discountCode: string;
};

type Props = {
  items: CartItem[];
  subtotalRial: number;
  discountRial: number;
  shippingRial: number;
  totalRial: number;
  submitting: boolean;
  serverError: string;
  onNext: (d: PaymentStepData) => void;
  onBack: () => void;
};

/* ── component ──────────────────────────────────────────────────── */

export function PaymentStep({
  items,
  subtotalRial,
  discountRial,
  shippingRial,
  totalRial,
  submitting,
  serverError,
  onNext,
  onBack,
}: Props) {
  const [method, setMethod] = useState<PayMethod>("bank");
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [terms, setTerms] = useState(false);

  const handleSubmit = () => {
    if (!terms || submitting) return;
    onNext({ paymentMethod: method, discountCode });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-xl font-bold text-store-text">روش پرداخت</h2>
        <p className="mt-0.5 text-sm text-store-text-faint">شیوه پرداخت مبلغ سفارش</p>
      </div>

      {/* payment methods */}
      <section>
        <div className="mb-2 text-sm font-bold text-store-text flex items-center gap-1.5">
          <CreditCard className="size-4 text-store-primary-hover" />
          روش پرداخت
        </div>
        <div className="flex flex-col gap-2.5">
          {PAYMENT_METHODS.map((pm) => {
            const active = method === pm.id && pm.available;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => pm.available && setMethod(pm.id)}
                disabled={!pm.available}
                className={`flex items-center gap-3.5 rounded-2xl border p-4 text-right transition-all ${
                  active
                    ? "border-store-primary bg-store-primary-soft/50 shadow-[0_0_0_3px] shadow-store-primary/10"
                    : pm.available
                      ? "border-store-border bg-store-surface hover:border-store-primary/40"
                      : "border-store-border bg-store-surface opacity-60 cursor-not-allowed"
                }`}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${pm.iconClass}`}>
                  <pm.icon className="size-5" />
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-store-text">{pm.label}</span>
                    {"badge" in pm && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pm.badgeClass}`}>
                        {pm.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-store-text-faint">{pm.sub}</span>
                </div>
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition-all ${
                    active ? "border-store-primary bg-store-primary" : "border-store-border"
                  }`}
                >
                  {active && (
                    <span className="size-2 rounded-full bg-white" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* discount code */}
      <section className="rounded-xl border border-store-border bg-store-surface overflow-hidden">
        <button
          type="button"
          onClick={() => setDiscountOpen(!discountOpen)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-sm"
        >
          <Tag className="size-4 text-store-primary-hover" />
          <span className="flex-1 text-right font-medium text-store-text">
            برای استفاده از کد تخفیف اینجا کلیک کنید
          </span>
          <ChevronDown
            className={`size-4 text-store-text-faint transition-transform duration-200 ${discountOpen ? "rotate-180" : ""}`}
          />
        </button>
        {discountOpen && (
          <div className="border-t border-store-border px-4 py-3">
            <div className="flex gap-2">
              <input
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="کد تخفیف را وارد کنید"
                dir="ltr"
                className="flex-1 rounded-xl border border-store-border bg-store-surface px-3.5 py-2.5 text-center text-sm font-bold tracking-widest text-store-text outline-none placeholder:text-store-text-faint placeholder:font-normal placeholder:tracking-normal focus:border-store-primary"
              />
              <button type="button" className="store-btn store-btn-primary">
                اعمال
              </button>
            </div>
          </div>
        )}
      </section>

      {/* cart summary */}
      <section className="rounded-2xl border border-store-border bg-store-surface-soft p-4">
        <div className="mb-3 text-sm font-bold text-store-text">خلاصه سفارش</div>
        <ul className="mb-3 flex flex-col gap-2 text-sm">
          {items.slice(0, 3).map((it, i) => (
            <li key={`${it.productId}-${i}`} className="flex items-center justify-between gap-2">
              <span className="line-clamp-1 text-store-text-muted">
                {it.title}
                {it.quantity > 1 && (
                  <span className="mr-1 text-store-text-faint">×{toPersian(it.quantity)}</span>
                )}
              </span>
              <Price rial={it.priceRial * it.quantity} size="sm" />
            </li>
          ))}
          {items.length > 3 && (
            <li className="text-xs text-store-text-faint">
              و {toPersian(items.length - 3)} کالای دیگر…
            </li>
          )}
        </ul>
        <div className="flex flex-col gap-2 border-t border-store-border pt-3 text-sm">
          <div className="flex justify-between text-store-text-muted">
            <span>جمع کالاها</span>
            <Price rial={subtotalRial} size="sm" />
          </div>
          {discountRial > 0 && (
            <div className="flex justify-between text-store-primary-hover">
              <span>تخفیف</span>
              <span>− <Price rial={discountRial} size="sm" /></span>
            </div>
          )}
          <div className="flex justify-between text-store-text-muted">
            <span>هزینه ارسال</span>
            <Price rial={shippingRial} size="sm" />
          </div>
          <div className="flex justify-between border-t border-store-border pt-2 font-bold text-store-text">
            <span>مجموع قابل پرداخت</span>
            <Price rial={totalRial} size="md" />
          </div>
        </div>
      </section>

      {/* terms */}
      <label className="flex items-center gap-2.5 text-sm text-store-text-muted cursor-pointer">
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="size-4 accent-store-primary"
        />
        <a href="/rules" target="_blank" className="font-bold text-store-primary-hover underline">
          شرایط وب‌سایت
        </a>
        را مطالعه کرده‌ام و می‌پذیرم
      </label>

      {serverError && (
        <div className="rounded-xl bg-store-clay-soft px-4 py-3 text-sm text-store-clay-deep">
          {serverError}
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="store-btn store-btn-secondary">
          ← برگشت
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!terms || submitting}
          className="store-btn store-btn-primary flex-1 justify-center gap-2 py-3.5 text-base disabled:opacity-60"
        >
          <Lock className="size-4" />
          {submitting ? "در حال ثبت سفارش…" : "پرداخت از طریق درگاه بانکی"}
        </button>
      </div>

      <p className="text-center text-xs text-store-text-faint flex items-center justify-center gap-1">
        <Shield className="size-3.5" />
        پرداخت امن از طریق درگاه معتبر بانکی
      </p>
    </div>
  );
}
