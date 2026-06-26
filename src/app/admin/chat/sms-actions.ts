"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import {
  createSmsTemplate,
  updateSmsTemplate,
  deleteSmsTemplate,
  sendSms,
  type SmsProvider,
} from "@/lib/sms/service";

type Result = { ok: true } | { ok: false; error: string };

// ── Template CRUD ──────────────────────────────────────────────────────────

const templateSchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  provider: z.enum(["kavenegar", "rahpayam"]),
  type: z.enum(["free", "pattern"]),
  body: z.string().optional(),
  patternName: z.string().optional(),
  templateId: z.string().optional(),
  category: z.enum(["general", "cart", "product", "notification"]).default("general"),
});

export async function createSmsTemplateAction(data: unknown): Promise<Result> {
  await requireAdmin();
  const parsed = templateSchema.safeParse(data);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "داده نامعتبر" };

  await createSmsTemplate(parsed.data as Parameters<typeof createSmsTemplate>[0]);
  revalidatePath("/admin/chat");
  return { ok: true };
}

export async function updateSmsTemplateAction(id: string, data: unknown): Promise<Result> {
  await requireAdmin();
  const parsed = templateSchema.partial().safeParse(data);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "داده نامعتبر" };

  await updateSmsTemplate(id, parsed.data);
  revalidatePath("/admin/chat");
  return { ok: true };
}

export async function deleteSmsTemplateAction(id: string): Promise<Result> {
  await requireAdmin();
  await deleteSmsTemplate(id);
  revalidatePath("/admin/chat");
  return { ok: true };
}

// ── Manual send ───────────────────────────────────────────────────────────

const sendSchema = z.object({
  to: z.string().min(10, "شماره نامعتبر"),
  provider: z.enum(["kavenegar", "rahpayam"]),
  body: z.string().optional(),
  patternName: z.string().optional(),
  templateId: z.string().optional(),
  tokens: z.array(z.string()).optional(),
  conversationId: z.string().optional(),
  smsTemplateId: z.string().optional(),
});

export async function sendSmsAction(data: unknown): Promise<Result & { referenceId?: string }> {
  await requireAdmin();
  const parsed = sendSchema.safeParse(data);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "داده نامعتبر" };

  const result = await sendSms({
    ...parsed.data,
    provider: parsed.data.provider as SmsProvider,
  });
  return result.ok ? { ok: true, referenceId: result.referenceId } : result;
}
