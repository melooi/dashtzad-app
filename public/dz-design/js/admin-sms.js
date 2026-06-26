/**
 * admin-sms.js — تعامل‌های صفحهٔ تنظیمات:
 *   • جابه‌جاییِ فیلدهای پنل پیامکی بر اساس انتخابِ نوعِ پنل
 *   • پنل‌های بازشونده (data-dz-reveal → data-reveal-panel)
 *   • ردیف‌های قابلِ‌افزودن/حذف (data-repeat، مثلِ شبکه‌های اجتماعی)
 *   • ارسالِ پیامکِ تست (AJAX امن)
 *
 * @package dashtzad-theme
 */
( function () {
	'use strict';

	var i18n = ( window.DZ_SMS && DZ_SMS.i18n ) || {};

	/* ---- ۱) جابه‌جاییِ پنل پیامکی ---- */
	function syncProvider( sel ) {
		var val = sel.value;
		document.querySelectorAll( '[data-sms-panel]' ).forEach( function ( p ) {
			p.hidden = ( p.getAttribute( 'data-sms-panel' ) !== val );
		} );
	}
	document.querySelectorAll( '[data-dz-sms-provider]' ).forEach( function ( sel ) {
		syncProvider( sel );
		sel.addEventListener( 'change', function () { syncProvider( sel ); } );
	} );

	/* ---- ۲) پنل‌های بازشونده ---- */
	function syncReveal( cb ) {
		var key = cb.getAttribute( 'data-dz-reveal' );
		document.querySelectorAll( '[data-reveal-panel="' + key + '"]' ).forEach( function ( panel ) {
			panel.hidden = ! cb.checked;
		} );
	}
	document.querySelectorAll( '[data-dz-reveal]' ).forEach( function ( cb ) {
		syncReveal( cb );
		cb.addEventListener( 'change', function () { syncReveal( cb ); } );
	} );

	/* ---- ۳) ردیف‌های قابلِ‌افزودن/حذف ---- */
	function syncRowIcon( select ) {
		if ( ! select ) { return; }
		var row = select.closest( '[data-repeat-row]' );
		if ( ! row ) { return; }
		var holder = row.querySelector( '[data-repeat-icon] i' );
		if ( ! holder ) { return; }
		var opt = select.options[ select.selectedIndex ];
		var cls = ( opt && opt.getAttribute( 'data-icon' ) ) || '';
		holder.className = cls;
	}
	document.querySelectorAll( '[data-repeat-platform]' ).forEach( syncRowIcon );
	document.addEventListener( 'change', function ( e ) {
		var sel = e.target.closest && e.target.closest( '[data-repeat-platform]' );
		if ( sel ) { syncRowIcon( sel ); }
	} );

	var repeatSeq = Date.now();
	document.addEventListener( 'click', function ( e ) {
		var add = e.target.closest && e.target.closest( '[data-repeat-add]' );
		if ( add ) {
			e.preventDefault();
			var wrap = add.closest( '[data-repeat]' );
			var tpl = wrap.querySelector( '[data-repeat-tpl]' );
			var list = wrap.querySelector( '[data-repeat-list]' );
			if ( tpl && list ) {
				var html = ( tpl.innerHTML || '' ).replace( /__i__/g, 'n' + ( repeatSeq++ ) );
				var tmp = document.createElement( 'div' );
				tmp.innerHTML = html.trim();
				var row = tmp.firstElementChild;
				if ( row ) {
					list.appendChild( row );
					syncRowIcon( row.querySelector( '[data-repeat-platform]' ) );
					var focusable = row.querySelector( 'select, input' );
					if ( focusable ) { focusable.focus(); }
				}
			}
			return;
		}
		var rm = e.target.closest && e.target.closest( '[data-repeat-rm]' );
		if ( rm ) {
			e.preventDefault();
			var r = rm.closest( '[data-repeat-row]' );
			if ( r ) { r.remove(); }
			return;
		}
	} );

	/* ---- ۴) ارسالِ پیامکِ تست ---- */
	document.addEventListener( 'click', function ( e ) {
		var btn = e.target.closest && e.target.closest( '[data-dz-sms-test]' );
		if ( ! btn || ! window.DZ_SMS ) { return; }
		e.preventDefault();

		var section = btn.closest( 'section' ) || document;
		var input = section.querySelector( '[data-dz-sms-mobile]' );
		var result = section.querySelector( '[data-dz-sms-result]' );
		var mobile = input ? input.value.trim() : '';

		function say( msg, ok ) {
			if ( ! result ) { return; }
			result.textContent = msg;
			result.classList.toggle( 'is-ok', !! ok );
			result.classList.toggle( 'is-err', ! ok );
		}

		if ( ! mobile ) { say( i18n.nomob || 'شماره را وارد کن.', false ); return; }

		var original = btn.innerHTML;
		btn.disabled = true;
		btn.textContent = i18n.sending || '…';

		var body = new URLSearchParams();
		body.set( 'action', 'dz_sms_test' );
		body.set( 'nonce', DZ_SMS.nonce );
		body.set( 'mobile', mobile );
		// مقادیرِ فعلیِ فرم (نوعِ پنل + کلید/پترنِ نمایان) را هم بفرست تا تست قبل از ذخیره هم کار کند.
		document.querySelectorAll( '[name^="sms_"]' ).forEach( function ( el ) {
			if ( el.name && 'string' === typeof el.value && '' !== el.value.trim() ) {
				body.set( el.name, el.value.trim() );
			}
		} );

		fetch( DZ_SMS.ajaxUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: body.toString()
		} )
			.then( function ( r ) { return r.json(); } )
			.then( function ( res ) {
				if ( res && res.success ) {
					say( ( res.data && res.data.message ) || 'ارسال شد.', true );
				} else {
					say( ( res && res.data && res.data.message ) || i18n.error || 'خطا.', false );
				}
			} )
			.catch( function () { say( i18n.error || 'خطا.', false ); } )
			.finally( function () {
				btn.disabled = false;
				btn.innerHTML = original;
			} );
	} );
}() );
