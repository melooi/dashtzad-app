/**
 * THE central, server-only OpenAI client. Every OpenAI call in Dashtzad goes
 * through this module — feature code (chat engine, retrieval, admin analyst,
 * moderation) must never call `fetch("https://api.openai.com…")` directly.
 *
 * Built on the OpenAI **Responses API** (the project's primary AI interface),
 * plus Embeddings and Moderation endpoints. Uses raw `fetch` (no SDK) for a
 * small, auditable surface. Shapes verified against the official docs:
 *   - POST /v1/responses    (create + SSE streaming)
 *   - POST /v1/embeddings
 *   - POST /v1/moderations
 *
 * The API key is read only via env.ts and is never returned, logged, or thrown
 * in an error message.
 */

import {
  getAiConfig,
  getApiKey,
  isAiConfigured,
  requireApiKey,
  type AiConfig,
} from "@/lib/ai/env";
import { AiError, toAiError } from "@/lib/ai/errors";
import type {
  AiEmbeddingResult,
  AiFunctionCall,
  AiModerationResult,
  AiResponseRequest,
  AiResponseResult,
  AiStreamEvent,
  AiUsage,
} from "@/lib/ai/types";

if (typeof window !== "undefined") {
  throw new Error("src/lib/ai/openai-client.ts is server-only and must not run in the browser.");
}

export { isAiConfigured };

// ---- low-level fetch ------------------------------------------------------

function buildHeaders(cfg: AiConfig, key: string): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  if (cfg.organization) headers["OpenAI-Organization"] = cfg.organization;
  if (cfg.project) headers["OpenAI-Project"] = cfg.project;
  return headers;
}

