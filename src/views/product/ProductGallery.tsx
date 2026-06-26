"use client";

import Image from "next/image";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export function ProductGallery({
  images,
  title,
}: {
  images: { url: string; alt: string | null }[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const main = images[active]?.url;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-store-border bg-store-surface p-3">
        {main ? (
          <Image
            src={main}
            alt={images[active]?.alt ?? title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority
          />
        ) : (
          // Branded fallback when a product has no photo yet.
          <div className="flex h-full items-center justify-center bg-linear-to-br from-store-surface-soft to-store-cream">
            <Logo variant="mark" className="h-24 w-auto opacity-20" />
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative size-16 overflow-hidden rounded-lg border-2 bg-store-surface p-1 ${i === active ? "border-store-primary" : "border-store-border"}`}
            >
              <Image src={img.url} alt={img.alt ?? title} fill sizes="64px" className="object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
