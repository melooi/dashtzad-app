import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { emptyCategoryForm } from "@/lib/admin/categories";
import { categoriesCollection } from "@/lib/admin/collections";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const typeDefault = sp.type === "POST" ? "POST" : "PRODUCT";

  const allCategories = await prisma.category.findMany({
    where: { deletedAt: null },
    select: { id: true, title: true, type: true, parentId: true },
    orderBy: { title: "asc" },
  });

  const backHref =
    typeDefault === "POST"
      ? "/admin/collections/categories?type=POST"
      : "/admin/collections/categories?type=PRODUCT";

  return (
    <div>
      <AdminPageHeader
        title={typeDefault === "POST" ? "افزودن دسته‌بندی مقالات" : "افزودن دسته‌بندی محصولات"}
        description="یک دسته‌ی جدید بسازید."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: categoriesCollection.label, href: backHref },
          { label: "افزودن" },
        ]}
      />
      <CategoryForm
        mode="create"
        defaultValues={{ ...emptyCategoryForm, type: typeDefault }}
        allCategories={allCategories}
      />
    </div>
  );
}
