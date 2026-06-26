/**
 * Single product — رفتارِ صفحهٔ تک‌محصولِ دشت‌زاد.
 * گالری، شمارشِ معکوسِ ویژه، نوارِ خریدِ چسبانِ موبایل، و «اطلاع موجودی» (AJAX → پیامک).
 * منطقِ خرید/واریِیشن از فرمِ نیتیوِ ووکامرس می‌آید؛ این فقط لایهٔ تعاملیِ نمایش است.
 *
 * @package dashtzad-theme
 */
( function () {
	'use strict';
	var FA = '۰۱۲۳۴۵۶۷۸۹';
	function pad2Fa( n ) { return String( n ).padStart( 2, '0' ).replace( /[0-9]/g, function ( d ) { return FA[ +d ]; } ); }
	var pdp = document.querySelector( '.dz-pdp' );
	if ( ! pdp ) { return; }

	/* ---------- gallery ---------- */
	var main = document.getElementById( 'dzGalMain' );
	var thumbs = [].slice.call( pdp.querySelectorAll( '#dzGalThumbs .dz-thumb' ) );
	var gi = 0;
	function showGal( i ) {
		if ( ! thumbs.length || ! main ) { return; }
		gi = ( i + thumbs.length ) % thumbs.length;
		var src = thumbs[ gi ].getAttribute( 'data-src' );
		if ( src && main.tagName === 'IMG' ) { main.src = src; }
		thumbs.forEach( function ( t, k ) { t.classList.toggle( 'is-active', k === gi ); } );
	}
	thumbs.forEach( function ( t, k ) { t.addEventListener( 'click', function () { showGal( k ); } ); } );
	var prev = pdp.querySelector( '[data-gal-prev]' ), next = pdp.querySelector( '[data-gal-next]' );
	if ( prev ) { prev.addEventListener( 'click', function () { showGal( gi - 1 ); } ); }
	if ( next ) { next.addEventListener( 'click', function () { showGal( gi + 1 ); } ); }

	/* ---------- countdown (special timer) ---------- */
	var cd = pdp.querySelector( '[data-countdown]' );
	if ( cd ) {
		var endTs = parseInt( cd.getAttribute( 'data-countdown' ), 10 ) * 1000;
		var h = cd.querySelector( '[data-cd="h"]' ), m = cd.querySelector( '[data-cd="m"]' ), s = cd.querySelector( '[data-cd="s"]' );
		var tick = function () {
			var diff = endTs - Date.now();
			if ( diff < 0 ) { diff = 0; }
			if ( h ) { h.textContent = pad2Fa( Math.floor( diff / 3600000 ) ); }
			if ( m ) { m.textContent = pad2Fa( Math.floor( ( diff % 3600000 ) / 60000 ) ); }
			if ( s ) { s.textContent = pad2Fa( Math.floor( ( diff % 60000 ) / 1000 ) ); }
		};
		tick();
		setInterval( tick, 1000 );
	}

	/* ---------- sticky buy bar ---------- */
	var buybar = document.getElementById( 'dzBuybar' );
	var buybox = pdp.querySelector( '.dz-buybox' );
	if ( buybar && buybox && 'IntersectionObserver' in window ) {
		new IntersectionObserver( function ( entries ) {
			entries.forEach( function ( en ) { buybar.classList.toggle( 'is-on', ! en.isIntersecting ); } );
		}, { threshold: 0 } ).observe( buybox );
	}
	var barAdd = pdp.querySelector( '[data-buybar-add]' );
	if ( barAdd ) {
		barAdd.addEventListener( 'click', function () {
			var btn = buybox.querySelector( '.single_add_to_cart_button' );
			var form = buybox.querySelector( 'form.cart' );
			if ( btn && ! btn.classList.contains( 'disabled' ) ) { btn.click(); }
			else if ( form ) { form.requestSubmit ? form.requestSubmit() : form.submit(); }
		} );
	}

	/* ---------- notify stock (AJAX → SMS) ---------- */
	var nBtn = pdp.querySelector( '[data-notify-btn]' );
	if ( nBtn && 'undefined' !== typeof dzShop ) {
		var nInput = pdp.querySelector( '[data-notify-input]' );
		nBtn.addEventListener( 'click', function () {
			var mobile = nInput ? nInput.value.trim() : '';
			if ( ( mobile.match( /[0-9۰-۹]/g ) || [] ).length < 10 ) {
				nInput && nInput.focus();
				return;
			}
			nBtn.disabled = true;
			var body = new URLSearchParams();
			body.set( 'action', 'dz_notify_stock' );
			body.set( 'nonce', dzShop.nonce );
			body.set( 'product_id', nBtn.getAttribute( 'data-product' ) );
			body.set( 'mobile', mobile );
			fetch( dzShop.ajaxUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() } )
				.then( function ( r ) { return r.json(); } )
				.then( function ( res ) {
					var wrap = nBtn.parentNode;
					if ( res && res.success ) {
						wrap.innerHTML = '<div class="dz-buybox__success is-on"><i class="ri-check-line"></i> ثبت شد ✓ به‌محضِ موجود شدن با پیامک خبر می‌دهیم.</div>';
					} else {
						nBtn.disabled = false;
						nBtn.textContent = ( res && res.data && res.data.message ) ? res.data.message : 'خطا، دوباره تلاش کنید';
					}
				} )
				.catch( function () { nBtn.disabled = false; } );
		} );
	}
}() );
