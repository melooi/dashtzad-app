"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin/nav";

/** Custom event other admin chrome (e.g. the header search button) dispatches
 * to open the palette without prop-drilling shared state. */
export const OPEN_COMMAND_EVENT = "admin:open-command";

type FlatItem = { label: string; href: string; icon: LucideIcon; group: string };

// Flatten the sidebar tree once — the palette searches every destination.
const ITEMS: FlatItem[] = ADMIN_NAV.flatMap((g) =>
  g.items.map((it) => ({ label: it.label, href: it.href, icon: it.icon, group: g.title })),
);

/** Forgiving Persian/Arabic normalization so "كافه"/"کافه" and ZWNJ both match. */
function norm(s: string): string {
  return s
    .replace(/[يﻱﻲ]/g, "ی")
    .replace(/[كﻙﻚ]/g, "ک")
    .replace(/‌/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Global Cmd/Ctrl+K command palette — jump to any admin destination by name.
 * Mounted once in AdminShell. Keyboard: ↑/↓ to move, Enter to go, Esc to close.
 */
export function AdminCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global open: Cmd/Ctrl+K toggles; the header button dispatches an event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_EVENT, onOpen);
    };
  }, []);

  const results = useMemo(() => {
    const q = norm(query);
    if (!q) return ITEMS;
    return ITEMS.filter((it) => norm(it.label).includes(q) || norm(it.group).includes(q));
  }, [query]);

  // On open: reset, lock scroll, focus the input after paint.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reset highlight whenever the result set changes.
  useEffect(() => setActive(0), [query]);

  // Keep the highlighted row in view during keyboard navigation.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) go(r.href);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="جست‌وجوی سریع پنل"
    >
      <div
        className="fixed inset-0 bg-dz-a-night/50 backdrop-blur-sm"
        aria-hidden
        onClick={() => setOpen(false)}
      />
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-dz-a-primary-100 bg-dz-a-canvas shadow-2xl dark:border-dz-a-night-border dark:bg-dz-a-night-elevated"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2.5 border-b border-dz-a-primary-100 px-4 dark:border-dz-a-night-border">
          <Search className="size-4 shrink-0 text-dz-a-primary-400 dark:text-dz-a-night-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جست‌وجو در پنل… نام بخش را بنویسید"
            aria-label="جست‌وجو در بخش‌های پنل"
            className="w-full bg-transparent py-3.5 text-sm text-dz-a-primary-900 outline-none placeholder:text-dz-a-primary-300 dark:text-dz-a-night-fg dark:placeholder:text-dz-a-night-faint"
          />
          <kbd className="hidden shrink-0 rounded-md border border-dz-a-primary-200 px-1.5 py-0.5 text-[10px] text-dz-a-primary-400 sm:block dark:border-dz-a-night-border dark:text-dz-a-night-faint">
            ESC
          </kbd>
        </div>
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-dz-a-primary-400 dark:text-dz-a-night-faint">
              نتیجه‌ای پیدا نشد
            </p>
          ) : (
            results.map((r, i) => {
              const Icon = r.icon;
              const showGroup = r.group !== r.label;
              return (
                <button
                  key={r.href}
                  type="button"
                  data-idx={i}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r.href)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors ${
                    i === active ? "bg-dz-a-primary-50 dark:bg-white/5" : ""
                  }`}
                >
                  <Icon
                    className={`size-4 shrink-0 ${
                      i === active
                        ? "text-dz-a-primary-600 dark:text-dz-a-primary-300"
                        : "text-dz-a-primary-400 dark:text-dz-a-night-faint"
                    }`}
                  />
                  <span className="flex-1 truncate text-sm text-dz-a-primary-800 dark:text-dz-a-night-fg">{r.label}</span>
                  {showGroup && (
                    <span className="shrink-0 text-xs text-dz-a-primary-400 dark:text-dz-a-night-faint">{r.group}</span>
                  )}
                  {i === active && (
                    <CornerDownLeft className="size-3.5 shrink-0 text-dz-a-primary-400 dark:text-dz-a-night-faint" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
