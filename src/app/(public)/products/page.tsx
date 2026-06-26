import Link from "next/link";
import { ArrowUpDown, PackageOpen, Search } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/product-card/ProductCard";
import { StoreBreadcrumbs } from "@/components/storefront/StoreBreadcrumbs";
import { StorePageHero } from "@/components/storefront/StorePageHero";
import { StoreTrustBand } from "@/components/storefront/StoreTrustBand";
import { Pagination } from "@/components/Pagination";
import { buildMetadata } from "@/lib/seo";
import { toProductCardData, isVariableProduct } from "@/lib/storefront/product-card";
import { toPersianNumbers } from "@/lib/price";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "محصولات",
  description: "خرید زعفران، آجیل، حبوبات و ادویه‌ی پرمیوم ایرانی از دشت‌زاد.",
  url: "/products",
});

const PAGE_SIZE = 12;

const SORTS = [
  { key: "newest", label: "جدیدترین" },
  { key: "price-asc", label: "ارزان‌ترین" },
  { key: "price-desc", label: "گران‌ترین" },
];

const cardInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  category: { select: { title: true } },
  variants: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      gramValue: true,
      price_rial: true,
      offPrice_rial: true,
      stock: true,
      marketingBadge: true,
      weight: { select: { id: true, title: true, gramValue: true } },
      packaging: { select: { id: true, title: true } },
    },
  },
} satisfies Prisma.ProductInclude;

type SP = { [k: string]: string | string[] | undefined };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const cat =
    typeof sp.cat === "string" ? sp.cat : typeof sp.category === "string" ? sp.category : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(cat ? { category: { slug: cat } } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price_rial: "asc" }
      : sort === "price-desc"
        ? { price_rial: "desc" }
        : { createdAt: "desc" };

  const [categories, total, products] = await Promise.all([
    prisma.category.findMany({ where: { type: "PRODUCT" }, orderBy: { title: "asc" } }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: cardInclude,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const activeCat = categories.find((c) => c.slug === cat) ?? null;

  const linkFor = (params: Record<string, string>) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (cat) u.set("cat", cat);
    u.set("sort", sort);
    for (const [k, v] of Object.entries(params)) {
      if (v) u.set(k, v);
      else u.delete(k);
    }
    return `/products?${u.toString()}`;
  };

  return (
    <main className="mx-auto max-w-[90rem] px-[clamp(1rem,4vw,2.5rem)] py-7 text-store-text md:py-9">
      <StoreBreadcrumbs
        items={[
          { name: "خانه", href: "/" },
          { name: "محصولات", href: cat ? "/products" : undefined },
          ...(activeCat ? [{ name: activeCat.title }] : []),
        ]}
      />

      <StorePageHero
        className="mt-4"
        eyebrow="فروشگاه دشت‌زاد · از ۱۳۱۳"
        eyebrowIcon={<span className="size-1.5 rounded-full bg-store-primary" aria-hidden />}
        title={activeCat ? activeCat.title : "محصولات دشت‌زاد"}
        subtitle={
          q ? (
            <>
              نتایج جستجو برای «{q}» — {toPersianNumbers(total)} محصول
            </>
          ) : (
            <>
              {toPersianNumbers(total)} محصولِ اصیلِ ایرانی — زعفران، آجیل، حبوبات و ادویه، با همان
              وسواسِ کیفیتِ دشت‌زاد.
            </>
          )
        }
      />

      {/* Category chips */}
      <nav aria-label="دسته‌بندی محصولات" className="mt-6 flex flex-wrap gap-2">
        <Link
          href={linkFor({ cat: "", page: "" })}
          aria-current={!cat ? "true" : undefined}
          className={`store-chip ${!cat ? "is-on" : ""}`}
        >
          همه
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={linkFor({ cat: c.slug, page: "" })}
            aria-current={cat === c.slug ? "true" : undefined}
            className={`store-chip ${cat === c.slug ? "is-on" : ""}`}
          >
            {c.title}
          </Link>
        ))}
      </nav>

      {/* Toolbar: search + sort */}
      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-store-border bg-store-surface p-3 shadow-store-xs sm:flex-row sm:items-center sm:justify-between">
        <form action="/products" className="relative w-full sm:max-w-xs">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="جستجوی محصول…"
            aria-label="جستجوی محصول"
            className="w-full rounded-xl border border-store-border bg-store-bg py-2.5 ps-4 pe-10 text-sm text-store-text outline-none transition-colors focus:border-store-primary focus-visible:ring-2 focus-visible:ring-store-primary/40"
          />
          {cat && <input type="hidden" name="cat" value={cat} />}
          <button
            type="submit"
            className="absolute inset-e-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-store-text-faint transition-colors hover:text-store-primary"
            aria-label="جستجو"
          >
            <Search className="size-4" />
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-store-text-faint">
            <ArrowUpDown className="size-3.5" aria-hidden />
            مرتب‌سازی
          </span>
          {SORTS.map((s) => (
            <Link
              key={s.key}
              href={linkFor({ sort: s.key, page: "" })}
              aria-current={sort === s.key ? "true" : undefined}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${sort === s.key ? "border-store-primary bg-store-primary text-white" : "border-store-border text-store-text-muted hover:bg-store-bg"}`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-store-border bg-store-surface p-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-store-primary-soft text-store-primary-hover">
            <PackageOpen className="size-7" aria-hidden />
          </span>
          <h2 className="font-heading text-lg font-bold text-store-text">محصولی یافت نشد</h2>
          <p className="text-sm text-store-text-faint">فیلترها را تغییر دهید یا همه‌ی محصولات را ببینید.</p>
          <Link href="/products" className="store-btn store-btn-primary mt-1">
            مشاهده‌ی همه‌ی محصولات
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={toProductCardData(p)}
              priority={i < 4}
              quickAdd={
                !isVariableProduct(p) && p.countInStock > 0
                  ? {
                      productId: p.id,
                      priceRial: p.offPrice_rial ?? p.price_rial,
                      basePriceRial: p.price_rial,
                    }
                  : null
              }
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/products" query={{ q, cat, sort }} />

      {/* Closing brand band — real Dashtzad promises (gives the page real weight) */}
      <StoreTrustBand framed className="mt-12" />
    </main>
  );
}
