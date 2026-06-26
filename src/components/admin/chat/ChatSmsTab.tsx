"use client";

import { useState, useTransition } from "react";
import {
  MessageCircle,
  Plus,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Package,
  Bell,
  Settings2,
  Edit2,
} from "lucide-react";
import {
  createSmsTemplateAction,
  updateSmsTemplateAction,
  deleteSmsTemplateAction,
  sendSmsAction,
} from "@/app/admin/chat/sms-actions";
import type { SmsTemplate, SmsLog } from "@/generated/prisma/client";

// ── types ──────────────────────────────────────────────────────────────────

type Provider = "kavenegar" | "rahpayam";
type Category = "general" | "cart" | "product" | "notification";
type SmsType = "free" | "pattern";

interface ProviderStatus {
  kavenegar: boolean;
  rahpayam: boolean;
}

// ── helpers ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<Category, string> = {
  general: "عمومی",
  cart: "سبد رها‌شده",
  product: "محصول",
  notification: "اعلان اپراتور",
};

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  general: MessageCircle,
  cart: ShoppingCart,
  product: Package,
  notification: Bell,
};

const PROVIDER_LABELS: Record<Provider, string> = {
  kavenegar: "کاوه‌نگار",
  rahpayam: "راه‌پیام",
};

const VARIABLES = [
  { key: "#userName#", label: "نام کاربر" },
  { key: "#userPhone#", label: "شماره کاربر" },
  { key: "#chatUrl#", label: "لینک گفتگو" },
  { key: "#adminName#", label: "نام اپراتور" },
];

const PRESET_TEMPLATES = [
  {
    category: "cart" as Category,
    name: "یادآوری سبد خرید",
    body: "#userName# عزیز، سبد خرید شما منتظر است! برای تکمیل خرید: #chatUrl#",
  },
  {
    category: "product" as Category,
    name: "موجودی محصول",
    body: "#userName# عزیز، محصول مورد نظر شما موجود شد. برای خرید: #chatUrl#",
  },
  {
    category: "notification" as Category,
    name: "پاسخ اپراتور",
    body: "#userName# عزیز، #adminName# پاسخ داد. مشاهده: #chatUrl#",
  },
];

// ── ProviderStatus card ────────────────────────────────────────────────────

function ProviderCard({
  name,
  label,
  connected,
}: {
  name: Provider;
  label: string;
  connected: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dz-a-primary-100 bg-white p-4 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-dz-a-primary-50 dark:bg-dz-a-primary-400/10">
        <MessageCircle size={16} className="text-dz-a-primary-600 dark:text-dz-a-primary-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg">{label}</p>
        <p className={`text-xs ${connected ? "text-green-600 dark:text-green-400" : "text-dz-a-primary-400 dark:text-dz-a-night-faint"}`}>
          {connected ? "متصل" : "کلید API تنظیم نشده"}
        </p>
      </div>
      <span className={`size-2 rounded-full ${connected ? "bg-green-500" : "bg-dz-a-primary-300 dark:bg-white/20"}`} />
    </div>
  );
}

// ── TemplateForm ───────────────────────────────────────────────────────────

