import { THEME_INIT_SCRIPT } from "@/lib/admin/theme";

/**
 * Renders the synchronous theme-init script. Placed at the very top of the admin
 * layout so the warm dark/light theme is applied before admin chrome paints —
 * preventing a flash on full page loads. Admin-scoped only.
 */
export function AdminThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
