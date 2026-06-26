import Link from "next/link";
import {
  FileCheck2,
  Package,
  ShoppingBag,
  ImageOff,
  AlignLeft,
  PenLine,
  FileText,
  HelpCircle,
  ArrowLeftRight,
  Map,
  Bot,
  Braces,
  SlidersHorizontal,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { getSeoOverview } from "@/lib/admin/seo-overview";
import { SeoStatCard, SeoSection, SeoNote } from "@/components/admin/seo/SeoUi";

export const dynamic = "force-dynamic";

const lvl = (bad: boolean, warn = false) => (bad ? (warn ? "review" : "incomplete") : "good");

export default async function SeoOverviewPage() {
  const o = await getSeoOverview();

  const action =
    "focus-ring inline-flex items-center gap-1.5 rounded-xl border border-dz-a-primary-200 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card px-3 py-2 text-sm text-dz-a-primary-700 dark:text-dz-a-night-fg shadow-xs transition-colors hover:border-dz-a-primary-300 dark:hover:border-dz-a-primary-500/50 hover:bg-dz-a-primary-50 dark:hover:bg-white/5";

  return (
    <div className="flex flex-col gap-6">
      <SeoNote>
        این بخش داده‌ی واقعی Google Search Console نیست؛ فقط سلامت فنی داخلیِ سایت را بررسی می‌کند. متریک‌های واقعیِ گوگل
        پس از دیپلوی و اتصال Search Console در دسترس قرار می‌گیرند.
      </SeoNote>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SeoStatCard label="صفحات ایندکس‌پذیر (sitemap)" value={o.sitemap.total} icon={FileCheck2} level="good" href="/admin/seo/sitemap" />
        <SeoStatCard label="محصولات فعال در sitemap" value={o.sitemap.products} icon={Package} level={lvl(o.productsActive === 0)} href="/admin/collections/products" />
        <SeoStatCard label="محصولات داخل فید Merchant" value={o.productsActive} icon={ShoppingBag} level="good" href="/admin/seo/merchant" />
        <SeoStatCard label="محصولات بدون تصویر" value={o.productsNoImage} icon={ImageOff} level={lvl(o.productsNoImage > 0)} hint={o.productsNoImage > 0 ? "تصویر برای سئوی تصویری و Merchant لازم است." : "همه‌ی محصولات تصویر دارند."} href="/admin/collections/products" />
        <SeoStatCard label="محصولات بدون توضیح مناسب" value={o.productsNoDescription} icon={AlignLeft} level={lvl(o.productsNoDescription > 0, true)} hint={o.productsNoDescription > 0 ? "توضیحِ کوتاه‌تر از ۵۰ نویسه." : undefined} href="/admin/collections/products" />
        <SeoStatCard label="محصولات بدون SEO override" value={o.productsNoOverride} icon={PenLine} level="neutral" hint="override اختیاری است؛ نبودش یعنی از پیش‌فرض‌ها استفاده می‌شود." href="/admin/collections/products" />
        <SeoStatCard label="نوشته‌های منتشرشده" value={o.postsPublished} icon={FileText} level={lvl(o.postsPublished === 0, true)} href="/admin/collections/posts" />
        <SeoStatCard label="گروه‌های FAQ فعال" value={o.faqGroupsActive} icon={HelpCircle} level="neutral" hint={`${o.faqItemsActive} سوالِ فعال`} href="/admin/collections/faqs" />
        <SeoStatCard label="ریدایرکت‌های فعال" value={o.redirectsActive} icon={ArrowLeftRight} level="neutral" href="/admin/collections/redirects" />
        <SeoStatCard label="وضعیت sitemap" value="فعال" icon={Map} level="good" href="/admin/seo/sitemap" />
        <SeoStatCard label="وضعیت robots.txt" value="فعال" icon={Bot} level="good" href="/admin/seo/robots" />
        <SeoStatCard label="وضعیت داده‌های ساختاریافته" value="فعال" icon={Braces} level="good" href="/admin/seo/structured-data" />
      </div>

      {(o.warnings.canonicalMissing || o.warnings.canonicalNotHttps || o.warnings.ogImageMissing || o.warnings.descriptionShort) && (
        <SeoSection title="هشدارهای پیش‌فرض سئو" description="مواردی که بهتر است در پیش‌فرض‌های سئو اصلاح شوند.">
          <ul className="flex flex-col gap-2 text-sm text-dz-a-primary-700 dark:text-dz-a-night-fg">
            {o.warnings.canonicalMissing && <Warn>پایه‌ی Canonical تنظیم نشده — canonicalها فعلاً از آدرسِ پیش‌فرض ساخته می‌شوند.</Warn>}
            {o.warnings.canonicalNotHttps && <Warn>پایه‌ی Canonical با https شروع نمی‌شود.</Warn>}
            {o.warnings.ogImageMissing && <Warn>تصویر OG پیش‌فرض تنظیم نشده.</Warn>}
            {o.warnings.descriptionShort && <Warn>توضیحِ پیش‌فرض کوتاه است (کمتر از ۷۰ نویسه).</Warn>}
          </ul>
          <div className="mt-4">
            <Link href="/admin/seo/settings" className={action}>
              <SlidersHorizontal className="size-4" /> اصلاح پیش‌فرض‌های سئو
            </Link>
          </div>
        </SeoSection>
      )}

      <SeoSection title="دسترسی سریع">
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/seo/settings" className={action}><SlidersHorizontal className="size-4 text-dz-a-primary-400 dark:text-dz-a-night-faint" /> ویرایش پیش‌فرض‌های سئو</Link>
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className={action}><Map className="size-4 text-dz-a-primary-400 dark:text-dz-a-night-faint" /> مشاهده sitemap.xml <ExternalLink className="size-3.5 text-dz-a-primary-300 dark:text-dz-a-night-faint" /></a>
          <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className={action}><Bot className="size-4 text-dz-a-primary-400 dark:text-dz-a-night-faint" /> مشاهده robots.txt <ExternalLink className="size-3.5 text-dz-a-primary-300 dark:text-dz-a-night-faint" /></a>
          <a href="/merchant/products.xml" target="_blank" rel="noopener noreferrer" className={action}><ShoppingBag className="size-4 text-dz-a-primary-400 dark:text-dz-a-night-faint" /> مشاهده فید Merchant <ExternalLink className="size-3.5 text-dz-a-primary-300 dark:text-dz-a-night-faint" /></a>
          <Link href="/admin/collections/redirects" className={action}><ArrowLeftRight className="size-4 text-dz-a-primary-400 dark:text-dz-a-night-faint" /> مدیریت ریدایرکت‌ها</Link>
          <Link href="/admin/collections/products" className={action}><Package className="size-4 text-dz-a-primary-400 dark:text-dz-a-night-faint" /> بررسی محصولات</Link>
        </div>
      </SeoSection>

      <SeoNote tone="warn">
        مسیر اختصاصی دسته‌بندی (/category/[slug]) هنوز فعال نیست؛ canonical دسته‌ها فعلاً با پارامتر <span dir="ltr" className="font-mono">?cat=</span> ساخته می‌شود.
      </SeoNote>
    </div>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-dz-a-warning dark:text-dz-a-warning-300" />
      <span>{children}</span>
    </li>
  );
}
