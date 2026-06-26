import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { emptyCategoryForm } from "@/lib/admin/categories";
import { categoriesCollection } from "@/lib/admin/collections";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  await requireAdmin();

  const allCategories = await prisma.category.findMany({
    select: { id: true, title: true, type: true, parentId: true },
    orderBy: { title: "asc" },
  });

  return (
    <div>
      <AdminPageHeader
        title="افزودن دسته‌بندی"
        description="یک دسته‌ی جدید برای محصولات یا نوشته‌ها بسازید."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: categoriesCollection.label, href: categoriesCollection.route },
          { label: "افزودن" },
        ]}
      />
      <CategoryForm
        mode="create"
        defaultValues={emptyCategoryForm}
        allCategories={allCategories}
      />
    </div>
  );
}
