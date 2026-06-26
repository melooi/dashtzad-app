"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { FaqPage } from "@/lib/admin/globals";

type FAQItem = { id: string; question: string; answer: string };
type FAQGroup = { id: string; title: string; description: string | null; items: FAQItem[] };
type ContactInfo = { phone: string; email: string };

type Props = { groups: FAQGroup[]; contact: ContactInfo; page: FaqPage };

const GROUP_ICONS = [
  "ri-plant-line",
  "ri-truck-line",
  "ri-shield-check-line",
  "ri-bank-card-line",
  "ri-account-circle-line",
  "ri-medal-line",
  "ri-gift-line",
];

const GROUP_VARIANTS = [
  "",
  "",
  "dz-faq-group--clay",
  "dz-faq-group--gold",
  "",
  "dz-faq-group--gold",
  "dz-faq-group--clay",
];

export function FaqPageClient({ groups, contact, page }: Props) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("");
  const groupRefs = useRef<(HTMLElement | null)[]>([]);

  const toggleItem = useCallback((id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filtered = groups.map((g) => {
    const matchingItems = query
      ? g.items.filter((i) => i.question.includes(query))
      : g.items;
    return { ...g, items: matchingItems, hidden: query !== "" && matchingItems.length === 0 };
  });

  const noResults = query !== "" && filtered.every((g) => g.hidden);

  useEffect(() => {
    const els = groupRefs.current.filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveGroup(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [groups]);

  return (
    <main className="dz-main dz-faq">
      {/* ===== HERO ===== */}
      <section className="dz-faq-hero">
        <div className="mx-auto max-w-[124rem] px-[clamp(1.6rem,4vw,4rem)]">
          <div className="dz-faq-hero__inner">
            <div className="dz-faq-hero__top">
              <span className="dz-faq-hero__kicker">
                <i className="dz-icon ri-question-line" aria-hidden="true" />
                {" "}{page.heroKicker}
              </span>
              {page.heroUpdated && (
                <span className="dz-faq-hero__updated">
                  <i className="dz-icon ri-calendar-check-line" aria-hidden="true" />
                  {" "}{page.heroUpdated}
                </span>
              )}
            </div>
            <h1 className="dz-faq-hero__title">{page.heroTitle}</h1>
            <p className="dz-faq-hero__sub">{page.heroSub}</p>
            <form
              className="dz-faq-hero__search"
              onSubmit={(e) => e.preventDefault()}
            >
              <i className="dz-icon ri-search-line" aria-hidden="true" />
              <input
                type="search"
                className="dz-faq-hero__input"
                placeholder={page.searchPlaceholder}
                aria-label="جستجو در پرسش‌ها"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  className="dz-faq-hero__clear"
                  type="button"
                  onClick={() => setQuery("")}
                >
                  <i className="dz-icon ri-close-line" aria-hidden="true" /> پاک کردن
                </button>
              )}
            </form>
            <div className="dz-faq-hero__chips">
              {groups.map((g, idx) => (
                <a key={g.id} className="dz-faq-hero__chip" href={`#group-${idx}`}>
                  <i
                    className={`dz-icon ${GROUP_ICONS[idx % GROUP_ICONS.length]}`}
                    aria-hidden="true"
                  />
                  {" "}{g.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== BODY ===== */}
      <section className="dz-faq-layout-wrap">
        <div className="dz-faq-layout">
          {/* side nav */}
          <aside className="dz-faq-nav">
            <div className="dz-faq-nav__h">
              <i className="dz-icon ri-stack-line" aria-hidden="true" /> دسته‌بندی پرسش‌ها
            </div>
            {groups.map((g, idx) => (
              <a
                key={g.id}
                className={`dz-faq-nav__item${activeGroup === `group-${idx}` ? " is-active" : ""}`}
                href={`#group-${idx}`}
              >
                <span className="dz-faq-nav__ic">
                  <i
                    className={`dz-icon ${GROUP_ICONS[idx % GROUP_ICONS.length]}`}
                    aria-hidden="true"
                  />
                </span>
                {g.title}
              </a>
            ))}
            <div className="dz-faq-nav__sep" />
            <a className="dz-faq-nav__terms" href="/terms">
              <i className="dz-icon ri-scales-3-line" aria-hidden="true" />
              <span>
                <b>قوانین و مقررات</b>
                <span>شرایط خرید و حریم خصوصی</span>
              </span>
            </a>
          </aside>

          {/* accordion groups */}
          <div className="dz-faq-main">
            <div className={`dz-faq-empty${noResults ? " is-shown" : ""}`}>
              <i className="dz-icon ri-emotion-sad-line" aria-hidden="true" />
              <p>
                پرسشی با این عبارت پیدا نشد. عبارت دیگری را امتحان کنید یا با پشتیبانی تماس
                بگیرید.
              </p>
            </div>

            {filtered.map((g, idx) => (
              <section
                key={g.id}
                id={`group-${idx}`}
                className={[
                  "dz-faq-group",
                  GROUP_VARIANTS[idx % GROUP_VARIANTS.length],
                  g.hidden ? "is-hidden" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                ref={(el) => {
                  groupRefs.current[idx] = el;
                }}
              >
                <div className="dz-faq-group__head">
                  <span className="dz-faq-group__ic">
                    <i
                      className={`dz-icon ${GROUP_ICONS[idx % GROUP_ICONS.length]}`}
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <h2 className="dz-faq-group__t">{g.title}</h2>
                    {g.description && (
                      <p className="dz-faq-group__n">{g.description}</p>
                    )}
                  </div>
                </div>
                <div className="dz-faq-list">
                  {g.items.map((item) => {
                    const isOpen = openItems.has(item.id);
                    return (
                      <article
                        key={item.id}
                        className={`dz-faq-item${isOpen ? " is-open" : ""}`}
                      >
                        <button
                          className="dz-faq-q"
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => toggleItem(item.id)}
                        >
                          <span className="dz-faq-q__ic">
                            <i className="dz-icon ri-add-line" aria-hidden="true" />
                          </span>
                          <span className="dz-faq-q__txt">{item.question}</span>
                        </button>
                        <div className="dz-faq-a">
                          <div className="dz-faq-a__inner">
                            <div
                              className="dz-faq-a__body"
                              dangerouslySetInnerHTML={{ __html: item.answer }}
                            />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section className="dz-faq-contact-wrap" id="contact">
        <div className="dz-faq-contact">
          <div className="dz-faq-contact__copy">
            <span className="dz-faq-contact__kicker">
              <i className="dz-icon ri-customer-service-2-line" aria-hidden="true" />{" "}
              {page.contactKicker}
            </span>
            <h2 className="dz-faq-contact__title">{page.contactTitle}</h2>
            <p className="dz-faq-contact__sub">{page.contactSub}</p>
          </div>
          <div className="dz-faq-contact__actions">
            {contact.phone && (
              <a className="dz-faq-contact__row" href={`tel:${contact.phone}`}>
                <i className="dz-icon ri-phone-line" aria-hidden="true" />
                <span>
                  <b>{contact.phone}</b>
                  <span>تماس تلفنی با پشتیبانی</span>
                </span>
              </a>
            )}
            <a className="dz-faq-contact__row" href="/contact">
              <i className="dz-icon ri-chat-1-line" aria-hidden="true" />
              <span>
                <b>فرم تماس و گفت‌وگوی آنلاین</b>
                <span>پاسخ در سریع‌ترین زمان ممکن</span>
              </span>
            </a>
            {contact.email && (
              <a className="dz-faq-contact__row" href={`mailto:${contact.email}`}>
                <i className="dz-icon ri-mail-line" aria-hidden="true" />
                <span>
                  <b>{contact.email}</b>
                  <span>پاسخ ایمیلی حداکثر تا ۲۴ ساعت</span>
                </span>
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
