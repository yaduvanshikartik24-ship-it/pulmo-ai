<script>
/* ═══════════════════════════════════════════════════════════════════════════
   WAVEFORM LAB — live sweep simulator · loops · asynchrony · capno · PV tool
   Physics from bundled VAI.sim.generateWaveforms (equation of motion)
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";
const SIM = V.sim;
const WS = Object.assign({}, SIM.DEFAULT_SETTINGS);          // lab settings
const DASHW = { mode: "VCV", pathology: "normal" };          // dashboard mini
let waveData = null, dashData = null, waveT0 = performance.now();

function regen() { waveData = SIM.generateWaveforms(WS); updateWaveRO(); }
function dashRegen() { dashData = SIM.generateWaveforms(Object.assign({}, SIM.DEFAULT_SETTINGS, { mode: DASHW.mode, pathology: DASHW.pathology })); }

/* ── control deck (contextual per mode) ────────────────────────────────── */
const PATHO_LABEL = { normal: "Normal lungs", ards: "ARDS (stiff)", copd: "COPD (obstructed)", asthma: "Asthma (severe)" };
const DECK_DEFS = {
  VCV: [["rr", "Rate", 6, 40, 1], ["peep", "PEEP", 0, 20, 1], ["vt", "VT mL", 200, 700, 10], ["peakFlow", "Insp flow L/min", 20, 100, 5], ["pause", "Pause s", 0, 1, 0.05]],
  PCV: [["rr", "Rate", 6, 40, 1], ["peep", "PEEP", 0, 20, 1], ["pip", "ΔP above PEEP", 8, 30, 1], ["ti", "Ti s", 0.4, 2.5, 0.05], ["riseTime", "Rise time s", 0.02, 0.4, 0.02]],
  PSV: [["rr", "Spont rate", 8, 40, 1], ["peep", "PEEP", 0, 20, 1], ["pip", "PS level", 5, 25, 1], ["cyclePct", "Cycle at % peak flow", 5, 60, 5], ["riseTime", "Rise time s", 0.02, 0.4, 0.02]],
  SIMV: [["rr", "Total rate", 8, 30, 1], ["simvRate", "Mandatory rate", 1, 12, 1], ["peep", "PEEP", 0, 20, 1], ["vt", "VT mL", 200, 700, 10], ["peakFlow", "Insp flow L/min", 20, 100, 5], ["ps", "PS for spont", 0, 20, 1]],
  APRV: [["pHigh", "P-high", 10, 35, 1], ["pLow", "P-low", 0, 10, 1], ["tHigh", "T-high s", 2, 8, 0.5], ["tLow", "T-low s", 0.3, 1.5, 0.1]],
  CPAP: [["rr", "Spont rate", 8, 30, 1], ["peep", "CPAP level", 3, 15, 1]],
};
const MODE_FOR_SIM = { VCV: "vc-ac", PCV: "pc-ac", PSV: "psv", SIMV: "simv", APRV: "aprv", CPAP: "cpap" };
function buildDeck() {
  const defs = DECK_DEFS[WS.mode] || [];
  let html = defs.map(d => fR("dk_" + d[0], d[1], d[2], d[3], d[4], WS[d[0]], "")).join("");
  if (WS.mode === "VCV" || WS.mode === "SIMV") html += fS("dk_pat", "Flow pattern", [["square", "SQUARE"], ["decel", "DECELERATING"], ["sine", "SINE"]], WS.flowPattern);
  html += `<div style="margin-top:6px">${fS("dk_patho", "Lung model", Object.keys(PATHO_LABEL).map(k => [k, k.toUpperCase()]), WS.pathology)}</div>`;
  html += `<div class="ai-block info" id="dkPathoNote" style="margin-top:12px"></div>
    <button class="btn ghost sm" id="dkInfo" style="margin-top:10px"><span data-ic="book"></span>Mode dossier</button>`;
  $("#waveDeck").innerHTML = html;
  hydrateIcons($("#waveDeck"));
  const pnote = SIM.PATHOLOGY_PRESETS[WS.pathology];
  $("#dkPathoNote").innerHTML = `<b>${PATHO_LABEL[WS.pathology]}</b><div class="small muted" style="margin-top:3px">${pnote.note}</div>`;
  defs.forEach(d => { const r = $("#dk_" + d[0]); r.addEventListener("input", () => { WS[d[0]] = parseFloat(r.value); $("#dk_" + d[0] + "v").textContent = r.value; regen(); }); });
  if ($("#dk_pat")) segWire($("#waveDeck"), () => {
    const fp = segVal("dk_pat"); if (fp) { WS.flowPattern = fp; }
    const ph = segVal("dk_patho"); if (ph) { WS.pathology = ph; const pn = SIM.PATHOLOGY_PRESETS[ph]; $("#dkPathoNote").innerHTML = `<b>${PATHO_LABEL[ph]}</b><div class="small muted" style="margin-top:3px">${pn.note}</div>`; }
    regen();
  });
  else segWire($("#waveDeck"), () => { const ph = segVal("dk_patho"); if (ph) { WS.pathology = ph; const pn = SIM.PATHOLOGY_PRESETS[ph]; $("#dkPathoNote").innerHTML = `<b>${PATHO_LABEL[ph]}</b><div class="small muted" style="margin-top:3px">${pn.note}</div>`; } regen(); });
  $("#dkInfo").addEventListener("click", () => showMode(MODE_FOR_SIM[WS.mode]));
  $("#deckModeChip").textContent = WS.mode + " · " + WS.pathology.toUpperCase();
}
function updateWaveRO() {
  if (!waveData) return;
  const d = waveData;
  $("#waveRO").innerHTML = `
    <span class="ro">PIP <b>${f1(d.pip)}</b></span>
    <span class="ro">Pplat <b>${f1(d.pplat)}</b></span>
    <span class="ro">VT <b>${f0(d.vtDelivered)}</b></span>
    <span class="ro">I:E <b>${d.ie}</b></span>
    <span class="ro ${d.autoPeep > 3 ? "warn" : ""}">autoPEEP <b>${f1(d.autoPeep)}</b></span>
    <span class="ro ${d.expIncomplete ? "bad" : ""}">${d.expIncomplete ? "EXP INCOMPLETE" : "EXP COMPLETE"}</span>`;
}

