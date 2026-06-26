import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { id, phoneNumber, name, role } = session.user;
  return NextResponse.json({ user: { id, phoneNumber, name, role } }, { status: 200 });
}
