<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI — NICOTINE / SMOKING CESSATION KNOWLEDGE LAYER
   USPHS 2008 · ATS 2020 · Cochrane 2024 · NICE · WHO
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

const SMOKE_FACTS = {
  headline:"Tobacco is the leading preventable cause of death worldwide — WHO: > 8 million deaths/year (incl. ~ 1.3 million from second-hand smoke). US CDC: > 480,000 deaths/yr, ~ 1 in 5 deaths. Smokers lose ~ 10 years of life expectancy (Doll & Peto 50-year BMJ 2004).",
  chem:"Cigarette smoke contains > 7,000 chemicals, ≥ 70 known carcinogens (NNK, benzo[a]pyrene, polonium-210, formaldehyde, 1,3-butadiene, arsenic, cadmium). Nicotine drives dependence (α4β2 nicotinic acetylcholine receptors, dopamine surge ~ 10–20 s after a puff); tar and combustion products drive the disease.",
  epidemic:"~ 1.3 billion tobacco users worldwide; 80% in low- and middle-income countries. India: ~ 267 million tobacco users (GATS-2). Youth e-cigarette use: ~ 1.6 million US middle/high-school students (NYTS 2024), flavoured disposables dominating.",
  attribution:"80–90% of COPD deaths and ~ 85–90% of lung cancers are attributable to smoking; relative risk lung cancer 15–30× vs never-smokers (male lifetime risk ~ 15% vs ~ 1–2% never). Smoking also causes > 10 other cancers, MI (2–4×), stroke, peripheral artery disease, AAA, peptic ulcer, osteoporosis, periodontitis, early menopause, SIDS, preterm birth, and type 2 diabetes (+30–40% risk).",
  quitting:"Quitting works at any age: quit at 30 → regain ~ 10 years; at 40 → ~ 9; at 50 → ~ 6; at 60 → ~ 4 (Doll 2004). Average smoker needs 8–30 attempts; most relapses occur within the first week — treat relapse as skill-building, not failure. Each cigarette is estimated to cost ~ 11–20 minutes of life (median estimates used: ~ 14 min).",
};

/* ── quit recovery timeline ────────────────────────────────────────────── */
const QUIT_TIMELINE = [
  { t:"20 minutes", h:"Heart rate & blood pressure fall", d:"Nicotine-induced sympathetic stimulation subsides; HR and BP drop toward baseline." },
  { t:"8–12 hours", h:"Carbon monoxide normalizes", d:"COHb falls to < 2%; carboxyhaemoglobin no longer displaces O₂ — SpO₂ and oxygen delivery genuinely improve; taste and smell begin recovering by 48 h." },
  { t:"24 hours", h:"MI risk begins to fall", d:"Acute prothrombotic and vasospastic effects of smoke fade; platelet aggregation normalizes over days." },
  { t:"48 hours", h:"Nerve endings regrow — taste & smell sharpen", d:"Food literally tastes better; this is also when withdrawal craving peaks (24–72 h)." },
  { t:"72 hours", h:"Bronchial tubes relax; energy rises", d:"Bronchodilation improves, ciliary beat recovers; nicotine is fully cleared from the body — remaining craving is psychological conditioning." },
  { t:"2–4 weeks", h:"Circulation & walking improve", d:"Endothelial function recovers; CO diffusion capacity begins improving; exercise tolerance climbs." },
  { t:"1–9 months", h:"Cough & dyspnoea decrease", d:"Cilia regrow, mucus clearance improves, lung infection rate falls; UA sinus/congestion clears." },
  { t:"1 year", h:"CHD risk halved", d:"Excess coronary risk is now ~ 50% of a continuing smoker's; continues falling for years." },
  { t:"5 years", h:"Stroke risk = never-smoker (5–15 y)", d:"Also: oral/esophageal/bladder cancer risk halves; cervical cancer risk falls to never-smoker level." },
  { t:"10 years", h:"Lung cancer death risk ~ halved", d:"Falls to ~ 50% of a continuing smoker; larynx/pancreas risk also halved; decline continues for 20+ years (never fully reaches never-smoker baseline)." },
  { t:"15 years", h:"CHD risk ≈ never-smoker", d:"Cardiovascular risk equates to a person who never smoked." },
];

