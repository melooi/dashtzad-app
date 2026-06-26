import { toPersianNumbers, toPersianNumbersWithComma } from "@/lib/price";
import type {
  PdpData,
  PdpWeight,
  PdpPackaging,
  PdpRelated,
  PdpReview,
  PdpQuestion,
  PdpContent,
} from "./pdp-data";
import {
  MAIN_OPEN_ORIG,
  BANNERS_ORIG,
  GRID_OPEN_ORIG,
  BUYBOX_ORIG,
  MOBILEBAR_ORIG,
  OVERLAYS_ORIG,
} from "./pdp-sections";

/**
 * Assembles the PDP HTML from real data, reproducing the dz- design exactly.
 * Static structural sections (banners, trust band, buy box, mobile bar,
 * overlays) are reused verbatim; everything content-bearing is generated from
 * the product + its `pdpContent`. Blocks with no data are omitted so a product
 * never shows another product's content. Prices are recomputed client-side from
 * the real <button data-price> values in the weight selector.
 */

const DEMO_TITLE = "برگه گلابی خشک ممتاز";
const fa = (n: number | string) => toPersianNumbers(n);
const grp = (n: number) => toPersianNumbersWithComma(n);
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const toneClass = (t?: string) =>
  t === "gold" ? "dz-pdp-badge--gold" : t === "green" ? "dz-pdp-badge--green" : t === "ink" ? "dz-pdp-badge--ink" : "dz-pdp-badge--clay";

/* ───────────── breadcrumb ───────────── */
function breadcrumb(d: PdpData): string {
  const cat = d.categoryTitle
    ? `<li><a href="/products?cat=${esc(d.categorySlug ?? "")}">${esc(d.categoryTitle)}</a></li>
    <li class="dz-crumb__sep" aria-hidden="true"><i class="dz-icon ri-arrow-left-s-line dz-icon--sm"></i></li>`
    : "";
  return `<nav class="dz-crumb" aria-label="مسیر صفحه">
  <ol class="dz-crumb__list">
    <li><a href="/"><i class="dz-icon ri-home-line dz-icon--sm"></i> خانه</a></li>
    <li class="dz-crumb__sep" aria-hidden="true"><i class="dz-icon ri-arrow-left-s-line dz-icon--sm"></i></li>
    <li><a href="/products">فروشگاه</a></li>
    <li class="dz-crumb__sep" aria-hidden="true"><i class="dz-icon ri-arrow-left-s-line dz-icon--sm"></i></li>
    ${cat}
    <li aria-current="page">${esc(d.title)}</li>
  </ol>
</nav>`;
}

/* ───────────── info card ───────────── */
function weightBtn(w: PdpWeight, active: boolean): string {
  const off = w.offPercent ? `<span class="dz-wsel__off dz-num">٪${fa(w.offPercent)}</span>` : "";
  const pop = w.popular
    ? `<span class="dz-wsel__pop">پرفروش</span>`
    : w.badge
    ? `<span class="dz-wsel__pop dz-wsel__pop--save">${esc(w.badge)}</span>`
    : "";
  const unit = w.grams > 0 ? `<span class="dz-wsel__unit">هر ۱۰۰گ <b class="dz-num">${grp(w.per100Toman)}</b></span>` : "";
  return `<button class="dz-wsel__opt${active ? " is-active" : ""}" data-wid="${esc(w.wid)}" data-grams="${w.grams}" data-price="${w.priceToman}" data-old="${w.oldToman ?? w.priceToman}">
  ${pop}${off}
  <span class="dz-wsel__label">${esc(w.label)}</span>
  <span class="dz-wsel__now dz-num">${grp(w.priceToman)} <span class="dz-toman"></span></span>
  ${unit}
</button>`;
}

function pkgBtn(p: PdpPackaging, active: boolean): string {
  return `<button class="dz-pkg-opt${active ? " is-active" : ""}" data-pid="${esc(p.pid)}" data-extra="${p.extraToman}"><span class="dz-pkg-opt__l">${esc(p.label)}</span><span class="dz-pkg-opt__n">${esc(p.note)}</span></button>`;
}

