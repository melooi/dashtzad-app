"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Price } from "@/components/Price";
import {
  getCart,
  getTotals,
  increment,
  decrement,
  removeItem,
  lineKey,
  CART_EVENT,
  type CartItem,
} from "@/lib/cart";
import { toPersianNumbers } from "@/lib/price";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setItems(getCart());
    sync();
    // One-time mount flag to avoid SSR/localStorage hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    window.addEventListener(CART_EVENT, sync);
    return () => window.removeEventListener(CART_EVENT, sync);
  }, []);

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-store-text">
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-store-border bg-store-surface p-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-store-primary-soft text-store-primary-hover">
            <ShoppingBag className="size-7" aria-hidden />
          </span>
          <h1 className="font-heading text-lg font-bold text-store-text">سبد خرید شما خالی است</h1>
          <p className="text-sm text-store-text-faint">برای شروع، محصولی به سبد اضافه کنید.</p>
          <Link href="/products" className="store-btn store-btn-primary mt-1">
            مشاهده‌ی محصولات
          </Link>
        </div>
      </main>
    );
  }

  const totals = getTotals(items);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-store-text">
      <h1 className="mb-6 font-heading text-3xl font-bold text-store-text">سبد خرید</h1>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <ul className="flex flex-col gap-4">
          {items.map((item) => {
            const key = lineKey(item);
            return (
            <li
              key={key}
              className="flex items-center gap-4 rounded-2xl border border-store-border bg-store-surface p-4 shadow-store-xs"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-store-surface-soft p-1.5">
                {item.image && (
                  <Image src={item.image} alt={item.title} fill sizes="80px" className="object-contain" />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <Link
                  href={`/products/${item.slug}`}
                  className="text-sm font-medium text-store-text transition-colors hover:text-store-primary"
                >
                  {item.title}
                </Link>
                {item.variantLabel && (
                  <span className="text-xs text-store-text-faint">{item.variantLabel}</span>
                )}
                <Price rial={item.basePriceRial} offRial={item.priceRial < item.basePriceRial ? item.priceRial : null} size="sm" />
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-store-border px-3 py-2">
                <button onClick={() => increment(key)} aria-label="افزایش" className="text-store-primary-hover">
                  <Plus className="size-4" />
                </button>
                <span className="min-w-6 text-center font-bold text-store-text">
                  {toPersianNumbers(item.quantity)}
                </span>
                <button onClick={() => decrement(key)} aria-label="کاهش" className="text-store-primary-hover">
                  <Minus className="size-4" />
                </button>
              </div>

              <button
                onClick={() => removeItem(key)}
                aria-label="حذف"
                className="text-store-clay transition-opacity hover:opacity-70"
              >
                <Trash2 className="size-5" />
              </button>
            </li>
            );
          })}
        </ul>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-store-border bg-store-surface-warm p-5 shadow-store-xs">
          <h2 className="mb-4 font-bold text-store-text">خلاصه‌ی سفارش</h2>
          <div className="flex flex-col gap-3 text-sm">
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
            <div className="my-2 border-t border-store-border" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-store-text">قابل پرداخت</span>
              <Price rial={totals.totalRial} size="md" />
            </div>
          </div>
          <Link href="/checkout" className="store-btn store-btn-primary mt-5 w-full">
            ادامه‌ی پرداخت
          </Link>
        </aside>
      </div>
    </main>
  );
}
