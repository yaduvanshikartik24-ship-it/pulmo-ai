<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-VII · ADVANCED PLEURAL FLUID LAB (p23f)
   Ask-anything query parser · 8-graph advanced suite (radar signature,
   disease-zone maps, Bayesian Fagan ladder, evidence heatmap, cell stacks)
   · integrated plAnalyze differential · PDF answer generation
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ─── disease archetype signatures (typical PF values, Light 6e) ──────── */
const PL_SIG = {
  chf:        { n: "CHF transudate",     ph: 7.44, glu: 98,  ldh: 130,  prot: 1.9, ada: 9,  lym: 38, neu: 38, eos: 4 },
  hepatic:    { n: "Hepatic hydrothorax", ph: 7.45, glu: 100, ldh: 95,  prot: 1.4, ada: 7,  lym: 42, neu: 38, eos: 3 },
  ppe:        { n: "Empyema / PPE",      ph: 6.95, glu: 22,  ldh: 4200, prot: 4.1, ada: 68, lym: 12, neu: 86, eos: 1 },
  malignant:  { n: "Malignant effusion", ph: 7.24, glu: 68,  ldh: 950,  prot: 4.3, ada: 24, lym: 64, neu: 32, eos: 3 },
  meso:       { n: "Mesothelioma",       ph: 7.22, glu: 62,  ldh: 800,  prot: 4.4, ada: 22, lym: 58, neu: 34, eos: 3 },
  tb:         { n: "TB pleuritis",       ph: 7.17, glu: 48,  ldh: 950,  prot: 4.9, ada: 76, lym: 91, neu: 7,  eos: 1 },
  pe:         { n: "PE / infarct",       ph: 7.34, glu: 92,  ldh: 620,  prot: 3.6, ada: 17, lym: 26, neu: 72, eos: 9 },
  ra:         { n: "Rheumatoid",         ph: 7.02, glu: 14,  ldh: 2600, prot: 4.2, ada: 62, lym: 56, neu: 24, eos: 8 },
  sle:        { n: "Lupus pleuritis",    ph: 7.33, glu: 86,  ldh: 520,  prot: 3.8, ada: 19, lym: 58, neu: 36, eos: 2 },
  chylothorax:{ n: "Chylothorax",        ph: 7.40, glu: 96,  ldh: 230,  prot: 4.0, ada: 13, lym: 94, neu: 3,  eos: 2 },
  boerhaave:  { n: "Esophageal rupture", ph: 6.05, glu: 55,  ldh: 1600, prot: 3.9, ada: 18, lym: 32, neu: 66, eos: 2 },
  urinothorax:{ n: "Urinothorax",        ph: 7.20, glu: 120, ldh: 80,   prot: 1.0, ada: 6,  lym: 45, neu: 40, eos: 2 },
  pseudochylo:{ n: "Pseudochylothorax",  ph: 7.25, glu: 80,  ldh: 1400, prot: 4.5, ada: 30, lym: 70, neu: 20, eos: 5 },
};
const PL_FEAT_LABEL = {
  fever: "Fever", pneumonia: "Pneumonia", neutro: "Neutro >50%", lympho: "Lympho >50%", lymph95: "Lymph >95%",
  eosino: "Eos >10%", exudate: "EXUDATE", transudate: "TRANSUDATE", phLow: "pH <7.20", phVeryLow: "pH <6.5",
  lowGlucose: "Glu <60", ldhHigh: "LDH >1000", adaHigh: "ADA >40", ifnHigh: "IFN\u03B3 >3.7", ntHigh: "NTpBNP >1500",
  amylHigh: "Amylase \u2191", tgHigh: "TG >110", cholHigh: "Chol >250", cytologyPos: "Cytology +", cytAtyp: "Cytology atyp",
  cytologyNeg: "Cytology \u2212", gramPos: "Gram +", purulent: "Pus", bloody: "Bloody", milky: "Milky",
  mesoLow: "Meso \u22645%", mesoHigh: "Meso >5%", bilateral: "Bilateral", rightOnly: "Right-only", leftOnly: "Left-only",
  massive: "Massive", small: "Small", cancerHx: "Cancer hx", chfHx: "CHF hx", cirrhosis: "Cirrhosis", raHx: "RA hx",
  lupusHx: "SLE hx", asbestos: "Asbestos", smoking: "Smoker", nightSweats: "Night sweats", weightLoss: "Weight loss",
  pleuritic: "Pleuritic pain", chestWallPain: "Chest-wall pain", vomiting: "Vomiting", sudden: "Sudden onset", dvt: "DVT",
  hypoxia: "Hypoxia", tbHx: "TB hx", tbEndemic: "TB endemic", hiv: "HIV", nephrotic: "Nephrotic", ascites: "Ascites",
  cardiomegaly: "Cardiomegaly", proteinGradHigh: "Prot gradient", nodularPleura: "Nodular pleura", chronicWeeks: "Weeks-chronic",
  drugStarted: "New drug", anaerobic: "Feculent", rfHigh: "RF \u2265320", anaPos: "ANA +", smrpHigh: "SMRP \u2191",
  pfCrHigh: "PF Cr > serum", youngWoman: "Young woman", postop: "Post-op", dialysis: "Dialysis", trauma: "Trauma",
  pancreatitis: "Pancreatitis", epigastric: "Epigastric", loculated: "Loculated", infiltrate: "Infiltrate",
};
const plFeatLabel = k => PL_FEAT_LABEL[k] || k;

/* ─── field metadata for the lab ───────────────────────────────────────── */
const PL_FLAB = [
  ["fa-app", "Appearance"], ["fa-rbc", "RBC (/mm\u00B3)"], ["fa-wbc", "WBC (/mm\u00B3)"],
  ["fa-neu", "Neutrophils (%)"], ["fa-lym", "Lymphocytes (%)"], ["fa-eos", "Eosinophils (%)"], ["fa-meso", "Mesothelial cells (%)"],
  ["fa-glu", "PF glucose (mg/dL)"], ["fa-seglu", "Serum glucose (mg/dL)"], ["fa-ph", "PF pH (blood-gas)"],
  ["fa-prot", "PF protein (g/dL)"], ["fa-seprot", "Serum protein (g/dL)"],
  ["fa-ldh", "PF LDH (U/L)"], ["fa-seldh", "Serum LDH (U/L)"], ["fa-uln", "LDH upper limit (U/L)"],
  ["fa-ada", "ADA (U/L)"], ["fa-ifn", "Interferon-\u03B3 (U/mL)"], ["fa-amy", "Amylase (U/L)"],
  ["fa-tg", "Triglycerides (mg/dL)"], ["fa-chol", "Cholesterol (mg/dL)"],
  ["fa-cr", "PF creatinine (mg/dL)"], ["fa-scr", "Serum creatinine (mg/dL)"], ["fa-nt", "NT-proBNP (pg/mL)"],
  ["fa-cyto", "Cytology"], ["fa-gram", "Gram / culture"],
];

