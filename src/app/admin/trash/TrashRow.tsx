"use client";

import { useTransition } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import {
  restoreProduct, permanentDeleteProduct,
  restorePost, permanentDeletePost,
  restoreCategory, permanentDeleteCategory,
  restoreBanner, permanentDeleteBanner,
  restoreCoupon, permanentDeleteCoupon,
  restoreContentSeries, permanentDeleteContentSeries,
  restoreMenu, permanentDeleteMenu,
  restoreMenuItem, permanentDeleteMenuItem,
  restoreFaqGroup, permanentDeleteFaqGroup,
  restoreFaqItem, permanentDeleteFaqItem,
  restoreMediaAsset, permanentDeleteMediaAsset,
} from "./actions";

export type TrashSectionKey =
  | "products" | "posts" | "categories" | "banners" | "coupons"
  | "series" | "menus" | "menuItems" | "faqGroups" | "faqItems" | "media";

const RESTORE_ACTIONS: Record<TrashSectionKey, (id: string) => Promise<{ ok: boolean; error?: string }>> = {
  products: restoreProduct,
  posts: restorePost,
  categories: restoreCategory,
  banners: restoreBanner,
  coupons: restoreCoupon,
  series: restoreContentSeries,
  menus: restoreMenu,
  menuItems: restoreMenuItem,
  faqGroups: restoreFaqGroup,
  faqItems: restoreFaqItem,
  media: restoreMediaAsset,
};

const DELETE_ACTIONS: Record<TrashSectionKey, (id: string) => Promise<{ ok: boolean; error?: string }>> = {
  products: permanentDeleteProduct,
  posts: permanentDeletePost,
  categories: permanentDeleteCategory,
  banners: permanentDeleteBanner,
  coupons: permanentDeleteCoupon,
  series: permanentDeleteContentSeries,
  menus: permanentDeleteMenu,
  menuItems: permanentDeleteMenuItem,
  faqGroups: permanentDeleteFaqGroup,
  faqItems: permanentDeleteFaqItem,
  media: permanentDeleteMediaAsset,
};

export function TrashRow({
  id,
  sectionKey,
  name,
  meta,
}: {
  id: string;
  sectionKey: TrashSectionKey;
  name: string;
  meta?: string;
}) {
  const [restorePending, startRestore] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const pending = restorePending || deletePending;

  const handleRestore = () => {
    startRestore(async () => {
      await RESTORE_ACTIONS[sectionKey](id);
    });
  };

  const handleDelete = () => {
    if (!confirm("این آیتم برای همیشه از دیتابیس پاک می‌شود. ادامه می‌دهید؟")) return;
    startDelete(async () => {
      await DELETE_ACTIONS[sectionKey](id);
    });
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-dz-a-primary-100 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-dz-a-primary-800 dark:text-dz-a-night-fg">{name}</p>
        {meta && <p className="truncate text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">{meta}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={handleRestore}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dz-a-primary-200 dark:border-dz-a-night-border bg-white dark:bg-dz-a-night-surface px-3 py-1.5 text-xs font-medium text-dz-a-primary-700 dark:text-dz-a-night-fg hover:bg-dz-a-primary-50 dark:hover:bg-white/5 disabled:opacity-40 transition-colors"
        >
          <RotateCcw className="size-3.5" />
          بازگردانی
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dz-a-error/30 bg-white dark:bg-dz-a-night-surface px-3 py-1.5 text-xs font-medium text-dz-a-error dark:text-dz-a-error-300 hover:bg-dz-a-error/10 disabled:opacity-40 transition-colors"
        >
          <Trash2 className="size-3.5" />
          حذف دائمی
        </button>
      </div>
    </div>
  );
}
