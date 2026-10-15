<script>
/* ═══════════════════════════════════════════════════════════════════════════
   CORE — utilities · icons · chart engine
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const stripEmoji = s => String(s == null ? "" : s).replace(/[\u{1F300}-\u{1FAFF}\u{FE0F}]/gu, "").trim();
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const f1 = n => (n == null || !isFinite(n)) ? "—" : (+n).toFixed(1);
const f0 = n => (n == null || !isFinite(n)) ? "—" : Math.round(+n).toString();
const store = {
  get(k, d) { try { const v = localStorage.getItem("vai2_" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("vai2_" + k, JSON.stringify(v)); } catch (e) {} }
};
let toastTimer = null;
function toast(msg, ms) {
  const t = $("#toast"); t.innerHTML = "<span class='cy'>▸</span> " + msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), ms || 2400);
}
function copyText(txt) {
  const done = () => toast("Report copied to clipboard");
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done).catch(() => fallbackCopy(txt, done));
  else fallbackCopy(txt, done);
}
function fallbackCopy(txt, done) {
  const ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); done(); } catch (e) { toast("Copy failed — use download instead"); }
  document.body.removeChild(ta);
}
function downloadText(name, text) {
  try {
    const b = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 600);
    toast("Downloaded " + name);
  } catch (e) { toast("Download not supported in this browser"); }
}

/* ── SVG icon set (inline, offline) ────────────────────────────────────── */
const ICONS = {
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  cpu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="5" width="14" height="14" rx="2.5"/><rect x="9.2" y="9.2" width="5.6" height="5.6" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>',
  steth:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v6a5 5 0 0 0 10 0V3"/><path d="M8 3H5M15 3h-3"/><path d="M15 13v2a5 5 0 0 0 10 0" transform="translate(-6 0)"/><circle cx="17.5" cy="12" r="2.2"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>',
  calc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2.5"/><path d="M8 6.5h8M8 11h.01M12 11h.01M16 11h.01M8 14.5h.01M12 14.5h.01M16 14.5h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>',
  wave:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h3l2.5-7 4 14 3-10 2 3h5.5"/></svg>',
  db:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><ellipse cx="12" cy="5" rx="8" ry="2.6"/><path d="M4 5v6c0 1.4 3.6 2.6 8 2.6s8-1.2 8-2.6V5"/><path d="M4 11v6c0 1.4 3.6 2.6 8 2.6s8-1.2 8-2.6v-6"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 3.5v6c0 4.8-3.4 8.6-8 10.5-4.6-1.9-8-5.7-8-10.5v-6L12 2z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
  zap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>',
  form:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>',
  pulse:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h4l2-6 4 12 2.5-8 2 2h5.5"/></svg>',
  activity:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M22 12h-4l-3 8-4-16-3 8H2"/></svg>',
  gauge:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 18a9 9 0 0 1 16 0"/><path d="M12 18l4-6"/><circle cx="12" cy="18" r="1.6" fill="currentColor"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
  capno:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17h2l1-8 3 8h6l1-8 3 8h4"/><path d="M2 21h20" opacity=".4"/></svg>',
  alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l10 17H2L12 3z"/><path d="M12 10v4M12 17.5v.01"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/></svg>',
  lung:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v8"/><path d="M12 11c-1-4-4.5-6-7-6-2 0-3.5 1.5-3.5 3.5C1.5 14 5 20 9.5 21c1.5.3 2.5-.7 2.5-2V11z"/><path d="M12 11c1-4 4.5-6 7-6 2 0 3.5 1.5 3.5 3.5C22.5 14 19 20 14.5 21c-1.5.3-2.5-.7-2.5-2V11z"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-8-5-10-10c-1.3-3.5 1-7 4.5-7C9 4 11 6 12 7.5 13 6 15 4 17.5 4 21 4 23.3 7.5 22 11c-2 5-10 10-10 10z"/></svg>',
  drop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2.7S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.7 12 2.7z"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.15-1.4l2.1-1.6-2-3.5-2.4 1a7 7 0 0 0-2.4-1.4L13.8 2h-4l-.35 2.6a7 7 0 0 0-2.4 1.4l-2.4-1-2 3.5 2.1 1.6a7 7 0 0 0 0 2.8l-2.1 1.6 2 3.5 2.4-1a7 7 0 0 0 2.4 1.4L9.8 22h4l.35-2.6a7 7 0 0 0 2.4-1.4l2.4 1 2-3.5-2.1-1.6A7 7 0 0 0 19 12z"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  ext:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/></svg>',
  split:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="7.5" height="16" rx="1.5"/><rect x="13.5" y="4" width="7.5" height="16" rx="1.5"/><path d="M7 10v4M17 9l-2 3h3l-2 3" opacity=".7"/></svg>',
  sigma:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5H7l5.5 7L7 19h11"/><path d="M18 5v3M18 16v3" opacity=".6"/></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
};
function hydrateIcons(root) { $$("[data-ic]", root).forEach(e => { const n = e.getAttribute("data-ic"); if (ICONS[n]) e.innerHTML = ICONS[n]; }); }

