<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-V · SLEEP STUDY CONSULTANT (SYNAPSE)
   Sleep-study parameters + patient data → rules → Bayesian differential →
   neural lattice → next diagnostic step + full management plan.
   Also pushes 4 sleep-medicine modules into the guideline corpus.
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ═══ 1 · SLEEP GUIDELINE MODULES (into the corpus) ══════════════════════ */
GUIDELINES.push(
{ id:"aasm", name:"AASM Scoring & Severity — Sleep", org:"American Academy of Sleep Medicine", upd:"ICSD-3 aligned", tags:["Sleep"], ic:"moon2",
  summ:"Adult OSA severity by AHI (none <5 · mild 5–14.9 · moderate 15–29.9 · severe ≥30/hr); hypopnea scoring 3% desat OR arousal + ≥30% flow drop ≥10 s; RERA = flattening ≥10 s + arousal without meeting apnea/hypopnea.",
  sections:[
    { h:"Adult severity thresholds", html:`<div class="tscroll"><table class="dt"><thead><tr><th>Severity</th><th>AHI /hr</th><th>Typical companions</th></tr></thead><tbody>
      <tr><td class="mono cy">Mild</td><td class="mono">5–14.9</td><td class="muted">ODI < 10, nadir usually > 88%</td></tr>
      <tr><td class="mono cy">Moderate</td><td class="mono">15–29.9</td><td class="muted">Arousals 20–35/hr, mild daytime symptoms</td></tr>
      <tr><td class="mono cy">Severe</td><td class="mono">≥ 30</td><td class="muted">Nadir < 80%, T90 climbs, ESS ≥ 16 common</td></tr></tbody></table></div>` },
    { h:"Study-type selection (AASM HSAT rules)", html:`
      <p>HSAT is acceptable only with <b>high pre-test probability of moderate–severe OSA</b> and <b>without</b>: significant cardiopulmonary disease, neuromuscular disease, awake hypoventilation, chronic opioid use, suspected central apnea / Cheyne–Stokes, or severe insomnia. A <b>negative HSAT with high suspicion does not exclude OSA</b> — proceed to in-lab PSG.</p>
      <p>Split-night: convert to titration if the diagnostic portion ≥ 3 h shows <b>AHI ≥ 40</b> (mandatory conversion) — AHI 15–40 acceptable when ≥ 3 h of study time remains.</p>` },
  ],
  pearls:["Hypopnea needs ≥ 30% flow reduction ≥ 10 s PLUS ≥ 3% desaturation or an arousal.",
    "CAI ≥ 5/hr with central-dominant events → search for HF, altitude, opioids — not just 'OSA'.",
    "Supine-only and REM-only patterns change therapy targets, not the severity label."] },
{ id:"icvd3", name:"ICSD-3 — Sleep Disorder Definitions", org:"International Classification of Sleep Disorders 3rd ed", upd:"with 2023 text revision", tags:["Sleep"], ic:"moon",
  summ:"Diagnostic definitions: OSA (AHI ≥ 5 + symptoms, or AHI ≥ 15 alone), OHS (obesity + awake PaCO₂ ≥ 45 + hypoventilation not better explained), narcolepsy NT1 (cataplexy + MSLT ≤ 8 min + ≥ 2 SOREMPs, or CSF hypocretin < 110 pg/mL), RBD (REM sleep without atonia + dream enactment), RLS (urge to move + rest + relief + evening/worsening), insomnia (difficulty initiating/maintaining sleep despite adequate opportunity).",
  sections:[
    { h:"Key diagnostic criteria", html:`
      <div class="tscroll"><table class="dt"><thead><tr><th>Disorder</th><th>Core objective criterion</th><th>Confirmatory</th></tr></thead><tbody>
      <tr><td class="mono cy">OHS</td><td>BMI ≥ 30 + PaCO₂ ≥ 45 (awake)</td><td class="muted">+ sleep hypoventilation (SpO₂ baseline ↓, T90 ↑); PFTs to exclude restrictive disease</td></tr>
      <tr><td class="mono cy">Narcolepsy NT1</td><td>Cataplexy + MSLT ≤ 8 min + ≥ 2 SOREMPs</td><td class="muted">CSF hypocretin-1 < 110 pg/mL is definitive</td></tr>
      <tr><td class="mono cy">Narcolepsy NT2</td><td>MSLT ≤ 8 min + ≥ 2 SOREMPs, NO cataplexy</td><td class="muted">Rule out insufficient sleep, meds, OSA first</td></tr>
      <tr><td class="mono cy">RBD</td><td>REM without atonia (↑ chin/tibialis EMG in REM)</td><td class="muted">Video-PSG + history of dream enactment; 90% > 50 yr, male</td></tr>
      <tr><td class="mono cy">PLMD</td><td>PLMI > 15/hr (adults) on PSG</td><td class="muted">Diagnosis needs symptoms (RLS) — otherwise it is just a finding</td></tr>
      <tr><td class="mono cy">Insomnia</td><td>SL ≥ 30 min / WASO ≥ 60 min, SE < 85%</td><td class="muted">≥ 3 nights/week, ≥ 3 months for chronic</td></tr></tbody></table></div>` },
  ],
  pearls:["AHI ≥ 15/hr stands alone as OSA diagnosis — symptoms optional at that level.",
    "OHS is a DAYTIME hypercapnia diagnosis; the sleep study confirms but does not define it.",
    "Do not diagnose narcolepsy on a single nap-lab — MSLT needs ≥ 6 h sleep the night before and 2-week washout of REM-suppressing drugs."] },
{ id:"aasmpap", name:"AASM PAP Titration & Follow-up", org:"American Academy of Sleep Medicine", upd:"2016 guideline + 2018 update", tags:["Sleep"], ic:"gauge",
  summ:"CPAP start 4–6 cmH₂O (titration studies) or APAP bounds 6–14; adjustments of 1–2 cmH₂O no more often than every 5 min toward: AHI < 5, no flow limitation, SpO₂ > 90%, in ALL postures and REM. Review at 4–8 weeks with objective download; adherence goal ≥ 4 h/night on ≥ 70% of nights.",
  sections:[
    { h:"Pressure targets & pitfalls", html:`
      <p>Titration endpoint: abolition of apneas, hypopneas, RERAs and snoring <b>in supine REM</b> — the position/stage where the airway is worst. Rising pressure that un-masks central apneas = <b>treatment-emergent CSA (TECSA)</b>: if centrals persist beyond 1–3 months, ASV or BPAP-ST is considered (after optimizing HF therapy when LVEF ≤ 45% — ASV is contraindicated there per SERVE-HF/ADVENT-HF signals).</p>
      <p>High leak, mouth breathing and aerophagia are the top causes of 'failure' — check the raw flow curves before raising pressure.</p>` },
    { h:"Alternative pathways", html:`
      <ul class="checks">
      <li class="good">Mandibular advancement device: mild–moderate OSA or CPAP-intolerant; retitrate after ~3 months of use.</li>
      <li class="good">Hypoglossal nerve stimulation candidacy: AHI 15–65, CPAP-intolerant, no complete concentric collapse at DISE, FDA BMI ceiling per protocol.</li>
      <li class="good">Positional therapy: valid when supine AHI ≥ 2× non-supine AND non-supine AHI < 10 — verify with PAP positional data.</li>
      </ul>` },
  ],
  pearls:["Residual AHI ≥ 5 on download: check leak first, mask second, centrals third — only then raise pressure.",
    "ESS ≥ 16 despite ≥ 4 h/night good adherence → look for residual events, PLMs, hypoventilation, or a hypersomnia.",
    "Every resistant-HTN and every AF clinic patient deserves a sleep screen."] },
{ id:"aasmhf", name:"Central Apnea · Cheyne–Stokes — HF pathway", org:"AASM / ESC heart-failure interface", upd:"consensus", tags:["Sleep"], ic:"heart",
  summ:"CSA with Cheyne–Stokes respiration in heart failure: optimize GDMT first (beta-blocker, ACEi/ARB/ARNI, MRA, SGLT2). ASV is contraindicated with LVEF ≤ 45% (SERVE-HF). Options: oxygen at night, BPAP-ST, acetazolamide; transplant candidacy drives the rest.",
  sections:[
    { h:"Recognition", html:`
      <p>Overnight oximetry with a <b>crescendo–decrescendo</b> saw-tooth; PSG shows central apneas ≥ 5/hr, typically NREM sleep onset/wake transitions, worse in supine position; loop gain > 3 is the mechanism. Atrial fibriblation and male sex multiply prevalence. Look for it in every HF patient with paradoxical daytime fatigue.</p>` },
  ],
  pearls:["Central events that disappear as sleep consolidates = sleep-onset instability, not disease.",
    "TECSA after CPAP start often self-resolves by 1–3 months — re-download before switching modes.",
    "LVEF ≤ 45%: no ASV. Optimize GDMT, consider nocturnal O₂, BPAP-ST, or acetazolamide."] }
);
/* extra icons for sleep consult */
Object.assign(ICONS, {
  moon2:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13.5A8.5 8.5 0 1 1 10.5 4a7 7 0 0 0 9.5 9.5z"/></svg>',
  bed:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 18h18"/><path d="M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/><path d="M6 15h4" opacity=".6"/></svg>',
});

