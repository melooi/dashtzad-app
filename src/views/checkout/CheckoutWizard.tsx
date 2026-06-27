"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Zap, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CheckoutStepper } from "./CheckoutStepper";
import { CheckoutCartSidebar } from "./CheckoutCartSidebar";
import { LoginStep } from "./steps/LoginStep";
import { AddressStep, type AddressStepData } from "./steps/AddressStep";
import { ShippingStep, type ShippingStepData } from "./steps/ShippingStep";
import { PaymentStep, type PaymentStepData } from "./steps/PaymentStep";
import { getCart, getTotals, clear, type CartItem } from "@/lib/cart";
import type { AddressDTO } from "@/lib/account/types";

/* ── persistence ────────────────────────────────────────────────── */

const PERSIST_KEY = "dz_checkout_v1";

type PersistedState = {
  step: number;
  address: AddressStepData | null;
  shipping: ShippingStepData | null;
  cartHash: string;
};

function cartHash(items: CartItem[]) {
  return items.map((i) => `${i.productId}:${i.quantity}`).sort().join(",");
}

function saveState(s: PersistedState) {
  try { localStorage.setItem(PERSIST_KEY, JSON.stringify(s)); } catch {}
}

function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch { return null; }
}

function clearState() {
  try { localStorage.removeItem(PERSIST_KEY); } catch {}
}

/* ── helpers ────────────────────────────────────────────────────── */

function tp(n: number | string) {
  return String(n).replace(/\d/g, (c) => "۰۱۲۳۴۵۶۷۸۹"[+c]);
}

const TITLE_ICONS: Record<string, string> = {
  خانه: "🏠", "محل کار": "💼", هدیه: "🎁", سوپرایز: "🎉", پارتنر: "💑", ناشناس: "🕵️",
};

/* ── props ──────────────────────────────────────────────────────── */

export type CheckoutWizardProps = {
  addresses: AddressDTO[];
  user: { name: string | null } | null;
};

/* ── express checkout prompt ────────────────────────────────────── */

function ExpressCheckout({
  address,
  onConfirm,
  onManual,
}: {
  address: AddressDTO;
  onConfirm: () => void;
  onManual: () => void;
}) {
  const ic = address.title ? (TITLE_ICONS[address.title] ?? null) : null;
  return (
    <div className="animate-co-step-in rounded-3xl border-2 border-store-primary bg-store-primary-soft/30 p-6 shadow-[0_0_0_6px] shadow-store-primary/8">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-xl bg-store-primary text-white">
          <Zap className="size-5 fill-white" />
        </span>
        <div>
          <div className="font-bold text-store-text">خرید سریع</div>
          <div className="text-xs text-store-text-faint">با آدرس و ارسال پیش‌فرض</div>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-store-primary/20 bg-store-surface p-3.5 text-sm">
        <div className="mb-1.5 flex items-center gap-1.5 font-bold text-store-text">
          <MapPin className="size-3.5 text-store-primary-hover" />
          {ic && <span>{ic}</span>}
          {address.title || "آدرس"}
        </div>
        <p className="text-store-text-muted">
          {address.province}، {address.city}، {address.line}
          {address.plaque ? `، پلاک ${address.plaque}` : ""}
        </p>
        <p className="mt-1 text-xs text-store-text-faint">{address.receiverName} — {address.phone}</p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-store-primary-hover font-medium">
          <Zap className="size-3.5 fill-current" /> اکسپرس — فردا صبح زود
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="store-btn store-btn-primary w-full justify-center gap-2 py-3.5 text-base"
        >
          <Zap className="size-4 fill-white" />
          تأیید و رفتن به پرداخت
        </button>
        <button
          type="button"
          onClick={onManual}
          className="store-btn store-btn-secondary w-full justify-center text-sm"
        >
          <ArrowLeft className="size-4" />
          ورود به مرحله‌بندی معمول
        </button>
      </div>
    </div>
  );
}

/* ── main wizard ────────────────────────────────────────────────── */

