// Admin customer list + 360 view. Reuses the userId-scoped account services so
// there's a single source of truth. requireAdmin is enforced by the caller.
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/enums";
import { listOrders } from "@/lib/account/orders";
import { listAddresses } from "@/lib/account/addresses";
import { listWishlist } from "@/lib/account/wishlist";
import { listRecent } from "@/lib/account/recent";
import { listMyConversations } from "@/lib/account/messages";
import { listMyReviews, listMyQuestions } from "@/lib/account/reviews";
import { getCreditSummary } from "@/lib/credit/service";
import { computeProfileCompletion } from "@/lib/account/completion";

const SPENT_STATUSES: OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export type AdminCustomerRow = {
  id: string;
  name: string | null;
  phoneNumber: string;
  email: string | null;
  isAdmin: boolean;
  createdAtISO: string;
  orderCount: number;
  totalSpentRial: number;
};

export async function listCustomers(q?: string): Promise<AdminCustomerRow[]> {
  const term = q?.trim();
  const users = await prisma.user.findMany({
    where: term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { phoneNumber: { contains: term } },
            { email: { contains: term, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { orders: true } } },
  });

  const ids = users.map((u) => u.id);
  const spent = ids.length
    ? await prisma.order.groupBy({
        by: ["userId"],
        where: { userId: { in: ids }, status: { in: SPENT_STATUSES } },
        _sum: { total_rial: true },
      })
    : [];
  const spentMap = new Map(spent.map((s) => [s.userId, s._sum.total_rial ?? 0]));

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    phoneNumber: u.phoneNumber,
    email: u.email,
    isAdmin: u.role === "ADMIN",
    createdAtISO: u.createdAt.toISOString(),
    orderCount: u._count.orders,
    totalSpentRial: spentMap.get(u.id) ?? 0,
  }));
}

export async function listCustomerNotes(userId: string) {
  const rows = await prisma.customerNote.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });
  return rows.map((n) => ({
    id: n.id,
    body: n.body,
    authorName: n.author.name ?? "مدیر",
    createdAtISO: n.createdAt.toISOString(),
  }));
}

export async function addCustomerNote(userId: string, authorId: string, body: string) {
  const text = body.trim();
  if (!text) throw new Error("متن یادداشت خالی است.");
  await prisma.customerNote.create({ data: { userId, authorId, body: text } });
}

/** Everything the admin 360 page needs, or null if the user doesn't exist. */
export async function getCustomer360(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const [
    orders,
    addresses,
    conversations,
    reviews,
    questions,
    recent,
    wishlist,
    credit,
    notes,
    addressCount,
    spentAgg,
  ] = await Promise.all([
    listOrders(userId),
    listAddresses(userId),
    listMyConversations(userId),
    listMyReviews(userId),
    listMyQuestions(userId),
    listRecent(userId),
    listWishlist(userId),
    getCreditSummary(userId),
    listCustomerNotes(userId),
    prisma.address.count({ where: { userId } }),
    prisma.order.aggregate({
      where: { userId, status: { in: SPENT_STATUSES } },
      _sum: { total_rial: true },
    }),
  ]);

  return {
    profile: {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email,
      nationalId: user.nationalId,
      birthDateISO: user.birthDate?.toISOString() ?? null,
      isAdmin: user.role === "ADMIN",
      isActive: user.isActive,
      createdAtISO: user.createdAt.toISOString(),
    },
    completion: computeProfileCompletion(user, addressCount > 0),
    orderCount: orders.length,
    totalSpentRial: spentAgg._sum.total_rial ?? 0,
    orders,
    addresses,
    conversations,
    reviews,
    questions,
    recent,
    wishlist,
    credit,
    notes,
  };
}

export type Customer360 = NonNullable<Awaited<ReturnType<typeof getCustomer360>>>;
