<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-VI · PLEURAL CALCULATORS + GRAPHS (p23b)
   10 graphed tools driven by Light's Pleural Diseases 6e
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ─── helpers ─────────────────────────────────────────────────────────── */
function plNum(id){ const el = document.getElementById(id); if (!el) return null; const v = parseFloat(String(el.value).trim()); return isFinite(v) ? v : null; }
function plVal(id){ const el = document.getElementById(id); return el ? el.value : ""; }
function plFlag(ok, good){ return ok ? (good ? "good" : "warn") : "bad"; }
/* binormal-ish ROC curve generator through a given (fpr, tpr) point */
function plRoc(fpr, tpr, n){
  const pts = [];
  for (let i = 0; i <= n; i++){
    const x = i / n;
    if (x <= fpr){
      const f = x / Math.max(fpr, 1e-6);
      pts.push([x, Math.pow(f, 0.45) * tpr]);
    } else {
      const f = (x - fpr) / Math.max(1 - fpr, 1e-6);
      pts.push([x, tpr + (1 - Math.pow(1 - f, 0.45)) * (1 - tpr)]);
    }
  }
  return pts;
}
function plAuc(pts){ let a = 0; for (let i = 1; i < pts.length; i++) a += (pts[i][0] - pts[i-1][0]) * (pts[i][1] + pts[i-1][1]) / 2; return a; }

