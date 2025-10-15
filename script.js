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
    s.textContent = `
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

/* ===== Mini Chat (adjustable) ===== */
#${RID} .mc-wrap{display:flex;flex-direction:column;gap:.8rem;min-height:520px}
#${RID} .mc-section{display:flex;flex-direction:column;gap:.6rem;min-height:0;min-width:0}
#${RID} .mc-card{border:1px solid #1a2942;border-radius:12px;padding:.8rem;background:#0b1220;min-width:0;overflow:hidden}
#${RID} .mc-section, #${RID} .mc-card, #${RID} #mc-log, #${RID} .mc-mgr-body{min-height:0}

/* Chat console — resizable */
#${RID} #mc-log{
  flex:0 0 auto;
  height:var(--mc-log-h,180px);
  min-height:100px;
  max-height:30vh;
  overflow:auto;
  border:1px solid #1a2942;
  border-radius:10px;
  padding:.65rem;
  background:#0b1220;
  margin-top:1rem;
  margin-bottom:1rem;
  resize:vertical;
}

/* Optional grab bar under chat */
#${RID} .mc-resize{
  height:8px;margin:2px 0 6px;
  cursor:ns-resize;border-radius:6px;opacity:.85;
  background:linear-gradient(180deg,#1a2942,#13243a);
}

/* Chat rows */
#${RID} .mc-row{margin:.25rem 0;padding:.65rem 0 .75rem;border-bottom:1px dashed #1a2942}
#${RID} .mc-row:last-child{border-bottom:0}
#${RID} .mc-usr{font-weight:700}
#${RID} .mc-txt{color:#cddaf2}

/* Inline emoji */
#${RID} .mc-emoji-img{height:1.1em;width:auto;vertical-align:-.2em;border-radius:3px;image-rendering:auto}
#${RID} .mc-emoji-text{display:inline-block;padding:0 .2em;border:1px solid #294064;border-radius:6px;font-weight:600;font-size:90%;background:#0f1a2c;color:#a5cfff;vertical-align:baseline}

/* Top controls */
#${RID} .mc-top{
  display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;
  margin-bottom:.2rem;
}
#${RID} .mc-color{
  width:38px;height:28px;border:1px solid #294064;border-radius:6px;background:#0f1a2c;padding:0
}

/* Emoji manager */
#${RID} .mc-mgr{display:flex;flex-direction:column;gap:.6rem}
#${RID} .mc-mgr-row{display:grid;grid-template-columns:minmax(120px,180px) 1fr auto;gap:.5rem;align-items:center}
#${RID} .mc-mgr-bulk{display:grid;grid-template-columns:1fr auto;gap:.5rem;align-items:start}
#${RID} .mc-mgr .inp{width:100%}
#${RID} .mc-mgr .run{white-space:nowrap}
#${RID} .mc-mgr-body{max-height:240px;overflow:auto;border-top:1px solid #1a2942;padding-top:.5rem}
#${RID} .mc-em-item{border:1px solid #1a2942;border-radius:10px;padding:.55rem;background:#0b1220;display:flex;gap:.6rem;align-items:center;justify-content:space-between}
#${RID} .mc-em-val{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#${RID} .mc-em-item[aria-readonly="true"]{opacity:.85}

#${RID}{#nova-root .netwrap tr.clickable{cursor:pointer}
#nova-root .netwrap .caret{display:inline-block;margin-right:.4rem;transition:transform .15s;transform:rotate(0deg)}
#nova-root .netwrap tr[aria-expanded="true"] .caret{transform:rotate(90deg)}
#nova-root .netwrap tr.detail{background:#0a111d}
#nova-root .netwrap td pre{margin:0;white-space:pre-wrap;word-break:break-word}
#nova-root .kv{display:grid;grid-template-columns:140px 1fr;gap:.35rem .6rem}
#nova-root .kv b{opacity:.8}}


`;

