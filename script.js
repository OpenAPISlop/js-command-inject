javascript:(function(){
  'use strict';
  if (window.nova) { try{
    const r=document.getElementById('nova-root'), b=document.getElementById('nova-btn');
    if(r){r.style.display='flex'; if(b) b.style.display='none';}
  }catch(_){} return; }

  var D=document, DE=D.documentElement, DB=D.body||DE;
  var RID='nova-root', BID='nova-btn', SID='nova-style', TID='nova-toast';

  // ---------- utils ----------
  function E(t,p){var e=D.createElement(t);if(p)for(var k in p)e[k]=p[k];return e;}
  function esc(s){return String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
  function jfmt(v){try{return typeof v==='string'?v:JSON.stringify(v,null,2)}catch(_){return String(v)}}
  function kv(k,v){return `<tr><th>${esc(k)}</th><td>${esc(v==null?'':String(v))}</td></tr>`}
  function on(el,ev,fn,opt){el.addEventListener(ev,fn,opt); return ()=>el.removeEventListener(ev,fn,opt);}

  // ---------- viewport lock ----------
  var VP_OLD=null;
  function lockVP(){
    var m=D.querySelector('meta[name=viewport]');
    if(!m){m=E('meta');m.name='viewport';(D.head||DE).appendChild(m);}
    if(VP_OLD===null) VP_OLD=m.getAttribute('content')||'';
    m.setAttribute('content','width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover');
  }
  function restoreVP(){
    var m=D.querySelector('meta[name=viewport]');
    if(m && VP_OLD!==null){m.setAttribute('content',VP_OLD); VP_OLD=null;}
  }

  // ---------- styles ----------
  function injectCSS(){
    if (document.getElementById(SID)) return;
    const s=document.createElement('style'); s.id=SID;
    s.textContent = `
html{-webkit-text-size-adjust:100%!important;text-size-adjust:100%!important}
#${RID}{position:fixed;left:0;right:0;bottom:0;z-index:2147483646;background:rgba(8,12,18,.96);color:#e6eefb;border-top:1px solid #1a2942;font:15px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;display:flex;flex-direction:column;height:56vh;max-height:80vh;min-height:32vh;--safe:env(safe-area-inset-bottom,0px);padding-bottom:calc(var(--safe));-webkit-font-smoothing:antialiased}
#${RID} *{box-sizing:border-box;font:inherit;color:inherit}
#${RID}.collapsed{height:auto}

/* Header / tabs */
#${RID} .h{display:flex;gap:.5rem;align-items:center;padding:.6rem .8rem;background:#0e1626;border-bottom:1px solid #1a2942;position:sticky;top:0;z-index:2}
#${RID} .title{font-weight:700;opacity:.9;cursor:pointer}
#${RID} .sp{margin-left:auto;color:#9fb2c8}
#${RID} .close{margin-left:.25rem;width:34px;height:34px;border-radius:10px;border:1px solid #294064;background:#0f1a2c;cursor:pointer;display:flex;align-items:center;justify-content:center}
#${RID} .t{padding:.5rem .8rem;border:1px solid #294064;border-radius:999px;background:#0f1a2c;cursor:pointer;-webkit-user-select:none;user-select:none}
#${RID} .t[aria-selected="true"]{background:#13243a}

/* Columns */
#${RID} .b{display:flex;flex:1;min-height:0}
#${RID} .col{flex:1;display:none;flex-direction:column;min-height:0;min-width:0}
#${RID} .col[aria-hidden="false"]{display:flex}

/* Console */
#${RID} .log{flex:1;overflow:auto;padding:.65rem .8rem;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
#${RID} .row{white-space:pre-wrap;word-break:break-word;border-bottom:1px dashed #1a2942;padding:.25rem 0}
#${RID} .row.w{color:#ffd166}#${RID} .row.e{color:#ff5b6e}
#${RID} .cmd{display:flex;gap:.55rem;padding:.55rem .8rem;background:#0e1626;border-top:1px solid #1a2942}
#${RID} input.inp{flex:1;background:#0b1220;border:1px solid #294064;border-radius:10px;padding:.6rem .75rem;font-size:16px!important;line-height:1.4!important;color:#e6eefb}
#${RID} button.run{background:#0f1a2c;border:1px solid #294064;border-radius:10px;padding:.55rem .8rem;cursor:pointer;-webkit-tap-highlight-color:transparent}

/* Network */
#${RID} .netwrap{flex:1;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
#${RID} .netwrap table{width:100%;border-collapse:collapse;table-layout:fixed}
#${RID} th,#${RID} td{border-bottom:1px solid #1a2942;padding:.5rem .6rem;text-align:left;vertical-align:top}
#${RID} th{position:sticky;top:0;background:#0e1626;z-index:1;white-space:nowrap}
#${RID} .netwrap th:nth-child(1), #${RID} .netwrap td:nth-child(1){width:74px}
#${RID} .netwrap th:nth-child(3), #${RID} .netwrap td:nth-child(3){width:78px}
#${RID} .netwrap th:nth-child(4), #${RID} .netwrap td:nth-child(4){width:60px}
#${RID} .netwrap th:nth-child(5), #${RID} .netwrap td:nth-child(5){width:70px}
#${RID} .netwrap th:nth-child(2), #${RID} .netwrap td:nth-child(2){width:auto;max-width:100%;white-space:normal;overflow-wrap:anywhere;word-break:break-word}

/* Cards + general */
#${RID} .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.65rem;padding:.65rem .8rem}
#${RID} .card{border:1px solid #1a2942;border-radius:12px;padding:.65rem;background:#0b1220}
#${RID} .muted{opacity:.8}
#${RID} .good{color:#22c55e}#${RID} .bad{color:#ff5b6e}

/* Floating button + toast */
#${BID}{position:fixed;right:1rem;bottom:1rem;z-index:2147483647;background:#0d141f;border:1px solid #273a53;border-radius:12px;padding:.7rem .95rem;box-shadow:0 4px 18px rgba(0,0,0,.35);color:#e6eefb;font:600 16px/1.2 -apple-system,system-ui,Segoe UI,Roboto,Helvetica,Arial;cursor:pointer;-webkit-tap-highlight-color:transparent}
#${BID}:active{transform:scale(.96)}
#${TID}{position:fixed;left:50%;bottom:64px;transform:translateX(-50%);background:#0d141f;color:#e6eefb;border:1px solid #273a53;border-radius:999px;padding:.5rem .95rem;font:600 14px/1 -apple-system,system-ui;z-index:2147483647;opacity:.98}

/* Grip */
#${RID} .grip{height:12px;cursor:n-resize;background:linear-gradient(180deg,#0e1626,#0a111d);border-top:1px solid #1a2942;display:flex;justify-content:center;align-items:center}
#${RID} .grip:before{content:'';display:block;width:42px;height:4px;border-radius:999px;background:#24324a}

/* Menu & Panels */
#${RID} .menu-list{padding:.65rem .8rem;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
#${RID} .menu-item{display:flex;align-items:center;justify-content:space-between;gap:.5rem;border:1px solid #1a2942;border-radius:12px;padding:.7rem .8rem;margin:.35rem 0;background:#0b1220}
#${RID} .menu-item button{border:1px solid #294064;background:#0f1a2c;border-radius:10px;padding:.5rem .7rem}
#${RID} .panel{flex:1;min-height:0;display:flex;flex-direction:column}
#${RID} .crumbs{display:flex;gap:.5rem;align-items:center;padding:.6rem .8rem;border-bottom:1px solid #1a2942;background:#0e1626;position:sticky;top:0;z-index:1}
#${RID} .crumbs .back{border:1px solid #294064;background:#0f1a2c;border-radius:10px;padding:.4rem .6rem}
#${RID} .panel .scroller{flex:1;min-height:0;min-width:0;overflow-x:auto;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:0}
#${RID} .about{padding:.65rem .8rem}
#${RID} .about table{display:block;width:max-content;min-width:900px;border-collapse:collapse}
#${RID} .about th,#${RID} .about td{border-bottom:1px solid #1a2942;padding:.5rem .6rem;vertical-align:top;white-space:nowrap}
@media (min-width:768px){#${RID}{font-size:16px}}
`;
    (document.head||document.documentElement).appendChild(s);
  }

  // ---------- UI ----------
  function buildUI(){
    if (D.getElementById(RID)) return null;
    var root=E('div'); root.id=RID;

    // drag grip
    var grip=E('div'); grip.className='grip';

    // header + tabs
    var head=E('div'); head.className='h';
    var title=E('div'); title.className='title'; title.textContent='nova';
    var tC=E('button'); tC.className='t'; tC.textContent='Console'; tC.dataset.tab='console'; tC.setAttribute('aria-selected','true');
    var tN=E('button'); tN.className='t'; tN.textContent='Network'; tN.dataset.tab='net'; tN.setAttribute('aria-selected','false');
    var tM=E('button'); tM.className='t'; tM.textContent='Menu';    tM.dataset.tab='menu'; tM.setAttribute('aria-selected','false');
    var sp=E('div');    sp.className='sp'; sp.textContent='';
    var close=E('button'); close.className='close'; close.setAttribute('aria-label','Close'); close.innerHTML='&times;';
    head.append(title,tC,tN,tM,sp,close);

    var body=E('div'); body.className='b';

    // Console
    var colC=E('section'); colC.className='col'; colC.dataset.name='console'; colC.setAttribute('aria-hidden','false');
    var log=E('div'); log.className='log';
    var cmd=E('div'); cmd.className='cmd';
    var inp=E('input'); inp.className='inp'; inp.placeholder='type JS and press Enter';
    inp.autocapitalize='off'; inp.autocorrect='off'; inp.spellcheck=false; inp.inputMode='text';
    var run=E('button'); run.className='run'; run.textContent='Send';
    cmd.append(inp,run); colC.append(log,cmd);

    // Network
    var colN=E('section'); colN.className='col'; colN.dataset.name='net'; colN.setAttribute('aria-hidden','true');
    var netWrap=E('div'); netWrap.className='netwrap scroller';
    var table=E('table'); var thead=E('thead'); var tbody=E('tbody');
    thead.innerHTML='<tr><th>Method</th><th>URL</th><th>Status</th><th>ms</th><th>Size</th></tr>';
    table.append(thead,tbody); netWrap.append(table); colN.append(netWrap);

    // Menu
    var colMenu=E('section'); colMenu.className='col'; colMenu.dataset.name='menu'; colMenu.setAttribute('aria-hidden','true');
    var menuList=E('div'); menuList.className='menu-list scroller';
    menuList.append(makeMenuItem('Crypto', 'Open billygpt.com/dash in a new tab', () => openPanel('crypto')));
    menuList.append(makeMenuItem('Info', 'app info', () => openPanel('creator')));
        menuList.append(makeMenuItem('Extended Console', 'Open a page that has more console command activated commands embedded within it.', () => openPanel('commands')));
    menuList.append(makeMenuItem('About', 'Device, browser & environment info', () => openPanel('about')));
    colMenu.append(menuList);

    // panel host
    var panelHost=E('div'); panelHost.className='panel'; panelHost.style.display='none';
    var crumbs=E('div'); crumbs.className='crumbs';
    var backBtn=E('button'); backBtn.className='back'; backBtn.textContent='← Menu';
    var crumbTitle=E('div'); crumbTitle.style.fontWeight='700';
    crumbs.append(backBtn,crumbTitle);
    var panelBody=E('div'); panelBody.className='scroller'; panelBody.style.padding='0';
    panelHost.append(crumbs,panelBody);
    colMenu.append(panelHost);

    function makeMenuItem(title,desc,fn){
      var r=E('div'); r.className='menu-item';
      var l=E('div'); l.innerHTML = `<div><b>${esc(title)}</b></div><div class="muted" style="font-size:13px">${esc(desc)}</div>`;
      var b=E('button'); b.textContent='Open'; b.onclick=fn;
      r.append(l,b); return r;
    }









    function openPanel(name){

const PANEL_LABELS = {
  creator: 'App Info',        
  crypto: 'Crypto Dashboard',
  weather: 'Weather',
  commands: 'Extended Console',
  about: 'About',
};
 crumbTitle.textContent = PANEL_LABELS[name] || (name[0].toUpperCase() + name.slice(1));
      menuList.style.display='none';
      panelHost.style.display='flex';
      panelBody.innerHTML='';
      if(name==='crypto'){ buildCrypto(panelBody); }
      else if(name==='weather'){ buildWeather(panelBody); }
            else if(name==='commands'){ buildCommandList(panelBody); }
      else if(name==='creator'){ buildCreator(panelBody); }
      else if(name==='about'){ buildAbout(panelBody); }
    }
    backBtn.onclick=function(){
      panelHost.style.display='none';
      menuList.style.display='block';
      panelBody.innerHTML='';
    };

    function buildCreator(root){
      var box=E('div'); box.className='about';
      var t=E('table'); var tb=E('tbody');
      tb.innerHTML = [
        kv('Dev','OpenAPISlop'),
        kv('GitHub','https://github.com/OpenAPISlop/js-command-inject-utility'),
        kv('Version','0.1.0')
      ].join('');
      t.append(tb); box.append(t); root.append(box);
    }

    function buildAbout(root){
      var box=E('div'); box.className='about';
      var t=E('table'); var tb=E('tbody');
      var n=window.navigator||{}, c=window.screen||{}, tz=(Intl&&Intl.DateTimeFormat)?Intl.DateTimeFormat().resolvedOptions().timeZone:'';
      var mem=('deviceMemory' in n)? n.deviceMemory+' GB' : '', lang=(n.languages&&n.languages.join)? n.languages.join(', '):n.language, dpr=window.devicePixelRatio||1, ua=n.userAgent||'';
      var isIOS=/iP(hone|od|ad)/.test(ua)||(/Macintosh/.test(ua)&&'ontouchend'in window); var conn=n.connection||{};
      var stor='-'; try{ stor=(navigator.storage&&navigator.storage.estimate)?'supported':'-'; }catch(_){}
      var ls='-', ss='-'; try{ localStorage.setItem('__nt','1'); localStorage.removeItem('__nt'); ls='ok'; }catch(_){ ls='blocked'; }
      try{ sessionStorage.setItem('__nt','1'); sessionStorage.removeItem('__nt'); ss='ok'; }catch(_){ ss='blocked'; }
      var rows=[];
      rows.push(kv('User Agent',ua)); rows.push(kv('Platform',n.platform||'')); rows.push(kv('iOS (detected)',isIOS?'yes':'no'));
      rows.push(kv('Language(s)',lang||'')); rows.push(kv('Timezone',tz||'')); rows.push(kv('Online',n.onLine));
      rows.push(kv('Device Memory',mem||'')); rows.push(kv('HW Threads',n.hardwareConcurrency||'')); rows.push(kv('Viewport',(DE.clientWidth||innerWidth)+' Ã— '+(DE.clientHeight||innerHeight)));
      rows.push(kv('Screen',(c.width||'')+' Ã— '+(c.height||''))); rows.push(kv('DPR',dpr)); rows.push(kv('Cookies Enabled',n.cookieEnabled));
      rows.push(kv('LocalStorage',ls)); rows.push(kv('SessionStorage',ss)); rows.push(kv('Storage API',stor));
      rows.push(kv('Connection', [conn.type,conn.effectiveType,conn.downlink,conn.rtt].filter(Boolean).join(' / ')||'' ));
      rows.push(kv('Do Not Track',n.doNotTrack||'')); rows.push(kv('Referrer',D.referrer||'')); rows.push(kv('Visibility',D.visibilityState||'' ));
      tb.innerHTML=rows.join('');
      t.append(tb); box.append(t); root.append(box);
    }

    // --- Crypto: open external dashboard (preserves module, behavior changed only) ---
    function buildCrypto(root){
      const wrap=E('div'); wrap.className='grid';
      const card=E('div'); card.className='card';
      card.innerHTML = `
        <b>Crypto Dashboard</b>
        <div class="muted" style="margin:.4rem 0">Launches billygpt.com/dash in a new tab.</div>
        <button id="open-dash" class="run">Open Dashboard</button>
      `;
      wrap.append(card);
      root.append(wrap);
      on(card.querySelector('#open-dash'),'click',()=>{ window.open('https://billygpt.com/dash','_blank','noopener'); });
    }

        function buildCommandList(root){
      const wrap=E('div'); wrap.className='grid';
      const card=E('div'); card.className='card';
      card.innerHTML = `
        <b>Extended Console</b>
        <div class="muted" style="margin:.4rem 0">Launches a page that has additional javascript functions that can be called from the console.</div>
        <button id="open-dash" class="run">Open Console Utilities Page</button>
      `;
      wrap.append(card);
      root.append(wrap);
      on(card.querySelector('#open-dash'),'click',()=>{ window.open('https://openapislop.github.io/js-command-inject-utility/','_blank','noopener'); });
    }

    // --- Weather (Open-Meteo): open API, no key required ---
    function buildWeather(root){
      const ui=E('div'); ui.className='grid';
      const c1=E('div'); c1.className='card';
      c1.innerHTML = `
        <b>Lookup</b>
        <div class="muted" style="margin:.4rem 0">City (e.g. "Chicago") or use GPS</div>
        <div style="display:flex;gap:.5rem">
          <input id="wx-city" class="inp" placeholder="City">
          <button id="wx-go" class="run">Fetch</button>
        </div>
        <div style="display:flex;gap:.5rem;margin-top:.5rem">
          <button id="wx-geo" class="run">Use GPS</button>
          <span class="muted" id="wx-status" style="align-self:center">-</span>
        </div>
      `;
      const c2=E('div'); c2.className='card'; c2.innerHTML = `<b>Current</b><div id="wx-current" class="muted">-</div>`;
      const c3=E('div'); c3.className='card'; c3.innerHTML = `<b>Next 6 hours</b><div id="wx-hours" class="muted">-</div>`;
      ui.append(c1,c2,c3);
      root.append(ui);

      async function geocode(name){
        const url=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`;
        const j=await fetch(url,{cache:'no-store'}).then(r=>r.json());
        const r=j && j.results && j.results[0];
        if(!r) throw new Error('City not found');
        return {lat:r.latitude, lon:r.longitude, label:`${r.name}${r.admin1?(', '+r.admin1):''}, ${r.country_code||''}`};
      }
      async function getForecast(lat,lon){
        const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,precipitation`;
        return fetch(url,{cache:'no-store'}).then(r=>r.json());
      }
      function fmtTemp(x){ return (x!=null?Math.round(x):'-')+'Â°C'; }

      async function runCity(name){
        setStat('Looking upâ€¦');
        try{
          const {lat,lon,label}=await geocode(name);
          const d=await getForecast(lat,lon);
          render(label,d);
          setStat('âœ“');
        }catch(e){ setStat('Error'); set('wx-current','-'); set('wx-hours','-'); }
      }
      async function runGeo(){
        setStat('Requesting locationâ€¦');
        if(!navigator.geolocation){ setStat('No GPS'); return; }
        navigator.geolocation.getCurrentPosition(async pos=>{
          try{
            const {latitude:lat,longitude:lon}=pos.coords||{};
            const d=await getForecast(lat,lon);
            render(`GPS: ${lat.toFixed(3)}, ${lon.toFixed(3)}`, d);
            setStat('âœ“');
          }catch(_){ setStat('Error'); }
        }, _=> setStat('Denied'));
      }

      function render(label, d){
        const cur=d.current_weather||{};
        const hours=d.hourly||{};
        set('wx-current', `${label}<br>Now: ${fmtTemp(cur.temperature)} â€¢ Wind ${cur.windspeed??'-'} km/h`);
        const lines=[];
        if (hours.time && hours.temperature_2m){
          for(let i=0;i<6 && i<hours.time.length;i++){
            const t=(hours.time[i].split('T')[1]||hours.time[i]).slice(0,5);
            const temp=hours.temperature_2m[i];
            const pr=(hours.precipitation && hours.precipitation[i]!=null)?hours.precipitation[i]:0;
            lines.push(`${t} - ${fmtTemp(temp)} â€¢ ${pr} mm`);
          }
        }
        setHTML('wx-hours', lines.join('<br>')||'-');
      }
      function set(id,v){ const el=D.getElementById(id); if(el) el.textContent=v; }
      function setHTML(id,html){ const el=D.getElementById(id); if(el) el.innerHTML=html; }
      function setStat(msg){ set('wx-status',msg); }

      on(c1.querySelector('#wx-go'),'click',()=>{ const v=c1.querySelector('#wx-city').value.trim(); if(v) runCity(v); });
      on(c1.querySelector('#wx-city'),'keydown',e=>{ if(e.key==='Enter'){ const v=e.currentTarget.value.trim(); if(v) runCity(v);} });
      on(c1.querySelector('#wx-geo'),'click',runGeo);
    }

    // assemble
    var rootBody=E('div'); rootBody.className='b';
    root.append(grip,head,rootBody);
    rootBody.append(colC,colN,colMenu);
    DB.appendChild(root);

    // floating button
    var btn=D.getElementById(BID);
    if(!btn){ btn=E('button'); btn.id=BID; btn.textContent='nova'; DB.appendChild(btn); }

    // toast
    try{ var toast=E('div'); toast.id=TID; toast.textContent='Nova loaded'; DB.appendChild(toast); setTimeout(()=>toast.remove(),1400);}catch(_){}

    return {root,grip,head,log,inp,run,btn,tbody,
      tabs:[tC,tN,tM],
      cols:{console:colC,net:colN,menu:colMenu},
      close
    };
  }

  // ---------- originals ----------
  var S={orig:{
    log:console.log, warn:console.warn, error:console.error,
    fetch:window.fetch,
    open:XMLHttpRequest && XMLHttpRequest.prototype.open,
    send:XMLHttpRequest && XMLHttpRequest.prototype.send
  }};

  // ---------- mount ----------
  function mount(){
    lockVP(); injectCSS();
    var U=buildUI(); if(!U) return;

    try{ U.btn.style.display='none'; }catch(_){}

    // collapsible
    function setCollapsed(v){
      if(v){ U.root.classList.add('collapsed'); U.root.style.height='auto'; }
      else { U.root.classList.remove('collapsed'); if(!U.root.style.height) U.root.style.height='56vh'; }
    }
    U.head.querySelector('.title').onclick=function(){ setCollapsed(!U.root.classList.contains('collapsed')); };

    // draggable resize (touch + mouse)
    (function(){
      let startY=0, startH=0, dragging=false;
      function onStart(e){
        dragging=true;
        startY=(e.touches?e.touches[0].clientY:e.clientY);
        startH=U.root.getBoundingClientRect().height;
        e.preventDefault();
      }
      function onMove(e){
        if(!dragging) return;
        const y=(e.touches?e.touches[0].clientY:e.clientY);
        let nh=startH+(startY-y);
        const vh=window.innerHeight||document.documentElement.clientHeight;
        const min=vh*0.32, max=vh*0.80;
        nh=Math.max(min,Math.min(max,nh));
        U.root.style.height=nh+'px';
        U.root.classList.remove('collapsed');
      }
      function onEnd(){ dragging=false; }
      U.root.querySelector('.grip').addEventListener('touchstart',onStart,{passive:false});
      U.root.querySelector('.grip').addEventListener('mousedown',onStart);
      window.addEventListener('touchmove',onMove,{passive:false});
      window.addEventListener('mousemove',onMove);
      window.addEventListener('touchend',onEnd);
      window.addEventListener('mouseup',onEnd);
    })();

    // console mirror
    function row(msg,cls){var d=E('div'); d.className='row'+(cls?(' '+cls):''); d.textContent=msg; U.log.appendChild(d); U.log.scrollTop=U.log.scrollHeight;}
    console.log=function(){ S.orig.log.apply(console,arguments); row([].map.call(arguments,jfmt).join(' ')); };
    console.warn=function(){ S.orig.warn.apply(console,arguments); row([].map.call(arguments,jfmt).join(' '),'w'); };
    console.error=function(){ S.orig.error.apply(console,arguments); row([].map.call(arguments,jfmt).join(' '),'e'); };

    // tabs
    function select(name){
      var idx = name==='console'?0 : name==='net'?1 : 2;
      U.tabs.forEach((b,i)=>b.setAttribute('aria-selected', String(i===idx)));
      U.cols.console.setAttribute('aria-hidden', String(idx!==0));
      U.cols.net.setAttribute('aria-hidden', String(idx!==1));
      U.cols.menu.setAttribute('aria-hidden', String(idx!==2));
    }
    U.tabs.forEach(b=>b.addEventListener('click',()=>select(b.dataset.tab)));

    // show/hide overlay via floating button
    U.root.style.display='flex';
    U.btn.onclick=()=>{const hide=U.root.style.display!=='none'; U.root.style.display=hide?'none':'flex'; U.btn.style.display=hide?'inline-block':'none';};

    // command runner
    function runCmd(){ try{ var v=U.inp.value; U.inp.value=''; var r=(0,eval)(v); row('> '+v); if(r!==undefined) row(String(r)); } catch(err){ row('Error: '+(err&&err.message||err),'e'); } }
    U.inp.addEventListener('keydown',e=>{ if(e.key==='Enter') runCmd(); });
    U.run.addEventListener('click',runCmd);

    // network capture
    function sizeFromHeaders(h){ try{ var v=h && h.get && h.get('content-length'); return v?((+v/1024).toFixed(1)+'kB'):'?'; }catch(_){ return '?'; } }
    ;(function(){ var tr=E('tr'); tr.innerHTML='<td>-</td><td>Network active</td><td>-</td><td>-</td><td>-</td>'; tbodyAppend(tr); })();
    function tbodyAppend(tr){ try{ var tb=U.cols.net.querySelector('tbody'); tb&&tb.appendChild(tr);}catch(_){} }

    if (typeof window.fetch==='function'){
      window.fetch=function(i,init){
        var t0=performance.now();
        return S.orig.fetch(i,init).then(function(res){
          try{
            var ms=Math.round(performance.now()-t0);
            var url=(res.url||i||'').toString();
            var method=(init&&init.method)||'GET';
            var size=sizeFromHeaders(res.headers||{});
            addNet({m:method,u:url,s:res.status,ms:ms,sz:size});
          }catch(_){}
          return res;
        });
      };
    }
    if (S.orig.open && S.orig.send){
      XMLHttpRequest.prototype.open=function(m,u){ try{ this.__n={m:m,u:u}; }catch(_){ } return S.orig.open.apply(this, arguments); };
      XMLHttpRequest.prototype.send=function(){
        var t0=performance.now(), self=this;
        this.addEventListener('loadend', function(){
          try{
            var ms=Math.round(performance.now()-t0);
            var size=self.getResponseHeader && self.getResponseHeader('content-length');
            addNet({m:(self.__n&&self.__n.m)||'XHR',u:self.responseURL||(self.__n&&self.__n.u)||'',s:self.status,ms:ms,sz:size?((+size/1024).toFixed(1)+'kB'):'?'});
          }catch(_){}
        });
        return S.orig.send.apply(this, arguments);
      };
    }
    function addNet(e){
      var tr=E('tr');
      tr.innerHTML='<td>'+esc(e.m||'')+'</td>'+
                   '<td style="max-width:0;white-space:nowrap;overflow:auto;-webkit-overflow-scrolling:touch">'+esc(e.u||'')+'</td>'+
                   '<td>'+esc(e.s==null?'':e.s)+'</td>'+
                   '<td>'+esc(e.ms==null?'':e.ms)+'</td>'+
                   '<td>'+esc(String(e.sz||'?'))+'</td>';
      tbodyAppend(tr);
    }

    // start on Menu so modules are discoverable
    (function(){ const btn=D.querySelector('#'+RID+' .t[data-tab="menu"]'); if(btn) btn.click(); })();

    // close/unmount
    U.close.onclick=off;

    try{ S.orig.log('%cnova v0.9 mounted','font:600 12px ui-monospace'); }catch(_){}
  }

  // ---------- unmount ----------
  function off(){
    try{
      console.log=S.orig.log; console.warn=S.orig.warn; console.error=S.orig.error;
      if (S.orig.fetch) window.fetch=S.orig.fetch;
      if (S.orig.open)  XMLHttpRequest.prototype.open=S.orig.open;
      if (S.orig.send)  XMLHttpRequest.prototype.send=S.orig.send;
    }catch(_){}
    restoreVP();
    try{ document.getElementById(SID)?.remove(); }catch(_){}
    try{ document.getElementById(RID)?.remove(); }catch(_){}
    try{ var b=document.getElementById(BID); if(b){ b.style.display=''; } }catch(_){}
    delete window.nova;
    try{ console.log('%cnova off (restored)','font:600 12px ui-monospace'); }catch(_){}
  }

  // expose API (minimal)
  window.nova={ off };

  // build button + auto-mount
  injectCSS();
  if (!D.getElementById(BID)) {
    var btn=E('button'); btn.id=BID; btn.textContent='nova';
    btn.addEventListener('click',function(){
      var root=document.getElementById(RID);
      if (root) {
        const hide = root.style.display!=='none';
        root.style.display = hide?'none':'flex';
        btn.style.display = hide?'inline-block':'none';
      } else {
        mount();
      }
    });
    DB.appendChild(btn);
  }
  mount();
})();

/* ---------- Safe network helper with XHR fallback ---------- */
window.nova = window.nova || {};
window.nova._httpJSON = async function _httpJSON(url){
  // Try fetch with an explicit window binding
  try {
    if (typeof globalThis.fetch === 'function') {
      const f = globalThis.fetch.bind(globalThis);           // ensure correct this
      const res = await f(url, {cache:'no-store'});
      const ct = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
      if (ct.includes('application/json')) return res.json();
      // tolerate JSON even if wrong content-type
      const txt = await res.text();
      try { return JSON.parse(txt); } catch { return {text: txt}; }
    }
  } catch (e) {
    // If it's NOT the Window.fetch binding bug, rethrow
    if (!/Window\.fetch/.test(String(e))) throw e;
  }
  // Fallback: XHR (works even if fetch wrapper is mis-bound)
  return new Promise(function(resolve, reject){
    try{
      const x = new XMLHttpRequest();
      x.open('GET', url, true);
      x.onreadystatechange = function(){
        if (x.readyState === 4){
          if (x.status >= 200 && x.status < 300){
            try { resolve(JSON.parse(x.responseText)); }
            catch(err){ reject(err); }
          } else reject(new Error('XHR ' + x.status));
        }
      };
      x.onerror = () => reject(new Error('XHR network error'));
      x.send();
    }catch(err){ reject(err); }
  });
};

/* ---------- Weather command usable from console ---------- */
/*
Usage:
  nova.fetchWeather('Chicago')
  nova.fetchWeather('Chicago, IL')
  nova.fetchWeather('London, UK', {hours:8, units:'c'})
  nova.fetchWeather({lat:41.8781, lon:-87.6298}, {units:'f'})
Options:
  hours: 1..24 (default 6)
  units: 'auto' | 'f' | 'c' (default 'auto' â†’ Â°F if browser locale looks US)
*/
window.nova.fetchWeather = async function(q, opts = {}) {
  const { hours = 6, units = 'auto' } = opts;

  const preferF = (() => {
    if (units === 'f') return true;
    if (units === 'c') return false;
    const lang = (navigator.language || '').toLowerCase();
    return /(^en-us|^en.*-us|\bus\b)/.test(lang);
  })();
  const toUnit = (c) => (c == null ? '-' : (preferF ? Math.round((c*9)/5 + 32)+'Â°F' : Math.round(c)+'Â°C'));
  const log = (...a) => console.log('%c[nova][weather]', 'font-weight:700', ...a);

  function parsePlace(s){
    const parts = String(s).split(',').map(x=>x.trim()).filter(Boolean);
    return { name: parts[0] || s, region: parts[1] || '', country: (parts[2]||'').toUpperCase() };
  }

  async function geocodeSmart(inputStr){
    const { name, region, country } = parsePlace(inputStr);
    const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=10&language=en`;
    const j = await window.nova._httpJSON(geoURL);
    const results = Array.isArray(j.results) ? j.results : [];
    if (!results.length) throw new Error('City not found');

    const norm = v => String(v||'').toLowerCase();
    let best = results[0];

    if (region){
      const rTok = norm(region);
      const regional = results.filter(r =>
        norm(r.admin1).includes(rTok) ||
        norm(r.admin2).includes(rTok) ||
        norm(r.subdivision).includes(rTok)
      );
      if (regional.length) best = regional[0];
    }
    if (country){
      const byCountry = results.filter(r =>
        (r.country_code || '').toUpperCase() === country || norm(r.country).includes(norm(country))
      );
      if (byCountry.length) best = byCountry[0];
    }

    return {
      lat: best.latitude, lon: best.longitude,
      label: `${best.name}${best.admin1 ? ', ' + best.admin1 : ''}, ${best.country_code || best.country || ''}`
    };
  }

  async function getForecast(lat, lon){
    const fxURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
                  `&current_weather=true&hourly=temperature_2m,precipitation&timezone=auto`;
    return window.nova._httpJSON(fxURL);
  }

  try{
    let coords, label;
    if (typeof q === 'string'){
      log('Resolving city:', q);
      const g = await geocodeSmart(q);
      coords = { lat: g.lat, lon: g.lon };
      label  = g.label;
    } else if (q && typeof q === 'object' && 'lat' in q && 'lon' in q){
      coords = { lat: Number(q.lat), lon: Number(q.lon) };
      label  = `(${coords.lat.toFixed(3)}, ${coords.lon.toFixed(3)})`;
    } else {
      throw new Error('Pass a city string (e.g., "Chicago" or "Chicago, IL") or {lat, lon}.');
    }

    const data = await getForecast(coords.lat, coords.lon);

    // Console output
    const cur = data.current_weather || {};
    console.groupCollapsed('%c[nova] Weather âžœ ' + label, 'font-weight:700');
    console.log('Current:', toUnit(cur.temperature), 'â€¢ Wind:', (cur.windspeed ?? '-') + ' km/h', 'â€¢ Code:', cur.weathercode ?? '-');

    const hourly = data.hourly || {};
    const rows = (hourly.time || []).map((t,i)=>({
      time: t,
      temp: (hourly.temperature_2m && typeof hourly.temperature_2m[i] === 'number') ? hourly.temperature_2m[i] : null,
      precip_mm: (hourly.precipitation && hourly.precipitation[i] != null) ? hourly.precipitation[i] : 0
    }));
    if (rows.length){
      const n = Math.max(1, Math.min(24, hours));
      console.table(rows.slice(0, n).map(r=>({ time: r.time, temp: toUnit(r.temp), precip_mm: r.precip_mm })));
    } else {
      console.log('No hourly data.');
    }
    console.groupEnd();

    // Optional: sync to existing Nova Weather panel if present (non-fatal)
    try{
      const curEl = document.getElementById('wx-current');
      const hoursEl = document.getElementById('wx-hours');
      if (curEl) curEl.innerHTML = `${label}<br>Now: ${toUnit(cur.temperature)} â€¢ Wind ${cur.windspeed ?? '-'} km/h`;
      if (hoursEl && rows.length){
        const n = Math.max(1, Math.min(24, hours));
        hoursEl.innerHTML = rows.slice(0,n).map(r=>{
          const hh = (r.time.split('T')[1] || r.time).slice(0,5);
          return `${hh} - ${toUnit(r.temp)} â€¢ ${r.precip_mm} mm`;
        }).join('<br>');
      }
    }catch(_){}

    return data;
  }catch(err){
    console.error('[nova][fetchWeather] Error:', err && err.message ? err.message : err);
    throw err;
  }
};

/* ===== Robust nova.fetchCrypto: multi-try Kraken pairs + CoinGecko confirm ===== */
window.nova = window.nova || {};

/* Safe JSON helper if you donâ€™t already have it */
nova._httpJSON = nova._httpJSON || (async function safeJSON(url){
  try {
    const f = (globalThis.fetch || window.fetch).bind(globalThis);
    const r = await f(url, {cache:'no-store'});
    const ct = (r.headers && r.headers.get && r.headers.get('content-type')) || '';
    if (ct.includes('json')) return r.json();
    const t = await r.text(); try { return JSON.parse(t); } catch { return { text: t }; }
  } catch (e) {
    if (!/Window\.fetch/.test(String(e))) throw e;
    return new Promise((resolve, reject)=>{
      const x = new XMLHttpRequest();
      x.open('GET', url, true);
      x.onreadystatechange = function(){
        if (x.readyState === 4){
          if (x.status >= 200 && x.status < 300){
            try { resolve(JSON.parse(x.responseText)); } catch(err){ reject(err); }
          } else reject(new Error('XHR ' + x.status));
        }
      };
      x.onerror = ()=>reject(new Error('XHR network error'));
      x.send();
    });
  }
});

(function attachFetchCrypto(){
  const log  = (...a)=>console.log('%c[nova][crypto]', 'font-weight:700;color:#0ff', ...a);
  const warn = (...a)=>console.warn('%c[nova][crypto]', 'font-weight:700;color:#ffb84d', ...a);
  const err  = (...a)=>console.error('%c[nova][crypto]', 'font-weight:700;color:#ff5b6e', ...a);

  const niceSymFromKr = (kr)=>{
    if (!kr) return kr;
    if (/^XXBT$/i.test(kr) || /^XBT$/i.test(kr)) return 'BTC';
    if (/^XETH$/i.test(kr) || /^ETH$/i.test(kr)) return 'ETH';
    if (/^ZUSD$/i.test(kr)) return 'USD';
    if (/^ZEUR$/i.test(kr)) return 'EUR';
    return kr.replace(/^[XZ]/,'').toUpperCase();
  };
  const fiatQuoteCode = (sym)=>{
    const S = String(sym).toUpperCase();
    if (S==='USD') return 'ZUSD';
    if (S==='EUR') return 'ZEUR';
    return S; // USDT, etc.
  };

  async function krakenUp(){
    try{
      const j = await nova._httpJSON('https://api.kraken.com/0/public/Time');
      return j && j.result && typeof j.result.unixtime === 'number';
    }catch(_){ return false; }
  }

  async function krakenTickerTry(pairCode){
    // pairCode may be raw (XXBTZUSD) or alt (XBTUSD)
    const url = 'https://api.kraken.com/0/public/Ticker?pair='+encodeURIComponent(pairCode);
    const j = await nova._httpJSON(url);
    const keys = Object.keys((j && j.result) || {});
    if (!keys.length) return null;
    const k = keys[0];
    const r = j.result[k] || {};
    return {
      url, key: k,
      last: r.c && +r.c[0],
      open: +r.o || null,
      high24: r.h && +r.h[1],
      low24:  r.l && +r.l[1],
      vol24:  r.v && +r.v[1],
      vwap24: r.p && +r.p[1]
    };
  }

  async function resolveCandidates(query, preferQuotes){
    const q = String(query).trim();

    // If full pair like "BTC/USD" or "ETH/USDT"
    if (/[A-Za-z0-9]+\/[A-Za-z0-9]+/.test(q)) {
      const [bRaw, qRaw] = q.split('/').map(s=>s.trim().toUpperCase());
      const baseKr = (bRaw==='BTC' ? 'XXBT' : bRaw==='ETH' ? 'XETH' : bRaw);
      const quoteKr= fiatQuoteCode(qRaw);
      const altBase = niceSymFromKr(baseKr); // XBT->BTC, XETH->ETH
      const altQuote= niceSymFromKr(quoteKr);
      return [
        baseKr+quoteKr,          // raw: XXBTZUSD
        altBase+altQuote         // alt: XBTUSD / ETHUSDT / etc.
      ];
    }

    // Symbol or name â†’ build a candidate list (BTC, Bitcoin, etc.)
    const isBTC = /^btc$/i.test(q) || /^bitcoin$/i.test(q);
    const isETH = /^eth$/i.test(q) || /^ethereum$/i.test(q);

    // Heuristic: treat anything containing â€œbtcâ€ as BTC; â€œethâ€ as ETH
    const baseCodes = isBTC ? ['XXBT','XBT'] :
                      isETH ? ['XETH','ETH'] :
                      [q.toUpperCase(), q.toUpperCase().replace(/^([A-Z])$/,'X$1')];

    const quotesWanted = (preferQuotes && preferQuotes.length ? preferQuotes : ['USD','USDT','EUR'])
      .map(s=>s.toUpperCase());

    const pairs = [];
    for (const base of baseCodes){
      for (const qsym of quotesWanted){
        const qkr = fiatQuoteCode(qsym);    // ZUSD/ZEUR/USDT
        const alt = niceSymFromKr(base) + niceSymFromKr(qkr);  // e.g., XBTUSD
        pairs.push(base + qkr); // raw
        pairs.push(alt);        // alt
      }
    }
    // Dedup preserving order
    return [...new Set(pairs)];
  }

  async function coingeckoConfirm(symOrName){
    try{
      const query = encodeURIComponent(symOrName);
      const s = await nova._httpJSON(`https://api.coingecko.com/api/v3/search?query=${query}`);
      const coin = (s && s.coins && s.coins[0]) || null;
      if (!coin) return null;
      const id = coin.id;
      const price = await nova._httpJSON(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd`);
      const usd = price && price[id] && price[id].usd;
      return { id, name: coin.name, symbol: (coin.symbol||'').toUpperCase(), usd };
    }catch(_){ return null; }
  }

  window.nova.fetchCrypto = async function(query, opts = {}){
    const preferQuotes = (opts.preferQuotes && opts.preferQuotes.length ? opts.preferQuotes : ['USD','USDT','EUR'])
      .map(s=>s.toUpperCase());
    const wantGecko = opts.gecko !== false;

    if (!query || typeof query !== 'string'){
      err('Pass a name/symbol ("Bitcoin"/"BTC") or a pair ("BTC/USD").');
      return null;
    }

    // 0) Sanity: is Kraken reachable?
    if (!(await krakenUp())){
      warn('Kraken API not reachable right now (Time endpoint failed). Will still try tickersâ€¦');
    }

    // 1) Build candidate pair codes to try in order
    const candidates = await resolveCandidates(query, preferQuotes);
    if (!candidates.length){
      warn('No candidate pairs derived from:', query);
      return null;
    }

    // 2) Try them until one returns data
    let tk = null, usedPair = null;
    for (const cand of candidates){
      try{
        tk = await krakenTickerTry(cand);
        if (tk && tk.last != null && isFinite(tk.last)){
          usedPair = cand;
          break;
        }
      }catch(_){}
    }

    // 3) Optional CoinGecko confirm (price sanity & networks)
    let gecko = null;
    if (wantGecko){
      const guessSym = /eth/i.test(query) ? 'ethereum' :
                       /btc|bitcoin/i.test(query) ? 'bitcoin' :
                       (query.split('/')[0] || query);
      gecko = await coingeckoConfirm(guessSym);
    }

    // 4) Output
    if (!tk){
      console.groupCollapsed('%c[nova] Kraken Ticker âžœ failed to resolve', 'font-weight:700;color:#ff5b6e');
      console.log('Tried pair codes (in order):', candidates);
      if (gecko) console.log('CoinGecko USD (for reference):', gecko.name, gecko.usd ?? '-');
      console.groupEnd();
      return null;
    }

    const deviate = (gecko && typeof gecko.usd === 'number' && tk.last)
      ? Math.abs((tk.last - gecko.usd) / gecko.usd) * 100
      : null;

    const pairKeyNice = tk.key || usedPair;
    const display = (()=>{
      // Try to pretty the pair "XBTUSD" -> "BTC/USD"
      const s = (pairKeyNice||'').toUpperCase();
      const map = [['XXBT','BTC'],['XBT','BTC'],['XETH','ETH'],['ETH','ETH'],['ZUSD','USD'],['ZEUR','EUR']];
      let pretty = s;
      map.forEach(([k,v])=>{ pretty = pretty.replaceAll(k, v); });
      // Insert slash before quote if missing
      return pretty.includes('/') ? pretty : pretty.replace(/(BTC|ETH)(USD|EUR|USDT)$/,'$1/$2');
    })();

    console.groupCollapsed('%c[nova] Kraken Ticker âžœ ' + display, 'font-weight:700');
    console.log('Kraken pair key:', tk.key, ' (requested:', usedPair, ')');
    console.log('Last:', tk.last != null ? ('$ ' + Number(tk.last).toLocaleString(undefined,{maximumFractionDigits:8})) : '-');
    const chg = (tk.last!=null && tk.open) ? ((tk.last - tk.open)/tk.open*100) : null;
    console.table([{
      pair: display,
      last: tk.last,
      open: tk.open,
      high24: tk.high24,
      low24: tk.low24,
      vol24: tk.vol24,
      vwap24: tk.vwap24,
      change_pct: chg!=null ? +chg.toFixed(2) : null
    }]);
    if (gecko){
      console.log('CoinGecko (confirm):', gecko.name, 'USD â‰ˆ', gecko.usd ?? '-');
      if (deviate!=null) console.log('Diff vs Kraken:', (deviate).toFixed(2)+'%');
    } else {
      console.log('CoinGecko confirm skipped.');
    }
    console.groupEnd();

    // Add a row to Novaâ€™s Network tab (best-effort)
    try{
      const tb = document.querySelector('#nova-root .netwrap tbody');
      if (tb) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>GET</td>
                        <td style="max-width:0;white-space:nowrap;overflow:auto;">https://api.kraken.com/0/public/Ticker?pair=${encodeURIComponent(usedPair)}</td>
                        <td>200</td>
                        <td>-</td>
                        <td>-</td>`;
        tb.appendChild(tr);
      }
    }catch(_){}

    return { input: query, tried: candidates, usedPair, ticker: tk, gecko, diffPct: deviate };
  };
})();

console.log('  nova.fetchWeather("Chicago")');
console.log('  nova.fetchCrypto("BTC or Bitcoin")');
