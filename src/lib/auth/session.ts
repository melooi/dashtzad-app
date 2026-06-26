import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { Session, User } from "@/generated/prisma/client";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "dz_session";
const TTL_DAYS = Number(process.env.SESSION_TTL_DAYS || 30);

/**
 * The raw session token (crypto.randomBytes(32).toString('hex')) lives ONLY in
 * the cookie. The database stores sha256(raw) in Session.token, so a DB leak
 * does not expose usable tokens.
 */
export function hashSessionToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

type SessionWithUser = Session & { user: User };

/** Read + validate the current session from the cookie. Returns null if none/expired. */
export async function getSession(): Promise<SessionWithUser | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const token = hashSessionToken(raw);
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Create a DB-backed session and set the session cookie.
 * Only valid inside Route Handlers / Server Actions (cookie writes).
 */
export async function createSession(
  userId: string,
  meta?: { ip?: string | null; userAgent?: string | null },
): Promise<void> {
  const raw = crypto.randomBytes(32).toString("hex");
  const token = hashSessionToken(raw);
  const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ip: meta?.ip ?? null,
      userAgent: meta?.userAgent ?? null,
    },
  });

  const store = await cookies();
  store.set(COOKIE_NAME, raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    maxAge: TTL_DAYS * 24 * 60 * 60,
  });
}

/** Delete the current session from the DB and clear the cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (raw) {
    const token = hashSessionToken(raw);
    await prisma.session.deleteMany({ where: { token } });
  }
  store.delete(COOKIE_NAME);
}
