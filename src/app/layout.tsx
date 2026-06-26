import type { Metadata } from "next";
import "./globals.css";
import { BASE_URL, SITE_NAME } from "@/lib/seo";
import { StructuredData } from "@/components/StructuredData";
import { Providers } from "@/app/providers";
import { organizationSchemaFromGlobals, websiteSchema } from "@/lib/jsonld";
import { THEME_INIT_SCRIPT } from "@/lib/admin/theme";
import { ACCENT_INIT_SCRIPT } from "@/lib/admin/accent";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${SITE_NAME} — مواد غذایی پرمیوم ایرانی`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "مواد غذایی پرمیومِ ایرانی — زعفران، آجیل، حبوبات و ادویه. از سال ۱۳۱۳.",
  applicationName: SITE_NAME,
  // Admin fills the real token later.
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organization = await organizationSchemaFromGlobals();
  // suppressHydrationWarning: the admin theme-init script (AdminThemeScript)
  // toggles the `dark` class on <html> before hydration to prevent a flash, so
  // the className legitimately differs between server and first client paint.
  // Scope is one level — only this element's own attributes are exempt.
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Critical dark-mode background — inlined so it applies before the
            external stylesheet loads, preventing the white flash on refresh. */}
        <style dangerouslySetInnerHTML={{ __html: "html.dark{background-color:#0f1117;color-scheme:dark}" }} />
        <link rel="stylesheet" href="/fonts/remixicon/remixicon.css" />
        <script id="admin-theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script id="admin-accent-init" dangerouslySetInnerHTML={{ __html: ACCENT_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <StructuredData data={[organization, websiteSchema()]} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
