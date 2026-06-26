"use client";

import { useEffect, useState } from "react";

export type FormNavItem = {
  /** the id of the target AdminFormSection (without #). */
  id: string;
  label: string;
  /** optional tone for special sections (e.g. danger). */
  tone?: "default" | "danger";
};

/**
 * In-page navigator for long admin forms. Renders a sticky vertical list that
 * scrolls to each form section and highlights the one currently in view
 * (via IntersectionObserver). Hidden on small screens where the form is a
 * single scrolling column anyway. Purely client-side, no data.
 */
export function AdminFormNavigator({
  items,
  title = "بخش‌های فرم",
}: {
  items: FormNavItem[];
  title?: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sections = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className="sticky top-24 hidden lg:block" aria-label={title}>
      <p className="mb-2 px-3 text-xs font-bold text-dz-primary-500 dark:text-dz-night-muted">{title}</p>
      <ul className="flex flex-col gap-0.5 border-s border-dz-primary-100 dark:border-dz-night-border">
        {items.map((it) => {
          const active = activeId === it.id;
          const danger = it.tone === "danger";
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                onClick={(e) => handleClick(e, it.id)}
                aria-current={active ? "true" : undefined}
                className={`-ms-px block border-s-2 px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? danger
                      ? "border-dz-error text-dz-error dark:text-dz-error-300"
                      : "border-dz-primary-500 font-medium text-dz-primary-800 dark:border-dz-primary-400 dark:text-dz-night-fg"
                    : `border-transparent ${
                        danger
                          ? "text-dz-error/70 hover:text-dz-error dark:text-dz-error-300/70"
                          : "text-dz-primary-500 hover:text-dz-primary-800 dark:text-dz-night-muted dark:hover:text-dz-night-fg"
                      }`
                }`}
              >
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
