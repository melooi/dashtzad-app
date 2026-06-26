"use client";

import { useEffect, useState } from "react";
import { Send, MessageCircle, Link2, Check } from "lucide-react";

/**
 * Share the current article. Uses the live page URL (read on mount), so no
 * fake/hard-coded links. Telegram + WhatsApp + copy-link.
 */
export function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setUrl(window.location.href));
  }, []);

  const enc = encodeURIComponent;
  const telegram = `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`;
  const whatsapp = `https://wa.me/?text=${enc(`${title} ${url}`)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const btn =
    "focus-ring inline-flex items-center justify-center gap-1.5 rounded-xl border border-store-border bg-store-surface px-3 py-2 text-xs font-medium text-store-text-muted transition-colors hover:border-store-primary hover:text-store-primary";

  return (
    <div className="flex flex-wrap gap-2">
      <a href={telegram} target="_blank" rel="noopener noreferrer" className={btn} aria-label="اشتراک در تلگرام">
        <Send className="size-4" /> تلگرام
      </a>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={btn} aria-label="اشتراک در واتساپ">
        <MessageCircle className="size-4" /> واتساپ
      </a>
      <button type="button" onClick={copy} className={btn} aria-label="کپی لینک">
        {copied ? <Check className="size-4 text-store-success" /> : <Link2 className="size-4" />}
        {copied ? "کپی شد" : "کپی لینک"}
      </button>
    </div>
  );
}
