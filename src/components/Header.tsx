"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MegaMenu } from "@/components/storefront/chrome/MegaMenu";
import { MobileDrawer } from "@/components/storefront/chrome/MobileDrawer";
import { useCartCount } from "@/components/storefront/chrome/useCartCount";
import { resolveNavIcon } from "@/lib/storefront/nav-icons";
import { toPersianNumbers } from "@/lib/price";
import type { getHeaderData, NavLink } from "@/lib/site-data";

type HeaderData = Awaited<ReturnType<typeof getHeaderData>>;

const DEFAULT_SHOP_NAV: NavLink[] = [
  { href: "/", label: "خانه", target: "SELF", icon: "home", badge: null, description: null, desktopVisible: true, mobileVisible: true, children: [] },
  { href: "/products", label: "فروشگاه", target: "SELF", icon: "store", badge: null, description: null, desktopVisible: true, mobileVisible: true, children: [] },
  { href: "/blog", label: "مجله", target: "SELF", icon: "magazine", badge: null, description: null, desktopVisible: true, mobileVisible: true, children: [] },
  { href: "/about", label: "درباره ما", target: "SELF", icon: "about", badge: null, description: null, desktopVisible: true, mobileVisible: true, children: [] },
  { href: "/contact", label: "تماس با ما", target: "SELF", icon: "support", badge: null, description: null, desktopVisible: true, mobileVisible: true, children: [] },
];

