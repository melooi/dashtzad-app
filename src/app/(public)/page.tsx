/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { Button } from "@/common/Button";
import { ProductCard } from "@/components/ProductCard";
import { PostCard } from "@/components/PostCard";
import { cardInclude, toProductCardData, isVariableProduct } from "@/lib/storefront/product-card";
import { buildEntityMetadata } from "@/lib/seo/meta";
import { getHomepage, getSeoDefaults } from "@/lib/admin/global-service";
import { getActiveBanners } from "@/lib/site-data";
import { HomepageBlocks } from "@/components/home/HomepageBlocks";
import type { HomepageBlock } from "@/lib/admin/globals";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoDefaults();
  return buildEntityMetadata("HOMEPAGE", "homepage", {
    title: seo.defaultTitle || "دشت‌زاد — مواد غذایی پرمیوم ایرانی",
    description:
      seo.defaultDescription ||
      "زعفران، آجیل، حبوبات و ادویه‌ی پرمیوم ایرانی — مستقیم از دشت تا سفره‌ی شما. از سال ۱۳۱۳.",
    path: "/",
    image: seo.defaultOgImageUrl || undefined,
  });
}

export default async function HomePage() {
  const [homepage, topBanners] = await Promise.all([getHomepage(), getActiveBanners("HOME_TOP")]);
  const blocks = homepage.blocks as HomepageBlock[];
  const hasBlocks = blocks.some((b) => b.isActive !== false);

  return (
    <main>
      {/* Admin-managed top banners (above everything) */}
      {topBanners.map((b) => (
        <Link key={b.id} href={b.linkHref || "#"} className="block bg-dz-primary-100">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
            {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="h-12 w-auto rounded-lg" />}
            <div>
              <span className="font-medium text-dz-primary-800">{b.title}</span>
              {b.subtitle && <span className="mr-2 text-sm text-dz-primary-500">{b.subtitle}</span>}
            </div>
          </div>
        </Link>
      ))}

      {hasBlocks ? <HomepageBlocks blocks={blocks} /> : <DefaultHome />}
    </main>
  );
}

/** Fallback homepage used until the admin configures blocks. */
async function DefaultHome() {
  const [products, posts] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: cardInclude,
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 2,
      include: { author: { select: { name: true } } },
    }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-dz-primary-100 bg-dz-primary-50">
        {/* soft, calm brand backdrop — no harsh gradients */}
        <div className="pointer-events-none absolute -top-24 start-1/2 size-[480px] -translate-x-1/2 rounded-full bg-dz-primary-100/50 blur-3xl" aria-hidden />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center md:py-24">
          <Logo variant="full" priority className="h-16 w-auto" />
          <span className="inline-flex items-center gap-2 rounded-full border border-dz-primary-200 bg-white/70 px-4 py-1.5 font-heading text-xs text-dz-primary-600">
            <span className="size-1.5 rounded-full bg-dz-primary-500" aria-hidden />
            از سال ۱۳۱۳ · مواد غذایی پرمیوم ایرانی
          </span>
          <h1 className="font-heading text-4xl font-bold text-dz-primary-800 md:text-5xl">
            اصالت طعم ایرانی، از سال ۱۳۱۳
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-dz-primary-700">
            زعفران، آجیل، حبوبات و ادویه‌ی پرمیوم — مستقیم از دشت تا سفره‌ی شما.
          </p>
          <Link href="/products" className="focus-ring rounded-xl">
            <Button className="mt-2">
              مشاهده‌ی محصولات
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-1.5 rounded-full bg-dz-primary-400" aria-hidden />
            <h2 className="font-heading text-2xl font-bold text-dz-primary-800">محصولات منتخب</h2>
          </div>
          <Link href="/products" className="focus-ring inline-flex items-center gap-1 rounded-lg px-1 text-sm text-dz-primary-600 hover:text-dz-primary-800">
            همه محصولات
            <ArrowLeft className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={toProductCardData(p)}
              quickAdd={
                !isVariableProduct(p) && p.countInStock > 0
                  ? { productId: p.id, priceRial: p.offPrice_rial ?? p.price_rial, basePriceRial: p.price_rial }
                  : null
              }
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-1.5 rounded-full bg-dz-primary-400" aria-hidden />
            <h2 className="font-heading text-2xl font-bold text-dz-primary-800">از بلاگ</h2>
          </div>
          <Link href="/blog" className="focus-ring inline-flex items-center gap-1 rounded-lg px-1 text-sm text-dz-primary-600 hover:text-dz-primary-800">
            همه نوشته‌ها
            <ArrowLeft className="size-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={{
                slug: p.slug,
                title: p.title,
                briefText: p.briefText,
                coverImage: p.coverImage,
                readingTime: p.readingTime,
                authorName: p.author?.name ?? null,
                createdAt: p.createdAt,
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}
