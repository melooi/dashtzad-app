/**
 * payment.js — رفتارِ صفحاتِ نتیجهٔ پرداخت (موفق/ناموفق).
 *   • کپیِ شماره سفارش / کدِ پیگیری + توستِ موفق
 *   • چاپ/دانلودِ فاکتور (window.print)
 *   • روشن‌شدنِ مرحله‌ایِ تایم‌لاینِ وضعیت
 *   • تایمرِ نگه‌داریِ سبد (localStorage، فارسی)
 *
 * @package dashtzad-theme
 */
( function () {
	'use strict';

	function toFa( str ) {
		return String( str ).replace( /[0-9]/g, function ( d ) { return '۰۱۲۳۴۵۶۷۸۹'[ d ]; } );
	}
	function pad( n ) { return n < 10 ? '0' + n : '' + n; }

	/* ---- توست ---- */
	var toast = document.querySelector( '[data-pay-toast]' );
	var toastTimer = null;
	function flashToast() {
		if ( ! toast ) { return; }
		toast.setAttribute( 'data-show', 'true' );
		clearTimeout( toastTimer );
		toastTimer = setTimeout( function () { toast.removeAttribute( 'data-show' ); }, 1900 );
	}

	function copyText( txt, done ) {
		if ( navigator.clipboard && navigator.clipboard.writeText ) {
			navigator.clipboard.writeText( txt ).then( done, done );
		} else {
			var ta = document.createElement( 'textarea' );
			ta.value = txt;
			document.body.appendChild( ta );
			ta.select();
			try { document.execCommand( 'copy' ); } catch ( e ) {}
			document.body.removeChild( ta );
			done();
		}
	}

	/* ---- کپیِ شماره سفارش (با توست) ---- */
	document.querySelectorAll( '[data-pay-copy]' ).forEach( function ( btn ) {
		btn.addEventListener( 'click', function () {
			copyText( btn.getAttribute( 'data-pay-copy' ) || '', flashToast );
		} );
	} );

	/* ---- کپیِ کدِ پیگیری (با تغییرِ متنِ دکمه) ---- */
	document.querySelectorAll( '[data-pay-copy-code]' ).forEach( function ( btn ) {
		var original = btn.innerHTML;
		btn.addEventListener( 'click', function () {
			copyText( btn.getAttribute( 'data-pay-copy-code' ) || '', function () {
				btn.classList.add( 'is-copied' );
				btn.innerHTML = '<i class="ri-check-line"></i> کپی شد';
				setTimeout( function () { btn.classList.remove( 'is-copied' ); btn.innerHTML = original; }, 1800 );
			} );
		} );
	} );

	/* ---- چاپ / دانلودِ فاکتور ---- */
	document.querySelectorAll( '[data-pay-print]' ).forEach( function ( btn ) {
		btn.addEventListener( 'click', function () { window.print(); } );
	} );

	/* ---- تایم‌لاینِ وضعیت: روشن‌شدنِ مرحله‌ای ---- */
	( function () {
		var tl = document.querySelector( '[data-pay-track]' );
		if ( ! tl ) { return; }
		var steps = Array.prototype.slice.call( tl.querySelectorAll( '.dz-pay-track__step' ) );
		var played = false;
		function play() {
			if ( played ) { return; }
			played = true;
			var delay = 200;
			steps.forEach( function ( step ) {
				setTimeout( function () { step.classList.add( 'lit' ); }, delay );
				delay += step.classList.contains( 'is-pending' ) ? 320 : 900;
			} );
		}
		if ( 'IntersectionObserver' in window ) {
			var io = new IntersectionObserver( function ( entries ) {
				entries.forEach( function ( e ) { if ( e.isIntersecting ) { play(); io.disconnect(); } } );
			}, { threshold: 0.2 } );
			io.observe( tl );
		}
		setTimeout( play, 900 );
	}() );

	/* ---- تایمرِ نگه‌داریِ سبد ---- */
	( function () {
		var box = document.querySelector( '[data-pay-hold]' );
		if ( ! box ) { return; }
		var clock = box.querySelector( '[data-pay-hold-clock]' );
		var bar   = box.querySelector( '[data-pay-hold-bar]' );
		var label = box.querySelector( '[data-pay-hold-label]' );
		var noteWrap = document.querySelector( '[data-pay-hold-note]' );
		var note  = noteWrap ? noteWrap.querySelector( 'span' ) : null;
		var mins  = parseInt( box.getAttribute( 'data-hold-min' ) || '15', 10 );
		var KEY   = 'dz_pay_hold_until';
		var SKEY  = 'dz_pay_hold_start';
		var DUR   = mins * 60 * 1000;

		// زمانِ شروع و پایان را با هم نگه می‌داریم تا «نوار» همیشه از همان پنجره‌ای
		// محاسبه شود که «ساعت» از آن می‌خواند → هیچ‌وقت ناهماهنگ نمی‌شوند.
		var now0  = Date.now();
		var until = parseInt( localStorage.getItem( KEY ) || '0', 10 );
		var start = parseInt( localStorage.getItem( SKEY ) || '0', 10 );
		if ( ! until || until <= now0 || ! start || start >= until ) {
			start = now0;
			until = start + DUR;
			try { localStorage.setItem( KEY, String( until ) ); localStorage.setItem( SKEY, String( start ) ); } catch ( e ) {}
		}
		var span = Math.max( 1, until - start );

		// نوار را با عرضِ درست paint می‌کنیم بدونِ انیمیشنِ اولیه (تا با ساعت یکی باشد).
		function setBar( pct, animate ) {
			if ( ! bar ) { return; }
			if ( ! animate ) { bar.style.transition = 'none'; }
			bar.style.width = pct + '%';
			if ( ! animate ) { void bar.offsetWidth; bar.style.transition = ''; }
		}

		var timer = setInterval( function () { render( true ); }, 1000 );
		function render( animate ) {
			var ms = until - Date.now();
			if ( ms <= 0 ) {
				if ( clock ) { clock.textContent = '۰۰:۰۰'; }
				box.classList.add( 'is-expired' );
				setBar( 0, animate );
				if ( label ) { label.textContent = 'زمان نگه‌داری سبد به پایان رسید'; }
				if ( note ) { note.textContent = 'ممکن است برخی قیمت‌ها و موجودی‌ها به‌روزرسانی شده باشند.'; }
				clearInterval( timer );
				return;
			}
			var m = Math.floor( ms / 60000 );
			var s = Math.floor( ( ms % 60000 ) / 1000 );
			if ( clock ) { clock.textContent = toFa( pad( m ) + ':' + pad( s ) ); }
			setBar( Math.max( 0, Math.min( 100, ms / span * 100 ) ), animate );
		}
		render( false );
	}() );
}() );