function TemplateForm({
  initial,
  providerStatus,
  onSave,
  onCancel,
}: {
  initial?: Partial<SmsTemplate>;
  providerStatus: ProviderStatus;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    provider: (initial?.provider ?? "kavenegar") as Provider,
    type: (initial?.type ?? "free") as SmsType,
    body: initial?.body ?? "",
    patternName: initial?.patternName ?? "",
    templateId: initial?.templateId ?? "",
    category: (initial?.category ?? "general") as Category,
  });
  const [error, setError] = useState("");

  function insertVar(key: string) {
    setForm((f) => ({ ...f, body: f.body + key }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = initial?.id
        ? await updateSmsTemplateAction(initial.id, form)
        : await createSmsTemplateAction(form);
      if (result.ok) {
        onSave();
      } else {
        setError(result.error);
      }
    });
  }

  const connectedProviders = Object.entries(providerStatus)
    .filter(([, v]) => v)
    .map(([k]) => k as Provider);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-400/10 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* name */}
        <div>
          <label className="mb-1 block text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">
            نام قالب
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-dz-a-primary-200 bg-white px-3 py-2 text-sm dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
            placeholder="مثال: یادآوری سبد خرید"
          />
        </div>

        {/* category */}
        <div>
          <label className="mb-1 block text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">
            دسته‌بندی
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
            className="w-full rounded-lg border border-dz-a-primary-200 bg-white px-3 py-2 text-sm dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
          >
            {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        {/* provider */}
        <div>
          <label className="mb-1 block text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">
            سرویس پیامک
          </label>
          <select
            value={form.provider}
            onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value as Provider }))}
            className="w-full rounded-lg border border-dz-a-primary-200 bg-white px-3 py-2 text-sm dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
          >
            <option value="kavenegar" disabled={!providerStatus.kavenegar}>
              کاوه‌نگار{!providerStatus.kavenegar ? " (متصل نیست)" : ""}
            </option>
            <option value="rahpayam" disabled={!providerStatus.rahpayam}>
              راه‌پیام{!providerStatus.rahpayam ? " (متصل نیست)" : ""}
            </option>
          </select>
          {connectedProviders.length === 0 && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              ابتدا کلید API را در تنظیمات → اتصال‌ها وارد کنید.
            </p>
          )}
        </div>

        {/* type */}
        <div>
          <label className="mb-1 block text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">
            نوع ارسال
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as SmsType }))}
            className="w-full rounded-lg border border-dz-a-primary-200 bg-white px-3 py-2 text-sm dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
          >
            <option value="free">متن آزاد (کاوه‌نگار)</option>
            <option value="pattern">قالب/پترن</option>
          </select>
        </div>
      </div>

      {/* body or pattern fields */}
      {form.type === "free" ? (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">
              متن پیامک
            </label>
            <div className="flex gap-1">
              {VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => insertVar(v.key)}
                  className="rounded px-1.5 py-0.5 text-[0.625rem] font-medium text-dz-a-primary-600 border border-dz-a-primary-200 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-primary-300"
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            rows={3}
            className="w-full rounded-lg border border-dz-a-primary-200 bg-white px-3 py-2 text-sm resize-none dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
            placeholder="#userName# عزیز، پیام شما..."
            dir="rtl"
          />
          <p className="mt-1 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
            {form.body.length} کاراکتر
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {form.provider === "kavenegar" ? (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">
                نام قالب (verify/lookup)
              </label>
              <input
                value={form.patternName}
                onChange={(e) => setForm((f) => ({ ...f, patternName: e.target.value }))}
                className="w-full rounded-lg border border-dz-a-primary-200 bg-white px-3 py-2 text-sm ltr dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
                placeholder="verify-template-name"
                dir="ltr"
              />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">
                شناسه قالب راه‌پیام (templateID)
              </label>
              <input
                value={form.templateId}
                onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
                className="w-full rounded-lg border border-dz-a-primary-200 bg-white px-3 py-2 text-sm ltr dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
                placeholder="12345"
                dir="ltr"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-dz-a-primary-600 hover:bg-dz-a-primary-50 dark:text-dz-a-primary-300 dark:hover:bg-white/5"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-dz-a-primary-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "در حال ذخیره…" : "ذخیره قالب"}
        </button>
      </div>
    </form>
  );
}

// ── TemplateRow ────────────────────────────────────────────────────────────

function TemplateRow({
  tpl,
  providerStatus,
  onDeleted,
}: {
  tpl: SmsTemplate;
  providerStatus: ProviderStatus;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const Icon = CATEGORY_ICONS[tpl.category as Category] ?? MessageCircle;

  function handleDelete() {
    if (!confirm("این قالب حذف شود؟")) return;
    startTransition(async () => {
      await deleteSmsTemplateAction(tpl.id);
      onDeleted();
    });
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-dz-a-primary-200 bg-white p-4 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        <TemplateForm
          initial={tpl}
          providerStatus={providerStatus}
          onSave={() => { setEditing(false); onDeleted(); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-dz-a-primary-100 bg-white p-4 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-dz-a-primary-50 dark:bg-dz-a-primary-400/10">
        <Icon size={15} className="text-dz-a-primary-600 dark:text-dz-a-primary-300" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg">{tpl.name}</span>
          <span className="rounded-full bg-dz-a-primary-100 px-2 py-0.5 text-[0.625rem] font-medium text-dz-a-primary-600 dark:bg-dz-a-primary-400/10 dark:text-dz-a-primary-300">
            {CATEGORY_LABELS[tpl.category as Category] ?? tpl.category}
          </span>
          <span className="rounded-full border border-dz-a-primary-200 px-2 py-0.5 text-[0.625rem] text-dz-a-primary-500 dark:border-dz-a-night-border dark:text-dz-a-night-muted">
            {PROVIDER_LABELS[tpl.provider as Provider] ?? tpl.provider}
          </span>
        </div>
        {tpl.body && (
          <p className="mt-1 text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted line-clamp-2">
            {tpl.body}
          </p>
        )}
        {tpl.patternName && (
          <p className="mt-1 text-xs font-mono text-dz-a-primary-400 dark:text-dz-a-night-faint">
            pattern: {tpl.patternName}
          </p>
        )}
        {tpl.templateId && (
          <p className="mt-1 text-xs font-mono text-dz-a-primary-400 dark:text-dz-a-night-faint">
            templateID: {tpl.templateId}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg text-dz-a-primary-400 hover:text-dz-a-primary-600 hover:bg-dz-a-primary-50 dark:hover:bg-white/5 transition-colors"
          title="ویرایش"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="p-1.5 rounded-lg text-dz-a-primary-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors disabled:opacity-40"
          title="حذف"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── QuickSend ──────────────────────────────────────────────────────────────

function QuickSend({
  templates,
  providerStatus,
}: {
  templates: SmsTemplate[];
  providerStatus: ProviderStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [to, setTo] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [freeBody, setFreeBody] = useState("");
  const [provider, setProvider] = useState<Provider>("kavenegar");
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const tpl = templates.find((t) => t.id === selectedTemplate);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const data = tpl
        ? {
            to,
            provider: tpl.provider as Provider,
            body: tpl.type === "free" ? tpl.body ?? undefined : undefined,
            patternName: tpl.patternName ?? undefined,
            templateId: tpl.templateId ?? undefined,
            smsTemplateId: tpl.id,
          }
        : { to, provider, body: freeBody };

      const res = await sendSmsAction(data);
      setResult({ ok: res.ok, msg: res.ok ? `ارسال شد (ref: ${(res as {referenceId?:string}).referenceId ?? "—"})` : (res as {error:string}).error });
    });
  }

  return (
    <form onSubmit={handleSend} className="space-y-4">
      {result && (
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${result.ok ? "bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-400"}`}>
          {result.ok ? <CheckCircle size={15} /> : <XCircle size={15} />}
          {result.msg}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">
            شماره گیرنده
          </label>
          <input
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-lg border border-dz-a-primary-200 bg-white px-3 py-2 text-sm ltr dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
            placeholder="09123456789"
            dir="ltr"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">
            قالب (اختیاری)
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full rounded-lg border border-dz-a-primary-200 bg-white px-3 py-2 text-sm dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
          >
            <option value="">— بدون قالب —</option>
            {templates.filter((t) => t.isActive).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedTemplate && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">
              سرویس
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
              className="w-full rounded-lg border border-dz-a-primary-200 bg-white px-3 py-2 text-sm dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
            >
              <option value="kavenegar" disabled={!providerStatus.kavenegar}>
                کاوه‌نگار{!providerStatus.kavenegar ? " (متصل نیست)" : ""}
              </option>
              <option value="rahpayam" disabled={!providerStatus.rahpayam}>
                راه‌پیام{!providerStatus.rahpayam ? " (متصل نیست)" : ""}
              </option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg">
              متن پیامک
            </label>
            <textarea
              value={freeBody}
              onChange={(e) => setFreeBody(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-dz-a-primary-200 bg-white px-3 py-2 text-sm resize-none dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg"
              dir="rtl"
            />
          </div>
        </>
      )}

      {tpl && (
        <div className="rounded-lg bg-dz-a-primary-50 px-3 py-2 text-sm text-dz-a-primary-700 dark:bg-dz-a-primary-400/10 dark:text-dz-a-primary-300">
          <strong>پیش‌نمایش:</strong>{" "}
          {tpl.body ?? `قالب: ${tpl.patternName ?? tpl.templateId}`}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending || (!providerStatus.kavenegar && !providerStatus.rahpayam)}
          className="flex items-center gap-2 rounded-lg bg-dz-a-primary-600 px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          <Send size={14} />
          {pending ? "در حال ارسال…" : "ارسال پیامک"}
        </button>
      </div>
    </form>
  );
}

// ── Main tab ───────────────────────────────────────────────────────────────

export function ChatSmsTab({
  templates,
  logs,
  providerStatus,
}: {
  templates: SmsTemplate[];
  logs: (SmsLog & { template: { name: string } | null })[];
  providerStatus: ProviderStatus;
}) {
  const [localTemplates, setLocalTemplates] = useState(templates);
  const [showNewForm, setShowNewForm] = useState(false);
  const [openSection, setOpenSection] = useState<"templates" | "send" | "logs">("templates");

  async function refreshTemplates() {
    // revalidatePath happens server-side; for client list we just close the form
    setShowNewForm(false);
  }

  function addPreset(preset: (typeof PRESET_TEMPLATES)[number]) {
    setShowNewForm(true);
  }

  return (
    <div className="space-y-6">
      {/* title */}
      <div>
        <h2 className="font-heading text-lg font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
          پیامک
        </h2>
        <p className="mt-0.5 text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">
          ارسال پیامک از طریق کاوه‌نگار یا راه‌پیام، مدیریت قالب‌ها و لاگ ارسال‌ها.
        </p>
      </div>

      {/* provider status */}
      <div className="grid gap-3 sm:grid-cols-2">
        <ProviderCard name="kavenegar" label="کاوه‌نگار" connected={providerStatus.kavenegar} />
        <ProviderCard name="rahpayam" label="راه‌پیام (MessageWay)" connected={providerStatus.rahpayam} />
      </div>

      {!providerStatus.kavenegar && !providerStatus.rahpayam && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400">
          برای استفاده از پیامک، کلید API کاوه‌نگار یا راه‌پیام را در{" "}
          <a href="/admin/settings" className="underline font-medium">تنظیمات → اتصال‌ها</a>{" "}
          وارد کنید.
        </div>
      )}

      {/* preset templates */}
      <div className="rounded-xl border border-dz-a-primary-100 bg-white p-5 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
        <h3 className="mb-3 font-heading text-sm font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
          قالب‌های آماده پیشنهادی
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {PRESET_TEMPLATES.map((p) => {
            const Icon = CATEGORY_ICONS[p.category];
            return (
              <div key={p.name} className="rounded-lg border border-dz-a-primary-100 p-3 dark:border-dz-a-night-border">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className="text-dz-a-primary-500" />
                  <span className="text-xs font-semibold text-dz-a-primary-700 dark:text-dz-a-night-fg">{p.name}</span>
                </div>
                <p className="text-xs text-dz-a-primary-500 dark:text-dz-a-night-muted line-clamp-2 mb-2">{p.body}</p>
                <span className="rounded-full bg-dz-a-primary-50 px-2 py-0.5 text-[0.625rem] text-dz-a-primary-600 dark:bg-dz-a-primary-400/10 dark:text-dz-a-primary-300">
                  {CATEGORY_LABELS[p.category]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* templates section */}
      <div className="rounded-xl border border-dz-a-primary-100 bg-white dark:border-dz-a-night-border dark:bg-dz-a-night-card overflow-hidden">
        <button
          onClick={() => setOpenSection(openSection === "templates" ? "send" : "templates")}
          className="flex w-full items-center gap-3 p-5 text-start"
        >
          <Settings2 size={16} className="text-dz-a-primary-500" />
          <span className="flex-1 font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
            قالب‌های پیامک
          </span>
          <span className="text-xs text-dz-a-primary-400">{localTemplates.length} قالب</span>
          {openSection === "templates" ? <ChevronUp size={15} className="text-dz-a-primary-400" /> : <ChevronDown size={15} className="text-dz-a-primary-400" />}
        </button>

        {openSection === "templates" && (
          <div className="border-t border-dz-a-primary-100 px-5 pb-5 dark:border-dz-a-night-border">
            <div className="mt-4 space-y-3">
              {localTemplates.map((tpl) => (
                <TemplateRow
                  key={tpl.id}
                  tpl={tpl}
                  providerStatus={providerStatus}
                  onDeleted={() => setLocalTemplates((prev) => prev.filter((t) => t.id !== tpl.id))}
                />
              ))}
              {localTemplates.length === 0 && !showNewForm && (
                <p className="py-4 text-center text-sm text-dz-a-primary-400 dark:text-dz-a-night-faint">
                  هنوز قالبی تعریف نشده
                </p>
              )}
            </div>

            {showNewForm ? (
              <div className="mt-4 rounded-xl border border-dz-a-primary-200 bg-dz-a-primary-50 p-4 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated">
                <h4 className="mb-3 text-sm font-semibold text-dz-a-primary-800 dark:text-dz-a-night-fg">
                  قالب جدید
                </h4>
                <TemplateForm
                  providerStatus={providerStatus}
                  onSave={refreshTemplates}
                  onCancel={() => setShowNewForm(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowNewForm(true)}
                className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-dz-a-primary-300 px-4 py-2.5 text-sm text-dz-a-primary-600 hover:bg-dz-a-primary-50 dark:border-dz-a-night-border dark:text-dz-a-primary-300 dark:hover:bg-white/5 w-full justify-center"
              >
                <Plus size={15} />
                افزودن قالب جدید
              </button>
            )}
          </div>
        )}
      </div>

      {/* quick send */}
      <div className="rounded-xl border border-dz-a-primary-100 bg-white dark:border-dz-a-night-border dark:bg-dz-a-night-card overflow-hidden">
        <button
          onClick={() => setOpenSection(openSection === "send" ? "templates" : "send")}
          className="flex w-full items-center gap-3 p-5 text-start"
        >
          <Send size={16} className="text-dz-a-primary-500" />
          <span className="flex-1 font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
            ارسال پیامک
          </span>
          {openSection === "send" ? <ChevronUp size={15} className="text-dz-a-primary-400" /> : <ChevronDown size={15} className="text-dz-a-primary-400" />}
        </button>
        {openSection === "send" && (
          <div className="border-t border-dz-a-primary-100 px-5 pb-5 dark:border-dz-a-night-border">
            <div className="mt-4">
              <QuickSend templates={localTemplates} providerStatus={providerStatus} />
            </div>
          </div>
        )}
      </div>

      {/* logs */}
      <div className="rounded-xl border border-dz-a-primary-100 bg-white dark:border-dz-a-night-border dark:bg-dz-a-night-card overflow-hidden">
        <button
          onClick={() => setOpenSection(openSection === "logs" ? "templates" : "logs")}
          className="flex w-full items-center gap-3 p-5 text-start"
        >
          <MessageCircle size={16} className="text-dz-a-primary-500" />
          <span className="flex-1 font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
            لاگ ارسال‌ها
          </span>
          <span className="text-xs text-dz-a-primary-400">{logs.length} مورد</span>
          {openSection === "logs" ? <ChevronUp size={15} className="text-dz-a-primary-400" /> : <ChevronDown size={15} className="text-dz-a-primary-400" />}
        </button>
        {openSection === "logs" && (
          <div className="border-t border-dz-a-primary-100 dark:border-dz-a-night-border">
            {logs.length === 0 ? (
              <p className="py-8 text-center text-sm text-dz-a-primary-400 dark:text-dz-a-night-faint">
                هنوز پیامکی ارسال نشده
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dz-a-primary-100 dark:border-dz-a-night-border">
                    <th className="px-4 py-2 text-start text-xs font-medium text-dz-a-primary-500">شماره</th>
                    <th className="px-4 py-2 text-start text-xs font-medium text-dz-a-primary-500">قالب</th>
                    <th className="px-4 py-2 text-start text-xs font-medium text-dz-a-primary-500">سرویس</th>
                    <th className="px-4 py-2 text-start text-xs font-medium text-dz-a-primary-500">وضعیت</th>
                    <th className="px-4 py-2 text-start text-xs font-medium text-dz-a-primary-500">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-dz-a-primary-50 last:border-0 dark:border-dz-a-night-border/50">
                      <td className="px-4 py-2 font-mono text-xs text-dz-a-primary-700 dark:text-dz-a-night-fg">{log.to}</td>
                      <td className="px-4 py-2 text-xs text-dz-a-primary-600 dark:text-dz-a-night-muted">{log.template?.name ?? "—"}</td>
                      <td className="px-4 py-2 text-xs text-dz-a-primary-500">{PROVIDER_LABELS[log.provider as Provider] ?? log.provider}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-medium ${
                          log.status === "sent" ? "bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-400" :
                          log.status === "failed" ? "bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-400" :
                          "bg-dz-a-primary-100 text-dz-a-primary-500"
                        }`}>
                          {log.status === "sent" ? "ارسال شد" : log.status === "failed" ? "خطا" : "در انتظار"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">
                        {new Date(log.createdAt).toLocaleDateString("fa-IR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