/* ─── ASK ENGINE — natural-language parameter extraction ──────────────── */
let plAskCtx = { age: null, sex: null, flags: {} };
function plAskParse(qRaw) {
  let s = " " + String(qRaw).toLowerCase() + " ";
  s = s.replace(/(\d),(\d)/g, "$1$2");                       /* 1,500 → 1500 */
  const fields = {}; let n = 0;
  const take = (re) => { const m = s.match(re); if (m) { s = s.replace(m[0], " "); } return m; };
  const put = (id, v) => { fields[id] = String(v); n++; };
  /* demographics */
  const as = take(/(\d{1,3})\s*(?:yo|y\/o|years?)?\s*[-\s]\s*(?:old\s+)?(male|female|m|f)\b/);
  let age = null, sex = null;
  if (as) { age = parseInt(as[1], 10); sex = as[2][0] === "m" ? "male" : "female"; }
  /* chemistry — serum variants parsed (and consumed) BEFORE general ones */
  const seg = take(/serum\s+(?:glucose|glu)\s*(?:is|of|:|=)?\s*(\d{1,3}(?:\.\d+)?)/); if (seg) put("fa-seglu", seg[1]);
  const sepr = take(/serum\s+(?:protein|prot)\s*(?:is|of|:|=)?\s*(\d{1,2}(?:\.\d+)?)/); if (sepr) put("fa-seprot", sepr[1]);
  const seld = take(/serum\s+ldh\s*(?:is|of|:|=)?\s*(\d{2,6}(?:\.\d+)?)/); if (seld) put("fa-seldh", seld[1]);
  const sech = take(/serum\s+(?:cholesterol|chol)\s*(?:is|of|:|=)?\s*(\d{2,4}(?:\.\d+)?)/); if (sech) put("fa-schol", sech[1]);
  const secr = take(/serum\s+(?:creatinine|creat)\s*(?:is|of|:|=)?\s*(\d{1,3}(?:\.\d+)?)/); if (secr) put("fa-scr", secr[1]);
  const phm = take(/\bp\.?h\b\s*(?:is|of|:|=)?\s*(7\.\d{1,2})/); if (phm) put("fa-ph", phm[1]);
  const glm = take(/(?:glucose|glu)\s*(?:is|of|:|=)?\s*(\d{1,3}(?:\.\d+)?)/); if (glm) put("fa-glu", glm[1]);
  const ldm = take(/\bldh\b\s*(?:is|of|:|=)?\s*(\d{2,6}(?:\.\d+)?)/); if (ldm) put("fa-ldh", ldm[1]);
  const ulm = take(/(?:uln|upper\s*(?:limit|normal)?)\s*(?:is|of|:|=)?\s*(\d{2,4}(?:\.\d+)?)/); if (ulm) put("fa-uln", ulm[1]);
  const prm = take(/(?:protein|prot)\s*(?:is|of|:|=)?\s*(\d{1,2}(?:\.\d+)?)/); if (prm) put("fa-prot", prm[1]);
  const adm = take(/\bada\b\s*(?:is|of|:|=)?\s*(\d{1,3}(?:\.\d+)?)/); if (adm) put("fa-ada", adm[1]);
  const ifm = take(/(?:interferon|ifn)[\s-]*(?:gamma|\u03B3)?\s*(?:is|of|:|=)?\s*(\d{1,3}(?:\.\d+)?)/); if (ifm) put("fa-ifn", ifm[1]);
  const amm = take(/amyl(?:ase)?\s*(?:is|of|:|=)?\s*(\d{2,6}(?:\.\d+)?)/); if (amm) put("fa-amy", amm[1]);
  const tgm = take(/(?:triglycerides?|trigly|\btg\b)\s*(?:is|of|:|=)?\s*(\d{2,5}(?:\.\d+)?)/); if (tgm) put("fa-tg", tgm[1]);
  const chm2 = take(/(?:cholesterol|chol)\s*(?:is|of|:|=)?\s*(\d{2,4}(?:\.\d+)?)/); if (chm2) put("fa-chol", chm2[1]);
  const ntm = take(/(?:nt-?pro-?bnp|ntprobnp|pro-?bnp|\bbnp\b)\s*(?:is|of|:|=)?\s*(\d{2,6}(?:\.\d+)?)/); if (ntm) put("fa-nt", ntm[1]);
  const rbm = take(/\brbc(?:s| count)?\s*(?:is|of|:|=)?\s*(\d{2,7})/); if (rbm) put("fa-rbc", rbm[1]);
  const wbm = take(/\bwbc(?:s| count)?\s*(?:is|of|:|=)?\s*(\d{2,6})/); if (wbm) put("fa-wbc", wbm[1]);
  const nem = take(/(?:neutrophils?|neuts?|pmns?)\s*(?:count)?\s*(?:is|of|:|=)?\s*(\d{1,3})\s*%?/); if (nem) put("fa-neu", nem[1]);
  const lym = take(/(?:lymphocytes?|lymphs?)\s*(?:count)?\s*(?:is|of|:|=)?\s*(\d{1,3})\s*%?/); if (lym) put("fa-lym", lym[1]);
  const eom = take(/(?:eosinophils?|eos)\s*(?:count)?\s*(?:is|of|:|=)?\s*(\d{1,3})\s*%?/); if (eom) put("fa-eos", eom[1]);
  const mem = take(/(?:mesothelial|meso)\s*(?:cells?)?\s*(?:is|of|:|=)?\s*(\d{1,3})\s*%?/); if (mem) put("fa-meso", mem[1]);
  const crm = take(/(?:creatinine|creat)\s*(?:is|of|:|=)?\s*(\d{1,3}(?:\.\d+)?)/); if (crm) put("fa-cr", crm[1]);
  const cym = take(/cytology\s*(?:is|:)?\s*(positive|malignant|negative|atypical)/);
  if (cym) put("fa-cyto", cym[1].indexOf("pos") === 0 || cym[1].indexOf("mal") === 0 ? "pos" : cym[1].indexOf("atyp") === 0 ? "atyp" : "neg");
  const grm = take(/gram(?:\s*stain)?\s*(?:is|:)?\s*(positive|negative)|\bgram\s*\+\+?\b|\bgram\s*-\s*negative\b/);
  if (grm) put("fa-gram", /pos|\+/.test(grm[0]) ? "pos" : "neg");
  /* appearance */
  if (/\b(purulent|pus|empyema)\b/.test(s)) put("fa-app", "purulent");
  else if (/\b(feculent|fecal)\b/.test(s)) put("fa-app", "feculent");
  else if (/\b(milky|turbid|chylous|chyle)\b/.test(s)) put("fa-app", "milky");
  else if (/\b(urine|urinothorax)\b/.test(s)) put("fa-app", "urine");
  else if (/\bblack\b/.test(s)) put("fa-app", "black");
  else if (/\b(bloody|blood|serosanguineous|sanguinous|hemothorax)\b/.test(s)) put("fa-app", "bloody");
  else if (/\b(straw|amber|yellow|serous|clear)\b/.test(s)) put("fa-app", "straw");
  /* clinical context flags (plExtract boolean names) */
  const ctx = {}; let ctxN = 0;
  const CTX = [
    [/fever|febrile/, "fever"], [/pneumonia|consolidat|aspiration/, "pneumonia"],
    [/cancer|malignan|tumou?r|metasta|carcinom|lymphoma|chemo/, "cancerHx"],
    [/tuberculosis|\btb\b/, "tbHx"], [/tb.?endemic|immigrant|contact/, "tbEndemic"],
    [/\bchf\b|heart failure|cardiac failure/, "chfHx"], [/cirrhosis|liver disease|hepatic|ascites/, "cirrhosis"],
    [/rheumatoid|\bra\b/, "raHx"], [/lupus|\bsle\b|\bana\b/, "lupusHx"],
    [/asbestos|shipyard|insulation/, "asbestos"], [/smok|cigarette/, "smokingBool"],
    [/night sweats?/, "nightSweats"], [/weight loss|cachex/, "weightLoss"],
    [/vomit|retch|boerhaave/, "vomiting"], [/chest wall pain/, "chestWallPain"],
    [/pleuritic|sharp chest/, "pleuritic"], [/sudden|acute onset/, "sudden"],
    [/\bdvt\b|immobiliz/, "dvt"], [/hypox|desaturat/, "hypoxia"], [/\bhiv\b/, "hiv"],
    [/post-?\s?op|after surgery|surgery/, "postSurgery"], [/pancreatitis|pancreatic/, "pancreatitis"],
    [/dialysis/, "dialysis"], [/trauma/, "trauma"], [/\bnephrotic\b/, "nephrotic"],
    [/dyspnea|breathless/, "dyspneaBool"], [/nodule|nodular pleura/, "nodularPleura"],
    [/loculat|septat/, "loculated"], [/cardiomegaly/, "cardiomegaly"], [/infiltrate|opacity/, "infiltrate"],
  ];
  CTX.forEach(pair => { if (pair[0].test(s)) { ctx[pair[1]] = true; ctxN++; } });
  if (ctx.smokingBool) { ctx.smoking = "y"; delete ctx.smokingBool; }
  delete ctx.dyspneaBool;
  return { fields, n, age, sex, ctx, ctxN };
}