/* ── pharmacotherapy agents ────────────────────────────────────────────── */
const SMOKE_PHARM = [
  { id:"varenicline", name:"Varenicline", brand:"Chantix / Champix", cls:"α4β2 partial agonist", eff:"OR ≈ 3.1 (highest single agent)", dose:"D 1–3: 0.5 mg qAM · D 4–7: 0.5 mg BID · then 1 mg BID × 11 weeks (extend to 24 wk); start 1 week before quit date (or gradual-approach).",
    ci:"Severe renal impairment (reduce dose), caution with psychiatric history (EAGLES 2016 showed NO excess neuropsychiatric AEs vs placebo incl. psychiatric cohort — the 2008 black box was REMOVED in 2016).", ae:"Nausea (take after food), abnormal/vivid dreams, insomnia, headache. No clinically significant CYP interactions (renally cleared).",
    pearls:"The most effective single pharmacotherapy; combining with NRT adds nothing consistent. Now generic in many markets. Gradual-quit dosing is an approved alternative for patients unwilling to stop abruptly." },
  { id:"cytisine", name:"Cytisine", brand:"Tabex / Desmoxan", cls:"Plant alkaloid, α4β2 partial agonist (varenicline's ancestor)", eff:"RR ≈ 1.3–2.0 vs placebo", dose:"25-day tapering course: 1.5 mg q2h days 1–3 (6 caps/day) tapering down; quit by day 5. Cheap — workhorse in Eastern Europe/India.",
    ci:"As varenicline; limited large-trial safety data in pregnancy/adolescents.", ae:"Nausea, vomiting, dizziness, sleep disturbance, dry mouth.", pearls:"A 2023 NEJM trial showed non-inferior 12-month quit rates; costs a fraction of varenicline — WHO prequalified, ideal for LMIC formularies." },
  { id:"bupropion", name:"Bupropion SR", brand:"Zyban / Wellbutrin", cls:"NDRI (norepinephrine–dopamine reuptake inhibitor)", eff:"OR ≈ 1.9", dose:"150 mg qAM × 3 days → 150 mg BID; start 1–2 weeks before quit date; total 7–12 weeks.",
    ci:"SEIZURE DISORDER (absolute), eating disorders, MAOI use, abrupt alcohol/benzo withdrawal; ↑ seizure risk above 300 mg. Caution hypertension (monitor BP, esp. with patch).", ae:"Insomnia (avoid second dose late PM), dry mouth, headache; weight-NEUTRAL or mildly attenuates cessation weight gain; mild antidepressant benefit.",
    pearls:"Great choice when weight gain or depressive symptoms complicate cessation; combine safely with NRT patch." },
  { id:"nrt-patch", name:"NRT — patch", brand:"NicoDerm / Habitrol", cls:"Transdermal nicotine (long-acting base)", eff:"OR ≈ 1.6 (any single NRT vs placebo)", dose:"≥ 10 cig/day: 21 mg × 6 wk → 14 mg × 2 wk → 7 mg × 2 wk (< 10/day start 14 mg). 24-h wear (16-h if sleep disturbance). Apply on quit morning to clean, hairless skin; rotate sites.",
    ci:"Not absolute: safe in stable CAD; caution in acute MI/unstable angina first 2 weeks, serious arrhythmia. Pregnancy: behavioural first, NRT if needed (intermittent forms preferred to minimize peaks).", ae:"Skin irritation (rotate/hydrocortisone), sleep disturbance/vivid dreams (→ 16-h wear), nausea.",
    pearls:"Combination NRT (patch + gum/lozenge PRN) ≈ OR 1.9 — beats any single form. Higher-dose patch (42 mg) for heavy smokers is evidence-supported in some programs." },
  { id:"nrt-short", name:"NRT — gum / lozenge / inhaler / spray", brand:"Nicorette / Nicotrol / Nicotrol NS", cls:"Short-acting nicotine (rescue doses)", eff:"OR ≈ 1.5 each; patch+short-acting ≈ 1.9", dose:"Gum 2 mg (first cig > 30 min after waking) or 4 mg (≤ 30 min): chew-park technique, 1 q1–2h PRN, max 24/day, no acidic drinks 15 min before. Lozenge same dosing rule. Nasal spray fastest delivery (dependence risk). Inhaler addresses ritual/hand habit.",
    ci:"As patch; dental issues/dentures with gum; asthma/chronic rhinitis with spray.", ae:"Hiccups, dyspepsia, jaw ache (gum), throat irritation (lozenge/inhaler), nasal irritation (spray).",
    pearls:"Dose by TIME-TO-FIRST-CIGARETTE — the single best proxy for dependence. 'Chew until peppery, then park' — most patients chew like gum and get GI side effects + failure." },
  { id:"ecig", name:"E-cigarettes (ENDS)", brand:"Various (regulated only)", cls:"Aerosolized nicotine (no combustion)", eff:"RR ≈ 1.59 vs NRT/non-nicotine (Cochrane 2024, high certainty)", dose:"Not standardized — use regulated products, adequate nicotine strength, daily use (not casual) during a quit attempt.",
    ci:"Not for youth, never-smokers, pregnancy (prefer licensed therapy). EVALI 2019: 68 deaths, > 2,800 hospitalizations — driven largely by illicit THC cartridges with vitamin-E acetate, not licensed nicotine products.", ae:"Throat/mouth irritation, cough; long-term (> 10 y) safety unknown; dual-use prolongs harm.",
    pearls:"Highest-certainty evidence for quitting among non-pharmacological aids, but regulatory heterogeneity is enormous; UK NICE/ASH endorse medicated-licensed products where available; US: no FDA-approved ENDS. Screen for youth flavours." },
];

