import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { MenuFormInput } from "@/lib/admin/site-experience";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { MenuForm } from "@/components/admin/site/MenuForm";
import { MenuItemsManager, type MenuItemRow } from "@/components/admin/site/MenuItemsManager";

export const dynamic = "force-dynamic";

export default async function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const menu = await prisma.menu.findUnique({
    where: { id },
    include: { items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
  });
  if (!menu) notFound();

  const defaultValues: MenuFormInput = {
    title: menu.title,
    slug: menu.slug,
    location: menu.location,
    isActive: menu.isActive,
    sortOrder: menu.sortOrder,
  };

  const items: MenuItemRow[] = menu.items.map((it) => ({
    id: it.id,
    parentId: it.parentId,
    label: it.label,
    href: it.href,
    linkType: it.linkType,
    target: it.target,
    icon: it.icon,
    badge: it.badge,
    description: it.description,
    desktopVisible: it.desktopVisible,
    mobileVisible: it.mobileVisible,
    isActive: it.isActive,
    sortOrder: it.sortOrder,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AdminPageHeader
          title={menu.title}
          description="ویرایش منو و مدیریت موارد."
          breadcrumbs={[
            { label: "پنل مدیریت", href: "/admin/dashboard" },
            { label: "منوها", href: "/admin/collections/menus" },
            { label: menu.title },
          ]}
        />
        <div className="mx-auto max-w-2xl">
          <MenuForm mode="edit" menuId={menu.id} defaultValues={defaultValues} />
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-heading text-lg font-bold text-dz-primary-800 dark:text-dz-night-fg">موارد این منو</h2>
        <MenuItemsManager menuId={menu.id} items={items} />
      </div>
    </div>
  );
}
