"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

/** Copy-to-clipboard button + optional "open" link for feed/sitemap URLs. */
export function SeoCopyButton({ value, openHref }: { value: string; openHref?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={copy}
        className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-dz-primary-200 dark:border-dz-night-border px-2.5 py-1.5 text-xs text-dz-primary-600 dark:text-dz-primary-300 transition-colors hover:border-dz-primary-300 dark:hover:border-dz-primary-500/50 hover:bg-dz-primary-50 dark:hover:bg-white/5"
      >
        {copied ? <Check className="size-3.5 text-dz-success dark:text-dz-success-300" /> : <Copy className="size-3.5" />}
        {copied ? "کپی شد" : "کپی آدرس"}
      </button>
      {openHref && (
        <a
          href={openHref}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-dz-primary-200 dark:border-dz-night-border px-2.5 py-1.5 text-xs text-dz-primary-600 dark:text-dz-primary-300 transition-colors hover:border-dz-primary-300 dark:hover:border-dz-primary-500/50 hover:bg-dz-primary-50 dark:hover:bg-white/5"
        >
          <ExternalLink className="size-3.5" />
          باز کردن
        </a>
      )}
    </div>
  );
}
