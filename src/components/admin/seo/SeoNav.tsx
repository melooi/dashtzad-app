"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  SlidersHorizontal,
  Braces,
  Map,
  Bot,
  ShoppingBag,
  ListChecks,
  ArrowLeftRight,
} from "lucide-react";

const TABS = [
  { href: "/admin/seo/overview", label: "بررسی سئو", icon: Activity },
  { href: "/admin/seo/settings", label: "پیش‌فرض‌ها", icon: SlidersHorizontal },
  { href: "/admin/seo/structured-data", label: "داده‌های ساختاریافته", icon: Braces },
  { href: "/admin/seo/sitemap", label: "سایت‌مپ", icon: Map },
  { href: "/admin/seo/robots", label: "robots.txt", icon: Bot },
  { href: "/admin/seo/merchant", label: "فید محصولات", icon: ShoppingBag },
  { href: "/admin/seo/checklist", label: "چک‌لیست", icon: ListChecks },
  { href: "/admin/collections/redirects", label: "ریدایرکت‌ها", icon: ArrowLeftRight },
];

export function SeoNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex flex-wrap gap-1.5 rounded-2xl border border-dz-primary-100 dark:border-dz-night-border bg-white dark:bg-dz-night-card p-1.5 shadow-xs">
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`focus-ring inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-dz-primary-600 font-medium text-white shadow-xs"
                : "text-dz-primary-600 dark:text-dz-primary-300 hover:bg-dz-primary-50 dark:hover:bg-white/5 hover:text-dz-primary-800 dark:hover:text-dz-night-fg"
            }`}
          >
            <Icon className={`size-4 ${active ? "text-white" : "text-dz-primary-400 dark:text-dz-night-faint"}`} />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
