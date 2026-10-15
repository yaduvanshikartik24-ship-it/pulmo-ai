<script>
/* ═══════════════════════════════════════════════════════════════════════════
   VENTILATOR AI MK-II — supplementary knowledge layer
   (loaded AFTER the bundled engine at window.VAI)
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ── History of mechanical ventilation ─────────────────────────────────── */
const VAI_TIMELINE = [
  { yr:"1543", t:"Vesalius describes tracheal intubation", d:"Andreas Vesalius pumps air into a pig's trachea via a reed and notes the living heart-lung preparation — the first recorded positive-pressure ventilation." },
  { yr:"1667", t:"Hooke keeps a dog alive with bellows", d:"Robert Hooke demonstrates continuous tidal ventilation via bellows keeps a dog alive after opening its chest — ventilation, not motion, sustains life." },
  { yr:"1928", t:"The iron lung (Drinker & Shaw)", d:"The tank respirator saves polio victims with negative-pressure ventilation; whole-body machines become the face of respiratory support for decades." },
  { yr:"1952", t:"Copenhagen polio epidemic", d:"Bjørn Ibsen shows hand-bag positive pressure beats the tank during the epidemic — medical students bag around the clock; intensive care medicine is born." },
  { yr:"1950s", t:"Engström ventilator", d:"First volume-controlled positive-pressure ventilator with a stopwatch to deliver guaranteed minute ventilation — the ancestor of modern ICU ventilators." },
  { yr:"1967", t:"ARDS first described", d:"Ashbaugh and colleagues publish 'acute respiratory distress in adults' — 12 cases of stiff, non-compliant lungs; PEEP is introduced as therapy." },
  { yr:"1971", t:"IMV introduced (Downs)", d:"Intermittent mandatory ventilation lets patients breathe between machine breaths — the beginning of weaning science and spontaneous synchronization." },
  { yr:"1980s", t:"Microprocessor ventilators", d:"Digital control brings pressure support (PSV), SIMV synchronization windows, precise flow triggers and on-screen waveforms into every ICU." },
  { yr:"1994", t:"AECC ARDS definition", d:"The American-European Consensus Conference standardizes ARDS definitions — enabling comparable trials for the next two decades." },
  { yr:"2000", t:"ARDSNet ARMA trial", d:"6 mL/kg vs 12 mL/kg PBW: low tidal volume cuts mortality from 40% to 31% — the single most influential ventilation trial ever run." },
  { yr:"2004–10", t:"PEEP escalation trials (ALVEOLI/LOVS/SOPDS)", d:"Higher PEEP strategies: no overall mortality benefit, but moderate-severe ARDS subgroups favor higher PEEP — the basis of the high-PEEP table." },
  { yr:"2012", t:"Berlin definition of ARDS", d:"Mild/moderate/severe ARDS by P/F ratio replaces AECC; ALI term retired; explicit PEEP ≥ 5 requirement." },
  { yr:"2013", t:"PROSEVA proning trial", d:"Prone positioning ≥ 16 h/day in P/F < 150 reduces mortality from 33% to 16% — prone becomes standard rescue, not last resort." },
  { yr:"2015", t:"Driving pressure matters (Amato)", d:"Analysis of 3562 ARDS patients: ΔP (Pplat−PEEP) predicts survival better than VT or Pplat; every +1 cmH₂O above 15 raises mortality ~5%." },
  { yr:"2017–19", t:"Smart ventilators & closed loops", d:"NAVA (diaphragm-EMG triggering), ASV/INTELLiVENT, SmartCare — ventilators that titrate themselves; EOLIA defines modern VV-ECMO evidence." },
  { yr:"2020", t:"COVID-19 pandemic", d:"Awake proning, HFNC at scale, dexamethasone and rethinking of intubation timing — ventilation science stress-tested worldwide." },
  { yr:"Today", t:"AI-guided ventilation research", d:"Machine-learning prediction of extubation failure, EIT-guided individualized PEEP and closed-loop oxygenation define the research frontier." },
];

