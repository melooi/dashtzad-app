import { prisma } from "@/lib/prisma";
import { getContactInfo, getFaqPage } from "@/lib/admin/global-service";
import { FaqPageClient } from "@/views/faq/FaqPageClient";
import { StructuredData } from "@/components/StructuredData";
import { faqPageSchema } from "@/lib/jsonld";
import { htmlToPlainText } from "@/lib/richtext/sanitize";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "پرسش‌های متداول",
  description: "پاسخ پرسش‌های پرتکرار درباره‌ی خرید، ارسال و محصولات دشت‌زاد.",
  url: "/faq",
});

export default async function FaqPage() {
  const [groups, contactInfo, page] = await Promise.all([
    prisma.fAQGroup.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    }),
    getContactInfo(),
    getFaqPage(),
  ]);

  const nonEmpty = groups.filter((g) => g.items.length > 0);

  const allItems = nonEmpty.flatMap((g) =>
    g.items.map((i) => ({ question: i.question, answer: htmlToPlainText(i.answer) })),
  );
  const schema = allItems.length > 0 ? faqPageSchema(allItems) : null;

  return (
    <>
      {schema && <StructuredData data={schema} />}
      <FaqPageClient
        groups={nonEmpty.map((g) => ({
          id: g.id,
          title: g.title,
          description: g.description,
          items: g.items.map((i) => ({ id: i.id, question: i.question, answer: i.answer })),
        }))}
        contact={{ phone: contactInfo.primaryPhone ?? "", email: contactInfo.email ?? "" }}
        page={page}
      />
    </>
  );
}
