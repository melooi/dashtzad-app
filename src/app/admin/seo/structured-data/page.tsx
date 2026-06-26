import { prisma } from "@/lib/prisma";
import { SeoSection, SeoNote, SeoPill, type SeoLevel } from "@/components/admin/seo/SeoUi";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

type Row = { type: string; where: string; source: string; status: SeoLevel; statusLabel: string };

const TYPES: Row[] = [
  { type: "Organization", where: "همه‌ی صفحات (layout ریشه)", source: "globalها: برند/تماس/شبکه‌های اجتماعی", status: "good", statusLabel: "فعال" },
  { type: "WebSite + SearchAction", where: "همه‌ی صفحات", source: "جستجوی /products?q=", status: "good", statusLabel: "فعال" },
  { type: "ProductGroup / Product", where: "صفحه‌ی محصول", source: "محصول + واریانت‌های فعالِ واقعی", status: "good", statusLabel: "فعال" },
  { type: "Offer", where: "داخل Product/ProductGroup", source: "قیمت ریال (IRR)، موجودیِ واقعی، NewCondition", status: "good", statusLabel: "فعال" },
  { type: "BreadcrumbList", where: "محصول و نوشته", source: "خانه › دسته › محصول/نوشته", status: "good", statusLabel: "فعال" },
  { type: "FAQPage", where: "بلوک FAQ صفحه‌ی خانه", source: "فقط سوالاتِ فعال", status: "good", statusLabel: "فعال" },
  { type: "Article", where: "صفحه‌ی نوشته", source: "عنوان/توضیح/تاریخ انتشار و ویرایش", status: "good", statusLabel: "فعال" },
  { type: "Recipe", where: "—", source: "سازنده آماده؛ مدل/مسیر دستور پخت هنوز نیست", status: "review", statusLabel: "آماده اما بدون مسیر" },
];

export default async function SeoStructuredDataPage() {
  const sample = await prisma.product.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: { slug: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <SeoSection
        title="انواع داده‌های ساختاریافته (JSON-LD)"
        description="آنچه اکنون در صفحات تولید می‌شود، منبع داده و وضعیت آن."
        action={
          sample ? (
            <a href={`/products/${sample.slug}`} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-dz-a-primary-200 dark:border-dz-a-night-border px-2.5 py-1.5 text-xs text-dz-a-primary-600 dark:text-dz-a-primary-300 transition-colors hover:bg-dz-a-primary-50 dark:hover:bg-white/5">
              <ExternalLink className="size-3.5" /> نمونه صفحه‌ی محصول
            </a>
          ) : undefined
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-dz-a-primary-100 dark:border-dz-a-night-border text-xs font-medium text-dz-a-primary-500 dark:text-dz-a-night-muted">
                <th className="px-2 py-2.5 text-start">نوع</th>
                <th className="px-2 py-2.5 text-start">محل نمایش</th>
                <th className="px-2 py-2.5 text-start">منبع داده</th>
                <th className="px-2 py-2.5 text-center">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {TYPES.map((r) => (
                <tr key={r.type} className="border-b border-dz-a-primary-50 dark:border-dz-a-night-border last:border-0">
                  <td className="px-2 py-2.5 font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">{r.type}</td>
                  <td className="px-2 py-2.5 text-dz-a-primary-600 dark:text-dz-a-primary-300">{r.where}</td>
                  <td className="px-2 py-2.5 text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">{r.source}</td>
                  <td className="px-2 py-2.5 text-center"><SeoPill level={r.status}>{r.statusLabel}</SeoPill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SeoSection>

      <SeoSection title="داده‌ی ساختاریافته‌ی محصول (سخت‌شده)">
        <ul className="flex list-disc flex-col gap-1.5 ps-5 text-sm text-dz-a-primary-700 dark:text-dz-a-night-fg marker:text-dz-a-primary-300 dark:marker:text-dz-a-night-faint">
          <li>محصولات متغیر → <b>ProductGroup</b> + hasVariant؛ محصولات تک → <b>Product</b>.</li>
          <li>هر واریانتِ فعال یک <b>Offer</b> واقعی با <span dir="ltr" className="font-mono">priceCurrency=IRR</span> و موجودیِ واقعی.</li>
          <li>واریانت‌های غیرفعال یا بدون قیمتِ معتبر حذف می‌شوند؛ <b>AggregateOffer</b> استفاده نمی‌شود.</li>
          <li>AggregateRating/Review فقط از نظراتِ <b>تأییدشده‌ی واقعی</b>؛ هیچ امتیاز/نظر جعلی.</li>
          <li>هیچ <span dir="ltr" className="font-mono">g:gtin</span>/<span dir="ltr" className="font-mono">g:mpn</span> جعلی.</li>
        </ul>
      </SeoSection>

      <SeoNote>
        Organization بدون <span dir="ltr" className="font-mono">foundingDate</span> ماشین‌خوان است؛ سال میراثِ ۱۳۱۳ فقط در
        UI نمایش داده می‌شود (جلالی است و نباید به‌عنوان تاریخِ ساختاریافته خروجی شود). فیلد <span dir="ltr" className="font-mono">schemaOverride</span> ذخیره
        می‌شود اما تا اعتبارسنجیِ سخت‌گیرانه، در خروجیِ عمومی رندر نمی‌شود.
      </SeoNote>

      <SeoNote>
        برای آزمونِ دستی: آدرسِ نمونه‌ی محصول را در Rich Results Test گوگل بررسی کنید. هیچ فراخوانیِ API خارجی از پنل انجام نمی‌شود.
      </SeoNote>
    </div>
  );
}
