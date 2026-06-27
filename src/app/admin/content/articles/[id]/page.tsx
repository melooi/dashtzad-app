import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminViewOnSiteButton } from "@/components/admin/ui/AdminViewOnSiteButton";
import { ArticleForm } from "@/components/admin/content/ArticleForm";
import { postToArticleForm } from "@/lib/admin/articles";
import { articleTypeLabel } from "@/lib/admin/article-types";
import { getSeoMetaForForm } from "@/lib/admin/seo-service";
import { getSeoDefaults } from "@/lib/admin/global-service";
import { stripHtmlForMeta } from "@/lib/seo/text";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  const [categories, series, products, posts, seoMeta, seoDefaults] = await Promise.all([
    prisma.category.findMany({ where: { type: "POST", deletedAt: null }, orderBy: { title: "asc" } }),
    prisma.contentSeries.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { id: true, title: true } }),
    prisma.product.findMany({ where: { isActive: true, deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, title: true } }),
    prisma.post.findMany({ where: { id: { not: id }, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 200, select: { id: true, title: true, articleType: true } }),
    getSeoMetaForForm("POST", id),
    getSeoDefaults(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={post.title}
        description={`${articleTypeLabel(post.articleType)} · ${post.status === "PUBLISHED" ? "منتشرشده" : "پیش‌نویس"}`}
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "مقاله‌های مجله", href: "/admin/content/articles" },
          { label: post.title },
        ]}
        actions={
          post.status === "PUBLISHED" ? (
            <AdminViewOnSiteButton href={`/blog/${post.slug}`} />
          ) : (
            <AdminViewOnSiteButton mode="preview" disabled disabledReason="این مقاله پیش‌نویس است؛ پس از انتشار در سایت قابل مشاهده می‌شود." />
          )
        }
      />

      <ArticleForm
        mode="edit"
        articleId={post.id}
        defaultValues={postToArticleForm(post)}
        categories={categories.map((c) => ({ value: c.id, label: c.title }))}
        series={series.map((s) => ({ value: s.id, label: s.title }))}
        products={products.map((p) => ({ value: p.id, label: p.title }))}
        posts={posts.map((p) => ({ value: p.id, label: p.title, hint: articleTypeLabel(p.articleType) }))}
        seoPanel={{
          entityId: post.id,
          initial: seoMeta,
          autoSource: {
            title: post.title,
            description: stripHtmlForMeta(post.briefText),
            path: `/blog/${post.slug}`,
            image: post.coverImage || null,
          },
          defaults: {
            titleTemplate: seoDefaults.titleTemplate,
            canonicalBase: seoDefaults.canonicalBase,
            defaultOgImageUrl: seoDefaults.defaultOgImageUrl,
          },
        }}
      />
    </div>
  );
}
