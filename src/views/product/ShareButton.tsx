"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

/**
 * Real share action: Web Share API where available, clipboard fallback. No
 * external network, no tracking — just shares the current product URL.
 */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* user dismissed share/copy — nothing to do */
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      aria-label="اشتراک‌گذاری محصول"
      className="inline-flex items-center gap-2 rounded-xl border border-store-border bg-store-surface px-4 py-2.5 text-sm font-medium text-store-text-muted transition-colors hover:border-store-primary hover:bg-store-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-primary"
    >
      {copied ? <Check className="size-4 text-store-success" aria-hidden /> : <Share2 className="size-4" aria-hidden />}
      {copied ? "کپی شد" : "اشتراک‌گذاری"}
    </button>
  );
}
