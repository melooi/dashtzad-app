"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { addItem } from "@/lib/cart";
import type { QuickAddData } from "./types";

/**
 * Real add-to-cart island for the card. ONLY used for simple, in-stock
 * products — the cart is keyed by productId and the order API reprices by
 * product, so this adds the real product line (no fake variant). Variable
 * products show a "مشاهده" link to the PDP selector instead.
 *
 * Emits the design's `.store-card__add` square button; stops propagation so a
 * quick-add tap never also triggers the card's title navigation.
 */
export function QuickAddButton({
  data,
  title,
  image,
  slug,
}: {
  data: QuickAddData;
  title: string;
  image: string | null;
  slug: string;
}) {
  const [added, setAdded] = useState(false);

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      {
        productId: data.productId,
        slug,
        title,
        image,
        priceRial: data.priceRial,
        basePriceRial: data.basePriceRial,
      },
      1,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={added ? "به سبد افزوده شد" : `افزودن ${title} به سبد`}
      className="store-card__add"
    >
      {added ? <Check className="size-5" aria-hidden /> : <Plus className="size-5" aria-hidden />}
    </button>
  );
}
