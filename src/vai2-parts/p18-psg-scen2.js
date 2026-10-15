<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-IV — PSG SCENARIOS II + A/B COMPARE ENGINE
   New disorders: Central Sleep Apnea · Insomnia · RBD · OHS.
   Compare engine: two synchronized live PSG panels (A vs B) on one clock,
   Δ metrics, divergent-event log and a normal-vs-disorder difference matrix.
   Reuses the p11 generators + scenario state machines.
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ── 1. CENTRAL SLEEP APNEA (idiopathic, non-hypercapnic) ──────────────── */
PSG_SCEN.push({ id:"csa", name:"Central Sleep Apnea", note:"Non-hypercapnic CSA — abrupt central apneas WITHOUT the long Cheyne–Stokes crescendo. Flow and effort switch off together (no obstruction, no snoring), then an arousal triggers ventilatory overshoot → PaCO₂ dips below the apneic threshold → the cycle repeats. Light, unstable N1/N2 sleep, cyclic mild desats, brady–tachy swings. Think heart failure, altitude, opioids — or idiopathic.",
make(){ const s = psgBase(); s.local = { phase:"breath", tmr:rnd(14, 22), overshoot:0 }; s.hrT = 68; return s; },
step(s, dt, api){
  const L = s.local; s.stageT += dt; L.tmr -= dt; L.overshoot = Math.max(0, L.overshoot - dt * 0.28);
  if (s.arousal && s.t - s.arousal.t0 > s.arousal.dur) s.arousal = null;
  if (L.phase === "breath"){
    setStage(s, "N2"); if (s.stage === "W" && s.stageT > 12) setStage(s, "N1");
    s.respRate = 15 + 2.5 * L.overshoot;                       /* post-arousal hyperventilation */
    s.respAmp = clamp(0.92 + 0.3 * L.overshoot, 0, 1.25);
    s.flowLimit = 0.12; s.effortAmp = 1; s.paradox = 0; s.snore = 0.02;
    s.spo2Tgt = 94.5; s.hrT = 70;
    if (L.tmr < 0){ L.phase = "central"; L.dur = rnd(12, 19); startApnea(s, "central", L.dur);
      s.respAmp = 0; s.effortAmp = 0; s.snore = 0; }
  } else if (L.phase === "central"){
    const el = s.t - s.apnea.t0;
    s.spo2Tgt = clamp(94 - el * 0.34, 86, 94);                 /* milder than obstructive */
    s.hrT = 72 - 7 * Math.min(1, el / Math.max(1, s.apnea.dur));
    if (el >= s.apnea.dur){
      endApnea(s, api, "apnea");
      arousal(s, api, 2.6); setStage(s, "W");
      L.phase = "breath"; L.tmr = rnd(16, 26); L.overshoot = 1;
      s.respAmp = 1.22; s.hrT = 92; s.spo2Tgt = 93;
      api.evt("info", "Ventilatory overshoot", "arousal-driven hyperventilation drives PaCO₂ below the apneic threshold → next central apnea");
    }
  }
  if (s.stage === "W" && s.stageT > 9 && L.phase === "breath" && Math.random() < 0.02 * dt * 60) setStage(s, "N1");
} });

