import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { generateOrderNumber, calculateTotals } from "@/lib/order";

const addressSchema = z.object({
  receiverName: z.string().min(2).max(120),
  phone: z.string().min(5).max(20),
  province: z.string().min(1).max(60),
  city: z.string().min(1).max(60),
  postalCode: z.string().min(5).max(20),
  line: z.string().min(3).max(400),
});

const bodySchema = z
  .object({
    items: z
      .array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(99) }))
      .min(1),
    addressId: z.string().uuid().optional(),
    address: addressSchema.optional(),
    shippingRial: z.number().int().nonnegative().optional(),
    note: z.string().max(600).optional(),
  })
  .refine((d) => d.addressId || d.address, {
    message: "آدرس لازم است.",
  });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "برای ثبت سفارش وارد شوید." }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است." }, { status: 400 });
  }
  const { items, addressId, address, shippingRial = 0, note } = parsed.data;

  // Re-fetch products from DB — never trust client-supplied prices.
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, isActive: true, deletedAt: null },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  if (items.some((i) => !byId.has(i.productId))) {
    return NextResponse.json({ error: "برخی محصولات در دسترس نیستند." }, { status: 400 });
  }

  const lines = items.map((i) => {
    const p = byId.get(i.productId)!;
    const unitPriceRial = p.offPrice_rial ?? p.price_rial;
    return {
      productId: p.id,
      title: p.title,
      unitPriceRial,
      basePriceRial: p.price_rial,
      quantity: i.quantity,
      lineTotalRial: unitPriceRial * i.quantity,
    };
  });
  const totals = calculateTotals(lines);

  try {
    const order = await prisma.$transaction(async (tx) => {
      // a) resolve address
      let resolvedAddressId = addressId;
      if (resolvedAddressId) {
        const existing = await tx.address.findFirst({
          where: { id: resolvedAddressId, userId: user.id },
        });
        if (!existing) throw new Error("ADDRESS_NOT_FOUND");
      } else {
        const created = await tx.address.create({
          data: { userId: user.id, ...address! },
        });
        resolvedAddressId = created.id;
      }

      // b) order
      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: user.id,
          addressId: resolvedAddressId,
          status: "PENDING",
          subtotal_rial: totals.subtotalRial,
          discount_rial: totals.discountRial,
          shipping_rial: shippingRial,
          total_rial: totals.totalRial + shippingRial,
          note: note ?? null,
          // c) items
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              title: l.title,
              unitPrice_rial: l.unitPriceRial,
              quantity: l.quantity,
              lineTotal_rial: l.lineTotalRial,
            })),
          },
          // d) first status history record
          statusHistory: {
            create: [{ status: "PENDING", note: "سفارش ثبت شد." }],
          },
        },
      });
      return created;
    });

    return NextResponse.json({ ok: true, orderId: order.id, orderNumber: order.orderNumber }, { status: 200 });
  } catch (err) {
    if ((err as Error).message === "ADDRESS_NOT_FOUND") {
      return NextResponse.json({ error: "آدرس یافت نشد." }, { status: 400 });
    }
    return NextResponse.json({ error: "خطا در ثبت سفارش." }, { status: 500 });
  }
}
