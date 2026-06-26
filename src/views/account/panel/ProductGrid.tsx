"use client";

import { X } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card/ProductCard";
import type { AccountProductCard } from "@/lib/account/types";

export function ProductGrid({
  items,
  onRemove,
}: {
  items: AccountProductCard[];
  onRemove?: (slug: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <div key={p.productId} className="relative">
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(p.slug)}
              aria-label={`حذف ${p.title}`}
              className="store-focus absolute inset-inline-start-2 top-2 z-10 grid size-8 place-items-center rounded-full bg-store-surface/90 text-store-clay shadow-store-xs backdrop-blur transition-colors hover:bg-store-clay hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
          <ProductCard product={p} variant="compact" />
        </div>
      ))}
    </div>
  );
}
