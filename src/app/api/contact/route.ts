import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2, "نام خیلی کوتاه است").max(100),
  phone: z.string().min(10, "شماره موبایل معتبر نیست").max(15),
  subject: z.string().min(2, "موضوع خیلی کوتاه است").max(200),
  type: z.string().min(1, "نوع درخواست را انتخاب کنید"),
  message: z.string().min(10, "متن پیام خیلی کوتاه است").max(3000),
  // honeypot — bots fill this; humans never see it.
  dz_hp: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "اطلاعات وارد شده معتبر نیست.";
      return NextResponse.json({ error: firstError }, { status: 422 });
    }

    // Honeypot tripped → pretend success, store nothing.
    if (parsed.data.dz_hp && parsed.data.dz_hp.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    const { name, phone, subject, type, message } = parsed.data;
    await prisma.contactMessage.create({
      data: { name, phone, subject, type, message },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطای سرور. دوباره تلاش کنید." }, { status: 500 });
  }
}