/* ═══ 2 · SLEEP CONSULTANT SCHEMA ═════════════════════════════════════════ */
const SL_SCHEMA = [
  { t: "PATIENT & PRESENTATION", no: "01", open: true, f: [
    { id: "age", l: "Age", u: "yr", t: "num", v: 52 },
    { id: "sex", l: "Sex", t: "seg", o: ["male", "female"], v: "male" },
    { id: "bmi", l: "BMI", u: "kg/m²", t: "num", v: 33 },
    { id: "neck", l: "Neck circ.", u: "cm", t: "num", ph: "—" },
    { id: "ess", l: "Epworth (ESS)", u: "0–24", t: "num", v: 15 },
  ] },
  { t: "SYMPTOMS & HISTORY", no: "02", checks: [
    { id: "snoring", l: "Loud habitual snoring" },
    { id: "witnessed", l: "Witnessed apnoeas" },
    { id: "nocturia", l: "Nocturia ×2+" },
    { id: "morningHeadache", l: "Morning headache" },
    { id: "unrefreshing", l: "Unrefreshing sleep" },
    { id: "dreamEnact", l: "Dream enactment (RBD)" },
    { id: "rlsUrge", l: "RLS urge-to-move (evening)" },
    { id: "cataplexy", l: "Cataplexy (emotion-triggered)" },
    { id: "sleepParalysis", l: "Sleep paralysis / hypnagogic HH" },
    { id: "hypnoticUse", l: "Nightly hypnotic/sedative use" },
    { id: "opioidUse", l: "Chronic opioid therapy" },
    { id: "csrPattern", l: "Crescendo–decrescendo oximetry on report" },
  ] },
  { t: "COMORBIDITIES", no: "03", checks: [
    { id: "htn", l: "Hypertension (incl. resistant)" },
    { id: "dm2", l: "Type 2 diabetes" },
    { id: "hf", l: "Heart failure (HFrEF)" },
    { id: "afib", l: "Atrial fibrillation" },
    { id: "stroke", l: "Prior stroke/TIA" },
    { id: "copd", l: "COPD overlap" },
    { id: "hypothyroid", l: "Hypothyroidism" },
    { id: "sedentaryJob", l: "Professional driver / safety-critical job" },
  ] },
  { t: "STUDY & ARCHITECTURE", no: "04", open: true, f: [
    { id: "study", l: "Study type", t: "sel", w2: true, v: "psg", o: [
      ["psg", "In-lab PSG"], ["hsat", "HSAT / home test"], ["split", "Split-night PSG"], ["mslt", "PSG + MSLT"], ["oximetry", "Overnight oximetry only"] ] },
    { id: "quality", l: "Quality", t: "seg", o: [["good", "GOOD"], ["poor", "POOR"]], v: "good" },
    { id: "tst", l: "TST", u: "min", t: "num", v: 380 },
    { id: "sl", l: "Sleep latency", u: "min", t: "num", v: 12 },
    { id: "reml", l: "REM latency", u: "min", t: "num", v: 110 },
    { id: "waso", l: "WASO", u: "min", t: "num", ph: "—" },
    { id: "se", l: "Sleep efficiency", u: "%", t: "num", v: 74 },
    { id: "n3p", l: "N3 share", u: "%", t: "num", v: 8 },
    { id: "remp", l: "REM share", u: "%", t: "num", v: 14 },
    { id: "soremp", l: "SOREMPs", u: "count", t: "num", ph: "0" },
    { id: "msltLat", l: "MSLT mean latency", u: "min", t: "num", ph: "—" },
  ] },
  { t: "EVENT INDICES", no: "05", open: true, f: [
    { id: "ahi", l: "AHI total", u: "/hr", t: "num", v: 38 },
    { id: "ahiRem", l: "AHI REM", u: "/hr", t: "num", ph: "—" },
    { id: "ahiNrem", l: "AHI NREM", u: "/hr", t: "num", ph: "—" },
    { id: "supineAhi", l: "Supine AHI", u: "/hr", t: "num", ph: "—" },
    { id: "nonSupineAhi", l: "Non-supine AHI", u: "/hr", t: "num", ph: "—" },
    { id: "odi", l: "ODI 3%", u: "/hr", t: "num", v: 34 },
    { id: "rera", l: "RERA index", u: "/hr", t: "num", ph: "—" },
    { id: "arousalIdx", l: "Arousal index", u: "/hr", t: "num", v: 31 },
    { id: "plmi", l: "PLMI", u: "/hr", t: "num", ph: "—" },
    { id: "cai", l: "Central apnea index", u: "/hr", t: "num", ph: "0" },
    { id: "pctCentral", l: "Central share of events", u: "%", t: "num", ph: "—" },
  ] },
  { t: "OXYGENATION & GAS", no: "06", open: true, f: [
    { id: "baseSpo2", l: "Baseline (awake-asleep) SpO₂", u: "%", t: "num", v: 93 },
    { id: "nadir", l: "SpO₂ nadir", u: "%", t: "num", v: 81 },
    { id: "t90", l: "Time below 90%", u: "% TST", t: "num", v: 14 },
    { id: "paco2", l: "PaCO₂ / capillary CO₂", u: "mmHg", t: "num", ph: "—" },
    { id: "lvef", l: "LVEF (echo)", t: "sel", w2: true, v: "unknown", o: [
      ["unknown", "— not known —"], ["preserved", "Preserved ≥ 50%"], ["mild", "Mildly reduced 46–49%"], ["reduced", "Reduced ≤ 45%"] ] },
  ] },
  { t: "CURRENT PAP STATUS (if on therapy)", no: "07", f: [
    { id: "onPap", l: "Already on PAP?", t: "check" },
    { id: "papMode", l: "Mode", t: "sel", w2: true, v: "cpap", o: [
      ["cpap", "CPAP"], ["apap", "APAP"], ["bpap", "BPAP"], ["asv", "ASV"], ["st", "BPAP-ST / NIV"] ] },
    { id: "papPressure", l: "Current pressure", u: "cmH₂O", t: "num", ph: "—" },
    { id: "papHours", l: "Use", u: "h/night", t: "num", ph: "—" },
    { id: "residualAhi", l: "Residual AHI", u: "/hr", t: "num", ph: "—" },
    { id: "centralsEmerged", l: "Central events emerged on PAP", t: "check" },
  ] },
];