async function openaiFetch(
  path: string,
  body: unknown,
  opts: { signal?: AbortSignal; stream?: boolean } = {},
): Promise<Response> {
  const cfg = getAiConfig();
  const key = requireApiKey();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), cfg.requestTimeoutMs);
  // Respect an externally provided abort signal too.
  if (opts.signal) {
    if (opts.signal.aborted) controller.abort();
    else opts.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let res: Response;
  try {
    res = await fetch(`${cfg.baseUrl}${path}`, {
      method: "POST",
      headers: buildHeaders(cfg, key),
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    throw toAiError(err);
  }

  if (!opts.stream) clearTimeout(timeout);

  if (!res.ok) {
    if (!opts.stream) {
      /* timeout already cleared */
    } else {
      clearTimeout(timeout);
    }
    const requestId = res.headers.get("x-request-id");
    let message = `OpenAI request failed (${res.status})`;
    try {
      const errBody = (await res.json()) as { error?: { message?: string; code?: string } };
      if (errBody?.error?.message) message = errBody.error.message;
    } catch {
      /* non-JSON error body */
    }
    throw new AiError("openai_http", message, { status: res.status, requestId });
  }

  // For streaming, the caller is responsible for clearing the timeout when the
  // stream ends; we attach it so it can be cleared on completion.
  if (opts.stream) {
    (res as Response & { __timeout?: NodeJS.Timeout }).__timeout = timeout;
  }
  return res;
}

// ---- Responses: request builder -------------------------------------------

function buildResponsesBody(req: AiResponseRequest, stream: boolean): Record<string, unknown> {
  const cfg = getAiConfig();
  const body: Record<string, unknown> = {
    model: req.model ?? cfg.chatModel,
    input: req.input,
    stream,
    store: req.store ?? false,
  };
  if (req.instructions) body.instructions = req.instructions;
  if (req.tools && req.tools.length) body.tools = req.tools;
  if (req.toolChoice) body.tool_choice = req.toolChoice;
  if (req.textFormat) body.text = { format: req.textFormat };
  body.max_output_tokens = req.maxOutputTokens ?? cfg.maxOutputTokens;
  // GPT-5-family reasoning control. Reasoning models spend output tokens on
  // internal reasoning before emitting text, so a sane default effort keeps
  // customer chat responsive; callers can override per request.
  body.reasoning = { effort: req.reasoningEffort ?? cfg.reasoningEffort };
  if (req.temperature !== undefined) body.temperature = req.temperature;
  if (req.previousResponseId) body.previous_response_id = req.previousResponseId;
  if (req.metadata) body.metadata = req.metadata;
  if (req.safetyIdentifier) body.safety_identifier = req.safetyIdentifier;
  if (req.promptCacheKey) body.prompt_cache_key = req.promptCacheKey;
  return body;
}

// ---- Responses: output extraction -----------------------------------------

function deriveOutputText(output: unknown[]): string {
  const parts: string[] = [];
  for (const item of output) {
    if (item && typeof item === "object" && (item as { type?: string }).type === "message") {
      const content = (item as { content?: unknown }).content;
      if (Array.isArray(content)) {
        for (const part of content) {
          if (
            part &&
            typeof part === "object" &&
            (part as { type?: string }).type === "output_text" &&
            typeof (part as { text?: unknown }).text === "string"
          ) {
            parts.push((part as { text: string }).text);
          }
        }
      }
    }
  }
  return parts.join("");
}

function extractFunctionCalls(output: unknown[]): AiFunctionCall[] {
  const calls: AiFunctionCall[] = [];
  for (const item of output) {
    if (item && typeof item === "object" && (item as { type?: string }).type === "function_call") {
      const it = item as { id?: string; call_id?: string; name?: string; arguments?: string };
      if (it.call_id && it.name) {
        calls.push({
          id: it.id,
          callId: it.call_id,
          name: it.name,
          arguments: it.arguments ?? "{}",
        });
      }
    }
  }
  return calls;
}

function extractUsage(usage: unknown): AiUsage {
  const u = (usage ?? {}) as { input_tokens?: number; output_tokens?: number; total_tokens?: number };
  const inputTokens = u.input_tokens ?? 0;
  const outputTokens = u.output_tokens ?? 0;
  return {
    inputTokens,
    outputTokens,
    totalTokens: u.total_tokens ?? inputTokens + outputTokens,
  };
}

// ---- Responses: non-streaming ---------------------------------------------

export async function createResponse(req: AiResponseRequest): Promise<AiResponseResult> {
  const started = Date.now();
  const res = await openaiFetch("/responses", buildResponsesBody(req, false));
  const requestId = res.headers.get("x-request-id");
  let json: {
    id?: string;
    model?: string;
    output?: unknown[];
    output_text?: string;
    usage?: unknown;
  };
  try {
    json = (await res.json()) as typeof json;
  } catch (err) {
    throw new AiError("invalid_response", "OpenAI response was not valid JSON.", {
      requestId,
      cause: err,
    });
  }
  const output = Array.isArray(json.output) ? json.output : [];
  return {
    id: json.id ?? "",
    model: json.model ?? req.model ?? getAiConfig().chatModel,
    outputText:
      typeof json.output_text === "string" && json.output_text.length > 0
        ? json.output_text
        : deriveOutputText(output),
    functionCalls: extractFunctionCalls(output),
    rawOutput: output,
    usage: extractUsage(json.usage),
    requestId,
    latencyMs: Date.now() - started,
  };
}

// ---- Responses: streaming (SSE) -------------------------------------------

/**
 * Stream a Responses API call as typed events. Parses the OpenAI SSE wire
 * format (`event:`/`data:` lines, blank-line delimited, terminal `[DONE]`).
 */
export async function* streamResponse(req: AiResponseRequest): AsyncGenerator<AiStreamEvent> {
  const res = await openaiFetch("/responses", buildResponsesBody(req, true), { stream: true });
  const timeout = (res as Response & { __timeout?: NodeJS.Timeout }).__timeout;
  const body = res.body;
  if (!body) {
    if (timeout) clearTimeout(timeout);
    throw new AiError("invalid_response", "OpenAI streaming response had no body.");
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  // Accumulate streamed function_call arguments by call_id.
  const toolArgs = new Map<string, { name?: string; args: string }>();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Split on SSE event boundaries (blank line).
      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);

        const dataLines = rawEvent
          .split("\n")
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.slice(5).trim());
        if (!dataLines.length) continue;
        const data = dataLines.join("\n");
        if (data === "[DONE]") return;

        let evt: Record<string, unknown>;
        try {
          evt = JSON.parse(data) as Record<string, unknown>;
        } catch {
          continue;
        }

        const type = evt.type as string | undefined;
        switch (type) {
          case "response.created": {
            const id = (evt.response as { id?: string } | undefined)?.id ?? "";
            yield { type: "created", responseId: id };
            break;
          }
          case "response.output_text.delta":
            yield { type: "text_delta", delta: String(evt.delta ?? "") };
            break;
          case "response.output_text.done":
            yield { type: "text_done", text: String(evt.text ?? "") };
            break;
          case "response.output_item.added": {
            const item = evt.item as { type?: string; call_id?: string; name?: string } | undefined;
            if (item?.type === "function_call" && item.call_id) {
              toolArgs.set(item.call_id, { name: item.name, args: "" });
            }
            break;
          }
          case "response.function_call_arguments.delta": {
            const callId = String(evt.item_id ?? evt.call_id ?? "");
            const delta = String(evt.delta ?? "");
            const entry = toolArgs.get(callId) ?? { args: "" };
            entry.args += delta;
            toolArgs.set(callId, entry);
            yield { type: "tool_args_delta", callId, name: entry.name, delta };
            break;
          }
          case "response.output_item.done": {
            const item = evt.item as
              | { type?: string; id?: string; call_id?: string; name?: string; arguments?: string }
              | undefined;
            if (item?.type === "function_call" && item.call_id && item.name) {
              yield {
                type: "tool_call",
                call: {
                  id: item.id,
                  callId: item.call_id,
                  name: item.name,
                  arguments: item.arguments ?? toolArgs.get(item.call_id)?.args ?? "{}",
                },
              };
            }
            break;
          }
          case "response.completed": {
            const response = evt.response as { id?: string; usage?: unknown; output?: unknown[] } | undefined;
            yield {
              type: "completed",
              responseId: response?.id ?? "",
              usage: extractUsage(response?.usage),
              outputText: deriveOutputText(Array.isArray(response?.output) ? response!.output! : []),
            };
            break;
          }
          case "response.error":
          case "error": {
            const message =
              (evt.message as string | undefined) ??
              ((evt.error as { message?: string } | undefined)?.message ?? "stream error");
            yield { type: "error", message, details: evt };
            break;
          }
          default:
            // Ignore lifecycle events we don't model (in_progress, added, etc.).
            break;
        }
      }
    }
  } catch (err) {
    throw toAiError(err);
  } finally {
    if (timeout) clearTimeout(timeout);
    reader.releaseLock();
  }
}

