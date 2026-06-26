"use server";
import { requireAdmin } from "@/lib/auth/guards";
import { readGlobalRaw, writeGlobal } from "@/lib/admin/global-service";
import { chatSettingsSchema } from "@/lib/admin/globals";
import { revalidatePath } from "next/cache";

export type AiActionResult = { ok: true } | { ok: false; error: string };

/**
 * Partial-update action for AI-related fields only.
 * Reads current chatSettings from DB, merges only AI fields, then writes.
 * This prevents clobbering non-AI settings when two forms coexist on the page.
 */
export async function saveAiSettingsAction(
  aiFields: Record<string, unknown>
): Promise<AiActionResult> {
  try {
    await requireAdmin();
    const current = await readGlobalRaw("chatSettings");
    const merged = { ...current, ...aiFields };
    const parsed = chatSettingsSchema.safeParse(merged);
    if (!parsed.success) {
      return { ok: false, error: "داده‌های نامعتبر: " + parsed.error.issues[0]?.message };
    }
    await writeGlobal("chatSettings", parsed.data);
    revalidatePath("/admin/chat/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "خطای ناشناخته" };
  }
}
