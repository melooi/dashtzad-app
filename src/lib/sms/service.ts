/**
 * SMS service — Kavenegar + RahPayam (MessageWay)
 *
 * Provider is determined from the integration config.
 * Both providers are called via their REST APIs without any extra SDK.
 */

import { prisma } from "@/lib/prisma";
import { getEffectiveValue } from "@/lib/admin/integration-config";

export type SmsProvider = "kavenegar" | "rahpayam";

export type SmsSendInput = {
  to: string;                 // recipient phone (e.g. "09123456789")
  body?: string;              // free-text (for type=free)
  patternName?: string;       // kavenegar verify/lookup pattern name
  templateId?: string;        // rahpayam template ID
  tokens?: string[];          // up to 10 variable values
  provider: SmsProvider;
  conversationId?: string;
  smsTemplateId?: string;
};

export type SmsSendResult =
  | { ok: true; referenceId: string }
  | { ok: false; error: string };

// ── Kavenegar ──────────────────────────────────────────────────────────────

async function sendKavenegar(input: SmsSendInput): Promise<SmsSendResult> {
  const apiKey = await getEffectiveValue("kavenegar", "apiKey");
  if (!apiKey) return { ok: false, error: "کلید API کاوه‌نگار تنظیم نشده است." };

  let url: string;
  let params: Record<string, string>;

  if (input.patternName && input.tokens?.length) {
    // Pattern / OTP endpoint
    url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`;
    params = { receptor: input.to, template: input.patternName, token: input.tokens[0] };
    input.tokens.slice(1, 10).forEach((t, i) => { params[`token${i + 2}`] = t; });
  } else if (input.body) {
    // Free-text send
    url = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`;
    params = { receptor: input.to, message: input.body };
  } else {
    return { ok: false, error: "متن یا نام قالب الزامی است." };
  }

  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${url}?${query}`, { method: "GET" });
  const json = await res.json().catch(() => null);

  if (!res.ok || json?.return?.status !== 200) {
    const msg = json?.return?.message ?? `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }

  const msgid = String(json?.entries?.[0]?.messageid ?? "");
  return { ok: true, referenceId: msgid };
}

// ── RahPayam / MessageWay ──────────────────────────────────────────────────

async function sendRahpayam(input: SmsSendInput): Promise<SmsSendResult> {
  const apiKey = await getEffectiveValue("rahpayam", "apiKey");
  if (!apiKey) return { ok: false, error: "کلید API راه‌پیام تنظیم نشده است." };
  if (!input.templateId) return { ok: false, error: "شناسه قالب راه‌پیام الزامی است." };

  const body = {
    method: "sms",
    mobile: input.to,
    templateID: Number(input.templateId),
    params: input.tokens ?? [],
  };

  const res = await fetch("https://api.msgway.com/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", apiKey, "accept-language": "fa" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);

  if (!res.ok || json?.status !== 200) {
    const msg = json?.message ?? `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }

  return { ok: true, referenceId: String(json?.referenceID ?? "") };
}

// ── Public send ───────────────────────────────────────────────────────────

export async function sendSms(input: SmsSendInput): Promise<SmsSendResult> {
  const result =
    input.provider === "kavenegar"
      ? await sendKavenegar(input)
      : await sendRahpayam(input);

  // Log every attempt
  await prisma.smsLog.create({
    data: {
      provider: input.provider,
      to: input.to,
      body: input.body ?? input.patternName ?? input.templateId,
      status: result.ok ? "sent" : "failed",
      error: result.ok ? null : result.error,
      conversationId: input.conversationId ?? null,
      templateId: input.smsTemplateId ?? null,
    },
  });

  return result;
}

// ── Template CRUD ──────────────────────────────────────────────────────────

export async function listSmsTemplates() {
  return prisma.smsTemplate.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getSmsTemplate(id: string) {
  return prisma.smsTemplate.findUnique({ where: { id } });
}

export async function createSmsTemplate(data: {
  name: string;
  provider: SmsProvider;
  type: "free" | "pattern";
  body?: string;
  patternName?: string;
  templateId?: string;
  category: string;
}) {
  return prisma.smsTemplate.create({ data });
}

export async function updateSmsTemplate(
  id: string,
  data: Partial<{
    name: string;
    provider: string;
    type: string;
    body: string;
    patternName: string;
    templateId: string;
    category: string;
    isActive: boolean;
  }>
) {
  return prisma.smsTemplate.update({ where: { id }, data });
}

export async function deleteSmsTemplate(id: string) {
  return prisma.smsTemplate.delete({ where: { id } });
}

export async function listSmsLogs(limit = 50) {
  return prisma.smsLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { template: { select: { name: true } } },
  });
}

// ── Variable expansion ─────────────────────────────────────────────────────

export function expandSmsVariables(
  body: string,
  vars: {
    userName?: string;
    userPhone?: string;
    chatUrl?: string;
    adminName?: string;
  }
): string {
  return body
    .replace(/#userName#/g, vars.userName ?? "")
    .replace(/#userPhone#/g, vars.userPhone ?? "")
    .replace(/#chatUrl#/g, vars.chatUrl ?? "")
    .replace(/#adminName#/g, vars.adminName ?? "");
}
