// ============================================================
// Integration status — server-only. Reports whether each external
// service is CONFIGURED (checks DB + env — no values exposed).
// ============================================================

import "server-only";
import { getIntegrationConfigStatus } from "./integration-config";

export type IntegrationState = "connected" | "not-configured" | "disabled" | "pending";

export type IntegrationGroup =
  | "هوش مصنوعی"
  | "سایت و فروشگاه"
  | "پیامک و تماس"
  | "سرویس‌های گوگل"
  | "پیام‌رسان و ایمیل"
  | "مالی و سانترال";

export type IntegrationStatus = {
  key: string;
  label: string;
  tag: string;
  group: IntegrationGroup;
  state: IntegrationState;
  note: string;
};

// Primary field that determines "connected" state for each integration.
const PRIMARY_FIELD: Record<string, string> = {
  "ai-openai": "apiKey", "ai-anthropic": "apiKey", "ai-google": "apiKey",
  wordpress: "apiUrl", woocommerce: "consumerKey",
  kavenegar: "apiKey", msgway: "apiKey",
  "google-custom-search": "apiKey", "google-search-console": "code",
  "google-analytics": "measurementId", "google-sheets": "sheetId",
  "telegram-bot": "botToken", "bale-bot": "botToken",
  "smtp-email": "host", hesabfa: "apiKey", santral: "apiKey",
};

// Services that are "disabled" by default when not configured (vs "not-configured").
const DISABLED_BY_DEFAULT = new Set(["google-custom-search", "google-analytics"]);

