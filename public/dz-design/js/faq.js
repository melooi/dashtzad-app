/**
 * Dashtzad — صفحهٔ «پرسش‌های متداول»
 * - sync --size-dz-header-height از ارتفاعِ هدر (برای sticky و scroll-spy)
 * - آکاردئون: یک پرسشِ باز در هر گروه
 * - جستجوی زنده روی متن پرسش‌ها + پنهان‌کردنِ گروهِ بی‌نتیجه
 * - scroll-spy روی فهرستِ کناری + پرشِ نرم
 *
 * @package dashtzad-theme
 */

(function () {
	'use strict';

	var doc = document;
	var root = doc.documentElement;

	/* ---------- ارتفاع هدرِ چسبان → --size-dz-header-height ---------- */
	function headerHeight() {
		var h = doc.querySelector('.dz-header');
		return h ? h.offsetHeight : 0;
	}
	function syncHeaderVar() {
		var px = headerHeight();
		if (px > 0) {
			root.style.setProperty('--size-dz-header-height', (px / 16) + 'rem');
		}
	}
	syncHeaderVar();
	window.addEventListener('resize', syncHeaderVar);
	doc.addEventListener('dz:partials-ready', syncHeaderVar);

	/* ---------- آکاردئون (یک پرسشِ باز در هر گروه) ---------- */
	var items = Array.prototype.slice.call(doc.querySelectorAll('.js-faq-item'));
	if (!items.length) {
		return;
	}

	function setOpen(item, open) {
		item.classList.toggle('is-open', !!open);
		var q = item.querySelector('.dz-faq-q');
		if (q) {
			q.setAttribute('aria-expanded', open ? 'true' : 'false');
		}
	}

	items.forEach(function (item) {
		var q = item.querySelector('.dz-faq-q');
		if (!q) {
			return;
		}
		q.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');
		q.addEventListener('click', function () {
			var isOpen = item.classList.contains('is-open');
			var group = item.closest('.dz-faq-group');
			if (group) {
				group.querySelectorAll('.dz-faq-item.is-open').forEach(function (o) {
					if (o !== item) {
						setOpen(o, false);
					}
				});
			}
			setOpen(item, !isOpen);
		});
	});

	/* ---------- جستجوی زنده ---------- */
	var input = doc.getElementById('dz-faq-search');
	var clearBtn = doc.getElementById('dz-faq-search-clear');
	var groups = Array.prototype.slice.call(doc.querySelectorAll('.dz-faq-group'));
	var empty = doc.getElementById('dz-faq-empty');

	function normalize(s) {
		return (s || '')
			.replace(/\u200c/g, ' ')
			.replace(/[\u064B-\u0652]/g, '')
			.toLowerCase()
			.trim();
	}

	function runSearch() {
		if (!input) {
			return;
		}
		var q = normalize(input.value);
		if (clearBtn) {
			clearBtn.hidden = !input.value;
		}
		var anyVisible = false;
		groups.forEach(function (group) {
			var groupHas = false;
			group.querySelectorAll('.dz-faq-item').forEach(function (item) {
				var match = !q || normalize(item.textContent).indexOf(q) !== -1;
				item.style.display = match ? '' : 'none';
				if (match) {
					groupHas = true;
					anyVisible = true;
					if (q) {
						setOpen(item, true);
					}
				}
			});
			group.classList.toggle('is-hidden', !groupHas);
		});
		if (empty) {
			empty.classList.toggle('is-shown', !anyVisible);
		}
	}

	if (input) {
		input.addEventListener('input', runSearch);
	}
	if (clearBtn) {
		clearBtn.addEventListener('click', function () {
			if (input) {
				input.value = '';
				runSearch();
				input.focus();
			}
		});
	}

	/* ---------- فهرست کناری: scroll-spy + پرشِ نرم ---------- */
	var tocLinks = Array.prototype.slice.call(doc.querySelectorAll('.js-faq-toc'));
	var tocTargets = tocLinks.map(function (a) {
		return doc.getElementById(a.dataset.target);
	});

	function paintActive() {
		var trigger = headerHeight() + 60;
		var activeIdx = 0;
		tocTargets.forEach(function (sec, i) {
			if (sec && sec.getBoundingClientRect().top < trigger) {
				activeIdx = i;
			}
		});
		tocLinks.forEach(function (a, i) {
			a.classList.toggle('is-active', i === activeIdx);
		});
	}
	window.addEventListener('scroll', paintActive, { passive: true });

	function jumpTo(target) {
		var y = target.getBoundingClientRect().top + window.scrollY - headerHeight() - 16;
		window.scrollTo({ top: y, behavior: 'smooth' });
	}

	tocLinks.forEach(function (a) {
		a.addEventListener('click', function (e) {
			var t = doc.getElementById(a.dataset.target);
			if (t) {
				e.preventDefault();
				jumpTo(t);
			}
		});
	});

	Array.prototype.slice.call(doc.querySelectorAll('.dz-faq a[href^="#"]')).forEach(function (a) {
		if (a.classList.contains('js-faq-toc')) {
			return;
		}
		a.addEventListener('click', function (e) {
			var hash = a.getAttribute('href');
			if (!hash || hash.length < 2) {
				return;
			}
			var t = doc.getElementById(hash.slice(1));
			if (t) {
				e.preventDefault();
				jumpTo(t);
			}
		});
	});

	paintActive();
}());
