"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  ChevronLeft,
  ArrowLeft,
  Store,
  Flame,
  Tag,
  Sprout,
  Truck,
  Package,
} from "lucide-react";
import type { MegaCategory } from "@/lib/site-data";
import { resolveNavIcon } from "@/lib/storefront/nav-icons";
import { toPersianNumbers } from "@/lib/price";

// Super mega-menu — port of design wp/preview/super-mega-menu.html.
// Category rail (left) + dynamic stage (subcategories + featured products) +
// bottom strip. The design uses html{62.5%} (1rem=10px); ported here with px
// arbitrary values + store-* tokens. REAL data only (no fake counts/products).

const TONE: Record<"green" | "clay" | "amber", string> = {
  green: "bg-store-primary-soft text-store-primary-hover",
  clay: "bg-store-clay-soft text-store-clay-deep",
  amber: "bg-store-amber-soft text-store-gold-deep",
};
function megaTone(name: string): "green" | "clay" | "amber" {
  if (/آجیل|مغز|پسته|بادام|فندق|تخمه/.test(name)) return "amber";
  if (/خشکبار|حبوبات|عدس|لوبیا|نخود|میوه|خرما|کشمش/.test(name)) return "clay";
  return "green";
}
const fmtToman = (rial: number) =>
  toPersianNumbers(Math.round(rial / 10).toLocaleString("en-US")).replace(/,/g, "٬");