/* ── 2. CHRONIC INSOMNIA (psychophysiological) ─────────────────────────── */
PSG_SCEN.push({ id:"insomnia", name:"Chronic Insomnia", note:"Paradoxical on the PSG: the complaint is 'no sleep' yet sleep is recorded — just badly built. Prolonged sleep-onset latency, repeated WASO returns to Wake, N1-heavy architecture with ALPHA INTRUSION into N1/N2 (a waking rhythm superimposed on sleep), blunted N3, high arousal index, and completely NORMAL respiration and oximetry. Objective sleep efficiency ~60%.",
make(){ const s = psgBase(); s.local = { script:[["W",210],["N1",110],["W",50],["N2",150],["W",38],["N2",110],["N1",70],["R",80],["W",55],["N2",130],["R",95]], ix:0, tmr:0, arT:80, msg:false }; return s; },
step(s, dt, api){
  const L = s.local; s.stageT += dt; L.tmr += dt; L.arT -= dt;
  const cur = L.script[L.ix];
  if (L.tmr >= cur[1]){
    L.ix = (L.ix + 1) % L.script.length; L.tmr = 0;
    const nx = L.script[L.ix]; setStage(s, nx[0]);
    if (nx[0] === "W" && !L.msg){ L.msg = true; api.evt("info", "WASO — return to Wake", "wake-after-sleep-onset; sleep efficiency collapses toward 60%"); }
  }
  /* hyperarousal: alpha intrusion into light sleep + frequent spontaneous arousals */
  s.alphaIn = (s.stage === "N1" || s.stage === "N2");
  s.respRate = 14.5; s.respAmp = 0.95; s.flowLimit = 0.06; s.effortAmp = 1; s.paradox = 0; s.snore = 0.03;
  s.spo2Tgt = 96; s.hrT = 63 + (s.stage === "W" ? 4 : 0);
  if (L.arT < 0){ L.arT = rnd(95, 170); if (s.stage !== "W"){ arousal(s, api, 2.2); api.evt("info", "Spontaneous arousal", "cortical hyperarousal — EEG frequency count higher than patient-perceived sleep"); } }
  if (s.arousal && s.t - s.arousal.t0 > s.arousal.dur) s.arousal = null;
} });

/* ── 3. REM SLEEP BEHAVIOR DISORDER ────────────────────────────────────── */
PSG_SCEN.push({ id:"rbd", name:"REM Behavior Disorder", note:"Dream enactment — the normal REM atonia switch fails. Chin EMG stays ELEVATED through REM (loss of tonic atonia) and tibialis/phasic bursts pepper the epoch (excessive transient activity). EEG still shows REM patterns: low-amplitude mixed frequency + sawtooth waves + rapid eye movements. Respiration largely spared. Strongest predictor of synucleinopathy (Parkinson, DLB, MSA) — ~6–8%/yr conversion.",
make(){ const s = psgBase(); s.local = { script:[["W",50],["N1",55],["N2",190],["N3",110],["N2",55],["R",420],["N2",110],["R",360]], ix:0, tmr:0, legT:6, act:0 }; return s; },
step(s, dt, api){
  const L = s.local; s.stageT += dt; L.tmr += dt;
  const cur = L.script[L.ix];
  if (L.tmr >= cur[1]){
    L.ix = (L.ix + 1) % L.script.length; L.tmr = 0;
    const nx = L.script[L.ix]; setStage(s, nx[0]);
    if (nx[0] === "R") api.evt("info", "REM begins — atonia FAILS", "chin tone fails to drop: REM without atonia (RWA) — AASM: sustained/phasically elevated EMG");
  }
  s.remTone = s.stage === "R" ? 0.38 : null;                  /* pathologically high REM chin tone */
  s.respRate = s.stage === "R" ? 13 + 2.6 * Math.sin(s.t / 4.7) : 14;
  s.respAmp = 0.92; s.flowLimit = 0.1; s.effortAmp = 1; s.paradox = 0; s.snore = 0.03;
  s.spo2Tgt = 95.8; s.hrT = 63 + (s.stage === "R" ? 7 : 0);
  /* phasic limb bursts + dream-enactment flurries during REM */
  if (s.stage === "R"){
    L.legT -= dt;
    if (L.legT < 0){
      L.legT = rnd(4.5, 12); L.act = Math.random() < 0.3;
      s.leg = { t0:s.t, dur:L.act ? rnd(2.2, 3.6) : rnd(0.6, 1.6) }; s.evCount.leg++;
      api.evt("leg", L.act ? "DREAM ENACTMENT burst" : "Phasic EMG burst", L.act ? "long limb/axial flurry — matches reported kicking/punching" : "RWA phasic activity > 50% of mini-epochs");
    }
  } else s.leg = null;
  if (s.leg && s.t - s.leg.t0 > s.leg.dur) s.leg = null;
  if (s.arousal && s.t - s.arousal.t0 > s.arousal.dur) s.arousal = null;
} });

