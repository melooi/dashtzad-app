import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { TagsManager } from "@/components/admin/content/TagsManager";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  await requireAdmin();

  // Aggregate all tags with post count
  const rows = await prisma.post.findMany({
    where: { tags: { isEmpty: false }, deletedAt: null },
    select: { id: true, tags: true },
  });

  const countMap = new Map<string, number>();
  for (const r of rows) {
    for (const t of r.tags) {
      countMap.set(t, (countMap.get(t) ?? 0) + 1);
    }
  }

  const tagList = Array.from(countMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fa"));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="برچسب‌ها"
        description="مدیریت برچسب‌های محتوا — تغییر نام یا حذف تمام مقالات مرتبط را به‌روز می‌کند."
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "نوشته‌ها", href: "/admin/content/articles" },
          { label: "برچسب‌ها" },
        ]}
      />
      <TagsManager initialTags={tagList} />
    </div>
  );
}
