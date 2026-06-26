"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { addItem } from "@/lib/cart";
import type { OrderDetail } from "@/lib/account/types";

/** Re-adds the order's still-available items to the (localStorage) cart. */
export function ReorderButton({ items }: { items: OrderDetail["reorder"] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (items.length === 0) return null;

  const reorder = () => {
    setBusy(true);
    for (const i of items) {
      addItem(
        {
          productId: i.productId,
          slug: i.slug,
          title: i.title,
          image: i.image,
          priceRial: i.priceRial,
          basePriceRial: i.basePriceRial,
        },
        i.quantity,
      );
    }
    router.push("/cart");
  };

  return (
    <button type="button" onClick={reorder} disabled={busy} className="store-btn store-btn-primary">
      <RotateCcw className="size-4" /> {busy ? "در حال انتقال…" : "خرید مجدد"}
    </button>
  );
}
