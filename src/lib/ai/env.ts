/**
 * Central, SERVER-ONLY AI configuration.
 *
 * The OpenAI API key is read from `process.env` here and nowhere else. It must
 * never be imported into client code, returned to the browser, logged, or
 * written to a report/seed file. Non-secret tuning (model ids, dimensions,
 * limits) has safe defaults and can be overridden via env.
 *
 * Models default to the current OpenAI flagship family (verified against the
 * official docs: GPT-5.5 is GA in the Responses API). Override per environment
 * with the OPENAI_*_MODEL vars if your account exposes different model ids.
 */

import { AiError } from "@/lib/ai/errors";

// Guard against accidental client bundling — this module touches secrets.
if (typeof window !== "undefined") {
  throw new Error("src/lib/ai/env.ts is server-only and must not be imported in the browser.");
}

function str(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : fallback;
}

function int(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v || v.trim() === "") return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function bool(name: string, fallback: boolean): boolean {
  const v = process.env[name];
  if (v === undefined || v.trim() === "") return fallback;
  return v.trim().toLowerCase() === "true" || v.trim() === "1";
}

export interface AiConfig {
  /** Base URL for the OpenAI-compatible API (override for proxies/Azure-style gateways). */
  baseUrl: string;
  /** Primary chat/reasoning model for the customer assistant. */
  chatModel: string;
  /** Cheaper/faster model for lightweight tasks (intent, titles, classification). */
  fastModel: string;
  /** Model used by the admin analyst engine. */
  analystModel: string;
  /** Moderation model (omni-moderation-latest covers text + image). */
  moderationModel: string;
  /** Embedding model + output dimensionality (must match the vector column width). */
  embeddingModel: string;
  embeddingDimensions: number;
  /** Default cap on output tokens for a single response. */
  maxOutputTokens: number;
  /** Default reasoning effort for GPT-5-family models (low keeps chat snappy). */
  reasoningEffort: "none" | "low" | "medium" | "high" | "xhigh";
  /** Per-request timeout in milliseconds. */
  requestTimeoutMs: number;
  /** Whether input/output moderation gates are enforced. */
  moderationEnabled: boolean;
  /** Optional OpenAI org/project routing headers. */
  organization?: string;
  project?: string;
  /** Salt used when hashing user/visitor ids into a stable `safety_identifier`. */
  safetyIdentifierSalt: string;
}

/** Resolve the non-secret AI configuration (safe to log). */
export function getAiConfig(): AiConfig {
  return {
    baseUrl: str("OPENAI_BASE_URL", "https://api.openai.com/v1").replace(/\/+$/, ""),
    chatModel: str("OPENAI_CHAT_MODEL", "gpt-5.5"),
    fastModel: str("OPENAI_FAST_MODEL", str("OPENAI_CHAT_MODEL", "gpt-5.5")),
    analystModel: str("OPENAI_ANALYST_MODEL", str("OPENAI_CHAT_MODEL", "gpt-5.5")),
    moderationModel: str("OPENAI_MODERATION_MODEL", "omni-moderation-latest"),
    embeddingModel: str("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
    embeddingDimensions: int("OPENAI_EMBEDDING_DIMENSIONS", 1536),
    maxOutputTokens: int("OPENAI_MAX_OUTPUT_TOKENS", 1024),
    reasoningEffort: (["none", "low", "medium", "high", "xhigh"] as const).includes(
      str("OPENAI_REASONING_EFFORT", "low") as "none" | "low" | "medium" | "high" | "xhigh",
    )
      ? (str("OPENAI_REASONING_EFFORT", "low") as "none" | "low" | "medium" | "high" | "xhigh")
      : "low",
    requestTimeoutMs: int("OPENAI_TIMEOUT_MS", 60_000),
    moderationEnabled: bool("OPENAI_MODERATION_ENABLED", true),
    organization: process.env.OPENAI_ORG_ID?.trim() || undefined,
    project: process.env.OPENAI_PROJECT_ID?.trim() || undefined,
    safetyIdentifierSalt: str("AI_SAFETY_ID_SALT", "dashtzad-ai"),
  };
}

/** The raw OpenAI API key, or undefined if not configured. Never expose this. */
export function getApiKey(): string | undefined {
  const v = process.env.OPENAI_API_KEY;
  return v && v.trim() !== "" ? v.trim() : undefined;
}

/** True when the server has an OpenAI key configured. */
export function isAiConfigured(): boolean {
  return getApiKey() !== undefined;
}

/** Return the API key or throw a typed `not_configured` error. */
export function requireApiKey(): string {
  const key = getApiKey();
  if (!key) throw AiError.notConfigured();
  return key;
}

/**
 * A non-reversible fingerprint of the configured key — safe to surface in a
 * health endpoint to confirm WHICH key is loaded without exposing it.
 */
export function keyFingerprint(): string | null {
  const key = getApiKey();
  if (!key) return null;
  // Cheap, non-cryptographic rolling hash; enough to distinguish keys, useless
  // for reconstructing one.
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return `sk_…${h.toString(16).padStart(8, "0")}`;
}
