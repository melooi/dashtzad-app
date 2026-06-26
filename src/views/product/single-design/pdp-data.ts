import "server-only";
import { prisma } from "@/lib/prisma";
import { rialToToman } from "@/lib/price";
import { formatJalali } from "@/lib/date";

/**
 * Server-side data layer for the design PDP. Fetches one product and flattens
 * it into a fully-serializable shape the markup builder interpolates. The
 * design's weight + packaging are modelled as two additive selectors, so we
 * derive weight options (priced at a base packaging) and packaging deltas from
 * the real ProductVariant matrix.
 *
 * Price rule: DB stores rial (integer); the storefront shows toman (rial / 10).
 */

export type PdpWeight = {
  wid: string;
  grams: number;
  label: string;
  priceToman: number;
  oldToman: number | null;
  offPercent: number | null;
  per100Toman: number;
  badge: string | null;
  popular: boolean;
};

export type PdpPackaging = { pid: string; label: string; note: string; extraToman: number };

export type PdpRelated = {
  title: string;
  slug: string;
  image: string | null;
  priceToman: number | null;
  badge: string | null;
};

export type PdpReview = {
  initial: string;
  name: string;
  meta: string;
  rating: number;
  text: string;
  recommend: boolean;
  verified: boolean;
};

export type PdpQuestion = {
  qText: string;
  qMeta: string;
  aText: string | null;
  aBy: string | null;
  isExpert: boolean;
};

export type PdpFeature = { label: string; value?: string; icon?: string };
export type PdpBadge = { label: string; icon?: string; tone?: string };
export type PdpServe = { icon?: string; label: string };
export type PdpTaste = { label: string; level: string; pct: number };
export type PdpHighlight = { icon?: string; title: string; text: string };
export type PdpSpec = { icon?: string; key: string; value: string };
export type PdpNutrition = {
  calories?: number;
  macros?: { n: string; l: string }[];
  rows?: { label: string; value: string; pct?: number }[];
  note?: string;
};
export type PdpCare = { icon?: string; title: string; text: string };
export type PdpFaq = { q: string; a: string };
export type PdpContent = {
  features: PdpFeature[];
  galleryBadges: PdpBadge[];
  freeShipThresholdToman: number | null;
  serving: PdpServe[];
  lead: string | null;
  paragraphs: string[];
  bullets: string[];
  quote: { text: string; by?: string } | null;
  taste: PdpTaste[];
  highlights: PdpHighlight[];
  specs: PdpSpec[];
  nutrition: PdpNutrition | null;
  care: PdpCare[];
  faq: PdpFaq[];
};

export type PdpData = {
  slug: string;
  title: string;
  latinTitle: string | null;
  content: PdpContent;
  brand: string | null;
  categoryTitle: string | null;
  categorySlug: string | null;
  code: string;
  ratingShown: number | null; // null when no approved reviews
  numReviews: number;
  questionCount: number;
  images: { url: string; alt: string }[];
  weights: PdpWeight[];
  packagings: PdpPackaging[];
  defaultWeightId: string | null;
  descriptionHtml: string | null;
  storyHtml: string | null;
  related: PdpRelated[];
  reviews: PdpReview[];
  reviewHistogram: number[]; // [5,4,3,2,1] counts
  recommendPercent: number | null;
  questions: PdpQuestion[];
  installmentEnabled: boolean;
  inStock: boolean;
};

const BADGE_LABELS: Record<string, string> = {
  BESTSELLER: "پرفروش",
  DASHTZAD_PICK: "انتخاب دشت‌زاد",
  ECONOMICAL: "به‌صرفه",
  GIFT: "هدیه",
  DAILY: "روزانه",
  HOSTING: "پذیرایی",
  LIMITED: "محدود",
  NEW: "جدید",
};

function asArr<T>(x: unknown): T[] {
  return Array.isArray(x) ? (x as T[]) : [];
}

