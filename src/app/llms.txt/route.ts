import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // re-generate at most once per hour

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dashtzad.ir";

  const [products, posts] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      select: { title: true, slug: true, description: true, brand: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { title: true, slug: true, briefText: true },
      orderBy: { publishedAt: "desc" },
      take: 100,
    }),
  ]);

  const lines: string[] = [
    `# دشت‌زاد — فروشگاه محصولات کشاورزی و طبیعی ایران`,
    `> ${baseUrl}`,
    ``,
    `دشت‌زاد (تأسیس ۱۳۱۳) فروشگاه آنلاین محصولات طبیعی، کشاورزی، و غذایی ایرانی است.`,
    ``,
    `## صفحات اصلی`,
    ``,
    `- [خانه](${baseUrl}/)`,
    `- [محصولات](${baseUrl}/products)`,
    `- [وبلاگ و دستورپخت](${baseUrl}/blog)`,
    `- [درباره دشت‌زاد](${baseUrl}/about)`,
    ``,
    `## محصولات (${products.length} مورد)`,
    ``,
    ...products.map(
      (p) =>
        `- [${p.title}](${baseUrl}/products/${p.slug})${p.brand ? ` — ${p.brand}` : ""}${p.description ? ` — ${p.description.slice(0, 120)}` : ""}`
    ),
    ``,
    `## مقالات و دستورپخت (${posts.length} مورد)`,
    ``,
    ...posts.map(
      (p) =>
        `- [${p.title}](${baseUrl}/blog/${p.slug})${p.briefText ? ` — ${p.briefText.slice(0, 100)}` : ""}`
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
