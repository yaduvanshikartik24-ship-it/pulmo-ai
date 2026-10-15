<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-VI · PLEURAL CALCULATORS PART 2 (p23b2)
   Chylothorax discriminator · Hemothorax · ROC analytics · LENT · volume
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ══ 6 · CHYLOTHORAX vs PSEUDOCHYLOTHORAX DISCRIMINATOR ══════════════ */
function plChyloRun(){
  const app = plVal("ch-app"), tg = plNum("ch-tg"), chol = plNum("ch-chol"), schol = plNum("ch-schol"),
    chronic = plVal("ch-chronic"), crys = plVal("ch-crys") === "y", cent = plVal("ch-cent");
  const ratio = (chol != null && schol > 0) ? chol / schol : null;
  const out = document.getElementById("ch-out");
  let v, cls, det = "";
  if (app === "clear"){ v = "Not a high-lipid effusion pattern"; cls = "good"; det = "Clear fluid — chylothorax/pseudochylothorax effectively excluded."; }
  else if (cent === "clear"){ v = "Turbidity from CELLS, not lipids"; cls = "good"; det = "Supernatant clears on centrifugation → cloudiness is WBC/debris: think empyema. Chylous and chyliform fluids STAY opaque after centrifugation."; }
  else if (tg != null && tg > 110 && (ratio == null || ratio < 1.0)){ v = "CHYLOTHORAX"; cls = "bad";
    det = "Triglycerides > 110 mg/dL" + (ratio != null ? ` with PF/serum cholesterol ratio ${ratio.toFixed(2)} < 1.0` : "") + " establishes chylothorax. Causes: surgery/trauma ~50% (thoracic duct injury), malignancy ~17% (lymphoma THE malignant cause — 54% of chylothorax series), lymphatic disorders, chylous ascites.<br><b>Management:</b> confirm chylomicrons (lipoprotein electrophoresis if doubt); NPO + TPN (or MCT diet) + octreotide; therapeutic thoracentesis/chest tube; output > 1 L/day beyond 5–7 days or nutritional decline → thoracic duct ligation (VATS) or lymphangiography-embolization; treat underlying malignancy — lymphoma chemo/radiation usually cures the effusion. Monitor albumin, lymphocyte counts (35 L of chyle can carry 2.3 kg fat + 0.7 kg protein; T-cells fall → immunocompromise).";
  } else if ((chol != null && chol > 250) || crys || (ratio != null && ratio >= 1.0) || chronic === "years"){ v = "PSEUDOCHYLOTHORAX (CHYLIFORM)"; cls = "warn";
    det = [chol != null && chol > 250 ? "PF cholesterol > 250 mg/dL " : "", crys ? "cholesterol crystals on sediment " : "", ratio != null && ratio >= 1 ? `PF/serum cholesterol ratio ${ratio.toFixed(2)} ≥ 1.0 ` : "", chronic === "years" ? "chronicity (mean > 5 yr) with thickened pleura " : ""].filter(Boolean).join("· ") +
    ". Pseudochylothorax = high-lipid NON-chylous effusion from chronic pleural disease (TB or RA antecedents in most). NOT a thoracic-duct problem — diet/TPN/octreotide are useless. Treat the underlying disease; decortication for symptomatic bulky fibrothorax; observation acceptable if stable. Cholesterol crystals may be miscounted as WBC by automated counters.";
  } else if (tg != null && tg <= 110 && chol != null && chol <= 250){ v = "Indeterminate lipids"; cls = "warn";
    det = "TG ≤ 110 and cholesterol ≤ 250 with persistent turbidity — consider: empyema (centrifuge), high-dextrose PD effusion (milky with LOW TG — check PF glucose >> serum), iv lipid infusion leak, malignant milky effusion. Send lipoprotein electrophoresis if suspicion persists.";
  } else { v = "Enter lipid panel"; cls = "info"; det = "Order: PF triglycerides, PF cholesterol, serum cholesterol, centrifugation test, sediment microscopy for cholesterol crystals."; }
  out.innerHTML = `<div class="ai-block ${cls === "info" ? "info" : cls}"><b>${v}</b><br><span class="small">${det}</span></div>`;
  const cv = document.getElementById("ch-chart");
  if (cv){
    const rows = [];
    if (tg != null) rows.push({ label: "Triglycerides", value: tg, max: 400, disp: tg + " mg/dL", color: tg > 110 ? C.rd : C.tl, note: "chylothorax > 110" });
    if (chol != null) rows.push({ label: "Cholesterol", value: Math.min(chol, 900), max: 900, disp: chol + " mg/dL", color: chol > 250 ? C.am : C.tl, note: "chyliform > 250" });
    if (ratio != null) rows.push({ label: "PF/serum chol ratio", value: ratio, max: 3, disp: ratio.toFixed(2), color: ratio >= 1 ? C.am : C.tl, note: "< 1 chylo · ≥ 1 chyliform" });
    if (rows.length) hbars(cv, { rows });
    else { const { ctx, w, h } = cvSetup(cv, 60); ctx.clearRect(0, 0, w, h); ctx.fillStyle = C.txt2; ctx.font = "10px monospace"; ctx.textAlign = "center"; ctx.fillText("— enter lipid values —", w / 2, 30); }
  }
}

