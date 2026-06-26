/* =============================================================================
 * Dashtzad — Chat Widget engine (موتورِ گفتگو)
 * Vanilla JS. کانفیگ از window.dzChat (لوکالایزشده در enqueue). آمادهٔ اتصالِ
 * بعدی به بک‌اندِ Next.js از طریقِ CFG.apiBase (فعلاً موتورِ شبیه‌سازی).
 * ========================================================================== */

/* ============================================================
 * گفت‌وگوی دشت‌زاد — موتورِ نمونهٔ تعاملی (Vanilla JS)
 * ============================================================ */
(function(){
  'use strict';
  const CFG = window.dzChat || {};
  const BOT_AVATAR = CFG.botAvatar || '';
  const $  = (s,r)=> (r||document).querySelector(s);
  const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));
  const FA = '۰۱۲۳۴۵۶۷۸۹';
  const fa = s => String(s).replace(/[0-9]/g, d=>FA[+d]);
  const enDigits = s => String(s).replace(/[۰-۹]/g, d=>FA.indexOf(d)).replace(/[^\d]/g,'');
  const nowTime = () => { const d=new Date(); return fa(String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')); };

  // وضعیتِ سراسری
  const S = { online:true, dep:'پشتیبانی', name:'', phone:'', sound:true, notify:false,
              flow:null, step:0, ctx:{}, replyTo:null, unread:0, proactiveShown:false, lastId:0, dev:'mobile' };

  const body = $('#chat-body');

  /* ---------- صدا (Web Audio) ---------- */
  let AC=null;
  function beep(kind){
    if(!S.sound) return;
    try{
      AC = AC || new (window.AudioContext||window.webkitAudioContext)();
      const o=AC.createOscillator(), g=AC.createGain();
      o.connect(g); g.connect(AC.destination);
      o.type='sine'; o.frequency.value = kind==='in'?660:880;
      g.gain.setValueAtTime(.0001,AC.currentTime);
      g.gain.exponentialRampToValueAtTime(.12,AC.currentTime+.02);
      g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+.28);
      o.start(); o.stop(AC.currentTime+.3);
    }catch(e){}
  }
  function notify(text){
    if(S.notify && document.hidden && 'Notification' in window && Notification.permission==='granted'){
      new Notification('دشت‌زاد', {body:text});
    }
  }

  /* ---------- ابزارِ ساختِ پیام ---------- */
  function scrollDown(force){
    const near = body.scrollHeight - body.scrollTop - body.clientHeight < 120;
    if(force||near){ body.scrollTop = body.scrollHeight; S.unread=0; updateSD(); }
  }
  function updateSD(){
    const atBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 60;
    $('#scroll-down').classList.toggle('is-show', !atBottom);
    const b=$('#sd-badge'); b.classList.toggle('is-show', S.unread>0); b.textContent=fa(S.unread);
  }
  body.addEventListener('scroll', updateSD);
  $('#scroll-down').onclick = ()=> scrollDown(true);

  function avatar(){ return '<span class="dz-chat-avatar dz-chat-avatar--mini" aria-hidden="true"><img src="'+BOT_AVATAR+'" alt=""></span>'; }

  // افزودنِ پیام؛ opts: {who, text, html, tag, quote, status}
  function addMsg(opts){
    const id = ++S.lastId;
    const who = opts.who; // 'user' | 'agent'
    const wrap = document.createElement('div');
    wrap.className = 'dz-chat-message dz-chat-message--'+who;
    wrap.dataset.id = id;
    let inner = '<div class="dz-msg-wrap">';
    inner += '<button class="dz-msg-menu-btn" type="button" aria-label="گزینه‌ها"><i class="ri-more-2-fill"></i></button>';
    inner += '<div class="dz-msg-pop"></div>';

    if(opts.html){
      inner += opts.html; // محتوای آماده (کارت/صوت/تصویر)
    } else {
      inner += '<div class="dz-chat-bubble">';
      if(opts.tag) inner += '<span class="dz-bot-tag"><i class="'+opts.tag.icon+'"></i> '+opts.tag.label+'</span>';
      if(opts.quote) inner += '<div class="dz-quote"><b>'+opts.quote.who+'</b>'+esc(opts.quote.text)+'</div>';
      inner += '<p class="dz-bubble-text">'+linkify(esc(opts.text))+'</p>';
      const lp = linkPreview(opts.text);
      if(lp) inner += lp;
      inner += '<span class="dz-chat-meta">'+nowTime()+(who==='user'?' <i class="dz-icon ri-check-line dz-tick"></i>':'')+'</span>';
      inner += '</div>';
    }
    inner += '</div>';
    wrap.innerHTML = (who==='agent'? avatar():'') + inner;
    body.appendChild(wrap);
    wireMsg(wrap, opts);

    if(who==='user'){
      scrollDown(true);
      // تیکِ خوانده‌شده
      setTimeout(()=>{ const t=wrap.querySelector('.dz-tick'); if(t){ t.classList.remove('ri-check-line'); t.classList.add('ri-check-double-line'); t.style.color='var(--color-dz-honey)'; } }, 1100);
    } else {
      const closed = (function(){ const f=document.querySelector('.dz-chat-widget')||document.getElementById('frame'); return f && !f.classList.contains('is-open'); })();
      if(closed || body.scrollHeight - body.scrollTop - body.clientHeight > 120){ S.unread++; }
      if(closed){ updateLauncherBadge(); }
      scrollDown(false); updateSD();
      beep('in'); notify(opts.text||'پیام جدید');
    }
    return wrap;
  }

  function esc(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function linkify(s){ return s.replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">$1</a>'); }
  function linkPreview(text){
    const m = (text||'').match(/https?:\/\/([^\s\/]+)(\/[^\s]*)?/);
    if(!m) return '';
    const host = m[1].replace(/^www\./,'');
    return '<a class="dz-link-prev" href="'+m[0]+'" target="_blank" rel="noopener"><span class="dz-link-prev__ic"><i class="ri-global-line"></i></span><span class="dz-link-prev__tx"><b>دشت‌زاد — مزرعه تا سفره</b><span>'+esc(host)+'</span></span></a>';
  }

  /* ---------- منوی پیام: ریپلای / کپی / ویرایش / حذف ---------- */
  function wireMsg(wrap, opts){
    const pop = wrap.querySelector('.dz-msg-pop');
    const isUser = opts.who==='user';
    const items = [];
    items.push(['reply','ri-arrow-go-back-line','پاسخ']);
    if(opts.text) items.push(['copy','ri-file-copy-line','کپی']);
    if(isUser && opts.text){ items.push(['edit','ri-edit-line','ویرایش']); items.push(['delete','ri-delete-bin-line','حذف','danger']); }
    pop.innerHTML = items.map(it=>'<button data-act="'+it[0]+'" class="'+(it[3]?'is-danger':'')+'"><i class="'+it[1]+'"></i> '+it[2]+'</button>').join('');
    wrap.querySelector('.dz-msg-menu-btn').onclick = e=>{ e.stopPropagation(); closePops(); pop.classList.toggle('is-open'); };
    pop.querySelectorAll('button').forEach(b=> b.onclick = ()=>{
      const act=b.dataset.act; pop.classList.remove('is-open');
      const txtEl = wrap.querySelector('.dz-bubble-text');
      const txt = txtEl?txtEl.textContent:'(پیوست)';
      if(act==='reply') startReply(isUser?'شما':botName(), txt);
      if(act==='copy'){ navigator.clipboard && navigator.clipboard.writeText(txt); toast('کپی شد'); }
      if(act==='edit') editMsg(wrap, txtEl);
      if(act==='delete'){ wrap.style.transition='opacity .2s'; wrap.style.opacity='0'; setTimeout(()=>wrap.remove(),200); }
    });
  }
  function closePops(){ $$('.dz-msg-pop.is-open').forEach(p=>p.classList.remove('is-open')); }
  document.addEventListener('click', e=>{ if(!e.target.closest('.dz-msg-wrap')) closePops(); });

  function editMsg(wrap, txtEl){
    const cur = txtEl.textContent;
    const v = prompt('ویرایش پیام:', cur);
    if(v!=null && v.trim()){ txtEl.innerHTML = linkify(esc(v.trim())); if(!wrap.querySelector('.dz-bubble-edited')){ const m=wrap.querySelector('.dz-chat-meta'); m.insertAdjacentHTML('afterbegin','<span class="dz-bubble-edited">ویرایش‌شده · </span>'); } }
  }

  /* ---------- ریپلای ---------- */
  function startReply(who, text){
    S.replyTo = {who, text};
    $('#reply-who').textContent = 'پاسخ به ' + who;
    $('#reply-text').textContent = text.slice(0,80);
    $('#reply-bar').classList.add('is-open');
    $('#msg-input').focus();
  }
  $('#reply-x').onclick = ()=>{ S.replyTo=null; $('#reply-bar').classList.remove('is-open'); };

  /* ---------- توست کوچک ---------- */
  let toastT;
  function toast(msg){
    let t=$('#dz-toast'); if(!t){ t=document.createElement('div'); t.id='dz-toast'; t.style.cssText='position:absolute;inset-block-start:4rem;inset-inline:0;margin-inline:auto;width:max-content;max-width:80%;background:var(--color-dz-ink,#2b2b2b);color:#fff;padding:.5rem 1rem;border-radius:var(--radius-dz-pill);font-size:.8rem;z-index:20;opacity:0;transition:opacity .2s;pointer-events:none'; $('.dz-chat-panel').appendChild(t); }
    t.textContent=msg; t.style.opacity='1'; clearTimeout(toastT); toastT=setTimeout(()=>t.style.opacity='0',1400);
  }

  /* ---------- نشانگرِ در حال نوشتن ---------- */
  function typing(show){
    let t=$('#typing-row');
    if(show){
      if(t) return;
      t=document.createElement('div'); t.id='typing-row'; t.className='dz-chat-typing';
      t.innerHTML = avatar()+'<div class="dz-chat-typing__bubble"><i></i><i></i><i></i></div><span class="dz-chat-typing__text">'+botName()+' در حال نوشتن…</span>';
      body.appendChild(t); scrollDown(false);
    } else if(t){ t.remove(); }
  }
  function botName(){ return S.flow==='human' ? 'کارشناسِ ' + S.dep : 'دستیار دشت‌زاد'; }

  // پاسخِ ربات با تأخیر + تایپینگ
  function botReply(builder, delay){
    typing(true);
    setTimeout(()=>{ typing(false); builder(); }, delay||900+Math.random()*700);
  }

  /* ============================================================
   * موتورِ گفت‌وگو (ربات/کارشناس)
   * ============================================================ */
  const PRODUCTS = {
    rice_majlesi: {title:'برنج هاشمی درجه‌یک', sub:'کیسه ۱۰ کیلویی · معطر و قدکش', price:'۱٬۲۸۰٬۰۰۰', badge:'پرفروش'},
    rice_daily:   {title:'برنج طارم محلی', sub:'کیسه ۵ کیلویی · مناسبِ روزمره', price:'۵۹۰٬۰۰۰', badge:'به‌صرفه'},
    rice_kate:    {title:'برنج دانه‌بلند شمال', sub:'کیسه ۱۰ کیلویی · کته‌ای و نرم', price:'۹۴۰٬۰۰۰', badge:''},
    gift:         {title:'پکِ هدیهٔ دشت‌زاد', sub:'برنج + زعفران + روغن کرمانشاهی', price:'۱٬۸۵۰٬۰۰۰', badge:'ویژه'}
  };
  function productCard(key){
    const p=PRODUCTS[key];
    return '<div class="dz-chat-card">'
      + '<div class="dz-chat-card__media">[ تصویر محصول ]'+(p.badge?'<span class="dz-chat-card__badge"><i class="ri-fire-fill"></i> '+p.badge+'</span>':'')+'</div>'
      + '<div class="dz-chat-card__info"><p class="dz-chat-card__title">'+p.title+'</p><p class="dz-chat-card__sub">'+p.sub+'</p>'
      + '<div class="dz-chat-card__row"><span class="dz-chat-card__price">'+p.price+' <em>تومان</em></span>'
      + '<div class="dz-chat-card__btns"><a class="dz-chat-card__btn" href="#"><i class="ri-add-line"></i> افزودن</a><a class="dz-chat-card__btn dz-chat-card__btn--ghost" href="#" aria-label="مشاهده"><i class="ri-eye-line"></i></a></div></div></div>'
      + '<span class="dz-chat-meta">'+nowTime()+'</span></div>';
  }
  function trackCard(code){
    const steps=[['ثبت سفارش','۱۴۰۵/۰۳/۲۰ · ۱۰:۱۲','done'],['پرداخت تأیید شد','۱۴۰۵/۰۳/۲۰ · ۱۰:۱۵','done'],['در حال بسته‌بندی','۱۴۰۵/۰۳/۲۱ · ۰۹:۴۰','done'],['تحویل به پست','۱۴۰۵/۰۳/۲۱ · ۱۷:۰۵','now'],['تحویل به شما','تخمینی ۱۴۰۵/۰۳/۲۳','']];
    return '<div class="dz-track"><div class="dz-track__head"><span class="dz-track__code">سفارش #'+fa(code)+'</span><span class="dz-track__badge">در مسیرِ ارسال</span></div>'
      + steps.map(s=>'<div class="dz-track__step '+s[2]+'"><span class="dz-track__dot">'+(s[2]==='done'?'<i class="ri-check-line"></i>':(s[2]==='now'?'<i class="ri-truck-line"></i>':''))+'</span><div class="dz-track__tx"><b>'+s[0]+'</b><span>'+s[1]+'</span></div></div>').join('')
      + '</div>';
  }

  // چیپ‌های پیشنهادِ ربات
  function chips(list){
    const row=document.createElement('div'); row.className='dz-chat-quick-actions';
    row.innerHTML='<div class="dz-chat-quick-grid">'+list.map(c=>'<button class="dz-chat-quick-action" type="button" data-chip="'+(c.act||'')+'" data-val="'+(c.val||'')+'">'+(c.icon?'<i class="dz-icon '+c.icon+'"></i> ':'')+c.label+'</button>').join('')+'</div>';
    body.appendChild(row); scrollDown(false);
    row.querySelectorAll('button').forEach(b=> b.onclick=()=>{ row.remove(); handleChip(b.dataset.chip, b.dataset.val, b.textContent.trim()); });
  }

  function handleChip(act, val, label){
    if(act==='flow'){ startFlow(val); return; }
    if(act==='answer'){ addMsg({who:'user', text:label}); routeFree(val||label); return; }
    if(act==='human'){ addMsg({who:'user', text:label}); connectHuman(); return; }
    addMsg({who:'user', text:label}); routeFree(label);
  }

  // شروعِ یک فلو
  function startFlow(name){
    S.flow=name; S.step=0; S.ctx={};
    if(name==='rice'){
      botReply(()=>{ addMsg({who:'agent', tag:{icon:'ri-robot-2-line',label:'ربات راهنما'}, text:'عالی! چند تا سؤالِ کوتاه می‌پرسم تا بهترین برنج را پیشنهاد بدهم. مصرفِ شما بیشتر چه نوعی است؟'});
        chips([{label:'برنجِ مجلسی',act:'rstep',val:'majlesi',icon:'ri-restaurant-line'},{label:'روزمره و اقتصادی',act:'rstep',val:'daily',icon:'ri-home-4-line'},{label:'کته و نرم',act:'rstep',val:'kate',icon:'ri-fire-line'}]); });
    }
    if(name==='order'){
      botReply(()=> addMsg({who:'agent', tag:{icon:'ri-robot-2-line',label:'ربات راهنما'}, text:'لطفاً کدِ رهگیری یا شمارهٔ سفارش‌تان را بفرستید (مثلاً ۸۱۹۲۳).'}));
    }
    if(name==='bulk'){
      botReply(()=>{ addMsg({who:'agent', text:'برای خریدِ عمده، چه مقدار مدِنظرتان است؟'});
        chips([{label:'زیر ۱۰۰ کیلو',act:'bstep',val:'sm'},{label:'۱۰۰ تا ۵۰۰ کیلو',act:'bstep',val:'md'},{label:'بالای ۵۰۰ کیلو',act:'bstep',val:'lg'}]); });
    }
  }

  // ادامهٔ فلوها از طریقِ چیپ‌های مرحله‌ای
  function chipStep(act, val, label){
    addMsg({who:'user', text:label});
    if(act==='rstep'){
      S.ctx.type=val;
      botReply(()=>{ addMsg({who:'agent', text:'چه مقدار معمولاً می‌خرید؟'});
        chips([{label:'۵ کیلو',act:'rfin',val:'5'},{label:'۱۰ کیلو',act:'rfin',val:'10'},{label:'بیشتر',act:'rfin',val:'20'}]); });
    }
    if(act==='rfin'){
      const key = S.ctx.type==='majlesi'?'rice_majlesi':S.ctx.type==='kate'?'rice_kate':'rice_daily';
      botReply(()=>{ addMsg({who:'agent', tag:{icon:'ri-sparkling-2-line',label:'پیشنهادِ هوشمند'}, text:'با توجه به انتخابِ شما، این گزینه را پیشنهاد می‌کنم:'});
        addMsg({who:'agent', html:productCard(key)});
        setTimeout(()=>chips([{label:'مشاوره با کارشناس',act:'human'},{label:'پیگیری سفارش',act:'flow',val:'order',icon:'ri-map-pin-line'}]),500);
        endFlow(); });
    }
    if(act==='bstep'){
      botReply(()=>{ addMsg({who:'agent', text:'ممنون. کارشناسِ فروش برای قیمتِ عمده و فاکتورِ رسمی با شما تماس می‌گیرد. شماره‌ی '+fa(S.phone||'۰۹۱۲...')+' درست است؟'});
        chips([{label:'بله، درست است',act:'human'},{label:'شمارهٔ دیگری می‌دهم',act:'answer',val:'شماره جدید'}]); endFlow(); });
    }
  }

  function endFlow(){ S.flow=null; S.step=0; }

  // اتصال به کارشناسِ انسانی
  function connectHuman(){
    addMsg({who:'agent', html:'<div class="dz-chat-system">در حال اتصال به کارشناسِ '+S.dep+'…</div>'});
    S.flow='human';
    setTimeout(()=>{
      $('#hdr-title').textContent = 'مریم احمدی';
      $('#hdr-status').textContent = 'کارشناسِ ' + S.dep + ' · آنلاین';
      botReply(()=> addMsg({who:'agent', text:'سلام '+(S.name||'دوستِ عزیز')+' 🌿 من مریم هستم از تیمِ '+S.dep+'. در خدمتم؛ سؤالتان را بفرمایید.'}), 1400);
    }, 1500);
  }

  // مسیریابیِ پیامِ آزاد (شبیه‌سازیِ AI کلیدواژه‌ای)
  function routeFree(text){
    const t = text || '';
    // اگر در فلویِ سفارش هستیم و عدد آمد
    if(S.flow==='order'){
      const code = enDigits(t);
      if(code.length>=4){ botReply(()=>{ addMsg({who:'agent', text:'پیدا شد! وضعیتِ سفارشِ شما:'}); addMsg({who:'agent', html:trackCard(code)}); endFlow(); }); return; }
    }
    if(S.flow==='human'){
      if(!S.humanDelayShown){
        S.humanDelayShown=true;
        typing(true);
        setTimeout(()=>{ typing(false); responseDelayPrompt(); }, 2600);
        return;
      }
      botReply(()=> addMsg({who:'agent', text:'متوجه شدم، همین الان بررسی می‌کنم و چند لحظهٔ دیگر پاسخِ دقیق می‌دهم. 🙏'}), 1400); return;
    }
    const has = (...k)=> k.some(w=> t.includes(w));
    if(has('سلام','درود','وقت بخیر')) return botReply(()=> addMsg({who:'agent', text:'سلام و درود! 🌾 چطور می‌توانم کمکتان کنم؟'}));
    if(has('برنج','هاشمی','طارم','بخرم')) return botReply(()=>{ addMsg({who:'agent', text:'برای انتخابِ برنج کمکتان می‌کنم.'}); startFlow('rice'); });
    if(has('سفارش','پیگیری','رهگیری','کجاست')) return startFlow('order');
    if(has('عمده','فاکتور','تعداد بالا')) return startFlow('bulk');
    if(has('قیمت','چند','هزینه')) return botReply(()=> addMsg({who:'agent', text:'قیمتِ روزِ محصولات را می‌توانید اینجا ببینید: '+(CFG.shopUrl||'/')+' — یا بگویید دنبالِ چه محصولی هستید.'}));
    if(has('ارسال','پست','تحویل','مرسوله')) return botReply(()=> addMsg({who:'agent', text:'ارسال به سراسرِ کشور با پستِ پیشتاز ۲ تا ۴ روزِ کاری است؛ سفارش‌های بالای ۲ میلیون تومان رایگان ارسال می‌شوند. 🚚'}));
    if(has('ساعت','کاری','آنلاین')) return botReply(()=> addMsg({who:'agent', text:'ساعتِ کاریِ پشتیبانیِ ما هر روز ۹ تا ۲۱ است.'}));
    if(has('انسان','اپراتور','کارشناس','پشتیبان')) return connectHuman();
    if(has('ممنون','مرسی','سپاس')) return botReply(()=> addMsg({who:'agent', text:'خواهش می‌کنم! کارِ دیگری بود در خدمتم. 🙏'}));
    // پیش‌فرض
    return botReply(()=>{ addMsg({who:'agent', tag:{icon:'ri-sparkling-2-line',label:'دستیارِ هوشمند'}, text:'سؤالِ خوبی بود! می‌توانم در این موارد کمکتان کنم — یا اگر بخواهید، به کارشناس وصلتان می‌کنم:'});
      chips([{label:'انتخاب برنج',act:'flow',val:'rice',icon:'ri-bowl-line'},{label:'پیگیری سفارش',act:'flow',val:'order',icon:'ri-map-pin-line'},{label:'اتصال به کارشناس',act:'human',icon:'ri-customer-service-2-line'}]); });
  }

  // واسط برای چیپ‌های مرحله‌ای (rstep/rfin/bstep) و چیپ‌های فلو/answer/human
  function handleChipGlobal(b, row){
    const act=b.dataset.chip, val=b.dataset.val, label=b.textContent.trim();
    row.remove();
    if(['rstep','rfin','bstep'].includes(act)) return chipStep(act,val,label);
    return handleChip(act,val,label);
  }
  // بازنویسیِ chips برای استفاده از handleChipGlobal
  function chips(list){
    const row=document.createElement('div'); row.className='dz-chat-quick-actions';
    row.innerHTML='<div class="dz-chat-quick-grid">'+list.map(c=>'<button class="dz-chat-quick-action" type="button" data-chip="'+(c.act||'')+'" data-val="'+(c.val||'')+'">'+(c.icon?'<i class="dz-icon '+c.icon+'"></i> ':'')+c.label+'</button>').join('')+'</div>';
    body.appendChild(row); scrollDown(false);
    row.querySelectorAll('button').forEach(b=> b.onclick=()=> handleChipGlobal(b,row));
  }

  /* ============================================================
   * ورودیِ کاربر: متن
   * ============================================================ */
  const input = $('#msg-input');
  function sendText(){
    const v = input.value.trim();
    if(!v) return;
    const opts = {who:'user', text:v};
    if(S.replyTo){ opts.quote = {who:S.replyTo.who, text:S.replyTo.text}; S.replyTo=null; $('#reply-bar').classList.remove('is-open'); }
    addMsg(opts);
    input.value=''; input.dispatchEvent(new Event('input'));
    routeFree(v);
  }
  $('#composer').addEventListener('submit', e=>{ e.preventDefault(); sendText(); });
  $('#send-btn').onclick = sendText;
  input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); sendText(); } });

  /* ---------- اموجی ---------- */
  const EMOJI = ['🌾','🍚','😊','🙏','👍','❤️','🌿','🔥','✅','🎉','😍','🤔','👌','💚','📦','🚚','⭐','😅'];
  const ep=$('#emoji-pop'); ep.innerHTML = EMOJI.map(e=>'<button type="button">'+e+'</button>').join('');
  ep.querySelectorAll('button').forEach(b=> b.onclick=()=>{ input.value+=b.textContent; input.focus(); input.dispatchEvent(new Event('input')); });
  $('#emoji-btn').onclick = e=>{ e.stopPropagation(); $('#attach-sheet').classList.remove('is-open'); ep.classList.toggle('is-open'); };

  /* ---------- پیوست ---------- */
  $('#attach-btn').onclick = e=>{ e.stopPropagation(); ep.classList.remove('is-open'); $('#attach-sheet').classList.toggle('is-open'); };
  $('#att-image').onclick = ()=>{ $('#attach-sheet').classList.remove('is-open'); $('#file-input').click(); };
  $('#att-file').onclick  = ()=>{ $('#attach-sheet').classList.remove('is-open'); fileBubble('سند.pdf','۲٫۴ مگابایت'); };
  $('#att-loc').onclick   = ()=>{ $('#attach-sheet').classList.remove('is-open'); addMsg({who:'user', text:'📍 موقعیتِ من: تهران، خیابان ولیعصر'}); botReply(()=> addMsg({who:'agent', text:'موقعیت دریافت شد، ممنون!'})); };
  document.addEventListener('click', e=>{ if(!e.target.closest('#emoji-pop,#emoji-btn')) ep.classList.remove('is-open'); if(!e.target.closest('#attach-sheet,#attach-btn')) $('#attach-sheet').classList.remove('is-open'); });

  $('#file-input').addEventListener('change', e=>{
    const f=e.target.files[0]; if(!f) return;
    const url=URL.createObjectURL(f);
    const html='<div class="dz-chat-img"><img src="'+url+'" alt="تصویرِ ارسالی"><span class="dz-chat-meta">'+nowTime()+' <i class="dz-icon ri-check-line dz-tick"></i></span></div>';
    const w=addMsg({who:'user', html});
    setTimeout(()=>{ const t=w.querySelector('.dz-tick'); if(t){t.classList.replace('ri-check-line','ri-check-double-line');t.style.color='var(--color-dz-honey)';} },1100);
    botReply(()=> addMsg({who:'agent', text:'تصویر دریافت شد. ممنون که فرستادید 📷'}));
    e.target.value='';
  });
  function fileBubble(name,size){
    const html='<div class="dz-chat-bubble"><a class="dz-link-prev" href="#" style="margin:0"><span class="dz-link-prev__ic"><i class="ri-file-pdf-2-line"></i></span><span class="dz-link-prev__tx"><b>'+name+'</b><span>'+size+'</span></span></a><span class="dz-chat-meta">'+nowTime()+' <i class="dz-icon ri-check-double-line" style="color:var(--color-dz-honey)"></i></span></div>';
    addMsg({who:'user', html});
  }

  /* ---------- پیامِ صوتی (ضبط) ---------- */
  let recTimer=null, recSec=0, mediaRec=null, chunks=[];
  function fmtSec(s){ return fa(Math.floor(s/60))+':'+fa(String(s%60).padStart(2,'0')); }
  function startRec(){
    $('#composer').classList.add('is-recording'); recSec=0; $('#rec-time').textContent='۰:۰۰';
    recTimer=setInterval(()=>{ recSec++; $('#rec-time').textContent=fmtSec(recSec); }, 1000);
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
      navigator.mediaDevices.getUserMedia({audio:true}).then(st=>{
        try{ mediaRec=new MediaRecorder(st); chunks=[]; mediaRec.ondataavailable=e=>chunks.push(e.data);
          mediaRec.onstop=()=>{ st.getTracks().forEach(t=>t.stop()); const blob=new Blob(chunks,{type:'audio/webm'}); finishRec(URL.createObjectURL(blob)); };
          mediaRec.start(); }catch(e){ mediaRec=null; }
      }).catch(()=>{ mediaRec=null; });
    }
  }
  function stopRec(send){
    clearInterval(recTimer);
    const dur=recSec; $('#composer').classList.remove('is-recording');
    if(mediaRec && mediaRec.state==='recording'){ mediaRec._send=send; mediaRec._dur=dur; mediaRec.stop(); if(!send){ mediaRec.onstop=()=>{}; } if(send){ return; } }
    if(send && dur>0){ finishRec(null, dur); }
  }
  function finishRec(url, dur){
    dur = dur||recSec||3;
    const bars = Array.from({length:22},()=> (.25+Math.random()*0.9).toFixed(2));
    const wave = bars.map(h=>'<span style="block-size:'+(h*100)+'%"></span>').join('');
    const html='<div class="dz-chat-bubble" style="padding:.55rem .7rem"><div class="dz-voice" data-url="'+(url||'')+'" data-dur="'+dur+'">'
      +'<button class="dz-voice__play" type="button"><i class="ri-play-fill"></i></button>'
      +'<div class="dz-voice__mid"><div class="dz-voice__wave">'+wave+'</div>'
      +'<div class="dz-voice__row"><span class="dz-v-time">'+fmtSec(dur)+'</span><button class="dz-voice__rate" type="button">۱×</button></div></div></div>'
      +'<span class="dz-chat-meta">'+nowTime()+' <i class="dz-icon ri-check-double-line" style="color:var(--color-dz-honey)"></i></span></div>';
    const w=addMsg({who:'user', html});
    wireVoice(w.querySelector('.dz-voice'));
    botReply(()=> addMsg({who:'agent', text:'صدای شما را شنیدم 🎧 الان رسیدگی می‌کنم.'}));
  }
  // دکمهٔ میکروفن: کلیک = شروع، کلیکِ دوم = ارسال
  $('#voice-btn').onclick = ()=>{ if($('#composer').classList.contains('is-recording')) stopRec(true); else startRec(); };
  $('#rec-cancel').onclick = ()=> stopRec(false);

  function wireVoice(el){
    if(!el) return;
    const playBtn=el.querySelector('.dz-voice__play'), icon=playBtn.querySelector('i');
    const bars=Array.from(el.querySelectorAll('.dz-voice__wave span'));
    const timeEl=el.querySelector('.dz-v-time'), rateBtn=el.querySelector('.dz-voice__rate');
    const dur=+el.dataset.dur||3; let rate=1, playing=false, prog=0, tick=null;
    let audio = el.dataset.url ? new Audio(el.dataset.url) : null;
    if(audio){ audio.onended = ()=> reset(); }
    function reset(){ playing=false; prog=0; icon.className='ri-play-fill'; bars.forEach(b=>b.classList.remove('on')); timeEl.textContent=fmtSec(dur); clearInterval(tick); }
    function paint(){ const n=Math.floor((prog/dur)*bars.length); bars.forEach((b,i)=>b.classList.toggle('on',i<n)); timeEl.textContent=fmtSec(Math.max(0,Math.ceil(dur-prog))); }
    playBtn.onclick=()=>{
      if(playing){ playing=false; icon.className='ri-play-fill'; if(audio)audio.pause(); clearInterval(tick); return; }
      playing=true; icon.className='ri-pause-fill'; if(audio){ audio.playbackRate=rate; audio.play().catch(()=>{}); }
      const stepMs=100; tick=setInterval(()=>{ prog+=(stepMs/1000)*rate; if(prog>=dur){ reset(); return; } paint(); }, stepMs);
    };
    rateBtn.onclick=()=>{ rate = rate===1?1.5:rate===1.5?2:1; rateBtn.textContent=fa(rate)+'×'; if(audio)audio.playbackRate=rate; };
  }

  /* ============================================================
   * تنظیمات (درایور)
   * ============================================================ */
  function openDrawer(o){ $('#drawer').classList.toggle('is-open',o); $('#drawer-back').classList.toggle('is-open',o); }
  $('#gear-btn').onclick = ()=> openDrawer(true);
  $('#drawer-close').onclick = ()=> openDrawer(false);
  $('#drawer-back').onclick = ()=> openDrawer(false);
  $$('.dz-wall').forEach(b=> b.onclick=()=>{ $$('.dz-wall').forEach(x=>x.classList.remove('is-on')); b.classList.add('is-on'); body.dataset.wall=b.dataset.wall; });
  $('#set-sound').onchange = e=> S.sound=e.target.checked;
  $('#set-notify').onchange = e=>{
    S.notify=e.target.checked;
    if(S.notify && 'Notification' in window && Notification.permission==='default'){ Notification.requestPermission(); }
  };
  $('#end-chat').onclick = ()=>{ openDrawer(false); endChat(); };

  function endChat(){
    addMsg({who:'agent', html:'<div class="dz-chat-system">گفت‌وگو بسته شد · '+nowTime()+'</div>'});
    const c=document.createElement('div'); c.className='dz-chat-csat';
    c.innerHTML='<p class="dz-csat__q">از گفت‌وگوی امروز چقدر راضی بودید؟</p><div class="dz-csat__stars">'+
      [1,2,3,4,5].map(n=>'<button type="button" data-n="'+n+'" aria-label="'+fa(n)+' ستاره"><i class="dz-icon ri-star-fill"></i></button>').join('')+
      '</div><div class="dz-csat__thanks"><i class="ri-heart-3-fill"></i> ممنون از بازخوردتان!</div>';
    body.appendChild(c); scrollDown(true);
    c.querySelectorAll('.dz-csat__stars button').forEach(btn=> btn.onclick=()=>{ c.classList.add('done'); beep('out'); });
  }

  /* ============================================================
   * لانچرِ ابزارک + تیزرِ پیامِ خودکار + موقعیت + تاخیرِ پاسخ
   * ============================================================ */
  const frame = document.querySelector('.dz-chat-widget') || document.getElementById('frame');
  if(!frame) return;
  const launcher = $('#launcher');
  const teaser = $('#teaser');
  let attnTimer=null, teaserDismissed=false;

  function widgetOpen(){ return frame.classList.contains('is-open'); }
  function openWidget(){
    frame.classList.add('is-open');
    launcher.classList.remove('is-attn');
    hideTeaser();
    S.unread=0; updateLauncherBadge();
    if(!$('#screen-chat').hidden) setTimeout(()=>scrollDown(true),80);
  }
  function closeWidget(){ frame.classList.remove('is-open'); scheduleAttention(); }
  launcher.onclick = openWidget;
  $('#chat-close').onclick = closeWidget;
  $('#gate-close').onclick = closeWidget;

  function updateLauncherBadge(){
    const b=$('#launcher-badge'); if(!b) return;
    b.classList.toggle('is-show', S.unread>0 && !widgetOpen());
    b.textContent=fa(S.unread);
  }

  function showTeaser(html){ if(teaserDismissed||widgetOpen()||S.dev!=='desktop') return; $('#teaser-text').innerHTML=html; teaser.classList.add('is-show'); }
  function hideTeaser(){ teaser.classList.remove('is-show'); }
  $('#teaser-x').onclick = e=>{ e.stopPropagation(); teaserDismissed=true; hideTeaser(); };
  teaser.onclick = ()=>{ teaserDismissed=true; openWidget(); };

  function scheduleAttention(){
    clearTimeout(attnTimer);
    attnTimer=setTimeout(()=>{
      if(widgetOpen()||S.dev!=='desktop') return;
      launcher.classList.add('is-attn');
      showTeaser('<span class="dz-teaser__av"><i class="ri-sparkling-2-line"></i> دشت‌زاد</span>سلام! 🌾 برای انتخابِ برنج یا پیگیریِ سفارش همین‌جا در خدمتم.');
    }, 3500);
  }

  // موقعیتِ ابزارک (راست = start ، چپ = end)
  function setSide(side){
    launcher.dataset.side=side; teaser.dataset.side=side;
    frame.style.setProperty('--dz-anchor', side==='start'?'right':'left');
    $$('.dz-pos').forEach(b=>b.classList.toggle('is-on', b.dataset.side===side));
  }
  $$('.dz-pos').forEach(b=> b.onclick=()=> setSide(b.dataset.side));

  // تاخیر در پاسخگویی: فرمِ گذاشتنِ ایمیل
  function responseDelayPrompt(){
    const el=document.createElement('div'); el.className='dz-delay';
    el.innerHTML='<div class="dz-delay__t"><i class="ri-time-line"></i><span>کارشناسِ '+S.dep+' الان کمی سرش شلوغ است. اگر عجله دارید، ایمیل‌تان را بگذارید تا پاسخِ کامل را برایتان بفرستیم.</span></div>'
      +'<div class="dz-delay__row"><input class="dz-input" type="email" dir="ltr" placeholder="name@example.com" style="text-align:left"><button class="dz-delay__send" type="button">ثبت</button></div>';
    body.appendChild(el); scrollDown(true);
    const send=el.querySelector('.dz-delay__send'), inp=el.querySelector('input');
    send.onclick=()=>{
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())){ inp.classList.add('is-err'); return; }
      el.classList.add('done'); el.innerHTML='<i class="ri-check-double-line"></i> ثبت شد؛ پاسخِ کامل را ایمیل می‌کنیم. ممنون از صبرتان 🙏';
      setTimeout(()=> botReply(()=> addMsg({who:'agent', text:'ببخشید بابتِ معطلی '+(S.name||'')+' 🙏 الان پاسخِ شما را می‌دهم.'}), 1300), 700);
    };
  }

  // سویچِ دستگاه: موبایل = نوار پایین ، دسکتاپ = لانچرِ شناور
  $('#nav-chat').onclick = openWidget;
  function setDevice(dev){
    S.dev=dev;
    frame.classList.toggle('is-mobile', dev==='mobile');
    frame.classList.toggle('is-desktop', dev==='desktop');
    $$('.dz-devsw__b').forEach(b=>b.classList.toggle('is-on', b.dataset.dev===dev));
    hideTeaser(); launcher.classList.remove('is-attn');
    if(dev==='desktop') scheduleAttention();
  }
  $$('.dz-devsw__b').forEach(b=> b.onclick=()=> setDevice(b.dataset.dev));

  // شروع: اگر سوییچِ پیش‌نمایش بود، دستی؛ وگرنه ریسپانسیو با matchMedia
  if($$('.dz-devsw__b').length){ setDevice('mobile'); }
  else { const mq=window.matchMedia('(min-width:64rem)'); const sync=()=>setDevice(mq.matches?'desktop':'mobile'); (mq.addEventListener?mq.addEventListener('change',sync):mq.addListener(sync)); sync(); }

  /* ============================================================
   * پیامِ هوشمندِ پیش‌دستانه (proactive)
   * ============================================================ */
  function scheduleProactive(){
    setTimeout(()=>{
      if(S.proactiveShown || body.children.length>4) return;
      S.proactiveShown=true;
      botReply(()=> addMsg({who:'agent', tag:{icon:'ri-sparkling-2-line',label:'پیامِ هوشمند'}, text:'راستی، این هفته برنجِ هاشمیِ تازه رسید 🌾 اگر خواستید کمکتان کنم انتخاب کنید!'}), 600);
    }, 9000);
  }

  /* ============================================================
   * صفحهٔ ورودی (gate) + اعتبارسنجی + OTP
   * ============================================================ */
  // تغییرِ وضعیتِ آنلاین/آفلاین (برای نمایشِ هر دو حالت)
  function applyState(){
    const off=!S.online;
    $('#state-lbl').textContent = off?'آفلاین':'آنلاین';
    $('#state-toggle').classList.toggle('is-off',off);
    $('#offline-note').hidden=!off;
    $('#msg-field').hidden=!off;
    $('#email-field').hidden=!off;
    $('#email-req').hidden=!off;
    $('#gate-btn-lbl').textContent = off?'ثبت پیام آفلاین':'شروع گفت‌وگو';
    $('#gate-sub').textContent = off?'الان آفلاین هستیم؛ پیام بگذارید تا پاسخ دهیم.':'سلام! برای شروعِ گفت‌وگو لطفاً خودتان را معرفی کنید.';
  }
  $('#state-toggle').onclick = ()=>{ S.online=!S.online; applyState(); };
  // وضعیتِ واقعی بر اساسِ ساعت
  (function(){ const h=new Date().getHours(); S.online = h>=9 && h<21; applyState(); })();

  function setErr(id,msg){ const i=$('#'+id); i.classList.toggle('is-err',!!msg); const e=$('[data-for="'+id+'"]'); if(e)e.textContent=msg||''; }
  function validPhone(v){ const d=enDigits(v); return /^09\d{9}$/.test(d) || /^\d{10,13}$/.test(d); }
  function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

  $('#gate-form').addEventListener('submit', e=>{
    e.preventDefault();
    let ok=true;
    const name=$('#g-name').value.trim();
    if(name.length<2){ setErr('g-name','نام را وارد کنید.'); ok=false; } else setErr('g-name','');
    if(!validPhone($('#g-phone').value)){ setErr('g-phone','شمارهٔ موبایلِ معتبر وارد کنید.'); ok=false; } else setErr('g-phone','');
    if(!S.online){
      if(!validEmail($('#g-email').value)){ setErr('g-email','ایمیلِ معتبر وارد کنید.'); ok=false; } else setErr('g-email','');
      if($('#g-msg').value.trim().length<5){ setErr('g-msg','پیام‌تان را بنویسید.'); ok=false; } else setErr('g-msg','');
    }
    if(!ok) return;
    S.name=name; S.phone=enDigits($('#g-phone').value);
    S.dep = (document.querySelector('input[name=dep]:checked')||{}).value || 'پشتیبانی';

    if(!S.online){
      // پیامِ آفلاین → پیامِ تأیید و رفتن به چت با حالتِ آفلاین
      toast('پیام شما ثبت شد ✓');
      enterChat(true, $('#g-msg').value.trim());
      return;
    }
    // آنلاین → مرحلهٔ OTP
    $('#otp-phone').textContent = fa(S.phone);
    $('#gate-form').hidden=true; $('#gate-otp').hidden=false;
    startOtpTimer();
    setTimeout(()=> $('#otp-inputs input')[0].focus(), 50);
  });

  // OTP رفتار
  const otpInputs=$$('#otp-inputs input');
  otpInputs.forEach((inp,i)=>{
    inp.addEventListener('input',()=>{ inp.value=enDigits(inp.value).slice(-1); if(inp.value && i<5) otpInputs[i+1].focus(); });
    inp.addEventListener('keydown',e=>{ if(e.key==='Backspace'&&!inp.value&&i>0) otpInputs[i-1].focus(); });
  });
  let otpT=null;
  function startOtpTimer(){
    let s=59; $('#otp-resend').disabled=true;
    clearInterval(otpT);
    otpT=setInterval(()=>{ s--; $('#otp-timer').textContent='۰۰:'+fa(String(s).padStart(2,'0')); if(s<=0){ clearInterval(otpT); $('#otp-resend').disabled=false; $('#otp-timer').textContent='۰۰:۰۰'; } },1000);
  }
  $('#otp-resend').onclick=()=>{ if($('#otp-resend').disabled)return; startOtpTimer(); toast('کد دوباره ارسال شد'); };
  $('#otp-back').onclick=()=>{ $('#gate-otp').hidden=true; $('#gate-form').hidden=false; clearInterval(otpT); };
  $('#otp-verify').onclick=()=>{
    const code=otpInputs.map(i=>i.value).join('');
    if(code.length<6){ $('#otp-err').textContent='کدِ ۶ رقمی را کامل وارد کنید.'; return; }
    $('#otp-err').textContent=''; enterChat(false);
  };

  /* ---------- ورود به چت ---------- */
  function enterChat(offline, offlineMsg){
    $('#screen-gate').hidden=true; $('#screen-chat').hidden=false;
    $('#hdr-dep').textContent = S.dep;
    if(offline){ $('#hdr-status').textContent='آفلاین — به‌زودی پاسخ'; document.querySelector('.dz-chat-online-dot').style.background='var(--color-dz-clay)'; }

    // پیامِ خوشامد
    addMsg({who:'agent', tag:{icon:'ri-robot-2-line',label:'دستیار دشت‌زاد'}, text:'سلام '+S.name+'! 🌾 خوش آمدید. من دستیارِ دشت‌زادم — برای انتخابِ محصول، پیگیریِ سفارش یا مشاورهٔ خرید کنارتانم.'});
    if(offline && offlineMsg){ addMsg({who:'user', text:offlineMsg}); addMsg({who:'agent', text:'پیام‌تان ثبت شد؛ به‌محضِ شروعِ ساعتِ کاری با شما تماس می‌گیریم. 🙏'}); }
    else { setTimeout(()=> chips([
      {label:'انتخاب برنج',act:'flow',val:'rice',icon:'ri-bowl-line'},
      {label:'پیگیری سفارش',act:'flow',val:'order',icon:'ri-map-pin-line'},
      {label:'مشاوره خرید',act:'answer',val:'مشاوره خرید',icon:'ri-chat-smile-2-line'},
      {label:'خرید عمده',act:'flow',val:'bulk',icon:'ri-box-3-line'},
      {label:'پیشنهاد پک هدیه',act:'answer',val:'پک هدیه',icon:'ri-gift-line'},
      {label:'تماس با پشتیبانی',act:'human',icon:'ri-customer-service-2-line'}
    ]), 700); }

    if(!offline) scheduleProactive();
  }

  // مسیریابیِ "پک هدیه" و "مشاوره"
  const _route=routeFree;
  routeFree=function(t){ if((t||'').includes('پک هدیه')){ return botReply(()=>{ addMsg({who:'agent', text:'پکِ هدیهٔ ویژهٔ دشت‌زاد، انتخابی شیک برای مناسبت‌ها و هدایای سازمانی:'}); addMsg({who:'agent', html:productCard('gift')}); }); } return _route(t); };
})();
