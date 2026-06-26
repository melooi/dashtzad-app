import { getContactInfo, getBusinessInfo, getSocialLinks, getContactPage } from "@/lib/admin/global-service";
import { ContactPageClient } from "@/views/contact/ContactPageClient";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "تماس با ما",
  description: "راه‌های ارتباط با دشت‌زاد — تلفن، ایمیل، آدرس و فرم تماس.",
  url: "/contact",
});

const FALLBACK = {
  phone: "۰۲۱-۹۲۰۰۲۶۶۱",
  email: "info@dashtzad.com",
  address: "تهران، پیروزی، خیابان نبرد شمالی، کوچه خزایی، پلاک ۱، واحد ۶",
  hours: "شنبه تا پنج‌شنبه، ۹ تا ۲۱",
};

export default async function ContactPage() {
  const [contact, business, socialData, page] = await Promise.all([
    getContactInfo(),
    getBusinessInfo(),
    getSocialLinks(),
    getContactPage(),
  ]);

  const phone = contact.primaryPhone?.trim() || contact.supportPhone?.trim() || FALLBACK.phone;
  const email = contact.email?.trim() || contact.supportEmail?.trim() || FALLBACK.email;
  const address = contact.addressText?.trim() || business.address?.trim() || FALLBACK.address;
  const hours = contact.workingHours?.trim() || FALLBACK.hours;

  const socials = socialData.links
    .filter((l) => l.isActive && l.url)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((l) => ({ platform: l.platform, label: l.label || l.platform, url: l.url }));

  return (
    <ContactPageClient
      phone={phone}
      email={email}
      address={address}
      hours={hours}
      mapUrl={business.mapUrl?.trim() || ""}
      socials={socials}
      page={page}
    />
  );
}
