import Image from "next/image";
import Link from "next/link";
import { Ban, Coffee, CreditCard, Crown, Eye, FlaskConical, Flame, Gift, Leaf, Phone, Scale, Sparkles, Sprout, Star, Tag, Wheat } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MARKETING_BADGE_LABELS, type MarketingBadgeKey } from "@/lib/admin/product-variant";
import { discountPercent, toPersianNumbers } from "@/lib/price";
import { ProductCardPrice } from "./ProductCardPrice";
import { FavButton } from "./FavButton";
import { QuickAddButton } from "./QuickAddButton";
import { NotifyButton } from "./NotifyButton";
import { FlashTimer } from "./FlashTimer";
import { VariantFoot } from "./VariantFoot";
import type { ProductCardProps, StoreProductCardData } from "./types";

// ============================================================
// Card State Algorithm (PRODUCT-CARD-CP1)
// State is pre-resolved in toProductCardData(). The card only reads it.
//
// Priority (from resolveCardState in lib/storefront/product-card.ts):
//  1. saleMode CONTACT     → "contact"       show phone, no price
//  2. saleMode DISCONTINUED → "discontinued" OOS, no notify bell
//  3. out of stock          → "unavailable"  OOS, show notify bell
//  4. price_rial === 0      → "contact"
//  5. offPrice < price      → "discounted"   discount badge + strikethrough
//  6. badge BESTSELLER|LIMITED → "bestseller"  fire badge
//  7. any badge             → "special"      crown badge
//  8. default               → "available"    green add button
// ============================================================

// Badge tone mapping: marketingBadge → CSS modifier on store-card__badge.
const BADGE_FLAG: Record<MarketingBadgeKey, string> = {
  BESTSELLER: "bestseller",
  DASHTZAD_PICK: "special",
  ECONOMICAL: "special",
  GIFT: "gift",
  DAILY: "special",
  HOSTING: "special",
  LIMITED: "bestseller",
  NEW: "new",
};

// Badge icon mapping: each badge type gets a lucide icon (matches design's Remix icons).
const BADGE_ICON = {
  BESTSELLER:    <Flame    className="size-3" aria-hidden />,
  LIMITED:       <Flame    className="size-3" aria-hidden />,
  DASHTZAD_PICK: <Crown    className="size-3" aria-hidden />,
  NEW:           <Sparkles className="size-3" aria-hidden />,
  GIFT:          <Gift     className="size-3" aria-hidden />,
  ECONOMICAL:    <Leaf     className="size-3" aria-hidden />,
  DAILY:         <Sparkles className="size-3" aria-hidden />,
  HOSTING:       <Star     className="size-3" aria-hidden />,
} satisfies Record<MarketingBadgeKey, React.JSX.Element>;

function Flag({ product }: { product: StoreProductCardData }) {
  const off = discountPercent(product.price_rial, product.offPrice_rial);
  if (off > 0) {
    return (
      <span className="store-card__flag">
        <span className="store-card__badge store-card__badge--discount">
          <Tag className="size-3" aria-hidden />
          ٪{toPersianNumbers(off)} تخفیف
        </span>
      </span>
    );
  }
  if (product.badge) {
    return (
      <span className="store-card__flag">
        <span className={`store-card__badge store-card__badge--${BADGE_FLAG[product.badge]}`}>
          {BADGE_ICON[product.badge]}
          {MARKETING_BADGE_LABELS[product.badge]}
        </span>
      </span>
    );
  }
  return null;
}

function Media({
  product,
  sizes,
  priority,
}: {
  product: StoreProductCardData;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className="store-card__media">
      {product.image ? (
        <Image src={product.image} alt={product.title} fill sizes={sizes} priority={priority} style={{ objectFit: "contain" }} />
      ) : (
        <div className="store-card__placeholder">
          <Logo variant="mark" className="h-1/3 max-h-16 w-auto opacity-20" />
        </div>
      )}
    </div>
  );
}

