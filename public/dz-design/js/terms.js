/**
 * Dashtzad — صفحهٔ «قوانین و مقررات»
 * - sync --size-dz-header-height از ارتفاعِ هدر (برای sticky و scroll-spy)
 * - آکاردئون: یک سکشنِ باز در هر لحظه (با کیبورد + ARIA)
 * - جستجوی زنده روی متن سکشن‌ها
 * - scroll-spy: ست‌کردنِ is-active روی آیتمِ فهرست + پرشِ نرم
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

	/* ---------- آکاردئون ---------- */
	var sections = Array.prototype.slice.call(doc.querySelectorAll('.js-legal-acc'));
	if (!sections.length) {
		return;
	}

	function setOpen(sec, open) {
		sec.classList.toggle('is-open', !!open);
		var head = sec.querySelector('.dz-legal-sec__head');
		if (head) {
			head.setAttribute('aria-expanded', open ? 'true' : 'false');
		}
	}
	function openOnly(target) {
		sections.forEach(function (s) {
			setOpen(s, s === target);
		});
	}

	sections.forEach(function (sec) {
		var head = sec.querySelector('.dz-legal-sec__head');
		if (!head) {
			return;
		}
		head.addEventListener('click', function () {
			var isOpen = sec.classList.contains('is-open');
			if (isOpen) {
				setOpen(sec, false);
			} else {
				openOnly(sec);
			}
		});
	});

	/* ---------- جستجوی زنده ---------- */
	var input = doc.getElementById('dz-legal-search');
	var clearBtn = doc.getElementById('dz-legal-search-clear');
	var empty = doc.getElementById('dz-legal-empty');

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
		var anyMatch = false;
		sections.forEach(function (sec) {
			var hay = normalize(sec.textContent);
			var match = !q || hay.indexOf(q) !== -1;
			sec.style.display = match ? '' : 'none';
			if (match) {
				anyMatch = true;
				if (q) {
					setOpen(sec, true);
				}
			}
		});
		if (empty) {
			empty.classList.toggle('is-shown', !anyMatch);
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

	/* ---------- فهرست کناری + scroll-spy + پرشِ نرم ---------- */
	var tocLinks = Array.prototype.slice.call(doc.querySelectorAll('.js-legal-toc'));
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
	function goTo(target) {
		if (target && target.classList.contains('dz-legal-sec')) {
			openOnly(target);
			setTimeout(function () { jumpTo(target); }, 60);
		} else if (target) {
			jumpTo(target);
		}
	}

	tocLinks.forEach(function (a) {
		a.addEventListener('click', function (e) {
			var t = doc.getElementById(a.dataset.target);
			if (t) {
				e.preventDefault();
				goTo(t);
			}
		});
	});

	Array.prototype.slice.call(doc.querySelectorAll('.dz-terms a[href^="#"]')).forEach(function (a) {
		if (a.classList.contains('js-legal-toc')) {
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
				goTo(t);
			}
		});
	});

	paintActive();
}());
