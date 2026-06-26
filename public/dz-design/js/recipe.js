/* =============================================================================
 * Dashtzad — تعاملِ تک‌نوشتهٔ مجله/دستورِ غذا (recipe single).
 * نوارِ پیشرفت، ریلِ کناری، اسکرول‌اسپایِ فهرست، تیکِ مواد (ذخیره‌شونده)،
 * استپرِ نفرات (مقیاسِ مواد/هزینه)، پسندِ دستور، مودالِ مشارکت، نظرها،
 * ذخیرهٔ نوشته، اسلایدرِ محصولات، کپیِ پیوند. آیکون‌ها RemixIcon.
 * فقط روی صفحه‌ای اجرا می‌شود که .dz-recipe دارد.
 * ========================================================================== */
(function () {
  'use strict';
  var scope = document.querySelector('.dz-recipe');
  if (!scope) return;
  var CFG = window.dzRecipe || {};

  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var toFa = function (n) { return String(n).replace('.', '٫').replace(/[0-9]/g, function (d) { return FA[+d]; }); };
  var faGroup = function (n) { return Number(n).toLocaleString('en-US').replace(/,/g, '٬').replace(/[0-9]/g, function (d) { return FA[+d]; }); };
  var faToInt = function (s) { return parseInt(String(s).replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }), 10) || 0; };
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- reading progress + side rail ---------- */
  var bar = $('readBar'), prose = $('prose'), vrail = $('vrail'), vrailFill = $('vrailFill'), vrailDot = $('vrailDot');
  var tocLinks = [].slice.call(document.querySelectorAll('#toc a'));
  var targets = tocLinks.map(function (a) { var h = a.getAttribute('href'); return h && h[0] === '#' ? document.querySelector(h) : null; });
  function paintTOC() {
    var idx = 0;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < 200) idx = i; });
    tocLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === idx); });
  }
  function onScroll() {
    if (prose) {
      var rect = prose.getBoundingClientRect();
      var total = rect.height - window.innerHeight + 200;
      var passed = Math.min(Math.max(-rect.top + 200, 0), Math.max(total, 1));
      var pct = passed / Math.max(total, 1);
      if (bar) bar.style.width = (pct * 100) + '%';
      if (vrailFill) {
        vrailFill.style.height = (pct * 100) + '%';
        vrailDot.style.top = (pct * 100) + '%';
        vrail.classList.toggle('is-done', pct > 0.985);
        var rel = $('related');
        if (rel) vrail.classList.toggle('is-hidden', rel.getBoundingClientRect().top < window.innerHeight * 0.85);
      }
    }
    paintTOC();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- ingredient check (persisted) ---------- */
  var ING_KEY = 'dz_recipe_ing';
  function getIng() { try { return JSON.parse(localStorage.getItem(ING_KEY) || '[]'); } catch (e) { return []; } }
  function setIng(a) { try { localStorage.setItem(ING_KEY, JSON.stringify(a)); } catch (e) {} }
  (function () {
    var items = [].slice.call(document.querySelectorAll('#ingList li'));
    var saved = getIng();
    items.forEach(function (li, i) {
      if (saved.indexOf(i) !== -1) li.classList.add('is-checked');
      li.addEventListener('click', function () {
        li.classList.toggle('is-checked');
        var s = getIng();
        if (li.classList.contains('is-checked')) s.push(i); else s = s.filter(function (x) { return x !== i; });
        setIng(s.filter(function (v, k, arr) { return arr.indexOf(v) === k; }));
      });
    });
  })();

  /* ---------- servings stepper (scales amounts + cost) ---------- */
  (function () {
    var BASE = parseInt(CFG.servingsBase, 10) || 4, serv = BASE;
    var valEl = $('servVal'), minus = $('servMinus'), plus = $('servPlus');
    if (!valEl || !minus || !plus) return;
    var qtys = [].slice.call(document.querySelectorAll('.ing-qty[data-base]'));
    var costEl = $('recipeCost'), BASE_COST = parseInt(CFG.defaultCost, 10) || 320000;
    function render() {
      valEl.textContent = toFa(serv);
      minus.disabled = serv <= 1;
      plus.disabled = serv >= 20;
      qtys.forEach(function (q) {
        var base = parseFloat(q.dataset.base), unit = q.dataset.unit;
        var v = base * serv / BASE;
        v = (unit === 'عدد') ? Math.max(1, Math.round(v)) : Math.round(v * 2) / 2;
        q.textContent = toFa(v) + ' ' + unit;
      });
      if (costEl) {
        var c = Math.round(BASE_COST * serv / BASE / 1000) * 1000;
        costEl.innerHTML = 'حدود ' + faGroup(c) + ' <span class="toman-mark"></span>';
      }
    }
    minus.addEventListener('click', function () { if (serv > 1) { serv--; render(); } });
    plus.addEventListener('click', function () { if (serv < 20) { serv++; render(); } });
    render();
  })();

  /* ---------- recipe like (persisted) ---------- */
  (function () {
    var btn = $('recipeLike'), countEl = $('likeCount');
    if (!btn || !countEl) return;
    var KEY = 'dz_recipe_like', BASE = parseInt(CFG.likeBase, 10) || 1240;
    var liked = localStorage.getItem(KEY) === '1';
    function paint() {
      btn.classList.toggle('is-liked', liked);
      var ic = btn.querySelector('i'); if (ic) ic.className = liked ? 'ri-heart-fill' : 'ri-heart-line';
      countEl.textContent = faGroup(BASE + (liked ? 1 : 0));
    }
    btn.addEventListener('click', function () { liked = !liked; try { localStorage.setItem(KEY, liked ? '1' : '0'); } catch (e) {} paint(); });
    paint();
  })();

  /* ---------- contribute modal ---------- */
  (function () {
    var modal = $('contribModal'), openBtn = $('contribBtn'), form = $('contribForm'), success = $('contribSuccess');
    if (!modal || !openBtn) return;
    function open() { modal.hidden = false; if (form) form.hidden = false; if (success) success.hidden = true; document.body.style.overflow = 'hidden'; }
    function close() { modal.hidden = true; document.body.style.overflow = ''; }
    openBtn.addEventListener('click', open);
    modal.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
      var dc = $('discountCode'); if (dc) dc.textContent = (CFG.contribPrefix || 'DZ15') + '-' + rnd;
      form.hidden = true; if (success) success.hidden = false; form.reset();
    });
    var copyBtn = $('copyCode');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var code = ($('discountCode') || {}).textContent || '';
      if (navigator.clipboard) navigator.clipboard.writeText(code).catch(function () {});
      copyBtn.innerHTML = '<i class="ri-check-line"></i> کپی شد';
      setTimeout(function () { copyBtn.innerHTML = '<i class="ri-file-copy-line"></i> کپی'; }, 1600);
    });
  })();

  /* ---------- comments: rating + post + helpful ---------- */
  (function () {
    var stars = $('cmtStars'), list = $('cmtList'), countEl = $('cmtCount'), rating = 5;
    if (stars) {
      var btns = [].slice.call(stars.children);
      var paintStars = function () { btns.forEach(function (b, i) { b.classList.toggle('is-on', i < rating); }); };
      btns.forEach(function (b) { b.addEventListener('click', function () { rating = +b.dataset.v; paintStars(); }); });
      paintStars();
    }
    window.postComment = function (e) {
      e.preventDefault();
      var name = ($('cmtName').value || '').trim(), text = ($('cmtText').value || '').trim();
      if (!name || !text) return false;
      var starStr = '★'.repeat(rating) + '<span class="cmt__star-off">' + '★'.repeat(5 - rating) + '</span>';
      var el = document.createElement('article');
      el.className = 'cmt';
      el.innerHTML =
        '<span class="cmt__av">' + name.charAt(0) + '</span>' +
        '<div class="cmt__body"><div class="cmt__head">' +
        '<span class="cmt__name"></span>' +
        '<span class="cmt__stars">' + starStr + '</span>' +
        '<span class="cmt__date">همین الان</span></div>' +
        '<p class="cmt__text"></p>' +
        '<div class="cmt__actions"><button class="cmt__like" type="button"><i class="ri-thumb-up-line"></i> مفید بود (<span>۰</span>)</button>' +
        '<button class="cmt__reply" type="button"><i class="ri-reply-line"></i> پاسخ</button></div></div>';
      el.querySelector('.cmt__name').textContent = name;
      el.querySelector('.cmt__text').textContent = text;
      if (list) { list.insertBefore(el, list.firstChild); if (countEl) countEl.textContent = toFa(list.children.length); }
      var f = $('cmtForm'); if (f) f.reset();
      rating = 5; if (stars) [].slice.call(stars.children).forEach(function (b, i) { b.classList.toggle('is-on', i < 5); });
      return false;
    };
    if (list) list.addEventListener('click', function (e) {
      var b = e.target.closest('.cmt__like'); if (!b) return;
      var span = b.querySelector('span'); var n = faToInt(span.textContent);
      var on = b.classList.toggle('is-on'); n += on ? 1 : -1;
      span.textContent = toFa(n);
      var ic = b.querySelector('i'); if (ic) ic.className = on ? 'ri-thumb-up-fill' : 'ri-thumb-up-line';
    });
  })();

  /* ---------- bookmark (article + related cards, persisted) ---------- */
  var BM_KEY = 'dz_blog_bookmarks', ARTICLE_ID = (scope.dataset.articleId || 'single');
  function getBM() { try { return JSON.parse(localStorage.getItem(BM_KEY) || '[]'); } catch (e) { return []; } }
  function setBM(a) { try { localStorage.setItem(BM_KEY, JSON.stringify(a)); } catch (e) {} }
  (function () {
    var bmBtn = $('bmBtn');
    if (bmBtn) {
      var paintBM = function () {
        var on = getBM().indexOf(ARTICLE_ID) !== -1;
        bmBtn.classList.toggle('is-on', on);
        bmBtn.innerHTML = on ? '<i class="ri-bookmark-fill"></i> ذخیره شد' : '<i class="ri-bookmark-line"></i> ذخیره';
      };
      bmBtn.addEventListener('click', function () {
        var s = getBM();
        if (s.indexOf(ARTICLE_ID) !== -1) s = s.filter(function (x) { return x !== ARTICLE_ID; }); else s.push(ARTICLE_ID);
        setBM(s); paintBM();
      });
      paintBM();
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest('.bookmark'); if (!b || !scope.contains(b)) return;
      e.preventDefault();
      var s = getBM(), id = b.dataset.id;
      if (s.indexOf(id) !== -1) s = s.filter(function (x) { return x !== id; }); else s.push(id);
      setBM(s);
      var on = s.indexOf(id) !== -1;
      b.classList.toggle('is-on', on);
      var ic = b.querySelector('i'); if (ic) ic.className = on ? 'ri-bookmark-fill' : 'ri-bookmark-line';
    });
  })();

  /* ---------- related-products slider ---------- */
  (function () {
    var root = $('prodSlider'), track = $('psTrack');
    if (!root || !track) return;
    var slides = [].slice.call(track.children), dotsWrap = $('psDots'), i = 0, timer = null;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    slides.forEach(function (_, k) {
      var d = document.createElement('button');
      d.className = 'ps-dot' + (k === 0 ? ' is-active' : '');
      d.setAttribute('aria-label', 'محصول ' + (k + 1));
      d.addEventListener('click', function () { go(k, true); });
      if (dotsWrap) dotsWrap.appendChild(d);
    });
    var dots = dotsWrap ? [].slice.call(dotsWrap.children) : [];
    function render() {
      track.style.transform = 'translateX(' + (-i * 100) + '%)';
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
    }
    function go(n, manual) { i = (n + slides.length) % slides.length; render(); if (manual) restart(); }
    function restart() { if (reduce) return; clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 4500); }
    var nx = $('psNext'), pv = $('psPrev');
    if (nx) nx.addEventListener('click', function () { go(i + 1, true); });
    if (pv) pv.addEventListener('click', function () { go(i - 1, true); });
    root.addEventListener('mouseenter', function () { clearInterval(timer); });
    root.addEventListener('mouseleave', restart);
    render(); restart();
  })();

  /* ---------- copy link (global; used by inline onclick) ---------- */
  window.copyLink = function (el) {
    var restore = el.innerHTML;
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).catch(function () {});
    el.innerHTML = el.classList.contains('s-cp') ? '<i class="ri-check-line"></i> کپی شد' : '<i class="ri-check-line"></i>';
    setTimeout(function () { el.innerHTML = restore; }, 1600);
  };

  onScroll();
})();


