// Account dashboard aggregate — all real values. Sections without data simply
// return 0 / null and the UI shows an empty state with a CTA (SKILL §H3).
import { prisma } from "@/lib/prisma";
import { getActiveOrder, getLatestOrder, ON_THE_WAY } from "./orders";
import { getDefaultAddress } from "./addresses";
import { countWishlist } from "./wishlist";
import { countRecent } from "./recent";
import { countUnreadMessages } from "./messages";
import { countPendingReviewsAndQuestions } from "./reviews";
import { getCreditBalance } from "@/lib/credit/service";
import { computeProfileCompletion } from "./completion";
import type { AccountOverview } from "./types";

export async function getAccountOverview(userId: string): Promise<AccountOverview> {
  const [
    activeOrder,
    latestOrder,
    defaultAddress,
    creditRial,
    wishlist,
    recent,
    addresses,
    pendingReviews,
    unreadMessages,
    ordersCount,
    onTheWay,
    user,
    lastSession,
    addressCountForCompletion,
  ] = await Promise.all([
    getActiveOrder(userId),
    getLatestOrder(userId),
    getDefaultAddress(userId),
    getCreditBalance(userId),
    countWishlist(userId),
    countRecent(userId),
    prisma.address.count({ where: { userId } }),
    countPendingReviewsAndQuestions(userId),
    countUnreadMessages(userId),
    prisma.order.count({ where: { userId } }),
    prisma.order.count({ where: { userId, status: { in: ON_THE_WAY } } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, nationalId: true, birthDate: true },
    }),
    prisma.session.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: 1, // the current session is newest; the previous one is "last login"
      select: { createdAt: true },
    }),
    prisma.address.count({ where: { userId } }),
  ]);

  const profileCompletion = user
    ? computeProfileCompletion(user, addressCountForCompletion > 0)
    : 0;

  return {
    activeOrder,
    latestOrder,
    defaultAddress,
    creditRial,
    profileCompletion,
    lastLoginISO: lastSession?.createdAt.toISOString() ?? null,
    counts: {
      orders: ordersCount,
      onTheWay,
      wishlist,
      addresses,
      pendingReviews,
      unreadMessages,
      recent,
    },
  };
}
