/**
 * Shared helpers for the customer chat API routes: client IP, AI session cookie
 * handling, and actor resolution. The AI session cookie is httpOnly and opaque
 * (a random token); no secret ever reaches the browser.
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { AI_SESSION_COOKIE, resolveAiSession } from "@/lib/ai/chat-session";
import type { ToolActor } from "@/lib/ai/tool-registry";

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

export function getClientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export function readSessionCookie(req: Request): string | undefined {
  const cookie = req.headers.get("cookie");
  if (!cookie) return undefined;
  for (const part of cookie.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === AI_SESSION_COOKIE) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

export function aiSessionCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  return `${AI_SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`;
}

export interface ResolvedCaller {
  session: Awaited<ReturnType<typeof resolveAiSession>>["session"];
  isNewSession: boolean;
  actor: ToolActor;
  customerId: string | null;
}

/** Resolve (or create) the caller's AI session + actor from cookie + auth. */
export async function resolveCaller(req: Request): Promise<ResolvedCaller> {
  const user = await getCurrentUser();
  const token = readSessionCookie(req);
  const { session, isNew } = await resolveAiSession(token, {
    channel: "STOREFRONT",
    customerId: user?.id ?? null,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });
  const actor: ToolActor = user
    ? { kind: "customer", customerId: user.id }
    : { kind: "guest", customerId: null };
  return { session, isNewSession: isNew, actor, customerId: user?.id ?? null };
}

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
