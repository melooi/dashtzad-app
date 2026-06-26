/**
 * صفحه‌ی پیش‌نمایش کارت محصول — همه حالت‌ها و واریانت‌ها
 * مسیر: /products/card-preview
 *
 * همه داده‌ها mock‌اند (بدون DB). قیمت‌ها به ریال.
 */
import { ProductCard } from "@/components/storefront/product-card/ProductCard";
import { NotifyButton } from "@/components/storefront/product-card/NotifyButton";
import type { StoreProductCardData } from "@/components/storefront/product-card/types";

// ─── داده‌های نمونه (مستقیم از طرح design-export) ────────────────────────────

// تایمر شگفت‌انگیز فقط با زمانِ واقعی نمایش داده می‌شود (بدون فیک). برای دمو
// یک پایانِ واقعیِ چند ساعت بعد می‌سازیم تا تطابق بصری با طرح اثبات شود.
const FLASH_END = new Date(Date.now() + 3 * 3_600_000 + 47 * 60_000 + 12_000).toISOString();

const DEMO: StoreProductCardData[] = [
  {
    slug: "adas-riz-momtaz-900g",
    title: "عدس ریز ممتاز ۹۰۰ گرمی",
    cardState: "available",
    price_rial: 1_350_000,
    offPrice_rial: null,
    image: "/products/p7.jpeg",
    categoryTitle: "حبوبات",
    installmentEnabled: true,
    ratingValue: 4.7,
    reviewCount: 96,
    weightLabels: ["۹۰۰ گرم"],
    badge: null,
    inStock: true,
  },
  {
    slug: "khorma-mazafati-bam",
    title: "خرما مضافتی بم ممتاز",
    cardState: "discounted",
    price_rial: 3_150_000,
    offPrice_rial: 2_680_000,
    image: "/products/p5.jpeg",
    categoryTitle: "خرما",
    installmentEnabled: true,
    ratingValue: 4.8,
    reviewCount: 189,
    weightLabels: ["۵۰۰ گرم"],
    badge: null,
    inStock: true,
    saleEndsAt: FLASH_END,
  },
  {
    slug: "pesteh-ahmadaghaee-250g",
    title: "پسته احمدآقایی خندان",
    cardState: "discounted",
    price_rial: 10_200_000,
    offPrice_rial: 8_900_000,
    image: "/products/p2.jpeg",
    categoryTitle: "آجیل و خشکبار",
    installmentEnabled: true,
    ratingValue: 4.9,
    reviewCount: 210,
    weightLabels: ["۲۵۰ گرم"],
    stockCount: 3,
    badge: null,
    inStock: true,
    saleEndsAt: FLASH_END,
  },
  {
    slug: "berenji-hashemi-1kg",
    title: "برنج هاشمی درجه‌یک ۱ کیلوگرم",
    cardState: "bestseller",
    price_rial: 3_850_000,
    offPrice_rial: null,
    image: "/products/p1.jpeg",
    categoryTitle: "غلات",
    installmentEnabled: true,
    ratingValue: 4.8,
    reviewCount: 124,
    weightLabels: ["۱ کیلوگرم"],
    badge: "BESTSELLER",
    inStock: true,
  },
  {
    slug: "ajil-mokhasos-chaharmag",
    title: "آجیل مخصوص چهارمغز",
    cardState: "bestseller",
    price_rial: 7_200_000,
    offPrice_rial: null,
    image: "/products/p10.jpeg",
    categoryTitle: "آجیل و خشکبار",
    installmentEnabled: true,
    ratingValue: 4.9,
    reviewCount: 312,
    weightLabels: ["۵۰۰ گرم"],
    badge: "BESTSELLER",
    isVariable: true,  // variable → نمایش "مشاهده"
    inStock: true,
  },
  {
    slug: "chai-siah-lahijan-450g",
    title: "چای سیاه ممتاز لاهیجان",
    cardState: "available",
    price_rial: 2_800_000,
    offPrice_rial: null,
    image: "/products/p8.jpeg",
    categoryTitle: "دمنوش و چای",
    installmentEnabled: true,
    ratingValue: 4.8,
    reviewCount: 150,
    weightLabels: ["۴۵۰ گرم"],
    badge: null,
    inStock: true,
  },
  {
    slug: "asal-tabiee-kuhi-850g",
    title: "عسل طبیعی کوهی",
    cardState: "special",
    price_rial: 4_850_000,
    offPrice_rial: null,
    image: "/products/p9.jpeg",
    categoryTitle: "عسل و فرآورده",
    installmentEnabled: true,
    ratingValue: 4.9,
    reviewCount: 203,
    weightLabels: ["۸۵۰ گرم"],
    badge: "DASHTZAD_PICK",
    inStock: true,
  },
  {
    slug: "zafaran-sargol-feleh",
    title: "زعفران سرگل فله — درجه‌یک",
    cardState: "contact",
    price_rial: 0,
    offPrice_rial: null,
    image: "/products/p4.jpeg",
    categoryTitle: "زعفران و ادویه",
    contactPhone: "02112345678",
    ratingValue: 5.0,
    reviewCount: 32,
    badge: null,
    inStock: false,
  },
  {
    slug: "badam-kham-500g",
    title: "بادام خام درجه‌یک ۵۰۰ گرمی",
    cardState: "unavailable",
    price_rial: 3_900_000,
    offPrice_rial: null,
    image: "/products/p3.jpeg",
    categoryTitle: "آجیل و خشکبار",
    installmentEnabled: true,
    ratingValue: 4.6,
    reviewCount: 74,
    weightLabels: ["۵۰۰ گرم"],
    badge: null,
    inStock: false,
  },
  {
    slug: "torshi-liteh-discontinued",
    title: "ترشی لیته اصیل ۷۰۰ گرم",
    cardState: "discontinued",
    price_rial: 1_800_000,
    offPrice_rial: null,
    image: "/products/p6.jpeg",
    categoryTitle: "ترشی و مربا",
    ratingValue: 4.3,
    reviewCount: 21,
    weightLabels: ["۷۰۰ گرم"],
    badge: null,
    inStock: false,
  },
  {
    slug: "nabat-zafaran-new",
    title: "نبات زعفرانی معتبر ۵۰۰ گرم",
    cardState: "available",
    price_rial: 2_100_000,
    offPrice_rial: null,
    image: "/products/p11.jpeg",
    categoryTitle: "شیرینی و شکلات",
    ratingValue: 4.5,
    reviewCount: 8,
    weightLabels: ["۵۰۰ گرم"],
    badge: "NEW",
    inStock: true,
  },
  {
    slug: "no-image-demo",
    title: "محصول بدون تصویر (نمونه)",
    cardState: "available",
    price_rial: 950_000,
    offPrice_rial: null,
    image: null,
    categoryTitle: "متفرقه",
    badge: null,
    inStock: true,
  },
];

