import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { CategoryFormInput } from "@/lib/admin/categories";
import { categoriesCollection } from "@/lib/admin/collections";
import { getSeoMetaForForm } from "@/lib/admin/seo-service";
import { getSeoDefaults } from "@/lib/admin/global-service";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { SeoPanel } from "@/components/admin/seo/SeoPanel";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const cat = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { children: true, products: true, posts: true } } },
  });
  if (!cat) notFound();

  const [allCategories, seoMeta, seoDefaults] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, title: true, type: true, parentId: true },
      orderBy: { title: "asc" },
    }),
    getSeoMetaForForm("CATEGORY", id),
    getSeoDefaults(),
  ]);

  const defaultValues: CategoryFormInput = {
    title: cat.title,
    slug: cat.slug,
    type: cat.type,
    parentId: cat.parentId ?? "",
    englishTitle: cat.englishTitle ?? "",
    description: cat.description ?? "",
  };

  return (
    <div>
      <AdminPageHeader
        title={cat.title}
        description="ویرایش دسته‌بندی"
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: categoriesCollection.label, href: categoriesCollection.route },
          { label: cat.title },
        ]}
      />
      <CategoryForm
        mode="edit"
        categoryId={cat.id}
        defaultValues={defaultValues}
        allCategories={allCategories}
        dependency={{
          children: cat._count.children,
          products: cat._count.products,
          posts: cat._count.posts,
        }}
      />

      <div className="mx-auto mt-5 max-w-3xl">
        <SeoPanel
          entityType="CATEGORY"
          entityId={cat.id}
          initial={seoMeta}
          autoSource={{
            title: cat.title,
            description: cat.description ?? "",
            // No dedicated category route yet — canonical uses the ?cat= view.
            path: `/products?cat=${cat.slug}`,
            image: null,
          }}
          defaults={{
            titleTemplate: seoDefaults.categoryTitleTemplate || seoDefaults.titleTemplate,
            canonicalBase: seoDefaults.canonicalBase,
            defaultOgImageUrl: seoDefaults.defaultOgImageUrl,
          }}
        />
      </div>
    </div>
  );
}
