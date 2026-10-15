<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI — PSG SIMULATION ENGINE
   13-channel polysomnograph: deterministic signal synthesis, scenario
   state-machines, live auto-scoring, hypnogram, event feed. Zero deps.
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ── deterministic noise primitives ────────────────────────────────────── */
function phash(n){ n = (n ^ 61) >>> 0; n = Math.imul(n ^ (n >>> 16), 2049539085); n = Math.imul(n ^ (n >>> 13), 3266489917); n = (n ^ (n >>> 16)) >>> 0; return n / 4294967296; }
function pn1(n){ return phash(n) * 2 - 1; }
function vnoise(t, f, seed){ const x = t * f + seed * 7919; const i = Math.floor(x), u = x - i, s = u * u * (3 - 2 * u); return pn1(i) * (1 - s) + pn1(i + 1) * s; }
function band(t, f, seed){ return 0.62 * vnoise(t, f, seed) + 0.28 * vnoise(t, f * 2.63, seed + 11) + 0.13 * vnoise(t, f * 5.9, seed + 23); }
function gaussf(x, mu, sig){ return Math.exp(-((x - mu) * (x - mu)) / (2 * sig * sig)); }
function tri(x){ const u = x - Math.floor(x); return u < 0.5 ? u * 4 - 1 : 3 - u * 4; }
const rnd = (a, b) => a + Math.random() * (b - a);

/* stage at time t from transition history */
function stageAt(t, s){
  const h = s.stageHist; let st = "W";
  for (let i = h.length - 1; i >= 0; i--){ if (h[i].t <= t){ st = h[i].stage; break; } }
  return st;
}
/* scheduled EEG/EOG transients (K-complexes, spindles, vertex, REMs…) */
function trans(t, s, kind, so){
  const stageOK = { spindle:["N2"], kc:["N2"], vertex:["N1"], sawtooth:["R"], blink:["W"], sem:["N1"], rem:["R"] }[kind];
  if (stageOK.indexOf(stageAt(t, s)) < 0) return 0;
  let out = 0;
  const ep = Math.floor(t / 30);
  const perEpoch = { blink: 7, sem: 3, rem: 5, spindle: 3, kc: 2, vertex: 2, sawtooth: 2 }[kind];
  for (let e = ep - 1; e <= ep + 1; e++){
    if (e < 0) continue;
    for (let k = 0; k < perEpoch; k++){
      const rr = phash(e * 131 + k * 37 + so * 17);
      const t0 = e * 30 + 1.5 + rr * 26;
      const dur = { spindle:0.9, kc:0.75, vertex:0.28, blink:0.22, sem:1.3, rem:1.1, sawtooth:1.5 }[kind];
      if (t >= t0 && t <= t0 + dur){
        const u = (t - t0) / dur;
        let a = 0;
        if (kind === "spindle") a = Math.sin(2 * Math.PI * 13 * (t - t0)) * Math.sin(Math.PI * u) * 0.36;
        else if (kind === "kc") a = (u < 0.42 ? -Math.sin(Math.PI * u / 0.42) : 0.36 * Math.sin(Math.PI * (u - 0.42) / 0.58)) * 0.8;
        else if (kind === "vertex") a = -Math.sin(Math.PI * u) * 0.5;
        else if (kind === "blink") a = Math.sin(Math.PI * u) * 0.5;
        else if (kind === "sem") a = Math.sin(Math.PI * u) * 0.55;
        else if (kind === "sawtooth") a = tri(3.1 * (t - t0)) * Math.sin(Math.PI * u) * 0.26;
        else if (kind === "rem"){ a = 0; for (let q = 0; q < 4; q++){ a += gaussf(u, 0.14 + q * 0.24, 0.055) * (q % 2 ? -0.75 : 0.95); } a *= 0.8; }
        out += a;
      }
    }
  }
  return out;
}