/* ══ 1 · LIGHT'S CRITERIA INTERPRETER ═════════════════════════════════ */
function plLightRun(){
  const pfProt = plNum("lc-pfprot"), seProt = plNum("lc-seprot"), pfLdh = plNum("lc-pfldh"), seLdh = plNum("lc-seldh"), uln = plNum("lc-uln");
  const nt = plNum("lc-nt"), albS = plNum("lc-salb"), albP = plNum("lc-palb");
  const box = document.getElementById("lc-out");
  if (pfProt == null || seProt == null || pfLdh == null){
    box.innerHTML = `<div class="ai-block warn">Enter pleural fluid and serum values to classify.</div>`; return;
  }
  const c1 = seProt > 0 ? pfProt / seProt : null;
  const c2 = seLdh > 0 ? pfLdh / seLdh : null;
  const c3 = uln > 0 ? pfLdh / uln : null;
  const m1 = c1 != null && c1 > 0.5, m2 = c2 != null && c2 > 0.6, m3 = c3 != null && c3 > 2/3;
  const met = [m1, m2, m3].filter(Boolean).length;
  const isEx = met > 0;
  const protGrad = (seProt != null && pfProt != null) ? seProt - pfProt : null;
  const albGrad = (albS != null && albP != null) ? albS - albP : null;
  const ntRescue = nt != null && nt > 1500;
  const gradRescue = protGrad != null && protGrad > 3.1;
  const albRescue = albGrad != null && albGrad > 1.2;
  const rescued = isEx && (gradRescue || ntRescue || albRescue);
  const rows = [
    { label: "PF/serum protein", value: c1 != null ? c1 : 0, disp: c1 == null ? "—" : c1.toFixed(2), cut: 0.5, note: m1 ? "EXUDATE CRITERION MET (>0.50)" : "criterion not met" },
    { label: "PF/serum LDH", value: c2 != null ? c2 : 0, disp: c2 == null ? "—" : c2.toFixed(2), cut: 0.6, note: m2 ? "EXUDATE CRITERION MET (>0.60)" : "criterion not met" },
    { label: "PF LDH ÷ ULN", value: c3 != null ? c3 : 0, disp: c3 == null ? "—" : c3.toFixed(2), cut: 2/3, note: m3 ? "EXUDATE CRITERION MET (>⅔)" : "criterion not met" },
  ];
  let verdict, cls, extra = "";
  if (!isEx){
    verdict = "TRANSUDATIVE EFFUSION"; cls = "good";
    extra = "None of Light's 3 criteria met (sensitivity ~98% for exudates). Treat the systemic cause — CHF, cirrhosis, nephrosis, or consider urinothorax (send PF creatinine) and PE. No further pleural workup required if the clinical picture fits.";
  } else if (rescued){
    verdict = "PSEUDOEXUDATE → TRANSUDATE"; cls = "warn";
    extra = "Meets exudate criteria BUT rescue test positive: " +
      (gradRescue ? `serum−PF protein gradient ${protGrad.toFixed(1)} > 3.1 g/dL ` : "") +
      (ntRescue ? `NT-proBNP ${(nt/1000).toFixed(1)}k > 1,500 pg/mL ` : "") +
      (albRescue ? `albumin gradient ${albGrad.toFixed(1)} > 1.2 g/dL` : "") +
      ". ~25% of CHF transudates misclassify after diuretics — relabel as transudate and treat heart failure. (Heffner: borderline values with protein ratio < 0.65 are typical of pseudoexudates.)";
  } else {
    verdict = "EXUDATIVE EFFUSION"; cls = "bad";
    extra = met + " of 3 criteria met. Local pleural disease is present — proceed with the full exudate panel: differential cell count, glucose, pH (blood-gas analyzer), LDH, cytology (50–100 mL), and a TB marker (ADA or interferon-γ). " +
      (protGrad != null && protGrad > 2.5 && protGrad <= 3.1 ? "Borderline protein gradient — consider NT-proBNP to exclude a CHF pseudoexudate. " : "");
  }
  box.innerHTML = `
    <div class="ai-block ${cls}" style="margin:0 0 12px"><b style="font-size:13px">${verdict}</b><br><span class="small">${esc(extra)}</span></div>
    <canvas id="lc-bars" height="150"></canvas>
    <div class="ai-block info" style="margin-top:12px"><b>Rescue panel</b><br>
      <span class="small">Serum−PF protein gradient: <b>${protGrad == null ? "—" : protGrad.toFixed(2) + " g/dL"}</b> ${gradRescue ? "→ transudate" : ""} · NT-proBNP: <b>${nt == null ? "—" : Math.round(nt) + " pg/mL"}</b> ${ntRescue ? "→ CHF" : ""} · Albumin gradient: <b>${albGrad == null ? "—" : albGrad.toFixed(2) + " g/dL"}</b> ${albRescue ? "→ transudate" : ""}</span></div>`;
  hbars(document.getElementById("lc-bars"), { rows: rows.map(r => ({
    label: r.label, value: Math.max(r.value, 0), max: Math.max(1.0, r.value * 1.15),
    disp: r.disp + (r.value != null && r.value > r.cut ? " ▲" : ""),
    color: r.value != null && r.value > r.cut ? C.rd : C.tl, note: r.note })) });
  /* probability curve: P(exudate) vs protein ratio via LR (Heffner continuous approx) */
  const cv = document.getElementById("lc-prob");
  if (cv){
    const pre = 0.45; /* clinic prevalence of exudate among tapped effusions */
    const LRs = [0.14, 0.35, 0.62, 1.2, 2.6, 5.1, 8.7];
    const ratios = [0.25, 0.35, 0.42, 0.5, 0.6, 0.75, 0.9];
    const pts = [];
    for (let i = 0; i <= 60; i++){
      const x = 0.2 + i * 0.012;
      let lr;
      if (x <= ratios[0]) lr = LRs[0];
      else { /* log-interpolate */
        let j = 0; while (j < ratios.length - 1 && x > ratios[j + 1]) j++;
        const t = (Math.log(x) - Math.log(ratios[j])) / (Math.log(ratios[Math.min(j+1, ratios.length-1)]) - Math.log(ratios[j]) || 1);
        lr = Math.exp(Math.log(LRs[j]) + t * (Math.log(LRs[Math.min(j+1, LRs.length-1)]) - Math.log(LRs[j])));
      }
      const odds = (pre / (1 - pre)) * lr;
      pts.push([x, 100 * odds / (1 + odds)]);
    }
    const map = plot2(cv, { h: 210, title: "P(EXUDATE) vs PROTEIN RATIO — LIKELIHOOD-RATIO MODEL (HEFFNER)",
      series: [{ pts, color: C.cy, w: 2 }],
      vlines: [{ x: 0.5, color: C.am, label: "Light 0.50" }],
      bands: [{ y0: 0, y1: 20, color: "rgba(61,255,176,.07)", label: "transudate zone" }, { y0: 80, y1: 100, color: "rgba(255,56,96,.08)", label: "exudate zone" }],
      xr: [0.2, 0.95], yr: [0, 100], xLabel: "PF/serum protein", yLabel: "P(exudate) %" });
    if (c1 != null && c1 >= 0.2 && c1 <= 0.95){
      const pAt = pts.reduce((a, b) => Math.abs(b[0] - c1) < Math.abs(a[0] - c1) ? b : a)[1];
      const ctx2 = cv.getContext("2d"); const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx2.save(); ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2.fillStyle = "#fff"; ctx2.shadowColor = "#fff"; ctx2.shadowBlur = 8;
      ctx2.beginPath(); ctx2.arc(map.X(c1), map.Y(pAt), 4, 0, 7); ctx2.fill(); ctx2.shadowBlur = 0;
      ctx2.font = "bold 9px monospace"; ctx2.fillStyle = "#fff"; ctx2.textAlign = "left";
      ctx2.fillText("patient " + c1.toFixed(2) + " → " + pAt.toFixed(0) + "%", map.X(c1) + 7, map.Y(pAt) - 6);
      ctx2.restore();
    }
  }
}