/* ═══ 3 · PRESETS ════════════════════════════════════════════════════════ */
const SL_PRESETS = {
  "Severe OSA (classic)": { study: "psg", age: 52, sex: "male", bmi: 34, neck: 44, ess: 17, ahi: 52, odi: 47, nadir: 78, baseSpo2: 93, t90: 12, sl: 8, reml: 148, se: 71, n3p: 6, remp: 12, tst: 355, arousalIdx: 46, cai: 1, snoring: true, witnessed: true, nocturia: true, unrefreshing: true, htn: true },
  "Positional OSA": { study: "psg", age: 46, sex: "male", bmi: 29, ess: 12, ahi: 21, supineAhi: 39, nonSupineAhi: 3.5, odi: 18, nadir: 86, baseSpo2: 95, t90: 3, sl: 11, reml: 105, se: 80, n3p: 12, remp: 19, arousalIdx: 26, snoring: true, witnessed: true },
  "REM-predominant OSA": { study: "psg", age: 58, sex: "female", bmi: 32, ess: 14, ahi: 19, ahiRem: 43, ahiNrem: 8, odi: 17, nadir: 84, baseSpo2: 94, t90: 5, sl: 14, reml: 118, se: 78, n3p: 10, remp: 21, arousalIdx: 29, witnessed: true, unrefreshing: true, htn: true },
  "OHS — awake hypercapnia": { study: "psg", age: 49, sex: "male", bmi: 39, neck: 46, ess: 16, ahi: 27, odi: 31, nadir: 79, baseSpo2: 90, t90: 34, paco2: 53, sl: 7, reml: 138, se: 69, n3p: 7, remp: 11, arousalIdx: 30, morningHeadache: true, nocturia: true, unrefreshing: true, htn: true, dm2: true },
  "CSA + Cheyne–Stokes (HF)": { study: "psg", age: 72, sex: "male", bmi: 27, ess: 13, ahi: 33, cai: 26, pctCentral: 81, odi: 29, nadir: 84, baseSpo2: 93, t90: 9, sl: 12, reml: 124, se: 74, n3p: 9, remp: 13, arousalIdx: 31, lvef: "reduced", hf: true, afib: true, csrPattern: true },
  "Narcolepsy type 1": { study: "mslt", age: 23, sex: "female", bmi: 23, ess: 20, ahi: 3, odi: 2, nadir: 93, baseSpo2: 96, t90: 0, sl: 3, reml: 5, soremp: 4, msltLat: 3.5, se: 74, n3p: 11, remp: 27, tst: 400, arousalIdx: 24, cataplexy: true, sleepParalysis: true, unrefreshing: true },
  "Chronic insomnia": { study: "psg", age: 41, sex: "female", bmi: 24, ess: 9, ahi: 2.4, odi: 2, nadir: 94, baseSpo2: 96, t90: 0, sl: 55, waso: 92, reml: 105, se: 57, n3p: 8, remp: 15, tst: 330, arousalIdx: 28, hypnoticUse: true, unrefreshing: true },
  "RBD": { study: "psg", age: 69, sex: "male", bmi: 26, ess: 7, ahi: 8, odi: 7, nadir: 90, baseSpo2: 95, t90: 1, sl: 14, reml: 92, se: 82, n3p: 14, remp: 24, plmi: 28, tst: 390, arousalIdx: 17, dreamEnact: true },
  "PLMD with RLS": { study: "psg", age: 57, sex: "female", bmi: 28, ess: 15, ahi: 3.6, odi: 3, nadir: 93, baseSpo2: 96, t90: 0, sl: 16, reml: 98, se: 83, n3p: 15, remp: 20, plmi: 34, tst: 385, arousalIdx: 21, rlsUrge: true, unrefreshing: true },
  "UARS (RERA-heavy)": { study: "psg", age: 34, sex: "female", bmi: 23, ess: 13, ahi: 4.6, rera: 19, odi: 4, nadir: 91, baseSpo2: 96, t90: 0, sl: 10, reml: 88, se: 81, n3p: 13, remp: 23, arousalIdx: 31, unrefreshing: true, snoring: true },
  "Split-night success": { study: "split", age: 61, sex: "male", bmi: 36, ess: 16, ahi: 47, odi: 41, nadir: 79, baseSpo2: 92, t90: 11, sl: 9, reml: 140, se: 72, n3p: 6, remp: 13, tst: 210, arousalIdx: 44, onPap: true, papMode: "cpap", papPressure: 12, papHours: 5.2, residualAhi: 2.8, snoring: true, witnessed: true, htn: true },
  "TECSA — centrals on CPAP": { study: "psg", age: 66, sex: "male", bmi: 31, ess: 12, ahi: 6, odi: 5, nadir: 89, baseSpo2: 94, t90: 2, sl: 13, reml: 100, se: 79, arousalIdx: 22, onPap: true, papMode: "cpap", papPressure: 11, papHours: 4.6, residualAhi: 19, pctCentral: 63, centralsEmerged: true, cai: 13 },
};

/* ═══ 4 · BAYESIAN DIFFERENTIAL TABLE (priors + likelihood ratios) ════════ */
const SL_DX_TABLE = {
  "OSA — obstructive pattern":     { p: 0.55, ev: { ahiHigh: 3.6, ahiSevere: 4.8, ahiMild: 1.6, snoring: 2.3, witnessed: 3.1, nocturia: 1.7, unrefreshing: 1.7, obese: 1.8, htn: 1.5, essHigh: 1.5, male: 1.4, older: 1.3, odiHigh: 3.2, nadirLow: 2.8, seLow: 1.4, n3Low: 2.0, plmiMid: 1.5, centralPred: 0.3, caiHigh: 0.35, csrPattern: 0.3, hypercapnic: 0.5, t90High: 0.55 } },
  "Positional OSA":                { p: 0.16, ev: { supinePred: 9.5, snoring: 1.8, ahiMild: 1.4, ahiHigh: 1.2 } },
  "REM-predominant OSA":           { p: 0.14, ev: { remPred: 8.5, ahiMild: 1.3, ahiHigh: 1.4 } },
  "UARS / RERA phenotype":         { p: 0.09, ev: { reraHigh: 6.5, ahiNormal: 3.4, unrefreshing: 2.2, essHigh: 1.6, aiHigh: 2.4 } },
  "OHS — obesity-hypoventilation": { p: 0.07, ev: { hypercapnic: 7.5, baseLow: 4.2, t90High: 3.8, obese: 3.1, morningHeadache: 2.3, ahiHigh: 1.6, dm2: 1.6 } },
  "CSA — central pattern":         { p: 0.05, ev: { caiHigh: 7.5, centralPred: 5.5, ahiHigh: 1.7, afib: 1.9, older: 1.6, csrPattern: 1.6 } },
  "Cheyne–Stokes (HF-driven)":     { p: 0.05, ev: { csrPattern: 12, caiHigh: 5.5, hf: 5.5, afib: 2.4, older: 1.8, male: 1.5 } },
  "PLMD":                          { p: 0.07, ev: { plmiHigh: 9, rlsUrge: 5.5, unrefreshing: 1.5, essHigh: 1.3 } },
  "RLS (WED)":                     { p: 0.06, ev: { rlsUrge: 9.5, plmiMid: 2.6, unrefreshing: 1.4 } },
  "Narcolepsy NT1":                { p: 0.03, ev: { cataplexy: 15, remlShort: 6.5, sorempHigh: 5.5, msltShort: 4.5, slShort: 2.2, essSevere: 3.2, sleepParalysis: 3.2 } },
  "Narcolepsy NT2 / IH spectrum":  { p: 0.04, ev: { remlShort: 3.2, sorempHigh: 3.0, msltShort: 4.0, slShort: 2.0, essSevere: 2.4, ahiNormal: 1.5 } },
  "Chronic insomnia":              { p: 0.20, ev: { slLong: 4.5, wasoHigh: 4.0, seLow: 1.9, ahiNormal: 2.8, hypnoticUse: 2.3, aiHigh: 1.9 } },
  "RBD":                           { p: 0.04, ev: { dreamEnact: 13, plmiHigh: 2.0, older: 2.2, male: 2.2 } },
  "Treatment-emergent CSA (TECSA)":{ p: 0.04, ev: { centralsEmerged: 9, onPapResidual: 2.6, papOn: 1.8, caiHigh: 2.2 } },
  "Neuromuscular hypoventilation": { p: 0.02, ev: { hypercapnic: 3.6, baseLow: 3.0, t90High: 2.2, nonObese: 2.0 } },
};
/* display meta for differential rows */
const SL_DX_META = {
  "OSA — obstructive pattern":     { c: "#ff3860", n: "Obstructive events with desats/arousals — phenotype confirmed by AHI + flow-limitation chain." },
  "Positional OSA":                { c: "#ffb454", n: "Supine ≥ 2× non-supine with acceptable non-supine AHI — posture is the dominant variable." },
  "REM-predominant OSA":           { c: "#b18cff", n: "REM-selective obstruction — atonia-driven; titrate until REM is clean in all postures." },
  "UARS / RERA phenotype":         { c: "#ffd94d", n: "High RERA with sub-threshold AHI — flattening + arousals without formal hypopneas." },
  "OHS — obesity-hypoventilation": { c: "#ff9e42", n: "Daytime hypercapnia + obesity + nocturnal hypoventilation — a ventilatory failure, not just OSA." },
  "CSA — central pattern":         { c: "#00e5ff", n: "Central-dominant events ≥ 5/hr — HF, altitude, opioids enter the differential." },
  "Cheyne–Stokes (HF-driven)":     { c: "#7d8dff", n: "Crescendo–decrescendo ventilatory oscillation — high loop gain in a failing heart." },
  "PLMD":                          { c: "#3dffb0", n: "Periodic limb movements with arousals — symptomatic only with sleep complaint (RLS)." },
  "RLS (WED)":                     { c: "#00ffc6", n: "Urge to move + evening worsening + relief on movement — ferritin is the first test." },
  "Narcolepsy NT1":                { c: "#ff2d78", n: "Cataplexy + ≤ 8 min MSLT + ≥ 2 SOREMPs (or hypocretin < 110 pg/mL)." },
  "Narcolepsy NT2 / IH spectrum":  { c: "#ffb454", n: "Hypersomnia without cataplexy — needs MSLT after treating OSA and sleep debt." },
  "Chronic insomnia":              { c: "#00e5ff", n: "Long SL/WASO, low SE with clean respiration — CBT-I is the first-line treatment." },
  "RBD":                           { c: "#ff2d78", n: "REM without atonia + dream enactment — consider PSG video; neurodegeneration follow-up." },
  "Treatment-emergent CSA (TECSA)":{ c: "#b18cff", n: "Centrals un-masked by PAP — often self-resolves within 1–3 months; re-download before switching modes." },
  "Neuromuscular hypoventilation": { c: "#8fa3c8", n: "Progressive hypercapnia without obesity — PFTs + neurology referral (ALS, myopathy, kyphoscoliosis)." },
};

