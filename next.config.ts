import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Seed/placeholder art is SVG. These are our own trusted files; allow the
    // optimizer to serve them, sandboxed via CSP.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Barjil CDN — dev-only until product images are replaced with Dashtzad assets
      { protocol: "https", hostname: "www.barjil.com" },
      { protocol: "https", hostname: "barjil.com" },
    ],
  },
};

export default nextConfig;
