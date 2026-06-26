import { NextResponse } from "next/server";
import type { RouteContext } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Ctx = RouteContext<"/api/admin-ai/reports/[id]">;

/** GET /api/admin-ai/reports/[id] — full report with all findings. */
export async function GET(_req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });

  const { id } = await ctx.params;

  const report = await prisma.aiAdminReport.findUnique({
    where: { id },
    include: {
      findings: { orderBy: [{ severity: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!report) return NextResponse.json({ error: "گزارش یافت نشد." }, { status: 404 });

  return NextResponse.json({ report });
}
