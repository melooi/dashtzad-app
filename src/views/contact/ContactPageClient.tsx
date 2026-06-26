"use client";

import { useState, useCallback } from "react";
import type { ContactPage } from "@/lib/admin/globals";

type SocialChip = { platform: string; label: string; url: string };

type Props = {
  phone: string;
  email: string;
  address: string;
  hours: string;
  mapUrl: string;
  socials: SocialChip[];
  page: ContactPage;
};

const PLATFORM_ICON: Record<string, string> = {
  instagram: "ri-instagram-line",
  telegram: "ri-telegram-line",
  whatsapp: "ri-whatsapp-line",
  linkedin: "ri-linkedin-box-line",
  x: "ri-twitter-x-line",
  youtube: "ri-youtube-line",
  aparat: "ri-play-circle-line",
  custom: "ri-global-line",
};

const PLATFORM_CHIP_MOD: Record<string, string> = {
  instagram: "dz-contact-social__chip--instagram",
  telegram: "dz-contact-social__chip--telegram",
  whatsapp: "dz-contact-social__chip--whatsapp",
  linkedin: "dz-contact-social__chip--linkedin",
  x: "dz-contact-social__chip--twitter",
  youtube: "dz-contact-social__chip--youtube",
};

const REQUEST_TYPES = [
  "پیگیری سفارش",
  "مشاوره خرید",
  "خرید عمده",
  "همکاری با دشت‌زاد",
  "انتقاد و پیشنهاد",
  "مشکل پرداخت",
  "سایر موارد",
];

type FormState = { name: string; phone: string; subject: string; type: string; message: string };

