"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  X,
  Search,
  ChevronDown,
  ArrowLeft,
  User,
  Headset,
  Truck,
  MessageCircle,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import type { NavLink, NavContext } from "@/lib/site-data";
import { resolveNavIcon, categoryTone, TONE_CHIP } from "@/lib/storefront/nav-icons";
import { openChat } from "@/components/storefront/chat/chat-store";

type Contact = { primaryPhone: string; supportPhone: string };

export function MobileDrawer({
  open,
  onClose,
  shopNav,
  blogNav,
  megaNav,
  megaTriggerLabel,
  contact,
  showSearch,
  showAccount,
  chatEnabled,
  isLoggedIn,
}: {
  open: boolean;
  onClose: () => void;
  shopNav: NavLink[];
  blogNav: NavLink[];
  megaNav: NavLink[];
  megaTriggerLabel: string;
  contact: Contact;
  showSearch: boolean;
  showAccount: boolean;
  chatEnabled: boolean;
  isLoggedIn: boolean;
  context?: NavContext;
}) {
  const [catsOpen, setCatsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const shop = shopNav.filter((n) => n.mobileVisible);
  const blog = blogNav.filter((n) => n.mobileVisible);
  const cats = megaNav.filter((c) => c.mobileVisible);
  const phone = contact.primaryPhone || contact.supportPhone;

  // Esc to close + body scroll-lock while open; move focus into the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const linkCls =
    "focus-ring flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-store-text transition-colors hover:bg-store-surface-soft";

  return (
    <div className={`fixed inset-0 z-70 md:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-store-ink/50 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
      />

      {/* Panel (RTL: pinned to inline-start = right; slides in from the right) */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="منوی موبایل"
        className={`absolute inset-y-0 start-0 flex w-[min(86vw,22rem)] flex-col bg-store-surface shadow-store-popover transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Head */}
        <div className="flex items-center justify-between gap-2 border-b border-store-border px-4 py-3">
          <Link href="/" onClick={onClose} aria-label="دشت‌زاد" className="focus-ring rounded-lg">
            <Logo variant="mark" className="h-9 w-auto" />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="بستن منو"
            className="focus-ring rounded-xl p-2 text-store-text-muted transition-colors hover:bg-store-surface-soft hover:text-store-text"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          {/* Account */}
          {showAccount && (
            <Link
              href={isLoggedIn ? "/account" : "/auth"}
              onClick={onClose}
              className="focus-ring mb-3 flex items-center justify-between gap-2 rounded-2xl border border-store-border bg-store-surface-warm px-4 py-3 transition-colors hover:border-store-primary/40"
            >
              <span className="flex items-center gap-2.5 font-bold text-store-text">
                <User className="size-5 text-store-primary" aria-hidden />
                {isLoggedIn ? "حساب کاربری" : "ورود / ثبت‌نام"}
              </span>
              <ArrowLeft className="size-4 text-store-text-faint" aria-hidden />
            </Link>
          )}

          {/* Search */}
          {showSearch && (
            <form action="/products" className="relative mb-4">
              <input
                type="search"
                name="q"
                placeholder="جستجو در فروشگاه…"
                aria-label="جستجوی محصول"
                className="w-full rounded-xl border border-store-border bg-store-bg py-2.5 ps-4 pe-10 text-sm text-store-text outline-none transition-colors focus:border-store-primary"
              />
              <button type="submit" aria-label="جستجو" className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-store-text-faint hover:text-store-primary">
                <Search className="size-4" aria-hidden />
              </button>
            </form>
          )}

          {/* فروشگاه */}
          {(shop.length > 0 || cats.length > 0) && (
            <Section title="فروشگاه">
              {cats.length > 0 && (
                <div className="rounded-xl">
                  <button
                    type="button"
                    aria-expanded={catsOpen}
                    onClick={() => setCatsOpen((v) => !v)}
                    className="focus-ring flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-store-text transition-colors hover:bg-store-surface-soft"
                  >
                    <span>{megaTriggerLabel}</span>
                    <ChevronDown className={`size-4 transition-transform ${catsOpen ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {catsOpen && (
                    <div className="grid grid-cols-2 gap-1.5 px-2 pb-2 pt-1">
                      <Link href="/products" onClick={onClose} className="focus-ring col-span-2 flex items-center justify-center gap-1.5 rounded-lg bg-store-primary-soft py-2 text-xs font-bold text-store-primary-hover">
                        همه‌ی محصولات
                        <ArrowLeft className="size-3.5" aria-hidden />
                      </Link>
                      {cats.map((cat) => {
                        const Icon = resolveNavIcon(cat.icon, cat.label, cat.href);
                        const tone = TONE_CHIP[categoryTone(cat.label)];
                        return (
                          <Link
                            key={cat.href + cat.label}
                            href={cat.href}
                            onClick={onClose}
                            className="focus-ring flex items-center gap-2 rounded-xl border border-store-border bg-store-surface px-2.5 py-2 text-xs font-medium text-store-text transition-colors hover:border-store-primary/40"
                          >
                            <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                              <Icon className="size-4" aria-hidden />
                            </span>
                            <span className="truncate">{cat.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {shop.map((n) => {
                const Icon = resolveNavIcon(n.icon, n.label, n.href);
                return (
                  <Link key={n.href + n.label} href={n.href} onClick={onClose} target={n.target === "BLANK" ? "_blank" : undefined} className={linkCls}>
                    <Icon className="size-4.5 text-store-text-faint" aria-hidden />
                    <span>{n.label}</span>
                    {n.badge && <span className="ms-auto rounded-full bg-store-clay-soft px-2 py-0.5 text-[10px] font-bold text-store-clay-deep">{n.badge}</span>}
                  </Link>
                );
              })}
            </Section>
          )}

          {/* مجله / بلاگ */}
          {blog.length > 0 && (
            <Section title="مجله">
              {blog.map((n) => {
                const Icon = resolveNavIcon(n.icon, n.label, n.href);
                return (
                  <Link key={n.href + n.label} href={n.href} onClick={onClose} target={n.target === "BLANK" ? "_blank" : undefined} className={linkCls}>
                    <Icon className="size-4.5 text-store-text-faint" aria-hidden />
                    <span>{n.label}</span>
                  </Link>
                );
              })}
            </Section>
          )}

          {/* پشتیبانی */}
          <Section title="پشتیبانی">
            <Link href="/orders" onClick={onClose} className={linkCls}>
              <Truck className="size-4.5 text-store-text-faint" aria-hidden />
              <span>پیگیری سفارش</span>
            </Link>
            <Link href="/contact" onClick={onClose} className={linkCls}>
              <Headset className="size-4.5 text-store-text-faint" aria-hidden />
              <span>پشتیبانی و تماس با ما</span>
            </Link>
            {phone && (
              <a href={`tel:${phone}`} className={linkCls} dir="ltr">
                <span dir="rtl" className="text-store-text-muted">{phone}</span>
              </a>
            )}
            {chatEnabled && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openChat();
                }}
                className={`${linkCls} w-full text-start`}
              >
                <MessageCircle className="size-4.5 text-store-primary" aria-hidden />
                <span className="font-semibold">گفت‌وگوی زنده با پشتیبانی</span>
                <span className="ms-auto inline-block size-2 rounded-full bg-store-success" aria-hidden />
              </button>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <h2 className="px-3 pb-1 pt-2 text-xs font-bold text-store-text-faint">{title}</h2>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
