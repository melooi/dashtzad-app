import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import type { User } from "@/generated/prisma/client";

/** Require an authenticated user (for Server Components). Redirects to /auth otherwise. */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  return user;
}

/** Require an ADMIN user. Redirects unauthenticated → /auth, non-admin → /. */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
