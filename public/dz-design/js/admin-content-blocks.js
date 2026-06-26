/**
 * Admin — بیلدرِ «بلوک‌های توضیح محصول» در ویرایش محصول.
 * افزودن/حذف/مرتب‌سازیِ بلوک‌ها + انتخابگرِ آیکون از allow-list. خروجی به‌صورتِ JSON در
 * textarea[name="_dz_content_blocks"] نوشته می‌شود تا با ذخیرهٔ محصول persist شود.
 * پیش‌نمایشِ زنده با کلاس‌های dz- (مثلِ صفحهٔ محصول).
 *
 * @package dashtzad-theme
 */
( function () {
	'use strict';
	var root = document.getElementById( 'dzCbApp' );
	var store = document.getElementById( 'dz_content_blocks_data' );
	if ( ! root || ! store || 'undefined' === typeof DZ_CB ) {
		return;
	}
	var ICONS = DZ_CB.icons || {};
	var T = DZ_CB.i18n || {};
	var ICON_KEYS = Object.keys( ICONS );
	function ic( k ) { return ICONS[ k ] || ICONS.leaf || 'ri-leaf-line'; }
	function esc( s ) { return String( s == null ? '' : s ).replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ).replace( /"/g, '&quot;' ); }
	function clamp( n ) { n = parseInt( n, 10 ) || 0; return Math.max( 0, Math.min( 100, n ) ); }

	var META = {
		tags:     { icon: 'ri-price-tag-3-line', label: T.tags || 'تگ‌ها' },
		quote:    { icon: 'ri-double-quotes-r', label: T.quote || 'نقل‌قول' },
		taste:    { icon: 'ri-restaurant-2-line', label: T.taste || 'طعم و بافت' },
		features: { icon: 'ri-apps-2-line', label: T.features || 'باکس‌های ویژگی' }
	};

	var blocks = [];
	try { blocks = JSON.parse( store.value || '[]' ) || []; } catch ( e ) { blocks = []; }
	if ( ! Array.isArray( blocks ) ) { blocks = []; }
	var uid = 1;
	function genCode() { return String( Math.floor( 100000 + Math.random() * 900000 ) ); }
	blocks.forEach( function ( b ) { b._id = uid++; if ( ! b.code ) { b.code = genCode(); } } );

	function persist() { store.value = JSON.stringify( blocks.map( function ( b ) { var c = {}; for ( var k in b ) { if ( '_id' !== k ) { c[ k ] = b[ k ]; } } return c; } ) ); }

	// ---------- shell ----------
	root.innerHTML =
		'<div id="dzCbList"></div>'
		+ '<div class="dz-cb__add" id="dzCbAdd"><button type="button" class="dz-cb__addbtn" id="dzCbAddBtn"><i class="ri-add-line"></i> ' + esc( T.addBlock || 'افزودن بلوک' ) + '</button>'
		+ '<div class="dz-cb__menu">'
		+ optBtn( 'tags', 'ri-price-tag-3-line', T.tags, T.tagsHint )
		+ optBtn( 'quote', 'ri-double-quotes-r', T.quote, T.quoteHint )
		+ optBtn( 'taste', 'ri-restaurant-2-line', T.taste, T.tasteHint )
		+ optBtn( 'features', 'ri-apps-2-line', T.features, T.featHint )
		+ '</div></div>'
		+ '<div class="dz-cb__prev"><div class="dz-cb__prev-bar"><i class="ri-eye-line"></i> ' + esc( T.preview || 'پیش‌نمایش زنده' ) + '</div><div class="dz-cb__stage dz-pdp" id="dzCbStage"></div></div>';
	function optBtn( type, icon, label, hint ) {
		return '<button type="button" class="dz-cb__opt" data-add="' + type + '"><i class="' + icon + '"></i><span>' + esc( label ) + '<small>' + esc( hint ) + '</small></span></button>';
	}

	var listEl = document.getElementById( 'dzCbList' );
	var addWrap = document.getElementById( 'dzCbAdd' );
	document.getElementById( 'dzCbAddBtn' ).addEventListener( 'click', function ( e ) { addWrap.classList.toggle( 'is-open' ); e.stopPropagation(); } );
	[].slice.call( addWrap.querySelectorAll( '[data-add]' ) ).forEach( function ( b ) {
		b.addEventListener( 'click', function () { addBlock( b.getAttribute( 'data-add' ) ); addWrap.classList.remove( 'is-open' ); } );
	} );

	function addBlock( type ) {
		var b = { _id: uid++, code: genCode(), type: type };
		if ( 'tags' === type ) { b.title = ''; b.items = [ { text: '', icon: 'cup' } ]; }
		if ( 'quote' === type ) { b.text = ''; b.by = ''; }
		if ( 'taste' === type ) { b.title = ''; b.subtitle = ''; b.rows = [ { label: '', level: '', value: 70 } ]; }
		if ( 'features' === type ) { b.items = [ { icon: 'leaf', title: '', text: '' } ]; }
		blocks.push( b ); render();
	}
	function move( id, d ) { var i = idx( id ), j = i + d; if ( j < 0 || j >= blocks.length ) { return; } var t = blocks[ i ]; blocks[ i ] = blocks[ j ]; blocks[ j ] = t; render(); }
	function del( id ) { blocks = blocks.filter( function ( b ) { return b._id !== id; } ); render(); }
	function idx( id ) { return blocks.findIndex( function ( b ) { return b._id === id; } ); }

	// ---------- icon picker ----------
	function pickerHTML( val ) {
		return '<div class="dz-ip" data-ip data-val="' + esc( val ) + '"><button type="button" class="dz-ip__btn"><i class="' + ic( val ) + '"></i></button><div class="dz-ip__menu">'
			+ ICON_KEYS.map( function ( k ) { return '<button type="button" data-ick="' + k + '" title="' + k + '"><i class="' + ICONS[ k ] + '"></i></button>'; } ).join( '' )
			+ '</div></div>';
	}
	document.addEventListener( 'click', function ( e ) {
		var btn = e.target.closest && e.target.closest( '.dz-ip__btn' );
		if ( btn && root.contains( btn ) ) { var p = btn.closest( '[data-ip]' ); closePickers( p ); p.classList.toggle( 'is-open' ); e.stopPropagation(); return; }
		var opt = e.target.closest && e.target.closest( '[data-ick]' );
		if ( opt && root.contains( opt ) ) {
			var pp = opt.closest( '[data-ip]' ); pp.dataset.val = opt.getAttribute( 'data-ick' );
			pp.querySelector( '.dz-ip__btn i' ).className = ICONS[ pp.dataset.val ];
			pp.classList.remove( 'is-open' ); syncIcons(); renderPreview(); persist(); return;
		}
		closePickers( null ); addWrap.classList.remove( 'is-open' );
	} );
	function closePickers( except ) { [].slice.call( root.querySelectorAll( '[data-ip]' ) ).forEach( function ( x ) { if ( x !== except ) { x.classList.remove( 'is-open' ); } } ); }
	function syncIcons() {
		blocks.forEach( function ( b ) {
			var card = listEl.querySelector( '.dz-cb-blk[data-id="' + b._id + '"]' );
			if ( ! card ) { return; }
			var pks = card.querySelectorAll( '[data-ip]' ), arr = b.items || [];
			if ( 'tags' === b.type || 'features' === b.type ) { [].slice.call( pks ).forEach( function ( p, i ) { if ( arr[ i ] ) { arr[ i ].icon = p.dataset.val; } } ); }
		} );
	}

	// ---------- editors ----------
	function eTags( b ) {
		var rows = b.items.map( function ( it, i ) {
			return '<div class="dz-cb-row">' + pickerHTML( it.icon ) + '<input class="dz-cb-inp" data-k="text" data-i="' + i + '" value="' + esc( it.text ) + '" placeholder="' + esc( T.tagText ) + '"><button type="button" class="dz-cb-row__x" data-delrow="' + i + '"><i class="ri-close-line"></i></button></div>';
		} ).join( '' );
		return field( T.title, '<input class="dz-cb-inp" data-k="title" value="' + esc( b.title ) + '">' )
			+ field( T.tags, '<div class="dz-cb-rep">' + rows + addRowBtn( T.addTag ) + '</div>' );
	}
	function eQuote( b ) {
		return field( T.quoteText, '<textarea class="dz-cb-inp dz-cb-ta" data-k="text">' + esc( b.text ) + '</textarea>' )
			+ field( T.by, '<input class="dz-cb-inp" data-k="by" value="' + esc( b.by ) + '">' );
	}
	function eTaste( b ) {
		var rows = b.rows.map( function ( r, i ) {
			return '<div class="dz-cb-row"><input class="dz-cb-inp" data-k="label" data-i="' + i + '" value="' + esc( r.label ) + '" placeholder="' + esc( T.rowLabel ) + '" style="flex:1.3">'
				+ '<input class="dz-cb-inp" data-k="level" data-i="' + i + '" value="' + esc( r.level ) + '" placeholder="' + esc( T.rowLevel ) + '" style="flex:1">'
				+ '<span class="dz-cb-tval"><input type="range" min="0" max="100" data-k="value" data-i="' + i + '" value="' + clamp( r.value ) + '"><span class="dz-cb-tval__n">' + clamp( r.value ) + '</span></span>'
				+ '<button type="button" class="dz-cb-row__x" data-delrow="' + i + '"><i class="ri-close-line"></i></button></div>';
		} ).join( '' );
		return '<div class="dz-cb-f2">' + field( T.title, '<input class="dz-cb-inp" data-k="title" value="' + esc( b.title ) + '">' ) + field( T.subtitle, '<input class="dz-cb-inp" data-k="subtitle" value="' + esc( b.subtitle ) + '">' ) + '</div>'
			+ field( T.rows, '<div class="dz-cb-rep">' + rows + addRowBtn( T.addRow ) + '</div>' );
	}
	function eFeatures( b ) {
		var rows = b.items.map( function ( it, i ) {
			return '<div class="dz-cb-row" style="align-items:flex-start">' + pickerHTML( it.icon )
				+ '<div style="flex:1;display:grid;gap:.35rem"><input class="dz-cb-inp" data-k="title" data-i="' + i + '" value="' + esc( it.title ) + '" placeholder="' + esc( T.featTitle ) + '">'
				+ '<input class="dz-cb-inp" data-k="text" data-i="' + i + '" value="' + esc( it.text ) + '" placeholder="' + esc( T.featText ) + '"></div>'
				+ '<button type="button" class="dz-cb-row__x" data-delrow="' + i + '"><i class="ri-close-line"></i></button></div>';
		} ).join( '' );
		return field( T.featList, '<div class="dz-cb-rep">' + rows + addRowBtn( T.addFeat ) + '</div>' );
	}
	function field( label, inner ) { return '<div class="dz-cb-f"><span class="dz-cb-f__l">' + esc( label ) + '</span>' + inner + '</div>'; }
	function addRowBtn( label ) { return '<button type="button" class="dz-cb-addrow" data-addrow><i class="ri-add-line"></i> ' + esc( label ) + '</button>'; }
	var EDIT = { tags: eTags, quote: eQuote, taste: eTaste, features: eFeatures };

	function render() {
		listEl.innerHTML = '';
		blocks.forEach( function ( b ) {
			var m = META[ b.type ];
			var card = document.createElement( 'div' );
			card.className = 'dz-cb-blk'; card.setAttribute( 'data-id', b._id );
			var sc = '[dz_block id="' + b.code + '"]';
			card.innerHTML = '<div class="dz-cb-blk__head"><span class="dz-cb-blk__type"><i class="' + m.icon + '"></i> ' + esc( m.label ) + '</span>'
				+ '<span class="dz-cb-blk__code" title="کدِ این بلوک — داخلِ متنِ توضیح بگذارید"><code>' + esc( sc ) + '</code><button type="button" class="dz-cb-copy" data-copy="' + esc( sc ) + '"><i class="ri-file-copy-line"></i></button></span>'
				+ '<div class="dz-cb-blk__tools"><button type="button" data-up title="' + esc( T.up ) + '"><i class="ri-arrow-up-line"></i></button><button type="button" data-down title="' + esc( T.down ) + '"><i class="ri-arrow-down-line"></i></button><button type="button" class="del" data-del title="' + esc( T.del ) + '"><i class="ri-delete-bin-line"></i></button></div></div>'
				+ '<div class="dz-cb-blk__body">' + EDIT[ b.type ]( b ) + '</div>';
			listEl.appendChild( card );
			wire( card, b );
		} );
		renderPreview(); persist();
	}

	function wire( card, b ) {
		card.querySelector( '[data-up]' ).addEventListener( 'click', function () { move( b._id, -1 ); } );
		card.querySelector( '[data-down]' ).addEventListener( 'click', function () { move( b._id, 1 ); } );
		card.querySelector( '[data-del]' ).addEventListener( 'click', function () { del( b._id ); } );
		var cp = card.querySelector( '[data-copy]' );
		if ( cp ) { cp.addEventListener( 'click', function () { copyText( cp.getAttribute( 'data-copy' ), cp ); } ); }
		[].slice.call( card.querySelectorAll( '[data-k]' ) ).forEach( function ( inp ) {
			inp.addEventListener( 'input', function () {
				var k = inp.getAttribute( 'data-k' ), i = inp.getAttribute( 'data-i' );
				var val = 'range' === inp.type ? clamp( inp.value ) : inp.value;
				if ( null === i ) { b[ k ] = val; } else {
					var arr = b.items || b.rows; arr[ +i ][ k ] = val;
					if ( 'range' === inp.type ) { inp.parentNode.querySelector( '.dz-cb-tval__n' ).textContent = val; }
				}
				renderPreview(); persist();
			} );
		} );
		var addBtn = card.querySelector( '[data-addrow]' );
		if ( addBtn ) { addBtn.addEventListener( 'click', function () {
			if ( 'tags' === b.type ) { b.items.push( { text: '', icon: 'leaf' } ); }
			if ( 'taste' === b.type ) { b.rows.push( { label: '', level: '', value: 50 } ); }
			if ( 'features' === b.type ) { b.items.push( { icon: 'leaf', title: '', text: '' } ); }
			render();
		} ); }
		[].slice.call( card.querySelectorAll( '[data-delrow]' ) ).forEach( function ( x ) {
			x.addEventListener( 'click', function () { var arr = b.items || b.rows; arr.splice( +x.getAttribute( 'data-delrow' ), 1 ); render(); } );
		} );
	}

	// ---------- live preview ----------
	function pvTags( b ) {
		var chips = b.items.filter( function ( it ) { return ( it.text || '' ).trim(); } ).map( function ( it ) { return '<span class="dz-serve-chip"><i class="dz-icon ' + ic( it.icon ) + '"></i><span>' + esc( it.text ) + '</span></span>'; } ).join( '' );
		return chips ? '<div class="dz-pcontent dz-pdesc__serve">' + ( b.title ? '<span class="dz-pdesc__serve-h">' + esc( b.title ) + '</span>' : '' ) + chips + '</div>' : '';
	}
	function pvQuote( b ) {
		return ( b.text || '' ).trim() ? '<blockquote class="dz-pcontent dz-pdesc__quote"><i class="ri-double-quotes-r dz-pdesc__quote-ic"></i><div><p class="dz-pdesc__quote-text">' + esc( b.text ) + '</p>' + ( b.by ? '<span class="dz-pdesc__quote-by">— ' + esc( b.by ) + '</span>' : '' ) + '</div></blockquote>' : '';
	}
	function pvTaste( b ) {
		var rows = b.rows.filter( function ( r ) { return ( r.label || '' ).trim(); } ).map( function ( r ) { return '<div class="dz-taste__row"><div class="dz-taste__top"><span>' + esc( r.label ) + '</span>' + ( r.level ? '<span class="dz-faint">' + esc( r.level ) + '</span>' : '' ) + '</div><span class="dz-taste__bar"><span style="inline-size:' + clamp( r.value ) + '%"></span></span></div>'; } ).join( '' );
		return rows ? '<div class="dz-pcontent dz-card dz-taste"><div class="dz-taste__head"><span class="dz-taste__ic"><i class="dz-icon ri-restaurant-2-line"></i></span><div><b class="dz-taste__t">' + esc( b.title || T.taste ) + '</b>' + ( b.subtitle ? '<div class="dz-taste__s">' + esc( b.subtitle ) + '</div>' : '' ) + '</div></div><div class="dz-taste__grid">' + rows + '</div></div>' : '';
	}
	function pvFeatures( b ) {
		var cards = b.items.filter( function ( it ) { return ( it.title || '' ).trim() || ( it.text || '' ).trim(); } ).map( function ( it ) { return '<div class="dz-card dz-hlcard"><span class="dz-hlcard__ic"><i class="dz-icon ' + ic( it.icon ) + '"></i></span><div>' + ( it.title ? '<div class="dz-hlcard__t">' + esc( it.title ) + '</div>' : '' ) + ( it.text ? '<div class="dz-hlcard__s">' + esc( it.text ) + '</div>' : '' ) + '</div></div>'; } ).join( '' );
		return cards ? '<div class="dz-pcontent dz-pdesc__hl">' + cards + '</div>' : '';
	}
	var PV = { tags: pvTags, quote: pvQuote, taste: pvTaste, features: pvFeatures };
	function renderPreview() {
		var stage = document.getElementById( 'dzCbStage' );
		if ( ! blocks.length ) { stage.innerHTML = '<div class="dz-cb__empty"><i class="ri-inbox-line"></i><div>' + esc( T.empty ) + '</div></div>'; return; }
		stage.innerHTML = blocks.map( function ( b ) { return PV[ b.type ]( b ); } ).join( '' );
	}

	// ---------- insert into editor + copy ----------
	function copyText( txt, btn ) {
		var done = function () { if ( btn ) { var old = btn.innerHTML; btn.innerHTML = '<i class="ri-check-line"></i>'; setTimeout( function () { btn.innerHTML = old; }, 1200 ); } };
		if ( navigator.clipboard && navigator.clipboard.writeText ) { navigator.clipboard.writeText( txt ).then( done, function () { fallbackCopy( txt ); done(); } ); }
		else { fallbackCopy( txt ); done(); }
	}
	function fallbackCopy( txt ) { var t = document.createElement( 'textarea' ); t.value = txt; document.body.appendChild( t ); t.select(); try { document.execCommand( 'copy' ); } catch ( e ) {} t.remove(); }
	function insertShortcode( code ) {
		var sc = '[dz_block id="' + code + '"]';
		if ( window.tinymce && tinymce.get( 'content' ) && ! tinymce.get( 'content' ).isHidden() ) {
			tinymce.get( 'content' ).execCommand( 'mceInsertContent', false, sc );
		} else {
			var ta = document.getElementById( 'content' );
			if ( ta ) {
				var s = ta.selectionStart || 0, en = ta.selectionEnd || 0;
				ta.value = ta.value.slice( 0, s ) + sc + ta.value.slice( en );
				ta.selectionStart = ta.selectionEnd = s + sc.length;
				ta.focus();
			}
		}
	}
	function labelOf( b ) {
		if ( 'quote' === b.type ) { return ( b.text || '' ).slice( 0, 22 ); }
		if ( 'features' === b.type && b.items && b.items[0] ) { return ( b.items[0].title || '' ); }
		return b.title || '';
	}
	var insertBtn = document.getElementById( 'dzCbInsertBtn' );
	var insertMenu = null;
	function closeInsertMenu() { if ( insertMenu ) { insertMenu.remove(); insertMenu = null; } }
	if ( insertBtn ) {
		insertBtn.addEventListener( 'click', function ( e ) {
			e.preventDefault(); e.stopPropagation();
			if ( insertMenu ) { closeInsertMenu(); return; }
			if ( ! blocks.length ) {
				insertMenu = document.createElement( 'div' );
				insertMenu.className = 'dz-cb-im';
				insertMenu.innerHTML = '<div class="dz-cb-im__empty">ابتدا در بخشِ «بلوک‌های توضیح محصول» یک بلوک بسازید.</div>';
			} else {
				insertMenu = document.createElement( 'div' );
				insertMenu.className = 'dz-cb-im';
				insertMenu.innerHTML = blocks.map( function ( b ) {
					var m = META[ b.type ], lbl = labelOf( b );
					return '<button type="button" class="dz-cb-im__opt" data-code="' + b.code + '"><i class="' + m.icon + '"></i><span>' + esc( m.label ) + ( lbl ? ' · ' + esc( lbl ) : '' ) + '</span><code>[dz_block id="' + b.code + '"]</code></button>';
				} ).join( '' );
			}
			document.body.appendChild( insertMenu );
			var r = insertBtn.getBoundingClientRect();
			insertMenu.style.position = 'absolute';
			insertMenu.style.top = ( window.scrollY + r.bottom + 4 ) + 'px';
			insertMenu.style.insetInlineStart = ( window.scrollX + r.left ) + 'px';
			[].slice.call( insertMenu.querySelectorAll( '[data-code]' ) ).forEach( function ( o ) {
				o.addEventListener( 'click', function () { insertShortcode( o.getAttribute( 'data-code' ) ); closeInsertMenu(); } );
			} );
		} );
		document.addEventListener( 'click', function ( e ) { if ( insertMenu && ! insertMenu.contains( e.target ) && e.target !== insertBtn ) { closeInsertMenu(); } } );
	}

	render();
}() );
