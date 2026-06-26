import { getContactInfo, getTermsContent } from "@/lib/admin/global-service";
import { TermsPageClient } from "@/views/terms/TermsPageClient";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "قوانین و مقررات",
  description: "شرایط استفاده، حریم خصوصی، ارسال و مرجوعی در فروشگاه دشت‌زاد.",
  url: "/terms",
});

export default async function TermsPage() {
  const [content, contactInfo] = await Promise.all([
    getTermsContent(),
    getContactInfo(),
  ]);

  return (
    <TermsPageClient
      content={content}
      contact={{ phone: contactInfo.primaryPhone ?? "", email: contactInfo.email ?? "" }}
    />
  );
}
