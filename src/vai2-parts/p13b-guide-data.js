<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI — GUIDELINE CORPUS · PART B
   TB (WHO/ATS) · USPSTF 2021 screening · Fleischner 2017 · PH ESC/ERS 2022 ·
   ILD/IPF · PFT interpretation · ACO · pleural effusion · bronchiectasis · O₂
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

const GUIDELINES_B = [
{ id:"tb", name:"Tuberculosis — WHO / ATS", org:"WHO consolidated guidelines / ATS-CDC-IDSA", upd:"current", tags:["INFECTION","TB"], ic:"shield",
  summ:"4-drug RIPE for drug-susceptible pulmonary TB; shorter latent regimens (3HP/4R) preferred over 6–9 H; molecular DST (Xpert) first.",
  sections:[
  { h:"Diagnosis", html:`
    <ul class="checks">
      <li class="good">Symptomatic (cough ≥ 2 wk, fever, night sweats, weight loss, haemoptysis): sputum Xpert MTB/RIF Ultra × 1 (or 2 if smear... ) + smear + culture; chest X-ray for extent (any abnormality can be TB — 'typical' apical pattern is not required).</li>
      <li class="good">HIV-positive or high-risk: Xpert as FIRST test (more sensitive than smear); urine LAM in HIV with low CD4 or severe illness.</li>
      <li class="good">IGRA (QuantiFERON/T-SPOT) or TST detect INFECTION, not disease — never start therapy for TB disease on IGRA alone.</li>
      <li class="good">TST thresholds: ≥ 5 mm (HIV, contacts, transplant, immunosuppressed) · ≥ 10 mm (recent migrants, IV drug use, residents/employees of high-risk settings, children &lt; 5 y) · ≥ 15 mm (no risk factors).</li>
    </ul>`},
  { h:"Active TB treatment", html:`
    <div class="tscroll"><table class="dt"><thead><tr><th>Phase</th><th>Drugs</th><th>Duration</th></tr></thead><tbody>
      <tr><td>Intensive</td><td>HRZE — isoniazid + rifampin + pyrazinamide + ethambutol</td><td class="mono">8 weeks (2 months)</td></tr>
      <tr><td>Continuation</td><td>HR</td><td class="mono">18 weeks (4 months)</td></tr>
    </tbody></table></div>
    <ul class="checks">
      <li class="good">Extend continuation to 7 months total if: cavitary disease AND positive culture at 8 weeks (2HRZE/4HR → 2HRZE/7HR).</li>
      <li class="good">Monthly clinical + culture monitoring; pyridoxine (B6) with INH in pregnancy, diabetes, alcohol, HIV, malnutrition.</li>
      <li class="warn">Hepatotoxicity: stop and re-evaluate if transaminases &gt; 3× with symptoms or &gt; 5× without.</li>
      <li class="good">MDR/RR-TB: all-oral BPaLM (bedaquiline + pretomanid + linezolid + moxifloxacin) 6 months for qualifying patients — programme-registered regimens only.</li>
    </ul>`},
  { h:"Latent TB infection (LTBI)", html:`
    <div class="tscroll"><table class="dt"><thead><tr><th>Regimen</th><th>Drugs</th><th>Duration</th><th>Note</th></tr></thead><tbody>
      <tr><td class="cy">3HP <b>(preferred)</b></td><td>isoniazid + rifapentine weekly</td><td class="mono">12 weeks</td><td class="muted">Highest completion; ≥ 2 y &amp; ≥ 25 kg... (12-dose)</td></tr>
      <tr><td class="cy">4R</td><td>rifampin daily</td><td class="mono">4 months</td><td class="muted">Fewer hepatotoxic events; drug interactions</td></tr>
      <tr><td class="cy">3HR</td><td>daily INH + rifampin</td><td class="mono">3 months</td><td class="muted">Equivalent efficacy</td></tr>
      <tr><td class="cy">6–9H</td><td>isoniazid daily</td><td class="mono">6–9 months</td><td class="muted">Cheapest; poorest completion; hepatotoxicity</td></tr>
    </tbody></table></div>
    <p>Treat LTBI when: recent contact, IGRA/TST positive, HIV, transplant/anti-TNF/immunosuppression, fibrotic lesions on CXR, dialysis, silicosis — after excluding active disease (symptom screen ± CXR).</p>`}],
  pearls:["Xpert MTB/RIF first — it gives rifampin resistance in hours, not weeks.",
    "IGRA positive ≠ TB disease; it means infection. Treat the person, not the lab test.",
    "3HP and 4R beat 6–9 H on completion and liver safety.",
    "Cavitary + culture-positive at 2 months → extend HR to 7 months total.",
    "Every anti-TNF and transplant workup includes LTBI screening — the rheumatology consult is a TB consult."]},

{ id:"lc-screen", name:"Lung Cancer Screening — USPSTF 2021", org:"US Preventive Services Task Force", upd:"2021", tags:["SCREENING","CANCER"], ic:"search",
  summ:"Annual low-dose CT for 50–80-year-olds with ≥ 20 pack-years who currently smoke or quit within 15 years.",
  sections:[
  { h:"Eligibility", html:`
    <ul class="checks">
      <li class="good">Age <b>50–80</b> (2013 version was 55–80 — the 2021 update caught 8 million more, more women &amp; Black smokers).</li>
      <li class="good">≥ <b>20 pack-years</b> (cigs/day ÷ 20 × years — compute it in the Nicotine Center).</li>
      <li class="good">Current smoker OR quit <b>&lt; 15 years</b> ago.</li>
      <li class="good">Life expectancy &amp; fitness to accept curative-intent treatment.</li>
      <li class="warn">STOP screening: &gt; 15 years since quitting, age &gt; 80, or health precludes treatment.</li>
    </ul>`},
  { h:"Evidence & practice", html:`
    <ul class="checks">
      <li class="good">NLST: 3 annual LDCT screens cut lung-cancer mortality <b>20%</b> vs CXR; NELSON confirmed ~ 24% (men) mortality reduction.</li>
      <li class="good">False positives dominate round 1 (~ 96% of nodules are not cancer) — follow Fleischner/Lung-RADS, not instinct.</li>
      <li class="good">Smoking cessation intervention MUST accompany every screen (teachable moment — 'scan and chat').</li>
      <li class="good">Use Lung-RADS reporting where available: category 1–2 annual; 3 = 6-month CT; 4A/4B = PET/CT ± tissue.</li>
    </ul>`}],
  pearls:["50–80, ≥ 20 pack-years, current or quit < 15 years — miss any one and the screen is off-guideline.",
    "Screen the 52-year-old 15-cigarette smoker: 2021 halves the age and pack-year floor.",
    "96% of first-round nodules are benign — manage by protocol, not adrenaline.",
    "A screening visit without a cessation conversation is half a visit."]},

{ id:"fleischner", name:"Pulmonary Nodules — Fleischner 2017", org:"Fleischner Society", upd:"2017", tags:["NODULE","CANCER"], ic:"search",
  summ:"Follow-up intervals for incidental solid & subsolid nodules by size and risk, for patients ≥ 35 y without cancer history or immunosuppression.",
  sections:[
  { h:"Single solid nodules", html:`
    <div class="tscroll"><table class="dt"><thead><tr><th>Size</th><th>Low risk</th><th>High risk</th></tr></thead><tbody>
      <tr><td class="mono cy">&lt; 6 mm</td><td>No routine follow-up</td><td>Optional CT at 12 mo</td></tr>
      <tr><td class="mono cy">6–8 mm</td><td>CT 6–12 mo, then consider 18–24 mo</td><td>CT 6–12 mo, then 18–24 mo</td></tr>
      <tr><td class="mono cy">&gt; 8 mm</td><td>CT at 3 mo, PET/CT, or tissue sampling</td><td>CT 3–6 mo, PET/CT, or tissue</td></tr>
    </tbody></table></div>
    <p>High risk = heavy smoking, older age, upper-lobe location, spiculation, emphysema/fibrosis, family or personal cancer history.</p>`},
  { h:"Subsolid nodules", html:`
    <div class="tscroll"><table class="dt"><thead><tr><th>Type</th><th>Size</th><th>Action</th></tr></thead><tbody>
      <tr><td>Pure ground-glass</td><td class="mono">&lt; 6 mm</td><td>No routine follow-up</td></tr>
      <tr><td>Pure ground-glass</td><td class="mono">≥ 6 mm</td><td>CT 6–12 mo, then every 2 y to 5 y</td></tr>
      <tr><td>Part-solid</td><td class="mono">&lt; 6 mm</td><td>No routine follow-up</td></tr>
      <tr><td class="rd">Part-solid</td><td class="mono">≥ 6 mm</td><td>CT 3–6 mo → persistent: PET/CT, biopsy, or resect (solid component ≥ 8 mm = significant)</td></tr>
    </tbody></table></div>
    <ul class="checks"><li class="warn">Multiple nodules: use the dominant nodule + 'multiple' category judgement; small symmetric perifissural nodules are benign.</li></ul>`}],
  pearls:["Solid < 6 mm in a low-risk patient: nothing. The scan was the workup.",
    "A part-solid nodule ≥ 6 mm that persists at 3–6 months is adenocarcinoma-spectrum until proven otherwise.",
    "Growth of a ground-glass nodule or a new solid component matters more than size alone.",
    "Fleischner does not apply to: < 35 y, cancer patients, immunosuppressed, or screening populations."]},

{ id:"ph", name:"Pulmonary Hypertension — ESC/ERS 2022", org:"ESC / ERS", upd:"2022 (WSPH-compatible)", tags:["PH","VASCULAR"], ic:"heart",
  summ:"Haemodynamic definition: mPAP > 20 mmHg; PAH adds PAWP ≤ 15 + PVR > 2 WU. Group-targeted therapy; risk-stratified follow-up.",
  sections:[
  { h:"Definition & groups", html:`
    <div class="tscroll"><table class="dt"><thead><tr><th>Group</th><th>Entity</th><th>Haemodynamics</th></tr></thead><tbody>
      <tr><td class="mono cy">1</td><td>PAH (idiopathic, heritable, connective-tissue, portal, CHD, drugs)</td><td>mPAP &gt; 20 + PAWP ≤ 15 + PVR &gt; 2</td></tr>
      <tr><td class="mono cy">2</td><td>Left-heart disease</td><td>mPAP &gt; 20 + PAWP &gt; 15</td></tr>
      <tr><td class="mono cy">3</td><td>Lung disease / hypoxia (COPD, ILD, OSA/OHS)</td><td>mPAP &gt; 20 (PVR may be normal early)</td></tr>
      <tr><td class="mono cy">4</td><td>Chromic thromboembolic PH (CTEPH)</td><td>mPAP &gt; 20 + perfusion defects; CTPA/V-Q mandatory</td></tr>
      <tr><td class="mono cy">5</td><td>Miscellaneous (sarcoid, haematologic, etc.)</td><td>—</td></tr>
    </tbody></table></div>
    <p>2022 update: mPAP &gt; 20 (was ≥ 25) + PVR &gt; 2 WU (was ≥ 3) captures the borderline cohort that progresses. Exercise PH: mPAP/CO slope &gt; 3.</p>`},
  { h:"Workup & risk", html:`
    <ul class="checks">
      <li class="good">Echo is a SCREEN (RVSP, TAPSE, RV size/function) — right-heart catheterization confirms every PAH/CTEPH treatment decision.</li>
      <li class="good">Every PH workup: V/Q scan (CTEPH is missed by CTPA alone... V-Q more sensitive), autoimmune serology (ANA, anti-centromere/Scl-70), HIV, LFTs, PFTs + DLCO, sleep study in group-3 suspects, 6MWT, NT-proBNP.</li>
      <li class="good">Baseline risk (simplified ESC/ERS): WHO-FC III–IV, 6MWD &lt; 440 m, NT-proBNP elevated, CI &lt; 2.5, PVR &gt; 5 → high-risk management at a PH centre.</li>
    </ul>`},
  { h:"Treatment (Group 1 PAH)", html:`
    <ul class="checks">
      <li class="good">Oral combination first line for low–intermediate risk: ERA (ambrisentan/macitentan) + PDE5i (sildenafil/tadalafil) — AMBITION strategy of upfront dual therapy.</li>
      <li class="good">Add sGC stimulator riociguat (NOT with PDE5i) or prostacyclin-pathway drugs (selexipag; epoprostenol/treprostinil for high risk — IV epoprostenol is the high-risk anchor).</li>
      <li class="good">CTEPH: pulmonary endarterectomy is the cure for operable disease (centre decision); riociguat for inoperable/persistent; BPA for segmental disease.</li>
      <li class="good">Group 2/3: treat the left heart/lung disease FIRST — PAH drugs are not indicated (except carefully selected sarcoid/PH overlap... expert centres).</li>
      <li class="good">Supportive: diuretics for congestion, O₂ to SpO₂ ≥ 90%, contraception counselling (pregnancy high-risk), referral for transplant assessment if failing maximal therapy.</li>
    </ul>`}],
  pearls:["mPAP > 20 + PAWP ≤ 15 + PVR > 2 = PAH — the 2022 numbers, not the old ≥ 25/3.",
    "V/Q scan in every PH workup: CTEPH is curable and CTPA misses it.",
    "Group 3 PH: treat the lungs; PAH drugs are not lung-disease drugs.",
    "Riociguat and PDE5 inhibitors never combine — both touch the NO pathway.",
    "Echo screens; the catheter decides."]},

{ id:"ild", name:"ILD / IPF — ATS/ERS", org:"ATS / ERS", upd:"2022 PDE (nintedanib ILD)", tags:["ILD","FIBROSIS"], ic:"lung",
  summ:"UIP pattern on HRCT or MDD-confirmed; nintedanib/pirfenidone slow FVC decline; exclude alternative causes at every step.",
  sections:[
  { h:"Diagnosis", html:`
    <ul class="checks">
      <li class="good">HRCT pattern: <b>UIP</b> = basal, subpleural, reticular honeycombing with traction bronchiectasis, ± UIP/IPF; probable/possible UIP → MDD (clinician + radiologist + pathologist) ± cryo/TBLC biopsy.</li>
      <li class="good">Exclude: drugs (amiodarone, methotrexate, nitrofurantoin, bleomycin, checkpoint inhibitors), connective-tissue disease (ANA, RF, anti-Jo1/MDA5... myositis panel — 'idiopathic' NSIP/ organizing pneumonia is often CTD until proven otherwise), hypersensitivity pneumonitis (antigen history — birds, mould, hot-tubs), sarcoid, pneumoconiosis.</li>
      <li class="good">Molecular: MUC5B rs35705950 risk variant; familial ILD → genetic counselling consideration.</li>
    </ul>`},
  { h:"Management", html:`
    <ul class="checks">
      <li class="good"><b>Antifibrotics</b>: nintedanib 150 mg BID (diarrhoea — take with food, loperamide; now also progressive fibrosing ILD beyond IPF) or pirfenidone 267 mg TID titrated to 801 mg TID (photosensitivity, nausea, LFT monitoring). Do not combine.</li>
      <li class="good">Acute exacerbation: treat as ICU-level event — high-dose steroids are usual practice (weak evidence), exclude infection/PE, supportive ventilation when goals allow.</li>
      <li class="good">Comorbidity bundle: GERD treatment, O₂ for exertional desaturation, pulmonary rehab, vaccines, smoking cessation, screening for PH (echo) and lung cancer (IPF has 5× risk).</li>
      <li class="good">Refer early for transplant assessment (not at FVC 40%); frailty/age alone do not disqualify at experienced centres.</li>
      <li class="warn">Avoid: chronic high-dose steroids (INPULSIS-era harm... triple therapy with prednisone + AZA + NAC increased deaths in PANTHER-IPF), and unmonitored immunosuppression.</li>
    </ul>`}],
  pearls:["Nintedanib works in progressive fibrosis beyond IPF; pirfenidone in IPF — neither combo.",
    "Every 'idiopathic' ILD deserves an autoimmune and antigen history — birds and methotrexate hide in plain sight.",
    "IPF patients die of lung cancer, PE, and heart disease too — screen and prophylax.",
    "PANTHER-IPF killed the prednisone+AZA+NAC triple — do not resurrect it."]},

{ id:"pft", name:"PFT Interpretation — ATS/ERS", org:"ATS / ERS 2021/2022 standards", upd:"2022", tags:["PFT","DIAGNOSIS"], ic:"chart",
  summ:"Pattern-based spirometry + DLCO interpretation with z-scores/LLN; flow-volume loop shapes localize obstruction.",
  sections:[
  { h:"Patterns", html:`
    <div class="tscroll"><table class="dt"><thead><tr><th>Pattern</th><th>Spirometry</th><th>Volumes</th><th>DLCO</th></tr></thead><tbody>
      <tr><td class="cy">Obstruction</td><td>FEV₁/FVC &lt; LLN (~0.70 adult)</td><td>↑ TLC/RV (air trapping)</td><td>↓ in emphysema; normal in asthma/bronchitis</td></tr>
      <tr><td class="cy">Restriction</td><td>FEV₁/FVC normal with ↓ FVC</td><td>↓ TLC (confirmatory)</td><td>↓ parenchymal; normal neuromuscular/chest wall</td></tr>
      <tr><td class="cy">Mixed</td><td>↓ ratio + ↓ TLC</td><td>↓ TLC</td><td>variable</td></tr>
      <tr><td class="cy">Isolated low DLCO</td><td>Normal spirometry</td><td>Normal</td><td>↓ — think anaemia, PE/PH, early ILD, emphysema (normal FEV₁ smokers!)</td></tr>
      <tr><td class="cy">High DLCO</td><td>—</td><td>—</td><td>↑ — alveolar haemorrhage, asthma, obesity, L→R shunt, polycythaemia</td></tr>
    </tbody></table></div>
    <p>Obstruction severity (ATS/ERS, FEV₁ % predicted): mild &gt; 70 · moderate 60–69 · moderately severe 50–59 · severe 35–49 · very severe &lt; 35. Use z-scores/LLN when available — fixed 0.70 overcalls obstruction in the elderly, undercalls in the young.</p>`},
  { h:"Flow-volume loop shapes", html:`
    <ul class="checks">
      <li class="good"><b>Scooped expiratory limb</b> (concave): lower-airway obstruction — asthma, COPD, bronchiectasis.</li>
      <li class="good"><b>Flattened INSPIRATORY limb</b>: variable extrathoracic obstruction (vocal cord dysfunction, laryngomalacia, goitre).</li>
      <li class="good"><b>Flattened EXPIRATORY limb</b>: variable intrathoracic obstruction (tracheomalacia, tumour, tracheal stenosis post-intubation).</li>
      <li class="good"><b>Both limbs plateaued</b>: fixed upper-airway obstruction (subglottic stenosis, large goitre) — flow limited at a ceiling.</li>
      <li class="good"><b>Small, narrow, peaked loop</b>: restriction (reduced volume with normal shape).</li>
    </ul>`},
  { h:"Special situations", html:`
    <ul class="checks">
      <li class="good">Reversibility (asthma): ≥ 12% AND ≥ 200 mL FEV₁ post-bronchodilator.</li>
      <li class="good">Bronchoprovocation (methacholine) PC₂₀ &lt; 8 mg/mL supports asthma when baseline is normal.</li>
      <li class="good"> DLCO correct for anaemia (cigarette CO in heavy smokers: measure COHb or accept underestimate).</li>
      <li class="good">Compare with the patient's OWN baseline whenever available — a 15% within-person fall is meaningful at any starting value.</li>
    </ul>`}],
  pearls:["FEV1/FVC < LLN = obstruction; TLC < LLN confirms restriction — FVC alone is a screen, not a verdict.",
    "Normal spirometry + low DLCO: anaemia, PE, PH, early ILD, or emphysema hiding behind a normal FEV₁.",
    "Flattened inspiratory loop = vocal cords; flattened expiratory = trachea; both = fixed stenosis.",
    "DLCO up = blood in the alveoli (haemorrhage) or too much blood (polycythaemia, shunt)."]},

{ id:"aco", name:"Asthma–COPD Overlap (ACO)", org:"GINA / GOLD joint statement", upd:"current", tags:["ASTHMA","COPD"], ic:"steth",
  summ:"Persistent airflow limitation with both asthmatic type-2 and COPD-type features — the highest exacerbation-risk airway phenotype.",
  sections:[
  { h:"Recognition", html:`
    <ul class="checks">
      <li class="good">Features pointing ACO: ≥ 40 y with smoking/biomass history + significant bronchodilator reversibility (≥ 12% &amp; 400 mL... large), eosinophilia, atopy/childhood asthma, marked diurnal/seasonal variability, good ICS response.</li>
      <li class="good">ACO is a descriptive overlap, NOT a single disease — GINA/GOLD deliberately avoid fixed criteria; label it to guarantee that the ASTHMA component is never untreated.</li>
    </ul>`},
  { h:"Management", html:`
    <ul class="checks">
      <li class="good"><b>ICS is non-negotiable</b> if any asthma feature exists — LABA/LAMA alone in asthmatic airways risks severe exacerbations (Salmeterol Multi-center trial legacy).</li>
      <li class="good">Practical start: ICS + LABA (+ LAMA) — e.g., MART ICS-formoterol + tiotropium; step by eosinophils and exacerbations.</li>
      <li class="good">Biologic eligibility follows GINA Step 5 criteria if type-2 markers are high (dupilumab/mepolizumab have COPD-with-eos evidence — dupilumab now approved for eosinophilic COPD with exacerbations in several jurisdictions).</li>
      <li class="warn">Never LABA-only, never ICS-only (ICS alone inadequately protects asthmatics who smoke — combination always).</li>
    </ul>`}],
  pearls:["ACO = never leave the asthma component on a LABA/LAMA without ICS.",
    "Big reversibility + smoking history = overlap until proven otherwise.",
    "Eosinophils pick the extra drug: high → ICS/biologic pathway; low → LABA+LAMA±roflumilast/azithro."]},

{ id:"pleural", name:"Pleural Effusion — Light's Criteria", org:"Light's criteria / BTS pleural guideline", upd:"2023 BTS", tags:["PLEURA"], ic:"drop",
  summ:"Exudate vs transudate: Light's criteria (any one = exudate); pseudoexudate check with albumin gradient; diagnostic pathway by size & suspicion.",
  sections:[
  { h:"Light's criteria", html:`
    <p>Exudate if ANY of:</p>
    <ul class="checks">
      <li class="good">Pleural/serum protein ratio <b>&gt; 0.5</b></li>
      <li class="good">Pleural/serum LDH ratio <b>&gt; 0.6</b></li>
      <li class="good">Pleural LDH <b>&gt; 2/3 upper limit of normal serum LDH</b></li>
    </ul>
    <p>Sensitivity ~ 98%, specificity ~ 80% — Light's overcalls ~ 25% of transudates as exudates (diuretic-treated heart failure classic). If clinically a transudate: check <b>serum–pleural albumin gradient ≥ 1.2 g/dL → transudate</b> (pseudoexudate rule-out).</p>`},
  { h:"Differential & workup", html:`
    <ul class="checks">
      <li class="good">Transudates: HF, cirrhosis (hepatic hydrothorax), nephrotic syndrome, hypoalbuminaemia, myxoedema, Meigs.</li>
      <li class="good">Exudates: pneumonia (parapneumonic ± empyema), malignancy, TB, PE (exudate in ~ 75%!), pancreatitis, RA/SLE, chylothorax (triglycerides &gt; 110... milky), haemothorax (Hct_effusion/Hct_blood &gt; 0.5).</li>
      <li class="good">Every unexplained exudate: LDH, glucose, pH, cytology, culture; ADA if TB endemic (&gt; 35–40 U/L supports TB); lymphocyte-rich + ADA high → TB pleuritis; image-guided biopsy/thoracoscopy for suspected mesothelioma (never blind-cytology-only).</li>
      <li class="good">Parapneumonic effusions: pH &lt; 7.20, glucose &lt; 40... 60 mg/dL, LDH &gt; 1000, or loculated → TUBE (or IRA with tPA/DNase); mesothelioma &amp; many malignancies → drainage for symptoms, pleurodesis/IPC for recurrence.</li>
    </ul>`}],
  pearls:["Any ONE Light criterion = exudate; but diuretic-changed HF effusions fool Light — check the albumin gradient.",
    "pH < 7.20 + glucose < 60 + LDH > 1000 in a parapneumonic effusion = chest tube, not more antibiotics.",
    "PE effusions are exudates three-quarters of the time — don't chase only cancer.",
    "Milky effusion → triglycerides (chylothorax) not cholesterol until proven."]},

{ id:"bronch", name:"Bronchiectasis — BTS 2019", org:"British Thoracic Society", upd:"2019", tags:["BRONCHIECTASIS"], ic:"lung",
  summ:"Daily symptoms + CT confirmation; treat the cause, rotate/space antibiotics, pulmonary hygiene, and exacerbation action plans.",
  sections:[
  { h:"Diagnosis & causes", html:`
    <ul class="checks">
      <li class="good">Clinical: chronic productive cough + recurrent infections; HRCT: airway dilatation &gt; accompanying vessel (signet-ring), lack of tapering, visible airways within 1 cm of pleura.</li>
      <li class="good">Cause workup in EVERY new case: immunoglobulins (IgG/A/M ± IgG subclasses), α1-antitrypsin, CFTR (sweat chloride/genetics even in adults), ABPA (IgE total + Aspergillus-specific), cilia (situs inversus/infertility), rheumatoid/IBD, COPD, aspiration, post-TB.</li>
      <li class="good">Severity: Bronchiectasis Severity Index (BSI) or FACED — drives follow-up intensity.</li>
    </ul>`},
  { h:"Management", html:`
    <ul class="checks">
      <li class="good">Airway clearance daily (active cycle/ACBT, devices) + pulmonary rehab — the backbone.</li>
      <li class="good">Long-term macrolide (azithro 250 mg 3×/wk or 500 2×/wk; erythro options) for ≥ 3 exacerbations/year — EMBRACE/BAT/BAIT evidence; screen QT &amp; hearing, warn on atypical resistance.</li>
      <li class="good">Inhaled antibiotics (colistin/tobramycin) for Pseudomonas-colonized frequent exacerbators.</li>
      <li class="good">Exacerbation: 14-day antibiotics targeting prior isolates (Pseudomonas: ciprofloxacin or anti-pseudomonal IV); treat ABPA and GERD when present.</li>
      <li class="good">Vaccines (pneumococcal, influenza, COVID); smoking cessation; consider transplant for end-stage young patients.</li>
    </ul>`}],
  pearls:["Every new bronchiectasis earns an immunoglobulin level and a sweat chloride — the cause list is short and treatable.",
    "≥ 3 exacerbations/yr → long-term macrolide (after QT check).",
    "14-day courses are the bronchiectasis norm — 5-day CAP courses don't apply here."]},

{ id:"o2", name:"Oxygen Therapy Targets — BTS", org:"British Thoracic Society", upd:"2017 (current)", tags:["OXYGEN","CRITICAL CARE"], ic:"drop",
  summ:"Target-range oxygen: 94–98% most acutely ill, 88–92% for CO₂-retention risk — hyperoxia is a drug overdose.",
  sections:[
  { h:"Target ranges", html:`
    <div class="tscroll"><table class="dt"><thead><tr><th>Population</th><th>Target SpO₂</th><th>Comment</th></tr></thead><tbody>
      <tr><td>Most acutely ill (default)</td><td class="mono cy">94–98%</td><td class="muted">Not '100% by reflex' — liberal O₂ harms (IOTA meta-analysis)</td></tr>
      <tr><td>CO₂-retention risk (COPD, OHS, neuromuscular, severe kyphoscoliosis)</td><td class="mono am">88–92%</td><td class="muted">Check ABG if obtunded/nauseous/headache after O₂</td></tr>
      <tr><td>Stroke / acute coronary syndrome</td><td class="mono cy">94–98%</td><td class="muted">O₂ only if hypoxaemic — routine O₂ in normoxic MI/stroke shows harm signal</td></tr>
      <tr><td>Carbon monoxide poisoning</td><td class="mono rd">Maximal FiO₂ (100%) ± hyperbaric</td><td class="muted">SpO₂ is MEANINGLESS with COHb — treat by COHb &amp; clinical picture</td></tr>
      <tr><td>Cluster headache</td><td class="mono">100%</td><td class="muted">High-flow O₂ aborts attacks</td></tr>
    </tbody></table></div>`},
  { h:"Devices", html:`
    <div class="tscroll"><table class="dt"><thead><tr><th>Device</th><th>Flow</th><th>Approx FiO₂</th></tr></thead><tbody>
      <tr><td>Nasal cannula</td><td class="mono">1–6 L/min</td><td class="mono">0.24–0.44</td></tr>
      <tr><td>Simple face mask</td><td class="mono">5–10</td><td class="mono">0.40–0.60</td></tr>
      <tr><td>Non-rebreather (reservoir)</td><td class="mono">10–15</td><td class="mono">0.60–0.90</td></tr>
      <tr><td>HFNC</td><td class="mono">20–60</td><td class="mono">0.21–1.00 + flow/PEEP effect + dead-space washout</td></tr>
      <tr><td>Non-invasive / invasive ventilation</td><td class="mono">—</td><td class="mono">titrated precisely + pressure support</td></tr>
    </tbody></table></div>
    <p>Titrate to the TARGET RANGE with the least device that achieves it, and re-assess with every clinical change. Prescribe oxygen like a drug — range, device, review.</p>`}],
  pearls:["88–92% in COPD is a target, not a compromise.",
    "SpO₂ 100% can hide a PaO₂ of 80 or 500 — in suspected toxicity (paraquat, bleomycin, CO) think differently.",
    "O₂ without a written target range is an unprescribed drug.",
    "Hyperoxia in normoxic MI and stroke: at best useless, at worst harmful — treat hypoxaemia, not numbers."]},

{ id:"sarcoid", name:"Sarcoidosis — ATS/ERS/WASOG", org:"ATS / ERS / WASOG", upd:"2020 ATS practice guidance", tags:["ILD","GRANULOMA"], ic:"users",
  summ:"Non-caseating granulomas, bilateral hilar adenopathy ± pulmonary infiltrates; steroids first line when treatment is needed; screen organs.",
  sections:[
  { h:"Diagnosis", html:`
    <ul class="checks">
      <li class="good">Triad: compatible clinical/radiographic picture + non-caseating granulomas on biopsy + exclusion of alternatives (TB, fungal, berylliosis, lymphoma). Löfgren syndrome (fever, erythema nodosum, hilar adenopathy, arthralgia) needs NO biopsy.</li>
      <li class="good">HRCT: perilymphatic nodules, symmetric hilar adenopathy, Galaxy sign; stages 0–IV on CXR.</li>
      <li class="good">Organ screen every patient: pulmonary (PFTs + DLCO), skin/eye (slit-lamp — 25% ocular), cardiac (ECG ± echo/Holter; MRI if symptoms), calcium (↑ vit-D activation), liver/kidney, neuro if symptoms, ACE level (nonspecific).</li>
    </ul>`},
  { h:"Treatment", html:`
    <ul class="checks">
      <li class="good">Watch &amp; wait is legitimate: > 50% of pulmonary sarcoid remits — treat when: significant symptoms, declining lung function, hypercalcaemia, ocular/cardiac/neuro involvement.</li>
      <li class="good">Prednisone 20–40 mg/d, taper over 6–12 months to maintenance ≤ 10 mg — relapse ~ 50%; add steroid-sparing (methotrexate first-line-sparing, azathioprine, leflunomide, mycophenolate) when relapsing/steroid-toxic.</li>
      <li class="good">Refractory pulmonary: infliximab (anti-TNF — highest quality evidence); screen for latent TB &amp; hepatitis B first.</li>
      <li class="good">Hypercalcaemia: hydration, steroid, limit vitamin D/calcium supplementation... (paradoxical vitamin-D deficiency coexists — monitor 25-OH and 1,25-OH separately).</li>
    </ul>`}],
  pearls:["Löfgren syndrome is a clinical diagnosis — biopsy adds nothing but scars.",
    "Every sarcoid patient gets an eye exam — silent uveitis blinds.",
    "Over half of pulmonary sarcoid remits; prednisone is not automatic.",
    "Before infliximab: latent TB therapy or you will trade granulomas for miliary TB."]},
];

const GUIDELINES = GUIDELINES_A.concat(GUIDELINES_B);
</script>