/* ══ 7 · HEMOTHORAX CRITERION ════════════════════════════════════════ */
function plHemoRun(){
  const hctP = plNum("hx-hctp"), hctB = plNum("hx-hctb"), rbc = plNum("hx-rbc"), rbcB = plNum("hx-rcbb");
  const out = document.getElementById("hx-out");
  const est = rbc != null ? rbc / 100000 : null; /* PF Hct estimate % */
  const ratio = (hctP != null && hctB > 0) ? hctP / hctB : (est != null && hctB > 0 ? est / hctB : null);
  let v, cls, mg;
  if (ratio == null){ v = "Enter PF hematocrit (or RBC count for estimate) + blood hematocrit"; cls = "info"; mg = "Hemothorax requires PF hematocrit ≥ 50% of the peripheral hematocrit. PF Hct% ≈ RBC count ÷ 100,000 (e.g., RBC 1,000,000/mm³ ≈ Hct 10%). Bloody-appearing fluid with PF Hct < 5% still LOOKS like pure blood — always measure."; }
  else if (ratio >= 0.5){ v = "HEMOTHORAX CONFIRMED (PF Hct ≥ 50% of blood)"; cls = "bad";
    mg = "Traumatic: large-bore tube (24–32 F) + autotransfusion consideration. Immediate thoracotomy if > 1,500 mL on insertion or ongoing > 200–300 mL/h × 2–4 h or instability. Retained hemothorax after drainage → VATS evacuation within 3–7 days (success falls sharply after day 7). Contrast CT extravasation → angiographic embolization (intercostal/internal mammary artery). Organized → decortication.";
  } else if (ratio >= 0.25){ v = "Blood-tinged, sub-hemothorax (PF Hct " + Math.round(ratio * 100) + "% of blood)"; cls = "warn";
    mg = "Bloody effusion below the hemothorax threshold — differential: malignancy (bloody in ~⅓), PE/infarct, trauma (old), post-CABG, catamenial, asbestos benign effusion. Send cytology + appropriate workup. RBC > 100,000/mm³ = grossly bloody — PF hematocrit documentation recommended.";
  } else { v = "Not a hemothorax (PF Hct " + Math.round(ratio * 100) + "% of blood)"; cls = "good";
    mg = "RBC 5,000–10,000/mm³ already tints fluid red — appearance overestimates blood content. Continue standard diagnostic pathway; blood-tinged fluid raises malignancy, PE, post-CABG, benign asbestos effusion.";
  }
  out.innerHTML = `<div class="ai-block ${cls === "info" ? "info" : cls}"><b>${v}</b><br><span class="small">${mg}</span></div>
    ${est != null ? `<div class="small muted" style="margin-top:6px">Estimated PF Hct from RBC: ${est.toFixed(1)}% (RBC ÷ 100,000)${rbcB != null ? ` · PF RBC / blood RBC = ${(rbc / rbcB * 100).toFixed(1)}% (> 50% also indicates hemothorax)` : ""}</div>` : ""}`;
  const cv = document.getElementById("hx-chart");
  if (cv){
    plot2(cv, { h: 200, title: "PF HEMATOCRIT AS % OF BLOOD — DECISION ZONES",
      series: [], bands: [
        { y0: 0, y1: 25, color: "rgba(61,255,176,.08)", label: "blood-tinged only" },
        { y0: 25, y1: 50, color: "rgba(255,180,84,.08)", label: "bloody — no tube on Hct alone" },
        { y0: 50, y1: 100, color: "rgba(255,56,96,.10)", label: "HEMOTHORAX ≥ 50%" } ],
      points: ratio != null ? [{ x: 1, y: ratio * 100, color: "#fff", size: 5, label: "patient " + Math.round(ratio * 100) + "%" }] : [],
      xr: [0.5, 1.5], yr: [0, 100], xLabel: "", yLabel: "PF Hct / blood Hct (%)" });
  }
}

