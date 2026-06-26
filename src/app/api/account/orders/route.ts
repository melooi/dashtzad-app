import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listOrders } from "@/lib/account/orders";
import { unauthorized } from "@/lib/account/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return NextResponse.json({ orders: await listOrders(user.id) });
}
