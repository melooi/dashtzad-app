import Script from "next/script";
import { THEME_INIT_SCRIPT } from "@/lib/admin/theme";

// In React 19 / Next.js 16, <script dangerouslySetInnerHTML> inside a component
// is not executed on the client. next/script beforeInteractive bypasses this
// restriction and still runs before first paint (prevents dark-mode flash).
export function AdminThemeScript() {
  return (
    <Script
      id="admin-theme-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
