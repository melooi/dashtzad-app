import { BASE_URL, SITE_NAME } from "@/lib/seo";
import {
  getBusinessInfo,
  getBrandSettings,
  getSeoDefaults,
  getSocialLinks,
  getContactInfo,
} from "@/lib/admin/global-service";

const abs = (url: string) => (url.startsWith("http") ? url : `${BASE_URL}${url}`);
const LOGO = `${BASE_URL}/logo/dashtzad-logo-1.svg`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: BASE_URL,
    logo: LOGO,
    // Brand heritage (۱۳۱۳ Jalali) is DISPLAY-only — never emitted as a
    // machine-readable foundingDate (would be misread as 1313 AD). Omitted.
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      areaServed: "IR",
      availableLanguage: "Persian",
    },
    sameAs: [] as string[],
  };
}

/** Organization schema enriched from admin globals (safe fallbacks). */
export async function organizationSchemaFromGlobals() {
  const [biz, brand, seo, social, contact] = await Promise.all([
    getBusinessInfo(),
    getBrandSettings(),
    getSeoDefaults(),
    getSocialLinks(),
    getContactInfo(),
  ]);
  const sameAs = [
    ...social.links.filter((l) => l.isActive && l.url).map((l) => l.url),
    ...seo.organizationSameAs.filter(Boolean),
  ];
  const logo = seo.organizationLogoUrl || brand.logoUrl || LOGO;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: seo.organizationName || biz.brandName || SITE_NAME,
    url: seo.canonicalBase || BASE_URL,
    logo: logo.startsWith("http") ? logo : abs(logo),
    // foundingDate intentionally omitted — heritage year ۱۳۱۳ is Jalali and
    // display-only; we never invent a Gregorian date for structured data.
    ...(contact.primaryPhone || contact.email
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone: contact.primaryPhone || undefined,
            email: contact.email || undefined,
            areaServed: "IR",
            availableLanguage: "Persian",
          },
        }
      : {}),
    sameAs,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE_URL,
    inLanguage: "fa-IR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

type ProductInput = {
  title: string;
  slug: string;
  description: string;
  brand?: string | null;
  priceRial: number; // priceCurrency IRR == Rial (NOT Toman)
  offPriceRial?: number | null;
  countInStock: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
};

