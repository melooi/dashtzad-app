"use client";

import { useEffect } from "react";

/**
 * Fire-and-forget product-view beacon. Records the view server-side for
 * logged-in users (guests get 401, ignored). Renders nothing and keeps the PDP
 * statically optimizable (no cookie read during server render).
 */
export function RecordView({ slug }: { slug: string }) {
  useEffect(() => {
    fetch("/api/account/recent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, [slug]);
  return null;
}
