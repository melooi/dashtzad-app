"use client";

import { useEffect } from "react";
import { reconcileWishlist } from "@/views/account/panel/useFav";

// Mounted once in the public layout. On each full page load it reconciles the
// local favorites cache with the server (migrating guest/offline likes up, then
// adopting the server set) so storefront hearts are consistent on every page —
// not only after visiting /account. Renders nothing.
export function WishlistSync() {
  useEffect(() => {
    reconcileWishlist();
  }, []);
  return null;
}
