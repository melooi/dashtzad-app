/**
 * The chat engine: orchestrates a single customer turn end-to-end.
 *
 *   persist user msg -> input moderation -> triage -> [degraded? fallback]
 *   -> streamed Responses call with tools -> tool loop (permission-checked,
 *   logged) -> output moderation -> persist assistant msg -> usage log.
 *
 * Yields typed `WireEvent`s for SSE. NEVER throws to the caller and NEVER 500s:
 * any failure degrades to a safe Persian fallback + human-handoff offer, so the
 * frontend keeps working and the existing live-chat remains the safety net.
 */

import type { AiToolCategory } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { aiAvailable, AI_UNAVAILABLE_MESSAGE } from "@/lib/ai/availability";
import { getAiConfig } from "@/lib/ai/env";
import { streamResponse } from "@/lib/ai/openai-client";
import { toAiError } from "@/lib/ai/errors";
import { screenText } from "@/lib/ai/moderation";
import { logUsage, logError } from "@/lib/ai/usage-logger";
import { safetyIdentifier } from "@/lib/ai/guardrails";
import { triageMessage, toDbPriority } from "@/lib/ai/intent";
import { supportAssistantPrompt } from "@/lib/ai/prompts";
import { toolRegistry, type ToolActor, type ToolContext } from "@/lib/ai/tool-registry";
import { ensureToolsRegistered } from "@/lib/ai/tools";
import { appendAiMessage, setConversationMeta } from "@/lib/ai/chat-session";
import type { AiFunctionCall, AiInputMessage, AiUsage } from "@/lib/ai/types";
import type { WireEvent } from "@/lib/ai/sse";

ensureToolsRegistered();

const MAX_TOOL_ROUNDS = 4;
const HISTORY_LIMIT = 10;
const BLOCKED_MESSAGE =
  "متأسفم، نمی‌توانم به این پیام پاسخ بدهم. اگر سؤال دیگری درباره‌ی محصولات یا سفارش‌تان دارید، خوشحال می‌شوم کمک کنم.";

export interface ChatTurnOptions {
  conversationId: string;
  userText: string;
  actor: ToolActor;
  /** Tool categories enabled by the Chat Center settings. */
  enabledToolCategories?: AiToolCategory[];
  /** Persona/system instructions (defaults to the support assistant prompt). */
  instructions?: string;
  /** Stable per-user identifier for OpenAI safety monitoring. */
  safetySeed?: string | null;
  /**
   * Whether AI can serve this turn (settings toggle AND key present). Defaults
   * to the global availability when omitted. When false, the degraded fallback
   * is returned.
   */
  available?: boolean;
  /** Customizable AI-unavailable message (from Chat Center settings). */
  unavailableMessage?: string;
}

const DEFAULT_CATEGORIES: AiToolCategory[] = ["PRODUCT", "ORDER", "KNOWLEDGE", "CUSTOMER", "SUPPORT"];

export async function* runChatTurn(opts: ChatTurnOptions): AsyncGenerator<WireEvent> {
  const { conversationId, userText, actor } = opts;

  // 1) Persist the user message.
  const userMessage = await appendAiMessage({ conversationId, role: "USER", content: userText });
  yield { event: "meta", data: { conversationId, userMessageId: userMessage.id, aiAvailable: aiAvailable() } };

  // 2) Input moderation (skipped cleanly in degraded mode).
  const inputScreen = await screenText(userText, { conversationId, messageId: userMessage.id, direction: "input" });
  if (!inputScreen.allowed) {
    const blocked = await appendAiMessage({
      conversationId,
      role: "ASSISTANT",
      content: BLOCKED_MESSAGE,
      contentJson: { kind: "blocked" },
      moderationFlagged: true,
    });
    yield { event: "delta", data: { text: BLOCKED_MESSAGE } };
    yield { event: "done", data: { assistantMessageId: blocked.id, finishReason: "blocked" } };
    return;
  }

  // 3) Triage (best-effort; neutral in degraded mode). Update conversation meta.
  const triage = await triageMessage(userText, { conversationId });
  await setConversationMeta(conversationId, {
    intent: triage.intent,
    priority: toDbPriority(triage.priority),
    title: triage.shortTitle || undefined,
  }).catch(() => {});
  yield {
    event: "triage",
    data: { intent: triage.intent, priority: triage.priority, angry: triage.angry, needsHuman: triage.needsHuman },
  };

  // 4) Degraded mode: clear AI_UNAVAILABLE fallback + handoff offer. No 500.
  const canServe = opts.available ?? aiAvailable();
  if (!canServe) {
    const unavailable = opts.unavailableMessage?.trim() || AI_UNAVAILABLE_MESSAGE;
    const msg = await appendAiMessage({
      conversationId,
      role: "ASSISTANT",
      content: unavailable,
      contentJson: { kind: "ai_unavailable" },
    });
    yield { event: "delta", data: { text: unavailable } };
    yield {
      event: "done",
      data: { assistantMessageId: msg.id, finishReason: "ai_unavailable", aiUnavailable: true, suggestHandoff: true },
    };
    return;
  }

  // 5) AI available: build context + tools and run the streamed tool loop.
  try {
    yield* runAiTurn(opts, userMessage.id, triage.angry);
  } catch (err) {
    const e = toAiError(err);
    await logError({ conversationId, operation: "RESPONSE_STREAM", error: e });
    const fallback =
      "همین حالا در پاسخ‌گویی مشکلی پیش آمد. می‌توانم گفت‌وگو را به پشتیبانیِ انسانی منتقل کنم.";
    const msg = await appendAiMessage({
      conversationId,
      role: "ASSISTANT",
      content: fallback,
      contentJson: { kind: "error", code: e.code },
    }).catch(() => null);
    yield { event: "delta", data: { text: fallback } };
    yield {
      event: "done",
      data: { assistantMessageId: msg?.id ?? null, finishReason: "error", suggestHandoff: true },
    };
  }
}