/* ── 4. OBESITY HYPOVENTILATION SYNDROME ───────────────────────────────── */
PSG_SCEN.push({ id:"ohs", name:"Obesity Hypoventilation", note:"BMI > 30 + awake PaCO₂ ≥ 45 with sleep-worsened hypoventilation. On PSG: severe sustained nocturnal desaturation WITHOUT many discrete apneas — long hypopneas, heavy flow limitation, high effort, loud snoring, and prolonged REM-related desaturation dives into the low 80s that recover slowly. Baseline SpO₂ already sitting at ~90%.",
make(){ const s = psgBase(); s.local = { script:[["W",70],["N1",90],["N2",240],["R",280],["N2",160],["R",240]], ix:0, tmr:0, hypT:60, inHyp:false }; s.hrT = 82; s.spo2Tgt = 91; return s; },
step(s, dt, api){
  const L = s.local; s.stageT += dt; L.tmr += dt; L.hypT -= dt;
  const cur = L.script[L.ix];
  if (L.tmr >= cur[1]){
    L.ix = (L.ix + 1) % L.script.length; L.tmr = 0;
    const nx = L.script[L.ix]; setStage(s, nx[0]);
    if (nx[0] === "R") api.evt("info", "REM period — hypoventilation deepens", "blunted REM muscle tone → worst desats of the night, PaCO₂ climbs");
  }
  const rem = s.stage === "R";
  s.respRate = rem ? 13 : 15; s.flowLimit = 0.8; s.effortAmp = 1.3; s.paradox = 0.3; s.snore = 0.6;
  s.spo2Tgt = rem ? clamp(90 - (s.stageT / 60) * 1.6, 82, 90) : 91; s.hrT = rem ? 92 : 82;
  if (!L.inHyp && L.hypT < 0){
    L.inHyp = true; L.hypDur = rnd(18, 30); startApnea(s, "ob", L.hypDur);
    s.respAmp = 0.3; s.snore = 0.2;
  }
  if (L.inHyp){
    const el = s.t - s.apnea.t0;
    if (rem) s.spo2Tgt = clamp(84 - el * 0.12, 79, 90);
    if (el >= L.hypDur){
      endApnea(s, api, "hypop"); L.inHyp = false; L.hypT = rnd(50, 110);
      arousal(s, api, 2.4); s.respAmp = 1.05; s.snore = 0.75; s.hrT = 96;
    }
  } else s.respAmp = 0.85;
  if (s.arousal && s.t - s.arousal.t0 > s.arousal.dur) s.arousal = null;
} });

/* ══ A/B COMPARE ENGINE ═══════════════════════════════════════════════════ */
/* compact 11-channel montage for side-by-side viewing */
const CMP_CH = (() => {
  const want = ["eeg1", "eogl", "chin", "ecg", "flow", "pflow", "thor", "abd", "pleth", "snore", "leg"];
  return want.map(id => PSG_CH.find(c => c.id === id)).filter(Boolean);
})();

/* shared physiology integrator (mirrors the main PSG tick loop) */
function cmpIntegrate(s, sim, evtFn){
  let rem = sim;
  while (rem > 0){
    const h = Math.min(0.25, rem); rem -= h; s.t += h;
    s.scen.step(s, h, { evt:evtFn });
    s.hr += (s.hrT - s.hr) * Math.min(1, h / 1.5);
    const rsa = 2.5 * Math.sin(2 * Math.PI * respPhase(s.t, s));
    const hrInst = Math.max(30, s.hr + rsa);
    s.beatAcc += h * hrInst / 60;
    while (s.beatAcc >= 1){
      s.beatAcc -= 1; s.beats.push(s.t - s.beatAcc * (60 / hrInst));
      if (s.beats.length > 40) s.beats.shift();
    }
    const tau = s.spo2Tgt < s.spO2 ? 8.5 : 3.2;
    s.spO2 += (s.spo2Tgt - s.spO2) * Math.min(1, h / tau);
    if (s.spO2 < 90 && !s.desatOn){ s.desatOn = true; s.desatT0 = s.t; s.nadirEv = s.spO2; }
    if (s.desatOn){
      s.nadirEv = Math.min(s.nadirEv, s.spO2);
      if (s.spO2 >= 91.5){ s.desatOn = false; s.evCount.desat++; evtFn("desat", "Desaturation → " + s.nadirEv.toFixed(0) + "%", "SpO₂ dip below 90% — oximetry flag", s.panel); }
    }
    if (s.stage !== "W") s.tst += h;
    s.spo2Sum += s.spO2 * h; s.spo2N += h; s.nadir = Math.min(s.nadir, s.spO2);
    const ep = Math.floor(s.t / 30);
    while (s.epochs.length < ep + 1) s.epochs.push({ t:s.epochs.length * 30, stage:s.stage });
  }
}

