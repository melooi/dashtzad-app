import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const VALID_STATUSES = ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "DISMISSED"] as const;

/** PATCH /api/admin-ai/reports/[id]/findings/[fid] — update finding status. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; fid: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });

  const { id, fid } = await params;

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بدنه نامعتبر." }, { status: 400 });
  }

  if (!body.status || !VALID_STATUSES.includes(body.status as (typeof VALID_STATUSES)[number])) {
    return NextResponse.json({ error: "وضعیت نامعتبر." }, { status: 400 });
  }

  const finding = await prisma.aiAdminFinding.findFirst({
    where: { id: fid, reportId: id },
  });
  if (!finding) return NextResponse.json({ error: "یافته یافت نشد." }, { status: 404 });

  const updated = await prisma.aiAdminFinding.update({
    where: { id: fid },
    data: { status: body.status as (typeof VALID_STATUSES)[number] },
  });

  return NextResponse.json({ ok: true, finding: updated });
}
