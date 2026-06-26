// Next.js 16: the `middleware` convention is deprecated and renamed to `proxy`.
// Proxy runs at the edge before routing — it must NOT touch the DB directly, so
// it resolves the current user via an internal call to /api/auth/me.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "dz_session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");

  let user: { id: string; role: string } | null = null;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    const meUrl = new URL("/api/auth/me", req.url);
    const res = await fetch(meUrl, {
      headers: { cookie: req.headers.get("cookie") ?? "" },
    });
    if (res.ok) {
      const data = (await res.json()) as { user: { id: string; role: string } | null };
      user = data.user;
    }
  }

  // Not authenticated → send to login, preserving the intended path.
  if (!user) {
    const url = new URL("/auth", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated but not admin → forbidden for admin paths.
  if (isAdminPath && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Only protected paths are matched; everything else (public pages, assets,
// /api/auth/*, sitemap, robots) passes through untouched.
export const config = {
  matcher: [
    "/checkout",
    "/checkout/:path*",
    "/account/:path*",
    "/orders/:path*",
    "/admin/:path*",
  ],
};
