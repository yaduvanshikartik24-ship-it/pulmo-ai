<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-IV — STATISTICAL ENGINE
   plot2 (linear/LOG axes · CI bands · annotations) · ROC · forest (95% CI) ·
   z-score bars · Bland–Altman · hypnogram atlas — plus the PSG datasets
   (reference population, group statistics, EEG spectra, desat kinetics,
   ROC panels, overnight trends, hypnogram templates, difference matrices).
   Illustrative literature-composite data for education.
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";
const fmtN = v => { const a = Math.abs(v); return a >= 100 ? v.toFixed(0) : a >= 10 ? v.toFixed(1) : a >= 1 ? v.toFixed(1) : v.toFixed(2); };

/* ── plot2: general chart with optional LOG axes ───────────────────────── */
function plot2(cv, cfg){
  const { ctx, w, h } = cvSetup(cv, cfg.h);
  ctx.clearRect(0, 0, w, h);
  const padL = cfg.padL || 48, padR = 16, padT = 22, padB = 30;
  const all = [];
  (cfg.series || []).forEach(s => s.pts.forEach(p => all.push(p)));
  (cfg.points || []).forEach(p => all.push([p.x, p.y]));
  (cfg.areas || []).forEach(a => { a.top.forEach(p => all.push(p)); a.bot.forEach(p => all.push(p)); });
  if (!all.length){ ctx.fillStyle = C.txt2; ctx.font = "11px monospace"; ctx.textAlign = "center"; ctx.fillText("no data", w / 2, h / 2); return; }
  let xr = cfg.xr || [Infinity, -Infinity], yr = cfg.yr || [Infinity, -Infinity];
  if (!cfg.xr){ all.forEach(p => { xr[0] = Math.min(xr[0], p[0]); xr[1] = Math.max(xr[1], p[0]); }); const p2 = (xr[1] - xr[0]) * .04; xr[0] -= p2; xr[1] += p2; }
  if (!cfg.yr){ all.forEach(p => { yr[0] = Math.min(yr[0], p[1]); yr[1] = Math.max(yr[1], p[1]); }); yr[0] = Math.min(0, yr[0]); yr[1] += (yr[1] - yr[0]) * .07 + 1e-9; }
  if (xr[0] === xr[1]) xr = [xr[0] - 1, xr[1] + 1];
  if (yr[0] === yr[1]) yr = [yr[0] - 1, yr[1] + 1];
  if (cfg.logY) yr[0] = Math.max(yr[0], Math.min(...all.filter(p => p[1] > 0).map(p => p[1]), 1) * .5);
  if (cfg.logX) xr[0] = Math.max(xr[0], Math.min(...all.filter(p => p[0] > 0).map(p => p[0]), 1) * .5);
  const LX = cfg.logX, LY = cfg.logY;
  const tx = x => LX ? Math.log10(Math.max(x, 1e-12)) : x, ty = y => LY ? Math.log10(Math.max(y, 1e-12)) : y;
  const X = x => padL + (tx(x) - tx(xr[0])) / (tx(xr[1]) - tx(xr[0])) * (w - padL - padR);
  const Y = y => h - padB - (ty(y) - ty(yr[0])) / (ty(yr[1]) - ty(yr[0])) * (h - padT - padB);
  /* title */
  if (cfg.title){ ctx.fillStyle = C.cy; ctx.font = "bold 10px monospace"; ctx.textAlign = "left"; ctx.fillText(cfg.title, padL, 11); }
  /* x/y zone bands */
  (cfg.bands || []).forEach(b => {
    if (b.y0 !== undefined){ ctx.fillStyle = b.color; ctx.fillRect(padL, Y(b.y1), w - padL - padR, Y(b.y0) - Y(b.y1)); }
    else { ctx.fillStyle = b.color; ctx.fillRect(X(b.x0), padT, X(b.x1) - X(b.x0), h - padT - padB); }
    if (b.label){ ctx.fillStyle = b.txt || "rgba(130,152,189,.9)"; ctx.font = "8.5px monospace";
      ctx.textAlign = b.y0 !== undefined ? "right" : "center";
      if (b.y0 !== undefined) ctx.fillText(b.label, w - padR - 3, Y(b.y1) + 10);
      else ctx.fillText(b.label, (X(b.x0) + X(b.x1)) / 2, padT + 10); }
  });
  /* grid + ticks */
  const grid = (vals, mapV, isX, logMode) => {
    ctx.font = "8.5px monospace";
    vals.forEach(v => {
      ctx.strokeStyle = C.grid; ctx.beginPath();
      if (isX){ ctx.moveTo(X(v), padT); ctx.lineTo(X(v), h - padB); } else { ctx.moveTo(padL, Y(v)); ctx.lineTo(w - padR, Y(v)); }
      ctx.stroke();
      ctx.fillStyle = C.txt2;
      if (isX){ ctx.textAlign = "center"; ctx.fillText(fmtN(v), X(v), h - padB + 12); }
      else { ctx.textAlign = "right"; ctx.fillText(fmtN(v), padL - 5, Y(v) + 3); }
    });
  };
  if (LX || LY){
    const logTicks = (r0, r1) => { const t = [];
      for (let d = Math.floor(Math.log10(r0)); d <= Math.ceil(Math.log10(r1)); d++){
        if (Math.pow(10, d) >= r0 && Math.pow(10, d) <= r1) t.push(Math.pow(10, d));
        if (Math.log10(r1) - Math.log10(r0) <= 2.2){
          [2, 5].forEach(m => { const v = m * Math.pow(10, d); if (v >= r0 && v <= r1) t.push(v); }); } }
      return t; };
    if (LX) grid(logTicks(xr[0], xr[1]), 0, true, true); else grid(xTicks(xr), 0, true);
    if (LY) grid(logTicks(yr[0], yr[1]), 0, false, true); else grid(yTicks(yr), 0, false);
  } else { grid(xTicks(xr), 0, true); grid(yTicks(yr), 0, false); }
  ctx.strokeStyle = C.axis;
  ctx.beginPath(); ctx.moveTo(padL, padT - 4); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke();
  /* hlines / vlines */
  (cfg.hlines || []).forEach(l => { ctx.save(); ctx.setLineDash(l.dash || [5, 4]); ctx.strokeStyle = l.color || C.am;
    ctx.beginPath(); ctx.moveTo(padL, Y(l.y)); ctx.lineTo(w - padR, Y(l.y)); ctx.stroke(); ctx.restore();
    if (l.label){ ctx.fillStyle = l.color || C.am; ctx.font = "bold 9px monospace"; ctx.textAlign = "left"; ctx.fillText(l.label, padL + 4, Y(l.y) - 4); } });
  (cfg.vlines || []).forEach(l => { ctx.save(); ctx.setLineDash(l.dash || [5, 4]); ctx.strokeStyle = l.color || C.cy;
    ctx.beginPath(); ctx.moveTo(X(l.x), padT); ctx.lineTo(X(l.x), h - padB); ctx.stroke(); ctx.restore();
    if (l.label){ ctx.fillStyle = l.color || C.cy; ctx.font = "bold 9px monospace"; ctx.textAlign = "left"; ctx.fillText(l.label, X(l.x) + 4, padT + 10); } });
  /* CI band areas */
  (cfg.areas || []).forEach(a => {
    if (!a.top.length) return;
    ctx.beginPath();
    a.top.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])));
    for (let i = a.bot.length - 1; i >= 0; i--) ctx.lineTo(X(a.bot[i][0]), Y(a.bot[i][1]));
    ctx.closePath(); ctx.fillStyle = a.color; ctx.fill();
    if (a.edge){ ctx.strokeStyle = a.edge; ctx.lineWidth = 1; ctx.beginPath();
      a.top.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))); ctx.stroke(); }
  });
  /* series */
  (cfg.series || []).forEach(s => {
    if (!s.pts.length) return;
    ctx.save(); ctx.lineWidth = s.w || 2; ctx.strokeStyle = s.color || C.cy;
    ctx.shadowColor = s.color || C.cy; ctx.shadowBlur = s.glow === false ? 0 : 5;
    if (s.dash) ctx.setLineDash(s.dash);
    ctx.beginPath();
    s.pts.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])));
    ctx.stroke();
    if (s.dots) s.pts.forEach(p => { ctx.fillStyle = s.color || C.cy; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 3, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  });
  /* scatter points */
  (cfg.points || []).forEach(p => {
    ctx.save(); ctx.fillStyle = p.color || C.mg; ctx.shadowColor = p.color || C.mg; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.size || 3.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (p.label){ ctx.fillStyle = p.color || C.mg; ctx.font = "bold 9px monospace"; ctx.textAlign = "left"; ctx.fillText(p.label, X(p.x) + 6, Y(p.y) - 5); }
  });
  /* annotations */
  (cfg.annots || []).forEach(a => {
    ctx.fillStyle = a.color || C.txt; ctx.font = (a.bold ? "bold " : "") + "9px monospace";
    ctx.textAlign = a.align || "center";
    ctx.fillText(a.text, X(a.x), a.dy !== undefined ? Y(a.y) + a.dy : Y(a.y) - 8);
  });
  /* axis labels */
  ctx.fillStyle = C.txt; ctx.font = "9px monospace";
  if (cfg.xLabel){ ctx.textAlign = "right"; ctx.fillText(cfg.xLabel + (LX ? " (LOG)" : ""), w - padR, h - 6); }
  if (cfg.yLabel){ ctx.textAlign = "left"; ctx.fillText(cfg.yLabel + (LY ? " (LOG)" : ""), 4, padT - 9); }
  /* legend */
  if (cfg.legend && cfg.legend.length){
    ctx.font = "9px monospace"; let lx = padL + 4;
    cfg.legend.forEach(l => {
      ctx.strokeStyle = l.color; ctx.lineWidth = 3;
      if (l.dash) ctx.setLineDash(l.dash); else ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(lx, 8); ctx.lineTo(lx + 10, 8); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = l.color; ctx.fillText(l.label, lx + 14, 11);
      lx += 16 + ctx.measureText(l.label).width + 12;
    });
  }
  return { X, Y, padL, padT, padB, w, h };
}
function xTicks(r){ const s = niceStep(r[1] - r[0], 6), t = [];
  for (let v = Math.ceil(r[0] / s) * s; v <= r[1] + 1e-9; v += s) t.push(v); return t; }
