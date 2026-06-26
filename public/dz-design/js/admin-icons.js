/**
 * Dashtzad admin — icon picker.
 * صفحهٔ «آیکون‌ها»: مودال انتخاب آیکون از فهرست کامل RemixIcon، تغییر/بازنشانی هر نقش.
 * منبع فهرست: همان remixicon.css سلف‌هاست (آدرس از DZ_ICONS.cssUrl).
 */
( function () {
	'use strict';

	var CFG = window.DZ_ICONS || { cssUrl: '', i18n: {} };
	var I18N = CFG.i18n || {};
	var ALL = [];
	var activeRow = null;

	var modal = document.getElementById( 'dz-ipick' );
	if ( ! modal ) {
		return;
	}
	var grid = modal.querySelector( '[data-dz-pick-grid]' );
	var search = modal.querySelector( '[data-dz-pick-search]' );
	var meta = modal.querySelector( '[data-dz-pick-meta]' );
	var roleOut = modal.querySelector( '[data-dz-pick-role]' );

	// فهرست کامل کلاس‌های ri- را از CSS سلف‌هاست بخوان.
	if ( CFG.cssUrl ) {
		fetch( CFG.cssUrl ).then( function ( r ) { return r.text(); } ).then( function ( css ) {
			var set = {};
			css.replace( /\.(ri-[a-z0-9-]+):before/g, function ( _, c ) { set[ c ] = 1; return _; } );
			ALL = Object.keys( set );
		} ).catch( function () { ALL = []; } );
	}

	function toFa( n ) {
		return String( n ).replace( /[0-9]/g, function ( d ) { return '۰۱۲۳۴۵۶۷۸۹'[ d ]; } );
	}

	function openFor( row ) {
		activeRow = row;
		roleOut.textContent = row.getAttribute( 'data-role-key' ) || '';
		search.value = '';
		buildGrid( '' );
		modal.removeAttribute( 'hidden' );
		search.focus();
	}
	function close() {
		modal.setAttribute( 'hidden', '' );
		activeRow = null;
	}

	function currentIcon( row ) {
		var inp = row.querySelector( '[data-dz-input]' );
		return inp ? inp.value : '';
	}

	function buildGrid( q ) {
		q = ( q || '' ).trim().toLowerCase();
		var cur = activeRow ? currentIcon( activeRow ) : '';
		var list = q ? ALL.filter( function ( c ) { return c.indexOf( q ) !== -1; } ) : ALL;
		var CAP = 300;
		var shown = list.slice( 0, CAP );
		grid.innerHTML = '';
		shown.forEach( function ( c ) {
			var b = document.createElement( 'button' );
			b.type = 'button';
			b.className = 'dz-ipick__item' + ( c === cur ? ' is-current' : '' );
			b.innerHTML = '<i class="' + c + '" aria-hidden="true"></i><span>' + c.replace( 'ri-', '' ) + '</span>';
			b.addEventListener( 'click', function () { choose( c ); } );
			grid.appendChild( b );
		} );
		var more = list.length > CAP ? ( ' — ' + toFa( CAP ) + ' ' + ( I18N.capMore || '' ) ) : '';
		meta.textContent = toFa( list.length ) + ' ' + ( I18N.resultCount || '' ) + more;
	}

	function choose( icon ) {
		if ( ! activeRow ) {
			return;
		}
		applyIcon( activeRow, icon );
		close();
	}

	function applyIcon( row, icon ) {
		var input = row.querySelector( '[data-dz-input]' );
		var prev = row.querySelector( '[data-dz-preview]' );
		var cls = row.querySelector( '[data-dz-cls]' );
		var def = row.getAttribute( 'data-default' );
		if ( input ) { input.value = icon; }
		if ( prev ) { prev.className = icon; }
		if ( cls ) { cls.textContent = icon; }
		row.classList.toggle( 'is-changed', icon !== def );
	}

	// رویدادها (واگذاری)
	document.addEventListener( 'click', function ( e ) {
		var swap = e.target.closest ? e.target.closest( '[data-dz-swap]' ) : null;
		if ( swap ) {
			var row = swap.closest( '[data-dz-row]' );
			// نقش را از code داخل ردیف بردار.
			var roleEl = row.querySelector( '.dz-irow__role' );
			row.setAttribute( 'data-role-key', roleEl ? roleEl.textContent : '' );
			openFor( row );
			return;
		}
		var reset = e.target.closest ? e.target.closest( '[data-dz-reset]' ) : null;
		if ( reset ) {
			var r2 = reset.closest( '[data-dz-row]' );
			applyIcon( r2, r2.getAttribute( 'data-default' ) );
			return;
		}
		if ( e.target.closest ? e.target.closest( '[data-dz-close]' ) : false ) {
			close();
		}
	} );

	search.addEventListener( 'input', function ( e ) { buildGrid( e.target.value ); } );
	document.addEventListener( 'keydown', function ( e ) { if ( 'Escape' === e.key ) { close(); } } );
}() );
