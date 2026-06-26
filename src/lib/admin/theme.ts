// Admin theme (dark mode) — shared constants + the flash-prevention script.
// Dark mode is admin-scoped: the `.dark` class lives on <html> and is only ever
// toggled from inside /admin, so the public storefront is never affected.

export type ThemeMode = "light" | "dark" | "system";

export const THEME_MODES: ThemeMode[] = ["light", "dark", "system"];

export const THEME_STORAGE_KEY = "dz-admin-theme";

export const THEME_LABELS: Record<ThemeMode, string> = {
  light: "روشن",
  dark: "تاریک",
  system: "سیستم",
};

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

/** Resolve a mode to an effective light/dark, consulting the OS for "system". */
export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolveTheme(mode) === "dark");
}

/**
 * Inline, synchronous script injected at the top of the admin subtree. It runs
 * before admin content paints so the correct theme is applied with no flash.
 * Kept dependency-free and defensive (try/catch) on purpose.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var m=localStorage.getItem(k);if(m!=="light"&&m!=="dark")m="system";var d=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