// Category → icon + tone. Mirrors design-export (each category gets an icon and
// one of green/clay/gold). Matched by substring on the real category title.
const CATEGORY_META: { keys: string[]; icon: React.JSX.Element; tone: "green" | "clay" | "gold" }[] = [
  { keys: ["حبوبات"],            icon: <Sprout className="size-3.5" aria-hidden />,       tone: "green" },
  { keys: ["غلات", "برنج"],     icon: <Wheat className="size-3.5" aria-hidden />,        tone: "green" },
  { keys: ["خرما"],             icon: <Sprout className="size-3.5" aria-hidden />,       tone: "clay" },
  { keys: ["آجیل", "خشکبار"],   icon: <Leaf className="size-3.5" aria-hidden />,         tone: "clay" },
  { keys: ["دمنوش", "چای"],     icon: <Coffee className="size-3.5" aria-hidden />,       tone: "clay" },
  { keys: ["عسل"],              icon: <FlaskConical className="size-3.5" aria-hidden />, tone: "gold" },
  { keys: ["زعفران", "ادویه"],  icon: <FlaskConical className="size-3.5" aria-hidden />, tone: "gold" },
];

function categoryMeta(title: string, tone?: "green" | "clay" | "gold") {
  const found = CATEGORY_META.find((m) => m.keys.some((k) => title.includes(k)));
  return {
    icon: found?.icon ?? <Leaf className="size-3.5" aria-hidden />,
    tone: tone ?? found?.tone ?? "green",
  };
}

function CategoryLabel({ title, tone }: { title?: string | null; tone?: "green" | "clay" | "gold" }) {
  if (!title) return null;
  const meta = categoryMeta(title, tone);
  return (
    <span className={`store-card__cat store-card__cat--${meta.tone}`}>
      {meta.icon}
      {title}
    </span>
  );
}

// Meta row 1: installment chip (left) + rating (right) — matches design layout.
function MetaRow1({ product }: { product: StoreProductCardData }) {
  const hasRating = !!(product.reviewCount && product.reviewCount > 0 && product.ratingValue != null);
  const hasInstallment = product.installmentEnabled;
  if (!hasRating && !hasInstallment) return null;
  return (
    <div className="store-card__meta">
      {hasInstallment && (
        <span className="store-card__chip store-card__chip--installment">
          <CreditCard className="size-3.5" aria-hidden />
          خرید قسطی
        </span>
      )}
      {hasRating && (
        <span className="store-card__rating">
          <Star className="size-3.5 fill-current" aria-hidden />
          {toPersianNumbers(product.ratingValue!.toFixed(1))}
          <span className="store-card__rating-count">({toPersianNumbers(product.reviewCount!)})</span>
        </span>
      )}
    </div>
  );
}

// Meta row 2: weight (left) + low-stock chip (right).
function MetaRow2({ product }: { product: StoreProductCardData }) {
  const weights = product.weightLabels ?? [];
  const weightText = weights.length === 1 ? weights[0] : weights.length > 1 ? `${toPersianNumbers(weights.length)} وزن` : null;
  const low = product.stockCount && product.stockCount > 0 ? product.stockCount : null;
  if (!weightText && !low) return null;
  return (
    <div className="store-card__meta">
      {weightText && (
        <span className="store-card__weight">
          <Scale className="size-3.5" aria-hidden />
          {weightText}
        </span>
      )}
      {low && (
        <span className="store-card__chip store-card__chip--stock">
          <Flame className="size-3" aria-hidden />
          {toPersianNumbers(low)} تا مونده
        </span>
      )}
    </div>
  );
}

// Price block — reflects cardState.
function PriceBlock({ product }: { product: StoreProductCardData }) {
  const cardState = product.cardState ?? "available";
  if (cardState === "contact") return <div className="store-card__price" />;
  if (cardState === "unavailable" || cardState === "discontinued") {
    return (
      <div className="store-card__price">
        <span className="store-card__price-na">فعلاً موجود نیست</span>
      </div>
    );
  }
  return (
    <ProductCardPrice
      priceRial={product.price_rial}
      offRial={product.offPrice_rial}
      from={product.priceFrom}
    />
  );
}

