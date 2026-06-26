import Link from "next/link";
import Image from "next/image";
import { Layers } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StorePageHero } from "@/components/storefront/StorePageHero";
import { StructuredData } from "@/components/StructuredData";
import { itemListSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { toPersianNumbers } from "@/lib/price";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "پرونده‌های مجله دشت‌زاد",
  description: "پرونده‌های ویژه‌ی مجله دشت‌زاد؛ مجموعه‌ مقاله‌هایی که عمیق و گام‌به‌گام یک موضوع را بررسی می‌کنند.",
  url: "/blog/case-files",
});

export default async function CaseFilesPage() {
  const series = await prisma.contentSeries.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      title: true,
      subtitle: true,
      coverImage: true,
      _count: { select: { posts: { where: { status: "PUBLISHED" } } } },
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-store-text md:py-10">
      <StructuredData data={itemListSchema("پرونده‌های دشت‌زاد", series.map((s) => ({ name: s.title, url: `/blog/case-files/${s.slug}` })))} />

      <StorePageHero
        eyebrow="پرونده‌های ویژه"
        eyebrowIcon={<Layers className="size-4" aria-hidden />}
        title="پرونده‌های مجله دشت‌زاد"
        subtitle="مجموعه‌ مقاله‌هایی که عمیق و گام‌به‌گام یک موضوع را بررسی می‌کنند."
      />

      {series.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-store-border bg-store-surface p-14 text-center font-heading text-lg font-bold text-store-text">
          هنوز پرونده‌ای منتشر نشده
        </p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {series.map((s) => (
            <Link key={s.slug} href={`/blog/case-files/${s.slug}`} className="group grid overflow-hidden rounded-3xl border border-store-border bg-store-surface shadow-store-xs sm:grid-cols-2">
              <div className="relative aspect-[16/10] sm:aspect-auto">
                {s.coverImage ? (
                  <Image src={s.coverImage} alt={s.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                ) : (
                  <div className="flex h-full min-h-[140px] items-center justify-center bg-store-secondary-soft text-store-secondary">پرونده</div>
                )}
              </div>
              <div className="flex flex-col justify-center gap-2 p-5">
                <span className="self-start rounded-full bg-[#7a5538] px-2.5 py-1 text-[11px] font-bold text-white">پرونده</span>
                <h2 className="font-heading text-lg font-bold text-store-text transition-colors group-hover:text-store-primary">{s.title}</h2>
                {s.subtitle && <p className="line-clamp-2 text-sm text-store-text-muted">{s.subtitle}</p>}
                <span className="text-xs text-store-text-faint">{toPersianNumbers(s._count.posts)} مقاله</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
