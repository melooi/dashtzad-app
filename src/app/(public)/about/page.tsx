import { BadgeCheck, Leaf, MapPin, ShieldCheck, Sprout } from "lucide-react";
import { StoreTrustCard } from "@/components/storefront/StoreTrustCard";
import { StorePageHero } from "@/components/storefront/StorePageHero";
import { getBusinessInfo } from "@/lib/admin/global-service";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "درباره‌ی دشت‌زاد",
  description: "دشت‌زاد از سال ۱۳۱۳ — مواد غذایی پرمیومِ ایرانی با تکیه بر اصالت و کیفیت.",
  url: "/about",
});

export default async function AboutPage() {
  const business = await getBusinessInfo();
  const year = business.foundedYear?.trim() || "۱۳۱۳";
  const intro =
    business.aboutShortText?.trim() ||
    "دشت‌زاد عرضه‌کننده‌ی مواد غذایی پرمیومِ ایرانی است؛ از زعفران و آجیل تا حبوبات و ادویه — با همان وسواسِ کیفیت و اصالتی که از روزِ نخست داشته‌ایم.";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 text-store-text md:py-10">
      <StorePageHero
        eyebrow={`میراثِ دشت‌زاد · از ${year}`}
        eyebrowIcon={<Sprout className="size-4" aria-hidden />}
        title="درباره‌ی دشت‌زاد"
        subtitle={intro}
        align="center"
      />

      {/* Story */}
      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="h-7 w-1.5 rounded-full bg-store-primary" aria-hidden />
          <h2 className="font-heading text-xl font-bold text-store-text">داستان ما</h2>
        </div>
        <div className="space-y-4 leading-8 text-store-text-muted">
          <p>
            نام «دشت‌زاد» از دل دشت می‌آید؛ جایی که خاک، آفتاب و دستِ کشاورزِ ایرانی، بهترین زعفران،
            آجیل، حبوبات و ادویه را به بار می‌نشاند. ما این محصولات را با دقت انتخاب، بسته‌بندی و به
            سفره‌ی شما می‌رسانیم.
          </p>
          <p>
            باور ما ساده است: کیفیت بدونِ شعار. هر بسته‌ی دشت‌زاد باید همان حسِ اصالت و اعتمادی را
            منتقل کند که از سالِ {year} پایه‌ی کارِ ما بوده است.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="h-7 w-1.5 rounded-full bg-store-primary" aria-hidden />
          <h2 className="font-heading text-xl font-bold text-store-text">ارزش‌های ما</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StoreTrustCard icon={<BadgeCheck className="size-5" />} title="اصالت" text="انتخابِ مستقیم از منبع، بدون واسطه‌ی غیرضروری." />
          <StoreTrustCard icon={<Leaf className="size-5" />} title="کیفیت" text="استانداردِ ثابت در هر بسته، فصل به فصل." />
          <StoreTrustCard icon={<ShieldCheck className="size-5" />} title="اعتماد" text="شفافیت در محصول و همراهی پس از خرید." />
          <StoreTrustCard icon={<MapPin className="size-5" />} title="ایرانی" text="حمایت از تولیدِ اصیلِ ایرانی." />
        </div>
      </section>

      {/* Heritage callout */}
      <section className="mt-10 overflow-hidden rounded-3xl bg-store-primary px-6 py-9 text-center text-white md:px-12">
        <p className="font-heading text-sm text-store-primary-soft">میراثِ ما</p>
        <p className="mt-2 font-heading text-4xl font-bold">{year}</p>
        <p className="mx-auto mt-3 max-w-xl leading-8 text-store-primary-soft">
          سالی که دشت‌زاد کارش را آغاز کرد و تا امروز همان مسیرِ اصالت و کیفیت را ادامه داده است.
        </p>
      </section>
    </main>
  );
}