function featureChips(d: PdpData): string {
  const c = d.content.features;
  const chips =
    c.length > 0
      ? c
      : [
          ...(d.brand ? [{ label: "برند", value: d.brand }] : []),
          ...(d.categoryTitle ? [{ label: "دسته", value: d.categoryTitle }] : []),
        ];
  if (!chips.length) return "";
  return chips
    .map((f) => {
      if (f.value) return `<span class="dz-chip"><span class="dz-faint">${esc(f.label)}:</span> <b>${esc(f.value)}</b></span>`;
      return `<span class="dz-chip">${f.icon ? `<i class="${esc(f.icon)}"></i> ` : ""}<b>${esc(f.label)}</b></span>`;
    })
    .join("\n              ");
}

function galleryBadges(d: PdpData): string {
  const b = d.content.galleryBadges;
  if (!b.length) return "";
  return `<div class="dz-pdp-gallery__badges">
              ${b
                .map(
                  (x) =>
                    `<span class="dz-pdp-badge ${toneClass(x.tone)}">${x.icon ? `<i class="${esc(x.icon)}"></i> ` : ""}${esc(x.label)}</span>`,
                )
                .join("\n              ")}
            </div>`;
}

function infoCard(d: PdpData): string {
  const activeWid = d.defaultWeightId;
  const weights = d.weights.map((w) => weightBtn(w, w.wid === activeWid)).join("\n");
  const packs = d.packagings.map((p, i) => pkgBtn(p, i === 0)).join("");
  const latin = d.latinTitle ? `<div class="dz-pdp-head__latin">${esc(d.latinTitle)}</div>` : "";
  const ratingMeta = d.ratingShown
    ? `<span class="dz-pdp-meta__sep"></span>
            <span class="dz-pdp-meta__item"><i class="ri-star-fill dz-pdp-meta__star"></i> <span class="dz-num">${fa(d.ratingShown)}</span> امتیاز</span>
            <span class="dz-pdp-meta__sep"></span>
            <span class="dz-pdp-meta__item"><span class="dz-num">${fa(d.numReviews)}</span> دیدگاه</span>`
    : "";

  const firstImg = d.images[0];
  const galMain = firstImg
    ? `<div class="dz-pdp-gallery__img" id="galMain"><img src="${esc(firstImg.url)}" alt="${esc(firstImg.alt)}" style="inline-size:100%;block-size:100%;object-fit:cover"></div>`
    : `<div class="dz-ph dz-pdp-gallery__img" id="galMain"><span class="dz-ph__label">${esc(d.title)}</span></div>`;
  const counter = d.images.length > 1 ? `${fa(1)} / ${fa(d.images.length)}` : "";
  const freeship =
    d.content.freeShipThresholdToman != null
      ? `<div class="dz-freeship"><i class="ri-truck-line"></i> <span>تا <b class="dz-num">${grp(d.content.freeShipThresholdToman)}</b> <span class="dz-toman"></span> دیگر تا ارسالِ رایگان</span></div>`
      : "";

  const weightSect = weights
    ? `<div class="dz-pdp-info__sect">
            <label class="dz-pdp-info__lbl">وزن بسته</label>
            <div class="dz-wsel" id="wsel">
              ${weights}
            </div>
          </div>`
    : "";
  const pkgSect = packs
    ? `<div class="dz-pdp-info__sect">
            <div class="dz-pdp-info__sect-head">
              <label class="dz-pdp-info__lbl">بسته‌بندی</label>
              <button class="dz-pdp-link" id="pkgModalBtn">مشاهده بسته‌بندی‌ها</button>
            </div>
            <div class="dz-pkgsel" id="pkgsel">
              ${packs}
            </div>
          </div>`
    : "";
  const featSect = featureChips(d)
    ? `<div class="dz-pdp-info__sect">
            <h4 class="dz-pdp-info__sect-h">ویژگی‌های اصلی</h4>
            <div class="dz-pdp-feat">
              ${featureChips(d)}
            </div>
          </div>`
    : "";

  return `<!-- ===== INFO CARD (info + gallery) ===== -->
      <div class="dz-pdp-info">
        <div class="dz-pdp-info__body">
          <div class="dz-pdp-head">
            <div style="min-inline-size:0">
              <h1 class="dz-pdp-head__title">${esc(d.title)}</h1>
              ${latin}
            </div>
            <div class="dz-pdp-head__actions">
              <button class="dz-pdp-iconbtn" id="likeBtn" aria-label="علاقه‌مندی"><i class="ri-heart-3-line"></i></button>
              <button class="dz-pdp-iconbtn" aria-label="اشتراک‌گذاری"><i class="ri-share-line"></i></button>
            </div>
          </div>

          <div class="dz-pdp-meta">
            <span class="dz-pdp-meta__item">کد کالا: <b class="dz-latin">${esc(d.code)}</b></span>
            ${ratingMeta}
            <span class="dz-pdp-meta__sep"></span>
            <span class="dz-pdp-meta__item"><span class="dz-num" data-q-count data-q-count-n="${d.questionCount}">${fa(d.questionCount)}</span> پرسش</span>
          </div>

          ${weightSect}

          ${pkgSect}

          ${featSect}
        </div>

        <!-- gallery -->
        <div class="dz-pdp-gallery">
          <div class="dz-pdp-gallery__frame">
            <button class="dz-pdp-gallery__nav dz-pdp-gallery__nav--prev" id="galPrev" type="button" aria-label="قبلی"><i class="ri-arrow-right-s-line"></i></button>
            <button class="dz-pdp-gallery__nav dz-pdp-gallery__nav--next" id="galNext" type="button" aria-label="بعدی"><i class="ri-arrow-left-s-line"></i></button>
            ${galMain}
            <span class="dz-pdp-gallery__counter dz-num" id="galCounter">${counter}</span>
            <button class="dz-pdp-gallery__zoom" id="galZoom" type="button" aria-label="بزرگ‌نمایی"><i class="ri-fullscreen-line"></i></button>
            ${galleryBadges(d)}
          </div>
          <div class="dz-pdp-gallery__thumbs" id="galThumbs"></div>
          ${freeship}
        </div>
      </div>`;
}