export function CheckoutWizard({ addresses, user }: CheckoutWizardProps) {
  const router = useRouter();
  const isGuest = user === null;
  const FIRST_STEP = isGuest ? 1 : 3;

  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(FIRST_STEP);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [data, setData] = useState<{ address: AddressStepData | null; shipping: ShippingStepData | null }>({
    address: null,
    shipping: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  /* express checkout */
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const canExpress = !isGuest && !!defaultAddress;
  const [showExpress, setShowExpress] = useState(canExpress);

  const cardRef = useRef<HTMLDivElement>(null);

  /* ── mount: restore or init ────────────────────────────────────── */
  useEffect(() => {
    const cart = getCart();
    setItems(cart);
    const hash = cartHash(cart);
    const saved = loadState();

    if (saved && saved.cartHash === hash) {
      let restoredStep = saved.step;
      if (!isGuest && restoredStep < 3) restoredStep = 3;
      setStep(restoredStep);
      setData({ address: saved.address, shipping: saved.shipping });
      // If state was saved, skip express
      setShowExpress(false);
    } else {
      clearState();
      setStep(isGuest ? 1 : 3);
    }
    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── persist on state change ───────────────────────────────────── */
  useEffect(() => {
    if (!ready) return;
    saveState({ step, address: data.address, shipping: data.shipping, cartHash: cartHash(items) });
  }, [step, data, items, ready]);

  /* ── navigation ─────────────────────────────────────────────────── */
  const go = (next: number, dir: "forward" | "back") => {
    setDirection(dir);
    setStep(next);
    setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  /* ── express confirm ────────────────────────────────────────────── */
  const handleExpressConfirm = () => {
    if (!defaultAddress) return;
    const expressShipping: ShippingStepData = {
      deliveryDate: new Date(Date.now() + 86400000).toISOString(),
      deliverySlot: "morning",
      shippingMethod: "express",
      includeInvoice: true,
      note: "",
      shippingRial: 1_179_000,
    };
    setData({ address: { addressId: defaultAddress.id }, shipping: expressShipping });
    setShowExpress(false);
    go(5, "forward");
  };

  /* ── step handlers ──────────────────────────────────────────────── */
  const handleAddress = (d: AddressStepData) => { setData((p) => ({ ...p, address: d })); go(4, "forward"); };
  const handleShipping = (d: ShippingStepData) => { setData((p) => ({ ...p, shipping: d })); go(5, "forward"); };

  const handlePayment = async (d: PaymentStepData) => {
    if (!data.address || !data.shipping) return;
    setServerError("");
    setSubmitting(true);

    const { shippingRial } = data.shipping;
    const noteParts = [
      data.shipping.note,
      `روش ارسال: ${data.shipping.shippingMethod}`,
      `بازه: ${data.shipping.deliverySlot}`,
      data.shipping.includeInvoice ? "فاکتور: بله" : "فاکتور: خیر",
      d.discountCode ? `کد تخفیف: ${d.discountCode}` : null,
    ].filter(Boolean);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          addressId: data.address.addressId,
          shippingRial,
          note: noteParts.join(" | ") || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setServerError(json.error ?? "خطا در ثبت سفارش."); setSubmitting(false); return; }
      clearState();
      clear();
      router.push(`/orders/${json.orderId}`);
    } catch {
      setServerError("خطا در ارتباط با سرور.");
      setSubmitting(false);
    }
  };

  /* ── render ─────────────────────────────────────────────────────── */
  if (!ready) return null;

  /* empty cart */
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-store-border bg-store-surface p-16 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-store-primary-soft text-store-primary-hover">
          <ShoppingBag className="size-8" />
        </span>
        <div>
          <h2 className="font-heading text-lg font-bold text-store-text">سبد خرید خالی است</h2>
          <p className="mt-1 text-sm text-store-text-faint">برای ثبت سفارش ابتدا محصولی به سبد اضافه کنید.</p>
        </div>
        <Link href="/products" className="store-btn store-btn-primary">مشاهده محصولات</Link>
      </div>
    );
  }

  const totals = getTotals(items);
  const shippingRial = data.shipping?.shippingRial ?? 0;
  const animClass = direction === "forward" ? "animate-co-step-in" : "animate-co-step-back";

  return (
    <div className="flex flex-col gap-8">
      {/* stepper */}
      <CheckoutStepper current={step} />

      {/* two-column layout on desktop */}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        {/* left: step card */}
        <div ref={cardRef} className="scroll-mt-24">
          {showExpress && canExpress ? (
            <ExpressCheckout
              address={defaultAddress!}
              onConfirm={handleExpressConfirm}
              onManual={() => setShowExpress(false)}
            />
          ) : (
            <div className="rounded-3xl border border-store-border bg-store-surface p-6 shadow-store-xs md:p-8">
              <div key={step} className={animClass}>
                {step === 1 && <LoginStep />}
                {step === 3 && (
                  <AddressStep
                    addresses={addresses}
                    defaultId={defaultAddress?.id}
                    onNext={handleAddress}
                  />
                )}
                {step === 4 && (
                  <ShippingStep
                    onNext={handleShipping}
                    onBack={() => go(3, "back")}
                  />
                )}
                {step === 5 && (
                  <PaymentStep
                    items={items}
                    subtotalRial={totals.subtotalRial}
                    discountRial={totals.discountRial}
                    shippingRial={shippingRial}
                    totalRial={totals.totalRial + shippingRial}
                    submitting={submitting}
                    serverError={serverError}
                    onNext={handlePayment}
                    onBack={() => go(4, "back")}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* right: sticky cart sidebar */}
        <div className="lg:sticky lg:top-24">
          <CheckoutCartSidebar
            items={items}
            subtotalRial={totals.subtotalRial}
            discountRial={totals.discountRial}
            shippingRial={shippingRial}
          />
        </div>
      </div>
    </div>
  );
}
