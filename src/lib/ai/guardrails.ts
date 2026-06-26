/**
 * Guardrail primitives shared by the chat engine and admin analyst:
 *   - PII masking (Iranian phone, email, national id, card numbers)
 *   - a stable, non-PII `safety_identifier` for OpenAI abuse monitoring
 *   - an in-memory sliding-window rate limiter (per-process; CP-B upgrades the
 *     keying to per-visitor/session and records throttle guardrail events)
 *
 * Moderation lives in moderation.ts; tool-permission enforcement lives in the
 * tool registry (CP-B). This module is the toolbox those layers draw on.
 */

import { createHash } from "node:crypto";
import { getAiConfig } from "@/lib/ai/env";

// ---- PII masking ----------------------------------------------------------

export interface PiiMatch {
  type: "phone" | "email" | "national_id" | "card";
  value: string;
}

const PATTERNS: Array<{ type: PiiMatch["type"]; re: RegExp; mask: (m: string) => string }> = [
  {
    type: "email",
    re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    mask: (m) => {
      const [user, domain] = m.split("@");
      const head = user.slice(0, 1);
      return `${head}***@${domain}`;
    },
  },
  {
    // Iranian mobile: 09xxxxxxxxx, +989xxxxxxxxx, 00989xxxxxxxxx
    type: "phone",
    re: /(?:(?:\+|00)98|0)9\d{9}/g,
    mask: (m) => `${m.slice(0, 4)}****${m.slice(-2)}`,
  },
  {
    // 16-digit card (allow spaces/dashes between groups)
    type: "card",
    re: /\b(?:\d[ -]?){16}\b/g,
    mask: (m) => {
      const digits = m.replace(/\D/g, "");
      return `****-****-****-${digits.slice(-4)}`;
    },
  },
  {
    // Iranian national id: exactly 10 digits, word-bounded
    type: "national_id",
    re: /\b\d{10}\b/g,
    mask: (m) => `******${m.slice(-4)}`,
  },
];

export interface MaskResult {
  masked: string;
  found: PiiMatch[];
}

/**
 * Mask PII in free text. Order matters: card (16) before national id (10) so a
 * card number isn't partially matched as an id. Returns the masked string and
 * what was found (types only — callers log types, never raw values).
 */
export function maskPii(input: string): MaskResult {
  let masked = input;
  const found: PiiMatch[] = [];
  for (const { type, re, mask } of PATTERNS) {
    masked = masked.replace(re, (m) => {
      found.push({ type, value: m });
      return mask(m);
    });
  }
  return { masked, found };
}

/** True if the text contains any detectable PII. */
export function containsPii(input: string): boolean {
  return PATTERNS.some(({ re }) => {
    re.lastIndex = 0;
    return re.test(input);
  });
}

// ---- safety identifier ----------------------------------------------------

/**
 * Derive a stable, non-reversible `safety_identifier` for OpenAI from a
 * customer id or visitor/session token. Hashed with a server salt so OpenAI
 * never receives a raw Dashtzad id, while still getting a consistent per-user
 * signal for abuse monitoring.
 */
export function safetyIdentifier(seed: string | null | undefined): string | undefined {
  if (!seed) return undefined;
  const salt = getAiConfig().safetyIdentifierSalt;
  return "dz_" + createHash("sha256").update(`${salt}:${seed}`).digest("hex").slice(0, 32);
}

/** Hash a raw IP for storage (we never persist raw IPs). */
export function hashIp(ip: string | null | undefined): string | undefined {
  if (!ip) return undefined;
  const salt = getAiConfig().safetyIdentifierSalt;
  return createHash("sha256").update(`${salt}:ip:${ip}`).digest("hex").slice(0, 32);
}

// ---- in-memory rate limiter ----------------------------------------------

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Max events allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Sliding-window rate limiter. In-process only (resets on redeploy and is
 * per-instance) — adequate as a first abuse guard for a single Node server;
 * swap for a shared store (Redis/Postgres) when horizontally scaled.
 */
export function checkRateLimit(key: string, opts: RateLimitOptions, now = Date.now()): RateLimitResult {
  const bucket = buckets.get(key) ?? { hits: [] };
  const cutoff = now - opts.windowMs;
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= opts.limit) {
    const oldest = bucket.hits[0];
    buckets.set(key, bucket);
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, oldest + opts.windowMs - now) };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { allowed: true, remaining: opts.limit - bucket.hits.length, retryAfterMs: 0 };
}

/** Periodic cleanup hook to keep the bucket map bounded (call from a timer if needed). */
export function pruneRateLimitBuckets(maxAgeMs = 3_600_000, now = Date.now()): void {
  for (const [key, bucket] of buckets) {
    if (!bucket.hits.length || bucket.hits[bucket.hits.length - 1] < now - maxAgeMs) {
      buckets.delete(key);
    }
  }
}
