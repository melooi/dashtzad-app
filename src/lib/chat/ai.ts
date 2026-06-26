// CHAT-CP2 — AI copilot: drafts a Persian support reply for the operator to
// edit and send. Supports three providers — Anthropic (Claude), OpenAI (GPT)
// and Google (Gemini) — chosen automatically from the configured model id.
// Each calls its REST API directly via fetch (no SDK dependency). Disabled
// gracefully when the matching key / toggle is missing.

import { getChatSettings } from "@/lib/admin/global-service";
import { getAdminConversation } from "@/lib/chat/service";
import type { AiConvInsight } from "@/lib/chat/types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const GOOGLE_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export type AiProvider = "anthropic" | "openai" | "google";

/** Derive the provider from the model id (single source of truth). */
export function providerForModel(model: string): AiProvider {
  if (model.startsWith("gpt") || model.startsWith("o1") || model.startsWith("o3")) return "openai";
  if (model.startsWith("gemini")) return "google";
  return "anthropic";
}

function apiKeyForProvider(provider: AiProvider): string | undefined {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY;
    case "google":
      return process.env.GOOGLE_API_KEY;
    default:
      return process.env.ANTHROPIC_API_KEY;
  }
}

const PROVIDER_LABEL: Record<AiProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_API_KEY",
};

/** Is the key for a given provider present? Defaults to Anthropic for back-compat. */
export function isAiConfigured(provider: AiProvider = "anthropic"): boolean {
  return Boolean(apiKeyForProvider(provider));
}

export type AiSuggestResult = { ok: true; draft: string } | { ok: false; error: string };

// ---- provider response extractors ----------------------------------------

function extractAnthropic(data: unknown): string {
  if (data && typeof data === "object" && "content" in data) {
    const content = (data as { content?: unknown }).content;
    if (Array.isArray(content)) {
      return content
        .filter(
          (b): b is { type: string; text: string } =>
            !!b &&
            typeof b === "object" &&
            (b as { type?: unknown }).type === "text" &&
            typeof (b as { text?: unknown }).text === "string",
        )
        .map((b) => b.text)
        .join("")
        .trim();
    }
  }
  return "";
}

function extractOpenAI(data: unknown): string {
  const choices = (data as { choices?: unknown })?.choices;
  if (Array.isArray(choices)) {
    const msg = (choices[0] as { message?: { content?: unknown } })?.message?.content;
    if (typeof msg === "string") return msg.trim();
  }
  return "";
}

function extractGoogle(data: unknown): string {
  const candidates = (data as { candidates?: unknown })?.candidates;
  if (Array.isArray(candidates)) {
    const parts = (candidates[0] as { content?: { parts?: unknown } })?.content?.parts;
    if (Array.isArray(parts)) {
      return parts
        .map((p) => (p && typeof (p as { text?: unknown }).text === "string" ? (p as { text: string }).text : ""))
        .join("")
        .trim();
    }
  }
  return "";
}

// ---- provider callers ------------------------------------------------------

async function callAnthropic(apiKey: string, model: string, system: string, userMsg: string): Promise<AiSuggestResult> {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: 1024, system, messages: [{ role: "user", content: userMsg }] }),
  });
  if (!res.ok) return { ok: false, error: "سرویس هوش مصنوعی پاسخ نداد." };
  const data: unknown = await res.json();
  if ((data as { stop_reason?: unknown })?.stop_reason === "refusal")
    return { ok: false, error: "دستیار نتوانست پاسخ تولید کند." };
  const text = extractAnthropic(data);
  return text ? { ok: true, draft: text } : { ok: false, error: "پاسخی تولید نشد." };
}

async function callOpenAI(apiKey: string, model: string, system: string, userMsg: string): Promise<AiSuggestResult> {
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    }),
  });
  if (!res.ok) return { ok: false, error: "سرویس هوش مصنوعی پاسخ نداد." };
  const data: unknown = await res.json();
  const text = extractOpenAI(data);
  return text ? { ok: true, draft: text } : { ok: false, error: "پاسخی تولید نشد." };
}

