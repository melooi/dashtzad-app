"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TermsContent } from "@/lib/admin/globals";

type ContactInfo = { phone: string; email: string };
type Props = { content: TermsContent; contact: ContactInfo };

const SECTIONS: {
  key: keyof TermsContent;
  id: string;
  icon: string;
  chipLabel: string;
  navLabel: string;
  title: string;
  subtitle: string;
}[] = [
  { key: "general",  id: "t-general",  icon: "ri-book-open-line",     chipLabel: "کلیات و تعاریف",    navLabel: "کلیات و تعاریف",          title: "کلیات و تعاریف",                        subtitle: "دامنه کاربرد، تعریف‌ها و پذیرش قوانین" },
  { key: "account",  id: "t-account",  icon: "ri-account-circle-line", chipLabel: "حساب کاربری",      navLabel: "حساب کاربری و ثبت‌نام",   title: "حسابِ کاربری و ثبت‌نام",               subtitle: "ساخت حساب، صحتِ اطلاعات و امنیتِ آن" },
  { key: "buy",      id: "t-buy",      icon: "ri-shopping-bag-line",   chipLabel: "شرایط خرید",       navLabel: "شرایط خرید و ثبت سفارش", title: "شرایطِ خرید و ثبتِ سفارش",            subtitle: "قیمت، موجودی، قراردادِ الکترونیکی و سفارش" },
  { key: "pay",      id: "t-pay",      icon: "ri-bank-card-line",      chipLabel: "تسویه‌حساب",       navLabel: "تسویه‌حساب",              title: "تسویه‌حساب",                            subtitle: "پرداخت، درگاهِ امن و کارت‌به‌کارت" },
  { key: "ship",     id: "t-ship",     icon: "ri-truck-line",          chipLabel: "حمل و تحویل",      navLabel: "حمل، تحویل و دریافت",     title: "حمل، تحویل و دریافتِ سفارش",           subtitle: "زمان‌بندی، روشِ ارسال و بازرسی هنگامِ تحویل" },
  { key: "return",   id: "t-return",   icon: "ri-arrow-go-back-line",  chipLabel: "مرجوعی و استرداد", navLabel: "مرجوعی و استرداد",         title: "شرایطِ مرجوعی و استرداد (حقِ انصراف)", subtitle: "بازگشتِ کالا، مواردِ قابل و غیرقابلِ مرجوع" },
  { key: "address",  id: "t-address",  icon: "ri-map-pin-line",        chipLabel: "ثبت آدرس",         navLabel: "مسئولیت ثبت آدرس",         title: "مسئولیتِ مشتری در ثبتِ آدرس",          subtitle: "صحتِ آدرس و پیامدهای اطلاعاتِ نادرست" },
  { key: "coupon",   id: "t-coupon",   icon: "ri-coupon-3-line",       chipLabel: "کد تخفیف",         navLabel: "کد تخفیف",                 title: "شرایطِ استفاده از کدِ تخفیف",          subtitle: "اعتبار، محدودیت‌ها و نحوهٔ اعمالِ کد" },
  { key: "ip",       id: "t-ip",       icon: "ri-copyright-line",      chipLabel: "مالکیت معنوی",     navLabel: "مالکیت معنوی",             title: "مالکیتِ معنوی",                         subtitle: "حقوقِ محتوا، تصاویر و اطلاعاتِ سایت" },
  { key: "privacy",  id: "t-privacy",  icon: "ri-shield-user-line",    chipLabel: "حریم خصوصی",       navLabel: "حریم خصوصی",               title: "قوانینِ حریمِ خصوصی",                   subtitle: "گردآوری، استفاده و حفاظت از اطلاعاتِ شما" },
  { key: "comments", id: "t-comments", icon: "ri-chat-3-line",         chipLabel: "ارسال نظر",        navLabel: "قوانین ارسال نظر",         title: "قوانینِ ارسالِ نظر",                    subtitle: "اشتراکِ تجربه و چارچوبِ نقدِ محصولات" },
  { key: "force",    id: "t-force",    icon: "ri-thunderstorms-line",  chipLabel: "قوهٔ قهریه",       navLabel: "قوهٔ قهریه",               title: "قوهٔ قهریه (فورس ماژور)",              subtitle: "حوادثِ غیرمترقبه و تعلیقِ خدمات" },
  { key: "change",   id: "t-change",   icon: "ri-scales-line",         chipLabel: "تغییر قوانین",     navLabel: "تغییر قوانین و اختلاف",    title: "تغییرِ قوانین و حلِ اختلاف",           subtitle: "به‌روزرسانیِ مقررات و مرجعِ رسیدگی" },
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

export function TermsPageClient({ content, contact }: Props) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>("");
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const toggle = useCallback((id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filtered = SECTIONS.map((s) => {
    if (!query) return { ...s, hidden: false };
    const text = (s.title + " " + s.subtitle + " " + stripHtml(content[s.key] as string)).toLowerCase();
    return { ...s, hidden: !text.includes(query.toLowerCase()) };
  });

  const noResults = query !== "" && filtered.every((s) => s.hidden);

  useEffect(() => {
    const els = sectionRefs.current.filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="dz-main dz-terms">

      {/* ===== HERO ===== */}
      <section className="dz-terms-hero">
        <div className="dz-terms-hero__inner">
          {content.heroUpdated && (
            <span className="dz-terms-hero__updated">
              <i className="dz-icon ri-calendar-check-line" aria-hidden="true" />
              <span>{content.heroUpdated}</span>
            </span>
          )}

          <div className="dz-terms-hero__copy">
            <span className="dz-terms-hero__kicker">
              <i className="dz-icon ri-scales-3-line" aria-hidden="true" />
              <span>{content.heroKicker}</span>
            </span>

            <h1 className="dz-terms-hero__title">{content.heroTitle}</h1>
            <p className="dz-terms-hero__sub">{content.heroSub}</p>

            <form
              className="dz-terms-hero__search"
              onSubmit={(e) => e.preventDefault()}
              role="search"
            >
              <i className="dz-icon ri-search-line" aria-hidden="true" />
              <input
                type="search"
                className="dz-terms-hero__input"
                placeholder={content.searchPlaceholder}
                aria-label="جستجو در قوانین"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className="dz-terms-hero__clear"
                  onClick={() => setQuery("")}
                >
                  <i className="dz-icon ri-close-line" aria-hidden="true" />
                  <span>پاک کردن</span>
                </button>
              )}
            </form>

            <div className="dz-terms-hero__chips">
              {SECTIONS.map((s) => (
                <a key={s.id} className="dz-terms-hero__chip" href={`#${s.id}`}>
                  <i className={`dz-icon ${s.icon}`} aria-hidden="true" />
                  <span>{s.chipLabel}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== INTRO ===== */}
      <section className="dz-terms-intro-wrap">
        <div
          className="dz-terms-intro"
          dangerouslySetInnerHTML={{ __html: content.intro }}
        />
      </section>

      {/* ===== LAYOUT: TOC + SECTIONS ===== */}
      <section className="dz-terms-layout-wrap">
        <div className="dz-terms-layout">

          {/* ===== TOC ===== */}
          <aside className="dz-terms-nav" id="dz-terms-toc">
            <div className="dz-terms-nav__h">
              <i className="dz-icon ri-list-ordered" aria-hidden="true" />
              <span>فهرست مقررات</span>
            </div>

            {SECTIONS.map((s) => (
              <a
                key={s.id}
                className={`dz-terms-nav__item${activeSection === s.id ? " is-active" : ""}`}
                href={`#${s.id}`}
              >
                <span className="dz-terms-nav__ic">
                  <i className={`dz-icon ${s.icon}`} aria-hidden="true" />
                </span>
                <span className="dz-terms-nav__t">{s.navLabel}</span>
              </a>
            ))}

            <div className="dz-terms-nav__sep" aria-hidden="true" />
            <a className="dz-terms-nav__faq" href="/faq">
              <i className="dz-icon ri-question-line" aria-hidden="true" />
              <span>
                <b>پرسشی دارید؟</b>
                <span>به پرسش‌های متداول بروید</span>
              </span>
            </a>
          </aside>

          {/* ===== Legal sections ===== */}
          <div className="dz-legal">

            <div
              className={`dz-legal-empty${noResults ? " is-shown" : ""}`}
              id="dz-legal-empty"
              aria-live="polite"
            >
              <i className="dz-icon ri-emotion-sad-line" aria-hidden="true" />
              <p>
                بندی با این عبارت پیدا نشد. عبارت دیگری را امتحان کنید یا از فهرست کناری
                استفاده کنید.
              </p>
            </div>

            {filtered.map((s, idx) => {
              const isOpen = openSections.has(s.id);
              return (
                <section
                  key={s.id}
                  id={s.id}
                  className={[
                    "dz-legal-sec",
                    isOpen ? "is-open" : "",
                    s.hidden ? "is-hidden" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  ref={(el) => {
                    sectionRefs.current[idx] = el;
                  }}
                >
                  <button
                    type="button"
                    className="dz-legal-sec__head"
                    aria-expanded={isOpen}
                    aria-controls={`${s.id}-body`}
                    onClick={() => toggle(s.id)}
                  >
                    <span className="dz-legal-sec__ic">
                      <i className={`dz-icon ${s.icon}`} aria-hidden="true" />
                    </span>
                    <span className="dz-legal-sec__heading">
                      <h2 className="dz-legal-sec__t">{s.title}</h2>
                      <p className="dz-legal-sec__n">{s.subtitle}</p>
                    </span>
                    <span className="dz-legal-sec__toggle" aria-hidden="true">
                      <i className="dz-icon ri-add-line" />
                    </span>
                  </button>
                  <div className="dz-legal-sec__body" id={`${s.id}-body`}>
                    <div
                      className="dz-legal-sec__inner"
                      dangerouslySetInnerHTML={{ __html: content[s.key] as string }}
                    />
                  </div>
                </section>
              );
            })}

            <div
              className="dz-legal-foot"
              dangerouslySetInnerHTML={{ __html: content.legalFoot }}
            />
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section className="dz-terms-contact-wrap" id="contact">
        <div className="dz-terms-contact">
          <div className="dz-terms-contact__copy">
            <span className="dz-terms-contact__kicker">
              <i className="dz-icon ri-customer-service-2-line" aria-hidden="true" />
              <span>{content.contactKicker}</span>
            </span>
            <h2 className="dz-terms-contact__title">{content.contactTitle}</h2>
            <p className="dz-terms-contact__sub">{content.contactSub}</p>
          </div>
          <div className="dz-terms-contact__actions">
            {contact.phone && (
              <a className="dz-terms-contact__row" href={`tel:${contact.phone}`}>
                <i className="dz-icon ri-phone-line" aria-hidden="true" />
                <span>
                  <b>{contact.phone}</b>
                  <span>تماسِ تلفنی با پشتیبانی</span>
                </span>
              </a>
            )}
            <a className="dz-terms-contact__row" href="/contact">
              <i className="dz-icon ri-chat-1-line" aria-hidden="true" />
              <span>
                <b>فرمِ تماس و گفت‌وگوی آنلاین</b>
                <span>پاسخ در سریع‌ترین زمانِ ممکن</span>
              </span>
            </a>
            {contact.email && (
              <a className="dz-terms-contact__row" href={`mailto:${contact.email}`}>
                <i className="dz-icon ri-mail-line" aria-hidden="true" />
                <span>
                  <b>{contact.email}</b>
                  <span>پاسخِ ایمیلی حداکثر تا ۲۴ ساعت</span>
                </span>
              </a>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}
