"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { addCustomerNote } from "@/lib/admin/customer";
import { addCreditAdjustment } from "@/lib/credit/service";
import { toEnglishDigits } from "@/lib/price";
import type { StoreCreditDirection, StoreCreditType } from "@/generated/prisma/enums";

export type ActionResult = { ok: true } | { ok: false; error: string };

const TYPES: StoreCreditType[] = [
  "GIFT",
  "RETURN",
  "COMPENSATION",
  "MANUAL_ADJUSTMENT",
  "CAMPAIGN",
];

export async function adjustCreditAction(
  userId: string,
  input: { amountToman: string; type: string; direction: string; reason: string },
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const amountToman = Number(toEnglishDigits(String(input.amountToman)).replace(/[^\d]/g, ""));
  if (!Number.isFinite(amountToman) || amountToman <= 0) {
    return { ok: false, error: "مبلغ (به تومان) باید عددی مثبت باشد." };
  }
  if (!TYPES.includes(input.type as StoreCreditType)) {
    return { ok: false, error: "نوع اعتبار نامعتبر است." };
  }
  const direction: StoreCreditDirection = input.direction === "OUT" ? "OUT" : "IN";
  // Admin enters TOMAN; store RIAL = Toman × 10 (SKILL §D).
  const amountRial = Math.round(amountToman) * 10;
  try {
    await addCreditAdjustment({
      userId,
      amountRial,
      type: input.type as StoreCreditType,
      direction,
      reason: input.reason?.trim() || null,
      adminId: admin.id,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "خطا در ثبت اعتبار." };
  }
  revalidatePath(`/admin/customers/${userId}`);
  return { ok: true };
}

export async function addNoteAction(userId: string, body: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    await addCustomerNote(userId, admin.id, body);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "خطا در ثبت یادداشت." };
  }
  revalidatePath(`/admin/customers/${userId}`);
  return { ok: true };
}
