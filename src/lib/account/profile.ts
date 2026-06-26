import { z } from "zod";
import type { User } from "@/generated/prisma/client";
import type { AccountProfile } from "@/lib/account/types";
import { toEnglishDigits } from "@/lib/price";

/** Map a Prisma User to the serializable profile sent to the client. */
export function serializeUser(user: User): AccountProfile {
  return {
    id: user.id,
    name: user.name,
    phoneNumber: user.phoneNumber,
    email: user.email,
    nationalId: user.nationalId,
    birthDateISO: user.birthDate ? user.birthDate.toISOString() : null,
    role: user.role,
    createdAtISO: user.createdAt.toISOString(),
  };
}

const trimString = (v: unknown) => (typeof v === "string" ? v.trim() : v);
const digitsString = (v: unknown) =>
  typeof v === "string" ? toEnglishDigits(v).trim() : v;

/**
 * Profile PATCH input. Field semantics:
 *   - omitted (undefined) → leave unchanged
 *   - "" (empty)          → clear the field (set null), where nullable
 * birthDate is a Jalali string ("۱۳۷۳/۸/۲۷") converted to a Gregorian Date in
 * the route; here we only validate that it's a string.
 */
export const profileInputSchema = z.object({
  name: z.preprocess(trimString, z.string().min(2, "نام باید حداقل ۲ نویسه باشد.").max(120))
    .optional(),
  email: z
    .preprocess(
      trimString,
      z.union([z.literal(""), z.string().email("ایمیل نامعتبر است.").max(200)]),
    )
    .optional(),
  nationalId: z
    .preprocess(
      digitsString,
      z.union([z.literal(""), z.string().regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد.")]),
    )
    .optional(),
  birthDate: z.preprocess(trimString, z.string().max(20)).optional(),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
