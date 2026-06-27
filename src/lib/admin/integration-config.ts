import "server-only";
import { prisma } from "@/lib/prisma";

const DB_KEY = "integrationConfig";

type IntegrationConfig = Record<string, Record<string, string | undefined>>;
type FieldMap = Record<string, Record<string, string | undefined>>;

async function readConfig(): Promise<IntegrationConfig> {
  try {
    const row = await prisma.globalSetting.findUnique({ where: { key: DB_KEY } });
    return (row?.data as IntegrationConfig) ?? {};
  } catch {
    return {};
  }
}

async function writeConfig(config: IntegrationConfig): Promise<void> {
  await prisma.globalSetting.upsert({
    where: { key: DB_KEY },
    update: { data: config as object },
    create: { key: DB_KEY, data: config as object },
  });
}

const ENV_MAP: FieldMap = {
  // هوش مصنوعی
  "ai-openai": { apiKey: process.env.OPENAI_API_KEY },
  "ai-anthropic": { apiKey: process.env.ANTHROPIC_API_KEY },
  "ai-google": { apiKey: process.env.GOOGLE_API_KEY },

  // سایت و فروشگاه
  wordpress: {
    apiUrl: process.env.WORDPRESS_API_URL,
    username: process.env.WORDPRESS_USERNAME,
    apiKey: process.env.WORDPRESS_APP_PASSWORD,
  },
  woocommerce: {
    storeUrl: process.env.WOOCOMMERCE_STORE_URL,
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  },

  // پیامک و تماس
  kavenegar: {
    apiKey: process.env.KAVENEGAR_API_KEY,
    sender: process.env.KAVENEGAR_SENDER,
  },
  msgway: {
    apiKey: process.env.MSGWAY_API_KEY,
    templateId: process.env.MSGWAY_TEMPLATE_ID,
  },

  // سرویس‌های گوگل
  "google-custom-search": {
    apiKey: process.env.GOOGLE_CUSTOM_SEARCH_KEY,
    cx: process.env.GOOGLE_CUSTOM_SEARCH_CX,
  },
  "google-search-console": {
    code: process.env.GOOGLE_SITE_VERIFICATION,
    propertyUrl: process.env.GOOGLE_SEARCH_CONSOLE_PROPERTY,
  },
  "google-analytics": {
    propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
    measurementId: process.env.GOOGLE_ANALYTICS_ID,
  },
  "google-sheets": {
    sheetId: process.env.GOOGLE_SHEETS_ID,
    apiKey: process.env.GOOGLE_SHEETS_API_KEY,
  },

  // پیام‌رسان و ایمیل
  "telegram-bot": {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
  "bale-bot": {
    botToken: process.env.BALE_BOT_TOKEN,
    chatId: process.env.BALE_CHAT_ID,
  },
  "smtp-email": {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromEmail: process.env.SMTP_FROM_EMAIL,
    fromName: process.env.SMTP_FROM_NAME,
  },

  // مالی و سانترال
  hesabfa: {
    apiKey:     process.env.HESABFA_API_KEY,
    loginToken: process.env.HESABFA_LOGIN_TOKEN,
  },
  santral: {
    apiKey:    process.env.SANTRAL_API_KEY,
    pbxNumber: process.env.SANTRAL_PBX_NUMBER,
    extension: process.env.SANTRAL_EXTENSION,
  },

  // legacy (backward compat — not shown in new UI)
  zarinpal: { merchantId: process.env.ZARINPAL_MERCHANT_ID },
  rahpayam: { apiKey: process.env.RAHPAYAM_API_KEY },
  "google-verification": { code: process.env.GOOGLE_SITE_VERIFICATION },
};

/**
 * Returns which fields are set per integration (DB value takes priority over env var).
 * Actual values are NEVER exposed — only boolean presence.
 */
export async function getIntegrationConfigStatus(): Promise<Record<string, Record<string, boolean>>> {
  const config = await readConfig();
  const db = config as FieldMap;
  const result: Record<string, Record<string, boolean>> = {};
  for (const [intKey, fields] of Object.entries(ENV_MAP)) {
    result[intKey] = {};
    for (const fieldKey of Object.keys(fields)) {
      result[intKey][fieldKey] = !!(db[intKey]?.[fieldKey] || fields[fieldKey]);
    }
  }
  return result;
}

/**
 * Returns the effective value for a field (DB first, env fallback).
 * Used server-side only (test actions, etc.).
 */
export async function getEffectiveValue(integrationKey: string, field: string): Promise<string | undefined> {
  const config = await readConfig();
  const db = config as FieldMap;
  return db[integrationKey]?.[field] ?? ENV_MAP[integrationKey]?.[field];
}

/** Persist a single field to DB. */
export async function saveIntegrationField(
  integrationKey: string,
  field: string,
  value: string,
): Promise<void> {
  const config = await readConfig();
  const db = config as FieldMap;
  const updated: IntegrationConfig = {
    ...config,
    [integrationKey]: { ...(db[integrationKey] ?? {}), [field]: value },
  };
  await writeConfig(updated);
}