async function* runAiTurn(
  opts: ChatTurnOptions,
  userMessageId: string,
  angry: boolean,
): AsyncGenerator<WireEvent> {
  const { conversationId, userText, actor } = opts;
  const cfg = getAiConfig();
  const categories = opts.enabledToolCategories ?? DEFAULT_CATEGORIES;
  const toolDefs = toolRegistry.availableInCategories(actor, categories);
  const tools = toolRegistry.renderTools(toolDefs);
  const toolCtx: ToolContext = { actor, conversationId };

  // Prior history (oldest→newest), excluding the just-added user message.
  const history = await prisma.aiMessage.findMany({
    where: { conversationId, role: { in: ["USER", "ASSISTANT"] }, id: { not: userMessageId } },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
    select: { role: true, content: true },
  });
  const input: Array<AiInputMessage | Record<string, unknown>> = history
    .reverse()
    .filter((m) => m.content.trim())
    .map((m) => ({ role: m.role === "USER" ? "user" : "assistant", content: m.content }) as AiInputMessage);
  input.push({ role: "user", content: userText });

  const instructions =
    (opts.instructions ?? supportAssistantPrompt()) +
    (angry ? "\n\nتوجه: مشتری ناراضی/عصبانی به‌نظر می‌رسد؛ همدلانه و آرام پاسخ بده و در صورت لزوم به پشتیبانی انسانی ارجاع بده." : "");
  const safety = safetyIdentifier(opts.safetySeed ?? actor.customerId ?? null);

  let finalText = "";
  let usage: AiUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  let responseId = "";
  let finishReason: "stop" | "handoff" = "stop";

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const pendingCalls: AiFunctionCall[] = [];
    let roundText = "";

    for await (const ev of streamResponse({
      input,
      instructions,
      tools: tools.length ? tools : undefined,
      toolChoice: tools.length ? "auto" : undefined,
      maxOutputTokens: cfg.maxOutputTokens,
      reasoningEffort: cfg.reasoningEffort,
      safetyIdentifier: safety,
      conversationId,
    })) {
      switch (ev.type) {
        case "text_delta":
          roundText += ev.delta;
          yield { event: "delta", data: { text: ev.delta } };
          break;
        case "tool_call":
          pendingCalls.push(ev.call);
          break;
        case "completed":
          responseId = ev.responseId || responseId;
          usage = {
            inputTokens: usage.inputTokens + ev.usage.inputTokens,
            outputTokens: usage.outputTokens + ev.usage.outputTokens,
            totalTokens: usage.totalTokens + ev.usage.totalTokens,
          };
          break;
        case "error":
          throw new Error(ev.message);
        default:
          break;
      }
    }

    finalText = roundText || finalText;

    if (pendingCalls.length === 0 || round === MAX_TOOL_ROUNDS - 1) break;

    // Execute tool calls, echo the call + its output back into the input array.
    for (const call of pendingCalls) {
      yield { event: "tool", data: { name: call.name, status: "running" } };
      const output = await executeToolCall(call, toolCtx, conversationId);
      if (output.handedOff) finishReason = "handoff";
      yield { event: "tool", data: { name: call.name, status: output.status, summary: output.summary } };
      input.push({ type: "function_call", call_id: call.callId, name: call.name, arguments: call.arguments });
      input.push({ type: "function_call_output", call_id: call.callId, output: output.json });
    }
  }

  // 7) Output moderation on the public-facing text.
  let safeText = finalText.trim() || AI_UNAVAILABLE_MESSAGE;
  const outScreen = await screenText(safeText, { conversationId, direction: "output" });
  if (!outScreen.allowed) safeText = BLOCKED_MESSAGE;

  // 8) Persist assistant message + usage.
  const assistant = await appendAiMessage({
    conversationId,
    role: "ASSISTANT",
    content: safeText,
    model: cfg.chatModel,
    providerResponseId: responseId || null,
    tokensInput: usage.inputTokens,
    tokensOutput: usage.outputTokens,
    moderationFlagged: !outScreen.allowed,
  });
  await logUsage({
    conversationId,
    messageId: assistant.id,
    operation: "RESPONSE_STREAM",
    model: cfg.chatModel,
    tokensInput: usage.inputTokens,
    tokensOutput: usage.outputTokens,
    requestId: responseId || null,
  });

  yield {
    event: "done",
    data: {
      assistantMessageId: assistant.id,
      finishReason,
      suggestHandoff: finishReason === "handoff" || undefined,
      usage,
    },
  };
}

