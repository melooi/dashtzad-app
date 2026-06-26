import Link from "next/link";
import {
  Settings,
  Building2,
  Phone,
  Palette,
  Share2,
  SlidersHorizontal,
  Headset,
  ChevronLeft,
  Bot,
  Activity,
  Plug,
  type LucideIcon,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getChatSettings } from "@/lib/admin/global-service";
import { isAiConfigured, providerForModel } from "@/lib/chat/ai";
import { getIntegrationStatuses, type IntegrationState } from "@/lib/admin/integrations";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";

const INTEGRATION_CHIP: Record<IntegrationState, { label: string; cls: string }> = {
  connected: { label: "متصل", cls: "bg-dz-success/15 text-dz-success dark:text-dz-success-300" },
  "not-configured": { label: "تنظیم نشده", cls: "bg-dz-primary-100 text-dz-primary-500 dark:bg-white/5 dark:text-dz-night-muted" },
  pending: { label: "در دست توسعه", cls: "bg-dz-warning/15 text-dz-warning dark:text-dz-warning-300" },
};

export const dynamic = "force-dynamic";

type SettingLink = { label: string; description: string; href: string; icon: LucideIcon };
type SettingGroup = { title: string; items: SettingLink[] };

const GROUPS: SettingGroup[] = [
  {
    title: "کسب‌وکار و برند",
    items: [
      { label: "تنظیمات سایت", description: "نام سایت، زبان و گزینه‌های عمومی.", href: "/admin/globals/site", icon: Settings },
      { label: "اطلاعات کسب‌وکار", description: "نام برند، نشانی و مشخصات حقوقی.", href: "/admin/globals/business", icon: Building2 },
      { label: "اطلاعات تماس", description: "تلفن، ایمیل و راه‌های ارتباطی.", href: "/admin/globals/contact", icon: Phone },
      { label: "تنظیمات برند", description: "لوگو، رنگ‌ها و هویت بصری.", href: "/admin/globals/brand", icon: Palette },
      { label: "شبکه‌های اجتماعی", description: "لینک‌های اینستاگرام، تلگرام و دیگر شبکه‌ها.", href: "/admin/globals/social", icon: Share2 },
    ],
  },
  {
    title: "سئو و گفت‌وگو",
    items: [
      { label: "پیش‌فرض‌های سئو", description: "عنوان، توضیحات و داده‌های ساختاریافته‌ی پیش‌فرض.", href: "/admin/seo/settings", icon: SlidersHorizontal },
      { label: "تنظیمات چت و پشتیبانی", description: "ورودی‌ها، پیام خوش‌آمد و دستیار هوش مصنوعی.", href: "/admin/chat/settings", icon: Headset },
    ],
  },
  {
    title: "سیستم",
    items: [
      { label: "فعالیت‌ها", description: "گزارش رویدادهای پنل مدیریت.", href: "/admin/activity", icon: Activity },
    ],
  },
];

function SettingCard({ item }: { item: SettingLink }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="focus-ring rounded-2xl">
      <div className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-dz-primary-100 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-card dark:border-dz-night-border dark:bg-dz-night-card">
        <span className="absolute inset-y-0 start-0 w-1 bg-dz-primary-100 transition-colors group-hover:bg-dz-primary-400 dark:bg-dz-night-border dark:group-hover:bg-dz-primary-500" />
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-dz-primary-50 text-dz-primary-600 transition-colors group-hover:bg-dz-primary-100 dark:bg-dz-primary-400/10 dark:text-dz-primary-300 dark:group-hover:bg-dz-primary-400/20">
          <Icon className="size-6" />
        </div>
        <div className="min-w-0">
          <div className="font-heading text-base font-bold text-dz-primary-800 dark:text-dz-night-fg">{item.label}</div>
          <div className="mt-0.5 truncate text-sm text-dz-primary-500 dark:text-dz-night-muted">{item.description}</div>
        </div>
        <ChevronLeft className="ms-auto size-5 shrink-0 text-dz-primary-300 transition-transform group-hover:-translate-x-0.5 dark:text-dz-night-muted" />
      </div>
    </Link>
  );
}

