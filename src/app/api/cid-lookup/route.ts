import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Normalise any phone format to 10-digit Iranian mobile
function normPhone(s: string): string {
  return s.replace(/\s/g, "").replace(/^0098/, "").replace(/^\+98/, "").replace(/^98/, "").replace(/^0/, "").slice(-10);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const raw = req.nextUrl.searchParams.get("number") ?? "";
  if (!raw) return new NextResponse("unknown", { status: 200 });

  const norm = normPhone(raw);

  try {
    // Search users by phoneNumber (last 10 digits)
    const users = await prisma.user.findMany({
      where: { phoneNumber: { endsWith: norm.slice(-8) } },
      select: { name: true, phoneNumber: true },
      take: 5,
    });

    const match = users.find(u => normPhone(u.phoneNumber) === norm);
    if (match?.name) return new NextResponse(match.name, { status: 200 });
  } catch {
    // DB unavailable — return unknown
  }

  return new NextResponse("unknown", { status: 200 });
}
