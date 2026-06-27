import { getChatSettings } from "@/lib/admin/global-service";
import { getAdminConversation } from "./service";
import type { ConversationSentiment, ConversationAiPriority, AiNextAction } from "./types";

// ---- provider helpers ----

type AiProvider = "openai" | "anthropic" | "google";

export function providerForModel(model: string): AiProvider {
  if (/^(gpt|o1|o3|o4|chatgpt)/.test(model)) return "openai";
  if (/^gemini/.test(model)) return "google";
  return "anthropic";
}

export function isAiConfigured(provider: AiProvider): boolean {
  if (provider === "openai") return !!process.env.OPENAI_API_KEY;
  if (provider === "google") return !!process.env.GOOGLE_API_KEY;
  return !!process.env.ANTHROPIC_API_KEY;
}

export type AiSuggestResult = { ok: true; draft: string } | { ok: false; error: string };

// ---- raw callers ----

async function callAnthropic(model: string, system: string, user: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({ model, max_tokens: 1024, system, messages: [{ role: "user", content: user }] }),
  });
  const data = await res.json();
  return data?.content?.[0]?.text ?? "";
}

async function callOpenAI(model: string, system: string, user: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

async function callGoogle(model: string, system: string, user: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: 1024 },
    }),
  });
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callAi(provider: AiProvider, model: string, system: string, user: string): Promise<string> {
  if (provider === "openai") return callOpenAI(model, system, user);
  if (provider === "google") return callGoogle(model, system, user);
  return callAnthropic(model, system, user);
}

// ---- reply suggestion ----

export async function suggestOperatorReply(conversationId: string): Promise<AiSuggestResult> {
  const settings = await getChatSettings();
  if (!settings.aiCopilotEnabled) return { ok: false, error: "AI غیرفعال است." };
  const provider = providerForModel(settings.aiModel);
  if (!isAiConfigured(provider)) return { ok: false, error: "کلید API تنظیم نشده." };

  const conv = await getAdminConversation(conversationId);
  if (!conv) return { ok: false, error: "مکالمه پیدا نشد." };

  const transcript = conv.messages
    .filter((m) => !m.isInternalNote)
    .slice(-20)
    .map((m) => {
      const role = m.role === "VISITOR" ? "مشتری" : m.role === "OPERATOR" ? "اپراتور" : "سیستم";
      return `${role}: ${m.body}`;
    })
    .join("\n");

  const system = [
    "تو دستیار پشتیبانی دشت‌زاد هستی — فروشگاه ایرانی محصولات غذایی کشاورزی از ۱۳۱۳.",
    "یک پاسخ کوتاه، حرفه‌ای و صمیمی فارسی برای اپراتور بنویس.",
    settings.aiContext ? `زمینه اضافی: ${settings.aiContext}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const draft = await callAi(
      provider,
      settings.aiModel,
      system,
      `تاریخچه:\n${transcript}\n\nبهترین پاسخ بعدی را بنویس:`
    );
    return { ok: true, draft: draft.trim() };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ---- conversation analysis ----

export type ConversationAnalysis = {
  sentiment: ConversationSentiment;
  priority: ConversationAiPriority;
  topicLabel: string;
  summary: string;
  nextAction: AiNextAction | null;
};

export type AnalyzeResult =
  | { ok: true; analysis: ConversationAnalysis }
  | { ok: false; error: string };

const ANALYZE_SYSTEM = `تو یک سیستم تحلیل‌گر مکالمات پشتیبانی فارسی هستی.
مکالمه بین مشتری و اپراتور دشت‌زاد (فروشگاه محصولات غذایی ایرانی) را بررسی کن.

دقیقاً یک JSON بدون کامنت و بدون توضیح برگردان:
{
  "sentiment": "ANGRY" | "UPSET" | "NEUTRAL" | "HAPPY",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "topicLabel": "یک برچسب کوتاه فارسی (حداکثر ۴ کلمه)",
  "summary": "خلاصه ۱-۲ جمله‌ای فارسی از موضوع مکالمه",
  "nextAction": null | {
    "icon": "PackageSearch" | "FileText" | "RotateCcw" | "ShoppingCart" | "Tag" | "MessageCircle",
    "label": "متن دکمه (حداکثر ۵ کلمه)",
    "type": "tracking" | "order" | "invoice" | "replace" | "pricelist" | "custom",
    "detail": "توضیح کوتاه برای اپراتور",
    "template": "متن پیام آماده برای ارسال"
  }
}

قوانین:
- ANGRY: مشتری عصبانی یا ناراحت شدید
- UPSET: مشتری ناراحت یا نگران
- NEUTRAL: مشتری بی‌طرف یا اطلاعاتی
- HAPPY: مشتری راضی یا سپاسگزار
- HIGH: شکایت، مشکل پرداخت، مرجوعی، مشکل ارسال
- MEDIUM: سوال محصول، تأخیر جزئی، درخواست اطلاعات
- LOW: سوال عمومی، تعریف، پیگیری ساده
- nextAction=null اگر مکالمه حل شده یا نیاز به اقدام فوری نیست`;

export async function analyzeConversation(conversationId: string): Promise<AnalyzeResult> {
  const settings = await getChatSettings();
  if (!settings.aiCopilotEnabled) return { ok: false, error: "AI غیرفعال است." };
  const provider = providerForModel(settings.aiModel);
  if (!isAiConfigured(provider)) return { ok: false, error: "کلید API تنظیم نشده." };

  const conv = await getAdminConversation(conversationId);
  if (!conv) return { ok: false, error: "مکالمه پیدا نشد." };

  const transcript = conv.messages
    .filter((m) => !m.isInternalNote && m.role !== "SYSTEM")
    .slice(-30)
    .map((m) => {
      const role = m.role === "VISITOR" ? "مشتری" : "اپراتور";
      return `${role}: ${m.body}`;
    })
    .join("\n");

  if (!transcript) return { ok: false, error: "پیامی برای تحلیل وجود ندارد." };

  try {
    const raw = await callAi(
      provider,
      settings.aiModel,
      ANALYZE_SYSTEM,
      `مکالمه:\n${transcript}\n\nتحلیل JSON:`
    );
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { ok: false, error: "خروجی AI قابل پردازش نیست." };
    const parsed = JSON.parse(match[0]) as ConversationAnalysis;
    return { ok: true, analysis: parsed };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