;
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
  // Simple event bus 
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
  const CAPTURE_BODY = true;     // flip to false if you don’t want response bodies
  const BODY_PREVIEW_LIMIT = 2048;

  function sizeFromHeaders(h){
    try {
      const v=h&&h.get&&h.get('content-length'); 
      return v ? ((+v/1024).toFixed(1)+'kB') : '?';
    } catch(_) { return '?'; }
  }

  let seq = 0;
  const store = new Map(); // id -> data

  const mk = (tag, props)=>{ const el=document.createElement(tag); if(props) Object.assign(el, props); return el; };

  function expandRow(tr, data){
    // remove existing detail row (if any)
    if (tr.nextSibling && tr.nextSibling.classList && tr.nextSibling.classList.contains('detail')) {
      tr.parentNode.removeChild(tr.nextSibling);
      tr.removeAttribute('aria-expanded');
      return;
    }
    // build detail row
    const dtr = mk('tr', { className:'detail' });
    const td = mk('td'); td.colSpan = 5;

    const reqHeaders = data.req && data.req.headers ? data.req.headers : {};
    const resHeaders = data.res && data.res.headers ? data.res.headers : {};
    const reqBody    = data.req && 'body' in data.req ? data.req.body : null;
    const resBody    = data.res && 'body' in data.res ? data.res.body : null;

    const kv = (k,v)=>`<div><b>${k}</b><div>${v==null?'-':v}</div></div>`;
    const fmtObj = (o)=> o && typeof o==='object'
      ? `<pre>${escapeHTML(JSON.stringify(o, null, 2))}</pre>`
      : escapeHTML(String(o ?? ''));

    td.innerHTML = `
      <div class="kv">
        ${kv('Method', escapeHTML(data.m||''))}
        ${kv('URL', `<code>${escapeHTML(data.u||'')}</code>`)}
        ${kv('Status', escapeHTML(data.s==null?'':String(data.s)))}
        ${kv('Time', escapeHTML(data.ms==null?'':String(data.ms)+' ms'))}
        ${kv('Size', escapeHTML(String(data.sz||'?')))}
      </div>
      <div style="margin:.65rem 0 .4rem; font-weight:700">Request</div>
      <div class="kv">
        ${kv('Headers', `<pre>${escapeHTML(JSON.stringify(reqHeaders, null, 2))}</pre>`)}
        ${kv('Body', reqBody==null?'-':(`<pre>${escapeHTML(preview(reqBody))}</pre>`))}
      </div>
      <div style="margin:.65rem 0 .4rem; font-weight:700">Response</div>
      <div class="kv">
        ${kv('Headers', `<pre>${escapeHTML(JSON.stringify(resHeaders, null, 2))}</pre>`)}
        ${kv('Body (preview)', resBody==null?'-':(`<pre>${escapeHTML(resBody)}</pre>`))}
      </div>
    `;
    dtr.appendChild(td);
    tr.after(dtr);
    tr.setAttribute('aria-expanded','true');
  }

  function escapeHTML(s){ return String(s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function preview(body){
    try {
      if (body==null) return '';
      if (typeof body === 'string') return body.length>BODY_PREVIEW_LIMIT ? (body.slice(0,BODY_PREVIEW_LIMIT)+'…') : body;
      if (body instanceof Blob) return `[Blob ${body.type||''}, ${body.size} bytes]`;
      if (body instanceof ArrayBuffer) return `[ArrayBuffer ${body.byteLength} bytes]`;
      return JSON.stringify(body, null, 2);
    } catch { return String(body); }
  }

  function addRow(data){
    const tr = mk('tr');
    tr.className = 'clickable';
    tr.innerHTML = `
      <td><span class="caret">▶</span>${escapeHTML(data.m||'')}</td>
      <td style="max-width:0;white-space:nowrap;overflow:auto;-webkit-overflow-scrolling:touch">${escapeHTML(data.u||'')}</td>
      <td>${escapeHTML(data.s==null?'':String(data.s))}</td>
      <td>${escapeHTML(data.ms==null?'':String(data.ms))}</td>
      <td>${escapeHTML(String(data.sz||'?'))}</td>
    `;
    tr.addEventListener('click', ()=> expandRow(tr, data));
    tbody && tbody.appendChild(tr);
  }

  function record(data){
    const id = ++seq;
    store.set(id, data);
    addRow(data);
  }

  // --- patch fetch ---
  const unpatch = [];
  if (typeof window.fetch === 'function'){
    const orig = Services.orig.fetch;
    window.fetch = async function(input, init){
      const t0 = performance.now();
      let urlStr = (typeof input === 'string') ? input : (input && input.url) || '';
      const method = (init && init.method) || (typeof input === 'object' && input && input.method) || 'GET';
      const reqHeaders = (()=>{ try{ return init && init.headers ? Object.fromEntries(new Headers(init.headers).entries()) : {}; }catch(_){ return {}; }})();
      const reqBody = init && 'body' in init ? init.body : null;

      const res = await orig(input, init);
      let resText = null, headersObj = {};
      try {
        res.headers && res.headers.forEach((v,k)=>{ headersObj[k]=v; });
        if (CAPTURE_BODY){
          const clone = res.clone();
          resText = await clone.text();
          if (resText.length > BODY_PREVIEW_LIMIT) resText = resText.slice(0, BODY_PREVIEW_LIMIT) + '…';
        }
      } catch(_) {}

      record({
        m: method,
        u: (res && res.url) ? res.url : String(urlStr),
        s: res && res.status,
        ms: Math.round(performance.now() - t0),
        sz: sizeFromHeaders(res && res.headers),
        req: { headers: reqHeaders, body: reqBody },
        res: { headers: headersObj, body: resText }
      });

      return res;
    };
    unpatch.push(()=>{ window.fetch = orig; });
  }

  // --- patch XHR ---
  if (Services.orig.xopen && Services.orig.xsend){
    const O = Services.orig.xopen, S = Services.orig.xsend;
    const SRH = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.open = function(m,u){
      this.__n = { m, u, reqHeaders:{} };
      return O.apply(this, arguments);
    };
    XMLHttpRequest.prototype.setRequestHeader = function(k,v){
      try { this.__n && (this.__n.reqHeaders[k]=v); } catch(_){}
      return SRH.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function(body){
      const t0 = performance.now();
      this.__n = this.__n || {};
      this.__n.reqBody = body;

      this.addEventListener('loadend', ()=>{
        try{
          // headers
          const raw = this.getAllResponseHeaders ? this.getAllResponseHeaders() : '';
          const resHeaders = {};
          raw.trim().split(/\r?\n/).forEach(line=>{
            const i=line.indexOf(':'); if(i>0){ resHeaders[line.slice(0,i).trim().toLowerCase()] = line.slice(i+1).trim(); }
          });
          const resBody = CAPTURE_BODY ? preview(this.responseType === '' || this.responseType === 'text' ? this.responseText : `[${this.responseType}]`) : null;

          record({
            m: (this.__n && this.__n.m) || 'XHR',
            u: this.responseURL || (this.__n && this.__n.u) || '',
            s: this.status,
            ms: Math.round(performance.now() - t0),
            sz: (this.getResponseHeader && this.getResponseHeader('content-length')) ? ((+this.getResponseHeader('content-length')/1024).toFixed(1)+'kB') : '?',
            req: { headers: (this.__n && this.__n.reqHeaders)||{}, body: this.__n && this.__n.reqBody },
            res: { headers: resHeaders, body: resBody }
          });
        }catch(_){}
      });
      return S.apply(this, arguments);
    };

    unpatch.push(()=>{
      XMLHttpRequest.prototype.open = O;
      XMLHttpRequest.prototype.send = S;
      XMLHttpRequest.prototype.setRequestHeader = SRH;
    });
  }

  // initial heartbeat row
  const tr = mk('tr'); tr.innerHTML='<td>-</td><td>Network active</td><td>-</td><td>-</td><td>-</td>';
  tbody && tbody.appendChild(tr);

  return ()=>{ unpatch.forEach(fn=>{ try{ fn(); }catch(_){ } }); };
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
//FOOD TEST
// --- Food Facts & Allergy Checker (with Camera Barcode Scan) ---
// API: OpenFoodFacts (no key) — https://world.openfoodfacts.org/data
// Features: search by name or barcode; live camera scan; Nutri-Score/NOVA;
// allergen highlights (user-configurable, saved in localStorage); sugar/salt/sat-fat flags; palm-oil detection.
// --- Food Facts & Allergy Checker (with Camera Barcode Scan + mobile-friendly layout) ---
// API: OpenFoodFacts (no key) — https://world.openfoodfacts.org/data
// Features: search by name or barcode; live camera scan (native BarcodeDetector → ZXing fallback);
// Nutri-Score/NOVA; sugar/salt/sat-fat flags; palm-oil detection; user allergen highlights; ingredients shown and highlight matches.
// --- Food Facts & Allergy Checker (Camera Scan + Ingredients + "Lookup" action) ---
// API: OpenFoodFacts (no key) — https://world.openfoodfacts.org/data
// Features: search by name or barcode; live camera scan (BarcodeDetector → ZXing fallback);
// Nutri-Score/NOVA; sugar/salt/sat-fat flags; palm-oil detection; user allergen highlights;
// ingredients shown (expandable) with highlighted matches; “Save” replaced with **Lookup**.
Plugins.register({
  id: 'foodfacts',
  title: 'Food Facts',
  async mount(root, { Services, esc, E }) {
    // ---------------- UI ----------------
    const ui = E('div', { className: 'grid' });

    const cardSearch = E('div', { className: 'card' });
    cardSearch.innerHTML = `
      <b>Food Facts (OpenFoodFacts)</b>
      <div class="muted" style="margin:.35rem 0">
        Search by product name or use your camera to scan a barcode.
      </div>
      <div style="display:flex;flex-direction:column;gap:.5rem;margin:.35rem 0">
        <input id="ff-q" class="inp" placeholder="e.g., granola bar or 737628064502" style="flex:1">
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <button id="ff-go" class="run">Lookup</button>
          <button id="ff-scan" class="run">Scan</button>
        </div>
      </div>
      <div class="muted" id="ff-status">-</div>
    `;

    const cardPrefs = E('div', { className: 'card' });
    cardPrefs.innerHTML = `
      <b>Ingredients & Keywords</b>
      <div class="muted" style="margin:.3rem 0">
        Type ingredients, allergens, or keywords to <i>search</i> products (also used to highlight in ingredient lists).
      </div>
      <div style="display:flex;flex-direction:column;gap:.5rem">
        <input id="ff-allergens" class="inp" placeholder="gluten, lactose, peanuts, soy" style="flex:1">
        <button id="ff-lookup" class="run">Lookup</button>
      </div>
      <div class="muted" style="margin-top:.35rem;font-size:12px">
        Tip: Your keywords are remembered locally and used to highlight matches in results.
      </div>
    `;

    const cardResults = E('div', { className: 'card' });
    cardResults.innerHTML = `<b>Results</b><div id="ff-out" class="muted" style="margin-top:.35rem">-</div>`;

    // Scanner overlay (inline card inside panel)
    const cardScan = E('div', { className: 'card', style: 'display:none; scroll-margin-top: 60px' });
    cardScan.innerHTML = `
      <b>Scan Barcode</b>
      <div class="muted" style="margin:.3rem 0">Point your camera at an EAN/UPC barcode</div>
      <div id="ff-cam-wrap" style="position:relative;border:2px solid #1a2942;border-radius:12px;overflow:hidden;background:#000;aspect-ratio:3/4;max-height:480px">
        <video id="ff-video" playsinline autoplay muted style="width:100%;height:100%;object-fit:cover;background:#000"></video>
        <canvas id="ff-canvas" style="display:none"></canvas>
        <div id="ff-crosshair" style="position:absolute;left:10%;right:10%;top:20%;bottom:20%;border:2px dashed rgba(255,255,255,.6);border-radius:10px;pointer-events:none"></div>
        <div id="ff-scan-badge" style="position:absolute;left:10px;top:10px;background:rgba(14,22,38,.85);border:1px solid #294064;border-radius:999px;padding:.25rem .6rem;font-size:12px">Scanning…</div>
      </div>
      <div style="display:flex;gap:.5rem;margin-top:.5rem;align-items:center;flex-wrap:wrap">
        <button id="ff-stop" class="run">Stop</button>
        <span id="ff-scan-status" class="muted">Starting camera…</span>
      </div>
    `;

    ui.append(cardSearch, cardPrefs, cardResults, cardScan);
    root.append(ui);

    // ---------------- State & helpers ----------------
    const qEl = cardSearch.querySelector('#ff-q');
    const stEl = cardSearch.querySelector('#ff-status');
    const outEl = cardResults.querySelector('#ff-out');
    const prefEl = cardPrefs.querySelector('#ff-allergens');

    const scanWrap = cardScan;
    const camBox = cardScan.querySelector('#ff-cam-wrap');
    const videoEl = cardScan.querySelector('#ff-video');
    const canvasEl = cardScan.querySelector('#ff-canvas');
    const scanStatusEl = cardScan.querySelector('#ff-scan-status');
    const scanBadge = cardScan.querySelector('#ff-scan-badge');

    const LS_KEY = 'nova_ff_allergens';
    const getKeys = () => (localStorage.getItem(LS_KEY) || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const setKeys = v => localStorage.setItem(LS_KEY, v);

    // load saved highlight keywords
    prefEl.value = localStorage.getItem(LS_KEY) || '';
    prefEl.addEventListener('input', () => setKeys(prefEl.value || ''));

    const setStatus = s => { stEl.textContent = s || '-'; };

    const fmt = {
      g100(n) { return (n == null || !isFinite(+n)) ? '-' : (+n).toFixed(1) + ' g/100g'; },
    };

    // UK traffic-light style cutoffs (per 100g)
    const TL = {
      sugars: { low: 5, high: 22.5 },
      'saturated-fat': { low: 1.5, high: 5 },
      salt: { low: 0.3, high: 1.5 }
    };
    const band = (nutr, val) => {
      if (val == null || !isFinite(+val)) return { tag: '-', cls: '' };
      const v = +val, r = TL[nutr];
      if (!r) return { tag: '-', cls: '' };
      if (v >= r.high) return { tag: 'high', cls: 'bad' };
      if (v <= r.low) return { tag: 'low', cls: 'good' };
      return { tag: 'med', cls: '' };
    };

    const pill = (label, value, cls='') =>
      `<span class="muted" style="display:inline-block;border:1px solid #294064;border-radius:999px;padding:.15rem .5rem;margin:.1rem .15rem;background:#0f1a2c;${cls==='bad'?'color:#ff5b6e;':cls==='good'?'color:#22c55e;':''}">${esc(label)}: ${esc(value)}</span>`;

    const highlightMatches = (ingredientsText, tags, userTerms) => {
      const offs = (tags || []).map(s => s.split(':').pop()).filter(Boolean);
      const uniq = new Set(offs.concat(userTerms));
      let txt = String(ingredientsText || '');
      uniq.forEach(a => {
        if (!a) return;
        const re = new RegExp(`\\b(${a.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\$&')})\\b`, 'ig');
        txt = txt.replace(re, '<b style="color:#ff5b6e">$1</b>');
      });
      return txt;
    };

    const isPalm = (product) => {
      const t = product?.ingredients_tags || [];
      const s = t.map(x => x.toLowerCase());
      return {
        hasPalm: s.includes('en:palm-oil') || s.includes('en:palm'),
        palmFree: s.includes('en:palm-oil-free') || s.includes('en:without-palm-oil')
      };
    };

    const nutriBadge = (prod) => {
      const grade = (prod?.nutriscore_grade || '').toUpperCase();
      if (!grade) return '';
      const color = { A:'#22c55e', B:'#84cc16', C:'#facc15', D:'#f97316', E:'#ef4444' }[grade] || '#a5cfff';
      return `<span style="display:inline-block;border-radius:6px;border:1px solid #294064;padding:.15rem .4rem;background:#0f1a2c"><b style="color:${color}">Nutri-Score ${grade}</b></span>`;
    };

    const novaBadge = (prod) => {
      const n = prod?.nova_groups || prod?.nova_group;
      if (!n) return '';
      const color = { 1:'#22c55e', 2:'#84cc16', 3:'#f59e0b', 4:'#ef4444' }[n] || '#a5cfff';
      return `<span style="display:inline-block;border-radius:6px;border:1px solid #294064;padding:.15rem .4rem;background:#0f1a2c"><b style="color:${color}">NOVA ${n}</b></span>`;
    };

    // Expandable ingredients block
    const makeIngrHTML = (rawHTML) => {
      const MAX = 380;
      const open = rawHTML.length <= MAX;
      const short = rawHTML.slice(0, MAX);
      const rest = rawHTML.slice(MAX);
      const id = 'ingr_' + Math.random().toString(36).slice(2);
      if (open) return `<div class="mc-txt">${rawHTML}</div>`;
      return `
        <div class="mc-txt" id="${id}">
          ${short}<span data-more style="display:none">${rest}</span>
          <button data-toggle="${id}" class="run" style="margin-left:.35rem;padding:.2rem .45rem">Show more</button>
        </div>`;
    };

    const productCard = (p) => {
      const img = p.image_front_small_url || p.image_url;
      const name = p.product_name || p.generic_name || '(no name)';
      const brand = p.brands || p.brand_owner || '';
      const qty = p.quantity || '';
      const nutr = p.nutriments || {};
      const terms = getKeys();

      const sugars = +nutr.sugars_100g;
      const sat = +nutr['saturated-fat_100g'];
      const salt = +nutr.salt_100g;

      const bSug = band('sugars', sugars);
      const bSat = band('saturated-fat', sat);
      const bSalt = band('salt', salt);

      const ingr = p.ingredients_text || p.ingredients_text_en || '';
      const alTags = p.allergens_tags || [];
      const palm = isPalm(p);

      const line1 = [nutriBadge(p), novaBadge(p)].filter(Boolean).join(' ');
      const line2 = [
        pill('Sugars', fmt.g100(sugars), bSug.cls),
        pill('Sat. fat', fmt.g100(sat), bSat.cls),
        pill('Salt', fmt.g100(salt), bSalt.cls)
      ].join(' ');

      const palmTag = palm.palmFree
        ? `<span class="good" style="margin-left:.25rem">Palm-oil-free</span>`
        : palm.hasPalm ? `<span class="bad" style="margin-left:.25rem">Contains palm oil</span>` : '';

      const allergensLine = (alTags.length || terms.length)
        ? `<div style="margin-top:.35rem"><span class="muted">Allergens:</span> ${(alTags.map(a=>`<code>${esc(a.split(':').pop())}</code>`).join(' ') || '-')}</div>`
        : '';

      const highlightedIngr = highlightMatches(esc(ingr), alTags, terms);
      const ingrBlock = ingr
        ? `<div style="margin-top:.4rem"><span class="muted">Ingredients:</span> ${makeIngrHTML(highlightedIngr)}</div>`
        : '';

      return `
        <div style="display:grid;grid-template-columns:88px 1fr;gap:.65rem;border:1px solid #1a2942;border-radius:12px;padding:.65rem;margin:.45rem 0;background:#0b1220">
          <div>${img?`<img src="${esc(img)}" alt="" style="width:88px;height:88px;object-fit:cover;border-radius:10px">`:'-'}</div>
          <div style="min-width:0">
            <div style="font-weight:700">${esc(name)}</div>
            <div class="muted">${esc(brand)} ${qty?`• ${esc(qty)}`:''} ${palmTag}</div>
            <div style="margin-top:.35rem;display:flex;gap:.35rem;flex-wrap:wrap">${line1}</div>
            <div style="margin-top:.25rem">${line2}</div>
            ${allergensLine}
            ${ingrBlock}
            <div class="muted" style="margin-top:.4rem;font-size:12px">Barcode: ${esc(p.code||'–')}</div>
          </div>
        </div>`;
    };

    // toggle long ingredients
    outEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-toggle]');
      if (!btn) return;
      const id = btn.getAttribute('data-toggle');
      const host = document.getElementById(id);
      if (!host) return;
      const more = host.querySelector('[data-more]');
      const showing = more.style.display !== 'none';
      more.style.display = showing ? 'none' : 'inline';
      btn.textContent = showing ? 'Show more' : 'Show less';
    });

    const renderResults = (arr, context='') => {
      if (!arr || !arr.length) {
        outEl.innerHTML = `<div class="muted">No products found ${context?esc('('+context+')'):''}.</div>`;
        return;
      }
      outEl.innerHTML = arr.map(productCard).join('');
    };

    // ---------------- API calls ----------------
    const ge = async (url) => {
      setStatus('Fetching…');
      try {
        return await Services.httpJSON(url);
      } finally {
        setStatus('-');
      }
    };

    // Name/keyword search — “fixes the lookup”
    // Uses OFF search endpoint with simple query; sorts by popularity implicitly.
    const searchByName = async (q) => {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&page_size=20&search_simple=1&action=process&json=1`;
      const j = await ge(url);
      const prods = (j && j.products) || [];
      renderResults(prods, q);
    };

    const lookupBarcode = async (code) => {
      const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(code)}.json`;
      const j = await ge(url);
      const p = j && j.product;
      renderResults(p ? [p] : [], code);
    };

    // ---------------- Barcode scanning ----------------
    let stream = null, stopScan = null, zxingReader = null;

    async function ensureZXing() {
      if (window.ZXing || window.zxing) return;
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@zxing/library@0.20.0/umd/index.min.js';
        s.crossOrigin = 'anonymous';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }

    function flashCamBox() {
      camBox.style.transition = 'box-shadow .25s ease, border-color .25s ease';
      camBox.style.boxShadow = '0 0 0 3px rgba(96,165,250,.6)';
      camBox.style.borderColor = '#60a5fa';
      setTimeout(() => {
        camBox.style.boxShadow = 'none';
        camBox.style.borderColor = '#1a2942';
      }, 900);
    }

    async function startScan() {
      // Reveal scanner card and scroll it into view prominently
      scanWrap.style.display = 'block';
      setTimeout(() => {
        scanWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
        flashCamBox();
      }, 0);

      scanBadge.textContent = 'Starting…';
      scanStatusEl.textContent = 'Starting camera…';

      // Get camera
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      } catch (e) {
        scanBadge.textContent = 'Camera blocked';
        scanStatusEl.textContent = 'Camera permission denied';
        return;
      }
      videoEl.srcObject = stream;

      const Barcode = window.BarcodeDetector && (await BarcodeDetector.getSupportedFormats?.())
        ? new BarcodeDetector({ formats: ['ean_13','ean_8','upc_a','upc_e','code_128'] })
        : null;

      if (Barcode) {
        scanBadge.textContent = 'Scanning…';
        scanStatusEl.textContent = 'Scanning (native)…';
        let alive = true;

        const tick = async () => {
          if (!alive) return;
          try {
            const codes = await Barcode.detect(videoEl);
            if (codes && codes.length) {
              const code = codes[0].rawValue || codes[0].value;
              if (code) {
                scanBadge.textContent = 'Found';
                scanStatusEl.textContent = 'Found: ' + code;
                await lookupBarcode(code);
                stopScanning();
                return;
              }
            }
          } catch {}
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        stopScan = () => {
          alive = false;
          try { stream && stream.getTracks().forEach(t => t.stop()); } catch {}
          stream = null;
          scanBadge.textContent = 'Stopped';
          scanStatusEl.textContent = 'Stopped';
          scanWrap.style.display = 'none';
        };
      } else {
        // Fallback: ZXing
        scanBadge.textContent = 'Loading…';
        scanStatusEl.textContent = 'Loading scanner…';
        try { await ensureZXing(); } catch { scanStatusEl.textContent = 'Scanner failed to load'; return; }

        const { BrowserMultiFormatReader } = window.ZXing || window.zxing;
        zxingReader = new BrowserMultiFormatReader();
        scanBadge.textContent = 'Scanning…';
        scanStatusEl.textContent = 'Scanning (ZXing)…';

        let cancelled = false;
        zxingReader.decodeFromVideoDevice(null, videoEl, async (result, err) => {
          if (cancelled) return;
          if (result && result.text) {
            const code = result.text.trim();
            scanBadge.textContent = 'Found';
            scanStatusEl.textContent = 'Found: ' + code;
            cancelled = true;
            try { await lookupBarcode(code); } finally { stopScanning(); }
          }
        });

        stopScan = () => {
          cancelled = true;
          try { zxingReader && zxingReader.reset(); } catch {}
          try { stream && stream.getTracks().forEach(t => t.stop()); } catch {}
          stream = null;
          scanBadge.textContent = 'Stopped';
          scanStatusEl.textContent = 'Stopped';
          scanWrap.style.display = 'none';
        };
      }
    }

    function stopScanning() {
      try { stopScan && stopScan(); } catch {}
      stopScan = null;
    }

    // ---------------- Wire up ----------------
    const goBtn = cardSearch.querySelector('#ff-go');
    const scanBtn = cardSearch.querySelector('#ff-scan');
    const kwLookupBtn = cardPrefs.querySelector('#ff-lookup');

    // top search box
    goBtn.addEventListener('click', () => {
      const q = (qEl.value || '').trim();
      if (!q) return;
      if (/^\d{8,14}$/.test(q)) lookupBarcode(q);
      else searchByName(q);
    });
    qEl.addEventListener('keydown', e => { if (e.key === 'Enter') goBtn.click(); });

    // ingredients/keywords card — now a Lookup action
    kwLookupBtn.addEventListener('click', () => {
      const q = (prefEl.value || '').trim();
      if (!q) return;
      // Save for highlighting and run a name/keywords search
      setKeys(q);
      searchByName(q);
      // Jump to results for immediacy
      setTimeout(() => {
        cardResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    });

    // scan
    scanBtn.addEventListener('click', startScan);
    cardScan.querySelector('#ff-stop').addEventListener('click', stopScanning);

    // Clean up if panel is removed
    const obs = new MutationObserver(() => {
      if (!root.isConnected) {
        stopScanning();
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    // Focus search box
    setTimeout(() => qEl.focus(), 50);

    // Paste barcode convenience
    qEl.addEventListener('paste', e => {
      const t = (e.clipboardData?.getData('text')||'').trim();
      if (/^\d{8,14}$/.test(t)) {
        e.preventDefault();
        qEl.value = t;
        goBtn.click();
      }
    });
  }
});


//Weather Plugin

Plugins.register({
  id: 'weather', title: 'Weather',
  mount(root, { Services }) {
    const ui = E('div', { className: 'grid' });
    const c1 = E('div', { className: 'card' });
    c1.innerHTML = `
      <b>Lookup</b>
      <div class="muted" style="margin:.4rem 0">City (e.g. "Chicago") or use GPS</div>
      <div style="display:flex;gap:.5rem">
        <input id="wx-city" class="inp" placeholder="City">
      </div>
      <button id="wx-go" style="margin-top:1rem;" class="run">Fetch</button>
      <div style="display:flex;gap:.5rem;margin-top:.5rem">
        <button id="wx-geo" class="run">Use GPS</button>
        <span class="muted" id="wx-status" style="align-self:center">-</span>
      </div>`;
    const c2 = E('div', { className: 'card' }); c2.innerHTML = `<b>Current</b><div id="wx-current" class="muted">-</div>`;
    const c3 = E('div', { className: 'card' }); c3.innerHTML = `<b>Next 6 hours</b><div id="wx-hours" class="muted">-</div>`;
    ui.append(c1, c2, c3); root.append(ui);

    const set = (id, v) => { const el = D.getElementById(id); if (el) el.textContent = v; };
    const setHTML = (id, html) => { const el = D.getElementById(id); if (el) el.innerHTML = html; };
    const setStat = msg => set('wx-status', msg);

    // Display helpers (API already returns imperial units)
    const fmtTempF = x => (x != null ? Math.round(x) : '-') + ' °F';
    const fmtWindMPH = x => (x != null ? Math.round(x) : '-') + ' mph';

    async function geocode(name) {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en`;
      const j = await Services.httpJSON(url);
      const r = j && j.results && j.results[0];
      if (!r) throw new Error('City not found');
      return { lat: r.latitude, lon: r.longitude, label: `${r.name}${r.admin1 ? (', ' + r.admin1) : ''}, ${r.country_code || ''}` };
    }

    // Ask Open-Meteo for Fahrenheit temps and mph wind (timezone auto for local correct hours)
    async function getForecast(lat, lon) {
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}` +
        `&longitude=${lon}` +
        `&current_weather=true` +
        `&hourly=temperature_2m,precipitation` +
        `&timezone=auto` +
        `&temperature_unit=fahrenheit` +
        `&windspeed_unit=mph`;
      return Services.httpJSON(url);
    }

    function render(label, d) {
      const cur = d.current_weather || {}, hours = d.hourly || {};
      setHTML('wx-current', `${label}<br>Now: ${fmtTempF(cur.temperature)} • Wind ${fmtWindMPH(cur.windspeed)}`);
      const lines = [];
      if (hours.time && hours.temperature_2m) {
        for (let i = 0; i < 6 && i < hours.time.length; i++) {
          const t = (hours.time[i].split('T')[1] || hours.time[i]).slice(0, 5);
          const temp = hours.temperature_2m[i];
          const pr = (hours.precipitation && hours.precipitation[i] != null) ? hours.precipitation[i] : 0;
          lines.push(`${t} - ${fmtTempF(temp)} • ${pr} mm`);
        }
      }
      setHTML('wx-hours', lines.join('<br>') || '-');
    }

    async function runCity(name) {
      setStat('Looking up');
      try {
        const { lat, lon, label } = await geocode(name);
        const d = await getForecast(lat, lon);
        render(label, d);
        setStat('-');
      } catch (e) { setStat('Error'); set('wx-current', '-'); set('wx-hours', '-'); }
    }

    async function runGeo() {
      setStat('Requesting location');
      if (!navigator.geolocation) { setStat('No GPS'); return; }
      navigator.geolocation.getCurrentPosition(async pos => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords || {};
          const d = await getForecast(lat, lon);
          render(`GPS: ${lat.toFixed(3)}, ${lon.toFixed(3)}`, d);
          setStat('-');
        } catch (_) { setStat('Error'); }
      }, _ => setStat('Denied'));
    }

    on(c1.querySelector('#wx-go'), 'click', () => { const v = c1.querySelector('#wx-city').value.trim(); if (v) runCity(v); });
    on(c1.querySelector('#wx-city'), 'keydown', e => { if (e.key === 'Enter') { const v = e.currentTarget.value.trim(); if (v) runCity(v); } });
    on(c1.querySelector('#wx-geo'), 'click', runGeo);
  }
});


//
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
  id: 'cryptoprice',
  title: 'Crypto Price Lookup',
  mount(root, { Services, esc, E }) {
    // ---------- UI ----------
    const ui = E('div', { className:'grid' });
    const card = E('div', { className:'card' });
    card.innerHTML = `
      <b>Crypto Price Lookup</b>
      <div style="display:flex;gap:.5rem;margin:.4rem 0">
        <input id="cp-q" class="inp" placeholder="BTC, bitcoin, BTC/USD…" style="flex:1">
        <button id="cp-go" class="run">Lookup</button>
      </div>
      <div id="cp-status" class="muted" style="margin:.25rem 0">-</div>
      <div id="cp-out" style="margin-top:.5rem"></div>
    `;
    ui.append(card);
    root.append(ui);

    // ---------- DOM refs ----------
    const qEl = card.querySelector('#cp-q');
    const outEl = card.querySelector('#cp-out');
    const stEl = card.querySelector('#cp-status');
    const goBtn = card.querySelector('#cp-go');

    // ---------- Helpers ----------
    const setStatus = (s) => { stEl.textContent = s; };
    const setHTML = (html) => { outEl.innerHTML = html; };

    // Formatters
    const fmtUSD = (n) => (n==null || !isFinite(n)) ? '-' : ('$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 8 }));

    // ---------- Primary: CoinGecko ----------
    async function geckoSearch(query){
      // https://api.coingecko.com/api/v3/search?query=...
      const s = await Services.httpJSON('https://api.coingecko.com/api/v3/search?query=' + encodeURIComponent(query));
      const coins = (s && s.coins) || [];
      if (!coins.length) return null;

      const q = String(query).trim().toLowerCase();
      // Prefer exact symbol match, then exact name, else first
      let best = coins.find(c => (c.symbol||'').toLowerCase() === q)
              || coins.find(c => (c.name||'').toLowerCase() === q)
              || coins[0];

      return best ? { id: best.id, name: best.name, symbol: (best.symbol||'').toUpperCase() } : null;
    }

    async function geckoPriceUSD(id){
      // https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=' + encodeURIComponent(id) + '&vs_currencies=usd&include_24hr_change=true';
      const j = await Services.httpJSON(url);
      const rec = j && j[id];
      if (!rec) return null;
      return { usd: +rec.usd, change24h: (typeof rec.usd_24h_change === 'number' ? rec.usd_24h_change : null) };
    }

    async function tryCoinGecko(input){
      const coin = await geckoSearch(input);
      if (!coin) return null;
      const px = await geckoPriceUSD(coin.id);
      if (!px) return null;
      return {
        source: 'CoinGecko',
        name: coin.name,
        symbol: coin.symbol,
        usd: px.usd,
        change24h: px.change24h
      };
    }

    // ---------- Secondary: Kraken ----------
    // Kraken uses quirky pairs (XXBTZUSD, XETHZUSD). We'll try a handful of candidates.
    const niceSym = (kr) => (kr||'').replace(/^[XZ]/,'').toUpperCase().replace(/^XBT$/,'BTC').replace(/^XETH$/,'ETH');
    const toKrBase = (b) => (b.toUpperCase()==='BTC' ? 'XXBT' : b.toUpperCase()==='ETH' ? 'XETH' : b.toUpperCase());
    const toKrQuote = (q) => (q.toUpperCase()==='USD' ? 'ZUSD' : q.toUpperCase()==='EUR' ? 'ZEUR' : q.toUpperCase());

    function parsePairish(s){
      const m = String(s).trim().toUpperCase().match(/^([A-Z0-9]+)\s*[\/\-:]\s*([A-Z0-9]+)$/);
      return m ? { base:m[1], quote:m[2] } : null;
    }

    function krCandidates(input){
      const out = new Set();
      const pairish = parsePairish(input);

      const preferQuotes = ['USD','USDT','EUR'];

      if (pairish){
        // Treat as explicit pair
        const kb = toKrBase(pairish.base);
        const kq = toKrQuote(pairish.quote);
        out.add(kb + kq);
        out.add(niceSym(kb) + niceSym(kq));
      } else {
        // Treat as symbol or name; try common bases with USD first
        const s = String(input).trim().toUpperCase();
        const bases = (/^BTC$|^BITCOIN$/.test(s)) ? ['XXBT','XBT','BTC']
                    : (/^ETH$|^ETHEREUM$/.test(s)) ? ['XETH','ETH']
                    : [s];
        bases.forEach(b=>{
          preferQuotes.forEach(q=>{
            const kq = toKrQuote(q);
            out.add(toKrBase(b) + kq);
            out.add(niceSym(toKrBase(b)) + niceSym(kq));
          });
        });
      }
      return Array.from(out);
    }

    async function krTicker(pair){
      // https://api.kraken.com/0/public/Ticker?pair=XXBTZUSD
      const url = 'https://api.kraken.com/0/public/Ticker?pair=' + encodeURIComponent(pair);
      const j = await Services.httpJSON(url);
      const keys = Object.keys((j && j.result) || {});
      if (!keys.length) return null;
      const k = keys[0], r = j.result[k] || {};
      const last = r.c && +r.c[0];
      const open = +r.o || null;
      const changePct = (last!=null && open) ? ((last - open)/open*100) : null;
      // Normalize to display symbol like BTC/USD
      const display = (k||pair).toUpperCase()
        .replace(/XXBT|XBT/,'BTC').replace(/XETH/,'ETH').replace(/ZUSD/,'USD').replace(/ZEUR/,'EUR')
        .replace(/(BTC|ETH)(USD|EUR|USDT)$/,'$1/$2');
      return { display, last, changePct };
    }

    async function tryKraken(input){
      const cand = krCandidates(input);
      for (const c of cand) {
        try {
          const t = await krTicker(c);
          if (t && isFinite(t.last)) {
            const [base, quote] = (t.display.includes('/') ? t.display.split('/') : [t.display, 'USD']);
            return {
              source: 'Kraken',
              name: base,      // best-effort
              symbol: base,    // e.g., BTC
              usd: quote === 'USD' ? t.last : null, // only USD showcased here
              change24h: t.changePct
            };
          }
        } catch(_) {}
      }
      return null;
    }

    // ---------- Orchestrator ----------
    async function lookup(){
      const q = (qEl.value||'').trim();
      if (!q) { setStatus('Enter a ticker or name'); return; }
      setStatus('Looking up on CoinGecko…');
      setHTML('');

      // First: CoinGecko
      let res = null;
      try { res = await tryCoinGecko(q); } catch(_) {}
      if (!res) {
        setStatus('Not found on CoinGecko. Trying Kraken…');
        try { res = await tryKraken(q); } catch(_) {}
      }

      if (!res) {
        setStatus('No price found on either source.');
        setHTML(`<div class="bad">No result for <b>${esc(q)}</b>.</div>`);
        return;
      }

      setStatus(`OK from ${res.source}`);
      const chg = (typeof res.change24h === 'number') ? (res.change24h>0?`<span class="good">+${res.change24h.toFixed(2)}%</span>`:`<span class="bad">${res.change24h.toFixed(2)}%</span>`) : '-';
      setHTML(`
        <div>
          <div style="font-size:16px;font-weight:700">${esc(res.name || res.symbol || '')} <span class="muted">(${esc(res.symbol || '')})</span></div>
          <div style="margin-top:.35rem">Price (USD): <b>${fmtUSD(res.usd)}</b></div>
          <div class="muted" style="margin-top:.2rem">24h change: ${chg}</div>
          <div class="muted" style="margin-top:.2rem">Source: ${esc(res.source)}</div>
        </div>
      `);
    }

    goBtn.addEventListener('click', lookup);
    qEl.addEventListener('keydown', (e)=>{ if (e.key==='Enter') lookup(); });
  }
});

// expects:
 const CHAT_API='https://billygpt.com/chat.php';
// const USERNAME_OVERRIDE='';

Plugins.register({
  id:'chat',
  title:'Chat',
  mount(root,{esc,E}){
    // ===== UI =====
    const wrap=E('div',{className:'grid mc-wrap'});
    const chat=E('div',{className:'mc-card'});
    chat.innerHTML=`
      <b>Mini Chat</b>
      <div class="muted mc-top">
        <span id="mc-you">You are: …</span>
        <span class="muted">• Name color:</span>
        <input id="mc-color" type="color" class="mc-color">
        <button id="mc-color-save" class="run" style="padding:.4rem .6rem">Save</button>
        <div id="mc-sw" style="display:flex;gap:.25rem">
          ${['#7dd3fc','#a78bfa','#f472b6','#fca5a5','#fbbf24','#34d399','#60a5fa'].map(c=>`<button class="run" data-c="${c}" style="width:22px;height:22px;padding:0;border-radius:6px;border:1px solid #294064;background:${c}"></button>`).join('')}
        </div>
      </div>
      <div id="mc-log"></div>
      <div style="display:flex;gap:.5rem">
        <input id="mc-msg" class="inp" placeholder="message…" style="flex:1;">
        <button id="mc-send" class="run">Send</button>
      </div>
    `;
    wrap.append(chat); root.append(wrap);

    // ===== Refs =====
    const logEl=chat.querySelector('#mc-log'), youEl=chat.querySelector('#mc-you');
    const msgEl=chat.querySelector('#mc-msg'), sendBtn=chat.querySelector('#mc-send');
    const clrEl=chat.querySelector('#mc-color'), clrSave=chat.querySelector('#mc-color-save'), sw=chat.querySelector('#mc-sw');

    // ===== Identity & colors =====
    const ADJ=['Dank','Epic','Spicy','Salty','Radical','Major','Classic','Vintage','OG','Retro','Mighty','Grumpy','Nyan','Cheeky','Pepe','Forever','Over9000','Troll','Doge','Fail','Keyboard','Double','Rickrolled'];
    const NNS=['Cat','Doggo','Llama','Hamster','Turtle','Shibe','Pigeon','Duck','Potato','Muffin','Narwhal','Boi','Bacon','Penguin','Taco','Raptor','Unicorn','KeyboardCat','Overlord','Nyan','Hamsterdance','Badger','Yee'];
    const rand=a=>a[(Math.random()*a.length)|0];
    const myName=(USERNAME_OVERRIDE&&String(USERNAME_OVERRIDE).trim())||(`${rand(ADJ)}${rand(NNS)}${((Math.random()*899)|0)+100}`);
    youEl.textContent=`You are: ${myName}`;

    const keyColor=n=>`nova_user_color_${n}`;
    const getMyColor=()=>localStorage.getItem(keyColor(myName))||'#a5cfff';
    const setMyColor=c=>localStorage.setItem(keyColor(myName),c);
    const hashHue=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*33+s.charCodeAt(i))>>>0;return h%360;};
    const colorForOther=n=>`hsl(${hashHue(n)},70%,70%)`;
    clrEl.value=getMyColor();
    clrSave.onclick=()=>setMyColor(clrEl.value);
    sw.addEventListener('click',e=>{const b=e.target.closest('button[data-c]'); if(!b) return; clrEl.value=b.dataset.c; setMyColor(b.dataset.c);});

    // ===== Chat core =====
    const atBottom=()=>Math.abs((logEl.scrollTop+logEl.clientHeight)-logEl.scrollHeight)<6;
    const scrollToBottom=()=>{logEl.scrollTop=logEl.scrollHeight;};
    const rowHTML=m=>{
      const who=esc(m.name||'anon');
      const when=new Date(m.ts||Date.now()).toLocaleTimeString();
      const isMe=who.toLowerCase()===myName.toLowerCase();
      const uColor=isMe?getMyColor():colorForOther(who);
      const txt=esc(String(m.text||'')); // regular emojis work as-is
      return `<div class="mc-row">
        <span class="mc-usr" style="color:${uColor}">${who}</span> <small class="muted">${when}</small><br>
        <span class="mc-txt">${txt}</span>
      </div>`;
    };
    const httpJSON=async(u,o={})=>{const r=await fetch(u,{...o,headers:{'Content-Type':'application/json'}}); if(!r.ok) throw new Error('HTTP '+r.status); return r.json();};

    let since=0,polling=false,alive=true;
    async function poll(){
      if(!alive||polling) return; polling=true;
      try{
        const data=await httpJSON(CHAT_API+(since?('?since='+encodeURIComponent(since)):''));
        if(Array.isArray(data)&&data.length){
          const keep=atBottom();
          logEl.insertAdjacentHTML('beforeend', data.map(rowHTML).join(''));
          since=Math.max(since,...data.map(m=>m.ts||0));
          if(keep) scrollToBottom();
        }
      }catch(_){}
      finally{polling=false; if(alive) setTimeout(poll,1500);}
    }
    async function send(){
      const text=(msgEl.value||'').trim(); if(!text) return; msgEl.value='';
      try{await httpJSON(CHAT_API,{method:'POST',body:JSON.stringify({name:myName,text})}); setTimeout(poll,50);}catch(_){}
    }
    sendBtn.addEventListener('click',send);
    msgEl.addEventListener('keydown',e=>{ if(e.key==='Enter') send(); });

    // ===== Init =====
    (async function(){
      try{
        const data=await httpJSON(CHAT_API);
        if(Array.isArray(data)&&data.length){
          logEl.innerHTML=data.map(rowHTML).join('');
          since=Math.max(0,...data.map(m=>m.ts||0));
          scrollToBottom();
        }
      }catch(_){}
      poll();
    })();

    // ===== Cleanup =====
    const obs=new MutationObserver(()=>{if(!root.isConnected){alive=false; obs.disconnect();}});
    obs.observe(document.body,{childList:true,subtree:true});
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
         { 
  id: 'weather', 
  icon: '🥫', 
  title: 'Weather', 
  desc: 'Get current weather & 6 hour forecast' 
},
  { id:'cryptoprice', title:'Crypto Price', desc:'Lookup by ticker or name (Gecko → Kraken fallback)' },
   { 
  id: 'foodfacts', 
  icon: '🥫', 
  title: 'Food Facts', 
  desc: 'Scan barcodes or search food data with OpenFoodFacts (allergens, nutrition, palm oil)' 
},



      
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
const preferF = true;
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
      if (curEl)
  curEl.innerHTML = `${label}<br>Now: ${toUnit(cur.temperature)} • Wind ${cur.windspeed ?? '-'} km/h`;

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