/* ── Glossary (40 terms) ───────────────────────────────────────────────── */
const VAI_GLOSSARY = [
  { t:"Auto-PEEP (intrinsic PEEP)", d:"Air trapped above set PEEP when expiration is incomplete — common in obstructive disease at high rates. Detect with expiratory hold; it masks triggering and impairs venous return." },
  { t:"Aelectrauma / Atelectrauma", d:"Cyclical alveolar collapse-reopening injury at low lung volumes. Prevented by adequate PEEP keeping end-expiratory volume above the lower inflection point." },
  { t:"Baby lung", d:"Gattinoni's concept: in ARDS the aerated (functional) lung is small though the chest is normal-sized. Set VT for the baby lung, not the body — the rationale for 6 mL/kg PBW." },
  { t:"Biotrauma", d:"Ventilation-induced inflammatory mediator release from overdistended/cycled alveoli — the mechanistic bridge between VILI and distant organ failure." },
  { t:"Breath stacking", d:"Successive breaths incompletely exhaled, so inspired volumes summate — a dangerous overdistention mechanism; seen with double triggering and reverse triggering." },
  { t:"Compliance (Crs)", d:"ΔVolume / ΔPressure of the respiratory system (mL/cmH₂O). Normal 40–80 intubated; ARDS 20–40. Static compliance uses Pplat; dynamic uses PIP (contaminated by resistance)." },
  { t:"Cycle (variable)", d:"What ends the breath: volume delivered (VCV), time (PCV), or flow falling to a % of peak (PSV). Mismatch between the ventilator's cycle and the patient's neural cycle = cycle asynchrony." },
  { t:"Dead space", d:"Ventilated but unperfused airways — anatomical (conducting) + alveolar. Physiologic Vd/Vt (Bohr-Enghoff) ≈ 0.3 normally; > 0.6 in severe ARDS predicts mortality." },
  { t:"Driving pressure (ΔP)", d:"Pplat − PEEP = VT / Cstat. The pressure actually distending the lung each breath; ≤ 15 cmH₂O is the strongest single mechanical predictor of survival in ARDS." },
  { t:"Dual control", d:"Breaths that target volume but control pressure (PRVC, AVAPS) — pressure rises breath-to-breath until the volume target is met, combining PC comfort with VC guarantee." },
  { t:"Dyssynchrony / Asynchrony", d:"Mismatch between patient neural breathing and ventilator delivery — trigger, flow and cycle types. Wasted work, discomfort, prolonged ventilation." },
  { t:"EIT (electrical impedance tomography)", d:"Bedside radiation-free imaging of regional lung ventilation via a chest electrode belt — used to individualize PEEP by balancing over- vs under-distension." },
  { t:"Equation of motion", d:"Pmus + Pvent = E·V + R·V̇. Every mode is a solution of this equation: fix flow (VC) and pressure results; fix pressure (PC) and flow results." },
  { t:"Expiratory hold", d:"Occlusion at end-expiration to read total PEEP (set + intrinsic). The standard maneuver to measure auto-PEEP." },
  { t:"Flow starvation", d:"Set inspiratory flow below patient demand — the pressure scalar scoops concave, the patient fights the valve. Fix with higher flow or pressure-targeted breaths." },
  { t:"Haldane effect", d:"Deoxygenated Hb carries CO2 better; high FiO2 can acutely raise PaCO2 in CO2 retainers. Target SpO2 88–92% in COPD." },
  { t:"HFNC (high-flow nasal cannula)", d:"Heated humidified flows up to 60 L/min: dead-space washout, small PEEP effect (~3–5 cmH2O at 40–60 L/min), comfort. Track the ROX index for failure prediction." },
  { t:"Insppiratory pause (plateau)", d:"0.3–0.8 s end-inspiratory occlusion: flow stops, pressure equilibrates → Pplat. The single most important daily measurement in ARDS care." },
  { t:"LIP / UIP", d:"Lower/upper inflection points of the static P–V curve — below LIP: collapse; above UIP: overdistension. Modern practice individualizes PEEP rather than blindly using LIP+2." },
  { t:"NAVA (neurally adjusted ventilatory assist)", d:"Support delivered in proportion to diaphragm electrical activity (Edi catheter) — trigger latency near zero, immune to leaks and pneumotach errors." },
  { t:"Oxygenation index (OI)", d:"MAP × FiO2 × 100 / PaO2. Integrates cost (pressure, oxygen) vs benefit (PaO2); OI > 25–30 = ECMO conversation." },
  { t:"P0.1", d:"Airway pressure drop in the first 100 ms of an occluded effort = respiratory drive. Normal 2–4 cmH2O; > 6 predicts weaning failure; rising P0.1 during SBT = fatigue." },
  { t:"Pendelluft", d:"Interregional gas shift from non-dependent to dependent lung at breath onset in ARDS — regional overdistension can occur even with 'safe' global VT." },
  { t:"Permissive hypercapnia", d:"Deliberately tolerating elevated PaCO2 (pH ≥ 7.20–7.25) to protect the lung from injurious volumes/pressures — contraindicated in raised ICP and pregnancy." },
  { t:"P/F ratio", d:"PaO2 / FiO2. Berlin ARDS: 200–300 mild, 100–200 moderate, < 100 severe (with PEEP ≥ 5, bilateral infiltrates, non-cardiogenic, within 1 week)." },
  { t:"Pplat (plateau pressure)", d:"Alveolar pressure at end-inspiration during pause. ≤ 30 cmH2O in ARDS; the ARDSNet ceiling." },
  { t:"PSV (pressure support ventilation)", d:"Patient-triggered, pressure-limited, flow-cycled spontaneous mode — the weaning workhorse. VT is the OUTPUT of support + effort + mechanics: monitor it." },
  { t:"P–V loop", d:"Pressure vs volume of one breath. Inspiratory slope = compliance; 'beaking' = overdistension; increased hysteresis width = recruitment; bowed right = added resistance." },
  { t:"Recruitment maneuver", d:"Brief sustained high CPAP (e.g. 30–40 cmH2O 20–40 s) to reopen collapsed alveoli — variable and transient benefit; respond-guided PEEP adjustment preferred." },
  { t:"Reverse triggering", d:"Ventilator breath entrains diaphragmatic contraction in deeply sedated patients — can couple 1:1 and degenerate into breath stacking." },
  { t:"RSBI (f/VT)", d:"Rapid shallow breathing index = RR ÷ VT(L) during unassisted breathing. < 105 classic threshold (Yang & Tobin); < 60–65 even more favourable." },
  { t:"Rise time", d:"Speed the ventilator ramps to set pressure in PC/PSV. Too fast = pressure overshoot; too slow = early flow starvation." },
  { t:"Stress index", d:"Shape exponent of the rising pressure curve in constant-flow VCV: < 0.9 tidal recruitment, 0.9–1.1 safe linearity, > 1.1 tidal overdistension." },
  { t:"Time constant (τ)", d:"τ = R × C. Time to empty ~63% of volume; 3τ ≈ 95%, 5τ ≈ 99%. Obstructive lungs (τ 1–2 s) need long expiratory times or trap gas." },
  { t:"Transpulmonary pressure (PL)", d:"Paw − Ppleural (oesophageal). The true distending stress on lung tissue; oesophageal manometry targets PL < 25 cmH2O end-inspiratory." },
  { t:"Trigger (variable)", d:"What starts the breath: time (machine), or patient effort sensed as pressure or flow deflection. Insensitive triggers waste effort; oversensitive ones auto-trigger." },
  { t:"VILI", d:"Ventilator-induced lung injury: volutrauma (overdistension), barotrauma (air leak), atelectrauma (collapse-reopen), biotrauma (inflammation). Volume, not pressure, is the primary offender." },
  { t:"Volutrauma", d:"Overdistension injury driven by transpulmonary pressure/volume — high PIP with a stiff chest wall may be harmless; modest VT with high ΔP may not be." },
  { t:"V/Q mismatch", d:"Imbalance of ventilation vs perfusion — the commonest hypoxaemia mechanism; responds to O2 better than true shunt does." },
  { t:"Weaning", d:"Progression from full support to extubation: daily SAT+SBT screening, 30–120 min trials, extubation criteria, post-extubation support. Protocolized weaning beats physician instinct." },
];

