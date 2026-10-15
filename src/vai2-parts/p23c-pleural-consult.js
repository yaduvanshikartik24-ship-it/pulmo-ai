<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-VI · PLEURAL CONSULT ENGINE (p23c)
   patient + history + imaging + pleural fluid → diagnosis, differential,
   next steps & management — 4-algorithm fusion over the Light-6e corpus
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ─── input schema ────────────────────────────────────────────────────── */
const PL_SCHEMA = [
  { t: "PATIENT", no: "01", open: true, f: [
    { id: "age", l: "Age", u: "yr", t: "num", ph: "—" },
    { id: "sex", l: "Sex", t: "seg", o: [["male", "MALE"], ["female", "FEMALE"]], v: "male" },
    { id: "smoking", l: "Smoker", t: "seg", o: [["n", "NO / UNKNOWN"], ["y", "CURRENT SMOKER"]] },
    { id: "asbestos", l: "Asbestos exposure (shipyard, insulation, plumbing, construction)", t: "check" },
  ] },
  { t: "HISTORY & CONTEXT", no: "02", open: true, checks: [
    { id: "chfHx", l: "Heart failure / cardiac disease" }, { id: "cirrhosis", l: "Cirrhosis / portal hypertension" },
    { id: "ascites", l: "Ascites present" }, { id: "nephrotic", l: "Nephrotic-range proteinuria / hypoalbuminemia" },
    { id: "cancerHx", l: "Known malignancy (any)" }, { id: "tbEndemic", l: "TB endemic origin / known contact" },
    { id: "hiv", l: "HIV / immunosuppression" }, { id: "raHx", l: "Rheumatoid arthritis" },
    { id: "lupusHx", l: "Systemic lupus erythematosus" }, { id: "cardiacSurgery", l: "Cardiac surgery / MI / pacemaker / ablation (recent or past yr)" },
    { id: "postSurgery", l: "Thoracic / esophageal surgery" }, { id: "abdSurgery", l: "Recent abdominal surgery" },
    { id: "trauma", l: "Chest trauma" }, { id: "pancreatitis", l: "Pancreatitis / pancreatic disease" },
    { id: "dialysis", l: "Dialysis / advanced CKD" }, { id: "pdHx", l: "Peritoneal dialysis" },
    { id: "drugStarted", l: "New drug started (dasatinib, nitrofurantoin, amiodarone, MTX, IL-2, bromocriptine)" },
    { id: "ivf", l: "Ovarian stimulation / IVF (past 2 wk)" }, { id: "dvt", l: "DVT / immobilization / hypercoagulable" },
    { id: "obstructiveUropathy", l: "Urinary obstruction / nephrostomy / urinary trauma" },
    { id: "ovarianMass", l: "Ovarian / pelvic mass" }, { id: "menses", l: "Symptoms timed to menstruation" },
    { id: "lymphedemaHx", l: "Lymphedema" }, { id: "yellowNails", l: "Yellow dystrophic nails" },
    { id: "tbHx", l: "Prior TB / old pleural disease" }, { id: "copd", l: "COPD / cystic fibrosis / bullae" },
    { id: "marfan", l: "Marfan / connective-tissue disorder" },
  ] },
  { t: "PRESENTATION", no: "03", checks: [
    { id: "fever", l: "Fever" }, { id: "nightSweats", l: "Night sweats" }, { id: "weightLoss", l: "Weight loss" },
    { id: "pleuritic", l: "Pleuritic chest pain" }, { id: "chestWallPain", l: "Dull chest-wall pain (mesothelioma pattern)" },
    { id: "sudden", l: "Sudden onset" }, { id: "hypoxia", l: "Disproportionate hypoxemia" },
    { id: "purulent", l: "Purulent sputum / pneumonia" }, { id: "vomiting", l: "Vomiting / violent retching before onset" },
    { id: "orthopnea", l: "Orthopnea / peripheral edema" }, { id: "epigastric", l: "Epigastric pain" },
    { id: "recurrent", l: "Recurrent effusion / prior episodes" }, { id: "chronicWeeks", l: "Symptoms > 2–4 weeks" },
    { id: "chronicYears", l: "Effusion known for YEARS" },
  ] },
  { t: "IMAGING (CXR / CT / US)", no: "04", open: true, f: [
    { id: "side", l: "Side", t: "seg", o: [["right", "RIGHT"], ["left", "LEFT"], ["bilateral", "BILATERAL"]], v: "right" },
    { id: "size", l: "Effusion size", t: "sel", w2: true, v: "small", o: [
      ["small", "Small (< 10 mm decubitus)"], ["mod", "Moderate"], ["half", "> ½ hemithorax"], ["massive", "Massive / complete opacification"], ["none", "Pneumothorax (no effusion)"] ] },
    { id: "loculated", l: "Loculated / septated (US or CT)", t: "check" },
    { id: "mediastinum", l: "Mediastinum", t: "sel", o: [["unknown", "— not assessed —"], ["away", "Shifted AWAY (pressure)"], ["mid", "MIDLINE with massive effusion"], ["toward", "Shifted TOWARD (collapse / tension pnx)"] ] },
    { id: "nodularPleura", l: "Nodular / circumferential pleural thickening on CT", t: "check" },
    { id: "infiltrate", l: "Parenchymal infiltrate / consolidation", t: "check" },
    { id: "cardiomegaly", l: "Cardiomegaly", t: "check" },
    { id: "pneumothorax", l: "Pneumothorax present", t: "check" },
    { id: "adenopathy", l: "Mediastinal lymphadenopathy", t: "check" },
  ] },
  { t: "PLEURAL FLUID — APPEARANCE & CELLS", no: "05", open: true, f: [
    { id: "app", l: "Appearance", t: "sel", w2: true, v: "straw", o: [
      ["straw", "Straw / amber (normal-appearing)"], ["bloody", "Grossly bloody"], ["milky", "Milky / turbid"], ["purulent", "Frank pus"], ["feculent", "Feculent odor"], ["urine", "Urine-like (odor/appearance)"], ["black", "Black"], ["viscous", "Very viscous (mesothelioma + hyaluronate)"] ] },
    { id: "rbc", l: "RBC count", u: "/mm³", t: "num", ph: "e.g. 5000" },
    { id: "wbc", l: "WBC count", u: "/mm³", t: "num", ph: "—" },
    { id: "neut", l: "Neutrophils", u: "%", t: "num", ph: "—" },
    { id: "lym", l: "Lymphocytes", u: "%", t: "num", ph: "—" },
    { id: "eos", l: "Eosinophils", u: "%", t: "num", ph: "—" },
    { id: "meso", l: "Mesothelial cells", u: "%", t: "num", ph: "—" },
  ] },
  { t: "PLEURAL FLUID — CHEMISTRY & SPECIAL", no: "06", open: true, f: [
    { id: "pfProt", l: "PF protein", u: "g/dL", t: "num", ph: "—" },
    { id: "seProt", l: "Serum protein", u: "g/dL", t: "num", ph: "—" },
    { id: "pfLdh", l: "PF LDH", u: "U/L", t: "num", ph: "—" },
    { id: "seLdh", l: "Serum LDH", u: "U/L", t: "num", ph: "—" },
    { id: "uln", l: "Serum LDH upper limit", u: "U/L", t: "num", ph: "e.g. 300", v: 300 },
    { id: "glu", l: "PF glucose", u: "mg/dL", t: "num", ph: "—" },
    { id: "ph", l: "PF pH (blood-gas analyzer)", u: "", t: "num", step: "0.01", ph: "7.—" },
    { id: "bloodPh", l: "Blood pH", u: "", t: "num", step: "0.01", ph: "—" },
    { id: "ada", l: "PF ADA", u: "U/L", t: "num", ph: "—" },
    { id: "ifn", l: "PF interferon-γ", u: "U/mL", t: "num", ph: "—" },
    { id: "nt", l: "NT-proBNP (PF or serum)", u: "pg/mL", t: "num", ph: "—" },
    { id: "amy", l: "PF amylase", u: "U/L", t: "num", ph: "—" },
    { id: "tg", l: "PF triglycerides", u: "mg/dL", t: "num", ph: "—" },
    { id: "chol", l: "PF cholesterol", u: "mg/dL", t: "num", ph: "—" },
    { id: "seChol", l: "Serum cholesterol", u: "mg/dL", t: "num", ph: "—" },
    { id: "pfCr", l: "PF creatinine", u: "mg/dL", t: "num", ph: "—" },
    { id: "seCr", l: "Serum creatinine", u: "mg/dL", t: "num", ph: "—" },
    { id: "cyto", l: "Cytology", t: "seg", o: [["na", "NOT SENT"], ["neg", "NEGATIVE"], ["atyp", "ATYPICAL"], ["pos", "POSITIVE"] ], v: "na" },
    { id: "gram", l: "Gram stain / culture", t: "seg", o: [["na", "NOT SENT"], ["neg", "NEGATIVE"], ["pos", "POSITIVE"] ], v: "na" },
  ] },
];