// quickAdd mock (به‌جای واریانت واقعی)
function demoQuickAdd(p: StoreProductCardData) {
  if (p.inStock === false || p.isVariable || p.cardState === "contact" || p.cardState === "discontinued") return null;
  return {
    productId: p.slug,
    priceRial: p.offPrice_rial ?? p.price_rial,
    basePriceRial: p.price_rial,
  };
}

// ─── label‌های حالت ─────────────────────────────────────────────────────────

const STATE_LABELS: Record<string, string> = {
  available:    "موجود",
  discounted:   "تخفیف",
  bestseller:   "پرفروش",
  special:      "ویژه",
  contact:      "تماس",
  unavailable:  "ناموجود",
  discontinued: "متوقف (بدون زنگ)",
};

// ─── صفحه ────────────────────────────────────────────────────────────────────

export default function CardPreviewPage() {
  return (
    <main className="min-h-screen bg-store-bg px-4 py-10 text-store-text">
      <div className="mx-auto max-w-7xl">

        {/* سرتیتر */}
        <div className="mb-10 border-b border-store-border pb-6">
          <p className="mb-1 font-mono text-xs text-store-text-faint">PRODUCT-CARD-CP1 · پیش‌نمایش</p>
          <h1 className="font-heading text-3xl font-bold text-store-text">کارت محصول — همه حالت‌ها</h1>
          <p className="mt-2 text-sm text-store-text-muted">
            هر ستون یک حالت مستقل است. کلیک روی دکمه‌ی ناموجود برای تست پاپ‌آپ اطلاع‌رسانی.
          </p>
        </div>

        {/* ─── بخش ۱: همه حالت‌های state ─────────────────────────────────── */}
        <section className="mb-14">
          <h2 className="mb-6 font-heading text-xl font-bold text-store-text">
            <span className="me-2 rounded-lg bg-store-primary px-2 py-0.5 font-mono text-sm text-white">۱</span>
            حالت‌های وضعیت فروش
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {DEMO.map((p) => (
              <div key={p.slug} className="flex flex-col gap-2">
                {/* برچسب حالت */}
                <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-store-border bg-store-surface px-2.5 py-1 font-mono text-[0.65rem] font-bold text-store-text-faint">
                  <span
                    className={`size-1.5 rounded-full ${
                      p.cardState === "available"   ? "bg-green-500" :
                      p.cardState === "discounted"  ? "bg-amber-500" :
                      p.cardState === "bestseller"  ? "bg-orange-500" :
                      p.cardState === "special"     ? "bg-purple-500" :
                      p.cardState === "contact"     ? "bg-sky-500" :
                      p.cardState === "unavailable" ? "bg-red-400" :
                      p.cardState === "discontinued" ? "bg-gray-500" :
                                                      "bg-gray-400"
                    }`}
                    aria-hidden
                  />
                  {STATE_LABELS[p.cardState ?? "available"] ?? p.cardState}
                </span>
                <ProductCard
                  product={p}
                  variant="default"
                  quickAdd={demoQuickAdd(p)}
                  priority
                />
              </div>
            ))}
          </div>
        </section>

        {/* ─── بخش ۲: واریانت‌های اندازه ────────────────────────────────── */}
        <section className="mb-14">
          <h2 className="mb-6 font-heading text-xl font-bold text-store-text">
            <span className="me-2 rounded-lg bg-store-primary px-2 py-0.5 font-mono text-sm text-white">۲</span>
            واریانت‌های اندازه (همان کارت، شکل‌های مختلف)
          </h2>

          {/* default */}
          <div className="mb-8">
            <p className="mb-3 font-mono text-xs text-store-text-faint">variant="default" — گرید اصلی</p>
            <div className="grid max-w-xs grid-cols-1">
              <ProductCard product={DEMO[0]} variant="default" quickAdd={demoQuickAdd(DEMO[0])} />
            </div>
          </div>

          {/* compact */}
          <div className="mb-8">
            <p className="mb-3 font-mono text-xs text-store-text-faint">variant="compact" — فشرده‌تر</p>
            <div className="grid max-w-xs grid-cols-1">
              <ProductCard product={DEMO[1]} variant="compact" quickAdd={demoQuickAdd(DEMO[1])} />
            </div>
          </div>

          {/* featured */}
          <div className="mb-8">
            <p className="mb-3 font-mono text-xs text-store-text-faint">variant="featured" — بزرگ و ویژه</p>
            <div className="grid max-w-sm grid-cols-1">
              <ProductCard product={DEMO[3]} variant="featured" quickAdd={demoQuickAdd(DEMO[3])} />
            </div>
          </div>

          {/* list */}
          <div className="mb-8">
            <p className="mb-3 font-mono text-xs text-store-text-faint">variant="list" — افقی</p>
            <div className="flex max-w-lg flex-col gap-3">
              <ProductCard product={DEMO[0]} variant="list" quickAdd={demoQuickAdd(DEMO[0])} />
              <ProductCard product={DEMO[1]} variant="list" quickAdd={demoQuickAdd(DEMO[1])} />
            </div>
          </div>

          {/* mini */}
          <div className="mb-8">
            <p className="mb-3 font-mono text-xs text-store-text-faint">variant="mini" — کوچک (سایدبار)</p>
            <div className="grid max-w-[10rem] grid-cols-1">
              <ProductCard product={DEMO[6]} variant="mini" />
            </div>
          </div>
        </section>

        {/* ─── بخش ۳: پاپ‌آپ اطلاع موجودی ─────────────────────────────── */}
        <section className="mb-14">
          <h2 className="mb-2 font-heading text-xl font-bold text-store-text">
            <span className="me-2 rounded-lg bg-store-primary px-2 py-0.5 font-mono text-sm text-white">۳</span>
            پاپ‌آپ اطلاع موجودی
          </h2>
          <p className="mb-4 text-sm text-store-text-muted">بسته (دکمه زنگ) — باز (پاپ‌آپ روی کارت) — ثبت‌شده:</p>
          <div className="flex flex-wrap gap-6">
            {/* Closed: standard card */}
            <div>
              <p className="mb-2 font-mono text-xs text-store-text-faint">حالت بسته</p>
              <div className="w-60">
                <ProductCard product={DEMO[8]} variant="default" />
              </div>
            </div>
            {/* Open: popup visible */}
            <div>
              <p className="mb-2 font-mono text-xs text-store-text-faint">پاپ‌آپ باز</p>
              <div className="store-card relative w-60 overflow-hidden rounded-2xl border border-store-border bg-store-surface" style={{minHeight: "24rem"}}>
                <NotifyButton slug="badam-kham-500g-demo" title="بادام خام درجه‌یک ۵۰۰ گرمی" _forceOpen />
              </div>
            </div>
            {/* Done: success state */}
            <div>
              <p className="mb-2 font-mono text-xs text-store-text-faint">ثبت موفق</p>
              <div className="store-card relative w-60 overflow-hidden rounded-2xl border border-store-border bg-store-surface" style={{minHeight: "24rem"}}>
                <NotifyButton slug="badam-kham-500g-done" title="بادام خام درجه‌یک ۵۰۰ گرمی" _forceDone />
              </div>
            </div>
          </div>
        </section>

        {/* ─── بخش ۴: حالت تماس ──────────────────────────────────────── */}
        <section className="mb-14">
          <h2 className="mb-6 font-heading text-xl font-bold text-store-text">
            <span className="me-2 rounded-lg bg-store-primary px-2 py-0.5 font-mono text-sm text-white">۴</span>
            حالت تماس (قیمت استعلامی)
          </h2>
          <div className="grid max-w-xs grid-cols-1">
            <ProductCard product={DEMO[7]} variant="default" />
          </div>
        </section>

        {/* ─── بخش ۵: اسکلتون بارگذاری ──────────────────────────────── */}
        <section className="mb-14">
          <h2 className="mb-6 font-heading text-xl font-bold text-store-text">
            <span className="me-2 rounded-lg bg-store-primary px-2 py-0.5 font-mono text-sm text-white">۵</span>
            اسکلتون بارگذاری
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="store-card-sk">
                <div className="dz-sk store-card-sk__img" />
                <div className="store-card-sk__body">
                  <div className="dz-sk h-4 w-3/4" />
                  <div className="dz-sk h-3 w-1/2" />
                  <div className="dz-sk h-3 w-2/3" />
                  <div className="mt-2 dz-sk h-7 w-full" />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
