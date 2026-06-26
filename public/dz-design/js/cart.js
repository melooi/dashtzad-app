/**
 * Dashtzad — Cart page JS (components/cart/*). بدون وابستگی.
 *
 * فقط تعاملاتِ نمایشی: پله‌ی تعداد (که فرمِ WC update_cart را submit می‌کند)،
 * تاگلِ کد تخفیف، خالی‌کردنِ سبد، شمارشِ زندهٔ مجموع و نوارِ ارسالِ رایگان.
 */
( function () {
	'use strict';

	var FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

	function toFa( n ) {
		return String( n ).replace( /[0-9]/g, function ( d ) { return FA_DIGITS[ d ]; } );
	}

	function groupFa( n ) {
		var rounded = Math.round( Math.max( 0, Number( n ) || 0 ) );
		return toFa( rounded.toLocaleString( 'en-US' ).replace( /,/g, '٬' ) );
	}

	/* ---------- 1) پله‌ی تعداد: روی +/- مقدارِ input را تغییر بده و فرم را submit کن. ---------- */
	function bindQtyStepper() {
		var rows = document.querySelectorAll( '.dz-cart-row' );
		rows.forEach( function ( row ) {
			var input = row.querySelector( '.dz-cart-row__qty-input' );
			var dec   = row.querySelector( '.js-dz-cart-qty-dec' );
			var inc   = row.querySelector( '.js-dz-cart-qty-inc' );
			if ( ! input || ! dec || ! inc ) { return; }
			dec.addEventListener( 'click', function () { step( input, -1, row ); } );
			inc.addEventListener( 'click', function () { step( input,  1, row ); } );
			input.addEventListener( 'change', function () { submitForm( input ); } );
		} );
	}

	var FA_MAP = { '0':'۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹' };
	function toFaDigits( s ) { return String( s ).replace( /[0-9]/g, function ( d ) { return FA_MAP[ d ]; } ); }

	function step( input, delta, row ) {
		var max = parseInt( input.max, 10 ); if ( isNaN( max ) ) { max = Infinity; }
		var min = parseInt( input.min, 10 ); if ( isNaN( min ) ) { min = 0; }
		var cur = parseInt( input.value, 10 ); if ( isNaN( cur ) ) { cur = 0; }
		var next = Math.min( max, Math.max( min, cur + delta ) );
		if ( next === cur ) { return; }
		input.value = next;
		row.setAttribute( 'data-quantity', String( next ) );
		var num = row.querySelector( '.dz-cart-row__qty-num' );
		if ( num ) { num.textContent = toFaDigits( next ); }
		syncDangerState( row, next );
		submitForm( input );
	}

	/* وقتی تعداد=۱ شد، دکمهٔ - را قرمز کن تا کاربر بداند کلیکِ بعدی محصول را حذف می‌کند. */
	function syncDangerState( row, qty ) {
		var dec = row.querySelector( '.js-dz-cart-qty-dec' );
		if ( ! dec ) { return; }
		dec.classList.toggle( 'is-danger', qty === 1 );
	}

	function submitForm( input ) {
		var form = input.form;
		if ( ! form ) { return; }
		if ( typeof form.requestSubmit === 'function' ) {
			var btn = form.querySelector( '[name="update_cart"]' );
			if ( btn ) { form.requestSubmit( btn ); } else { form.requestSubmit(); }
		} else {
			form.submit();
		}
	}

	/* ---------- 2) خالی‌کردنِ سبد: همهٔ تعدادها را ۰ کن و فرم را submit کن. ---------- */
	function bindClear() {
		var btn = document.querySelector( '[data-dz-cart-clear]' );
		if ( ! btn ) { return; }
		btn.addEventListener( 'click', function () {
			if ( ! window.confirm( 'همه محصولات از سبد حذف شوند؟' ) ) { return; }
			var inputs = document.querySelectorAll( '.dz-cart-row__qty-input' );
			if ( ! inputs.length ) { return; }
			inputs.forEach( function ( i ) { i.value = '0'; } );
			submitForm( inputs[ 0 ] );
		} );
	}

	/* ---------- 3) تاگلِ کد تخفیف ---------- */
	function bindPromoToggle() {
		var toggle = document.querySelector( '.dz-cart-summary__promo-toggle' );
		var wrap   = document.getElementById( 'dz-cart-promo-wrap' );
		if ( ! toggle || ! wrap ) { return; }
		toggle.addEventListener( 'click', function () {
			var open = wrap.hasAttribute( 'hidden' );
			if ( open ) {
				wrap.removeAttribute( 'hidden' );
				toggle.setAttribute( 'aria-expanded', 'true' );
				var inp = wrap.querySelector( 'input' ); if ( inp ) { inp.focus(); }
			} else {
				wrap.setAttribute( 'hidden', '' );
				toggle.setAttribute( 'aria-expanded', 'false' );
			}
		} );
	}

	/* ---------- 4) نوارِ ارسالِ رایگان: انیمیشن از ۰ تا درصد. ---------- */
	function animateFreebar() {
		var bar = document.querySelector( '.dz-cart-freebar' );
		if ( ! bar ) { return; }
		var fill = bar.querySelector( '.dz-cart-freebar__fill' );
		if ( ! fill ) { return; }
		var target = fill.style.width || '0%';
		fill.style.width = '0%';
		requestAnimationFrame( function () {
			requestAnimationFrame( function () { fill.style.width = target; } );
		} );
	}

	/* ---------- بوت ---------- */
	function boot() {
		bindQtyStepper();
		bindClear();
		bindPromoToggle();
		animateFreebar();
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', boot );
	} else {
		boot();
	}
} )();
