"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { StoreContainer } from "@/components/storefront/StoreContainer";
import { ToastProvider } from "./panel/Toast";
import { Sidebar } from "./panel/Sidebar";
import { DashboardSection } from "./panel/sections/DashboardSection";
import { AccountSection } from "./panel/sections/AccountSection";
import { OrdersSection } from "./panel/sections/OrdersSection";
import { AddressesSection } from "./panel/sections/AddressesSection";
import { WalletSection } from "./panel/sections/WalletSection";
import { MessagesSection } from "./panel/sections/MessagesSection";
import { ReviewsSection } from "./panel/sections/ReviewsSection";
import { RecentSection } from "./panel/sections/RecentSection";
import { WishlistSection } from "./panel/sections/WishlistSection";
import { useStoredView } from "./panel/useStoredView";
import type { ViewId } from "./panel/nav";
import {
  ACCOUNT_QUERY_KEYS,
  type AccountOverview,
  type AccountProfile,
} from "@/lib/account/types";

async function fetchOverview(): Promise<AccountOverview> {
  const res = await fetch("/api/account/overview");
  if (!res.ok) throw new Error("failed to load overview");
  return res.json();
}

export function AccountPanel({ user: initialUser }: { user: AccountProfile }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [view, navigate] = useStoredView();

  const overview = useQuery({ queryKey: ACCOUNT_QUERY_KEYS.overview, queryFn: fetchOverview });

  // Wishlist↔localStorage reconciliation is handled globally by <WishlistSync/>
  // in the public layout (runs on every page, migrates guest favorites on login).

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  };

  const counts: Partial<Record<ViewId, number>> = overview.data
    ? {
        orders: overview.data.counts.orders,
        wishlist: overview.data.counts.wishlist,
        messages: overview.data.counts.unreadMessages,
        reviews: overview.data.counts.pendingReviews,
        addresses: overview.data.counts.addresses,
        recent: overview.data.counts.recent,
      }
    : {};

  let content;
  switch (view) {
    case "orders":
      content = <OrdersSection />;
      break;
    case "addresses":
      content = <AddressesSection />;
      break;
    case "wallet":
      content = <WalletSection />;
      break;
    case "messages":
      content = <MessagesSection />;
      break;
    case "reviews":
      content = <ReviewsSection />;
      break;
    case "recent":
      content = <RecentSection />;
      break;
    case "wishlist":
      content = <WishlistSection />;
      break;
    case "account":
      content = <AccountSection user={user} onUpdated={setUser} overview={overview.data} />;
      break;
    default:
      content = (
        <DashboardSection
          user={user}
          overview={overview.data}
          isLoading={overview.isLoading}
          onNavigate={navigate}
        />
      );
  }

  return (
    <ToastProvider>
      <StoreContainer className="py-6 text-store-text md:py-10">
        <div className="grid gap-6 md:grid-cols-[15rem_1fr] md:items-start lg:grid-cols-[16rem_1fr]">
          <Sidebar
            user={user}
            view={view}
            onNavigate={navigate}
            onLogout={logout}
            counts={counts}
          />
          <div className="min-w-0">{content}</div>
        </div>
      </StoreContainer>
    </ToastProvider>
  );
}