export function productSchema(p: ProductInput) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description,
    image: p.images.map(abs),
    brand: { "@type": "Brand", name: p.brand ?? SITE_NAME },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/products/${p.slug}`,
      price: String(p.offPriceRial ?? p.priceRial),
      priceCurrency: "IRR",
      availability:
        p.countInStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };
  if (p.reviewCount && p.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.rating ?? 0,
      reviewCount: p.reviewCount,
    };
  }
  return schema;
}

type ArticleInput = {
  title: string;
  slug: string;
  description: string;
  image: string;
  datePublished: Date | string;
  dateModified: Date | string;
};

export function articleSchema(a: ArticleInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    image: [abs(a.image)],
    datePublished: new Date(a.datePublished).toISOString(),
    dateModified: new Date(a.dateModified).toISOString(),
    author: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: LOGO },
    },
    mainEntityOfPage: `${BASE_URL}/blog/${a.slug}`,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.url),
    })),
  };
}

// ============================================================
// SEO-CP1 additions — variable products, FAQ, item lists, recipe placeholder.
// No fake data: Offers only when price/availability are real; AggregateRating
// only when real approved reviews exist.
// ============================================================

const availabilityFor = (stock: number, active: boolean) =>
  active && stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

/** A real, sellable variant. Inactive or price-less variants are filtered out. */
export type VariantOffer = {
  sku: string;
  priceRial: number; // real effective price (Rial == IRR)
  offPriceRial?: number | null;
  stock: number;
  isActive: boolean;
  weightTitle?: string | null;
  packagingTitle?: string | null;
};

type ProductLdInput = {
  title: string;
  slug: string;
  description: string;
  brand?: string | null;
  category?: string | null;
  sku?: string | null;
  priceRial: number;
  offPriceRial?: number | null;
  countInStock: number;
  isActive?: boolean;
  images: string[];
  // Only pass APPROVED review aggregates — never fabricate.
  approvedReviewCount?: number;
  rating?: number;
  // Real sellable variants (active). Drive ProductGroup/hasVariant output.
  variants?: VariantOffer[];
};

function variantOffer(url: string, priceRial: number, stock: number, active: boolean) {
  return {
    "@type": "Offer",
    url,
    price: String(Math.max(0, Math.round(priceRial))),
    priceCurrency: "IRR", // DB stores Rial; IRR is the ISO code for Rial.
    availability: availabilityFor(stock, active),
    itemCondition: "https://schema.org/NewCondition",
  };
}

/**
 * Product structured data (Google-aligned, SEO-CP1.1):
 *  - Variable products → ProductGroup + hasVariant[] (each a Product with its
 *    own real Offer). NOT AggregateOffer — variants are not separate seller
 *    offers; AggregateOffer would misrepresent them.
 *  - Single products → plain Product + Offer.
 * AggregateRating is emitted only from real APPROVED reviews.
 */
export function productJsonLd(p: ProductLdInput) {
  const url = `${BASE_URL}/products/${p.slug}`;
  const images = p.images.map(abs);
  const brand = { "@type": "Brand", name: p.brand || SITE_NAME };

  // Real, sellable variants only: active + a valid positive price.
  const sellable = (p.variants ?? []).filter(
    (v) => v.isActive && (v.offPriceRial ?? v.priceRial) > 0,
  );

  const aggregateRating =
    p.approvedReviewCount && p.approvedReviewCount > 0 && p.rating && p.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(p.rating.toFixed(1)),
            reviewCount: p.approvedReviewCount,
          },
        }
      : {};

  if (sellable.length > 0) {
    const weightsVary = new Set(sellable.map((v) => v.weightTitle || "")).size > 1;
    const packagingVary = new Set(sellable.map((v) => v.packagingTitle || "")).size > 1;
    const variesBy = [
      ...(weightsVary ? ["weight"] : []),
      ...(packagingVary ? ["packaging"] : []),
    ];

    const hasVariant = sellable.map((v) => {
      const props = [
        ...(v.weightTitle ? [{ "@type": "PropertyValue", name: "weight", value: v.weightTitle }] : []),
        ...(v.packagingTitle ? [{ "@type": "PropertyValue", name: "packaging", value: v.packagingTitle }] : []),
      ];
      const label = [v.weightTitle, v.packagingTitle].filter(Boolean).join(" / ");
      return {
        "@type": "Product",
        name: label ? `${p.title} — ${label}` : p.title,
        sku: v.sku,
        image: images,
        ...(props.length ? { additionalProperty: props } : {}),
        offers: variantOffer(url, v.offPriceRial ?? v.priceRial, v.stock, v.isActive),
      };
    });

    return {
      "@context": "https://schema.org",
      "@type": "ProductGroup",
      name: p.title,
      description: p.description,
      image: images,
      brand,
      ...(p.category ? { category: p.category } : {}),
      productGroupID: p.slug,
      url,
      ...(variesBy.length ? { variesBy } : {}),
      ...aggregateRating,
      hasVariant,
    };
  }

  // Single (non-variable) product.
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description,
    image: images,
    brand,
    ...(p.sku ? { sku: p.sku } : {}),
    ...(p.category ? { category: p.category } : {}),
    url,
    ...aggregateRating,
    offers: variantOffer(url, p.offPriceRial ?? p.priceRial, p.countInStock, p.isActive ?? true),
  };
}

/** FAQPage JSON-LD from real, active FAQ items only. */
export function faqPageSchema(items: { question: string; answer: string }[]) {
  const clean = items.filter((i) => i.question?.trim() && i.answer?.trim());
  if (clean.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: clean.map((i) => ({
      "@type": "Question",
      name: i.question.trim(),
      acceptedAnswer: { "@type": "Answer", text: i.answer.trim() },
    })),
  };
}

/** ItemList / CollectionPage JSON-LD for a category or listing page. */
export function itemListSchema(
  name: string,
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: abs(it.url),
    })),
  };
}

type RecipeLdInput = {
  name: string;
  description: string;
  image?: string | null;
  datePublished?: Date | string;
  author?: string | null;
  ingredients?: string[];
  instructions?: { name?: string; text: string }[] | string[];
  // RECIPE-CP1 additions (all optional, all honest):
  prepTime?: string | null; // ISO 8601 duration
  cookTime?: string | null;
  totalTime?: string | null;
  recipeYield?: string | null;
  recipeCategory?: string | null;
  keywords?: string[];
  nutrition?: { calories?: string; protein?: string; carbohydrate?: string; fat?: string } | null;
  aggregateRating?: { ratingValue: number; ratingCount: number } | null;
};

/**
 * Recipe JSON-LD builder (RECIPE-CP1). Returns null if empty. Only emits fields
 * that carry real data (no fabricated ratings/nutrition).
 */
export function recipeSchema(r: RecipeLdInput) {
  if (!r.name?.trim()) return null;
  const n = r.nutrition;
  const hasNutrition = n && (n.calories || n.protein || n.carbohydrate || n.fat);
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.name,
    description: r.description,
    ...(r.image ? { image: [abs(r.image)] } : {}),
    ...(r.datePublished ? { datePublished: new Date(r.datePublished).toISOString() } : {}),
    author: { "@type": r.author ? "Person" : "Organization", name: r.author || SITE_NAME },
    ...(r.prepTime ? { prepTime: r.prepTime } : {}),
    ...(r.cookTime ? { cookTime: r.cookTime } : {}),
    ...(r.totalTime ? { totalTime: r.totalTime } : {}),
    ...(r.recipeYield ? { recipeYield: r.recipeYield } : {}),
    ...(r.recipeCategory ? { recipeCategory: r.recipeCategory } : {}),
    ...(r.keywords?.length ? { keywords: r.keywords.join("، ") } : {}),
    ...(r.ingredients?.length ? { recipeIngredient: r.ingredients } : {}),
    ...(r.instructions?.length
      ? {
          recipeInstructions: r.instructions.map((s) =>
            typeof s === "string"
              ? { "@type": "HowToStep", text: s }
              : { "@type": "HowToStep", ...(s.name ? { name: s.name } : {}), text: s.text },
          ),
        }
      : {}),
    ...(hasNutrition
      ? {
          nutrition: {
            "@type": "NutritionInformation",
            ...(n!.calories ? { calories: n!.calories } : {}),
            ...(n!.protein ? { proteinContent: n!.protein } : {}),
            ...(n!.carbohydrate ? { carbohydrateContent: n!.carbohydrate } : {}),
            ...(n!.fat ? { fatContent: n!.fat } : {}),
          },
        }
      : {}),
    ...(r.aggregateRating && r.aggregateRating.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(r.aggregateRating.ratingValue.toFixed(1)),
            ratingCount: r.aggregateRating.ratingCount,
            bestRating: 5,
          },
        }
      : {}),
  };
}
