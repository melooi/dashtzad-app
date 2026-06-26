"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { getEffectiveValue, saveIntegrationField } from "@/lib/admin/integration-config";

export type TestResult = { ok: boolean; message: string };
export type SaveResult = { ok: boolean; message: string };

export async function testIntegrationAction(key: string): Promise<TestResult> {
  await requireAdmin();

  switch (key) {
    case "ai-anthropic": {
      const apiKey = await getEffectiveValue("ai-anthropic", "apiKey");
      if (!apiKey) return { ok: false, message: "کلید API تنظیم نشده است." };
      try {
        const res = await fetch("https://api.anthropic.com/v1/models", {
          headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
          signal: AbortSignal.timeout(6000),
        });
        return res.ok
          ? { ok: true, message: "اتصال به Claude برقرار است." }
          : { ok: false, message: `خطا از سرور Anthropic: ${res.status}` };
      } catch {
        return { ok: false, message: "اتصال به Anthropic برقرار نشد." };
      }
    }
    case "ai-openai": {
      const apiKey = await getEffectiveValue("ai-openai", "apiKey");
      if (!apiKey) return { ok: false, message: "کلید API تنظیم نشده است." };
      try {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(6000),
        });
        return res.ok
          ? { ok: true, message: "اتصال به OpenAI برقرار است." }
          : { ok: false, message: `خطا از سرور OpenAI: ${res.status}` };
      } catch {
        return { ok: false, message: "اتصال به OpenAI برقرار نشد." };
      }
    }
    case "ai-google": {
      const apiKey = await getEffectiveValue("ai-google", "apiKey");
      if (!apiKey) return { ok: false, message: "کلید API تنظیم نشده است." };
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
          { signal: AbortSignal.timeout(6000) },
        );
        return res.ok
          ? { ok: true, message: "اتصال به Gemini برقرار است." }
          : { ok: false, message: `خطا از سرور Google: ${res.status}` };
      } catch {
        return { ok: false, message: "اتصال به Google AI برقرار نشد." };
      }
    }
    case "zarinpal": {
      const val = await getEffectiveValue("zarinpal", "merchantId");
      return val
        ? { ok: true, message: "Merchant ID موجود است. تست واقعی نیاز به تراکنش دارد." }
        : { ok: false, message: "Merchant ID تنظیم نشده است." };
    }
    case "kavenegar": {
      const val = await getEffectiveValue("kavenegar", "apiKey");
      return val
        ? { ok: true, message: "کلید API موجود است." }
        : { ok: false, message: "کلید API تنظیم نشده است." };
    }
    case "google-verification": {
      const val = await getEffectiveValue("google-verification", "code");
      return val
        ? { ok: true, message: "کد تأیید موجود است." }
        : { ok: false, message: "کد تأیید تنظیم نشده است." };
    }
    default:
      return { ok: false, message: "این سرویس هنوز قابل تست نیست." };
  }
}

export async function saveIntegrationConfigAction(
  integrationKey: string,
  field: string,
  value: string,
): Promise<SaveResult> {
  await requireAdmin();
  if (!value.trim()) return { ok: false, message: "مقدار نمی‌تواند خالی باشد." };
  await saveIntegrationField(integrationKey, field, value.trim());
  revalidatePath("/admin/settings");
  return { ok: true, message: "ذخیره شد." };
}
