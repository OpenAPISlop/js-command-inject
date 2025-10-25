Plugins.register({
  id: 'sleep-ease',
  title: 'Sleep Ease Coach',
  mount(root, { E, on, Services, esc }) {
    // ---- helpers ----
    const $ = (sel, el = root) => el.querySelector(sel);
    const offs = [];
    const add = (el, ev, fn, opt) => { const off = on(el, ev, fn, opt); offs.push(off); return off; };
    const pill = (k, v) => `<span class="muted" style="display:inline-block;border:1px solid #294064;border-radius:999px;padding:.15rem .5rem;background:#0f1a2c">${esc(k)}: ${esc(v)}</span>`;
    const persist = (k, v) => localStorage.setItem('nova_sleep-ease_' + k, JSON.stringify(v));
    const recall = (k, d) => { try { return JSON.parse(localStorage.getItem('nova_sleep-ease_' + k)) ?? d; } catch { return d; } };

    // ---- state ----
    let audio = { ctx: null, gain: null, node: null, type: 'brown', volume: 0.2 };
    let session = { running: false, startedAt: 0, endsAt: 0, mins: 10, timerId: 0, tickId: 0, pattern: '4-7-8' };
    let anim = { req: 0, phaseIdx: 0, t0: 0 };
    let ro;

    // ---- UI: grid container ----
    const ui = E('div', { className: 'grid', style: 'display:grid;grid-template-columns:minmax(0,1fr);gap:1rem' });

    // ---- STYLES (scoped) ----
    const style = E('style', { textContent: `
      .card{background:var(--surface-1,#0f1a2c);border:1px solid var(--surface-3,#294064);border-radius:8px;padding:.9rem}
      .muted{opacity:.78;font-size:.9rem}
      .row{display:flex;flex-wrap:wrap;gap:.5rem}
      .run{cursor:pointer;border:1px solid var(--surface-3,#294064);background:var(--surface-2,#14243c);color:inherit;border-radius:6px;padding:.5rem .75rem}
      .inp{appearance:none;background:var(--surface-1,#0f1a2c);border:1px solid var(--surface-3,#294064);color:inherit;border-radius:4px;padding:.35rem .45rem;width:100%;min-width:0;}
      .meter{height:8px;border-radius:999px;background:linear-gradient(90deg,#294064,#3a6ea1);opacity:.9}
      .viswrap{display:grid;place-items:center;height:180px}
      .circle{width:120px;height:120px;border-radius:999px;border:2px solid #294064;display:grid;place-items:center;transition:transform .6s ease,opacity .6s ease}
      .phase{font-size:.9rem;opacity:.9}
      .checklist label{display:flex;gap:.5rem;align-items:flex-start}
      .checklist input{margin-top:.15rem}
      .hint{font-size:.85rem;opacity:.75}
    `});

    // ---- CARD: Controls ----
    const controls = E('div', { className: 'card' });
    controls.innerHTML = `
      <b>Sleep Ease • Controls</b>
      <div data-fieldrow>
        <label for="se-mins">Session length (minutes)</label>
        <input id="se-mins" type="number" min="3" max="90" step="1" class="inp" value="${esc(recall('mins', 15))}">
      </div>
      <div data-fieldrow>
        <label for="se-pattern">Breathing pattern</label>
        <select id="se-pattern" class="inp">
          <option>4-7-8</option>
          <option>Box 4-4-4-4</option>
          <option>5-5 (coherent)</option>
          <option>Exhale-Weighted 3-2-6-1</option>
        </select>
      </div>
      <div data-fieldrow>
        <label for="se-sound">Soundscape</label>
        <select id="se-sound" class="inp">
          <option>brown noise</option>
          <option>pink noise</option>
          <option>white noise</option>
          <option>rain (soft)</option>
          <option>rain (heavy)</option>
        </select>
      </div>
      <div data-fieldrow>
        <label for="se-vol">Volume</label>
        <input id="se-vol" type="range" min="0" max="1" step="0.01" class="inp" value="${esc(recall('volume', 0.25))}">
      </div>
      <div class="row" style="margin-top:.5rem">
        <button id="se-start" class="run" type="button">Start Session</button>
        <button id="se-stop" class="run" type="button">Stop</button>
        <button id="se-dim" class="run" type="button">Dim Screen</button>
      </div>
      <div id="se-status" class="muted" style="margin-top:.35rem">—</div>
    `;

    // ---- CARD: Summary ----
    const summary = E('div', { className: 'card' });
    summary.innerHTML = `
      <b>Summary</b>
      <div class="row" id="se-pills" style="margin-top:.35rem;gap:.35rem"></div>
      <div id="se-line" class="muted" style="margin-top:.35rem">Plan your wind-down and press “Start Session”.</div>
      <div class="meter" id="se-meter" style="margin-top:.5rem;position:relative;overflow:hidden">
        <div id="se-meter-fill" style="height:100%;width:0%"></div>
      </div>
    `;

    // ---- CARD: Breathing Coach (visual) ----
    const coach = E('div', { className: 'card' });
    coach.innerHTML = `
      <b>Breathing Coach</b>
      <div class="viswrap" aria-live="polite">
        <div class="circle" id="se-circle" aria-hidden="true"><div class="phase" id="se-phase">—</div></div>
      </div>
      <div class="hint">Follow the cue. Inhale when the circle grows, exhale as it shrinks. Optional: close eyes and let the sound carry you.</div>
    `;

    // ---- CARD: Wind-Down Routine ----
    const routine = E('div', { className: 'card' });
    routine.innerHTML = `
      <b>Wind-Down Routine</b>
      <div class="checklist" style="display:grid;gap:.5rem;margin-top:.35rem">
        <label><input type="checkbox" class="se-todo"> Dim room lights</label>
        <label><input type="checkbox" class="se-todo"> Phone to Do Not Disturb</label>
        <label><input type="checkbox" class="se-todo"> Gentle stretch (1–2 min)</label>
        <label><input type="checkbox" class="se-todo"> Write one worry → 1 action tomorrow</label>
        <label><input type="checkbox" class="se-todo"> Cool the room / light blanket</label>
      </div>
      <div class="row" style="margin-top:.5rem">
        <button id="se-copy" class="run" type="button">Copy routine</button>
        <button id="se-download" class="run" type="button">Download plan</button>
      </div>
      <div id="se-rstatus" class="muted" style="margin-top:.35rem">—</div>
    `;

    ui.append(style, controls, summary, coach, routine);
    root.append(ui);

    // ---- element refs ----
    const minsEl = $('#se-mins', controls);
    const patternEl = $('#se-pattern', controls);
    const soundEl = $('#se-sound', controls);
    const volEl = $('#se-vol', controls);
    const startBtn = $('#se-start', controls);
    const stopBtn = $('#se-stop', controls);
    const dimBtn = $('#se-dim', controls);
    const stEl = $('#se-status', controls);
    const pillsEl = $('#se-pills', summary);
    const lineEl = $('#se-line', summary);
    const meterFill = $('#se-meter-fill', summary);
    const circle = $('#se-circle', coach);
    const phaseEl = $('#se-phase', coach);
    const rCopy = $('#se-copy', routine);
    const rDl = $('#se-download', routine);
    const rSt = $('#se-rstatus', routine);

    // ---- recall persisted values ----
    const initPattern = recall('pattern', '4-7-8');
    const initSound = recall('sound', 'brown noise');
    patternEl.value = initPattern;
    soundEl.value = initSound;

    // ---- utilities ----
    const now = () => Date.now();
    const fmtTime = (t) => {
      const d = new Date(t);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    const updatePills = () => {
      pillsEl.innerHTML = [
        pill('Length', `${session.mins}m`),
        pill('Pattern', session.pattern),
        pill('Sound', audio.type),
        session.running ? pill('Ends', fmtTime(session.endsAt)) : pill('Ready', '—')
      ].join(' ');
    };
    const setStatus = (txt) => { stEl.textContent = txt; };

    const parsePattern = (name) => {
      // returns array of {label, seconds}
      switch (name) {
        case '4-7-8': return [{ l: 'Inhale', s: 4 }, { l: 'Hold', s: 7 }, { l: 'Exhale', s: 8 }, { l: 'Hold', s: 0 }];
        case 'Box 4-4-4-4': return [{ l: 'Inhale', s: 4 }, { l: 'Hold', s: 4 }, { l: 'Exhale', s: 4 }, { l: 'Hold', s: 4 }];
        case '5-5 (coherent)': return [{ l: 'Inhale', s: 5 }, { l: 'Exhale', s: 5 }];
        case 'Exhale-Weighted 3-2-6-1': return [{ l: 'Inhale', s: 3 }, { l: 'Hold', s: 2 }, { l: 'Exhale', s: 6 }, { l: 'Hold', s: 1 }];
        default: return [{ l: 'Inhale', s: 4 }, { l: 'Exhale', s: 4 }];
      }
    };

    const soundMap = (label) => {
      if (label.includes('brown')) return 'brown';
      if (label.includes('pink')) return 'pink';
      if (label.includes('white')) return 'white';
      if (label.includes('heavy')) return 'rain-heavy';
      if (label.includes('rain')) return 'rain-soft';
      return 'brown';
    };

    // ---- WebAudio: noise + rain ----
    const ensureAudio = async () => {
      if (audio.ctx) return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const gain = ctx.createGain();
      gain.gain.value = audio.volume;
      gain.connect(ctx.destination);
      audio.ctx = ctx;
      audio.gain = gain;
    };

    const makeNode = (type) => {
      const ctx = audio.ctx;
      const sp = ctx.createScriptProcessor(2048, 1, 1);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0; // for pink
      let brown = 0.0;
      const rainLP = ctx.createBiquadFilter(); // for rain
      rainLP.type = 'lowpass';
      rainLP.frequency.value = type === 'rain-heavy' ? 600 : 1200;
      sp.onaudioprocess = (e) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < out.length; i++) {
          let v = 0;
          if (type === 'white' || type.startsWith('rain')) {
            v = Math.random() * 2 - 1;
          } else if (type === 'pink') {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            v = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            v *= 0.11; b6 = white * 0.115926;
          } else { // brown
            const white = Math.random() * 2 - 1;
            brown = (brown + 0.02 * white) / 1.02;
            v = brown * 3.5; // gain compensate
          }
          out[i] = v;
        }
      };
      if (type.startsWith('rain')) {
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 200; // remove rumble
        sp.connect(hp); hp.connect(rainLP);
        return rainLP;
      }
      return sp;
    };

    const startSound = async () => {
      await ensureAudio();
      stopSound();
      const type = soundMap(soundEl.value);
      audio.type = type.includes('rain') ? 'rain' : type;
      const node = makeNode(type);
      node.connect(audio.gain);
      audio.node = node;
    };

    const stopSound = () => {
      if (audio.node) { try { audio.node.disconnect(); } catch {} audio.node = null; }
    };

    const setVolume = (v) => {
      audio.volume = v;
      if (audio.gain) audio.gain.gain.value = v;
    };

    // ---- Breathing animation loop ----
    const runCoach = () => {
      const phases = parsePattern(session.pattern);
      const scaleFor = (label) => label.startsWith('Inhale') ? 1.18 : label.startsWith('Exhale') ? 0.86 : 1.0;
      cancelAnimationFrame(anim.req);
      anim.t0 = now(); anim.phaseIdx = 0;

      const step = () => {
        if (!session.running) return;
        const ph = phases[anim.phaseIdx % phases.length];
        const dur = Math.max(0.1, ph.s) * 1000;
        phaseEl.textContent = ph.l;
        // haptic (soft)
        if (navigator.vibrate) { navigator.vibrate(10); }
        const start = now();
        const loop = () => {
          if (!session.running) return;
          const t = now() - start;
          const r = Math.min(1, t / dur);
          const s = scaleFor(ph.l);
          circle.style.transform = `scale(${s === 1 ? 1 : (ph.l.startsWith('Inhale') ? 1 + 0.18 * r : 1.18 - 0.32 * r)})`;
          circle.style.opacity = ph.l.startsWith('Exhale') ? (0.92 - 0.3 * r) : 0.92 + 0.05 * r;
          if (t >= dur) {
            anim.phaseIdx++;
            step();
          } else {
            anim.req = requestAnimationFrame(loop);
          }
        };
        anim.req = requestAnimationFrame(loop);
      };
      step();
    };

    // ---- session control ----
    const startSession = async () => {
      const mins = Math.max(3, Math.min(90, parseInt(minsEl.value || '10', 10)));
      session.mins = mins;
      session.pattern = patternEl.value;
      persist('mins', mins);
      persist('pattern', session.pattern);
      persist('sound', soundEl.value);
      persist('volume', parseFloat(volEl.value));

      await startSound();
      setVolume(parseFloat(volEl.value));

      session.running = true;
      session.startedAt = now();
      session.endsAt = session.startedAt + mins * 60 * 1000;
      setStatus('Starting… enjoy the calm.');
      updatePills();
      lineEl.textContent = `Started ${fmtTime(session.startedAt)} • Ends ${fmtTime(session.endsAt)}`;

      // progress bar tick
      clearInterval(session.tickId);
      session.tickId = setInterval(() => {
        const p = Math.max(0, Math.min(1, (now() - session.startedAt) / (session.endsAt - session.startedAt)));
        meterFill.style.width = (p * 100).toFixed(1) + '%';
        meterFill.style.background = `linear-gradient(90deg,#3a6ea1,#6ca0dc)`;
        if (p >= 1) {
          stopSession();
        }
      }, 250);

      // minute bell (very soft vibrate cue)
      clearInterval(session.timerId);
      session.timerId = setInterval(() => { if (navigator.vibrate) navigator.vibrate([8, 30, 8]); }, 60 * 1000);

      runCoach();
    };

    const stopSession = () => {
      if (!session.running) return;
      session.running = false;
      clearInterval(session.timerId);
      clearInterval(session.tickId);
      meterFill.style.width = '0%';
      stopSound();
      setStatus('Session complete. If sleepy, stay where you are and breathe normally.');
      phaseEl.textContent = '—';
      circle.style.transform = 'scale(1)';
      circle.style.opacity = 0.92;
    };

    // ---- screen dimmer ----
    const dimmer = E('div', { style: 'position:fixed;inset:0;pointer-events:none;background:#000;opacity:0;transition:opacity .4s ease' });
    root.append(dimmer);
    let dimOn = false;
    const toggleDim = () => {
      dimOn = !dimOn;
      dimmer.style.pointerEvents = dimOn ? 'auto' : 'none';
      dimmer.style.opacity = dimOn ? '0.45' : '0';
      dimmer.setAttribute('aria-hidden', dimOn ? 'false' : 'true');
    };

    // ---- routine copy / download ----
    const routineText = () => {
      const steps = Array.from(root.querySelectorAll('.se-todo')).map((c, i) => `• ${['Dim room lights','Do Not Disturb','Gentle stretch (1–2 min)','One worry → 1 action tomorrow','Cool room / light blanket'][i]} — ${c.checked ? 'done' : 'todo'}`);
      return `Wind-Down Plan\nDuration: ${session.mins} min\nPattern: ${session.pattern}\nSound: ${soundEl.value}\n\nSteps:\n${steps.join('\n')}\n\nTip: Slow, quiet, long exhales.`;
    };

    add(rCopy, 'click', async () => {
      try {
        await navigator.clipboard.writeText(routineText());
        rSt.textContent = 'Routine copied.';
      } catch {
        rSt.textContent = 'Copy failed (permissions).';
      }
    });

    add(rDl, 'click', () => {
      const blob = new Blob([routineText()], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `sleep-ease-plan-${new Date().toISOString().slice(0,10)}.txt`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 500);
      rSt.textContent = 'Downloaded plan.';
    });

    // ---- events ----
    add(startBtn, 'click', startSession);
    add(stopBtn, 'click', stopSession);
    add(dimBtn, 'click', toggleDim);
    add(volEl, 'input', (e) => { setVolume(parseFloat(e.target.value || '0.2')); persist('volume', parseFloat(e.target.value || '0.2')); updatePills(); });
    add(soundEl, 'change', () => updatePills());
    add(patternEl, 'change', () => updatePills());
    add(minsEl, 'change', () => updatePills());

    // ---- responsive label alignment ----
    ro = new ResizeObserver(() => {
      const wide = root.clientWidth > 720;
      root.querySelectorAll('[data-fieldrow]').forEach(f => {
        f.style.display = 'grid';
        f.style.gridTemplateColumns = wide ? '10rem minmax(0,1fr)' : 'minmax(0,1fr)';
        f.style.alignItems = wide ? 'center' : 'stretch';
      });
    });
    ro.observe(root);

    // ---- initial pills/status ----
    session.mins = parseInt(minsEl.value, 10);
    session.pattern = patternEl.value;
    audio.type = soundMap(soundEl.value);
    audio.volume = parseFloat(volEl.value);
    updatePills();
    setStatus('Ready');

    // ---- cleanup ----
    return () => {
      offs.forEach(off => off());
      clearInterval(session.timerId);
      clearInterval(session.tickId);
      cancelAnimationFrame(anim.req);
      stopSound();
      if (audio.ctx) { try { audio.ctx.close(); } catch {} audio.ctx = null; }
      if (ro) ro.disconnect();
    };
  }
});