/* ══ 8 · DIAGNOSTIC PERFORMANCE ANALYTICS (ROC) ═════════════════════ */
function plRocRun(){
  const cv = document.getElementById("roc-cv"), cv2 = document.getElementById("roc-ci");
  if (!cv) return;
  const tests = [
    { n: "Light's criteria (exudate)", fpr: 0.23, tpr: 0.98, color: C.cy },
    { n: "ADA > 40 (TB)", fpr: 0.10, tpr: 0.92, color: C.am },
    { n: "IFN-γ > 3.7 (TB)", fpr: 0.02, tpr: 0.98, color: C.mg },
    { n: "NT-proBNP > 1500 (CHF)", fpr: 0.07, tpr: 0.91, color: C.tl },
    { n: "SMRP (mesothelioma)", fpr: 0.12, tpr: 0.74, color: C.vt },
    { n: "Cytology (malignancy)", fpr: 0.01, tpr: 0.65, color: C.rd },
  ];
  rocChart(cv, tests.map(t => ({ name: t.n + " · AUC " + plAuc(plRoc(t.fpr, t.tpr, 60)).toFixed(2), pts: plRoc(t.fpr, t.tpr, 60).map(p => ({ x: p[0], y: p[1] })), color: t.color })), { h: 300, title: "PLEURAL DIAGNOSTIC TESTS — ROC FROM REPORTED SENS/SPEC (Light 6e meta-analyses)" });
  /* CI forest for key cutoffs (95% CI from source meta-analyses, approx) */
  if (cv2) forestChart(cv2, [
    { label: "Light's sens", v: 0.98, lo: 0.96, hi: 1.00 },
    { label: "ADA sens", v: 0.92, lo: 0.89, hi: 0.94 },
    { label: "ADA spec", v: 0.90, lo: 0.87, hi: 0.92 },
    { label: "IFN-γ sens", v: 0.89, lo: 0.83, hi: 0.94 },
    { label: "IFN-γ spec", v: 0.97, lo: 0.94, hi: 0.99 },
    { label: "NT-BNP sens", v: 0.91, lo: 0.85, hi: 0.97 },
    { label: "NT-BNP spec", v: 0.93, lo: 0.88, hi: 0.97 },
    { label: "SMRP sens", v: 0.74, lo: 0.60, hi: 0.85 },
    { label: "SMRP spec", v: 0.88, lo: 0.82, hi: 0.93 },
  ], { h: 260, title: "SENSITIVITY / SPECIFICITY — 95% CI (Liang ADA meta n=8,093 · Jiang IFN meta n=2,101 · pooled NT-proBNP)" });
}

/* ══ 9 · LENT SCORE (malignant pleural effusion prognosis) ═══════════ */
function plLentRun(){
  const ldh = plNum("le-ldh"), ecog = parseInt(plVal("le-ecog") || "1", 10), neut = plNum("le-neut"), type = plVal("le-type");
  const out = document.getElementById("le-out"), cv = document.getElementById("le-chart");
  /* LENT: pleural fluid LDH (>1500 = 1), ECOG (≥2 = 1), Neutrophil% (>50 = 1), Tumor type (high-risk = 1) */
  let s = 0; const comp = [];
  const ldhPts = ldh != null && ldh > 1500; if (ldhPts) s++;
  comp.push(["Pleural fluid LDH", ldh == null ? "—" : Math.round(ldh) + " U/L", ldhPts ? 1 : 0, "> 1,500"]);
  const ePts = ecog >= 2; if (ePts) s++;
  comp.push(["ECOG performance", String(ecog), ePts ? 1 : 0, "≥ 2"]);
  const nPts = neut != null && neut > 50; if (nPts) s++;
  comp.push(["PF neutrophil %", neut == null ? "—" : neut + "%", nPts ? 1 : 0, "> 50%"]);
  const hiRisk = ["lung", "gi"];
  const tPts = hiRisk.indexOf(type) >= 0; if (tPts) s++;
  const tName = { lung: "lung (high)", breast: "breast (low)", lymphoma: "lymphoma (low)", gi: "GI (high)", gyn: "gynecologic (low)", other: "other/unknown" }[type] || "—";
  comp.push(["Tumor type", tName, tPts ? 1 : 0, "lung/GI high-risk"]);
  /* survival per Clive et al. 2014: LENT 0-1 ~319 d; 2 ~130 d; 3-4 ~44 d */
  const med = s <= 1 ? 319 : s === 2 ? 130 : 44;
  const risk = s <= 1 ? { c: "good", t: "LOW RISK" } : s === 2 ? { c: "warn", t: "MODERATE RISK" } : { c: "bad", t: "HIGH RISK" };
  out.innerHTML = `
    <div class="ai-block ${risk.c}"><b>LENT ${s} / 4 — ${risk.t}</b><br>
    <span class="small">Median survival ≈ <b>${med} days</b> (Clive Roberts derivation + validation cohorts).<br>
    ${comp.map(c => `▸ ${c[0]}: <b>${c[1]}</b> ${c[2] ? "<b class='bad'>+1</b>" : "<span class='good'>0</span>"} <span class="muted">(cut ${c[3]})</span>`).join("<br>")}</span></div>
    <div class="small muted" style="margin-top:8px">Use to triage aggressiveness of pleural intervention: low-risk patients live long enough to benefit from definitive pleurodesis; high-risk benefit from least-invasive IPC or observation. Complements — not replaces — clinical judgement. (LENT = LDH, ECOG, Neutrophil ratio, Tumor type; Clive et al., Thorax 2014.)</div>`;
  if (cv){
    plot2(cv, { h: 210, title: "LENT SCORE vs MEDIAN SURVIVAL (Clive 2014)",
      series: [{ pts: [[0, 319], [1, 319], [2, 130], [3, 44], [4, 44]], color: C.cy, w: 2.2, dots: true }],
      bands: [{ y0: 0, y1: 60, color: "rgba(255,56,96,.07)", label: "high-risk zone" }, { y0: 240, y1: 340, color: "rgba(61,255,176,.06)", label: "low-risk zone" }],
      points: [{ x: s, y: med, color: "#fff", size: 5, label: "patient" }],
      xr: [0, 4], yr: [0, 360], xLabel: "LENT score", yLabel: "median survival (days)" });
  }
}

