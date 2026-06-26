/**
 * Dashtzad — Product Card interactions «سبک رسمی».
 * علاقه‌مندی (pop/burst) · انتخابِ وزن/بسته‌بندی → پله‌ی تعداد · پاپ‌آپ اطلاع موجودی · تایمر شگفت‌انگیز.
 * همه‌چیز داده‌محور است (data-price/data-grams/data-was روی ریشهٔ کارت). بدون px در منطق.
 *
 * @package dashtzad-theme
 */
(function () {
	'use strict';

	var FA = '۰۱۲۳۴۵۶۷۸۹';
	function toFa(n) { return String(n).replace(/[0-9]/g, function (d) { return FA[+d]; }); }
	function grp(n) { n = Math.round(n / 5000) * 5000; return toFa(n.toLocaleString('en-US')).replace(/,/g, '٬'); }
	function fmtG(g) {
		if (g >= 1000) { var k = Math.round(g / 100) / 10; return toFa(String(k).replace('.', '٫')) + ' کیلوگرم'; }
		return toFa(String(g)) + ' گرم';
	}
	function pad2(n) { n = String(n); return n.length < 2 ? '0' + n : n; }
	function i18n(card, key, fallback) {
		var v = card.getAttribute('data-i18n-' + key);
		return v !== null && v !== '' ? v : fallback;
	}
	function tomanMark() { return '<span class="dz-toman" role="img" aria-label="تومان"></span>'; }

	/* شبکه — فقط وقتی پیکربندیِ ووکامرس حاضر است (در پیش‌نمایشِ ایستا، فقط DOM). */
	function dzPost(action, data) {
		if (!window.dzShop) { return Promise.resolve(null); }
		var fd = new FormData(); fd.append('action', action); fd.append('nonce', window.dzShop.nonce);
		Object.keys(data || {}).forEach(function (k) { fd.append(k, data[k]); });
		return fetch(window.dzShop.ajaxUrl, { method: 'POST', credentials: 'same-origin', body: fd })
			.then(function (r) { return r.json(); }).catch(function () { return null; });
	}
	function dzCartCount(n) {
		n = parseInt(n, 10) || 0;
		document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = toFa(n); el.hidden = n <= 0; });
		if (window.jQuery) { window.jQuery(document.body).trigger('wc_fragment_refresh'); }
	}
	function dzPid(el) { var n = el && el.closest('.dz-product-card'); var b = n && n.querySelector('[data-product-id]'); return b ? b.getAttribute('data-product-id') : ''; }

	/* ---------- علاقه‌مندی ---------- */
	function initFav(btn) {
		if (btn.__dzFav) { return; } btn.__dzFav = true;
		if (!btn.querySelector('.dz-product-card__fav-burst')) {
			var b = document.createElement('span'); b.className = 'dz-product-card__fav-burst'; btn.appendChild(b);
		}
		var icon = btn.querySelector('i');
		btn.addEventListener('click', function () {
			var on = btn.classList.toggle('is-fav');
			btn.setAttribute('aria-pressed', on ? 'true' : 'false');
			if (icon) { icon.classList.toggle('ri-heart-3-line', !on); icon.classList.toggle('ri-heart-3-fill', on); }
			btn.classList.remove('is-pop'); void btn.offsetWidth; if (on) { btn.classList.add('is-pop'); }
			dzPost('dz_toggle_wishlist', { product_id: btn.getAttribute('data-product-id') || dzPid(btn) }).then(function (res) {
				if (res && res.success && typeof res.data.active === 'boolean' && res.data.active !== on) {
					btn.classList.toggle('is-fav', res.data.active); btn.setAttribute('aria-pressed', res.data.active ? 'true' : 'false');
					if (icon) { icon.classList.toggle('ri-heart-3-line', !res.data.active); icon.classList.toggle('ri-heart-3-fill', res.data.active); }
				}
			});
		});
	}

	/* ---------- تایمرِ شگفت‌انگیز ---------- */
	function initTimer(card) {
		if (card.__dzTimer) { return; } card.__dzTimer = true;
		var wrap = card.querySelector('.dz-product-card__media-wrap');
		if (!wrap || wrap.querySelector('.dz-product-card__timer')) { return; }
		var secs = parseInt(card.getAttribute('data-flash-secs'), 10) || (3 * 3600 + 47 * 60 + 12);
		var t = document.createElement('div'); t.className = 'dz-product-card__timer';
		t.innerHTML = '<i class="dz-icon ri-flashlight-fill" aria-hidden="true"></i> ' + i18n(card, 'flash', 'شگفت‌انگیز') + ' <b></b>';
		wrap.appendChild(t);
		var b = t.querySelector('b'), end = Date.now() + secs * 1000;
		(function tick() {
			var s = Math.max(0, Math.round((end - Date.now()) / 1000));
			b.textContent = toFa(pad2(Math.floor(s / 3600)) + ':' + pad2(Math.floor(s % 3600 / 60)) + ':' + pad2(s % 60));
			if (s > 0) { setTimeout(tick, 1000); }
		})();
	}

	/* ---------- اطلاعِ موجودی ---------- */
	function initNotify(card) {
		var btn = card.querySelector('.js-dz-notify'); if (!btn || btn.__dzNotify) { return; } btn.__dzNotify = true;
		var pop = document.createElement('div'); pop.className = 'dz-product-card__pop'; pop.hidden = true;
		pop.innerHTML =
			'<button type="button" class="dz-product-card__pop-x js-dz-popx" aria-label="بستن"><i class="dz-icon ri-close-line" aria-hidden="true"></i></button>' +
			'<div class="dz-product-card__pop-in">' +
				'<i class="dz-icon ri-notification-3-line" aria-hidden="true"></i>' +
				'<div class="dz-product-card__pop-h">خبرم کن وقتی موجود شد</div>' +
				'<p>شماره‌ات را بگذار تا به‌محضِ شارژِ موجودی پیامک کنیم.</p>' +
				'<input type="tel" inputmode="tel" dir="ltr" placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰">' +
				'<button type="button" class="dz-product-card__pop-go js-dz-popgo">ثبت اطلاع‌رسانی</button>' +
			'</div>';
		card.appendChild(pop);
		btn.addEventListener('click', function () { pop.hidden = false; pop.classList.remove('is-in'); void pop.offsetWidth; pop.classList.add('is-in'); });
		pop.querySelector('.js-dz-popx').addEventListener('click', function () { pop.hidden = true; });
		pop.querySelector('.js-dz-popgo').addEventListener('click', function () {
			var inp = pop.querySelector('input');
			dzPost('dz_notify_stock', { product_id: btn.getAttribute('data-product-id') || dzPid(btn), mobile: inp ? inp.value : '' });
			pop.querySelector('.dz-product-card__pop-in').innerHTML =
				'<i class="dz-icon ri-checkbox-circle-fill" style="color:var(--color-dz-primary,#15803d)" aria-hidden="true"></i>' +
				'<div class="dz-product-card__pop-h">ثبت شد</div><p>به‌محضِ موجود شدن به‌ت خبر می‌دهیم.</p>';
		});
	}

	/* ---------- افزودن → انتخابِ وزن → پله‌ی تعداد ---------- */
	function initAdd(card) {
		var add = card.querySelector('.js-dz-add'); if (!add || add.__dzAdd) { return; } add.__dzAdd = true;
		var foot = card.querySelector('.dz-product-card__foot');
		var body = card.querySelector('.dz-product-card__body');
		var nowEl = card.querySelector('.dz-product-card__price-now');
		var wasEl = card.querySelector('.dz-product-card__price-was');
		var weightEl = card.querySelector('.dz-product-card__weight');
		var baseNew = parseFloat(card.getAttribute('data-price')) || 0;
		var baseWas = parseFloat(card.getAttribute('data-was')) || 0;
		var baseG = parseFloat(card.getAttribute('data-grams')) || 0;
		var wIcon = weightEl ? weightEl.querySelector('i') : null;

		function setNow(v) { if (nowEl) { nowEl.firstChild.nodeValue = grp(v) + ' '; } }
		function setWas(v) { if (wasEl) { wasEl.textContent = grp(v); } }
		function setWeight(txt) { if (!weightEl) { return; } weightEl.textContent = ''; if (wIcon) { weightEl.appendChild(wIcon); } weightEl.appendChild(document.createTextNode(' ' + txt)); }
		function applyFactor(f, m) { m = m || 1; if (baseG) { setWeight(fmtG(baseG * f)); } setNow(baseNew * f * m); if (baseWas) { setWas(baseWas * f * m); } }

		/* پله‌ی تعداد */
		var qty = document.createElement('div'); qty.className = 'dz-product-card__qty'; qty.hidden = true;
		qty.innerHTML = '<button type="button" class="js-dz-pcinc" aria-label="افزایش">+</button><span class="dz-product-card__n">۱</span><button type="button" class="js-dz-pcdec" aria-label="کاهش">−</button>';
		foot.insertBefore(qty, add.nextSibling);
		var nEl = qty.querySelector('.dz-product-card__n'), inc = qty.querySelector('.js-dz-pcinc'), dec = qty.querySelector('.js-dz-pcdec');
		var c = 0, armed = false;
		function render() { nEl.textContent = toFa(c); }
		function bump() { nEl.classList.remove('is-bump'); void nEl.offsetWidth; nEl.classList.add('is-bump'); }
		function arm() { armed = true; dec.classList.add('is-danger'); dec.innerHTML = '<i class="dz-icon ri-delete-bin-line" aria-hidden="true"></i>'; }
		function disarm() { armed = false; dec.classList.remove('is-danger'); dec.textContent = '−'; }

		/* انتخابگرِ وزن/بسته */
		var sel = document.createElement('div'); sel.className = 'dz-product-card__wsel'; sel.hidden = true;
		sel.innerHTML =
			'<button type="button" class="dz-product-card__pop-x js-dz-wclose" aria-label="بستن"><i class="dz-icon ri-close-line" aria-hidden="true"></i></button>' +
			'<div class="dz-product-card__wstep" data-s="1">' +
				'<div class="dz-product-card__wsel-h"><i class="dz-icon ri-archive-line" aria-hidden="true"></i> انتخابِ وزنِ بسته‌بندی</div>' +
				'<div class="dz-product-card__wopts js-dz-wq"></div>' +
				'<div class="dz-product-card__wprice">قیمت: <b></b> ' + tomanMark() + '</div>' +
				'<button type="button" class="dz-product-card__wnext js-dz-wnext">ادامه <i class="dz-icon ri-arrow-left-s-line" aria-hidden="true"></i></button>' +
				'<a class="dz-product-card__wview js-dz-wview" href="#"><i class="dz-icon ri-eye-line" aria-hidden="true"></i> مشاهده محصول</a>' +
			'</div>' +
			'<div class="dz-product-card__wstep" data-s="2" hidden>' +
				'<div class="dz-product-card__wsel-h"><button type="button" class="dz-product-card__wback js-dz-wback" aria-label="بازگشت"><i class="dz-icon ri-arrow-right-s-line" aria-hidden="true"></i></button> نوعِ بسته‌بندی</div>' +
				'<div class="dz-product-card__wopts js-dz-wp"></div>' +
				'<div class="dz-product-card__wprice">جمع: <b></b> ' + tomanMark() + '</div>' +
				'<button type="button" class="dz-product-card__wnext js-dz-wgo"><i class="dz-icon ri-shopping-cart-2-line" aria-hidden="true"></i> افزودن به سبد</button>' +
			'</div>';
		body.insertBefore(sel, foot);
		var dzMediaA = card.querySelector('.dz-product-card__media'), dzViewA = sel.querySelector('.js-dz-wview');
		if (dzMediaA && dzViewA) { dzViewA.setAttribute('href', dzMediaA.getAttribute('href') || '#'); }
		var step1 = sel.querySelector('[data-s="1"]'), step2 = sel.querySelector('[data-s="2"]');
		var wq = sel.querySelector('.js-dz-wq'), wp = sel.querySelector('.js-dz-wp');
		var step1B = step1.querySelector('.dz-product-card__wprice b'), step2B = step2.querySelector('.dz-product-card__wprice b');

		[1, 2, 4].forEach(function (fct, i) {
			var b = document.createElement('button'); b.type = 'button';
			b.className = 'dz-product-card__wopt' + (i === 0 ? ' is-sel' : ''); b.setAttribute('data-f', fct);
			b.innerHTML = '<span class="dz-product-card__wradio"></span><span>' + fmtG(baseG * fct) + '</span>' +
				(i === 1 ? '<span class="dz-product-card__wbest">پرفروش</span>' : '') +
				'<span class="dz-product-card__wopt-price">' + grp(baseNew * fct) + '</span>';
			wq.appendChild(b);
		});
		var packs = [{ k: 'اقتصادی', ic: 'ri-copper-coin-line', m: 1 }, { k: 'وکیوم', ic: 'ri-archive-2-line', m: 1.05 }, { k: 'هدیه', ic: 'ri-gift-line', m: 1.18 }];
		packs.forEach(function (p, i) {
			var b = document.createElement('button'); b.type = 'button';
			b.className = 'dz-product-card__wopt' + (i === 0 ? ' is-sel' : ''); b.setAttribute('data-m', p.m);
			b.innerHTML = '<span class="dz-product-card__wradio"></span><span><i class="dz-icon ri-' + p.ic.slice(3) + '" aria-hidden="true"></i> ' + p.k + '</span><span class="dz-product-card__wopt-price"></span>';
			wp.appendChild(b);
		});

		var fSel = 1, mSel = 1;
		function reanim() { sel.classList.remove('is-in'); void sel.offsetWidth; sel.classList.add('is-in'); }
		function setStep1(f) { if (step1B) { step1B.textContent = grp(baseNew * f); } }
		function setStep2() { if (step2B) { step2B.textContent = grp(baseNew * fSel * mSel); } }
		function updatePackPrices() {
			wp.querySelectorAll('.dz-product-card__wopt').forEach(function (b) {
				var m = +b.getAttribute('data-m'), d = Math.round(baseNew * fSel * (m - 1) / 5000) * 5000;
				b.querySelector('.dz-product-card__wopt-price').textContent = d > 0 ? grp(d) : 'رایگان';
			});
		}
		function resetSteps() {
			step2.hidden = true; step1.hidden = false;
			wq.querySelectorAll('.dz-product-card__wopt').forEach(function (x, i) { x.classList.toggle('is-sel', i === 0); });
			wp.querySelectorAll('.dz-product-card__wopt').forEach(function (x, i) { x.classList.toggle('is-sel', i === 0); });
			fSel = 1; mSel = 1; setStep1(1);
		}
		function restoreAdd() {
			add.style.display = ''; add.style.animation = 'dzQtyIn .3s'; setTimeout(function () { add.style.animation = ''; }, 320);
		}

		setStep1(1);
		wq.querySelectorAll('.dz-product-card__wopt').forEach(function (b) {
			b.addEventListener('mouseenter', function () { setStep1(+b.getAttribute('data-f')); });
			b.addEventListener('mouseleave', function () { var s = wq.querySelector('.is-sel'); setStep1(s ? +s.getAttribute('data-f') : fSel); });
			b.addEventListener('click', function () { wq.querySelectorAll('.dz-product-card__wopt').forEach(function (x) { x.classList.remove('is-sel'); }); b.classList.add('is-sel'); fSel = +b.getAttribute('data-f'); setStep1(fSel); });
		});
		wp.querySelectorAll('.dz-product-card__wopt').forEach(function (b) {
			b.addEventListener('click', function () { wp.querySelectorAll('.dz-product-card__wopt').forEach(function (x) { x.classList.remove('is-sel'); }); b.classList.add('is-sel'); mSel = +b.getAttribute('data-m'); setStep2(); });
		});
		sel.querySelector('.js-dz-wnext').addEventListener('click', function () { updatePackPrices(); setStep2(); step1.hidden = true; step2.hidden = false; reanim(); });
		sel.querySelector('.js-dz-wback').addEventListener('click', function () { step2.hidden = true; step1.hidden = false; reanim(); });
		sel.querySelector('.js-dz-wclose').addEventListener('click', function () { sel.hidden = true; resetSteps(); applyFactor(1, 1); restoreAdd(); });
		var productId = dzPid(add), cartKey = '';
		function syncQty() { if (cartKey) { dzPost('dz_update_cart_qty', { key: cartKey, quantity: c }).then(function (res) { if (res && res.success) { dzCartCount(res.data.count); } }); } }

		sel.querySelector('.js-dz-wgo').addEventListener('click', function () {
			applyFactor(fSel, mSel); sel.hidden = true;
			c = 1; render(); disarm(); qty.hidden = false; qty.classList.remove('is-in'); void qty.offsetWidth; qty.classList.add('is-in');
			dzPost('dz_add_to_cart', { product_id: productId, quantity: 1 }).then(function (res) { if (res && res.success) { cartKey = res.data.key; dzCartCount(res.data.count); } });
		});

		add.addEventListener('click', function () {
			add.classList.add('is-out');
			setTimeout(function () { add.style.display = 'none'; add.classList.remove('is-out'); resetSteps(); sel.hidden = false; reanim(); }, 180);
		});
		inc.addEventListener('click', function () { if (armed) { disarm(); } c++; render(); bump(); syncQty(); });
		dec.addEventListener('click', function () {
			if (c > 1) { c--; render(); bump(); syncQty(); return; }
			if (!armed) { arm(); return; }
			qty.hidden = true; disarm(); applyFactor(1, 1); resetSteps(); restoreAdd();
			if (cartKey) { dzPost('dz_update_cart_qty', { key: cartKey, quantity: 0 }).then(function (res) { if (res && res.success) { dzCartCount(res.data.count); } }); cartKey = ''; }
		});
	}

	function init(root) {
		(root || document).querySelectorAll('.dz-product-card__fav').forEach(initFav);
		(root || document).querySelectorAll('.dz-product-card[data-flash="1"]').forEach(initTimer);
		(root || document).querySelectorAll('.dz-product-card').forEach(function (card) { initNotify(card); initAdd(card); });
		(root || document).querySelectorAll('.js-dz-sort').forEach(function (s) {
			if (s.__dzSort) { return; } s.__dzSort = true;
			s.addEventListener('change', function () { if (s.form) { s.form.submit(); } });
		});
		(root || document).querySelectorAll('.js-dz-filter-open').forEach(function (b) {
			if (b.__dzFo) { return; } b.__dzFo = true;
			b.addEventListener('click', function () { document.body.classList.add('dz-filter-open'); });
		});
		(root || document).querySelectorAll('.js-dz-filter-close').forEach(function (b) {
			if (b.__dzFc) { return; } b.__dzFc = true;
			b.addEventListener('click', function () { document.body.classList.remove('dz-filter-open'); });
		});
		(root || document).querySelectorAll('.js-dz-price-quick').forEach(function (b) {
			if (b.__dzPq) { return; } b.__dzPq = true;
			b.addEventListener('click', function () {
				var form = b.closest('form'); if (!form) { return; }
				var lo = form.querySelector('[name="min_price"]'), hi = form.querySelector('[name="max_price"]');
				if (lo) { lo.value = b.getAttribute('data-min') > 0 ? b.getAttribute('data-min') : ''; }
				if (hi) { hi.value = b.getAttribute('data-max') > 0 ? b.getAttribute('data-max') : ''; }
				form.submit();
			});
		});
	}

	if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', function () { init(); }); }
	else { init(); }
	if (window.dzShop && typeof window.dzShop.cartCount !== 'undefined') { dzCartCount(window.dzShop.cartCount); }
	window.dzProductCardInit = init;
})();