/* ───────────── section tabs (only present sections) ───────────── */
function sectabs(present: { id: string; label: string }[]): string {
  const tabs = present
    .map((s) => `<a class="dz-sectab" href="#${s.id}" data-target="#${s.id}">${s.label}</a>`)
    .join("\n          ");
  return `<nav class="dz-sectabs" id="sectabs" aria-label="بخش‌های صفحه">
          ${tabs}
        </nav>`;
}

const TRUSTBAND = `<div class="dz-trustband">
          <div class="dz-trustband__item"><span class="dz-trustband__ic"><i class="ri-truck-line"></i></span><div><div class="dz-trustband__t">ارسال سریع</div><div class="dz-trustband__s">تهران ۲۴ ساعته</div></div></div>
          <div class="dz-trustband__item"><span class="dz-trustband__ic"><i class="ri-shield-check-line"></i></span><div><div class="dz-trustband__t">ضمانت اصالت</div><div class="dz-trustband__s">تضمین کیفیت دشت‌زاد</div></div></div>
          <div class="dz-trustband__item"><span class="dz-trustband__ic"><i class="ri-arrow-go-back-line"></i></span><div><div class="dz-trustband__t">بازگشت ۷ روزه</div><div class="dz-trustband__s">بدون قید و شرط</div></div></div>
          <div class="dz-trustband__item"><span class="dz-trustband__ic"><i class="ri-phone-line"></i></span><div><div class="dz-trustband__t">پشتیبانی</div><div class="dz-trustband__s">همه‌روزه ۹ تا ۲۱</div></div></div>
        </div>`;

