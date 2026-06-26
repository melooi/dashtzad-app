import { requireAdmin } from "@/lib/auth/guards";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { ArticleForm } from "@/components/admin/content/ArticleForm";
import { emptyArticleForm } from "@/lib/admin/articles";
import { articleTypeLabel } from "@/lib/admin/article-types";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  await requireAdmin();
  const me = await getCurrentUser();

  const [categories, authors, series, products, posts] = await Promise.all([
    prisma.category.findMany({ where: { type: "POST" }, orderBy: { title: "asc" } }),
    prisma.user.findMany({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" }, select: { id: true, name: true, phoneNumber: true } }),
    prisma.contentSeries.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, title: true } }),
    prisma.product.findMany({ where: { isActive: true }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, title: true } }),
    prisma.post.findMany({ orderBy: { createdAt: "desc" }, take: 200, select: { id: true, title: true, articleType: true } }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="مقاله‌ی جدید"
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "مقاله‌های مجله", href: "/admin/content/articles" },
          { label: "جدید" },
        ]}
      />
      <ArticleForm
        mode="create"
        defaultValues={{ ...emptyArticleForm, authorId: me?.id ?? "" }}
        categories={categories.map((c) => ({ value: c.id, label: c.title }))}
        authors={authors.map((a) => ({ value: a.id, label: a.name ?? a.phoneNumber }))}
        series={series.map((s) => ({ value: s.id, label: s.title }))}
        products={products.map((p) => ({ value: p.id, label: p.title }))}
        posts={posts.map((p) => ({ value: p.id, label: p.title, hint: articleTypeLabel(p.articleType) }))}
      />
    </div>
  );
}