/* ═══ 5 · RULE BASE ══════════════════════════════════════════════════════ */
const SL_RULES = [
  { id: "ahi_none", sev: "info", when: f => nn(f.ahi) && f.ahi < 5, cite: "aasm",
    t: f => "AHI " + f1(f.ahi) + "/hr — below the adult abnormality threshold",
    why: "AHI < 5 with symptoms → the differential shifts to UARS/insomnia/hypersomnia; consider RERA index and MSLT pathway." },
  { id: "ahi_mild", sev: "mod", when: f => between(f.ahi, 5, 15), cite: "aasm",
    t: f => "Mild OSA range — AHI " + f1(f.ahi) + "/hr",
    why: "5–14.9/hr: offer PAP if symptomatic (ESS ≥ 11), refractory to conservative measures; oral appliance is an equal first-line here." },
  { id: "ahi_mod", sev: "high", when: f => between(f.ahi, 15, 30), cite: "aasm",
    t: f => "Moderate OSA range — AHI " + f1(f.ahi) + "/hr",
    why: "PAP indicated; APAP bounded 6–14 acceptable without comorbidity; verify supine/REM clearance at final pressure." },
  { id: "ahi_sev", sev: "crit", when: f => gt(f.ahi, 30), cite: "aasm",
    t: f => "Severe OSA range — AHI " + f1(f.ahi) + "/hr",
    why: "≥ 30/hr: PAP first-line; HSAT acceptable for diagnosis in this band (if no comorbidity red-flags); driving counselling applies from diagnosis." },
  { id: "odi_burden", sev: "high", when: f => gt(f.odi, 30), cite: "aasm",
    t: f => "Oxygen desaturation index " + f1(f.odi) + "/hr — heavy desaturation burden",
    why: "ODI tracks the intermittent-hypoxia load that drives sympathetic activation, endothelial injury and AF — it often matters more than AHI alone for cardiovascular risk." },
  { id: "nadir_deep", sev: "high", when: f => lt(f.nadir, 80), cite: "aasm",
    t: f => "SpO₂ nadir " + f0(f.nadir) + "% — deep nocturnal hypoxaemia",
    why: "Nadir < 80% marks the severe end of intermittent hypoxia; if baseline is also low, think hypoventilation rather than pure obstruction." },
  { id: "t90_hypo", sev: "crit", when: f => gt(f.t90, 30), cite: "icvd3",
    t: f => "T90 " + f0(f.t90) + "% of TST — frank nocturnal hypoventilation",
    why: "SpO₂ below 90% for a third of the night is a VENTILATION problem: obesity-hypoventilation until proven otherwise; get an awake blood gas and PFTs (restrictive disease? neuromuscular?). BPAP, not CPAP, is usually the right engine." },
  { id: "base_low", sev: "high", when: f => lt(f.baseSpo2, 92) && f.paco2 == null, cite: "icvd3",
    t: f => "Baseline SpO₂ " + f0(f.baseSpo2) + "% — unexplained resting hypoxaemia",
    why: "A low baseline without known lung disease demands awake ABG + PFTs: OHS, restrictive chest disease and pulmonary vascular disease all present this way. Do not settle for CPAP alone." },
  { id: "hypercapnia", sev: "crit", when: f => gt(f.paco2, 45), cite: "icvd3",
    t: f => "Awake PaCO₂ " + f0(f.paco2) + " mmHg — chronic hypoventilation present",
    why: f => f.bmi >= 30
      ? "With BMI " + f1(f.bmi) + " this meets OHS physiology: BPAP (IPAP 14–20 / EPAP to clear obstruction), target VT 6–8 mL/kg IBW; AVAPS if refractory."
      : "Hypercapnia without obesity: send PFTs (restrictive?) + neurology review — neuromuscular and chest-wall causes (ALS, myopathies, kyphoscoliosis) are diagnosed late." },
  { id: "central_dom", sev: "crit", when: f => gt(f.cai, 5) || gt(f.pctCentral, 50), cite: "aasm",
    t: f => "Central events dominate — CAI " + f1(f.cai || 0) + "/hr" + (f.pctCentral ? ", " + f0(f.pctCentral) + "% of events" : ""),
    why: "Central ≥ 5/hr or > 50% of events: interrogate heart failure (echo), altitude, opioids. Pure CPAP may worsen this — the engine choice changes (ASV/BPAP-ST family)." },
  { id: "csr_seen", sev: "high", when: f => !!f.csrPattern, cite: "aasmhf",
    t: () => "Crescendo–decrescendo pattern reported — Cheyne–Stokes signature",
    why: "CSR + HF: optimize GDMT first; if LVEF ≤ 45% no ASV (SERVE-HF). Nocturnal O₂, BPAP-ST or acetazolamide are the alternatives; refer for transplant assessment if refractory." },
  { id: "rem_pred", sev: "mod", when: f => !!f.remPred, cite: "aasm",
    t: f => "REM-predominant OSA — REM AHI " + f1(f.ahiRem) + " vs NREM " + f1(f.ahiNrem),
    why: "REM-selective obstruction gives deeper desats per event (atonia + reduced compensation). Titration is not finished until REM in the supine position is clean." },
  { id: "positional", sev: "mod", when: f => !!f.supinePred, cite: "aasmpap",
    t: f => "Positional OSA — supine " + f1(f.supineAhi) + " vs non-supine " + f1(f.nonSupineAhi) + "/hr",
    why: "Non-supine AHI < 10 with supine ≥ 2×: positional therapy is a legitimate primary strategy — vibration devices outperform tennis balls; verify with download data." },
  { id: "rera_uars", sev: "mod", when: f => gt(f.rera, 15) && nn(f.ahi) && f.ahi < 5, cite: "aasm",
    t: f => "RERA index " + f1(f.rera) + "/hr with normal AHI — UARS phenotype",
    why: "Flow limitation + arousals without formal hypopneas: treat symptomatically (PAP trial or oral appliance); MSLT only after this is addressed." },
  { id: "plmd_rule", sev: "mod", when: f => gt(f.plmi, 15), cite: "icvd3",
    t: f => "PLMI " + f1(f.plmi) + "/hr — periodic limb movements present",
    why: f => f.rlsUrge
      ? "With the RLS history this is clinically symptomatic: check ferritin (target > 75 ng/mL), consider gabapentin/enacarbil or a low-dose dopamine agonist (watch augmentation)."
      : "PLMs alone (without RLS symptoms) are a finding, not a diagnosis — correlate with arousal index and sleep complaint." },
  { id: "reml_short", sev: "high", when: f => nn(f.reml) && f.reml <= 15, cite: "icvd3",
    t: f => "REM latency " + f0(f.reml) + " min — narcolepsy-spectrum architecture",
    why: "SOREMP at sleep onset (≤ 15 min) + ≥ 2 SOREMPs overall points to narcolepsy NT1/NT2 — confirm with MSLT (≤ 8 min) after ≥ 6 h sleep and 2-week washout of REM-suppressing drugs; treat OSA first." },
  { id: "mslt_short", sev: "high", when: f => nn(f.msltLat) && f.msltLat <= 8, cite: "icvd3",
    t: f => "MSLT mean latency " + f1(f.msltLat) + " min",
    why: f => (f.soremp || 0) >= 2
      ? "MSLT ≤ 8 min + " + f0(f.soremp) + " SOREMPs — narcolepsy confirmed by MSLT criteria (cataplexy decides NT1 vs NT2; CSF hypocretin is definitive)."
      : "Short latency without ≥ 2 SOREMPs — re-examine sleep debt, OSA treatment adequacy and medication list before labelling." },
  { id: "insomnia_arch", sev: "high", when: f => (gt(f.sl, 30) || gt(f.waso, 60)) && lt(f.se, 85) && nn(f.ahi) && f.ahi < 5, cite: "icvd3",
    t: f => "Insomnia architecture — SL " + f0(f.sl) + " min, WASO " + f0(f.waso || 0) + ", SE " + f0(f.se) + "%",
    why: "Clean respiration + fragmented, short, effortful sleep: CBT-I (sleep restriction + stimulus control) is first-line — 6–8 structured sessions; hypnotics are a bridge, not a plan." },
  { id: "se_low", sev: "mod", when: f => lt(f.se, 75), cite: "aasm",
    t: f => "Sleep efficiency " + f0(f.se) + "%",
    why: "SE < 75%: quantify the fragmentation source (events vs arousals vs PLMs) before escalating therapy." },
  { id: "ess_high", sev: "high", when: f => gt(f.ess, 15), cite: "aasmpap",
    t: f => "Epworth " + f0(f.ess) + "/24 — pathological daytime sleepiness",
    why: "ESS ≥ 16: formal driving-safety counselling at diagnosis and at every review — this is a safety-critical flag, and if the job is safety-critical, occupational review applies." },
  { id: "tecsa_rule", sev: "high", when: f => !!f.centralsEmerged, cite: "aasmhf",
    t: () => "Central apnoeas emerged after PAP start — TECSA pattern",
    why: "Watch 1–3 months (most self-resolve as CO₂ set-point re-trains); if residual central AHI ≥ 5 persists, consider BPAP-ST/ASV — but NOT ASV if LVEF ≤ 45%." },
  { id: "residual_high", sev: "high", when: f => !!f.onPap && gt(f.residualAhi, 5), cite: "aasmpap",
    t: f => "Residual AHI " + f1(f.residualAhi) + "/hr on therapy",
    why: "Leak first (mask + mouth), centrals second, pressure third. Only then re-titrate — auto-rising pressure in the presence of centrals makes it worse." },
  { id: "adherence_low", sev: "mod", when: f => !!f.onPap && nn(f.papHours) && f.papHours < 4, cite: "aasmpap",
    t: f => "PAP use " + f1(f.papHours) + " h/night — below the adherence line",
    why: "Goal ≥ 4 h/night on ≥ 70% of nights: intensive week-1–4 support, heated humidification, mask refit, desensitization, and APAP for pressure intolerance." },
  { id: "asv_contra", sev: "crit", when: f => f.lvef === "reduced" && (gt(f.cai, 5) || !!f.centralsEmerged || !!f.csrPattern), cite: "aasmhf",
    t: () => "ASV is contraindicated — LVEF ≤ 45% with central/CSR physiology",
    why: "SERVE-HF/ADVENT-HF signal: increased cardiovascular mortality with ASV in HFrEF. Optimize GDMT; nocturnal O₂, BPAP-ST or acetazolamide instead." },
];

