javascript:(function () {
  'use strict';

  // prevent double-mount
  if (window.nova && window.nova.__mounted) {
    try {
      const r = document.getElementById('nova-root'), b = document.getElementById('nova-btn');
      if (r) { r.style.display = 'flex'; if (b) b.style.display = 'none'; }
    } catch(_) {}
    return;
  }

  // -----------------------------
  // Constants
  // -----------------------------
  const RID='nova-root', BID='nova-btn', SID='nova-style', TID='nova-toast';

  // -----------------------------
  // Tiny DOM & util helpers
  // -----------------------------
  const D=document, DE=D.documentElement, DB=D.body||DE;
  const E=(t,p)=>{const el=D.createElement(t); if(p) Object.assign(el,p); return el;};
  const on=(el,ev,fn,opt)=>{el.addEventListener(ev,fn,opt); return ()=>el.removeEventListener(ev,fn,opt);};
  const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const jfmt=v=>{try{return typeof v==='string'?v:JSON.stringify(v,null,2)}catch(_){return String(v)}};
  const kv=(k,v)=>`<tr><th>${esc(k)}</th><td>${esc(v==null?'':String(v))}</td></tr>`;

  // -----------------------------
  // CSS (single injector)
  // -----------------------------
  function injectCSS(){
    if (document.getElementById(SID)) return;
    const s=E('style',{id:SID});
    s.textContent=`
html{-webkit-text-size-adjust:100%!important;text-size-adjust:100%!important}
#${RID}{
  position:fixed;left:0;right:0;bottom:0;z-index:2147483646;
  background:rgba(8,12,18,.96);color:#e6eefb;border-top:1px solid #1a2942;
  font:15px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  display:flex;flex-direction:column;height:56vh;max-height:80vh;min-height:32vh;
  --safe:env(safe-area-inset-bottom,0px);padding-bottom:calc(var(--safe));
  -webkit-font-smoothing:antialiased;touch-action:auto
}
#${RID} *{box-sizing:border-box;font:inherit;color:inherit}
#${RID}.collapsed{height:auto}
#${RID} .h{display:flex;gap:.5rem;align-items:center;padding:.75rem .9rem;
  background:#0e1626;border-bottom:1px solid #1a2942;position:sticky;top:0;z-index:2;user-select:none}
#${RID} .title{font-weight:700;opacity:.9;cursor:pointer}
#${RID} .sp{margin-left:auto;color:#9fb2c8}
#${RID} .close{margin-left:.25rem;width:38px;height:38px;border-radius:10px;border:1px solid #294064;
  background:#0f1a2c;cursor:pointer;display:flex;align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent}
#${RID} .t{padding:.5rem .8rem;border:1px solid #294064;border-radius:999px;background:#0f1a2c;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}
#${RID} .t[aria-selected="true"]{background:#13243a}
#${RID} .b{display:flex;flex:1;min-height:0}
#${RID} .col{flex:1;display:none;flex-direction:column;min-height:0;min-width:0}
#${RID} .col[aria-hidden="false"]{display:flex}
#${RID} .log{flex:1;overflow:auto;padding:.7rem .9rem;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
#${RID} .row{white-space:pre-wrap;word-break:break-word;border-bottom:1px dashed #1a2942;padding:.3rem 0}
#${RID} .row.w{color:#ffd166}#${RID} .row.e{color:#ff5b6e}
#${RID} .cmd{display:flex;gap:.6rem;padding:.6rem .9rem;background:#0e1626;border-top:1px solid #1a2942}
#${RID} input.inp{flex:1;background:#0b1220;border:1px solid #294064;border-radius:10px;padding:.7rem .8rem;font-size:16px!important;line-height:1.4!important;color:#e6eefb}
#${RID} button.run{background:#0f1a2c;border:1px solid #294064;border-radius:10px;padding:.6rem .85rem;cursor:pointer;-webkit-tap-highlight-color:transparent}
#${RID} .netwrap{flex:1;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
#${RID} .netwrap table{width:100%;border-collapse:collapse;table-layout:fixed}
#${RID} th,#${RID} td{border-bottom:1px solid #1a2942;padding:.5rem .6rem;text-align:left;vertical-align:top}
#${RID} th{position:sticky;top:0;background:#0e1626;z-index:1;white-space:nowrap}
#${RID} .netwrap th:nth-child(1), #${RID} .netwrap td:nth-child(1){width:74px}
#${RID} .netwrap th:nth-child(3), #${RID} .netwrap td:nth-child(3){width:78px}
#${RID} .netwrap th:nth-child(4), #${RID} .netwrap td:nth-child(4){width:60px}
#${RID} .netwrap th:nth-child(5), #${RID} .netwrap td:nth-child(5){width:70px}
#${RID} .netwrap th:nth-child(2), #${RID} .netwrap td:nth-child(2){
  width:auto;max-width:100%;white-space:normal;overflow-wrap:anywhere;word-break:break-word
}
#${RID} .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.65rem;padding:.65rem .8rem}
#${RID} .card{border:1px solid #1a2942;border-radius:12px;padding:.65rem;background:#0b1220}
#${RID} .muted{opacity:.8}
#${RID} .good{color:#22c55e}#${RID} .bad{color:#ff5b6e}
#${BID}{position:fixed;right:1rem;bottom:1rem;z-index:2147483647;background:#0d141f;border:1px solid #273a53;border-radius:12px;
  padding:.7rem .95rem;box-shadow:0 4px 18px rgba(0,0,0,.35);color:#e6eefb;font:600 16px/1.2 -apple-system,system-ui,Segoe UI,Roboto,Helvetica,Arial;cursor:pointer;-webkit-tap-highlight-color:transparent}
#${BID}:active{transform:scale(.96)}
#${TID}{position:fixed;left:50%;bottom:64px;transform:translateX(-50%);background:#0d141f;color:#e6eefb;border:1px solid #273a53;border-radius:999px;padding:.5rem .95rem;font:600 14px/1;z-index:2147483647;opacity:.98}
#${RID} .grip{height:32px;cursor:n-resize;background:linear-gradient(180deg,#0e1626,#0a111d);border-top:1px solid #1a2942;
  display:flex;justify-content:center;align-items:center;user-select:none;touch-action:none}
#${RID} .grip:before{content:'';display:block;width:54px;height:6px;border-radius:999px;background:#24324a}
#${RID} .menu-list{padding:.65rem .8rem;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
#${RID} .menu-item{display:flex;align-items:center;justify-content:space-between;gap:.5rem;border:1px solid #1a2942;border-radius:12px;padding:.7rem .8rem;margin:.35rem 0;background:#0b1220}
#${RID} .menu-item button{border:1px solid #294064;background:#0f1a2c;border-radius:10px;padding:.5rem .7rem;-webkit-tap-highlight-color:transparent}
#${RID} .panel{flex:1;min-height:0;display:flex;flex-direction:column}
#${RID} .crumbs{display:flex;gap:.5rem;align-items:center;padding:.6rem .8rem;border-bottom:1px solid #1a2942;background:#0e1626;position:sticky;top:0;z-index:1}
#${RID} .crumbs .back{border:1px solid #294064;background:#0f1a2c;border-radius:10px;padding:.4rem .6rem}
#${RID} .panel .scroller{flex:1;min-height:0;min-width:0;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:0}
#${RID} .about{padding:.65rem .8rem}
#${RID} .about table{display:block;width:max-content;min-width:900px;border-collapse:collapse}
#${RID} .about th,#${RID} .about td{border-bottom:1px solid #1a2942;padding:.5rem .6rem;vertical-align:top;white-space:nowrap}
@media (min-width:768px){#${RID}{font-size:16px}}
`;
    (document.head||document.documentElement).appendChild(s);
  }

  // -----------------------------
  // Viewport lock
  // -----------------------------
  let VP_OLD=null;
  function lockVP(){
    let m=D.querySelector('meta[name=viewport]');
    if(!m){m=E('meta',{name:'viewport'}); (D.head||DE).appendChild(m);}
    if(VP_OLD===null) VP_OLD=m.getAttribute('content')||'';
    m.setAttribute('content','width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover');
  }
  function restoreVP(){
    const m=D.querySelector('meta[name=viewport]');
    if(m && VP_OLD!==null){ m.setAttribute('content',VP_OLD); VP_OLD=null; }
  }

  // -----------------------------
  // Simple event bus (optional)
  // -----------------------------
  const Bus=(()=>{
    const map=new Map();
    return {
      on(type,fn){ (map.get(type)||map.set(type,[]).get(type)).push(fn); return ()=>{const arr=map.get(type)||[]; const i=arr.indexOf(fn); if(i>-1) arr.splice(i,1);} },
      emit(type,payload){ (map.get(type)||[]).forEach(fn=>{ try{fn(payload)}catch(_){}}); }
    };
  })();

  // -----------------------------
  // Services
  // -----------------------------
  const Services={
    orig:{
      log:console.log, warn:console.warn, error:console.error,
      fetch:globalThis.fetch, xopen:XMLHttpRequest&&XMLHttpRequest.prototype.open,
      xsend:XMLHttpRequest&&XMLHttpRequest.prototype.send
    },
    httpJSON: async function(url){
      // robust fetch w/ XHR fallback and mis-bound Window.fetch fix
      try{
        const f = (globalThis.fetch||window.fetch).bind(globalThis);
        const res = await f(url,{cache:'no-store'});
        const ct = (res.headers&&res.headers.get&&res.headers.get('content-type'))||'';
        if (ct.includes('json')) return res.json();
        const txt = await res.text(); try { return JSON.parse(txt); } catch { return {text: txt}; }
      }catch(e){
        if (!/Window\.fetch/.test(String(e))) throw e;
      }
      return new Promise((resolve,reject)=>{
        try{
          const x=new XMLHttpRequest();
          x.open('GET',url,true);
          x.onreadystatechange=function(){
            if (x.readyState===4){
              if (x.status>=200 && x.status<300){
                try{ resolve(JSON.parse(x.responseText)); }
                catch(err){ reject(err); }
              } else reject(new Error('XHR '+x.status));
            }
          };
          x.onerror=()=>reject(new Error('XHR network error'));
          x.send();
        }catch(err){ reject(err); }
      });
    },
    mountConsoleMirror(logEl){
      const row=(msg,cls)=>{const d=E('div',{className:'row'+(cls?(' '+cls):'')}); d.textContent=msg; logEl.appendChild(d); logEl.scrollTop=logEl.scrollHeight;};
      console.log=(...a)=>{Services.orig.log.apply(console,a); row(a.map(jfmt).join(' '));};
      console.warn=(...a)=>{Services.orig.warn.apply(console,a); row(a.map(jfmt).join(' '),'w');};
      console.error=(...a)=>{Services.orig.error.apply(console,a); row(a.map(jfmt).join(' '),'e');};
      return ()=>{ console.log=Services.orig.log; console.warn=Services.orig.warn; console.error=Services.orig.error; };
    },
    mountNetworkTap(tbody){
      function sizeFromHeaders(h){ try{ const v=h&&h.get&&h.get('content-length'); return v?((+v/1024).toFixed(1)+'kB'):'?'; }catch(_){ return '?'; } }
      const addNet=(e)=>{
        const tr=E('tr');
        tr.innerHTML = `<td>${esc(e.m||'')}</td>
          <td style="max-width:0;white-space:nowrap;overflow:auto;-webkit-overflow-scrolling:touch">${esc(e.u||'')}</td>
          <td>${esc(e.s==null?'':e.s)}</td><td>${esc(e.ms==null?'':e.ms)}</td><td>${esc(String(e.sz||'?'))}</td>`;
        tbody && tbody.appendChild(tr);
      };
      const unpatch = [];
      if (typeof window.fetch==='function'){
        const orig = Services.orig.fetch;
        window.fetch = function(i,init){
          const t0=performance.now();
          return orig(i,init).then(res=>{
            try{
              addNet({m:(init&&init.method)||'GET',u:(res.url||i||'').toString(),s:res.status,ms:Math.round(performance.now()-t0),sz:sizeFromHeaders(res.headers||{})});
            }catch(_){}
            return res;
          });
        };
        unpatch.push(()=>{ window.fetch = orig; });
      }
      if (Services.orig.xopen && Services.orig.xsend){
        const O=Services.orig.xopen, S=Services.orig.xsend;
        XMLHttpRequest.prototype.open=function(m,u){ this.__n={m,u}; return O.apply(this,arguments); };
        XMLHttpRequest.prototype.send=function(){
          const t0=performance.now(), self=this;
          this.addEventListener('loadend', function(){
            try{
              const size=self.getResponseHeader && self.getResponseHeader('content-length');
              addNet({m:(self.__n&&self.__n.m)||'XHR',u:self.responseURL||(self.__n&&self.__n.u)||'',s:self.status,ms:Math.round(performance.now()-t0),sz:size?((+size/1024).toFixed(1)+'kB'):'?'});
            }catch(_){}
          });
          return S.apply(this, arguments);
        };
        unpatch.push(()=>{ XMLHttpRequest.prototype.open=O; XMLHttpRequest.prototype.send=S; });
      }
      // initial heartbeat row
      const tr=E('tr'); tr.innerHTML='<td>-</td><td>Network active</td><td>-</td><td>-</td><td>-</td>'; tbody && tbody.appendChild(tr);
      return ()=>{ unpatch.forEach(fn=>{try{fn()}catch(_){}}); };
    }
  };

  // -----------------------------
  // Plugin system
  // -----------------------------
  const Plugins=(function(){
    const reg=new Map();
    return {
      register(def){ if(!def||!def.id||typeof def.mount!=='function') throw new Error('panel requires id + mount(root)'); reg.set(def.id,def); },
      get(id){ return reg.get(id); },
      all(){ return Array.from(reg.values()); }
    };
  })();

  // -----------------------------
  // UI shell (tabs + columns)
  // -----------------------------
  function buildUI(){
    if (D.getElementById(RID)) return null;
    const root=E('div',{id:RID});

    // grip for drag-resize
    const grip=E('div',{className:'grip'});

    // header + tabs
    const head=E('div',{className:'h'});
    const title=E('div',{className:'title',textContent:'nova'});
const tConsole = E('button', { className:'t', textContent:'Console' });
tConsole.setAttribute('data-tab','console');
tConsole.setAttribute('aria-selected','true');

const tNet = E('button', { className:'t', textContent:'Network' });
tNet.setAttribute('data-tab','net');
tNet.setAttribute('aria-selected','false');

const tMenu = E('button', { className:'t', textContent:'Menu' });
tMenu.setAttribute('data-tab','menu');
tMenu.setAttribute('aria-selected','false');

    const sp=E('div',{className:'sp'});
    const close=E('button',{className:'close','aria-label':'Close'}); close.innerHTML='&times;';
    head.append(title,tConsole,tNet,tMenu,sp,close);

    const body=E('div',{className:'b'});

    // Console col
    const colC=E('section',{className:'col','data-name':'console'}); colC.setAttribute('aria-hidden','false');
    const log=E('div',{className:'log'});
    const cmd=E('div',{className:'cmd'});
    const inp=E('input',{className:'inp',placeholder:'type JS and press Enter',autocapitalize:'off',autocorrect:'off',spellcheck:false});
    inp.inputMode='text';
    const run=E('button',{className:'run',textContent:'Send'});
    cmd.append(inp,run); colC.append(log,cmd);

    // Network col
    const colN=E('section',{className:'col','data-name':'net'}); colN.setAttribute('aria-hidden','true');
    const netWrap=E('div',{className:'netwrap scroller'});
    const table=E('table'), thead=E('thead'), tbody=E('tbody');
    thead.innerHTML='<tr><th>Method</th><th>URL</th><th>Status</th><th>ms</th><th>Size</th></tr>';
    table.append(thead,tbody); netWrap.append(table); colN.append(netWrap);

    // Menu col (host for panels)
    const colMenu=E('section',{className:'col','data-name':'menu'}); colMenu.setAttribute('aria-hidden','true');
    const menuList=E('div',{className:'menu-list scroller'});
    const panelHost=E('div',{className:'panel',style:'display:none'});
    const crumbs=E('div',{className:'crumbs'});
    const backBtn=E('button',{className:'back',textContent:'Back'});
    const crumbTitle=E('div'); crumbTitle.style.fontWeight='700';
    crumbs.append(backBtn,crumbTitle);
    const panelBody=E('div',{className:'scroller',style:'padding:0'});
    panelHost.append(crumbs,panelBody);
    colMenu.append(menuList,panelHost);

    // helpers for Menu
    function makeMenuItem(title, desc, open){
      const r=E('div',{className:'menu-item'});
      const l=E('div'); l.innerHTML = `<div><b>${esc(title)}</b></div><div class="muted" style="font-size:13px">${esc(desc)}</div>`;
      const b=E('button',{textContent:'Open'}); b.onclick=open;
      r.append(l,b); return r;
    }
    function openPanel(id){
      const def = Plugins.get(id);
      crumbTitle.textContent = (def&&def.title) || (id[0].toUpperCase()+id.slice(1));
      menuList.style.display='none';
      panelHost.style.display='flex';
      panelBody.innerHTML='';
      if (def) def.mount(panelBody, {Services, Bus, esc, E});
    }
    backBtn.onclick=function(){
      panelHost.style.display='none';
      menuList.style.display='block';
      panelBody.innerHTML='';
    };

    // assemble root
    const rootBody=E('div',{className:'b'});
    root.append(grip,head,rootBody);
    rootBody.append(colC,colN,colMenu);
    DB.appendChild(root);

    // floating button
    let btn=D.getElementById(BID);
    if(!btn){ btn=E('button',{id:BID,textContent:'nova'}); DB.appendChild(btn); }

    // toast
    try{ const t=E('div',{id:TID,textContent:'Nova loaded'}); DB.appendChild(t); setTimeout(()=>t.remove(),1400);}catch(_){}

    return {root,grip,head,log,inp,run,btn,tbody,
      tabs:[tConsole,tNet,tMenu],
      cols:{console:colC,net:colN,menu:colMenu},
      menuList,panelHost,panelBody,crumbTitle,close,
      openPanel, makeMenuItem
    };
  }

  // -----------------------------
  // Panels as plugins
  // -----------------------------

  // Menu "cards" panels
  Plugins.register({
    id:'creator', title:'App Info',
    mount(root){ const box=E('div',{className:'about'}), t=E('table'), tb=E('tbody');
      tb.innerHTML = [ kv('Dev','OpenAPISlop'),
        kv('GitHub','https://github.com/OpenAPISlop/js-command-inject'),
        kv('Version','0.1.0'),
        kv('Description','This app was created for… demo purposes')
      ].join(''); t.append(tb); box.append(t); root.append(box); }
  });

  Plugins.register({
    id:'about', title:'About',
    mount(root){
      const box=E('div',{className:'about'}), t=E('table'), tb=E('tbody');
      const n=window.navigator||{}, c=window.screen||{}, tz=(Intl&&Intl.DateTimeFormat)?Intl.DateTimeFormat().resolvedOptions().timeZone:'';
      let stor='-'; try{ stor=(navigator.storage&&navigator.storage.estimate)?'supported':'-'; }catch(_){}
      let ls='-', ss='-'; try{ localStorage.setItem('__nt','1'); localStorage.removeItem('__nt'); ls='ok'; }catch(_){ ls='blocked'; }
      try{ sessionStorage.setItem('__nt','1'); sessionStorage.removeItem('__nt'); ss='ok'; }catch(_){ ss='blocked'; }
      const ua=n.userAgent||'', isIOS=/iP(hone|od|ad)/.test(ua)||(/Macintosh/.test(ua)&&'ontouchend'in window);
      const rows=[];
      const dpr=window.devicePixelRatio||1, conn=n.connection||{};
      rows.push(kv('User Agent',ua));
      rows.push(kv('Platform',n.platform||''));
      rows.push(kv('iOS (detected)',isIOS?'yes':'no'));
      rows.push(kv('Language(s)',(n.languages&&n.languages.join)?n.languages.join(', '):n.language||''));
      rows.push(kv('Timezone',tz||''));
      rows.push(kv('Online',n.onLine));
      rows.push(kv('Device Memory','deviceMemory' in n ? n.deviceMemory+' GB' : ''));
      rows.push(kv('HW Threads',n.hardwareConcurrency||''));
      rows.push(kv('Viewport',(DE.clientWidth||innerWidth)+' × '+(DE.clientHeight||innerHeight)));
      rows.push(kv('Screen',(c.width||'')+' × '+(c.height||'')));
      rows.push(kv('DPR',dpr));
      rows.push(kv('Cookies Enabled',n.cookieEnabled));
      rows.push(kv('LocalStorage',ls));
      rows.push(kv('SessionStorage',ss));
      rows.push(kv('Storage API',stor));
      rows.push(kv('Connection',[conn.type,conn.effectiveType,conn.downlink,conn.rtt].filter(Boolean).join(' / ')||'' ));
      rows.push(kv('Do Not Track',n.doNotTrack||''));
      rows.push(kv('Referrer',D.referrer||''));
      rows.push(kv('Visibility',D.visibilityState||''));
      tb.innerHTML=rows.join(''); t.append(tb); box.append(t); root.append(box);
    }
  });

  Plugins.register({
    id:'githubpage', title:'GitHub Page',
    mount(root){ const wrap=E('div',{className:'grid'}), card=E('div',{className:'card'});
      card.innerHTML=`<b>GitHub</b><div class="muted" style="margin:.4rem 0">Redirects to GitHub page.</div>
        <button class="run" id="open-gh">Open GitHub Page</button>`;
      wrap.append(card); root.append(wrap);
      on(card.querySelector('#open-gh'),'click',()=>window.open('https://github.com/OpenAPISlop','_blank','noopener'));
    }
  });

  Plugins.register({
    id:'commands', title:'Extended Console',
    mount(root){ const wrap=E('div',{className:'grid'}), card=E('div',{className:'card'});
      card.innerHTML=`<b>Extended Console</b>
        <div class="muted" style="margin:.4rem 0">Launches a page with extra JS helpers callable from the console.</div>
        <button class="run" id="open-cmd">Open Console Utilities Page</button>`;
      wrap.append(card); root.append(wrap);
      on(card.querySelector('#open-cmd'),'click',()=>window.open('https://openapislop.github.io/js-command-inject-utility/','_blank','noopener'));
    }
  });

  Plugins.register({
    id:'crypto', title:'Crypto Dashboard',
    mount(root){ const wrap=E('div',{className:'grid'}), card=E('div',{className:'card'});
      card.innerHTML=`<b>Crypto Dashboard</b>
        <div class="muted" style="margin:.4rem 0">Launches billygpt.com/dash in a new tab.</div>
        <button class="run" id="open-dash">Open Dashboard</button>`;
      wrap.append(card); root.append(wrap);
      on(card.querySelector('#open-dash'),'click',()=>window.open('https://billygpt.com/dash','_blank','noopener'));
    }
  });

  

  Plugins.register({
    id:'weather', title:'Weather',
    mount(root,{Services}){
      const ui=E('div',{className:'grid'});
      const c1=E('div',{className:'card'});
      c1.innerHTML=`
        <b>Lookup</b>
        <div class="muted" style="margin:.4rem 0">City (e.g. "Chicago") or use GPS</div>
        <div style="display:flex;gap:.5rem">
          <input id="wx-city" class="inp" placeholder="City">
          <button id="wx-go" class="run">Fetch</button>
        </div>
        <div style="display:flex;gap:.5rem;margin-top:.5rem">
          <button id="wx-geo" class="run">Use GPS</button>
          <span class="muted" id="wx-status" style="align-self:center">-</span>
        </div>`;
      const c2=E('div',{className:'card'}); c2.innerHTML = `<b>Current</b><div id="wx-current" class="muted">-</div>`;
      const c3=E('div',{className:'card'}); c3.innerHTML = `<b>Next 6 hours</b><div id="wx-hours" class="muted">-</div>`;
      ui.append(c1,c2,c3); root.append(ui);

      const set=(id,v)=>{ const el=D.getElementById(id); if(el) el.textContent=v; };
      const setHTML=(id,html)=>{ const el=D.getElementById(id); if(el) el.innerHTML=html; };
      const setStat=msg=>set('wx-status',msg);
      const fmtTempC=x=> (x!=null?Math.round(x):'-')+' °C';

      async function geocode(name){
        const url=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`;
        const j=await Services.httpJSON(url);
        const r=j && j.results && j.results[0];
        if(!r) throw new Error('City not found');
        return {lat:r.latitude, lon:r.longitude, label:`${r.name}${r.admin1?(', '+r.admin1):''}, ${r.country_code||''}`};
      }
      async function getForecast(lat,lon){
        const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,precipitation`;
        return Services.httpJSON(url);
      }
      function render(label, d){
        const cur=d.current_weather||{}, hours=d.hourly||{};
        setHTML('wx-current', `${label}<br>Now: ${fmtTempC(cur.temperature)} • Wind ${cur.windspeed??'-'} km/h`);
        const lines=[];
        if (hours.time && hours.temperature_2m){
          for(let i=0;i<6 && i<hours.time.length;i++){
            const t=(hours.time[i].split('T')[1]||hours.time[i]).slice(0,5);
            const temp=hours.temperature_2m[i];
            const pr=(hours.precipitation && hours.precipitation[i]!=null)?hours.precipitation[i]:0;
            lines.push(`${t} - ${fmtTempC(temp)} • ${pr} mm`);
          }
        }
        setHTML('wx-hours', lines.join('<br>')||'-');
      }
      async function runCity(name){
        setStat('Looking up');
        try{
          const {lat,lon,label}=await geocode(name);
          const d=await getForecast(lat,lon);
          render(label,d);
          setStat('-');
        }catch(e){ setStat('Error'); set('wx-current','-'); set('wx-hours','-'); }
      }
      async function runGeo(){
        setStat('Requesting location');
        if(!navigator.geolocation){ setStat('No GPS'); return; }
        navigator.geolocation.getCurrentPosition(async pos=>{
          try{
            const {latitude:lat,longitude:lon}=pos.coords||{};
            const d=await getForecast(lat,lon);
            render(`GPS: ${lat.toFixed(3)}, ${lon.toFixed(3)}`, d);
            setStat('-');
          }catch(_){ setStat('Error'); }
        }, _=> setStat('Denied'));
      }
      on(c1.querySelector('#wx-go'),'click',()=>{ const v=c1.querySelector('#wx-city').value.trim(); if(v) runCity(v); });
      on(c1.querySelector('#wx-city'),'keydown',e=>{ if(e.key==='Enter'){ const v=e.currentTarget.value.trim(); if(v) runCity(v);} });
      on(c1.querySelector('#wx-geo'),'click',runGeo);
    }
  });

  // -----------------------------
  // Public API 
  // -----------------------------
  const Nova = {
    __mounted:false,
    Services, plugins: Plugins,
    off, fetchWeather, fetchCrypto
  };
  window.nova = Nova;

  // -----------------------------
  // Bootstrap / mount
  // -----------------------------
  function mount(){
    lockVP(); injectCSS();
    const U = buildUI(); if(!U) return; Nova.__mounted=true;

    // collapsible
    function setCollapsed(v){
      if(v){ U.root.classList.add('collapsed'); U.root.style.height='auto'; }
      else { U.root.classList.remove('collapsed'); if(!U.root.style.height) U.root.style.height='56vh'; }
    }
    U.head.querySelector('.title').onclick=()=>setCollapsed(!U.root.classList.contains('collapsed'));

    // drag-resize
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

    // console mirror + command runner
    const unConsole = Services.mountConsoleMirror(U.log);
    function runCmd(){ try{ const v=U.inp.value; U.inp.value=''; const r=(0,eval)(v); U.log.appendChild(E('div',{className:'row',textContent:'> '+v})); if(r!==undefined) U.log.appendChild(E('div',{className:'row',textContent:String(r)})); U.log.scrollTop=U.log.scrollHeight; } catch(err){ U.log.appendChild(E('div',{className:'row e',textContent:'Error: '+(err&&err.message||err)})); } }
    U.inp.addEventListener('keydown',e=>{ if(e.key==='Enter') runCmd(); });
    U.run.addEventListener('click',runCmd);

    // network tap
    const unNet = Services.mountNetworkTap(U.tbody);

    // tabs
    function select(name){
      const idx = name==='console'?0 : name==='net'?1 : 2;
      U.tabs.forEach((b,i)=>b.setAttribute('aria-selected', String(i===idx)));
      U.cols.console.setAttribute('aria-hidden', String(idx!==0));
      U.cols.net.setAttribute('aria-hidden', String(idx!==1));
      U.cols.menu.setAttribute('aria-hidden', String(idx!==2));
    }
    U.tabs.forEach(b=>b.addEventListener('click',()=>select(b.dataset.tab)));

    // menu population from plugins (cards)
    const card = (title,desc,open)=>U.makeMenuItem(title,desc,open);
    const menuDefs = [
      {id:'creator', title:'Info', desc:'App info'},
      {id:'about', title:'About', desc:'Device, browser & environment info'},
      {id:'githubpage', title:'GitHub', desc:'Link to developer GitHub'},
      {id:'commands', title:'Extended Console', desc:'More console-activated helpers'},
      {id:'crypto', title:'Crypto', desc:'Open billygpt.com/dash in a new tab'},
      {id:'weather', title:'Weather', desc:'Simple weather via Open-Meteo'}
      
    ];
    menuDefs.forEach(m=>{
      const def=Plugins.get(m.id);
      if (def) U.menuList.append(card(m.title, m.desc, ()=>U.openPanel(m.id)));
    });

    // start on Menu
    (function(){ const btn=U.head.querySelector('.t[data-tab="menu"]'); if(btn) btn.click(); })();

    // show/hide overlay via floating button
// show/hide overlay via floating button (robust: remount if root missing)
// show/hide state set here; click logic lives in the global handler below
U.root.style.display = 'flex';
try { U.btn.style.display = 'none'; } catch(_) {}


    // close/unmount
    U.close.onclick=off;

    // Keep for cleanup
    Nova.__unmount = function(){
      try{ unConsole&&unConsole(); }catch(_){}
      try{ unNet&&unNet(); }catch(_){}
    };

    try{ console.log('oi'); }catch(_){}
  }

  // -----------------------------
  // Unmount / cleanup
  // -----------------------------
function off(){
  try { Nova.__unmount && Nova.__unmount(); } catch(_) {}
  restoreVP();

  // Keep stylesheet so #nova-btn keeps its fixed position and styles
  // (Do NOT remove document.getElementById(SID))

  try { document.getElementById(RID)?.remove(); } catch(_) {}

  try {
    const b = document.getElementById(BID);
    if (b) b.style.display = 'inline-block';
  } catch(_) {}

  Nova.__mounted = false;
  // Do NOT delete window.nova; global click handler still references mount()
  try { console.log('%cnova off (restored)','font:600 12px ui-monospace'); } catch(_) {}
}



  // -----------------------------
  // Extra helpers kept public (console-usable)
  // -----------------------------
  async function fetchWeather(q, opts = {}){
    const { hours = 6, units = 'auto' } = opts;
    const preferF = (()=>{
      if (units==='f') return true; if (units==='c') return false;
      const lang=(navigator.language||'').toLowerCase(); return /(^en-us|^en.*-us|\bus\b)/.test(lang);
    })();
    const toUnit=c=> (c==null?'-': (preferF ? Math.round((c*9)/5+32)+'°F' : Math.round(c)+'°C'));
    const log=(...a)=>console.log('%c[nova][weather]','font-weight:700',...a);
    function parsePlace(s){ const parts=String(s).split(',').map(x=>x.trim()).filter(Boolean); return {name:parts[0]||s,region:parts[1]||'',country:(parts[2]||'').toUpperCase()}; }
    async function geocodeSmart(inputStr){
      const {name,region,country}=parsePlace(inputStr);
      const geoURL=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=10&language=en`;
      const j=await Services.httpJSON(geoURL);
      const results=Array.isArray(j.results)?j.results:[];
      if(!results.length) throw new Error('City not found');
      const norm=v=>String(v||'').toLowerCase();
      let best=results[0];
      if (region){
        const rTok=norm(region);
        const regional=results.filter(r=>[r.admin1,r.admin2,r.subdivision].map(norm).some(s=>s.includes(rTok)));
        if (regional.length) best=regional[0];
      }
      if (country){
        const byCountry=results.filter(r=> (r.country_code||'').toUpperCase()===country || norm(r.country).includes(norm(country)));
        if (byCountry.length) best=byCountry[0];
      }
      return { lat:best.latitude, lon:best.longitude, label:`${best.name}${best.admin1?', '+best.admin1:''}, ${best.country_code||best.country||''}` };
    }
    async function getForecast(lat,lon){
      const fxURL=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,precipitation&timezone=auto`;
      return Services.httpJSON(fxURL);
    }
    let coords,label;
    if (typeof q==='string'){ log('Resolving city:',q); const g=await geocodeSmart(q); coords={lat:g.lat,lon:g.lon}; label=g.label; }
    else if (q && typeof q==='object' && 'lat'in q && 'lon'in q){ coords={lat:+q.lat,lon:+q.lon}; label=`(${coords.lat.toFixed(3)}, ${coords.lon.toFixed(3)})`; }
    else throw new Error('Pass "City, Region, Country" or {lat,lon}');
    const data=await getForecast(coords.lat,coords.lon);
    const cur=data.current_weather||{}; const hourly=data.hourly||{};
    console.groupCollapsed('%c[nova] Weather • '+label,'font-weight:700');
    console.log('Current:', toUnit(cur.temperature), 'Wind:', (cur.windspeed??'-')+' km/h', 'Code:', cur.weathercode ?? '-');
    const rows=(hourly.time||[]).map((t,i)=>({time:t,temp:(hourly.temperature_2m&&typeof hourly.temperature_2m[i]==='number')?hourly.temperature_2m[i]:null,precip_mm:(hourly.precipitation&&hourly.precipitation[i]!=null)?hourly.precipitation[i]:0}));
    if (rows.length){
      const n=Math.max(1,Math.min(24,hours));
      console.table(rows.slice(0,n).map(r=>({time:r.time,temp:toUnit(r.temp),precip_mm:r.precip_mm})));
    }
    console.groupEnd();
    // sync panel if present
    try{
      const curEl=D.getElementById('wx-current'), hoursEl=D.getElementById('wx-hours');
      if (curEl) curEl.innerHTML = `${label}<br>Now: ${toUnit(cur.temperature)} • Wind ${cur.windspeed ?? '-'} km/h`;
      if (hoursEl && rows.length){
        const n=Math.max(1,Math.min(24,hours));
        hoursEl.innerHTML = rows.slice(0,n).map(r=>{
          const hh=(r.time.split('T')[1]||r.time).slice(0,5);
          return `${hh} - ${toUnit(r.temp)} • ${r.precip_mm} mm`;
        }).join('<br>');
      }
    }catch(_){}
    return data;
  }

  async function fetchCrypto(query, opts = {}){
    const preferQuotes=(opts.preferQuotes&&opts.preferQuotes.length?opts.preferQuotes:['USD','USDT','EUR']).map(s=>s.toUpperCase());
    const wantGecko=opts.gecko!==false;
    const niceSym=(kr)=> kr?.replace(/^[XZ]/,'').toUpperCase().replace(/^XBT$/,'BTC').replace(/^XETH$/,'ETH');
    const quoteCode=(sym)=>({USD:'ZUSD',EUR:'ZEUR'})[sym]||sym;
    async function krakenUp(){ try{ const j=await Services.httpJSON('https://api.kraken.com/0/public/Time'); return j&&j.result&&typeof j.result.unixtime==='number'; }catch(_){ return false; } }
    async function krTickerTry(pair){
      const url='https://api.kraken.com/0/public/Ticker?pair='+encodeURIComponent(pair);
      const j=await Services.httpJSON(url); const keys=Object.keys((j&&j.result)||{}); if(!keys.length) return null;
      const k=keys[0], r=j.result[k]||{};
      return {url,key:k,last:r.c&&+r.c[0],open:+r.o||null,high24:r.h&&+r.h[1],low24:r.l&&+r.l[1],vol24:r.v&&+r.v[1],vwap24:r.p&&+r.p[1]};
    }
    async function candidates(q){
      const s=String(q).trim().toUpperCase();
      if (/^[A-Z0-9]+\/[A-Z0-9]+$/.test(s)){
        const [b,qv]=s.split('/');
        const base = (b==='BTC'?'XXBT':b==='ETH'?'XETH':b);
        const quote= quoteCode(qv);
        return [base+quote, niceSym(base)+niceSym(quote)];
      }
      const bases = (/^BTC$|^BITCOIN$/.test(s)) ? ['XXBT','XBT'] : (/^ETH$|^ETHEREUM$/.test(s)) ? ['XETH','ETH'] : [s];
      const out=[];
      for (const b of bases){
        for (const q of preferQuotes){ const qk=quoteCode(q); out.push(b+qk); out.push(niceSym(b)+niceSym(qk)); }
      }
      return [...new Set(out)];
    }
    async function geckoConfirm(symOrName){
      try{
        const s=await Services.httpJSON('https://api.coingecko.com/api/v3/search?query='+encodeURIComponent(symOrName));
        const coin=(s&&s.coins&&s.coins[0])||null; if(!coin) return null;
        const price=await Services.httpJSON('https://api.coingecko.com/api/v3/simple/price?ids='+encodeURIComponent(coin.id)+'&vs_currencies=usd');
        const usd=price && price[coin.id] && price[coin.id].usd;
        return { id:coin.id, name:coin.name, symbol:(coin.symbol||'').toUpperCase(), usd };
      }catch(_){ return null; }
    }
    if (!query || typeof query!=='string'){ console.error('[nova][crypto] Pass "Bitcoin"/"BTC" or a pair ("BTC/USD").'); return null; }
    if (!(await krakenUp())) console.warn('[nova][crypto] Kraken time endpoint down; will still try tickers…');

    const cand = await candidates(query);
    let tk=null, used=null;
    for(const c of cand){ try{ tk=await krTickerTry(c); if (tk && isFinite(tk.last)){ used=c; break; } }catch(_){ } }
    let gecko=null; if (wantGecko){
      const guess = /eth/i.test(query) ? 'ethereum' : /btc|bitcoin/i.test(query) ? 'bitcoin' : (query.split('/')[0]||query);
      gecko = await geckoConfirm(guess);
    }
    if (!tk){
      console.groupCollapsed('%c[nova] Kraken Ticker - failed','font-weight:700;color:#ff5b6e');
      console.log('Tried:', cand);
      if (gecko) console.log('CoinGecko USD:', gecko.name, gecko.usd ?? '-');
      console.groupEnd();
      return null;
    }
    const chg=(tk.last!=null && tk.open) ? ((tk.last - tk.open)/tk.open*100) : null;
    const display=(tk.key||used||'').toUpperCase()
      .replace(/XXBT|XBT/,'BTC').replace(/XETH/,'ETH').replace(/ZUSD/,'USD').replace(/ZEUR/,'EUR')
      .replace(/(BTC|ETH)(USD|EUR|USDT)$/,'$1/$2');
    const dev=(gecko && typeof gecko.usd==='number' && tk.last) ? Math.abs((tk.last-gecko.usd)/gecko.usd)*100 : null;

    console.groupCollapsed('%c[nova] Kraken Ticker - '+display,'font-weight:700');
    console.table([{pair:display,last:tk.last,open:tk.open,high24:tk.high24,low24:tk.low24,vol24:tk.vol24,vwap24:tk.vwap24,change_pct: chg!=null?+chg.toFixed(2):null}]);
    if (gecko){ console.log('CoinGecko:', gecko.name,'USD ≈', gecko.usd ?? '-'); if (dev!=null) console.log('Diff vs Kraken:', dev.toFixed(2)+'%'); }
    console.groupEnd();

    // best-effort add a row to Network tab
    try{
      const tb=document.querySelector('#'+RID+' .netwrap tbody');
      if (tb){
        const tr=E('tr');
        tr.innerHTML = `<td>GET</td><td style="max-width:0;white-space:nowrap;overflow:auto;">https://api.kraken.com/0/public/Ticker?pair=${encodeURIComponent(used)}</td><td>200</td><td>-</td><td>-</td>`;
        tb.appendChild(tr);
      }
    }catch(_){}
    return { input:query, tried:cand, usedPair:used, ticker:tk, gecko, diffPct:dev };
  }

  // -----------------------------
  // Build the button + auto-mount
  // -----------------------------
  injectCSS();
  if (!D.getElementById(BID)) {
    const btn=E('button',{id:BID,textContent:'nova'});
    btn.addEventListener('click',function(){
      const root=document.getElementById(RID);
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
