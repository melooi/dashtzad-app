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

    case "wordpress": {
      const apiUrl = await getEffectiveValue("wordpress", "apiUrl");
      if (!apiUrl) return { ok: false, message: "آدرس سایت تنظیم نشده است." };
      try {
        const res = await fetch(`${apiUrl.replace(/\/$/, "")}/wp-json/wp/v2/types`, {
          signal: AbortSignal.timeout(6000),
        });
        return res.ok
          ? { ok: true, message: "اتصال به WordPress REST API برقرار است." }
          : { ok: false, message: `خطا از سرور WordPress: ${res.status}` };
      } catch {
        return { ok: false, message: "اتصال به WordPress برقرار نشد." };
      }
    }

    case "woocommerce": {
      const storeUrl = await getEffectiveValue("woocommerce", "storeUrl");
      const consumerKey = await getEffectiveValue("woocommerce", "consumerKey");
      const consumerSecret = await getEffectiveValue("woocommerce", "consumerSecret");
      if (!storeUrl || !consumerKey || !consumerSecret)
        return { ok: false, message: "اطلاعات WooCommerce ناقص است." };
      try {
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
        const res = await fetch(`${storeUrl.replace(/\/$/, "")}/wp-json/wc/v3/system_status`, {
          headers: { Authorization: `Basic ${auth}` },
          signal: AbortSignal.timeout(6000),
        });
        return res.ok
          ? { ok: true, message: "اتصال به WooCommerce برقرار است." }
          : { ok: false, message: `خطا از سرور WooCommerce: ${res.status}` };
      } catch {
        return { ok: false, message: "اتصال به WooCommerce برقرار نشد." };
      }
    }

    case "kavenegar": {
      const apiKey = await getEffectiveValue("kavenegar", "apiKey");
      if (!apiKey) return { ok: false, message: "کلید API تنظیم نشده است." };
      try {
        const res = await fetch(`https://api.kavenegar.com/v1/${apiKey}/account/info.json`, {
          signal: AbortSignal.timeout(6000),
        });
        return res.ok
          ? { ok: true, message: "اتصال به کاوه‌نگار برقرار است." }
          : { ok: false, message: `خطا از سرور کاوه‌نگار: ${res.status}` };
      } catch {
        return { ok: false, message: "اتصال به کاوه‌نگار برقرار نشد." };
      }
    }

    case "msgway": {
      const apiKey = await getEffectiveValue("msgway", "apiKey");
      return apiKey
        ? { ok: true, message: "کلید API MSGway موجود است." }
        : { ok: false, message: "MSGWAY_API_KEY تنظیم نشده است." };
    }

    case "google-search-console": {
      const code = await getEffectiveValue("google-search-console", "code");
      return code
        ? { ok: true, message: "کد تأیید Google Search Console موجود است." }
        : { ok: false, message: "کد تأیید تنظیم نشده است." };
    }

    case "google-custom-search": {
      const apiKey = await getEffectiveValue("google-custom-search", "apiKey");
      const cx = await getEffectiveValue("google-custom-search", "cx");
      if (!apiKey || !cx) return { ok: false, message: "API Key و CX هر دو لازم هستند." };
      try {
        const res = await fetch(
          `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=test&num=1`,
          { signal: AbortSignal.timeout(6000) },
        );
        return res.ok
          ? { ok: true, message: "اتصال به Google Custom Search برقرار است." }
          : { ok: false, message: `خطا از سرور Google: ${res.status}` };
      } catch {
        return { ok: false, message: "اتصال به Google Custom Search برقرار نشد." };
      }
    }

    case "google-analytics": {
      const id = await getEffectiveValue("google-analytics", "measurementId");
      return id
        ? { ok: true, message: `Measurement ID (${id}) موجود است.` }
        : { ok: false, message: "GOOGLE_ANALYTICS_ID تنظیم نشده است." };
    }

    case "google-sheets": {
      const sheetId = await getEffectiveValue("google-sheets", "sheetId");
      return sheetId
        ? { ok: true, message: "Sheet ID موجود است." }
        : { ok: false, message: "GOOGLE_SHEETS_ID تنظیم نشده است." };
    }

    case "telegram-bot": {
      const botToken = await getEffectiveValue("telegram-bot", "botToken");
      if (!botToken) return { ok: false, message: "توکن ربات تنظیم نشده است." };
      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`, {
          signal: AbortSignal.timeout(6000),
        });
        const data = (await res.json()) as { ok: boolean; result?: { username?: string } };
        return data.ok
          ? { ok: true, message: `ربات @${data.result?.username ?? "unknown"} متصل است.` }
          : { ok: false, message: "توکن ربات تلگرام نامعتبر است." };
      } catch {
        return { ok: false, message: "اتصال به Telegram برقرار نشد." };
      }
    }

    case "bale-bot": {
      const botToken = await getEffectiveValue("bale-bot", "botToken");
      if (!botToken) return { ok: false, message: "توکن ربات تنظیم نشده است." };
      try {
        const res = await fetch(`https://tapi.bale.ai/bot${botToken}/getMe`, {
          signal: AbortSignal.timeout(6000),
        });
        const data = (await res.json()) as { ok: boolean; result?: { username?: string } };
        return data.ok
          ? { ok: true, message: `ربات بله متصل است.` }
          : { ok: false, message: "توکن ربات بله نامعتبر است." };
      } catch {
        return { ok: false, message: "اتصال به بله برقرار نشد." };
      }
    }

    case "smtp-email": {
      const host = await getEffectiveValue("smtp-email", "host");
      return host
        ? { ok: true, message: `سرور SMTP (${host}) پیکربندی شده است.` }
        : { ok: false, message: "SMTP_HOST تنظیم نشده است." };
    }

    case "hesabfa": {
      const [apiKey, loginToken] = await Promise.all([
        getEffectiveValue("hesabfa", "apiKey"),
        getEffectiveValue("hesabfa", "loginToken"),
      ]);
      if (!apiKey) return { ok: false, message: "کلید API تنظیم نشده است." };
      if (!loginToken) return { ok: false, message: "Login Token تنظیم نشده است." };
      try {
        const res = await fetch("https://api.hesabfa.com/v1/contact/getContacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey, loginToken,
            queryInfo: { sortBy: "Id", sortDesc: true, take: 1, skip: 0, filters: [] },
          }),
          signal: AbortSignal.timeout(8000),
        });
        const json = await res.json().catch(() => null);
        if (json?.Success === true) return { ok: true, message: "اتصال به حسابفا برقرار است." };
        const errMsg = json?.ErrorMessage ?? (res.ok ? "پاسخ نامعتبر" : `خطا: ${res.status}`);
        return { ok: false, message: errMsg };
      } catch {
        return { ok: false, message: "اتصال به حسابفا برقرار نشد." };
      }
    }

    case "santral": {
      const apiKey = await getEffectiveValue("santral", "apiKey");
      if (!apiKey) return { ok: false, message: "کلید API همکاران تنظیم نشده است." };
      try {
        const today = new Date().toISOString().slice(0, 10);
        const res = await fetch(
          `https://api.hamkaran.cloud/api/hamkaran/v1/reports?datefrom=${today}&dateto=${today}&page=1`,
          { headers: { key: apiKey }, signal: AbortSignal.timeout(8000) },
        );
        if (res.ok) return { ok: true, message: "اتصال به سانترال همکاران برقرار است." };
        if (res.status === 401 || res.status === 403) return { ok: false, message: "کلید API نامعتبر است (Access denied)." };
        return { ok: false, message: `خطا از سانترال: ${res.status}` };
      } catch {
        return { ok: false, message: "اتصال به api.hamkaran.cloud ناموفق بود." };
      }
    }

    default:
      return { ok: false, message: "این سرویس هنوز قابل تست نیست." };
  }
}

