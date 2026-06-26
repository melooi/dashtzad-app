import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getAiConfig, isAiConfigured, keyFingerprint } from "@/lib/ai/env";
import { createResponse, createEmbeddings, moderate } from "@/lib/ai/openai-client";
import { logUsage, logError } from "@/lib/ai/usage-logger";
import { toAiError } from "@/lib/ai/errors";
import { toolRegistry } from "@/lib/ai/tool-registry";

// OpenAI calls + secrets require the Node runtime (never Edge).
export const runtime = "nodejs";

/**
 * Admin-only health check for the AI foundation (CP-A). Reports configuration
 * (without ever exposing the key), AI table presence, and — when called with
 * `?live=1` and a key is configured — exercises the Responses, Embeddings and
 * Moderation endpoints with tiny calls so the foundation can be curl-verified
 * end to end. Read-only.
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });
  }

  const cfg = getAiConfig();
  const configured = isAiConfigured();
  const live = new URL(req.url).searchParams.get("live") === "1";

  // AI table counts (proves the migration is applied + client is fresh).
  const [conversations, messages, tools, usageLogs, errorLogs, guardrails] = await Promise.all([
    prisma.aiConversation.count(),
    prisma.aiMessage.count(),
    prisma.aiTool.count(),
    prisma.aiUsageLog.count(),
    prisma.aiErrorLog.count(),
    prisma.aiGuardrailEvent.count(),
  ]);

  const body: Record<string, unknown> = {
    ok: true,
    configured,
    key: configured ? keyFingerprint() : null, // non-reversible fingerprint only
    config: {
      baseUrl: cfg.baseUrl,
      chatModel: cfg.chatModel,
      fastModel: cfg.fastModel,
      analystModel: cfg.analystModel,
      moderationModel: cfg.moderationModel,
      moderationEnabled: cfg.moderationEnabled,
      embeddingModel: cfg.embeddingModel,
      embeddingDimensions: cfg.embeddingDimensions,
      maxOutputTokens: cfg.maxOutputTokens,
    },
    db: {
      aiTables: { conversations, messages, tools, usageLogs, errorLogs, guardrails },
    },
    registry: { toolCount: toolRegistry.list().length },
  };

  if (live) {
    if (!configured) {
      body.live = { skipped: "OPENAI_API_KEY not configured" };
      return NextResponse.json(body);
    }
    body.live = await runLiveChecks(cfg.chatModel);
  }

  return NextResponse.json(body);
}

async function runLiveChecks(chatModel: string) {
  const out: Record<string, unknown> = {};

  // 1) Responses API — tiny prompt.
  try {
    const r = await createResponse({
      input: "پاسخ را فقط با یک کلمه بده: سلام",
      maxOutputTokens: 256,
      reasoningEffort: "low",
      metadata: { purpose: "health" },
    });
    await logUsage({
      operation: "RESPONSE",
      model: r.model,
      tokensInput: r.usage.inputTokens,
      tokensOutput: r.usage.outputTokens,
      latencyMs: r.latencyMs,
      requestId: r.requestId,
    });
    out.responses = {
      ok: true,
      model: r.model,
      sample: r.outputText.slice(0, 80),
      usage: r.usage,
      latencyMs: r.latencyMs,
    };
  } catch (err) {
    const e = toAiError(err);
    await logError({ operation: "RESPONSE", model: chatModel, error: e });
    out.responses = { ok: false, code: e.code, status: e.status };
  }

  // 2) Embeddings — one short string.
  try {
    const emb = await createEmbeddings("زعفران سرگل دشت‌زاد");
    await logUsage({
      operation: "EMBEDDING",
      model: emb.model,
      tokensInput: emb.usage.promptTokens,
      tokensOutput: 0,
    });
    out.embeddings = {
      ok: true,
      model: emb.model,
      dimensions: emb.embeddings[0]?.length ?? 0,
      usage: emb.usage,
    };
  } catch (err) {
    const e = toAiError(err);
    await logError({ operation: "EMBEDDING", error: e });
    out.embeddings = { ok: false, code: e.code, status: e.status };
  }

  // 3) Moderation — benign string (should not be flagged).
  try {
    const mod = await moderate("سلام، می‌خواهم زعفران بخرم.");
    await logUsage({ operation: "MODERATION", model: mod.model });
    out.moderation = { ok: true, model: mod.model, flagged: mod.flagged };
  } catch (err) {
    const e = toAiError(err);
    await logError({ operation: "MODERATION", error: e });
    out.moderation = { ok: false, code: e.code, status: e.status };
  }

  return out;
}
