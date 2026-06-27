import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { CheckoutWizard } from "@/views/checkout/CheckoutWizard";
import type { AddressDTO } from "@/lib/account/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تسویه حساب | دشت‌زاد",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  let addresses: AddressDTO[] = [];
  if (user) {
    const rows = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    addresses = rows.map((a) => ({
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
    }));
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <CheckoutWizard
        addresses={addresses}
        user={user ? { name: user.name } : null}
      />
    </main>
  );
}
