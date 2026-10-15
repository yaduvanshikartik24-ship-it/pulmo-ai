<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI — GUIDELINE CORPUS · PART A (airway disease & critical care)
   GOLD 2025 · GINA 2025 · ARDS (Berlin/Global 2023/ARDSNet) · ESC PE 2019 ·
   ATS/IDSA CAP 2019
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";
const rc = (t) => "<span class='recchip " + t + "'>" + ({ strong:"STRONG", mod:"MODERATE", weak:"WEAK/CONDITIONAL", cond:"CONTEXT-SPECIFIC" })[t] + "</span>";
const kn = (s) => "<span class='keynum'>" + s + "</span>";

const GUIDELINES_A = [
{ id:"gold", name:"GOLD 2025 — COPD", org:"Global Initiative for Chronic Obstructive Lung Disease", upd:"2025 update", tags:["COPD"], ic:"lung",
  summ:"Spiriometric diagnosis (post-BD FEV₁/FVC < 0.70), ABE symptom/exacerbation grouping, LABA/LAMA-first pharmacology, ICS by eosinophils.",
  sections:[
  { h:"Diagnosis & classification", html:`
    <p>COPD requires <b>post-bronchodilator FEV₁/FVC &lt; 0.70</b> in a patient with appropriate exposure (tobacco, biomass, occupational) and symptoms. Spirometric severity: GOLD 1 ≥ 80% · 2: 50–79% · 3: 30–49% · 4 &lt; 30% predicted.</p>
    <div class="tscroll"><table class="dt"><thead><tr><th>GOLD grade</th><th>FEV₁ % predicted</th><th>Note</th></tr></thead><tbody>
      <tr><td class="mono cy">1 · Mild</td><td class="mono">≥ 80%</td><td class="muted">Usually symptomatic only on exertion</td></tr>
      <tr><td class="mono cy">2 · Moderate</td><td class="mono">50–79%</td><td class="muted">Exertional dyspnoea, first medical contact typical</td></tr>
      <tr><td class="mono cy">3 · Severe</td><td class="mono">30–49%</td><td class="muted">Activity limitation, exacerbations frequent</td></tr>
      <tr><td class="mono cy">4 · Very severe</td><td class="mono">&lt; 30%</td><td class="muted">Chronic respiratory failure territory</td></tr>
    </tbody></table></div>
    <p>Differential/red flags: investigate alarm features (weight loss, haemoptysis, unilateral findings) with imaging; always consider asthma overlap, bronchiectasis, TB (endemic settings), and α1-antitrypsin deficiency (check in all COPD &lt; 45 y, basal-predominant emphysema, or family history).</p>`},
  { h:"ABE assessment (2023+, retained 2025)", html:`
    <p>Groups are now driven by <b>exacerbation history</b> and <b>symptom burden</b> (mMRC dyspnoea / CAT):</p>
    <div class="tscroll"><table class="dt"><thead><tr><th>Group</th><th>Exacerbations</th><th>Symptoms</th></tr></thead><tbody>
      <tr><td class="mono cy">A</td><td>0–1 moderate, no hospitalization</td><td>mMRC 0–1 · CAT &lt; 10</td></tr>
      <tr><td class="mono cy">B</td><td>0–1 moderate, no hospitalization</td><td>mMRC ≥ 2 · CAT ≥ 10</td></tr>
      <tr><td class="mono rd">E</td><td>≥ 2 moderate OR ≥ 1 hospitalization</td><td>any symptom level</td></tr>
    </tbody></table></div>
    <p>mMRC: "I get breathless hurrying on level ground / stopping for breath at my own pace" = grade 2+. CAT ≥ 10 marks a high symptom burden. One hospitalization is sufficient for Group E — hospitalization is the strongest future-risk predictor.</p>`},
  { h:"Initial pharmacotherapy", html:`
    <div class="tscroll"><table class="dt"><thead><tr><th>Group</th><th>First choice</th><th>Key evidence</th></tr></thead><tbody>
      <tr><td class="mono cy">A</td><td>LABA <b>or</b> LAMA</td><td class="muted">Bronchodilator choice by symptom/expense</td></tr>
      <tr><td class="mono cy">B</td><td>LABA + LAMA</td><td class="muted">Dual > single for symptoms & FEV₁</td></tr>
      <tr><td class="mono rd">E</td><td>LABA + LAMA (+ICS if eos ≥ 300)</td><td class="muted">Dual reduces exacerbations; ICS adds benefit at high eos</td></tr>
    </tbody></table></div>
    <ul class="checks">
      <li class="good">${rc("strong")} Blood eosinophils guide ICS in E: <b>≥ 300 → add ICS</b>; 100–299 consider ICS (especially with severe exacerbation history); &lt; 100 avoid ICS (pneumonia risk).</li>
      <li class="good">Escalation for persistent dyspnoea on LABA/LAMA: check inhaler technique/adherence, then switch to LABA+LAMA combination or escalate to triple if eos high.</li>
      <li class="warn">De-escalate ICS when pneumonia occurs or eos &lt; 100 — withdraw, don't taper indefinitely.</li>
      <li class="good">Roflumilast (PDE4): FEV₁ &lt; 50% + chronic bronchitis + ≥ 2 exacerbations, especially eos ≥ 300. Azithromycin (250 mg qd/500 mg 3×/wk) for ex-smokers with frequent exacerbations (watch QT, hearing, atypical resistance).</li>
    </ul>
    <p>Non-pharm mandatory: <b>smoking cessation</b> (see Nicotine Center), vaccines (influenza, pneumococcal, COVID-19, RSV ≥ 60 y in some programs, Tdap), pulmonary rehabilitation (post-exacerbation and stable GOLD ≥ 3), physical activity.</p>`},
  { h:"Oxygen & chronic support", html:`
    <ul class="checks">
      <li class="good">Long-term O₂ if PaO₂ <b>≤ 55 mmHg</b> or SpO₂ <b>≤ 88%</b> (or PaO₂ 56–59 with cor pulmonale / polycythaemia Hct &gt; 55%) — NOTT/MRC: ≥ 15 h/day improves survival.</li>
      <li class="good">Chronic hypercapnia (PaCO₂ ≥ 52 stable, or decompensated recovered): long-term home NIV improves hypercapnia, possibly survival in severe hypercapnia (HOT-HMRF).</li>
      <li class="good">Advanced emphysema: lung-volume-reduction surgery / endobronchial valves (upper-lobe, low-exercise, heterogeneous emphysema best); bullectomy for giant bullae; transplant referral for FEV₁ &lt; 25% ± refractory hypoxaemia/hypercapnia.</li>
    </ul>`},
  { h:"Exacerbation management", html:`
    <ul class="checks">
      <li class="good">Systemic glucocorticoids: prednisolone <b>40 mg × 5 days</b> (REDUCE trial — non-inferior to 14 days, fewer failures).</li>
      <li class="good">Antibiotics if increased sputum purulence + (↑ volume or dyspnoea) — Anthonisen criteria; or if ventilated: amoxicillin-clavulanate, macrolide or tetracycline typical (local resistance applies).</li>
      <li class="good">NIV for pH &lt; 7.35 with PaCO₂ &gt; 45 (best window pH 7.25–7.35); NIV also for persistent hypercapnia post-recovery.</li>
      <li class="good">Oxygen target <b>SpO₂ 88–92%</b> during exacerbation (Haldane risk).</li>
      <li class="warn">Prevent the next one: review inhaler technique, triple therapy if E-group, rehab referral, vaccination, cessation support — an admission is a failed prevention event.</li>
    </ul>`}],
  pearls:["Post-bronchodilator FEV₁/FVC < 0.70 is the COPD definition — severity grades use FEV₁ % predicted, not the ratio.",
    "Group E = exacerbation-driven: LABA+LAMA regardless of symptoms; add ICS when eos ≥ 300.",
    "ICS below eos 100 buys pneumonia, not protection.",
    "Prednisone 40 mg × 5 days is a full exacerbation course (REDUCE).",
    "Every COPD admission: O₂ 88–92%, NIV if pH < 7.35, and a prevention bundle before discharge."]},

{ id:"gina", name:"GINA 2025 — Asthma", org:"Global Initiative for Asthma", upd:"2025 update", tags:["ASTHMA"], ic:"steth",
  summ:"Anti-inflammatory-reliever (AIR) strategy with ICS-formoterol across steps 1–5; SABA-only treatment is no longer recommended for adults/adolescents.",
  sections:[
  { h:"Diagnosis", html:`
    <ul class="checks">
      <li class="good">Symptomatic variable wheeze/shortness of breath/cough + confirmatory tests: <b>bronchodilator reversibility</b> (FEV₁ ↑ ≥ 12% AND ≥ 200 mL after 200–400 µg salbutamol), or positive exercise/challenge test, or excessive variability on PEF (≥ 10–12% twice weekly... use ≥ 10% daily variation over 2 weeks).</li>
      <li class="good">Between symptoms: normal spirometry does NOT exclude asthma — repeat during symptoms, add challenge testing or PEF diary.</li>
      <li class="good">FeNO support: ≥ 20 ppb children / ≥ 25–50 ppb adults indicates type-2 inflammation likely to respond to ICS (higher = stronger).</li>
      <li class="good">Blood eos ≥ 150–300 and allergic history support; consider occupational history on EVERY new adult asthma.</li>
    </ul>`},
  { h:"Track 1 (preferred): ICS-formoterol reliever", html:`
    <div class="tscroll"><table class="dt"><thead><tr><th>Step</th><th>Controller</th><th>Reliever</th></tr></thead><tbody>
      <tr><td class="mono cy">1</td><td>—</td><td>Low-dose ICS-formoterol PRN</td></tr>
      <tr><td class="mono cy">2</td><td>Low-dose ICS-formoterol maintenance</td><td>ICS-formoterol PRN (MART)</td></tr>
      <tr><td class="mono cy">3</td><td>Low-dose ICS-formoterol maintenance</td><td>ICS-formoterol PRN (MART)</td></tr>
      <tr><td class="mono cy">4</td><td><b>Medium-dose</b> ICS-formoterol maintenance</td><td>ICS-formoterol PRN (MART)</td></tr>
      <tr><td class="mono rd">5</td><td>Add-on LAMA, refer for phenotyping; high-dose ICS-formoterol</td><td>ICS-formoterol PRN ± SABA</td></tr>
    </tbody></table></div>
    <p>Track 2 (alternative when ICS-formoterol unavailable or patient on stable SABA+ICS): SABA reliever with ICS taken whenever SABA is used, or daily ICS + SABA PRN.</p>
    <ul class="checks">
      <li class="warn">SABA-only is REMOVED from all adult/adolescent recommendations — SABA-only increases severe exacerbation and mortality risk (risk rises with ≥ 1 canister/month... any overuse flag).</li>
      <li class="good">Budesonide-formoterol 200/6 (or equivalent low-dose ICS-formoterol) PRN is the Step 1–2 reliever of choice; max 12 actuations/day before review.</li>
    </ul>`},
  { h:"Step 5 — biologics & referral", html:`
    <ul class="checks">
      <li class="good">Refer severe asthma for phenotyping when Step 4–5 control fails despite adherence + technique check + comorbidity treatment (GERD, obesity, rhinosinusitis, OSA!).</li>
      <li class="good">Allergic (IgE ≥ 30 IU/mL... + sensitization, frequent exacerbations): <b>omalizumab</b>. Eosinophilic (eos ≥ 150–300): <b>mepolizumab</b> (300 mg SC q4w for severe), <b>benralizumab</b> (30 mg q4w ×3 then q8w), <b>dupilumab</b> (also OCS-sparing), <b>tezepelumab</b> (TSLA-blocker, eos-independent).</li>
      <li class="good">OCS-sparing is a therapeutic goal — chronic prednisone ≥ 5 mg/d causes diabetes, bone loss, cataracts.</li>
      <li class="good">Add LAMA at Step 5 for lung-function and exacerbation benefit (tiotropium Respimat evidence).</li>
    </ul>`},
  { h:"Exacerbation management", html:`
    <ul class="checks">
      <li class="good">Inhaled salbutamol <b>4–10 puffs q20 min</b> (or 2.5–5 mg neb) first hour; add ipratropium in severe; ICS from the start.</li>
      <li class="good">Systemic steroids within the first hour: prednisone/prednisolone <b>40–50 mg × 5–7 days</b> (children 1–2 mg/kg, max 40, 3–5 d).</li>
      <li class="good">Oxygen to SpO₂ <b>93–95%</b>; MgSO₄ IV 2 g for severe unresponsive adults (children 25–75 mg/kg).</li>
      <li class="warn">Discharge bundle: continue controller, arrange review 1–7 days, check technique, written action plan, treat the trigger (viral, allergen, non-adherence).</li>
    </ul>`}],
  pearls:["No adult or adolescent should be on SABA-only therapy — pair every reliever with anti-inflammatory action.",
    "Budesonide-formoterol PRN alone is legitimate Step 1 therapy (AIR approach).",
    "Before labeling severe asthma: adherence, technique, and mimics (OSA, GERD, vocal cord dysfunction, COPD).",
    "FeNO ≥ 25–50 ppb supports ICS responsiveness; don't repeat during or soon after steroids/viral illness.",
    "Exacerbation steroids work within the hour — give early, not after failure of nebs."]},

{ id:"ards", name:"ARDS — Berlin + Global Definition 2023", org:"ARDS Definition Task Force / global definition", upd:"2023 global definition", tags:["ARDS","CRITICAL CARE"], ic:"shield",
  summ:"Lung-protective ventilation core (6 mL/kg PBW, Pplat ≤ 30, ΔP ≤ 15) + proning ≥ 16 h, PEEP tables, ECMO referral thresholds.",
  sections:[
  { h:"Definition & severity", html:`
    <div class="tscroll"><table class="dt"><thead><tr><th>Criterion</th><th>Berlin 2012</th><th>Global 2023 addition</th></tr></thead><tbody>
      <tr><td>Timing</td><td>≤ 7 days of insult</td><td>≤ 7 days (unchanged)</td></tr>
      <tr><td>Imaging</td><td>Bilateral opacities (CXR/CT)</td><td><b>+ ultrasound accepted</b></td></tr>
      <tr><td>Origin</td><td>Not fully cardiogenic</td><td>Objective assessment (echo/BNP if unsure)</td></tr>
      <tr><td>Oxygenation</td><td>P/F with <b>PEEP ≥ 5</b>: mild 201–300 · moderate 101–200 · severe ≤ 100</td><td><b>SpO₂/FiO₂ ≤ 315</b> (with SpO₂ ≤ 97%) valid on HFNC/NIV; HFNC-ARDS recognized</td></tr>
    </tbody></table></div>
    <p>Mortality by Berlin severity: ~ mild 27–35% · moderate 40% · severe 46%. The 2023 global definition also recognizes ARDS in resource-limited settings without ABG capability.</p>`},
  { h:"Lung-protective ventilation (ARDSNet core)", html:`
    <ul class="checks">
      <li class="good">VT <b>4–8 mL/kg PBW</b> (target 6); reduce further if Pplat &gt; 30 or ΔP &gt; 15 — even at 4 mL/kg.</li>
      <li class="good">Pplat <b>≤ 30 cmH₂O</b> (inspiratory hold); driving pressure ΔP = Pplat − PEEP, target <b>≤ 15</b> (Amato: strongest survival predictor, +5–8% mortality per cmH₂O above 15).</li>
      <li class="good">RR up to <b>35/min</b> to maintain minute ventilation; accept permissive hypercapnia pH <b>≥ 7.20–7.25</b> — contraindicated with raised ICP, pregnancy; relative in CO₂ retention.</li>
      <li class="good">PEEP per ARDSNet FiO₂/PEEP tables (see Calculator Array); higher-PEEP table favoured in moderate-severe (ALVEOLI/LOVS subgroups).</li>
      <li class="good">Dexamethasone (DEXA-ARDS: 20 mg d1–5 → 10 mg d6–10) for moderate-severe ARDS within 13 days of intubation: reduces ventilator days & mortality signal — conditional.</li>
    </ul>`},
  { h:"Adjuncts & rescue", html:`
    <ul class="checks">
      <li class="good"><b>Prone ≥ 16 h</b> for P/F &lt; 150 (PROSEVA: mortality 16% vs 33%) — needs trained teams; keep lung-protective limits while prone.</li>
      <li class="good">NMBA 48 h for P/F &lt; 150 if severe dyssynchrony/fighting (ROSE moderated routine use — individualize).</li>
      <li class="warn">Routine recruitment maneuvers & very high PEEP after recruitment: <b>harm</b> in ART — not routine. Respond-guided only.</li>
      <li class="good">Conservative fluid strategy after resuscitation (FACTT: more ventilator-free days).</li>
      <li class="good">ECMO referral (EOLIA): P/F &lt; 50 &gt; 3 h, &lt; 80 &gt; 6 h, or pH &lt; 7.25 with PaCO₂ ≥ 60 &gt; 6 h despite optimization — refer EARLY to an ECMO centre.</li>
      <li class="warn">Inhaled NO: temporary oxygenation improvement, no mortality benefit — rescue bridge only.</li>
    </ul>`}],
  pearls:["SpO₂/FiO₂ ≤ 315 now defines ARDS oxygenation when SpO₂ ≤ 97% — HFNC patients count too (2023 global definition).",
    "ΔP ≤ 15 is the number to chase — it outranks VT and Pplat as a survival predictor.",
    "Prone ≥ 16 consecutive hours when P/F < 150 — the dorsal lung is the prize.",
    "Permissive hypercapnia to pH 7.20–7.25 beats injurious volumes — never in raised ICP or pregnancy.",
    "ECMO referral thresholds are MET thresholds, not 'start ECMO' thresholds — call before the patient meets them."]},

{ id:"pe", name:"Pulmonary Embolism — ESC 2019 (+ CHEST)", org:"European Society of Cardiology / CHEST", upd:"2019 / 2021 updates", tags:["PE","VTE"], ic:"heart",
  summ:"Wells → D-dimer (age-adjusted) → CTPA pathway; risk stratify with sPESI/echo/troponin; DOAC-first treatment; systemically lyse only unstable patients.",
  sections:[
  { h:"Diagnostic pathway", html:`
    <ul class="checks">
      <li class="good"><b>Wells score</b>: ≤ 4 unlikely → PERC if low probability & none positive, stop; else D-dimer. &gt; 4 likely → CTPA directly (D-dimer adds nothing).</li>
      <li class="good">Age-adjusted D-dimer cut-off (&gt; 50 y: age × 10 µg/L FEU) raises specificity without missing PEs.</li>
      <li class="good">YEARS algorithm: no DVT signs + PE not most likely dx + no instability → D-dimer alone suffices even when pregnant.</li>
      <li class="good">Pregnancy: Wells/YEARS + leg ultrasound first, CTPA or V/Q per pre-test probability (fetal doses low either way).</li>
    </ul>
    <div class="tscroll"><table class="dt"><thead><tr><th>Wells (simplified)</th><th>Points</th></tr></thead><tbody>
      <tr><td>Clinical DVT signs</td><td class="mono">3</td></tr>
      <tr><td>PE most likely dx</td><td class="mono">3</td></tr>
      <tr><td>HR &gt; 100</td><td class="mono">1.5</td></tr>
      <tr><td>Immobilization ≥ 3 d / surgery ≤ 4 wk</td><td class="mono">1.5</td></tr>
      <tr><td>Previous VTE</td><td class="mono">1.5</td></tr>
      <tr><td>Haemoptysis</td><td class="mono">1</td></tr>
      <tr><td>Malignancy</td><td class="mono">1</td></tr>
    </tbody></table></div>`},
  { h:"Risk stratification", html:`
    <ul class="checks">
      <li class="good"><b>Haemodynamic instability = high risk</b> → bedside echo/CTPA en route, reperfusion (lysis preferred if no contraindication).</li>
      <li class="good">Stable patients: <b>sPESI ≥ 1</b> (or Hestia) → not low risk → troponin + BNP/echo → RV strain = intermediate-high; monitor, consider rescue lysis if deteriorating.</li>
      <li class="good">sPESI items (1 point each): age ≥ 80, cancer, chronic cardiopulmonary disease, HR ≥ 110, SBP &lt; 100, SpO₂ &lt; 90%.</li>
    </ul>`},
  { h:"Treatment", html:`
    <ul class="checks">
      <li class="good">DOACs are first line (apixaban 10 mg BID × 7 d → 5 mg BID; rivaroxaban 15 BID × 21 d → 20 qd; edoxaban after 5 d LMWH). No routine LMWH lead-in for apixaban/rivaroxaban.</li>
      <li class="good">Provoked by surgery/transient risk factor: <b>3 months</b>. Unprovoked: ≥ 3 months then extend if low bleeding risk (indefinite often). Cancer-associated: DOAC or LMWH (apixaban/rivaroxaban preferred DOACs; avoid in GI luminal cancers... individualize).</li>
      <li class="good">Massive PE with arrest/shock: alteplase <b>100 mg over 2 h</b> (or 50 mg bolus in arrest); surgical embolectomy/catheter-directed therapy when lysis contraindicated.</li>
      <li class="good">Intermediate-high with deterioration: rescue thrombolysis (half-dose regimens studied) or catheter-directed therapy.</li>
      <li class="warn">Anticoag alone for subsegmental incidental PE without symptoms/progression — DO NOT over-treat (periodic review instead).</li>
    </ul>`}],
  pearls:["PERC only applies to Wells-low patients — using it on everyone misses PEs.",
    "Age-adjusted D-dimer (age × 10) after 50: fewer CTs, same safety.",
    "Stable + sPESI ≥ 1 + troponin/echo strain = intermediate-high: monitor, not lyse.",
    "Apixaban and rivaroxaban start without LMWH lead-in — the simplest starts in emergency medicine.",
    "Unprovoked PE at 3 months: decide duration explicitly — 'default stopping' and 'default forever' are both wrong."]},

{ id:"cap", name:"Community-Acquired Pneumonia — ATS/IDSA 2019", org:"ATS / IDSA", upd:"2019", tags:["INFECTION","CAP"], ic:"steth",
  summ:"CURB-65 site-of-care, empiric therapy stratified by comorbidity & MRSA/Pseudomonas risk, 5–7 day courses with clinical stability at 48–72 h.",
  sections:[
  { h:"Site of care", html:`
    <ul class="checks">
      <li class="good"><b>CURB-65</b>: Confusion, Urea &gt; 7 mmol/L (BUN ~19), RR ≥ 30, BP &lt; 90/60, age ≥ 65. Score 0–1 → outpatient; ≥ 2 → admit (ICU if severe).</li>
      <li class="good"><b>Severe CAP</b> = 1 major (septic shock needing vasopressors, resp failure needing MV) or ≥ 3 minor (RR ≥ 30, PaO₂/FiO₂ ≤ 250, multilobar, confusion, BUN ≥ 20, WBC &lt; 4, platelets &lt; 100, T ≤ 36 °C, hypotension needing fluids).</li>
      <li class="warn">HCAP category was ABOLISHED — nursing-home residence alone no longer mandates MRSA/Pseudomonas coverage; use the specific risk factors below.</li>
    </ul>`},
  { h:"Empiric therapy", html:`
    <div class="tscroll"><table class="dt"><thead><tr><th>Setting</th><th>Regimen</th></tr></thead><tbody>
      <tr><td>Outpatient, healthy, no resistances</td><td>Amoxicillin 1 g TID <b>or</b> doxycycline <b>or</b> macrolide (only if local pneumococcal macrolide resistance &lt; 25%)</td></tr>
      <tr><td>Outpatient + comorbidity/risk factors</td><td>Amox-clav 500/125 TID (or 875/125 BID / 2000/125 BID) <b>or</b> cephalosporin — <b>plus</b> macrolide/doxy; <b>or</b> respiratory fluoroquinolone alone</td></tr>
      <tr><td>Inpatient, non-severe</td><td>β-lactam (ampicillin-sulbactam 1.5–3 g q6h, ceftriaxone 1–2 g qd, cefotaxime) <b>+</b> macrolide (azithro 500) — <b>or</b> resp fluoro alone</td></tr>
      <tr><td>Inpatient, severe (ICU)</td><td>β-lactam + macrolide <b>or</b> β-lactam + fluoro (no monotherapy)</td></tr>
    </tbody></table></div>
    <ul class="checks">
      <li class="good">Add MRSA coverage (vancomycin/linezolid) ONLY if: prior respiratory isolation of MRSA, or recent hospitalization + parenteral antibiotics.</li>
      <li class="good">Add Pseudomonas coverage (pip-tazo, cefepime, meropenem) ONLY if: prior isolation, or recent hospitalization + parenteral antibiotics. Local antibiogram rules.</li>
      <li class="good">Aspiration pneumonia = standard CAP coverage (anaerobes rarely need extra cover); mandate dental/food-aspiration assessment.</li>
      <li class="good">Steroids: severe CAP needing ICU — dexamethasone 5 mg qd until stable... conditional (not if influenza suspected/confirmed).</li>
    </ul>`},
  { h:"Duration & follow-up", html:`
    <ul class="checks">
      <li class="good"><b>5–7 days</b> total, provided clinically stable ≥ 48 h (afebrile, HR/RR/BP/O₂ normalizing, tolerating PO) — shorter is fine if stable early.</li>
      <li class="good">Blood cultures only for severe CAP or failure; sputum culture if MRSA/Pseudomonas risk or unusual epidemiology (TB, endemic fungi).</li>
      <li class="good">Influenza testing in season; oseltamivir when positive or highly suspected in severe disease.</li>
      <li class="good">Failure to respond by 48–72 h: re-image, think empyema/abscess, resistant organism, wrong diagnosis (PE, HF, vasculitis), or obstruction behind the pneumonia.</li>
      <li class="good">Smoking cessation + vaccines at discharge (pneumococcal, influenza, COVID) — the CAP admission is the highest-yield cessation teachable moment.</li>
    </ul>`}],
  pearls:["HCAP is dead — cover MRSA/Pseudomonas only for the two specific risks (isolation history, recent hospitalization + IV antibiotics).",
    "Severe CAP never gets monotherapy: β-lactam + macrolide or β-lactam + fluoro.",
    "5–7 days if stable 48 h — duration is stability-driven, not X-ray-driven (opacities lag weeks).",
    "CURB-65 0-1 outpatient, 2 admit, but always temper the score with oxygen and social factors.",
    "Non-resolving pneumonia at 72 h: CT + scope — behind every stubborn consolidation hides an obstruction, empyema, or a wrong diagnosis."]},
];
</script>