function yTicks(r){ const s = niceStep(r[1] - r[0], 4), t = [];
  for (let v = Math.ceil(r[0] / s) * s; v <= r[1] + 1e-9; v += s) t.push(v); return t; }

/* ── ROC curve chart ───────────────────────────────────────────────────── */
function rocChart(cv, curves, opts){
  opts = opts || {};
  const { ctx, w, h } = cvSetup(cv, opts.h || 300);
  ctx.clearRect(0, 0, w, h);
  const padL = 44, padR = 12, padT = 22, padB = 30;
  const X = v => padL + v * (w - padL - padR), Y = v => h - padB - v * (h - padT - padB);
  if (opts.title){ ctx.fillStyle = C.cy; ctx.font = "bold 10px monospace"; ctx.textAlign = "left"; ctx.fillText(opts.title, padL, 11); }
  ctx.strokeStyle = C.grid;
  for (let g = 0; g <= 4; g++){ const v = g / 4;
    ctx.beginPath(); ctx.moveTo(X(v), padT); ctx.lineTo(X(v), h - padB); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, Y(v)); ctx.lineTo(w - padR, Y(v)); ctx.stroke();
    ctx.fillStyle = C.txt2; ctx.font = "8.5px monospace";
    ctx.textAlign = "center"; ctx.fillText(fmtN(v), X(v), h - padB + 12);
    ctx.textAlign = "right"; ctx.fillText(fmtN(v), padL - 5, Y(v) + 3); }
  /* chance line */
  ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = "rgba(130,152,189,.5)";
  ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(1), Y(1)); ctx.stroke(); ctx.restore();
  ctx.fillStyle = "rgba(130,152,189,.8)"; ctx.font = "8.5px monospace"; ctx.textAlign = "left";
  ctx.fillText("chance (AUC 0.50)", X(0.55) + 4, Y(0.42));
  /* curves */
  const aucs = [];
  curves.forEach(c => {
    const pts = [[0, 0], ...c.pts.map(p => [p[0], p[1]]).sort((a, b) => a[0] - b[0]), [1, 1]];
    let auc = 0;
    for (let i = 1; i < pts.length; i++) auc += (pts[i][0] - pts[i - 1][0]) * (pts[i][1] + pts[i - 1][1]) / 2;
    aucs.push({ c, auc });
    ctx.save(); ctx.strokeStyle = c.color; ctx.lineWidth = 2.2; ctx.shadowColor = c.color; ctx.shadowBlur = 6;
    ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))); ctx.stroke(); ctx.restore();
    c.pts.forEach(p => {
      ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e8fbff"; ctx.font = "8px monospace"; ctx.textAlign = "left";
      ctx.fillText(p[2] || "", X(p[0]) + 5, Y(p[1]) + 9);
    });
  });
  /* AUC legend box */
  const bx = w - Math.min(190, w - padL - 20), by = padT + 6, bw = Math.min(184, w - padL - padR - 8);
  ctx.fillStyle = "rgba(4,9,18,.88)"; ctx.strokeStyle = "rgba(120,170,230,.3)";
  ctx.beginPath(); ctx.roundRect(bx, by, bw, 14 * aucs.length + 14, 8); ctx.fill(); ctx.stroke();
  ctx.font = "9px monospace"; ctx.textAlign = "left";
  aucs.forEach((a, i) => {
    const yy = by + 14 + i * 14;
    ctx.strokeStyle = a.c.color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(bx + 8, yy - 4); ctx.lineTo(bx + 20, yy - 4); ctx.stroke();
    ctx.fillStyle = C.txt; ctx.fillText(a.c.label, bx + 25, yy);
    ctx.fillStyle = a.c.color; ctx.textAlign = "right"; ctx.fillText("AUC " + a.auc.toFixed(2), bx + bw - 8, yy);
    ctx.textAlign = "left";
  });
  ctx.fillStyle = C.txt; ctx.font = "9px monospace"; ctx.textAlign = "right";
  ctx.fillText("1 − specificity", w - padR, h - 6);
  ctx.textAlign = "left"; ctx.fillText("sensitivity", 4, padT - 8);
}