/* ── 5 A's / 5 R's protocol ────────────────────────────────────────────── */
const FIVE_A = [
  { k:"ASK", d:"Systematically identify tobacco use at EVERY visit — 'Do you use tobacco?' in every clinical encounter; document pack-years and time-to-first-cigarette." },
  { k:"ADVISE", d:"Clear, strong, personal advice to quit: 'Quitting smoking is the single most important thing you can do for your health — I advise you to quit now.' Specific, personal, brief (< 30 s) — the message is free and works." },
  { k:"ASSESS", d:"Readiness to quit within 30 days: PREPARATION / CONTEMPLATION / PRECONTEMPLATION. Assess dependence (Fagerström: time-to-first cigarette + cigs/day), and comorbid depression/alcohol." },
  { k:"ASSIST", d:"For the willing: set a quit date (ideally < 2 weeks), plan (identify triggers, remove paraphernalia, enlist support), prescribe pharmacotherapy (± combination), give practical counselling + quitline/text referrals. For the unwilling: motivational 5 R's." },
  { k:"ARRANGE", d:"Follow-up within 1 week of quit date (highest-risk window), again within 1 month. Monitor therapy, side effects, relapse — schedule or delegate; celebrate milestones." },
];
const FIVE_R = [
  { k:"RELEVANCE", d:"Tailor to the patient's own situation — their disease, family, finances, children's asthma, faith or personal goals." },
  { k:"RISKS", d:"Personalized acute + long-term risks: 'Your COPD will progress'; 'Your leg bypass will re-occlude'; second-hand smoke on children; ask them to articulate risks themselves." },
  { k:"REWARDS", d:"Elicit the patient's own benefits: save money (calculate it live!), taste, breath, fitness, wrinkles, children's pride, fewer infections." },
  { k:"ROADBLOCKS", d:"Identify barriers honestly — withdrawal, weight gain (avg 4–5 kg; bupropion/NRT mitigate), failure history, peer smoking, stress — and pre-plan each one." },
  { k:"REPETITION", d:"Repeat the motivational message at every visit; most quitters need multiple attempts — 'The last attempt wasn't a failure, it was training.'" },
];