/* ══ 10 · RADIOGRAPHIC VOLUME ESTIMATOR ═════════════════════════════ */
function plVolRun(){
  const findings = ["v-men", "v-lat", "v-pa", "v-dia", "v-mass"];
  const names = { "v-men": "Posterior meniscus on lateral", "v-lat": "Blunted lateral CPA on PA", "v-pa": "Meniscus in PA view", "v-dia": "Hemidiaphragm obscured", "v-mass": "Massive (entire hemithorax)" };
  const ranges = { "v-men": [50, 200], "v-lat": [175, 500], "v-pa": [200, 500], "v-dia": [500, 1500], "v-mass": [1500, 3000] };
  let lo = 0, hi = 0, found = [];
  findings.forEach(id => {
    if (document.getElementById(id) && document.getElementById(id).classList.contains("on")){
      found.push(id); lo = Math.max(lo, ranges[id][0]); hi = Math.max(hi, ranges[id][1]);
    }
  });
  const out = document.getElementById("v-out"), cv = document.getElementById("v-chart");
  if (!found.length){ out.innerHTML = `<div class="ai-block warn">Select the radiographic findings seen.</div>`; }
  else {
    const lo2 = found.length > 1 ? ranges[found[found.length - 2]][0] : 0;
    out.innerHTML = `<div class="ai-block info"><b>Estimated effusion volume: ≈ ${lo}–${hi} mL</b><br>
      <span class="small">Progressive accumulation: posterior meniscus (lateral film) ~50 mL → PA lateral-CPA blunting 175–500 mL (Collins cadaver data; up to 500 mL can hide without blunting) → meniscus fills CPA > 200 mL → hemidiaphragm obscured > 500 mL → entire hemithorax = massive. Subpulmonic effusions (> 1,000 mL) can hide with a CLEAR lateral CPA — apparent diaphragm elevation with laterally-placed apex on PA. Ultrasound/decubitus detect 5–50 mL and estimate volume (correlates with CT). Decubitus thickness > 10 mm = clinically significant → diagnostic thoracentesis (Light's algorithm). Massive effusion: 59% malignant, 23% parapneumonic, 10% TB — assess mediastinal position first (midline + massive = suspect carcinoma/mesothelioma; shifted = pressure pathology).</span></div>`;
  }
  if (cv){
    const rows = [
      { label: "US / decubitus", value: 50, max: 3000, disp: "5–50", color: C.tl, note: "most sensitive detection" },
      { label: "Lateral meniscus", value: 75, max: 3000, disp: "~50", color: C.tl, note: "posterior CPA on lateral" },
      { label: "PA CPA blunting", value: 340, max: 3000, disp: "175–500", color: C.cy, note: "Collins cadaver injection" },
      { label: "Diaphragm obscured", value: 800, max: 3000, disp: "> 500", color: C.am, note: "meniscus over whole diaphragm" },
      { label: "Massive", value: 2200, max: 3000, disp: "1500–3000", color: C.rd, note: "entire hemithorax" } ];
    rows.push({ label: "PATIENT", value: Math.max(lo, 1), max: 3000, disp: "≈" + lo + "–" + hi, color: "#ffffff", note: "from selected findings" });
    hbars(cv, { rows });
  }
}
</script>