/* ── forest chart (95% CI per row, clinical zones) ─────────────────────── */
function forestChart(cv, rows, opts){
  opts = opts || {};
  const rowH = opts.rowH || 52, headH = 30;
  const H = headH + rows.length * rowH + 8;
  const { ctx, w } = cvSetup(cv, H);
  ctx.clearRect(0, 0, w, H);
  const gut = opts.gut || 122, padR = 14, padT = headH + 8, padB = 6;
  if (opts.title){ ctx.fillStyle = C.cy; ctx.font = "bold 10px monospace"; ctx.textAlign = "left"; ctx.fillText(opts.title, gut, 12); }
  /* group legend */
  if (opts.legend){ ctx.font = "9px monospace"; let lx = gut;
    opts.legend.forEach(l => { ctx.strokeStyle = l.color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(lx, 24); ctx.lineTo(lx + 10, 24); ctx.stroke();
      ctx.fillStyle = l.color; ctx.textAlign = "left"; ctx.fillText(l.label, lx + 14, 27);
      lx += 16 + ctx.measureText(l.label).width + 14; }); }
  rows.forEach((row, ri) => {
    const yTop = padT + ri * rowH, yMid = yTop + rowH / 2 - 4;
    ctx.fillStyle = ri % 2 ? "rgba(8,14,28,.5)" : "rgba(10,18,34,.35)";
    ctx.fillRect(0, yTop - 2, w, rowH - 4);
    ctx.fillStyle = C.txt; ctx.font = "9.5px monospace"; ctx.textAlign = "left";
    ctx.fillText(row.label, 8, yMid + 3);
    ctx.fillStyle = C.txt2; ctx.font = "8px monospace"; ctx.fillText(row.unit, 8, yMid + 14);
    const x0 = gut, x1 = w - padR;
    const lo = row.min, hi = row.max;
    const X = v => x0 + (v - lo) / (hi - lo) * (x1 - x0);
    (row.zones || []).forEach(z => {
      ctx.fillStyle = z.color; ctx.fillRect(X(Math.max(lo, z.from)), yTop + 4, X(Math.min(hi, z.to)) - X(Math.max(lo, z.from)), rowH - 14);
      if (z.label && X(z.to) - X(z.from) > 26){ ctx.fillStyle = "rgba(232,251,255,.75)"; ctx.font = "7.5px monospace"; ctx.textAlign = "center";
        ctx.fillText(z.label, (X(Math.max(lo, z.from)) + X(Math.min(hi, z.to))) / 2, yTop + rowH - 6); }
    });
    ctx.strokeStyle = "rgba(140,190,255,.3)";
    ctx.beginPath(); ctx.moveTo(x0, yTop + 4); ctx.lineTo(x0, yTop + rowH - 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, yTop + 4); ctx.lineTo(x1, yTop + rowH - 10); ctx.stroke();
    (row.groups || []).forEach((g, gi) => {
      const gy = yMid - ((row.groups.length - 1) * 7) + gi * 14;
      ctx.strokeStyle = g.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(g.lo), gy); ctx.lineTo(X(g.hi), gy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(g.lo), gy - 4); ctx.lineTo(X(g.lo), gy + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(g.hi), gy - 4); ctx.lineTo(X(g.hi), gy + 4); ctx.stroke();
      ctx.save(); ctx.fillStyle = g.color; ctx.shadowColor = g.color; ctx.shadowBlur = 7;
      ctx.beginPath(); ctx.arc(X(g.mean), gy, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.fillStyle = g.color; ctx.font = "8px monospace"; ctx.textAlign = "left";
      ctx.fillText(fmtN(g.mean), X(g.hi) + 6, gy + 3);
    });
  });
}

/* ── z-score bar chart ─────────────────────────────────────────────────── */
function zbarChart(cv, cfg){
  const rows = cfg.rows || [];
  const maxG = Math.max(1, ...rows.map(r => (r.groups || []).length));
  const rowH = Math.max(30, 16 + maxG * 13);
  const H = 26 + rows.length * rowH + 10;
  const { ctx, w } = cvSetup(cv, H);
  ctx.clearRect(0, 0, w, H);
  const gut = 118, padR = 40, plotR = w - padR;
  const zMax = cfg.zMax || 4;
  const X = z => gut + (plotR - gut) / 2 * (1 + z / zMax);
  if (cfg.title){ ctx.fillStyle = C.cy; ctx.font = "bold 10px monospace"; ctx.textAlign = "left"; ctx.fillText(cfg.title, gut, 11); }
  /* severity bands */
  [[-4, -3, "rgba(255,56,96,.10)"], [-3, -2, "rgba(255,180,84,.08)"], [-2, -1, "rgba(61,255,176,.06)"], [-1, 1, "rgba(61,255,176,.10)"], [1, 2, "rgba(61,255,176,.06)"], [2, 3, "rgba(255,180,84,.08)"], [3, 4, "rgba(255,56,96,.10)"]].forEach(b => {
    ctx.fillStyle = b[2];
    const x0 = X(Math.max(-zMax, b[0])), x1 = X(Math.min(zMax, b[1]));
    ctx.fillRect(x0, 18, x1 - x0, H - 18 - 14);
  });
  ctx.strokeStyle = "rgba(140,190,255,.35)";
  ctx.beginPath(); ctx.moveTo(X(0), 16); ctx.lineTo(X(0), H - 16); ctx.stroke();
  [-4, -3, -2, -1, 0, 1, 2, 3, 4].forEach(z => {
    if (Math.abs(z) > zMax) return;
    ctx.fillStyle = C.txt2; ctx.font = "8px monospace"; ctx.textAlign = "center";
    ctx.fillText((z > 0 ? "+" : "") + z, X(z), H - 6);
    ctx.strokeStyle = "rgba(120,170,230,.12)";
    ctx.beginPath(); ctx.moveTo(X(z), 18); ctx.lineTo(X(z), H - 14); ctx.stroke();
  });
  rows.forEach((row, ri) => {
    const yTop = 22 + ri * rowH;
    ctx.fillStyle = C.txt; ctx.font = "9px monospace"; ctx.textAlign = "left";
    ctx.fillText(row.label, 6, yTop + rowH / 2 + 2);
    ctx.fillStyle = C.txt2; ctx.font = "7.5px monospace"; ctx.fillText("μ " + fmtN(row.ref.mean) + " ± " + fmtN(row.ref.sd), 6, yTop + rowH / 2 + 12);
    (row.groups || []).forEach((g, gi) => {
      const gy = yTop + 8 + gi * 13;
      const z = (g.val - row.ref.mean) / row.ref.sd;
      const col = Math.abs(z) < 1 ? C.gr : Math.abs(z) < 2 ? C.tl : Math.abs(z) < 3 ? C.am : C.rd;
      const bx0 = clamp(Math.min(X(0), X(z)), gut, plotR), bx1 = clamp(Math.max(X(0), X(z)), gut, plotR);
      ctx.fillStyle = col; ctx.globalAlpha = .82;
      ctx.beginPath(); ctx.roundRect(bx0, gy - 3, Math.max(bx1 - bx0, 2.5), 7.5, 3); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.font = "8px monospace";
      const lab = (z >= 0 ? "z +" : "z −") + Math.abs(z).toFixed(1) + " (" + fmtN(g.val) + (row.unit ? " " + row.unit : "") + ")";
      const zx = clamp(X(z), gut + 2, plotR - 2);
      const goRight = z >= 0;
      ctx.textAlign = goRight ? "left" : "right";
      const lx2 = goRight ? Math.min(zx + 5, plotR - 66) : Math.max(zx - 5, gut + 66);
      ctx.fillText(lab, lx2, gy + 4);
    });
  });
}

