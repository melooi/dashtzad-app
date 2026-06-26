import { getSeoOverview } from "@/lib/admin/seo-overview";
import { getBaseUrl } from "@/lib/seo/urls";
import { SeoSection, SeoRow, SeoNote } from "@/components/admin/seo/SeoUi";
import { SeoCopyButton } from "@/components/admin/seo/SeoCopyButton";

export const dynamic = "force-dynamic";

// Mirrors app/robots.ts (keep in sync).
const DISALLOW = ["/admin", "/api", "/auth", "/account", "/orders", "/cart", "/checkout"];

export default async function SeoRobotsPage() {
  const o = await getSeoOverview();
  const base = getBaseUrl(o.canonicalBase);
  const url = `${base}/robots.txt`;

  const preview = [
    "User-agent: *",
    "Allow: /",
    ...DISALLOW.map((d) => `Disallow: ${d}`),
    "",
    `Host: ${base}`,
    `Sitemap: ${base}/sitemap.xml`,
  ].join("\n");

  return (
    <div className="flex flex-col gap-6">
      <SeoSection title="robots.txt" action={<SeoCopyButton value={url} openHref="/robots.txt" />}>
        <pre dir="ltr" className="overflow-x-auto rounded-xl border border-dz-a-primary-100 dark:border-dz-a-night-border bg-dz-a-primary-50/40 dark:bg-white/5 p-4 text-start font-mono text-xs leading-6 text-dz-a-primary-700 dark:text-dz-a-night-fg">
          {preview}
        </pre>
      </SeoSection>

      <SeoSection title="جزئیات">
        <SeoRow label="آدرس پایه (Host)" value={base} mono />
        <SeoRow label="خط Sitemap" value={`${base}/sitemap.xml`} mono />
        <SeoRow label="دسترسی عمومی" value="همه‌ی صفحات فروشگاه (Allow: /)" />
        <SeoRow label="مسیرهای مسدود" value={DISALLOW.join("، ")} mono />
      </SeoSection>

      {(o.warnings.canonicalMissing || o.warnings.canonicalNotHttps) && (
        <SeoNote tone="warn">
          {o.warnings.canonicalMissing
            ? "پایه‌ی Canonical تنظیم نشده؛ Host/Sitemap از آدرسِ پیش‌فرض ساخته می‌شوند. در پیش‌فرض‌های سئو تنظیم کنید."
            : "پایه‌ی Canonical با https شروع نمی‌شود."}
        </SeoNote>
      )}

      <SeoNote>
        robots.txt به‌صورت خودکار از تنظیمات و مسیرهای امنِ سیستم ساخته می‌شود (ویرایشگر مستقیم نداریم تا از مسدودشدنِ
        ناخواسته‌ی صفحات جلوگیری شود). همه‌ی مسیرهای خصوصی (مدیریت، سبد، حساب، سفارش، پرداخت، API، ورود) مسدودند.
      </SeoNote>
    </div>
  );
}
