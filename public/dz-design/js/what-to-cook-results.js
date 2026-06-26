/**
 * نتایجِ امروز چی بپزم؟ — تعاملِ فرانت.
 * اگر dzWtc (AJAX) موجود باشد، از سرور می‌گیرد؛ وگرنه فیلتر/مرتب‌سازیِ سمتِ کلاینت
 * روی کارت‌های رندرشده (data-*). علاقه‌مندی در localStorage می‌ماند.
 *
 * @package dashtzad-theme
 */
(function () {
	'use strict';
	var root = document.querySelector('.dz-wtcr');
	if (!root) { return; }

	var FA = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
	function toFa(n) { return String(n).replace(/[0-9]/g, function (d) { return FA[+d]; }); }
	var grid = root.querySelector('.dz-wtcr-grid');
	var sub = root.querySelector('.dz-wtcr-sub');

	/* ---- نمایشِ انتخاب‌های کاربر از URL در چیپِ «انتخاب‌های تو» ---- */
	(function () {
		var pick = root.querySelector('.js-wtcr-pick');
		if (!pick) { return; }
		var p = new URLSearchParams(window.location.search);
		var parts = [];
		if (p.get('picks')) { parts.push(p.get('picks')); }
		if (p.get('fridge')) { parts.push(toFa(p.get('fridge').split('،').length) + ' مادهٔ یخچال'); }
		if (parts.length) {
			pick.innerHTML = '<i class="dz-icon dz-icon--sm ri-magic-line"></i> انتخاب‌های تو: ' + parts.join(' · ');
		}
	})();

	/* ---- علاقه‌مندی (localStorage) ---- */
	var FAV_KEY = 'dz_wtc_favs';
	function favs() { try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch (e) { return []; } }
	function setFavs(a) { try { localStorage.setItem(FAV_KEY, JSON.stringify(a)); } catch (e) {} }

	root.querySelectorAll('.js-wtc-fav').forEach(function (btn, i) {
		var card = btn.closest('.dz-recipe-card');
		var id = (card && card.dataset.id) || ('c' + i);
		if (favs().indexOf(id) >= 0) { mark(btn, true); }
		btn.addEventListener('click', function () {
			var list = favs(); var idx = list.indexOf(id);
			var on = idx < 0;
			if (on) { list.push(id); } else { list.splice(idx, 1); }
			setFavs(list); mark(btn, on);
		});
	});
	function mark(btn, on) {
		btn.classList.toggle('is-on', on);
		var icon = btn.querySelector('i');
		if (icon) { icon.className = on ? 'dz-icon ri-heart-fill' : 'dz-icon ri-heart-line'; }
	}

	/* ---- وضعیتِ فعلیِ مرتب/فیلتر ---- */
	var state = { sort: 'match', narrow: [] };

	function activeNarrowLabels() {
		var out = [];
		root.querySelectorAll('.js-wtcr-narrow:checked').forEach(function (c) {
			var l = c.closest('.dz-wtcr-check');
			out.push(l ? l.textContent.trim() : '');
		});
		return out;
	}

	function passes(card, labels) {
		if (!labels.length) { return true; }
		var diet = (card.dataset.diet || '');
		var min = parseInt(card.dataset.min || '0', 10);
		return labels.every(function (lab) {
			if (lab.indexOf('زیر ۱۵') >= 0 || lab.indexOf('زیر 15') >= 0) { return min > 0 && min <= 15; }
			if (lab.indexOf('زیر ۳۰') >= 0 || lab.indexOf('زیر 30') >= 0) { return min > 0 && min <= 30; }
			if (lab.indexOf('گیاهی') >= 0) { return diet.indexOf('گیاهی') >= 0; }
			if (lab.indexOf('گوشتی') >= 0) { return diet.indexOf('گوشتی') >= 0; }
			if (lab.indexOf('سبک') >= 0) { return diet.indexOf('سبک') >= 0; }
			return true; // برچسب‌هایی مثل «شام» در نسخهٔ بدونِ AJAX قابلِ تطبیق نیست → رد نکن
		});
	}

	function applyClient() {
		if (!grid) { return; }
		var labels = activeNarrowLabels();
		var cards = Array.prototype.slice.call(grid.querySelectorAll('.dz-recipe-card'));
		var shown = 0;
		cards.forEach(function (c) {
			var ok = passes(c, labels);
			c.style.display = ok ? '' : 'none';
			if (ok) { shown++; }
		});
		// مرتب‌سازی
		var vis = cards.filter(function (c) { return c.style.display !== 'none'; });
		vis.sort(function (a, b) {
			switch (state.sort) {
				case 'popular': return (+b.dataset.pop || 0) - (+a.dataset.pop || 0);
				case 'fast': return ((+a.dataset.min || 9999)) - ((+b.dataset.min || 9999));
				case 'lowcal': return ((+a.dataset.cal || 9999)) - ((+b.dataset.cal || 9999));
				default: return (+b.dataset.match || 0) - (+a.dataset.match || 0);
			}
		});
		vis.forEach(function (c) { grid.appendChild(c); });
		if (sub) { sub.textContent = 'بر اساس انتخاب‌های تو، ' + toFa(shown) + ' دستور پخت پیدا کردیم.'; }
		emptyState(shown);
	}

	function emptyState(n) {
		var ex = root.querySelector('.js-wtcr-empty');
		if (n > 0) { if (ex) { ex.remove(); } return; }
		if (ex) { return; }
		var d = document.createElement('div');
		d.className = 'dz-wtcr-empty js-wtcr-empty';
		d.textContent = 'با این محدودسازی چیزی پیدا نشد؛ یکی از تیک‌ها را بردار تا نزدیک‌ترین‌ها را ببینی.';
		grid.parentNode.appendChild(d);
	}

	/* ---- سرورِ AJAX (اگر فعال باشد) ---- */
	var SORTMAP = { 'تطبیق مواد': 'match', 'محبوب‌ترین': 'popular', 'سریع‌ترین': 'fast', 'کم‌کالری‌ترین': 'lowcal' };
	function hasAjax() { return typeof window.dzWtc === 'object' && window.dzWtc.ajaxUrl; }

	/* مرتب‌سازی */
	var sorts = root.querySelectorAll('.js-wtcr-sort');
	sorts.forEach(function (opt) {
		opt.addEventListener('click', function () {
			sorts.forEach(function (o) { o.classList.toggle('is-on', o === opt); });
			state.sort = SORTMAP[opt.textContent.trim()] || 'match';
			applyClient();
		});
	});

	/* محدودسازی */
	root.querySelectorAll('.js-wtcr-narrow').forEach(function (c) {
		c.addEventListener('change', applyClient);
	});

	applyClient();
})();
