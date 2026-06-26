"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useIsFav, toggleFav } from "@/views/account/panel/useFav";

// Heart toggle for product cards. Includes pop+burst animations (matches design's dzFavPop/dzFavBurst).
// Favorite state lives in the single wishlist store (useFav): server-authoritative for logged-in users
// (write-through + reconcile), localStorage-only for guests.
export function FavButton({ slug, title }: { slug: string; title: string }) {
  const fav = useIsFav(slug);
  const [pop, setPop] = useState(false);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const adding = toggleFav(slug);
    if (adding) {
      setPop(true);
      setTimeout(() => setPop(false), 450);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={fav}
      aria-label={fav ? `حذف ${title} از علاقه‌مندی‌ها` : `افزودن ${title} به علاقه‌مندی‌ها`}
      className={`store-card__fav${fav ? " is-fav" : ""}${pop ? " is-pop" : ""}`}
    >
      <span className="store-card__fav-burst" aria-hidden />
      <Heart className="size-4" fill={fav ? "currentColor" : "none"} aria-hidden />
    </button>
  );
}
