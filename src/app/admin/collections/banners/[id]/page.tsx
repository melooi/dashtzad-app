import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { BannerFormInput } from "@/lib/admin/site-experience";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { BannerForm } from "@/components/admin/site/BannerForm";

export const dynamic = "force-dynamic";

/** Date → "YYYY-MM-DDTHH:mm" for <input type="datetime-local">. */
function toLocalInput(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 16);
}

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const b = await prisma.banner.findUnique({ where: { id } });
  if (!b) notFound();

  const defaultValues: BannerFormInput = {
    title: b.title,
    slug: b.slug,
    subtitle: b.subtitle ?? "",
    description: b.description ?? "",
    imageUrl: b.imageUrl ?? "",
    mobileImageUrl: b.mobileImageUrl ?? "",
    linkLabel: b.linkLabel ?? "",
    linkHref: b.linkHref ?? "",
    placement: b.placement,
    startsAt: toLocalInput(b.startsAt),
    endsAt: toLocalInput(b.endsAt),
    isActive: b.isActive,
    sortOrder: b.sortOrder,
  };

  return (
    <div>
      <AdminPageHeader
        title={b.title}
        description="ویرایش بنر"
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "بنرها", href: "/admin/collections/banners" },
          { label: b.title },
        ]}
      />
      <BannerForm mode="edit" bannerId={b.id} defaultValues={defaultValues} />
    </div>
  );
}
