import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  if (!q) return NextResponse.json([]);

  // Pull all tags from posts, then filter & dedupe in JS (tags are String[])
  const rows = await prisma.post.findMany({
    where: { tags: { isEmpty: false }, deletedAt: null },
    select: { tags: true },
    take: 500,
  });

  const all = Array.from(new Set(rows.flatMap((r) => r.tags)));
  const matched = all
    .filter((t) => t.toLowerCase().includes(q))
    .sort((a, b) => a.localeCompare(b, "fa"))
    .slice(0, 20);

  return NextResponse.json(matched);
}
