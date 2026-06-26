// اعتبار دشت‌زاد — store credit ledger (NOT a banking wallet). Balance = signed
// sum of entries (non-expired IN minus OUT). Redemption at checkout is deferred
// to CHECKOUT-CREDIT-CP.
import { prisma } from "@/lib/prisma";
import type { StoreCreditDirection, StoreCreditType } from "@/generated/prisma/enums";
import type { CreditEntry, CreditSummary } from "@/lib/account/types";

export async function getCreditBalance(userId: string): Promise<number> {
  const now = new Date();
  const [inAgg, outAgg] = await Promise.all([
    prisma.storeCreditTransaction.aggregate({
      where: { userId, direction: "IN", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      _sum: { amount_rial: true },
    }),
    prisma.storeCreditTransaction.aggregate({
      where: { userId, direction: "OUT" },
      _sum: { amount_rial: true },
    }),
  ]);
  return Math.max(0, (inAgg._sum.amount_rial ?? 0) - (outAgg._sum.amount_rial ?? 0));
}

function toEntry(t: {
  id: string;
  amount_rial: number;
  direction: StoreCreditDirection;
  type: StoreCreditType;
  reason: string | null;
  createdAt: Date;
  expiresAt: Date | null;
}): CreditEntry {
  return {
    id: t.id,
    amountRial: t.amount_rial,
    direction: t.direction,
    type: t.type,
    reason: t.reason,
    createdAtISO: t.createdAt.toISOString(),
    expiresAtISO: t.expiresAt?.toISOString() ?? null,
  };
}

export async function getCreditSummary(userId: string): Promise<CreditSummary> {
  const [balanceRial, rows] = await Promise.all([
    getCreditBalance(userId),
    prisma.storeCreditTransaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);
  return { balanceRial, entries: rows.map(toEntry) };
}

/** Admin manual adjustment. amountRial must be positive; sign comes from direction. */
export async function addCreditAdjustment(input: {
  userId: string;
  amountRial: number;
  type: StoreCreditType;
  direction: StoreCreditDirection;
  reason?: string | null;
  adminId: string;
  expiresAt?: Date | null;
}): Promise<CreditEntry> {
  if (!Number.isInteger(input.amountRial) || input.amountRial <= 0) {
    throw new Error("مبلغ باید عددی مثبت باشد.");
  }
  const t = await prisma.storeCreditTransaction.create({
    data: {
      userId: input.userId,
      amount_rial: input.amountRial,
      type: input.type,
      direction: input.direction,
      reason: input.reason ?? null,
      createdByAdminId: input.adminId,
      expiresAt: input.expiresAt ?? null,
    },
  });
  return toEntry(t);
}
