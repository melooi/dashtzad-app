// AUTO-EXTRACTED interactive script from wp/preview/single-product.html (verified).
// Phase 1 (copy): executed verbatim after mount. Phase 2 rebuilds into React hooks.
/* eslint-disable */
export const PDP_SCRIPT = `
(function () {
  'use strict';
  var FA = '۰۱۲۳۴۵۶۷۸۹';
  function toFa(n) { return Number(n).toLocaleString('en-US').replace(/[0-9]/g, function (d) { return FA[+d]; }).replace(/,/g, '٬'); }
  function pad2Fa(n) { return String(n).padStart(2, '0').replace(/[0-9]/g, function (d) { return FA[+d]; }); }
  var CASH_RATE = 3;
  var pdp = document.querySelector('.dz-pdp');
  var LAST_PRICE = 0, qval = 1, CART_COUNT = 0;
  try { CART_COUNT = parseInt(localStorage.getItem('dz_cart_count') || '0', 10) || 0; } catch (e) {}

  /* ---- simple state (locked to available) ---- */
  function setState(s) {
    pdp.setAttribute('data-state', s);
    recalc();
  }

  /* ---- weight + packaging ---- */
  var wsel = document.getElementById('wsel'), pkgsel = document.getElementById('pkgsel');
  function selectIn(container, sel, btn) { container.querySelectorAll(sel).forEach(function (el) { el.classList.remove('is-active'); }); btn.classList.add('is-active'); }
  if (wsel) wsel.addEventListener('click', function (e) { var b = e.target.closest('.dz-wsel__opt'); if (!b) return; selectIn(wsel, '.dz-wsel__opt', b); recalc(); });
  if (pkgsel) pkgsel.addEventListener('click', function (e) { var b = e.target.closest('.dz-pkg-opt'); if (!b) return; selectIn(pkgsel, '.dz-pkg-opt', b); recalc(); });

  function recalc() {
    var w = wsel && wsel.querySelector('.dz-wsel__opt.is-active');
    if (!w) return;
    var pk = pkgsel && pkgsel.querySelector('.dz-pkg-opt.is-active');
    var extra = pk ? +pk.dataset.extra : 0;
    var price = +w.dataset.price + extra, old = +w.dataset.old + extra;
    var off = Math.round((1 - (+w.dataset.price) / (+w.dataset.old)) * 100);
    var profit = old - price;
    var cashTotal = Math.round(price * (1 - CASH_RATE / 100) / 1000) * 1000;
    pdp.querySelectorAll('[data-price-final]').forEach(function (el) { el.textContent = toFa(price); });
    pdp.querySelectorAll('[data-price-old]').forEach(function (el) { el.innerHTML = toFa(old) + ' <span class="dz-toman"></span>'; });
    pdp.querySelectorAll('[data-price-off]').forEach(function (el) { el.textContent = '٪' + toFa(off); });
    pdp.querySelectorAll('[data-price-profit]').forEach(function (el) { el.textContent = toFa(profit); });
    var cs = pdp.querySelector('[data-cash-save]'); if (cs) cs.textContent = toFa(price - cashTotal);
    LAST_PRICE = price;
    var grams = +w.dataset.grams || 0;
    var unit = grams ? Math.round((+w.dataset.price) / grams * 100) : 0;
    var wlabel = w.querySelector('.dz-wsel__label').textContent.trim();
    pdp.querySelectorAll('[data-price-unit]').forEach(function (el) { el.textContent = toFa(unit); });
    pdp.querySelectorAll('[data-buybar-unit]').forEach(function (el) { el.textContent = toFa(unit); });
    pdp.querySelectorAll('[data-buybar-weight]').forEach(function (el) { el.textContent = wlabel; });
    var ul = pdp.querySelector('.dz-buybox__unitline'); if (ul) ul.style.display = grams > 0 ? '' : 'none';
  }

  /* ---- qty ---- */
  var qty = document.getElementById('qty'), qn = qty.querySelector('.dz-qty__n');
  qty.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; qval = b.dataset.q === 'inc' ? Math.min(99, qval + 1) : Math.max(1, qval - 1); qn.textContent = toFa(qval); });

  /* ---- like ---- */
  var likeBtn = document.getElementById('likeBtn');
  likeBtn.addEventListener('click', function () { var on = likeBtn.classList.toggle('is-on'); likeBtn.querySelector('i').className = on ? 'ri-heart-3-fill' : 'ri-heart-3-line'; });

  /* ---- cash nudge ---- */
  var cash = document.getElementById('cashNudge');
  cash.addEventListener('click', function () { cash.classList.toggle('is-open'); });

  /* ---- notify/contact mini forms ---- */
  function wireForm(inputId, btnId, okId) {
    var input = document.getElementById(inputId), btn = document.getElementById(btnId), ok = document.getElementById(okId);
    function valid() { return (input.value.match(/[0-9۰-۹]/g) || []).length >= 10; }
    function sync() { btn.disabled = !valid(); }
    input.addEventListener('input', sync); sync();
    btn.addEventListener('click', function () { if (valid()) ok.classList.add('is-on'); });
  }
  wireForm('notifyInput', 'notifyBtn', 'notifyOk');
  wireForm('contactInput', 'contactBtn', 'contactOk');

  /* ---- packaging modal ---- */
  var modal = document.getElementById('pkgModal');
  var pkgModalBtn = document.getElementById('pkgModalBtn');
  var pkgModalClose = document.getElementById('pkgModalClose');
  if (pkgModalBtn && modal) pkgModalBtn.addEventListener('click', function () { modal.classList.add('is-open'); });
  if (pkgModalClose && modal) pkgModalClose.addEventListener('click', function () { modal.classList.remove('is-open'); });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('is-open'); });

  /* ---- countdown ---- */
  var KEY = 'dz_sale_end', WINDOW_MS = 6 * 3600 * 1000;
  function readEnd() { var e = parseInt(localStorage.getItem(KEY) || '0', 10); if (!e || e < Date.now()) { e = Date.now() + WINDOW_MS; try { localStorage.setItem(KEY, String(e)); } catch (x) {} } return e; }
  var saleEnd = readEnd();
  var cdH = document.querySelector('[data-cd="h"]'), cdM = document.querySelector('[data-cd="m"]'), cdS = document.querySelector('[data-cd="s"]');
  function tick() { var diff = saleEnd - Date.now(); if (diff <= 0) { saleEnd = readEnd(); diff = saleEnd - Date.now(); } cdH.textContent = pad2Fa(Math.floor(diff / 3600000)); cdM.textContent = pad2Fa(Math.floor((diff % 3600000) / 60000)); cdS.textContent = pad2Fa(Math.floor((diff % 60000) / 1000)); }
  tick(); setInterval(tick, 1000);

  /* ---- gallery ---- */
  var GALLERY = (window.__PDP_GALLERY && window.__PDP_GALLERY.length) ? window.__PDP_GALLERY : [{ label: 'نمای کلی محصول' }];
  var galIdx = 0, lbIdx = 0, lbOpen = false;
  var galMain = document.getElementById('galMain'), galThumbs = document.getElementById('galThumbs'), galCounter = document.getElementById('galCounter');
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg'), lbThumbs = document.getElementById('lbThumbs'), lbCaption = document.getElementById('lbCaption');
  function slideHTML(item) { return item.url ? '<img src="' + item.url + '" alt="' + (item.label || '') + '" style="inline-size:100%;block-size:100%;object-fit:cover">' : '<span class="dz-ph__label">' + item.label + '</span>'; }
  function thumbHTML(item) { return item.url ? '<img src="' + item.url + '" alt="" style="inline-size:100%;block-size:100%;object-fit:cover">' : '<span class="dz-thumb__lbl">' + item.label + '</span>'; }
  function renderGal(i) { galIdx = (i + GALLERY.length) % GALLERY.length; galMain.innerHTML = slideHTML(GALLERY[galIdx]); galCounter.textContent = toFa(galIdx + 1) + ' / ' + toFa(GALLERY.length); galThumbs.querySelectorAll('.dz-thumb').forEach(function (t, k) { t.classList.toggle('is-active', k === galIdx); }); }
  GALLERY.forEach(function (item, k) { var b = document.createElement('button'); b.className = 'dz-thumb' + (k === 0 ? ' is-active' : ''); b.type = 'button'; b.innerHTML = thumbHTML(item); b.addEventListener('click', function () { renderGal(k); }); galThumbs.appendChild(b); });
  renderGal(0);
  document.getElementById('galPrev').addEventListener('click', function () { renderGal(galIdx - 1); });
  document.getElementById('galNext').addEventListener('click', function () { renderGal(galIdx + 1); });
  galMain.addEventListener('click', function () { openLb(galIdx); });
  document.getElementById('galZoom').addEventListener('click', function (e) { e.stopPropagation(); openLb(galIdx); });
  function renderLb(i) { lbIdx = (i + GALLERY.length) % GALLERY.length; lbImg.innerHTML = slideHTML(GALLERY[lbIdx]); lbCaption.textContent = GALLERY[lbIdx].label + ' · ' + toFa(lbIdx + 1) + '/' + toFa(GALLERY.length); lbThumbs.querySelectorAll('.dz-lightbox__thumb').forEach(function (t, k) { t.classList.toggle('is-active', k === lbIdx); }); }
  function openLb(i) { renderLb(i); lb.classList.add('is-open'); lbOpen = true; }
  function closeLb() { lb.classList.remove('is-open'); lbOpen = false; renderGal(lbIdx); }
  GALLERY.forEach(function (item, k) { var b = document.createElement('button'); b.className = 'dz-lightbox__thumb dz-ph'; b.type = 'button'; b.innerHTML = thumbHTML(item); b.addEventListener('click', function () { renderLb(k); }); lbThumbs.appendChild(b); });
  document.getElementById('lbPrev').addEventListener('click', function () { renderLb(lbIdx - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { renderLb(lbIdx + 1); });
  document.getElementById('lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb || (e.target.classList && e.target.classList.contains('dz-lightbox__stage'))) closeLb(); });
  document.addEventListener('keydown', function (e) { if (!lbOpen) return; if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowLeft') renderLb(lbIdx + 1); else if (e.key === 'ArrowRight') renderLb(lbIdx - 1); });

  /* ---- add to cart ---- */
  var cartOk = document.getElementById('cartOk'), addSheet = document.getElementById('addSheet');
  function syncCartCount() { document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = toFa(CART_COUNT); }); }
  syncCartCount();
  function addToCart() {
    cartOk.classList.add('is-on'); clearTimeout(window.__ok); window.__ok = setTimeout(function () { cartOk.classList.remove('is-on'); }, 2200);
    CART_COUNT += qval; try { localStorage.setItem('dz_cart_count', String(CART_COUNT)); } catch (e) {} syncCartCount();
    var w = wsel && wsel.querySelector('.dz-wsel__opt.is-active'), pk = pkgsel && pkgsel.querySelector('.dz-pkg-opt.is-active');
    if (w) document.querySelector('[data-cart-weight]').textContent = w.querySelector('.dz-wsel__label').textContent.trim();
    if (pk) document.querySelector('[data-cart-pkg]').textContent = pk.querySelector('.dz-pkg-opt__l').textContent.trim();
    document.querySelector('[data-cart-qty]').textContent = toFa(qval);
    document.querySelector('[data-cart-price]').textContent = toFa(LAST_PRICE * qval);
    addSheet.classList.add('is-on'); clearTimeout(window.__sheet); window.__sheet = setTimeout(function () { addSheet.classList.remove('is-on'); }, 7000);
  }
  document.getElementById('ctaBtn').addEventListener('click', addToCart);
  document.getElementById('addSheetClose').addEventListener('click', function () { addSheet.classList.remove('is-on'); });
  document.getElementById('addSheetCont').addEventListener('click', function () { addSheet.classList.remove('is-on'); });

  /* ---- sticky buy bar ---- */
  var buybar = document.getElementById('buybar'), buybox = document.querySelector('.dz-buybox');
  document.querySelectorAll('[data-bar-add]').forEach(function (b) { b.addEventListener('click', addToCart); });
  document.querySelectorAll('[data-bar-scroll]').forEach(function (b) { b.addEventListener('click', function () { window.scrollTo({ top: Math.max(0, buybox.getBoundingClientRect().top + window.scrollY - 80), behavior: 'smooth' }); }); });
  if ('IntersectionObserver' in window) { new IntersectionObserver(function (entries) { entries.forEach(function (en) { buybar.classList.toggle('is-on', !en.isIntersecting); }); }, { threshold: 0 }).observe(buybox); }

  /* ---- section tabs scroll-spy ---- */
  var tabsNav = document.getElementById('sectabs');
  var tabLinks = [].slice.call(tabsNav.querySelectorAll('.dz-sectab'));
  var targets = tabLinks.map(function (a) { return document.querySelector(a.getAttribute('data-target')); });
  function headerOffset() { return tabsNav.offsetHeight + 70; }
  tabLinks.forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var t = document.querySelector(a.getAttribute('data-target')); window.scrollTo({ top: Math.max(0, t.getBoundingClientRect().top + window.scrollY - headerOffset()), behavior: 'smooth' }); }); });
  var queued = false;
  function spy() { queued = false; var line = headerOffset() + 14, act = 0; for (var i = 0; i < targets.length; i++) { if (targets[i] && targets[i].getBoundingClientRect().top - line <= 0) act = i; } tabLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === act); }); }
  window.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(spy); } }, { passive: true });
  spy();

  /* ---- helpful + related toast ---- */
  var toast = document.getElementById('toast'), toastMsg = document.getElementById('toastMsg');
  function showToast(msg) { toastMsg.textContent = msg; toast.classList.add('is-on'); clearTimeout(window.__t); window.__t = setTimeout(function () { toast.classList.remove('is-on'); }, 2200); }
  document.addEventListener('click', function (e) {
    var h = e.target.closest('[data-helpful]');
    if (h) { var on = h.classList.toggle('is-on'); var base = +h.getAttribute('data-base'); h.querySelector('.dz-num').textContent = '(' + toFa(base + (on ? 1 : 0)) + ')'; h.querySelector('i').className = on ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'; return; }
    var a = e.target.closest('[data-add]'); if (a) showToast('«' + a.getAttribute('data-add') + '» به سبد افزوده شد');
  });

  /* ---- reviews expand + form ---- */
  (function () {
    var sec = document.getElementById('sec-reviews'), list = document.getElementById('reviewsList');
    var toggle = sec.querySelector('[data-rev-toggle]'), formBtn = sec.querySelector('[data-rev-formbtn]'), form = sec.querySelector('[data-rev-form]'), thanks = sec.querySelector('[data-rev-thanks]');
    var extra = list.querySelectorAll('.dz-review.dz-is-extra').length;
    if (!extra) toggle.style.display = 'none';
    toggle.addEventListener('click', function () { var exp = list.classList.toggle('is-expanded'); toggle.querySelector('.dz-lbl').textContent = exp ? 'نمایش کمتر' : ('نمایش ' + toFa(extra) + ' دیدگاه دیگر'); toggle.querySelector('i').style.transform = exp ? 'rotate(180deg)' : 'none'; });
    formBtn.addEventListener('click', function () { form.hidden = !form.hidden; });
    form.querySelector('[data-rev-cancel]').addEventListener('click', function () { form.hidden = true; });
    var rate = form.querySelector('[data-rate]'), rateVal = 5;
    function paint(v) { rate.querySelectorAll('i').forEach(function (st, i) { st.className = i < v ? 'ri-star-fill' : 'ri-star-line'; }); }
    paint(rateVal);
    rate.addEventListener('click', function (e) { var st = e.target.closest('i'); if (!st) return; rateVal = +st.dataset.v; paint(rateVal); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]').value.trim(), text = form.querySelector('[name="text"]').value.trim();
      if (!name || !text) return;
      var rec = form.querySelector('[name="rec"]').checked, stars = '';
      for (var i = 0; i < 5; i++) stars += '<i class="' + (i < rateVal ? 'ri-star-fill' : 'ri-star-line dz-off') + '"></i>';
      var el = document.createElement('div'); el.className = 'dz-card dz-review';
      el.innerHTML = '<div class="dz-review__head"><span class="dz-review__av">' + name.charAt(0) + '</span><div class="dz-review__meta"><div class="dz-review__name">' + name + ' <span class="dz-pdp-badge dz-pdp-badge--sm"><i class="ri-check-line"></i> خرید تأییدشده</span></div><div class="dz-review__sub">همین حالا</div></div><span class="dz-stars">' + stars + '</span></div><p class="dz-review__text">' + text + '</p>' + (rec ? '<div class="dz-review-foot"><span class="dz-review-rec"><i class="ri-check-line"></i> این محصول را توصیه می‌کنم</span></div>' : '');
      list.insertBefore(el, list.firstChild);
      form.reset(); rateVal = 5; paint(5); form.hidden = true; thanks.hidden = false;
      clearTimeout(window.__rt); window.__rt = setTimeout(function () { thanks.hidden = true; }, 6000);
    });
  })();

  /* ---- questions expand + form ---- */
  (function () {
    var sec = document.getElementById('sec-qa'), list = document.getElementById('qaList');
    var toggle = sec.querySelector('[data-q-toggle]'), formBtn = sec.querySelector('[data-q-formbtn]'), form = sec.querySelector('[data-q-form]'), thanks = sec.querySelector('[data-q-thanks]');
    var extra = list.querySelectorAll('.dz-qa.dz-is-extra').length;
    if (!extra) toggle.style.display = 'none';
    toggle.addEventListener('click', function () { var exp = list.classList.toggle('is-expanded'); toggle.querySelector('.dz-lbl').textContent = exp ? 'نمایش کمتر' : ('نمایش ' + toFa(extra) + ' پرسش دیگر'); toggle.querySelector('i').style.transform = exp ? 'rotate(180deg)' : 'none'; });
    formBtn.addEventListener('click', function () { form.hidden = !form.hidden; });
    form.querySelector('[data-q-cancel]').addEventListener('click', function () { form.hidden = true; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]').value.trim(), phone = form.querySelector('[name="phone"]').value.trim(), text = form.querySelector('[name="text"]').value.trim();
      if (!name || !phone || !text) return;
      var el = document.createElement('div'); el.className = 'dz-card dz-qa';
      el.innerHTML = '<div class="dz-qa__q"><span class="dz-qa__mark">؟</span><div style="min-inline-size:0"><p class="dz-qa__qt">' + text + '</p><div class="dz-qa__qsub">' + name + ' · همین حالا</div></div></div><div class="dz-note"><i class="ri-phone-line"></i> پرسش شما ثبت شد؛ کارشناسان دشت‌زاد به‌زودی پاسخ می‌دهند.</div>';
      list.insertBefore(el, list.firstChild);
      form.reset(); form.hidden = true; thanks.hidden = false;
      clearTimeout(window.__qt); window.__qt = setTimeout(function () { thanks.hidden = true; }, 6000);
      var c = sec.querySelector('[data-q-count]'); if (c) { var n = (+c.getAttribute('data-q-count-n') || 3) + 1; c.setAttribute('data-q-count-n', n); document.querySelectorAll('[data-q-count]').forEach(function (el) { el.textContent = toFa(n); }); }
    });
  })();

  /* ---- init ---- */
  setState('available');
})();
`;
