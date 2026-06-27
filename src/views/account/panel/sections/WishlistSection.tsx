"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Store } from "lucide-react";
import { SectionHead } from "../SectionHead";
import { ProductGrid } from "../ProductGrid";
import { PanelEmpty, PanelError, SkeletonProductGrid } from "../ui";
import { jsonGet, jsonSend } from "../fetcher";
import { removeFavSlug } from "../useFav";
import { useToast } from "../Toast";
import { ACCOUNT_QUERY_KEYS, type AccountProductCard } from "@/lib/account/types";

export function WishlistSection() {
  const qc = useQueryClient();
  const toast = useToast();
  const q = useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.wishlist,
    queryFn: () => jsonGet<{ items: AccountProductCard[] }>("/api/account/wishlist"),
  });

  const remove = useMutation({
    mutationFn: (slug: string) => jsonSend("/api/account/wishlist", "DELETE", { slug }),
    onSuccess: (_d, slug) => {
      removeFavSlug(slug); // keep storefront hearts in sync
      qc.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.wishlist });
      qc.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.overview });
      toast("از علاقه‌مندی‌ها حذف شد");
    },
  });

  const items = q.data?.items ?? [];

  return (
    <div>
      <SectionHead title="علاقه‌مندی‌ها" sub="محصولاتی که برای خرید بعدی نشان کرده‌ای" />
      {q.isLoading ? (
        <SkeletonProductGrid />
      ) : q.isError ? (
        <PanelError onRetry={() => q.refetch()} />
      ) : items.length === 0 ? (
        <PanelEmpty
          icon={<Heart className="size-7" />}
          title="لیست علاقه‌مندی‌ات خالی است"
          desc="با زدن آیکن قلب روی محصولات، آن‌ها را برای دسترسی سریع اینجا نگه دار."
          action={
            <Link href="/products" className="store-btn store-btn-primary">
              <Store className="size-4" /> رفتن به فروشگاه
            </Link>
          }
        />
      ) : (
        <ProductGrid items={items} onRemove={(slug) => remove.mutate(slug)} />
      )}
    </div>
  );
}