/* ── signal generators (all normalized ≈ −1..1) ────────────────────────── */
function eegGen(t, s, loc){
  const st = stageAt(t, s); let v = 0;
  if (st === "W") v = 0.26 * band(t, 22, 1) + 0.11 * band(t, 40, 2) + (loc === "O" ? 0.4 : 0.16) * Math.sin(2 * Math.PI * 10.2 * t + 2.6 * vnoise(t, 0.21, 3));
  else if (st === "N1") v = 0.36 * band(t, 5, 10) + 0.12 * band(t, 15, 11) + (s.alphaIn ? 0.34 * Math.sin(2 * Math.PI * 9.8 * t + 2.6 * vnoise(t, 0.21, 3)) : 0) + trans(t, s, "vertex", 101) * (loc === "C" ? 1 : 0.7);
  else if (st === "N2") v = 0.24 * band(t, 5, 20) + 0.07 * band(t, 16, 21) + (s.alphaIn ? 0.2 * Math.sin(2 * Math.PI * 9.9 * t + 2.6 * vnoise(t, 0.21, 3)) : 0) + trans(t, s, "spindle", 103) * (loc === "C" ? 1 : 0.75) + trans(t, s, "kc", 107) * 0.85;
  else if (st === "N3") v = 0.52 * band(t, 1.1, 30) + 0.3 * band(t, 2.9, 31) + 0.07 * band(t, 8, 32);
  else if (st === "R") v = 0.21 * band(t, 6, 40) + 0.1 * band(t, 20, 41) + trans(t, s, "sawtooth", 109) * (loc === "C" ? 1 : 0.7);
  if (s.arousal){ const u = (t - s.arousal.t0) / s.arousal.dur; if (u >= 0 && u <= 1) v += 0.5 * band(t, 13, 99) * Math.sin(Math.PI * u); }
  return v;
}
function eogGen(t, s, side){
  const st = stageAt(t, s); let d = 0.03 * band(t, 0.5, 120);
  if (st === "W") d = trans(t, s, "blink", 113) + 0.05 * band(t, 3, 121);
  else if (st === "N1") d = trans(t, s, "sem", 117) + 0.04 * band(t, 1, 122);
  else if (st === "R") d = trans(t, s, "rem", 119) + 0.04 * band(t, 2, 123);
  return side === "L" ? d : -d;
}
function chinGen(t, s){
  const st = stageAt(t, s);
  let tone = { W:0.5, N1:0.28, N2:0.17, N3:0.13, R:0.06 }[st];
  if (st === "R" && s.remTone != null) tone = s.remTone;   /* RBD: REM without atonia */
  let v = tone * band(t, 26, 130);
  if (s.arousal){ const u = (t - s.arousal.t0) / s.arousal.dur; if (u >= 0 && u <= 1) v += 0.5 * band(t, 19, 131) * Math.sin(Math.PI * u); }
  return v;
}
function qrs(dt){
  return 0.13 * gaussf(dt, -0.14, 0.022) - 0.13 * gaussf(dt, -0.024, 0.009) + 0.92 * gaussf(dt, 0, 0.008)
    - 0.22 * gaussf(dt, 0.026, 0.011) + 0.26 * gaussf(dt, 0.26, 0.05);
}
function ecgGen(t, s){
  let v = 0;
  for (let i = 0; i < s.beats.length; i++){ const dt = t - s.beats[i]; if (dt > -0.2 && dt < 0.45) v += qrs(dt); }
  return v * 0.92;
}
function pulse(dt){ return (dt < 0.13 ? dt / 0.13 : Math.exp(-(dt - 0.13) * 3.6)) + 0.2 * gaussf(dt, 0.3, 0.045); }
function plethGen(t, s){
  let v = 0.18;
  const perf = 0.45 + 0.5 * clamp((s.spO2 - 78) / 18, 0, 1);
  for (let i = 0; i < s.beats.length; i++){ const dt = t - s.beats[i]; if (dt >= 0 && dt < 0.9) v += pulse(dt) * perf * 0.5; }
  return v;
}
function respPhase(t, s){ return ((t * s.respRate / 60) % 1 + 1) % 1; }
function flowGen(t, s){
  if (s.apnea){ let v = 0.015 * band(t, 8, 140); for (let i = 0; i < s.beats.length; i++){ const dt = t - s.beats[i]; if (dt >= 0 && dt < 0.3) v += 0.05 * Math.exp(-dt * 12); } return v; }
  const p = respPhase(t, s), A = s.respAmp;
  const ins = p < 0.42 ? Math.pow(Math.sin(Math.PI * p / 0.42), 1.15) : 0;
  const exp = p >= 0.42 ? -Math.pow(Math.sin(Math.PI * (p - 0.42) / 0.58), 1.15) * 0.72 : 0;
  return A * (ins + exp) + 0.015 * band(t, 6, 141);
}
function pflowGen(t, s){
  if (s.apnea) return 0.012 * band(t, 8, 142);
  const p = respPhase(t, s), A = s.respAmp;
  let ins = p < 0.42 ? Math.pow(Math.sin(Math.PI * p / 0.42), 1.15) : 0;
  ins = Math.min(ins, 1 - 0.62 * s.flowLimit);           /* flow-limitation flattening */
  const exp = p >= 0.42 ? -Math.pow(Math.sin(Math.PI * (p - 0.42) / 0.58), 1.3) * 0.6 : 0;
  return A * (ins + exp) + 0.01 * band(t, 5, 147);
}
function thorGen(t, s){
  if (s.apnea && s.apnea.type === "central") return 0.02 * band(t, 4, 143);
  const p = respPhase(t, s);
  return s.effortAmp * 0.55 * Math.sin(2 * Math.PI * p - 0.5);
}
function abdGen(t, s){
  if (s.apnea && s.apnea.type === "central") return 0.02 * band(t, 4, 144);
  const p = respPhase(t, s);
  return s.effortAmp * 0.55 * Math.sin(2 * Math.PI * p - 0.5 - Math.PI * s.paradox);
}
function snoreGen(t, s){
  if (s.apnea) return 0.012 * band(t, 10, 145);
  const p = respPhase(t, s), ins = p < 0.42 ? Math.sin(Math.PI * p / 0.42) : 0;
  return s.snore * ins * (0.5 * Math.sin(2 * Math.PI * 57 * t) + 0.22 * Math.sin(2 * Math.PI * 113 * t)) + 0.012 * band(t, 15, 146);
}
function legGen(t, s){
  let v = 0.05 * band(t, 22, 150);
  if (s.leg){ const u = (t - s.leg.t0) / s.leg.dur; if (u >= 0 && u <= 1) v += 0.8 * band(t, 12, 151) * Math.sin(Math.PI * u); }
  return v;
}

/* ── channel definitions ───────────────────────────────────────────────── */
const PSG_CH = [
  { id:"eeg1", n:"EEG C4-A1", u:"µV", c:"#00e5ff", g:0.9, gen:(t, s) => eegGen(t, s, "C") },
  { id:"eeg2", n:"EEG O2-A1", u:"µV", c:"#4fc3ff", g:0.9, gen:(t, s) => eegGen(t, s, "O") },
  { id:"eogl", n:"EOG L (E1-M2)", u:"µV", c:"#b18cff", g:1.0, gen:(t, s) => eogGen(t, s, "L") },
  { id:"eogr", n:"EOG R (E2-M2)", u:"µV", c:"#c9a4ff", g:1.0, gen:(t, s) => eogGen(t, s, "R") },
  { id:"chin", n:"Chin EMG", u:"µV", c:"#ffb454", g:0.95, gen:chinGen },
  { id:"ecg", n:"ECG II", u:"mV", c:"#ff3860", g:0.95, gen:ecgGen },
  { id:"flow", n:"Airflow (therm)", u:"L/s", c:"#3dffb0", g:0.95, gen:flowGen },
  { id:"pflow", n:"Nasal pressure", u:"cmH₂O", c:"#00ffc6", g:0.95, gen:pflowGen },
  { id:"thor", n:"Thorax effort", u:"a.u.", c:"#2d9bff", g:0.9, gen:thorGen },
  { id:"abd", n:"Abdomen effort", u:"a.u.", c:"#7d8dff", g:0.9, gen:abdGen },
  { id:"snore", n:"Snore mic", u:"a.u.", c:"#ff2d78", g:0.85, gen:snoreGen },
  { id:"leg", n:"Leg EMG (tib)", u:"µV", c:"#9d7bff", g:0.9, gen:legGen },
  { id:"pleth", n:"SpO₂ pleth", u:"a.u.", c:"#ff5c7a", g:0.85, gen:plethGen },
];

