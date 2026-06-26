import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { productsCollection } from "@/lib/admin/collections";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { QuickAddSheet } from "@/components/admin/products/QuickAddSheet";

export const dynamic = "force-dynamic";

export default async function QuickAddPage() {
  await requireAdmin();
  const [categories, weights, packagings] = await Promise.all([
    prisma.category.findMany({ where: { type: "PRODUCT" }, select: { id: true, title: true, parent: { select: { title: true } } }, orderBy: { title: "asc" } }),
    prisma.weightPreset.findMany({ where: { isActive: true }, select: { id: true, title: true, gramValue: true, compatibility: true }, orderBy: { sortOrder: "asc" } }),
    prisma.packagingOption.findMany({ where: { isActive: true }, select: { id: true, title: true, compatibility: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="افزودن سریع محصول"
        description="ورود سریع چند محصول به‌صورت جدولی با حرکت کیبوردی. اسلاگ و SKU خودکار ساخته می‌شوند؛ محتوای کامل را بعداً در فرم محصول کامل کنید."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: productsCollection.label, href: productsCollection.route },
          { label: "افزودن سریع" },
        ]}
      />
      <QuickAddSheet
        categories={categories.map((c) => ({ id: c.id, title: c.title, parentTitle: c.parent?.title ?? null }))}
        weights={weights}
        packagings={packagings}
      />
    </div>
  );
}
