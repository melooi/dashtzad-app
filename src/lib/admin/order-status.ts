// Client-safe order-status constants (NO prisma import) — usable from both
// server pages and client components.
import type { OrderStatus } from "@/generated/prisma/enums";

export const ADMIN_ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "در انتظار پرداخت" },
  { value: "PAID", label: "پرداخت‌شده" },
  { value: "PROCESSING", label: "در حال آماده‌سازی" },
  { value: "SHIPPED", label: "ارسال‌شده" },
  { value: "DELIVERED", label: "تحویل‌شده" },
  { value: "CANCELLED", label: "لغو‌شده" },
  { value: "REFUNDED", label: "مرجوع‌شده" },
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = Object.fromEntries(
  ADMIN_ORDER_STATUSES.map((s) => [s.value, s.label]),
) as Record<OrderStatus, string>;

export function orderStatusTone(s: OrderStatus): "green" | "blue" | "amber" | "gray" | "red" {
  if (s === "DELIVERED" || s === "PAID") return "green";
  if (s === "PROCESSING" || s === "SHIPPED") return "blue";
  if (s === "PENDING") return "amber";
  if (s === "REFUNDED") return "red";
  return "gray";
}
