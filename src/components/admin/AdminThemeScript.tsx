import { THEME_INIT_SCRIPT } from "@/lib/admin/theme";
import { ACCENT_INIT_SCRIPT } from "@/lib/admin/accent";

/**
 * Renders two synchronous init scripts at the top of the admin layout to
 * prevent flash: one applies dark/light theme class, one sets the accent
 * palette attribute on <html> before any admin chrome paints.
 */
export function AdminThemeScript() {
  return (
    <>
      <script id="admin-theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      <script id="admin-accent-init" dangerouslySetInnerHTML={{ __html: ACCENT_INIT_SCRIPT }} />
    </>
  );
}