interface ToolExecOutcome {
  status: "done" | "denied" | "error";
  json: string; // function_call_output payload (stringified)
  summary?: string;
  handedOff?: boolean;
}

/** Permission-check + run a single tool call, recording an AiToolCall row. */
async function executeToolCall(
  call: AiFunctionCall,
  ctx: ToolContext,
  conversationId: string,
): Promise<ToolExecOutcome> {
  const started = Date.now();
  let args: unknown = {};
  try {
    args = call.arguments ? JSON.parse(call.arguments) : {};
  } catch {
    args = {};
  }

  const decision = toolRegistry.checkPermission(call.name, ctx.actor);
  if (!decision.allowed) {
    await recordToolCall(conversationId, call, args, {
      status: decision.needsApproval ? "AWAITING_APPROVAL" : "DENIED",
      error: decision.reason,
      latencyMs: Date.now() - started,
    });
    return {
      status: "denied",
      json: JSON.stringify({ error: decision.reason, needsApproval: decision.needsApproval ?? false }),
      summary: decision.reason,
    };
  }

  const tool = toolRegistry.get(call.name);
  if (!tool) {
    return { status: "error", json: JSON.stringify({ error: `unknown tool ${call.name}` }) };
  }

  try {
    const result = await tool.handler(args, ctx);
    const handedOff = isHandoffResult(result);
    await recordToolCall(conversationId, call, args, {
      status: "SUCCESS",
      result,
      latencyMs: Date.now() - started,
    });
    return { status: "done", json: JSON.stringify(result ?? {}), handedOff };
  } catch (err) {
    const message = err instanceof Error ? err.message : "tool error";
    await recordToolCall(conversationId, call, args, {
      status: "ERROR",
      error: message,
      latencyMs: Date.now() - started,
    });
    await logError({ conversationId, error: err });
    return { status: "error", json: JSON.stringify({ error: "ابزار با خطا مواجه شد." }) };
  }
}

function isHandoffResult(result: unknown): boolean {
  return Boolean(
    result && typeof result === "object" && ("handed_off" in result || "created" in result) &&
      (result as Record<string, unknown>).ticketToken,
  );
}

async function recordToolCall(
  conversationId: string,
  call: AiFunctionCall,
  args: unknown,
  meta: {
    status: "SUCCESS" | "ERROR" | "DENIED" | "AWAITING_APPROVAL";
    result?: unknown;
    error?: string;
    latencyMs: number;
  },
): Promise<void> {
  try {
    await prisma.aiToolCall.create({
      data: {
        conversationId,
        toolName: call.name,
        providerCallId: call.callId,
        argumentsJson: (args ?? {}) as object,
        resultJson: meta.result !== undefined ? (meta.result as object) : undefined,
        status: meta.status,
        errorMessage: meta.error ?? null,
        latencyMs: meta.latencyMs,
      },
    });
  } catch (err) {
    console.warn("[ai/chat-engine] failed to record tool call:", err);
  }
}
