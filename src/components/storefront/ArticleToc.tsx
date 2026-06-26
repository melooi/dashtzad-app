"use client";

import { useState } from "react";
import { List, ChevronDown } from "lucide-react";

/**
 * Table of contents for an article. The body's headings can't carry ids (the
 * rich-text sanitizer strips them), so we scroll by index into the rendered
 * `.dz-article-body h2` list — robust and anchor-free.
 *
 * - variant "sidebar": always-open card (desktop sidebar).
 * - variant "mobile":  collapsible accordion (shown above the article on phones).
 */
export function ArticleToc({
  headings,
  variant = "sidebar",
  className = "",
}: {
  headings: string[];
  variant?: "sidebar" | "mobile";
  className?: string;
}) {
  const [open, setOpen] = useState(variant === "sidebar");
  if (headings.length < 2) return null;

  const jump = (i: number) => {
    const els = document.querySelectorAll<HTMLElement>(".dz-article-body h2");
    els[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (variant === "mobile") setOpen(false);
  };

  const list = (
    <ol className="flex flex-col gap-1.5">
      {headings.map((h, i) => (
        <li key={i}>
          <button
            type="button"
            onClick={() => jump(i)}
            className="flex w-full gap-2 text-start text-sm leading-6 text-store-text-muted transition-colors hover:text-store-primary"
          >
            <span className="shrink-0 font-bold text-store-text-faint">{i + 1}.</span>
            <span>{h}</span>
          </button>
        </li>
      ))}
    </ol>
  );

  if (variant === "mobile") {
    return (
      <div className={`overflow-hidden rounded-2xl border border-store-border bg-store-surface-warm ${className}`}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center gap-2 p-4 font-heading text-sm font-bold text-store-text"
        >
          <List className="size-4 text-store-primary" />
          در این مقاله می‌خوانید
          <ChevronDown className={`ms-auto size-4 text-store-text-faint transition-transform ${open ? "" : "-rotate-90"}`} />
        </button>
        {open && <div className="px-4 pb-4">{list}</div>}
      </div>
    );
  }

  return (
    <nav aria-label="فهرست مطالب" className={`rounded-2xl border border-store-border bg-store-surface-warm p-4 ${className}`}>
      <p className="mb-3 flex items-center gap-1.5 font-heading text-sm font-bold text-store-text">
        <List className="size-4 text-store-primary" /> در این مقاله می‌خوانید
      </p>
      {list}
    </nav>
  );
}
