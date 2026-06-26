import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { emptyProductForm } from "@/lib/admin/products";
import { productsCollection } from "@/lib/admin/collections";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    where: { type: "PRODUCT" },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <div>
      <AdminPageHeader
        title="افزودن محصول"
        description="ابتدا اطلاعات پایه را ذخیره کنید، سپس مدل‌های فروش را تعریف کنید."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: productsCollection.label, href: productsCollection.route },
          { label: "افزودن" },
        ]}
      />
      <ProductForm mode="create" defaultValues={emptyProductForm} categories={categories} />
    </div>
  );
}
