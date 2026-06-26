import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderTree, ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/storefront/ArticleCard";
import { StorePageHero } from "@/components/storefront/StorePageHero";
import { StructuredData } from "@/components/StructuredData";
import { itemListSchema, breadcrumbSchema } from "@/lib/jsonld";
import { buildEntityMetadata } from "@/lib/seo/meta";
import { getEntitySchemaOverride } from "@/lib/seo/schema-override";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.category.findFirst({ where: { slug, type: "POST" }, select: { id: true, title: true, description: true } });
  if (!cat) return { title: "دسته یافت نشد", robots: { index: false, follow: true } };
  return buildEntityMetadata("CATEGORY", cat.id, {
    title: `${cat.title} | مجله دشت‌زاد`,
    description: cat.description ?? `مقاله‌های دسته‌ی «${cat.title}» در مجله دشت‌زاد.`,
    path: `/blog/category/${slug}`,
  });
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findFirst({ where: { slug, type: "POST" } });
  if (!category) notFound();

  const posts = await prisma.post.findMany({
    where: { categoryId: category.id, status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, title: true, briefText: true, coverImage: true, readingTime: true, articleType: true },
  });

  // Optional admin-authored extra JSON-LD for this category (validated + safe).
  const schemaOverride = await getEntitySchemaOverride("CATEGORY", category.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-store-text md:py-10">
      <StructuredData
        data={[
          breadcrumbSchema([
            { name: "خانه", url: "/" },
            { name: "مجله دشت‌زاد", url: "/blog" },
            { name: category.title, url: `/blog/category/${category.slug}` },
          ]),
          itemListSchema(category.title, posts.map((p) => ({ name: p.title, url: `/blog/${p.slug}` }))),
          ...schemaOverride,
        ]}
      />

      <nav aria-label="مسیر" className="mb-5 flex items-center gap-1 text-xs text-store-text-faint">
        <Link href="/blog" className="hover:text-store-primary">مجله دشت‌زاد</Link>
        <ChevronLeft className="size-3" />
        <span>{category.title}</span>
      </nav>

      <StorePageHero
        eyebrow="دسته‌بندی مجله"
        eyebrowIcon={<FolderTree className="size-4" aria-hidden />}
        title={category.title}
        subtitle={category.description ?? undefined}
      />

      {posts.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-store-border bg-store-surface p-14 text-center font-heading text-lg font-bold text-store-text">
          هنوز مقاله‌ای در این دسته نیست
        </p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <ArticleCard key={p.id} article={p} />
          ))}
        </div>
      )}
    </main>
  );
}
