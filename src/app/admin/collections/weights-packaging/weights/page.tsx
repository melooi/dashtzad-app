import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { WeightsManager } from "@/components/admin/weights-packaging/WeightsManager";

export const dynamic = "force-dynamic";

export default async function WeightsPage() {
  await requireAdmin();
  const [presets, categories] = await Promise.all([
    prisma.weightPreset.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ where: { type: "PRODUCT", deletedAt: null }, select: { id: true, title: true, parent: { select: { title: true } } }, orderBy: { title: "asc" } }),
  ]);
  const compatCategories = categories.map((c) => ({ id: c.id, title: c.title, parentTitle: c.parent?.title ?? null }));

  return (
    <div>
      <AdminPageHeader
        title="وزن‌ها"
        description="وزن‌های ازپیش‌تعریف‌شده برای ساخت مدل‌های فروش."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "وزن‌ها و بسته‌بندی‌ها", href: "/admin/collections/weights-packaging" },
          { label: "وزن‌ها" },
        ]}
      />
      <WeightsManager
        categories={compatCategories}
        presets={presets.map((p) => ({
          id: p.id,
          title: p.title,
          gramValue: p.gramValue,
          compatibility: p.compatibility,
          sortOrder: p.sortOrder,
          isActive: p.isActive,
        }))}
      />
    </div>
  );
}
