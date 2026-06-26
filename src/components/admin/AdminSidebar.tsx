"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ADMIN_NAV, type NavGroup, type NavItem } from "@/lib/admin/nav";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  item,
  active,
  onNavigate,
  compact = false,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
  /** tighter spacing for two-column cells */
  compact?: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={item.label}
      className={`focus-ring group flex min-w-0 items-center rounded-lg text-sm transition-colors ${
        compact ? "gap-1.5 px-2 py-1.5" : "gap-2.5 px-3 py-2"
      } ${
        active
          ? "bg-dz-primary-600 font-medium text-white shadow-xs dark:bg-dz-primary-600 dark:text-white"
          : "text-dz-primary-700 hover:bg-dz-primary-50 hover:text-dz-primary-900 dark:text-dz-night-muted dark:hover:bg-white/5 dark:hover:text-dz-night-fg"
      }`}
    >
      <Icon
        className={`size-4 shrink-0 transition-colors ${
          active
            ? "text-white"
            : "text-dz-primary-400 group-hover:text-dz-primary-600 dark:text-dz-night-faint dark:group-hover:text-dz-primary-300"
        }`}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function AdminSidebar({
  open = false,
  onNavigate,
  onClose,
}: {
  /** drawer open state (mobile/tablet only) */
  open?: boolean;
  /** called when a nav link is clicked — closes the mobile drawer */
  onNavigate?: () => void;
  /** called by the in-drawer close button (mobile/tablet only) */
  onClose?: () => void;
} = {}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (title: string) =>
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));

  const renderGroup = (group: NavGroup) => {
    // Single-item group whose item matches the title → flat standalone link.
    if (group.items.length === 1 && group.items[0].label === group.title) {
      const item = group.items[0];
      return (
        <div key={group.title} className="mb-3">
          <NavLink item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
        </div>
      );
    }

    const groupActive = group.items.some((i) => isActive(pathname, i.href));
    // Default expanded; the group containing the active route stays open.
    const open = groupActive ? true : !collapsed[group.title];
    const GroupIcon = group.icon;

    return (
      <div key={group.title} className="mb-5">
        <button
          type="button"
          onClick={() => toggle(group.title)}
          aria-expanded={open}
          className={`focus-ring flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-bold tracking-wide transition-colors ${
            groupActive
              ? "text-dz-primary-700 dark:text-dz-primary-200"
              : "text-dz-primary-400 hover:text-dz-primary-600 dark:text-dz-night-faint dark:hover:text-dz-primary-300"
          }`}
        >
          {GroupIcon && <GroupIcon className={`size-3.5 shrink-0 ${groupActive ? "opacity-100" : "opacity-80"}`} />}
          <span className="flex-1 text-start tracking-wide">{group.title}</span>
          <ChevronDown
            className={`size-3.5 shrink-0 opacity-60 transition-transform ${open ? "" : "-rotate-90"}`}
          />
        </button>

        {open &&
          (group.sections && group.sections.length > 0 ? (
            <div className="mt-1.5 flex flex-col gap-3 ps-1.5">
              {/* items with no/unknown section render first, ungrouped */}
              {(() => {
                const known = new Set(group.sections!.map((s) => s.key));
                const loose = group.items.filter((i) => !i.section || !known.has(i.section));
                return loose.length > 0 ? (
                  <ul className="flex flex-col gap-0.5">
                    {loose.map((item) => (
                      <li key={item.href}>
                        <NavLink item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
                      </li>
                    ))}
                  </ul>
                ) : null;
              })()}

              {group.sections!.map((section) => {
                const items = group.items.filter((i) => i.section === section.key);
                if (items.length === 0) return null;
                return (
                  <div key={section.key}>
                    <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-dz-primary-300 dark:text-dz-night-faint">
                      {section.title}
                    </p>
                    <ul
                      className={
                        section.columns === 2
                          ? "grid grid-cols-2 gap-0.5"
                          : "flex flex-col gap-0.5"
                      }
                    >
                      {items.map((item) => (
                        <li key={item.href}>
                          <NavLink
                            item={item}
                            active={isActive(pathname, item.href)}
                            onNavigate={onNavigate}
                            compact={section.columns === 2}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ) : (
            <ul className="mt-1.5 flex flex-col gap-0.5 ps-1.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          ))}
      </div>
    );
  };

  return (
    <aside
      aria-label="ناوبری مدیریت"
      className={`fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] shrink-0 flex-col border-s border-dz-primary-100 bg-white transition-transform duration-200 ease-out dark:border-dz-night-border dark:bg-dz-night-card lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none lg:transition-none ${
        open ? "translate-x-0 shadow-2xl" : "translate-x-full"
      }`}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-dz-primary-100 px-5 dark:border-dz-night-border">
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          aria-label="پنل دشت‌زاد"
          className="focus-ring rounded-lg"
        >
          <Logo variant="full" className="h-8 w-auto" />
        </Link>
        <span className="flex flex-col leading-tight">
          <span className="text-xs font-bold text-dz-primary-700 dark:text-dz-night-fg">پنل مدیریت</span>
          <span className="font-heading text-[10px] text-dz-primary-400 dark:text-dz-primary-300">از سال ۱۳۱۳</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن منو"
          className="focus-ring ms-auto rounded-lg p-1.5 text-dz-primary-500 transition-colors hover:bg-dz-primary-50 hover:text-dz-primary-700 dark:text-dz-night-muted dark:hover:bg-white/5 dark:hover:text-dz-night-fg lg:hidden"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-dz-primary-100 hover:[&::-webkit-scrollbar-thumb]:bg-dz-primary-200 dark:[&::-webkit-scrollbar-thumb]:bg-dz-night-border dark:hover:[&::-webkit-scrollbar-thumb]:bg-dz-night-line">{ADMIN_NAV.map(renderGroup)}</nav>

      <div className="border-t border-dz-primary-50 px-5 py-3 dark:border-dz-night-line">
        <p className="font-heading text-[11px] text-dz-primary-300 dark:text-dz-night-faint">دشت‌زاد · مواد غذایی ایرانی</p>
      </div>
    </aside>
  );
}
