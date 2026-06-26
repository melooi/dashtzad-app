import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { SeoNav } from "@/components/admin/seo/SeoNav";

export const dynamic = "force-dynamic";

// All /admin/seo/* routes are ADMIN-only (guard runs in the shared layout).
export default async function SeoLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <div>
      <AdminPageHeader
        title="کنترل سئو"
        description="مرکز مدیریت سئوی دشت‌زاد — سلامت فنی، داده‌های ساختاریافته، سایت‌مپ و فید محصولات."
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "کنترل سئو" }]}
      />
      <SeoNav />
      {children}
    </div>
  );
}
