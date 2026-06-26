import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers, ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/storefront/ArticleCard";
import { RichTextRenderer } from "@/components/storefront/RichTextRenderer";
import { StructuredData } from "@/components/StructuredData";
import { itemListSchema, breadcrumbSchema } from "@/lib/jsonld";
import { buildEntityMetadata } from "@/lib/seo/meta";
import { getEntitySchemaOverride } from "@/lib/seo/schema-override";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const series = await prisma.contentSeries.findFirst({ where: { slug, status: "PUBLISHED" }, select: { id: true, title: true, summary: true, subtitle: true, coverImage: true } });
  if (!series) return { title: "پرونده یافت نشد", robots: { index: false, follow: true } };
  return buildEntityMetadata("SERIES", series.id, {
    title: `${series.title} | مجله دشت‌زاد`,
    description: series.summary ?? series.subtitle ?? `پرونده‌ی «${series.title}» در مجله دشت‌زاد.`,
    path: `/blog/case-files/${slug}`,
    image: series.coverImage || undefined,
  });
}

export default async function CaseFileDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const series = await prisma.contentSeries.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: [{ seriesOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, slug: true, title: true, briefText: true, coverImage: true, readingTime: true, articleType: true },
      },
    },
  });
  if (!series) notFound();

  // Optional admin-authored extra JSON-LD for this case file (validated + safe).
  const schemaOverride = await getEntitySchemaOverride("SERIES", series.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-store-text">
      <StructuredData
        data={[
          breadcrumbSchema([
            { name: "خانه", url: "/" },
            { name: "مجله دشت‌زاد", url: "/blog" },
            { name: "پرونده‌ها", url: "/blog/case-files" },
            { name: series.title, url: `/blog/case-files/${series.slug}` },
          ]),
          itemListSchema(series.title, series.posts.map((p) => ({ name: p.title, url: `/blog/${p.slug}` }))),
          ...schemaOverride,
        ]}
      />

      <nav aria-label="مسیر" className="mb-5 flex items-center gap-1 text-xs text-store-text-faint">
        <Link href="/blog" className="hover:text-store-primary">مجله دشت‌زاد</Link>
        <ChevronLeft className="size-3" />
        <Link href="/blog/case-files" className="hover:text-store-primary">پرونده‌ها</Link>
      </nav>

      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7a5538] px-3 py-1 text-xs font-bold text-white">
        <Layers className="size-3.5" /> پرونده
      </span>
      <h1 className="mt-3 font-heading text-3xl font-bold leading-tight text-store-text md:text-4xl">{series.title}</h1>
      {series.subtitle && <p className="mt-2 text-lg text-store-text-muted">{series.subtitle}</p>}

      {series.coverImage && (
        <div className="relative mt-6 aspect-[21/9] overflow-hidden rounded-2xl bg-store-surface-soft">
          <Image src={series.coverImage} alt={series.title} fill sizes="(max-width: 768px) 100vw, 896px" className="object-cover" priority />
        </div>
      )}

      {series.summary && <p className="mt-6 rounded-xl bg-store-surface-soft p-4 leading-8 text-store-text-muted">{series.summary}</p>}

      {series.intro && (
        <div className="mt-6 leading-9">
          <RichTextRenderer value={series.intro} />
        </div>
      )}

      {series.keyTopics.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {series.keyTopics.map((t) => (
            <span key={t} className="rounded-full bg-store-surface-soft px-3 py-1 text-xs text-store-text-muted">{t}</span>
          ))}
        </div>
      )}

      <section className="mt-12">
        <h2 className="mb-4 font-heading text-xl font-bold text-store-text">مقاله‌های این پرونده</h2>
        {series.posts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-store-border bg-store-surface p-8 text-center text-sm text-store-text-faint">
            مقاله‌های این پرونده به‌زودی منتشر می‌شوند.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {series.posts.map((p) => (
              <ArticleCard key={p.id} article={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