/* ── status helpers ────────────────────────────────────────────────────── */
const STATUS_CLS = { normal:"ok", caution:"caution", danger:"danger", info:"info" };
function resCard(r) {
  const cls = STATUS_CLS[r.status] || "info";
  const val = r.value == null ? "—" : (typeof r.value === "number" ? (+r.value).toFixed(r.value % 1 ? 1 : 0) : r.value);
  return `<div class="res ${cls}"><div class="rh"><span class="rl">${esc(r.label)}</span>
    <span class="rv">${esc(val)}${r.unit ? `<small>${esc(r.unit)}</small>` : ""}</span></div>
    ${r.interpretation ? `<div class="ri">${esc(r.interpretation)}</div>` : ""}</div>`;
}

/* ══ CHART ENGINE (canvas, zero deps) ════════════════════════════════════ */
function cvSetup(cv, h) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth || cv.parentElement.clientWidth || 300;
  const hh = h || parseInt(cv.getAttribute("height") || "200", 10);
  cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr);
  cv.style.height = hh + "px";
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h: hh };
}
const C = { grid:"rgba(120,170,230,.10)", axis:"rgba(140,190,255,.35)", txt:"#8298bd", txt2:"#5a6d8f",
  cy:"#00e5ff", gr:"#3dffb0", am:"#ffb454", rd:"#ff3860", mg:"#ff2d78", vt:"#b18cff", tl:"#00ffc6" };