/* ═══ 6 · NEURAL ACTION LATTICE ══════════════════════════════════════════ */
const SL_NET = {
  feats: ["osaAny","osaSevere","hypoxBurden","hypovent","hypercapnia","centralDom","csrHF","asvBlock","tecsa","residHigh","leakPoor","positional","remPred","uars","insomniaArch","plmSympt","rlsProb","narcoPath","rbdPath","sleepySevere","driverRisk","papOn","papFail","mildOsa","obese","comorbidHeavy","studyHsat"],
  outs: ["startCPAP","apapBounds","biLevel","avapsConsider","asvTrial","stBackup","positionalRx","oralAppliance","hnsConsider","weightMgmt","drivingCounsel","msltOrder","cbtI","ironWorkup","rbdSafety","retitrate","papEducation","leakFix","oximetryFu","abgPft","gdmtOptimize","cbtIPlus","sleepHygiene","followEarly"],
  bias: { hnsConsider: -2.6, avapsConsider: -1.9, asvTrial: -1.7, stBackup: -1.1, msltOrder: -1.3, gdmtOptimize: -0.9, cbtI: -0.7, followEarly: -0.3 },
  W: {
    osaAny:      { startCPAP: 2.6, papEducation: 1.5, apapBounds: 1.2, followEarly: 1.1 },
    osaSevere:   { startCPAP: 3.2, drivingCounsel: 2.2, papEducation: 1.3, oximetryFu: 0.8 },
    hypoxBurden: { startCPAP: 1.2, oximetryFu: 1.5 },
    hypovent:    { biLevel: 3.2, abgPft: 2.8, avapsConsider: 0.9, startCPAP: -1.4 },
    hypercapnia: { biLevel: 3.4, abgPft: 2.4, avapsConsider: 1.2 },
    centralDom:  { biLevel: 0.7, asvTrial: 1.6, stBackup: 1.8, gdmtOptimize: 1.4, startCPAP: -1.2 },
    csrHF:       { gdmtOptimize: 3.2, asvTrial: 1.1, stBackup: 1.6, oximetryFu: 1.2 },
    asvBlock:    { stBackup: 2.8, gdmtOptimize: 2.2, asvTrial: -3.4 },
    tecsa:       { oximetryFu: 2.2, retitrate: 0.8, asvTrial: 0.9 },
    residHigh:   { leakFix: 3.1, retitrate: 2.4 },
    leakPoor:    { leakFix: 2.6, papEducation: 1.2 },
    positional:  { positionalRx: 3.4, papEducation: 0.6 },
    remPred:     { retitrate: 1.4, papEducation: 0.7 },
    uars:        { oralAppliance: 1.4, papEducation: 1.1, startCPAP: 1.2 },
    insomniaArch:{ cbtI: 3.6, cbtIPlus: 1.8, sleepHygiene: 1.6 },
    plmSympt:    { ironWorkup: 3.0 },
    rlsProb:     { ironWorkup: 3.2 },
    narcoPath:   { msltOrder: 3.8, drivingCounsel: 2.0 },
    rbdPath:     { rbdSafety: 3.3 },
    sleepySevere:{ drivingCounsel: 2.6, msltOrder: 1.2 },
    driverRisk:  { drivingCounsel: 3.6 },
    papOn:       { oximetryFu: 1.6, retitrate: 1.2 },
    papFail:     { oralAppliance: 2.2, hnsConsider: 1.5, papEducation: 1.3 },
    mildOsa:     { oralAppliance: 1.8, weightMgmt: 1.4, positionalRx: 0.9 },
    obese:       { weightMgmt: 2.8 },
    comorbidHeavy:{ abgPft: 2.0, oximetryFu: 1.3 },
    studyHsat:   { abgPft: 0.8, startCPAP: 0.6 },
  },
};
const SL_ACT = {
  startCPAP:    { t: "Initiate PAP therapy", d: "CPAP 4–6 start or APAP 6–14 bounds." },
  apapBounds:   { t: "APAP with bounded pressures", d: "6–14 cmH₂O window; review 95th-percentile pressure." },
  biLevel:      { t: "Bilevel PAP (BPAP)", d: "IPAP/EPAP split — the ventilating engine for hypoventilation." },
  avapsConsider:{ t: "Consider AVAPS / volume-targeted BPAP", d: "When fixed BPAP fails to normalize nocturnal ventilation." },
  asvTrial:     { t: "ASV (only if LVEF > 45%)", d: "Servo-ventilation for TECSA/CSA — contraindicated in HFrEF." },
  stBackup:     { t: "BPAP-ST with backup rate", d: "The safe engine when ASV is blocked by reduced LVEF." },
  positionalRx: { t: "Positional therapy", d: "Vibration trainer + verify on download data." },
  oralAppliance:{ t: "Mandibular advancement device", d: "Equal first-line in mild OSA; retitrate at 3 months." },
  hnsConsider:  { t: "Hypoglossal nerve stimulation referral", d: "AHI 15–65, CPAP-intolerant, DISE non-concentric collapse." },
  weightMgmt:   { t: "Structured weight management", d: "10% weight loss ≈ 26% AHI reduction; consider GLP-1 era adjuncts." },
  drivingCounsel:{ t: "Formal driving-safety counselling", d: "ESS ≥ 16 or safety-critical occupation — document the advice." },
  msltOrder:    { t: "Order MSLT", d: "After ≥ 6 h sleep, 2-week REM-drug washout, OSA treated." },
  cbtI:         { t: "CBT-I programme", d: "6–8 sessions — sleep restriction + stimulus control; first-line." },
  ironWorkup:   { t: "Ferritin + iron studies", d: "Target ferritin > 75 ng/mL; replace if low." },
  rbdSafety:    { t: "RBD safety measures + medication", d: "Padding, separate bedding; melatonin 3–12 mg or clonazepam 0.25–1 mg." },
  retitrate:    { t: "Re-titrate pressure", d: "Manual titration study or APAP trial after leak/centrals excluded." },
  papEducation: { t: "PAP acclimatization package", d: "Humidification, mask refit, desensitization, week-1 call." },
  leakFix:      { t: "Fix leak first", d: "Mask refit / chin strap — before any pressure change." },
  oximetryFu:   { t: "Objective download follow-up", d: "Review 4–8 weeks; residual AHI, leak, hours." },
  abgPft:       { t: "Awake blood gas + PFTs", d: "Unmask OHS / restrictive / neuromuscular causes." },
  gdmtOptimize: { t: "Optimize HF therapy (GDMT)", d: "Beta-blocker, ARNI, MRA, SGLT2 — before device choices." },
  cbtIPlus:     { t: "CBT-I + hypnotic taper", d: "Bridge only; plan the taper from day one." },
  sleepHygiene: { t: "Sleep-hygiene + stimulus control", d: "Caffeine/alcohol timing, wind-down, fixed wake time." },
  followEarly:  { t: "Early intensive follow-up", d: "Weeks 1–4 decide long-term adherence." },
};

