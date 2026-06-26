"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { addItem } from "@/lib/cart";
import { toPersianNumbers } from "@/lib/price";
import type { CartItem } from "@/lib/cart";

// Store-palette add-to-cart (green). Used for SIMPLE products only — the cart
// is keyed by productId and reprices by product, so this is a real product add.
export function AddToCart({
  item,
  inStock,
}: {
  item: Omit<CartItem, "quantity">;
  inStock: boolean;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!inStock) {
    return (
      <div className="rounded-xl bg-store-surface-soft px-4 py-3 text-center text-sm font-medium text-store-text-faint">
        ناموجود
      </div>
    );
  }

  const handleAdd = () => {
    addItem(item, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3 rounded-xl border border-store-border bg-store-surface px-3 py-2">
        <button onClick={() => setQty((q) => q + 1)} aria-label="افزایش" className="text-store-primary-hover">
          <Plus className="size-4" />
        </button>
        <span className="min-w-6 text-center font-bold text-store-text">{toPersianNumbers(qty)}</span>
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="کاهش"
          className="text-store-primary-hover"
        >
          <Minus className="size-4" />
        </button>
      </div>
      <button onClick={handleAdd} className="store-btn store-btn-primary flex-1">
        {added ? <Check className="size-5" /> : <ShoppingCart className="size-5" />}
        {added ? "افزوده شد" : "افزودن به سبد"}
      </button>
    </div>
  );
}