/* ───────────── description ───────────── */
function descSection(d: PdpData): string {
  const c = d.content;
  const hasProse = c.lead || c.paragraphs.length || c.bullets.length || c.serving.length || d.descriptionHtml;
  if (!hasProse && !c.quote && !c.taste.length && !c.highlights.length) return "";

  const lead = c.lead ? `<p class="dz-pdesc__lead">${esc(c.lead)}</p>` : "";
  const paras = c.paragraphs.length
    ? c.paragraphs.map((p) => `<p class="dz-pdesc__p">${esc(p)}</p>`).join("\n                ")
    : !c.lead && d.descriptionHtml
    ? `<div class="dz-pdesc__p">${d.descriptionHtml}</div>`
    : "";
  const bullets = c.bullets.length
    ? `<ul class="dz-pdesc__bullets">
                  ${c.bullets.map((b) => `<li><i class="ri-checkbox-circle-line"></i> <span>${b}</span></li>`).join("\n                  ")}
                </ul>`
    : "";
  const serve = c.serving.length
    ? `<div class="dz-pdesc__serve">
                  <span class="dz-pdesc__serve-h">پیشنهادِ خوردن:</span>
                  ${c.serving.map((s) => `<span class="dz-serve-chip">${s.icon ? `<i class="${esc(s.icon)}"></i> ` : ""}${esc(s.label)}</span>`).join("\n                  ")}
                </div>`
    : "";
  const heroBlock = lead || paras || bullets || serve
    ? `<div class="dz-pdesc__hero">
              <div class="dz-pdesc__text">
                ${lead}
                ${paras}
                ${bullets}
                ${serve}
              </div>
            </div>`
    : "";

  const quote = c.quote
    ? `<blockquote class="dz-pdesc__quote">
              <i class="ri-double-quotes-r dz-pdesc__quote-ic"></i>
              <div><p class="dz-pdesc__quote-text">${esc(c.quote.text)}</p>${c.quote.by ? `<span class="dz-pdesc__quote-by">${esc(c.quote.by)}</span>` : ""}</div>
            </blockquote>`
    : "";

  const taste = c.taste.length
    ? `<div class="dz-card dz-taste">
              <div class="dz-taste__head"><span class="dz-taste__ic"><i class="ri-restaurant-2-line"></i></span><div><b class="dz-taste__t">طعم و بافت</b><div class="dz-taste__s">پروفایلِ حسیِ این محصول</div></div></div>
              <div class="dz-taste__grid">
                ${c.taste
                  .map(
                    (t) =>
                      `<div class="dz-taste__row"><div class="dz-taste__top"><span>${esc(t.label)}</span><span class="dz-faint">${esc(t.level)}</span></div><span class="dz-taste__bar"><span style="inline-size:${Math.max(0, Math.min(100, t.pct))}%"></span></span></div>`,
                  )
                  .join("\n                ")}
              </div>
            </div>`
    : "";

  const highlights = c.highlights.length
    ? `<div class="dz-pdesc__hl">
              ${c.highlights
                .map(
                  (h) =>
                    `<div class="dz-card dz-hlcard"><span class="dz-hlcard__ic"><i class="${esc(h.icon ?? "ri-leaf-line")}"></i></span><div><div class="dz-hlcard__t">${esc(h.title)}</div><div class="dz-hlcard__s">${esc(h.text)}</div></div></div>`,
                )
                .join("\n              ")}
            </div>`
    : "";

  return `<!-- توضیح محصول -->
        <section class="dz-sec" id="sec-desc" data-screen-label="توضیح محصول">
          <div class="dz-sec__head"><span class="dz-sec__kicker">درباره محصول</span><h2 class="dz-sec__title">توضیح محصول</h2></div>
          <div class="dz-pdesc">
            ${heroBlock}
            ${quote}
            ${taste}
            ${highlights}
          </div>
        </section>`;
}