/* ─── graph engine: generic disease-zone scatter map ──────────────────── */
function plZoneMap(cv, cfg) {
  if (!cv) return;
  const { ctx, w, h } = cvSetup(cv, cfg.h || 235);
  ctx.clearRect(0, 0, w, h);
  const padL = 42, padR = 12, padT = 26, padB = 30;
  const X = v => padL + (v - cfg.xr[0]) / (cfg.xr[1] - cfg.xr[0]) * (w - padL - padR);
  const Y = v => h - padB - (v - cfg.yr[0]) / (cfg.yr[1] - cfg.yr[0]) * (h - padT - padB);
  ctx.fillStyle = C.cy; ctx.font = "bold 9.5px monospace"; ctx.textAlign = "left";
  ctx.fillText(cfg.title, 8, 13);
  (cfg.zones || []).forEach(z => {
    ctx.save();
    ctx.fillStyle = z.color;
    ctx.beginPath(); ctx.ellipse(X(z.x), Y(z.y), Math.max(8, X(z.x + z.rx) - X(z.x)), Math.max(7, Y(z.y) - Y(z.y + z.ry)), 0, 0, 7); ctx.fill();
    ctx.strokeStyle = z.stroke || "rgba(255,255,255,.25)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = z.txt || C.txt; ctx.font = "8px monospace"; ctx.textAlign = "center";
    ctx.fillText(z.label, X(z.x), Y(z.y) - Math.max(7, Y(z.y) - Y(z.y + z.ry)) - 4);
    ctx.restore();
  });
  (cfg.rects || []).forEach(r => {
    ctx.fillStyle = r.color;
    ctx.fillRect(X(r.x0), Y(r.y1), X(r.x1) - X(r.x0), Y(r.y0) - Y(r.y1));
    if (r.label) { ctx.fillStyle = r.txt || C.txt; ctx.font = "8.5px monospace"; ctx.textAlign = "center"; ctx.fillText(r.label, (X(r.x0) + X(r.x1)) / 2, Y(r.y1) + 12); }
  });
  const xs = niceStep(cfg.xr[1] - cfg.xr[0], 5), ys = niceStep(cfg.yr[1] - cfg.yr[0], 4);
  ctx.font = "8.5px monospace"; ctx.fillStyle = C.txt2;
  for (let x = Math.ceil(cfg.xr[0] / xs) * xs; x <= cfg.xr[1] + 1e-9; x += xs) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(X(x), padT); ctx.lineTo(X(x), h - padB); ctx.stroke();
    ctx.textAlign = "center"; ctx.fillText(+x.toFixed(2) + "", X(x), h - padB + 12);
  }
  for (let y = Math.ceil(cfg.yr[0] / ys) * ys; y <= cfg.yr[1] + 1e-9; y += ys) {
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(padL, Y(y)); ctx.lineTo(w - padR, Y(y)); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillText(+y.toFixed(1) + "", padL - 4, Y(y) + 3);
  }
  ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke();
  (cfg.hlines || []).forEach(l => { ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = l.color || C.am;
    ctx.beginPath(); ctx.moveTo(padL, Y(l.y)); ctx.lineTo(w - padR, Y(l.y)); ctx.stroke(); ctx.restore();
    if (l.label) { ctx.fillStyle = l.color || C.am; ctx.font = "bold 8px monospace"; ctx.textAlign = "left"; ctx.fillText(l.label, padL + 4, Y(l.y) - 3); } });
  (cfg.vlines || []).forEach(l => { ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = l.color || C.rd;
    ctx.beginPath(); ctx.moveTo(X(l.x), padT); ctx.lineTo(X(l.x), h - padB); ctx.stroke(); ctx.restore();
    if (l.label) { ctx.fillStyle = l.color || C.rd; ctx.font = "bold 8px monospace"; ctx.textAlign = "left"; ctx.fillText(l.label, X(l.x) + 4, padT + 9); } });
  ctx.fillStyle = C.txt; ctx.font = "8px monospace";
  ctx.textAlign = "right"; ctx.fillText(cfg.yLabel || "", padL - 4, padT - 8);
  ctx.textAlign = "left"; ctx.fillText(cfg.xLabel || "", w - padR - 46, h - padB + 24);
  (cfg.points || []).forEach(p => {
    ctx.save();
    ctx.strokeStyle = p.color || "#fff"; ctx.lineWidth = 1.2; ctx.shadowColor = p.color || "#fff"; ctx.shadowBlur = 9;
    ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 5.5, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(p.x) - 9, Y(p.y)); ctx.lineTo(X(p.x) - 5, Y(p.y)); ctx.moveTo(X(p.x) + 5, Y(p.y)); ctx.lineTo(X(p.x) + 9, Y(p.y));
    ctx.moveTo(X(p.x), Y(p.y) - 9); ctx.lineTo(X(p.x), Y(p.y) - 5); ctx.moveTo(X(p.x), Y(p.y) + 5); ctx.lineTo(X(p.x), Y(p.y) + 9); ctx.stroke();
    ctx.fillStyle = p.color || "#fff"; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 2.6, 0, 7); ctx.fill();
    ctx.restore();
    if (p.label) { ctx.fillStyle = "#fff"; ctx.font = "bold 9px monospace"; ctx.textAlign = "left"; ctx.fillText(p.label, X(p.x) + 11, Y(p.y) + 3); }
  });
  if (!(cfg.points || []).length && cfg.empty) {
    ctx.fillStyle = C.txt2; ctx.font = "9px monospace"; ctx.textAlign = "center";
    ctx.fillText(cfg.empty, (padL + w - padR) / 2, (padT + h - padB) / 2);
  }
}