/* ─── presets (classic teaching cases from the book) ──────────────────── */
const PL_PRESETS = [
  { id: "chf", n: "Classic CHF transudate", v: { age: 74, sex: "male", side: "bilateral", size: "mod", cardiomegaly: true, orthopnea: true, chfHx: true, pfProt: 2.0, seProt: 6.5, pfLdh: 90, seLdh: 180, neut: 30, lym: 60, glu: 95, cyto: "neg" } },
  { id: "pseudo", n: "CHF pseudoexudate (diuretics)", v: { age: 71, sex: "female", side: "bilateral", size: "mod", cardiomegaly: true, chfHx: true, orthopnea: true, pfProt: 3.2, seProt: 6.0, pfLdh: 250, seLdh: 300, nt: 6200, glu: 90, cyto: "neg" } },
  { id: "empyema", n: "Complicated PPE / empyema", v: { age: 58, sex: "male", side: "right", size: "half", loculated: true, infiltrate: true, fever: true, purulent: true, app: "purulent", neut: 92, lym: 5, glu: 28, ph: 6.88, pfLdh: 2600, pfProt: 4.5, seProt: 7.0, gram: "pos", cyto: "neg" } },
  { id: "tb", n: "Tuberculous pleuritis", v: { age: 32, sex: "male", side: "right", size: "mod", fever: true, nightSweats: true, weightLoss: true, chronicWeeks: true, tbEndemic: true, pfProt: 4.8, seProt: 7.2, pfLdh: 420, seLdh: 200, lym: 88, neut: 8, meso: 1, ada: 72, glu: 82, ph: 7.32, cyto: "neg" } },
  { id: "mpe", n: "Malignant effusion (lung)", v: { age: 66, sex: "male", side: "right", size: "massive", mediastinum: "mid", smoking: "y", cancerHx: true, weightLoss: true, chestWallPain: true, adenopathy: true, app: "bloody", rbc: 150000, pfProt: 4.4, seProt: 6.8, pfLdh: 1400, seLdh: 280, lym: 62, glu: 48, ph: 7.18, cyto: "pos" } },
  { id: "meso", n: "Mesothelioma (asbestos)", v: { age: 68, sex: "male", side: "left", size: "half", asbestos: true, chestWallPain: true, weightLoss: true, nodularPleura: true, app: "bloody", pfProt: 4.6, seProt: 7.0, pfLdh: 900, lym: 55, glu: 52, ph: 7.21, cyto: "atyp" } },
  { id: "hepatic", n: "Hepatic hydrothorax", v: { age: 58, sex: "male", side: "right", size: "massive", cirrhosis: true, ascites: true, pfProt: 1.8, seProt: 5.8, pfLdh: 70, seLdh: 160, neut: 20, lym: 65, glu: 100, cyto: "neg" } },
  { id: "chyl", n: "Post-surgery chylothorax", v: { age: 61, sex: "female", side: "right", size: "half", postSurgery: true, app: "milky", tg: 380, pfProt: 3.8, seProt: 6.9, pfLdh: 300, lym: 90, cyto: "neg" } },
  { id: "boerhaave", n: "Esophageal rupture", v: { age: 49, sex: "male", side: "left", size: "half", vomiting: true, fever: true, sudden: true, septic: true, app: "purulent", pfProt: 4.2, seProt: 7.0, pfLdh: 3800, neut: 90, ph: 6.05, glu: 30, amy: 2100, gram: "pos" } },
  { id: "ra", n: "Rheumatoid pleuritis", v: { age: 62, sex: "male", side: "left", size: "mod", raHx: true, chronicWeeks: true, pfProt: 4.9, seProt: 7.1, pfLdh: 3400, lym: 60, eos: 12, glu: 12, ph: 7.05, ada: 68, cyto: "neg" } },
  { id: "pe", n: "Pulmonary embolism effusion", v: { age: 55, sex: "female", side: "right", size: "small", pleuritic: true, sudden: true, hypoxia: true, dvt: true, cancerHx: false, app: "bloody", rbc: 40000, pfProt: 3.6, seProt: 7.2, pfLdh: 480, seLdh: 240, neut: 70, cyto: "neg" } },
  { id: "urino", n: "Urinothorax", v: { age: 70, sex: "male", side: "right", size: "mod", obstructiveUropathy: true, app: "urine", pfProt: 0.8, seProt: 6.8, pfLdh: 60, pfCr: 6.2, seCr: 4.8, glu: 90, cyto: "neg" } },
  { id: "lupus", n: "Lupus pleuritis", v: { age: 34, sex: "female", side: "bilateral", size: "small", lupusHx: true, fever: true, pleuritic: true, pfProt: 4.0, seProt: 7.4, pfLdh: 500, seLdh: 260, lym: 55, neut: 35, glu: 88, ph: 7.34, cyto: "neg" } },
  { id: "pcis", n: "Post-CABG late effusion", v: { age: 64, sex: "male", side: "left", size: "mod", cardiacSurgery: true, chronicWeeks: true, pleuritic: true, fever: true, pfProt: 4.3, seProt: 7.0, pfLdh: 800, eos: 22, lym: 50, cyto: "neg" } },
  { id: "dasatinib", n: "Dasatinib effusion", v: { age: 46, sex: "male", side: "bilateral", size: "mod", drugStarted: true, chronicWeeks: true, dyspnea: true, pfProt: 4.4, seProt: 7.1, pfLdh: 620, lym: 78, cyto: "neg" } },
];

