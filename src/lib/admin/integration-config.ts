import "server-only";
import { prisma } from "@/lib/prisma";

const DB_KEY = "integrationConfig";

type IntegrationConfig = {
  zarinpal?: { merchantId?: string };
  kavenegar?: { apiKey?: string };
  rahpayam?: { apiKey?: string };
  "ai-anthropic"?: { apiKey?: string };
  "ai-openai"?: { apiKey?: string };
  "ai-google"?: { apiKey?: string };
  "google-verification"?: { code?: string };
};

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
  zarinpal: { merchantId: process.env.ZARINPAL_MERCHANT_ID },
  kavenegar: { apiKey: process.env.KAVENEGAR_API_KEY },
  rahpayam: { apiKey: process.env.RAHPAYAM_API_KEY },
  "ai-anthropic": { apiKey: process.env.ANTHROPIC_API_KEY },
  "ai-openai": { apiKey: process.env.OPENAI_API_KEY },
  "ai-google": { apiKey: process.env.GOOGLE_API_KEY },
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
