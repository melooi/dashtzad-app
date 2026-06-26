import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listRecent, recordProductViewBySlug } from "@/lib/account/recent";
import { unauthorized } from "@/lib/account/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return NextResponse.json({ items: await listRecent(user.id) });
}

// PDP client beacon — records a product view for logged-in users (guests: 401,
// silently ignored by the caller). Never throws to the page.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => null);
  const slug = body?.slug;
  if (typeof slug === "string" && slug) await recordProductViewBySlug(user.id, slug);
  return NextResponse.json({ ok: true });
}
