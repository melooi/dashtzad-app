"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Headset, PackageCheck, Tag } from "lucide-react";
import { AddToCart } from "@/views/product/AddToCart";
import { VariantOptionGroup, type VariantOption } from "@/views/product/ProductVariantSelector";
import { formatToman, toPersianNumbers } from "@/lib/price";

export type PdpVariant = {
  id: string;
  sku: string;
  price_rial: number;
  offPrice_rial: number | null;
  stock: number;
  weightId: string | null;
  weightTitle: string | null;
  packagingId: string | null;
  packagingTitle: string | null;
};

type Base = {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  price_rial: number;
  offPrice_rial: number | null;
  countInStock: number;
};

function distinct<T extends { id: string; title: string }>(rows: T[]): { id: string; title: string }[] {
  const seen = new Map<string, string>();
  for (const r of rows) if (r.id && !seen.has(r.id)) seen.set(r.id, r.title);
  return [...seen].map(([id, title]) => ({ id, title }));
}

// Large store-palette price (was/now + toman mask icon). Real prices only.
function BoxPrice({
  rial,
  offRial,
  from = false,
}: {
  rial: number;
  offRial: number | null;
  from?: boolean;
}) {
  const hasOff = offRial != null && offRial < rial;
  const effective = hasOff ? offRial! : rial;
  return (
    <div className="flex flex-col gap-0.5">
      {hasOff && (
        <span className="text-sm text-store-clay line-through" style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatToman(rial)}
        </span>
      )}
      <span
        className="flex items-baseline gap-1.5 font-heading text-3xl font-bold text-store-text"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {from && <span className="text-base font-normal text-store-text-faint">از</span>}
        {formatToman(effective)}
        <span className="store-toman" aria-hidden style={{ width: "0.7em", height: "0.62em" }} />
        <span className="sr-only">تومان</span>
      </span>
    </div>
  );
}

/**
 * Purchase box for the PDP. Two honest modes:
 *  - Simple product (no active variants): real product-level add-to-cart.
 *  - Variable product: weight→packaging selector that updates price/stock/SKU.
 *    The current cart/order API is product-keyed (no productVariantId), so we
 *    show a SAFE CTA — never a fabricated variant add-to-cart.
 */
export function ProductPurchaseBox({
  product,
  variants,
}: {
  product: Base;
  variants: PdpVariant[];
}) {
  const hasVariants = variants.length > 0;

  // -------- Simple product --------
  if (!hasVariants) {
    const inStock = product.countInStock > 0;
    return (
      <div className="flex flex-col gap-5">
        <BoxPrice rial={product.price_rial} offRial={product.offPrice_rial} />
        <StockLine inStock={inStock} qty={product.countInStock} />
        <AddToCart
          inStock={inStock}
          item={{
            productId: product.id,
            slug: product.slug,
            title: product.title,
            image: product.image,
            priceRial: product.offPrice_rial ?? product.price_rial,
            basePriceRial: product.price_rial,
          }}
        />
      </div>
    );
  }

  return <VariablePurchase variants={variants} />;
}

