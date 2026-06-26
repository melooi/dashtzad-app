"use client";

import { useSyncExternalStore } from "react";

// Single client-side owner of the favorites cache (localStorage key `dz_fav`).
// SOURCE OF TRUTH:
//   • logged-in user → the server `WishlistItem` table is authoritative. This
//     localStorage set is only a cache so storefront hearts render instantly;
//     it is reconciled from the server on every full page load (reconcileWishlist).
//   • guest → localStorage is the only store (no account to persist to).
// Every favorite mutation goes through here, so there is exactly one code path
// touching `dz_fav` (no duplicate read/write logic elsewhere).
const KEY = "dz_fav";
const EVENT = "dz-fav-changed";
const WISHLIST_URL = "/api/account/wishlist";

// Set by reconcileWishlist once it learns the auth state from the server. While
// false, toggles stay local-only (guests get no pointless 401s); once true,
// toggles write through to the server.
let loggedIn = false;
export function isWishlistLoggedIn(): boolean {
  return loggedIn;
}

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...new Set(slugs)]));
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function readFavSlugs(): string[] {
  return read();
}

export function removeFavSlug(slug: string): void {
  write(read().filter((s) => s !== slug));
}

export function addFavSlug(slug: string): void {
  write([...read(), slug]);
}

/** Replace local favorites with the authoritative server set. */
export function syncFavSlugs(slugs: string[]): void {
  write(slugs);
}

// Fire-and-forget server write-through (logged-in only). The server is
// authoritative; reconcileWishlist will heal any dropped request on next load.
function pushToServer(slug: string, adding: boolean): void {
  if (!loggedIn) return;
  fetch(WISHLIST_URL, {
    method: adding ? "POST" : "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  }).catch(() => {});
}

/** Toggle a slug's favorite state (local + server). Returns the new state. */
export function toggleFav(slug: string): boolean {
  const list = read();
  const adding = !list.includes(slug);
  write(adding ? [...list, slug] : list.filter((s) => s !== slug));
  pushToServer(slug, adding);
  return adding;
}

/**
 * Reconcile the local cache with the server — runs once per full page load
 * (mounted globally by <WishlistSync/>). NON-DESTRUCTIVE: it migrates any
 * local-only favorites up to the server before adopting the server set, so a
 * guest's likes survive login and a slow/failed write is never silently wiped.
 */
export async function reconcileWishlist(): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${WISHLIST_URL}?slugs=1`);
  } catch {
    return; // offline — keep the local cache as-is
  }
  if (res.status === 401) {
    loggedIn = false; // guest: localStorage stays the source of truth
    return;
  }
  if (!res.ok) return;

  let serverSlugs: string[] = [];
  try {
    serverSlugs = (await res.json())?.slugs ?? [];
  } catch {
    return;
  }
  loggedIn = true;

  const serverSet = new Set(serverSlugs);
  const localOnly = read().filter((s) => !serverSet.has(s));
  if (localOnly.length > 0) {
    // Migrate guest/offline favorites up (idempotent on the server).
    try {
      await fetch(WISHLIST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: localOnly }),
      });
    } catch {
      /* keep the union locally regardless of a transient failure */
    }
  }
  // Server is authoritative; union guarantees we never drop a pending like.
  write([...serverSlugs, ...localOnly]);
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Reactive "is this slug favorited" (false on the server — no hydration mismatch). */
export function useIsFav(slug: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => read().includes(slug),
    () => false,
  );
}

/** Reactive favorites count from localStorage (0 on the server — no mismatch). */
export function useFavCount(): number {
  return useSyncExternalStore(
    subscribe,
    () => read().length,
    () => 0,
  );
}