/* ───────────── specs (specs grid + nutrition + care) ───────────── */
function specsSection(d: PdpData): string {
  const c = d.content;
  if (!c.specs.length && !c.nutrition && !c.care.length) return "";

  const specGrid = c.specs.length
    ? `<details class="dz-card dz-acc-item" open>
              <summary><span class="dz-acc-item__title"><span class="dz-acc-item__ic"><i class="ri-archive-line"></i></span>مشخصات محصول</span><i class="ri-arrow-down-s-line dz-acc-item__chev"></i></summary>
              <div class="dz-acc-item__body">
                <div class="dz-specgrid">
                  ${c.specs
                    .map(
                      (s) =>
                        `<div class="dz-specitem"><span class="dz-specitem__ic"><i class="${esc(s.icon ?? "ri-leaf-line")}"></i></span><div><div class="dz-specitem__k">${esc(s.key)}</div><div class="dz-specitem__v">${esc(s.value)}</div></div></div>`,
                    )
                    .join("\n                  ")}
                </div>
              </div>
            </details>`
    : "";

  let nut = "";
  if (c.nutrition) {
    const n = c.nutrition;
    const macros = (n.macros ?? [])
      .map((m) => `<div class="dz-nut-macro"><div class="dz-nut-macro__n dz-num">${esc(m.n)}</div><div class="dz-nut-macro__l">${esc(m.l)}</div></div>`)
      .join("\n                    ");
    const rows = (n.rows ?? [])
      .map(
        (r) =>
          `<div class="dz-nut-row"><div class="dz-nut-row__top"><span class="dz-nut-row__l">${esc(r.label)}</span><span class="dz-nut-row__v dz-num">${esc(r.value)}</span></div>${typeof r.pct === "number" ? `<span class="dz-nut-bar"><span style="inline-size:${Math.max(0, Math.min(100, r.pct))}%"></span></span>` : ""}</div>`,
      )
      .join("\n                ");
    nut = `<details class="dz-card dz-acc-item">
              <summary><span class="dz-acc-item__title"><span class="dz-acc-item__ic"><i class="ri-leaf-line"></i></span>ارزش غذایی</span><i class="ri-arrow-down-s-line dz-acc-item__chev"></i></summary>
              <div class="dz-acc-item__body">
                ${
                  n.calories != null || macros
                    ? `<div class="dz-nut-hero">
                  <div class="dz-nut-hero__cal"><span class="dz-nut-hero__icon"><i class="ri-sun-line"></i></span><div><div class="dz-nut-hero__n dz-num">${n.calories != null ? fa(n.calories) : ""}</div><div class="dz-faint" style="font-size:.78rem">کیلوکالری در هر ۱۰۰ گرم</div></div></div>
                  <div class="dz-nut-macros">
                    ${macros}
                  </div>
                </div>`
                    : ""
                }
                ${rows}
                ${n.note ? `<p class="dz-nut-note">${esc(n.note)}</p>` : ""}
              </div>
            </details>`;
  }

  const care = c.care.length
    ? `<details class="dz-card dz-acc-item">
              <summary><span class="dz-acc-item__title"><span class="dz-acc-item__ic"><i class="ri-shield-check-line"></i></span>نگهداری و فرآوری</span><i class="ri-arrow-down-s-line dz-acc-item__chev"></i></summary>
              <div class="dz-acc-item__body">
                <div class="dz-careinfo">
                  ${c.care
                    .map(
                      (r) =>
                        `<div class="dz-carerow"><span class="dz-carerow__ic"><i class="${esc(r.icon ?? "ri-archive-line")}"></i></span><div><div class="dz-carerow__t">${esc(r.title)}</div><div class="dz-carerow__s">${esc(r.text)}</div></div></div>`,
                    )
                    .join("\n                  ")}
                </div>
              </div>
            </details>`
    : "";

  return `<!-- ویژگی‌ها و مشخصات -->
        <section class="dz-sec" id="sec-specs" data-screen-label="ویژگی‌ها و مشخصات">
          <div class="dz-sec__head"><span class="dz-sec__kicker">جزئیات</span><h2 class="dz-sec__title">ویژگی‌ها و مشخصات</h2></div>
          <div class="dz-acc">
            ${specGrid}
            ${nut}
            ${care}
          </div>
        </section>`;
}

/* ───────────── related ───────────── */
function relatedSection(d: PdpData): string {
  if (!d.related.length) return "";
  const cards = d.related
    .map((p: PdpRelated) => {
      const badge = p.badge ? `<span class="dz-pdp-badge dz-pdp-badge--clay"><i class="ri-trophy-line"></i> ${esc(p.badge)}</span>` : "";
      const media = p.image
        ? `<div class="dz-relcard__media" style="position:relative"><img src="${esc(p.image)}" alt="${esc(p.title)}" style="inline-size:100%;block-size:100%;object-fit:cover">${badge}</div>`
        : `<div class="dz-ph dz-relcard__media"><span class="dz-ph__label">${esc(p.title)}</span>${badge}</div>`;
      const price = p.priceToman
        ? `<span class="dz-price-sm dz-num">${grp(p.priceToman)} <span class="dz-toman"></span></span>`
        : `<span class="dz-price-sm">تماس بگیرید</span>`;
      return `<a class="dz-card dz-relcard" href="/products/${esc(p.slug)}" style="text-decoration:none;color:inherit">${media}<div class="dz-relcard__body"><h4 class="dz-relcard__name">${esc(p.title)}</h4><div class="dz-relcard__foot">${price}<span class="dz-relcard__add" aria-hidden="true"><i class="ri-arrow-left-line"></i></span></div></div></a>`;
    })
    .join("\n            ");
  return `<!-- محصولات مرتبط -->
        <section class="dz-sec" id="sec-related" data-screen-label="محصولات مرتبط">
          <div class="dz-sec__head"><span class="dz-sec__kicker">شاید بپسندید</span><h2 class="dz-sec__title">محصولات مرتبط</h2></div>
          <div class="dz-rel-scroll">
            ${cards}
          </div>
        </section>`;
}

