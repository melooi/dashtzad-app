/**
 * دشت‌زاد — تعاملاتِ آرشیو/دسته:
 *   ۱) گروه‌های فیلترِ تاشو (collapsible)
 *   ۲) اسلایدر قیمتِ دو-دستگیره (هم‌گام با ورودی‌های از/تا)
 *   ۳) اسکرول نامحدودِ گرید محصولات
 * بدونِ وابستگی؛ خرابیِ نرم اگر عنصری نبود (no-JS fallbackها باقی می‌مانند).
 */
( function () {
	'use strict';

	var FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
	function toFa( n ) { return String( n ).replace( /[0-9]/g, function ( d ) { return FA_DIGITS[ d ]; } ); }
	function groupThousands( n ) { return String( n ).replace( /\B(?=(\d{3})+(?!\d))/g, '٬' ); }

	/* ---------- ۱) گروه‌های فیلترِ تاشو ---------- */
	function initCollapsibleGroups() {
		var groups = document.querySelectorAll( '.dz-cat-filters .dz-filter-group' );
		groups.forEach( function ( g, i ) {
			var h = g.querySelector( '.dz-filter-group__h' );
			if ( ! h || h.__dzCol ) { return; }
			h.__dzCol = true;
			h.setAttribute( 'role', 'button' );
			h.setAttribute( 'tabindex', '0' );
			if ( ! h.querySelector( '.dz-filter-group__chev' ) ) {
				var chev = document.createElement( 'i' );
				chev.className = 'ri-arrow-down-s-line dz-filter-group__chev';
				chev.setAttribute( 'aria-hidden', 'true' );
				h.appendChild( chev );
			}
			// گروه‌های سوم به بعد به‌صورت پیش‌فرض بسته.
			if ( i >= 2 ) { g.classList.add( 'is-collapsed' ); }
			function toggle() { g.classList.toggle( 'is-collapsed' ); }
			h.addEventListener( 'click', toggle );
			h.addEventListener( 'keydown', function ( e ) {
				if ( e.key === 'Enter' || e.key === ' ' ) { e.preventDefault(); toggle(); }
			} );
		} );
	}

	/* ---------- ۲) اسلایدر قیمتِ دو-دستگیره ---------- */
	function initPriceSlider() {
		document.querySelectorAll( '.js-dz-price-slider' ).forEach( function ( slider ) {
			if ( slider.__dzSlider ) { return; } slider.__dzSlider = true;

			var MAX = parseInt( slider.getAttribute( 'data-max' ), 10 ) || 0;
			if ( MAX <= 0 ) { return; }
			var STEP = 10000;
			var fill = slider.querySelector( '.dz-price-slider__fill' );
			var tMin = slider.querySelector( '.js-dz-thumb-min' );
			var tMax = slider.querySelector( '.js-dz-thumb-max' );
			var group = slider.closest( '.dz-filter-group' );
			var inMin = group ? group.querySelector( '[name="min_price"]' ) : null;
			var inMax = group ? group.querySelector( '[name="max_price"]' ) : null;

			var from = parseInt( slider.getAttribute( 'data-from' ), 10 ) || 0;
			var to   = parseInt( slider.getAttribute( 'data-to' ), 10 ) || MAX;
			var state = { min: Math.max( 0, from ), max: Math.min( MAX, to > 0 ? to : MAX ) };

			function pct( v ) { return ( v / MAX ) * 100; }
			function layout() {
				var a = pct( state.min ), b = pct( state.max );
				tMin.style.insetInlineStart = a + '%';
				tMax.style.insetInlineStart = b + '%';
				fill.style.insetInlineStart = a + '%';
				fill.style.inlineSize = ( b - a ) + '%';
			}
			function syncInputs() {
				if ( inMin ) { inMin.value = state.min > 0 ? state.min : ''; }
				if ( inMax ) { inMax.value = state.max < MAX ? state.max : ''; }
			}
			layout();

			function valFromX( clientX ) {
				var r = slider.getBoundingClientRect();
				// RTL: راستِ نوار = صفر، چپ = MAX. ولی محورِ قیمت چپ‌به‌راست است،
				// پس insetInlineStart با درصدِ مقدار هم‌خط است (chٍپ=کم).
				var ratio = ( clientX - r.left ) / r.width;
				ratio = Math.max( 0, Math.min( 1, ratio ) );
				return Math.round( ( ratio * MAX ) / STEP ) * STEP;
			}
			function drag( thumb, isMin ) {
				thumb.addEventListener( 'pointerdown', function ( e ) {
					e.preventDefault();
					thumb.setPointerCapture( e.pointerId );
					function move( ev ) {
						var v = valFromX( ev.clientX );
						if ( isMin ) { state.min = Math.min( v, state.max - STEP ); }
						else { state.max = Math.max( v, state.min + STEP ); }
						state.min = Math.max( 0, state.min );
						state.max = Math.min( MAX, state.max );
						layout(); syncInputs();
					}
					function up() {
						thumb.releasePointerCapture( e.pointerId );
						thumb.removeEventListener( 'pointermove', move );
						thumb.removeEventListener( 'pointerup', up );
					}
					thumb.addEventListener( 'pointermove', move );
					thumb.addEventListener( 'pointerup', up );
				} );
			}
			drag( tMin, true ); drag( tMax, false );

			// ورودی‌های متنی → اسلایدر.
			function fromInputs() {
				var lo = inMin ? parseInt( ( inMin.value || '' ).replace( /\D+/g, '' ), 10 ) : 0;
				var hi = inMax ? parseInt( ( inMax.value || '' ).replace( /\D+/g, '' ), 10 ) : MAX;
				if ( isNaN( lo ) ) { lo = 0; } if ( isNaN( hi ) || hi === 0 ) { hi = MAX; }
				if ( lo > hi ) { var t = lo; lo = hi; hi = t; }
				state.min = Math.max( 0, lo ); state.max = Math.min( MAX, hi ); layout();
			}
			if ( inMin ) { inMin.addEventListener( 'change', fromInputs ); }
			if ( inMax ) { inMax.addEventListener( 'change', fromInputs ); }
		} );
	}

	/* ---------- ۳) اسکرول نامحدودِ گرید ---------- */
	function initInfiniteScroll() {
		var grid = document.querySelector( '.dz-cat-grid' );
		var pager = document.querySelector( '.dz-product-grid__pager' );
		if ( ! grid || ! pager ) { return; }

		function nextUrl() {
			var a = pager.querySelector( 'a.next, a.next.page-numbers' );
			if ( a ) { return a.getAttribute( 'href' ); }
			// fallback: بزرگ‌ترین شمارهٔ بعد از صفحهٔ جاری.
			var cur = pager.querySelector( '.current' );
			if ( ! cur ) { return null; }
			var links = pager.querySelectorAll( 'a.page-numbers' );
			for ( var i = 0; i < links.length; i++ ) {
				if ( /\d/.test( links[ i ].textContent ) && parseInt( links[ i ].textContent.replace( /\D+/g, '' ), 10 ) > parseInt( cur.textContent.replace( /\D+/g, '' ), 10 ) ) {
					return links[ i ].getAttribute( 'href' );
				}
			}
			return null;
		}

		var url = nextUrl();
		if ( ! url ) { return; }

		var loading = false, done = false;
		var sentinel = document.createElement( 'div' );
		sentinel.className = 'dz-cat-sentinel';
		sentinel.innerHTML = '<span class="dz-cat-sentinel__spin" aria-hidden="true"></span>';
		pager.parentNode.insertBefore( sentinel, pager );
		pager.style.display = 'none'; // pager فقط fallbackِ no-JS.

		function setEnd() {
			done = true;
			sentinel.innerHTML = '<span class="dz-cat-sentinel__end"><i class="ri-seedling-line" aria-hidden="true"></i> به پایان فهرست رسیدید</span>';
		}

		function load() {
			if ( loading || done || ! url ) { return; }
			loading = true;
			sentinel.classList.add( 'is-loading' );
			fetch( url, { credentials: 'same-origin' } ).then( function ( r ) { return r.text(); } ).then( function ( html ) {
				var doc = new DOMParser().parseFromString( html, 'text/html' );
				var newGrid = doc.querySelector( '.dz-cat-grid' );
				var items = newGrid ? newGrid.children : [];
				if ( ! items || ! items.length ) { setEnd(); return; }
				var frag = document.createDocumentFragment();
				Array.prototype.slice.call( items ).forEach( function ( li ) { frag.appendChild( document.importNode( li, true ) ); } );
				grid.appendChild( frag );
				if ( window.dzProductCardInit ) { window.dzProductCardInit( grid ); }
				var newPager = doc.querySelector( '.dz-product-grid__pager' );
				var a = newPager ? newPager.querySelector( 'a.next' ) : null;
				url = a ? a.getAttribute( 'href' ) : null;
				if ( ! url ) { setEnd(); }
			} ).catch( function () {
				// خطا → برگرداندنِ pager به‌عنوان fallback.
				pager.style.display = '';
				sentinel.remove();
				done = true;
			} ).finally( function () {
				loading = false;
				sentinel.classList.remove( 'is-loading' );
			} );
		}

		if ( 'IntersectionObserver' in window ) {
			var io = new IntersectionObserver( function ( es ) {
				es.forEach( function ( e ) { if ( e.isIntersecting ) { load(); } } );
			}, { rootMargin: '600px' } );
			io.observe( sentinel );
		} else {
			window.addEventListener( 'scroll', function () {
				if ( sentinel.getBoundingClientRect().top < window.innerHeight + 600 ) { load(); }
			} );
		}
	}

	function init() {
		initCollapsibleGroups();
		initPriceSlider();
		initInfiniteScroll();
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
}() );