export function Header({ data, chatEnabled = false }: { data: HeaderData; chatEnabled?: boolean }) {
  const { config, brand, business, contact, mainNav, secondaryNav, megaNav, megaData, announcement } = data;
  const pathname = usePathname();
  const ctx: "main" | "blog" = pathname.startsWith("/blog") ? "blog" : "main";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<{ name: string | null } | null>(null);
  const count = useCartCount();

  useEffect(() => {
    fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).then((d) => setUser(d?.user ?? null)).catch(() => {});
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen(false);
  }, [pathname]);

  const shopNav = mainNav.length > 0 ? mainNav : DEFAULT_SHOP_NAV;
  const blogNav = secondaryNav;
  const navLinks = (ctx === "blog" && blogNav.length > 0 ? blogNav : shopNav).filter((n) => n.desktopVisible);
  const hasMega = config.showMegaMenu && megaData.length > 0;
  const megaLabel = config.megaTriggerLabel || "دسته‌بندی محصولات";

  // Promo bar (two items, matching the reference). Right = admin announcement;
  // left = brand sourcing line. Both shown only when there is real content.
  const promoRight = announcement?.text || null;
  const promoLeft = brand.brandSlogan || business.aboutShortText || null;
  const showPromo = Boolean(promoRight || promoLeft);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* LAYER 1 — promo / announcement bar */}
      {showPromo && (
        <div className="bg-store-text text-store-border-strong">
          <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-[clamp(1rem,4vw,2.5rem)] py-[0.55rem] text-[0.78rem] leading-[1.7]">
            <span className="inline-flex min-w-0 items-center gap-2 font-semibold text-store-honey">
              {promoRight ? (
                announcement?.href ? (
                  <Link href={announcement.href} className="truncate hover:opacity-90">{promoRight}</Link>
                ) : (
                  <span className="truncate">{promoRight}</span>
                )
              ) : (
                <span className="truncate">{promoLeft}</span>
              )}
            </span>
            {promoRight && promoLeft && (
              <span className="hidden min-w-0 items-center gap-2 lg:inline-flex">
                <span className="truncate">{promoLeft}</span>
              </span>
            )}
          </div>
        </div>
      )}

      <header className={`${config.stickyHeader ? "sticky top-0" : ""} z-40 bg-store-surface shadow-[0_0.0625rem_0_var(--color-store-border)]`}>
        {/* ============ DESKTOP main bar (≥64rem) ============ */}
        <div className="hidden lg:block">
          <div className="mx-auto flex max-w-[90rem] items-center gap-6 px-[clamp(1rem,4vw,2.5rem)] py-[0.9rem]">
            {/* Brand: logo */}
            <Link href="/" aria-label="دشت‌زاد" className="focus-ring flex shrink-0 items-center rounded-lg">
              <Logo variant={config.logoVariant} priority className="h-12 w-auto" />
            </Link>

            {/* Search */}
            {config.showSearch && (
              <form action="/products" className="flex min-w-0 flex-1 items-center gap-[0.6rem] rounded-[0.75rem] border-2 border-store-border-strong bg-store-surface px-4 py-[0.6rem] transition-colors focus-within:border-store-primary">
                <Search className="size-[1.15rem] shrink-0 text-store-text-faint" aria-hidden />
                <input
                  type="search"
                  name="q"
                  placeholder="جستجو در فروشگاه دشت‌زاد…"
                  aria-label="جستجوی محصول"
                  className="min-w-0 flex-1 border-0 bg-transparent text-[0.9rem] text-store-text outline-none placeholder:text-store-text-faint"
                />
              </form>
            )}

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-[0.7rem]">
              {config.showCart && (
                <Link
                  href="/cart"
                  className="focus-ring inline-flex items-center gap-[0.45em] rounded-[0.75rem] bg-store-primary-soft px-4 py-[0.65em] text-[0.9rem] font-bold text-store-primary-hover transition-colors hover:bg-store-primary hover:text-white"
                >
                  <ShoppingCart className="size-[1.15rem]" aria-hidden />
                  سبد خرید
                  {count > 0 && (
                    <span className="grid h-[1.25em] min-w-[1.25em] place-items-center rounded-full bg-store-clay px-[0.3em] text-[0.72rem] font-bold text-white">
                      {toPersianNumbers(count)}
                    </span>
                  )}
                </Link>
              )}
              {config.showAccount && (
                <Link
                  href={user ? "/account" : "/auth"}
                  className="focus-ring inline-flex items-center gap-[0.45em] rounded-[0.75rem] border-2 border-store-border-strong px-4 py-[0.65em] text-[0.9rem] font-bold text-store-text transition-colors hover:border-store-primary hover:text-store-primary"
                >
                  <User className="size-[1.15rem]" aria-hidden />
                  {user?.name ? <span className="max-w-28 truncate">{user.name}</span> : "ورود"}
                </Link>
              )}
            </div>
          </div>

          {/* ============ DESKTOP nav row ============ */}
          <nav aria-label="ناوبری اصلی" className="border-t border-store-border">
            <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-[1.6rem] px-[clamp(1rem,4vw,2.5rem)]">
              {navLinks.flatMap((n, i) => {
                const Icon = resolveNavIcon(n.icon, n.label, n.href);
                const active = isActive(n.href);
                const link = (
                  <Link
                    key={n.href + n.label}
                    href={n.href}
                    target={n.target === "BLANK" ? "_blank" : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`group inline-flex items-center gap-[0.45em] whitespace-nowrap border-b-[0.15rem] py-[0.85rem] text-[0.92rem] font-semibold transition-colors ${
                      active
                        ? "border-store-primary text-store-text"
                        : "border-transparent text-store-text-muted hover:border-store-primary hover:text-store-primary"
                    }`}
                  >
                    <Icon className={`size-[1.05rem] transition-colors ${active ? "text-store-primary" : "text-store-text-faint group-hover:text-store-primary"}`} aria-hidden />
                    {n.label}
                    {n.badge && <span className="rounded-full bg-store-clay-soft px-1.5 py-0.5 text-[0.6rem] font-bold text-store-clay-deep">{n.badge}</span>}
                  </Link>
                );
                // Mega trigger sits right after the first nav item (matches reference).
                if (i === 0 && ctx === "main" && hasMega) {
                  return [link, <MegaMenu key="__mega" triggerLabel={megaLabel} categories={megaData} note={announcement?.text ?? null} />];
                }
                return [link];
              })}

              {ctx === "blog" && (
                <Link href="/products" className="inline-flex items-center gap-[0.45em] whitespace-nowrap border-b-[0.15rem] border-transparent py-[0.85rem] text-[0.92rem] font-bold text-store-primary transition-colors hover:border-store-primary">
                  فروشگاه دشت‌زاد
                </Link>
              )}
            </div>
          </nav>
        </div>

        {/* ============ MOBILE header (<64rem) ============ */}
        <div className="lg:hidden">
          <div className="flex items-center gap-3 px-4 py-[0.7rem]">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="باز کردن منو"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              className="focus-ring -ms-1 grid size-11 place-items-center rounded-[0.5rem] text-store-text transition-colors hover:bg-store-surface-warm"
            >
              <Menu className="size-6" aria-hidden />
            </button>

            <Link href="/" aria-label="دشت‌زاد" className="focus-ring mx-auto inline-flex items-center rounded-lg">
              <Logo variant={config.logoVariant} className="h-10 w-auto" />
            </Link>

            <div className="flex items-center gap-0.5">
              {config.showCart && (
                <Link href="/cart" aria-label="سبد خرید" className="focus-ring relative grid size-11 place-items-center rounded-[0.5rem] text-store-text transition-colors hover:bg-store-surface-warm">
                  <ShoppingCart className="size-[1.3rem]" aria-hidden />
                  {count > 0 && (
                    <span className="absolute end-1.5 top-1 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full border-2 border-store-surface bg-store-clay px-1 text-[0.62rem] font-bold text-white">
                      {toPersianNumbers(count)}
                    </span>
                  )}
                </Link>
              )}
              {config.showAccount && (
                <Link href={user ? "/account" : "/auth"} aria-label={user ? "حساب کاربری" : "ورود"} className="focus-ring grid size-11 place-items-center rounded-[0.5rem] text-store-text transition-colors hover:bg-store-surface-warm">
                  <User className="size-[1.3rem]" aria-hidden />
                </Link>
              )}
            </div>
          </div>
          {config.showSearch && (
            <form action="/products" className="px-4 pb-[0.8rem]">
              <div className="flex items-center gap-[0.6rem] rounded-[0.75rem] border-2 border-store-border-strong bg-store-surface-warm px-4 py-[0.55rem] focus-within:border-store-primary">
                <Search className="size-[1.1rem] shrink-0 text-store-text-faint" aria-hidden />
                <input type="search" name="q" placeholder="جستجو در فروشگاه دشت‌زاد…" aria-label="جستجوی محصول" className="min-w-0 flex-1 border-0 bg-transparent text-[0.9rem] text-store-text outline-none placeholder:text-store-text-faint" />
              </div>
            </form>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      <div id="mobile-drawer">
        <MobileDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          shopNav={shopNav}
          blogNav={blogNav}
          megaNav={megaNav}
          megaTriggerLabel={megaLabel}
          contact={{ primaryPhone: contact.primaryPhone, supportPhone: contact.supportPhone }}
          showSearch={config.showSearch}
          showAccount={config.showAccount}
          chatEnabled={chatEnabled}
          isLoggedIn={Boolean(user)}
          context={ctx}
        />
      </div>
    </>
  );
}