/* ───────────── reviews ───────────── */
function reviewItem(r: PdpReview, extra: boolean): string {
  let stars = "";
  for (let i = 0; i < 5; i++) stars += `<i class="${i < r.rating ? "ri-star-fill" : "ri-star-line dz-off"}"></i>`;
  const verified = r.verified ? ` <span class="dz-pdp-badge dz-pdp-badge--sm"><i class="ri-check-line"></i> خرید تأییدشده</span>` : "";
  const rec = r.recommend ? `<div class="dz-review-foot"><span class="dz-review-rec"><i class="ri-check-line"></i> این محصول را توصیه می‌کنم</span></div>` : "";
  return `<div class="dz-card dz-review${extra ? " dz-is-extra" : ""}"><div class="dz-review__head"><span class="dz-review__av">${esc(r.initial)}</span><div class="dz-review__meta"><div class="dz-review__name">${esc(r.name)}${verified}</div><div class="dz-review__sub">${esc(r.meta)}</div></div><span class="dz-stars">${stars}</span></div><p class="dz-review__text">${esc(r.text)}</p>${rec}</div>`;
}

function reviewsSection(d: PdpData): string {
  const hasReviews = d.reviews.length > 0;
  const head = hasReviews
    ? `<div class="dz-card dz-rev-head">
            <div class="dz-rev-head__score"><div class="dz-rev-head__big dz-num">${fa(d.ratingShown ?? 0)}</div><span class="dz-stars"><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i></span><div class="dz-faint" style="font-size:.78rem;margin-block-start:.25rem">از ${fa(d.numReviews)} دیدگاه</div></div>
            ${
              d.recommendPercent != null
                ? `<div class="dz-rev-head__rec"><i class="ri-checkbox-circle-fill" style="font-size:1.25rem"></i><div><b class="dz-num" style="font-size:1.25rem">٪${fa(d.recommendPercent)}</b><div class="dz-faint" style="font-size:.72rem">پیشنهاد خریداران</div></div></div>`
                : ""
            }
            <div class="dz-rev-head__bars">
              ${[5, 4, 3, 2, 1]
                .map((star, i) => {
                  const count = d.reviewHistogram[i] ?? 0;
                  const pct = d.reviews.length ? Math.round((count / d.reviews.length) * 100) : 0;
                  return `<div class="dz-rev-bar"><span class="dz-num">${fa(star)}</span><i class="ri-star-fill" style="color:var(--color-dz-gold);font-size:.7rem"></i><span class="dz-rev-bar__track"><span style="inline-size:${pct}%"></span></span><span class="dz-num dz-faint">${fa(count)}</span></div>`;
                })
                .join("\n              ")}
            </div>
          </div>`
    : "";
  const list = hasReviews
    ? d.reviews.map((r, i) => reviewItem(r, i >= 2)).join("\n            ")
    : `<div class="dz-card" style="padding:1.4rem;text-align:center;color:var(--color-dz-text-faint)">هنوز دیدگاهی برای این محصول ثبت نشده است. اولین نفر باشید!</div>`;
  const extraCount = Math.max(0, d.reviews.length - 2);
  const toggle = `<button type="button" class="dz-button dz-button--ghost" data-rev-toggle><span class="dz-lbl">نمایش ${fa(extraCount)} دیدگاه دیگر</span> <i class="ri-arrow-down-s-line"></i></button>`;
  return `<!-- دیدگاه‌ها -->
        <section class="dz-sec" id="sec-reviews" data-screen-label="دیدگاه خریداران">
          <div class="dz-sec__head"><span class="dz-sec__kicker">نظرِ خریداران</span><h2 class="dz-sec__title">دیدگاه خریداران</h2></div>
          ${head}
          <div class="dz-reviews-list" id="reviewsList">
            ${list}
          </div>
          <div class="dz-rev-actions">
            ${toggle}
            <button type="button" class="dz-button" data-rev-formbtn><i class="ri-add-line"></i> ثبت دیدگاه</button>
          </div>
          <form class="dz-card dz-form" data-rev-form hidden>
            <h4>دیدگاه خود را بنویسید</h4>
            <div class="dz-form__row"><input class="dz-input" name="name" placeholder="نام شما"><div class="dz-form-rate-wrap"><span class="dz-faint" style="font-size:.8rem">امتیاز شما</span><span class="dz-form-rate" data-rate><i data-v="1"></i><i data-v="2"></i><i data-v="3"></i><i data-v="4"></i><i data-v="5"></i></span></div></div>
            <textarea class="dz-input" name="text" placeholder="تجربه‌تان از این محصول را بنویسید…"></textarea>
            <label class="dz-checkrow"><input type="checkbox" name="rec" checked> این محصول را به دیگران توصیه می‌کنم</label>
            <div class="dz-form__actions"><button type="submit" class="dz-button"><i class="ri-check-line"></i> ثبت دیدگاه</button><button type="button" class="dz-button dz-button--ghost" data-rev-cancel>انصراف</button></div>
          </form>
          <div class="dz-thanks" data-rev-thanks hidden><i class="ri-checkbox-circle-fill"></i> با تشکر! دیدگاه‌تان ثبت شد و پس از بررسی منتشر می‌شود.</div>
        </section>`;
}

