import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizePhoneNumber, isValidIranianMobile } from "@/lib/auth/phone";
import { generateOtp, hashOtpCode } from "@/lib/auth/otp";
import { sendOtpSms } from "@/lib/kavenegar";

const schema = z.object({ phoneNumber: z.string().min(1) });

const TTL = Number(process.env.OTP_TTL_SECONDS || 120);
const TESTING = process.env.OTP_TESTING_MODE === "true";
const RESEND_LIMIT = 5; // max requests per window
const RESEND_WINDOW_SECONDS = 10 * 60;

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
    return NextResponse.json(
      { error: "شماره موبایل معتبر نیست." },
      { status: 400 },
    );
  }

  // Rate limit by recent requests in the window.
  const since = new Date(Date.now() - RESEND_WINDOW_SECONDS * 1000);
  const recentCount = await prisma.otpCode.count({
    where: { phoneNumber, createdAt: { gte: since } },
  });
  if (recentCount >= RESEND_LIMIT) {
    return NextResponse.json(
      { error: "تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." },
      { status: 429 },
    );
  }

  const code = generateOtp();
  const codeHash = hashOtpCode(code);
  const expiresAt = new Date(Date.now() + TTL * 1000);

  await prisma.otpCode.create({
    data: {
      phoneNumber,
      codeHash,
      expiresAt,
      resendCount: recentCount,
      ip: clientIp(req),
      userAgent: req.headers.get("user-agent") || null,
    },
  });

  if (!TESTING) {
    // Fire SMS in production. Fail-soft: do not 500 if Kavenegar is unset.
    await sendOtpSms(phoneNumber, code);
  }

  const payload: Record<string, unknown> = {
    ok: true,
    message: "کد تأیید ارسال شد.",
    expiresInSeconds: TTL,
  };
  if (TESTING) payload.code = code; // testing mode only

  return NextResponse.json(payload, { status: 200 });
}
