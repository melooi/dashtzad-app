/**
 * admin-media.js — انتخاب لوگو با آپلودگرِ رسانهٔ وردپرس (wp.media).
 * فقط شناسهٔ پیوست را در input مخفی می‌گذارد و پیش‌نمایش را به‌روز می‌کند.
 *
 * @package dashtzad-theme
 */
( function () {
	'use strict';

	function emptyMarkup() {
		var label = ( window.DZ_MEDIA && DZ_MEDIA.empty ) ? DZ_MEDIA.empty : '';
		return '<span class="dz-media__empty"><i class="ri-image-add-line" aria-hidden="true"></i> ' + label + '</span>';
	}

	document.addEventListener( 'click', function ( e ) {
		var pick = e.target.closest && e.target.closest( '[data-dz-media-pick]' );
		var remove = e.target.closest && e.target.closest( '[data-dz-media-remove]' );

		if ( pick ) {
			e.preventDefault();
			if ( ! window.wp || ! wp.media ) {
				return;
			}
			var wrap = pick.closest( '[data-dz-media]' );

			var frame = wp.media( {
				title: ( window.DZ_MEDIA && DZ_MEDIA.title ) || '',
				button: { text: ( window.DZ_MEDIA && DZ_MEDIA.button ) || '' },
				library: { type: 'image' },
				multiple: false
			} );

			frame.on( 'select', function () {
				var att = frame.state().get( 'selection' ).first().toJSON();
				var url = ( att.sizes && att.sizes.medium ) ? att.sizes.medium.url : att.url;

				wrap.querySelector( '[data-dz-media-input]' ).value = att.id;

				var pv = wrap.querySelector( '[data-dz-media-preview]' );
				pv.innerHTML = '<img src="' + url + '" alt="">';
				pv.classList.add( 'has-image' );

				var rmb = wrap.querySelector( '[data-dz-media-remove]' );
				if ( rmb ) {
					rmb.hidden = false;
				}
			} );

			frame.open();
			return;
		}

		if ( remove ) {
			e.preventDefault();
			var w = remove.closest( '[data-dz-media]' );
			w.querySelector( '[data-dz-media-input]' ).value = '';
			var preview = w.querySelector( '[data-dz-media-preview]' );
			preview.innerHTML = emptyMarkup();
			preview.classList.remove( 'has-image' );
			remove.hidden = true;
		}
	} );
}() );