// Action CTA — one-to-one with card state from design.
function Action({
  product,
  quickAdd,
}: {
  product: StoreProductCardData;
  quickAdd?: ProductCardProps["quickAdd"];
}) {
  const cardState = product.cardState ?? "available";
  const { slug, title } = product;

  if (cardState === "contact") {
    const phone = product.contactPhone ?? "";
    return (
      <Link
        href={phone ? `tel:${phone}` : "/contact"}
        className="store-card__contact"
        aria-label={`تماس برای خرید ${title}`}
      >
        <Phone className="size-4" aria-hidden />
        تماس بگیرید
      </Link>
    );
  }

  if (cardState === "unavailable") {
    return <NotifyButton slug={slug} title={title} />;
  }

  if (cardState === "discontinued") {
    return null; // no action; OOS overlay explains.
  }

  // Available/discounted/bestseller/special — in-stock products.
  if (product.isVariable) {
    return (
      <Link href={`/products/${slug}`} className="store-card__view" aria-label={`مشاهده و انتخاب مدل ${title}`}>
        <Eye className="size-4" aria-hidden />
        مشاهده
      </Link>
    );
  }

  if (quickAdd) {
    return <QuickAddButton data={quickAdd} title={title} image={product.image} slug={slug} />;
  }

  return (
    <Link href={`/products/${slug}`} className="store-card__view" aria-label={`مشاهده ${title}`}>
      <Eye className="size-4" aria-hidden />
      مشاهده
    </Link>
  );
}

const SIZES: Record<string, string> = {
  default: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw",
  compact: "(max-width: 640px) 50vw, 22vw",
  featured: "(max-width: 768px) 100vw, 40vw",
  mini: "160px",
  list: "120px",
};

export function ProductCard({ product, variant = "default", quickAdd, className = "", priority = false }: ProductCardProps) {
  const cardState = product.cardState ?? "available";
  const oos = cardState === "unavailable" || cardState === "discontinued";
  const isMini = variant === "mini";
  const isList = variant === "list";
  const modifier = variant === "default" ? "" : ` store-card--${variant}`;
  // In-stock variable products (real weight×packaging matrix) drive the
  // in-card add flow; everything else uses the simple price + action.
  const inStockState = !oos && cardState !== "contact";
  const useVariantFlow = !isMini && !isList && inStockState && (product.variants?.length ?? 0) > 0;

  return (
    <article className={`store-card${modifier}${oos ? " store-card--oos" : ""} ${className}`}>
      <div className="store-card__media-wrap">
        {!isMini && !isList && <FavButton slug={product.slug} title={product.title} />}
        {!isMini && <Flag product={product} />}
        <Media product={product} sizes={SIZES[variant] ?? SIZES.default} priority={priority} />
        {!isMini && !isList && <CategoryLabel title={product.categoryTitle} tone={product.categoryTone} />}
        {!isMini && !isList && cardState === "discounted" && product.saleEndsAt && (
          <FlashTimer endsAt={product.saleEndsAt} />
        )}
        {oos && (
          <div className="store-card__oos">
            <span className="store-card__oos-tag">
              <Ban className="size-4" aria-hidden />
              ناموجود
            </span>
          </div>
        )}
      </div>

      <div className="store-card__body">
        <Link href={`/products/${product.slug}`} className="store-card__title-link" aria-label={`مشاهده محصول ${product.title}`}>
          <h3 className="store-card__title">{product.title}</h3>
        </Link>

        {!isMini && !isList && (
          <>
            <MetaRow1 product={product} />
            <MetaRow2 product={product} />
          </>
        )}

        <div className="store-card__foot">
          {useVariantFlow ? (
            <VariantFoot product={product} />
          ) : (
            <>
              <PriceBlock product={product} />
              {!isMini && <Action product={product} quickAdd={quickAdd} />}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