/* ── Clinical pearls (ticker) ──────────────────────────────────────────── */
const VAI_PEARLS = [
  "Rising PIP with a stable Pplat = airway problem (secretions, biting, kinking). Rising PIP AND Pplat = lung/chest-wall problem.",
  "Sudden hypotension on a ventilated obstructive patient: DISCONNECT — if BP recovers, it was auto-PEEP impeding venous return.",
  "Dose tidal volume on predicted body weight, never actual weight — in obesity the difference can be a full litre of injurious VT.",
  "In severe asthma, the safest number is the end-inspiratory lung volume, not the PaCO2 — tolerate hypercapnia, never stack breaths.",
  "Driving pressure (Pplat − PEEP) beats both VT and Pplat as a survival predictor — measure it with an inspiratory hold daily.",
  "SpO2 88–92% in COPD is a target, not a treatment failure — chasing higher saturations can cause CO2 retention.",
  "The most common asynchrony is ineffective triggering — look for expiratory flow that never reaches zero before the next breath.",
  "Pplat needs an inspiratory hold; PIP alone mixes airway resistance with compliance and tells you neither.",
  "Set external PEEP at ~80% of measured intrinsic PEEP in COPD to unload triggering — never above it.",
  "In neuromuscular patients, cough peak flow > 160 L/min predicts extubation success better than any blood gas.",
  "The ventilator only measures what it can see: a calm-looking patient with P0.1 > 6 is working at the edge of fatigue.",
  "Metabolic acidosis + intubation: maintain the patient's own high minute ventilation or pH will crash at induction.",
  "Prone ≥ 16 consecutive hours in P/F < 150 — the benefit comes from the dorsal lung, but only if you keep lung-protective limits while prone.",
  "A P–V loop that 'beaks' upward at end-inspiration is the lung telling you the VT is too big for the baby lung it has left.",
  "Extubation is a decision about the AIRWAY, not just the lungs — cough, secretions and mental status decide it.",
  "Every ventilated patient deserves a daily sedation interruption paired with an SBT screen — the pair shortens ventilation.",
];

