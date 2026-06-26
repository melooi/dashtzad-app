// Address CRUD — ownership-enforced. Default-address uniqueness is maintained
// transactionally (only one default per user).
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { toEnglishDigits } from "@/lib/price";
import type { AddressDTO } from "./types";

const faDigits = (v: unknown) => (typeof v === "string" ? toEnglishDigits(v).trim() : v);
const trimmed = (v: unknown) => (typeof v === "string" ? v.trim() : v);

export const addressInputSchema = z.object({
  title: z.preprocess(trimmed, z.string().max(40)).optional(),
  receiverName: z.preprocess(trimmed, z.string().min(2, "نام گیرنده را وارد کنید.").max(120)),
  phone: z.preprocess(
    faDigits,
    z.string().regex(/^09\d{9}$/, "شماره موبایل گیرنده معتبر نیست."),
  ),
  province: z.preprocess(trimmed, z.string().min(1, "استان را وارد کنید.").max(60)),
  city: z.preprocess(trimmed, z.string().min(1, "شهر را وارد کنید.").max(60)),
  postalCode: z.preprocess(faDigits, z.string().regex(/^\d{10}$/, "کد پستی باید ۱۰ رقم باشد.")),
  line: z.preprocess(trimmed, z.string().min(5, "نشانی را کامل وارد کنید.").max(400)),
  plaque: z.preprocess(faDigits, z.string().max(10)).optional(),
  unit: z.preprocess(faDigits, z.string().max(10)).optional(),
  deliveryNote: z.preprocess(trimmed, z.string().max(300)).optional(),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressInputSchema>;

function toDTO(a: {
  id: string;
  title: string | null;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  line: string;
  plaque: string | null;
  unit: string | null;
  deliveryNote: string | null;
  isDefault: boolean;
}): AddressDTO {
  return {
    id: a.id,
    title: a.title,
    receiverName: a.receiverName,
    phone: a.phone,
    province: a.province,
    city: a.city,
    postalCode: a.postalCode,
    line: a.line,
    plaque: a.plaque,
    unit: a.unit,
    deliveryNote: a.deliveryNote,
    isDefault: a.isDefault,
  };
}

export async function listAddresses(userId: string): Promise<AddressDTO[]> {
  const rows = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toDTO);
}

export async function createAddress(userId: string, input: AddressInput): Promise<AddressDTO> {
  const count = await prisma.address.count({ where: { userId } });
  const makeDefault = input.isDefault || count === 0; // first address is always default
  const created = await prisma.$transaction(async (tx) => {
    if (makeDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.create({
      data: {
        userId,
        title: input.title || null,
        receiverName: input.receiverName,
        phone: input.phone,
        province: input.province,
        city: input.city,
        postalCode: input.postalCode,
        line: input.line,
        plaque: input.plaque || null,
        unit: input.unit || null,
        deliveryNote: input.deliveryNote || null,
        isDefault: makeDefault,
      },
    });
  });
  return toDTO(created);
}

/** Returns null when the address isn't found or isn't owned by the user. */
export async function updateAddress(
  userId: string,
  id: string,
  input: AddressInput,
): Promise<AddressDTO | null> {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) return null;
  const makeDefault = input.isDefault ?? existing.isDefault;
  const updated = await prisma.$transaction(async (tx) => {
    if (makeDefault && !existing.isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return tx.address.update({
      where: { id },
      data: {
        title: input.title || null,
        receiverName: input.receiverName,
        phone: input.phone,
        province: input.province,
        city: input.city,
        postalCode: input.postalCode,
        line: input.line,
        plaque: input.plaque || null,
        unit: input.unit || null,
        deliveryNote: input.deliveryNote || null,
        // never remove the last default implicitly; keep at least the existing one
        isDefault: makeDefault,
      },
    });
  });
  return toDTO(updated);
}

export async function deleteAddress(userId: string, id: string): Promise<boolean> {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id } });
    // If we removed the default, promote the most recent remaining address.
    if (existing.isDefault) {
      const next = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  });
  return true;
}

export async function setDefaultAddress(userId: string, id: string): Promise<boolean> {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
  return true;
}

export async function getDefaultAddress(userId: string): Promise<AddressDTO | null> {
  const a = await prisma.address.findFirst({
    where: { userId, isDefault: true },
  });
  return a ? toDTO(a) : null;
}
