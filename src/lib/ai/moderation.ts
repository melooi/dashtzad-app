/**
 * Moderation gate. Wraps the central client's `moderate()` with usage logging
 * and guardrail-event recording, and exposes a simple allow/block screen used
 * on both user input and public-facing AI output.
 */

import { getAiConfig, isAiConfigured } from "@/lib/ai/env";
import { moderate } from "@/lib/ai/openai-client";
import { logGuardrail, logUsage } from "@/lib/ai/usage-logger";
import type { AiModerationResult } from "@/lib/ai/types";

export interface ScreenContext {
  conversationId?: string | null;
  messageId?: string | null;
  direction: "input" | "output";
}

export interface ScreenResult {
  allowed: boolean;
  /** Null when moderation is disabled or text is empty. */
  result: AiModerationResult | null;
}

/**
 * Screen a piece of text. Returns `{ allowed }` and records:
 *   - a MODERATION usage row (best-effort), and
 *   - a guardrail event when the text is flagged.
 * Fails OPEN on a moderation API error (logs nothing blocking) so a transient
 * provider outage never silently swallows customer messages — callers may
 * still choose to degrade. Never throws.
 */
export async function screenText(text: string, ctx: ScreenContext): Promise<ScreenResult> {
  const cfg = getAiConfig();
  // Degraded mode: no key configured -> moderation cannot run; skip cleanly
  // (the chat engine already returns an AI_UNAVAILABLE fallback in this state).
  if (!isAiConfigured() || !cfg.moderationEnabled || !text || text.trim() === "") {
    return { allowed: true, result: null };
  }

  let result: AiModerationResult;
  try {
    result = await moderate(text);
  } catch (err) {
    console.warn("[ai/moderation] screen failed (failing open):", err);
    return { allowed: true, result: null };
  }

  await logUsage({
    conversationId: ctx.conversationId ?? null,
    messageId: ctx.messageId ?? null,
    operation: "MODERATION",
    model: result.model,
    tokensInput: 0,
    tokensOutput: 0,
  });

  if (result.flagged) {
    await logGuardrail({
      conversationId: ctx.conversationId ?? null,
      messageId: ctx.messageId ?? null,
      type: ctx.direction === "input" ? "MODERATION_INPUT" : "MODERATION_OUTPUT",
      action: "BLOCKED",
      severity: "HIGH",
      details: {
        flaggedCategories: result.flaggedCategories,
        topScore: result.flaggedCategories[0]
          ? result.scores[result.flaggedCategories[0]]
          : undefined,
      },
    });
  }

  return { allowed: !result.flagged, result };
}
