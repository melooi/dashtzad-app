import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/guards";
import { CheckoutForm } from "@/views/checkout/CheckoutForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تسویه حساب | دشت‌زاد",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const user = await requireAuth();
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-store-text">
      <h1 className="mb-6 font-heading text-3xl font-bold text-store-text">تسویه حساب</h1>
      <CheckoutForm
        addresses={addresses.map((a) => ({
          id: a.id,
          receiverName: a.receiverName,
          phone: a.phone,
          province: a.province,
          city: a.city,
          postalCode: a.postalCode,
          line: a.line,
        }))}
      />
    </main>
  );
}
