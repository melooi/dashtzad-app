import { formatToman } from "@/lib/price";

/**
 * Card price block in the design's markup: optional struck-through "was" price
 * above a bold "now" price with the toman icon (CSS mask, takes currentColor).
 * `from` prefixes "از" for a lowest/min variant price. Real prices only.
 */
export function ProductCardPrice({
  priceRial,
  offRial,
  from = false,
}: {
  priceRial: number;
  offRial: number | null;
  from?: boolean;
}) {
  const hasOff = offRial != null && offRial < priceRial;
  const effective = hasOff ? offRial! : priceRial;

  return (
    <div className="store-card__price">
      {hasOff && <span className="store-card__price-was">{formatToman(priceRial)}</span>}
      <span className="store-card__price-now">
        {from && <span className="text-[0.7em] font-normal text-store-text-faint">از</span>}
        {formatToman(effective)}
        <span className="store-toman" aria-hidden />
        <span className="sr-only">تومان</span>
      </span>
    </div>
  );
}
