import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import {
  addWishlistBySlug,
  addWishlistSlugs,
  listWishlist,
  listWishlistSlugs,
  removeWishlistBySlug,
} from "@/lib/account/wishlist";
import { badRequest, notFoundJson, unauthorized } from "@/lib/account/api";

const slugSchema = z.object({ slug: z.string().min(1) });
// Bulk variant: migrate guest/offline localStorage favorites to the server.
const slugsSchema = z.object({ slugs: z.array(z.string().min(1)).min(1) });

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  // ?slugs=1 → lightweight list of slugs (FavButton localStorage sync)
  if (new URL(req.url).searchParams.get("slugs")) {
    return NextResponse.json({ slugs: await listWishlistSlugs(user.id) });
  }
  return NextResponse.json({ items: await listWishlist(user.id) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const body = await req.json().catch(() => null);

  // Bulk migration path ({ slugs: [...] }) — idempotent, ignores unknown slugs.
  const bulk = slugsSchema.safeParse(body);
  if (bulk.success) {
    const added = await addWishlistSlugs(user.id, bulk.data.slugs);
    return NextResponse.json({ ok: true, added });
  }

  const parsed = slugSchema.safeParse(body);
  if (!parsed.success) return badRequest("محصول نامعتبر است.");
  const productId = await addWishlistBySlug(user.id, parsed.data.slug);
  if (!productId) return notFoundJson("محصول یافت نشد.");
  return NextResponse.json({ ok: true, productId });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const parsed = slugSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("محصول نامعتبر است.");
  await removeWishlistBySlug(user.id, parsed.data.slug);
  return NextResponse.json({ ok: true });
}