/* ── Bland–Altman chart ────────────────────────────────────────────────── */
function baChart(cv, cfg){
  const { ctx, w, h } = cvSetup(cv, cfg.h || 300);
  ctx.clearRect(0, 0, w, h);
  const padL = 46, padR = 14, padT = 22, padB = 30;
  const xs = cfg.pts.map(p => p[0]), ys = cfg.pts.map(p => p[1]);
  const xr = [Math.min(0, ...xs) - 2, Math.max(...xs) + 2];
  const yr = [Math.min(...ys, cfg.loa[0]) - 2, Math.max(...ys, cfg.loa[1]) + 2];
  const X = v => padL + (v - xr[0]) / (xr[1] - xr[0]) * (w - padL - padR);
  const Y = v => h - padB - (v - yr[0]) / (yr[1] - yr[0]) * (h - padT - padB);
  if (cfg.title){ ctx.fillStyle = C.cy; ctx.font = "bold 10px monospace"; ctx.textAlign = "left"; ctx.fillText(cfg.title, padL, 11); }
  const s = niceStep(xr[1] - xr[0], 5);
  ctx.font = "8.5px monospace";
  for (let v = Math.ceil(xr[0] / s) * s; v <= xr[1]; v += s){ ctx.strokeStyle = C.grid;
    ctx.beginPath(); ctx.moveTo(X(v), padT); ctx.lineTo(X(v), h - padB); ctx.stroke();
    ctx.fillStyle = C.txt2; ctx.textAlign = "center"; ctx.fillText(fmtN(v), X(v), h - padB + 12); }
  const s2 = niceStep(yr[1] - yr[0], 4);
  for (let v = Math.ceil(yr[0] / s2) * s2; v <= yr[1]; v += s2){ ctx.strokeStyle = C.grid;
    ctx.beginPath(); ctx.moveTo(padL, Y(v)); ctx.lineTo(w - padR, Y(v)); ctx.stroke();
    ctx.fillStyle = C.txt2; ctx.textAlign = "right"; ctx.fillText(fmtN(v), padL - 5, Y(v) + 3); }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke();
  /* bias + LoA */
  [{ v:cfg.bias, c:C.cy, l:"bias " + cfg.bias.toFixed(1), dash:[] }, { v:cfg.loa[0], c:C.am, l:"−1.96 SD", dash:[5, 4] }, { v:cfg.loa[1], c:C.am, l:"+1.96 SD", dash:[5, 4] }].forEach(l => {
    ctx.save(); ctx.setLineDash(l.dash); ctx.strokeStyle = l.c; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(padL, Y(l.v)); ctx.lineTo(w - padR, Y(l.v)); ctx.stroke(); ctx.restore();
    ctx.fillStyle = l.c; ctx.font = "bold 8.5px monospace"; ctx.textAlign = "left"; ctx.fillText(l.l + " (" + fmtN(l.v) + ")", padL + 6, Y(l.v) - 4);
  });
  cfg.pts.forEach(p => { ctx.save(); ctx.fillStyle = "rgba(0,229,255,.75)"; ctx.shadowColor = "rgba(0,229,255,.8)"; ctx.shadowBlur = 5;
    ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 2.8, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
  ctx.fillStyle = C.txt; ctx.font = "9px monospace"; ctx.textAlign = "right";
  ctx.fillText(cfg.xLabel || "mean of methods", w - padR, h - 6);
  ctx.textAlign = "left"; ctx.fillText(cfg.yLabel || "HSAT − PSG difference", 4, padT - 8);
}

/* ── hypnogram atlas (stacked step hypnograms + event ticks) ───────────── */
const HYPO_ROWS = [["W", "#ffb454"], ["R", "#ff2d78"], ["N1", "#00e5ff"], ["N2", "#00ffc6"], ["N3", "#b18cff"]];
function hypnoAtlas(cv, panels, tMax){
  tMax = tMax || 480;
  const pH = 62, H = 30 + panels.length * pH + 8;
  const { ctx, w } = cvSetup(cv, H);
  ctx.clearRect(0, 0, w, H);
  const gut = 96, padR = 12, padT = 26;
  const X = t => gut + t / tMax * (w - gut - padR);
  ctx.fillStyle = C.cy; ctx.font = "bold 10px monospace"; ctx.textAlign = "left";
  ctx.fillText("8-HOUR HYPNOGRAM ATLAS · SAME TIMEBASE", gut, 12);
  panels.forEach((p, pi) => {
    const y0 = padT + pi * pH;
    ctx.fillStyle = pi % 2 ? "rgba(8,14,28,.5)" : "rgba(10,18,34,.3)";
    ctx.fillRect(0, y0, w, pH - 6);
    ctx.fillStyle = p.color; ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
    ctx.fillText(p.label.slice(0, 16), 6, y0 + 14);
    ctx.fillStyle = C.txt2; ctx.font = "7.5px monospace";
    ctx.fillText(p.sub || "", 6, y0 + 26);
    const rows = HYPO_ROWS.map((r, i) => [r[0], y0 + 12 + i * 8.5, r[1]]);
    rows.forEach(r => { ctx.strokeStyle = "rgba(120,170,230,.1)";
      ctx.beginPath(); ctx.moveTo(gut, r[1]); ctx.lineTo(w - padR, r[1]); ctx.stroke();
      ctx.fillStyle = r[2]; ctx.font = "7px monospace"; ctx.fillText(r[0], gut - 16, r[1] + 3); });
    if (p.segs.length){
      ctx.lineWidth = 1.8;
      for (let i = 0; i < p.segs.length - 1; i++){
        const a = p.segs[i], b = p.segs[i + 1];
        const ya = rows.find(r => r[0] === a[1]), yb = rows.find(r => r[0] === b[1]);
        if (!ya || !yb) continue;
        ctx.strokeStyle = ya[2]; ctx.shadowColor = ya[2]; ctx.shadowBlur = 3;
        ctx.beginPath(); ctx.moveTo(X(a[0]), ya[1]); ctx.lineTo(X(b[0]), ya[1]); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(X(b[0]), ya[1]); ctx.lineTo(X(b[0]), yb[1]); ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }
    (p.events || []).forEach(e => {
      ctx.strokeStyle = p.evColor || "rgba(255,56,96,.8)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(e), y0 + 4); ctx.lineTo(X(e), y0 + 50); ctx.stroke();
    });
  });
  /* hour scale */
  ctx.fillStyle = C.txt2; ctx.font = "7.5px monospace"; ctx.textAlign = "center";
  for (let hr = 0; hr <= 8; hr += 2) ctx.fillText(hr + "h", X(hr * 60), H - 2);
}

/* ══ PSG DATASETS ═══════════════════════════════════════════════════════ */
/* normal adult reference population (illustrative composite of AASM/literature) */
const PSG_REF = {
  ahi:   { label:"AHI",        unit:"/hr",  mean:1.8,  sd:1.2,  lo:0,  hi:70,  dir:"high" },
  ai:    { label:"Arousal idx",unit:"/hr",  mean:9,    sd:4,    lo:0,  hi:60,  dir:"high" },
  plmi:  { label:"PLMI",       unit:"/hr",  mean:1.5,  sd:1.5,  lo:0,  hi:50,  dir:"high" },
  nadir: { label:"SpO₂ nadir", unit:"%",    mean:92.5, sd:2,    lo:70, hi:100, dir:"low"  },
  se:    { label:"Sleep effic.",unit:"%",   mean:89,   sd:5,    lo:40, hi:100, dir:"low"  },
  n3:    { label:"N3 share",   unit:"%",    mean:17,   sd:6,    lo:0,  hi:35,  dir:"low"  },
  rem:   { label:"REM share",  unit:"%",    mean:22,   sd:5,    lo:0,  hi:40,  dir:"low"  },
  sl:    { label:"Sleep lat.", unit:"min",  mean:14,   sd:7,    lo:0,  hi:80,  dir:"high" },
  reml:  { label:"REM lat.",   unit:"min",  mean:92,   sd:28,   lo:0,  hi:220, dir:"both" },
};
/* group statistics: [mean, sd] per metric (illustrative composites) */
const PSG_GROUPS = [
  { id:"normal",     name:"Normal",        color:"#8fa3c8", n:40, v:{ ahi:[1.8,1.2],  ai:[9,4],    plmi:[1.5,1.5], nadir:[92.5,2], se:[89,5],   n3:[17,6], rem:[22,5], sl:[14,7],    reml:[92,28]  } },
  { id:"osa-severe", name:"Severe OSA",    color:"#ff3860", n:60, v:{ ahi:[52,14],   ai:[46,12],  plmi:[12,8],    nadir:[78,5],   se:[72,9],   n3:[6,4],  rem:[12,5], sl:[8,6],     reml:[152,45]  } },
  { id:"osa-mild",   name:"Mild OSA/UARS", color:"#ffb454", n:35, v:{ ahi:[9.5,3],   ai:[22,8],   plmi:[5,4],     nadir:[87,3],   se:[80,8],   n3:[11,5], rem:[17,5], sl:[10,7],    reml:[120,40]  } },
  { id:"csa",        name:"Central SA",    color:"#b18cff", n:25, v:{ ahi:[31,11],   ai:[28,9],   plmi:[4,3],     nadir:[84,4],   se:[76,8],   n3:[10,5], rem:[14,5], sl:[12,8],    reml:[125,50]  } },
  { id:"csr",        name:"Cheyne–Stokes", color:"#7d8dff", n:25, v:{ ahi:[34,10],   ai:[30,9],   plmi:[4,3],     nadir:[85,4],   se:[74,9],   n3:[9,5],  rem:[13,5], sl:[11,7],    reml:[130,55]  } },
  { id:"ohs",        name:"OHS",           color:"#ff9e42", n:20, v:{ ahi:[28,16],   ai:[30,12],  plmi:[8,6],     nadir:[76,6],   se:[70,10],  n3:[7,4],  rem:[11,5], sl:[7,6],     reml:[140,50]  } },
  { id:"narcolepsy", name:"Narcolepsy",    color:"#00ffc6", n:30, v:{ ahi:[3.5,3],   ai:[24,8],   plmi:[4,4],     nadir:[92,2],   se:[74,10],  n3:[11,5], rem:[27,6], sl:[3.5,2.5], reml:[6,5]     } },
  { id:"insomnia",   name:"Insomnia",      color:"#00e5ff", n:30, v:{ ahi:[2.5,2],   ai:[28,10],  plmi:[3,3],     nadir:[94,2],   se:[61,9],   n3:[8,4],  rem:[15,5], sl:[48,18],   reml:[105,40]  } },
  { id:"rbd",        name:"RBD",           color:"#ff2d78", n:25, v:{ ahi:[8,6],     ai:[17,7],   plmi:[28,14],   nadir:[90,3],   se:[82,7],   n3:[14,6], rem:[24,6], sl:[14,9],    reml:[95,35]   } },
  { id:"plmd",       name:"PLMD",          color:"#3dffb0", n:25, v:{ ahi:[3.5,3],   ai:[21,8],   plmi:[34,12],   nadir:[93,2],   se:[84,7],   n3:[15,6], rem:[20,5], sl:[14,8],    reml:[95,30]   } },
];
function psgGroup(id){ return PSG_GROUPS.find(g => g.id === id); }
const ciOf = (mean, sd, n) => 1.96 * sd / Math.sqrt(n);

/* EEG spectral power (µV²) — N3 (insomnia values from N2: hyperarousal) */
const PSG_EEG_BANDS = [["Delta 0.5–4 Hz", "Delta"], ["Theta 4–8", "Theta"], ["Alpha 8–12", "Alpha"], ["Sigma 12–15", "Sigma"], ["Beta 15–30", "Beta"]];
const PSG_EEG = [
  { id:"normal",     color:"#8fa3c8", vals:[340, 48, 18, 9, 11] },
  { id:"osa-severe", color:"#ff3860", vals:[150, 55, 42, 14, 22] },
  { id:"osa-mild",   color:"#ffb454", vals:[230, 52, 33, 16, 16] },
  { id:"csa",        color:"#b18cff", vals:[210, 60, 28, 12, 16] },
  { id:"csr",        color:"#7d8dff", vals:[200, 58, 30, 12, 16] },
  { id:"ohs",        color:"#ff9e42", vals:[140, 50, 40, 13, 20] },
  { id:"narcolepsy", color:"#00ffc6", vals:[95, 75, 30, 15, 26] },
  { id:"insomnia",   color:"#00e5ff", vals:[180, 60, 58, 20, 34] },
  { id:"rbd",        color:"#ff2d78", vals:[230, 55, 25, 11, 15] },
  { id:"plmd",       color:"#3dffb0", vals:[240, 52, 30, 22, 18] },
];

/* SpO₂ desaturation event kinetics — exponential fall + recovery */
const PSG_DESAT = [
  { id:"normal",     color:"#8fa3c8", depth:1.2,  tDown:24, tUp:15, dur:12, note:"stage-shift wobble only" },
  { id:"osa-mild",   color:"#ffb454", depth:5,    tDown:11, tUp:8,  dur:17, note:"hypopnea" },
  { id:"osa-severe", color:"#ff3860", depth:13,   tDown:7,  tUp:9,  dur:26, note:"long obstructive apnea" },
  { id:"csa",        color:"#b18cff", depth:7.5,  tDown:10, tUp:6,  dur:18, note:"central apnea — fast recovery" },
  { id:"csr",        color:"#7d8dff", depth:6,    tDown:9,  tUp:5,  dur:20, note:"periodic breathing cycle" },
  { id:"ohs",        color:"#ff9e42", depth:10,   tDown:8,  tUp:11, dur:30, note:"REM hypoventilation — slow recovery" },
  { id:"narcolepsy", color:"#00ffc6", depth:1.5,  tDown:18, tUp:14, dur:12, note:"REM breathing irregularity" },
  { id:"insomnia",   color:"#00e5ff", depth:0.8,  tDown:26, tUp:16, dur:10, note:"clean trace — minimal dip" },
  { id:"rbd",        color:"#ff2d78", depth:2,    tDown:20, tUp:12, dur:14, note:"mild REM dips" },
  { id:"plmd",       color:"#3dffb0", depth:0.8,  tDown:26, tUp:15, dur:10, note:"no respiratory dips" },
];
function desatCurve(p, t){
  const lag = 8, base = 97;
  if (t < lag) return base;
  if (t < lag + p.dur) return base - p.depth * (1 - Math.exp(-(t - lag) / p.tDown));
  return base - p.depth * Math.exp(-(t - lag - p.dur) / p.tUp);
}
const desatNadir = p => 97 - p.depth * (1 - Math.exp(-p.dur / p.tDown));

/* ROC panels — diagnostic tests for PSG-AHI ≥ 15/hr (illustrative composites) */
const PSG_ROC = [
  { id:"hsat", label:"HSAT-AHI", color:"#00e5ff", pts:[[.38, .97, "≥5"], [.62, .93, "≥10"], [.80, .87, "≥15"], [.90, .76, "≥20"], [.96, .58, "≥30"]] },
  { id:"odi",  label:"ODI (oximetry)", color:"#3dffb0", pts:[[.44, .95, "≥5"], [.66, .90, "≥10"], [.83, .82, "≥15"], [.92, .70, "≥20"]] },
  { id:"snore",label:"Snore index", color:"#ffb454", pts:[[.28, .92, "≥20%"], [.42, .80, "≥40%"], [.62, .62, "≥60%"], [.80, .45, "≥80%"]] },
];

/* overnight mean SpO₂ trend (hourly, %) — normal reference band vs disorders */
const PSG_TREND = [
  { id:"osa-severe", color:"#ff3860", v:[95.5, 93.8, 92.6, 93.4, 91.8, 90.9, 89.6, 90.2], rem:[2, 4, 6] },
  { id:"csa",        color:"#b18cff", v:[95.0, 93.8, 94.5, 93.2, 94.6, 93.5, 94.1, 93.0], rem:[] },
  { id:"ohs",        color:"#ff9e42", v:[93.0, 91.5, 90.2, 89.0, 87.5, 86.2, 85.0, 84.3], rem:[3, 5, 7] },
  { id:"insomnia",   color:"#00e5ff", v:[96.0, 96.1, 95.9, 96.2, 96.0, 96.1, 95.9, 96.0], rem:[] },
  { id:"rbd",        color:"#ff2d78", v:[95.8, 95.5, 95.2, 95.6, 95.1, 95.4, 95.0, 95.3], rem:[1, 3, 5, 7] },
];

/* hypnogram templates for the atlas (minutes; jitter applied deterministically) */
const HYPO_TPL = {
  normal:     { ahi:0.5, ev:"rgba(255,56,96,.55)", start:[["W", 22]],  cyc:[["N1",7],["N2",34],["N3",28],["N2",12],["R",24],["N2",9]] },
  "osa-severe":{ ahi:58, ev:"rgba(255,56,96,.6)",  start:[["W", 30]],  cyc:[["N1",38],["N2",16],["W",3],["N1",10],["N2",8],["W",2],["R",12],["N2",6]] },
  "osa-mild": { ahi:11,  ev:"rgba(255,56,96,.55)", start:[["W", 22]],  cyc:[["N1",20],["N2",30],["W",4],["N2",20],["R",18],["N2",12]] },
  csa:        { ahi:32,  ev:"rgba(177,140,255,.65)", start:[["W", 25]], cyc:[["N1",14],["N2",20],["W",2],["N1",8],["N2",12],["R",14],["N2",10]] },
  csr:        { ahi:30,  ev:"rgba(125,141,255,.65)", start:[["W", 24]], cyc:[["N1",16],["N2",24],["W",2],["N1",9],["N2",14],["R",13],["N2",11]] },
  ohs:        { ahi:18,  ev:"rgba(255,158,66,.65)", start:[["W", 35]],  cyc:[["N1",20],["N2",55],["R",35],["N2",30],["R",30]] },
  narcolepsy: { ahi:2,   ev:"rgba(255,56,96,.4)",  start:[["W", 18], ["N1", 6], ["R", 30]], cyc:[["N1",8],["N2",18],["R",32],["N2",14],["R",26]] },
  insomnia:   { ahi:0,   ev:"rgba(255,56,96,.4)",  start:[["W", 85]],  cyc:[["N1",25],["W",18],["N2",38],["W",12],["N2",22],["N1",14],["R",16],["W",14],["N2",30],["R",18]] },
  rbd:        { ahi:3,   ev:"rgba(255,45,120,.5)", start:[["W", 24]],  cyc:[["N1",10],["N2",30],["N3",22],["N2",10],["R",40],["N2",16],["R",34]] },
  plmd:       { ahi:1,   ev:"rgba(61,255,176,.6)", start:[["W", 20]],  cyc:[["N1",8],["N2",40],["N3",18],["N2",14],["R",22],["N2",12]] },
  titration:  { ahi:40,  ev:"rgba(61,255,176,.6)", start:[["W", 28]],  cyc:[["N1",30],["N2",14],["W",2],["N1",8],["N2",8],["R",10],["N2",6]] },
};
function genHypno(gid, tMax){
  tMax = tMax || 480;
  const tpl = HYPO_TPL[gid] || HYPO_TPL.normal;
  const jit = gid === "normal" ? .18 : .38;
  let t = 0, segs = [];
  tpl.start.forEach(([st, d], i) => { segs.push([t, st]); t += d * (1 + (phash(i * 7 + gid.length * 13) - .5) * jit); });
  let i = 0;
  while (t < tMax){ const [st, d] = tpl.cyc[i % tpl.cyc.length];
    segs.push([t, st]); t += d * (1 + (phash(i * 13 + gid.length * 31) - .5) * jit); i++; }
  segs.push([t, "W"]);
  const evs = [];
  if (tpl.ahi > 1) for (let e = 24; e < tMax && evs.length < 340; e += 60 / tpl.ahi) evs.push(e);
  return { segs, events: evs, evColor: tpl.ev, tMax: t };
}

/* difference matrices for the compare engine */
const PSG_DIFF = {
  "normal": { name:"Normal Sleep", rows:[
    ["Airflow", "Regular sinusoidal 12–16/min", "Regular sinusoidal 12–16/min"],
    ["Respiratory effort", "In-phase thorax/abdomen", "In-phase thorax/abdomen"],
    ["Snoring", "Absent or faint", "Absent or faint"],
    ["SpO₂ pattern", "Stable 95–97%", "Stable 95–97%"],
    ["Heart rate", "Regular, RSA present", "Regular, RSA present"],
    ["Chin EMG in REM", "Near-silent atonia", "Near-silent atonia"],
    ["Leg EMG (tibialis)", "Quiescent", "Quiescent"],
    ["Architecture", "N1 2–5 · N2 45–55 · N3 13–23 · REM 20–25%", "N1 2–5 · N2 45–55 · N3 13–23 · REM 20–25%"],
    ["Latencies", "SL 10–20 min · REM 60–120 min", "SL 10–20 min · REM 60–120 min"],
    ["Signature", "Spindles/K-complexes · delta · sawtooth", "Spindles/K-complexes · delta · sawtooth"] ],
    verdict:"A is the baseline — pick a disorder in panel B to expose the differences." },
  "osa-severe": { name:"Severe OSA", rows:[
    ["Airflow", "Regular sinusoidal 12–16/min", "Cessations ≥ 10 s, recovery gasps"],
    ["Respiratory effort", "In-phase thorax/abdomen", "Persists + crescendos, out-of-phase (paradox)"],
    ["Snoring", "Absent or faint", "Loud, crescendo → silence → snort"],
    ["SpO₂ pattern", "Stable 95–97%", "Cyclic dives to low-80s, ~8 s lag"],
    ["Heart rate", "Regular, RSA present", "Brady during apnea → tachy burst at arousal"],
    ["Chin EMG in REM", "Near-silent atonia", "Normal (unless arousal)"],
    ["Leg EMG (tibialis)", "Quiescent", "Occasional movements riding arousals"],
    ["Architecture", "N1 2–5 · N2 45–55 · N3 13–23 · REM 20–25%", "N1-heavy, N3 nearly absent, REM trimmed"],
    ["Latencies", "SL 10–20 min · REM 60–120 min", "SL short · REM delayed by fragmentation"],
    ["Signature", "Spindles/K-complexes · delta · sawtooth", "Apnea → arousal → gasp cycle, AHI ≥ 30"] ],
    verdict:"Effort WITHOUT flow = obstruction. Desats to the low-80s with arousal-terminated cycles: severe OSA — CPAP indicated; screen for OHS if desats exceed what the AHI explains." },
  "osa-mild": { name:"Mild OSA / UARS", rows:[
    ["Airflow", "Regular sinusoidal 12–16/min", "≥ 30% attenuations + inspiratory flattening"],
    ["Respiratory effort", "In-phase thorax/abdomen", "Preserved, mild paradox"],
    ["Snoring", "Absent or faint", "Loud, habitual"],
    ["SpO₂ pattern", "Stable 95–97%", "Dips only to ~87–90%"],
    ["Heart rate", "Regular, RSA present", "Mild tachy blips with arousals"],
    ["Chin EMG in REM", "Near-silent atonia", "Normal"],
    ["Leg EMG (tibialis)", "Quiescent", "Usually quiet"],
    ["Architecture", "N1 2–5 · N2 45–55 · N3 13–23 · REM 20–25%", "N2 held, N3 trimmed"],
    ["Latencies", "SL 10–20 min · REM 60–120 min", "SL normal · REM mildly delayed"],
    ["Signature", "Spindles/K-complexes · delta · sawtooth", "Hypopneas + RERAs; RDI ≫ AHI"] ],
    verdict:"Flow-limitation spectrum: oximetry alone misses RERAs — the arousal-based RDI is the honest index. CPAP or MAD depending on phenotype." },
  "csa": { name:"Central Sleep Apnea", rows:[
    ["Airflow", "Regular sinusoidal 12–16/min", "Stops abruptly, restarts with overshoot"],
    ["Respiratory effort", "In-phase thorax/abdomen", "Off WITH flow — no paradox"],
    ["Snoring", "Absent or faint", "Absent"],
    ["SpO₂ pattern", "Stable 95–97%", "Milder dips 86–89%"],
    ["Heart rate", "Regular, RSA present", "Brady–tachy oscillation"],
    ["Chin EMG in REM", "Near-silent atonia", "Normal"],
    ["Leg EMG (tibialis)", "Quiescent", "Quiet"],
    ["Architecture", "N1 2–5 · N2 45–55 · N3 13–23 · REM 20–25%", "Unstable N1/N2, brief Wake flashes"],
    ["Latencies", "SL 10–20 min · REM 60–120 min", "Variable"],
    ["Signature", "Spindles/K-complexes · delta · sawtooth", "Central apnea + post-arousal hyperventilation loop"] ],
    verdict:"Both channels flat together = central. Consider HFrEF, opioids, altitude, renal failure. Distinguish from CSR: no long crescendo here." },
  "csr": { name:"Cheyne–Stokes (HF)", rows:[
    ["Airflow", "Regular sinusoidal 12–16/min", "Crescendo–decrescendo, 60–70 s cycles"],
    ["Respiratory effort", "In-phase thorax/abdomen", "Waxes/wanes WITH flow (central)"],
    ["Snoring", "Absent or faint", "Absent"],
    ["SpO₂ pattern", "Stable 95–97%", "Rhythmic dips tracking the cycle"],
    ["Heart rate", "Regular, RSA present", "Tachy at cycle peak, brady at nadir"],
    ["Chin EMG in REM", "Near-silent atonia", "Normal"],
    ["Leg EMG (tibialis)", "Quiescent", "Quiet"],
    ["Architecture", "N1 2–5 · N2 45–55 · N3 13–23 · REM 20–25%", "Light fragmented NREM"],
    ["Latencies", "SL 10–20 min · REM 60–120 min", "—"],
    ["Signature", "Spindles/K-complexes · delta · sawtooth", "Periodic breathing with central apneas at the nadir"] ],
    verdict:"The sine wrapped around apneas — long circulation time in HFrEF. ASV is contraindicated at LVEF ≤ 45% (SERVE-HF); CPAP/acetazolamide per phenotype." },
  "ohs": { name:"Obesity Hypoventilation", rows:[
    ["Airflow", "Regular sinusoidal 12–16/min", "Long hypopneas, heavy flow limitation"],
    ["Respiratory effort", "In-phase thorax/abdomen", "High-amplitude, persistent"],
    ["Snoring", "Absent or faint", "Loud"],
    ["SpO₂ pattern", "Stable 95–97%", "Baseline ~90% + REM dives to low-80s"],
    ["Heart rate", "Regular, RSA present", "Resting tachycardia"],
    ["Chin EMG in REM", "Near-silent atonia", "Normal"],
    ["Leg EMG (tibialis)", "Quiescent", "Occasional"],
    ["Architecture", "N1 2–5 · N2 45–55 · N3 13–23 · REM 20–25%", "Fragmented; REM desat dives"],
    ["Latencies", "SL 10–20 min · REM 60–120 min", "Sleep onset rapid (sleep-deprived)"],
    ["Signature", "Spindles/K-complexes · delta · sawtooth", "Sustained hypoventilation, few discrete apneas"] ],
    verdict:"Desats out of proportion to AHI = think hypoventilation. Awake PaCO₂ ≥ 45 confirms OHS — BPAP-ST (± weight, oxygen), CPAP alone often insufficient." },
  "narcolepsy": { name:"Narcolepsy (SOREMP)", rows:[
    ["Airflow", "Regular sinusoidal 12–16/min", "Mildly irregular in REM"],
    ["Respiratory effort", "In-phase thorax/abdomen", "Preserved"],
    ["Snoring", "Absent or faint", "Absent"],
    ["SpO₂ pattern", "Stable 95–97%", "Normal"],
    ["Heart rate", "Regular, RSA present", "REM-related fluctuation"],
    ["Chin EMG in REM", "Near-silent atonia", "Atonia preserved"],
    ["Leg EMG (tibialis)", "Quiescent", "Some REM phasic twitches"],
    ["Architecture", "N1 2–5 · N2 45–55 · N3 13–23 · REM 20–25%", "Fragmented, REM enters within minutes"],
    ["Latencies", "SL 10–20 min · REM 60–120 min", "SL < 8 min · REM latency < 15 min (SOREMP)"],
    ["Signature", "Spindles/K-complexes · delta · sawtooth", "Sleep-onset REM × ≥ 2 + sawtooth-rich REM"] ],
    verdict:"REM at the front door. Confirm with MSLT (mean latency ≤ 8 min + ≥ 2 SOREMPs); type 1 if cataplexy or low CSF hypocretin-1." },
  "insomnia": { name:"Chronic Insomnia", rows:[
    ["Airflow", "Regular sinusoidal 12–16/min", "Normal"],
    ["Respiratory effort", "In-phase thorax/abdomen", "Normal, in-phase"],
    ["Snoring", "Absent or faint", "Minimal"],
    ["SpO₂ pattern", "Stable 95–97%", "Normal — a 'clean' PSG"],
    ["Heart rate", "Regular, RSA present", "Mildly elevated (hyperarousal)"],
    ["Chin EMG in REM", "Near-silent atonia", "Normal or elevated tone"],
    ["Leg EMG (tibialis)", "Quiescent", "Quiet"],
    ["Architecture", "N1 2–5 · N2 45–55 · N3 13–23 · REM 20–25%", "SL > 30 min, WASO, N1-heavy, N3 blunted, SE ~60%"],
    ["Latencies", "SL 10–20 min · REM 60–120 min", "SL prolonged · REM delayed"],
    ["Signature", "Spindles/K-complexes · delta · sawtooth", "Alpha intrusion into N1/N2; paradoxical perception"] ],
    verdict:"Normal respiration + wrecked continuity + alpha-intruded EEG = hyperarousal phenotype. CBT-I first-line; meds adjunctive; never a ventilator." },
  "rbd": { name:"REM Behavior Disorder", rows:[
    ["Airflow", "Regular sinusoidal 12–16/min", "Normal or mildly blunted"],
    ["Respiratory effort", "In-phase thorax/abdomen", "Preserved"],
    ["Snoring", "Absent or faint", "Variable"],
    ["SpO₂ pattern", "Stable 95–97%", "Normal"],
    ["Heart rate", "Regular, RSA present", "Normal REM variability"],
    ["Chin EMG in REM", "Near-silent atonia", "ELEVATED through REM — atonia fails"],
    ["Leg EMG (tibialis)", "Quiescent", "Dense phasic bursts + dream-enactment flurries"],
    ["Architecture", "N1 2–5 · N2 45–55 · N3 13–23 · REM 20–25%", "Near-normal; REM abundant"],
    ["Latencies", "SL 10–20 min · REM 60–120 min", "Normal"],
    ["Signature", "Spindles/K-complexes · delta · sawtooth", "REM without atonia + dream enactment on video"] ],
    verdict:"The only REM-specific EMG disease in this set. Score RWA per AASM, review video, and screen for synucleinopathy — conversion to Parkinson/DLB runs ~6–8%/yr. Clonazepam or melatonin." },
  "plmd": { name:"PLMD", rows:[
    ["Airflow", "Regular sinusoidal 12–16/min", "Normal"],
    ["Respiratory effort", "In-phase thorax/abdomen", "Normal"],
    ["Snoring", "Absent or faint", "Absent"],
    ["SpO₂ pattern", "Stable 95–97%", "Normal"],
    ["Heart rate", "Regular, RSA present", "Bumps riding each PLM"],
    ["Chin EMG in REM", "Near-silent atonia", "Normal"],
    ["Leg EMG (tibialis)", "Quiescent", "Stereotyped bursts every 20–40 s in NREM"],
    ["Architecture", "N1 2–5 · N2 45–55 · N3 13–23 · REM 20–25%", "N2/N3 with arousal interrupts"],
    ["Latencies", "SL 10–20 min · REM 60–120 min", "Normal"],
    ["Signature", "Spindles/K-complexes · delta · sawtooth", "PLMI > 15/hr with linked arousals"] ],
    verdict:"Legs, not airway. Diagnose PLMD when movements disrupt sleep without RLS urge; check ferritin, renal function, SSRIs; treat the cause, consider iron/α-2-delta agents." },
  "titration": { name:"PAP Titration Night", rows:[
    ["Airflow", "Regular sinusoidal 12–16/min", "Obstructed pre-CPAP → restored as pressure rises"],
    ["Respiratory effort", "In-phase thorax/abdomen", "Crescendo pre-event → normalizes on therapy"],
    ["Snoring", "Absent or faint", "Loud until CPAP abolishes it"],
    ["SpO₂ pattern", "Stable 95–97%", "Cyclic dips → flat ≥ 95% on final pressure"],
    ["Heart rate", "Regular, RSA present", "Brady–tachy → settles on therapy"],
    ["Chin EMG in REM", "Near-silent atonia", "Normal"],
    ["Leg EMG (tibialis)", "Quiescent", "Quiet"],
    ["Architecture", "N1 2–5 · N2 45–55 · N3 13–23 · REM 20–25%", "Fragmented → consolidates; REM rebounds late"],
    ["Latencies", "SL 10–20 min · REM 60–120 min", "—"],
    ["Signature", "Spindles/K-complexes · delta · sawtooth", "Split-night: diagnostic half then CPAP escalation 5 → 9 cmH₂O"] ],
    verdict:"Split-night logic: ≥ 2 h diagnostic (AHI ≥ 40 typically) then titrate CPAP upward until apneas, flow limitation, snoring and desats are abolished in ALL stages and positions." },
};
</script>
