// ============================================================
// Integration status (PHASE-2). Server-only. Reports whether each external
// service is CONFIGURED based on the presence of its environment variable —
// it NEVER reads or returns the secret value itself. Services without a wired
// backend are reported as "pending" so the UI can show an honest state instead
// of pretending they're connected.
// ============================================================

import "server-only";

export type IntegrationState = "connected" | "not-configured" | "pending";

export type IntegrationStatus = {
  key: string;
  label: string;
  group: "پرداخت" | "پیامک" | "هوش مصنوعی" | "ارسال" | "سئو";
  state: IntegrationState;
  /** short, human-readable note (no secrets). */
  note: string;
};

const has = (v: string | undefined): boolean => Boolean(v && v.trim());

/** Build the integration status list from env presence only. */
export function getIntegrationStatuses(): IntegrationStatus[] {
  const env = process.env;
  return [
    {
      key: "zarinpal",
      label: "درگاه پرداخت زرین‌پال",
      group: "پرداخت",
      state: has(env.ZARINPAL_MERCHANT_ID) ? "connected" : "not-configured",
      note: has(env.ZARINPAL_MERCHANT_ID)
        ? "Merchant ID تنظیم شده است."
        : "ZARINPAL_MERCHANT_ID تنظیم نشده است.",
    },
    {
      key: "kavenegar",
      label: "پیامک کاوه‌نگار (OTP)",
      group: "پیامک",
      state: has(env.KAVENEGAR_API_KEY) ? "connected" : "not-configured",
      note: has(env.KAVENEGAR_API_KEY)
        ? "کلید API تنظیم شده است."
        : "KAVENEGAR_API_KEY تنظیم نشده است.",
    },
    {
      key: "ai-anthropic",
      label: "هوش مصنوعی — Claude",
      group: "هوش مصنوعی",
      state: has(env.ANTHROPIC_API_KEY) ? "connected" : "not-configured",
      note: has(env.ANTHROPIC_API_KEY) ? "کلید تنظیم شده است." : "ANTHROPIC_API_KEY تنظیم نشده است.",
    },
    {
      key: "ai-openai",
      label: "هوش مصنوعی — GPT",
      group: "هوش مصنوعی",
      state: has(env.OPENAI_API_KEY) ? "connected" : "not-configured",
      note: has(env.OPENAI_API_KEY) ? "کلید تنظیم شده است." : "OPENAI_API_KEY تنظیم نشده است.",
    },
    {
      key: "ai-google",
      label: "هوش مصنوعی — Gemini",
      group: "هوش مصنوعی",
      state: has(env.GOOGLE_API_KEY) ? "connected" : "not-configured",
      note: has(env.GOOGLE_API_KEY) ? "کلید تنظیم شده است." : "GOOGLE_API_KEY تنظیم نشده است.",
    },
    {
      key: "google-verification",
      label: "تأیید Google Search Console",
      group: "سئو",
      state: has(env.GOOGLE_SITE_VERIFICATION) ? "connected" : "not-configured",
      note: has(env.GOOGLE_SITE_VERIFICATION)
        ? "کد تأیید تنظیم شده است."
        : "GOOGLE_SITE_VERIFICATION تنظیم نشده است.",
    },
    {
      key: "shipping",
      label: "سرویس حمل‌ونقل (پستکس/تیپاکس)",
      group: "ارسال",
      state: "pending",
      note: "اتصال سرویس حمل‌ونقل هنوز پیاده‌سازی نشده است.",
    },
  ];
}