export function ContactPageClient({ phone, email, address, hours, mapUrl, socials, page }: Props) {
  const [form, setForm] = useState<FormState>({ name: "", phone: "", subject: "", type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = useCallback((k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (error) setError("");
  }, [error]);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.subject.trim() || !form.type || !form.message.trim()) {
      setError("لطفاً همه فیلدهای اجباری را پر کنید.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || "خطایی رخ داد. لطفاً دوباره امتحان کنید.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("خطا در ارسال پیام. اتصال اینترنت خود را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  }, [form]);

  const telHref = phone
    ? "tel:+98" + phone.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[^\d]/g, "").replace(/^0/, "")
    : "";

  return (
    <main className="dz-main dz-contact dz-contact--simple">

      {/* ===== HERO ===== */}
      <section className="dz-contact-hero">
        <div className="dz-contact-hero__inner">
          <span className="dz-contact-hero__kicker">
            <i className="dz-icon ri-customer-service-2-line" aria-hidden="true" />
            <span>{page.heroKicker}</span>
          </span>
          <h1 className="dz-contact-hero__title">{page.heroTitle}</h1>
          <p className="dz-contact-hero__sub">{page.heroSub}</p>
          <div className="dz-contact-hero__chips">
            {phone && (
              <a className="dz-contact-hero__chip" href={telHref}>
                <i className="dz-icon ri-phone-line" aria-hidden="true" />
                <span>{phone}</span>
              </a>
            )}
            {email && (
              <a className="dz-contact-hero__chip" href={`mailto:${email}`}>
                <i className="dz-icon ri-mail-line" aria-hidden="true" />
                <span>{email}</span>
              </a>
            )}
            <a className="dz-contact-hero__chip" href="/faq">
              <i className="dz-icon ri-question-line" aria-hidden="true" />
              <span>پرسش‌های متداول</span>
            </a>
          </div>
        </div>
      </section>

      <div className="dz-contact-layout">

        {/* ===== FORM ===== */}
        <section className="dz-contact-form">
          <h2 className="dz-contact-form__title">{page.formTitle}</h2>
          <p className="dz-contact-form__sub">{page.formSub}</p>

          <form className="dz-contact-form__body" onSubmit={submit} noValidate>
            {/* honeypot */}
            <input type="text" name="dz_hp" className="dz-contact-form__hp" tabIndex={-1} autoComplete="off" />

            <div className="dz-contact-form__row">
              <div className="dz-contact-form__field">
                <label className="dz-contact-form__label" htmlFor="cf-name">
                  نام و نام خانوادگی <span className="dz-contact-form__req">*</span>
                </label>
                <input
                  className="dz-contact-form__input"
                  id="cf-name" type="text" placeholder="مثلاً زهرا رحیمی"
                  value={form.name} onChange={(e) => set("name", e.target.value)}
                  disabled={success}
                />
              </div>
              <div className="dz-contact-form__field">
                <label className="dz-contact-form__label" htmlFor="cf-phone">
                  شماره موبایل <span className="dz-contact-form__req">*</span>
                </label>
                <input
                  className="dz-contact-form__input"
                  id="cf-phone" type="tel" inputMode="numeric" maxLength={11} dir="ltr"
                  placeholder="09120000000"
                  value={form.phone} onChange={(e) => set("phone", e.target.value)}
                  disabled={success}
                />
              </div>
            </div>

            <div className="dz-contact-form__row">
              <div className="dz-contact-form__field">
                <label className="dz-contact-form__label" htmlFor="cf-subject">
                  موضوع پیام <span className="dz-contact-form__req">*</span>
                </label>
                <input
                  className="dz-contact-form__input"
                  id="cf-subject" type="text" placeholder="موضوع پیام خود را بنویسید"
                  value={form.subject} onChange={(e) => set("subject", e.target.value)}
                  disabled={success}
                />
              </div>
              <div className="dz-contact-form__field">
                <label className="dz-contact-form__label" htmlFor="cf-type">
                  نوع درخواست <span className="dz-contact-form__req">*</span>
                </label>
                <select
                  className="dz-contact-form__input dz-contact-form__select"
                  id="cf-type"
                  value={form.type} onChange={(e) => set("type", e.target.value)}
                  disabled={success}
                >
                  <option value="" disabled>یک گزینه را انتخاب کنید</option>
                  {REQUEST_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="dz-contact-form__field">
              <label className="dz-contact-form__label" htmlFor="cf-text">
                متن پیام <span className="dz-contact-form__req">*</span>
              </label>
              <textarea
                className="dz-contact-form__input dz-contact-form__textarea"
                id="cf-text" placeholder="پیام خود را این‌جا بنویسید…"
                value={form.message} onChange={(e) => set("message", e.target.value)}
                disabled={success}
              />
            </div>

            <p className="dz-contact-form__note">
              <i className="dz-icon ri-shield-check-line" aria-hidden="true" />
              <span>{page.formNote}</span>
            </p>

            {error && <p className="dz-contact-form__err" role="alert">{error}</p>}

            {!success && (
              <button className="dz-contact-form__submit" type="submit" disabled={loading}>
                <i className="dz-icon ri-send-plane-2-line" aria-hidden="true" />
                <span>{loading ? "در حال ارسال…" : "ارسال پیام"}</span>
              </button>
            )}

            {success && (
              <div className="dz-contact-form__ok" role="status">
                <i className="dz-icon ri-checkbox-circle-line" aria-hidden="true" />
                <span>پیام شما ثبت شد! کارشناسان ما به‌زودی با شما تماس می‌گیرند.</span>
              </div>
            )}
          </form>
        </section>

        {/* ===== ASIDE ===== */}
        <aside className="dz-contact-aside">

          {/* Contact methods */}
          <section className="dz-contact-methods">
            {phone && (
              <a className="dz-contact-method dz-contact-method--slot-1" href={telHref}>
                <span className="dz-contact-method__ic">
                  <i className="dz-icon ri-phone-line" aria-hidden="true" />
                </span>
                <span className="dz-contact-method__body">
                  <span className="dz-contact-method__label">تلفن تماس</span>
                  <span className="dz-contact-method__value" dir="ltr">{phone}</span>
                </span>
              </a>
            )}
            {email && (
              <a className="dz-contact-method dz-contact-method--slot-2" href={`mailto:${email}`}>
                <span className="dz-contact-method__ic">
                  <i className="dz-icon ri-mail-line" aria-hidden="true" />
                </span>
                <span className="dz-contact-method__body">
                  <span className="dz-contact-method__label">ایمیل</span>
                  <span className="dz-contact-method__value" dir="ltr">{email}</span>
                </span>
              </a>
            )}
            <a className="dz-contact-method dz-contact-method--slot-3" href={page.websiteUrl || "https://dashtzad.com"}>
              <span className="dz-contact-method__ic">
                <i className="dz-icon ri-global-line" aria-hidden="true" />
              </span>
              <span className="dz-contact-method__body">
                <span className="dz-contact-method__label">وب‌سایت</span>
                <span className="dz-contact-method__value" dir="ltr">{page.websiteLabel}</span>
              </span>
            </a>
          </section>

          {/* Social */}
          {socials.length > 0 && (
            <section className="dz-contact-social">
              <h3 className="dz-contact-social__title">
                <i className="dz-icon ri-share-line" aria-hidden="true" />
                <span>دشت‌زاد در شبکه‌ها</span>
              </h3>
              <div className="dz-contact-social__grid">
                {socials.map((s) => (
                  <a
                    key={s.platform}
                    className={`dz-contact-social__chip${PLATFORM_CHIP_MOD[s.platform] ? " " + PLATFORM_CHIP_MOD[s.platform] : ""}`}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                  >
                    <span className="dz-contact-social__chip-ic">
                      <i className={`dz-icon ${PLATFORM_ICON[s.platform] || "ri-global-line"}`} aria-hidden="true" />
                    </span>
                    <span>{s.label}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Address */}
          <section className="dz-contact-info">
            <h3 className="dz-contact-info__title">
              <i className="dz-icon ri-map-pin-line" aria-hidden="true" />
              <span>آدرس دشت‌زاد</span>
            </h3>
            {address && <p className="dz-contact-info__text">{address}</p>}
            {hours && (
              <p className="dz-contact-info__hours">
                <i className="dz-icon ri-time-line" aria-hidden="true" />
                <span>{hours}</span>
              </p>
            )}
            <a
              className="dz-contact-info__map dz-contact-info__map--placeholder"
              href={mapUrl || "https://www.google.com/maps/?q=Tehran+Pirouzi"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>مشاهدهٔ موقعیت روی نقشه</span>
            </a>
          </section>

          {/* CTAs */}
          <section className="dz-contact-ctas">
            <a className="dz-contact-cta dz-contact-cta--ink" href={page.cta1Href || "/orders/track"}>
              <span className="dz-contact-cta__ic">
                <i className="dz-icon ri-truck-line" aria-hidden="true" />
              </span>
              <span className="dz-contact-cta__body">
                <span className="dz-contact-cta__title">{page.cta1Title}</span>
                <span className="dz-contact-cta__desc">{page.cta1Desc}</span>
              </span>
              <span className="dz-contact-cta__arrow">
                <i className="dz-icon ri-arrow-left-s-line" aria-hidden="true" />
              </span>
            </a>
            <a className="dz-contact-cta dz-contact-cta--clay" href={page.cta2Href || "/contact?type=bulk"}>
              <span className="dz-contact-cta__ic">
                <i className="dz-icon ri-handshake-line" aria-hidden="true" />
              </span>
              <span className="dz-contact-cta__body">
                <span className="dz-contact-cta__title">{page.cta2Title}</span>
                <span className="dz-contact-cta__desc">{page.cta2Desc}</span>
              </span>
              <span className="dz-contact-cta__arrow">
                <i className="dz-icon ri-arrow-left-s-line" aria-hidden="true" />
              </span>
            </a>
          </section>

        </aside>
      </div>
    </main>
  );
}