/* ── Oxygen targets by condition ───────────────────────────────────────── */
const VAI_O2_TARGETS = [
  { c:"General critically ill (liberal O2 is harmful — IOTA)", t:"SpO2 92–96%", n:"Avoid > 96%: hyperoxia increases mortality risk without benefit" },
  { c:"ARDS / moderate-severe hypoxaemia", t:"SpO2 88–95% (PaO2 55–80)", n:"Conservative ARDSNet target — permissive mild hypoxaemia is acceptable" },
  { c:"COPD / chronic CO2 retention", t:"SpO2 88–92%", n:"Higher targets risk Haldane CO2 rise and worsening acidosis" },
  { c:"Traumatic brain injury / raised ICP", t:"SpO2 ≥ 94% (PaO2 60–100)", n:"Single hypoxic episode doubles mortality — prevent desaturation aggressively" },
  { c:"Carbon monoxide poisoning", t:"SpO2 meaningless — give FiO2 1.0", n:"Pulse oximetry cannot distinguish carboxyhaemoglobin; treat to COHb < 10%" },
  { c:"Post-cardiac arrest (ROSC)", t:"SpO2 92–98%", n:"Both hypoxia and hyperoxia after arrest are associated with worse neural outcome" },
  { c:"Preterm neonatal considerations", t:"SpO2 90–95%", n:"Hyperoxia drives ROP; resuscitation starts in air (21%), titrate up" },
  { c:"Fever / high metabolic demand", t:"Do not chase PaO2", n:"DO2 depends on cardiac output and Hb at least as much as saturation" },
];

/* ── Acid–base compensation quick table ────────────────────────────────── */
const VAI_ACIDBASE = [
  { d:"Metabolic acidosis", f:"Winter's: expected PaCO2 = 1.5 × HCO3 + 8 (± 2)", n:"Higher PaCO2 than expected = superimposed respiratory acidosis — the ventilator must maintain high minute ventilation" },
  { d:"Metabolic alkalosis", f:"Expected PaCO2 = 0.7 × HCO3 + 20 (± 5)", n:"Compensatory hypoventilation is appropriate — do not 'fix' the PaCO2 without fixing the alkali" },
  { d:"Acute respiratory acidosis", f:"HCO3 rises +1 per +10 mmHg PaCO2", n:"If HCO3 is higher → chronic retention or additional metabolic alkalosis" },
  { d:"Chronic respiratory acidosis", f:"HCO3 rises +4 per +10 mmHg PaCO2", n:"COPD retainers live here — 'normalizing' their PaCO2 too fast causes alkalaemia and weaning failure" },
  { d:"Acute respiratory alkalosis", f:"HCO3 falls 2 per 10 mmHg fall in PaCO2", n:"Most ventilated hypocapnia is iatrogenic — lower the rate" },
  { d:"Chronic respiratory alkalosis", f:"HCO3 falls 5 per 10 mmHg fall in PaCO2", n:"Pregnancy, altitude, liver disease live here" },
  { d:"Delta ratio (HAGMA)", f:"ΔAG / ΔHCO3 — 1–2 pure HAGMA", n:"< 0.8 additional normal-AG acidosis; > 2 additional metabolic alkalosis or chronic CO2 retention" },
];