/* ── scenario machinery ────────────────────────────────────────────────── */
function psgBase(){ return {
  t:0, stage:"W", stageT:0, stageHist:[{ t:0, stage:"W" }], epochs:[],
  respRate:14, respAmp:0.95, flowLimit:0.05, effortAmp:1, paradox:0,
  apnea:null, arousal:null, leg:null, snore:0.05,
  spo2Tgt:96, spO2:96, hrT:64, hr:64, beats:[0], lastBeat:0, beatAcc:0,
  position:"SUPINE", pap:0, desatOn:false, desatT0:0, nadirEv:100,
  tst:0, spo2Sum:0, spo2N:0, nadir:100,
  evCount:{ apnea:0, hypop:0, rera:0, arousal:0, leg:0, desat:0 }, local:{}
};}
function setStage(s, st){ if (s.stage !== st){ s.stage = st; s.stageT = 0; s.stageHist.push({ t:s.t, stage:st }); if (s.stageHist.length > 260) s.stageHist.shift(); } }
function arousal(s, api, dur){ s.arousal = { t0:s.t, dur:dur || 3 }; s.evCount.arousal++; api.evt("arousal", "EEG Arousal", (dur || 3).toFixed(0) + "s — alpha intrusion, chin EMG ↑"); }
function startApnea(s, type, dur){ s.apnea = { type:type, t0:s.t, dur:dur }; }
function endApnea(s, api, label){
  const d = s.apnea ? (s.t - s.apnea.t0) : 0; const wasOb = s.apnea && s.apnea.type === "ob";
  s.apnea = null;
  if (label === "hypop"){ s.evCount.hypop++; api.evt("hypop", "HYPOPNEA " + d.toFixed(0) + "s", "≥30% flow drop " + (wasOb ? "with effort" : "") + " + desat/arousal"); }
  else if (label === "rera"){ s.evCount.rera++; api.evt("hypop", "RERA " + d.toFixed(0) + "s", "flow limitation → arousal, no desat criteria"); }
  else { s.evCount.apnea++; api.evt("apnea", (wasOb ? "OBSTRUCTIVE" : "CENTRAL") + " APNEA " + d.toFixed(0) + "s", wasOb ? "effort persists · flow absent · SpO₂ " + s.spO2.toFixed(0) + "%" : "effort AND flow both absent"); }
}

