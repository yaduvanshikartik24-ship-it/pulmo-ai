<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-V · SYNAPSE CORE v5.0
   8-algorithm offline inference ensemble + VISION waveform-extraction engine
   100% local: rule induction · fuzzy grading · Bayesian differentials ·
   neural action lattice · DTW shape matching · autocorrelation · pixel CV
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

const SYNAPSE = {
  ver: "5.0",
  trail: [],
  reset(){ this.trail.length = 0; },
  pass(name, detail){ this.trail.push({ name, detail }); },

  /* ── 1 · logistic activation ─────────────────────────────────────────── */
  sig(z){ return 1 / (1 + Math.exp(-z)); },

  /* ── 2 · fuzzy logic: trapezoidal membership + soft severity grading ── */
  trap(x, a, b, c, d){
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x < b) return (x - a) / (b - a);
    return (d - x) / (d - c);
  },
  /* cuts: ascending boundary values; labels: cuts.length+1 labels */
  softGrade(x, cuts, labels){
    let idx = 0;
    for (let i = 0; i < cuts.length; i++) if (x >= cuts[i]) idx = i + 1;
    let near = null, mu = 0;
    for (let i = 0; i < cuts.length; i++){
      const m = this.trap(x, cuts[i] - Math.abs(cuts[i] * 0.18), cuts[i], cuts[i] + 0.001, cuts[i] + Math.abs(cuts[i] * 0.18));
      if (m > 0.05 && m > mu){ mu = m; near = labels[ x < cuts[i] ? i : i + 1 ]; }
    }
    return { label: labels[idx], idx, borderline: near && near !== labels[idx] ? near : null, mu: Math.round(mu * 100) / 100 };
  },

  /* ── 3 · Bayesian differential ranker (naive log-odds, LR-based) ─────── */
  bayes(table, feats){
    const out = [];
    for (const dx in table){
      const spec = table[dx];
      let lo = Math.log(spec.p / (1 - spec.p));
      const hits = [];
      for (const f in feats){
        const s = feats[f]; if (!s) continue;
        const lr = spec.ev[f];
        if (lr){ lo += s * Math.log(lr); hits.push(f); }
      }
      out.push({ dx, lo, hits, prior: spec.p });
    }
    const mx = Math.max.apply(null, out.map(o => o.lo));
    const ex = out.map(o => Math.exp(o.lo - mx));
    const S = ex.reduce((a, b) => a + b, 0);
    out.forEach((o, i) => o.pct = S > 0 ? ex[i] / S * 100 : 0);
    out.sort((a, b) => b.pct - a.pct);
    out.forEach(o => o.pct = Math.round(o.pct * 10) / 10);
    return out;
  },

  /* ── 4 · neural action lattice (hand-weighted, sigmoid outputs) ──────── */
  net(spec, active){
    const scores = {};
    spec.outs.forEach(o => {
      let z = (spec.bias && spec.bias[o]) || 0;
      const drivers = [];
      spec.feats.forEach(f => {
        const s = active[f] || 0; if (s <= 0) return;
        const w = (spec.W[f] && spec.W[f][o]) || 0;
        if (w) { z += w * s; drivers.push({ f, w, s }); }
      });
      scores[o] = { p: this.sig(z), z, drivers };
    });
    return scores;
  },

  /* ── 5 · dynamic time warping (Sakoe-Chiba constrained) ──────────────── */
  dtw(a, b, win){
    const n = a.length, m = b.length, w = Math.max(win | 0, Math.abs(n - m));
    const INF = 1e12;
    let prev = new Array(m + 1).fill(INF), cur = new Array(m + 1).fill(INF);
    prev[0] = 0;
    for (let i = 1; i <= n; i++){
      cur = new Array(m + 1).fill(INF);
      const lo = Math.max(1, i - w), hi = Math.min(m, i + w);
      for (let j = lo; j <= hi; j++){
        const c = Math.abs(a[i - 1] - b[j - 1]);
        cur[j] = c + Math.min(prev[j], cur[j - 1], prev[j - 1]);
      }
      prev = cur;
    }
    return prev[m] / (n + m);
  },

  /* ── 6 · autocorrelation periodicity detection ───────────────────────── */
  period(v){
    const n = v.length;
    const mean = v.reduce((a, b) => a + b, 0) / n;
    let sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n);
    if (sd < 1e-6) return { px: 0, r: 0 };
    const z = v.map(x => (x - mean) / sd);
    let best = 0, bestR = 0;
    const minL = Math.max(8, Math.floor(n / 16)), maxL = Math.floor(n / 2.2);
    const rs = [];
    for (let lag = minL; lag <= maxL; lag++){
      let s = 0;
      for (let i = 0; i < n - lag; i++) s += z[i] * z[i + lag];
      const r = s / (n - lag);
      rs.push([lag, r]);
      if (r > bestR){ bestR = r; best = lag; }
    }
    if (bestR < 0.28 || !best) return { px: 0, r: bestR };
    /* parabolic refinement */
    const idx = rs.findIndex(p => p[0] === best);
    if (idx > 0 && idx < rs.length - 1){
      const y0 = rs[idx - 1][1], y1 = rs[idx][1], y2 = rs[idx + 1][1];
      const den = (y0 - 2 * y1 + y2);
      if (Math.abs(den) > 1e-9){
        const shift = 0.5 * (y0 - y2) / den;
        if (Math.abs(shift) <= 1) best = best + shift;
      }
    }
    return { px: best, r: bestR };
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   VISION — offline computer-vision pipeline for ventilator-screen photos.
   Color segmentation → column-centroid trace extraction → gap filling →
   shape classification (heuristics + DTW vs canonical templates) →
   autocorrelation periodicity (RR) → calibration to physical units.
   Nothing leaves the device; no OCR of numerals is attempted — numeric
   settings are transcribed by the clinician into the structured form.
   ═══════════════════════════════════════════════════════════════════════════ */
