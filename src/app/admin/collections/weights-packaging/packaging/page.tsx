import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { PackagingManager } from "@/components/admin/weights-packaging/PackagingManager";

export const dynamic = "force-dynamic";

export default async function PackagingPage() {
  await requireAdmin();
  const [options, categories] = await Promise.all([
    prisma.packagingOption.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ where: { type: "PRODUCT" }, select: { id: true, title: true, parent: { select: { title: true } } }, orderBy: { title: "asc" } }),
  ]);
  const compatCategories = categories.map((c) => ({ id: c.id, title: c.title, parentTitle: c.parent?.title ?? null }));

  return (
    <div>
      <AdminPageHeader
        title="بسته‌بندی‌ها"
        description="گزینه‌های بسته‌بندی و هزینه‌ی هرکدام (تومان)."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "وزن‌ها و بسته‌بندی‌ها", href: "/admin/collections/weights-packaging" },
          { label: "بسته‌بندی‌ها" },
        ]}
      />
      <PackagingManager
        categories={compatCategories}
        options={options.map((p) => ({
          id: p.id,
          title: p.title,
          type: p.type,
          capacityGram: p.capacityGram,
          cost_rial: p.cost_rial,
          compatibility: p.compatibility,
          sortOrder: p.sortOrder,
          isActive: p.isActive,
        }))}
      />
    </div>
  );
}
