import { requireAdmin } from "@/lib/auth/guards";
import { SeoNote, SeoSection } from "@/components/admin/seo/SeoUi";
import { IndexNowClient } from "./IndexNowClient";

export const dynamic = "force-dynamic";

export default async function IndexNowPage() {
  await requireAdmin();
  const key = process.env.INDEXNOW_API_KEY ?? null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const keyUrl = key ? `${siteUrl}/indexnow-key.txt` : null;

  return (
    <div className="flex flex-col gap-6">
      <SeoNote>
        IndexNow به موتورهای جستجو (Bing، Yandex، ...) اعلام می‌کند که URL جدید یا تغییریافته دارید — بدون انتظار برای
        crawl طبیعی.
      </SeoNote>

      {key ? (
        <SeoSection title="وضعیت API Key" description="این کلید باید از آدرس زیر در دسترس موتورهای جستجو باشد">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">تنظیم‌شده</span>
            </div>
            <p dir="ltr" className="font-mono text-xs text-dz-a-primary-600 dark:text-dz-a-night-muted">
              {keyUrl}
            </p>
            <a
              href={keyUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start text-xs text-dz-a-primary-500 underline hover:text-dz-a-primary-700 dark:text-dz-a-night-faint dark:hover:text-dz-a-night-fg"
            >
              باز کردن در مرورگر ↗
            </a>
          </div>
        </SeoSection>
      ) : (
        <SeoNote tone="warn">
          <span>
            متغیر <code className="font-mono">INDEXNOW_API_KEY</code> تنظیم نشده. یه کلید تصادفی (مثلاً UUID) در{" "}
            <code className="font-mono">.env.local</code> اضافه کنید.
          </span>
        </SeoNote>
      )}

      <IndexNowClient configured={!!key} />
    </div>
  );
}
