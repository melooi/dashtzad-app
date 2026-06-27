"use client";

import { ShoppingBag, Tag } from "lucide-react";
import { Price } from "@/components/Price";
import type { CartItem } from "@/lib/cart";

function tp(n: number | string) {
  return String(n).replace(/\d/g, (c) => "۰۱۲۳۴۵۶۷۸۹"[+c]);
}

type Props = {
  items: CartItem[];
  subtotalRial: number;
  discountRial: number;
  shippingRial: number;
};

export function CheckoutCartSidebar({ items, subtotalRial, discountRial, shippingRial }: Props) {
  const totalRial = subtotalRial - discountRial + shippingRial;

  return (
    <div className="rounded-2xl border border-store-border bg-store-surface p-5 shadow-store-xs">
      {/* header */}
      <div className="mb-4 flex items-center gap-2">
        <ShoppingBag className="size-4 text-store-primary-hover" />
        <span className="font-bold text-store-text">سبد خرید</span>
        <span className="ms-auto rounded-full bg-store-primary-soft px-2 py-0.5 text-xs font-bold text-store-primary-hover">
          {tp(items.length)} کالا
        </span>
      </div>

      {/* items */}
      <ul className="flex flex-col gap-3 border-b border-store-border pb-4">
        {items.map((it, i) => (
          <li key={`${it.productId}-${i}`} className="flex items-center gap-2.5">
            {it.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={it.image}
                alt={it.title}
                className="size-12 shrink-0 rounded-xl border border-store-border object-contain p-1"
              />
            ) : (
              <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-store-border bg-store-surface-soft text-[10px] text-store-text-faint">
                کالا
              </div>
            )}
            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
              <p className="line-clamp-2 text-xs font-medium leading-5 text-store-text">{it.title}</p>
              {it.variantLabel && (
                <p className="text-[10px] text-store-text-faint">{it.variantLabel}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              {it.quantity > 1 && (
                <p className="text-[10px] text-store-text-faint">×{tp(it.quantity)}</p>
              )}
              <Price rial={it.priceRial * it.quantity} size="sm" />
            </div>
          </li>
        ))}
      </ul>

      {/* totals */}
      <div className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-store-text-muted">
          <span>جمع کالاها</span>
          <Price rial={subtotalRial} size="sm" />
        </div>
        {discountRial > 0 && (
          <div className="flex items-center justify-between text-store-primary-hover">
            <span className="flex items-center gap-1">
              <Tag className="size-3.5" /> تخفیف
            </span>
            <span className="flex items-center gap-0.5">
              −&nbsp;<Price rial={discountRial} size="sm" />
            </span>
          </div>
        )}
        <div className="flex justify-between text-store-text-muted">
          <span>هزینه ارسال</span>
          {shippingRial > 0 ? (
            <Price rial={shippingRial} size="sm" />
          ) : (
            <span className="text-store-text-faint text-xs">پس از انتخاب روش ارسال</span>
          )}
        </div>
        <div className="flex justify-between border-t border-store-border pt-3 font-bold text-store-text">
          <span>قابل پرداخت</span>
          <Price rial={totalRial} size="md" />
        </div>
      </div>
    </div>
  );
}
