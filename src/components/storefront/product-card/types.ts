import type { MarketingBadgeKey } from "@/lib/admin/product-variant";

/** Visual variants of the product card (component-driven storefront). */
export type ProductCardVariant =
  | "default" // standard grid card
  | "compact" // denser grid card
  | "list" // horizontal row
  | "featured" // large premium highlight card
  | "mini"; // tiny strip / sidebar card

/**
 * Resolved card state — determined by the algorithm in toProductCardData().
 *
 * Algorithm (priority order):
 *  1. saleMode === CONTACT     → "contact"
 *  2. saleMode === DISCONTINUED → "discontinued"  (OOS, no notify)
 *  3. inStock === false         → "unavailable"   (OOS, with notify)
 *  4. price_rial === 0          → "contact"
 *  5. offPrice_rial < price_rial → "discounted"
 *  6. badge === BESTSELLER | LIMITED → "bestseller"
 *  7. badge is set              → "special"
 *  8. default                   → "available"
 */
export type ProductCardState =
  | "available"
  | "discounted"
  | "bestseller"
  | "special"
  | "unavailable"    // OOS — show notify bell
  | "discontinued"   // OOS — no notify, no restock expected
  | "contact";       // price on request — show phone

/**
 * Flat, serializable projection of a Product (+ variant summary). Only
 * slug/title/price_rial/offPrice_rial/image are required. All values are REAL
 * product/variant data — the card never invents price/discount/stock/rating.
 */
/**
 * One purchasable (weight × packaging) combination — a REAL ProductVariant row.
 * Drives the in-card weight→packaging selector. Price/stock are real DB values.
 */
export type CardVariantOption = {
  id: string;
  weightId: string;
  weightTitle: string;
  gramValue: number;
  packagingId: string;
  packagingTitle: string;
  priceRial: number;      // effective unit price (offPrice if present)
  basePriceRial: number;  // original unit price
  stock: number;
};

export type StoreProductCardData = {
  slug: string;
  title: string;
  /** Product id — needed to add variant lines to the cart. */
  productId?: string;
  price_rial: number;
  offPrice_rial: number | null;
  image: string | null;
  /** Full real variant matrix (weights × packaging). Drives the add selector. */
  variants?: CardVariantOption[];

  /** Pre-resolved card state (from toProductCardData algorithm). Defaults to "available" if omitted. */
  cardState?: ProductCardState;

  categoryTitle?: string | null;
  /** Category color tone for the on-image label. Derived from category if omitted. */
  categoryTone?: "green" | "clay" | "gold";
  /** Marketing badge from the product's representative active variant. */
  badge?: MarketingBadgeKey | null;
  /**
   * REAL flash-sale end timestamp (ISO). When present on a discounted product,
   * the card shows a live "شگفت‌انگیز" countdown. Never faked — omit if no campaign.
   */
  saleEndsAt?: string | null;
  /** undefined = stock unknown (don't render); true/false = render status. */
  inStock?: boolean;
  /** Real remaining units, when low — drives the "n مانده" chip. */
  stockCount?: number | null;
  /** When true, the displayed price is the lowest variant price ("از …"). */
  priceFrom?: boolean;
  /** True for variable products → card CTA is "مشاهده" (no fake variant add). */
  isVariable?: boolean;

  /** Available weight option titles (already human text, e.g. "۱۰۰ گرم"). */
  weightLabels?: string[];
  /** Number of packaging options available across variants. */
  packagingCount?: number;

  /** Real approved-review aggregates. Rating renders ONLY when reviewCount>0. */
  ratingValue?: number | null;
  reviewCount?: number | null;

  /** Show "خرید قسطی" chip (set by admin on the product). */
  installmentEnabled?: boolean;
  /** Phone number for contact-mode products. */
  contactPhone?: string | null;
};

/** Optional quick-add wiring. Only safe for simple, in-stock products. */
export type QuickAddData = {
  productId: string;
  /** Effective unit price (offPrice if present, else price) in Rial. */
  priceRial: number;
  basePriceRial: number;
};

export type ProductCardProps = {
  product: StoreProductCardData;
  variant?: ProductCardVariant;
  /** When provided AND product is simple+in-stock, renders a real add island. */
  quickAdd?: QuickAddData | null;
  className?: string;
  /** Image priority hint for above-the-fold cards. */
  priority?: boolean;
};
