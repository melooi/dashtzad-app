import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Circle } from "lucide-react";
import { getSeoOverview } from "@/lib/admin/seo-overview";
import { SeoSection, SeoNote } from "@/components/admin/seo/SeoUi";

export const dynamic = "force-dynamic";

type Status = "good" | "review" | "incomplete" | "manual";

function Check({ status, children }: { status: Status; children: ReactNode }) {
  const map = {
    good: { Icon: CheckCircle2, cls: "text-dz-a-success dark:text-dz-a-success-300" },
    review: { Icon: AlertTriangle, cls: "text-dz-a-warning dark:text-dz-a-warning-300" },
    incomplete: { Icon: XCircle, cls: "text-dz-a-error dark:text-dz-a-error-300" },
    manual: { Icon: Circle, cls: "text-dz-a-primary-300 dark:text-dz-a-night-faint" },
  }[status];
  const { Icon, cls } = map;
  return (
    <li className="flex items-start gap-2.5 border-b border-dz-a-primary-50 dark:border-dz-a-night-border py-2.5 text-sm text-dz-a-primary-700 dark:text-dz-a-night-fg last:border-0">
      <Icon className={`mt-0.5 size-4 shrink-0 ${cls}`} />
      <span>{children}</span>
    </li>
  );
}

export default async function SeoChecklistPage() {
  const o = await getSeoOverview();
  const d = o.seoDefaults;
  const has = (v?: string | null) => Boolean((v ?? "").trim());
  const descOk = (d.defaultDescription ?? "").length >= 70 && (d.defaultDescription ?? "").length <= 160;

  return (
    <div className="flex flex-col gap-6">
      <SeoNote>
        این چک‌لیست وضعیتِ فنیِ داخلی را نشان می‌دهد، نه وضعیتِ واقعیِ گوگل. مواردِ «دستی» باید پس از دیپلوی در ابزارهای گوگل انجام شوند.
      </SeoNote>

      <SeoSection title="۱) تنظیمات پایه">
        <ul className="flex flex-col">
          <Check status={has(d.defaultTitle) ? "good" : "incomplete"}>عنوان پیش‌فرض سایت</Check>
          <Check status={descOk ? "good" : "review"}>توضیحِ پیش‌فرض (۷۰ تا ۱۶۰ نویسه)</Check>
          <Check status={o.warnings.canonicalMissing ? "incomplete" : o.warnings.canonicalNotHttps ? "review" : "good"}>پایه‌ی Canonical (https)</Check>
          <Check status={has(d.defaultOgImageUrl) ? "good" : "review"}>تصویر OG پیش‌فرض</Check>
          <Check status={has(d.organizationName) ? "good" : "review"}>اطلاعات سازمان (نام/لوگو)</Check>
          <Check status={d.organizationSameAs.length > 0 ? "good" : "manual"}>پروفایل‌های رسمی (sameAs)</Check>
        </ul>
      </SeoSection>

      <SeoSection title="۲) محصولات">
        <ul className="flex flex-col">
          <Check status={o.productsActive > 0 ? "good" : "review"}>محصولاتِ فعال موجود است</Check>
          <Check status={o.productsNoDescription === 0 ? "good" : "review"}>همه‌ی محصولات توضیح مناسب دارند</Check>
          <Check status={o.productsNoImage === 0 ? "good" : "incomplete"}>همه‌ی محصولات تصویر دارند</Check>
          <Check status={o.variantsActive > 0 ? "good" : "manual"}>واریانت‌های فعال برای محصولات متغیر</Check>
          <Check status="good">داده‌ی ساختاریافته‌ی ProductGroup/Product</Check>
          <Check status="good">آیتم‌های فید Merchant (IRR، بدون GTIN جعلی)</Check>
          <Check status="manual">بازبینیِ قیمت و موجودیِ هر محصول</Check>
        </ul>
      </SeoSection>

      <SeoSection title="۳) دسته‌بندی‌ها">
        <ul className="flex flex-col">
          <Check status="good">slugها لاتین‌اند (سیاست قفل‌شده)</Check>
          <Check status={o.categoriesProduct > 0 ? "good" : "manual"}>دسته‌های محصول تعریف شده‌اند</Check>
          <Check status="manual">عنوان/توضیح/Canonical اختصاصی (override اختیاری)</Check>
          <Check status="review">مسیر اختصاصی دسته (/category/[slug]) هنوز فعال نیست — فعلاً ?cat=</Check>
        </ul>
      </SeoSection>

      <SeoSection title="۴) نوشته‌ها">
        <ul className="flex flex-col">
          <Check status={o.postsPublished > 0 ? "good" : "review"}>نوشته‌های منتشرشده موجود است</Check>
          <Check status="good">متادیتای Article + canonical از slug</Check>
          <Check status="good">Article JSON-LD (تاریخ انتشار/ویرایش)</Check>
          <Check status="manual">override سئوی هر نوشته (پنل نوشته هنوز نیست)</Check>
        </ul>
      </SeoSection>

      <SeoSection title="۵) فنی">
        <ul className="flex flex-col">
          <Check status="good">sitemap.xml فعال (محصولات/دسته‌ها/نوشته‌ها + تصاویر)</Check>
          <Check status="good">robots.txt با مسدودسازیِ مسیرهای خصوصی</Check>
          <Check status={o.warnings.canonicalMissing ? "review" : "good"}>Canonicalهای مطلق و تمیز</Check>
          <Check status="good">noindex برای مسیرهای خصوصی (سبد/حساب/سفارش/پرداخت/ورود)</Check>
          <Check status="manual">بازبینیِ ریدایرکت‌ها (اجرای live middleware جداگانه)</Check>
          <Check status="good">فید Merchant آماده</Check>
        </ul>
      </SeoSection>

      <SeoSection title="۶) دستی — بعد از دیپلوی">
        <ul className="flex flex-col">
          <Check status="manual">ثبت و تأیید دامنه در Google Search Console</Check>
          <Check status="manual">آزمونِ Rich Results برای محصول/نوشته/خانه</Check>
          <Check status="manual">افزودن فید در Google Merchant Center</Check>
          <Check status="manual">بررسی PageSpeed Insights</Check>
          <Check status="manual">ارسال sitemap.xml در Search Console</Check>
        </ul>
      </SeoSection>
    </div>
  );
}
