/**
 * دشت‌زاد ادمین — دکمهٔ ذخیرهٔ بالای صفحهٔ تنظیمات.
 * دکمهٔ سرصفحه (data-dz-save) فرمِ بخشِ فعال را submit می‌کند تا نیازی به
 * دکمهٔ پایینِ هر بخش نباشد.
 */
( function () {
	'use strict';

	function activeForm() {
		var body = document.querySelector( '.dz-settings__body' );
		if ( ! body ) {
			return null;
		}
		return body.querySelector( 'form' );
	}

	document.querySelectorAll( '[data-dz-save]' ).forEach( function ( btn ) {
		btn.addEventListener( 'click', function ( e ) {
			e.preventDefault();
			var form = activeForm();
			if ( ! form ) {
				return;
			}
			if ( form.requestSubmit ) {
				form.requestSubmit();
			} else {
				form.submit();
			}
		} );
	} );
}() );
