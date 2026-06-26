/**
 * Server-side tool registry. Defines the contract every AI tool implements and
 * the machinery to expose tools to the Responses API, enforce permissions, and
 * mirror tool metadata into `ai_tools` for the admin Tools Registry screen.
 *
 * The concrete tools (search_products, get_order_status, scan_admin_modules, …)
 * are registered in CP-B/CP-E. CP-A ships the machinery + permission model so
 * everything downstream plugs in safely. No tool runs without passing
 * `checkToolPermission`.
 */

import { z } from "zod";
import type { AiToolCategory } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { zodToStrictJsonSchema } from "@/lib/ai/structured-output";
import type { AiFunctionTool } from "@/lib/ai/types";

/** Who is invoking a tool — drives permission checks. */
export interface ToolActor {
  /** "guest" visitor, logged-in "customer", or "admin"/"operator". */
  kind: "guest" | "customer" | "admin";
  customerId?: string | null;
  operatorId?: string | null;
  /** Granted when an operator/admin has approved a gated action. */
  approved?: boolean;
}

export interface ToolContext {
  actor: ToolActor;
  conversationId?: string | null;
  messageId?: string | null;
}

export type ToolHandler<TArgs = unknown, TResult = unknown> = (
  args: TArgs,
  ctx: ToolContext,
) => Promise<TResult>;

export interface ToolDefinition<TArgs = unknown, TResult = unknown> {
  name: string;
  category: AiToolCategory;
  description: string;
  /** Zod schema for the arguments (also rendered to the OpenAI JSON schema). */
  parameters: z.ZodType<TArgs>;
  /** Read-only tools never mutate data (admin analyst tools are all read-only). */
  readOnly?: boolean;
  /** Requires a logged-in customer (e.g. profile, order lookups). */
  requiresAuth?: boolean;
  /** Destructive/financial/publishing — disabled by default, human-approval gated. */
  isDestructive?: boolean;
  /** Must pause for human approval before executing. */
  requiresApproval?: boolean;
  /** Toggle without removing the definition. */
  enabled?: boolean;
  /**
   * Internal tools are callable programmatically (engine/admin) but are NOT
   * exposed to the customer-facing model (e.g. classification helpers).
   */
  internal?: boolean;
  handler: ToolHandler<TArgs, TResult>;
}

export type PermissionDecision =
  | { allowed: true }
  | { allowed: false; reason: string; needsApproval?: boolean };

export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  register<TArgs, TResult>(def: ToolDefinition<TArgs, TResult>): void {
    if (this.tools.has(def.name)) {
      throw new Error(`Tool "${def.name}" is already registered.`);
    }
    this.tools.set(def.name, def as unknown as ToolDefinition);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  list(): ToolDefinition[] {
    return [...this.tools.values()];
  }

  /** Tools available to a given actor (enabled + category-appropriate + not internal). */
  available(actor: ToolActor): ToolDefinition[] {
    return this.list().filter((t) => {
      if (t.enabled === false || t.internal) return false;
      const isAdminTool = t.category === "ADMIN_ANALYST";
      // Admin analyst tools are admin-only; customer-facing tools are not exposed to admins-as-customers.
      return actor.kind === "admin" ? isAdminTool : !isAdminTool;
    });
  }

  /** Filter the available tool set to a set of allowed categories (from settings). */
  availableInCategories(actor: ToolActor, categories: AiToolCategory[]): ToolDefinition[] {
    const allow = new Set(categories);
    return this.available(actor).filter((t) => allow.has(t.category));
  }

  /** Render a set of tool definitions to the Responses API tool array. */
  renderTools(defs: ToolDefinition[]): AiFunctionTool[] {
    return defs.map((t) => ({
      type: "function" as const,
      name: t.name,
      description: t.description,
      parameters: zodToStrictJsonSchema(t.parameters),
      strict: true,
    }));
  }

  /** Render enabled, actor-appropriate tools to the Responses API tool array. */
  toOpenAITools(actor: ToolActor): AiFunctionTool[] {
    return this.renderTools(this.available(actor));
  }

  /**
   * Authorize a tool call. Order: existence -> enabled -> auth -> destructive
   * gate -> approval gate. Destructive tools are blocked unless explicitly
   * enabled AND approved by a human.
   */
  checkPermission(name: string, actor: ToolActor): PermissionDecision {
    const tool = this.tools.get(name);
    if (!tool) return { allowed: false, reason: `Unknown tool "${name}".` };
    if (tool.enabled === false) return { allowed: false, reason: `Tool "${name}" is disabled.` };

    if (tool.category === "ADMIN_ANALYST" && actor.kind !== "admin") {
      return { allowed: false, reason: "Admin analyst tools require an admin actor." };
    }
    if (tool.requiresAuth && actor.kind === "guest") {
      return { allowed: false, reason: "This action requires a signed-in customer." };
    }
    if (tool.isDestructive) {
      if (!actor.approved) {
        return {
          allowed: false,
          needsApproval: true,
          reason: "Destructive action requires human approval.",
        };
      }
    }
    if (tool.requiresApproval && !actor.approved) {
      return { allowed: false, needsApproval: true, reason: "This action requires human approval." };
    }
    return { allowed: true };
  }

  /** Mirror current tool metadata into `ai_tools` (idempotent upsert). */
  async syncToDb(): Promise<number> {
    const defs = this.list();
    for (const t of defs) {
      const data = {
        category: t.category,
        description: t.description,
        parametersJson: zodToStrictJsonSchema(t.parameters) as object,
        enabled: t.enabled !== false,
        readOnly: t.readOnly ?? true,
        requiresAuth: t.requiresAuth ?? false,
        requiresApproval: t.requiresApproval ?? false,
        isDestructive: t.isDestructive ?? false,
      };
      await prisma.aiTool.upsert({
        where: { name: t.name },
        create: { name: t.name, ...data },
        update: data,
      });
    }
    return defs.length;
  }
}

/** The process-wide registry singleton. */
export const toolRegistry = new ToolRegistry();
