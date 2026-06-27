"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { History, Store } from "lucide-react";
import { SectionHead } from "../SectionHead";
import { ProductGrid } from "../ProductGrid";
import { PanelEmpty, PanelError, SkeletonProductGrid } from "../ui";
import { jsonGet } from "../fetcher";
import { ACCOUNT_QUERY_KEYS, type AccountProductCard } from "@/lib/account/types";

export function RecentSection() {
  const q = useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.recent,
    queryFn: () => jsonGet<{ items: AccountProductCard[] }>("/api/account/recent"),
  });
  const items = q.data?.items ?? [];

  return (
    <div>
      <SectionHead title="بازدیدهای اخیر" sub="محصولاتی که اخیراً دیده‌ای" />
      {q.isLoading ? (
        <SkeletonProductGrid />
      ) : q.isError ? (
        <PanelError onRetry={() => q.refetch()} />
      ) : items.length === 0 ? (
        <PanelEmpty
          icon={<History className="size-7" />}
          title="هنوز محصولی ندیده‌ای"
          desc="محصولاتی که در فروشگاه مشاهده کنی، برای دسترسی دوباره اینجا فهرست می‌شوند."
          action={
            <Link href="/products" className="store-btn store-btn-primary">
              <Store className="size-4" /> رفتن به فروشگاه
            </Link>
          }
        />
      ) : (
        <ProductGrid items={items} />
      )}
    </div>
  );
}
