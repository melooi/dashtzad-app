/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { ProductCard } from "@/components/ProductCard";
import { PostCard } from "@/components/PostCard";
import { cardInclude, toProductCardData, isVariableProduct } from "@/lib/storefront/product-card";
import { getFaqGroupItems } from "@/lib/site-data";
import { StructuredData } from "@/components/StructuredData";
import { faqPageSchema } from "@/lib/jsonld";
import type { HomepageBlock } from "@/lib/admin/globals";

const str = (v: unknown) => (typeof v === "string" ? v : "");
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const num = (v: unknown, def: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
};

function Section({ title, subtitle, children }: { title?: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-14">
      {title && (
        <div className="mb-2 flex items-center gap-2.5">
          <span className="h-7 w-1.5 rounded-full bg-dz-primary-400" aria-hidden />
          <h2 className="font-heading text-2xl font-bold text-dz-primary-800">{title}</h2>
        </div>
      )}
      {subtitle && <p className="mb-6 ps-4 text-sm text-dz-primary-500">{subtitle}</p>}
      {!subtitle && title && <div className="mb-6" />}
      {children}
    </section>
  );
}

async function renderBlock(block: HomepageBlock, key: number): Promise<React.ReactNode> {
  const type = block.type;

  if (type === "Hero") {
    const image = str(block.imageUrl);
    return (
      <section key={key} className="relative overflow-hidden border-b border-dz-primary-100 bg-dz-primary-50">
        <div className="pointer-events-none absolute -top-24 start-1/2 size-[480px] -translate-x-1/2 rounded-full bg-dz-primary-100/50 blur-3xl" aria-hidden />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center md:py-24">
          {str(block.eyebrow) && (
            <span className="inline-flex items-center gap-2 rounded-full border border-dz-primary-200 bg-white/70 px-4 py-1.5 font-heading text-xs text-dz-primary-600">
              <span className="size-1.5 rounded-full bg-dz-primary-500" aria-hidden />
              {str(block.eyebrow)}
            </span>
          )}
          <h1 className="font-heading text-4xl font-bold text-dz-primary-800 md:text-5xl">
            {str(block.title) || "دشت‌زاد"}
          </h1>
          {str(block.subtitle) && <p className="max-w-2xl text-lg leading-8 text-dz-primary-700">{str(block.subtitle)}</p>}
          {image && <img src={image} alt={str(block.title)} className="mt-2 max-h-72 w-full rounded-2xl object-cover shadow-card" />}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {str(block.primaryCtaLabel) && (
              <Link href={str(block.primaryCtaHref) || "/products"} className="focus-ring rounded-xl bg-dz-primary-600 px-6 py-3 text-sm font-medium text-white shadow-xs transition-colors hover:bg-dz-primary-700">
                {str(block.primaryCtaLabel)}
              </Link>
            )}
            {str(block.secondaryCtaLabel) && (
              <Link href={str(block.secondaryCtaHref) || "/"} className="focus-ring rounded-xl border border-dz-primary-300 bg-white/60 px-6 py-3 text-sm font-medium text-dz-primary-700 transition-colors hover:bg-dz-primary-50">
                {str(block.secondaryCtaLabel)}
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (type === "FeaturedProducts") {
    const mode = str(block.mode) || "LATEST";
    const limit = num(block.limit, 4);
    const ids = arr<string>(block.productIds);
    const include = cardInclude;
    let products: Prisma.ProductGetPayload<{ include: typeof include }>[] = [];
    if (mode === "MANUAL" && ids.length) {
      products = await prisma.product.findMany({ where: { id: { in: ids }, isActive: true }, include });
    } else if (mode === "CATEGORY" && str(block.categoryId)) {
      products = await prisma.product.findMany({ where: { categoryId: str(block.categoryId), isActive: true }, take: limit, orderBy: { createdAt: "desc" }, include });
    } else {
      products = await prisma.product.findMany({ where: { isActive: true }, take: limit, orderBy: { createdAt: "desc" }, include });
    }
    if (!products.length) return null;
    return (
      <Section key={key} title={str(block.title) || "محصولات منتخب"} subtitle={str(block.subtitle)}>
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
      </Section>
    );
  }

  if (type === "FeaturedCategories") {
    const ids = arr<string>(block.categoryIds);
    if (!ids.length) return null;
    const cats = await prisma.category.findMany({ where: { id: { in: ids } } });
    if (!cats.length) return null;
    return (
      <Section key={key} title={str(block.title) || "دسته‌های منتخب"} subtitle={str(block.subtitle)}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {cats.map((c) => (
            <Link key={c.id} href={`/products?category=${c.slug}`} className="focus-ring group flex items-center justify-center rounded-2xl border border-dz-primary-100 bg-white p-6 text-center shadow-xs transition-all hover:-translate-y-0.5 hover:border-dz-primary-200 hover:shadow-card">
              <span className="font-heading font-bold text-dz-primary-800 transition-colors group-hover:text-dz-primary-600">{c.title}</span>
            </Link>
          ))}
        </div>
      </Section>
    );
  }

  if (type === "RichText") {
    if (!str(block.body)) return null;
    return (
      <Section key={key} title={str(block.title)}>
        <div className="prose max-w-none whitespace-pre-line text-dz-primary-700">{str(block.body)}</div>
      </Section>
    );
  }

  if (type === "ImageGallery") {
    const images = arr<{ url?: string; alt?: string }>(block.images).filter((im) => im.url);
    if (!images.length) return null;
    return (
      <Section key={key} title={str(block.title)}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((im, i) => (
            <img key={i} src={im.url} alt={im.alt ?? ""} className="aspect-video w-full rounded-xl object-cover" />
          ))}
        </div>
      </Section>
    );
  }

  if (type === "CTABanner") {
    const image = str(block.imageUrl);
    return (
      <Section key={key}>
        <div className="overflow-hidden rounded-2xl bg-dz-primary-700 text-white">
          {image && <img src={image} alt={str(block.title)} className="h-48 w-full object-cover opacity-90" />}
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <h2 className="font-heading text-2xl font-bold">{str(block.title)}</h2>
            {str(block.text) && <p className="max-w-2xl text-dz-primary-100">{str(block.text)}</p>}
            {str(block.buttonLabel) && (
              <Link href={str(block.buttonHref) || "/products"} className="mt-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-dz-primary-700 hover:bg-dz-primary-50">
                {str(block.buttonLabel)}
              </Link>
            )}
          </div>
        </div>
      </Section>
    );
  }

  if (type === "FAQGroup") {
    const group = await getFaqGroupItems(str(block.faqGroupId));
    if (!group || !group.items.length) return null;
    return (
      <Section key={key} title={str(block.title) || group.title}>
        {faqPageSchema(group.items.map((it) => ({ question: it.question, answer: it.answer }))) && (
          <StructuredData
            data={faqPageSchema(group.items.map((it) => ({ question: it.question, answer: it.answer })))!}
          />
        )}
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {group.items.map((it) => (
            <details key={it.id} className="group rounded-xl border border-dz-primary-100 bg-white p-4 shadow-xs transition-colors open:border-dz-primary-200 hover:border-dz-primary-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-dz-primary-800 marker:hidden [&::-webkit-details-marker]:hidden">
                {it.question}
                <ChevronDown className="size-4 shrink-0 text-dz-primary-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 whitespace-pre-line border-t border-dz-primary-50 pt-3 text-sm leading-7 text-dz-primary-600">{it.answer}</p>
            </details>
          ))}
        </div>
      </Section>
    );
  }

  if (type === "TrustIcons" || type === "ProductFeatures") {
    const items = arr<{ title?: string; text?: string }>(block.items).filter((it) => it.title || it.text);
    if (!items.length) return null;
    return (
      <Section key={key} title={str(block.title)}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border border-dz-primary-100 bg-white p-5 shadow-xs transition-shadow hover:shadow-card">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-dz-primary-50 text-dz-primary-600">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <h3 className="font-medium text-dz-primary-800">{it.title}</h3>
                {it.text && <p className="mt-1 text-sm leading-6 text-dz-primary-500">{it.text}</p>}
              </div>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  if (type === "BlogPreview") {
    const limit = num(block.limit, 2);
    const where =
      str(block.mode) === "CATEGORY" && str(block.categoryId)
        ? { status: "PUBLISHED" as const, categoryId: str(block.categoryId) }
        : { status: "PUBLISHED" as const };
    const posts = await prisma.post.findMany({ where, take: limit, orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } });
    if (!posts.length) return null;
    return (
      <Section key={key} title={str(block.title) || "از بلاگ"}>
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={{
                slug: p.slug,
                title: p.title,
                briefText: p.briefText,
                coverImage: typeof p.coverImage === "string" && p.coverImage.trim() ? p.coverImage.trim() : null,
                readingTime: p.readingTime,
                authorName: p.author?.name ?? null,
                createdAt: p.createdAt,
              }}
            />
          ))}
        </div>
      </Section>
    );
  }

  if (type === "ProductStory") {
    if (!str(block.text)) return null;
    const image = str(block.imageUrl);
    return (
      <Section key={key}>
        <div className="grid items-center gap-6 rounded-2xl border border-dz-primary-100 bg-white p-6 md:grid-cols-2">
          <div>
            <h2 className="mb-2 font-heading text-2xl font-bold text-dz-primary-800">{str(block.title)}</h2>
            <p className="whitespace-pre-line leading-8 text-dz-primary-600">{str(block.text)}</p>
          </div>
          {image && <img src={image} alt={str(block.title)} className="aspect-square w-full rounded-xl object-cover" />}
        </div>
      </Section>
    );
  }

  if (type === "ProductTasteProfile") {
    const items = arr<{ label?: string; value?: string }>(block.items).filter((it) => it.label);
    if (!items.length) return null;
    return (
      <Section key={key} title={str(block.title)}>
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {items.map((it, i) => (
            <div key={i} className="flex items-center justify-between border-b border-dz-primary-50 pb-2">
              <span className="text-sm font-medium text-dz-primary-700">{it.label}</span>
              <span className="text-sm text-dz-primary-500">{it.value}</span>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  // Unknown / not-yet-renderable block → safe, clean placeholder.
  return (
    <Section key={key} title={str(block.title)}>
      <div className="rounded-2xl border border-dashed border-dz-primary-200 bg-white p-8 text-center text-sm text-dz-primary-400">
        این بخش به‌زودی نمایش داده می‌شود.
      </div>
    </Section>
  );
}

/** Render configured homepage blocks (active only). */
export async function HomepageBlocks({ blocks }: { blocks: HomepageBlock[] }) {
  const active = blocks.filter((b) => b.isActive !== false);
  const rendered = await Promise.all(active.map((b, i) => renderBlock(b, i)));
  return <>{rendered}</>;
}