function VariablePurchase({ variants }: { variants: PdpVariant[] }) {
  const weights = useMemo(
    () => distinct(variants.filter((v) => v.weightId).map((v) => ({ id: v.weightId!, title: v.weightTitle ?? "" }))),
    [variants],
  );
  const hasWeightStep = weights.length > 0;
  const hasPackagingStep = variants.some((v) => v.packagingId);

  // Auto-select when there's exactly one weight.
  const [weightId, setWeightId] = useState<string | null>(
    hasWeightStep && weights.length === 1 ? weights[0].id : null,
  );
  const [packagingId, setPackagingId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Weight options with sold-out flag (all variants for that weight out of stock).
  const weightOptions: VariantOption[] = weights.map((w) => ({
    id: w.id,
    title: w.title,
    soldOut: variants.filter((v) => v.weightId === w.id).every((v) => v.stock <= 0),
  }));

  // Packaging options depend on the chosen weight (or all, if no weight step).
  const packagingOptions: VariantOption[] = useMemo(() => {
    const pool = hasWeightStep ? variants.filter((v) => v.weightId === weightId) : variants;
    const rows = distinct(pool.filter((v) => v.packagingId).map((v) => ({ id: v.packagingId!, title: v.packagingTitle ?? "" })));
    const allPackaging = distinct(variants.filter((v) => v.packagingId).map((v) => ({ id: v.packagingId!, title: v.packagingTitle ?? "" })));
    // Show every packaging type; disable the ones with no variant for this weight.
    return allPackaging.map((p) => {
      const exists = rows.some((r) => r.id === p.id);
      const match = pool.find((v) => v.packagingId === p.id);
      return {
        id: p.id,
        title: p.title,
        disabled: hasWeightStep && weightId != null && !exists,
        soldOut: !!match && match.stock <= 0,
      };
    });
  }, [variants, weightId, hasWeightStep]);

  // Derive (not store) an auto-pick: when exactly one packaging is available
  // for the chosen weight, treat it as selected. Keeps single-variant products
  // to a one-tap flow without a setState-in-effect.
  const availablePackaging = packagingOptions.filter((o) => !o.disabled);
  const effectivePackagingId =
    packagingId ?? (availablePackaging.length === 1 ? availablePackaging[0].id : null);

  // Resolve the selected variant from the current selection.
  const selected = useMemo(() => {
    return (
      variants.find((v) => {
        const weightOk = !hasWeightStep || v.weightId === weightId;
        const packagingOk = !hasPackagingStep || v.packagingId === effectivePackagingId;
        return weightOk && packagingOk;
      }) ?? null
    );
  }, [variants, weightId, effectivePackagingId, hasWeightStep, hasPackagingStep]);

  const needsMore = (hasWeightStep && !weightId) || (hasPackagingStep && !effectivePackagingId);
  const inStock = !!selected && selected.stock > 0;

  // Price preview: selected variant, else the lowest variant price ("از …").
  const lowest = useMemo(() => {
    const eff = (v: PdpVariant) => (v.offPrice_rial != null && v.offPrice_rial < v.price_rial ? v.offPrice_rial : v.price_rial);
    return variants.reduce((m, v) => Math.min(m, eff(v)), Infinity);
  }, [variants]);

  return (
    <div className="flex flex-col gap-5">
      {/* Price */}
      {selected ? (
        <BoxPrice rial={selected.price_rial} offRial={selected.offPrice_rial} />
      ) : (
        <BoxPrice rial={lowest} offRial={null} from />
      )}

      {/* Selectors: weight first, packaging second */}
      <div className="flex flex-col gap-4">
        {hasWeightStep && (
          <VariantOptionGroup
            name="dz-weight"
            label="وزن"
            hint="ابتدا وزن را انتخاب کنید"
            options={weightOptions}
            value={weightId}
            onChange={(id) => {
              setWeightId(id);
              setPackagingId(null);
              setShowDetails(false);
            }}
          />
        )}
        {hasPackagingStep && (
          <VariantOptionGroup
            name="dz-packaging"
            label="بسته‌بندی"
            hint={hasWeightStep && !weightId ? "ابتدا وزن را انتخاب کنید" : undefined}
            options={packagingOptions}
            value={effectivePackagingId}
            onChange={(id) => {
              setPackagingId(id);
              setShowDetails(false);
            }}
          />
        )}
      </div>

      {/* Selected variant meta */}
      {selected && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-store-text-faint">
          <span className="inline-flex items-center gap-1">
            <Tag className="size-3.5 text-store-text-faint" aria-hidden />
            کد محصول: <span dir="ltr" className="font-mono text-store-text-muted">{selected.sku}</span>
          </span>
          <StockLine inStock={inStock} qty={selected.stock} compact />
        </div>
      )}

      {/* CTA — safe, never a fabricated variant add-to-cart */}
      {needsMore ? (
        <button type="button" disabled className="store-btn store-btn-soft w-full">
          انتخاب مدل فروش
        </button>
      ) : !inStock ? (
        <button type="button" disabled className="store-btn store-btn-secondary w-full">
          ناموجود
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowDetails((s) => !s)}
          aria-expanded={showDetails}
          className="store-btn store-btn-primary w-full"
        >
          <PackageCheck className="size-5" aria-hidden />
          مشاهده جزئیات خرید
        </button>
      )}

      {/* Honest purchase-detail disclosure (no fake cart) */}
      {showDetails && selected && inStock && (
        <div className="rounded-xl border border-store-border bg-store-primary-tint p-4 text-sm">
          <p className="leading-7 text-store-text-muted">
            مدل انتخابی شما{" "}
            <span className="font-medium text-store-text">
              {[selected.weightTitle, selected.packagingTitle].filter(Boolean).join(" / ")}
            </span>{" "}
            موجود است. افزودن این مدل به سبد خرید به‌زودی فعال می‌شود؛ برای ثبت سفارش با پشتیبانی دشت‌زاد در تماس باشید.
          </p>
          <Link
            href="/contact"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-store-surface px-4 py-2 text-sm font-medium text-store-primary-hover ring-1 ring-inset ring-store-border transition-colors hover:bg-store-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-primary"
          >
            <Headset className="size-4" aria-hidden />
            تماس با پشتیبانی
          </Link>
        </div>
      )}
    </div>
  );
}

function StockLine({
  inStock,
  qty,
  compact = false,
}: {
  inStock: boolean;
  qty: number;
  compact?: boolean;
}) {
  if (!inStock) {
    return <span className={`font-bold text-store-clay ${compact ? "text-xs" : "text-sm"}`}>ناموجود</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold text-store-success ${compact ? "text-xs" : "text-sm"}`}>
      <span className="size-1.5 rounded-full bg-store-success" aria-hidden />
      موجود در انبار{qty > 0 && qty <= 10 ? ` (${toPersianNumbers(qty)} عدد)` : ""}
    </span>
  );
}