/* ══ 2 · PLEURAL FLUID PANEL ANALYZER ═════════════════════════════════ */
function plFluidRun(){
  const app = plVal("fa-app"), rbc = plNum("fa-rbc"), wbc = plNum("fa-wbc"),
    neu = plNum("fa-neu"), lym = plNum("fa-lym"), eos = plNum("fa-eos"), meso = plNum("fa-meso"),
    glu = plNum("fa-glu"), ph = plNum("fa-ph"), ldh = plNum("fa-ldh"), ada = plNum("fa-ada"),
    amy = plNum("fa-amy"), tg = plNum("fa-tg"), chol = plNum("fa-chol"), cr = plNum("fa-cr"), scr = plNum("fa-scr"),
    cyto = plVal("fa-cyto"), gram = plVal("fa-gram");
  const out = document.getElementById("fa-out");
  const F = []; /* findings */
  if (app === "purulent") F.push({ t: "Frank pus", c: "bad", w: "empyema — drain, no further tests needed to decide" });
  if (app === "feculent") F.push({ t: "Feculent odor/appearance", c: "bad", w: "anaerobic empyema — drain + anaerobic antibiotics" });
  if (app === "urine") F.push({ t: "Urine appearance/odor", c: "bad", w: "urinothorax — check PF creatinine > serum" });
  if (app === "milky") F.push({ t: "Milky", c: "warn", w: "chylothorax (TG > 110) vs pseudochylothorax (chol > 250) vs empyema (clears on centrifuge)" });
  if (app === "black") F.push({ t: "Black fluid", c: "warn", w: "Aspergillus niger, Rhizopus, melanoma, old hemorrhage" });
  if (rbc != null && rbc > 100000) F.push({ t: "Grossly bloody (RBC > 100k)", c: "warn", w: "malignancy, PE, trauma, hemothorax (check PF hematocrit ≥ 50% of blood), post-CABG" });
  if (neu != null && neu > 50) F.push({ t: "Neutrophil-predominant", c: "warn", w: "acute process: parapneumonic, PE, pancreatitis, subphrenic abscess, early TB (< 2 wk symptoms)" });
  if (lym != null && lym > 50) F.push({ t: "Lymphocyte-predominant", c: "warn", w: "chronic: malignancy, TB, post-CABG, PE — the 4 commonest causes" });
  if (lym != null && lym > 95) F.push({ t: "Lymphocytes > 95%", c: "warn", w: "TB or lymphoma until proven otherwise" });
  if (eos != null && eos > 10) F.push({ t: "Eosinophilia > 10%", c: "warn", w: "usually air/blood in space (prior pneumothorax or thoracentesis) — TB essentially excluded; benign prognosis in PPE" });
  if (meso != null && meso > 5) F.push({ t: "Mesothelial cells > 5%", c: "good", w: "TB virtually excluded (unless HIV with CD4 < 100)" });
  if (glu != null && glu < 60) F.push({ t: "Glucose < 60 mg/dL", c: "bad", w: "narrow to: parapneumonic, malignant, TB, rheumatoid (+ paragonimiasis, hemothorax, Churg-Strauss, urinothorax, occasionally lupus)" });
  if (glu != null && glu < 40) F.push({ t: "Glucose < 40 mg/dL", c: "bad", w: "drainage indicated if parapneumonic; RA often < 30, even < 5" });
  if (ph != null && ph < 7.2) F.push({ t: "pH < 7.20", c: "bad", w: "the 10 causes: complicated PPE, esophageal rupture (lowest, < 6.0), RA, TB, malignant, hemothorax, systemic acidosis (check blood pH), paragonimiasis, lupus, urinothorax" });
  if (ph != null && ph < 7.0) F.push({ t: "pH < 7.00", c: "bad", w: "complicated PPE until proven otherwise — tube thoracostomy (if parapneumonic context)" });
  if (ldh != null && ldh > 1000) F.push({ t: "LDH > 1,000 U/L", c: "bad", w: "intense inflammation: empyema, RA, esophageal rupture, malignancy; serial rising LDH = escalate workup" });
  if (ada != null && ada > 40) F.push({ t: "ADA > 40 U/L", c: "bad", w: "TB suggested (sens 92% / spec 90%) — also high in empyema & RA; check lymphocyte predominance & L/N > 0.75 raises specificity" });
  if (ada != null && ada > 70) F.push({ t: "ADA > 70 U/L", c: "bad", w: "essentially diagnostic of TB unless empyema or rheumatoid pleuritis (Ocana: all > 70 were TB)" });
  if (ada != null && ada < 40 && lym != null && lym > 50) F.push({ t: "ADA < 40 + lymphocytic", c: "good", w: "TB effectively excluded (only 2% of non-TB lymphocytic effusions exceed 40)" });
  if (amy != null && amy > 110) F.push({ t: "Amylase elevated", c: "warn", w: "pancreatic disease (P-isoamylase), esophageal rupture (salivary), or malignancy (10%, salivary-type). > 1,000 U/L = chronic pancreatic fistula" });
  if (tg != null && tg > 110) F.push({ t: "Triglycerides > 110 mg/dL", c: "warn", w: "chylothorax established if PF/serum cholesterol ratio < 1.0" });
  if (chol != null && chol > 250) F.push({ t: "Cholesterol > 250 mg/dL", c: "warn", w: "pseudochylothorax (chyliform) — esp. with crystals + chronic thickened pleura (TB/RA history)" });
  if (cr != null && scr != null && cr > scr) F.push({ t: "PF creatinine > serum", c: "warn", w: "urinothorax — relieve obstruction" });
  if (cyto === "pos") F.push({ t: "Cytology POSITIVE", c: "bad", w: "malignant effusion established — stage + LENT + symptom-directed drainage" });
  if (gram === "pos") F.push({ t: "Gram stain positive", c: "bad", w: "large bacterial burden — immediate drainage regardless of chemistry" });
  /* integrated signature inference */
  const sig = [];
  if (glu != null && glu < 60 && ph != null && ph < 7.2 && lym != null && lym > 50 && ada != null && ada > 40) sig.push(["TB / rheumatoid / malignant", "low glucose + low pH + lymphocytosis + high ADA"]);
  if (glu != null && glu < 30 && ph != null && ph < 7.2 && ldh != null && ldh > 1000) sig.push(["Rheumatoid pleuritis", "the most extreme chemistry: glucose < 30, pH < 7.2, LDH > 1,000 — confirm RF ≥ 1:320"]);
  if (neu != null && neu > 50 && (ph != null && ph < 7.2 || glu != null && glu < 60)) sig.push(["Complicated parapneumonic", "neutrophils + pH/glucose hit — classify (Light/ACCP) and drain"]);
  if (app === "milky" && tg != null && tg > 110) sig.push(["Chylothorax", "milky + TG > 110 — trauma/surgery or lymphoma"]);
  if (app === "milky" && chol != null && chol > 250) sig.push(["Pseudochylothorax", "milky + cholesterol > 250 — chronic TB/RA effusion"]);
  if (amy != null && amy > 1000) sig.push(["Chronic pancreatic effusion", "amylase > 1,000 — pseudocyst-pleural fistula"]);
  if (ph != null && ph < 6.5) sig.push(["Esophageal rupture", "the ONLY effusion with pH this low — check amylase (salivary), food particles, recent retching"]);
  out.innerHTML = (F.length ? F.map(f => `<li class="${f.c}"><b>${f.t}</b> — ${esc(f.w)}</li>`).join("") : `<li class="good">No abnormal flags — enter more analytes for deeper interpretation.</li>`) +
    (sig.length ? `</ul><div class="ai-block bad" style="margin-top:10px"><b>Integrated signatures</b><ul style="margin:6px 0 0 16px" class="small">${sig.map(s => `<li><b>${s[0]}</b>: ${esc(s[1])}</li>`).join("")}</ul></div><ul style="display:none">` : "");
  /* analyte z-position chart vs typical disease ranges */
  const cv = document.getElementById("fa-chart");
  if (cv){
    const zones = [];
    if (glu != null) zones.push({ lab: "Glucose", v: glu, lo: 0, hi: 160, bad: [[0, 60]], good: [[60, 160]], unit: "mg/dL" });
    if (ph != null) zones.push({ lab: "pH", v: ph, lo: 6.0, hi: 7.6, bad: [[6.0, 7.2]], good: [[7.2, 7.6]], unit: "" });
    if (ada != null) zones.push({ lab: "ADA", v: ada, lo: 0, hi: 100, bad: [[40, 100]], good: [[0, 40]], unit: "U/L" });
    if (tg != null) zones.push({ lab: "TG", v: tg, lo: 0, hi: 300, bad: [[110, 300]], good: [[0, 110]], unit: "mg/dL" });
    if (ldh != null) zones.push({ lab: "LDH", v: Math.min(ldh, 2000), lo: 0, hi: 2000, bad: [[1000, 2000]], good: [[0, 600]], unit: "U/L" });
    if (zones.length){
      const { ctx, w, h } = cvSetup(cv, 40 + zones.length * 46);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = C.cy; ctx.font = "bold 10px monospace"; ctx.textAlign = "left";
      ctx.fillText("ANALYTE POSITION vs DECISION THRESHOLDS (Light 6e)", 10, 14);
      zones.forEach((z, i) => {
        const y = 34 + i * 46, x0 = 120, x1 = w - 90;
        const X = v => x0 + (v - z.lo) / (z.hi - z.lo) * (x1 - x0);
        ctx.fillStyle = "rgba(61,255,176,.10)"; ctx.fillRect(x0, y, x1 - x0, 26);
        z.bad.forEach(b => { ctx.fillStyle = "rgba(255,56,96,.16)"; ctx.fillRect(X(b[0]), y, X(b[1]) - X(b[0]), 26); });
        ctx.fillStyle = C.txt; ctx.font = "9.5px monospace"; ctx.textAlign = "left"; ctx.fillText(z.lab + " (" + z.unit + ")", 10, y + 17);
        ctx.fillStyle = C.txt2; ctx.font = "8px monospace"; ctx.textAlign = "center";
        z.bad.forEach(b => ctx.fillText(b[1] + "", X(b[1]), y + 38));
        if (z.v != null){
          const inBad = z.bad.some(b => z.v >= b[0] && z.v <= b[1]);
          ctx.fillStyle = inBad ? C.rd : C.tl; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(X(Math.max(z.lo, Math.min(z.hi, z.v))), y + 13, 5.5, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
          ctx.fillStyle = "#fff"; ctx.font = "700 10px monospace"; ctx.textAlign = "left";
          ctx.fillText("" + (z.v < 10 ? z.v.toFixed(2) : Math.round(z.v)), X(Math.max(z.lo, Math.min(z.hi, z.v))) + 9, y + 17);
        }
      });
    }
  }
}

/* ══ 3 · MANOMETRY / ELASTANCE SIMULATOR ═════════════════════════════ */
function plManoRun(){
  const p0 = plNum("mn-p0") != null ? plNum("mn-p0") : 3;
  const el = plNum("mn-el") != null ? plNum("mn-el") : 15;
  const vol = plNum("mn-vol") != null ? plNum("mn-vol") : 1.0;
  const curve = plVal("mn-type") || "normal";
  const cv = document.getElementById("mn-chart");
  const out = document.getElementById("mn-out");
  if (!cv) return;
  /* generate pressure-volume curves for 3 phenotypes */
  const mk = (e0, e1, e2) => { const pts = []; for (let v = 0; v <= 2.6; v += 0.05){ const e = e0 + e1 * v + e2 * v * v; pts.push([v * 1000, p0 - e * v]); } return pts; };
  const sets = {
    normal: { pts: mk(el * 0.7, 0.3, 0), label: "EXPANDABLE LUNG (elastance ~" + el + ")", color: C.tl },
    trapped: { pts: mk(el * 1.6, 22, 10), label: "NONEXPANDABLE (trapped/entrapped)", color: C.rd },
    entrap: { pts: mk(el * 0.8, 10, 4), label: "ACTIVE ENTRAPMENT (malignancy/empyema)", color: C.am },
  };
  const active = sets[curve] || sets.normal;
  const presAt = vol > 0 ? active.pts.reduce((a, b) => Math.abs(b[0] - vol * 1000) < Math.abs(a[0] - vol * 1000) ? b : a)[1] : p0;
  const elAct = vol > 0 ? (p0 - presAt) / vol : el;
  plot2(cv, { h: 250, title: "PLEURAL PRESSURE–VOLUME DURING THORACENTESIS (MANOMETRY)",
    series: [active.pts.filter(p => p[1] > -45).map(p => [p[0], p[1]]), sets.normal.pts.filter(p => p[1] > -45).map(p => [p[0], p[1]])].map((pts, i) => ({ pts, color: i === 0 ? active.color : "rgba(90,109,143,.55)", lw: i === 0 ? 2.2 : 1.2, dash: i === 0 ? [] : [5, 4] })),
    bands: [{ y0: -20, y1: -45, color: "rgba(255,56,96,.08)", label: "STOP ZONE (< −20 cmH₂O)" }],
    hlines: [{ y: -20, color: C.rd, label: "−20 stop" }],
    points: [{ x: vol * 1000, y: presAt, color: "#fff", r: 4 }],
    xr: [0, 2600], yr: [-45, 8], xLabel: "volume removed (mL)", yLabel: "pleural pressure (cmH₂O)" });
  const stopV = (p0 + 20) / Math.max(elAct, 1);
  const risk = elAct > 25 ? { c: "bad", t: "NONEXPANDABLE LUNG PATTERN" } : elAct > 19 ? { c: "warn", t: "BORDERLINE ELASTANCE" } : { c: "good", t: "EXPANDABLE LUNG PATTERN" };
  out.innerHTML = `
    <div class="ai-block ${risk.c}"><b>${risk.t}</b><br><span class="small">
    Pressure at ${Math.round(vol * 1000)} mL: <b>${presAt.toFixed(1)} cmH₂O</b> · effective elastance: <b>${elAct.toFixed(1)} cmH₂O/L</b> (normal mean ≈ 15; > 25 = trapped lung / active entrapment).<br>
    ${elAct > 25 ? "Expect non-expansion post-tap — pleurodesis will fail; plan indwelling catheter (malignant) or decortication assessment (benign peel). Manometry during the FIRST tap predicts this." : ""}
    ${presAt < -20 ? "<b>STOP criterion reached</b> — pressure < −20 cmH₂O. Further removal risks re-expansion pulmonary edema (25% of large taps cross this line; neither operator nor patient reliably senses it)." : `Projected −20 cmH₂O at ~${stopV.toFixed(2)} L — ${stopV < 1 ? "stay well under 1 L this tap" : "up to " + stopV.toFixed(1) + " L is physiologically tolerated"}.`}
    <br>REPE risk factors: collapse > 3–7 days, entire hemithorax opacified, young patient, removal > 1.5 L, pressure < −40 cmH₂O (animal data: −20 mmHg ≈ −27 cmH₂O already increases edema; −40/−100 mmHg markedly worse).</span></div>`;
  const g = document.getElementById("mn-gauge");
  if (g) gauge(g, { value: elAct, min: 0, max: 60, unit: "cmH₂O/L", label: "pleural space elastance",
    zones: [ { to: 15, color: "rgba(61,255,176,.75)", label: "NORMAL ~15" }, { to: 25, color: "rgba(255,180,84,.8)", label: "GRAY" }, { to: 60, color: "rgba(255,56,96,.85)", label: "NONEXPANDABLE >25" } ] });
}

/* ══ 4 · PARAPNEUMONIC CLASSIFIER ════════════════════════════════════ */
function plPpeRun(){
  const size = plVal("pp-size"), loc = plVal("pp-loc") === "y", pus = plVal("pp-pus") === "y",
    gram = plVal("pp-gram") === "pos", cult = plVal("pp-cult") === "pos",
    ph = plNum("pp-ph"), glu = plNum("pp-glu"), ldhx = plNum("pp-ldhx");
  const out = document.getElementById("pp-out");
  /* Light 7-class */
  let cls = null;
  if (pus) cls = loc ? 7 : 6;
  else if (size === "small") cls = 1;
  else if (ph != null && ph < 7.0) cls = loc ? 5 : 4;
  else if (gram || cult) cls = loc ? 5 : 4;
  else if (ph != null && ph <= 7.2) cls = 3;
  else if (ldhx != null && ldhx > 3) cls = 3;
  else if (glu != null && glu < 40) cls = 4;
  else cls = 2;
  /* ACCP category */
  let accp = null;
  if (pus) accp = 4;
  else if (size === "small") accp = 1;
  else if ((ph != null && ph < 7.2) || (glu != null && glu < 60) || gram || cult || loc || size === "half" || size === "large") accp = 3;
  else accp = 2;
  const L = PL_PPE_LIGHT[cls - 1], A = PL_PPE_ACCP[accp - 1];
  const acts = { 1: "No thoracentesis needed — antibiotics alone. If effusion grows, tap it.",
    2: "Antibiotics alone — no pleural drainage required.",
    3: "Antibiotics + SERIAL THORACENTESIS — re-tap daily until chemistry improves; escalate if pH/glucose fall.",
    4: "TUBE THORACOSTOMY + antibiotics (small-bore 9–12 F acceptable; irrigate q6h).",
    5: "Tube + INTRAPLEURAL tPA 10 mg + DNase 5 mg BID × 3 days (MIST2); thoracoscopy/decortication if no response.",
    6: "Tube thoracostomy + antibiotics — frank pus, free-flowing.",
    7: "Tube + fibrinolytics (tPA/DNase) — multiloculated pus; VATS decortication if lung fails to expand or no improvement ≤ 10 days." };
  out.innerHTML = `
    <div class="flex wrap" style="gap:10px">
      <div class="ai-block bad" style="flex:1;min-width:220px"><b>LIGHT CLASS ${L.c} — ${L.n}</b><br><span class="small">${esc(L.def)}</span></div>
      <div class="ai-block warn" style="flex:1;min-width:220px"><b>ACCP ${A.n}</b><br><span class="small">${esc(A.def)}<br>Poor-outcome risk: <b>${A.risk}</b> · drainage: <b>${A.drain}</b></span></div>
    </div>
    <div class="ai-block info" style="margin-top:10px"><b>Recommended action</b><br><span class="small">${acts[cls]}</span></div>
    <div class="small muted" style="margin-top:8px">Both classification systems agree on the need for drainage when pus, positive Gram/culture, loculation, pH < 7.20 or glucose < 60 are present. Serial LDH guides course: rising LDH = worsening inflammation (be aggressive); falling LDH = be patient. Antibiotic choice follows CAP vs HAP pathways + anaerobic cover when aspiration or feculent fluid suspected.</div>`;
  const cv = document.getElementById("pp-chart");
  if (cv) hbars(cv, { rows: PL_PPE_ACCP.map(a => ({ label: a.n, value: a.pct, max: 70, disp: a.pct + "%", color: [C.tl, C.cy, C.am, C.rd][a.c - 1], note: "poor-outcome risk — " + a.risk.toLowerCase() })) });
}

/* ══ 5 · PNEUMOTHORAX SIZE + MANAGEMENT ══════════════════════════════ */
function plPnxRun(){
  const a = plNum("px-a"), b = plNum("px-b"), c = plNum("px-c");
  const type = plVal("px-type"), symp = plVal("px-symp") === "y";
  const out = document.getElementById("px-out"), cv = document.getElementById("px-chart");
  const collins = (a != null ? 4.2 + 4.7 * (a + (b || 0) + (c || 0)) : null);
  const rhea = (a != null ? 10 * ((a + (b || 0) + (c || 0)) / 3) : null);
  const bts = a != null ? (a < 2 ? "SMALL (< 2 cm rim at hilum)" : "LARGE (≥ 2 cm rim ≈ ~50% pneumothorax volume)") : null;
  const accp = a != null ? (a < 3 ? "ACCP SMALL (< 3 cm apex-to-cupola)" : "ACCP LARGE (≥ 3 cm)") : null;
  const sizePct = collins;
  let plan = "";
  if (type === "tension"){ plan = "TENSION PNEUMOTHORAX is a CLINICAL diagnosis — do NOT wait for imaging. Immediate needle decompression: 14–16 G cannula, 2nd ICS mid-clavicular line (or the safer 4th–5th ICS anterior-axillary line, avoiding internal mammary vessels), then definitive chest tube."; }
  else if (type === "ssp") plan = "Secondary pneumothorax (underlying lung disease): admit; small-bore intercostal drain even if small when symptomatic; oxygen; treat the exacerbation; low threshold for suction; surgical review if air leak > 3–5 days.";
  else if (type === "psp") plan = (sizePct == null ? "" : sizePct < 20 && !symp ? "Small + asymptomatic: observation ± supplemental O₂ (resorption ~1.25%/day, ~2× on O₂); return precautions. " : "Large or symptomatic: needle ASPIRATION first (62% success; 1.8-day stay vs 4.0 with tube); if aspirate fails or recurs → small-bore chest tube (9–12 F) ± Heimlich valve outpatient. ") + "Discuss recurrence prevention if second episode, pilot/diver, or persistent leak > 3–5 days (VATS bullectomy + pleurodesis; minocycline 300 mg post-aspiration cut recurrence 33% → 12.9% in RCT).";
  else if (type === "trauma") plan = "Traumatic: small-bore vs large-bore drain per size/air leak; exclude hemopneumothorax (PF hematocrit!); persistent leak → thoracic surgery; consider air embolism if positive-pressure ventilation.";
  else if (type === "iatro") plan = "Iatrogenic: O₂ + observation if < 2 cm and asymptomatic (most resolve 24–48 h); small-bore drain if larger/symptomatic; high-flow O₂ if hypoxemic.";
  else if (type === "catamenial") plan = "Catamenial (menses-timed, right > left): hormonal suppression (GnRH analog/combined OCP) + VATS pleurodesis + diaphragmatic fenestration repair for recurrence; gynecology co-management.";
  else plan = "Select pneumothorax type for a tailored plan.";
  out.innerHTML = `
    <div class="flex wrap" style="gap:10px">
      <div class="ai-block info" style="flex:1;min-width:200px"><b>Collins method</b><br><span class="small">${collins == null ? "enter distances" : collins.toFixed(1) + " % of hemithorax"}<br><span class="muted">% = 4.2 + 4.7 × (A+B+C)</span></span></div>
      <div class="ai-block info" style="flex:1;min-width:200px"><b>Rhea method</b><br><span class="small">${rhea == null ? "—" : rhea.toFixed(0) + " %"}<br><span class="muted">~10% per cm avg interpleural distance</span></span></div>
      <div class="ai-block ${a != null && a >= 2 ? "warn" : "good"}" style="flex:1;min-width:200px"><b>BTS / ACCP</b><br><span class="small">${bts || "—"}<br>${accp || ""}</span></div>
    </div>
    <div class="ai-block ${type === "tension" ? "bad" : "warn"}" style="margin-top:10px"><b>Management</b><br><span class="small">${esc(plan)}</span></div>`;
  if (cv){
    plot2(cv, { h: 220, title: "RECURRENCE AFTER PSP — SADIKOT 54-MO SERIES (N=153)",
      series: [{ pts: [[1, PL_PNX.recur.first], [2, PL_PNX.recur.second], [3, PL_PNX.recur.third]], color: C.mg, w: 2.4, dots: true }],
      points: [
        { x: 1, y: PL_PNX.recur.first, color: C.cy, label: "1st → 54.2% recur" },
        { x: 2, y: PL_PNX.recur.second, color: C.am, label: "2nd → 62%" },
        { x: 3, y: PL_PNX.recur.third, color: C.rd, label: "3rd → 83%" } ],
      hlines: [{ y: PL_PNX.recur.quitSmoking, color: C.tl, label: "quit smoking 40%" }, { y: PL_PNX.recur.continueSmoking, color: C.rd, label: "continue smoking 70%" }],
      bands: [{ y0: 50, y1: 90, color: "rgba(255,56,96,.06)", label: "high-recurrence zone" }],
      xr: [0.7, 3.3], yr: [0, 100], xLabel: "episode number", yLabel: "subsequent recurrence %" });
  }
}
</script>