/* ───────────── Q&A ───────────── */
function qaSection(d: PdpData): string {
  const items = d.questions.length
    ? d.questions
        .map((q: PdpQuestion, i: number) => {
          const answer = q.aText
            ? `<div class="dz-qa__a"><span class="dz-qa__av"><i class="ri-check-line"></i></span><div style="min-inline-size:0"><div class="dz-qa__by dz-qa__by--expert"><b>${esc(q.aBy ?? "کارشناس دشت‌زاد")}</b><span class="dz-pdp-badge dz-pdp-badge--sm"><i class="ri-check-line"></i> پاسخ رسمی</span></div><p class="dz-qa__atext">${esc(q.aText)}</p></div></div>`
            : "";
          return `<div class="dz-card dz-qa${i >= 2 ? " dz-is-extra" : ""}"><div class="dz-qa__q"><span class="dz-qa__mark">؟</span><div style="min-inline-size:0"><p class="dz-qa__qt">${esc(q.qText)}</p><div class="dz-qa__qsub">${esc(q.qMeta)}</div></div></div>${answer}</div>`;
        })
        .join("\n            ")
    : `<div class="dz-card" style="padding:1.4rem;text-align:center;color:var(--color-dz-text-faint)">هنوز پرسشی ثبت نشده است. اولین پرسش را شما بپرسید!</div>`;
  const extraCount = Math.max(0, d.questions.length - 2);
  const toggle = `<button type="button" class="dz-button dz-button--ghost dz-button--block" data-q-toggle style="margin-block-start:.9rem"><span class="dz-lbl">نمایش ${fa(extraCount)} پرسش دیگر</span> <i class="ri-arrow-down-s-line"></i></button>`;
  return `<!-- پرسش و پاسخ -->
        <section class="dz-sec" id="sec-qa" data-screen-label="پرسش‌های خریداران">
          <div class="dz-sec__head"><span class="dz-sec__kicker">پیش از خرید بپرسید</span><h2 class="dz-sec__title">پرسش‌های خریداران</h2></div>
          <div class="dz-card dz-qa-head">
            <div class="dz-qa-head__lead"><span class="dz-qa-head__ic"><i class="ri-questionnaire-line"></i></span><div><b class="dz-qa-head__t">پرسش‌های خریداران</b><div class="dz-faint" style="font-size:.8rem;margin-block-start:.1rem"><span class="dz-num" data-q-count data-q-count-n="${d.questionCount}">${fa(d.questionCount)}</span> پرسش درباره این محصول</div></div></div>
            <button class="dz-button" data-q-formbtn><i class="ri-add-line"></i> پرسش خود را بپرسید</button>
          </div>
          <div class="dz-thanks" data-q-thanks hidden><i class="ri-checkbox-circle-fill"></i> با تشکر! پرسش شما ثبت شد؛ به‌محض پاسخ، با پیامک خبر می‌دهیم.</div>
          <form class="dz-card dz-form" data-q-form hidden>
            <h4>پرسش خود را بپرسید</h4>
            <div class="dz-form__row"><input class="dz-input" name="name" placeholder="نام شما"><input class="dz-input" name="phone" type="tel" inputmode="numeric" placeholder="شماره تماس" style="direction:ltr;text-align:right"></div>
            <textarea class="dz-input" name="text" placeholder="سؤال‌تان درباره این محصول را بنویسید…"></textarea>
            <p class="dz-note"><i class="ri-phone-line"></i> به‌محض ثبت پاسخ، با پیامک به شماره‌ی شما اطلاع می‌دهیم.</p>
            <div class="dz-form__actions"><button type="submit" class="dz-button"><i class="ri-check-line"></i> ثبت پرسش</button><button type="button" class="dz-button dz-button--ghost" data-q-cancel>انصراف</button></div>
          </form>
          <div class="dz-qa-list" id="qaList">
            ${items}
          </div>
          ${toggle}
        </section>`;
}

