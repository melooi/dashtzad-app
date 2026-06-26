import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { FaqGroupInput } from "@/lib/admin/site-experience";
import { getSeoMetaForForm } from "@/lib/admin/seo-service";
import { getSeoDefaults } from "@/lib/admin/global-service";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { FaqGroupForm } from "@/components/admin/site/FaqGroupForm";
import { FaqItemsManager, type FaqItemRow } from "@/components/admin/site/FaqItemsManager";
import { SeoPanel } from "@/components/admin/seo/SeoPanel";
import { SeoNote } from "@/components/admin/seo/SeoUi";

export const dynamic = "force-dynamic";

export default async function EditFaqGroupPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [group, seoMeta, seoDefaults] = await Promise.all([
    prisma.fAQGroup.findUnique({
      where: { id },
      include: { items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
    }),
    getSeoMetaForForm("FAQ_GROUP", id),
    getSeoDefaults(),
  ]);
  if (!group) notFound();

  const defaultValues: FaqGroupInput = {
    title: group.title,
    slug: group.slug,
    description: group.description ?? "",
    placement: group.placement,
    isActive: group.isActive,
    sortOrder: group.sortOrder,
  };

  const items: FaqItemRow[] = group.items.map((it) => ({
    id: it.id,
    question: it.question,
    answer: it.answer,
    isActive: it.isActive,
    sortOrder: it.sortOrder,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AdminPageHeader
          title={group.title}
          description="ویرایش گروه و مدیریت سوال‌ها."
          breadcrumbs={[
            { label: "پنل مدیریت", href: "/admin/dashboard" },
            { label: "سوالات متداول", href: "/admin/collections/faqs" },
            { label: group.title },
          ]}
        />
        <div className="mx-auto max-w-2xl">
          <FaqGroupForm mode="edit" groupId={group.id} defaultValues={defaultValues} />
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-heading text-lg font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">سوال‌های این گروه</h2>
        <FaqItemsManager groupId={group.id} items={items} />
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-3">
          <SeoNote>
            FAQPage JSON-LD به‌صورت خودکار از سوال‌های <b>فعالِ</b> این گروه، هرجا که در صفحه‌ی خانه نمایش داده شود، ساخته می‌شود.
            پنل زیر برای override اختیاریِ متادیتای گروه است.
          </SeoNote>
        </div>
        <SeoPanel
          entityType="FAQ_GROUP"
          entityId={group.id}
          initial={seoMeta}
          autoSource={{ title: group.title, description: group.description ?? "", path: "/", image: null }}
          defaults={{
            titleTemplate: seoDefaults.titleTemplate,
            canonicalBase: seoDefaults.canonicalBase,
            defaultOgImageUrl: seoDefaults.defaultOgImageUrl,
          }}
        />
      </div>
    </div>
  );
}
