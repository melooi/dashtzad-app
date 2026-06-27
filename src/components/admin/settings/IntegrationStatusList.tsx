"use client";

import { useState, useTransition } from "react";
import {
  Cpu, Bot, Sparkles, Globe, ShoppingCart,
  MessageSquare, MessageCircle, Search, BarChart3, TrendingUp,
  Table2, Send, Mail, Receipt, PhoneCall,
  Plug, X, Loader2, CheckCircle2, XCircle, Zap, Eye, EyeOff, Save, Settings,
  type LucideIcon,
} from "lucide-react";
import type { IntegrationStatus, IntegrationState } from "@/lib/admin/integrations";
import {
  testIntegrationAction,
  saveIntegrationConfigAction,
  sendTestMessageAction,
} from "@/app/admin/settings/integration-actions";

// ─── Group order ──────────────────────────────────────────
const GROUPS = [
  { key: "ai",        title: "مدل‌های هوش مصنوعی", keys: ["ai-openai", "ai-anthropic", "ai-google"] },
  { key: "site",      title: "سایت و فروشگاه",     keys: ["wordpress", "woocommerce"] },
  { key: "sms",       title: "پیامک و تماس",        keys: ["kavenegar", "msgway"] },
  { key: "google",    title: "سرویس‌های گوگل",      keys: ["google-custom-search", "google-search-console", "google-analytics", "google-sheets"] },
  { key: "messaging", title: "پیام‌رسان و ایمیل",  keys: ["telegram-bot", "bale-bot", "smtp-email"] },
  { key: "finance",   title: "مالی و سانترال",      keys: ["hesabfa", "santral"] },
] as const;

// ─── Icons ────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  "ai-openai": Cpu,
  "ai-anthropic": Bot,
  "ai-google": Sparkles,
  wordpress: Globe,
  woocommerce: ShoppingCart,
  kavenegar: MessageSquare,
  msgway: MessageCircle,
  "google-custom-search": Search,
  "google-search-console": BarChart3,
  "google-analytics": TrendingUp,
  "google-sheets": Table2,
  "telegram-bot": Send,
  "bale-bot": MessageCircle,
  "smtp-email": Mail,
  hesabfa: Receipt,
  santral: PhoneCall,
};

// ─── Color accent per icon (matches reference design) ─────
const ICON_COLOR: Record<string, string> = {
  "ai-openai":            "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
  "ai-anthropic":         "bg-orange-50 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400",
  "ai-google":            "bg-purple-50 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400",
  wordpress:              "bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400",
  woocommerce:            "bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400",
  kavenegar:              "bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400",
  msgway:                 "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
  "google-custom-search": "bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400",
  "google-search-console":"bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
  "google-analytics":     "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
  "google-sheets":        "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
  "telegram-bot":         "bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400",
  "bale-bot":             "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
  "smtp-email":           "bg-orange-50 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400",
  hesabfa:                "bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400",
  santral:                "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
};

// ─── Config field definitions ─────────────────────────────
type FieldDef = { label: string; field: string; placeholder: string; secret: boolean; ltr?: boolean };

