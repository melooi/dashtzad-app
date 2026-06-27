import Link from "next/link";
import Image from "next/image";
import { Newspaper, Search, Clock, Layers, ChevronLeft } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/storefront/ArticleCard";
import { StorePageHero } from "@/components/storefront/StorePageHero";
import { buildMetadata } from "@/lib/seo";
import { toPersianNumbers } from "@/lib/price";
import { ARTICLE_TYPE_KEYS, ARTICLE_TYPES, articleTypeLabel } from "@/lib/admin/article-types";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "مجله دشت‌زاد",
  description: "مجله دشت‌زاد؛ پرونده‌ها، قصه طعم‌ها، فرهنگ غذایی، دانستنی‌ها، ترفندها و دانشنامه‌ی مواد غذایی ایرانی.",
  url: "/blog",
});

type SP = { [k: string]: string | string[] | undefined };

const CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  briefText: true,
  coverImage: true,
  readingTime: true,
  articleType: true,
} satisfies Prisma.PostSelect;

const TYPE_VALUES: string[] = ARTICLE_TYPE_KEYS.slice();
// Section types shown as rows on the landing (case-file has its own rail).
const SECTION_TYPES = ARTICLE_TYPE_KEYS.filter((k) => k !== "CASE_FILE");

export default async function BlogPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const cat = typeof sp.cat === "string" ? sp.cat : "";
  const type = typeof sp.type === "string" && TYPE_VALUES.includes(sp.type) ? sp.type : "";
  const isFiltered = Boolean(q || cat || type);

  const categories = await prisma.category.findMany({ where: { type: "POST", deletedAt: null }, orderBy: { title: "asc" } });

  // ---- Filtered / search mode ----
  if (isFiltered) {
    const where: Prisma.PostWhereInput = {
      status: "PUBLISHED",
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(cat ? { category: { slug: cat } } : {}),
      ...(type ? { articleType: type as Prisma.PostWhereInput["articleType"] } : {}),
    };
    const posts = await prisma.post.findMany({ where: { ...where, deletedAt: null }, orderBy: { createdAt: "desc" }, select: CARD_SELECT });
    const heading = type ? articleTypeLabel(type) : cat ? categories.find((c) => c.slug === cat)?.title ?? "دسته" : `نتایج «${q}»`;

    return (
      <main className="mx-auto max-w-6xl px-4 py-8 text-store-text md:py-10">
        <BlogNav categories={categories.map((c) => ({ slug: c.slug, title: c.title }))} q={q} activeCat={cat} activeType={type} />
        <h1 className="mt-6 mb-6 font-heading text-2xl font-bold text-store-text">{heading}</h1>
        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <ArticleCard key={p.id} article={p} />
            ))}
          </div>
        )}
      </main>
    );
  }

  // ---- Magazine landing ----
  const [posts, series] = await Promise.all([
    prisma.post.findMany({ where: { status: "PUBLISHED", deletedAt: null }, orderBy: { createdAt: "desc" }, take: 100, select: CARD_SELECT }),
    prisma.contentSeries.findMany({ where: { status: "PUBLISHED", deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { slug: true, title: true, subtitle: true, coverImage: true } }),
  ]);

  const featured = posts.find((p) => p.coverImage) ?? posts[0] ?? null;
  const rest = posts.filter((p) => p.id !== featured?.id);
  const byType = (t: string) => rest.filter((p) => p.articleType === t).slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-store-text md:py-10">
      <StorePageHero
        eyebrow="مجله دشت‌زاد"
        eyebrowIcon={<Newspaper className="size-4" aria-hidden />}
        title="مجله دشت‌زاد"
        subtitle="پرونده‌ها، قصه طعم‌ها، فرهنگ غذایی، دانستنی‌ها و دانشنامه‌ی مواد غذایی ایرانی — از سال ۱۳۱۳."
      />

      <div className="mt-6">
        <BlogNav categories={categories.map((c) => ({ slug: c.slug, title: c.title }))} />
      </div>

      {posts.length === 0 ? (
        <div className="mt-8"><EmptyState /></div>
      ) : (
        <>
          {/* featured */}
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="group mt-8 grid overflow-hidden rounded-3xl border border-store-border bg-store-surface shadow-store-card md:grid-cols-2">
              <div className="relative aspect-[16/10] md:aspect-auto">
                {featured.coverImage ? (
                  <Image src={featured.coverImage} alt={featured.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
                ) : (
                  <div className="flex h-full items-center justify-center bg-store-surface-soft text-store-text-faint">بدون تصویر</div>
                )}
              </div>
              <div className="flex flex-col justify-center gap-3 p-6 md:p-8">
                <span className="self-start rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: featured.articleType && featured.articleType in ARTICLE_TYPES ? ARTICLE_TYPES[featured.articleType as keyof typeof ARTICLE_TYPES].accent : "#15803d" }}>
                  {articleTypeLabel(featured.articleType)}
                </span>
                <h2 className="font-heading text-2xl font-bold leading-tight text-store-text transition-colors group-hover:text-store-primary md:text-3xl">{featured.title}</h2>
                <p className="line-clamp-3 leading-7 text-store-text-muted">{featured.briefText}</p>
                <span className="flex items-center gap-1 text-xs text-store-text-faint"><Clock className="size-3.5" />{toPersianNumbers(featured.readingTime)} دقیقه مطالعه</span>
              </div>
            </Link>
          )}

          {/* case files rail */}
          {series.length > 0 && (
            <section className="mt-12">
              <SectionHead title="پرونده‌ها" href="/blog/case-files" icon={<Layers className="size-5" />} />
              <div className="grid gap-4 md:grid-cols-3">
                {series.map((s) => (
                  <Link key={s.slug} href={`/blog/case-files/${s.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-store-border bg-store-surface shadow-store-xs">
                    <div className="relative aspect-[16/9]">
                      {s.coverImage ? (
                        <Image src={s.coverImage} alt={s.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-store-secondary-soft text-store-secondary">پرونده</div>
                      )}
                      <span className="absolute end-3 top-3 rounded-full bg-[#7a5538] px-2.5 py-1 text-[11px] font-bold text-white">پرونده</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading font-bold text-store-text transition-colors group-hover:text-store-primary">{s.title}</h3>
                      {s.subtitle && <p className="mt-1 line-clamp-2 text-sm text-store-text-muted">{s.subtitle}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* per-type sections */}
          {SECTION_TYPES.map((t) => {
            const items = byType(t);
            if (items.length === 0) return null;
            return (
              <section key={t} className="mt-12">
                <SectionHead title={ARTICLE_TYPES[t].label} href={`/blog?type=${t}`} accent={ARTICLE_TYPES[t].accent} />
                <div className="grid gap-6 md:grid-cols-3">
                  {items.map((p) => (
                    <ArticleCard key={p.id} article={p} />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </main>
  );
}

function BlogNav({
  categories,
  q = "",
  activeCat = "",
  activeType = "",
}: {
  categories: { slug: string; title: string }[];
  q?: string;
  activeCat?: string;
  activeType?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <form action="/blog" className="relative flex-1 md:max-w-xs">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="جستجوی مقاله…"
          aria-label="جستجوی مقاله"
          className="w-full rounded-xl border border-store-border bg-store-surface py-2.5 ps-4 pe-10 text-sm text-store-text outline-none transition-colors focus:border-store-primary"
        />
        <button type="submit" className="absolute end-3 top-1/2 -translate-y-1/2 text-store-text-faint transition-colors hover:text-store-primary" aria-label="جستجو">
          <Search className="size-4" />
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        <Link href="/blog" aria-current={!activeCat && !activeType ? "true" : undefined} className={`store-chip ${!activeCat && !activeType ? "is-on" : ""}`}>همه</Link>
        <Link href="/blog/case-files" className="store-chip">پرونده‌ها</Link>
        {categories.map((c) => (
          <Link key={c.slug} href={`/blog/category/${c.slug}`} aria-current={activeCat === c.slug ? "true" : undefined} className={`store-chip ${activeCat === c.slug ? "is-on" : ""}`}>
            {c.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SectionHead({ title, href, icon, accent }: { title: string; href: string; icon?: React.ReactNode; accent?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-store-text">
        {icon && <span style={accent ? { color: accent } : { color: "var(--color-store-primary)" }}>{icon}</span>}
        <span style={accent ? { borderInlineStart: `3px solid ${accent}`, paddingInlineStart: "0.5rem" } : undefined}>{title}</span>
      </h2>
      <Link href={href} className="flex items-center gap-1 text-sm text-store-primary hover:underline">
        همه <ChevronLeft className="size-4" />
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-store-border bg-store-surface p-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-store-primary-soft text-store-primary-hover">
        <Newspaper className="size-7" aria-hidden />
      </span>
      <h2 className="font-heading text-lg font-bold text-store-text">مقاله‌ای یافت نشد</h2>
    </div>
  );
}
