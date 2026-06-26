/**
 * auth.js — رفتارِ فرمِ ورود/ثبت‌نام.
 *   • تب‌های پیامکی / نام‌کاربری (با sync کردنِ aria-selected)
 *   • فیلدِ موبایل: تبدیلِ ارقامِ فارسی/عربی به انگلیسی + سقفِ ۱۱ رقم
 *   • کدِ ۵ خانه‌ای: حرکتِ خودکار، چسباندن (paste)، backspace، فارسی→انگلیسی
 *   • مرحلهٔ کد: نمایش شمارهٔ ارسال، دکمهٔ ویرایش، تایمرِ ۲ دقیقه‌ای فارسی، ارسال دوباره
 *   • نمایش/پنهانِ رمز
 *   • فراموشیِ رمز به‌صورتِ کشویی (همان فلوی OTP، با action=forgot)
 *   • پاپ‌آپ با [data-dz-auth-open] / [data-dz-auth-close]
 *
 * @package dashtzad-theme
 */
( function () {
	'use strict';

	if ( ! window.DZ_AUTH ) { return; }
	var CFG = window.DZ_AUTH;
	var OTP_LEN = 5;
	var TIMER_SECS = 120;

	/** تبدیلِ ارقامِ فارسی و عربی به انگلیسی و حذفِ غیرعدد. */
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

	/** تبدیلِ ارقامِ انگلیسی به فارسی (برای نمایشِ تایمر/اکوی شماره). */
	function toFa( str ) {
		return String( str ).replace( /\d/g, function ( d ) {
			return String.fromCharCode( d.charCodeAt( 0 ) + 1728 );
		} );
	}

	/** قالبِ MM:SS فارسی. */
	function fmtTimer( secs ) {
		var m = Math.floor( secs / 60 );
		var s = secs % 60;
		var mm = ( m < 10 ? '0' : '' ) + m;
		var ss = ( s < 10 ? '0' : '' ) + s;
		return toFa( mm + ':' + ss );
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

	function initAuth( root ) {
		if ( ! root ) { return; }
		var form = root.querySelector( '[data-auth-form]' );
		if ( ! form || form.dataset.dzInit ) { return; }
		form.dataset.dzInit = '1';

		var panes = {};
		root.querySelectorAll( '[data-auth-pane]' ).forEach( function ( p ) {
			panes[ p.getAttribute( 'data-auth-pane' ) ] = p;
		} );
		var msg = root.querySelector( '[data-auth-msg]' );

		function errEl( key ) { return root.querySelector( '[data-auth-err="' + key + '"]' ); }
		function setErr( key, text ) {
			var el = errEl( key );
			if ( el ) { el.textContent = text || ''; }
		}
		function clearAllErr() {
			root.querySelectorAll( '[data-auth-err]' ).forEach( function ( el ) { el.textContent = ''; } );
		}
		function say( text, ok ) {
			if ( ! msg ) { return; }
			msg.textContent = text || '';
			msg.classList.toggle( 'is-err', !! ( text && ! ok ) );
			msg.classList.toggle( 'is-ok', !! ( text && ok ) );
		}
		function busy( btn, on ) { if ( btn ) { btn.disabled = !! on; } }

		/* ---- تب‌ها ---------------------------------------------------- */
		var tabs = root.querySelectorAll( '[data-auth-tab]' );
		function activateTab( name ) {
			tabs.forEach( function ( t ) {
				var on = t.getAttribute( 'data-auth-tab' ) === name;
				t.classList.toggle( 'is-active', on );
				t.setAttribute( 'aria-selected', on ? 'true' : 'false' );
			} );
			Object.keys( panes ).forEach( function ( k ) { panes[ k ].hidden = ( k !== name ); } );
			clearAllErr(); say( '' );
		}
		tabs.forEach( function ( t ) {
			t.addEventListener( 'click', function () { activateTab( t.getAttribute( 'data-auth-tab' ) ); } );
		} );

		/* ---- مراحلِ پنلِ پیامکی --------------------------------------- */
		var smsPane = panes.sms;
		function smsStep( name ) {
			if ( ! smsPane ) { return; }
			smsPane.querySelectorAll( '[data-auth-step]' ).forEach( function ( s ) {
				s.hidden = s.getAttribute( 'data-auth-step' ) !== name;
			} );
		}

		var mobileInput = root.querySelector( '[data-auth-mobile]' );
		if ( mobileInput ) {
			mobileInput.addEventListener( 'input', function () {
				var v = toLatin( mobileInput.value ).slice( 0, 11 );
				if ( v !== mobileInput.value ) { mobileInput.value = v; }
			} );
		}

		/* ---- کدِ ۵ خانه‌ای -------------------------------------------- */
		var otpWrap = root.querySelector( '[data-auth-otp]' );
		var boxes = otpWrap ? Array.prototype.slice.call( otpWrap.querySelectorAll( '[data-otp-box]' ) ) : [];
		function otpValue() { return boxes.map( function ( b ) { return b.value; } ).join( '' ); }
		function otpClear() {
			boxes.forEach( function ( b ) { b.value = ''; b.classList.remove( 'is-filled' ); } );
		}
		function otpMark() {
			boxes.forEach( function ( b ) { b.classList.toggle( 'is-filled', '' !== b.value ); } );
		}
		boxes.forEach( function ( box, idx ) {
			box.addEventListener( 'input', function () {
				var d = toLatin( box.value );
				box.value = d.slice( -1 );
				otpMark();
				if ( box.value && idx < boxes.length - 1 ) { boxes[ idx + 1 ].focus(); }
			} );
			box.addEventListener( 'keydown', function ( e ) {
				if ( 'Backspace' === e.key && ! box.value && idx > 0 ) { boxes[ idx - 1 ].focus(); }
			} );
			box.addEventListener( 'paste', function ( e ) {
				e.preventDefault();
				var raw = ( e.clipboardData || window.clipboardData ).getData( 'text' );
				var txt = toLatin( raw );
				for ( var i = 0; i < boxes.length; i++ ) { boxes[ i ].value = txt.charAt( i ) || ''; }
				otpMark();
				var next = Math.min( txt.length, boxes.length - 1 );
				if ( boxes[ next ] ) { boxes[ next ].focus(); }
			} );
		} );

		/* ---- نمایش/پنهانِ رمز ----------------------------------------- */
		var eye = root.querySelector( '[data-auth-eye]' );
		var passInput = root.querySelector( '[data-auth-password]' );
		if ( eye && passInput ) {
			eye.addEventListener( 'click', function () {
				var show = 'password' === passInput.type;
				passInput.type = show ? 'text' : 'password';
				var ic = eye.querySelector( 'i' );
				if ( ic ) { ic.className = show ? 'ri-eye-off-line' : 'ri-eye-line'; }
				eye.setAttribute( 'aria-label', show ? 'پنهان کردن رمز' : 'نمایش رمز' );
			} );
		}

		/* ---- تایمرِ ارسالِ دوباره (۲ دقیقه، فارسی) ------------------- */
		var resendBtn = root.querySelector( '[data-auth-resend]' );
		var timerEl = root.querySelector( '[data-auth-timer]' );
		var timerId = null;
		function startTimer() {
			if ( ! timerEl ) { return; }
			var left = TIMER_SECS;
			if ( resendBtn ) { resendBtn.disabled = true; }
			timerEl.classList.remove( 'is-done' );
			clearInterval( timerId );
			timerEl.textContent = fmtTimer( left );
			timerId = setInterval( function () {
				left--;
				if ( left <= 0 ) {
					clearInterval( timerId );
					timerEl.textContent = fmtTimer( 0 );
					timerEl.classList.add( 'is-done' );
					if ( resendBtn ) { resendBtn.disabled = false; }
					return;
				}
				timerEl.textContent = fmtTimer( left );
			}, 1000 );
		}
		function stopTimer() {
			clearInterval( timerId );
			if ( timerEl ) { timerEl.textContent = fmtTimer( 0 ); timerEl.classList.add( 'is-done' ); }
			if ( resendBtn ) { resendBtn.disabled = false; }
		}

		/* ---- اکشن‌ها ---------------------------------------------------- */
		var echoEl = root.querySelector( '[data-auth-echo]' );
		function showEcho( mobile ) {
			if ( echoEl ) { echoEl.textContent = toFa( mobile ); }
		}

		function sendCode( btn ) {
			var mobile = mobileInput ? toLatin( mobileInput.value ) : '';
			clearAllErr();
			if ( mobile.length < 11 || mobile.indexOf( '09' ) !== 0 ) {
				setErr( 'mobile', 'شمارهٔ موبایل معتبر نیست.' );
				return;
			}
			busy( btn, true ); say( '' );
			post( 'dz_auth_send', { mobile: mobile } ).then( function ( res ) {
				busy( btn, false );
				if ( res && res.success ) {
					showEcho( mobile );
					smsStep( 'code' );
					otpClear();
					setTimeout( function () { if ( boxes[ 0 ] ) { boxes[ 0 ].focus(); } }, 50 );
					startTimer();
					say( res.data && res.data.message ? res.data.message : '', true );
				} else {
					setErr( 'mobile', res && res.data && res.data.message ? res.data.message : 'خطا در ارسال.' );
				}
			} ).catch( function () { busy( btn, false ); say( 'ارتباط برقرار نشد.', false ); } );
		}

		function verify( btn ) {
			var mobile = mobileInput ? toLatin( mobileInput.value ) : '';
			var code = otpValue();
			clearAllErr();
			if ( code.length < OTP_LEN ) { setErr( 'code', 'کدِ ' + toFa( OTP_LEN ) + ' رقمی را وارد کنید.' ); return; }
			busy( btn, true ); say( '' );
			post( 'dz_auth_verify', { mobile: mobile, code: code } ).then( function ( res ) {
				if ( res && res.success ) {
					say( 'ورود موفق — در حال انتقال…', true );
					window.location.href = ( res.data && res.data.redirect ) || window.location.href;
				} else {
					busy( btn, false );
					setErr( 'code', res && res.data && res.data.message ? res.data.message : 'کدِ واردشده نادرست است.' );
				}
			} ).catch( function () { busy( btn, false ); say( 'ارتباط برقرار نشد.', false ); } );
		}

		function passwordLogin( btn ) {
			var login = root.querySelector( '[data-auth-login]' );
			var lv = login ? login.value.trim() : '';
			var pv = passInput ? passInput.value : '';
			clearAllErr();
			if ( ! lv || ! pv ) { setErr( 'pass', 'نام کاربری و رمز عبور را وارد کنید.' ); return; }
			busy( btn, true ); say( '' );
			post( 'dz_auth_password', { login: lv, password: pv } ).then( function ( res ) {
				if ( res && res.success ) {
					say( 'ورود موفق — در حال انتقال…', true );
					window.location.href = ( res.data && res.data.redirect ) || window.location.href;
				} else {
					busy( btn, false );
					setErr( 'pass', res && res.data && res.data.message ? res.data.message : 'ورود ناموفق بود.' );
				}
			} ).catch( function () { busy( btn, false ); say( 'ارتباط برقرار نشد.', false ); } );
		}

		/* ---- فراموشیِ رمز (کشویی) ------------------------------------ */
		var forgotBox = root.querySelector( '[data-auth-forgot]' );
		var forgotToggle = root.querySelector( '[data-auth-forgot-toggle]' );
		var forgotCancel = root.querySelector( '[data-auth-forgot-cancel]' );
		var forgotMobile = root.querySelector( '[data-auth-forgot-mobile]' );
		if ( forgotMobile ) {
			forgotMobile.addEventListener( 'input', function () {
				var v = toLatin( forgotMobile.value ).slice( 0, 11 );
				if ( v !== forgotMobile.value ) { forgotMobile.value = v; }
			} );
		}
		if ( forgotToggle && forgotBox ) {
			forgotToggle.addEventListener( 'click', function () {
				forgotBox.hidden = ! forgotBox.hidden;
				if ( ! forgotBox.hidden && forgotMobile ) { forgotMobile.focus(); }
				setErr( 'forgot', '' );
			} );
		}
		if ( forgotCancel && forgotBox ) {
			forgotCancel.addEventListener( 'click', function () { forgotBox.hidden = true; setErr( 'forgot', '' ); } );
		}
		function sendForgot( btn ) {
			var mobile = forgotMobile ? toLatin( forgotMobile.value ) : '';
			clearAllErr();
			if ( mobile.length < 11 || mobile.indexOf( '09' ) !== 0 ) {
				setErr( 'forgot', 'شمارهٔ موبایل معتبر نیست.' );
				return;
			}
			busy( btn, true ); say( '' );
			post( 'dz_auth_forgot', { mobile: mobile } ).then( function ( res ) {
				busy( btn, false );
				if ( res && res.success ) {
					/* پرشِ نرم به فلوی OTP در پنلِ پیامکی: شماره را پر کن و کد را بفرست. */
					if ( mobileInput ) { mobileInput.value = mobile; }
					activateTab( 'sms' );
					showEcho( mobile );
					smsStep( 'code' );
					otpClear();
					setTimeout( function () { if ( boxes[ 0 ] ) { boxes[ 0 ].focus(); } }, 50 );
					startTimer();
					say( res.data && res.data.message ? res.data.message : 'کدِ بازیابی پیامک شد.', true );
					if ( forgotBox ) { forgotBox.hidden = true; }
				} else {
					setErr( 'forgot', res && res.data && res.data.message ? res.data.message : 'خطا در ارسال کدِ بازیابی.' );
				}
			} ).catch( function () { busy( btn, false ); say( 'ارتباط برقرار نشد.', false ); } );
		}

		/* ---- ارسالِ فرم --------------------------------------------- */
		form.addEventListener( 'submit', function ( e ) {
			e.preventDefault();
			var btn = e.submitter || form.querySelector( '[data-auth-action]:not([hidden])' );
			var action = btn ? btn.getAttribute( 'data-auth-action' ) : 'send';
			if ( 'send' === action ) { sendCode( btn ); }
			else if ( 'verify' === action ) { verify( btn ); }
			else if ( 'password' === action ) { passwordLogin( btn ); }
			else if ( 'forgot' === action ) { sendForgot( btn ); }
		} );

		/* ---- بازگشت (ویرایش شماره) + ارسالِ دوباره ------------------- */
		var back = root.querySelector( '[data-auth-back]' );
		if ( back ) {
			back.addEventListener( 'click', function () {
				stopTimer();
				smsStep( 'mobile' );
				clearAllErr(); say( '' );
				if ( mobileInput ) { setTimeout( function () { mobileInput.focus(); }, 50 ); }
			} );
		}
		if ( resendBtn ) {
			resendBtn.addEventListener( 'click', function () { sendCode( null ); } );
		}
	}

	document.querySelectorAll( '.dz-auth' ).forEach( initAuth );

	/* ---- پاپ‌آپ ---------------------------------------------------- */
	var pop = document.querySelector( '[data-dz-authpop]' );
	function openPop() {
		if ( ! pop ) { return; }
		pop.hidden = false;
		document.documentElement.style.overflow = 'hidden';
		var f = pop.querySelector( '[data-auth-mobile]' );
		if ( f ) { f.focus(); }
	}
	function closePop() {
		if ( ! pop ) { return; }
		pop.hidden = true;
		document.documentElement.style.overflow = '';
	}
	document.addEventListener( 'click', function ( e ) {
		var open = e.target.closest && e.target.closest( '[data-dz-auth-open]' );
		if ( open && pop ) { e.preventDefault(); openPop(); return; }
		if ( e.target.closest && e.target.closest( '[data-dz-auth-close]' ) ) { e.preventDefault(); closePop(); }
	} );
	document.addEventListener( 'keydown', function ( e ) {
		if ( 'Escape' === e.key && pop && ! pop.hidden ) { closePop(); }
	} );
}() );
