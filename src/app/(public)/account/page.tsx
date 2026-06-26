import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/guards";
import { serializeUser } from "@/lib/account/profile";
import { AccountPanel } from "@/views/account/AccountPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پنل کاربری | دشت‌زاد",
  robots: { index: false },
};

export default async function AccountPage() {
  const user = await requireAuth();
  return <AccountPanel user={serializeUser(user)} />;
}