const FIELDS: Record<string, FieldDef[]> = {
  "ai-openai": [
    { label: "API Key", field: "apiKey", placeholder: "sk-...", secret: true, ltr: true },
    { label: "Proxy / Base URL", field: "proxyUrl", placeholder: "https://api.openai.com/v1", secret: false, ltr: true },
  ],
  "ai-anthropic": [
    { label: "API Key", field: "apiKey", placeholder: "sk-ant-...", secret: true, ltr: true },
    { label: "Proxy / Base URL", field: "proxyUrl", placeholder: "https://api.anthropic.com", secret: false, ltr: true },
  ],
  "ai-google": [
    { label: "API Key", field: "apiKey", placeholder: "AIza...", secret: true, ltr: true },
    { label: "Proxy / Base URL", field: "proxyUrl", placeholder: "https://generativelanguage.googleapis.com", secret: false, ltr: true },
  ],
  wordpress: [
    { label: "آدرس سایت", field: "apiUrl", placeholder: "https://dashtzad.com", secret: false, ltr: true },
    { label: "نام کاربری", field: "username", placeholder: "dz-admin", secret: false, ltr: true },
    { label: "Application Password", field: "apiKey", placeholder: "xxxx xxxx xxxx xxxx", secret: true, ltr: true },
  ],
  woocommerce: [
    { label: "آدرس فروشگاه", field: "storeUrl", placeholder: "https://dashtzad.com", secret: false, ltr: true },
    { label: "Consumer Key", field: "consumerKey", placeholder: "ck_...", secret: true, ltr: true },
    { label: "Consumer Secret", field: "consumerSecret", placeholder: "cs_...", secret: true, ltr: true },
  ],
  kavenegar: [
    { label: "API Key", field: "apiKey", placeholder: "کلید API کاوه‌نگار", secret: true, ltr: true },
    { label: "Base URL", field: "baseUrl", placeholder: "https://api.kavenegar.com/v1", secret: false, ltr: true },
    { label: "خط ارسال (Sender)", field: "sender", placeholder: "10002063", secret: false, ltr: true },
  ],
  msgway: [
    { label: "API Key", field: "apiKey", placeholder: "کلید API MSGway", secret: true, ltr: true },
    { label: "Template ID", field: "templateId", placeholder: "22200", secret: false, ltr: true },
  ],
  "google-custom-search": [
    { label: "API Key", field: "apiKey", placeholder: "AIza...", secret: true, ltr: true },
    { label: "Search Engine ID (CX)", field: "cx", placeholder: "a1b2c3d4e5f6g7h8i", secret: false, ltr: true },
  ],
  "google-search-console": [
    { label: "Verification Code", field: "code", placeholder: "کد تأیید Google", secret: false, ltr: true },
    { label: "Property URL", field: "propertyUrl", placeholder: "https://dashtzad.com/", secret: false, ltr: true },
  ],
  "google-analytics": [
    { label: "Property ID", field: "propertyId", placeholder: "123456789", secret: false, ltr: true },
    { label: "Measurement ID", field: "measurementId", placeholder: "G-XXXXXXXXXX", secret: false, ltr: true },
  ],
  "google-sheets": [
    { label: "Sheet ID", field: "sheetId", placeholder: "1A2b3C4d5E…XyZ", secret: false, ltr: true },
    { label: "API Key", field: "apiKey", placeholder: "AIza...", secret: true, ltr: true },
  ],
  "telegram-bot": [
    { label: "Bot Token", field: "botToken", placeholder: "1234567890:AAxx...", secret: true, ltr: true },
    { label: "Proxy / Base URL", field: "proxyUrl", placeholder: "https://api.telegram.org", secret: false, ltr: true },
    { label: "Chat ID", field: "chatId", placeholder: "-1001234567890", secret: false, ltr: true },
  ],
  "bale-bot": [
    { label: "Bot Token", field: "botToken", placeholder: "توکن ربات بله", secret: true, ltr: true },
    { label: "Chat ID", field: "chatId", placeholder: "1234567890", secret: false, ltr: true },
  ],
  "smtp-email": [
    { label: "SMTP Host", field: "host", placeholder: "smtp.dashtzad.com", secret: false, ltr: true },
    { label: "Port", field: "port", placeholder: "465", secret: false, ltr: true },
    { label: "Username", field: "user", placeholder: "no-reply@dashtzad.com", secret: false, ltr: true },
    { label: "Password", field: "pass", placeholder: "••••••••••••", secret: true, ltr: true },
    { label: "From Email", field: "fromEmail", placeholder: "no-reply@dashtzad.com", secret: false, ltr: true },
    { label: "From Name", field: "fromName", placeholder: "خشکبار دشت‌زاد", secret: false },
  ],
  hesabfa: [
    { label: "API Key",             field: "apiKey",              placeholder: "hf_live_…",  secret: true,  ltr: true },
    { label: "Login Token",         field: "loginToken",          placeholder: "eyJ…",        secret: true,  ltr: true },
    { label: "وضعیت ثبت فاکتور",   field: "invoiceTriggerStatus", placeholder: "DELIVERED",  secret: false, ltr: true },
    { label: "کد بانک پیش‌فرض",    field: "defaultBankCode",     placeholder: "001",         secret: false, ltr: true },
    { label: "کد فروشنده",          field: "salesmanCode",        placeholder: "S01",         secret: false, ltr: true },
    { label: "کد پروژه",            field: "projectCode",         placeholder: "PR01",        secret: false, ltr: true },
    { label: "درصد کارمزد تراکنش", field: "transactionFeePercent", placeholder: "0",         secret: false, ltr: true },
    { label: "فاکتور پیش‌نویس",    field: "invoiceDraft",        placeholder: "false",       secret: false, ltr: true },
  ],
  santral: [
    { label: "کلید API وب‌سرویس", field: "apiKey", placeholder: "wsk_live_…", secret: true, ltr: true },
    { label: "شماره سانترال", field: "pbxNumber", placeholder: "02192002661", secret: false, ltr: true },
    { label: "داخلی پیش‌فرض (برای OTP)", field: "extension", placeholder: "101", secret: false, ltr: true },
  ],
};

