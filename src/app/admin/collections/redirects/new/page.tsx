import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { RedirectForm } from "@/components/admin/site/RedirectForm";
import { emptyRedirect } from "@/lib/admin/site-experience";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ source?: string }> };

export default async function NewRedirectPage({ searchParams }: Props) {
  await requireAdmin();
  const { source } = await searchParams;
  return (
    <div>
      <AdminPageHeader
        title="افزودن ریدایرکت"
        breadcrumbs={[
          { label: "پنل مدیریت", href: "/admin/dashboard" },
          { label: "ریدایرکت‌ها", href: "/admin/collections/redirects" },
          { label: "افزودن" },
        ]}
      />
      <RedirectForm
        mode="create"
        defaultValues={{ ...emptyRedirect, source: source ?? "" }}
      />
    </div>
  );
}
