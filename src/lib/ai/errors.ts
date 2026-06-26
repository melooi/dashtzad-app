/**
 * Typed errors for the AI layer. Every failure that crosses the central AI
 * service boundary is an `AiError` so callers (routes, chat engine, admin
 * analyst) can branch on `code` and surface safe Persian fallbacks instead of
 * leaking provider internals.
 */

export type AiErrorCode =
  | "not_configured" // OPENAI_API_KEY missing
  | "openai_http" // OpenAI returned a non-2xx status
  | "openai_network" // fetch failed (DNS, connection, TLS)
  | "timeout" // request exceeded the configured timeout
  | "invalid_response" // OpenAI response was not in the expected shape
  | "parse_error" // structured-output JSON failed to parse/validate
  | "moderation_blocked" // content failed an input/output moderation gate
  | "rate_limited"; // local or upstream rate limit hit

export interface AiErrorOptions {
  status?: number;
  requestId?: string | null;
  details?: unknown;
  cause?: unknown;
}

export class AiError extends Error {
  readonly code: AiErrorCode;
  readonly status?: number;
  readonly requestId?: string | null;
  readonly details?: unknown;

  constructor(code: AiErrorCode, message: string, options: AiErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "AiError";
    this.code = code;
    this.status = options.status;
    this.requestId = options.requestId ?? null;
    this.details = options.details;
  }

  static notConfigured(): AiError {
    return new AiError(
      "not_configured",
      "OPENAI_API_KEY is not set. The AI service is unavailable until it is configured on the server.",
    );
  }

  /** Whether the failure is transient and a retry might succeed. */
  get isRetryable(): boolean {
    if (this.code === "timeout" || this.code === "openai_network") return true;
    if (this.code === "rate_limited") return true;
    if (this.code === "openai_http" && this.status) {
      return this.status === 429 || this.status >= 500;
    }
    return false;
  }
}

/** Narrow an unknown thrown value to an AiError, wrapping anything else. */
export function toAiError(err: unknown): AiError {
  if (err instanceof AiError) return err;
  if (err instanceof Error) {
    if (err.name === "AbortError") {
      return new AiError("timeout", "The AI request timed out.", { cause: err });
    }
    return new AiError("openai_network", err.message, { cause: err });
  }
  return new AiError("openai_network", "Unknown AI error", { details: err });
}
