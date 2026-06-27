import { Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { formatJalali } from "@/lib/date";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { TrashRow, type TrashSectionKey } from "./TrashRow";
import { EmptyTrashButton } from "./EmptyTrashButton";

export const dynamic = "force-dynamic";

const DELETED = { not: null } as const;

const TAB_KEYS: TrashSectionKey[] = [
  "products", "posts", "categories", "banners", "coupons",
  "series", "menus", "menuItems", "faqGroups", "faqItems", "media",
];

const TAB_LABELS: Record<TrashSectionKey, string> = {
  products: "محصولات",
  posts: "نوشته‌ها",
  categories: "دسته‌بندی‌ها",
  banners: "بنرها",
  coupons: "کوپن‌ها",
  series: "پرونده‌ها",
  menus: "منوها",
  menuItems: "آیتم‌های منو",
  faqGroups: "گروه FAQ",
  faqItems: "سوالات FAQ",
  media: "رسانه",
};

export default async function TrashPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const activeTab: TrashSectionKey = TAB_KEYS.includes(sp.tab as TrashSectionKey)
    ? (sp.tab as TrashSectionKey)
    : "products";

  const [products, posts, categories, banners, coupons, series, menus, menuItems, faqGroups, faqItems, mediaAssets] =
    await Promise.all([
      prisma.product.findMany({ where: { deletedAt: DELETED }, orderBy: { deletedAt: "desc" }, select: { id: true, title: true, deletedAt: true } }),
      prisma.post.findMany({ where: { deletedAt: DELETED }, orderBy: { deletedAt: "desc" }, select: { id: true, title: true, articleType: true, deletedAt: true } }),
      prisma.category.findMany({ where: { deletedAt: DELETED }, orderBy: { deletedAt: "desc" }, select: { id: true, title: true, type: true, deletedAt: true } }),
      prisma.banner.findMany({ where: { deletedAt: DELETED }, orderBy: { deletedAt: "desc" }, select: { id: true, title: true, deletedAt: true } }),
      prisma.coupon.findMany({ where: { deletedAt: DELETED }, orderBy: { deletedAt: "desc" }, select: { id: true, code: true, title: true, deletedAt: true } }),
      prisma.contentSeries.findMany({ where: { deletedAt: DELETED }, orderBy: { deletedAt: "desc" }, select: { id: true, title: true, deletedAt: true } }),
      prisma.menu.findMany({ where: { deletedAt: DELETED }, orderBy: { deletedAt: "desc" }, select: { id: true, title: true, deletedAt: true } }),
      prisma.menuItem.findMany({ where: { deletedAt: DELETED }, orderBy: { deletedAt: "desc" }, select: { id: true, label: true, href: true, deletedAt: true } }),
      prisma.fAQGroup.findMany({ where: { deletedAt: DELETED }, orderBy: { deletedAt: "desc" }, select: { id: true, title: true, deletedAt: true } }),
      prisma.fAQItem.findMany({ where: { deletedAt: DELETED }, orderBy: { deletedAt: "desc" }, select: { id: true, question: true, deletedAt: true } }),
      prisma.mediaAsset.findMany({ where: { deletedAt: DELETED }, orderBy: { deletedAt: "desc" }, select: { id: true, originalName: true, mimeType: true, deletedAt: true } }),
    ]);

  type SectionItem = { id: string; name: string; meta?: string };
  type Section = { key: TrashSectionKey; items: SectionItem[] };

  const sections: Section[] = [
    { key: "products", items: products.map((r) => ({ id: r.id, name: r.title, meta: r.deletedAt ? formatJalali(r.deletedAt) : undefined })) },
    { key: "posts", items: posts.map((r) => ({ id: r.id, name: r.title, meta: `${r.articleType === "RECIPE" ? "دستور پخت" : "مقاله"} — ${r.deletedAt ? formatJalali(r.deletedAt) : ""}` })) },
    { key: "categories", items: categories.map((r) => ({ id: r.id, name: r.title, meta: `${r.type === "PRODUCT" ? "محصول" : "مقاله"} — ${r.deletedAt ? formatJalali(r.deletedAt) : ""}` })) },
    { key: "banners", items: banners.map((r) => ({ id: r.id, name: r.title, meta: r.deletedAt ? formatJalali(r.deletedAt) : undefined })) },
    { key: "coupons", items: coupons.map((r) => ({ id: r.id, name: r.title ?? r.code, meta: `کد: ${r.code} — ${r.deletedAt ? formatJalali(r.deletedAt) : ""}` })) },
    { key: "series", items: series.map((r) => ({ id: r.id, name: r.title, meta: r.deletedAt ? formatJalali(r.deletedAt) : undefined })) },
    { key: "menus", items: menus.map((r) => ({ id: r.id, name: r.title, meta: r.deletedAt ? formatJalali(r.deletedAt) : undefined })) },
    { key: "menuItems", items: menuItems.map((r) => ({ id: r.id, name: r.label, meta: r.href })) },
    { key: "faqGroups", items: faqGroups.map((r) => ({ id: r.id, name: r.title, meta: r.deletedAt ? formatJalali(r.deletedAt) : undefined })) },
    { key: "faqItems", items: faqItems.map((r) => ({ id: r.id, name: r.question, meta: r.deletedAt ? formatJalali(r.deletedAt) : undefined })) },
    { key: "media", items: mediaAssets.map((r) => ({ id: r.id, name: r.originalName, meta: r.mimeType })) },
  ];

  const counts = Object.fromEntries(sections.map((s) => [s.key, s.items.length])) as Record<TrashSectionKey, number>;
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const activeSection = sections.find((s) => s.key === activeTab)!;
  const visibleTabs = TAB_KEYS.filter((k) => counts[k] > 0 || k === activeTab);

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <AdminPageHeader
        title="سطل زباله"
        description={totalCount > 0 ? `${totalCount} آیتم حذف‌شده` : "سطل زباله خالی است"}
        breadcrumbs={[{ label: "ادمین", href: "/admin/dashboard" }, { label: "سطل زباله" }]}
        actions={totalCount > 0 ? <EmptyTrashButton /> : undefined}
      />

      {totalCount === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-dz-a-primary-200 dark:border-dz-a-night-border py-20 text-center">
          <Trash2 className="size-10 text-dz-a-primary-300 dark:text-dz-a-night-faint" />
          <p className="text-sm text-dz-a-primary-400 dark:text-dz-a-night-faint">هیچ آیتم حذف‌شده‌ای وجود ندارد.</p>
        </div>
      ) : (
        <>
          {/* Tab bar */}
          <div className="flex flex-wrap gap-2 border-b border-dz-a-primary-100 dark:border-dz-a-night-border pb-4">
            {visibleTabs.map((key) => {
              const isActive = key === activeTab;
              const count = counts[key];
              return (
                <a
                  key={key}
                  href={`/admin/trash?tab=${key}`}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-dz-a-primary-700 text-white dark:bg-dz-a-primary-600"
                      : "bg-dz-a-primary-50 dark:bg-dz-a-night-card text-dz-a-primary-600 dark:text-dz-a-night-muted hover:bg-dz-a-primary-100 dark:hover:bg-white/5"
                  }`}
                >
                  {TAB_LABELS[key]}
                  {count > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-dz-a-primary-200 dark:bg-dz-a-night-border text-dz-a-primary-700 dark:text-dz-a-night-fg"
                    }`}>
                      {count}
                    </span>
                  )}
                </a>
              );
            })}
          </div>

          {/* Active tab content */}
          <section>
            {activeSection.items.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dz-a-primary-100 dark:border-dz-a-night-border py-12 text-center">
                <p className="text-sm text-dz-a-primary-400 dark:text-dz-a-night-faint">
                  هیچ آیتم حذف‌شده‌ای در این بخش وجود ندارد.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeSection.items.map((item) => (
                  <TrashRow
                    key={item.id}
                    id={item.id}
                    sectionKey={activeTab}
                    name={item.name}
                    meta={item.meta}
                  />
                ))}
              </div>
            )}
          </section>

          <p className="text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
            آیتم‌های بازگردانی‌شده به وضعیت غیرفعال برمی‌گردند. حذف دائمی برگشت‌پذیر نیست.
          </p>
        </>
      )}
    </div>
  );
}