export default async function SettingsPage() {
  await requireAdmin();
  const chat = await getChatSettings();
  const provider = providerForModel(chat.aiModel);
  const providerKeyName =
    provider === "openai" ? "OPENAI_API_KEY" : provider === "google" ? "GOOGLE_API_KEY" : "ANTHROPIC_API_KEY";
  const aiKey = isAiConfigured(provider);
  const aiConnected = aiKey && chat.aiCopilotEnabled;
  const integrations = getIntegrationStatuses();
  const aiStatus = !aiKey
    ? { tone: "muted", text: `متصل نیست — کلید ${providerKeyName} برای مدل ${chat.aiModel} تنظیم نشده است.` }
    : !chat.aiCopilotEnabled
      ? { tone: "warn", text: "کلید موجود است، اما دستیار در تنظیمات چت خاموش است." }
      : { tone: "ok", text: `متصل و فعال — مدل ${chat.aiModel}.` };

  return (
    <div>
      <AdminPageHeader
        title="تنظیمات سیستم"
        description="میان‌برهای تنظیمات سراسری کسب‌وکار، سئو، گفت‌وگو و سیستم."
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: "تنظیمات سیستم" }]}
      />

      {/* AI copilot status — read-only; reflects real backend wiring. */}
      <div className="mb-8 flex items-center gap-4 rounded-2xl border border-dz-primary-100 bg-white p-5 shadow-xs dark:border-dz-night-border dark:bg-dz-night-card">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-dz-primary-50 text-dz-primary-600 dark:bg-dz-primary-400/10 dark:text-dz-primary-300">
          <Bot className="size-6" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-heading text-base font-bold text-dz-primary-800 dark:text-dz-night-fg">دستیار هوش مصنوعی پشتیبانی</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                aiConnected
                  ? "bg-dz-success/15 text-dz-success dark:text-dz-success-300"
                  : aiStatus.tone === "warn"
                    ? "bg-dz-warning/15 text-dz-warning dark:text-dz-warning-300"
                    : "bg-dz-primary-100 text-dz-primary-500 dark:bg-white/5 dark:text-dz-night-muted"
              }`}
            >
              {aiConnected ? "فعال" : aiStatus.tone === "warn" ? "غیرفعال" : "متصل نیست"}
            </span>
          </div>
          <p className="mt-1 text-sm text-dz-primary-500 dark:text-dz-night-muted">{aiStatus.text}</p>
        </div>
        <Link
          href="/admin/chat/settings"
          className="focus-ring ms-auto shrink-0 rounded-xl border border-dz-primary-200 px-4 py-2 text-sm font-medium text-dz-primary-700 transition-colors hover:bg-dz-primary-50 dark:border-dz-night-border dark:text-dz-night-fg dark:hover:bg-white/5"
        >
          تنظیمات چت
        </Link>
      </div>

      <div className="flex flex-col gap-8">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 font-heading text-sm font-bold text-dz-primary-600 dark:text-dz-night-muted">{group.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.items.map((item) => (
                <SettingCard key={item.href} item={item} />
              ))}
            </div>
          </section>
        ))}

        {/* Integration status — read-only; reflects env presence only, never keys. */}
        <section>
          <h2 className="mb-1 flex items-center gap-2 font-heading text-sm font-bold text-dz-primary-600 dark:text-dz-night-muted">
            <Plug className="size-4" /> وضعیت اتصال‌ها
          </h2>
          <p className="mb-3 text-xs text-dz-primary-400 dark:text-dz-night-faint">
            فقط وضعیت پیکربندی (روی سرور) نمایش داده می‌شود؛ هیچ کلید یا مقدار محرمانه‌ای نشان داده نمی‌شود.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {integrations.map((it) => {
              const chip = INTEGRATION_CHIP[it.state];
              return (
                <div
                  key={it.key}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-dz-primary-100 bg-white p-4 shadow-xs dark:border-dz-night-border dark:bg-dz-night-card"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-dz-primary-800 dark:text-dz-night-fg">{it.label}</span>
                      <span className="rounded-full bg-dz-primary-50 px-1.5 py-0.5 text-[10px] text-dz-primary-400 dark:bg-white/5 dark:text-dz-night-faint">{it.group}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-dz-primary-500 dark:text-dz-night-muted">{it.note}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${chip.cls}`}>{chip.label}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
