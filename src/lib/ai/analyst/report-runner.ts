/**
 * Admin analyst engine: collects a DB snapshot → calls gpt-5.5 with Structured
 * Outputs → persists AiAdminReport + AiAdminFinding rows.
 *
 * READ-ONLY. Never mutates product, order, or customer data. Only writes to
 * the ai_admin_reports and ai_admin_findings tables.
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createStructured, zodToStrictJsonSchema } from "@/lib/ai/structured-output";
import { getAiConfig, isAiConfigured } from "@/lib/ai/env";
import { logError } from "@/lib/ai/usage-logger";
import { runAllScans } from "@/lib/ai/analyst/scan-tools";
import type { AiSeverity, AiFindingStatus } from "@/generated/prisma/enums";

// ── Structured Output schema ─────────────────────────────────────────────────

const MODULES = ["inventory", "orders", "customers", "content", "chat", "pricing"] as const;
const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "QUICK_WIN", "INFO"] as const;

const FindingSchema = z.object({
  module: z.enum(MODULES),
  severity: z.enum(SEVERITIES),
  title: z.string(),
  description: z.string(),
  recommendation: z.string(),
  suggestedAction: z.string(),
});

const ReportOutputSchema = z.object({
  executiveSummary: z.string(),
  findings: z.array(FindingSchema),
});

type ReportOutput = z.infer<typeof ReportOutputSchema>;

// ── Prompt ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `تو یک تحلیلگر کسب‌وکار ارشد برای دشت‌زاد هستی — فروشگاه اینترنتی مواد غذایی ایرانی پرمیوم که از سال ۱۳۱۳ فعالیت دارد. یک اسنپشات عملیاتی از دیتابیس به تو داده شده. آن را دقیق تحلیل کن و یک گزارش سلامت کسب‌وکار ساختاریافته به زبان فارسی تولید کن.

قوانین:
- هر مشکل باید بر اساس داده واقعی باشد؛ چیزی را اختراع نکن.
- سطوح شدت: CRITICAL (نیاز فوری)، HIGH (بهبود اورژانسی)، MEDIUM (باید زود اصلاح شود)، LOW (خوب‌ست اصلاح شود)، QUICK_WIN (سریع و تاثیرگذار)، INFO (اطلاعاتی).
- اقدامات توصیه‌شده باید عینی و قابل‌اجرا باشند.
- خلاصه اجرایی: ۲-۳ جمله از وضعیت کلی فروشگاه.
- مجموعاً ۵ تا ۱۲ یافته — مهم‌ترین‌ها را انتخاب کن.
- suggestedAction: اگر اقدامی مشخص وجود دارد بنویس، وگرنه رشته خالی برگردان.
- همه متن‌ها فارسی باشند.`;

function buildPrompt(snapshotJson: string): string {
  return `اسنپشات دیتابیس دشت‌زاد:\n\n${snapshotJson}\n\nلطفاً گزارش تحلیلی ساختاریافته تولید کن.`;
}

// ── Runner ───────────────────────────────────────────────────────────────────

export type RunReportResult =
  | { ok: true; reportId: string }
  | { ok: false; error: string };

export async function runReport(
  reportId: string,
  generatedById: string | null,
): Promise<RunReportResult> {
  if (!isAiConfigured()) {
    const msg = "کلید OpenAI پیکربندی نشده است. برای اجرای گزارش OPENAI_API_KEY لازم است.";
    await prisma.aiAdminReport.update({
      where: { id: reportId },
      data: { status: "FAILED", errorMessage: msg, completedAt: new Date() },
    });
    return { ok: false, error: msg };
  }

  // Mark running.
  await prisma.aiAdminReport.update({
    where: { id: reportId },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  try {
    // 1. Collect data.
    const snapshot = await runAllScans();
    const snapshotJson = JSON.stringify(snapshot, null, 2);

    // 2. AI analysis.
    const cfg = getAiConfig();
    const result = await createStructured<ReportOutput>({
      model: cfg.analystModel,
      input: buildPrompt(snapshotJson),
      instructions: SYSTEM_PROMPT,
      schemaName: "admin_report",
      jsonSchema: zodToStrictJsonSchema(ReportOutputSchema),
      zodSchema: ReportOutputSchema,
      maxOutputTokens: 4096,
      reasoningEffort: "medium",
    });

    // 3. Persist findings.
    const { executiveSummary, findings } = result.data;

    await prisma.$transaction([
      prisma.aiAdminFinding.createMany({
        data: findings.map((f) => ({
          reportId,
          module: f.module,
          severity: f.severity as AiSeverity,
          title: f.title,
          description: f.description,
          recommendation: f.recommendation,
          suggestedAction: f.suggestedAction || null,
          status: "OPEN" as AiFindingStatus,
        })),
      }),
      prisma.aiAdminReport.update({
        where: { id: reportId },
        data: {
          status: "COMPLETE",
          executiveSummary,
          tokensInput: result.usage.inputTokens,
          tokensOutput: result.usage.outputTokens,
          model: cfg.analystModel,
          generatedById,
          completedAt: new Date(),
        },
      }),
    ]);

    return { ok: true, reportId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logError({ operation: "STRUCTURED", error: err });
    await prisma.aiAdminReport.update({
      where: { id: reportId },
      data: {
        status: "FAILED",
        errorMessage: msg.slice(0, 1000),
        completedAt: new Date(),
      },
    });
    return { ok: false, error: msg };
  }
}
