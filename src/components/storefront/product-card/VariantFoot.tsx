"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive, ChevronLeft, ChevronRight, Eye, Gift, Minus, Package,
  Plus, ShoppingCart, Trash2, X,
} from "lucide-react";
import Link from "next/link";
import { addItem, getQty, increment, decrement, setQty, lineKey, CART_EVENT } from "@/lib/cart";
import { formatToman } from "@/lib/price";
import type { CardVariantOption, StoreProductCardData } from "./types";

/**
 * Variable-product foot: REAL weight → packaging selector → quantity stepper.
 * Faithful port of design-export product-card.js `initAdd()`, driven by real
 * ProductVariant rows (price/stock from the DB — no fake factor multiplication).
 *
 * Renders the two foot children (price + action) plus a full-card overlay for
 * the two selection steps. Overlay is position:absolute inset:0 over the card.
 */
type Weight = { weightId: string; weightTitle: string; gramValue: number; minPrice: number };

function Toman() {
  return (
    <>
      <span className="store-toman" aria-hidden />
      <span className="sr-only">تومان</span>
    </>
  );
}

export function VariantFoot({ product }: { product: StoreProductCardData }) {
  const variants = product.variants ?? [];
  const productId = product.productId ?? product.slug;

  // ── derive weights (ordered by gram) and packaging-per-weight ──────────────
  const weights = useMemo<Weight[]>(() => {
    const map = new Map<string, Weight>();
    for (const v of variants) {
      const cur = map.get(v.weightId);
      if (!cur) map.set(v.weightId, { weightId: v.weightId, weightTitle: v.weightTitle, gramValue: v.gramValue, minPrice: v.priceRial });
      else if (v.priceRial < cur.minPrice) cur.minPrice = v.priceRial;
    }
    return [...map.values()].sort((a, b) => a.gramValue - b.gramValue);
  }, [variants]);

  const packagingsFor = (weightId: string): CardVariantOption[] =>
    variants.filter((v) => v.weightId === weightId).sort((a, b) => a.priceRial - b.priceRial);

  const lowest = useMemo(() => Math.min(...variants.map((v) => v.priceRial)), [variants]);

  // ── state ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<"idle" | "weight" | "packaging" | "qty">("idle");
  const [wId, setWId] = useState(weights[0]?.weightId ?? "");
  const [pId, setPId] = useState("");
  const [qty, setQtyState] = useState(0);
  const [armed, setArmed] = useState(false);

  const selected: CardVariantOption | undefined = useMemo(
    () => variants.find((v) => v.weightId === wId && v.packagingId === pId)
      ?? packagingsFor(wId)[0],
    [variants, wId, pId], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const activeKey = selected ? lineKey({ productId, variantId: selected.id }) : "";

  // keep stepper qty in sync with the cart (so external removal resets the card)
  useEffect(() => {
    if (step !== "qty" || !activeKey) return;
    const sync = () => {
      const q = getQty(activeKey);
      setQtyState(q);
      if (q <= 0) { setStep("idle"); setArmed(false); }
    };
    sync();
    window.addEventListener(CART_EVENT, sync);
    return () => window.removeEventListener(CART_EVENT, sync);
  }, [step, activeKey]);

  // ── actions ──────────────────────────────────────────────────────────────
  const openWeight = () => {
    setWId(weights[0]?.weightId ?? "");
    setPId("");
    setStep("weight");
  };
  const goPackaging = () => {
    const cheapest = packagingsFor(wId)[0];
    setPId(cheapest?.packagingId ?? "");
    setStep("packaging");
  };
  const close = () => setStep("idle");

  const addToCart = () => {
    if (!selected) return;
    addItem(
      {
        productId,
        slug: product.slug,
        title: product.title,
        image: product.image,
        priceRial: selected.priceRial,
        basePriceRial: selected.basePriceRial,
        variantId: selected.id,
        variantLabel: `${selected.weightTitle} · ${selected.packagingTitle}`,
      },
      1,
    );
    setQtyState(1);
    setArmed(false);
    setStep("qty");
  };

  const onInc = () => { if (armed) setArmed(false); increment(activeKey); setQtyState((q) => q + 1); };
  const onDec = () => {
    if (qty > 1) { decrement(activeKey); setQtyState((q) => q - 1); return; }
    if (!armed) { setArmed(true); return; }
    setQty(activeKey, 0);
    setArmed(false);
    setStep("idle");
  };

  // ── render: price (right) + action (left) + overlay ─────────────────────────
  const priceNode =
    step === "qty" && selected ? (
      <div className="store-card__price">
        {selected.basePriceRial > selected.priceRial && (
          <span className="store-card__price-was">{formatToman(selected.basePriceRial)}</span>
        )}
        <span className="store-card__price-now">{formatToman(selected.priceRial)}<Toman /></span>
      </div>
    ) : (
      <div className="store-card__price">
        <span className="store-card__price-now">
          <span className="text-[0.7em] font-normal text-store-text-faint">از</span>
          {formatToman(lowest)}<Toman />
        </span>
      </div>
    );

  const actionNode =
    step === "qty" ? (
      <div className="store-card__qty">
        <button type="button" className="store-card__qty-btn" onClick={onInc} aria-label="افزایش">
          <Plus className="size-4" aria-hidden />
        </button>
        <span className="store-card__qty-n">{toFa(qty)}</span>
        <button
          type="button"
          className={`store-card__qty-btn${armed ? " is-danger" : ""}`}
          onClick={onDec}
          aria-label={armed ? "حذف از سبد" : "کاهش"}
        >
          {armed ? <Trash2 className="size-4" aria-hidden /> : <Minus className="size-4" aria-hidden />}
        </button>
      </div>
    ) : (
      <button type="button" className="store-card__add" onClick={openWeight} aria-label={`افزودن ${product.title} به سبد`}>
        <Plus className="size-5" aria-hidden />
      </button>
    );

  return (
    <>
      {priceNode}
      {actionNode}

      {(step === "weight" || step === "packaging") && (
        <div className="store-card__wsel" role="dialog" aria-label="انتخاب وزن و بسته‌بندی">
          <button type="button" className="store-card__npop-x" aria-label="بستن" onClick={close}>
            <X className="size-3.5" aria-hidden />
          </button>

          {step === "weight" ? (
            <div className="store-card__wstep">
              <div className="store-card__wsel-h">
                <Archive className="size-4" aria-hidden /> انتخابِ وزنِ بسته‌بندی
              </div>
              <div className="store-card__wopts">
                {weights.map((w) => (
                  <button
                    key={w.weightId}
                    type="button"
                    className={`store-card__wopt${w.weightId === wId ? " is-sel" : ""}`}
                    onClick={() => setWId(w.weightId)}
                  >
                    <span className="store-card__wradio" aria-hidden />
                    <span>{w.weightTitle}</span>
                    <span className="store-card__wopt-price">{formatToman(w.minPrice)}</span>
                  </button>
                ))}
              </div>
              <div className="store-card__wprice">
                قیمت: <b>{formatToman(weights.find((w) => w.weightId === wId)?.minPrice ?? lowest)}</b> <Toman />
              </div>
              <button type="button" className="store-card__wnext" onClick={goPackaging}>
                ادامه <ChevronLeft className="size-4" aria-hidden />
              </button>
              <Link href={`/products/${product.slug}`} className="store-card__wview">
                <Eye className="size-4" aria-hidden /> مشاهده محصول
              </Link>
            </div>
          ) : (
            <div className="store-card__wstep">
              <div className="store-card__wsel-h">
                <button type="button" className="store-card__wback" aria-label="بازگشت" onClick={() => setStep("weight")}>
                  <ChevronRight className="size-4" aria-hidden />
                </button>
                نوعِ بسته‌بندی
              </div>
              <div className="store-card__wopts">
                {packagingsFor(wId).map((opt, i) => {
                  const base = packagingsFor(wId)[0]?.priceRial ?? opt.priceRial;
                  const delta = opt.priceRial - base;
                  const isGift = opt.packagingTitle.includes("هدیه");
                  return (
                    <button
                      key={opt.packagingId}
                      type="button"
                      className={`store-card__wopt${opt.packagingId === pId ? " is-sel" : ""}`}
                      onClick={() => setPId(opt.packagingId)}
                      disabled={opt.stock <= 0}
                    >
                      <span className="store-card__wradio" aria-hidden />
                      <span className="inline-flex items-center gap-1.5">
                        {isGift ? <Gift className="size-3.5" aria-hidden /> : <Package className="size-3.5" aria-hidden />}
                        {opt.packagingTitle}
                      </span>
                      <span className="store-card__wopt-price">
                        {delta > 0 ? `${formatToman(delta)}` : "رایگان"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="store-card__wprice">
                جمع: <b>{formatToman(selected?.priceRial ?? lowest)}</b> <Toman />
              </div>
              <button type="button" className="store-card__wnext" onClick={addToCart} disabled={!selected || selected.stock <= 0}>
                <ShoppingCart className="size-4" aria-hidden /> افزودن به سبد
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

const FA = "۰۱۲۳۴۵۶۷۸۹";
function toFa(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => FA[+d]);
}
