import { readGlobalRaw, loadFieldContext, ctxFlagsForGlobal } from "@/lib/admin/global-service";
import { GlobalForm } from "@/components/admin/globals/GlobalForm";
import { SeoNote } from "@/components/admin/seo/SeoUi";

export const dynamic = "force-dynamic";

// Renders the existing seoDefaults global (same storage — no duplication) in
// the SEO control center. GlobalForm already shows the live Google preview.
export default async function SeoSettingsPage() {
  const [data, ctx] = await Promise.all([
    readGlobalRaw("seoDefaults"),
    loadFieldContext(ctxFlagsForGlobal("seoDefaults")),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <SeoNote>
        این تنظیمات، پیش‌فرضِ کلِ سایت‌اند؛ هر محصول/دسته/نوشته می‌تواند از پنل سئوی خودش override جداگانه داشته باشد.
      </SeoNote>
      <GlobalForm globalKey="seoDefaults" initialData={data} ctx={ctx} />
    </div>
  );
}