// ─── State types ──────────────────────────────────────────
type TestState = "idle" | "testing" | "ok" | "fail";
type SaveState = "idle" | "saving" | "ok" | "fail";

// services that support test message sending
const MSG_TEST_KEYS = ["kavenegar", "msgway", "telegram-bot", "bale-bot"] as const;
type MsgTestKey = (typeof MSG_TEST_KEYS)[number];
function isMsgTestKey(k: string): k is MsgTestKey {
  return (MSG_TEST_KEYS as readonly string[]).includes(k);
}
const SMS_KEYS = ["kavenegar", "msgway"] as const;
function isSmsKey(k: string) { return (SMS_KEYS as readonly string[]).includes(k); }

// ─── Status badge ─────────────────────────────────────────
function StateBadge({ state, testState }: { state: IntegrationState; testState: TestState }) {
  if (testState === "testing")
    return (
      <span className="flex items-center gap-1 rounded-full bg-dz-a-warning/15 px-2 py-0.5 text-[10px] font-bold text-dz-a-warning">
        <span className="size-1.5 animate-pulse rounded-full bg-dz-a-warning" />
        تست…
      </span>
    );
  if (testState === "ok")
    return (
      <span className="flex items-center gap-1 rounded-full bg-dz-a-success/15 px-2 py-0.5 text-[10px] font-bold text-dz-a-success">
        <span className="size-1.5 rounded-full bg-dz-a-success" />
        متصل
      </span>
    );
  if (testState === "fail")
    return (
      <span className="flex items-center gap-1 rounded-full bg-dz-a-error/15 px-2 py-0.5 text-[10px] font-bold text-dz-a-error">
        <span className="size-1.5 rounded-full bg-dz-a-error" />
        خطا
      </span>
    );

  if (state === "connected")
    return (
      <span className="flex items-center gap-1 rounded-full bg-dz-a-success/15 px-2 py-0.5 text-[10px] font-bold text-dz-a-success">
        <span className="size-1.5 rounded-full bg-dz-a-success" />
        متصل
      </span>
    );
  if (state === "disabled")
    return (
      <span className="flex items-center gap-1 rounded-full bg-dz-a-warning/15 px-2 py-0.5 text-[10px] font-bold text-dz-a-warning">
        <span className="size-1.5 rounded-full bg-dz-a-warning" />
        خاموش
      </span>
    );
  if (state === "pending")
    return (
      <span className="flex items-center gap-1 rounded-full bg-dz-a-primary-100 px-2 py-0.5 text-[10px] font-bold text-dz-a-primary-400 dark:bg-white/5 dark:text-dz-a-night-faint">
        <span className="size-1.5 rounded-full bg-dz-a-primary-300 dark:bg-dz-a-night-faint" />
        در انتظار
      </span>
    );
  return (
    <span className="flex items-center gap-1 rounded-full bg-dz-a-primary-100 px-2 py-0.5 text-[10px] font-bold text-dz-a-primary-400 dark:bg-white/5 dark:text-dz-a-night-faint">
      <span className="size-1.5 rounded-full bg-dz-a-primary-200 dark:bg-dz-a-night-border" />
      متصل نیست
    </span>
  );
}

