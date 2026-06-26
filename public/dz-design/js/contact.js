/**
 * contact.js — رفتارِ فرمِ تماس با ما.
 *   • نرمال‌سازیِ شمارهٔ موبایل (فارسی/عربی → انگلیسی + سقفِ ۱۱ رقم)
 *   • ولیدیشنِ سمت کاربر + ارسالِ AJAX با nonce
 *   • نمایشِ پیامِ موفقیت + reset فرم
 *
 * @package dashtzad-theme
 */
( function () {
	'use strict';

	if ( ! window.DZ_CONTACT ) { return; }
	var CFG = window.DZ_CONTACT;

	function toLatin( str ) {
		if ( ! str ) { return ''; }
		var fa = '۰۱۲۳۴۵۶۷۸۹';
		var ar = '٠١٢٣٤٥٦٧٨٩';
		var out = '';
		for ( var i = 0; i < str.length; i++ ) {
			var ch = str.charAt( i );
			var f = fa.indexOf( ch );
			var a = ar.indexOf( ch );
			if ( f > -1 ) { out += f; }
			else if ( a > -1 ) { out += a; }
			else if ( ch >= '0' && ch <= '9' ) { out += ch; }
		}
		return out;
	}

	function post( action, data ) {
		var body = new URLSearchParams();
		body.set( 'action', action );
		body.set( 'nonce', CFG.nonce );
		Object.keys( data ).forEach( function ( k ) { body.set( k, data[ k ] ); } );
		return fetch( CFG.ajaxUrl, {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: body.toString()
		} ).then( function ( r ) { return r.json(); } );
	}

	function initForm( form ) {
		if ( ! form || form.dataset.dzInit ) { return; }
		form.dataset.dzInit = '1';

		var errEl    = form.querySelector( '[data-dz-contact-err]' );
		var okEl     = form.querySelector( '[data-dz-contact-ok]' );
		var submit   = form.querySelector( '[data-dz-contact-submit]' );
		var phone    = form.querySelector( '[data-cf-input="phone"]' );

		if ( phone ) {
			phone.addEventListener( 'input', function () {
				var v = toLatin( phone.value ).slice( 0, 11 );
				if ( v !== phone.value ) { phone.value = v; }
			} );
		}

		function say( text ) { if ( errEl ) { errEl.textContent = text || ''; } }
		function busy( on ) { if ( submit ) { submit.disabled = !! on; } }
		function showOk( on ) { if ( okEl ) { okEl.hidden = ! on; } }

		form.addEventListener( 'submit', function ( e ) {
			e.preventDefault();
			say( '' ); showOk( false );

			var data = {
				name:    ( form.querySelector( '[data-cf-input="name"]' ) || {} ).value || '',
				phone:   phone ? toLatin( phone.value ) : '',
				subject: ( form.querySelector( '[data-cf-input="subject"]' ) || {} ).value || '',
				type:    ( form.querySelector( '[data-cf-input="type"]' ) || {} ).value || '',
				text:    ( form.querySelector( '[data-cf-input="text"]' ) || {} ).value || '',
				dz_hp:   ( form.querySelector( '[name="dz_hp"]' ) || {} ).value || '',
				page_id: ( form.querySelector( '[name="page_id"]' ) || {} ).value || ''
			};

			if ( ! data.name.trim() )    { say( 'نام را وارد کنید.' ); return; }
			if ( data.phone.length < 11 || data.phone.indexOf( '09' ) !== 0 ) { say( 'شمارهٔ موبایل معتبر نیست.' ); return; }
			if ( ! data.subject.trim() ) { say( 'موضوع پیام را وارد کنید.' ); return; }
			if ( ! data.type )           { say( 'نوع درخواست را انتخاب کنید.' ); return; }
			if ( ! data.text.trim() )    { say( 'متن پیام را وارد کنید.' ); return; }

			busy( true );
			post( 'dz_contact_submit', data ).then( function ( res ) {
				busy( false );
				if ( res && res.success ) {
					form.reset();
					showOk( true );
					setTimeout( function () { showOk( false ); }, 8000 );
				} else {
					say( res && res.data && res.data.message ? res.data.message : 'ارسالِ پیام با خطا روبه‌رو شد.' );
				}
			} ).catch( function () { busy( false ); say( 'ارتباط برقرار نشد.' ); } );
		} );
	}

	document.querySelectorAll( '[data-dz-contact]' ).forEach( initForm );
}() );
