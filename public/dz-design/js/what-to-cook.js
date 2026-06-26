/**
 * امروز چی بپزم؟ — تعاملِ فرانتِ ابزار (بدون بک‌اند).
 * مودِ فیلتر/یخچال، انتخابِ چیپ‌ها و پیل‌ها، برچسبِ زندهٔ انتخاب‌ها،
 * جستجوی یخچال، پیشنهادِ تصادفی، و گفت‌وگوی نمونه‌ی دستیار.
 *
 * @package dashtzad-theme
 */
(function () {
	'use strict';
	var root = document.querySelector('.dz-wtc');
	if (!root) { return; }

	var FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
	function toFa(n) { return String(n).replace(/[0-9]/g, function (d) { return FA[+d]; }); }

	/* ---- mode switch ---- */
	var seg = root.querySelector('.js-wtc-modeseg');
	var modes = root.querySelectorAll('.js-wtc-mode');
	var hint = root.querySelector('.js-wtc-modehint');
	if (seg) {
		seg.querySelectorAll('button').forEach(function (btn) {
			btn.addEventListener('click', function () {
				var m = btn.dataset.mode;
				seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
				modes.forEach(function (mo) { mo.classList.toggle('is-on', mo.dataset.mode === m); });
				if (hint) {
					hint.lastChild.textContent = (m === 'fridge')
						? ' هر چی داری رو تیک بزن تا تطابق مواد حساب شود'
						: ' چند گزینه انتخاب کن تا پیشنهادها زنده به‌روز شوند';
				}
			});
		});
	}

	/* ---- live selected tags + count ---- */
	var count = root.querySelector('.js-wtc-count');
	var selBox = root.querySelector('.js-wtc-selected');
	var BASE = 10;

	function refresh() {
		var chips = root.querySelectorAll('.js-wtc-chip.is-on');
		var pills = root.querySelectorAll('.js-wtc-pill.is-on');
		var tags = [];
		chips.forEach(function (c) { tags.push(c.textContent.trim()); });
		if (pills.length) { tags.push(toFa(pills.length) + ' مادهٔ یخچال'); }

		if (selBox) {
			selBox.innerHTML = '';
			tags.forEach(function (t) {
				var s = document.createElement('span');
				s.className = 'dz-wtc-minitag';
				s.textContent = t;
				selBox.appendChild(s);
			});
		}
		if (count) {
			var picks = chips.length + (pills.length ? 1 : 0);
			var n = Math.max(3, BASE - picks);
			count.textContent = toFa(n);
		}
	}

	root.querySelectorAll('.js-wtc-chip').forEach(function (el) {
		el.addEventListener('click', function () { el.classList.toggle('is-on'); refresh(); persist(); });
	});
	refresh();

	/* ---- fridge: tabs + sync + picks strip + flat search ---- */
	var fpanels   = root.querySelector('.dz-wtc-fpanels');
	var tabsRow   = root.querySelector('.js-wtc-tabs');
	var searchPnl = root.querySelector('.js-wtc-fpanel-search');
	var searchOut = root.querySelector('.js-wtc-search-items');
	var searchMsg = root.querySelector('.js-wtc-search-empty');
	var picksBox  = root.querySelector('.js-wtc-picks');
	var picksRow  = root.querySelector('.js-wtc-picks-row');
	var picksNum  = root.querySelector('.js-wtc-picks-count');
	var picksClr  = root.querySelector('.js-wtc-picks-clear');
	var searchInp = root.querySelector('.js-wtc-fridge-search');
	var searchX   = root.querySelector('.js-wtc-fridge-clear');

	function syncPillByName(name, on) {
		if (!fpanels) { return; }
		fpanels.querySelectorAll('.js-wtc-pill[data-name="' + name.replace(/"/g, '\\"') + '"]').forEach(function (p) {
			p.classList.toggle('is-on', on);
		});
	}

	function renderPicks() {
		if (!picksRow) { return; }
		var names = [];
		var seen = {};
		root.querySelectorAll('.js-wtc-pill.is-on').forEach(function (p) {
			var n = p.dataset.name || p.textContent.trim();
			if (!seen[n]) { seen[n] = 1; names.push(n); }
		});
		picksRow.innerHTML = '';
		names.forEach(function (n) {
			var b = document.createElement('button');
			b.type = 'button';
			b.className = 'dz-wtc-picks__chip js-wtc-pickchip';
			b.dataset.name = n;
			b.innerHTML = '<i class="ri-close-line"></i> ' + n;
			picksRow.appendChild(b);
		});
		if (picksNum) { picksNum.textContent = toFa(names.length); }
		if (picksBox) { picksBox.hidden = names.length === 0; }
	}

	function setPill(name, on) {
		syncPillByName(name, on);
		renderPicks();
		refresh();
		persist();
	}

	if (fpanels) {
		fpanels.addEventListener('click', function (e) {
			var el = e.target.closest('.js-wtc-pill');
			if (!el) { return; }
			var name = el.dataset.name || el.textContent.trim();
			var on = !el.classList.contains('is-on');
			setPill(name, on);
		});
	}
	if (picksRow) {
		picksRow.addEventListener('click', function (e) {
			var el = e.target.closest('.js-wtc-pickchip');
			if (!el) { return; }
			setPill(el.dataset.name, false);
		});
	}
	if (picksClr) {
		picksClr.addEventListener('click', function () {
			root.querySelectorAll('.js-wtc-pill.is-on').forEach(function (p) { p.classList.remove('is-on'); });
			renderPicks(); refresh(); persist();
		});
	}

	function activateTab(key) {
		if (!tabsRow || !fpanels) { return; }
		tabsRow.querySelectorAll('.js-wtc-tab').forEach(function (t) {
			var on = t.dataset.tab === key;
			t.classList.toggle('is-active', on);
			t.setAttribute('aria-selected', on ? 'true' : 'false');
		});
		fpanels.querySelectorAll('.js-wtc-fpanel').forEach(function (p) {
			var on = p.dataset.tab === key;
			p.classList.toggle('is-on', on);
			p.setAttribute('aria-hidden', on ? 'false' : 'true');
		});
	}
	if (tabsRow) {
		tabsRow.addEventListener('click', function (e) {
			var t = e.target.closest('.js-wtc-tab');
			if (!t) { return; }
			activateTab(t.dataset.tab);
		});
	}

	function runSearch(q) {
		if (!fpanels || !searchPnl || !searchOut) { return; }
		var v = (q || '').trim();
		if (searchX) { searchX.hidden = !v; }
		if (!v) {
			if (tabsRow) { tabsRow.classList.remove('is-dim'); }
			searchPnl.hidden = true;
			var active = tabsRow ? tabsRow.querySelector('.js-wtc-tab.is-active') : null;
			activateTab(active ? active.dataset.tab : 'popular');
			return;
		}
		if (tabsRow) { tabsRow.classList.add('is-dim'); }
		fpanels.querySelectorAll('.js-wtc-fpanel').forEach(function (p) {
			if (p === searchPnl) { return; }
			p.classList.remove('is-on');
		});
		searchPnl.hidden = false;
		searchOut.innerHTML = '';
		var seen = {}, found = 0;
		fpanels.querySelectorAll('.js-wtc-pill').forEach(function (p) {
			var n = p.dataset.name || '';
			if (!n || seen[n]) { return; }
			if (n.indexOf(v) < 0) { return; }
			seen[n] = 1; found++;
			var b = document.createElement('button');
			b.type = 'button';
			b.className = 'dz-wtc-pill js-wtc-pill' + (p.classList.contains('is-on') ? ' is-on' : '');
			b.dataset.name = n;
			b.innerHTML = '<span class="dz-wtc-pill__dot"><i class="ri-check-line"></i></span> ' + n;
			searchOut.appendChild(b);
		});
		if (searchMsg) { searchMsg.hidden = found > 0; }
	}
	if (searchInp) {
		searchInp.addEventListener('input', function () { runSearch(searchInp.value); });
	}
	if (searchX) {
		searchX.addEventListener('click', function () {
			if (searchInp) { searchInp.value = ''; searchInp.focus(); }
			runSearch('');
		});
	}

	renderPicks();

	/* ---- ماندگاریِ انتخاب‌ها (localStorage + انتقال به نتایج از طریقِ URL) ---- */
	function selections() {
		var chips = [], fridge = [];
		root.querySelectorAll('.js-wtc-chip.is-on').forEach(function (c) { chips.push(c.textContent.trim()); });
		root.querySelectorAll('.js-wtc-pill.is-on').forEach(function (p) { fridge.push(p.dataset.name || p.textContent.trim()); });
		return { chips: chips, fridge: fridge };
	}
	function persist() {
		try { localStorage.setItem('dz_wtc_state', JSON.stringify(selections())); } catch (e) {}
		var go = root.querySelector('.js-wtc-go');
		if (go) {
			var s = selections();
			var qs = [];
			if (s.chips.length) { qs.push('picks=' + encodeURIComponent(s.chips.join('،'))); }
			if (s.fridge.length) { qs.push('fridge=' + encodeURIComponent(s.fridge.join('،'))); }
			var base = go.getAttribute('href').split('?')[0];
			go.setAttribute('href', base + (qs.length ? '?' + qs.join('&') : ''));
		}
	}
	persist();

	/* ---- (search handled in fridge block above) ---- */

	/* ---- random ---- */
	var randomBtn = root.querySelector('.js-wtc-random');
	var goLink = root.querySelector('.js-wtc-go');
	if (randomBtn && goLink) {
		randomBtn.addEventListener('click', function () {
			try { sessionStorage.setItem('dz_wtc_shuffle', '1'); } catch (e) {}
			window.location.href = goLink.getAttribute('href');
		});
	}

	/* ---- chat (نمونهٔ نمایشی) ---- */
	var log = root.querySelector('.js-wtc-chatlog');
	var form = root.querySelector('.js-wtc-chatform');
	var field = root.querySelector('.js-wtc-chatfield');

	function addOut(text) {
		if (!log) { return; }
		var b = document.createElement('div');
		b.className = 'dz-wtc-bubble dz-wtc-bubble--out';
		var p = document.createElement('p');
		p.textContent = text;
		b.appendChild(p);
		log.appendChild(b);
		log.scrollTop = log.scrollHeight;
	}

	root.querySelectorAll('.js-wtc-suggest').forEach(function (s) {
		s.addEventListener('click', function () {
			if (field) { field.value = s.textContent.trim(); field.focus(); }
		});
	});

	root.querySelectorAll('.js-wtc-mood').forEach(function (m) {
		m.addEventListener('click', function () {
			var p = m.dataset.prompt || m.textContent.trim();
			if (field) { field.value = p; field.focus(); }
		});
	});

	if (form) {
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var v = field ? field.value.trim() : '';
			if (!v) { return; }
			addOut(v);
			if (field) { field.value = ''; }
		});
	}
})();
