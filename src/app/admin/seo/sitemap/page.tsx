import { getSeoOverview } from "@/lib/admin/seo-overview";
import { getBaseUrl } from "@/lib/seo/urls";
import { SeoSection, SeoRow, SeoNote, SeoStatCard } from "@/components/admin/seo/SeoUi";
import { SeoCopyButton } from "@/components/admin/seo/SeoCopyButton";
import { FileText, Package, FolderTree, PenSquare } from "lucide-react";

export const dynamic = "force-dynamic";

const EXCLUDED = ["/admin", "/api", "/auth", "/account", "/orders", "/cart", "/checkout"];

export default async function SeoSitemapPage() {
  const o = await getSeoOverview();
  const base = getBaseUrl(o.canonicalBase);
  const url = `${base}/sitemap.xml`;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SeoStatCard label="کل آدرس‌ها" value={o.sitemap.total} icon={FileText} level="good" />
        <SeoStatCard label="محصولات" value={o.sitemap.products} icon={Package} level="neutral" />
        <SeoStatCard label="دسته‌ها" value={o.sitemap.categories} icon={FolderTree} level="neutral" />
        <SeoStatCard label="نوشته‌ها" value={o.sitemap.posts} icon={PenSquare} level="neutral" />
      </div>

      <SeoSection title="آدرس سایت‌مپ" action={<SeoCopyButton value={url} openHref="/sitemap.xml" />}>
        <SeoRow label="URL" value={url} mono />
        <SeoRow label="نوع تولید" value="پویا (force-dynamic) از دیتابیس" />
        <SeoRow label="صفحات استاتیک" value={`${o.sitemap.staticPages} صفحه (خانه، محصولات، بلاگ، درباره، تماس، قوانین)`} />
        <SeoRow label="سایت‌مپ تصاویر" value={o.sitemap.hasImages ? "فعال (تا ۵ تصویر برای هر محصول)" : "تصویری ثبت نشده"} />
        <SeoRow label="دسته‌ها" value="با مسیر ?cat= (مسیر اختصاصی دسته هنوز فعال نیست)" />
      </SeoSection>

      <SeoSection title="مسیرهای حذف‌شده" description="این مسیرها هرگز در سایت‌مپ قرار نمی‌گیرند.">
        <div className="flex flex-wrap gap-2">
          {EXCLUDED.map((p) => (
            <span key={p} dir="ltr" className="rounded-lg border border-dz-a-primary-100 dark:border-dz-a-night-border bg-dz-a-primary-50/50 dark:bg-white/5 px-2.5 py-1 font-mono text-xs text-dz-a-primary-600 dark:text-dz-a-primary-300">
              {p}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">همچنین: محصولات/دسته‌های غیرفعال و نوشته‌های پیش‌نویس حذف می‌شوند.</p>
      </SeoSection>

      <SeoNote>
        برای کاتالوگِ بزرگ‌تر در آینده، می‌توان از sitemapهای تقسیم‌شده (generateSitemaps) استفاده کرد؛ فعلاً نیازی نیست.
        وضعیت ارسال به گوگل واقعی نیست و پس از دیپلوی در Search Console انجام می‌شود.
      </SeoNote>
    </div>
  );
}
