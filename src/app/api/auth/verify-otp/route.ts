import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeDigits, normalizePhoneNumber, isValidIranianMobile } from "@/lib/auth/phone";
import { verifyOtpCode } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";

const schema = z.object({
  phoneNumber: z.string().min(1),
  code: z.string().min(1),
});

const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

function clientIp(req: Request): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است." }, { status: 400 });
  }

  const phoneNumber = normalizePhoneNumber(parsed.data.phoneNumber);
  if (!isValidIranianMobile(phoneNumber)) {
    return NextResponse.json({ error: "شماره موبایل معتبر نیست." }, { status: 400 });
  }
  const code = normalizeDigits(parsed.data.code).trim();

  const otp = await prisma.otpCode.findFirst({
    where: { phoneNumber, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) {
    return NextResponse.json({ error: "کدی برای این شماره یافت نشد." }, { status: 400 });
  }
  if (otp.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "کد منقضی شده است." }, { status: 400 });
  }
  if (otp.attemptCount >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "تعداد تلاش‌های نادرست بیش از حد مجاز است." },
      { status: 429 },
    );
  }

  if (!verifyOtpCode(code, otp.codeHash)) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attemptCount: { increment: 1 } },
    });
    return NextResponse.json({ error: "کد وارد شده نادرست است." }, { status: 400 });
  }

  // Success — consume the code.
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });

  // Find or create the user.
  let user = await prisma.user.findUnique({ where: { phoneNumber } });
  if (!user) {
    user = await prisma.user.create({
      data: { phoneNumber, role: "USER", isActive: true },
    });
  }

  await createSession(user.id, {
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent") || null,
  });

  return NextResponse.json(
    {
      ok: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
      },
    },
    { status: 200 },
  );
}
