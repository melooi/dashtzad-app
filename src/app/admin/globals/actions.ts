"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { getGlobalConfig } from "@/lib/admin/globals";
import { writeGlobal } from "@/lib/admin/global-service";

export type GlobalActionResult = { ok: true } | { ok: false; error: string };

/** Validate + upsert a single global by key, then revalidate its public paths. */
export async function saveGlobal(key: string, raw: unknown): Promise<GlobalActionResult> {
  await requireAdmin();

  const cfg = getGlobalConfig(key);
  if (!cfg) return { ok: false, error: "تنظیمات نامعتبر است." };

  const parsed = cfg.schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "داده‌های فرم نامعتبر است." };
  }

  await writeGlobal(key, parsed.data);
  for (const p of cfg.revalidate) revalidatePath(p);
  return { ok: true };
}
