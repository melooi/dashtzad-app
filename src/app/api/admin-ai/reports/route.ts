import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { runReport } from "@/lib/ai/analyst/report-runner";

export const runtime = "nodejs";
export const maxDuration = 120;

/** GET /api/admin-ai/reports — list reports, newest first. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });

  const reports = await prisma.aiAdminReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { findings: true } } },
  });

  return NextResponse.json({ reports });
}

/** POST /api/admin-ai/reports — create + run a new report synchronously. */
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });

  // Create a placeholder report row.
  const report = await prisma.aiAdminReport.create({
    data: {
      title: `گزارش تحلیلی — ${new Date().toLocaleDateString("fa-IR")}`,
      status: "PENDING",
      modules: ["inventory", "orders", "customers", "content", "chat", "pricing"],
    },
  });

  // Run synchronously (AI call + DB writes). maxDuration covers the wait.
  const result = await runReport(report.id, user.id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error, reportId: report.id }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reportId: report.id }, { status: 201 });
}