/* ═══ 7 · FACTS + FEATURES ═══════════════════════════════════════════════ */
function deriveSleepFacts(i){
  const f = Object.assign({}, i);
  f.ahi = i.ahi == null ? null : +i.ahi;
  f.bmi = i.bmi == null ? null : +i.bmi;
  f.ess = i.ess == null ? null : +i.ess;
  f.sev = f.ahi == null ? "—" : (f.ahi < 5 ? "none" : f.ahi < 15 ? "mild" : f.ahi < 30 ? "moderate" : "severe");
  f.ahiRatio = (i.ahiRem != null && i.ahiNrem != null && i.ahiNrem > 0) ? i.ahiRem / i.ahiNrem : null;
  f.remPred = !!(i.ahiRem != null && i.ahiNrem != null && i.ahiNrem < 15 && i.ahiRem >= 2 * Math.max(1, i.ahiNrem) && (i.ahiRem - i.ahiNrem) > 4);
  f.supinePred = !!(i.supineAhi != null && i.nonSupineAhi != null && i.nonSupineAhi < 10 && i.supineAhi >= 2 * Math.max(1, i.nonSupineAhi) && (i.supineAhi - i.nonSupineAhi) > 8);
  f._i = i;
  return f;
}
function buildSleepFeats(f){
  const s = {};
  if (f.ahi != null){
    if (f.ahi < 5) s.ahiNormal = 1;
    if (f.ahi >= 5 && f.ahi < 15) s.ahiMild = 1;
    if (f.ahi >= 15) s.ahiHigh = clamp((f.ahi - 12) / 40 + 0.6, 0.6, 1);
    if (f.ahi >= 30) s.ahiSevere = 1;
  }
  if (gt(f.odi, 25)) s.odiHigh = 1;
  if (lt(f.nadir, 85)) s.nadirLow = clamp((88 - f.nadir) / 12, 0.5, 1);
  if (lt(f.baseSpo2, 92)) s.baseLow = clamp((94 - f.baseSpo2) / 8, 0.5, 1);
  if (gt(f.t90, 25)) s.t90High = 1;
  if (gt(f.paco2, 45)) s.hypercapnic = clamp((f.paco2 - 43) / 12, 0.6, 1);
  if (f.bmi != null){ if (f.bmi >= 30) s.obese = 1; else s.nonObese = 1; }
  if (gt(f.cai, 5)) s.caiHigh = 1;
  if (gt(f.pctCentral, 50)) s.centralPred = 1;
  if (f.sex === "male") s.male = 1; else s.female = 1;
  if (gt(f.age, 55)) s.older = 1;
  ["snoring","witnessed","nocturia","morningHeadache","unrefreshing","dreamEnact","rlsUrge","cataplexy","sleepParalysis","hypnoticUse","csrPattern","htn","dm2","hf","afib","stroke","copd","hypothyroid","centralsEmerged"].forEach(k => { if (f[k]) s[k] = 1; });
  if (f.remPred) s.remPred = 1;
  if (f.supinePred) s.supinePred = 1;
  if (gt(f.plmi, 15)) s.plmiHigh = 1;
  if (gt(f.plmi, 5) && !gt(f.plmi, 15)) s.plmiMid = 1;
  if (gt(f.rera, 15) && f.ahi != null && f.ahi < 5) s.reraHigh = 1;
  if (gt(f.arousalIdx, 20)) s.aiHigh = 1;
  if (f.reml != null && f.reml <= 15) s.remlShort = 1;
  if (f.soremp != null && f.soremp >= 2) s.sorempHigh = 1;
  if (f.msltLat != null && f.msltLat <= 8) s.msltShort = 1;
  if (f.sl != null && f.sl <= 8) s.slShort = 1;
  if (f.sl != null && f.sl >= 30) s.slLong = 1;
  if (f.waso != null && f.waso >= 60) s.wasoHigh = 1;
  if (f.se != null && f.se < 85) s.seLow = 1;
  if (f.n3p != null && f.n3p < 7) s.n3Low = 1;
  if (f.ess != null && f.ess >= 11) s.essHigh = clamp((f.ess - 9) / 8, 0.5, 1);
  if (f.ess != null && f.ess >= 16) s.essSevere = 1;
  if (f.onPap){ s.papOn = 1;
    if (f.residualAhi != null && f.residualAhi >= 5) s.onPapResidual = 1;
    if (f.centralsEmerged) s.papOn = 1;
  }
  return s;
}
/* lattice-activation mapping (facts → SL_NET feats) */
function buildActiveS(f, feats){
  const a = {};
  if (f.ahi != null && f.ahi >= 5) a.osaAny = clamp(f.ahi / 55 + 0.35, 0.4, 1);
  if (f.ahi != null && f.ahi >= 30) a.osaSevere = 1;
  if (gt(f.odi, 25) || lt(f.nadir, 82)) a.hypoxBurden = 1;
  if (gt(f.t90, 25) || lt(f.baseSpo2, 90)) a.hypovent = 1;
  if (gt(f.paco2, 45)) a.hypercapnia = 1;
  if (gt(f.cai, 5) || gt(f.pctCentral, 50)) a.centralDom = 1;
  if (f.csrPattern && f.hf) a.csrHF = 1;
  if (f.lvef === "reduced" && (a.centralDom || f.csrPattern)) a.asvBlock = 1;
  if (feats.centralsEmerged || (f.onPap && gt(f.cai, 5))) a.tecsa = 1;
  if (f.onPap && gt(f.residualAhi, 5)) a.residHigh = 1;
  if (f.onPap && (f.residualAhi == null || f.residualAhi > 15)) a.leakPoor = f.onPap && f.residualAhi != null && f.residualAhi > 15 ? 1 : 0.5;
  if (f.supinePred) a.positional = 1;
  if (f.remPred) a.remPred = 1;
  if (gt(f.rera, 15) && f.ahi != null && f.ahi < 5) a.uars = 1;
  if ((gt(f.sl, 30) || gt(f.waso, 60)) && lt(f.se, 85) && f.ahi != null && f.ahi < 5) a.insomniaArch = 1;
  if (gt(f.plmi, 15)) a.plmSympt = 1;
  if (f.rlsUrge) a.rlsProb = 1;
  if ((f.reml != null && f.reml <= 15) || (f.msltLat != null && f.msltLat <= 8) || f.cataplexy) a.narcoPath = f.cataplexy ? 1.4 : 1;
  if (f.dreamEnact) a.rbdPath = 1;
  if (f.ess != null && f.ess >= 16) a.sleepySevere = 1;
  if (f.ess != null && f.ess >= 11 && (f.sedentaryJob || f.ess >= 16)) a.driverRisk = 1;
  if (f.onPap) a.papOn = 1;
  if (f.onPap && (f.residualAhi != null ? f.residualAhi > 15 : false)) a.papFail = 0;
  if (f.onPap && f.papHours != null && f.papHours < 3) a.papFail = 1;
  if (f.ahi != null && f.ahi >= 5 && f.ahi < 15) a.mildOsa = 1;
  if (f.bmi != null && f.bmi >= 30) a.obese = clamp((f.bmi - 28) / 12, 0.5, 1);
  const heavy = (f.hf ? 1 : 0) + (f.copd ? 1 : 0) + (f.stroke ? 1 : 0) + (f.paco2 != null && f.paco2 > 45 ? 1 : 0) + (f.hypothyroid ? 1 : 0);
  if (heavy >= 2 || (f.study === "hsat" && (f.hf || f.copd || f.csrPattern || gt(f.cai, 5) || gt(f.paco2, 45)))) a.comorbidHeavy = 1;
  if (f.study === "hsat" && (a.comorbidHeavy || gt(f.cai, 5) || gt(f.paco2, 45) || f.csrPattern)) a.studyHsat = 1;
  return a;
}