const VISION = {
  W: 0, H: 0, iData: null,
  cv: null, ctx: null, ovl: null, octx: null,
  traces: [],       /* detected trace colors: {rgb, hex, n} */
  results: [],      /* per-trace analysis results */
  cal: { peep: 5, pip: 25, vt: 450, tw: 12 },  /* calibration: known values + time window (s) */

  init(cvId, ovlId){
    this.cv = document.getElementById(cvId);
    this.ovl = document.getElementById(ovlId);
    if (this.cv){ this.ctx = this.cv.getContext("2d", { willReadFrequently: true }); }
    if (this.ovl){ this.octx = this.ovl.getContext("2d"); }
  },

  ingestImage(im){
    const maxW = 960;
    const iw = im.naturalWidth || im.width || 0;
    const ih = im.naturalHeight || im.height || 0;
    const sc = Math.min(1, maxW / (iw || maxW));
    this.W = Math.max(200, Math.round(iw * sc) || 300);
    this.H = Math.max(120, Math.round(ih * sc) || 160);
    [this.cv, this.ovl].forEach(c => { if (c){ c.width = this.W; c.height = this.H; } });
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.ctx.drawImage(im, 0, 0, this.W, this.H);
    this.iData = this.ctx.getImageData(0, 0, this.W, this.H);
    this.traces = []; this.results = [];
    this.octx && this.octx.clearRect(0, 0, this.W, this.H);
  },
  loadFile(file, cb){
    const r = new FileReader();
    r.onload = e => {
      const im = new Image();
      im.onload = () => { this.ingestImage(im); if (cb) cb(); };
      im.src = e.target.result;
    };
    r.readAsDataURL(file);
  },

  pixel(x, y){
    const i = (y * this.W + x) * 4, d = this.iData.data;
    return [d[i], d[i + 1], d[i + 2]];
  },

  /* ── trace-color discovery (saturated-color clustering) ──────────────── */
  detectColors(){
    if (!this.iData) return [];
    const bins = new Map();
    const d = this.iData.data, W = this.W, H = this.H;
    for (let y = 0; y < H; y += 2){
      for (let x = 0; x < W; x += 2){
        const i = (y * W + x) * 4;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        const val = mx / 255, sat = mx > 0 ? (mx - mn) / mx : 0;
        if (val < 0.32 || sat < 0.34) continue;                 /* skip bg, grid, gray, white text */
        if (r > 235 && g > 235 && b > 235) continue;            /* skip near-white */
        const key = ((r >> 5) << 10) | ((g >> 5) << 5) | (b >> 5);
        const e = bins.get(key) || { n: 0, r: 0, g: 0, b: 0 };
        e.n++; e.r += r; e.g += g; e.b += b;
        bins.set(key, e);
      }
    }
    const clusters = [];
    [...bins.values()].sort((a, b) => b.n - a.n).forEach(e => {
      const c = { rgb: [Math.round(e.r / e.n), Math.round(e.g / e.n), Math.round(e.b / e.n)], n: e.n * 4 };
      for (const cl of clusters){
        const dd = Math.hypot(cl.rgb[0] - c.rgb[0], cl.rgb[1] - c.rgb[1], cl.rgb[2] - c.rgb[2]);
        if (dd < 52){ cl.n += c.n; return; }
      }
      clusters.push(c);
    });
    const minN = Math.max(140, Math.round(W * H / 1400));
    this.traces = clusters.filter(c => c.n >= minN).slice(0, 6).map(c => ({
      rgb: c.rgb, n: c.n, hex: "rgb(" + c.rgb.join(",") + ")",
    }));
    return this.traces;
  },

  addTraceAt(px, py){
    if (!this.iData) return null;
    const rgb = this.pixel(Math.round(clamp(px, 0, this.W - 1)), Math.round(clamp(py, 0, this.H - 1)));
    const mx = Math.max(rgb[0], rgb[1], rgb[2]), mn = Math.min(rgb[0], rgb[1], rgb[2]);
    const sat = mx > 0 ? (mx - mn) / mx : 0;
    if (mx / 255 < 0.32 || sat < 0.3){ toast("Sample a colored waveform pixel (not background/text)"); return null; }
    for (const t of this.traces){
      if (Math.hypot(t.rgb[0] - rgb[0], t.rgb[1] - rgb[1], t.rgb[2] - rgb[2]) < 40) return t;
    }
    const t = { rgb, n: 0, hex: "rgb(" + rgb.join(",") + ")", manual: true };
    this.traces.push(t);
    return t;
  },

  /* ── column-centroid extraction with tolerance weighting ─────────────── */
  extract(rgb, tol){
    tol = tol || 54;
    const W = this.W, H = this.H;
    const ys = new Array(W).fill(NaN), qs = new Array(W).fill(0);
    const R = rgb[0], G = rgb[1], B = rgb[2];
    for (let x = 0; x < W; x++){
      let wsum = 0, wy = 0;
      for (let y = 0; y < H; y++){
        const p = this.pixel(x, y);
        const dd = Math.hypot(p[0] - R, p[1] - G, p[2] - B);
        if (dd < tol){ const w = 1 - dd / tol; wsum += w; wy += y * w; }
      }
      if (wsum > 1.1){ ys[x] = wy / wsum; qs[x] = wsum; }
    }
    let cov = 0; for (let i = 0; i < W; i++) if (qs[i] > 0) cov++;
    return { ys, qs, cov: cov / W };
  },

  /* ── gap-fill + smoothing + normalization (y inverted → value 0..1) ──── */
  clean(ys){
    const n = ys.length, out = ys.slice();
    let i = 0;
    while (i < n){
      if (isNaN(out[i])){
        let j = i; while (j < n && isNaN(out[j])) j++;
        if (i > 0 && j < n && (j - i) <= 16){
          const a = out[i - 1], b = out[j];
          for (let k = i; k < j; k++) out[k] = a + (b - a) * (k - i + 1) / (j - i + 1);
        }
        i = j;
      } else i++;
    }
    /* trim to valid span */
    let s = 0, e = n - 1;
    while (s < n && isNaN(out[s])) s++;
    while (e > s && isNaN(out[e])) e--;
    if (e - s < n * 0.25) return null;
    let seg = out.slice(s, e + 1);
    /* 3-tap smoothing ×2 */
    for (let pass = 0; pass < 2; pass++){
      const sm = seg.slice();
      for (let k = 1; k < seg.length - 1; k++) sm[k] = (seg[k - 1] + 2 * seg[k] + seg[k + 1]) / 4;
      seg = sm;
    }
    const sorted = seg.slice().sort((a, b) => a - b);
    const p4 = sorted[Math.floor(sorted.length * 0.04)], p96 = sorted[Math.floor(sorted.length * 0.96)];
    const span = p96 - p4;
    if (span < 2) return null;
    return { v: seg.map(y => clamp((p96 - y) / span, 0, 1)), off: s };
  },

  /* ── canonical shape templates (single normalized cycle, 96 pts) ─────── */
  templates(){
    const N = 96, raw = { pressure: [], flow: [], volume: [] };
    for (let i = 0; i < N; i++){
      const ph = i / N;
      /* pressure: ramp → plateau → decay back to an ELEVATED baseline (PEEP) */
      raw.pressure.push(ph < 0.22 ? 0.2 + 0.8 * (ph / 0.22)
                 : ph < 0.55 ? 1
                 : 0.2 + 0.8 * Math.exp(-(ph - 0.55) / 0.45 * 4));
      /* flow: constant VCV inspiratory flow, then exponential recovery from -PEF toward the zero line */
      raw.flow.push(ph < 0.33 ? 1 : 0.45 * (1 - Math.exp(-(ph - 0.33) / 0.67 * 3.8)));
      /* volume: ramp up, exponential emptying to baseline ≈ 0 (FRC) */
      raw.volume.push(ph < 0.35 ? ph / 0.35 : Math.exp(-(ph - 0.35) / 0.65 * 5));
    }
    /* min-max normalize each template to 0..1 — same scale as cleaned traces */
    const t = {};
    for (const k in raw){
      const mn = Math.min.apply(null, raw[k]), mx = Math.max.apply(null, raw[k]);
      const sp = (mx - mn) || 1;
      t[k] = raw[k].map(x => (x - mn) / sp);
    }
    return t;
  },
  resample(arr, n){
    const out = [];
    for (let i = 0; i < n; i++) out.push(arr[Math.floor(i * (arr.length - 1) / (n - 1))]);
    return out;
  },
  /* ── cycle averaging: fold the trace onto its average cycle ──────────── */
  avgCycle(v){
    const per = SYNAPSE.period(v);
    let seg = v, cyc = 0, n = 1;
    if (per.px > 8){
      cyc = Math.round(per.px);
      n = Math.floor(v.length / cyc);
      if (n >= 2 && cyc >= 24){
        const out = [];
        for (let q = 0; q < cyc; q++){
          let s = 0, c2 = 0;
          for (let k = 0; k < n; k++){ const val = v[k * cyc + q]; if (val != null){ s += val; c2++; } }
          out.push(c2 ? s / c2 : (v[q] || 0));
        }
        seg = out;
      } else { cyc = 0; n = 1; }
    }
    return { v: seg, cyc, n };
  },
  /* per-cycle heuristic features (v normalized 0..1 within the trace) */
  shapeFeatures(v){
    const n = v.length;
    const sorted = v.slice().sort((a, b) => a - b);
    const minV = sorted[Math.floor(n * 0.05)];
    let cross = 0, above = 0, plate = 0, jumps = 0, drops = 0, gradual = 0;
    for (let i = 0; i < n; i++){
      if (i > 0 && v[i - 1] < 0.5 && v[i] >= 0.5) cross++;
      if (i > 0){
        const d = v[i] - v[i - 1];
        if (d > 0.03 && d < 0.25) gradual++;      /* visible ramp slope: pressure-ramp signature */
        if (d > 0.2) jumps++;
        if (-d > 0.3) drops++;
      }
      if (v[i] > 0.5) above++;
      if (v[i] > 0.78) plate++;
    }
    return { minV: Math.round(minV * 100) / 100, crossCount: cross, aboveFrac: Math.round(above / n * 100) / 100,
      plateFrac: Math.round(plate / n * 100) / 100, jumps, drops, gradualRise: gradual };
  },
  classify(avgV){
    const f = this.shapeFeatures(avgV);
    /* DTW distances on the average cycle — rotation-invariant (4 quarter-turns) */
    const s = this.resample(avgV, 96), tpl = this.templates();
    const rots = [0, 24, 48, 72];
    const dist = { pressure: 1e9, flow: 1e9, volume: 1e9 };
    for (const k in dist){
      for (const r of rots){
        const sr = r ? s.slice(r).concat(s.slice(0, r)) : s;
        const d = SYNAPSE.dtw(sr, tpl[k], 20);
        if (d < dist[k]) dist[k] = d;
      }
    }
    let dtwType = "pressure", dmin = 1e9;
    for (const k in dist) if (dist[k] < dmin){ dmin = dist[k]; dtwType = k; }
    let heur, heurConf;
    /* 1 — elevated baseline: pressure NEVER returns to zero (PEEP floor) */
    if (f.minV > 0.2){ heur = "pressure"; heurConf = 0.9; }
    /* 2 — visible ramp into the plateau: the pressure-rise signature */
    else if (f.gradualRise >= 6){ heur = "pressure"; heurConf = 0.85; }
    /* 3 — biphasic around the zero line: flow vs volume — DTW arbitrates */
    else if (f.aboveFrac > 0.14 && f.aboveFrac < 0.88 && f.crossCount >= 1 && f.minV < 0.45){
      heur = dist.flow < dist.volume ? "flow" : "volume"; heurConf = Math.abs(dist.flow - dist.volume) < 0.04 ? 0.72 : 0.85;
    }
    /* 4 — sawtooth: rises then collapses to baseline: volume */
    else if (f.drops >= 1 && f.plateFrac < 0.3){ heur = "volume"; heurConf = 0.8; }
    /* 5 — plateau dominant: pressure */
    else if (f.plateFrac > 0.16 || f.aboveFrac > 0.6){ heur = "pressure"; heurConf = 0.82; }
    else { heur = "pressure"; heurConf = 0.5; }
    let type = heur, conf;
    if (heur === dtwType){ conf = Math.min(0.97, heurConf + 0.07); }
    else if (dist[heur] - dmin < 0.05){ type = dtwType; conf = 0.62; }
    else { type = heur; conf = Math.max(0.45, heurConf - 0.18); }
    return { type, conf: Math.round(conf * 100) / 100, features: f, dtw: dist };
  },

  /* ── master analysis over all detected traces ─────────────────────────── */
  analyze(){
    this.results = [];
    if (!this.iData) return this.results;
    if (!this.traces.length) this.detectColors();
    for (const tr of this.traces.slice(0, 5)){
      const ex = this.extract(tr.rgb, 54);
      if (ex.cov < 0.32) { tr.skip = "coverage " + Math.round(ex.cov * 100) + "%"; continue; }
      const cl = this.clean(ex.ys);
      if (!cl){ tr.skip = "low amplitude"; continue; }
      const avg = this.avgCycle(cl.v);
      const cls = this.classify(avg.v);
      const per = SYNAPSE.period(cl.v);
      const r = {
        rgb: tr.rgb, hex: tr.hex, cov: ex.cov, v: cl.v, ys: ex.ys, off: cl.off,
        type: cls.type, conf: cls.conf, features: cls.features,
        periodPx: per.px, periodicity: Math.round(per.r * 100) / 100,
        rr: null, ie: null, pip: null, peep: null, vtEst: null, autoPeepSign: false,
      };
      /* respiratory rate from periodicity × time-window calibration */
      if (per.px > 4){
        const period_s = per.px / this.W * this.cal.tw;
        if (period_s > 0.8 && period_s < 30) r.rr = Math.round(60 / period_s);
      }
      if (r.type === "pressure"){
        const s = r.v.slice().sort((a, b) => a - b);
        const hi = s[Math.floor(s.length * 0.97)], lo = s[Math.floor(s.length * 0.05)];
        r.pipN = hi; r.peepN = lo;
        r.pip = Math.round(this.cal.peep + hi * (this.cal.pip - this.cal.peep));
        r.peep = Math.round(this.cal.peep + lo * (this.cal.pip - this.cal.peep));
      }
      if (r.type === "flow" && per.px > 4){
        /* inspiration = fraction of cycle above midline */
        const cyc = Math.round(per.px); let insp = 0, tot = 0, endExp = 0, nEnd = 0;
        for (let k = 0; k < r.v.length - cyc; k += cyc){
          for (let q = 0; q < cyc && k + q < r.v.length; q++){
            tot++;
            if (r.v[k + q] > 0.5) insp++;
          }
          endExp += r.v[k + Math.round(cyc * 0.96)] || 0; nEnd++;
        }
        const inspFrac = tot ? insp / tot : 0.33;
        if (inspFrac > 0.12 && inspFrac < 0.75){
          const e = (1 - inspFrac) / inspFrac;
          r.ie = "1:" + (Math.round(e * 10) / 10);
        }
        r.endExpFlow = nEnd ? endExp / nEnd : 0;
        r.autoPeepSign = (0.5 - (r.endExpFlow || 0)) > 0.12;   /* residual expiratory flow still below the zero line at end-expiration */
      }
      if (r.type === "volume"){
        const s = r.v.slice().sort((a, b) => a - b);
        const hi = s[Math.floor(s.length * 0.97)], lo = s[Math.floor(s.length * 0.05)];
        r.vtN = hi - lo;
        r.vtEst = Math.round(this.cal.vt * r.vtN);
      }
      r.quality = Math.round(clamp(0.55 * ex.cov + 0.25 * cls.conf + 0.2 * clamp(per.r, 0, 1), 0, 1) * 100);
      this.results.push(r);
      tr.skip = null;
    }
    this.overlay();
    return this.results;
  },

  overlay(){
    if (!this.octx) return;
    const o = this.octx;
    o.clearRect(0, 0, this.W, this.H);
    this.results.forEach((r, idx) => {
      o.save();
      o.strokeStyle = r.hex; o.lineWidth = 1.6; o.shadowColor = r.hex; o.shadowBlur = 6;
      o.beginPath();
      let started = false;
      for (let x = 0; x < this.W; x++){
        const y = r.ys[x];
        if (isNaN(y)){ started = false; continue; }
        if (!started){ o.moveTo(x, y); started = true; } else o.lineTo(x, y);
      }
      o.stroke();
      o.shadowBlur = 0; o.font = "700 11px monospace";
      o.fillStyle = r.hex;
      const lbl = (r.type || "?").toUpperCase() + (r.rr ? " · RR≈" + r.rr : "");
      o.fillText(lbl, 10 + (idx % 2) * 150, 18 + idx * 16);
      o.restore();
    });
  },

  /* ── synthetic demo ventilator screen (for pipeline testing/demo) ─────── */
  demo(){
    const c = document.createElement("canvas");
    c.width = 900; c.height = 470;
    const x = c.getContext("2d");
    x.fillStyle = "#050a13"; x.fillRect(0, 0, 900, 470);
    x.strokeStyle = "rgba(120,170,230,.08)"; x.lineWidth = 1;
    for (let gx = 0; gx < 900; gx += 45){ x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, 470); x.stroke(); }
    for (let gy = 0; gy < 470; gy += 45){ x.beginPath(); x.moveTo(0, gy); x.lineTo(900, gy); x.stroke(); }
    const cols = ["#ffd94d", "#43ff9e", "#55c8ff"], names = ["PAW  cmH₂O", "FLOW  L/min", "VOL  mL"];
    const stats = ["PIP 25 / PEEP 5", "PEF 60 L/min", "VT 450 mL · RR 20"];
    const TW = 12, RR = 20, P = 60 / RR, IE = 2;         /* 12-s window, RR 20, I:E 1:2 */
    cols.forEach((col, ci) => {
      const top = 14 + ci * 152, h = 128, mid = top + h / 2;
      x.strokeStyle = "rgba(140,190,255,.16)";
      x.beginPath(); x.moveTo(0, mid); x.lineTo(900, mid); x.stroke();
      x.fillStyle = "rgba(230,240,255,.85)"; x.font = "600 11px monospace";
      x.fillText(names[ci], 10, top + 4);
      x.fillStyle = "rgba(230,240,255,.5)"; x.font = "10px monospace";
      x.fillText(stats[ci], 740, top + 4);
      x.strokeStyle = col; x.lineWidth = 2.4; x.shadowBlur = 0;
      x.beginPath();
      for (let px = 0; px < 900; px++){
        const t = px / 900 * TW, ph = (t % P) / P, insp = ph < 1 / (1 + IE) ? ph * (1 + IE) : null;
        let v;
        if (ci === 0){       /* pressure: ramp-plateau-decay */
          v = insp != null ? (insp < 0.25 ? 0.2 + 0.8 * (insp / 0.25) : 1) : 0.2 + 0.8 * Math.exp(-(ph - 1 / (1 + IE)) * (1 + IE) * 4.5);
        } else if (ci === 1){ /* flow: constant VCV insp + exponential expiratory decay */
          v = insp != null ? 1 : -Math.exp(-(ph - 1 / (1 + IE)) * (1 + IE) * 3.8);
        } else {              /* volume: ramp up, exponential emptying */
          v = insp != null ? insp : Math.exp(-(ph - 1 / (1 + IE)) * (1 + IE) * 4.2);
        }
        const noise = (Math.sin(px * 12.9898 + ci * 78.233) * 43758.5453 % 1) * 0.012 - 0.006;
        const amp = ci === 1 ? h * 0.34 : h * 0.38;
        const yy = mid - (v + noise) * amp;
        if (px === 0) x.moveTo(px, yy); else x.lineTo(px, yy);
      }
      x.stroke(); x.shadowBlur = 0;
    });
    x.fillStyle = "rgba(0,229,255,.65)"; x.font = "700 13px monospace";
    x.fillText("VENTILATOR · VCV · AC", 700, 460);
    this.ingestImage(c);
    return true;
  },
};
</script>
