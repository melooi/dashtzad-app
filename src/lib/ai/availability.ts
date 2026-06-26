/**
 * The single source of truth for "is the AI engine usable right now?" and the
 * graceful **AI_UNAVAILABLE** contract used everywhere AI could be down.
 *
 * Degraded mode (no `OPENAI_API_KEY`, or `AI_ENABLED=false`) must NEVER 500 or
 * break the frontend: chat endpoints stay up, return a clear Persian fallback,
 * and offer human handoff (so the existing live-chat keeps working). No secret
 * is ever exposed; no fake "AI answered" claim is made.
 */

import { isAiConfigured } from "@/lib/ai/env";

/** Stable machine-readable code surfaced to the client when AI can't run. */
export const AI_UNAVAILABLE = "AI_UNAVAILABLE" as const;

/** Admin kill-switch: set AI_ENABLED=false to force degraded mode with a key present. */
function killSwitchOn(): boolean {
  const v = process.env.AI_ENABLED;
  return v !== undefined && v.trim().toLowerCase() === "false";
}

/** True when the AI engine can actually serve requests. */
export function aiAvailable(): boolean {
  return isAiConfigured() && !killSwitchOn();
}

export type AiUnavailableReason = "no_key" | "disabled";

export function unavailableReason(): AiUnavailableReason | null {
  if (killSwitchOn()) return "disabled";
  if (!isAiConfigured()) return "no_key";
  return null;
}

/** Customer-facing Persian fallback shown when the AI assistant is unavailable. */
export const AI_UNAVAILABLE_MESSAGE =
  "دستیار هوشمند دشت‌زاد همین حالا در دسترس نیست. می‌توانم گفت‌وگو را به پشتیبانیِ انسانی منتقل کنم تا همکاران ما کمک‌تان کنند.";

export interface AiUnavailablePayload {
  code: typeof AI_UNAVAILABLE;
  reason: AiUnavailableReason;
  message: string;
  /** Tell the client to surface the human-handoff CTA. */
  suggestHandoff: true;
}

export function aiUnavailablePayload(): AiUnavailablePayload {
  return {
    code: AI_UNAVAILABLE,
    reason: unavailableReason() ?? "no_key",
    message: AI_UNAVAILABLE_MESSAGE,
    suggestHandoff: true,
  };
}
