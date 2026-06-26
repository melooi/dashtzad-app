// AUTO-EXTRACTED from wp/preview/single-product.html (verified pixel-perfect, available state).
// Phase 1 (copy): rendered as-is via dangerouslySetInnerHTML. Phase 2 rebuilds into JSX components.
/* eslint-disable */
export const PDP_MARKUP = `
<!-- ===== BREADCRUMB ===== -->
<nav class="dz-crumb" aria-label="مسیر صفحه">
  <ol class="dz-crumb__list">
    <li><a href="#"><i class="dz-icon ri-home-line dz-icon--sm"></i> خانه</a></li>
    <li class="dz-crumb__sep" aria-hidden="true"><i class="dz-icon ri-arrow-left-s-line dz-icon--sm"></i></li>
    <li><a href="#">فروشگاه</a></li>
    <li class="dz-crumb__sep" aria-hidden="true"><i class="dz-icon ri-arrow-left-s-line dz-icon--sm"></i></li>
    <li><a href="#">خشکبار</a></li>
    <li class="dz-crumb__sep" aria-hidden="true"><i class="dz-icon ri-arrow-left-s-line dz-icon--sm"></i></li>
    <li aria-current="page">برگه گلابی خشک ممتاز</li>
  </ol>
</nav>

<main class="dz-pdp" data-state="available" data-screen-label="صفحهٔ محصول">

  <!-- ===== STATE BANNERS ===== -->
  <div class="dz-pdp-banner dz-pdp-banner--clay dz-when-flex" data-when="unavailable">
    <span class="dz-pdp-banner__ic"><i class="ri-inbox-unarchive-line"></i></span>
    <div class="dz-pdp-banner__body"><b class="dz-pdp-banner__title">متأسفیم، فعلاً تمام کردیم!</b><p class="dz-pdp-banner__text">«برگه گلابی خشک ممتاز» در حال حاضر موجود نیست. شماره‌ات را ثبت کن تا به‌محض شارژ مجدد، اولین نفر باخبر شوی.</p></div>
    <span class="dz-pdp-badge dz-pdp-badge--clay dz-pdp-banner__chip"><i class="ri-archive-line"></i> ناموجود</span>
  </div>

  <div class="dz-pdp-countdown dz-when-flex" data-when="special">
    <div class="dz-pdp-countdown__lead">
      <span class="dz-pdp-countdown__ic"><i class="ri-flashlight-fill"></i></span>
      <div><b class="dz-pdp-countdown__title">فروش ویژه</b><p class="dz-pdp-countdown__sub">تا پایان شمارش معکوس، فرصت خرید با این قیمت را از دست ندهید.</p></div>
    </div>
    <div class="dz-pdp-countdown__clock">
      <div class="dz-pdp-countdown__unit"><span class="dz-pdp-countdown__digit" data-cd="h">۰۰</span><span class="dz-pdp-countdown__lbl">ساعت</span></div>
      <span class="dz-pdp-countdown__sep">:</span>
      <div class="dz-pdp-countdown__unit"><span class="dz-pdp-countdown__digit" data-cd="m">۰۰</span><span class="dz-pdp-countdown__lbl">دقیقه</span></div>
      <span class="dz-pdp-countdown__sep">:</span>
      <div class="dz-pdp-countdown__unit"><span class="dz-pdp-countdown__digit" data-cd="s">۰۰</span><span class="dz-pdp-countdown__lbl">ثانیه</span></div>
    </div>
  </div>

  <div class="dz-pdp-banner dz-pdp-banner--gold dz-when-flex" data-when="bestseller">
    <span class="dz-pdp-banner__ic"><i class="ri-trophy-line"></i></span>
    <div class="dz-pdp-banner__body"><b class="dz-pdp-banner__title">پرفروش‌ترین محصول این فصل</b><p class="dz-pdp-banner__text">بیش از ۱٬۸۶۰ خرید موفق و امتیاز ۴٫۸ از مشتریان دشت‌زاد؛ انتخاب محبوب این روزها.</p></div>
    <span class="dz-pdp-badge dz-pdp-badge--gold dz-pdp-banner__chip"><i class="ri-trophy-line"></i> پرفروش</span>
  </div>

  <div class="dz-pdp-banner dz-pdp-banner--green dz-when-flex" data-when="new">
    <span class="dz-pdp-banner__ic"><i class="ri-magic-line"></i></span>
    <div class="dz-pdp-banner__body"><b class="dz-pdp-banner__title">تازه به دشت‌زاد اضافه شد!</b><p class="dz-pdp-banner__text">«برگه گلابی خشک ممتاز» جدیدترین محصول باغ ماست؛ اولین نفری باش که طعمش را می‌چشد.</p></div>
    <span class="dz-pdp-badge dz-pdp-badge--green dz-pdp-banner__chip"><i class="ri-magic-line"></i> محصول جدید</span>
  </div>

  <div class="dz-pdp-banner dz-pdp-banner--clay dz-when-flex" data-when="discounted">
    <span class="dz-pdp-banner__ic"><i class="ri-price-tag-3-line"></i></span>
    <div class="dz-pdp-banner__body"><b class="dz-pdp-banner__title">این محصول هم‌اکنون با تخفیف عرضه می‌شود</b><p class="dz-pdp-banner__text">فرصت خرید «برگه گلابی خشک ممتاز» با قیمت ویژه تا پایان موجودی انبار.</p></div>
    <span class="dz-pdp-badge dz-pdp-badge--clay dz-pdp-banner__chip"><i class="ri-price-tag-3-line"></i> تخفیف‌دار</span>
  </div>

  <div class="dz-pdp-banner dz-pdp-banner--neutral dz-when-flex" data-when="contact">
    <span class="dz-pdp-banner__ic"><i class="ri-customer-service-2-line"></i></span>
    <div class="dz-pdp-banner__body"><b class="dz-pdp-banner__title">این محصول به‌صورت سفارشی و عمده عرضه می‌شود</b><p class="dz-pdp-banner__text">برای استعلام قیمت و ثبت سفارش، با کارشناس فروش دشت‌زاد تماس بگیرید.</p></div>
    <span class="dz-pdp-badge dz-pdp-badge--ink dz-pdp-banner__chip"><i class="ri-phone-line"></i> قیمت تلفنی</span>
  </div>

  <div class="dz-pdp-banner dz-pdp-banner--neutral dz-when-flex" data-when="discontinued">
    <span class="dz-pdp-banner__ic"><i class="ri-forbid-line"></i></span>
    <div class="dz-pdp-banner__body"><b class="dz-pdp-banner__title">این محصول دیگر تولید نمی‌شود</b><p class="dz-pdp-banner__text">عرضه «برگه گلابی خشک ممتاز» متوقف شده است؛ می‌توانید محصولات مشابه را ببینید.</p></div>
    <span class="dz-pdp-badge dz-pdp-badge--ink dz-pdp-banner__chip"><i class="ri-forbid-line"></i> متوقف شد</span>
  </div>

  <!-- ===== GRID ===== -->
  <div class="dz-pdp__grid">
    <div class="dz-pdp__main">

      <!-- ===== INFO CARD (info + gallery) ===== -->
      <div class="dz-pdp-info">
        <div class="dz-pdp-info__body">
          <div class="dz-pdp-head">
            <div style="min-inline-size:0">
              <h1 class="dz-pdp-head__title">برگه گلابی خشک ممتاز</h1>
              <div class="dz-pdp-head__latin">Premium Sun-Dried Pear Slices</div>
            </div>
            <div class="dz-pdp-head__actions">
              <button class="dz-pdp-iconbtn" id="likeBtn" aria-label="علاقه‌مندی"><i class="ri-heart-3-line"></i></button>
              <button class="dz-pdp-iconbtn" aria-label="اشتراک‌گذاری"><i class="ri-share-line"></i></button>
            </div>
          </div>

          <div class="dz-pdp-meta">
            <span class="dz-pdp-meta__item">کد کالا: <b class="dz-latin">DZ-PEAR-۲۶</b></span>
            <span class="dz-pdp-meta__sep"></span>
            <span class="dz-pdp-meta__item"><i class="ri-star-fill dz-pdp-meta__star"></i> <span class="dz-num">۴٫۸</span> امتیاز</span>
            <span class="dz-pdp-meta__sep"></span>
            <span class="dz-pdp-meta__item"><span class="dz-num">۱۲۴</span> دیدگاه</span>
            <span class="dz-pdp-meta__sep"></span>
            <span class="dz-pdp-meta__item"><span class="dz-num" data-q-count data-q-count-n="3">۳</span> پرسش</span>
          </div>

          <div class="dz-pdp-info__sect">
            <label class="dz-pdp-info__lbl">وزن بسته</label>
            <div class="dz-wsel" id="wsel">
              <button class="dz-wsel__opt" data-wid="w250" data-grams="250" data-price="198000" data-old="240000">
                <span class="dz-wsel__off dz-num">٪۱۸</span>
                <span class="dz-wsel__label">۲۵۰ گرم</span>
                <span class="dz-wsel__now dz-num">۱۹۸٬۰۰۰ <span class="dz-toman"></span></span>
                <span class="dz-wsel__unit">هر ۱۰۰گ <b class="dz-num">۷۹٬۲۰۰</b></span>
              </button>
              <button class="dz-wsel__opt is-active" data-wid="w500" data-grams="500" data-price="372000" data-old="460000">
                <span class="dz-wsel__pop">پرفروش</span>
                <span class="dz-wsel__off dz-num">٪۱۹</span>
                <span class="dz-wsel__label">۵۰۰ گرم</span>
                <span class="dz-wsel__now dz-num">۳۷۲٬۰۰۰ <span class="dz-toman"></span></span>
                <span class="dz-wsel__unit">هر ۱۰۰گ <b class="dz-num">۷۴٬۴۰۰</b></span>
              </button>
              <button class="dz-wsel__opt" data-wid="w1000" data-grams="1000" data-price="690000" data-old="880000">
                <span class="dz-wsel__pop dz-wsel__pop--save">به‌صرفه</span>
                <span class="dz-wsel__off dz-num">٪۲۲</span>
                <span class="dz-wsel__label">۱ کیلوگرم</span>
                <span class="dz-wsel__now dz-num">۶۹۰٬۰۰۰ <span class="dz-toman"></span></span>
                <span class="dz-wsel__unit">هر ۱۰۰گ <b class="dz-num">۶۹٬۰۰۰</b></span>
              </button>
            </div>
          </div>

          <div class="dz-pdp-info__sect">
            <div class="dz-pdp-info__sect-head">
              <label class="dz-pdp-info__lbl">بسته‌بندی</label>
              <button class="dz-pdp-link" id="pkgModalBtn">مشاهده بسته‌بندی‌ها</button>
            </div>
            <div class="dz-pkgsel" id="pkgsel">
              <button class="dz-pkg-opt is-active" data-pid="zip" data-extra="0"><span class="dz-pkg-opt__l">زیپ‌کیپ کرافت</span><span class="dz-pkg-opt__n">درب‌دار، ماندگاری بالا</span></button>
              <button class="dz-pkg-opt" data-pid="tin" data-extra="45000"><span class="dz-pkg-opt__l">قوطی هدیه</span><span class="dz-pkg-opt__n">+۴۵٬۰۰۰ تومان</span></button>
            </div>
          </div>

          <div class="dz-pdp-info__sect">
            <h4 class="dz-pdp-info__sect-h">ویژگی‌های اصلی</h4>
            <div class="dz-pdp-feat">
              <span class="dz-chip"><span class="dz-faint">برند:</span> <b>دشت‌زاد</b></span>
              <span class="dz-chip"><span class="dz-faint">مبدأ:</span> <b>دماوند</b></span>
              <span class="dz-chip"><span class="dz-faint">ماندگاری:</span> <b>۱۲ ماه</b></span>
              <span class="dz-chip"><i class="ri-leaf-line"></i> <b>ارگانیک</b></span>
              <span class="dz-chip"><i class="ri-box-3-line"></i> <b>بدون شکر</b></span>
              <span class="dz-chip"><i class="ri-medal-2-line"></i> <b>حلال</b></span>
            </div>
          </div>
        </div>

        <!-- gallery -->
        <div class="dz-pdp-gallery">
          <div class="dz-pdp-gallery__frame">
            <button class="dz-pdp-gallery__nav dz-pdp-gallery__nav--prev" id="galPrev" type="button" aria-label="قبلی"><i class="ri-arrow-right-s-line"></i></button>
            <button class="dz-pdp-gallery__nav dz-pdp-gallery__nav--next" id="galNext" type="button" aria-label="بعدی"><i class="ri-arrow-left-s-line"></i></button>
            <div class="dz-ph dz-pdp-gallery__img" id="galMain"><span class="dz-ph__label">نمای کلی محصول</span></div>
            <span class="dz-pdp-gallery__counter dz-num" id="galCounter">۱ / ۵</span>
            <button class="dz-pdp-gallery__zoom" id="galZoom" type="button" aria-label="بزرگ‌نمایی"><i class="ri-fullscreen-line"></i></button>
            <div class="dz-pdp-gallery__badges">
              <span class="dz-pdp-badge dz-pdp-badge--clay" data-when="available special"><i class="ri-medal-line"></i> ممتاز</span>
              <span class="dz-pdp-badge dz-pdp-badge--gold" data-when="available new"><i class="ri-leaf-line"></i> طعم شیرین</span>
              <span class="dz-pdp-badge dz-pdp-badge--clay" data-when="unavailable"><i class="ri-archive-line"></i> ناموجود</span>
              <span class="dz-pdp-badge dz-pdp-badge--gold" data-when="bestseller"><i class="ri-fire-line"></i> پرطرفدار</span>
              <span class="dz-pdp-badge dz-pdp-badge--green" data-when="new"><i class="ri-magic-line"></i> جدید</span>
              <span class="dz-pdp-badge dz-pdp-badge--clay" data-when="discounted"><i class="ri-price-tag-3-line"></i> تخفیف‌دار</span>
              <span class="dz-pdp-badge dz-pdp-badge--ink" data-when="contact"><i class="ri-customer-service-2-line"></i> استعلام قیمت</span>
              <span class="dz-pdp-badge dz-pdp-badge--ink" data-when="discontinued"><i class="ri-forbid-line"></i> تولید متوقف شد</span>
            </div>
            <div class="dz-pdp-gallery__overlay dz-when-grid" data-when="unavailable"><span class="dz-pdp-gallery__overlay-pill"><i class="ri-archive-line"></i> ناموجود</span></div>
            <div class="dz-pdp-gallery__overlay dz-when-grid" data-when="discontinued"><span class="dz-pdp-gallery__overlay-pill"><i class="ri-forbid-line"></i> تولید این محصول متوقف شد</span></div>
          </div>
          <div class="dz-pdp-gallery__thumbs" id="galThumbs"></div>
          <div class="dz-freeship"><i class="ri-truck-line"></i> <span>تا <b class="dz-num">۳۷۸٬۰۰۰</b> <span class="dz-toman"></span> دیگر تا ارسالِ رایگان</span></div>
        </div>
      </div>

      <!-- ===== PAGE SECTIONS ===== -->
      <div class="dz-pdp-sections">

        <nav class="dz-sectabs" id="sectabs" aria-label="بخش‌های صفحه">
          <a class="dz-sectab" href="#sec-desc" data-target="#sec-desc">توضیح محصول</a>
          <a class="dz-sectab" href="#sec-specs" data-target="#sec-specs">ویژگی‌ها</a>
          <a class="dz-sectab" href="#sec-related" data-target="#sec-related">محصولات مرتبط</a>
          <a class="dz-sectab" href="#sec-reviews" data-target="#sec-reviews">دیدگاه‌ها</a>
          <a class="dz-sectab" href="#sec-qa" data-target="#sec-qa">پرسش‌ها</a>
          <a class="dz-sectab" href="#sec-faq" data-target="#sec-faq">سؤالات</a>
        </nav>

        <div class="dz-trustband">
          <div class="dz-trustband__item"><span class="dz-trustband__ic"><i class="ri-truck-line"></i></span><div><div class="dz-trustband__t">ارسال سریع</div><div class="dz-trustband__s">تهران ۲۴ ساعته</div></div></div>
          <div class="dz-trustband__item"><span class="dz-trustband__ic"><i class="ri-shield-check-line"></i></span><div><div class="dz-trustband__t">ضمانت اصالت</div><div class="dz-trustband__s">تضمین کیفیت دشت‌زاد</div></div></div>
          <div class="dz-trustband__item"><span class="dz-trustband__ic"><i class="ri-arrow-go-back-line"></i></span><div><div class="dz-trustband__t">بازگشت ۷ روزه</div><div class="dz-trustband__s">بدون قید و شرط</div></div></div>
          <div class="dz-trustband__item"><span class="dz-trustband__ic"><i class="ri-phone-line"></i></span><div><div class="dz-trustband__t">پشتیبانی</div><div class="dz-trustband__s">همه‌روزه ۹ تا ۲۱</div></div></div>
        </div>

        <!-- توضیح محصول -->
        <section class="dz-sec" id="sec-desc" data-screen-label="توضیح محصول">
          <div class="dz-sec__head"><span class="dz-sec__kicker">درباره محصول</span><h2 class="dz-sec__title">توضیح محصول</h2></div>
          <div class="dz-pdesc">
            <div class="dz-pdesc__hero">
              <div class="dz-pdesc__text">
                <p class="dz-pdesc__lead">حلقه‌های نازکِ گلابیِ رسیده، خشک‌شده با گرمای ملایم — بدون شکر، بدون نگهدارنده.</p>
                <p class="dz-pdesc__p">گلابیِ شاه‌میوهٔ باغ‌های دماوند را در اوجِ رسیدگی می‌چینیم؛ همان‌جا که چهار نسل از خانوادهٔ دشت‌زاد از سال ۱۳۰۵ زمین را به دست خود بارور کرده‌اند. هر گلابی را به حلقه‌های نازک برش می‌زنیم و آرام، با گرمای ملایم، رطوبتش را می‌گیریم تا قند طبیعی و عطرش دست‌نخورده بماند.</p>
                <p class="dz-pdesc__p">نتیجه، برگه‌ای است لطیف و کمی چِرم‌مانند، با شیرینیِ آرام و رنگِ کهربایی روشن — میان‌وعده‌ای که با خیال راحت می‌توانید به کودکتان هم بدهید.</p>
                <ul class="dz-pdesc__bullets">
                  <li><i class="ri-checkbox-circle-line"></i> <span><b>بدون شکر، گوگرد و نگهدارنده</b> — صددرصد طبیعی</span></li>
                  <li><i class="ri-checkbox-circle-line"></i> <span>خشک‌شده با <b>گرمای ملایم</b> برای حفظِ عطر و رنگ</span></li>
                  <li><i class="ri-checkbox-circle-line"></i> <span>منبعِ طبیعیِ <b>فیبر و پتاسیم</b></span></li>
                  <li><i class="ri-checkbox-circle-line"></i> <span>مناسبِ میان‌وعدهٔ <b>کودک و بزرگسال</b></span></li>
                </ul>
                <div class="dz-pdesc__serve">
                  <span class="dz-pdesc__serve-h">پیشنهادِ خوردن:</span>
                  <span class="dz-serve-chip"><i class="ri-cup-line"></i> همراه چای</span>
                  <span class="dz-serve-chip"><i class="ri-cake-2-line"></i> میان‌وعده</span>
                  <span class="dz-serve-chip"><i class="ri-restaurant-line"></i> کنار پنیر</span>
                  <span class="dz-serve-chip"><i class="ri-ice-cream-line"></i> تزیین دسر</span>
                </div>
              </div>
            </div>

            <blockquote class="dz-pdesc__quote">
              <i class="ri-double-quotes-r dz-pdesc__quote-ic"></i>
              <div><p class="dz-pdesc__quote-text">هر حلقه، طعمِ همان گلابیِ تازهٔ سرِ درخت را دارد؛ فقط رطوبتش رفته و شیرینی‌اش مانده.</p><span class="dz-pdesc__quote-by">— از یادداشتِ ذائقهٔ کارگاهِ دشت‌زاد</span></div>
            </blockquote>

            <div class="dz-card dz-taste">
              <div class="dz-taste__head"><span class="dz-taste__ic"><i class="ri-restaurant-2-line"></i></span><div><b class="dz-taste__t">طعم و بافت</b><div class="dz-taste__s">پروفایلِ حسیِ این محصول</div></div></div>
              <div class="dz-taste__grid">
                <div class="dz-taste__row"><div class="dz-taste__top"><span>شیرینیِ طبیعی</span><span class="dz-faint">زیاد</span></div><span class="dz-taste__bar"><span style="inline-size:82%"></span></span></div>
                <div class="dz-taste__row"><div class="dz-taste__top"><span>عطر و رایحه</span><span class="dz-faint">قوی</span></div><span class="dz-taste__bar"><span style="inline-size:75%"></span></span></div>
                <div class="dz-taste__row"><div class="dz-taste__top"><span>نرمیِ بافت</span><span class="dz-faint">چِرم‌مانند</span></div><span class="dz-taste__bar"><span style="inline-size:55%"></span></span></div>
                <div class="dz-taste__row"><div class="dz-taste__top"><span>ترشیِ ملس</span><span class="dz-faint">کم</span></div><span class="dz-taste__bar"><span style="inline-size:20%"></span></span></div>
              </div>
            </div>

            <div class="dz-pdesc__hl">
              <div class="dz-card dz-hlcard"><span class="dz-hlcard__ic"><i class="ri-sun-line"></i></span><div><div class="dz-hlcard__t">خشک‌شده با گرمای ملایم</div><div class="dz-hlcard__s">بدون گوگرد و افزودنی، عطر طبیعی حفظ می‌شود.</div></div></div>
              <div class="dz-card dz-hlcard"><span class="dz-hlcard__ic"><i class="ri-seedling-line"></i></span><div><div class="dz-hlcard__t">مستقیم از باغ خانوادگی</div><div class="dz-hlcard__s">برداشت از باغ‌های دماوند، بدون واسطه.</div></div></div>
              <div class="dz-card dz-hlcard"><span class="dz-hlcard__ic"><i class="ri-heart-3-line"></i></span><div><div class="dz-hlcard__t">میان‌وعدهٔ سالم</div><div class="dz-hlcard__s">منبع فیبر و پتاسیم، مناسب کودک و بزرگسال.</div></div></div>
              <div class="dz-card dz-hlcard"><span class="dz-hlcard__ic"><i class="ri-archive-line"></i></span><div><div class="dz-hlcard__t">بسته‌بندی درب‌دار</div><div class="dz-hlcard__s">زیپ‌کیپ برای تازه‌ماندن تا آخرین حلقه.</div></div></div>
            </div>
          </div>
        </section>

        <!-- ویژگی‌ها و مشخصات -->
        <section class="dz-sec" id="sec-specs" data-screen-label="ویژگی‌ها و مشخصات">
          <div class="dz-sec__head"><span class="dz-sec__kicker">جزئیات</span><h2 class="dz-sec__title">ویژگی‌ها و مشخصات</h2></div>
          <div class="dz-acc">
            <details class="dz-card dz-acc-item" open>
              <summary><span class="dz-acc-item__title"><span class="dz-acc-item__ic"><i class="ri-archive-line"></i></span>مشخصات محصول</span><i class="ri-arrow-down-s-line dz-acc-item__chev"></i></summary>
              <div class="dz-acc-item__body">
                <div class="dz-specgrid">
                  <div class="dz-specitem"><span class="dz-specitem__ic"><i class="ri-leaf-line"></i></span><div><div class="dz-specitem__k">نوع محصول</div><div class="dz-specitem__v">میوه خشک طبیعی</div></div></div>
                  <div class="dz-specitem"><span class="dz-specitem__ic"><i class="ri-seedling-line"></i></span><div><div class="dz-specitem__k">مبدأ</div><div class="dz-specitem__v">باغ‌های دماوند، ایران</div></div></div>
                  <div class="dz-specitem"><span class="dz-specitem__ic"><i class="ri-sun-line"></i></span><div><div class="dz-specitem__k">روش فرآوری</div><div class="dz-specitem__v">خشک‌کردن با گرمای ملایم</div></div></div>
                  <div class="dz-specitem"><span class="dz-specitem__ic"><i class="ri-shield-check-line"></i></span><div><div class="dz-specitem__k">ماندگاری</div><div class="dz-specitem__v">۱۲ ماه در جای خشک و خنک</div></div></div>
                  <div class="dz-specitem"><span class="dz-specitem__ic"><i class="ri-check-line"></i></span><div><div class="dz-specitem__k">افزودنی</div><div class="dz-specitem__v">ندارد</div></div></div>
                  <div class="dz-specitem"><span class="dz-specitem__ic"><i class="ri-heart-3-line"></i></span><div><div class="dz-specitem__k">مناسب برای</div><div class="dz-specitem__v">گیاه‌خواران، بدون گلوتن</div></div></div>
                </div>
              </div>
            </details>
            <details class="dz-card dz-acc-item">
              <summary><span class="dz-acc-item__title"><span class="dz-acc-item__ic"><i class="ri-leaf-line"></i></span>ارزش غذایی</span><i class="ri-arrow-down-s-line dz-acc-item__chev"></i></summary>
              <div class="dz-acc-item__body">
                <div class="dz-nut-hero">
                  <div class="dz-nut-hero__cal"><span class="dz-nut-hero__icon"><i class="ri-sun-line"></i></span><div><div class="dz-nut-hero__n dz-num">۲۶۲</div><div class="dz-faint" style="font-size:.78rem">کیلوکالری در هر ۱۰۰ گرم</div></div></div>
                  <div class="dz-nut-macros">
                    <div class="dz-nut-macro"><div class="dz-nut-macro__n dz-num">۶۹٫۷</div><div class="dz-nut-macro__l">کربوهیدرات</div></div>
                    <div class="dz-nut-macro"><div class="dz-nut-macro__n dz-num">۷٫۵</div><div class="dz-nut-macro__l">فیبر</div></div>
                    <div class="dz-nut-macro"><div class="dz-nut-macro__n dz-num">۱٫۹</div><div class="dz-nut-macro__l">پروتئین</div></div>
                  </div>
                </div>
                <div class="dz-nut-row"><div class="dz-nut-row__top"><span class="dz-nut-row__l">کربوهیدرات</span><span class="dz-nut-row__v dz-num">۶۹٫۷ گرم</span></div><span class="dz-nut-bar"><span style="inline-size:25%"></span></span></div>
                <div class="dz-nut-row"><div class="dz-nut-row__top"><span class="dz-nut-row__l">قند طبیعی</span><span class="dz-nut-row__v dz-num">۶۲٫۲ گرم</span></div></div>
                <div class="dz-nut-row"><div class="dz-nut-row__top"><span class="dz-nut-row__l">فیبر غذایی</span><span class="dz-nut-row__v dz-num">۷٫۵ گرم</span></div><span class="dz-nut-bar"><span style="inline-size:30%"></span></span></div>
                <div class="dz-nut-row"><div class="dz-nut-row__top"><span class="dz-nut-row__l">پروتئین</span><span class="dz-nut-row__v dz-num">۱٫۹ گرم</span></div><span class="dz-nut-bar"><span style="inline-size:4%"></span></span></div>
                <div class="dz-nut-row"><div class="dz-nut-row__top"><span class="dz-nut-row__l">پتاسیم</span><span class="dz-nut-row__v dz-num">۵۳۳ میلی‌گرم</span></div><span class="dz-nut-bar"><span style="inline-size:15%"></span></span></div>
                <p class="dz-nut-note">بدون قند افزوده — تمام شیرینی از خودِ گلابی است.</p>
              </div>
            </details>
            <details class="dz-card dz-acc-item">
              <summary><span class="dz-acc-item__title"><span class="dz-acc-item__ic"><i class="ri-shield-check-line"></i></span>نگهداری و فرآوری</span><i class="ri-arrow-down-s-line dz-acc-item__chev"></i></summary>
              <div class="dz-acc-item__body">
                <div class="dz-careinfo">
                  <div class="dz-carerow"><span class="dz-carerow__ic"><i class="ri-scissors-cut-line"></i></span><div><div class="dz-carerow__t">زمان چیدن</div><div class="dz-carerow__s">اواخر تابستان، در اوج رسیدگی میوه روی درخت</div></div></div>
                  <div class="dz-carerow"><span class="dz-carerow__ic"><i class="ri-sun-line"></i></span><div><div class="dz-carerow__t">روش خشک‌کردن</div><div class="dz-carerow__s">با گرمای ملایم؛ بدون گوگرد و بدون افزودنی</div></div></div>
                  <div class="dz-carerow"><span class="dz-carerow__ic"><i class="ri-archive-line"></i></span><div><div class="dz-carerow__t">روش نگهداری</div><div class="dz-carerow__s">در ظرف دربسته، جای خشک و خنک و دور از نور مستقیم</div></div></div>
                  <div class="dz-carerow"><span class="dz-carerow__ic"><i class="ri-shield-check-line"></i></span><div><div class="dz-carerow__t">ماندگاری</div><div class="dz-carerow__s">۱۲ ماه از تاریخ بسته‌بندی</div></div></div>
                </div>
              </div>
            </details>
          </div>
        </section>

        <!-- محصولات مرتبط -->
        <section class="dz-sec" id="sec-related" data-screen-label="محصولات مرتبط">
          <div class="dz-sec__head"><span class="dz-sec__kicker">شاید بپسندید</span><h2 class="dz-sec__title">محصولات مرتبط</h2></div>
          <div class="dz-rel-scroll">
            <div class="dz-card dz-relcard"><div class="dz-ph dz-relcard__media"><span class="dz-ph__label">زردآلو خشک</span><span class="dz-pdp-badge dz-pdp-badge--clay"><i class="ri-trophy-line"></i> پرفروش</span></div><div class="dz-relcard__body"><h4 class="dz-relcard__name">برگه زردآلوی طلایی</h4><div style="display:flex;align-items:center;gap:.4rem"><span class="dz-stars" style="font-size:.78rem"><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i></span><span class="dz-faint dz-num" style="font-size:.75rem">۴٫۷</span></div><div class="dz-relcard__foot"><span class="dz-price-sm dz-num">۲۴۶٬۰۰۰ <span class="dz-toman"></span></span><button class="dz-relcard__add" data-add="برگه زردآلوی طلایی"><i class="ri-add-line"></i></button></div></div></div>
            <div class="dz-card dz-relcard"><div class="dz-ph dz-relcard__media"><span class="dz-ph__label">توت خشک</span><span class="dz-pdp-badge dz-pdp-badge--gold"><i class="ri-leaf-line"></i> تازه</span></div><div class="dz-relcard__body"><h4 class="dz-relcard__name">توت خشک سفید اعلا</h4><div style="display:flex;align-items:center;gap:.4rem"><span class="dz-stars" style="font-size:.78rem"><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i></span><span class="dz-faint dz-num" style="font-size:.75rem">۴٫۹</span></div><div class="dz-relcard__foot"><span class="dz-price-sm dz-num">۳۱۵٬۰۰۰ <span class="dz-toman"></span></span><button class="dz-relcard__add" data-add="توت خشک سفید اعلا"><i class="ri-add-line"></i></button></div></div></div>
            <div class="dz-card dz-relcard"><div class="dz-ph dz-relcard__media"><span class="dz-ph__label">انجیر خشک</span></div><div class="dz-relcard__body"><h4 class="dz-relcard__name">انجیر خشک پرک</h4><div style="display:flex;align-items:center;gap:.4rem"><span class="dz-stars" style="font-size:.78rem"><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i></span><span class="dz-faint dz-num" style="font-size:.75rem">۴٫۸</span></div><div class="dz-relcard__foot"><span class="dz-price-sm dz-num">۴۱۰٬۰۰۰ <span class="dz-toman"></span></span><button class="dz-relcard__add" data-add="انجیر خشک پرک"><i class="ri-add-line"></i></button></div></div></div>
            <div class="dz-card dz-relcard"><div class="dz-ph dz-relcard__media"><span class="dz-ph__label">آلوبخارا</span></div><div class="dz-relcard__body"><h4 class="dz-relcard__name">آلوبخارا بی‌هسته</h4><div style="display:flex;align-items:center;gap:.4rem"><span class="dz-stars" style="font-size:.78rem"><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i></span><span class="dz-faint dz-num" style="font-size:.75rem">۴٫۶</span></div><div class="dz-relcard__foot"><span class="dz-price-sm dz-num">۱۸۸٬۰۰۰ <span class="dz-toman"></span></span><button class="dz-relcard__add" data-add="آلوبخارا بی‌هسته"><i class="ri-add-line"></i></button></div></div></div>
            <div class="dz-card dz-relcard"><div class="dz-ph dz-relcard__media"><span class="dz-ph__label">خرما</span><span class="dz-pdp-badge dz-pdp-badge--clay"><i class="ri-trophy-line"></i> پرفروش</span></div><div class="dz-relcard__body"><h4 class="dz-relcard__name">خرمای مضافتی بم</h4><div style="display:flex;align-items:center;gap:.4rem"><span class="dz-stars" style="font-size:.78rem"><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i></span><span class="dz-faint dz-num" style="font-size:.75rem">۴٫۸</span></div><div class="dz-relcard__foot"><span class="dz-price-sm dz-num">۲۶۸٬۰۰۰ <span class="dz-toman"></span></span><button class="dz-relcard__add" data-add="خرمای مضافتی بم"><i class="ri-add-line"></i></button></div></div></div>
          </div>
        </section>

        <!-- دیدگاه‌ها -->
        <section class="dz-sec" id="sec-reviews" data-screen-label="دیدگاه خریداران">
          <div class="dz-sec__head"><span class="dz-sec__kicker">نظرِ خریداران</span><h2 class="dz-sec__title">دیدگاه خریداران</h2></div>
          <div class="dz-card dz-rev-head">
            <div class="dz-rev-head__score"><div class="dz-rev-head__big dz-num">۴٫۸</div><span class="dz-stars"><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i></span><div class="dz-faint" style="font-size:.78rem;margin-block-start:.25rem">از ۱۲۴ دیدگاه</div></div>
            <div class="dz-rev-head__rec"><i class="ri-checkbox-circle-fill" style="font-size:1.25rem"></i><div><b class="dz-num" style="font-size:1.25rem">٪۹۳</b><div class="dz-faint" style="font-size:.72rem">پیشنهاد خریداران</div></div></div>
            <div class="dz-rev-head__bars">
              <div class="dz-rev-bar"><span class="dz-num">۵</span><i class="ri-star-fill" style="color:var(--color-dz-gold);font-size:.7rem"></i><span class="dz-rev-bar__track"><span style="inline-size:77%"></span></span><span class="dz-num dz-faint">۹۶</span></div>
              <div class="dz-rev-bar"><span class="dz-num">۴</span><i class="ri-star-fill" style="color:var(--color-dz-gold);font-size:.7rem"></i><span class="dz-rev-bar__track"><span style="inline-size:15%"></span></span><span class="dz-num dz-faint">۱۹</span></div>
              <div class="dz-rev-bar"><span class="dz-num">۳</span><i class="ri-star-fill" style="color:var(--color-dz-gold);font-size:.7rem"></i><span class="dz-rev-bar__track"><span style="inline-size:5%"></span></span><span class="dz-num dz-faint">۶</span></div>
              <div class="dz-rev-bar"><span class="dz-num">۲</span><i class="ri-star-fill" style="color:var(--color-dz-gold);font-size:.7rem"></i><span class="dz-rev-bar__track"><span style="inline-size:2%"></span></span><span class="dz-num dz-faint">۲</span></div>
              <div class="dz-rev-bar"><span class="dz-num">۱</span><i class="ri-star-fill" style="color:var(--color-dz-gold);font-size:.7rem"></i><span class="dz-rev-bar__track"><span style="inline-size:1%"></span></span><span class="dz-num dz-faint">۱</span></div>
            </div>
          </div>
          <div class="dz-reviews-list" id="reviewsList">
            <div class="dz-card dz-review"><div class="dz-review__head"><span class="dz-review__av">م</span><div class="dz-review__meta"><div class="dz-review__name">مریم احمدی <span class="dz-pdp-badge dz-pdp-badge--sm"><i class="ri-check-line"></i> خرید تأییدشده</span></div><div class="dz-review__sub">تهران · ۲ هفته پیش</div></div><span class="dz-stars"><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i></span></div><p class="dz-review__text">واقعاً طعمش طبیعیه، اصلاً شیرینی مصنوعی نداره. بچه‌ها به‌جای پاستیل اینو می‌خورن. بسته‌بندیش هم تمیز و مرتب بود.</p><div class="dz-review-foot"><span class="dz-review-rec"><i class="ri-check-line"></i> این محصول را توصیه می‌کنم</span><button class="dz-helpful" data-helpful data-base="24"><i class="ri-thumb-up-line"></i> مفید بود <span class="dz-num">(۲۴)</span></button></div></div>
            <div class="dz-card dz-review dz-is-extra"><div class="dz-review__head"><span class="dz-review__av">ح</span><div class="dz-review__meta"><div class="dz-review__name">حسین رضایی <span class="dz-pdp-badge dz-pdp-badge--sm"><i class="ri-check-line"></i> خرید تأییدشده</span></div><div class="dz-review__sub">اصفهان · ۱ ماه پیش</div></div><span class="dz-stars"><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i></span></div><p class="dz-review__text">کیفیت برگه گلابی فوق‌العاده‌ست، نازک و خوش‌عطر. قوطی هدیه‌اش رو برای عید گرفتم، خیلی شیک بود.</p><div class="dz-review-foot"><span class="dz-review-rec"><i class="ri-check-line"></i> این محصول را توصیه می‌کنم</span><button class="dz-helpful" data-helpful data-base="18"><i class="ri-thumb-up-line"></i> مفید بود <span class="dz-num">(۱۸)</span></button></div></div>
            <div class="dz-card dz-review dz-is-extra"><div class="dz-review__head"><span class="dz-review__av">س</span><div class="dz-review__meta"><div class="dz-review__name">سحر موسوی <span class="dz-pdp-badge dz-pdp-badge--sm"><i class="ri-check-line"></i> خرید تأییدشده</span></div><div class="dz-review__sub">شیراز · ۱ ماه پیش</div></div><span class="dz-stars"><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-line dz-off"></i></span></div><p class="dz-review__text">خیلی خوب بود فقط کاش بسته ۱ کیلویی کمی ارزون‌تر بود. در کل از خریدم راضی‌ام و دوباره سفارش می‌دم.</p><div class="dz-review-foot"><span class="dz-review-rec"><i class="ri-check-line"></i> این محصول را توصیه می‌کنم</span><button class="dz-helpful" data-helpful data-base="9"><i class="ri-thumb-up-line"></i> مفید بود <span class="dz-num">(۹)</span></button></div></div>
          </div>
          <div class="dz-rev-actions">
            <button type="button" class="dz-button dz-button--ghost" data-rev-toggle><span class="dz-lbl">نمایش ۲ دیدگاه دیگر</span> <i class="ri-arrow-down-s-line"></i></button>
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
        </section>

        <!-- پرسش و پاسخ -->
        <section class="dz-sec" id="sec-qa" data-screen-label="پرسش‌های خریداران">
          <div class="dz-sec__head"><span class="dz-sec__kicker">پیش از خرید بپرسید</span><h2 class="dz-sec__title">پرسش‌های خریداران</h2></div>
          <div class="dz-card dz-qa-head">
            <div class="dz-qa-head__lead"><span class="dz-qa-head__ic"><i class="ri-questionnaire-line"></i></span><div><b class="dz-qa-head__t">پرسش‌های خریداران</b><div class="dz-faint" style="font-size:.8rem;margin-block-start:.1rem"><span class="dz-num" data-q-count data-q-count-n="3">۳</span> پرسش درباره این محصول</div></div></div>
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
            <div class="dz-card dz-qa"><div class="dz-qa__q"><span class="dz-qa__mark">؟</span><div style="min-inline-size:0"><p class="dz-qa__qt">طعمش بیشتر ترش است یا شیرین؟</p><div class="dz-qa__qsub">سمیرا کاظمی · ۲ هفته پیش</div></div></div><div class="dz-qa__a"><span class="dz-qa__av"><i class="ri-check-line"></i></span><div style="min-inline-size:0"><div class="dz-qa__by dz-qa__by--expert"><b>کارشناس دشت‌زاد</b><span class="dz-pdp-badge dz-pdp-badge--sm"><i class="ri-check-line"></i> پاسخ رسمی</span></div><p class="dz-qa__atext">طعم غالب، شیرینیِ ملایم است با ته‌مزه‌ای کمی ملس؛ چون تمام شیرینی از قند طبیعیِ خودِ گلابی می‌آید و هیچ شکری افزوده نشده.</p></div></div><div class="dz-review-foot"><span class="dz-review-rec"><i class="ri-check-line"></i> پاسخ تأییدشده</span><button class="dz-helpful" data-helpful data-base="19"><i class="ri-thumb-up-line"></i> مفید بود <span class="dz-num">(۱۹)</span></button></div></div>
            <div class="dz-card dz-qa"><div class="dz-qa__q"><span class="dz-qa__mark">؟</span><div style="min-inline-size:0"><p class="dz-qa__qt">برای کودک زیر دو سال مناسب است؟</p><div class="dz-qa__qsub">نگار محمدی · ۳ هفته پیش</div></div></div><div class="dz-qa__a dz-qa__a--user"><span class="dz-qa__av dz-qa__av--user">ز</span><div style="min-inline-size:0"><div class="dz-qa__by"><b>زهرا رحیمی</b><span class="dz-pdp-badge dz-pdp-badge--clay dz-pdp-badge--sm"><i class="ri-user-line"></i> خریدار</span></div><p class="dz-qa__atext">برای دختر ۱۸ ماهه‌ام می‌گیرم و خیالم راحته چون شکر و افزودنی نداره. فقط چون بافتش کمی سفت است ریز خردش می‌کنم که راحت بجوه و گلوگیر نشه.</p></div></div><div class="dz-review-foot"><span class="dz-review-rec" style="color:var(--color-dz-clay)"><i class="ri-user-line"></i> پاسخ یک خریدار</span><button class="dz-helpful" data-helpful data-base="12"><i class="ri-thumb-up-line"></i> مفید بود <span class="dz-num">(۱۲)</span></button></div></div>
            <div class="dz-card dz-qa dz-is-extra"><div class="dz-qa__q"><span class="dz-qa__mark">؟</span><div style="min-inline-size:0"><p class="dz-qa__qt">بسته یک کیلویی هم زیپ‌کیپ دارد؟</p><div class="dz-qa__qsub">کامران اسدی · ۱ ماه پیش</div></div></div><div class="dz-qa__a"><span class="dz-qa__av"><i class="ri-check-line"></i></span><div style="min-inline-size:0"><div class="dz-qa__by dz-qa__by--expert"><b>کارشناس دشت‌زاد</b><span class="dz-pdp-badge dz-pdp-badge--sm"><i class="ri-check-line"></i> پاسخ رسمی</span></div><p class="dz-qa__atext">بله، همه وزن‌ها از جمله بسته یک کیلوگرمی در بسته‌بندی زیپ‌کیپ کرافت درب‌دار ارسال می‌شوند تا تا آخرین حلقه تازه بماند.</p></div></div><div class="dz-review-foot"><span class="dz-review-rec"><i class="ri-check-line"></i> پاسخ تأییدشده</span><button class="dz-helpful" data-helpful data-base="7"><i class="ri-thumb-up-line"></i> مفید بود <span class="dz-num">(۷)</span></button></div></div>
          </div>
          <button type="button" class="dz-button dz-button--ghost dz-button--block" data-q-toggle style="margin-block-start:.9rem"><span class="dz-lbl">نمایش ۱ پرسش دیگر</span> <i class="ri-arrow-down-s-line"></i></button>
        </section>

        <!-- سؤالات متداول -->
        <section class="dz-sec" id="sec-faq" data-screen-label="سؤالات متداول">
          <div class="dz-sec__head"><span class="dz-sec__kicker">پیش از خرید بدانید</span><h2 class="dz-sec__title">سؤالات متداول</h2></div>
          <div class="dz-faq-wrap">
            <details class="dz-card dz-faq-item" open><summary>آیا این محصول شکر یا نگهدارنده دارد؟<i class="ri-arrow-down-s-line dz-faq-item__chev"></i></summary><div class="dz-faq-item__a">خیر. برگه گلابی دشت‌زاد فقط از گلابیِ تازه تهیه می‌شود؛ هیچ شکر افزوده، گوگرد یا نگهدارنده‌ای در آن به کار نرفته است. تمام شیرینی از قند طبیعی خودِ میوه است.</div></details>
            <details class="dz-card dz-faq-item"><summary>بهترین روش نگهداری چیست؟<i class="ri-arrow-down-s-line dz-faq-item__chev"></i></summary><div class="dz-faq-item__a">در ظرف دربسته و در جای خشک و خنک، دور از نور مستقیم آفتاب نگهداری کنید. بسته‌بندی زیپ‌کیپ کمک می‌کند تا تازگی و عطر محصول تا آخرین حلقه حفظ شود.</div></details>
            <details class="dz-card dz-faq-item"><summary>ارسال چقدر طول می‌کشد؟<i class="ri-arrow-down-s-line dz-faq-item__chev"></i></summary><div class="dz-faq-item__a">سفارش‌ها در تهران بین ۲۴ تا ۴۸ ساعت و در سایر شهرها ۲ تا ۴ روز کاری به دست شما می‌رسد. ارسال سفارش‌های بالای ۷۰۰٬۰۰۰ تومان رایگان است.</div></details>
            <details class="dz-card dz-faq-item"><summary>آیا امکان مرجوع کردن وجود دارد؟<i class="ri-arrow-down-s-line dz-faq-item__chev"></i></summary><div class="dz-faq-item__a">بله، تا ۷ روز پس از دریافت، در صورتی که بسته باز نشده باشد، می‌توانید کالا را مرجوع کنید و وجه آن به طور کامل بازگردانده می‌شود.</div></details>
          </div>
        </section>

      </div>
    </div>

    <!-- ===== BUY SIDEBAR ===== -->
    <aside class="dz-buybox">
      <div class="dz-buybox__row">
        <span class="dz-buybox__label">وضعیت محصول:</span>
        <span class="dz-buybox__value">
          <span data-when="available special bestseller new discounted">موجود در انبار</span>
          <span data-when="unavailable" style="color:var(--color-dz-clay)">ناموجود</span>
          <span data-when="contact" style="color:var(--color-dz-primary)">موجود — قیمت تلفنی</span>
          <span data-when="discontinued" style="color:var(--color-dz-text-muted)">تولید متوقف شده</span>
        </span>
      </div>
      <div class="dz-buybox__row dz-buybox__sect dz-buybox__sect--row">
        <span class="dz-buybox__label">زمان و هزینه ارسال:</span>
        <button class="dz-pdp-link" style="display:inline-flex;align-items:center;gap:.2rem">مشاهده <i class="ri-arrow-left-s-line"></i></button>
      </div>

      <div class="dz-stock dz-buybox__sect dz-when-flex" data-when="available special bestseller new discounted">
        <div class="dz-stock__row"><span class="dz-stock__left"><i class="ri-fire-fill"></i> تنها ۳ عدد باقی مانده!</span></div>
        <span class="dz-stock__bar"><span class="dz-stock__fill" style="inline-size:88%"></span></span>
        <span class="dz-stock__hint"><i class="ri-flashlight-fill"></i> رو به اتمام</span>
      </div>
      <div class="dz-ibox dz-buybox__sect dz-when-flex" data-when="unavailable">
        <span class="dz-ibox__ic dz-ibox__ic--clay"><i class="ri-archive-line"></i></span>
        <div><b class="dz-ibox__title">فعلاً تمام شد</b><p class="dz-ibox__text">این محصول پرطرفدار به‌زودی دوباره شارژ می‌شود.</p></div>
      </div>

      <div class="dz-buybox__row dz-buybox__sect dz-price--simple" data-when="available bestseller new">
        <span class="dz-buybox__label">قیمت:</span>
        <span class="dz-buybox__value"><span class="dz-num" data-price-final>۳۷۲٬۰۰۰</span> <span class="dz-toman"></span></span>
      </div>
      <div class="dz-price--discount dz-buybox__sect" data-when="special discounted">
        <div class="dz-buybox__row" style="padding-block:.4rem"><span class="dz-buybox__label">قیمت:</span><span class="dz-price__old dz-num" data-price-old>۴۶۰٬۰۰۰ <span class="dz-toman"></span></span></div>
        <div class="dz-buybox__row" style="padding-block:.4rem"><span class="dz-buybox__label">سود خرید شما:</span><span class="dz-buybox__value" style="color:var(--color-dz-primary)"><span class="dz-discount-chip dz-num" data-price-off>٪۱۹</span> <span class="dz-price__profit dz-num" data-price-profit>۸۸٬۰۰۰</span> <span class="dz-toman"></span></span></div>
        <div class="dz-buybox__row dz-price__total" style="border-block-start:var(--border-dz-hairline) solid var(--color-dz-border);padding-block-start:.7rem;margin-block-start:.25rem"><span class="dz-buybox__label">قیمت نهایی:</span><span class="dz-buybox__value"><span class="dz-num" data-price-final>۳۷۲٬۰۰۰</span> <span class="dz-toman"></span></span></div>
      </div>

      <div class="dz-buybox__unitline dz-when-flex" data-when="available special bestseller new discounted"><i class="ri-scales-3-line"></i> قیمت هر ۱۰۰ گرم: <b class="dz-num" data-price-unit>۷۴٬۴۰۰</b> <span class="dz-toman"></span></div>

      <!-- buy flow -->
      <div class="dz-buybox__sect dz-when-flex" data-when="available special bestseller new discounted" style="flex-direction:column;gap:.9rem">
        <div class="dz-buybox__row" style="padding-block:0">
          <span class="dz-buybox__label">تعداد</span>
          <div class="dz-qty" id="qty"><button data-q="inc" aria-label="افزایش"><i class="ri-add-line"></i></button><span class="dz-qty__n dz-num">۱</span><button data-q="dec" aria-label="کاهش"><i class="ri-subtract-line"></i></button></div>
        </div>
        <button class="dz-cash-nudge" id="cashNudge"><span class="dz-cash-nudge__teaser"><span class="dz-cash-nudge__spark">٪۳</span> تخفیف نقدی؟ بزن روی من</span><span class="dz-cash-nudge__open"><i class="ri-check-line"></i> هورا! <b class="dz-num" data-cash-save>۱۱٬۰۰۰</b> <span class="dz-toman"></span> ارزون‌تر شد</span></button>
        <button class="dz-button dz-button--block dz-when-iflex" data-when="available special bestseller new discounted" id="ctaBtn" style="min-block-size:3.25rem">
          <i class="ri-shopping-cart-2-line" data-when="available bestseller new"></i>
          <i class="ri-flashlight-fill" data-when="special"></i>
          <i class="ri-price-tag-3-line" data-when="discounted"></i>
          <span data-when="available bestseller new">افزودن به سبد خرید</span>
          <span data-when="special">خرید با قیمت ویژه</span>
          <span data-when="discounted">خرید با تخفیف</span>
        </button>
        <div class="dz-buybox__success" id="cartOk"><i class="ri-check-line"></i> به سبد افزوده شد</div>
      </div>

      <!-- notify (unavailable) -->
      <div class="dz-buybox__sect dz-col-gap dz-when-flex" data-when="unavailable">
        <label class="dz-ibox__title">موجود شد، خبرم کن</label>
        <div class="dz-form-ok" id="notifyOk"><i class="ri-check-line"></i> ثبت شد ✓ به‌محض موجود شدن با پیامک خبر می‌دهیم.</div>
        <div class="dz-form-fields dz-col-gap"><input class="dz-field" type="tel" inputmode="numeric" placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰" id="notifyInput"><button class="dz-button dz-button--block" id="notifyBtn"><i class="ri-phone-line"></i> به من اطلاع بده</button></div>
        <button class="dz-button dz-button--ghost dz-button--block"><i class="ri-stack-line"></i> محصولات مشابه</button>
      </div>

      <!-- contact -->
      <div class="dz-buybox__sect dz-col-gap dz-when-flex" data-when="contact">
        <div class="dz-ibox"><span class="dz-ibox__ic dz-ibox__ic--green"><i class="ri-customer-service-2-line"></i></span><div><b class="dz-ibox__title">قیمت تلفنی / فروش عمده</b><p class="dz-ibox__text">برای استعلام قیمت و ثبت سفارش این محصول، با کارشناس فروش تماس بگیرید.</p></div></div>
        <a class="dz-button dz-button--block" href="tel:02191300576"><i class="ri-phone-line"></i> تماس مستقیم با کارشناس</a>
        <div class="dz-phone-big dz-num">۰۲۱-۹۱۳۰۰۵۷۶</div>
        <div class="dz-form-ok" id="contactOk"><i class="ri-check-line"></i> ثبت شد ✓ کارشناس ما به‌زودی با شما تماس می‌گیرد.</div>
        <div class="dz-form-fields dz-col-gap"><input class="dz-field" type="tel" inputmode="numeric" placeholder="شماره موبایل شما" id="contactInput"><button class="dz-button dz-button--ghost dz-button--block" id="contactBtn"><i class="ri-customer-service-2-line"></i> درخواست تماس با من</button></div>
      </div>

      <!-- discontinued -->
      <div class="dz-buybox__sect dz-col-gap dz-when-flex" data-when="discontinued">
        <div class="dz-ibox"><span class="dz-ibox__ic dz-ibox__ic--neutral"><i class="ri-forbid-line"></i></span><div><b class="dz-ibox__title">به‌دنبال جایگزین هستید؟</b><p class="dz-ibox__text">عرضه این محصول متوقف شده است. این گزینه‌های مشابه را ببینید.</p></div></div>
        <button class="dz-button dz-button--block"><i class="ri-stack-line"></i> مشاهده محصولات جایگزین</button>
      </div>
    </aside>
  </div>

  <!-- ===== STICKY BUY BAR (موبایل) ===== -->
  <div class="dz-buybar" id="buybar">
    <div class="dz-buybar__info dz-when-flex" data-when="available special bestseller new discounted"><span class="dz-buybar__price"><span class="dz-num" data-price-final>۳۷۲٬۰۰۰</span> <span class="dz-toman"></span></span><span class="dz-buybar__sub"><span data-buybar-weight>۵۰۰ گرم</span> · هر ۱۰۰گ <b class="dz-num" data-buybar-unit>۷۴٬۴۰۰</b></span></div>
    <div class="dz-buybar__info dz-buybar__info--text dz-when-flex" data-when="unavailable"><b>فعلاً ناموجود</b><span>به‌زودی دوباره شارژ می‌شود</span></div>
    <div class="dz-buybar__info dz-buybar__info--text dz-when-flex" data-when="contact"><b>قیمت تلفنی</b><span>برای استعلام تماس بگیرید</span></div>
    <div class="dz-buybar__info dz-buybar__info--text dz-when-flex" data-when="discontinued"><b>تولید متوقف شد</b><span>گزینه‌های جایگزین را ببینید</span></div>
    <button type="button" class="dz-button dz-buybar__cta dz-when-iflex" data-when="available bestseller new" data-bar-add><i class="ri-shopping-cart-2-line"></i> افزودن به سبد</button>
    <button type="button" class="dz-button dz-buybar__cta dz-when-iflex" data-when="special" data-bar-add><i class="ri-flashlight-fill"></i> خرید ویژه</button>
    <button type="button" class="dz-button dz-buybar__cta dz-when-iflex" data-when="discounted" data-bar-add><i class="ri-price-tag-3-line"></i> خرید با تخفیف</button>
    <button type="button" class="dz-button dz-buybar__cta dz-when-iflex" data-when="unavailable" data-bar-scroll><i class="ri-notification-3-line"></i> خبرم کن</button>
    <a class="dz-button dz-buybar__cta dz-when-iflex" data-when="contact" href="tel:02191300576"><i class="ri-phone-line"></i> تماس با کارشناس</a>
    <button type="button" class="dz-button dz-button--ghost dz-buybar__cta dz-when-iflex" data-when="discontinued" data-bar-scroll><i class="ri-stack-line"></i> جایگزین‌ها</button>
  </div>
</main>

<!-- toast -->
<div class="dz-toast" id="toast"><i class="ri-check-line"></i> <span id="toastMsg">به سبد افزوده شد</span></div>

<!-- add-to-cart sheet -->
<div class="dz-addsheet" id="addSheet" role="status" aria-live="polite">
  <button class="dz-addsheet__x" id="addSheetClose" type="button" aria-label="بستن"><i class="ri-close-line"></i></button>
  <div class="dz-addsheet__head"><span class="dz-addsheet__check"><i class="ri-check-line"></i></span> به سبد خرید اضافه شد</div>
  <div class="dz-addsheet__item">
    <span class="dz-addsheet__thumb dz-ph" id="addThumb"><span class="dz-ph__label">تصویر</span></span>
    <div class="dz-addsheet__meta"><div class="dz-addsheet__name">برگه گلابی خشک ممتاز</div><div class="dz-addsheet__sub"><span data-cart-weight>۵۰۰ گرم</span> · <span data-cart-pkg>زیپ‌کیپ کرافت</span> · <span class="dz-num" data-cart-qty>۱</span> عدد</div></div>
    <span class="dz-addsheet__price"><span class="dz-num" data-cart-price>۳۷۲٬۰۰۰</span> <span class="dz-toman"></span></span>
  </div>
  <div class="dz-addsheet__count">سبد خرید شما: <b class="dz-num" data-cart-count>۰</b> کالا</div>
  <div class="dz-addsheet__actions"><button type="button" class="dz-button dz-button--ghost" id="addSheetCont">ادامه‌ی خرید</button><a class="dz-button" href="#">مشاهده سبد <i class="ri-arrow-left-line"></i></a></div>
</div>

<!-- lightbox -->
<div class="dz-lightbox" id="lightbox">
  <div class="dz-lightbox__top"><span class="dz-lightbox__title">برگه گلابی خشک ممتاز — گالری تصاویر</span><button class="dz-lightbox__close" id="lbClose" type="button" aria-label="بستن"><i class="ri-close-line"></i></button></div>
  <div class="dz-lightbox__stage"><button class="dz-lightbox__nav" id="lbPrev" type="button" aria-label="قبلی"><i class="ri-arrow-right-s-line"></i></button><div class="dz-ph dz-lightbox__img" id="lbImg"></div><button class="dz-lightbox__nav" id="lbNext" type="button" aria-label="بعدی"><i class="ri-arrow-left-s-line"></i></button></div>
  <div><div class="dz-lightbox__caption" id="lbCaption"></div><div class="dz-lightbox__thumbs" id="lbThumbs"></div></div>
</div>

<!-- packaging modal -->
<div class="dz-modal-scrim" id="pkgModal">
  <div class="dz-modal">
    <div class="dz-modal__head"><h4 class="dz-modal__title">بسته‌بندی‌ها</h4><button class="dz-pdp-iconbtn" id="pkgModalClose" aria-label="بستن"><i class="ri-close-line"></i></button></div>
    <div class="dz-modal__grid">
      <div class="dz-pkgcard"><div class="dz-ph dz-pkgcard__media"><span class="dz-ph__label">زیپ‌کیپ کرافت</span></div><b class="dz-pkgcard__t">زیپ‌کیپ کرافت</b><p class="dz-pkgcard__d">پاکتِ کرافتِ درب‌دار با زیپ؛ برای تازه‌ماندنِ محصول تا آخرین حلقه. انتخابِ پیش‌فرض.</p></div>
      <div class="dz-pkgcard"><div class="dz-ph dz-pkgcard__media"><span class="dz-ph__label">قوطی هدیه</span></div><b class="dz-pkgcard__t">قوطی هدیه</b><p class="dz-pkgcard__d">قوطیِ فلزیِ شیک، مناسبِ هدیه و مناسبت‌ها. <b>+۴۵٬۰۰۰ تومان</b></p></div>
    </div>
  </div>
</div>
`;
