/**
 * Persistent observability for every model and tool interaction.
 *
 * - `logUsage`       -> ai_usage_logs  (tokens, latency, estimated cost)
 * - `logError`       -> ai_error_logs  (typed failures)
 * - `logGuardrail`   -> ai_guardrail_events (moderation / PII / rate-limit / tool gates)
 *
 * Logging is best-effort: a failure to write a log must NEVER break the user
 * interaction, so every write is wrapped and swallowed (with a console warning).
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
  AiGuardrailAction,
  AiGuardrailType,
  AiOperation,
  AiSeverity,
} from "@/generated/prisma/enums";
import { AiError } from "@/lib/ai/errors";
import type { UsageLogInput } from "@/lib/ai/types";

/**
 * Approximate OpenAI prices in **micro-USD per token** (1 USD = 1e6 µUSD).
 * Sourced from the public pricing page; used only for internal cost estimates,
 * so small drift is acceptable. Unknown models fall back to the flagship rate.
 */
const PRICE_MICRO_USD_PER_TOKEN: Record<string, { in: number; out: number }> = {
  "gpt-5.5": { in: 5, out: 30 },
  "gpt-5.5-pro": { in: 30, out: 180 },
  "gpt-5.4": { in: 5, out: 30 },
  "gpt-5.2": { in: 1.75, out: 14 },
  "gpt-5.2-pro": { in: 30, out: 180 },
  "gpt-5": { in: 1.25, out: 10 },
  "text-embedding-3-small": { in: 0.02, out: 0 },
  "text-embedding-3-large": { in: 0.13, out: 0 },
  "omni-moderation-latest": { in: 0, out: 0 },
};

function priceFor(model: string): { in: number; out: number } {
  if (PRICE_MICRO_USD_PER_TOKEN[model]) return PRICE_MICRO_USD_PER_TOKEN[model];
  // Prefix match (e.g. "gpt-5.5-2026-04-24" -> "gpt-5.5").
  const prefix = Object.keys(PRICE_MICRO_USD_PER_TOKEN)
    .filter((m) => model.startsWith(m))
    .sort((a, b) => b.length - a.length)[0];
  if (prefix) return PRICE_MICRO_USD_PER_TOKEN[prefix];
  if (model.startsWith("text-embedding")) return { in: 0.02, out: 0 };
  if (model.startsWith("omni-moderation")) return { in: 0, out: 0 };
  return { in: 5, out: 30 };
}

/** Estimate the cost of a call in integer micro-USD. */
export function estimateCostMicroUsd(model: string, tokensIn: number, tokensOut: number): number {
  const p = priceFor(model);
  return Math.round(tokensIn * p.in + tokensOut * p.out);
}

export async function logUsage(entry: UsageLogInput): Promise<void> {
  const tokensInput = entry.tokensInput ?? 0;
  const tokensOutput = entry.tokensOutput ?? 0;
  try {
    await prisma.aiUsageLog.create({
      data: {
        conversationId: entry.conversationId ?? null,
        messageId: entry.messageId ?? null,
        operation: entry.operation,
        model: entry.model,
        tokensInput,
        tokensOutput,
        totalTokens: tokensInput + tokensOutput,
        latencyMs: entry.latencyMs ?? null,
        costMicroUsd: estimateCostMicroUsd(entry.model, tokensInput, tokensOutput),
        success: entry.success ?? true,
        requestId: entry.requestId ?? null,
      },
    });
  } catch (err) {
    console.warn("[ai/usage-logger] failed to write usage log:", err);
  }
}

export interface ErrorLogInput {
  conversationId?: string | null;
  operation?: AiOperation | null;
  model?: string | null;
  error: unknown;
}

export async function logError(entry: ErrorLogInput): Promise<void> {
  const err = entry.error;
  const isAi = err instanceof AiError;
  const message = err instanceof Error ? err.message : String(err);
  const code = isAi ? (err as AiError).code : err instanceof Error ? err.name : "unknown";
  const details: Record<string, unknown> = {};
  if (isAi) {
    const ai = err as AiError;
    if (ai.status !== undefined) details.status = ai.status;
    if (ai.requestId) details.requestId = ai.requestId;
    if (ai.details !== undefined) details.details = ai.details;
  }
  try {
    await prisma.aiErrorLog.create({
      data: {
        conversationId: entry.conversationId ?? null,
        operation: entry.operation ?? null,
        model: entry.model ?? null,
        code,
        message: message.slice(0, 2000),
        detailsJson: Object.keys(details).length
          ? (details as Prisma.InputJsonValue)
          : undefined,
      },
    });
  } catch (e) {
    console.warn("[ai/usage-logger] failed to write error log:", e);
  }
}

export interface GuardrailLogInput {
  conversationId?: string | null;
  messageId?: string | null;
  type: AiGuardrailType;
  action: AiGuardrailAction;
  severity?: AiSeverity | null;
  details?: unknown;
}

export async function logGuardrail(entry: GuardrailLogInput): Promise<void> {
  try {
    await prisma.aiGuardrailEvent.create({
      data: {
        conversationId: entry.conversationId ?? null,
        messageId: entry.messageId ?? null,
        type: entry.type,
        action: entry.action,
        severity: entry.severity ?? null,
        detailsJson:
          entry.details === undefined
            ? undefined
            : (entry.details as Prisma.InputJsonValue),
      },
    });
  } catch (err) {
    console.warn("[ai/usage-logger] failed to write guardrail event:", err);
  }
}
