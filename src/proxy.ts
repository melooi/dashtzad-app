// Next.js 16: the `middleware` convention is deprecated and renamed to `proxy`.
// Proxy runs at the edge before routing — it must NOT touch the DB directly, so
// it resolves the current user via an internal call to /api/auth/me.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "dz_session";

const PROTECTED = ["/checkout", "/account", "/orders", "/admin"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  // Always pass pathname so not-found.tsx can look up redirects + log 404s
  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);

  if (!isProtected) return res;

  const isAdminPath = pathname.startsWith("/admin");

  let user: { id: string; role: string } | null = null;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    const meUrl = new URL("/api/auth/me", req.url);
    const meRes = await fetch(meUrl, {
      headers: { cookie: req.headers.get("cookie") ?? "" },
    });
    if (meRes.ok) {
      const data = (await meRes.json()) as { user: { id: string; role: string } | null };
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

  return res;
}

// Run on all non-static paths so we can set x-pathname for 404 handling.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\..*).*)",
  ],
};