export async function getIntegrationStatuses(): Promise<IntegrationStatus[]> {
  const configStatus = await getIntegrationConfigStatus();

  const isSet = (key: string): boolean => {
    const field = PRIMARY_FIELD[key] ?? "apiKey";
    return configStatus[key]?.[field] === true;
  };

  const state = (key: string): IntegrationState => {
    if (isSet(key)) return "connected";
    return DISABLED_BY_DEFAULT.has(key) ? "disabled" : "not-configured";
  };

  return [
    // ─── هوش مصنوعی ────────────────────────────────────────
    {
      key: "ai-openai", label: "OpenAI", tag: "api.openai.com",
      group: "هوش مصنوعی", state: state("ai-openai"),
      note: isSet("ai-openai") ? "کلید تنظیم شده است." : "OPENAI_API_KEY تنظیم نشده است.",
    },
    {
      key: "ai-anthropic", label: "Claude", tag: "api.anthropic.com",
      group: "هوش مصنوعی", state: state("ai-anthropic"),
      note: isSet("ai-anthropic") ? "کلید تنظیم شده است." : "ANTHROPIC_API_KEY تنظیم نشده است.",
    },
    {
      key: "ai-google", label: "Gemini", tag: "generativelanguage.googleapis.com",
      group: "هوش مصنوعی", state: state("ai-google"),
      note: isSet("ai-google") ? "کلید تنظیم شده است." : "GOOGLE_API_KEY تنظیم نشده است.",
    },

    // ─── سایت و فروشگاه ────────────────────────────────────
    {
      key: "wordpress", label: "WordPress", tag: "wp-json/wp/v2",
      group: "سایت و فروشگاه", state: state("wordpress"),
      note: isSet("wordpress") ? "آدرس سایت وردپرس تنظیم شده است." : "WORDPRESS_API_URL تنظیم نشده است.",
    },
    {
      key: "woocommerce", label: "WooCommerce", tag: "wc/v3",
      group: "سایت و فروشگاه", state: state("woocommerce"),
      note: isSet("woocommerce") ? "Consumer Key تنظیم شده است." : "WOOCOMMERCE_CONSUMER_KEY تنظیم نشده است.",
    },

    // ─── پیامک و تماس ──────────────────────────────────────
    {
      key: "kavenegar", label: "کاوه‌نگار", tag: "api.kavenegar.com",
      group: "پیامک و تماس", state: state("kavenegar"),
      note: isSet("kavenegar") ? "کلید API تنظیم شده است." : "KAVENEGAR_API_KEY تنظیم نشده است.",
    },
    {
      key: "msgway", label: "MSGway", tag: "rest.msgway.com",
      group: "پیامک و تماس", state: state("msgway"),
      note: isSet("msgway") ? "کلید API تنظیم شده است." : "MSGWAY_API_KEY تنظیم نشده است.",
    },

    // ─── سرویس‌های گوگل ────────────────────────────────────
    {
      key: "google-custom-search", label: "Custom Search", tag: "customsearch/v1",
      group: "سرویس‌های گوگل", state: state("google-custom-search"),
      note: isSet("google-custom-search") ? "کلید API تنظیم شده است." : "GOOGLE_CUSTOM_SEARCH_KEY تنظیم نشده است.",
    },
    {
      key: "google-search-console", label: "Search Console", tag: "searchconsole/v1",
      group: "سرویس‌های گوگل", state: state("google-search-console"),
      note: isSet("google-search-console") ? "کد تأیید تنظیم شده است." : "GOOGLE_SITE_VERIFICATION تنظیم نشده است.",
    },
    {
      key: "google-analytics", label: "Google Analytics", tag: "GA4 Data API",
      group: "سرویس‌های گوگل", state: state("google-analytics"),
      note: isSet("google-analytics") ? "Property ID تنظیم شده است." : "GOOGLE_ANALYTICS_ID تنظیم نشده است.",
    },
    {
      key: "google-sheets", label: "Google Sheets", tag: "sheets/v4",
      group: "سرویس‌های گوگل", state: state("google-sheets"),
      note: isSet("google-sheets") ? "کلید API تنظیم شده است." : "GOOGLE_SHEETS_API_KEY تنظیم نشده است.",
    },

    // ─── پیام‌رسان و ایمیل ─────────────────────────────────
    {
      key: "telegram-bot", label: "Telegram Bot", tag: "api.telegram.org",
      group: "پیام‌رسان و ایمیل", state: state("telegram-bot"),
      note: isSet("telegram-bot") ? "توکن ربات تنظیم شده است." : "TELEGRAM_BOT_TOKEN تنظیم نشده است.",
    },
    {
      key: "bale-bot", label: "Bale Bot", tag: "tapi.bale.ai",
      group: "پیام‌رسان و ایمیل", state: state("bale-bot"),
      note: isSet("bale-bot") ? "توکن ربات تنظیم شده است." : "BALE_BOT_TOKEN تنظیم نشده است.",
    },
    {
      key: "smtp-email", label: "SMTP Email", tag: "smtp",
      group: "پیام‌رسان و ایمیل", state: state("smtp-email"),
      note: isSet("smtp-email") ? "سرور SMTP تنظیم شده است." : "SMTP_HOST تنظیم نشده است.",
    },

    // ─── مالی و سانترال ────────────────────────────────────
    {
      key: "hesabfa", label: "حسابفا", tag: "api.hesabfa.com",
      group: "مالی و سانترال", state: state("hesabfa"),
      note: isSet("hesabfa") ? "کلید API تنظیم شده است." : "HESABFA_API_KEY تنظیم نشده است.",
    },
    {
      key: "santral", label: "سانترال همکاران", tag: "hamkaran.cloud",
      group: "مالی و سانترال", state: state("santral"),
      note: isSet("santral") ? "کلید API همکاران تنظیم شده است." : "SANTRAL_API_KEY تنظیم نشده است.",
    },
  ];
}

export const INTEGRATION_GROUP_ORDER: IntegrationGroup[] = [
  "هوش مصنوعی",
  "سایت و فروشگاه",
  "پیامک و تماس",
  "سرویس‌های گوگل",
  "پیام‌رسان و ایمیل",
  "مالی و سانترال",
];