export async function sendTestMessageAction(
  key: string,
  recipient: string,
): Promise<TestResult> {
  await requireAdmin();
  const to = recipient.trim();

  switch (key) {
    case "kavenegar": {
      const apiKey = await getEffectiveValue("kavenegar", "apiKey");
      const sender = await getEffectiveValue("kavenegar", "sender");
      if (!apiKey) return { ok: false, message: "کلید API تنظیم نشده است." };
      if (!to) return { ok: false, message: "شمارهٔ تلفن گیرنده را وارد کنید." };
      try {
        const params = new URLSearchParams({
          receptor: to,
          message: "پیام آزمایشی از پنل مدیریت دشت‌زاد",
          ...(sender ? { sender } : {}),
        });
        const res = await fetch(
          `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
            signal: AbortSignal.timeout(8000),
          },
        );
        const data = (await res.json()) as { return?: { status: number; message: string } };
        const status = data.return?.status ?? res.status;
        return status === 200
          ? { ok: true, message: `پیامک آزمایشی به ${to} ارسال شد.` }
          : { ok: false, message: data.return?.message ?? `خطا: ${status}` };
      } catch {
        return { ok: false, message: "ارسال پیامک ناموفق بود." };
      }
    }

    case "msgway": {
      const apiKey = await getEffectiveValue("msgway", "apiKey");
      const templateId = await getEffectiveValue("msgway", "templateId");
      if (!apiKey) return { ok: false, message: "کلید API تنظیم نشده است." };
      if (!templateId) return { ok: false, message: "Template ID تنظیم نشده است." };
      if (!to) return { ok: false, message: "شمارهٔ تلفن گیرنده را وارد کنید." };
      const mobile = to.startsWith("0") ? "+98" + to.slice(1) : to;
      const code = String(Math.floor(1000 + Math.random() * 9000));
      try {
        const res = await fetch("https://api.msgway.com/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", apiKey },
          body: JSON.stringify({ mobile, method: "sms", templateID: Number(templateId), code }),
          signal: AbortSignal.timeout(8000),
        });
        const data = (await res.json()) as { status?: string; error?: { code?: string; message?: string } };
        return data.status === "success"
          ? { ok: true, message: `پیامک OTP (کد: ${code}) به ${mobile} ارسال شد.` }
          : { ok: false, message: data.error?.message ?? data.error?.code ?? `خطا از MSGway: ${res.status}` };
      } catch {
        return { ok: false, message: "ارسال پیامک MSGway ناموفق بود." };
      }
    }

    case "telegram-bot": {
      const botToken = await getEffectiveValue("telegram-bot", "botToken");
      const savedChatId = await getEffectiveValue("telegram-bot", "chatId");
      const chatId = to || savedChatId;
      if (!botToken) return { ok: false, message: "توکن ربات تنظیم نشده است." };
      if (!chatId) return { ok: false, message: "Chat ID را وارد کنید یا در تنظیمات ذخیره کنید." };
      try {
        const proxyUrl = await getEffectiveValue("telegram-bot", "proxyUrl");
        const base = proxyUrl?.replace(/\/$/, "") ?? "https://api.telegram.org";
        const res = await fetch(`${base}/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: "✅ پیام آزمایشی از پنل مدیریت دشت‌زاد" }),
          signal: AbortSignal.timeout(8000),
        });
        const data = (await res.json()) as { ok: boolean; description?: string };
        return data.ok
          ? { ok: true, message: `پیام به چت ${chatId} در تلگرام ارسال شد.` }
          : { ok: false, message: data.description ?? "ارسال پیام ناموفق بود." };
      } catch {
        return { ok: false, message: "اتصال به Telegram برقرار نشد." };
      }
    }

    case "bale-bot": {
      const botToken = await getEffectiveValue("bale-bot", "botToken");
      const savedChatId = await getEffectiveValue("bale-bot", "chatId");
      const chatId = to || savedChatId;
      if (!botToken) return { ok: false, message: "توکن ربات تنظیم نشده است." };
      if (!chatId) return { ok: false, message: "Chat ID را وارد کنید یا در تنظیمات ذخیره کنید." };
      try {
        const res = await fetch(`https://tapi.bale.ai/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: "✅ پیام آزمایشی از پنل مدیریت دشت‌زاد" }),
          signal: AbortSignal.timeout(8000),
        });
        const data = (await res.json()) as { ok: boolean; description?: string };
        return data.ok
          ? { ok: true, message: `پیام به چت ${chatId} در بله ارسال شد.` }
          : { ok: false, message: data.description ?? "ارسال پیام ناموفق بود." };
      } catch {
        return { ok: false, message: "اتصال به بله برقرار نشد." };
      }
    }

    default:
      return { ok: false, message: "این سرویس از ارسال پیام آزمایشی پشتیبانی نمی‌کند." };
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