const PSG_SCEN = [
{ id:"normal", name:"Normal Sleep", note:"Healthy adult — W → N1 → N2 → N3 → R cycles (90–110 min), spindles/K-complexes in N2, delta in N3, REM atonia with rapid eye movements. SpO₂ 95–97%, no respiratory events.",
  make(){ const s = psgBase(); s.local = { script:[["W",55],["N1",85],["N2",260],["N3",430],["N2",150],["R",300],["N2",210],["N3",320],["N2",130],["R",380]], ix:0, tmr:0, arT:200, remMsg:false }; return s; },
  step(s, dt, api){
    s.local.tmr += dt; s.stageT += dt;
    const cur = s.local.script[s.local.ix];
    if (s.local.tmr >= cur[1]){
      s.local.ix = (s.local.ix + 1) % s.local.script.length; s.local.tmr = 0;
      const nx = s.local.script[s.local.ix]; setStage(s, nx[0]);
      if (nx[0] === "R") api.evt("info", "REM period begins", "LAMF EEG + REMs + chin atonia — sawtooth waves may appear");
    }
    s.respRate = 13 + 1.6 * Math.sin(s.t / 97);
    s.respAmp = 0.95; s.flowLimit = 0.05; s.effortAmp = 1; s.paradox = 0; s.snore = 0.05;
    s.spo2Tgt = 96.5; s.hrT = 62 + (s.stage === "R" ? 7 : 0) + (s.stage === "N3" ? -4 : 0);
    s.local.arT -= dt;
    if (s.local.arT < 0){ s.local.arT = rnd(190, 300); if (s.stage !== "W") arousal(s, api, 2.5); }
    if (s.arousal && s.t - s.arousal.t0 > s.arousal.dur) s.arousal = null;
  } },
{ id:"osa-severe", name:"Severe OSA", note:"Supine obese snorer — repetitive obstructive apneas: effort persists while airflow ceases → cyclic desaturation to low-80s, brady-tachycardia, loud recovery snoring, arousals fragment N1/N2 (N3 never consolidates). Live AHI builds toward 60+.",
  make(){ const s = psgBase(); s.local = { phase:"onset", tmr:22 }; s.hrT = 76; s.spo2Tgt = 95; return s; },
  step(s, dt, api){
    const L = s.local; s.stageT += dt; L.tmr -= dt;
    if (s.arousal && s.t - s.arousal.t0 > s.arousal.dur) s.arousal = null;
    if (L.phase === "onset"){
      setStage(s, "W"); s.respRate = 16; s.respAmp = 0.9; s.snore = 0.5; s.flowLimit = 0.45; s.effortAmp = 1; s.paradox = 0.3; s.hrT = 78; s.spo2Tgt = 95;
      if (L.tmr < 0){ setStage(s, "N1"); L.phase = "breath"; L.tmr = rnd(16, 26); api.evt("info", "Sleep onset", "alpha attenuates → theta with slow eye movements"); }
    } else if (L.phase === "breath"){
      s.snore = 0.65; s.flowLimit = 0.5; s.respAmp = 0.95; s.effortAmp = 1; s.paradox = 0.35; s.spo2Tgt = 95; s.hrT = 76;
      if (s.stage === "W") setStage(s, "N1");
      if (s.stageT > 45 && s.stage === "N1" && Math.random() < 0.02 * dt * 60) setStage(s, "N2");
      if (L.tmr < 0){ L.phase = "apnea"; L.dur = rnd(17, 30); startApnea(s, "ob", L.dur); s.respAmp = 0; s.effortAmp = 1.18; s.paradox = 0.85; s.snore = 0; }
    } else if (L.phase === "apnea"){
      const el = s.t - s.apnea.t0;
      s.spo2Tgt = clamp(95 - el * 0.5, 78, 95);
      s.hrT = 78 - 10 * Math.min(1, el / Math.max(1, s.apnea.dur));
      if (el >= s.apnea.dur){
        endApnea(s, api, "apnea");
        L.phase = "arousal"; L.tmr = rnd(4, 9);
        s.arousal = { t0:s.t, dur:3 }; s.evCount.arousal++;
        setStage(s, "W"); s.snore = 0.95; s.respAmp = 1.15; s.flowLimit = 0.4; s.paradox = 0.2; s.hrT = 102; s.spo2Tgt = 93;
      }
    } else if (L.phase === "arousal"){
      s.hrT = 96; s.spo2Tgt = 94;
      if (L.tmr < 0){ setStage(s, Math.random() < 0.6 ? "N1" : "N2"); L.phase = "breath"; L.tmr = rnd(20, 38); }
    }
  } },
{ id:"osa-mild", name:"Mild OSA / UARS", note:"Flow-limitation spectrum: hypopneas and RERAs with inspiratory flattening of nasal pressure, desats only to ~88–90%, loud snoring, recurrent arousals. AHI 5–15 but RDI much higher — the pattern missed by oximetry alone.",
  make(){ const s = psgBase(); s.local = { phase:"onset", tmr:15, alt:0 }; s.hrT = 72; s.spo2Tgt = 95; return s; },
  step(s, dt, api){
    const L = s.local; s.stageT += dt; L.tmr -= dt;
    if (s.arousal && s.t - s.arousal.t0 > s.arousal.dur) s.arousal = null;
    if (L.phase === "onset"){ setStage(s, "W"); s.respAmp = 0.9; s.snore = 0.55; s.flowLimit = 0.5; if (L.tmr < 0){ setStage(s, "N1"); L.phase = "breath"; L.tmr = rnd(20, 35); } s.spo2Tgt = 95; s.hrT = 74; }
    else if (L.phase === "breath"){
      s.snore = 0.7; s.flowLimit = 0.6; s.respAmp = 0.9; s.effortAmp = 1; s.paradox = 0.2; s.spo2Tgt = 94.5; s.hrT = 73;
      if (s.stage === "W") setStage(s, "N1");
      if (s.stageT > 60 && Math.random() < 0.015 * dt * 60) setStage(s, "N2");
      if (L.tmr < 0){
        L.alt = (L.alt + 1) % 3;
        if (L.alt === 0){ L.phase = "hypop"; L.dur = rnd(16, 26); startApnea(s, "ob", L.dur); s.respAmp = 0.28; s.flowLimit = 0.95; s.effortAmp = 1.12; s.snore = 0.35; }
        else { L.phase = "rera"; L.dur = rnd(11, 20); startApnea(s, "ob", L.dur); s.respAmp = 0.5; s.flowLimit = 0.92; s.effortAmp = 1.08; s.snore = 0.3; }
      }
    } else { /* hypop or rera */
      const el = s.t - s.apnea.t0;
      s.spo2Tgt = L.phase === "hypop" ? clamp(93 - el * 0.22, 87.5, 93) : 94;
      if (el >= s.apnea.dur){
        endApnea(s, api, L.phase);
        arousal(s, api, 2.5); setStage(s, "N1");
        L.phase = "breath"; L.tmr = rnd(22, 42); s.respAmp = 1.05; s.flowLimit = 0.45; s.snore = 0.8; s.hrT = 88;
      }
    }
  } },
{ id:"csr", name:"Cheyne–Stokes (heart failure)", note:"Central sleep apnea with crescendo–decrescendo ventilation — 60–70 s cycles: effort rises and falls WITH flow (central), punctuated by ~10–12 s central apneas at the nadir. Cyclic mild desats, tachy-brady pattern, light fragmented sleep. Think HFrEF.",
  make(){ const s = psgBase(); setStage(s, "N1"); s.local = { cyc:0, arDone:false }; s.hrT = 66; return s; },
  step(s, dt, api){
    const CY = 65, u = (s.t % CY) / CY;
    const amp = u < 0.45 ? Math.pow(Math.sin(Math.PI * u / 0.45), 1.1) : (u < 0.60 ? 0 : Math.pow(Math.sin(Math.PI * (u - 0.60) / 0.40), 1.1));
    s.respRate = 16; s.respAmp = 0.95 * amp; s.effortAmp = amp; s.flowLimit = 0.1; s.paradox = 0; s.snore = 0;
    const cyc = Math.floor(s.t / CY);
    if (cyc !== s.local.cyc){ s.local.cyc = cyc; s.local.arDone = false; }
    if (amp < 0.03){ if (!s.apnea) startApnea(s, "central", CY * 0.15); }
    else if (s.apnea) endApnea(s, api, "central");
    if (u > 0.36 && u < 0.46 && !s.local.arDone && amp > 0.75){ s.local.arDone = true; if (Math.random() < 0.5) arousal(s, api, 2.2); }
    s.spo2Tgt = 90.5 + 3.4 * amp;
    s.hrT = 62 + 11 * Math.sin(2 * Math.PI * u);
    if (s.arousal && s.t - s.arousal.t0 > s.arousal.dur) s.arousal = null;
    if (s.stage === "W" && s.stageT > 20) setStage(s, "N1");
    if ((s.stage === "N1") && s.stageT > 90 && Math.random() < 0.01 * dt * 60) setStage(s, "N2");
  } },
{ id:"plmd", name:"PLMD (periodic legs)", note:"Stable N2 sleep punctuated every ~25–30 s by stereotyped left-tibialis bursts (0.5–10 s L-shaped EMB deflections), ~60% followed by EEG arousals and brief HR bumps. No respiratory events, no desats — but fragmented, unrefreshing sleep.",
  make(){ const s = psgBase(); setStage(s, "N2"); s.local = { next:rnd(14, 24), hrB:0 }; s.hrT = 60; return s; },
  step(s, dt, api){
    s.respRate = 14; s.respAmp = 0.95; s.flowLimit = 0.05; s.effortAmp = 1; s.paradox = 0; s.snore = 0.08; s.spo2Tgt = 95.5;
    s.local.next -= dt; s.local.hrB = Math.max(0, s.local.hrB - dt * 4);
    if (s.local.next < 0){
      s.local.next = rnd(22, 34);
      s.leg = { t0:s.t, dur:rnd(1.8, 3.2) }; s.evCount.leg++;
      api.evt("leg", "PLM — tibialis burst", "stereotyped 0.5–10 s EMG activation, trains 20–40 s apart");
      if (Math.random() < 0.6){
        s.arousal = { t0:s.t + 0.4, dur:2.6 }; s.evCount.arousal++; s.local.hrB = 10;
        api.evt("arousal", "Arousal follows PLM", "leg movement + alpha burst — PLMI climbs");
      }
    }
    if (s.leg && s.t - s.leg.t0 > s.leg.dur) s.leg = null;
    if (s.arousal && s.t - s.arousal.t0 > s.arousal.dur) s.arousal = null;
    s.hrT = 60 + s.local.hrB;
    if (s.stage === "W" && s.stageT > 15) setStage(s, "N2");
  } },
{ id:"narcolepsy", name:"Narcolepsy (SOREMP)", note:"Sleep-onset REM within minutes of sleep onset — the MSLT hallmark appearing on PSG. Immediate chin atonia, dense rapid eye movements, sawtooth EEG, mildly irregular respiration. Repeated sleep–REM cycling without consolidation.",
  make(){ const s = psgBase(); s.local = { script:[["W",70],["N1",45],["R",290],["N1",70],["N2",210],["R",310]], ix:0, tmr:0, msg:false }; return s; },
  step(s, dt, api){
    const L = s.local; s.stageT += dt; L.tmr += dt;
    const cur = L.script[L.ix];
    if (L.tmr >= cur[1]){
      L.ix = (L.ix + 1) % L.script.length; L.tmr = 0;
      const nx = L.script[L.ix]; setStage(s, nx[0]);
      if (nx[0] === "R"){ api.evt("info", L.ix === 2 ? "SOREMP — sleep-onset REM" : "REM period", "REM within 15 min of sleep onset — MSLT would score ≥ 2 SOREMPs"); }
    }
    s.respRate = 13 + 3.2 * Math.sin(s.t / 5.1) + 1.5 * band(s.t, 0.3, 60);
    s.respAmp = 0.9; s.flowLimit = 0.1; s.effortAmp = 1; s.paradox = 0; s.snore = 0.02;
    s.spo2Tgt = 95.5; s.hrT = 64 + (s.stage === "R" ? 8 * Math.sin(s.t / 9) : 0);
    if (s.arousal && s.t - s.arousal.t0 > s.arousal.dur) s.arousal = null;
  } },
{ id:"titration", name:"PAP Titration Night", note:"Split-night study: untreated severe OSA first, then CPAP is introduced and escalated (5 → 9 cmH₂O) until apneas, flow limitation and snoring are abolished — watch the nasal-pressure contour round out and SpO₂ stabilise.",
  make(){ const s = psgBase(); s.local = { phase:"diag", tmr:420, cpap:0, okT:0, sub:"onset", subT:18 }; s.hrT = 76; return s; },
  step(s, dt, api){
    const L = s.local; s.stageT += dt; L.tmr -= dt; L.subT -= dt;
    if (s.arousal && s.t - s.arousal.t0 > s.arousal.dur) s.arousal = null;
    if (L.phase === "diag"){
      if (L.sub === "onset"){ setStage(s, "W"); s.respRate = 16; s.respAmp = 0.9; s.snore = 0.5; s.flowLimit = 0.45; s.effortAmp = 1; s.hrT = 78; s.spo2Tgt = 95;
        if (L.subT < 0){ setStage(s, "N1"); L.sub = "breath"; L.subT = rnd(14, 22); } }
      else if (L.sub === "breath"){ s.snore = 0.65; s.flowLimit = 0.5; s.respAmp = 0.95; s.spo2Tgt = 95; s.hrT = 76;
        if (L.subT < 0){ L.sub = "apnea"; L.subT = rnd(16, 26); startApnea(s, "ob", L.subT); s.respAmp = 0; s.effortAmp = 1.18; s.snore = 0; } }
      else { const el = s.t - s.apnea.t0; s.spo2Tgt = clamp(95 - el * 0.45, 80, 95); s.hrT = 78 - 9 * Math.min(1, el / s.apnea.dur);
        if (el >= s.apnea.dur){ endApnea(s, api, "apnea"); s.arousal = { t0:s.t, dur:3 }; s.evCount.arousal++; setStage(s, "W"); L.sub = "breath"; L.subT = rnd(16, 26); s.respAmp = 1.15; s.snore = 0.95; s.hrT = 100; } }
      if (L.tmr < 0){ L.phase = "pap"; L.cpap = 5; s.pap = 5; L.okT = 0; api.evt("info", "CPAP INITIATED — 5 cmH₂O", "split-night: therapy begins, watch flow limitation resolve"); }
    } else {
      s.pap = L.cpap;
      const suppression = clamp(1 - (L.cpap - 5) / 3.5, 0, 1);
      if (Math.random() < 0.006 * dt * 60 * suppression){
        startApnea(s, "ob", rnd(12, 20)); s.respAmp = 0; s.effortAmp = 1.1; s.snore = 0;
        L.evEnd = true;
      }
      if (s.apnea && L.evEnd){ const el = s.t - s.apnea.t0; s.spo2Tgt = clamp(95 - el * 0.3, 84, 95);
        if (el >= s.apnea.dur){ endApnea(s, api, "apnea"); L.evEnd = false; arousal(s, api, 2.5); L.okT = 0;
          if (L.cpap < 10){ L.cpap++; s.pap = L.cpap; api.evt("info", "CPAP → " + L.cpap + " cmH₂O", "breakthrough event — pressure escalated"); } } }
      else {
        L.okT += dt;
        s.respAmp = 0.95; s.flowLimit = clamp(0.55 - (L.cpap - 5) * 0.13, 0.08, 0.55);
        s.snore = clamp(0.6 - (L.cpap - 5) * 0.14, 0.03, 0.6); s.effortAmp = 1; s.spo2Tgt = 95; s.hrT = 72;
        if (s.stage === "W" && s.stageT > 12) setStage(s, "N2");
        if (L.okT > 110 && L.cpap < 9){ L.cpap++; s.pap = L.cpap; L.okT = 0; api.evt("info", "CPAP → " + L.cpap + " cmH₂O", "events abolished — final pressure being fine-tuned"); }
        if (L.cpap >= 9 && !L.done){ L.done = true; api.evt("info", "Titration complete", "AHI < 5 on CPAP 9 cmH₂O, all positions, SpO₂ stable — optimal pressure reached"); }
      }
    }
  } },
];
function scenById(id){ for (const s of PSG_SCEN) if (s.id === id) return s; return PSG_SCEN[0]; }