/* ═══ 8 · PAP / THERAPY MODE ADVICE CARDS ════════════════════════════════ */
function sleepModeAdvice(f){
  const cards = [];
  const add = (m, why, conf, cite) => cards.push({ m, why, conf, cite });
  if (gt(f.paco2, 45) || gt(f.t90, 30))
    add("BPAP S/T — IPAP 14–20 / EPAP 6–10", "Awake hypercapnia or T90 ≥ 30% is VENTILATORY failure: single-pressure CPAP cannot fix CO₂. Target VT 6–8 mL/kg IBW, normalize nocturnal SpO₂; escalate to AVAPS (volume-targeted) if fixed BPAP under-delivers.", 90, "icvd3");
  if (gt(f.cai, 5) && f.lvef === "reduced")
    add("BPAP-ST + nocturnal O₂ — NOT ASV", "LVEF ≤ 45% with central physiology: ASV is contraindicated (SERVE-HF). Optimize GDMT (beta-blocker, ARNI, MRA, SGLT2), consider acetazolamide; reassess after cardiac optimization.", 88, "aasmhf");
  else if (gt(f.cai, 5) && f.lvef !== "reduced")
    add(f.centralsEmerged ? "Watchful waiting 1–3 months (TECSA)" : "ASV candidacy review", f.centralsEmerged
      ? "Most TECSA self-resolves as the CO₂ set-point retrains — re-download at 1 and 3 months before switching modes; persistent central AHI ≥ 5 → ASV trial (echo first)."
      : "Echo first; if LVEF preserved and central AHI ≥ 5 persists after optimization, ASV is the targeted engine — titrate under observation.", f.centralsEmerged ? 80 : 76, "aasmhf");
  if (f.ahi != null && f.ahi >= 15 && !gt(f.paco2, 45) && !gt(f.cai, 5))
    add("CPAP 4–6 start (or APAP bounded 6–14)", "Titrate 1–2 cmH₂O every ≥ 5 min toward AHI < 5, no flow limitation, SpO₂ > 90% — endpoint must hold in supine REM, the worst-case posture-stage combination.", 92, "aasmpap");
  if (f.ahi != null && f.ahi >= 5 && f.ahi < 15 && !f.onPap)
    add("CPAP if symptomatic — else oral appliance first-line", "Mild band: ESS ≥ 11 → PAP trial; asymptomatic/intolerant → mandibular advancement device (retitrate at 3 months, review TMD/dental status).", 84, "aasmpap");
  if (f.supinePred)
    add("Positional therapy as primary strategy", "Supine " + f1(f.supineAhi) + " vs non-supine " + f1(f.nonSupineAhi) + "/hr: neck-worn vibration trainer with posture verification; combine with weight plan; confirm effect on download.", 82, "aasmpap");
  if (f.onPap && gt(f.residualAhi, 5))
    add("Leak audit → then re-titrate", "Residual AHI " + f1(f.residualAhi) + ": check mask leak and mouth leak on the raw curves first; exclude emerging centrals (they get worse with auto-rising pressure); only then raise/re-titrate.", 86, "aasmpap");
  if (f.rlsUrge || gt(f.plmi, 15))
    add("Ferritin-driven RLS pathway", "Iron studies first (target ferritin > 75 ng/mL; replace orally/IV accordingly). Symptomatic control: gabapentin/enacarbil or low-dose dopamine agonist (watch augmentation; pramipexole is no longer first-choice).", 83, "icvd3");
  if (f.dreamEnact)
    add("RBD: safety + melatonin/clonazepam", "Sleep-safe the bedroom (padding, separate bedding, no glass near bed). Melatonin 3–12 mg is better tolerated; clonazepam 0.25–1 mg if refractory — watch falls, cognition, and sleep apnoea interaction.", 87, "icvd3");
  if (f.cataplexy || (f.msltLat != null && f.msltLat <= 8))
    add("Narcolepsy pathway: wake-promoters + sodium oxybate", "Modafinil/armodafinil first-line for sleepiness; sodium oxybate for cataplexy (also improves night architecture). Scheduled naps, driving rules, and consistent sleep-wake times are part of the prescription.", 85, "icvd3");
  if ((gt(f.sl, 30) || gt(f.waso, 60)) && lt(f.se, 85) && f.ahi != null && f.ahi < 5)
    add("CBT-I — the first-line engine for this phenotype", "6–8 sessions: sleep restriction, stimulus control, worry time; digital CBT-I is evidence-acceptable. Hypnotics only as a bridge with a pre-agreed taper — z-drugs do not fix architecture.", 90, "icvd3");
  if (f.bmi != null && f.bmi >= 30)
    add("Weight management as disease-modifying therapy", "10% body-weight loss ≈ 26% AHI reduction — comparable to a pressure step in mild disease; combine dietetics + activity + GLP-1 era pharmacotherapy where appropriate; bariatric referral if BMI ≥ 40.", 80, "aasmpap");
  if (f.onPap && f.papHours != null && f.papHours < 4)
    add("Rescue adherence package", "Weeks 1–4 decide everything: heated humidification, 2–3 mask options, desensitization (wearing it awake), APAP for pressure intolerance, and a scheduled week-1 phone call.", 82, "aasmpap");
  return cards.sort((a, b) => b.conf - a.conf).slice(0, 6);
}

/* ═══ 9 · NEXT DIAGNOSTIC STEP ENGINE ════════════════════════════════════ */
function sleepNextSteps(f, ranked){
  const steps = [];
  const has = k => ranked.some(x => x.k === k);
  if (f.study === "hsat" && (gt(f.cai, 5) || f.csrPattern || gt(f.paco2, 45) || f.hf || f.copd))
    steps.push({ t: "Upgrade HSAT → in-lab PSG", d: "AASM: HSAT is valid only with high pre-test probability WITHOUT cardiopulmonary disease, opioid use, suspected central apnoea or hypoventilation — several of these are present, so an attended study with CO₂ monitoring is required.", cite: "aasm" });
  if (f.study === "hsat" && f.ahi != null && f.ahi < 5 && (f.snoring || f.unrefreshing || (f.ess != null && f.ess >= 11)))
    steps.push({ t: "Negative HSAT does not exclude OSA here", d: "With persistent symptoms and a negative home test, proceed to in-lab PSG (with RERA scoring) — HSAT under-calls hypopneas and UARS by design.", cite: "aasm" });
  if (gt(f.t90, 30) || lt(f.baseSpo2, 92) || gt(f.paco2, 45))
    steps.push({ t: "Morning awake blood gas + full PFTs", d: "T90 ≥ 30%, low baseline SpO₂ or hypercapnia: quantify PaCO₂/HCO₃ and get spirometry + volumes + DLCO — separates OHS from restrictive chest disease, neuromuscular weakness and pulmonary vascular causes.", cite: "icvd3" });
  if (f.study === "split" && f.ahi != null && f.ahi >= 40)
    steps.push({ t: "Split-night conversion was mandatory at AHI ≥ 40", d: "Diagnostic portion ≥ 3 h with AHI ≥ 40 → same-night titration (which this study did). Record the pressure that cleared supine REM as the prescription starting point.", cite: "aasm" });
  if (f.study === "psg" && f.ahi != null && f.ahi >= 40 && !f.onPap)
    steps.push({ t: "Straight-to-titration is justified", d: "AHI ≥ 40 on the diagnostic limb: arrange titration without a second diagnostic night — either in-lab or bounded APAP with early review at 1 week.", cite: "aasm" });
  if ((f.reml != null && f.reml <= 15) || f.cataplexy || (f.msltLat != null && f.msltLat <= 8)){
    if (f.msltLat == null)
      steps.push({ t: "Order MSLT — after pre-conditions are met", d: "≥ 6 h sleep the night before (actigraphy documents it), 2-week washout of REM-suppressing drugs (SSRIs, SNRIs, TCAs), and OSA treated first — otherwise the SOREMPs are uninterpretable.", cite: "icvd3" });
    else if (f.cataplexy)
      steps.push({ t: "MSLT criteria met — NT1 confirmed pathway", d: "MSLT ≤ 8 min + " + f0(f.soremp || 0) + " SOREMPs + cataplexy = NT1. Consider CSF hypocretin if atypical; start wake-promoters and counsel on driving/naps.", cite: "icvd3" });
  }
  if (f.ess != null && f.ess >= 16 && f.onPap && f.papHours != null && f.papHours >= 4 && (f.residualAhi == null || f.residualAhi < 5))
    steps.push({ t: "Persistent ESS ≥ 16 despite good adherence", d: "Re-download and review raw data (residual PLMs? hypoventilation in REM?), screen for hypothyroidism, medications, and consider MSLT after OSA is controlled — the hypersomnias declare themselves here.", cite: "aasmpap" });
  if (gt(f.plmi, 15) || f.rlsUrge)
    steps.push({ t: "Iron studies + renal panel", d: "Ferritin (target > 75 ng/mL), transferrin saturation, creatinine/eGFR — iron deficiency is the most reversible cause; renal disease shifts the treatment choice.", cite: "icvd3" });
  if (f.dreamEnact)
    steps.push({ t: "Video-PSG review for RBD confirmation", d: "Confirm REM without atonia on extended-EMG montage; then neurological follow-up — RBD precedes α-synucleinopathies (PD, DLB, MSA) by years in a majority of men > 50.", cite: "icvd3" });
  steps.push({ t: "Objective therapy review at 4–8 weeks", d: "Download: hours/night (goal ≥ 4 h on ≥ 70% of nights), residual AHI < 5, leak below 24 L/min, and symptom re-score (ESS). Adjust — do not drift.", cite: "aasmpap" });
  return steps;
}