/* ===== v2 interactions: buy popup, add-all, action bar, comments empty, aria-live ===== */
(function () {
  'use strict';
  var scope = document.querySelector('.dz-recipe'); if (!scope) return;
  var $ = function (id) { return document.getElementById(id); };

  /* buy popup (toast) */
  var pop, popT;
  function buyPop(msg) {
    if (!pop) {
      pop = document.createElement('div');
      pop.className = 'dz-buypop';
      pop.innerHTML = '<div class="dz-buypop__card"><span class="dz-buypop__ic"><i class="ri-check-line"></i></span><div class="dz-buypop__b"></div><button class="dz-buypop__go" type="button">مشاهدهٔ سبد</button></div>';
      scope.appendChild(pop);
    }
    pop.querySelector('.dz-buypop__b').innerHTML = msg;
    pop.classList.add('is-show');
    clearTimeout(popT); popT = setTimeout(function () { pop.classList.remove('is-show'); }, 2800);
  }

  /* add-to-cart on slider product cards -> popup */
  scope.addEventListener('click', function (e) {
    var add = e.target.closest('.prod-slider .dz-product-card__add'); if (!add) return;
    e.preventDefault();
    var card = add.closest('.dz-product-card');
    var nm = card ? card.querySelector('.dz-product-card__title') : null;
    buyPop(nm ? ('<b>' + nm.textContent.trim() + '</b> به سبد اضافه شد') : 'به سبد اضافه شد');
    add.classList.add('is-out'); setTimeout(function () { add.classList.remove('is-out'); }, 240);
  });

  /* add ALL ingredients */
  var addAll = $('addAllBtn');
  if (addAll) addAll.addEventListener('click', function () {
    var n = document.querySelectorAll('#ingList li').length;
    var fa = '۰۱۲۳۴۵۶۷۸۹';
    var nf = String(n).replace(/[0-9]/g, function (d) { return fa[+d]; });
    buyPop('<b>' + nf + ' قلم</b> موادِ این دستور به سبد اضافه شد');
    var t = addAll.innerHTML;
    addAll.innerHTML = '<i class="ri-check-line"></i> اضافه شد';
    setTimeout(function () { addAll.innerHTML = t; }, 1800);
  });

  /* mobile action bar */
  var abJump = $('abJump');
  if (abJump) abJump.addEventListener('click', function () { var r = $('recipe'); if (r) r.scrollIntoView({ behavior: 'smooth' }); });
  var bm = $('bmBtn'), abSave = $('abSave');
  if (abSave) abSave.addEventListener('click', function () {
    if (bm) bm.click();
    var on = !!(bm && bm.classList.contains('is-on'));
    abSave.classList.toggle('is-on', on);
    abSave.querySelector('i').className = on ? 'ri-bookmark-fill' : 'ri-bookmark-line';
  });
  var abShare = $('abShare');
  if (abShare) abShare.addEventListener('click', function () {
    if (navigator.share) { navigator.share({ title: document.title, url: location.href }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).catch(function () {});
    var ic = abShare.querySelector('i'); ic.className = 'ri-check-line';
    setTimeout(function () { ic.className = 'ri-share-line'; }, 1400);
  });

  /* comments empty state */
  var list = $('cmtList'), empty = $('cmtEmpty');
  function syncEmpty() { if (empty && list) empty.hidden = list.children.length > 0; }
  syncEmpty();
  if (list && window.MutationObserver) new MutationObserver(syncEmpty).observe(list, { childList: true });

  /* a11y: announce servings + cost changes */
  var sb = $('servBox'); if (sb) { sb.setAttribute('aria-live', 'polite'); sb.setAttribute('aria-atomic', 'true'); }
  var ce = $('recipeCost'); if (ce) ce.setAttribute('aria-live', 'polite');
})();
