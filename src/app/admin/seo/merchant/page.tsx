import { prisma } from "@/lib/prisma";
import { getSeoOverview } from "@/lib/admin/seo-overview";
import { getBaseUrl } from "@/lib/seo/urls";
import { SeoSection, SeoRow, SeoNote, SeoStatCard } from "@/components/admin/seo/SeoUi";
import { SeoCopyButton } from "@/components/admin/seo/SeoCopyButton";
import { toPersianNumbers } from "@/lib/price";
import { Package, Layers, ImageOff, AlignLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SeoMerchantPage() {
  const o = await getSeoOverview();
  const base = getBaseUrl(o.canonicalBase);
  const url = `${base}/merchant/products.xml`;

  // A few real sample items (active products) for context — no fabricated data.
  const samples = await prisma.product.findMany({
    where: { isActive: true },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      title: true,
      price_rial: true,
      images: { take: 1, select: { id: true } },
      _count: { select: { variants: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SeoStatCard label="محصولات فعال" value={o.productsActive} icon={Package} level="good" />
        <SeoStatCard label="واریانت‌های فعال" value={o.variantsActive} icon={Layers} level="neutral" />
        <SeoStatCard label="بدون تصویر" value={o.productsNoImage} icon={ImageOff} level={o.productsNoImage > 0 ? "incomplete" : "good"} />
        <SeoStatCard label="بدون توضیح" value={o.productsNoDescription} icon={AlignLeft} level={o.productsNoDescription > 0 ? "review" : "good"} />
      </div>

      <SeoSection title="فید Google Merchant" action={<SeoCopyButton value={url} openHref="/merchant/products.xml" />}>
        <SeoRow label="URL فید" value={url} mono />
        <SeoRow label="فرمت" value="RSS 2.0 + namespace g:" />
        <SeoRow label="واحد قیمت" value="IRR (ریال — همان مقدار ذخیره‌شده در دیتابیس)" />
        <SeoRow label="شناسه‌ها" value="g:identifier_exists = no" />
        <SeoRow label="condition" value="new" />
        <SeoRow label="واریانت‌ها" value="هر واریانتِ فعال یک آیتم با g:item_group_id" />
      </SeoSection>

      <SeoNote>
        چون فیلدِ GTIN/MPN واقعی در سیستم نداریم، برای هر آیتم <span dir="ltr" className="font-mono">identifier_exists=no</span> ارسال
        می‌شود (طبق قواعد گوگل) و هیچ شناسه‌ی جعلی تولید نمی‌شود. قیمت‌ها و موجودیِ واقعی‌اند.
      </SeoNote>

      <SeoSection title="نمونه آیتم‌های فید" description="نمونه‌ای از محصولات فعالِ واقعی که در فید قرار می‌گیرند.">
        {samples.length === 0 ? (
          <p className="text-sm text-dz-a-primary-400 dark:text-dz-a-night-faint">محصول فعالی برای فید موجود نیست.</p>
        ) : (
          <ul className="flex flex-col">
            {samples.map((p, i) => (
              <SeoRow
                key={i}
                label={p.title}
                value={
                  <span className="flex items-center gap-2 text-xs">
                    <span>{toPersianNumbers(Math.round(p.price_rial / 10))} تومان</span>
                    {p._count.variants > 0 && <span className="text-dz-a-primary-400 dark:text-dz-a-night-faint">· {toPersianNumbers(p._count.variants)} واریانت</span>}
                    {p.images.length === 0 && <span className="text-dz-a-error dark:text-dz-a-error-300">· بدون تصویر</span>}
                  </span>
                }
              />
            ))}
          </ul>
        )}
      </SeoSection>

      <SeoSection title="چک‌لیست اتصال دستی Merchant Center">
        <ul className="flex list-disc flex-col gap-1.5 ps-5 text-sm text-dz-a-primary-700 dark:text-dz-a-night-fg marker:text-dz-a-primary-300 dark:marker:text-dz-a-night-faint">
          <li>افزودن فید با URL بالا در Google Merchant Center (پس از دیپلوی و تأیید دامنه).</li>
          <li>بررسی واحد قیمت = IRR و مطابقتِ قیمت با صفحه‌ی محصول.</li>
          <li>برندهای بدون GTIN: تأیید پذیرشِ identifier_exists=no.</li>
          <li>بررسی image_link و availability برای آیتم‌های نمونه.</li>
        </ul>
      </SeoSection>

      <SeoNote>
        این فید آماده‌ی اتصالِ دستی به Merchant Center است؛ اتصالِ مستقیم/API بعد از دیپلوی و تأیید دامنه انجام می‌شود. هیچ
        اتصالِ زنده‌ای به گوگل در این مرحله وجود ندارد.
      </SeoNote>
    </div>
  );
}