/** Normalise the free-form pdpContent JSON into typed, array-safe blocks. */
function parseContent(raw: unknown): PdpContent {
  const c = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const q = c.quote as { text?: string; by?: string } | undefined;
  const n = c.nutrition as PdpNutrition | undefined;
  return {
    features: asArr<PdpFeature>(c.features),
    galleryBadges: asArr<PdpBadge>(c.galleryBadges),
    freeShipThresholdToman:
      typeof c.freeShipThresholdToman === "number" ? c.freeShipThresholdToman : null,
    serving: asArr<PdpServe>(c.serving),
    lead: typeof c.lead === "string" ? c.lead : null,
    paragraphs: asArr<string>(c.paragraphs),
    bullets: asArr<string>(c.bullets),
    quote: q && typeof q.text === "string" ? { text: q.text, by: q.by } : null,
    taste: asArr<PdpTaste>(c.taste),
    highlights: asArr<PdpHighlight>(c.highlights),
    specs: asArr<PdpSpec>(c.specs),
    nutrition: n && typeof n === "object" ? n : null,
    care: asArr<PdpCare>(c.care),
    faq: asArr<PdpFaq>(c.faq),
  };
}

type VariantRow = {
  id: string;
  sku: string;
  price_rial: number;
  offPrice_rial: number | null;
  stock: number;
  gramValue: number;
  marketingBadge: string | null;
  weightPresetId: string | null;
  packagingOptionId: string | null;
  weight: { title: string } | null;
  packaging: { title: string; cost_rial: number } | null;
};

function unit100(priceToman: number, grams: number): number {
  return grams > 0 ? Math.round((priceToman / grams) * 100) : priceToman;
}

/** Pick the packaging that appears across the most weights as the additive base. */
function pickBasePackaging(variants: VariantRow[]): string | null {
  const counts = new Map<string, number>();
  for (const v of variants) {
    if (!v.packagingOptionId) continue;
    counts.set(v.packagingOptionId, (counts.get(v.packagingOptionId) ?? 0) + 1);
  }
  let best: string | null = null;
  let max = -1;
  for (const [pid, n] of counts) if (n > max) { max = n; best = pid; }
  return best;
}

function buildWeights(variants: VariantRow[], basePid: string | null): PdpWeight[] {
  const seen = new Set<string>();
  const out: PdpWeight[] = [];
  for (const v of variants) {
    const key = v.weightPresetId ?? v.sku;
    if (seen.has(key)) continue;
    // Prefer the variant for this weight at the base packaging.
    const atBase =
      variants.find(
        (x) => (x.weightPresetId ?? x.sku) === key && x.packagingOptionId === basePid,
      ) ?? v;
    seen.add(key);
    const priceRial = atBase.offPrice_rial ?? atBase.price_rial;
    const priceToman = rialToToman(priceRial);
    const oldToman = atBase.offPrice_rial ? rialToToman(atBase.price_rial) : null;
    const offPercent =
      atBase.offPrice_rial && atBase.price_rial > 0
        ? Math.round((1 - atBase.offPrice_rial / atBase.price_rial) * 100)
        : null;
    out.push({
      wid: key,
      grams: Math.round(atBase.gramValue),
      label: atBase.weight?.title ?? `${Math.round(atBase.gramValue)} گرم`,
      priceToman,
      oldToman,
      offPercent,
      per100Toman: unit100(priceToman, atBase.gramValue),
      badge: atBase.marketingBadge ? BADGE_LABELS[atBase.marketingBadge] ?? null : null,
      popular: atBase.marketingBadge === "BESTSELLER",
    });
  }
  return out;
}

function buildPackagings(variants: VariantRow[], basePid: string | null): PdpPackaging[] {
  const refWeight = variants[0]?.weightPresetId ?? variants[0]?.sku ?? null;
  const baseVar = variants.find(
    (v) => (v.weightPresetId ?? v.sku) === refWeight && v.packagingOptionId === basePid,
  );
  const baseToman = baseVar ? rialToToman(baseVar.offPrice_rial ?? baseVar.price_rial) : 0;
  const seen = new Set<string>();
  const out: PdpPackaging[] = [];
  for (const v of variants) {
    if (!v.packagingOptionId || seen.has(v.packagingOptionId)) continue;
    seen.add(v.packagingOptionId);
    const atRef = variants.find(
      (x) => (x.weightPresetId ?? x.sku) === refWeight && x.packagingOptionId === v.packagingOptionId,
    );
    const toman = atRef ? rialToToman(atRef.offPrice_rial ?? atRef.price_rial) : baseToman;
    const extra = Math.max(0, toman - baseToman);
    out.push({
      pid: v.packagingOptionId,
      label: v.packaging?.title ?? "بسته‌بندی",
      note: extra > 0 ? `+${extra.toLocaleString("en-US")} تومان` : "انتخاب پیش‌فرض",
      extraToman: extra,
    });
  }
  if (out.length) out.sort((a, b) => a.extraToman - b.extraToman);
  return out;
}