/* ─── radar signature ─────────────────────────────────────────────────── */
const PL_RADAR_AXES = [
  { k: "ph",  lab: "pH",    lo: 6.0, hi: 7.6, thr: 7.30, fmt: v => v == null ? null : +v.toFixed(2) },
  { k: "glu", lab: "Glucose", lo: 0, hi: 160, thr: 60, fmt: v => v == null ? null : Math.round(v) },
  { k: "ldh", lab: "LDH*",  lo: Math.log(50), hi: Math.log(6000), thr: Math.log(1000), fmt: v => v == null ? null : Math.round(v) },
  { k: "prot", lab: "Protein", lo: 0, hi: 6, thr: 3.0, fmt: v => v == null ? null : +v.toFixed(1) },
  { k: "ada", lab: "ADA",   lo: 0, hi: 100, thr: 40, fmt: v => v == null ? null : Math.round(v) },
  { k: "lym", lab: "Lymph%", lo: 0, hi: 100, thr: 50, fmt: v => v == null ? null : Math.round(v) },
  { k: "neu", lab: "Neut%", lo: 0, hi: 100, thr: 50, fmt: v => v == null ? null : Math.round(v) },
  { k: "eos", lab: "Eos%",  lo: 0, hi: 40, thr: 10, fmt: v => v == null ? null : Math.round(v) },
];
function plRadarPos(v, ax) {
  let p;
  if (v == null) return null;
  if (v <= ax.thr) p = 0.5 * (v - ax.lo) / Math.max(ax.thr - ax.lo, 1e-9);
  else p = 0.5 + 0.5 * (v - ax.thr) / Math.max(ax.hi - ax.thr, 1e-9);
  return Math.max(0.02, Math.min(1, p));
}
function plRadar(cv, d, topIds) {
  if (!cv) return;
  const { ctx, w, h } = cvSetup(cv, 265);
  ctx.clearRect(0, 0, w, h);
  const cx = w * 0.5, cy = h * 0.52, R = Math.min(w * 0.30, h * 0.38);
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / PL_RADAR_AXES.length;
  ctx.fillStyle = C.cy; ctx.font = "bold 9.5px monospace"; ctx.textAlign = "left";
  ctx.fillText("8-AXIS FLUID SIGNATURE \u2014 PATIENT vs ARCHETYPES", 8, 13);
  /* rings */
  [0.25, 0.5, 0.75, 1.0].forEach(r => {
    ctx.beginPath();
    PL_RADAR_AXES.forEach((ax, i) => { const a = ang(i); const x = cx + Math.cos(a) * R * r, y = cy + Math.sin(a) * R * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.closePath();
    if (r === 0.5) { ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = C.am; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore(); }
    else { ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.stroke(); }
  });
  /* spokes + labels */
  PL_RADAR_AXES.forEach((ax, i) => {
    const a = ang(i);
    ctx.strokeStyle = C.grid; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
    ctx.fillStyle = C.txt; ctx.font = "8.5px monospace"; ctx.textAlign = "center";
    ctx.fillText(ax.lab, cx + Math.cos(a) * (R + 16), cy + Math.sin(a) * (R + 14) + 3);
  });
  ctx.fillStyle = C.am; ctx.font = "7.5px monospace"; ctx.textAlign = "center";
  ctx.fillText("dashed ring = decision threshold \u00B7 LDH log scale", cx, h - 5);
  const colors = [C.rd, C.am, C.vt, C.tl];
  const legend = [];
  /* archetype polygons */
  topIds.slice(0, 4).forEach((id, k) => {
    const sig = PL_SIG[id]; if (!sig) return;
    ctx.beginPath(); let any = false;
    PL_RADAR_AXES.forEach((ax, i) => {
      const v = ax.k === "ldh" ? Math.log(Math.max(sig.ldh, 30)) : sig[ax.k];
      const p = plRadarPos(v, ax); const a = ang(i);
      const x = cx + Math.cos(a) * R * p, y = cy + Math.sin(a) * R * p;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); any = true;
    });
    ctx.closePath();
    ctx.save(); ctx.globalAlpha = 0.10; ctx.fillStyle = colors[k]; ctx.fill(); ctx.restore();
    ctx.strokeStyle = colors[k]; ctx.lineWidth = 1.4; ctx.setLineDash([5, 3]); ctx.stroke(); ctx.setLineDash([]);
    legend.push({ c: colors[k], t: sig.n });
  });
  /* patient polygon */
  const dmap = { ph: d.ph, glu: d.glu, ldh: d.pfLdh != null ? Math.log(Math.max(d.pfLdh, 30)) : null, prot: d.pfProt, ada: d.ada, lym: d.lym, neu: d.neut, eos: d.eos };
  const pPts = [];
  ctx.beginPath(); let started = false;
  PL_RADAR_AXES.forEach((ax, i) => {
    const p = plRadarPos(dmap[ax.k], ax); const a = ang(i);
    pPts.push(p);
    const x = cx + Math.cos(a) * R * p, y = cy + Math.sin(a) * R * p;
    if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = C.cy; ctx.fill(); ctx.restore();
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
  PL_RADAR_AXES.forEach((ax, i) => {
    const a = ang(i); const p = pPts[i];
    const x = cx + Math.cos(a) * R * p, y = cy + Math.sin(a) * R * p;
    if (dmap[ax.k] != null) { ctx.fillStyle = "#fff"; ctx.shadowColor = "#fff"; ctx.shadowBlur = 7; ctx.beginPath(); ctx.arc(x, y, 2.8, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
  });
  legend.unshift({ c: "#fff", t: "PATIENT" });
  /* legend */
  ctx.font = "8px monospace"; ctx.textAlign = "left";
  legend.slice(0, 5).forEach((l, i) => {
    const ly = 24 + i * 11;
    ctx.fillStyle = l.c; ctx.fillRect(8, ly - 5, 8, 3);
    ctx.fillStyle = l.c === "#fff" ? C.txt : l.c; ctx.fillText(l.t.slice(0, 26), 20, ly);
  });
}

/* ─── cell-differential stacked bars ──────────────────────────────────── */
function plCellStacks(cv, d) {
  if (!cv) return;
  const rows = [];
  if (d.neut != null || d.lym != null) rows.push({ n: "PATIENT", neu: d.neut || 0, lym: d.lym || 0, eos: d.eos || 0 });
  ["ppe", "tb", "malignant", "chf", "ra"].forEach(id => {
    const s = PL_SIG[id]; if (s) rows.push({ n: s.n, neu: s.neu, lym: s.lym, eos: s.eos });
  });
  const { ctx, w, h } = cvSetup(cv, 30 + rows.length * 26 + 14);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = C.cy; ctx.font = "bold 9.5px monospace"; ctx.textAlign = "left";
  ctx.fillText("CELL DIFFERENTIAL \u2014 PATIENT vs DISEASE ARCHETYPES", 8, 13);
  if (!rows.length) { ctx.fillStyle = C.txt2; ctx.font = "9px monospace"; ctx.textAlign = "center"; ctx.fillText("\u2014 enter a cell differential \u2014", w / 2, h / 2); return; }
  const x0 = 118, x1 = w - 44, bw = x1 - x0;
  rows.forEach((r, i) => {
    const y = 26 + i * 26;
    const other = Math.max(0, 100 - r.neu - r.lym - r.eos);
    ctx.fillStyle = r.n === "PATIENT" ? "#fff" : C.txt; ctx.font = r.n === "PATIENT" ? "bold 9px monospace" : "8.5px monospace"; ctx.textAlign = "right";
    ctx.fillText(r.n.slice(0, 16), x0 - 8, y + 12);
    const segs = [[r.neu, C.rd], [r.lym, C.cy], [r.eos, C.am], [other, "rgba(130,152,189,.35)"]];
    let x = x0;
    segs.forEach(sg => {
      const ww = bw * Math.min(sg[0], 100) / 100;
      ctx.fillStyle = sg[1]; ctx.fillRect(x, y, ww - 1, 15);
      if (ww > 26) { ctx.fillStyle = "#0a1220"; ctx.font = "bold 8px monospace"; ctx.textAlign = "center"; ctx.fillText(Math.round(sg[0]) + "%", x + ww / 2, y + 10); }
      x += ww;
    });
    ctx.strokeStyle = "rgba(140,190,255,.25)"; ctx.strokeRect(x0, y, bw, 15);
  });
  const ly = h - 6; let lx = x0;
  [["Neutrophils", C.rd], ["Lymphocytes", C.cy], ["Eosinophils", C.am], ["Other", "rgba(130,152,189,.35)"]].forEach(l => {
    ctx.fillStyle = l[1]; ctx.fillRect(lx, ly - 6, 8, 6);
    ctx.fillStyle = C.txt; ctx.font = "8px monospace"; ctx.textAlign = "left"; ctx.fillText(l[0], lx + 11, ly);
    lx += 11 + ctx.measureText(l[0]).width + 14;
  });
}

/* ─── Bayesian Fagan ladder ───────────────────────────────────────────── */
function plFagan(cv, r) {
  if (!cv) return;
  const { ctx, w, h } = cvSetup(cv, 235);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = C.cy; ctx.font = "bold 9.5px monospace"; ctx.textAlign = "left";
  ctx.fillText("HOW THE EVIDENCE MOVES THE NEEDLE \u2014 SEQUENTIAL BAYESIAN LADDER", 8, 13);
  const top = r.scored[0];
  const applied = (top.applied || []).slice().sort((a, b) => Math.abs(Math.log(b[1])) - Math.abs(Math.log(a[1]))).filter(x => x[1] > 1.05).slice(0, 6);
  if (!applied.length) {
    ctx.fillStyle = C.txt2; ctx.font = "9px monospace"; ctx.textAlign = "center";
    ctx.fillText("\u2014 no discriminating features entered yet \u2014", w / 2, h / 2); return;
  }
  let p = 0.25; /* pre-test probability of the leading diagnosis in a tapped effusion */
  const steps = [{ lab: "pre-test", p: p * 100, lr: null }];
  applied.forEach(a => { const odds = (p / (1 - p)) * a[1]; p = odds / (1 + odds); steps.push({ lab: plFeatLabel(a[0]), p: p * 100, lr: a[1] }); });
  const padL = 40, padR = 14, padT = 26, padB = 40;
  const X = i => padL + (i / (steps.length - 1)) * (w - padL - padR);
  const Y = v => h - padB - (v / 100) * (h - padT - padB);
  ctx.strokeStyle = C.grid; ctx.fillStyle = C.txt2; ctx.font = "8px monospace";
  [0, 25, 50, 75, 100].forEach(v => { ctx.beginPath(); ctx.moveTo(padL, Y(v)); ctx.lineTo(w - padR, Y(v)); ctx.stroke(); ctx.textAlign = "right"; ctx.fillText(v + "%", padL - 4, Y(v) + 3); });
  ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = C.am;
  ctx.beginPath(); ctx.moveTo(padL, Y(50)); ctx.lineTo(w - padR, Y(50)); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = C.cy; ctx.lineWidth = 2; ctx.shadowColor = C.cy; ctx.shadowBlur = 6;
  ctx.beginPath();
  steps.forEach((s, i) => i ? ctx.lineTo(X(i), Y(s.p)) : ctx.moveTo(X(i), Y(s.p)));
  ctx.stroke(); ctx.shadowBlur = 0; ctx.lineWidth = 1;
  steps.forEach((s, i) => {
    ctx.fillStyle = i ? "#fff" : C.tl; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(X(i), Y(s.p), 4, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = C.txt; ctx.font = "7.5px monospace"; ctx.textAlign = "center";
    const lab = s.lr ? s.lab.slice(0, 12) : "prior";
    ctx.fillText(lab, X(i), h - padB + 12);
    if (s.lr) { ctx.fillStyle = C.am; ctx.font = "bold 7.5px monospace"; ctx.fillText("LR " + (s.lr >= 10 ? Math.round(s.lr) : s.lr.toFixed(1)), X(i), h - padB + 23); }
    ctx.fillStyle = "#fff"; ctx.font = "bold 8.5px monospace";
    ctx.fillText(Math.round(s.p) + "%", X(i), Y(s.p) - 8);
  });
  ctx.fillStyle = C.txt2; ctx.font = "8px monospace"; ctx.textAlign = "left";
  ctx.fillText("each step multiplies the odds by the feature's likelihood ratio (Light 6e) \u2014 prior 25% \u2192 post-test " + Math.round(steps[steps.length - 1].p) + "% for " + top.dx.n, 8, h - 6);
}

/* ─── evidence heatmap ────────────────────────────────────────────────── */
function plHeat(cv, r) {
  if (!cv) return;
  const rows = r.scored.slice(0, 6);
  const feats = {};
  rows.forEach(s => (s.applied || []).forEach(a => { feats[a[0]] = Math.max(feats[a[0]] || 0, Math.abs(Math.log(a[1]))); }));
  const cols = Object.keys(feats).sort((a, b) => feats[b] - feats[a]).slice(0, 9);
  const colW = 46, rowH = 26, x0 = 128, y0 = 30;
  const { ctx, w, h } = cvSetup(cv, y0 + rows.length * rowH + 22);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = C.cy; ctx.font = "bold 9.5px monospace"; ctx.textAlign = "left";
  ctx.fillText("WHY \u2014 EVIDENCE HEATMAP (LR per present feature)", 8, 13);
  if (!cols.length) { ctx.fillStyle = C.txt2; ctx.font = "9px monospace"; ctx.textAlign = "center"; ctx.fillText("\u2014 enter fluid parameters or a clinical query \u2014", w / 2, h / 2); return; }
  cols.forEach((f, i) => {
    ctx.save(); ctx.translate(x0 + i * colW + colW / 2, y0 - 6); ctx.rotate(-0.62);
    ctx.fillStyle = C.txt; ctx.font = "7.5px monospace"; ctx.textAlign = "left";
    ctx.fillText(plFeatLabel(f).slice(0, 16), 0, 0); ctx.restore();
  });
  rows.forEach((s, ri) => {
    const y = y0 + ri * rowH;
    ctx.fillStyle = ri === 0 ? "#fff" : C.txt; ctx.font = ri === 0 ? "bold 8.5px monospace" : "8px monospace"; ctx.textAlign = "right";
    ctx.fillText(s.dx.n.slice(0, 19), x0 - 8, y + 12);
    ctx.fillStyle = C.mg; ctx.font = "bold 8px monospace";
    ctx.fillText((s.p * 100).toFixed(0) + "%", x0 - 8 - ctx.measureText(s.dx.n.slice(0, 19)).width - 34, y + 12);
    cols.forEach((f, ci) => {
      const hit = (s.applied || []).find(a => a[0] === f);
      const x = x0 + ci * colW;
      if (!hit) { ctx.fillStyle = "rgba(120,170,230,.05)"; ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 6); return; }
      const lr = hit[1];
      const lg = Math.abs(Math.log(lr));
      const alpha = Math.min(0.85, 0.18 + lg / 3.4 * 0.7);
      ctx.fillStyle = lr >= 1 ? "rgba(255,56,96," + alpha.toFixed(2) + ")" : "rgba(0,229,255," + alpha.toFixed(2) + ")";
      ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 6);
      ctx.fillStyle = "#fff"; ctx.font = "bold 7.5px monospace"; ctx.textAlign = "center";
      ctx.fillText(lr >= 10 ? Math.round(lr) + "" : lr.toFixed(1), x + colW / 2, y + 13);
    });
  });
  ctx.fillStyle = C.txt2; ctx.font = "7.5px monospace"; ctx.textAlign = "left";
  ctx.fillText("red = supports (\u039B > 1) \u00B7 cyan = argues against (\u039B < 1) \u00B7 intensity \u221D |ln \u039B|", 8, h - 6);
}

/* ══ PART 2 — pane, master runner, PDF answers ═════════════════════════ */

/* collect lab inputs → plAnalyze input object */
function plAdvCollect() {
  const d = {
    age: plAskCtx.age, sex: plAskCtx.sex,
    app: plVal("fa-app"), rbc: plNum("fa-rbc"),
    neut: plNum("fa-neu"), lym: plNum("fa-lym"), eos: plNum("fa-eos"), meso: plNum("fa-meso"),
    glu: plNum("fa-glu"), ph: plNum("fa-ph"),
    pfProt: plNum("fa-prot"), seProt: plNum("fa-seprot"),
    pfLdh: plNum("fa-ldh"), seLdh: plNum("fa-seldh"), uln: plNum("fa-uln"),
    ada: plNum("fa-ada"), ifn: plNum("fa-ifn"), amy: plNum("fa-amy"),
    tg: plNum("fa-tg"), chol: plNum("fa-chol"),
    pfCr: plNum("fa-cr"), seCr: plNum("fa-scr"), nt: plNum("fa-nt"),
    cyto: plVal("fa-cyto") === "na" ? undefined : plVal("fa-cyto"),
    gram: plVal("fa-gram") === "na" ? undefined : plVal("fa-gram"),
  };
  Object.keys(plAskCtx.flags || {}).forEach(k => { if (plAskCtx.flags[k]) d[k] = true; });
  if (plAskCtx.flags && plAskCtx.flags.smoking) d.smoking = "y";
  return d;
}

/* master runner — flags + Bayesian + all 8 graphs */
function plAdvRun() {
  const d = plAdvCollect();
  let r;
  try { r = plAnalyze(d); } catch (e) { return; }
  window._advLast = { d, r, q: (document.getElementById("plAskBox") || {}).value || "" };
  /* differential bars */
  const dxcv = document.getElementById("adv-dx");
  if (dxcv) hbars(dxcv, { rows: r.scored.slice(0, 8).map((s, i) => ({
    label: s.dx.n, value: s.p * 100, max: Math.max(10, r.scored[0].p * 100),
    disp: (s.p * 100).toFixed(1) + "%",
    color: [C.rd, C.am, C.cy, C.vt, C.tl, C.mg, "#7aa7ff", "#6fe0c8"][i] || C.txt2,
    note: i === 0 ? "leading diagnosis" : "" })) });
  /* radar with top differentials that have archetypes */
  const radar = document.getElementById("adv-radar");
  if (radar) plRadar(radar, d, r.scored.map(s => s.dx.id).filter(id => PL_SIG[id]).slice(0, 4));
  /* pH × glucose map */
  const pg = document.getElementById("adv-pg");
  if (pg) plZoneMap(pg, {
    title: "pH \u00D7 GLUCOSE DISEASE-ZONE MAP (Light 6e)", h: 250,
    xr: [6.0, 7.6], yr: [0, 160], xLabel: "PF pH", yLabel: "glucose mg/dL",
    zones: [
      { x: 6.95, y: 22, rx: 0.20, ry: 20, color: "rgba(255,56,96,.14)", label: "EMPYEMA / cPPE" },
      { x: 6.20, y: 45, rx: 0.17, ry: 22, color: "rgba(255,45,120,.16)", label: "ESOPH RUPTURE" },
      { x: 7.05, y: 12, rx: 0.11, ry: 11, color: "rgba(255,180,84,.15)", label: "RA" },
      { x: 7.16, y: 48, rx: 0.10, ry: 15, color: "rgba(0,229,255,.11)", label: "TB" },
      { x: 7.23, y: 66, rx: 0.10, ry: 18, color: "rgba(177,140,255,.12)", label: "MALIGNANT" },
      { x: 7.34, y: 92, rx: 0.07, ry: 13, color: "rgba(0,255,198,.10)", label: "SLE" },
      { x: 7.45, y: 106, rx: 0.09, ry: 18, color: "rgba(61,255,176,.09)", label: "TRANSUDATE" },
    ],
    vlines: [{ x: 7.20, color: C.rd, label: "pH 7.20" }],
    hlines: [{ y: 60, color: C.am, label: "glu 60" }],
    points: (d.ph != null || d.glu != null) ? [{ x: d.ph == null ? 7.3 : d.ph, y: d.glu == null ? 80 : d.glu, color: "#fff", label: "PATIENT" }] : [],
    empty: "\u2014 enter pH and/or glucose \u2014",
  });
  /* Light-space quadrant */
  const c1 = (d.pfProt != null && d.seProt > 0) ? d.pfProt / d.seProt : null;
  const c2 = (d.pfLdh != null && d.seLdh > 0) ? d.pfLdh / d.seLdh : null;
  const ls = document.getElementById("adv-light");
  if (ls) plZoneMap(ls, {
    title: "LIGHT-SPACE \u2014 PROTEIN RATIO \u00D7 LDH RATIO", h: 250,
    xr: [0.2, 0.95], yr: [0.05, 2.2], xLabel: "PF/serum protein", yLabel: "PF/serum LDH",
    rects: [
      { x0: 0.5, x1: 0.95, y0: 0.6, y1: 2.2, color: "rgba(255,56,96,.10)", label: "BOTH CRITERIA \u2014 CLASSIC EXUDATE" },
      { x0: 0.2, x1: 0.5, y0: 0.05, y1: 0.6, color: "rgba(61,255,176,.06)", label: "transudate corner" },
    ],
    zones: [{ x: 0.58, y: 0.38, rx: 0.07, ry: 0.16, color: "rgba(255,180,84,.16)", label: "PSEUDOEXUDATE (CHF diuretics)" }],
    vlines: [{ x: 0.5, color: C.rd, label: "0.50" }],
    hlines: [{ y: 0.6, color: C.rd, label: "0.60" }],
    points: (c1 != null || c2 != null) ? [{ x: c1 == null ? 0.35 : c1, y: c2 == null ? 0.3 : c2, color: "#fff", label: "PATIENT" }] : [],
    empty: "\u2014 enter PF + serum protein/LDH \u2014",
  });
  /* ADA × lymphocyte map */
  const ad = document.getElementById("adv-ada");
  if (ad) plZoneMap(ad, {
    title: "ADA \u00D7 LYMPHOCYTE% \u2014 TB DIAGNOSIS MAP", h: 250,
    xr: [0, 110], yr: [0, 100], xLabel: "ADA U/L", yLabel: "lymphocytes %",
    rects: [
      { x0: 40, x1: 110, y0: 43, y1: 100, color: "rgba(61,255,176,.09)", label: "TB ZONE (ADA>40 + lymphocytic)" },
      { x0: 40, x1: 110, y0: 0, y1: 43, color: "rgba(255,56,96,.08)", label: "EMPYEMA ZONE (neutrophilic)" },
    ],
    zones: [{ x: 62, y: 52, rx: 16, ry: 16, color: "rgba(255,180,84,.15)", label: "RA (extreme chem)" }],
    vlines: [{ x: 40, color: C.tl, label: "ADA 40" }],
    hlines: [{ y: 43, color: C.mg, label: "L/N = 0.75" }],
    points: (d.ada != null || d.lym != null) ? [{ x: d.ada == null ? 20 : d.ada, y: d.lym == null ? 50 : d.lym, color: "#fff", label: "PATIENT" }] : [],
    empty: "\u2014 enter ADA and/or lymphocyte% \u2014",
  });
  /* cell stacks + fagan + heat */
  const ccv = document.getElementById("adv-cell");
  if (ccv) plCellStacks(ccv, d);
  const fcv = document.getElementById("adv-fagan");
  if (fcv) plFagan(fcv, r);
  const hcv = document.getElementById("adv-heat");
  if (hcv) plHeat(hcv, r);
  /* text output */
  const out = document.getElementById("adv-out");
  if (out) {
    const top = r.scored[0];
    const nFeat = Object.keys(r.f || {}).filter(k => r.f[k] === true).length;
    out.innerHTML = `
      ${r.alerts.length ? r.alerts.map(a => `<div class="ai-block ${a.c}"><b>\u26A0 ${esc(a.t)}</b><br><span class="small">${esc(a.w)}</span></div>`).join("") : ""}
      <div class="ai-block bad" style="border-left:3px solid var(--rd)">
        <b style="font-size:13px">${esc(top.dx.n)} \u2014 ${(top.p * 100).toFixed(1)}%</b>
        <span class="chip danger" style="margin-left:6px">LEADING</span>
        <br><span class="small">${esc(top.dx.summ)}</span></div>
      <div class="flex wrap" style="gap:6px;margin:8px 0">
        <span class="chip info">ENGINE CONFIDENCE ${Math.round(r.conf)}%</span>
        <span class="chip info">${nFeat} FEATURES EXTRACTED</span>
        <span class="chip info">${(top.applied || []).length} LRs APPLIED</span>
        <span class="chip ${top.dx.grp === "T" ? "ok" : "warn"}">${top.dx.grp === "T" ? "TRANSUDATE BRANCH" : "EXUDATE BRANCH"}</span>
      </div>
      <h4 style="margin:12px 0 6px;color:var(--am);font-size:10.5px;letter-spacing:.12em">NEXT DIAGNOSTIC STEPS (data-driven ladder)</h4>
      <ul class="checks">${r.steps.map(s => `<li class="warn">${esc(s)}</li>`).join("")}</ul>
      <h4 style="margin:12px 0 6px;color:var(--tl);font-size:10.5px;letter-spacing:.12em">MANAGEMENT \u2014 ${esc(top.dx.n)}</h4>
      <ul class="checks">${top.dx.mgmt.map(m => `<li class="good">${esc(m)}</li>`).join("")}</ul>
      <div class="flex" style="gap:10px;margin-top:14px">
        <button class="btn" onclick="plPdfFluid()">PDF ANSWER \u2014 FULL LAB REPORT \u25B8</button>
      </div>`;
  }
}
function plLabRun() { plFluidRun(); plAdvRun(); }

/* ask runner */
function plAskRun(withPdf) {
  const box = document.getElementById("plAskBox");
  const q = box ? box.value.trim() : "";
  if (!q) { toast("Type a query first \u2014 e.g. \u201CpH 7.10, glucose 30, LDH 1,500, neutrophils 85%, fever, pneumonia\u201D"); return; }
  const res = plAskParse(q);
  if (!res.n) { toast("No parameters recognized \u2014 try \u201CpH 7.10, glucose 30\u201D"); return; }
  /* every ASK fully specifies the case \u2014 reset the panel first so no stale
     values (appearance, cytology, context flags) leak from a previous query */
  plLabResetFields();
  Object.keys(res.fields).forEach(id => { const el = document.getElementById(id); if (el) el.value = res.fields[id]; });
  plAskCtx = { age: res.age, sex: res.sex, flags: res.ctx };
  plLabRun();
  toast("Query parsed \u2014 " + res.n + " parameter" + (res.n > 1 ? "s" : "") + (res.ctxN ? " + " + res.ctxN + " context flags" : "") + " extracted");
  if (withPdf) setTimeout(() => plPdfFluid(), 750);
}
function plLabResetFields() {
  ["fa-rbc","fa-wbc","fa-neu","fa-lym","fa-eos","fa-meso","fa-glu","fa-seglu","fa-ph","fa-prot","fa-seprot","fa-ldh","fa-seldh","fa-uln","fa-ada","fa-ifn","fa-amy","fa-tg","fa-chol","fa-cr","fa-scr","fa-nt"].forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
  const app = document.getElementById("fa-app"); if (app) app.selectedIndex = 0;
  ["fa-cyto","fa-gram"].forEach(id => { const el = document.getElementById(id); if (el) el.selectedIndex = 0; });
  plAskCtx = { age: null, sex: null, flags: {} };
}
function plLabClear() {
  plLabResetFields();
  const box = document.getElementById("plAskBox"); if (box) box.value = "";
  plLabRun();
  toast("Lab reset");
}

/* ─── ADVANCED FLUID LAB pane ─────────────────────────────────────────── */
function buildAdvFluidLab() {
  const el = document.getElementById("plpane-anx");
  if (!el) return;
  const advPanel = (id, title, h) => `<div class="panel brk"><div class="panel-b" style="padding:10px">
    <div class="advct">${title}</div><canvas id="${id}" height="${h || 235}"></canvas></div></div>`;
  el.innerHTML = `
    <div class="panel brk" style="margin-bottom:14px"><div class="panel-b" style="padding:12px">
      <div style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--cyan)">ADVANCED PLEURAL FLUID LAB \u2014 ASK \u00B7 INTERPRET \u00B7 GRAPH \u00B7 PDF</div>
      <p class="small muted" style="margin-top:6px;line-height:1.6">Type any pleural-fluid query in plain language \u2014 the engine extracts every parameter it recognizes (pH, glucose, LDH, protein, ADA, TG, cholesterol, amylase, NT-proBNP, IFN-\u03B3, cell counts, cytology, appearance, clinical context), runs the full ${PL_DX.length}-disease Bayesian differential and renders the complete graph suite. Or fill the panel manually. Every answer can be downloaded as an offline PDF report.</p>
      <textarea id="plAskBox" rows="2" placeholder='e.g. "58M fever and pneumonia, purulent fluid, pH 7.08, glucose 25, LDH 1800, neutrophils 90%, gram positive"'></textarea>
      <div class="flex wrap" style="gap:8px;margin-top:8px">
        <button class="btn" onclick="plAskRun(false)">\u25B8 ASK</button>
        <button class="btn" onclick="plAskRun(true)">\u25B8 ASK + PDF ANSWER</button>
        <button class="btn ghost" onclick="plLabClear()">CLEAR LAB</button>
      </div>
      <div class="pl-chiprow" id="plAskExamples">
        <span class="pl-chip" data-q="58M fever and pneumonia, purulent fluid, pH 7.08, glucose 25, LDH 1800, neutrophils 90%, gram positive">PNEUMONIA + PUS</span>
        <span class="pl-chip" data-q="26F from a TB-endemic area, night sweats, lymphocytes 92%, ADA 68, pH 7.18, glucose 38, mesothelial cells 2%">TB PLEURITIS</span>
        <span class="pl-chip" data-q="74M CHF on diuretics, PF protein 3.4, serum protein 6.2, PF LDH 280, serum LDH 240, NT-proBNP 5200, bilateral">CHF PSEUDOEXUDATE</span>
        <span class="pl-chip" data-q="milky effusion after lymphoma treatment, TG 420, cholesterol 65, lymphocytes 88%">MILKY / CHYLOUS</span>
        <span class="pl-chip" data-q="61M vomiting after heavy alcohol, pH 6.1, amylase 900, neutrophils 75%, left-sided, sudden pleuritic pain">BOERHAAVE?</span>
      </div>
    </div></div>
    <div class="panel brk plcalc"><div class="panel-b" style="padding:12px">
      <div style="font-weight:700;font-size:12.5px;color:#dff3ff">FULL PLEURAL FLUID PANEL \u2014 every field optional</div>
      <div class="plcalc-form" style="grid-template-columns:repeat(auto-fill,minmax(126px,1fr))">
        ${plSel("fa-app", "Appearance", [["straw", "Straw / amber"], ["bloody", "Grossly bloody"], ["milky", "Milky / turbid"], ["purulent", "Frank pus"], ["feculent", "Feculent odor"], ["urine", "Urine-like"], ["black", "Black"], ["viscous", "Very viscous"]], true)}
        ${plIn("fa-rbc", "RBC", "\u2014", "/mm\u00B3")}${plIn("fa-wbc", "WBC", "\u2014", "/mm\u00B3")}
        ${plIn("fa-neu", "Neutrophils", "\u2014", "%")}${plIn("fa-lym", "Lymphocytes", "\u2014", "%")}${plIn("fa-eos", "Eosinophils", "\u2014", "%")}${plIn("fa-meso", "Mesothelial", "\u2014", "%")}
        ${plIn("fa-glu", "PF glucose", "\u2014", "mg/dL")}${plIn("fa-seglu", "Serum glucose", "\u2014", "mg/dL")}${plIn("fa-ph", "pH (blood-gas)", "7.\u2014", "", "0.01")}
        ${plIn("fa-prot", "PF protein", "\u2014", "g/dL")}${plIn("fa-seprot", "Serum protein", "\u2014", "g/dL")}
        ${plIn("fa-ldh", "PF LDH", "\u2014", "U/L")}${plIn("fa-seldh", "Serum LDH", "\u2014", "U/L")}${plIn("fa-uln", "LDH upper limit", "\u2014", "U/L")}
        ${plIn("fa-ada", "ADA", "\u2014", "U/L")}${plIn("fa-ifn", "Interferon-\u03B3", "\u2014", "U/mL")}${plIn("fa-amy", "Amylase", "\u2014", "U/L")}
        ${plIn("fa-tg", "Triglycerides", "\u2014", "mg/dL")}${plIn("fa-chol", "Cholesterol", "\u2014", "mg/dL")}
        ${plIn("fa-cr", "PF creatinine", "\u2014", "mg/dL")}${plIn("fa-scr", "Serum creatinine", "\u2014", "mg/dL")}${plIn("fa-nt", "NT-proBNP", "\u2014", "pg/mL")}
        ${plSel("fa-cyto", "Cytology", [["na", "Not sent"], ["neg", "Negative"], ["atyp", "Atypical"], ["pos", "Positive"]], true)}
        ${plSel("fa-gram", "Gram / culture", [["na", "Not sent"], ["neg", "Negative"], ["pos", "Positive"]], true)}
        <div style="grid-column:1/-1" class="flex" >
          <button class="btn mini" onclick="plLabRun()">INTERPRET + FULL GRAPHS \u25B8</button>
          <button class="btn mini ghost" onclick="plPdfFluid()">PDF ANSWER \u25B8</button>
        </div>
      </div>
      <ul class="checks" id="fa-out" style="margin-top:8px"></ul>
      <canvas id="fa-chart"></canvas>
    </div></div>
    <div class="pl-grid2">
      ${advPanel("adv-radar", "RADAR \u2014 8-AXIS FLUID SIGNATURE vs DISEASE ARCHETYPES", 265)}
      ${advPanel("adv-pg", "DISEASE-ZONE MAP \u2014 pH \u00D7 GLUCOSE", 250)}
      ${advPanel("adv-light", "LIGHT-SPACE \u2014 PROTEIN RATIO \u00D7 LDH RATIO", 250)}
      ${advPanel("adv-ada", "TB MAP \u2014 ADA \u00D7 LYMPHOCYTE%", 250)}
      ${advPanel("adv-dx", "BAYESIAN DIFFERENTIAL \u2014 ${PL_DX.length} DISEASE MODELS", 240)}
      ${advPanel("adv-heat", "EVIDENCE HEATMAP \u2014 WHY THE ENGINE VOTED THIS WAY", 210)}
      ${advPanel("adv-fagan", "BAYESIAN LADDER \u2014 PRE-TEST \u2192 POST-TEST PROBABILITY", 235)}
      ${advPanel("adv-cell", "CELL DIFFERENTIAL STACKS \u2014 PATIENT vs ARCHETYPES", 200)}
    </div>
    <div id="adv-out" style="margin-top:14px"></div>`;
  document.querySelectorAll("#plAskExamples .pl-chip").forEach(c => c.addEventListener("click", () => {
    const box = document.getElementById("plAskBox");
    if (box) box.value = c.getAttribute("data-q");
    plAskRun(false);
  }));
  setTimeout(() => { try { plLabRun(); } catch (e) {} }, 80);
}

/* ─── PDF: full lab report ────────────────────────────────────────────── */
function plPdfFluid() {
  const last = window._advLast;
  if (!last) { toast("Run an analysis first (ASK or INTERPRET)"); return; }
  const { d, r, q } = last;
  const inputs = [];
  PL_FLAB.forEach(([id, lab]) => {
    const el = document.getElementById(id);
    if (!el) return;
    let v = el.value;
    if (el.tagName === "SELECT" && el.selectedIndex >= 0) v = el.options[el.selectedIndex].textContent;
    if (v === "" || v == null) return;
    inputs.push([lab, v]);
  });
  if (d.age != null) inputs.unshift(["Age / Sex", d.age + (d.sex ? " " + d.sex : "")]);
  const flags = [];
  document.querySelectorAll("#fa-out li").forEach(li => flags.push({
    label: "", body: li.innerText.replace(/\s+/g, " ").trim(),
    cls: li.classList.contains("bad") ? "bad" : li.classList.contains("warn") ? "warn" : "good" }));
  const charts = [
    { cv: document.getElementById("fa-chart"), title: "ANALYTE POSITION vs DECISION THRESHOLDS" },
    { cv: document.getElementById("adv-radar"), title: "8-AXIS FLUID SIGNATURE \u2014 PATIENT vs DISEASE ARCHETYPES" },
    { cv: document.getElementById("adv-pg"), title: "DISEASE-ZONE MAP \u2014 pH \u00D7 GLUCOSE (Light 6e)" },
    { cv: document.getElementById("adv-light"), title: "LIGHT-SPACE \u2014 PROTEIN RATIO \u00D7 LDH RATIO" },
    { cv: document.getElementById("adv-ada"), title: "TB DIAGNOSIS MAP \u2014 ADA \u00D7 LYMPHOCYTE %" },
    { cv: document.getElementById("adv-dx"), title: "BAYESIAN DIFFERENTIAL \u2014 " + PL_DX.length + " DISEASE MODELS" },
    { cv: document.getElementById("adv-heat"), title: "EVIDENCE HEATMAP \u2014 LIKELIHOOD RATIOS PER FEATURE" },
    { cv: document.getElementById("adv-fagan"), title: "BAYESIAN LADDER \u2014 SEQUENTIAL PROBABILITY UPDATES" },
    { cv: document.getElementById("adv-cell"), title: "CELL DIFFERENTIAL STACKS \u2014 PATIENT vs ARCHETYPES" },
  ];
  const top = r.scored[0];
  const now = new Date();
  PPDF.answer({
    title: "ADVANCED PLEURAL FLUID LAB",
    subtitle: "Query \u2192 parse \u2192 interpret \u2192 graph \u2192 PDF \u00B7 all offline",
    filename: "pulmo-fluid-lab-answer.pdf",
    meta: [["Generated", now.toLocaleString ? now.toLocaleString() : now.toISOString()],
      ["Engine", "ASK parser + 30-disease Bayesian (Light 6e LRs) + 9-graph suite"],
      ["Confidence", Math.round(r.conf) + "%"]],
    sections: [
      q ? { h: "Query asked", text: q } : { h: "Query asked", text: "(manual panel entry \u2014 no free-text query)" },
      { h: "Pleural fluid panel entered", table: { head: ["Parameter", "Value"], rows: inputs.length ? inputs : [["\u2014", "no fields filled"]], widths: [0.55, 0.45] } },
      { h: "Interpretation flags", blocks: flags.length ? flags : [{ label: "No abnormal flags", body: "No thresholds crossed for the parameters entered.", cls: "good" }] },
      r.alerts.length ? { h: "Guardrail alerts", blocks: r.alerts.map(a => ({ label: a.t, body: a.w, cls: a.c })) } : { h: "Guardrail alerts", blocks: [{ label: "None triggered", body: "No emergency guardrails fired for this data set.", cls: "good" }] },
      { h: "Bayesian differential (leading 8)", table: { head: ["Diagnosis", "Posterior"], rows: r.scored.slice(0, 8).map(s => [s.dx.n, (s.p * 100).toFixed(1) + "%"]), widths: [0.72, 0.28], colors: [null, "#00E5B0"] } },
      { h: "Graphs", charts },
      { h: "Next diagnostic steps (data-driven ladder)", bullets: r.steps },
      { h: "Management \u2014 " + top.dx.n, bullets: top.dx.mgmt, bulletColor: "#3DFFB0" },
    ],
    source: "Corpus: Light's Pleural Diseases 6th Edition (Richard W. Light) \u2014 full 522-page scan (native text + OCR). Thresholds, likelihood ratios and disease archetypes transcribed from chapters 7\u20138 and disease chapters.",
  });
}

/* ─── PDF: any pleural calculator card ────────────────────────────────── */
const PL_PDF_META = {
  lc: { name: "Light's Criteria Interpreter", titles: ["LIGHT'S CRITERIA \u2014 RATIOS vs THRESHOLDS", "P(EXUDATE) vs PROTEIN RATIO \u2014 LR MODEL"] },
  pp: { name: "Parapneumonic Classifier", titles: ["ACCP CATEGORY \u2014 POOR-OUTCOME RISK"] },
  mn: { name: "Manometry / Elastance Simulator", titles: ["PLEURAL P\u2013V MANOMETRY CURVES", "PLEURAL SPACE ELASTANCE GAUGE"] },
  px: { name: "Pneumothorax Size + Plan", titles: ["PSP RECURRENCE \u2014 SADIKOT 54-MONTH SERIES"] },
  ch: { name: "Chylothorax Discriminator", titles: ["LIPID DISCRIMINATOR BARS"] },
  hx: { name: "Hemothorax Criterion", titles: ["PF HEMATOCRIT DECISION ZONES"] },
  le: { name: "LENT Score \u2014 MPE Prognosis", titles: ["LENT vs MEDIAN SURVIVAL (Clive 2014)"] },
  v: { name: "Effusion Volume Estimator", titles: ["RADIOGRAPHIC VOLUME LADDER"] },
  roc: { name: "Diagnostic Performance Analytics", titles: ["ROC \u2014 LIGHT 6E META-ANALYSES", "SENSITIVITY / SPECIFICITY 95% CI FOREST"] },
};
function plPdfCalc(cardId) {
  const card = document.getElementById("plcard-" + cardId);
  const meta = PL_PDF_META[cardId] || { name: cardId.toUpperCase(), titles: [] };
  if (!card) { toast("Card not found: " + cardId); return; }
  PPDF.fromCalc(card, {
    name: meta.name, slug: "pleural-" + cardId,
    subtitle: "Pleural Diseases suite \u00B7 Light's Pleural Diseases 6e",
    engine: "pleural calculator + graph suite",
    source: "Corpus: Light's Pleural Diseases 6th Edition \u2014 full 522-page scan.",
    titles: meta.titles,
  });
}

/* ─── PDF: AI consult report ──────────────────────────────────────────── */
function plPdfConsult() {
  const last = window._plLast;
  if (!last || !last.r) { toast("Run a consult analysis first"); return; }
  const { d, r } = last;
  const top = r.scored[0];
  const facts = [];
  if (d.age != null) facts.push(["Age / Sex", d.age + (d.sex ? " " + d.sex : "")]);
  if (d.side) facts.push(["Side", d.side]);
  if (d.size && d.size !== "none") facts.push(["Size", d.size]);
  if (r.f.exudate) facts.push(["Light's classification", "EXUDATE"]);
  if (r.f.pseudoex) facts.push(["Light's classification", "PSEUDOEXUDATE \u2192 transudate"]);
  if (r.f.transudate && !r.f.pseudoex && r.f.hadLight) facts.push(["Light's classification", "TRANSUDATE"]);
  if (r.f.neutro) facts.push(["Cell pattern", "neutrophilic"]);
  if (r.f.lympho) facts.push(["Cell pattern", "lymphocyte-predominant"]);
  if (r.f.adaHigh) facts.push(["ADA", "> 40 U/L"]);
  if (r.f.phLow) facts.push(["pH", "< 7.20"]);
  if (r.f.lowGlucose) facts.push(["Glucose", "< 60 mg/dL"]);
  const charts = [];
  if (document.getElementById("plDxBars")) charts.push({ cv: document.getElementById("plDxBars"), title: "BAYESIAN DIFFERENTIAL \u2014 LOG-ODDS FUSION" });
  if (document.getElementById("plConfGauge")) charts.push({ cv: document.getElementById("plConfGauge"), title: "ENGINE CONFIDENCE" });
  const now = new Date();
  PPDF.answer({
    title: "PLEURAL AI CONSULT",
    subtitle: "Patient + history + imaging + fluid \u2192 diagnosis & differential",
    filename: "pulmo-pleural-consult.pdf",
    meta: [["Generated", now.toLocaleString ? now.toLocaleString() : now.toISOString()],
      ["Engine", "4-layer fusion: Light's branch \u2192 guardrails \u2192 Bayesian \u2192 next-step ladder"],
      ["Confidence", Math.round(r.conf) + "%"]],
    sections: [
      { h: "Case features", table: { head: ["Feature", "Value"], rows: facts.length ? facts : [["\u2014", "minimal data entered"]], widths: [0.45, 0.55] } },
      r.alerts.length ? { h: "Guardrail alerts", blocks: r.alerts.map(a => ({ label: a.t, body: a.w, cls: a.c })) } : null,
      { h: "Leading diagnosis", blocks: [{ label: top.dx.n + "  (" + (top.p * 100).toFixed(1) + "%)", body: top.dx.summ, cls: "bad" }] },
      { h: "Differential (ranked)", table: { head: ["Diagnosis", "Posterior"], rows: r.scored.slice(0, 8).map(s => [s.dx.n, (s.p * 100).toFixed(1) + "%"]), widths: [0.72, 0.28], colors: [null, "#00E5B0"] } },
      charts.length ? { h: "Graphs", charts } : null,
      { h: "Next diagnostic steps", bullets: r.steps },
      { h: "Management \u2014 " + top.dx.n, bullets: top.dx.mgmt, bulletColor: "#3DFFB0" },
      { h: "Second considerations", blocks: r.scored.slice(1, 4).map(s => ({ label: s.dx.n + "  (" + (s.p * 100).toFixed(1) + "%)", body: s.dx.mgmt[0], cls: "warn" })) },
    ].filter(Boolean),
    source: "Corpus: Light's Pleural Diseases 6th Edition (Richard W. Light) \u2014 full 522-page scan. Engine: " + PL_DX.length + "-disease Bayesian differential + Light's-criteria classifier + rule guardrails + next-step ladder.",
  });
}
</script>
