import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminViewOnSiteButton } from "@/components/admin/ui/AdminViewOnSiteButton";
import { CaseFileForm } from "@/components/admin/content/CaseFileForm";
import { SeoPanel } from "@/components/admin/seo/SeoPanel";
import { seriesToForm } from "@/lib/admin/content-series";
import { getSeoMetaForForm } from "@/lib/admin/seo-service";
import { getSeoDefaults } from "@/lib/admin/global-service";

export const dynamic = "force-dynamic";

export default async function EditCaseFilePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const series = await prisma.contentSeries.findUnique({ where: { id } });
  if (!series) notFound();

  const [seoMeta, seoDefaults] = await Promise.all([getSeoMetaForForm("SERIES", id), getSeoDefaults()]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={series.title}
        description={series.status === "PUBLISHED" ? "منتشرشده" : "پیش‌نویس"}
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "پرونده‌ها", href: "/admin/content/case-files" },
          { label: series.title },
        ]}
        actions={
          series.status === "PUBLISHED" ? (
            <AdminViewOnSiteButton href={`/blog/case-files/${series.slug}`} />
          ) : (
            <AdminViewOnSiteButton mode="preview" disabled disabledReason="این پرونده پیش‌نویس است؛ پس از انتشار در سایت قابل مشاهده می‌شود." />
          )
        }
      />

      <CaseFileForm mode="edit" caseFileId={series.id} defaultValues={seriesToForm(series)} />

      <div className="mx-auto w-full max-w-3xl">
        <SeoPanel
          entityType="SERIES"
          entityId={series.id}
          initial={seoMeta}
          autoSource={{
            title: series.title,
            description: series.summary ?? series.subtitle ?? "",
            path: `/blog/case-files/${series.slug}`,
            image: series.coverImage || null,
          }}
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