/* ══ ENGINE ══════════════════════════════════════════════════════════════ */
const PSG = {
  mounted:false, running:true, speed:8, scenId:"osa-severe",
  S:null, WIN:30, LANE_H:46, lastTs:0, lastDraw:0, lastUI:0, raf:null,
  CH:[], feedEl:null, mounted2:false,

  api(){
    const self = this;
    return {
      evt(type, label, note){
        const t = ((self.S.t / 3600) >= 0.01 ? self.S.t : 0);
        if (!self.feedEl) return;
        const d = document.createElement("div");
        d.className = "fitem " + (type === "apnea" ? "apnea" : type === "hypop" ? "hypop" : type === "desat" ? "desat" : type === "arousal" ? "arousal" : type === "leg" ? "leg" : "info");
        const clock = Math.floor(self.S.t / 60) + "m" + String(Math.floor(self.S.t % 60)).padStart(2, "0");
        d.innerHTML = "<span class='ft'>" + esc(label) + "</span><br><span style='color:var(--dim)'>" + clock + " · " + esc(note) + "</span>";
        self.feedEl.prepend(d);
        while (self.feedEl.children.length > 42) self.feedEl.lastChild.remove();
      }
    };
  },

  mount(el){
    if (this.mounted){ el.innerHTML = ""; el.appendChild(this.root); this.resize(); return; }
    const chans = PSG_CH.map(c => Object.assign({}, c));
    let labels = "", lanes = "";
    chans.forEach((c, i) => {
      labels += "<div class='psglab' style='height:" + this.LANE_H + "px'><span style='color:" + c.c + "'>●</span> " + esc(c.n) + "<br><i>" + esc(c.u) + "</i></div>";
      lanes += "<canvas class='psg-lane' id='psgcv-" + c.id + "' height='" + this.LANE_H + "'></canvas>";
    });
    const scenChips = PSG_SCEN.map(s => "<button class='qchip" + (s.id === this.scenId ? " on" : "") + "' data-psgsc='" + s.id + "'" + (s.id === this.scenId ? " style='color:var(--cyan);border-color:var(--line2)'" : "") + ">" + esc(s.name) + "</button>").join("");
    const spdChips = [1, 2, 4, 8, 16, 32, 60].map(x => "<button class='qchip" + (x === this.speed ? " on" : "") + "' data-psgsp='" + x + "'" + (x === this.speed ? " style='color:var(--cyan);border-color:var(--line2)'" : "") + ">" + x + "×</button>").join("");
    const root = document.createElement("div");
    root.className = "psg-shell";
    root.innerHTML = `
      <div class="psg-top">
        <div class="ttl"><span class="rec"></span>PSG LIVE · <span id="psgScenName">${esc(scenById(this.scenId).name).toUpperCase()}</span></div>
        <div class="psg-vitals">
          <div class="pv spo2"><div class="pvv" id="pvSpo2">96</div><div class="pvl">SpO₂ %</div></div>
          <div class="pv hr"><div class="pvv" id="pvHr">72</div><div class="pvl">HR</div><div class="beat" id="pvBeat"></div></div>
          <div class="pv br"><div class="pvv" id="pvBr">14</div><div class="pvl">RESP/MIN</div></div>
          <div class="pv stg"><div class="pvv" id="pvStage">W</div><div class="pvl">STAGE</div></div>
          <div class="pv epoch"><div class="pvv" id="pvEpoch">E0</div><div class="pvl">EPOCH·30s</div></div>
          <div class="pv epoch"><div class="pvv" id="pvPos" style="font-size:11px;padding-top:4px">SUPINE</div><div class="pvl">POSITION/PAP</div></div>
        </div>
      </div>
      <div class="psg-body">
        <div class="psg-lanewrap" style="position:relative;min-width:0">
          <div style="display:grid;grid-template-columns:128px minmax(0,1fr)">
            <div id="psgLabels">${labels}</div>
            <div style="position:relative;min-width:0" id="psgLaneCol">
              ${lanes}
              <canvas id="psgOverlay" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none"></canvas>
            </div>
          </div>
        </div>
        <div class="psg-side">
          <div class="sh">AUTO-SCORED EVENT FEED</div>
          <div class="psg-feed" id="psgFeed"></div>
          <div class="psg-stats" id="psgStats"></div>
        </div>
      </div>
      <div class="psg-foot">
        <div class="psg-ctl">
          <button class="btn" id="psgPlay" style="min-width:96px"><span data-ic="pause"></span>PAUSE</button>
          <button class="btn ghost" id="psgRestart"><span data-ic="clock"></span>RESTART</button>
          <span class="spacer"></span>
          <span style="font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;color:var(--dim)">SPEED</span>${spdChips}
        </div>
        <canvas id="psgHypno"></canvas>
        <div class="psg-scen-note" id="psgNote"></div>
        <div class="psg-ctl" style="margin-top:2px">${scenChips}</div>
      </div>`;
    el.innerHTML = ""; el.appendChild(root);
    this.root = root; this.feedEl = $("#psgFeed", root); this.CH = chans;
    /* canvases */
    this.CH.forEach(c => { c.cv = $("#psgcv-" + c.id, root); });
    this.ovCv = $("#psgOverlay", root); this.hypCv = $("#psgHypno", root);
    $("#psgNote", root).textContent = scenById(this.scenId).note;
    hydrateIcons(root);
    /* controls */
    $("#psgPlay", root).addEventListener("click", () => {
      this.running = !this.running;
      $("#psgPlay").innerHTML = this.running ? "<span data-ic='pause'></span>PAUSE" : "<span data-ic='play'></span>PLAY";
      hydrateIcons($("#psgPlay"));
    });
    $("#psgRestart", root).addEventListener("click", () => this.restart());
    $$("[data-psgsp]", root).forEach(b => b.addEventListener("click", () => {
      this.speed = +b.getAttribute("data-psgsp");
      $$("[data-psgsp]", root).forEach(x => { x.classList.remove("on"); x.style.cssText = ""; });
      b.classList.add("on"); b.style.cssText = "color:var(--cyan);border-color:var(--line2)";
    }));
    $$("[data-psgsc]", root).forEach(b => b.addEventListener("click", () => {
      this.scenId = b.getAttribute("data-psgsc");
      $$("[data-psgsc]", root).forEach(x => { x.classList.remove("on"); x.style.cssText = ""; });
      b.classList.add("on"); b.style.cssText = "color:var(--cyan);border-color:var(--line2)";
      this.restart();
    }));
    this.mounted = true;
    this.restart();
    this.resize();
    if (!this.raf){ const loop = ts => { this.raf = requestAnimationFrame(loop); this.tick(ts); }; this.raf = requestAnimationFrame(loop); }
  },

  restart(){
    const scen = scenById(this.scenId);
    this.S = scen.make();
    this.S.scen = scen;
    if (this.feedEl) this.feedEl.innerHTML = "";
    if (this.root){
      $("#psgScenName", this.root).textContent = scen.name.toUpperCase();
      $("#psgNote", this.root).textContent = scen.note;
    }
    this.api().evt("info", "STUDY START — " + scen.name, "30-s epochs · AASM scoring engine armed");
  },

  resize(){
    if (!this.mounted) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.CH.forEach(c => {
      const w = c.cv.clientWidth || c.cv.parentElement.clientWidth || 600;
      c.cv.width = Math.round(w * dpr); c.cv.height = Math.round(this.LANE_H * dpr);
      c.ctx = c.cv.getContext("2d"); c.w = w; c.dpr = dpr;
      c.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    const laneCol = $("#psgLaneCol", this.root);
    if (this.ovCv){
      this.ovCv.width = Math.round((this.ovCv.parentElement.clientWidth || 600) * dpr);
      this.ovCv.height = Math.round((this.CH.length * this.LANE_H) * dpr);
      this.ovCv.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    if (this.hypCv){
      const hw = this.hypCv.clientWidth || 600;
      this.hypCv.width = Math.round(hw * dpr); this.hypCv.height = Math.round(92 * dpr);
      this.hypCv.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
      this.hw = hw;
    }
    this.draw(true);
  },

  tick(ts){
    if (!this.mounted || !this.S) return;
    const viewActive = $("#view-sleep") && $("#view-sleep").classList.contains("active");
    if (!viewActive) return;
    if (!this.lastTs) this.lastTs = ts;
    let dt = Math.min(0.1, (ts - this.lastTs) / 1000); this.lastTs = ts;
    if (!this.running) dt = 0;
    const s = this.S, api = this.api(), sim = dt * this.speed;
    if (sim > 0){
      /* integrate in ≤0.25-s sub-steps for stable state machines */
      let rem = sim;
      while (rem > 0){
        const h = Math.min(0.25, rem); rem -= h; s.t += h;
        s.scen.step(s, h, api);
        /* heart beats */
        s.hr += (s.hrT - s.hr) * Math.min(1, h / 1.5);
        const rsa = 2.5 * Math.sin(2 * Math.PI * respPhase(s.t, s));
        const hrInst = Math.max(30, s.hr + rsa);
        s.beatAcc += h * hrInst / 60;
        while (s.beatAcc >= 1){
          s.beatAcc -= 1;
          s.beats.push(s.t - s.beatAcc * (60 / hrInst));
          if (s.beats.length > 40) s.beats.shift();
        }
        /* SpO₂ dynamics */
        const tau = s.spo2Tgt < s.spO2 ? 8.5 : 3.2;
        s.spO2 += (s.spo2Tgt - s.spO2) * Math.min(1, h / tau);
        if (s.spO2 < 90 && !s.desatOn){ s.desatOn = true; s.desatT0 = s.t; s.nadirEv = s.spO2; }
        if (s.desatOn){
          s.nadirEv = Math.min(s.nadirEv, s.spO2);
          if (s.spO2 >= 91.5){ s.desatOn = false; s.evCount.desat++; api.evt("desat", "Desaturation → " + s.nadirEv.toFixed(0) + "%", Math.round(s.t - s.desatT0) + "s below 90% — pulse-transmitter lag applied"); }
        }
        /* stats */
        if (s.stage !== "W"){ s.tst += h; }
        s.spo2Sum += s.spO2 * h; s.spo2N += h; s.nadir = Math.min(s.nadir, s.spO2);
        const ep = Math.floor(s.t / 30);
        while (s.epochs.length < ep + 1) s.epochs.push({ t:s.epochs.length * 30, stage:s.stage });
      }
    }
    /* draw ~30 fps */
    if (ts - this.lastDraw > 33){ this.lastDraw = ts; this.draw(false); }
    if (ts - this.lastUI > 400){ this.lastUI = ts; this.updateUI(); }
  },

  draw(force){
    if (!this.mounted || !this.S) return;
    const s = this.S, w0 = this.CH.length ? this.CH[0].w : 600;
    if (!w0) return;
    const pxPerSec = w0 / this.WIN, t1 = s.t, t0 = t1 - this.WIN;
    /* lanes */
    this.CH.forEach(c => {
      const ctx = c.ctx, h = this.LANE_H, w = c.w;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(4,8,16,.66)"; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(120,170,230,.13)"; ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
      /* waveform */
      const stepT = 1 / (pxPerSec * 1.5);
      ctx.strokeStyle = c.c; ctx.lineWidth = 1.15; ctx.shadowColor = c.c; ctx.shadowBlur = 3.5;
      ctx.beginPath();
      let first = true;
      for (let tt = t0; tt <= t1; tt += stepT){
        const x = (tt - t0) * pxPerSec;
        const v = clamp(c.gen(tt, s) * c.g, -1, 1);
        const y = h / 2 - v * (h / 2 - 5);
        if (first){ ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.shadowBlur = 0;
    });
    /* overlay: time grid + event spans */
    const ov = this.ovCv.getContext("2d"), ow = this.ovCv.clientWidth || w0, oh = this.CH.length * this.LANE_H;
    ov.clearRect(0, 0, ow, oh);
    for (let g = Math.ceil(t0 / 5) * 5; g <= t1; g += 5){
      const x = (g - t0) * pxPerSec, isEp = g % 30 === 0;
      ov.strokeStyle = isEp ? "rgba(0,229,255,.22)" : "rgba(120,170,230,.08)";
      ov.beginPath(); ov.moveTo(x, 0); ov.lineTo(x, oh); ov.stroke();
      if (isEp){ ov.fillStyle = "rgba(0,229,255,.5)"; ov.font = "8px monospace"; ov.textAlign = "left"; ov.fillText("E" + Math.floor(g / 30), x + 3, 9); }
    }
    /* spans for active apnea/hypop + arousal + leg */
    const span = (a, b, color, label) => {
      const x1 = (a - t0) * pxPerSec, x2 = (b - t0) * pxPerSec;
      if (x2 < 0 || x1 > ow) return;
      ov.fillStyle = color; ov.fillRect(Math.max(0, x1), 0, Math.min(ow, x2) - Math.max(0, x1), oh);
      if (label){ ov.fillStyle = "#fff"; ov.font = "bold 8.5px monospace"; ov.textAlign = "center"; ov.fillText(label, (Math.max(0, x1) + Math.min(ow, x2)) / 2, oh - 6); }
    };
    if (s.apnea) span(s.apnea.t0, s.apnea.t0 + s.apnea.dur, "rgba(255,56,96,.13)", s.apnea.type === "ob" ? "APNEA" : "CENTRAL");
    if (s.arousal){ const u = (s.t - s.arousal.t0) / s.arousal.dur; if (u >= 0 && u <= 1) span(s.arousal.t0, s.arousal.t0 + s.arousal.dur, "rgba(61,255,176,.12)", "AROUSAL"); }
    if (s.leg) span(s.leg.t0, s.leg.t0 + s.leg.dur, "rgba(0,229,255,.12)", "PLM");
    /* now-line */
    ov.strokeStyle = "rgba(255,255,255,.35)"; ov.beginPath(); ov.moveTo(ow - 0.5, 0); ov.lineTo(ow - 0.5, oh); ov.stroke();
    this.drawHypno();
  },

  drawHypno(){
    const cv = this.hypCv; if (!cv) return;
    const ctx = cv.getContext("2d"), w = this.hw || cv.clientWidth || 600, h = 92;
    ctx.clearRect(0, 0, w, h);
    const rows = [["W", 14, "#ffb454"], ["R", 32, "#ff2d78"], ["N1", 50, "#00e5ff"], ["N2", 68, "#00ffc6"], ["N3", 86, "#b18cff"]];
    ctx.font = "9px monospace"; ctx.textAlign = "left";
    rows.forEach(r => { ctx.fillStyle = r[2]; ctx.fillText(r[0], 4, r[1] + 3); });
    const eps = this.S.epochs, win = 16 * 60 / 30; /* 16 minutes of epochs */
    const last = Math.max(eps.length, win);
    const X = i => 24 + (i - (last - win)) / win * (w - 34);
    const Y = st => { const r = rows.find(r => r[0] === st); return r ? r[1] : 50; };
    ctx.strokeStyle = "rgba(120,170,230,.12)";
    rows.forEach(r => { ctx.beginPath(); ctx.moveTo(24, r[1]); ctx.lineTo(w - 8, r[1]); ctx.stroke(); });
    if (eps.length > 1){
      ctx.lineWidth = 2;
      for (let i = Math.max(0, Math.floor(last - win)); i < eps.length - 1; i++){
        const a = eps[i], b = eps[i + 1];
        ctx.strokeStyle = (rows.find(r => r[0] === a.stage) || rows[2])[2];
        ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.moveTo(X(i), Y(a.stage)); ctx.lineTo(X(i + 1), Y(a.stage)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(X(i + 1), Y(a.stage)); ctx.lineTo(X(i + 1), Y(b.stage)); ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = "rgba(130,152,189,.9)"; ctx.font = "8.5px monospace"; ctx.textAlign = "right";
    ctx.fillText("HYPNOGRAM · LAST 16 MIN · TST " + (this.S.tst / 60).toFixed(1) + " min", w - 10, h - 4);
  },

  updateUI(){
    const s = this.S, r = this.root; if (!r || !s) return;
    const spo2 = $("#pvSpo2", r), hr = $("#pvHr", r), br = $("#pvBr", r), stg = $("#pvStage", r), ep = $("#pvEpoch", r), pos = $("#pvPos", r);
    if (spo2){ spo2.textContent = s.spO2.toFixed(0); spo2.style.color = s.spO2 >= 90 ? "var(--green)" : s.spO2 >= 85 ? "var(--amber)" : "var(--red)"; }
    if (hr) hr.textContent = Math.round(s.hr);
    if (br) br.textContent = Math.round(s.respRate);
    if (stg){ stg.textContent = s.stage; stg.className = "pvv stg" + s.stage.replace("N", "N"); stg.style.color = ({ W:"#ffb454", N1:"#00e5ff", N2:"#00ffc6", N3:"#b18cff", R:"#ff2d78" })[s.stage]; }
    if (ep) ep.textContent = "E" + Math.floor(s.t / 30);
    if (pos) pos.textContent = s.pap > 0 ? "CPAP " + s.pap : s.position;
    const beat = $("#pvBeat", r);
    if (beat){ const lastB = s.beats[s.beats.length - 1]; beat.style.opacity = (s.t - lastB < 0.12) ? "1" : "0"; }
    /* stats */
    const hours = Math.max(s.tst / 3600, 0.02);
    const rdi = (s.evCount.apnea + s.evCount.hypop + s.evCount.rera) / hours;
    const ai = s.evCount.arousal / hours, plmi = s.evCount.leg / hours;
    const meanSp = s.spo2N ? s.spo2Sum / s.spo2N : 0;
    const st = $("#psgStats", r);
    if (st) st.innerHTML = [
      [rdi < 5 ? "ok" : rdi < 15 ? "warn" : "bad", rdi.toFixed(1), "AHI/RDI /hr"],
      [ai < 15 ? "ok" : "warn", ai.toFixed(0), "AROUSAL IDX"],
      [plmi < 15 ? "ok" : "warn", plmi.toFixed(0), "PLMI /hr"],
      [s.nadir >= 90 ? "ok" : s.nadir >= 85 ? "warn" : "bad", s.nadir.toFixed(0), "SpO₂ NADIR %"],
      ["ok", meanSp.toFixed(0), "MEAN SpO₂ %"],
      [s.evCount.desat === 0 ? "ok" : "warn", s.evCount.desat, "DESATS <90%"],
    ].map(x => "<div class='ps'><b style='color:" + (x[0] === "ok" ? "var(--green)" : x[0] === "warn" ? "var(--amber)" : "var(--red)") + "'>" + x[1] + "</b><span>" + x[2] + "</span></div>").join("");
  },
};
</script>