/* ═══ 10 · MASTER ANALYZER ════════════════════════════════════════════════ */
function analyzeSleep(i){
  SYNAPSE.reset();
  const f = deriveSleepFacts(i);
  /* rules */
  const fired = SL_RULES.filter(r => { try { return !!r.when(f); } catch (e) { return false; } })
    .map(r => ({
      id: r.id, sev: r.sev, cite: r.cite,
      t: typeof r.t === "function" ? (() => { try { return r.t(f); } catch (e) { return r.id; } })() : r.t,
      why: typeof r.why === "function" ? (() => { try { return r.why(f); } catch (e) { return ""; } })() : r.why,
    }));
  SYNAPSE.pass("Rule induction", fired.length + "/" + SL_RULES.length + " sleep rules fired");
  /* fuzzy grading */
  const fz = {
    ahi: SYNAPSE.softGrade(f.ahi == null ? 2 : f.ahi, [5, 15, 30], ["none", "mild", "moderate", "severe"]),
    ess: SYNAPSE.softGrade(f.ess == null ? 8 : f.ess, [11, 16], ["normal", "sleepy", "pathological"]),
    se:  SYNAPSE.softGrade(f.se == null ? 88 : f.se, [80, 90], ["low", "borderline", "preserved"]),
  };
  SYNAPSE.pass("Fuzzy severity grading", "AHI " + fz.ahi.label + " · ESS " + fz.ess.label + " · SE " + fz.se.label);
  /* Bayesian differential */
  const feats = buildSleepFeats(f);
  const dxRank = SYNAPSE.bayes(SL_DX_TABLE, feats).filter(d => d.pct >= 1.5);
  SYNAPSE.pass("Bayesian differential", dxRank.length ? dxRank[0].dx + " " + dxRank[0].pct + "%" : "no signal");
  /* neural lattice */
  const active = buildActiveS(f, feats);
  const scores = SYNAPSE.net(SL_NET, active);
  const ranked = Object.keys(SL_ACT).map(k => ({ k, p: scores[k] ? scores[k].p : 0 }))
    .filter(x => x.p > 0.5).sort((a, b) => b.p - a.p);
  SYNAPSE.pass("Neural action lattice", ranked.length + " management actions above threshold");
  /* z-scores vs healthy reference */
  const zrows = [];
  const zadd = (key, val, unit) => {
    const R = PSG_REF[key];
    if (!R || val == null) return;
    const z = (val - R.mean) / R.sd;
    const dir = R.dir;
    let flag = Math.abs(z) < 2 ? "ok" : "warn";
    if (dir === "high" ? z > 2 : dir === "low" ? z < -2 : Math.abs(z) > 2) flag = Math.abs(z) > 3.5 ? "bad" : "warn";
    else if (Math.abs(z) < 1) flag = "ok";
    zrows.push({ key, label: R.label, unit: R.unit, val, z: Math.round(z * 10) / 10, flag, ref: R.mean + " ± " + R.sd, dir });
  };
  zadd("ahi", f.ahi, "/hr"); zadd("ai", f.arousalIdx, "/hr"); zadd("plmi", f.plmi, "/hr");
  zadd("nadir", f.nadir, "%"); zadd("se", f.se, "%"); zadd("n3", f.n3p, "%");
  zadd("rem", f.remp, "%"); zadd("sl", f.sl, "min"); zadd("reml", f.reml, "min");
  SYNAPSE.pass("Population z-scores", zrows.filter(z => z.flag !== "ok").length + " of " + zrows.length + " metrics outside ±2σ");
  /* severity + headline */
  const sevRank = { crit: 0, high: 1, mod: 2, info: 3, ok: 4 };
  const worst = fired.reduce((w, r) => (sevRank[r.sev] < sevRank[w] ? r.sev : w), "ok");
  const sevOf = f.sev === "severe" ? "crit" : f.sev === "moderate" ? "high" : f.sev === "mild" ? "mod" : "info";
  const top = dxRank.length ? dxRank[0] : null;
  let head = top ? top.dx + " — " : "";
  head += f.ahi != null ? f.sev.toUpperCase() + " band (AHI " + f1(f.ahi) + "/hr)" : "study parameters pending";
  if (gt(f.paco2, 45)) head += " · awake hypercapnia " + f0(f.paco2);
  if (gt(f.t90, 30)) head += " · T90 " + f0(f.t90) + "%";
  if (f.ess != null && f.ess >= 16) head += " · ESS " + f0(f.ess);
  /* confidence */
  const keys = ["age", "bmi", "ess", "ahi", "odi", "nadir", "t90", "se", "sl", "reml"];
  const prov = keys.filter(k => f[k] != null).length / keys.length;
  let conf = Math.round(40 + prov * 40 + (zrows.length >= 6 ? 8 : 0) + (f.study === "psg" || f.study === "split" ? 6 : f.study === "mslt" ? 4 : 0));
  conf = clamp(conf, 30, 97);
  SYNAPSE.pass("Confidence calibration", conf + "%");
  const cites = [...new Set(fired.map(r => r.cite).filter(Boolean))];
  SYNAPSE.pass("Corpus cross-reference", cites.length + " guideline modules cited");
  /* plan */
  const has = k => ranked.some(x => x.k === k);
  const plan = [];
  if (f.ahi != null && f.ahi >= 15 && !gt(f.cai, 5) && !gt(f.paco2, 45))
    plan.push({ ph: "TITRATION", t: "PAP initiation (CPAP 4–6 or APAP 6–14)", d: "Endpoint: AHI < 5, no flow limitation, SpO₂ > 90% — held in supine REM. Heated humidification from night 1.", cite: "aasmpap" });
  if (has("biLevel"))
    plan.push({ ph: "TITRATION", t: "BPAP set-up with CO₂ follow-through", d: "IPAP 14–20 / EPAP 6–10 (EPAP still clears obstruction); check transcutaneous/capillary CO₂ on therapy; AVAPS if refractory.", cite: "icvd3" });
  if (has("abgPft"))
    plan.push({ ph: "THIS WEEK", t: "Awake blood gas + full PFTs", d: "Separates OHS / restrictive / neuromuscular / pulmonary-vascular causes; add TSH and echo where indicated.", cite: "icvd3" });
  if (has("gdmtOptimize"))
    plan.push({ ph: "PARALLEL", t: "Cardiology co-management (GDMT)", d: "Beta-blocker, ARNI, MRA, SGLT2 titration — the CSR burden often shrinks as the heart improves.", cite: "aasmhf" });
  if (has("msltOrder"))
    plan.push({ ph: "AFTER OSA TREATED", t: "MSLT with pre-conditions", d: "≥ 6 h sleep (documented), 2-week REM-drug washout, OSA controlled — else the SOREMP count is uninterpretable.", cite: "icvd3" });
  if (has("ironWorkup"))
    plan.push({ ph: "THIS WEEK", t: "Ferritin + transferrin saturation + eGFR", d: "Target ferritin > 75 ng/mL; iron replacement if low; choose gabapentinoid vs dopamine agonist after labs.", cite: "icvd3" });
  if (has("cbtI"))
    plan.push({ ph: "FIRST-LINE", t: "CBT-I 6–8 sessions", d: "Sleep restriction + stimulus control + wind-down; hypnotics only as a bridge with a pre-agreed taper date.", cite: "icvd3" });
  if (has("rbdSafety"))
    plan.push({ ph: "SAFETY FIRST", t: "Bedroom safety + melatonin 3–12 mg", d: "Padding, separate bedding, remove sharp objects; clonazepam 0.25–1 mg reserved for refractory cases (falls, cognition).", cite: "icvd3" });
  if (has("leakFix"))
    plan.push({ ph: "BEFORE ANY PRESSURE CHANGE", t: "Leak audit", d: "Mask refit, chin strap, heated humidity — residual AHI on download is usually leak, not under-pressure.", cite: "aasmpap" });
  if (has("drivingCounsel"))
    plan.push({ ph: "AT DIAGNOSIS", t: "Driving & occupational counselling — document it", d: "ESS ≥ 16 or safety-critical work: warn about drowsy-driving risk, notify licensing authority where the law requires, review at every visit.", cite: "aasmpap" });
  if (has("weightMgmt"))
    plan.push({ ph: "ONGOING", t: "Structured weight programme", d: "10% loss ≈ 26% AHI reduction; dietetics + activity + GLP-1 pharmacotherapy where appropriate; bariatric referral at BMI ≥ 40.", cite: "aasmpap" });
  plan.push({ ph: "4–8 WEEKS", t: "Objective download review", d: "Hours ≥ 4/night on ≥ 70% of nights, residual AHI < 5, leak < 24 L/min, ESS re-scored; retitrate or switch engine on data, not guesswork.", cite: "aasmpap" });
  plan.push({ ph: "CHRONIC", t: "Annual review + comorbidity surveillance", d: "BP, rhythm (AF screening), glycaemia, lipids; reassess pressure needs with weight change; CPAP does not cure — it holds the airway.", cite: "aasmpap" });
  return { f, fired, ranked, dxRank, zrows, fz, conf, cites, head, worst, sev: sevOf, plan,
    nextSteps: sleepNextSteps(f, ranked),
    modeCards: sleepModeAdvice(f) };
}
</script>
