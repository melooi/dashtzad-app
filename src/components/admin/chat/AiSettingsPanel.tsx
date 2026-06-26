"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Headset,
  ShoppingBag,
  ChefHat,
  Loader2,
  Check,
} from "lucide-react";
import { saveAiSettingsAction } from "@/app/admin/chat/settings/ai-actions";

// ─── Model definitions ────────────────────────────────────────────────────────

type ModelBadge = "دقیق‌ترین" | "متعادل" | "سریع" | "اقتصادی" | "استدلال";
type ProviderKey = "anthropic" | "openai" | "google";

type ModelDef = {
  value: string;
  name: string;
  description: string;
  badge: ModelBadge;
  provider: ProviderKey;
};

const MODEL_DEFS: ModelDef[] = [
  // Anthropic
  { value: "claude-opus-4-8", name: "Claude Opus 4.8", description: "بهترین کیفیت برای وظایف پیچیده", badge: "دقیق‌ترین", provider: "anthropic" },
  { value: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", description: "تعادل بین کیفیت و سرعت", badge: "متعادل", provider: "anthropic" },
  { value: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", description: "پاسخ‌های فوری، ایده‌آل برای حجم بالا", badge: "سریع", provider: "anthropic" },
  // OpenAI
  { value: "gpt-4o", name: "GPT-4o", description: "قدرتمند و چندوجهی (تصویر + متن)", badge: "دقیق‌ترین", provider: "openai" },
  { value: "gpt-4o-mini", name: "GPT-4o mini", description: "سریع و مقرون‌به‌صرفه", badge: "اقتصادی", provider: "openai" },
  { value: "o3", name: "o3", description: "استدلال عمیق برای مسائل پیچیده", badge: "استدلال", provider: "openai" },
  { value: "o4-mini", name: "o4-mini", description: "استدلال سریع با هزینه‌ی پایین", badge: "استدلال", provider: "openai" },
  // Google
  { value: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "پیشرفته‌ترین مدل گوگل", badge: "دقیق‌ترین", provider: "google" },
  { value: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "سریع با کیفیت بالا", badge: "سریع", provider: "google" },
  { value: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "سریع‌ترین و اقتصادی‌ترین", badge: "اقتصادی", provider: "google" },
];

const BADGE_COLORS: Record<ModelBadge, string> = {
  "دقیق‌ترین": "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  "متعادل": "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300",
  "سریع": "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  "اقتصادی": "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  "استدلال": "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300",
};

// ─── Provider definitions ─────────────────────────────────────────────────────

const PROVIDERS: {
  key: ProviderKey;
  label: string;
  Icon: typeof Bot;
  color: string;
  dotColor: string;
  borderColor: string;
  bgColor: string;
}[] = [
  {
    key: "anthropic",
    label: "Anthropic (Claude)",
    Icon: Bot,
    color: "text-violet-600 dark:text-violet-400",
    dotColor: "bg-emerald-500",
    borderColor: "border-violet-200 dark:border-violet-800",
    bgColor: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    key: "openai",
    label: "OpenAI (GPT)",
    Icon: Sparkles,
    color: "text-emerald-600 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    key: "google",
    label: "Google (Gemini)",
    Icon: Globe,
    color: "text-blue-600 dark:text-blue-400",
    dotColor: "bg-emerald-500",
    borderColor: "border-blue-200 dark:border-blue-800",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
];

// ─── AI fields list (only these are saved by this panel) ─────────────────────

const AI_FIELDS = [
  "aiCopilotEnabled", "aiModel", "aiContext",
  "aiChatbotEnabled", "aiChatbotPersona", "aiChatbotWelcome",
  "aiHandoffEnabled", "aiUnavailableMessage", "aiRateLimitPerMinute",
  "aiToolsProduct", "aiToolsOrder", "aiToolsKnowledge", "aiToolsCustomer", "aiToolsSupport",
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

type ConnectedProviders = {
  anthropic: boolean;
  openai: boolean;
  google: boolean;
};

type Props = {
  initialData: Record<string, unknown>;
  connectedProviders: ConnectedProviders;
};

// ─── Subcomponents ────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dz-a-primary-500 focus-visible:ring-offset-2
        ${checked
          ? "bg-dz-a-primary-500"
          : "bg-dz-a-primary-200 dark:bg-dz-a-night-border"
        }`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform
          ${checked ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 border-b border-dz-a-primary-100 pb-4 dark:border-dz-a-night-border">
      <h3 className="text-base font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">{description}</p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AiSettingsPanel({ initialData, connectedProviders }: Props) {
  const [data, setData] = useState<Record<string, unknown>>(() => {
    const d: Record<string, unknown> = {};
    for (const k of AI_FIELDS) d[k] = initialData[k];
    return d;
  });

  const [pending, startTransition] = useTransition();
  const [saveState, setSaveState] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const setField = (name: string, value: unknown) => {
    setData((d) => ({ ...d, [name]: value }));
    if (saveState !== "idle") setSaveState("idle");
  };

  const anyProviderConnected =
    connectedProviders.anthropic || connectedProviders.openai || connectedProviders.google;

  const availableModels = MODEL_DEFS.filter((m) => connectedProviders[m.provider]);

  const providerGroups = (["anthropic", "openai", "google"] as ProviderKey[]).filter(
    (p) => connectedProviders[p]
  );

  const submit = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await saveAiSettingsAction(data);
      if (!res.ok) {
        setSaveState("error");
        setErrorMsg(res.error);
      } else {
        setSaveState("success");
        setTimeout(() => setSaveState("idle"), 2500);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Provider Status Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PROVIDERS.map(({ key, label, Icon, color, dotColor, borderColor, bgColor }) => {
          const connected = connectedProviders[key];
          return (
            <div
              key={key}
              className={`flex items-center gap-3 rounded-xl border p-4 ${borderColor} ${bgColor}`}
            >
              <span className={`rounded-lg p-2 ${bgColor}`}>
                <Icon className={`size-5 ${color}`} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
                  {label}
                </div>
                {connected ? (
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <span className={`size-1.5 rounded-full ${dotColor}`} />
                    متصل
                  </div>
                ) : (
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-dz-a-primary-300 dark:bg-dz-a-night-border" />
                    <Link
                      href="/admin/settings#integrations"
                      className="text-xs text-dz-a-primary-400 hover:text-dz-a-primary-600 dark:text-dz-a-night-muted dark:hover:text-dz-a-night-fg"
                    >
                      تنظیم کلید ←
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Operator Copilot Section ────────────────────────────────────── */}
      <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-6 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        <SectionHeader
          title="دستیار هوش مصنوعی (اپراتور)"
          description="پیشنهاد پاسخ برای اپراتور با Claude، GPT یا Gemini."
        />

        {!anyProviderConnected ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800/40 dark:bg-amber-900/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
              <div>
                <p className="font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
                  هیچ کلید API متصل نیست
                </p>
                <p className="mt-1 text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">
                  برای فعال کردن دستیار اپراتور، حداقل یک سرویس را در تنظیمات اتصال‌ها پیکربندی کنید.
                </p>
                <Link
                  href="/admin/settings#integrations"
                  className="mt-2 inline-flex items-center text-sm font-medium text-dz-a-primary-600 hover:text-dz-a-primary-800 dark:text-dz-a-primary-400 dark:hover:text-dz-a-primary-300"
                >
                  تنظیمات اتصال‌ها ←
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Toggle */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <label
                  htmlFor="aiCopilotEnabled"
                  className="text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg"
                >
                  فعال‌سازی پاسخ پیشنهادی هوش مصنوعی
                </label>
                <p className="mt-0.5 text-xs text-dz-a-primary-400 dark:text-dz-a-night-muted">
                  بدون کلید سرویسِ مدلِ انتخاب‌شده غیرفعال می‌ماند.
                </p>
              </div>
              <Toggle
                id="aiCopilotEnabled"
                checked={!!data.aiCopilotEnabled}
                onChange={(v) => setField("aiCopilotEnabled", v)}
              />
            </div>

            {/* Model Picker */}
            <div>
              <div className="mb-3 text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
                مدل هوش مصنوعی
              </div>
              <div className="space-y-4">
                {providerGroups.map((providerKey) => {
                  const providerDef = PROVIDERS.find((p) => p.key === providerKey)!;
                  const models = availableModels.filter((m) => m.provider === providerKey);
                  if (!models.length) return null;
                  return (
                    <div key={providerKey}>
                      <div className={`mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${providerDef.color}`}>
                        <providerDef.Icon className="size-3.5" />
                        {providerDef.label}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {models.map((model) => {
                          const selected = data.aiModel === model.value;
                          return (
                            <label
                              key={model.value}
                              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors
                                ${selected
                                  ? "border-dz-a-primary-500 bg-dz-a-primary-50 dark:border-dz-a-primary-400 dark:bg-dz-a-primary-400/10"
                                  : "border-dz-a-primary-100 hover:border-dz-a-primary-300 dark:border-dz-a-night-border dark:hover:border-dz-a-primary-600"
                                }`}
                            >
                              <input
                                type="radio"
                                name="aiModel"
                                value={model.value}
                                checked={selected}
                                onChange={() => setField("aiModel", model.value)}
                                className="sr-only"
                              />
                              <span
                                className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2
                                  ${selected
                                    ? "border-dz-a-primary-500"
                                    : "border-dz-a-primary-300 dark:border-dz-a-night-border"
                                  }`}
                              >
                                {selected && (
                                  <span className="size-2 rounded-full bg-dz-a-primary-500" />
                                )}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
                                    {model.name}
                                  </span>
                                  <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${BADGE_COLORS[model.badge]}`}>
                                    {model.badge}
                                  </span>
                                </div>
                                <div className="mt-0.5 text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">
                                  {model.description}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Context textarea */}
            <div>
              <label
                htmlFor="aiContext"
                className="mb-1.5 block text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg"
              >
                زمینه/لحن برند برای دستیار
              </label>
              <textarea
                id="aiContext"
                rows={4}
                value={(data.aiContext as string) ?? ""}
                onChange={(e) => setField("aiContext", e.target.value)}
                placeholder="اطلاعات یا لحنی که می‌خواهید دستیار در پاسخ‌ها رعایت کند..."
                className="w-full rounded-xl border border-dz-a-primary-200 bg-white px-3 py-2.5 text-sm text-dz-a-primary-800 placeholder:text-dz-a-primary-300 focus:border-dz-a-primary-400 focus:outline-none focus:ring-2 focus:ring-dz-a-primary-400/20 dark:border-dz-a-night-border dark:bg-dz-a-night-surface dark:text-dz-a-night-fg dark:placeholder:text-dz-a-night-muted"
              />
              <p className="mt-1 text-xs text-dz-a-primary-400 dark:text-dz-a-night-muted">
                اطلاعات یا لحنی که می‌خواهید دستیار در پاسخ‌ها رعایت کند.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Customer Chatbot Section ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-dz-a-primary-100 bg-white p-6 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        <SectionHeader
          title="چت‌بات هوش مصنوعی (مشتری)"
          description="دستیار هوشمندِ پاسخ‌گو به مشتری روی OpenAI Responses API."
        />

        {!connectedProviders.openai ? (
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5 dark:border-amber-800/30 dark:bg-amber-900/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
              <div>
                <p className="font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
                  چت‌بات مشتری به OpenAI نیاز دارد
                </p>
                <p className="mt-1 text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">
                  برای فعال کردن چت‌بات هوشمند مشتری، کلید OPENAI_API_KEY را در تنظیمات اتصال‌ها پیکربندی کنید.
                </p>
                <Link
                  href="/admin/settings#integrations"
                  className="mt-2 inline-flex items-center text-sm font-medium text-dz-a-primary-600 hover:text-dz-a-primary-800 dark:text-dz-a-primary-400 dark:hover:text-dz-a-primary-300"
                >
                  تنظیمات اتصال‌ها ←
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enable toggle */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <label
                  htmlFor="aiChatbotEnabled"
                  className="text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg"
                >
                  فعال‌سازی چت‌بات
                </label>
                <p className="mt-0.5 text-xs text-dz-a-primary-400 dark:text-dz-a-night-muted">
                  بدون OPENAI_API_KEY روی سرور، چت‌بات ایمن غیرفعال می‌ماند.
                </p>
              </div>
              <Toggle
                id="aiChatbotEnabled"
                checked={!!data.aiChatbotEnabled}
                onChange={(v) => setField("aiChatbotEnabled", v)}
              />
            </div>

            {/* Persona */}
            <div>
              <div className="mb-3 text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
                نقشِ دستیار
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {([
                  { value: "support", label: "پشتیبانی عمومی", desc: "پاسخ به سوالات و راهنمایی", Icon: Headset },
                  { value: "shopping", label: "مشاور خرید", desc: "کمک در انتخاب محصول", Icon: ShoppingBag },
                  { value: "recipe", label: "دستیار آشپزی", desc: "پیشنهاد دستور پخت", Icon: ChefHat },
                ] as const).map(({ value, label, desc, Icon }) => {
                  const selected = data.aiChatbotPersona === value;
                  return (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors
                        ${selected
                          ? "border-dz-a-primary-500 bg-dz-a-primary-50 dark:border-dz-a-primary-400 dark:bg-dz-a-primary-400/10"
                          : "border-dz-a-primary-100 hover:border-dz-a-primary-300 dark:border-dz-a-night-border dark:hover:border-dz-a-primary-600"
                        }`}
                    >
                      <input
                        type="radio"
                        name="aiChatbotPersona"
                        value={value}
                        checked={selected}
                        onChange={() => setField("aiChatbotPersona", value)}
                        className="sr-only"
                      />
                      <Icon className={`mt-0.5 size-4 shrink-0 ${selected ? "text-dz-a-primary-500" : "text-dz-a-primary-400 dark:text-dz-a-night-muted"}`} />
                      <div>
                        <div className="text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
                          {label}
                        </div>
                        <div className="mt-0.5 text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted">
                          {desc}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Welcome message */}
            <div>
              <label
                htmlFor="aiChatbotWelcome"
                className="mb-1.5 block text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg"
              >
                پیام خوش‌آمد چت‌بات
              </label>
              <textarea
                id="aiChatbotWelcome"
                rows={2}
                value={(data.aiChatbotWelcome as string) ?? ""}
                onChange={(e) => setField("aiChatbotWelcome", e.target.value)}
                className="w-full rounded-xl border border-dz-a-primary-200 bg-white px-3 py-2.5 text-sm text-dz-a-primary-800 placeholder:text-dz-a-primary-300 focus:border-dz-a-primary-400 focus:outline-none focus:ring-2 focus:ring-dz-a-primary-400/20 dark:border-dz-a-night-border dark:bg-dz-a-night-surface dark:text-dz-a-night-fg dark:placeholder:text-dz-a-night-muted"
              />
            </div>

            {/* Handoff toggle */}
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="aiHandoffEnabled"
                className="text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg"
              >
                انتقال به پشتیبان انسانی
              </label>
              <Toggle
                id="aiHandoffEnabled"
                checked={!!data.aiHandoffEnabled}
                onChange={(v) => setField("aiHandoffEnabled", v)}
              />
            </div>

            {/* Unavailable message */}
            <div>
              <label
                htmlFor="aiUnavailableMessage"
                className="mb-1.5 block text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg"
              >
                پیام حالت «در دسترس نبودن هوش مصنوعی»
              </label>
              <textarea
                id="aiUnavailableMessage"
                rows={2}
                value={(data.aiUnavailableMessage as string) ?? ""}
                onChange={(e) => setField("aiUnavailableMessage", e.target.value)}
                className="w-full rounded-xl border border-dz-a-primary-200 bg-white px-3 py-2.5 text-sm text-dz-a-primary-800 placeholder:text-dz-a-primary-300 focus:border-dz-a-primary-400 focus:outline-none focus:ring-2 focus:ring-dz-a-primary-400/20 dark:border-dz-a-night-border dark:bg-dz-a-night-surface dark:text-dz-a-night-fg dark:placeholder:text-dz-a-night-muted"
              />
            </div>

            {/* Rate limit */}
            <div>
              <label
                htmlFor="aiRateLimitPerMinute"
                className="mb-1.5 block text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg"
              >
                سقف پیام در دقیقه (هر کاربر)
              </label>
              <input
                id="aiRateLimitPerMinute"
                type="number"
                dir="ltr"
                min={1}
                max={120}
                value={(data.aiRateLimitPerMinute as number) ?? 20}
                onChange={(e) => setField("aiRateLimitPerMinute", Number(e.target.value))}
                className="w-32 rounded-xl border border-dz-a-primary-200 bg-white px-3 py-2 text-sm text-dz-a-primary-800 focus:border-dz-a-primary-400 focus:outline-none focus:ring-2 focus:ring-dz-a-primary-400/20 dark:border-dz-a-night-border dark:bg-dz-a-night-surface dark:text-dz-a-night-fg"
              />
            </div>

            {/* Tool toggles */}
            <div>
              <div className="mb-3 text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">
                ابزارهای فعال
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {([
                  { field: "aiToolsProduct", label: "ابزارهای محصول" },
                  { field: "aiToolsOrder", label: "ابزارهای سفارش" },
                  { field: "aiToolsKnowledge", label: "دانش (مقالات/دستور پخت)" },
                  { field: "aiToolsCustomer", label: "حساب مشتری" },
                  { field: "aiToolsSupport", label: "پشتیبانی و انتقال" },
                ] as const).map(({ field, label }) => (
                  <label
                    key={field}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors
                      ${data[field]
                        ? "border-dz-a-primary-200 bg-dz-a-primary-50/50 dark:border-dz-a-primary-700 dark:bg-dz-a-primary-900/10"
                        : "border-dz-a-primary-100 dark:border-dz-a-night-border"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!data[field]}
                      onChange={(e) => setField(field, e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors
                        ${data[field]
                          ? "border-dz-a-primary-500 bg-dz-a-primary-500"
                          : "border-dz-a-primary-300 dark:border-dz-a-night-border"
                        }`}
                    >
                      {!!data[field] && <Check className="size-3 text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-sm text-dz-a-primary-700 dark:text-dz-a-night-fg">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Save Button ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {saveState === "error" && errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/10 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-dz-a-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-dz-a-primary-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-dz-a-primary-500 dark:hover:bg-dz-a-primary-400"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              در حال ذخیره…
            </>
          ) : saveState === "success" ? (
            <>
              <CheckCircle2 className="size-4 text-emerald-400" />
              ذخیره شد
            </>
          ) : (
            "ذخیره‌ی تنظیمات هوش مصنوعی"
          )}
        </button>
      </div>
    </div>
  );
}
