"use client";

import { useSyncExternalStore } from "react";
import { getCount, CART_EVENT } from "@/lib/cart";

// Read the localStorage cart count without hydration mismatch or
// set-state-in-effect. Server snapshot = 0; client re-reads on CART_EVENT.
function subscribe(cb: () => void) {
  window.addEventListener(CART_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CART_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useCartCount(): number {
  return useSyncExternalStore(subscribe, getCount, () => 0);
}
