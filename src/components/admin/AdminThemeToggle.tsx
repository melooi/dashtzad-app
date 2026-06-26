"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import {
  THEME_LABELS,
  THEME_STORAGE_KEY,
  applyTheme,
  isThemeMode,
  type ThemeMode,
} from "@/lib/admin/theme";

const OPTIONS: { mode: ThemeMode; Icon: typeof Sun }[] = [
  { mode: "light", Icon: Sun },
  { mode: "dark", Icon: Moon },
  { mode: "system", Icon: Monitor },
];

/**
 * Segmented light/dark/system control for the admin header. Persists the choice
 * in localStorage and applies it to <html> (admin-scoped). The inline
 * AdminThemeScript handles the first paint; this owns subsequent changes, keeps
 * "system" in sync with the OS, and removes the dark class when the admin shell
 * unmounts so the public storefront is never left dark.
 */
export function AdminThemeToggle() {
  // Start at "system" on both server and first client render to avoid hydration
  // mismatch; the real stored value is read in the effect below.
  const [mode, setMode] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    setMode(isThemeMode(stored) ? stored : "system");
    setMounted(true);
  }, []);

  // Keep "system" mode in sync with OS-level changes while mounted.
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  // Leaving the admin shell (soft nav to public) → drop the dark class.
  useEffect(() => {
    return () => document.documentElement.classList.remove("dark");
  }, []);

  const choose = (next: ThemeMode) => {
    setMode(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage may be unavailable (private mode) — apply in-memory only */
    }
    applyTheme(next);
  };

  return (
    <div
      role="group"
      aria-label="حالت نمایش"
      className="flex items-center gap-0.5 rounded-xl border border-dz-primary-200 bg-dz-primary-50/50 p-0.5 dark:border-dz-night-border dark:bg-dz-night-elevated"
    >
      {OPTIONS.map(({ mode: m, Icon }) => {
        // Before mount we don't know the stored value — render nothing as active
        // to keep server/client markup identical (no hydration mismatch).
        const active = mounted && mode === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => choose(m)}
            aria-label={THEME_LABELS[m]}
            aria-pressed={active}
            title={THEME_LABELS[m]}
            className={`focus-ring flex size-8 items-center justify-center rounded-lg transition-colors ${
              active
                ? "bg-white text-dz-primary-700 shadow-xs dark:bg-dz-primary-600 dark:text-white"
                : "text-dz-primary-400 hover:text-dz-primary-700 dark:text-dz-night-faint dark:hover:text-dz-night-fg"
            }`}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