/* ───────────── FAQ ───────────── */
function faqSection(d: PdpData): string {
  if (!d.content.faq.length) return "";
  const items = d.content.faq
    .map(
      (f, i) =>
        `<details class="dz-faq-item" name="dz-faq"${i === 0 ? " open" : ""}><summary><span class="dz-faq-item__q"><span class="dz-faq-item__mark">؟</span><span class="dz-faq-item__qt">${esc(f.q)}</span></span><span class="dz-faq-item__toggle" aria-hidden="true"><i class="ri-add-line"></i></span></summary><div class="dz-faq-item__a">${esc(f.a)}</div></details>`,
    )
    .join("\n            ");
  return `<!-- سؤالات متداول -->
        <section class="dz-sec" id="sec-faq" data-screen-label="سؤالات متداول">
          <div class="dz-sec__head"><span class="dz-sec__kicker">پیش از خرید بدانید</span><h2 class="dz-sec__title">سؤالات متداول</h2></div>
          <div class="dz-faq-wrap">
            ${items}
          </div>
        </section>`;
}

/* ───────────── assemble ───────────── */
export function buildPdpMarkup(d: PdpData): string {
  const desc = descSection(d);
  const specs = specsSection(d);
  const related = relatedSection(d);
  const reviews = reviewsSection(d);
  const qa = qaSection(d);
  const faq = faqSection(d);

  const present: { id: string; label: string }[] = [];
  if (desc) present.push({ id: "sec-desc", label: "توضیح محصول" });
  if (specs) present.push({ id: "sec-specs", label: "ویژگی‌ها" });
  if (related) present.push({ id: "sec-related", label: "محصولات مرتبط" });
  if (reviews) present.push({ id: "sec-reviews", label: "دیدگاه‌ها" });
  if (qa) present.push({ id: "sec-qa", label: "پرسش‌ها" });
  if (faq) present.push({ id: "sec-faq", label: "سؤالات" });

  const sectionsOpen = `<!-- ===== PAGE SECTIONS ===== -->
      <div class="dz-pdp-sections">

        ${sectabs(present)}

        ${TRUSTBAND}`;
  const sectionsClose = `
      </div>
    </div>`;

  const assembled = [
    breadcrumb(d),
    MAIN_OPEN_ORIG,
    BANNERS_ORIG,
    GRID_OPEN_ORIG,
    infoCard(d),
    sectionsOpen,
    desc,
    specs,
    related,
    reviews,
    qa,
    faq,
    sectionsClose,
    BUYBOX_ORIG,
    MOBILEBAR_ORIG,
    OVERLAYS_ORIG,
  ].join("\n\n");
  return assembled.split(DEMO_TITLE).join(d.title);
}

/** Gallery payload injected for the interaction script (real images). */
export function galleryPayload(d: PdpData): { url: string; label: string }[] {
  return d.images.map((im, i) => ({ url: im.url, label: im.alt || `${d.title} ${i + 1}` }));
}

export type { PdpContent };
