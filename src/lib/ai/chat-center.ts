/**
 * Chat Center config resolver. Reads the admin-configurable `chatSettings`
 * (extended in AI-CP-B) and turns it into the runtime config the AI chatbot
 * engine and the public widget need. This is the single bridge between the
 * admin settings and the chat backend.
 */

import type { AiToolCategory } from "@/generated/prisma/enums";
import { getChatSettings } from "@/lib/admin/global-service";
import type { ChatSettings } from "@/lib/admin/globals";
import { aiAvailable, unavailableReason } from "@/lib/ai/availability";
import {
  supportAssistantPrompt,
  shoppingAdvisorPrompt,
  recipeAssistantPrompt,
} from "@/lib/ai/prompts";

export interface AiChatbotConfig {
  /** Master toggle from settings (independent of whether a key is configured). */
  enabled: boolean;
  /** True only when enabled AND the engine can actually serve (key present). */
  available: boolean;
  persona: ChatSettings["aiChatbotPersona"];
  instructions: string;
  welcome: string;
  handoffEnabled: boolean;
  unavailableMessage: string;
  rateLimitPerMinute: number;
  toolCategories: AiToolCategory[];
}

function personaInstructions(persona: ChatSettings["aiChatbotPersona"], brandContext: string): string {
  const base =
    persona === "shopping"
      ? shoppingAdvisorPrompt()
      : persona === "recipe"
        ? recipeAssistantPrompt()
        : supportAssistantPrompt();
  return brandContext.trim() ? `${base}\n\nزمینه‌ی برند (از تنظیمات):\n${brandContext.trim()}` : base;
}

function toolCategoriesFrom(s: ChatSettings): AiToolCategory[] {
  const cats: AiToolCategory[] = [];
  if (s.aiToolsProduct) cats.push("PRODUCT");
  if (s.aiToolsOrder) cats.push("ORDER");
  if (s.aiToolsKnowledge) cats.push("KNOWLEDGE");
  if (s.aiToolsCustomer) cats.push("CUSTOMER");
  if (s.aiToolsSupport) cats.push("SUPPORT");
  return cats;
}

export async function getAiChatbotConfig(): Promise<AiChatbotConfig> {
  const s = await getChatSettings();
  const enabled = s.enabled && s.aiChatbotEnabled;
  return {
    enabled,
    available: enabled && aiAvailable(),
    persona: s.aiChatbotPersona,
    instructions: personaInstructions(s.aiChatbotPersona, s.aiContext),
    welcome: s.aiChatbotWelcome,
    handoffEnabled: s.aiHandoffEnabled,
    unavailableMessage: s.aiUnavailableMessage,
    rateLimitPerMinute: s.aiRateLimitPerMinute,
    toolCategories: toolCategoriesFrom(s),
  };
}

/**
 * Public widget config — safe to send to the browser. No secrets; the only
 * "AI status" exposed is a boolean + a reason string. Combines the human-chat
 * surface settings the AI widget also needs (labels, quick actions).
 */
export interface WidgetConfig {
  chatEnabled: boolean;
  ai: {
    enabled: boolean;
    available: boolean;
    reason: string | null; // "no_key" | "disabled" | null
    persona: string;
    welcome: string;
    handoffEnabled: boolean;
    unavailableMessage: string;
  };
  identity: { botName: string; operatorName: string };
  composerPlaceholder: string;
  quickActions: { label: string; icon: string }[];
}

export async function getWidgetConfig(): Promise<WidgetConfig> {
  const s = await getChatSettings();
  const cfg = await getAiChatbotConfig();
  return {
    chatEnabled: s.enabled,
    ai: {
      enabled: cfg.enabled,
      available: cfg.available,
      reason: cfg.enabled ? unavailableReason() : "disabled",
      persona: cfg.persona,
      welcome: cfg.welcome,
      handoffEnabled: cfg.handoffEnabled,
      unavailableMessage: cfg.unavailableMessage,
    },
    identity: { botName: s.botName, operatorName: s.operatorName },
    composerPlaceholder: s.composerPlaceholder,
    quickActions: s.quickActions,
  };
}