// ─── Single field input row ───────────────────────────────
function FieldInput({
  def,
  isSet,
  integrationKey,
  onSaved,
}: {
  def: FieldDef;
  isSet: boolean;
  integrationKey: string;
  onSaved: () => void;
}) {
  const [value, setValue] = useState("");
  const [showText, setShowText] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMsg, setSaveMsg] = useState("");
  const [, startTransition] = useTransition();

  const handleSave = () => {
    if (!value.trim()) return;
    setSaveState("saving");
    startTransition(async () => {
      const result = await saveIntegrationConfigAction(integrationKey, def.field, value);
      setSaveState(result.ok ? "ok" : "fail");
      setSaveMsg(result.message);
      if (result.ok) {
        setValue("");
        onSaved();
      }
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-muted">
          {def.label}
        </label>
        {isSet && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-dz-a-success/10 px-2 py-0.5 text-[10px] font-medium text-dz-a-success">
            <span className="size-1.5 rounded-full bg-dz-a-success" />
            تنظیم شده
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={def.secret && !showText ? "password" : "text"}
            dir={def.ltr ? "ltr" : undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            placeholder={isSet ? "برای تغییر وارد کنید…" : def.placeholder}
            className="focus-ring w-full rounded-xl border border-dz-a-primary-200 bg-white px-3 py-2 text-sm text-dz-a-fg dark:text-dz-a-night-fg placeholder:text-dz-a-fg-ghost dark:placeholder:text-dz-a-night-faint focus:border-dz-a-primary-400 dark:border-dz-a-night-border dark:bg-dz-a-night dark:focus:border-dz-a-primary-400"
          />
          {def.secret && (
            <button
              type="button"
              onClick={() => setShowText((v) => !v)}
              aria-label={showText ? "پنهان کردن" : "نمایش"}
              className="absolute inset-e-2 top-1/2 -translate-y-1/2 p-1 text-dz-a-primary-300 hover:text-dz-a-primary-500 dark:text-dz-a-night-faint"
            >
              {showText ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!value.trim() || saveState === "saving"}
          aria-label="ذخیره"
          className="focus-ring flex items-center gap-1.5 rounded-xl bg-dz-a-primary-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dz-a-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveState === "saving" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Save className="size-3.5" />
          )}
        </button>
      </div>
      {saveState === "ok" && (
        <p className="flex items-center gap-1 text-xs text-dz-a-success">
          <CheckCircle2 className="size-3.5" /> {saveMsg}
        </p>
      )}
      {saveState === "fail" && (
        <p className="flex items-center gap-1 text-xs text-dz-a-error">
          <XCircle className="size-3.5" /> {saveMsg}
        </p>
      )}
    </div>
  );
}

// ─── Left-side slide panel ────────────────────────────────
function IntegrationPanel({
  integration,
  configStatus,
  testState,
  testMessage,
  onTest,
  onClose,
  onConfigSaved,
}: {
  integration: IntegrationStatus | null;
  configStatus: Record<string, boolean>;
  testState: TestState;
  testMessage: string;
  onTest: () => void;
  onClose: () => void;
  onConfigSaved: () => void;
}) {
  const isOpen = !!integration;
  const Icon = integration ? (ICON_MAP[integration.key] ?? Plug) : Plug;
  const iconColor = integration ? (ICON_COLOR[integration.key] ?? "bg-dz-a-primary-50 text-dz-a-primary-600") : "";
  const fields = integration ? (FIELDS[integration.key] ?? []) : [];
  const canTest = integration?.state !== "pending";
  const showMsgTest = integration ? isMsgTestKey(integration.key) : false;

  const [sendRecipient, setSendRecipient] = useState("");
  const [sendState, setSendState] = useState<TestState>("idle");
  const [sendMsg, setSendMsg] = useState("");
  const [, startSendTransition] = useTransition();

  const handleSendTest = () => {
    if (!integration) return;
    setSendState("testing");
    startSendTransition(async () => {
      const result = await sendTestMessageAction(integration.key, sendRecipient);
      setSendState(result.ok ? "ok" : "fail");
      setSendMsg(result.message);
    });
  };

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel — slides from visual LEFT (CSS physical left) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={integration?.label ?? "تنظیمات اتصال"}
        className={`fixed inset-y-0 left-0 z-50 flex w-110 max-w-[92vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-dz-a-night-elevated ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {integration && (
          <>
            {/* Panel header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-dz-a-primary-100 px-5 py-4 dark:border-dz-a-night-border">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconColor}`}>
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
                  {integration.label}
                </h3>
                <p className="font-mono text-[11px] text-dz-a-fg-faint dark:text-dz-a-night-faint" dir="ltr">
                  {integration.tag}
                </p>
              </div>
              <StateBadge state={integration.state} testState={testState} />
              <button
                type="button"
                onClick={onClose}
                aria-label="بستن"
                className="focus-ring shrink-0 rounded-lg p-1.5 text-dz-a-primary-400 transition-colors hover:bg-dz-a-primary-50 hover:text-dz-a-primary-600 dark:hover:bg-white/5"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="flex flex-col gap-5">
                {/* Config fields */}
                {fields.length > 0 && (
                  <div className="flex flex-col gap-4 rounded-2xl border border-dz-a-primary-100 bg-dz-a-primary-50/40 p-4 dark:border-dz-a-night-border dark:bg-white/5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-dz-a-fg-muted dark:text-dz-a-night-faint">
                      تنظیمات اتصال
                    </p>
                    {fields.map((def) => (
                      <FieldInput
                        key={def.field}
                        def={def}
                        isSet={configStatus[def.field] ?? false}
                        integrationKey={integration.key}
                        onSaved={onConfigSaved}
                      />
                    ))}
                  </div>
                )}

                {/* Status note */}
                <div className="rounded-2xl border border-dz-a-primary-100 bg-dz-a-primary-50/40 p-4 dark:border-dz-a-night-border dark:bg-white/5">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-dz-a-fg-muted dark:text-dz-a-night-faint">
                    وضعیت
                  </p>
                  <p className="text-sm leading-relaxed text-dz-a-primary-600 dark:text-dz-a-night-muted">
                    {testState !== "idle" && testMessage ? testMessage : integration.note}
                  </p>
                  {testState === "ok" && (
                    <p className="mt-2.5 flex items-center gap-1.5 text-sm font-medium text-dz-a-success">
                      <CheckCircle2 className="size-4" /> اتصال موفق
                    </p>
                  )}
                  {testState === "fail" && (
                    <p className="mt-2.5 flex items-center gap-1.5 text-sm font-medium text-dz-a-error">
                      <XCircle className="size-4" /> اتصال ناموفق
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Test message section (SMS / messaging bots) */}
            {showMsgTest && (
              <div className="mx-5 mb-4 rounded-2xl border border-dz-a-primary-100 bg-dz-a-primary-50/40 p-4 dark:border-dz-a-night-border dark:bg-white/5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-dz-a-fg-muted dark:text-dz-a-night-faint">
                  {isSmsKey(integration?.key ?? "") ? "ارسال پیامک آزمایشی" : "ارسال پیام آزمایشی"}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    value={sendRecipient}
                    onChange={(e) =>
                      setSendRecipient(
                        e.target.value
                          .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
                          .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
                      )
                    }
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendTest(); }}
                    placeholder={
                      isSmsKey(integration?.key ?? "")
                        ? "09xxxxxxxxx"
                        : "Chat ID (یا خالی = ذخیره‌شده)"
                    }
                    className="focus-ring min-w-0 flex-1 rounded-xl border border-dz-a-primary-200 bg-white px-3 py-2 text-sm text-dz-a-fg dark:text-dz-a-night-fg placeholder:text-dz-a-fg-ghost dark:placeholder:text-dz-a-night-faint dark:border-dz-a-night-border dark:bg-dz-a-night"
                  />
                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={sendState === "testing"}
                    className="focus-ring flex shrink-0 items-center gap-1.5 rounded-xl border border-dz-a-primary-300 bg-white px-3 py-2 text-sm font-medium text-dz-a-primary-700 transition-colors hover:bg-dz-a-primary-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dz-a-night-border dark:bg-dz-a-night-elevated dark:text-dz-a-night-fg dark:hover:bg-white/5"
                  >
                    {sendState === "testing" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </button>
                </div>
                {sendState === "ok" && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-dz-a-success">
                    <CheckCircle2 className="size-3.5" /> {sendMsg}
                  </p>
                )}
                {sendState === "fail" && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-dz-a-error">
                    <XCircle className="size-3.5" /> {sendMsg}
                  </p>
                )}
              </div>
            )}

            {/* Sticky footer */}
            <div className="shrink-0 border-t border-dz-a-primary-100 bg-dz-a-primary-50/60 px-5 py-4 dark:border-dz-a-night-border dark:bg-dz-a-night-card">
              {canTest ? (
                <button
                  type="button"
                  onClick={onTest}
                  disabled={testState === "testing"}
                  className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-dz-a-primary-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-dz-a-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {testState === "testing" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      در حال تست اتصال…
                    </>
                  ) : (
                    <>
                      <Zap className="size-4" />
                      تست اتصال
                    </>
                  )}
                </button>
              ) : (
                <p className="text-center text-xs text-dz-a-fg-faint dark:text-dz-a-night-faint">
                  این سرویس هنوز آماده‌ی تست اتصال نیست.
                </p>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

// ─── Service card ─────────────────────────────────────────
function IntegrationCard({
  integration,
  testState,
  onClick,
}: {
  integration: IntegrationStatus;
  testState: TestState;
  onClick: () => void;
}) {
  const Icon = ICON_MAP[integration.key] ?? Plug;
  const iconColor = ICON_COLOR[integration.key] ?? "bg-dz-a-primary-50 text-dz-a-primary-600";
  const isConnected = integration.state === "connected" || testState === "ok";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring group flex w-full flex-col gap-3 rounded-2xl border bg-white p-4 text-start shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-card dark:bg-dz-a-night-card ${
        isConnected
          ? "border-emerald-200/60 dark:border-emerald-800/40"
          : "border-dz-a-primary-100 hover:border-dz-a-primary-200 dark:border-dz-a-night-border dark:hover:border-dz-a-night-line"
      }`}
    >
      {/* Top row: icon + badge */}
      <div className="flex items-start justify-between gap-2">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-opacity group-hover:opacity-90 ${iconColor}`}>
          <Icon className="size-5" />
        </div>
        <StateBadge state={integration.state} testState={testState} />
      </div>

      {/* Name + tag */}
      <div>
        <p className="font-heading text-sm font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
          {integration.label}
        </p>
        <p className="mt-0.5 truncate font-mono text-[10px] text-dz-a-fg-ghost dark:text-dz-a-night-faint" dir="ltr">
          {integration.tag}
        </p>
      </div>

      {/* Settings hint (visible on hover) */}
      <div className="mt-auto flex items-center gap-1 text-[11px] text-dz-a-fg-ghost opacity-0 transition-opacity group-hover:opacity-100 dark:text-dz-a-night-faint">
        <Settings className="size-3 shrink-0" />
        <span>{integration.state === "connected" ? "پیکربندی" : "اتصال"}</span>
      </div>
    </button>
  );
}

// ─── Main export ──────────────────────────────────────────
export function IntegrationStatusList({
  integrations,
  configStatus,
}: {
  integrations: IntegrationStatus[];
  configStatus: Record<string, Record<string, boolean>>;
}) {
  const [selected, setSelected] = useState<IntegrationStatus | null>(null);
  const [testStates, setTestStates] = useState<Record<string, { state: TestState; message: string }>>({});
  const [, startTransition] = useTransition();

  const byKey = Object.fromEntries(integrations.map((it) => [it.key, it]));
  const getTestState = (key: string): TestState => testStates[key]?.state ?? "idle";
  const getTestMessage = (key: string): string => testStates[key]?.message ?? "";

  const runTest = (key: string) => {
    setTestStates((prev) => ({ ...prev, [key]: { state: "testing", message: "" } }));
    startTransition(async () => {
      const result = await testIntegrationAction(key);
      setTestStates((prev) => ({
        ...prev,
        [key]: { state: result.ok ? "ok" : "fail", message: result.message },
      }));
    });
  };

  const connectedCount = integrations.filter((it) => it.state === "connected").length;
  const totalCount = integrations.length;
  const pct = Math.round((connectedCount / totalCount) * 100);

  return (
    <>
      {/* ── Header ── */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">
            مدیریت اتصالات
          </h2>
          <p className="mt-0.5 text-sm text-dz-a-primary-500 dark:text-dz-a-night-muted">
            <span className="font-bold text-dz-a-primary-700 dark:text-dz-a-night-fg">{connectedCount}</span>{" "}
            از {totalCount} سرویس متصل است
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-dz-a-primary-100 dark:bg-dz-a-night-border">
            <div
              className="h-full rounded-full bg-dz-a-success transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-dz-a-primary-500 tabular-nums dark:text-dz-a-night-muted">
            {pct}٪
          </span>
        </div>
      </div>

      {/* ── Groups ── */}
      <div className="flex flex-col gap-7">
        {GROUPS.map((group) => {
          const groupIntegrations = group.keys
            .map((k) => byKey[k])
            .filter((it): it is IntegrationStatus => Boolean(it));
          if (groupIntegrations.length === 0) return null;

          const groupConnected = groupIntegrations.filter(
            (it) => it.state === "connected",
          ).length;

          return (
            <div key={group.key}>
              {/* Group header */}
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-sm font-bold text-dz-a-primary-600 dark:text-dz-a-night-muted">
                  {group.title}
                </h3>
                <span className="rounded-full border border-dz-a-primary-100 bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-dz-a-primary-500 dark:border-dz-a-night-border dark:bg-dz-a-night-card dark:text-dz-a-night-faint" dir="ltr">
                  {groupConnected}/{groupIntegrations.length}
                </span>
                <div className="h-px flex-1 bg-dz-a-primary-100 dark:bg-dz-a-night-border" />
              </div>

              {/* 3-column grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {groupIntegrations.map((it) => (
                  <IntegrationCard
                    key={it.key}
                    integration={it}
                    testState={getTestState(it.key)}
                    onClick={() => setSelected(it)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Slide panel ── */}
      <IntegrationPanel
        integration={selected}
        configStatus={selected ? (configStatus[selected.key] ?? {}) : {}}
        testState={selected ? getTestState(selected.key) : "idle"}
        testMessage={selected ? getTestMessage(selected.key) : ""}
        onTest={() => selected && runTest(selected.key)}
        onClose={() => setSelected(null)}
        onConfigSaved={() => setSelected(null)}
      />
    </>
  );
}
