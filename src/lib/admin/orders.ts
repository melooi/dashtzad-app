// Admin order management. requireAdmin is enforced by the caller (page/action).
import { prisma } from "@/lib/prisma";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

// Pure status constants live in a client-safe module so client components can
// import them without dragging prisma into the bundle.
export {
  ADMIN_ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  orderStatusTone,
} from "./order-status";

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus | null;
  totalRial: number;
  itemCount: number;
  createdAtISO: string;
};

export async function listAdminOrders(opts: {
  q?: string;
  status?: OrderStatus;
}): Promise<AdminOrderRow[]> {
  const q = opts.q?.trim();
  const orders = await prisma.order.findMany({
    where: {
      ...(opts.status ? { status: opts.status } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q, mode: "insensitive" } },
              { user: { name: { contains: q, mode: "insensitive" } } },
              { user: { phoneNumber: { contains: q } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, phoneNumber: true } },
      payment: { select: { status: true } },
      items: { select: { quantity: true } },
    },
  });
  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.user.name ?? "—",
    customerPhone: o.user.phoneNumber,
    status: o.status,
    paymentStatus: o.payment?.status ?? null,
    totalRial: o.total_rial,
    itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
    createdAtISO: o.createdAt.toISOString(),
  }));
}

/** Update status + append a status-history entry (audit trail). */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
): Promise<void> {
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status } }),
    prisma.orderStatusHistory.create({ data: { orderId, status, note: note?.trim() || null } }),
  ]);
}

export async function setOrderTracking(orderId: string, code: string): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: { trackingCode: code.trim() || null },
  });
}