export async function getPdpData(slug: string): Promise<PdpData | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          sku: true,
          price_rial: true,
          offPrice_rial: true,
          stock: true,
          gramValue: true,
          marketingBadge: true,
          weightPresetId: true,
          packagingOptionId: true,
          weight: { select: { title: true } },
          packaging: { select: { title: true, cost_rial: true } },
        },
      },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!product) return null;

  const variants = product.variants as VariantRow[];
  const basePid = pickBasePackaging(variants);
  let weights = buildWeights(variants, basePid);
  const packagings = buildPackagings(variants, basePid);

  // Simple product (no active variants): synthesize one option from the base
  // price so the buy box shows a real price and the interaction script works.
  if (weights.length === 0) {
    const priceRial = product.offPrice_rial ?? product.price_rial;
    if (priceRial > 0) {
      weights = [
        {
          wid: "base",
          grams: 0,
          label: "بسته استاندارد",
          priceToman: rialToToman(priceRial),
          oldToman: product.offPrice_rial ? rialToToman(product.price_rial) : null,
          offPercent:
            product.offPrice_rial && product.price_rial > 0
              ? Math.round((1 - product.offPrice_rial / product.price_rial) * 100)
              : null,
          per100Toman: 0,
          badge: null,
          popular: true,
        },
      ];
    }
  }

  const [related, questions] = await Promise.all([
    prisma.product.findMany({
      where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
      take: 6,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { price_rial: true, offPrice_rial: true, marketingBadge: true },
        },
      },
    }),
    prisma.productQuestion.findMany({
      where: { productId: product.id, status: "ANSWERED" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: { select: { name: true } },
        answeredBy: { select: { name: true } },
      },
    }),
  ]);

  const histogram = [0, 0, 0, 0, 0];
  let recommend = 0;
  for (const r of product.reviews) {
    const idx = Math.min(5, Math.max(1, Math.round(r.rating)));
    histogram[5 - idx] += 1;
    if (r.rating >= 4) recommend += 1;
  }
  const hasReviews = product.reviews.length > 0;

  return {
    slug: product.slug,
    title: product.title,
    latinTitle: product.latinTitle,
    content: parseContent(product.pdpContent),
    brand: product.brand,
    categoryTitle: product.category?.title ?? null,
    categorySlug: product.category?.slug ?? null,
    code: variants[0]?.sku ?? product.slug.toUpperCase(),
    ratingShown: hasReviews ? Number(product.rating.toFixed(1)) : null,
    numReviews: product.numReviews,
    questionCount: questions.length,
    images: product.images.map((i) => ({ url: i.url, alt: i.alt ?? product.title })),
    weights,
    packagings,
    defaultWeightId: weights.find((w) => w.popular)?.wid ?? weights[0]?.wid ?? null,
    descriptionHtml: product.description || null,
    storyHtml: product.story || null,
    related: related.map((p) => {
      const v = p.variants[0];
      const priceRial = v ? v.offPrice_rial ?? v.price_rial : p.offPrice_rial ?? p.price_rial;
      return {
        title: p.title,
        slug: p.slug,
        image: p.images[0]?.url ?? null,
        priceToman: priceRial ? rialToToman(priceRial) : null,
        badge: v?.marketingBadge ? BADGE_LABELS[v.marketingBadge] ?? null : null,
      };
    }),
    reviews: product.reviews.map((r) => ({
      initial: (r.user.name ?? "م").charAt(0),
      name: r.user.name ?? "کاربر",
      meta: formatJalali(r.createdAt),
      rating: Math.round(r.rating),
      text: r.text ?? "",
      recommend: r.rating >= 4,
      verified: r.verifiedPurchase,
    })),
    reviewHistogram: histogram,
    recommendPercent: hasReviews ? Math.round((recommend / product.reviews.length) * 100) : null,
    questions: questions.map((q) => ({
      qText: q.question,
      qMeta: `${q.user.name ?? "کاربر"} · ${formatJalali(q.createdAt)}`,
      aText: q.answer,
      aBy: q.answeredBy?.name ?? "کارشناس دشت‌زاد",
      isExpert: true,
    })),
    installmentEnabled: product.installmentEnabled,
    inStock: variants.some((v) => v.stock > 0) || product.price_rial > 0,
  };
}
