/**
 * Shared types for the central AI service. These mirror the OpenAI Responses
 * API surface (verified against the official docs) so feature modules speak in
 * stable Dashtzad-side shapes and never depend on raw provider JSON directly.
 */

import type { AiOperation } from "@/generated/prisma/enums";

// ---- Responses API: input -------------------------------------------------

export type AiRole = "system" | "developer" | "user" | "assistant" | "tool";

/** A single content part of a message (text-only for now; extend for images). */
export interface AiTextPart {
  type: "input_text" | "output_text";
  text: string;
}

/** A conversation input item passed to the Responses API. */
export interface AiInputMessage {
  type?: "message";
  role: AiRole;
  content: string | AiTextPart[];
}

/** Result of a function tool, fed back into the next Responses turn. */
export interface AiFunctionCallOutput {
  type: "function_call_output";
  call_id: string;
  output: string;
}

/** Anything acceptable as `input` for a Responses call. */
export type AiInput = string | Array<AiInputMessage | AiFunctionCallOutput | Record<string, unknown>>;

// ---- Responses API: tools / structured output -----------------------------

export interface AiFunctionTool {
  type: "function";
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  strict?: boolean;
}

export type AiToolChoice =
  | "auto"
  | "none"
  | "required"
  | { type: "function"; name: string };

export interface AiTextFormat {
  format: {
    type: "json_schema";
    name: string;
    schema: Record<string, unknown>;
    strict: boolean;
  };
}

// ---- Responses API: request ----------------------------------------------

export interface AiResponseRequest {
  /** Overrides the configured chat model when set. */
  model?: string;
  input: AiInput;
  instructions?: string;
  tools?: AiFunctionTool[];
  toolChoice?: AiToolChoice;
  /** Structured-output JSON schema (maps to `text.format`). */
  textFormat?: AiTextFormat["format"];
  maxOutputTokens?: number;
  temperature?: number;
  /**
   * Reasoning effort for GPT-5-family reasoning models. Lower effort emits
   * visible text sooner and cheaper; higher effort reasons more before
   * answering. Defaults from config (low) when omitted.
   */
  reasoningEffort?: "none" | "low" | "medium" | "high" | "xhigh";
  /** Chain server-side from a prior response id. */
  previousResponseId?: string;
  /** Persist the response on OpenAI's side (default false here). */
  store?: boolean;
  metadata?: Record<string, string>;
  /** Stable, non-PII end-user identifier for abuse monitoring. */
  safetyIdentifier?: string;
  /** Cache key to improve prompt-cache hit rates. */
  promptCacheKey?: string;
  /** Logging correlation — not sent to OpenAI. */
  conversationId?: string;
  messageId?: string;
}

// ---- Responses API: response ----------------------------------------------

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AiFunctionCall {
  id?: string;
  callId: string;
  name: string;
  /** Raw JSON string of arguments exactly as returned by the model. */
  arguments: string;
}

export interface AiResponseResult {
  /** OpenAI response id (usable as `previousResponseId` next turn). */
  id: string;
  model: string;
  /** Concatenated assistant text across output items. */
  outputText: string;
  /** Function/tool calls the model wants executed. */
  functionCalls: AiFunctionCall[];
  /** Raw `output` array, for callers that need the full structure. */
  rawOutput: unknown[];
  usage: AiUsage;
  requestId: string | null;
  latencyMs: number;
}

// ---- Responses API: streaming ---------------------------------------------

export type AiStreamEvent =
  | { type: "created"; responseId: string }
  | { type: "text_delta"; delta: string }
  | { type: "text_done"; text: string }
  | { type: "tool_args_delta"; callId: string; name?: string; delta: string }
  | { type: "tool_call"; call: AiFunctionCall }
  | { type: "completed"; responseId: string; usage: AiUsage; outputText: string }
  | { type: "error"; message: string; details?: unknown };

// ---- Embeddings -----------------------------------------------------------

export interface AiEmbeddingResult {
  model: string;
  embeddings: number[][];
  usage: { promptTokens: number; totalTokens: number };
}

// ---- Moderation -----------------------------------------------------------

export interface AiModerationResult {
  model: string;
  flagged: boolean;
  /** Category -> whether it was flagged. */
  categories: Record<string, boolean>;
  /** Category -> confidence score (0..1). */
  scores: Record<string, number>;
  /** Categories that exceeded the flag threshold, sorted by score desc. */
  flaggedCategories: string[];
}

// ---- Logging --------------------------------------------------------------

export interface UsageLogInput {
  conversationId?: string | null;
  messageId?: string | null;
  operation: AiOperation;
  model: string;
  tokensInput?: number;
  tokensOutput?: number;
  latencyMs?: number | null;
  success?: boolean;
  requestId?: string | null;
}
