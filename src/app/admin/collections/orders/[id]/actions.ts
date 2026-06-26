"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { setOrderTracking, updateOrderStatus } from "@/lib/admin/orders";
import type { OrderStatus } from "@/generated/prisma/enums";

export type ActionResult = { ok: true } | { ok: false; error: string };

const VALID: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export async function updateOrderStatusAction(
  orderId: string,
  status: string,
  note?: string,
): Promise<ActionResult> {
  await requireAdmin();
  if (!VALID.includes(status as OrderStatus)) return { ok: false, error: "وضعیت نامعتبر است." };
  await updateOrderStatus(orderId, status as OrderStatus, note);
  revalidatePath(`/admin/collections/orders/${orderId}`);
  revalidatePath("/admin/collections/orders");
  return { ok: true };
}

export async function setTrackingAction(orderId: string, code: string): Promise<ActionResult> {
  await requireAdmin();
  await setOrderTracking(orderId, code);
  revalidatePath(`/admin/collections/orders/${orderId}`);
  return { ok: true };
}
