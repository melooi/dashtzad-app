import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import type { RedirectInput } from "@/lib/admin/site-experience";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { RedirectForm } from "@/components/admin/site/RedirectForm";

export const dynamic = "force-dynamic";

export default async function EditRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const r = await prisma.redirect.findUnique({ where: { id } });
  if (!r) notFound();

  const defaultValues: RedirectInput = {
    source: r.source,
    destination: r.destination,
    statusCode: r.statusCode,
    isActive: r.isActive,
  };

  return (
    <div>
      <AdminPageHeader
        title="ویرایش ریدایرکت"
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "ریدایرکت‌ها", href: "/admin/collections/redirects" },
          { label: r.source },
        ]}
      />
      <RedirectForm mode="edit" redirectId={r.id} defaultValues={defaultValues} />
    </div>
  );
}
