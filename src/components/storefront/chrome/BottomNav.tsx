"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, ShoppingCart, User, MessageCircle, type LucideIcon } from "lucide-react";
import { useCartCount } from "@/components/storefront/chrome/useCartCount";
import { useChatOpen, useChatUnread, openChat } from "@/components/storefront/chat/chat-store";
import { resolveNavIcon } from "@/lib/storefront/nav-icons";
import { toPersianNumbers } from "@/lib/price";
import type { NavLink } from "@/lib/site-data";

type Tab = { href: string; label: string; Icon: LucideIcon; kind?: "cart" | "chat" };

const DEFAULT_TABS: Tab[] = [
  { href: "/", label: "خانه", Icon: Home },
  { href: "/products", label: "فروشگاه", Icon: Store },
  { href: "/contact", label: "گفت‌وگو", Icon: MessageCircle, kind: "chat" },
  { href: "/cart", label: "سبد", Icon: ShoppingCart, kind: "cart" },
  { href: "/account", label: "حساب", Icon: User },
];

/**
 * CHAT-CP1 — the center slot is ALWAYS the elevated action. When chat is enabled
 * (`chat` prop) it opens the chat widget and carries the unread badge; otherwise
 * it falls back to the configured/default chat-style link (e.g. /contact),
 * preserving the locked elevated-center design either way.
 */
export function BottomNav({ items, chat }: { items: NavLink[]; chat?: { label: string } | null }) {
  const pathname = usePathname();
  const count = useCartCount();
  const chatOpen = useChatOpen();
  const chatUnread = useChatUnread();

  const configured = items.filter((n) => n.mobileVisible).slice(0, 5);
  const baseTabs: Tab[] =
    configured.length > 0
      ? configured.map((n) => ({
          href: n.href,
          label: n.label,
          Icon: resolveNavIcon(n.icon, n.label, n.href),
          kind: n.href === "/cart" ? "cart" : /گفت|چت/.test(n.label) ? "chat" : undefined,
        }))
      : DEFAULT_TABS;

  const sideTabs = baseTabs.filter((t) => t.kind !== "chat").slice(0, 4);
  const fallbackCenter: Tab =
    baseTabs.find((t) => t.kind === "chat") ?? { href: "/contact", label: chat?.label ?? "گفت‌وگو", Icon: MessageCircle, kind: "chat" };
  const half = Math.ceil(sideTabs.length / 2);
  const left = sideTabs.slice(0, half);
  const right = sideTabs.slice(half);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const renderSide = (t: Tab) => {
    const active = isActive(t.href);
    return (
      <Link
        key={t.href + t.label}
        href={t.href}
        aria-label={t.label}
        aria-current={active ? "page" : undefined}
        className={`focus-ring relative z-10 flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
          active ? "text-store-primary" : "text-store-text-muted"
        }`}
      >
        <span className="relative">
          <t.Icon className="size-5.5" aria-hidden />
          {t.kind === "cart" && count > 0 && (
            <span className="absolute -end-2 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-store-clay px-0.5 text-[9px] font-bold text-white">
              {toPersianNumbers(count)}
            </span>
          )}
        </span>
        <span>{t.label}</span>
      </Link>
    );
  };

  const renderCenter = () => {
    const label = chat?.label ?? fallbackCenter.label;
    const active = chat ? chatOpen : isActive(fallbackCenter.href);
    const badge = chat && chatUnread > 0;
    const inner = (
      <>
        <span
          className={`relative flex size-12 items-center justify-center rounded-2xl border-4 border-store-surface shadow-store-sm transition-colors ${
            active ? "bg-store-primary-hover text-white" : "bg-store-primary text-white"
          }`}
        >
          <MessageCircle className="size-5.5" aria-hidden />
          {badge && (
            <span className="absolute -end-1.5 -top-1.5 grid size-5 place-items-center rounded-full border-2 border-store-surface bg-store-clay text-[9px] font-bold text-white">
              {toPersianNumbers(chatUnread)}
            </span>
          )}
        </span>
        <span className="text-[10px] font-bold text-store-text">{label}</span>
      </>
    );
    const cls = "focus-ring relative z-10 -mt-5 flex flex-1 flex-col items-center gap-0.5";
    return chat ? (
      <button
        type="button"
        onClick={openChat}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={chatOpen}
        className={cls}
      >
        {inner}
      </button>
    ) : (
      <Link href={fallbackCenter.href} aria-label={label} aria-current={active ? "page" : undefined} className={cls}>
        {inner}
      </Link>
    );
  };

  return (
    <nav
      aria-label="ناوبری پایین"
      className="fixed inset-x-0 bottom-0 z-60 flex justify-center px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="relative flex w-full max-w-sm items-stretch justify-between gap-1 rounded-2xl border border-store-border/70 bg-store-surface/80 p-1.5 shadow-store-card backdrop-blur-xl">
        {/* glass sheen */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-linear-to-b from-white/60 to-transparent" />

        {left.map(renderSide)}
        {renderCenter()}
        {right.map(renderSide)}
      </div>
    </nav>
  );
}