/* ─── feature extraction ──────────────────────────────────────────────── */
function plExtract(d){
  const f = {};
  /* demographics/history */
  ["chfHx","cirrhosis","ascites","nephrotic","cancerHx","tbEndemic","hiv","raHx","lupusHx","cardiacSurgery","postSurgery","abdSurgery","trauma","pancreatitis","dialysis","pdHx","drugStarted","ivf","dvt","obstructiveUropathy","ovarianMass","menses","lymphedemaHx","yellowNails","tbHx","copd","marfan","asbestos","fever","nightSweats","weightLoss","pleuritic","chestWallPain","sudden","hypoxia","purulent","vomiting","orthopnea","epigastric","recurrent","chronicWeeks","chronicYears","loculated","nodularPleura","infiltrate","cardiomegaly","pneumothorax","adenopathy"].forEach(k => f[k] = !!d[k]);
  f.smoking = d.smoking === "y";
  f.female = d.sex === "female";
  f.youngWoman = f.female && d.age != null && d.age < 45;
  /* imaging */
  f.bilateral = d.side === "bilateral";
  f.rightOnly = d.side === "right";
  f.leftOnly = d.side === "left";
  f.massive = d.size === "massive";
  f.small = d.size === "small";
  f.ppnrxConfirmed = !!d.pneumothorax;
  f.mediastinalMidMassive = d.mediastinum === "mid" && f.massive;
  /* fluid */
  f.app = d.app;
  f.bloody = d.app === "bloody" || (d.rbc != null && d.rbc > 100000);
  f.milky = d.app === "milky";
  f.purulent = d.app === "purulent" || d.app === "feculent";
  f.anaerobic = d.app === "feculent";
  f.gramPos = d.gram === "pos"; f.culturePos = false; /* single Gram/culture control → gramPos carries full weight (avoid double-count) */
  f.cytologyPos = d.cyto === "pos";
  f.cytAtyp = d.cyto === "atyp";
  f.cytologyNeg = d.cyto === "neg";
  f.neutro = d.neut != null && d.neut > 50;
  f.lympho = d.lym != null && d.lym > 50;
  f.lymph95 = d.lym != null && d.lym > 95;
  f.eosino = d.eos != null && d.eos > 10;
  f.mesoHigh = d.meso != null && d.meso > 5;
  f.mesoLow = d.meso != null && d.meso <= 5;
  f.lowGlucose = d.glu != null && d.glu < 60;
  f.phLow = d.ph != null && d.ph < 7.2;
  f.phVeryLow = d.ph != null && d.ph < 6.5;
  f.ldhHigh = d.pfLdh != null && d.pfLdh > 1000;
  f.adaHigh = d.ada != null && d.ada > 40;
  f.ifnHigh = d.ifn != null && d.ifn > 3.7;
  f.ntHigh = d.nt != null && d.nt > 1500;
  f.amylHigh = d.amy != null && d.amy > 110;
  f.tgHigh = d.tg != null && d.tg > 110;
  f.cholHigh = (d.chol != null && d.chol > 250);
  f.chyle = f.tgHigh && (d.seChol == null || d.chol == null || d.chol / d.seChol < 1.0);
  f.pfCrHigh = d.pfCr != null && d.seCr != null && d.pfCr > d.seCr;
  f.urinoConfirmed = f.pfCrHigh;
  f.foodParticles = d.app === "purulent" && f.vomiting;
  f.hctRatioHigh = false; /* hemothorax handled by dedicated calculator */
  f.elastHigh = false; f.noExpansion = d.mediastinum === "toward";
  f.smrpHigh = !!d.smrpHigh;
  /* light's criteria */
  const c1 = d.pfProt != null && d.seProt > 0 ? d.pfProt / d.seProt : null;
  const c2 = d.pfLdh != null && d.seLdh > 0 ? d.pfLdh / d.seLdh : null;
  const c3 = d.pfLdh != null && d.uln > 0 ? d.pfLdh / d.uln : null;
  const isEx = (c1 != null && c1 > 0.5) || (c2 != null && c2 > 0.6) || (c3 != null && c3 > 2 / 3);
  const protGrad = d.pfProt != null && d.seProt != null ? d.seProt - d.pfProt : null;
  f.proteinGradHigh = protGrad != null && protGrad > 3.1;
  /* pseudoexudate rescue ONLY in a transudate-suspecting context: NT-proBNP alone,
     or protein gradient when CHF/cirrhosis is clinically plausible (Light ch.7) */
  f.pseudoex = isEx && (f.ntHigh || ((d.chfHx || d.cirrhosis) && f.proteinGradHigh));
  f.exudate = isEx && !f.pseudoex;
  f.transudate = !isEx || f.pseudoex;
  f.hadLight = d.pfProt != null && d.pfLdh != null;
  f.septic = f.fever && (f.purulent || f.gramPos || f.infiltrate);
  return f;
}

