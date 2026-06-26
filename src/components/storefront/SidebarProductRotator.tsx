"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { Price } from "@/components/Price";
import type { StoreProductCardData } from "@/components/storefront/product-card/types";

// Slideshow-like, but NOT an interactive carousel: when there are more than
// WINDOW products, the visible set rotates automatically every few minutes
// (gentle fade). ≤ WINDOW products → static, no rotation.
const ROTATE_MS = 180_000; // ~3 minutes ("چند دقیقه یک‌بار")
const WINDOW = 3;

export function SidebarProductRotator({ products }: { products: StoreProductCardData[] }) {
  const rotates = products.length > WINDOW;
  const [start, setStart] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!rotates) return;
    const id = setInterval(() => {
      setFading(true);
      const t = setTimeout(() => {
        setStart((s) => (s + WINDOW) % products.length);
        setFading(false);
      }, 350);
      return () => clearTimeout(t);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [rotates, products.length]);

  const shown = rotates
    ? Array.from({ length: WINDOW }, (_, i) => products[(start + i) % products.length])
    : products;

  return (
    <div className={`flex flex-col gap-3 transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}>
      {shown.map((c) => (
        <Link key={c.slug} href={`/products/${c.slug}`} className="group flex items-center gap-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-store-border bg-store-surface">
            {c.image ? (
              <Image src={c.image} alt={c.title} fill sizes="56px" className="object-contain p-1" />
            ) : (
              <span className="flex h-full items-center justify-center text-store-text-faint"><Sparkles className="size-5" /></span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-medium text-store-text transition-colors group-hover:text-store-primary">{c.title}</p>
            <Price rial={c.price_rial} offRial={c.offPrice_rial} size="sm" className="mt-0.5" />
          </div>
        </Link>
      ))}
      {rotates && (
        <div className="flex justify-center gap-1 pt-1" aria-hidden>
          {Array.from({ length: Math.ceil(products.length / WINDOW) }, (_, i) => (
            <span
              key={i}
              className={`size-1.5 rounded-full transition-colors ${Math.floor(start / WINDOW) % Math.ceil(products.length / WINDOW) === i ? "bg-store-primary" : "bg-store-border-strong"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
