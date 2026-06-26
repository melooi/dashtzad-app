import { requireAdmin } from "@/lib/auth/guards";
import { getHomepage, loadFieldContext } from "@/lib/admin/global-service";
import type { HomepageBlock } from "@/lib/admin/globals";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { HomepageBuilder } from "@/components/admin/globals/HomepageBuilder";

export const dynamic = "force-dynamic";

export default async function HomepageGlobalPage() {
  await requireAdmin();
  const [homepage, ctx] = await Promise.all([
    getHomepage(),
    loadFieldContext({ products: true, categories: true, faqGroups: true }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="صفحه خانه"
        description="بلوک‌های صفحه‌ی اصلی را بسازید، مرتب و فعال/غیرفعال کنید."
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "صفحه خانه" }]}
      />
      <HomepageBuilder initialBlocks={homepage.blocks as HomepageBlock[]} ctx={ctx} />
    </div>
  );
}
