"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShoppingBag } from "lucide-react";
import { TextField } from "@/common/TextField";
import { Price } from "@/components/Price";
import { getCart, getTotals, clear, type CartItem } from "@/lib/cart";
import { normalizeDigits } from "@/lib/auth/phone";

export type SavedAddress = {
  id: string;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  line: string;
};

const addressSchema = z.object({
  receiverName: z.string().min(2, "نام گیرنده را وارد کنید."),
  phone: z
    .string()
    .transform((v) => normalizeDigits(v).trim())
    .refine((v) => /^0\d{10}$/.test(v), "شماره تماس معتبر نیست."),
  province: z.string().min(1, "استان را وارد کنید."),
  city: z.string().min(1, "شهر را وارد کنید."),
  postalCode: z
    .string()
    .transform((v) => normalizeDigits(v).trim())
    .refine((v) => /^\d{5,10}$/.test(v), "کد پستی معتبر نیست."),
  line: z.string().min(3, "نشانی کامل را وارد کنید."),
});
type AddressForm = z.input<typeof addressSchema>;

export function CheckoutForm({ addresses }: { addresses: SavedAddress[] }) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<string>(addresses[0]?.id ?? "new");
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AddressForm>({ resolver: zodResolver(addressSchema) });

  useEffect(() => {
    // Read the localStorage cart on mount (client-only) to avoid hydration
    // mismatch. Intentional one-time sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(getCart());
    setReady(true);
  }, []);

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-store-border bg-store-surface p-14 text-center text-store-text">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-store-primary-soft text-store-primary-hover">
          <ShoppingBag className="size-7" aria-hidden />
        </span>
        <h2 className="font-heading text-lg font-bold text-store-text">سبد خرید خالی است</h2>
        <p className="text-sm text-store-text-faint">برای ثبت سفارش ابتدا محصولی به سبد اضافه کنید.</p>
        <Link href="/products" className="store-btn store-btn-primary mt-1">
          مشاهده‌ی محصولات
        </Link>
      </div>
    );
  }

  const totals = getTotals(items);
  const orderItems = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));

  const submitOrder = async (body: Record<string, unknown>) => {
    setServerError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: orderItems, ...body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "خطا در ثبت سفارش.");
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/orders/${data.orderId}`);
    } catch {
      setServerError("خطا در ارتباط با سرور.");
      setSubmitting(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected === "new") {
      form.handleSubmit((d) => submitOrder({ address: addressSchema.parse(d) }))();
    } else {
      submitOrder({ addressId: selected });
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-8 text-store-text md:grid-cols-[1fr_320px]">
      {/* Address */}
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold text-store-text">آدرس تحویل</h2>

        {addresses.length > 0 && (
          <div className="flex flex-col gap-2">
            {addresses.map((a) => (
              <label
                key={a.id}
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${selected === a.id ? "border-store-primary bg-store-primary-soft/40" : "border-store-border hover:border-store-primary/40"}`}
              >
                <input
                  type="radio"
                  name="addr"
                  checked={selected === a.id}
                  onChange={() => setSelected(a.id)}
                  className="mt-1 accent-store-primary"
                />
                <div className="text-sm text-store-text">
                  <div className="font-medium">{a.receiverName} — {a.phone}</div>
                  <div className="text-store-text-muted">
                    {a.province}، {a.city}، {a.line} (کد پستی {a.postalCode})
                  </div>
                </div>
              </label>
            ))}
            <label
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${selected === "new" ? "border-store-primary bg-store-primary-soft/40" : "border-store-border hover:border-store-primary/40"}`}
            >
              <input type="radio" name="addr" checked={selected === "new"} onChange={() => setSelected("new")} className="mt-1 accent-store-primary" />
              <span className="text-sm font-medium text-store-text">آدرس جدید</span>
            </label>
          </div>
        )}

        {selected === "new" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="نام گیرنده" error={form.formState.errors.receiverName?.message} {...form.register("receiverName")} />
            <TextField label="شماره تماس" dir="ltr" inputMode="numeric" error={form.formState.errors.phone?.message} {...form.register("phone")} />
            <TextField label="استان" error={form.formState.errors.province?.message} {...form.register("province")} />
            <TextField label="شهر" error={form.formState.errors.city?.message} {...form.register("city")} />
            <TextField label="کد پستی" dir="ltr" inputMode="numeric" error={form.formState.errors.postalCode?.message} {...form.register("postalCode")} />
            <div className="sm:col-span-2">
              <TextField label="نشانی کامل" error={form.formState.errors.line?.message} {...form.register("line")} />
            </div>
          </div>
        )}
      </section>

      {/* Summary */}
      <aside className="h-fit rounded-2xl border border-store-border bg-store-surface-warm p-5 shadow-store-xs">
        <h2 className="mb-4 font-bold text-store-text">خلاصه‌ی سفارش</h2>
        <ul className="mb-4 flex flex-col gap-2 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex items-center justify-between gap-2">
              <span className="line-clamp-1 text-store-text-muted">{i.title} ×{i.quantity}</span>
              <Price rial={i.priceRial * i.quantity} size="sm" />
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 border-t border-store-border pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-store-text-muted">جمع کل</span>
            <Price rial={totals.subtotalRial} size="sm" />
          </div>
          {totals.discountRial > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-store-text-muted">تخفیف</span>
              <Price rial={totals.discountRial} size="sm" />
            </div>
          )}
          <div className="flex items-center justify-between font-bold text-store-text">
            <span>قابل پرداخت</span>
            <Price rial={totals.totalRial} size="md" />
          </div>
        </div>
        {serverError && <p className="mt-3 text-xs text-store-clay">{serverError}</p>}
        <button type="submit" disabled={submitting} className="store-btn store-btn-primary mt-5 w-full">
          {submitting ? "در حال ثبت…" : "ثبت سفارش"}
        </button>
      </aside>
    </form>
  );
}