/* ── scalar sweep rendering ────────────────────────────────────────────── */
const lastW = {};
function cvAuto(cv, h) {
  const w = cv.clientWidth || cv.parentElement.clientWidth || 300;
  if (lastW[cv.id] !== w) { lastW[cv.id] = w; const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + "px"; }
  const ctx = cv.getContext("2d"); const dpr = Math.min(devicePixelRatio || 1, 2);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}
function drawScalar(cv, data, key, win, tNow, color, unit, mult) {
  mult = mult || 1;
  const { ctx, w, h } = cvAuto(cv, cv.id === "dashWave" ? 150 : 120);
  ctx.clearRect(0, 0, w, h);
  const s = data.samples; if (!s.length) return;
  const dt = data.totalT / (s.length - 1);
  const padL = 4, padR = 46, padT = 20, padB = 8;
  let lo = Infinity, hi = -Infinity;
  s.forEach(x => { if (x[key] < lo) lo = x[key]; if (x[key] > hi) hi = x[key]; });
  if (key === "flow") { const m = Math.max(Math.abs(lo), Math.abs(hi)) * 1.15 || 1; lo = -m; hi = m; }
  else { const pad = (hi - lo) * 0.18 + 1; lo -= pad; hi += pad; }
  if (key === "vol") lo = Math.min(0, lo);
  const X = t => padL + ((t - (tNow - win)) / win) * (w - padL - padR);
  const Y = v => h - padB - (v - lo) / (hi - lo) * (h - padT - padB);
  /* grid */
  ctx.strokeStyle = "rgba(120,170,230,.09)"; ctx.lineWidth = 1;
  for (let gy = padT; gy <= h - padB; gy += 22) { ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(w - padR, gy); ctx.stroke(); }
  /* zero / peep line */
  const zy = key === "vol" ? Y(0) : Y(key === "paw" ? data.peep : 0);
  ctx.strokeStyle = "rgba(0,229,255,.28)"; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(padL, zy); ctx.lineTo(w - padR, zy); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "rgba(130,152,189,.9)"; ctx.font = "8.5px monospace"; ctx.textAlign = "left";
  ctx.fillText(key === "paw" ? "PEEP " + data.peep : key === "flow" ? "0" : "0", w - padR + 4, zy + 3);
  ctx.fillText((hi > 99 ? f0(hi) : f1(hi)) + "", w - padR + 4, padT + 8);
  /* breath labels */
  ctx.textAlign = "center";
  (data.breathLabels || []).forEach(b => {
    let t = b.t; if (t > tNow || t < tNow - win) return;
    ctx.fillStyle = "rgba(0,229,255,.55)"; ctx.font = "8px monospace";
    ctx.fillText(b.label, X(t), padT - 8);
    ctx.strokeStyle = "rgba(0,229,255,.2)"; ctx.beginPath(); ctx.moveTo(X(t), padT - 5); ctx.lineTo(X(t), h - padB); ctx.stroke();
  });
  /* trace */
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.shadowColor = color; ctx.shadowBlur = 7;
  ctx.beginPath();
  let started = false;
  for (let x = padL; x <= w - padR; x += 1) {
    let tt = tNow - win + ((x - padL) / (w - padL - padR)) * win;
    tt = ((tt % data.totalT) + data.totalT) % data.totalT;
    const v = s[clamp(Math.round(tt / dt), 0, s.length - 1)][key];
    const px = x, py = Y(v);
    if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
  }
  ctx.stroke(); ctx.shadowBlur = 0;
  /* sweep cursor */
  ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(w - padR, padT - 2); ctx.lineTo(w - padR, h - padB); ctx.stroke();
  /* live value */
  const nowV = s[clamp(Math.round((tNow % data.totalT) / dt), 0, s.length - 1)][key];
  const ro = $("#ro" + (key === "paw" ? "Paw" : key === "flow" ? "Flow" : "Vol"));
  if (ro) ro.textContent = (Math.abs(nowV * mult) > 99 ? f0(nowV * mult) : f1(nowV * mult)) + " " + unit;
  return { nowSample: s[clamp(Math.round((tNow % data.totalT) / dt), 0, s.length - 1)] };
}
function drawLoop(cv, pts, xk, yk, color, cur, xLabel, yLabel) {
  const { ctx, w, h } = cvAuto(cv, 190);
  ctx.clearRect(0, 0, w, h);
  if (!pts || pts.length < 3) return;
  const pad = 30;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  pts.forEach(p => { x0 = Math.min(x0, p[xk]); x1 = Math.max(x1, p[xk]); y0 = Math.min(y0, p[yk]); y1 = Math.max(y1, p[yk]); });
  if (x1 - x0 < 1) x1 = x0 + 1; if (y1 - y0 < 1) y1 = y0 + 1;
  const X = v => pad + (v - x0) / (x1 - x0) * (w - 2 * pad);
  const Y = v => h - pad - (v - y0) / (y1 - y0) * (h - 2 * pad);
  ctx.strokeStyle = "rgba(120,170,230,.12)";
  ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad); ctx.lineTo(w - pad, h - pad); ctx.stroke();
  ctx.fillStyle = "rgba(130,152,189,.85)"; ctx.font = "8.5px monospace";
  ctx.textAlign = "right"; ctx.fillText(xLabel + " →", w - pad, h - pad + 12);
  ctx.save(); ctx.translate(10, pad + 30); ctx.rotate(-Math.PI / 2); ctx.textAlign = "right"; ctx.fillText(yLabel + " →", 0, 0); ctx.restore();
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.shadowColor = color; ctx.shadowBlur = 8;
  ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(X(p[xk]), Y(p[yk])) : ctx.moveTo(X(p[xk]), Y(p[yk])));
  ctx.stroke(); ctx.shadowBlur = 0;
  if (cur) { ctx.fillStyle = "#fff"; ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(X(cur[xk]), Y(cur[yk]), 4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
}

/* ── animation loop ────────────────────────────────────────────────────── */
function waveLoop(ts) {
  const t = (ts - waveT0) / 1000;
  const activeView = document.querySelector("section.view.active");
  const isWave = activeView && activeView.id === "view-wave";
  const isCmd = activeView && activeView.id === "view-cmd";
  if (isWave && waveData) {
    const win = Math.min(waveData.totalT, 12);
    const tNow = t % waveData.totalT;
    const r1 = drawScalar($("#waveP"), waveData, "paw", win, tNow, "#00e5ff", "");
    drawScalar($("#waveF"), waveData, "flow", win, tNow, "#00ffc6", "L/min", 60);
    drawScalar($("#waveV"), waveData, "vol", win, tNow, "#b18cff", "mL");
    if (r1) {
      const ns = r1.nowSample;
      drawLoop($("#loopPV"), waveData.pvLoop, "p", "v", "#ff2d78", { p: ns.paw, v: ns.vol }, "P", "V");
      drawLoop($("#loopFV"), waveData.fvLoop, "v", "f", "#ffb454", { v: ns.vol, f: ns.flow * 60 }, "V", "F");
    }
  }
  if (isCmd && dashData) {
    const win = Math.min(dashData.totalT, 10);
    drawScalar($("#dashWave"), dashData, "paw", win, t % dashData.totalT, "#00e5ff", "");
  }
  requestAnimationFrame(waveLoop);
}

/* ── asynchrony atlas (stylized Paw schematics) ────────────────────────── */
function stylized(cv, fn) {
  const { ctx, w, h } = cvAuto(cv, 130); ctx.clearRect(0, 0, w, h);
  const X = x => x * w, Y = y => h - 12 - y * (h - 26);
  ctx.strokeStyle = "rgba(120,170,230,.1)";
  for (let gy = 0; gy <= 4; gy++) { ctx.beginPath(); ctx.moveTo(0, Y(gy / 4)); ctx.lineTo(w, Y(gy / 4)); ctx.stroke(); }
  fn(ctx, X, Y, w, h);
}
const breathUp = (ctx, X, Y, x0, wd, base, top, opts) => {
  const o = opts || {};
  ctx.beginPath(); ctx.moveTo(X(x0), Y(base));
  let x = x0;
  const rise = o.slowRise ? wd * 0.18 : wd * 0.06;
  if (o.scooped) ctx.quadraticCurveTo(X(x + wd * 0.10), Y(base + (top - base) * 0.25), X(x + rise), Y(top));
  else ctx.lineTo(X(x + rise), Y(top));
  x += rise;
  if (o.spikeEnd) { ctx.lineTo(X(x + wd * 0.62), Y(top)); ctx.lineTo(X(x + wd * 0.70), Y(top + 0.12)); ctx.lineTo(X(x + wd * 0.76), Y(top)); }
  else if (o.ripple) { for (let i = 0; i < 8; i++) ctx.lineTo(X(x + wd * 0.08 * (i + 1)), Y(top - 0.05 + 0.05 * Math.sin(i * 2.2))); }
  else if (o.rounded) { for (let i = 0; i <= 10; i++) { const tt = i / 10; ctx.lineTo(X(x + wd * 0.66 * tt), Y(top - 0.10 * Math.sin(Math.PI * tt))); } }
  else ctx.lineTo(X(x + wd * 0.66), Y(top));
  x += wd * 0.66;
  ctx.lineTo(X(x + wd * 0.06), Y(base)); ctx.lineTo(X(x0 + wd), Y(base));
  ctx.stroke();
};
const dip = (ctx, X, Y, x, base, amp, wd) => { ctx.beginPath(); ctx.moveTo(X(x - wd / 2), Y(base)); ctx.quadraticCurveTo(X(x), Y(base - amp), X(x + wd / 2), Y(base)); ctx.stroke(); };
const ASYNC_DRAW = {
  "ineffective-trigger": (ctx, X, Y) => { ctx.strokeStyle = "#00e5ff"; ctx.lineWidth = 2;
    breathUp(ctx, X, Y, 0.02, 0.28, 0.18, 0.62); breathUp(ctx, X, Y, 0.36, 0.28, 0.18, 0.62);
    ctx.strokeStyle = "#ff2d78"; ctx.lineWidth = 2.4;
    dip(ctx, X, Y, 0.28, 0.18, 0.10, 0.05); dip(ctx, X, Y, 0.33, 0.18, 0.08, 0.04); dip(ctx, X, Y, 0.72, 0.18, 0.10, 0.05); },
  "double-trigger": (ctx, X, Y) => { ctx.strokeStyle = "#00e5ff"; ctx.lineWidth = 2;
    breathUp(ctx, X, Y, 0.02, 0.20, 0.18, 0.50); breathUp(ctx, X, Y, 0.20, 0.20, 0.18, 0.86);
    breathUp(ctx, X, Y, 0.55, 0.20, 0.18, 0.50); breathUp(ctx, X, Y, 0.73, 0.20, 0.18, 0.86); },
  "auto-trigger": (ctx, X, Y) => { ctx.strokeStyle = "#00e5ff"; ctx.lineWidth = 2;
    [0.02, 0.20, 0.38, 0.56, 0.74].forEach(x => breathUp(ctx, X, Y, x, 0.16, 0.18, 0.55, { rounded: true })); },
  "reverse-trigger": (ctx, X, Y) => { ctx.strokeStyle = "#00e5ff"; ctx.lineWidth = 2;
    [0.05, 0.40, 0.75].forEach(x => breathUp(ctx, X, Y, x, 0.28, 0.18, 0.66, { ripple: true })); },
  "flow-asynchrony": (ctx, X, Y) => { ctx.strokeStyle = "#00e5ff"; ctx.lineWidth = 2;
    breathUp(ctx, X, Y, 0.02, 0.30, 0.18, 0.55, { scooped: true });
    ctx.strokeStyle = "#ffb454"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4;
    breathUp(ctx, X, Y, 0.40, 0.30, 0.18, 0.55, { scooped: true }); ctx.setLineDash([]); },
  "cycle-asyn-delayed": (ctx, X, Y) => { ctx.strokeStyle = "#00e5ff"; ctx.lineWidth = 2;
    breathUp(ctx, X, Y, 0.05, 0.34, 0.18, 0.55, { spikeEnd: true });
    breathUp(ctx, X, Y, 0.50, 0.34, 0.18, 0.55, { spikeEnd: true }); },
  "cycle-asyn-premature": (ctx, X, Y) => { ctx.strokeStyle = "#00e5ff"; ctx.lineWidth = 2;
    breathUp(ctx, X, Y, 0.05, 0.30, 0.18, 0.60); breathUp(ctx, X, Y, 0.50, 0.30, 0.18, 0.60);
    ctx.strokeStyle = "#ff2d78"; ctx.lineWidth = 2.4;
    dip(ctx, X, Y, 0.40, 0.18, 0.09, 0.05); dip(ctx, X, Y, 0.85, 0.18, 0.09, 0.05); },
  "rise-time": (ctx, X, Y) => { ctx.strokeStyle = "#00e5ff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(X(0.03), Y(0.18)); ctx.lineTo(X(0.07), Y(0.80)); ctx.lineTo(X(0.09), Y(0.58)); ctx.lineTo(X(0.28), Y(0.58)); ctx.lineTo(X(0.33), Y(0.18)); ctx.stroke();
    ctx.strokeStyle = "#ffb454";
    ctx.beginPath(); ctx.moveTo(X(0.40), Y(0.18)); ctx.quadraticCurveTo(X(0.55), Y(0.20), X(0.62), Y(0.52)); ctx.lineTo(X(0.78), Y(0.52)); ctx.lineTo(X(0.83), Y(0.18)); ctx.stroke(); },
};
function buildAsyncAtlas() {
  $("#asyncAtlas").innerHTML = SIM.ASYNCHRONY_PATTERNS.map((p, i) => `
    <div class="atlas"><canvas id="as-${i}" height="130"></canvas>
      <div class="an">${esc(p.name)}</div><div class="ad">${esc(p.description)}</div>
      <div class="ad" style="color:var(--txt)"><b class="cy">RECOGNIZE ▸</b> ${esc(p.recognition)}</div>
      <div class="aa"><b>ACTION ▸</b> ${esc(p.action)}</div></div>`).join("");
  SIM.ASYNCHRONY_PATTERNS.forEach((p, i) => stylized($("#as-" + i), ASYNC_DRAW[p.id] || (() => {})));
  regRedraw("wave", () => SIM.ASYNCHRONY_PATTERNS.forEach((p, i) => stylized($("#as-" + i), ASYNC_DRAW[p.id] || (() => {}))));
}

/* ── capnography atlas ─────────────────────────────────────────────────── */
function drawCapno(cv, style) {
  const { ctx, w, h } = cvAuto(cv, 130); ctx.clearRect(0, 0, w, h);
  const X = x => x * w, Y = y => h - 14 - y * (h - 30);
  ctx.strokeStyle = "rgba(120,170,230,.1)";
  for (let gy = 0; gy <= 3; gy++) { ctx.beginPath(); ctx.moveTo(0, Y(gy / 3)); ctx.lineTo(w, Y(gy / 3)); ctx.stroke(); }
  const n = 3, W = 1 / n;
  ctx.strokeStyle = style.color || "#00ffc6"; ctx.lineWidth = 2; ctx.shadowColor = style.color || "#00ffc6"; ctx.shadowBlur = 5;
  ctx.beginPath(); ctx.moveTo(X(0), Y(style.baseline0 || 0));
  for (let c = 0; c < n; c++) {
    const x0 = c * W, base = (style.baseline0 || 0) + (style.baselineRise || 0) * c;
    const top = base + (style.amp || 0.78) - (style.dropAt != null && c >= style.dropAt ? 0.45 : 0) + (style.climb || 0) * c;
    const upX0 = x0 + W * 0.22, upW = W * (style.slowUp ? 0.26 : 0.07);
    ctx.lineTo(X(upX0), Y(base));
    if (style.slowUp) { for (let i = 0; i <= 8; i++) { const t = i / 8; ctx.lineTo(X(upX0 + upW * t), Y(base + (top - base) * Math.pow(t, 0.6))); } }
    else ctx.lineTo(X(upX0 + upW), Y(top));
    let px = upX0 + upW;
    const platW = W * 0.55;
    for (let i = 0; i <= 14; i++) {
      const t = i / 14; let y = top + (style.plateauSlope || 0.03) * t;
      if (style.cleft && t > 0.3 && t < 0.45) y -= 0.14 * Math.sin(Math.PI * (t - 0.3) / 0.15);
      if (style.ripple) y += 0.035 * Math.sin(t * 26 + c);
      ctx.lineTo(X(px + platW * t), Y(y));
    }
    px += platW;
    ctx.lineTo(X(px + W * 0.06), Y(base));
    ctx.lineTo(X(x0 + W * 0.98), Y(base));
  }
  ctx.stroke(); ctx.shadowBlur = 0;
  if (style.flat) { ctx.strokeStyle = "#ff3860"; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(X(style.flat), Y(0.02)); ctx.quadraticCurveTo(X(style.flat + 0.08), Y(0.10), X(style.flat + 0.14), Y(0.03)); ctx.lineTo(X(1), Y(0.01)); ctx.stroke(); ctx.setLineDash([]); }
}
const CAPNO_STYLE = {
  normal: {}, obstructive: { slowUp: true, plateauSlope: 0.16 },
  cleft: { cleft: true }, rebreathing: { baseline0: 0.10, baselineRise: 0.09, plateauSlope: 0.08 },
  embolism: { dropAt: 1 }, cardiac: { ripple: true },
  esophageal: { amp: 0.18, slowUp: true, plateauSlope: -0.25, flat: 0.55 },
  hypercapnic: { climb: 0.08, plateauSlope: 0.06 },
};
function buildCapnoAtlas() {
  $("#capnoAtlas").innerHTML = VAI_CAPNO.map((c, i) => `
    <div class="atlas"><canvas id="cp-${i}" height="130"></canvas>
      <div class="an">${esc(c.n)}</div><div class="ad">${esc(c.d)}</div>
      <div class="aa"><b>PEARL ▸</b> ${esc(c.a)}</div></div>`).join("");
  VAI_CAPNO.forEach((c, i) => drawCapno($("#cp-" + i), CAPNO_STYLE[c.id] || {}));
  regRedraw("wave", () => VAI_CAPNO.forEach((c, i) => drawCapno($("#cp-" + i), CAPNO_STYLE[c.id] || {})));
}

/* ── P–V curve explorer ────────────────────────────────────────────────── */
function pvInterp(curve, x) {
  for (let i = 1; i < curve.length; i++) {
    if (curve[i][0] >= x) { const a = curve[i - 1], b = curve[i];
      return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } }
  return curve[curve.length - 1][1];
}
function buildPvTool() {
  const upd = () => {
    const peep = +$("#pvPeep").value, dp = +$("#pvDp").value;
    $("#pvPeepv").textContent = peep + " cmH₂O";
    $("#pvDpv").textContent = dp + " cmH₂O";
    const P = VAI_PV_CURVE;
    const vPeep = pvInterp(P.ards, peep), vTop = pvInterp(P.ards, peep + dp);
    const vt = Math.max(vTop - vPeep, 0);
    const overUip = peep + dp > P.uip, underLip = peep < P.lip - 1;
    const status = overUip ? "danger" : underLip ? "caution" : "ok";
    const verdict = overLipSafe();
    function overLipSafe() {
      if (overUip) return `Window crosses the UPPER inflection point (${P.uip} cmH₂O) — the curve is flattening: each extra cmH₂O stresses overdistended alveoli. Reduce ΔP toward 12 or lower PEEP after re-recruiting.`;
      if (underLip) return `End-expiratory pressure sits below the lower inflection point (~${P.lip} cmH₂O) — tidal collapse-reopening (atelectrauma) is likely. Consider more PEEP (recruitability permitting) and reassess ΔP.`;
      return `Window sits inside the linear safe zone (LIP ${P.lip} → UIP ${P.uip} cmH₂O). On this ARDS curve the setting delivers ~${Math.round(vt)} mL — about ${Math.round(vt / 6)} mL/kg for a 60 kg PBW patient.`;
    }
    $("#pvVerdict").className = "res " + status;
    $("#pvVerdict").innerHTML = `<div class="rh"><span class="rl">TIDAL WINDOW VERDICT</span>
      <span class="rv" style="font-size:14px">${status === "ok" ? "SAFE ZONE" : overUip ? "OVERDISTENSION" : "ATELECTRAUMA"}</span></div>
      <div class="ri">${verdict}</div>`;
    const rect = [[peep, 0], [peep, vTop], [peep + dp, vTop], [peep + dp, 0], [peep, 0]];
    plot($("#pvCurve"), { h: 340, xr: [0, 40], yr: [0, 2000],
      bands: [{ x0: P.lip, x1: P.uip, color: "rgba(61,255,176,.05)", label: "LINEAR SAFE ZONE" }],
      series: [
        { pts: P.normal, color: C.gr, w: 1.5, dash: [6, 4], glow: false },
        { pts: P.ards, color: C.cy, w: 2.5 },
        { pts: rect, color: overUip ? C.rd : underLip ? C.am : C.mg, w: 2.5, dash: [3, 3] }],
      vlines: [{ x: P.lip, color: C.am, label: "LIP" }, { x: P.uip, color: C.rd, label: "UIP" }, { x: peep, color: C.mg, label: "PEEP" }],
      xLabel: "pressure cmH₂O", yLabel: "volume mL",
      legend: [{ color: C.cy, label: "ARDS" }, { color: C.gr, label: "normal" }, { color: C.mg, label: "tidal window" }] });
  };
  ["pvPeep", "pvDp"].forEach(id => $("#" + id).addEventListener("input", upd));
  regRedraw("wave", upd); upd();
}

/* WaveLab public API */
const WaveLab = {
  setMode(m) { WS.mode = m; buildDeck(); regen(); },
  init() { buildDeck(); regen(); buildAsyncAtlas(); buildCapnoAtlas(); buildPvTool(); requestAnimationFrame(waveLoop); },
};
</script>
