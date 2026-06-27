import { requireAdmin } from "@/lib/auth/guards";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { ArticleForm } from "@/components/admin/content/ArticleForm";
import { emptyArticleForm } from "@/lib/admin/articles";
import { ARTICLE_TYPE_KEYS, articleTypeLabel } from "@/lib/admin/article-types";

export const dynamic = "force-dynamic";

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const me = await getCurrentUser();
  const sp = await searchParams;
  const typeParam = ARTICLE_TYPE_KEYS.includes(sp.type as (typeof ARTICLE_TYPE_KEYS)[number])
    ? (sp.type as (typeof ARTICLE_TYPE_KEYS)[number])
    : undefined;

  const [categories, series, products, posts] = await Promise.all([
    prisma.category.findMany({ where: { type: "POST", deletedAt: null }, orderBy: { title: "asc" } }),
    prisma.contentSeries.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { id: true, title: true } }),
    prisma.product.findMany({ where: { isActive: true, deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, title: true } }),
    prisma.post.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 200, select: { id: true, title: true, articleType: true } }),
  ]);

  const title =
    typeParam === "RECIPE"
      ? "دستور پخت جدید"
      : typeParam === "CASE_FILE"
        ? "پرونده‌ی جدید"
        : "نوشته‌ی جدید";

  return (
    <div>
      <AdminPageHeader
        title={title}
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "نوشته‌ها", href: "/admin/content/articles" },
          { label: "جدید" },
        ]}
      />
      <ArticleForm
        mode="create"
        defaultValues={{
          ...emptyArticleForm,
          authorId: me?.id ?? "",
          ...(typeParam ? { articleType: typeParam } : {}),
        }}
        categories={categories.map((c) => ({ value: c.id, label: c.title }))}
        series={series.map((s) => ({ value: s.id, label: s.title }))}
        products={products.map((p) => ({ value: p.id, label: p.title }))}
        posts={posts.map((p) => ({ value: p.id, label: p.title, hint: articleTypeLabel(p.articleType) }))}
      />
    </div>
  );
}
