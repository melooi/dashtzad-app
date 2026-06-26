"use client";

import { useCallback, useSyncExternalStore } from "react";
import { NAV, type ViewId } from "./nav";

const KEY = "dz_acct_view";
const EVENT = "dz-acct-view";

function readView(): ViewId {
  if (typeof window === "undefined") return "dashboard";
  try {
    const v = window.localStorage.getItem(KEY) as ViewId | null;
    return v && NAV.some((n) => n.id === v) ? v : "dashboard";
  } catch {
    return "dashboard";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/**
 * Active panel view, persisted in localStorage. Backed by useSyncExternalStore
 * so the server/hydration snapshot is always "dashboard" (no mismatch) and the
 * stored value is applied right after — without setState-in-effect.
 */
export function useStoredView(): [ViewId, (id: ViewId) => void] {
  const view = useSyncExternalStore<ViewId>(subscribe, readView, () => "dashboard");
  const setView = useCallback((id: ViewId) => {
    try {
      window.localStorage.setItem(KEY, id);
    } catch {
      /* storage unavailable (private mode) */
    }
    window.dispatchEvent(new Event(EVENT));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return [view, setView];
}