/* ── Capnography atlas specs (drawing parameters) ──────────────────────── */
const VAI_CAPNO = [
  { id:"normal", n:"Normal capnogram", d:"Four phases: inspiratory baseline (I), rapid expiratory upstroke (II), alveolar plateau with slight rise (III), inspiratory downstroke (0/IV). etCO2 ≈ 35–45 mmHg, PaCO2–etCO2 gradient 2–5.", a:"The plateau is flat-ish; the gradient is your dead-space monitor — a widening gradient means rising alveolar dead space." },
  { id:"obstructive", n:"Obstructive (COPD / asthma)", d:"Slowed, sloped upstroke and rising plateau — unequal time constants empty alveoli in series, so CO2 arrives throughout expiration (shark-fin shape).", a:"Sloped plateau + prolonged expiratory flow = obstruction; watch for auto-PEEP and use long expiratory times." },
  { id:"cleft", n:"Curare cleft / partial effort", d:"A notch cut into the plateau — a spontaneous breath 'steals' some fresh gas during mechanical expiration (or diaphragm twitch), diluting the CO2 trace.", a:"Common as paralysis wears off or with partial patient effort on a mandatory mode; also seen with cuff leak." },
  { id:"rebreathing", n:"Rebreathing / exhausted circuit", d:"The baseline fails to return to zero and rises breath-to-breath — inspired gas contains CO2 (exhausted CO2 absorber, low fresh gas flow, faulty valve).", a:"Rising baseline = equipment problem, not patient problem. Change the absorber, raise fresh gas flow, check the valves." },
  { id:"embolism", n:"Sudden etCO2 drop (embolism / arrest)", d:"Abrupt fall in etCO2 with a preserved (or chaotic) waveform — alveolar dead space explodes as perfusion collapses: pulmonary embolism, massive bleed, cardiac arrest, or venous air embolism.", a:"Sudden etCO2 fall + hypotension → think perfusion catastrophe. During CPR, etCO2 is the gauge of effective compressions." },
  { id:"cardiac", n:"Cardiogenic oscillations", d:"Fine ripples on the upstroke/plateau, synced with the ECG — the beating heart physically shakes gas in the airways during apnoeic or low-flow expiration.", a:"Benign signature seen in apnoea testing, mechanical ventilation with long expiratory pauses, and brain-death evaluation." },
  { id:"esophageal", n:"Oesophageal intubation / no trace", d:"Absent or rapidly vanishing CO2 with a flat line — no gas exchange is happening through the tube.", a:"Six no-waveform breaths = oesophageal intubation until proven otherwise. Capnography is the gold-standard tube confirmation." },
  { id:"hypercapnic", n:"Rising etCO2 (hypoventilation / fever / CO2 flood)", d:"Plateau and etCO2 climb breath-to-breath — increased CO2 production (fever, sepsis, shivering, MH), reduced elimination (hypoventilation, dead space, exhausted absorber, laparoscopic CO2 absorption).", a:"Trend, not single value: rising etCO2 on constant ventilation settings demands a cause — check temperature, circuit, and minute ventilation." },
];

/* ── Mode recommendation micro-notes for consult integration ───────────── */
const VAI_CONSULT_NOTES = {
  "vc-ac":"Guarantees minute ventilation; Pplat & ΔP measurable via inspiratory hold.",
  "pc-ac":"Pressure-limited; decelerating flow matches demand — but monitor Vti breath-to-breath.",
  "prvc":"Volume-guaranteed at the lowest workable pressure — the dual-control compromise.",
  "psv":"The weaning workhorse — support follows effort; watch for over-assist atrophy.",
  "cpap":"Pure oxygenation support; every breath belongs to the patient.",
  "bipap-niv":"Non-invasive pressure support — first-line in COPD exacerbation and cardiogenic oedema.",
  "hfnc":"Comfortable high-flow oxygenation with dead-space washout — track the ROX index.",
  "aprv":"Open-lung airway pressure release — long P-high with brief releases; needs strong monitoring.",
  "asv":"Closed-loop minute ventilation — the machine chooses rate/VT to minimize work of breathing.",
  "pav-plus":"Support proportional to effort — the patient owns every breath.",
  "nava":"Diaphragm-EMG-triggered support — near-zero trigger delay, leak-tolerant.",
};

/* ── Dashboard stat definitions (counts resolved at init) ──────────────── */
const VAI_PV_CURVE = {
  lip: 10, uip: 26,
  normal: [[0,0],[3,45],[6,130],[9,290],[12,480],[16,800],[20,1160],[24,1500],[28,1720],[32,1830],[36,1880],[40,1900]],
  ards:   [[0,0],[4,25],[8,90],[12,210],[16,360],[20,520],[24,680],[28,820],[32,920],[36,970],[40,990]],
};
</script>