function niceStep(range, target) {
  const raw = range / Math.max(target, 1), mag = Math.pow(10, Math.floor(Math.log10(raw))), norm = raw / mag;
  return (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
}
/* plot(cv,{series,bands,vlines,hlines,points,xr,yr,xLabel,yLabel,legend}) */
function plot(cv, cfg) {
  const { ctx, w, h } = cvSetup(cv, cfg.h);
  const padL = 46, padR = 14, padT = 16, padB = 30;
  ctx.clearRect(0, 0, w, h);
  const all = [];
  (cfg.series || []).forEach(s => s.pts.forEach(p => all.push(p)));
  (cfg.points || []).forEach(p => all.push([p.x, p.y]));
  if (!all.length) { ctx.fillStyle = C.txt2; ctx.font = "11px monospace"; ctx.textAlign = "center"; ctx.fillText("— enter data —", w / 2, h / 2); return; }
  let xr = cfg.xr || [Math.min(...all.map(p => p[0])), Math.max(...all.map(p => p[0]))];
  let yr = cfg.yr || [Math.min(0, ...all.map(p => p[1])), Math.max(...all.map(p => p[1]))];
  if (xr[0] === xr[1]) { xr = [xr[0] - 1, xr[1] + 1]; }
  if (yr[0] === yr[1]) { yr = [yr[0] - 1, yr[1] + 1]; }
  if (!cfg.yr) yr[1] += (yr[1] - yr[0]) * 0.08;
  const X = x => padL + (x - xr[0]) / (xr[1] - xr[0]) * (w - padL - padR);
  const Y = y => h - padB - (y - yr[0]) / (yr[1] - yr[0]) * (h - padT - padB);
  /* horizontal bands */
  (cfg.bands || []).forEach(b => {
    if (b.y0 !== undefined) { ctx.fillStyle = b.color; ctx.fillRect(padL, Y(b.y1), w - padL - padR, Y(b.y0) - Y(b.y1));
      if (b.label) { ctx.fillStyle = b.txt || C.txt; ctx.font = "9px monospace"; ctx.textAlign = "right"; ctx.fillText(b.label, w - padR - 4, Y(b.y1) + 11); } }
    else if (b.x0 !== undefined) { ctx.fillStyle = b.color; ctx.fillRect(X(b.x0), padT, X(b.x1) - X(b.x0), h - padT - padB);
      if (b.label) { ctx.fillStyle = b.txt || C.txt; ctx.font = "9px monospace"; ctx.textAlign = "center"; ctx.fillText(b.label, (X(b.x0) + X(b.x1)) / 2, padT + 10); } }
  });
  /* grid + ticks */
  const xs = niceStep(xr[1] - xr[0], 6), ys = niceStep(yr[1] - yr[0], 4);
  ctx.font = "9px monospace"; ctx.fillStyle = C.txt2;
  for (let x = Math.ceil(xr[0] / xs) * xs; x <= xr[1] + 1e-9; x += xs) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X(x), padT); ctx.lineTo(X(x), h - padB); ctx.stroke();
    ctx.textAlign = "center"; ctx.fillText(Math.abs(x) < 1e-9 ? "0" : (+x.toFixed(2)).toString(), X(x), h - padB + 13);
  }
  for (let y = Math.ceil(yr[0] / ys) * ys; y <= yr[1] + 1e-9; y += ys) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(padL, Y(y)); ctx.lineTo(w - padR, Y(y)); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillText(Math.abs(y) < 1e-9 ? "0" : (+y.toFixed(2)).toString(), padL - 5, Y(y) + 3);
  }
  ctx.strokeStyle = C.axis;
  ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke();
  /* hlines */
  (cfg.hlines || []).forEach(l => { ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = l.color || C.am;
    ctx.beginPath(); ctx.moveTo(padL, Y(l.y)); ctx.lineTo(w - padR, Y(l.y)); ctx.stroke(); ctx.restore();
    if (l.label) { ctx.fillStyle = l.color || C.am; ctx.font = "9px monospace"; ctx.textAlign = "left"; ctx.fillText(l.label, padL + 4, Y(l.y) - 4); } });
  /* vlines */
  (cfg.vlines || []).forEach(l => { ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = l.color || C.cy;
    ctx.beginPath(); ctx.moveTo(X(l.x), padT); ctx.lineTo(X(l.x), h - padB); ctx.stroke(); ctx.restore();
    if (l.label) { ctx.fillStyle = l.color || C.cy; ctx.font = "bold 9px monospace"; ctx.textAlign = "left"; ctx.fillText(l.label, X(l.x) + 4, padT + 10); } });
  /* series */
  (cfg.series || []).forEach(s => {
    if (!s.pts.length) return;
    ctx.save();
    ctx.lineWidth = s.w || 2; ctx.strokeStyle = s.color || C.cy;
    ctx.shadowColor = s.color || C.cy; ctx.shadowBlur = s.glow === false ? 0 : 6;
    if (s.dash) ctx.setLineDash(s.dash);
    ctx.beginPath();
    s.pts.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])));
    ctx.stroke();
    if (s.fill) { ctx.shadowBlur = 0; ctx.lineTo(X(s.pts[s.pts.length - 1][0]), Y(Math.max(yr[0], 0)));
      ctx.lineTo(X(s.pts[0][0]), Y(Math.max(yr[0], 0))); ctx.closePath();
      ctx.fillStyle = s.fill; ctx.fill(); }
    ctx.restore();
  });
  /* points */
  (cfg.points || []).forEach(p => {
    ctx.save(); ctx.fillStyle = p.color || C.mg; ctx.shadowColor = p.color || C.mg; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.size || 4.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (p.label) { ctx.fillStyle = p.color || C.mg; ctx.font = "bold 9.5px monospace"; ctx.textAlign = "left";
      ctx.fillText(p.label, X(p.x) + 7, Y(p.y) - 6); }
  });
  /* axis labels */
  ctx.fillStyle = C.txt; ctx.font = "9px monospace";
  if (cfg.xLabel) { ctx.textAlign = "right"; ctx.fillText(cfg.xLabel, w - padR, h - 6); }
  if (cfg.yLabel) { ctx.textAlign = "left"; ctx.fillText(cfg.yLabel, 4, padT - 4); }
  /* legend */
  if (cfg.legend && cfg.legend.length) {
    let lx = padL + 6;
    ctx.font = "9px monospace";
    cfg.legend.forEach(l => { ctx.fillStyle = l.color; ctx.fillRect(lx, 6, 9, 3); ctx.fillStyle = C.txt;
      ctx.textAlign = "left"; ctx.fillText(l.label, lx + 13, 11); lx += 13 + ctx.measureText(l.label).width + 14; });
  }
}
/* gauge(cv,{value,min,max,zones:[{to,color,label}],unit,big}) */
function gauge(cv, cfg) {
  const { ctx, w, h } = cvSetup(cv, cfg.h || 150);
  const cx = w / 2, cy = h - 22, R = Math.min(w / 2 - 24, h - 46);
  const min = cfg.min != null ? cfg.min : 0, max = cfg.max != null ? cfg.max : 100;
  const frac = cfg.value == null || !isFinite(cfg.value) ? null : clamp((cfg.value - min) / (max - min), 0, 1);
  const A = a => Math.PI + a * Math.PI; // 0..1 → π..2π (left→right)
  ctx.clearRect(0, 0, w, h);
  let prev = 0;
  (cfg.zones || []).forEach(z => {
    const f = clamp((z.to - min) / (max - min), 0, 1);
    ctx.beginPath(); ctx.strokeStyle = z.color; ctx.lineWidth = cfg.lw || 11; ctx.lineCap = "butt";
    ctx.arc(cx, cy, R, A(prev), A(f)); ctx.stroke();
    if (z.label) { const mid = A((prev + f) / 2);
      ctx.fillStyle = z.color; ctx.font = "8.5px monospace"; ctx.textAlign = "center";
      ctx.fillText(z.label, cx + Math.cos(mid) * (R + 15), cy + Math.sin(mid) * (R + 15) + 3); }
    prev = f;
  });
  /* ticks */
  ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) { const a = A(i / 10);
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - 8), cy + Math.sin(a) * (R - 8));
    ctx.lineTo(cx + Math.cos(a) * (R - 2), cy + Math.sin(a) * (R - 2)); ctx.stroke(); }
  /* needle */
  if (frac != null) {
    const a = A(frac);
    ctx.save(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.4; ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (R - 12), cy + Math.sin(a) * (R - 12)); ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.fillStyle = "#e8fbff"; ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "700 21px monospace"; ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,229,255,.6)"; ctx.shadowBlur = 10;
    ctx.fillText(cfg.value == null || !isFinite(cfg.value) ? "—" : (typeof cfg.value === "number" ? +cfg.value.toFixed(1) : cfg.value), cx, cy - 14);
    ctx.shadowBlur = 0;
  }
  if (cfg.unit) { ctx.fillStyle = C.txt; ctx.font = "9.5px monospace"; ctx.textAlign = "center"; ctx.fillText(cfg.unit, cx, cy - 1); }
  if (cfg.label) { ctx.fillStyle = C.txt2; ctx.font = "8.5px monospace"; ctx.textAlign = "center"; ctx.letterSpacing = "1px"; ctx.fillText(cfg.label.toUpperCase(), cx, h - 6); }
}
/* hbars(cv,{rows:[{label,value,max,color,note}]}) */
function hbars(cv, cfg) {
  const rows = cfg.rows || [];
  const H = rows.length * 40 + 12;
  const { ctx, w } = cvSetup(cv, H);
  ctx.clearRect(0, 0, w, H);
  const labW = Math.min(150, w * 0.36), barX = labW + 10, barW = w - barX - 60;
  rows.forEach((r, i) => {
    const y = 10 + i * 40;
    ctx.fillStyle = C.txt; ctx.font = "9.5px monospace"; ctx.textAlign = "left";
    ctx.fillText(r.label.length > 22 ? r.label.slice(0, 21) + "…" : r.label, 6, y + 12);
    ctx.fillStyle = "rgba(120,170,230,.12)";
    ctx.beginPath(); ctx.roundRect(barX, y + 2, barW, 15, 7); ctx.fill();
    const f = clamp(r.value / (r.max || 1), 0, 1);
    const g = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    g.addColorStop(0, r.color); g.addColorStop(1, r.color + "55");
    ctx.fillStyle = g; ctx.shadowColor = r.color; ctx.shadowBlur = 7;
    ctx.beginPath(); ctx.roundRect(barX, y + 2, Math.max(barW * f, 4), 15, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff"; ctx.font = "700 11px monospace";
    ctx.fillText(r.disp != null ? r.disp : (typeof r.value === "number" ? +r.value.toFixed(1) : r.value), barX + barW + 8, y + 14);
    if (r.note) { ctx.fillStyle = C.txt2; ctx.font = "8.5px monospace"; ctx.fillText(r.note, barX, y + 32); }
  });
}
/* exponential decay curve helper */
function decayPts(tau, vmax, n, tmax) { const a = []; for (let i = 0; i <= n; i++) { const t = tmax * i / n; a.push([t, vmax * Math.exp(-t / tau)]); } return a; }
/* per-view redraw registry (resize handling) */
const REDRAW = {};
function regRedraw(view, fn) { (REDRAW[view] = REDRAW[view] || []).push(fn); }
</script>