async function callGoogle(apiKey: string, model: string, system: string, userMsg: string): Promise<AiSuggestResult> {
  const url = `${GOOGLE_BASE}/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: userMsg }] }],
      generationConfig: { maxOutputTokens: 1024 },
    }),
  });
  if (!res.ok) return { ok: false, error: "سرویس هوش مصنوعی پاسخ نداد." };
  const data: unknown = await res.json();
  const text = extractGoogle(data);
  return text ? { ok: true, draft: text } : { ok: false, error: "پاسخی تولید نشد." };
}

// ---- conversation insights -------------------------------------------------

export type AiInsightResult = ({ ok: true } & AiConvInsight) | { ok: false; error: string };

const SENTIMENTS = ["angry", "upset", "neutral", "happy"] as const;
type Sentiment = (typeof SENTIMENTS)[number];

function parseSentiment(s: unknown): Sentiment {
  if (typeof s === "string" && (SENTIMENTS as readonly string[]).includes(s)) return s as Sentiment;
  return "neutral";
}

function tryParseInsight(text: string): AiInsightResult {
  try {
    const clean = text.trim().replace(/^```(?:json)?\s*/m, "").replace(/```\s*$/m, "").trim();
    const json = JSON.parse(clean) as Record<string, unknown>;
    return {
      ok: true,
      topic: typeof json.topic === "string" ? json.topic : "نامشخص",
      sentiment: parseSentiment(json.sentiment),
      summary: typeof json.summary === "string" ? json.summary : "",
      suggestions: Array.isArray(json.suggestions)
        ? (json.suggestions as unknown[]).slice(0, 3).map(String)
        : [],
    };
  } catch {
    return { ok: false, error: "تجزیهٔ پاسخ دستیار ناموفق بود." };
  }
}

export async function suggestConvInsights(conversationId: string): Promise<AiInsightResult> {
  const settings = await getChatSettings();
  if (!settings.aiCopilotEnabled) return { ok: false, error: "دستیار هوش مصنوعی غیرفعال است." };

  const provider = providerForModel(settings.aiModel);
  const apiKey = apiKeyForProvider(provider);
  if (!apiKey) return { ok: false, error: `کلید ${PROVIDER_LABEL[provider]} تنظیم نشده است.` };

  const conv = await getAdminConversation(conversationId);
  if (!conv) return { ok: false, error: "گفت‌وگو یافت نشد." };

  const transcript = conv.messages
    .filter((m) => !m.isInternalNote && m.body.trim())
    .slice(-15)
    .map((m) => {
      const who = m.role === "VISITOR" ? "مشتری" : m.role === "OPERATOR" ? "پشتیبان" : "سیستم";
      return `${who}: ${m.body.trim()}`;
    })
    .join("\n");

  const system =
    "تو دستیار تحلیل گفت‌وگو برای تیم پشتیبانی فروشگاه «دشت‌زاد» (مواد غذایی پرمیوم ایرانی) هستی. خروجی فقط JSON خالص باشد — بدون هیچ توضیح، markdown یا متن اضافه.";
  const userMsg = [
    `گفت‌وگوی مشتری:\n${transcript || "(هنوز پیامی نیست)"}`,
    "",
    'خروجی JSON با این قالب دقیق (sentiment باید یکی از "angry","upset","neutral","happy" باشد):',
    JSON.stringify(
      {
        topic: "موضوع اصلی (۱-۳ کلمه فارسی)",
        sentiment: "angry|upset|neutral|happy",
        summary: "خلاصهٔ ۱-۲ جمله‌ای فارسی",
        suggestions: ["پاسخ کوتاه فارسی ۱", "پاسخ کوتاه فارسی ۲", "پاسخ کوتاه فارسی ۳"],
      },
      null,
      2,
    ),
  ].join("\n");

  try {
    let raw: AiSuggestResult;
    if (provider === "openai") raw = await callOpenAI(apiKey, settings.aiModel, system, userMsg);
    else if (provider === "google") raw = await callGoogle(apiKey, settings.aiModel, system, userMsg);
    else raw = await callAnthropic(apiKey, settings.aiModel, system, userMsg);
    if (!raw.ok) return raw;
    return tryParseInsight(raw.draft);
  } catch {
    return { ok: false, error: "خطا در ارتباط با سرویس هوش مصنوعی." };
  }
}

// ---- draft reply -----------------------------------------------------------

export async function suggestOperatorReply(conversationId: string): Promise<AiSuggestResult> {
  const settings = await getChatSettings();
  if (!settings.aiCopilotEnabled) return { ok: false, error: "دستیار هوش مصنوعی غیرفعال است." };

  const provider = providerForModel(settings.aiModel);
  const apiKey = apiKeyForProvider(provider);
  if (!apiKey) return { ok: false, error: `کلید ${PROVIDER_LABEL[provider]} تنظیم نشده است.` };

  const conv = await getAdminConversation(conversationId);
  if (!conv) return { ok: false, error: "گفت‌وگو یافت نشد." };

  const transcript = conv.messages
    .filter((m) => !m.isInternalNote && (m.body.trim() || m.attachment))
    .slice(-20)
    .map((m) => {
      const who = m.role === "VISITOR" ? "مشتری" : m.role === "OPERATOR" ? "پشتیبان" : "سیستم";
      const text = m.body.trim() || (m.attachment ? `[فایل پیوست: ${m.attachment.name}]` : "");
      return `${who}: ${text}`;
    })
    .join("\n");

  const system = [
    "تو دستیار نگارش پاسخ برای تیم پشتیبانیِ فروشگاه «دشت‌زاد» هستی (مواد غذایی پرمیوم ایرانی: زعفران، آجیل، حبوبات و ادویه؛ از سال ۱۳۱۳).",
    "یک پاسخِ کوتاه، حرفه‌ای، گرم و مودبانه به فارسی بنویس که «اپراتور» بتواند برای مشتری بفرستد. لحن محترمانه و دقیق باشد، بدون اغراق. اگر اطلاعات کافی نیست، یک پرسش شفاف‌کننده بپرس.",
    settings.aiContext.trim() ? `زمینه و لحن برند:\n${settings.aiContext.trim()}` : "",
    "خروجی فقط و فقط متنِ آماده‌ی ارسال باشد؛ هیچ توضیح، مقدمه، عنوان یا علامت نقل‌قول اضافه نکن.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const userMsg = `گفت‌وگوی تا این لحظه:\n\n${transcript || "(هنوز پیامی نیست)"}\n\nحالا بهترین پاسخِ بعدیِ پشتیبان را بنویس.`;

  try {
    if (provider === "openai") return await callOpenAI(apiKey, settings.aiModel, system, userMsg);
    if (provider === "google") return await callGoogle(apiKey, settings.aiModel, system, userMsg);
    return await callAnthropic(apiKey, settings.aiModel, system, userMsg);
  } catch {
    return { ok: false, error: "خطا در ارتباط با سرویس هوش مصنوعی." };
  }
}
