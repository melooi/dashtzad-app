/**
 * Registers all concrete customer-facing tools into the process-wide
 * `toolRegistry`, exactly once. Importing this module guarantees the registry
 * is populated (used by the chat engine and the admin Tools Registry sync).
 *
 * Admin analyst tools are registered separately in CP-E.
 */

import { toolRegistry, type ToolDefinition } from "@/lib/ai/tool-registry";
import { PRODUCT_TOOLS } from "@/lib/ai/tools/product-tools";
import { ORDER_TOOLS } from "@/lib/ai/tools/order-tools";
import { KNOWLEDGE_TOOLS } from "@/lib/ai/tools/knowledge-tools";
import { CUSTOMER_TOOLS } from "@/lib/ai/tools/customer-tools";
import { SUPPORT_TOOLS } from "@/lib/ai/tools/support-tools";

let registered = false;

export const ALL_CUSTOMER_TOOLS: ToolDefinition[] = [
  ...PRODUCT_TOOLS,
  ...ORDER_TOOLS,
  ...KNOWLEDGE_TOOLS,
  ...CUSTOMER_TOOLS,
  ...SUPPORT_TOOLS,
];

/** Idempotently register all tools. Safe to call from multiple entry points. */
export function ensureToolsRegistered(): void {
  if (registered) return;
  for (const tool of ALL_CUSTOMER_TOOLS) {
    if (!toolRegistry.get(tool.name)) toolRegistry.register(tool);
  }
  registered = true;
}

// Register on import so any consumer of the registry sees a populated set.
ensureToolsRegistered();

export { toolRegistry };