const PSG_CMP = {
  mounted:false, running:true, speed:8, WIN:26, LANE_H:34,
  scenA:"normal", scenB:"osa-severe", SA:null, SB:null,
  lastTs:0, lastDraw:0, lastUI:0, raf:null, logEl:null, root:null,

  apiFor(tag){ /* evt router → shared diff log */
    const self = this;
    return (type, label, note) => {
      const s = tag === "A" ? self.SA : self.SB;
      if (!s || !self.logEl) return;
      const cls = { apnea:"ap", hypop:"hy", desat:"de", arousal:"ar", leg:"le", info:"in" }[type] || "in";
      const divergent = cls === "ap" || cls === "hy" || cls === "de";
      const d = document.createElement("div");
      d.className = "drow p" + tag.toLowerCase() + " ev-" + cls + (divergent && tag === "B" ? " divg" : "");
      const clock = Math.floor(s.t / 60) + "m" + String(Math.floor(s.t % 60)).padStart(2, "0");
      d.innerHTML = "<span class='who'>" + tag + "</span><span class='dt'>" + clock + "</span><span class='dv'><b>" + esc(label) + "</b> · " + esc(note) + "</span>";
      self.logEl.prepend(d);
      while (self.logEl.children.length > 44) self.logEl.lastChild.remove();
    };
  },

  restart(){
    const a = scenById(this.scenA), b = scenById(this.scenB);
    this.SA = a.make(); this.SA.scen = a; this.SA.panel = "A";
    this.SB = b.make(); this.SB.scen = b; this.SB.panel = "B";
    if (this.logEl) this.logEl.innerHTML = "";
    this.apiFor("A")("info", "STUDY A — " + a.name, "baseline panel · same clock as B", this.SA);
    this.apiFor("B")("info", "STUDY B — " + b.name, "disorder panel · events highlighted as Δ divergences", this.SB);
    if (this.root){
      $("#cmpNameA", this.root).textContent = a.name.toUpperCase();
      $("#cmpNameB", this.root).textContent = b.name.toUpperCase();
    }
    this.drawAll(true);
  },

  mount(el){
    if (this.mounted){ el.innerHTML = ""; el.appendChild(this.root); this.resize(); return; }
    const opts = PSG_SCEN.map(s => "<option value='" + s.id + "'>" + esc(s.name) + "</option>").join("");
    const spdChips = [2, 8, 16, 32, 60].map(x => "<button class='qchip" + (x === this.speed ? " on" : "") + "' data-cmpsp='" + x + "'" + (x === this.speed ? " style='color:var(--cyan);border-color:var(--line2)'" : "") + ">" + x + "×</button>").join("");
    const lanes = CMP_CH.length, chH = lanes * this.LANE_H;
    const root = document.createElement("div");
    root.className = "cmp-shell";
    root.innerHTML = `
      <div class="cmp-top">
        <div class="ttl"><span class="rec" style="width:8px;height:8px;border-radius:50%;background:var(--mag);box-shadow:0 0 9px var(--mag);display:inline-block"></span>A/B DIFFERENTIAL PSG</div>
        <div class="cmp-selects">
          <span style="font-family:var(--mono);font-size:9.5px;color:var(--cyan);letter-spacing:.14em">PANEL A</span>
          <select id="cmpSelA">${opts}</select>
          <span class="cmp-vs">VS</span>
          <span style="font-family:var(--mono);font-size:9.5px;color:var(--mag);letter-spacing:.14em">PANEL B</span>
          <select id="cmpSelB">${opts}</select>
        </div>
      </div>
      <div class="cmp-grid" id="cmpGrid">
        <div class="cmp-col a">
          <div class="ch"><span class="badge">A</span><span id="cmpNameA">—</span>
            <span class="live">t <b id="cmpTA">0:00</b> · stage <b id="cmpStA">W</b> · SpO₂ <b id="cmpSpA">96</b>% · HR <b id="cmpHrA">64</b></span></div>
          <canvas class="cmp-canvas" id="cmpCvA" height="${chH}"></canvas>
          <div class="cmp-annot"><span class="ca-ap">APNEA</span><span class="ca-hy">HYPOP</span><span class="ca-ar">AROUSAL</span><span class="ca-de">DESAT</span><span class="ca-le">PLM/RWA</span><span style="color:var(--dim);border-color:var(--line-soft)">30-s epochs</span></div>
        </div>
        <div class="cmp-col b">
          <div class="ch"><span class="badge">B</span><span id="cmpNameB">—</span>
            <span class="live">t <b id="cmpTB">0:00</b> · stage <b id="cmpStB">W</b> · SpO₂ <b id="cmpSpB">96</b>% · HR <b id="cmpHrB">64</b></span></div>
          <canvas class="cmp-canvas" id="cmpCvB" height="${chH}"></canvas>
          <div class="cmp-annot"><span style="color:var(--mag);border-color:rgba(255,45,120,.45)">Δ divergent events glow magenta in the log</span></div>
        </div>
      </div>
      <div class="cmp-metrics" id="cmpMetrics"></div>
      <div class="cmp-bottom">
        <div class="cmp-logwrap">
          <div class="sh">DIFFERENTIAL EVENT LOG · A | B ON ONE CLOCK</div>
          <div class="cmp-log" id="cmpLog"></div>
        </div>
        <div class="cmp-matwrap">
          <div class="sh">DIFFERENCE MATRIX · NORMAL vs DISORDER</div>
          <div class="dmx-scroll" id="cmpMatrix"></div>
        </div>
      </div>
      <div class="psg-foot">
        <div class="psg-ctl">
          <button class="btn" id="cmpPlay" style="min-width:96px"><span data-ic="pause"></span>PAUSE</button>
          <button class="btn ghost" id="cmpRestart"><span data-ic="clock"></span>RESTART</button>
          <button class="btn ghost" id="cmpSwap"><span data-ic="settings"></span>SWAP A↔B</button>
          <span class="spacer"></span>
          <span style="font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;color:var(--dim)">SPEED</span>${spdChips}
        </div>
      </div>`;
    el.innerHTML = ""; el.appendChild(root);
    this.root = root; this.logEl = $("#cmpLog", root);
    hydrateIcons(root);
    $("#cmpSelA", root).value = this.scenA; $("#cmpSelB", root).value = this.scenB;
    $("#cmpSelA", root).addEventListener("change", e => { this.scenA = e.target.value; this.restart(); });
    $("#cmpSelB", root).addEventListener("change", e => { this.scenB = e.target.value; this.restart(); this.renderMatrix(); });
    $("#cmpPlay", root).addEventListener("click", () => {
      this.running = !this.running;
      $("#cmpPlay").innerHTML = this.running ? "<span data-ic='pause'></span>PAUSE" : "<span data-ic='play'></span>PLAY";
      hydrateIcons($("#cmpPlay"));
    });
    $("#cmpRestart", root).addEventListener("click", () => this.restart());
    $("#cmpSwap", root).addEventListener("click", () => {
      const t = this.scenA; this.scenA = this.scenB; this.scenB = t;
      $("#cmpSelA", root).value = this.scenA; $("#cmpSelB", root).value = this.scenB;
      this.restart(); this.renderMatrix();
    });
    $$("[data-cmpsp]", root).forEach(b => b.addEventListener("click", () => {
      this.speed = +b.getAttribute("data-cmpsp");
      $$("[data-cmpsp]", root).forEach(x => { x.classList.remove("on"); x.style.cssText = ""; });
      b.classList.add("on"); b.style.cssText = "color:var(--cyan);border-color:var(--line2)";
    }));
    this.mounted = true;
    this.restart();
    this.renderMatrix();
    this.resize();
    if (!this.raf){ const loop = ts => { this.raf = requestAnimationFrame(loop); this.tick(ts); }; this.raf = requestAnimationFrame(loop); }
  },

  onShow(){ if (this.mounted){ this.resize(); this.renderMatrix(); } },

  resize(){
    if (!this.mounted) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ["A", "B"].forEach(k => {
      const cv = $("#cmpCv" + k, this.root); if (!cv) return;
      const w = cv.clientWidth || cv.parentElement.clientWidth || 500;
      const hgt = CMP_CH.length * this.LANE_H;
      cv.width = Math.round(w * dpr); cv.height = Math.round(hgt * dpr);
      cv.style.height = hgt + "px";
      const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this["ctx" + k] = ctx; this["w" + k] = w;
    });
    this.drawAll(true);
  },

  visible(){
    const v = $("#view-sleep"), p = $("#spane-cmp");
    return v && v.classList.contains("active") && p && p.classList.contains("on");
  },

  tick(ts){
    if (!this.mounted || !this.SA || !this.SB) return;
    if (!this.visible()) { this.lastTs = ts; return; }
    if (!this.lastTs) this.lastTs = ts;
    let dt = Math.min(0.1, (ts - this.lastTs) / 1000); this.lastTs = ts;
    if (!this.running) dt = 0;
    const sim = dt * this.speed;
    if (sim > 0){
      cmpIntegrate(this.SA, sim, this.apiFor("A"));
      cmpIntegrate(this.SB, sim, this.apiFor("B"));
    }
    if (ts - this.lastDraw > 33){ this.lastDraw = ts; this.drawAll(false); }
    if (ts - this.lastUI > 500){ this.lastUI = ts; this.updateUI(); }
  },

  drawPanel(k){
    const s = k === "A" ? this.SA : this.SB, ctx = this["ctx" + k], w = this["w" + k];
    if (!ctx || !s) return;
    const gut = 92, hgt = CMP_CH.length * this.LANE_H, wv = w - gut;
    ctx.clearRect(0, 0, w, hgt);
    const pxPerSec = wv / this.WIN, t1 = s.t, t0 = t1 - this.WIN;
    /* event bands behind everything */
    const band = (a, b, col) => { const x1 = gut + (a - t0) * pxPerSec, x2 = gut + (b - t0) * pxPerSec;
      if (x2 < gut || x1 > w) return; ctx.fillStyle = col;
      ctx.fillRect(Math.max(gut, x1), 0, Math.min(w, x2) - Math.max(gut, x1), hgt); };
    if (s.apnea) band(s.apnea.t0, s.apnea.t0 + s.apnea.dur, s.apnea.type === "central" ? "rgba(177,140,255,.13)" : "rgba(255,56,96,.13)");
    if (s.arousal) band(s.arousal.t0, s.arousal.t0 + s.arousal.dur, "rgba(61,255,176,.11)");
    if (s.leg) band(s.leg.t0, s.leg.t0 + s.leg.dur, "rgba(0,229,255,.12)");
    if (s.desatOn) band(s.desatT0, s.t, "rgba(255,180,84,.09)");
    /* lanes */
    CMP_CH.forEach((c, i) => {
      const y0 = i * this.LANE_H, mid = y0 + this.LANE_H / 2;
      ctx.fillStyle = i % 2 ? "rgba(4,8,16,.5)" : "rgba(4,8,16,.72)";
      ctx.fillRect(0, y0, w, this.LANE_H);
      ctx.strokeStyle = "rgba(120,170,230,.08)";
      ctx.beginPath(); ctx.moveTo(gut, y0 + this.LANE_H - .5); ctx.lineTo(w, y0 + this.LANE_H - .5); ctx.stroke();
      ctx.strokeStyle = "rgba(120,170,230,.14)";
      ctx.beginPath(); ctx.moveTo(gut, mid); ctx.lineTo(w, mid); ctx.stroke();
      /* label */
      ctx.fillStyle = c.c; ctx.font = "8.5px monospace"; ctx.textAlign = "left";
      ctx.fillText(c.n.split(" ")[0].toUpperCase(), 6, y0 + 12);
      ctx.fillStyle = "rgba(130,152,189,.75)"; ctx.font = "7.5px monospace";
      ctx.fillText(c.n.split(" ").slice(1).join(" ").slice(0, 13), 6, y0 + 22);
      /* live numeric for pleth */
      if (c.id === "pleth"){ ctx.fillStyle = s.spO2 >= 90 ? "#3dffb0" : s.spO2 >= 85 ? "#ffb454" : "#ff3860";
        ctx.font = "700 11px monospace"; ctx.fillText(s.spO2.toFixed(0) + "%", 6, mid + 12); }
      /* waveform */
      const stepT = 1 / (pxPerSec * 1.4);
      ctx.strokeStyle = c.c; ctx.lineWidth = 1.05; ctx.shadowColor = c.c; ctx.shadowBlur = 2.5;
      ctx.beginPath(); let first = true;
      for (let tt = t0; tt <= t1; tt += stepT){
        const x = gut + (tt - t0) * pxPerSec;
        const v = clamp(c.gen(tt, s) * c.g, -1, 1);
        const y = mid - v * (this.LANE_H / 2 - 3);
        if (first){ ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.shadowBlur = 0;
    });
    /* time grid + epoch marks */
    for (let g = Math.ceil(t0 / 5) * 5; g <= t1; g += 5){
      const x = gut + (g - t0) * pxPerSec, isEp = g % 30 === 0;
      ctx.strokeStyle = isEp ? "rgba(0,229,255,.2)" : "rgba(120,170,230,.06)";
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, hgt); ctx.stroke();
      if (isEp){ ctx.fillStyle = "rgba(0,229,255,.4)"; ctx.font = "7.5px monospace"; ctx.textAlign = "left"; ctx.fillText("E" + Math.floor(g / 30), x + 2, 9); }
    }
    /* gutter border + now line */
    ctx.strokeStyle = "rgba(120,170,230,.2)";
    ctx.beginPath(); ctx.moveTo(gut + .5, 0); ctx.lineTo(gut + .5, hgt); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.beginPath(); ctx.moveTo(w - .5, 0); ctx.lineTo(w - .5, hgt); ctx.stroke();
  },

  drawAll(force){ if (!this.mounted) return; this.drawPanel("A"); this.drawPanel("B"); },

  updateUI(){
    const r = this.root; if (!r) return;
    const fmt = s => Math.floor(s.t / 60) + ":" + String(Math.floor(s.t % 60)).padStart(2, "0");
    const set = (id, v) => { const e = $(id, r); if (e) e.textContent = v; };
    set("#cmpTA", fmt(this.SA)); set("#cmpTB", fmt(this.SB));
    set("#cmpStA", this.SA.stage); set("#cmpStB", this.SB.stage);
    set("#cmpSpA", this.SA.spO2.toFixed(0)); set("#cmpSpB", this.SB.spO2.toFixed(0));
    set("#cmpHrA", Math.round(this.SA.hr)); set("#cmpHrB", Math.round(this.SB.hr));
    const idx = (s, f) => { const h = Math.max(s.tst / 3600, 0.02); return f(s) / h; };
    const rows = [
      ["AHI / RDI", s => s.evCount.apnea + s.evCount.hypop + s.evCount.rera, 1, v => v < 5 ? "ok" : v < 15 ? "warn" : "bad"],
      ["AROUSAL IDX", s => s.evCount.arousal, 0, v => v < 15 ? "ok" : v < 30 ? "warn" : "bad"],
      ["PLMI", s => s.evCount.leg, 0, v => v < 15 ? "ok" : "warn"],
      ["SpO₂ NADIR %", s => s.nadir, 0, v => v >= 90 ? "ok" : v >= 85 ? "warn" : "bad", true],
    ];
    const val = (s, row) => idx(s, row[1]).toFixed(row[2]);
    const clsA = rows.map(row => row[3](idx(this.SA, row[1])));
    const clsB = rows.map(row => row[3](idx(this.SB, row[1])));
    $("#cmpMetrics", r).innerHTML = rows.map((row, i) => `
      <div class="m ma"><div class="ml">${row[0]} · A</div><div class="mv ${clsA[i] === "bad" ? "" : ""}" style="color:${clsA[i] === "ok" ? "var(--green)" : clsA[i] === "warn" ? "var(--amber)" : "var(--red)"}">${val(this.SA, row)}${row[4] ? "" : "/hr"}</div></div>
      <div class="m mb"><div class="ml">${row[0]} · B</div><div class="mv" style="color:${clsB[i] === "ok" ? "var(--green)" : clsB[i] === "warn" ? "var(--amber)" : "var(--red)"}">${val(this.SB, row)}${row[4] ? "" : "/hr"}</div></div>
      <div class="m md${Math.abs(idx(this.SB, row[1]) - idx(this.SA, row[1])) > 5 ? " hot" : ""}"><div class="ml">Δ (B − A)</div>
        <div class="mv">${(idx(this.SB, row[1]) - idx(this.SA, row[1]) > 0 ? "+" : "") + (idx(this.SB, row[1]) - idx(this.SA, row[1])).toFixed(row[2])}</div></div>`).join("");
  },

  renderMatrix(){
    const el = $("#cmpMatrix", this.root); if (!el) return;
    const d = PSG_DIFF && PSG_DIFF[this.scenB];
    if (!d){ el.innerHTML = "<div style='padding:12px;font-family:var(--mono);font-size:10px;color:var(--dim)'>Select a disorder in panel B to populate the matrix.</div>"; return; }
    const isNormal = this.scenB === "normal";
    el.innerHTML = "<table class='dmx'><thead><tr><th>FEATURE</th><th>NORMAL</th><th>" + esc(d.name.toUpperCase()) + "</th></tr></thead><tbody>" +
      d.rows.map(row => {
        const same = row[1] === row[2];
        return "<tr" + (same ? "" : " class='diff'") + "><td>" + esc(row[0]) + (same ? "" : "<span class='dbadge'>Δ</span>") +
          "</td><td class='norm'>" + esc(row[1]) + "</td><td class='" + (same ? "norm" : "diff") + "'>" + esc(row[2]) + "</td></tr>";
      }).join("") + "</tbody></table>" +
      (isNormal ? "" : "<div style='padding:10px 12px;font-size:11px;line-height:1.65;color:var(--muted);border-top:1px solid var(--line-soft)'><b style='color:var(--mag)'>READ-OUT — </b>" + esc(d.verdict) + "</div>");
  },
};

function buildCmpPane(){
  const el = $("#spane-cmp"); if (!el) return;
  el.innerHTML = `
    <div class="anx-intro" style="margin-bottom:14px">
      <div class="ttl">DIFFERENTIAL PSG · NORMAL vs DISORDER ON ONE CLOCK</div>
      <p>Two complete 11-channel polysomnographs run <b>synchronously</b> — panel A is your baseline (default: normal sleep), panel B is the disorder under study. Watch the same simulated second unfold in both: where B's airflow flattens while effort continues (obstructive), where effort and flow die together (central), where chin EMG refuses to drop in REM (RBD), or where the whole night fails to consolidate (insomnia). The <b class="mg">Δ metrics strip</b> tallies the divergence hour-equivalent, the <b>differential log</b> flags every divergent event in magenta, and the <b>difference matrix</b> tabulates the systematic normal-vs-disorder contrasts.</p>
    </div>
    <div id="cmpMount"></div>`;
  PSG_CMP.mount($("#cmpMount", el));
}
</script>
