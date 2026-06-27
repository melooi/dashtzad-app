import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, ShieldCheck, Truck, Home, RotateCcw } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SocialIcon } from "@/components/storefront/chrome/SocialIcon";
import { NewsletterForm } from "@/components/storefront/chrome/NewsletterForm";
import type { getFooterData } from "@/lib/site-data";

type FooterData = Awaited<ReturnType<typeof getFooterData>>;

// ردیف آیکون بالای فوتر — دقیقاً مثل دیجی‌کالا
const TRUST_ICONS = [
  { Icon: ShieldCheck, label: "ضمانت اصل بودن کالا" },
  { Icon: RotateCcw,   label: "هفت روز ضمانت بازگشت" },
  { Icon: Clock,       label: "پشتیبانی ۷ روز / ۲۴ ساعت" },
  { Icon: Home,        label: "امکان پرداخت در محل" },
  { Icon: Truck,       label: "امکان تحویل اکسپرس" },
] as const;

export function Footer({ data }: { data: FooterData }) {
  const { config, business, contact, social, columns } = data;

  const socialLinks = social.links
    .filter((l) => l.isActive && l.url)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const showContact = config.showContactInfo && contact.showContactInFooter;
  const hasContact =
    showContact &&
    (contact.primaryPhone || contact.email || business.address || contact.workingHours);

  return (
    <footer className="mt-16 border-t border-store-border bg-store-surface text-store-text">

      {/* ══════════════════════════════════════════════
          ردیف ۱: آیکون‌های اعتماد — عیناً مثل دیجی‌کالا
          بر موبایل اسکرول افقی، دسکتاپ ۵ ستون
          ══════════════════════════════════════════════ */}
      <div className="border-b border-store-border">
        <div className="mx-auto max-w-360 px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-5 divide-x divide-x-reverse divide-store-border">
            {TRUST_ICONS.map(({ Icon, label }, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 px-2 py-5 text-center"
              >
                <Icon className="size-6 text-store-primary sm:size-7" aria-hidden />
                <span className="text-[0.6rem] leading-snug text-store-text-muted sm:text-xs">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ردیف ۲: ستون‌های اصلی
          موبایل: تک‌ستون | تبلت: ۲ ستون | دسکتاپ: ۴ ستون
          ══════════════════════════════════════════════ */}
      <div className="mx-auto max-w-360 px-4 py-10 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* ── ستون برند: لوگو + تماس + سوشیال + خبرنامه ── */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" aria-label="دشت‌زاد" className="focus-ring w-fit rounded">
              <Logo variant="full" className="h-10 w-auto" />
            </Link>

            {/* تماس — زیر لوگو */}
            {hasContact && (
              <ul className="flex flex-col gap-1.5 text-sm text-store-text-muted">
                {contact.primaryPhone && (
                  <li>
                    <a href={`tel:${contact.primaryPhone}`} dir="ltr" className="focus-ring inline-flex items-center gap-1.5 rounded hover:text-store-primary">
                      <Phone className="size-3.5 text-store-text-faint" aria-hidden />
                      <span dir="rtl">{contact.primaryPhone}</span>
                    </a>
                  </li>
                )}
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`} dir="ltr" className="focus-ring inline-flex items-center gap-1.5 rounded hover:text-store-primary">
                      <Mail className="size-3.5 text-store-text-faint" aria-hidden />
                      {contact.email}
                    </a>
                  </li>
                )}
                {contact.workingHours && (
                  <li className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 text-store-text-faint" aria-hidden />
                    {contact.workingHours}
                  </li>
                )}
                {business.address && (
                  <li className="inline-flex items-start gap-1.5 leading-6">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-store-text-faint" aria-hidden />
                    {business.address}
                  </li>
                )}
              </ul>
            )}

            {/* سوشیال */}
            {config.showSocialLinks && socialLinks.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-store-text">همراه ما باشید!</span>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((l, idx) => (
                    <a
                      key={idx}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={l.label || l.platform}
                      className="focus-ring flex size-9 items-center justify-center rounded-full border border-store-border text-store-text-faint transition-colors hover:border-store-primary hover:text-store-primary"
                    >
                      <SocialIcon platform={l.platform} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* خبرنامه */}
            <NewsletterForm />
          </div>

          {/* ── ستون‌های لینک از ادمین ── */}
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
              <h2 className="text-sm font-bold text-store-text">{col.title}</h2>
              <ul className="flex flex-col gap-2">
                {col.items
                  .filter((it) => it.desktopVisible || it.mobileVisible)
                  .map((it) => (
                    <li key={it.href + it.label}>
                      <Link
                        href={it.href}
                        target={it.target === "BLANK" ? "_blank" : undefined}
                        className="focus-ring inline-flex w-fit rounded text-sm text-store-text-muted transition-colors hover:text-store-primary"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>
          ))}

        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ردیف ۳: فقط نمادها — سمت چپ در RTL
          ══════════════════════════════════════════════ */}
      <div className="border-t border-store-border">
        <div className="mx-auto max-w-360 px-4 py-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-end gap-3">
            {config.enamadHtml ? (
              <span dangerouslySetInnerHTML={{ __html: config.enamadHtml }} />
            ) : (
              <span className="grid size-20 place-items-center rounded-xl border border-store-border bg-store-surface-soft p-1.5">
                <Image src="/logo/enamad.webp" width={68} height={68} alt="نماد اعتماد الکترونیکی" className="size-full object-contain" />
              </span>
            )}
            {config.samandehiHtml ? (
              <span dangerouslySetInnerHTML={{ __html: config.samandehiHtml }} />
            ) : (
              <span className="grid size-20 place-items-center rounded-xl border border-store-border bg-store-surface-soft p-1.5">
                <Image src="/logo/anjoman.webp" width={68} height={68} alt="مجوز اتحادیه‌ی صنفی" className="size-full object-contain" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ردیف ۴: نوار کپی‌رایت پایین — مثل دیجی‌کالا سفید
          ══════════════════════════════════════════════ */}
      <div className="border-t border-store-border bg-store-surface-soft">
        <div className="mx-auto flex max-w-360 flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-store-text-faint sm:flex-row sm:px-8 sm:text-start lg:px-12">
          <span>
            {config.copyrightText || "برای استفاده از مطالب دشت‌زاد، داشتن «هدف غیرتجاری» و ذکر «منبع» کافیست."}
          </span>
          <span className="flex items-center gap-1.5">
            <Logo variant="1313" className="h-6 w-auto opacity-60" />
            {config.bottomNote || "از سال ۱۳۱۳"}
          </span>
        </div>
      </div>

    </footer>
  );
}