export function MegaMenu({
  triggerLabel,
  categories,
  allHref = "/products",
  note = null,
}: {
  triggerLabel: string;
  categories: MegaCategory[];
  allHref?: string;
  note?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const cancelClose = () => closeTimer.current && clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  if (categories.length === 0) {
    return (
      <Link href={allHref} className="inline-flex items-center gap-[0.45em] whitespace-nowrap border-b-[0.15rem] border-transparent py-[0.85rem] text-[0.92rem] font-semibold text-store-text-muted transition-colors hover:border-store-primary hover:text-store-primary">
        <Store className="size-[1.05rem] text-store-text-faint" aria-hidden />
        {triggerLabel}
      </Link>
    );
  }

  const cat = categories[Math.min(active, categories.length - 1)];

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`group inline-flex items-center gap-[0.45em] whitespace-nowrap border-b-[0.15rem] py-[0.85rem] text-[0.92rem] font-semibold transition-colors ${
          open ? "border-store-primary text-store-text" : "border-transparent text-store-text-muted hover:border-store-primary hover:text-store-primary"
        }`}
      >
        <Store className={`size-[1.05rem] transition-colors ${open ? "text-store-primary" : "text-store-text-faint group-hover:text-store-primary"}`} aria-hidden />
        {triggerLabel}
        <ChevronDown className={`size-[0.8em] transition-transform ${open ? "rotate-180 text-store-primary" : "text-store-text-faint"}`} aria-hidden />
      </button>

      {/* Panel */}
      <div
        id={panelId}
        role="region"
        aria-label={triggerLabel}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        className={`absolute top-full z-50 w-[min(1040px,96vw)] overflow-hidden rounded-[22px] border border-store-border bg-store-surface shadow-[0_12px_28px_rgba(41,37,36,0.10),0_36px_80px_rgba(41,37,36,0.16)] transition-all duration-200 ${
          open ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"
        }`}
        style={{ insetInlineStart: 0 }}
      >
        <div className="grid grid-cols-[250px_1fr]">
          {/* ----- Category rail ----- */}
          <aside className="flex flex-col gap-0.5 border-s border-store-border bg-store-surface-warm p-3">
            <div className="px-4 pb-2.5 pt-1.5 text-[11.5px] font-bold tracking-wide text-store-text-faint">
              دسته‌بندی محصولات
            </div>
            {categories.map((c, i) => {
              const Icon = resolveNavIcon(null, c.name, c.href);
              const on = i === active;
              return (
                <button
                  key={c.id}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={`group/r flex w-full items-center gap-[11px] rounded-[14px] px-3 py-[10px] text-start transition-colors ${
                    on ? "bg-store-surface text-store-primary-hover shadow-[0_1px_2px_rgba(41,37,36,0.06),0_2px_6px_rgba(41,37,36,0.05)]" : "text-store-text hover:bg-store-surface"
                  }`}
                >
                  <span className={`grid size-[38px] shrink-0 place-items-center rounded-[8px] transition-transform ${TONE[megaTone(c.name)]} ${on ? "scale-105" : ""}`}>
                    <Icon className="size-[17px]" aria-hidden />
                  </span>
                  <span className="flex-1 text-[14.5px] font-bold">{c.name}</span>
                  {c.count > 0 && <span className="text-[11.5px] font-semibold text-store-text-faint">{toPersianNumbers(c.count)}</span>}
                  <ChevronLeft className={`size-[14px] transition-all ${on ? "translate-x-0 text-store-primary opacity-100" : "translate-x-1 text-store-text-faint opacity-0"}`} aria-hidden />
                </button>
              );
            })}

            <div className="mt-auto grid gap-1.5 p-2.5">
              <Link href="/products?sort=newest" className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-semibold text-store-text-muted transition-colors hover:bg-store-surface hover:text-store-primary-hover">
                <Sprout className="size-4 text-store-primary" aria-hidden /> تازه‌رسیده‌ها
              </Link>
              <Link href={allHref} className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-semibold text-store-text-muted transition-colors hover:bg-store-surface hover:text-store-primary-hover">
                <Flame className="size-4 text-store-clay" aria-hidden /> همه‌ی محصولات فروشگاه
              </Link>
            </div>
          </aside>

          {/* ----- Dynamic stage ----- */}
          <div className="flex min-h-[360px] flex-col gap-5 px-[22px] py-5">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 text-[20px] font-bold text-store-text">
                  {cat.name}
                  {cat.count > 0 && (
                    <span className="rounded-full bg-store-primary-soft px-3 py-0.5 text-[11.5px] font-bold text-store-primary-hover">
                      {toPersianNumbers(cat.count)} محصول
                    </span>
                  )}
                </div>
                {cat.description && <p className="mt-1.5 max-w-[46rem] text-[13px] leading-7 text-store-text-faint">{cat.description}</p>}
              </div>
              <Link href={cat.href} className="inline-flex shrink-0 items-center gap-1.5 rounded-[14px] border border-store-primary-soft bg-store-primary-tint px-3.5 py-2.5 text-[13.5px] font-bold text-store-primary-hover transition-colors hover:border-store-primary hover:bg-store-primary hover:text-white">
                مشاهده همه <ArrowLeft className="size-4" aria-hidden />
              </Link>
            </div>

            <div className={`grid flex-1 gap-5 ${cat.subs.length > 0 ? "grid-cols-[1.1fr_1.3fr]" : "grid-cols-1"}`}>
              {cat.subs.length > 0 && (
                <div>
                  <div className="mb-2.5 text-[12px] font-bold text-store-text-faint">زیردسته‌ها</div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    {cat.subs.map((s) => (
                      <Link key={s.href} href={s.href} className="group/s flex items-center gap-2 rounded-[8px] px-1.5 py-2 text-[14px] text-store-text-muted transition-colors hover:bg-store-surface-warm hover:text-store-primary-hover">
                        <ChevronLeft className="size-3 text-store-text-faint transition-transform group-hover/s:-translate-x-1 group-hover/s:text-store-primary" aria-hidden />
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-2.5 text-[12px] font-bold text-store-text-faint">منتخب این دسته</div>
                {cat.featured.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {cat.featured.map((p) => (
                      <Link key={p.href} href={p.href} className="block rounded-[14px] border border-store-border bg-store-surface p-2.5 transition-all hover:-translate-y-0.5 hover:border-store-primary-soft hover:shadow-[0_1px_2px_rgba(41,37,36,0.06),0_2px_6px_rgba(41,37,36,0.05)]">
                        <div className={`relative mb-2.5 grid h-[90px] place-items-center overflow-hidden rounded-[8px] ${TONE[megaTone(cat.name)]}`}>
                          {p.offPercent ? <span className="absolute start-1.5 top-1.5 z-10 rounded-full bg-store-clay px-2 py-0.5 text-[11px] font-bold text-white">٪{toPersianNumbers(p.offPercent)}</span> : null}
                          {p.imageUrl ? (
                            <Image src={p.imageUrl} alt={p.name} fill sizes="200px" className="object-cover" />
                          ) : (
                            <Package className="size-8 opacity-70" aria-hidden />
                          )}
                        </div>
                        <div className="line-clamp-2 min-h-[2.6rem] text-[13px] font-medium text-store-text">{p.name}</div>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="store-toman text-[15px] font-bold text-store-primary-hover">{fmtToman(p.priceRial)}</span>
                          <span className="text-[11px] font-semibold text-store-text-faint">تومان</span>
                          {p.oldPriceRial && <span className="text-[12px] text-store-text-faint line-through">{fmtToman(p.oldPriceRial)}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-[14px] border border-dashed border-store-border bg-store-surface-warm px-4 py-6 text-center text-[13px] text-store-text-faint">
                    محصولی در این دسته ثبت نشده است.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ----- Bottom strip ----- */}
        <div className="flex items-center justify-between gap-5 border-t border-store-border bg-store-surface-soft px-[22px] py-3">
          {note ? (
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-store-primary-hover">
              <Truck className="size-[16px]" aria-hidden /> {note}
            </span>
          ) : (
            <span />
          )}
          <Link href={allHref} className="inline-flex items-center gap-1.5 rounded-full border border-store-border bg-store-surface px-4 py-1.5 text-[13px] font-bold text-store-text-muted transition-colors hover:border-store-primary-soft hover:text-store-primary-hover">
            مشاهده‌ی همه‌ی محصولات <ArrowLeft className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
