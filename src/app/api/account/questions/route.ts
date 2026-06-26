import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createQuestion, listMyQuestions, questionInputSchema } from "@/lib/account/reviews";
import { badRequest, notFoundJson, unauthorized } from "@/lib/account/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return NextResponse.json({ questions: await listMyQuestions(user.id) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const parsed = questionInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "ورودی نامعتبر است.");
  const question = await createQuestion(user.id, parsed.data);
  if (!question) return notFoundJson("محصول یافت نشد.");
  return NextResponse.json(question);
}
