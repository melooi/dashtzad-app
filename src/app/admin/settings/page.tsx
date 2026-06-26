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
import { getIntegrationStatuses } from "@/lib/admin/integrations";
import { getIntegrationConfigStatus } from "@/lib/admin/integration-config";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { IntegrationStatusList } from "@/components/admin/settings/IntegrationStatusList";
import { AdminAccentPicker } from "@/components/admin/ui/AdminAccentPicker";


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
      { label: "چت و پشتیبانی", description: "ورودی‌ها، پیام خوش‌آمد، تنظیمات پیامک و دستیار هوش مصنوعی.", href: "/admin/chat", icon: Headset },
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
      <div className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-card dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        <span className="absolute inset-y-0 start-0 w-1 bg-dz-a-primary-100 transition-colors group-hover:bg-dz-a-primary-400 dark:bg-dz-a-night-border dark:group-hover:bg-dz-a-primary-500" />
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-dz-a-primary-50 text-dz-a-primary-600 transition-colors group-hover:bg-dz-a-primary-100 dark:bg-dz-a-primary-400/10 dark:text-dz-a-primary-300 dark:group-hover:bg-dz-a-primary-400/20">
          <Icon className="size-6" />
        </div>
        <div className="min-w-0">
          <div className="font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">{item.label}</div>
          <div className="mt-0.5 truncate text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">{item.description}</div>
        </div>
        <ChevronLeft className="ms-auto size-5 shrink-0 text-dz-a-primary-300 transition-transform group-hover:-translate-x-0.5 dark:text-dz-a-night-muted" />
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
  const configStatus = await getIntegrationConfigStatus();
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

      {/* Appearance — accent palette picker */}
      <div className="mb-6 rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        <h2 className="mb-1 font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
          رنگ پنل مدیریت
        </h2>
        <p className="mb-4 text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">
          پالت رنگی پنل را انتخاب کنید. این انتخاب فقط برای مرورگر شما ذخیره می‌شود.
        </p>
        <AdminAccentPicker />
      </div>

      {/* AI copilot status — read-only; reflects real backend wiring. */}
      <div className="mb-8 flex items-center gap-4 rounded-2xl border border-dz-a-primary-100 bg-white p-5 shadow-xs dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-dz-a-primary-50 text-dz-a-primary-600 dark:bg-dz-a-primary-400/10 dark:text-dz-a-primary-300">
          <Bot className="size-6" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">دستیار هوش مصنوعی پشتیبانی</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                aiConnected
                  ? "bg-dz-a-success/15 text-dz-a-success dark:text-dz-a-success-300"
                  : aiStatus.tone === "warn"
                    ? "bg-dz-a-warning/15 text-dz-a-warning dark:text-dz-a-warning-300"
                    : "bg-dz-a-primary-100 text-dz-a-primary-500 dark:bg-white/5 dark:text-dz-a-night-muted"
              }`}
            >
              {aiConnected ? "فعال" : aiStatus.tone === "warn" ? "غیرفعال" : "متصل نیست"}
            </span>
          </div>
          <p className="mt-1 text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">{aiStatus.text}</p>
        </div>
        <Link
          href="/admin/chat/settings"
          className="focus-ring ms-auto shrink-0 rounded-xl border border-dz-a-primary-200 px-4 py-2 text-sm font-medium text-dz-a-primary-700 transition-colors hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-night-fg dark:hover:bg-white/5"
        >
          تنظیمات چت
        </Link>
      </div>

      <div className="flex flex-col gap-8">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 font-heading text-sm font-bold text-dz-a-primary-600 dark:text-dz-a-night-muted">{group.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.items.map((item) => (
                <SettingCard key={item.href} item={item} />
              ))}
            </div>
          </section>
        ))}

        {/* Integration status */}
        <section>
          <h2 className="mb-1 flex items-center gap-2 font-heading text-sm font-bold text-dz-a-primary-600 dark:text-dz-a-night-muted">
            <Plug className="size-4" /> وضعیت اتصال‌ها
          </h2>
          <p className="mb-3 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
            فقط وضعیت پیکربندی (روی سرور) نمایش داده می‌شود؛ هیچ کلید یا مقدار محرمانه‌ای نشان داده نمی‌شود.
          </p>
          <IntegrationStatusList integrations={integrations} configStatus={configStatus} />
        </section>
      </div>
    </div>
  );
}