// ---- Embeddings -----------------------------------------------------------

export async function createEmbeddings(
  input: string | string[],
  opts: { model?: string; dimensions?: number } = {},
): Promise<AiEmbeddingResult> {
  const cfg = getAiConfig();
  const body = {
    model: opts.model ?? cfg.embeddingModel,
    input,
    dimensions: opts.dimensions ?? cfg.embeddingDimensions,
    encoding_format: "float",
  };
  const res = await openaiFetch("/embeddings", body);
  const json = (await res.json()) as {
    model?: string;
    data?: Array<{ embedding: number[]; index: number }>;
    usage?: { prompt_tokens?: number; total_tokens?: number };
  };
  const rows = (json.data ?? []).slice().sort((a, b) => a.index - b.index);
  return {
    model: json.model ?? body.model,
    embeddings: rows.map((r) => r.embedding),
    usage: {
      promptTokens: json.usage?.prompt_tokens ?? 0,
      totalTokens: json.usage?.total_tokens ?? 0,
    },
  };
}

// ---- Moderation -----------------------------------------------------------

const MODERATION_THRESHOLD = 0.5;

export async function moderate(input: string): Promise<AiModerationResult> {
  const cfg = getAiConfig();
  const res = await openaiFetch("/moderations", { model: cfg.moderationModel, input });
  const json = (await res.json()) as {
    model?: string;
    results?: Array<{
      flagged: boolean;
      categories: Record<string, boolean>;
      category_scores: Record<string, number>;
    }>;
  };
  const result = json.results?.[0];
  if (!result) {
    throw new AiError("invalid_response", "Moderation response had no results.");
  }
  const scores = result.category_scores ?? {};
  const flaggedCategories = Object.entries(result.categories ?? {})
    .filter(([cat, on]) => on || (scores[cat] ?? 0) >= MODERATION_THRESHOLD)
    .map(([cat]) => cat)
    .sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
  return {
    model: json.model ?? cfg.moderationModel,
    flagged: result.flagged,
    categories: result.categories ?? {},
    scores,
    flaggedCategories,
  };
}
