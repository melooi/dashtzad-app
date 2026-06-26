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
    ],
  },
};

export default nextConfig;