/* ── organ-system harm map ─────────────────────────────────────────────── */
const SMOKE_HARMS = [
  { organ:"Brain & Nervous system", d:"Stroke 2–4× · subarachnoid haemorrhage · cognitive decline · nicotine dependence itself · risk falls to near-never-smoker by 5–15 years." },
  { organ:"Head & neck", d:"Cancers of lip, oral cavity, pharynx, larynx, oesophagus · periodontitis, tooth loss · presbyacusis · cataracts · macular degeneration · smell/taste loss." },
  { organ:"Lungs", d:"Lung cancer 15–30× · COPD (80–90% of deaths) · chronic bronchitis · emphysema · pneumonia & TB reactivation risk · asthma poor control · spontaneous pneumothorax." },
  { organ:"Heart & vessels", d:"MI 2–4× · sudden cardiac death · peripheral artery disease & graft failure · AAA (screen!) · stroke · Buerger disease (thromboangiitis obliterans) in young smokers." },
  { organ:"Gastrointestinal", d:"Peptic ulcer (blocking healing) · GERD · Crohn disease flare · pancreatitis · liver cancer · colon polyps/cancer." },
  { organ:"Urinary & reproductive", d:"Bladder cancer (smoking is the #1 cause) · renal cell carcinoma · erectile dysfunction (2× — vascular) · reduced fertility, early menopause · cervical cancer." },
  { organ:"Blood & metabolism", d:"Acute myeloid leukaemia · type 2 diabetes (+30–40% risk, dose-response) · dyslipidaemia · insulin resistance." },
  { organ:"Pregnancy & child", d:"Preterm birth, low birth weight, placental abruption, stillbirth · SIDS (major modifiable risk) · childhood asthma & otitis media from second-hand smoke." },
  { organ:"Bone, skin & immune", d:"Osteoporosis & hip fracture · poor wound & fracture healing (stop ≥ 4 weeks pre-operatively) · premature skin ageing · wrinkling · psoriasis · poor vaccine/immune responses." },
];

/* ── special populations ───────────────────────────────────────────────── */
const SMOKE_SPECIAL = [
  { p:"Pregnancy", d:"Behavioural support first line at every antenatal contact. NRT if pharmacotherapy needed — prefer intermittent (gum/lozenge) at lowest effective dose; remove patch overnight; varenicline/bupropion not routine (shared decision, emerging safety data). 5 A's are mandated in antenatal care; quit rate without support ≈ 3–5%." },
  { p:"Psychiatric comorbidity", d:"High smoking prevalence (schizophrenia ~ 60%, depression ~ 30%); EAGLES: varenicline effective and safe INCLUDING active psychiatric disease — do not withhold. Monitor mood; consider bupropion if depression coexists; quit-rate parity is achievable with intensive support." },
  { p:"Adolescents (< 18)", d:"Counselling first (motivational + family), pharmacotherapy limited evidence — varenicline studied 12–19, not approved < 16–18 in most jurisdictions; if medication used, do it with structured follow-up. Screen flavour/ENDS use; school-based programs." },
  { p:"Hospitalized / pre-operative", d:"Smoke-free hospitalization + pharmacotherapy offered automatically (withdrawal does not 'rest' the patient); refer on discharge. STOP ≥ 4 weeks before surgery: halves wound complications, anesthetic risks; the pre-op clinic is the highest-yield quit opportunity in medicine." },
  { p:"COPD / post-exacerbation", d:"Cessation is the ONLY intervention proven to change the natural history of COPD (smoking cessation ≈ +0.5 FEV1/yr slope recovery, LS-MRS trials). Start in hospital post-exacerbation (teachable moment); combine with vaccinations, rehab, inhaler therapy per GOLD." },
  { p:"Cardiovascular disease", d:"Secondary prevention cornerstone post-MI/stent/PCI — quit at any age cuts recurrent events ~ 36%; combine varenicline (safe post-ACS) + intensive support; address weight-gain fear (health benefit dwarfs it)." },
];

