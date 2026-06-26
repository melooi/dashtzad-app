/**
 * Admin — UXِ پنلِ «وضعیت فروش دشت‌زاد» در ویرایش محصول.
 * فقط رفتارِ نمایشی: باز/بستِ گروه‌ها، آشکارسازیِ شرطی، هشدارهای مدیریتی.
 * هیچ تصمیمِ وضعیتی اینجا گرفته نمی‌شود — تصمیم نهایی با resolver سمت سرور است.
 *
 * @package dashtzad-theme
 */
( function () {
	'use strict';
	var panel = document.getElementById( 'dz_state_panel' );
	if ( ! panel ) {
		return;
	}
	var $  = function ( s, r ) { return ( r || panel ).querySelector( s ); };
	var $$ = function ( s, r ) { return [].slice.call( ( r || panel ).querySelectorAll( s ) ); };

	// آکاردئونِ گروه‌ها
	$$( '[data-grp-toggle]' ).forEach( function ( h ) {
		h.addEventListener( 'click', function () { h.closest( '[data-grp]' ).classList.toggle( 'is-open' ); } );
	} );

	// segmentها (radio) → کلاسِ is-active + recompute
	$$( '.dz-seg' ).forEach( function ( seg ) {
		seg.addEventListener( 'change', function () {
			$$( 'label', seg ).forEach( function ( l ) { l.classList.toggle( 'is-active', l.querySelector( 'input' ).checked ); } );
			applyCond();
			recompute();
		} );
	} );

	// رنگِ نشان (radio)
	$$( '.dz-tone__opt input' ).forEach( function ( inp ) {
		inp.addEventListener( 'change', function () {
			$$( '.dz-tone__opt' ).forEach( function ( l ) { l.classList.toggle( 'is-on', l.querySelector( 'input' ).checked ); } );
		} );
	} );

	function mode() { var c = $( '[data-seg="mode"] input:checked' ); return c ? c.value : 'auto'; }
	function newMode() { var c = $( '[data-seg="newmode"] input:checked' ); return c ? c.value : 'auto'; }

	function applyCond() {
		var m = mode();
		$$( '[data-cond-mode]' ).forEach( function ( el ) {
			el.classList.toggle( 'is-on', el.getAttribute( 'data-cond-mode' ).split( ' ' ).indexOf( m ) > -1 );
		} );
		var nm = newMode();
		$$( '[data-cond-new]' ).forEach( function ( el ) {
			el.classList.toggle( 'is-on', el.getAttribute( 'data-cond-new' ) === nm );
		} );
	}

	// شرط‌های چک‌باکسی
	$$( '[data-cond-check]' ).forEach( function ( el ) {
		var src = document.getElementById( el.getAttribute( 'data-cond-check' ) );
		if ( ! src ) { return; }
		var sync = function () { el.classList.toggle( 'is-on', src.checked ); };
		src.addEventListener( 'change', sync );
		sync();
	} );

	$$( '[data-watch]' ).forEach( function ( el ) {
		el.addEventListener( 'change', recompute );
	} );

	function isChecked( id ) { var el = document.getElementById( id ); return el && el.checked; }
	function hasVal( id ) { var el = document.getElementById( id ); return el && el.value; }
	function manualState() { var s = $( 'select[name="_dz_manual_state"]' ); return s ? s.value : 'none'; }

	// هشدارهای مدیریتی (راهنما؛ گارد واقعی سمت سرور)
	function recompute() {
		var w = [];
		var m = mode();
		if ( ( m === 'manual_override' || m === 'manual_lock' ) && manualState() === 'available' ) {
			w.push( [ 'warn', 'اگر این محصول موجودی نداشته باشد، حتی با انتخاب دستی «موجود»، خرید فعال نمی‌شود.' ] );
		}
		if ( isChecked( 'contact' ) ) {
			w.push( [ 'info', 'در حالت «تماس بگیرید»، افزودن به سبد غیرفعال می‌شود.' ] );
		}
		if ( isChecked( 'discont' ) ) {
			w.push( [ 'block', 'محصول متوقف‌شده قابل خرید نیست. بهتر است محصول جایگزین انتخاب شود.' ] );
		}
		if ( isChecked( 'special' ) && ! hasVal( 'specialEnd' ) ) {
			w.push( [ 'info', 'برای کمپین ویژه، تاریخ پایان مشخص کنید.' ] );
		}
		if ( newMode() === 'force' && ! hasVal( 'newUntil' ) ) {
			w.push( [ 'info', 'برای نمایش اجباری «جدید»، تاریخ پایان مشخص کنید.' ] );
		}

		var host = document.getElementById( 'dzStateWarns' );
		if ( ! host ) { return; }
		host.innerHTML = '';
		w.forEach( function ( x ) {
			var d = document.createElement( 'div' );
			d.className = 'dz-warn dz-warn--' + x[0];
			var icon = x[0] === 'block' ? 'ri-error-warning-fill' : ( x[0] === 'warn' ? 'ri-alert-line' : 'ri-information-line' );
			d.innerHTML = '<i class="' + icon + '"></i><span></span>';
			d.querySelector( 'span' ).textContent = x[1];
			host.appendChild( d );
		} );
	}

	var ms = $( 'select[name="_dz_manual_state"]' );
	if ( ms ) { ms.addEventListener( 'change', recompute ); }

	applyCond();
	recompute();
}() );
