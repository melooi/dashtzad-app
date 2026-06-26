import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { profileInputSchema, serializeUser } from "@/lib/account/profile";
import { parseJalaliInput } from "@/lib/date";
import type { Prisma } from "@/generated/prisma/client";

// Update the signed-in user's editable profile fields. Phone is the login
// identity and is intentionally NOT editable here.
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "وارد شوید." }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = profileInputSchema.safeParse(json);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "ورودی نامعتبر است.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { name, email, nationalId, birthDate } = parsed.data;
  const data: Prisma.UserUpdateInput = {};

  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email === "" ? null : email;
  if (nationalId !== undefined) data.nationalId = nationalId === "" ? null : nationalId;
  if (birthDate !== undefined) {
    if (birthDate === "") {
      data.birthDate = null;
    } else {
      const d = parseJalaliInput(birthDate);
      if (!d) {
        return NextResponse.json(
          { error: "تاریخ تولد نامعتبر است. نمونه: ۱۳۷۳/۸/۲۷" },
          { status: 400 },
        );
      }
      data.birthDate = d;
    }
  }

  try {
    const updated = await prisma.user.update({ where: { id: user.id }, data });
    return NextResponse.json(serializeUser(updated));
  } catch (e) {
    // Unique constraint (e.g. email already used by another account).
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ error: "این ایمیل قبلاً ثبت شده است." }, { status: 409 });
    }
    return NextResponse.json({ error: "خطا در ذخیره اطلاعات." }, { status: 500 });
  }
}