/* ── Fagerström test (FTND) ────────────────────────────────────────────── */
const FTND = [
  { q:"How soon after waking do you smoke your first cigarette?", opts:[["Within 5 min", 3], ["6–30 min", 2], ["31–60 min", 1], ["After 60 min", 0]] },
  { q:"Do you find it difficult to refrain from smoking in forbidden places?", opts:[["Yes", 1], ["No", 0]] },
  { q:"Which cigarette would you hate to give up most?", opts:[["The first in the morning", 1], ["Any other", 0]] },
  { q:"How many cigarettes do you smoke per day?", opts:[["≤ 10", 0], ["11–20", 1], ["21–30", 2], ["≥ 31", 3]] },
  { q:"Do you smoke more frequently in the first hours after waking?", opts:[["Yes", 1], ["No", 0]] },
  { q:"Do you smoke even if you are so ill you are in bed most of the day?", opts:[["Yes", 1], ["No", 0]] },
];

/* ── cost / risk model constants (cigarette calculator API) ────────────── */
const SMOKE_MODEL = {
  minutesPerCig:14,            /* midpoint of 11–20 min estimates */
  currencies:[
    { code:"INR", sym:"₹", pack:340, name:"Indian rupees" },
    { code:"USD", sym:"$", pack:9.5, name:"US dollars" },
    { code:"EUR", sym:"€", pack:8.5, name:"Euros" },
    { code:"GBP", sym:"£", pack:12, name:"Pounds" },
  ],
  lungCaRisk:/* pack-years → approximate cumulative lung-cancer risk multiplier vs never */
    [[0, 1], [5, 2.5], [10, 5], [15, 8], [20, 12], [30, 20], [40, 28], [50, 34], [60, 40]],
  copdRisk:[[0, 3], [10, 9], [15, 15], [20, 24], [30, 34], [40, 41]],
  quitGainYears:{ 30:10, 35:9.5, 40:9, 45:8, 50:6, 55:5, 60:4, 65:3, 70:2 },  /* quit age → years regained */
};

const SMOKE_PEARLS = [
  "Ask about TIME-TO-FIRST-CIGARETTE before anything else — it predicts dependence and NRT dose better than cigarettes-per-day.",
  "Combination NRT (patch + PRN gum/lozenge) roughly doubles single-form quit rates — the most under-used trick in cessation.",
  "Varenicline is safe in psychiatric disease (EAGLES) — the old black box was withdrawn in 2016; withholding it costs lives.",
  "The pre-operative assessment clinic is the highest-yield quit opportunity in medicine: ≥ 4 weeks smoke-free halves wound complications.",
  "Average weight gain after quitting is 4–5 kg — the health benefit of quitting outweighs it ~ 20:1. Bupropion and NRT blunt it.",
  "Cytisine costs a few dollars per course with varenicline-class efficacy — the LMIC workhorse (WHO prequalified).",
  "Smoking cessation is the only intervention that changes COPD's natural history — everything else manages symptoms.",
  "Most relapses happen in week 1 — schedule follow-up INSIDE that week, not a month later.",
  "Every clinic visit is a cessation intervention: Ask–Advise–Refer takes under a minute (the 2 A's + R model).",
  "Bladder cancer's #1 cause is smoking — the urology referral letter should also be a quit consultation.",
];
</script>