/* ─── Bayesian + rule fusion ──────────────────────────────────────────── */
function plAnalyze(d){
  const f = plExtract(d);
  const alerts = [], steps = [];
  /* hard guardrails first */
  if (d.mediastinum === "toward" && (f.ppnrxConfirmed || d.hypoxia)) alerts.push({ c: "bad", t: "TENSION / PRESSURE physiology", w: "Mediastinum shifted toward the lesion with pneumothorax or collapse + disproportionate hypoxemia — if hemodynamic compromise: decompress NOW, image LATER." });
  if (f.phVeryLow && f.vomiting) alerts.push({ c: "bad", t: "ESOPHAGEAL RUPTURE EMERGENCY", w: "pH < 6.5 with recent vomiting/retching — the lowest pH of any effusion. Immediate thoracic surgery + GI consult; mortality climbs hourly. Confirm: salivary-type amylase, food particles, water-soluble contrast study." });
  if (f.purulent && f.gramPos) alerts.push({ c: "bad", t: "EMPYEMA — DRAIN NOW", w: "Frank pus or positive Gram stain = immediate tube thoracostomy (small-bore 9–12 F acceptable, irrigate q6h). No further chemistry needed to decide." });
  if (f.phLow && d.bloodPh != null && d.bloodPh < 7.35) alerts.push({ c: "warn", t: "Systemic acidosis confound", w: "Blood pH is low — pleural pH partially tracks arterial pH; interpret the PF pH against the blood pH before attributing it to pleural disease." });
  if (f.phLow && d.bloodPh == null) alerts.push({ c: "warn", t: "Check blood pH", w: "When PF pH < 7.20, a simultaneous arterial pH is required to exclude systemic acidosis as the cause." });
  if (f.adaHigh && f.purulent) alerts.push({ c: "warn", t: "ADA confounder", w: "ADA is ALSO high in empyema and rheumatoid pleuritis — do not diagnose TB on ADA when pus or RA is present." });
  if (d.ph != null && d.ph < 7.2 && f.phLow && d.app === "straw" && d.neut == null) alerts.push({ c: "warn", t: "Verify pH method", w: "Pleural pH is valid ONLY on a blood-gas analyzer (anaerobic, heparinized). pH paper/meters read 0.2–0.3 too HIGH — confirm your lab's method before acting on the number." });

  /* log-odds Bayesian differential — LRs fire ONLY on present features
     (fields are optional: absence of data must not count as evidence against) */
  const scored = PL_DX.map(dx => {
    let score = Math.log(dx.bl / (100 - dx.bl)); /* baseline odds from prevalence weight */
    const applied = [];
    Object.keys(dx.lr || {}).forEach(k => {
      const val = dx.lr[k];
      if (f[k] === true){ score += Math.log(val); applied.push([k, val]); }
    });
    return { dx, score, applied };
  });
  /* structural constraints */
  scored.forEach(s => {
    if (f.transudate && s.dx.grp === "E") s.score -= Math.log(4);
    if (f.exudate && s.dx.grp === "T") s.score -= Math.log(3.5);
    if (f.pseudoex && s.dx.id === "chf") s.score += Math.log(4);
  });
  /* hard rules */
  if (f.cytologyPos){ const m = scored.find(s => s.dx.id === "malignant" || s.dx.id === "meso"); if (m) m.score += Math.log(8); }
  if (f.purulent){ const e = scored.find(s => s.dx.id === "ppe"); if (e) e.score += Math.log(10); }
  if (f.chyle){ const c = scored.find(s => s.dx.id === "chylothorax"); if (c) c.score += Math.log(14); }
  if (f.cholHigh){ const p = scored.find(s => s.dx.id === "pseudochylo"); if (p) p.score += Math.log(12); }
  if (f.urinoConfirmed){ const u = scored.find(s => s.dx.id === "urinothorax"); if (u) u.score += Math.log(18); }
  if (f.ppnrxConfirmed){ const p = scored.find(s => s.dx.id === "pneumothorax"); if (p) p.score += Math.log(20); }
  if (f.mediastinalMidMassive){ const m = scored.find(s => s.dx.id === "meso"); if (m) m.score += Math.log(3); const ca = scored.find(s => s.dx.id === "malignant"); if (ca) ca.score += Math.log(2); }
  /* softmax-ish normalize to probabilities */
  const total = scored.reduce((a, s) => a + Math.exp(s.score), 0);
  scored.forEach(s => s.p = Math.exp(s.score) / total);
  scored.sort((a, b) => b.p - a.p);
  const conf = Math.min(96, 40 + 56 * (scored[0].p - 1 / scored.length) / (1 - 1 / scored.length));

  /* next-steps ladder (data-driven, Light ch.8) */
  if (!f.hadLight) steps.push("Diagnostic thoracentesis (> 10 mm on decubitus/US): send protein + LDH (paired serum!), cells, glucose, pH, cytology, TB marker — the single highest-yield test.");
  else {
    if (d.cyto === "na" && f.exudate) steps.push("Pleural fluid CYTOLOGY (send 50–100 mL, 2–3 specimens) — yields 40–87%, near-100% for adenocarcinoma with high burden.");
    if (d.ada == null && d.ifn == null && f.exudate) steps.push("Pleural TB marker: ADA (> 40 U/L suggests TB, sens 92%/spec 90%) or interferon-γ (> 3.7 U/mL, sens 98%/spec 98%).");
    if (d.glu == null && f.exudate) steps.push("PF glucose + pH (blood-gas analyzer) — narrows the low-glucose differential (PPE, malignant, TB, RA).");
    if (f.exudate && !f.cytologyPos){
      steps.push("CT ANGIOGRAM of the chest (Light's first move for the undiagnosed exudate): evaluates PE, infiltrates, masses, nodular pleura, adenopathy in one study.");
      if (d.lym != null && d.lym > 50) steps.push("Lymphocyte-predominant exudate with negative cytology: consider CT-guided pleural biopsy or medical THORACOSCOPY (~90% diagnostic yield + talc poudrage option) — especially with ADA < 40 and persistent effusion.");
      if (f.milky && d.tg == null) steps.push("Milky fluid: send PF triglycerides + cholesterol (± lipoprotein electrophoresis).");
      if (d.amy == null && (f.epigastric || f.vomiting)) steps.push("PF amylase + isoforms (elevated: pancreatic, esophageal rupture, malignancy).");
    }
    if (f.transudate && !f.bilateral) steps.push("Unilateral transudate: check PF creatinine (urinothorax), consider hepatic hydrothorax (cirrhosis with/without ascites), and PE.");
    if (f.pseudoex) steps.push("Pseudoexudate confirmed — treat the heart failure; no further pleural workup needed.");
  }
  if (f.eosino) steps.push("Eosinophilia > 10% usually reflects air/blood in the space (prior tap or pneumothorax) — TB essentially excluded; benign prognosis if parapneumonic.");
  if (!steps.length) steps.push("Diagnosis adequately established — proceed to cause-specific management below.");

  return { f, alerts, scored, conf, steps };
}
</script>
