import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SocialIcon } from "@/components/storefront/chrome/SocialIcon";
import type { getFooterData } from "@/lib/site-data";

type FooterData = Awaited<ReturnType<typeof getFooterData>>;

export function Footer({ data }: { data: FooterData }) {
  const { config, brand, business, contact, social, columns } = data;

  const intro =
    brand.footerBrandText ||
    business.businessDescription ||
    "دشت‌زاد؛ روایت چند نسل از ۱۳۱۳. زعفران، آجیل، حبوبات، خشکبار و ادویه‌ی مرغوب ایرانی — از باغ خانوادگی تا سفره‌ی شما، بدون واسطه.";

  const socialLinks = social.links
    .filter((l) => l.isActive && l.url)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const showContact = config.showContactInfo && contact.showContactInFooter;
  const hasContact =
    showContact && (contact.primaryPhone || contact.email || business.address || contact.workingHours);

  return (
    <footer className="mt-16 border-t border-store-border bg-store-surface-warm text-store-text">
      <div className="mx-auto max-w-[90rem] px-[clamp(1rem,4vw,2.5rem)] py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
          {/* Brand block */}
          <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
            <Link href="/" aria-label="دشت‌زاد" className="focus-ring w-fit rounded-lg">
              <Logo variant="full" className="h-11 w-auto" />
            </Link>
            <p className="max-w-sm text-sm leading-7 text-store-text-muted">{intro}</p>

            {config.showSocialLinks && socialLinks.length > 0 && (
              <div className="mt-1">
                <span className="mb-2 block text-xs font-medium text-store-text-faint">دشت‌زاد در شبکه‌های اجتماعی</span>
                <div className="flex flex-wrap items-center gap-2.5">
                  {socialLinks.map((l, i) => (
                    <a
                      key={i}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={l.label || l.platform}
                      className="focus-ring flex size-9 items-center justify-center rounded-xl border border-store-border bg-store-surface text-store-text-muted transition-colors hover:border-store-primary/40 hover:bg-store-primary-soft hover:text-store-primary-hover"
                    >
                      <SocialIcon platform={l.platform} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Link columns (admin menus; honest — only those with links) */}
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
              <h2 className="font-heading text-sm font-bold text-store-text">{col.title}</h2>
              <ul className="flex flex-col gap-2">
                {col.items
                  .filter((it) => it.desktopVisible || it.mobileVisible)
                  .map((it) => (
                    <li key={it.href + it.label}>
                      <Link
                        href={it.href}
                        target={it.target === "BLANK" ? "_blank" : undefined}
                        className="focus-ring inline-flex w-fit items-center rounded text-sm text-store-text-muted transition-colors hover:text-store-primary"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Contact + trust seals (seals always shown) */}
        <div className="mt-10 grid gap-6 border-t border-store-border pt-8 md:grid-cols-2">
            {hasContact && (
              <div className="flex flex-col gap-2.5">
                <h2 className="font-heading text-sm font-bold text-store-text">تماس با دشت‌زاد</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-store-text-muted">
                  {contact.primaryPhone && (
                    <a href={`tel:${contact.primaryPhone}`} dir="ltr" className="focus-ring inline-flex items-center gap-1.5 rounded hover:text-store-primary">
                      <Phone className="size-4 text-store-text-faint" aria-hidden />
                      <span dir="rtl">{contact.primaryPhone}</span>
                    </a>
                  )}
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} dir="ltr" className="focus-ring inline-flex items-center gap-1.5 rounded hover:text-store-primary">
                      <Mail className="size-4 text-store-text-faint" aria-hidden />
                      {contact.email}
                    </a>
                  )}
                  {contact.workingHours && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-4 text-store-text-faint" aria-hidden />
                      {contact.workingHours}
                    </span>
                  )}
                </div>
                {business.address && (
                  <span className="inline-flex items-start gap-1.5 text-sm leading-6 text-store-text-faint">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {business.address}
                  </span>
                )}
              </div>
            )}

            {/* Trust seals — real نماد assets (admin embed HTML overrides each). */}
            <div className="flex flex-col gap-3 md:items-end">
              <h2 className="font-heading text-sm font-bold text-store-text">نمادها و مجوزها</h2>
              <div className="flex flex-wrap items-center gap-3">
                {config.enamadHtml ? (
                  <span dangerouslySetInnerHTML={{ __html: config.enamadHtml }} />
                ) : (
                  <span className="grid size-[5.5rem] place-items-center rounded-2xl border border-store-border bg-store-surface p-2 shadow-store-xs">
                    <Image src="/logo/enamad.webp" width={72} height={72} alt="نماد اعتماد الکترونیکی" className="size-full object-contain" />
                  </span>
                )}
                {config.samandehiHtml ? (
                  <span dangerouslySetInnerHTML={{ __html: config.samandehiHtml }} />
                ) : (
                  <span className="grid size-[5.5rem] place-items-center rounded-2xl border border-store-border bg-store-surface p-2 shadow-store-xs">
                    <Image src="/logo/anjoman.webp" width={72} height={72} alt="مجوز اتحادیه‌ی صنفی" className="size-full object-contain" />
                  </span>
                )}
              </div>
              {config.trustBadges.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {config.trustBadges.map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-store-text-muted">
                      <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-store-primary" aria-hidden />
                      <span>
                        <span className="font-medium text-store-text">{b.title}</span>
                        {b.description ? ` — ${b.description}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
      </div>

      {/* Bottom row — dark ink */}
      <div className="bg-store-ink text-store-text-inverse">
        <div className="mx-auto flex max-w-[90rem] flex-col items-center justify-between gap-1.5 px-[clamp(1rem,4vw,2.5rem)] py-4 text-center text-xs sm:flex-row sm:text-start">
          <span className="text-white/80">
            {config.copyrightText || "© دشت‌زاد — تمام حقوق محفوظ است."}
          </span>
          <span className="flex items-center gap-1.5 text-white/60">
            <Logo variant="1313" className="h-7 w-auto opacity-90" />
            {config.bottomNote || "از سال ۱۳۱۳"}
          </span>
        </div>
      </div>
    </footer>
  );
}
