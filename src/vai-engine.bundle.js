(() => {
  // src/lib/ventilator/modes.ts
  var VENT_MODES = [
    {
      id: "vc-ac",
      name: "Volume Control — Assist/Control",
      abbr: "VC-AC (VC-CMV)",
      category: "Invasive",
      controlVariable: "Volume",
      breathType: "Mandatory + assisted",
      trigger: "Patient (flow/pressure) or time",
      limit: "Volume (set VT)",
      cycle: "Volume delivered / time",
      tagline: "Guaranteed tidal volume; pressure becomes the dependent variable.",
      description: [
        "In volume control continuous mandatory ventilation the clinician controls the RIGHT side of the equation of motion — you set the shape of both the tidal-volume waveform and the inspiratory-flow waveform, and the ventilator delivers exactly the set volume every breath.",
        "Because peak inspiratory pressure (PIP) is not fixed, it varies breath-to-breath with respiratory mechanics: if elastance (1/compliance) OR airway resistance increases, PIP rises while volume stays constant. This makes the pressure–time scalar a continuous bedside monitor of the patient's mechanics.",
        "Constant (square) inspiratory flow produces a linear rise in pressure; adding an inspiratory pause creates the plateau (Pplat), which reflects static compliance alone — the classic manoeuvre used to separate resistance problems from compliance problems."
      ],
      equationSide: "Right side — E × V + R × V̇ (elastance × volume + resistance × flow)",
      settings: [
        { parameter: "Tidal volume (VT)", typicalValue: "6–8 mL/kg IBW (4–6 ARDS)", note: "Always compute from ideal body weight, never actual weight" },
        { parameter: "Rate", typicalValue: "12–20 /min", note: "Watch for auto-PEEP at high rates" },
        { parameter: "Peak inspiratory flow", typicalValue: "40–80 L/min", note: "Higher flow shortens Ti and lengthens Te" },
        { parameter: "Flow pattern", typicalValue: "Square / decelerating ramp / sine", note: "Decelerating flow better matches demand" },
        { parameter: "PEEP", typicalValue: "5 cmH2O (baseline)", note: "Titrate per oxygenation and mechanics" },
        { parameter: "Inspiratory pause", typicalValue: "0.2–0.5 s", note: "Reveals Pplat for compliance calculation" },
        { parameter: "I:E", typicalValue: "1:2 (1:3–1:4 in obstruction)", note: "Lengthen expiration in obstructive disease" }
      ],
      initialAdult: "VT 6 mL/kg IBW · RR 14 · PEEP 5 · FiO2 titrated · square flow 60 L/min · pause 0.3 s",
      indications: [
        "Full respiratory support (apnoea, paralysis, deep sedation)",
        "When a guaranteed minute ventilation is required (brain-injured patients, severe asthma)",
        "When you want bedside mechanics: Cstat/Cdyn, Pplat, driving pressure",
        "Early ARDS for precise lung-protective VT delivery"
      ],
      advantages: [
        "Constant, guaranteed tidal volume and minute ventilation",
        "Pplat and driving pressure measurable with an inspiratory pause",
        "Alarm on rising PIP immediately flags worsening mechanics (bronchospasm, secretions, pneumothorax, asynchrony)"
      ],
      disadvantages: [
        "Fixed flow can mismatch patient demand → flow asynchrony (scooped pressure trace)",
        "High PIP with stiff lungs — barotrauma risk if Pplat not monitored",
        "Pressure is unguarded: a deteriorating lung shows up as climbing pressures"
      ],
      waveformData: "VCV",
      referenceImage: "/ventilator-graphics/scalars-vc-cmv.png",
      pearlPoints: [
        "PIP is influenced by BOTH airway resistance and compliance; Pplat by compliance alone.",
        "Cstat = VT / (Pplat − PEEP)  ·  Cdyn = VT / (PIP − PEEP).",
        "If elastance or resistance rises during VC-CMV, peak pressure rises — volume and flow stay unchanged."
      ]
    },
    {
      id: "pc-ac",
      name: "Pressure Control — Assist/Control",
      abbr: "PC-AC (PC-CMV)",
      category: "Invasive",
      controlVariable: "Pressure",
      breathType: "Mandatory + assisted",
      trigger: "Patient (flow/pressure) or time",
      limit: "Pressure (set inspiratory pressure above PEEP)",
      cycle: "Time (set inspiratory time)",
      tagline: "Fixed inspiratory pressure with decelerating flow; volume becomes the dependent variable.",
      description: [
        "In pressure control continuous mandatory ventilation the clinician controls the LEFT side of the equation of motion — you set the shape of the pressure waveform (inspiratory pressure level above PEEP) and the inspiratory time.",
        "The ventilator applies the set pressure instantly (limited by rise time), so flow starts very high and decays exponentially as the alveoli fill: a classic decelerating flow ramp that matches patient demand better than constant flow.",
        "Because pressure is the controlled variable, changes in mechanics show up as changes in delivered VOLUME and FLOW: if elastance or airway resistance increases, tidal volume and flow fall while the pressure trace looks identical."
      ],
      equationSide: "Left side — Pvent (ventilator pressure waveform shape)",
      settings: [
        { parameter: "Inspiratory pressure (above PEEP)", typicalValue: "10–20 cmH2O", note: "Titrate to target VT of 6 mL/kg IBW" },
        { parameter: "PEEP", typicalValue: "5 cmH2O baseline", note: "Total pressure = PEEP + ΔP — keep Pplat < 30" },
        { parameter: "Inspiratory time (Ti)", typicalValue: "0.8–1.2 s", note: "Longer Ti → more volume in compliant lungs" },
        { parameter: "Rise time", typicalValue: "< 0.2 s", note: "Too fast → pressure overshoot; too slow → flow starvation" },
        { parameter: "Rate", typicalValue: "12–20 /min", note: "Set expiratory time keeps I:E ≈ 1:2" }
      ],
      initialAdult: "ΔP 15 cmH2O · PEEP 5 · Ti 1.0 s · RR 15 · rise time 0.1 s",
      indications: [
        "Air-leak syndromes (pressure-limited breath protects the lung)",
        "Strong respiratory drive / flow-demanding patients (decelerating flow)",
        "When pressure limitation is the priority (barotrauma risk)",
        "Neonatal/paediatric ventilation where volume delivery is hard to guarantee"
      ],
      advantages: [
        "Decelerating flow profile is comfortable and matches demand (less flow asynchrony)",
        "Inspiratory pressure is capped — lower barotrauma risk than unguarded VC",
        "Better regional gas distribution in heterogeneous lungs"
      ],
      disadvantages: [
        "Tidal volume varies with mechanics — hypoventilation if compliance suddenly falls",
        "Volume must be monitored breath-by-breath; no guaranteed minute ventilation",
        "Pplat not directly measurable (no pause needed — pressure IS the plateau)"
      ],
      waveformData: "PCV",
      referenceImage: "/ventilator-graphics/scalars-pc-cmv.png",
      pearlPoints: [
        "In PC-CMV, rising elastance or resistance makes volume and flow FALL — the pressure scalar looks normal.",
        "The PV loop in pressure modes tilts downward-right when compliance drops (unlike the flat loop of VC).",
        "Rise time is the time to reach set pressure: overshoot = too fast, concavity = too slow."
      ]
    },
    {
      id: "prvc",
      name: "Pressure-Regulated Volume Control",
      abbr: "PRVC",
      category: "Invasive",
      controlVariable: "Hybrid",
      breathType: "Mandatory + assisted",
      trigger: "Patient or time",
      limit: "Pressure (auto-adjusted breath-by-breath)",
      cycle: "Volume or time (machine-decided)",
      tagline: "Pressure-control breaths with a volume safety net — the ventilator self-titrates.",
      description: [
        "PRVC is a dual-control mode: the clinician sets a TARGET tidal volume, but each breath is delivered as a pressure-control (decelerating-flow) breath. Between breaths the ventilator measures the delivered volume and adjusts the inspiratory pressure up or down (typically in 1–3 cmH2O steps) to hit the target with the lowest possible pressure.",
        "You get the comfort and flow profile of pressure control with the volume guarantee of volume control — the machine continuously solves the equation of motion for you.",
        "PRVC behaves like PCV when mechanics are stable and progressively 'rescues' the volume when the lung stiffens. It is a good default mode in many ICUs for patients needing full support with varying mechanics."
      ],
      equationSide: "Machine-switched: clinician sets the volume target, machine controls the pressure waveform",
      settings: [
        { parameter: "Target VT", typicalValue: "6–8 mL/kg IBW", note: "Volume safety target" },
        { parameter: "Pressure limit (upper bound)", typicalValue: "PIP limit ~ +15 above working pressure", note: "Alarm — machine will not exceed" },
        { parameter: "Ti", typicalValue: "0.8–1.2 s", note: "As in PCV" },
        { parameter: "Rate / PEEP / FiO2", typicalValue: "As PCV", note: "Standard" }
      ],
      initialAdult: "VT 450 mL (6 mL/kg) · RR 15 · PEEP 5 · Ti 1.0 s · pressure regulated",
      indications: [
        "Patients whose mechanics are changing (resolving ARDS, post-arrest, weaning-adjacent)",
        "Wanting PCV comfort with a guaranteed minute ventilation",
        "Spontaneously breathing patients with variable drive on mandatory support"
      ],
      advantages: [
        "Volume guarantee + lowest workable pressure every breath",
        "Adapts automatically to compliance changes",
        "Decelerating flow — good patient comfort"
      ],
      disadvantages: [
        "Auto-titration can mask a deteriorating lung (pressure quietly climbs)",
        "In vigorous patients the machine may under-support volume — 'runaway' breaths",
        "Behaviour differs between ventilator brands"
      ],
      pearlPoints: [
        "Watch the applied pressure trend: a silently climbing pressure = stiffening lung.",
        "The first breath is usually a volume 'test breath' to measure mechanics."
      ]
    },
    {
      id: "simv",
      name: "Synchronized Intermittent Mandatory Ventilation",
      abbr: "SIMV (VC or PC)",
      category: "Invasive",
      controlVariable: "Volume",
      breathType: "Mandatory (synchronized) + spontaneous",
      trigger: "Mandatory: assist window; Spontaneous: patient",
      limit: "Set by mandatory breath type",
      cycle: "Mandatory: volume/time; Spontaneous: flow (if PS added)",
      tagline: "Mandatory breaths delivered in synchrony with patient effort, with spontaneous breathing in between.",
      description: [
        "SIMV delivers mandatory breaths at a set rate, but each mandatory breath is SYNCHRONIZED to patient effort using an assist (trigger) window that opens at intervals fixed by the SIMV rate. If a patient effort is detected while the window is open, a mandatory breath is delivered immediately; if no effort appears before the window closes, the ventilator delivers the breath on the clock.",
        "Between mandatory breaths the patient breathes spontaneously at their own rate and volume. Pressure support is usually added to the spontaneous breaths to avoid fatigue.",
        "Note from waveform analysis: the spontaneous breaths between mandatory breaths have variable peak flow and volume depending on demand and mechanics — flow and volume scalars become a mixture of two breath families."
      ],
      equationSide: "Mixed — mandatory breaths follow the set control variable; spontaneous breaths follow the patient",
      settings: [
        { parameter: "SIMV rate", typicalValue: "4–12 /min", note: "Weaning: step down as effort increases" },
        { parameter: "Mandatory VT or ΔP", typicalValue: "6–8 mL/kg IBW", note: "Applies only to mandatory breaths" },
        { parameter: "Pressure support (on spontaneous breaths)", typicalValue: "5–15 cmH2O", note: "Offloads spontaneous effort" },
        { parameter: "PEEP", typicalValue: "5 cmH2O", note: "Applies throughout" }
      ],
      initialAdult: "Rate 8 · VT 6 mL/kg IBW · PS 10 · PEEP 5",
      indications: [
        "Weaning/training respiratory muscles (traditional use)",
        "Patients with intermittent spontaneous effort who still need backup support",
        "Transition between full support and spontaneous modes"
      ],
      advantages: [
        "Maintains respiratory muscle activity (avoidance of atrophy)",
        "Backup mandatory rate protects against apnoea",
        "Synchrony window prevents breath-stacking of mandatory breaths"
      ],
      disadvantages: [
        "Modern trials show SIMV weans SLOWER than PSV trials alone",
        "Imposed workload on spontaneous breaths through the tube without adequate PS",
        "Mode asynchrony: different breath families can confuse patient and clinician"
      ],
      pearlPoints: [
        "The assist window is manufacturer-specific — know your ventilator's window length.",
        "If PS is not added, spontaneous breaths through a small ETT impose high WOB."
      ]
    },
    {
      id: "psv",
      name: "Pressure Support Ventilation",
      abbr: "PSV",
      category: "Invasive",
      controlVariable: "Pressure",
      breathType: "Spontaneous (assisted)",
      trigger: "Patient only (flow or pressure)",
      limit: "Set pressure support level",
      cycle: "FLOW-cycled (default 25% of peak inspiratory flow)",
      tagline: "Every breath is patient-triggered; the ventilator boosts each one with set pressure and cycles off when flow decays.",
      description: [
        "PSV is a purely spontaneous mode: the patient triggers every breath, the ventilator augments it with a preset inspiratory pressure, and inspiration ENDS when inspiratory flow decays to a preset fraction of its peak (commonly 25% of peak flow) — this is flow cycling, and the cycle criterion is adjustable on modern ventilators.",
        "Tidal volume and flow delivery are VARIABLE, depending on patient effort, rise time, and lung dynamics. Rise time — the time taken to reach the set pressure — is a key setting: it should be fast enough to meet demand (normally < 0.2 s) but not so fast that pressure overshoots.",
        "On the pressure–time scalar the ideal PS breath is a clean square-topped bump. A concave start means rise time too slow (increased WOB); a spike at the top means too fast (overshoot). In the PV loop a small 'trigger tail' appears — a larger tail means greater patient effort and work."
      ],
      equationSide: "Left side — but Pmus contributes: Pvent + Pmus = E×V + R×V̇",
      settings: [
        { parameter: "Pressure support level", typicalValue: "5–20 cmH2O", note: "Titrate to VT ~ 6 mL/kg and RR < 30" },
        { parameter: "PEEP", typicalValue: "5 cmH2O", note: "Counterbalances intrinsic PEEP in obstruction" },
        { parameter: "Flow cycle criterion", typicalValue: "25% of peak flow", note: "Lower % = longer Ti (COPD: raise to 40–50%); higher % = shorter Ti" },
        { parameter: "Rise time", typicalValue: "0.05–0.2 s", note: "Match to demand" }
      ],
      initialAdult: "PS 12 cmH2O · PEEP 5 · rise 0.1 s · cycle 25%",
      indications: [
        "Weaning trials (in combination with an SBT protocol)",
        "Any patient with a reliable respiratory drive needing partial support",
        "Recovery phase of critical illness"
      ],
      advantages: [
        "Patient controls rate, timing and depth — most physiological of supported modes",
        "Flow cycling auto-adapts Ti to mechanics",
        "Excellent comfort; reduces sedation needs"
      ],
      disadvantages: [
        "No guaranteed backup ventilation (unless apnoea backup exists) — never in apnoeic patients",
        "Volume varies with mechanics: low compliance → early flow cycling → small VT → double triggering",
        "High PS → over-assistance → periodic breathing and respiratory muscle atrophy"
      ],
      waveformData: "PSV",
      referenceImage: "/ventilator-graphics/pv-loop-psv.png",
      pearlPoints: [
        "Flow never reaches zero at end-inspiration in PSV — it cycles at ~25% of peak flow.",
        "Decreased compliance → flow reaches cycle criterion EARLY → short Ti and risk of double triggering.",
        "High compliance + high resistance (asthma) → slow flow decay → prolonged Ti → air trapping; fix by raising cycle % or lowering PS."
      ]
    },
    {
      id: "cpap",
      name: "Continuous Positive Airway Pressure",
      abbr: "CPAP",
      category: "Spontaneous",
      controlVariable: "Pressure",
      breathType: "Spontaneous (unassisted)",
      trigger: "Patient",
      limit: "Constant pressure level",
      cycle: "Patient (fully spontaneous)",
      tagline: "A constant positive pressure throughout the respiratory cycle — every breath is entirely the patient's own.",
      description: [
        "CPAP maintains a single elevated pressure (above atmospheric) during both inspiration and expiration without delivering machine breaths. It splints alveoli open (recruitment), raises mean airway pressure, and — in obstructive disease — stents the airways and counteracts intrinsic PEEP.",
        "Because there is no inspiratory assist, the patient does ALL the work: CPAP improves OXYGENATION but does not support VENTILATION (CO2 removal). Tidal volume comes entirely from the patient's muscles.",
        "It is the classic mode for cardiogenic pulmonary oedema (CPAP 5–10 cmH2O), obstructive sleep apnoea, and the final step before extubation (extubation-prevention in selected patients)."
      ],
      equationSide: "Pvent is constant; all swings come from Pmus",
      settings: [
        { parameter: "CPAP level", typicalValue: "5–10 cmH2O", note: "Titrate to oxygenation and work of breathing" },
        { parameter: "FiO2", typicalValue: "Titrate 21–100%", note: "Independent of pressure" }
      ],
      initialAdult: "CPAP 5–7.5 cmH2O · FiO2 to SpO2 92–96%",
      indications: [
        "Cardiogenic pulmonary oedema (first-line NIV form)",
        "Recruitment / preventing atelectasis post-extubation",
        "Sleep apnoea / obesity hypoventilation (nocturnal)"
      ],
      advantages: [
        "Simple; preserves full spontaneous physiology",
        "Reduces work of breathing against intrinsic PEEP",
        "Improves oxygenation without pressure swings"
      ],
      disadvantages: [
        "Zero ventilatory support — dangerous in fatigue/hypercapnia",
        "Requires intact drive and muscle power"
      ],
      pearlPoints: [
        "CPAP ≠ PSV: CPAP adds NO inspiratory assist — only a raised baseline.",
        "External PEEP in COPD acts as a trigger aid: it cancels part of intrinsic PEEP so triggering takes less effort."
      ]
    },
    {
      id: "aprv",
      name: "Airway Pressure Release Ventilation",
      abbr: "APRV",
      category: "Invasive",
      controlVariable: "Pressure",
      breathType: "Spontaneous + intermittent release",
      trigger: "Time (release) + patient (spontaneous)",
      limit: "P-High (high pressure level)",
      cycle: "Time (T-High / T-Low)",
      tagline: "Long high-CPAP phases with brief releases — an open-lung, spontaneous-friendly mode.",
      description: [
        "APRV uses LONG inflation periods (T-High, typically 3–5 s) at a high pressure (P-High, usually 20–30 cmH2O) and SHORT deflation periods (T-Low, 0.2–0.8 s) to a low pressure (P-Low, 0–5 cmH2O). The high pressure with FiO2 determines OXYGENATION; ventilation is determined by the release FREQUENCY, the P-High→P-Low difference, and spontaneous breathing.",
        "To sustain recruitment, 80–95% of the total cycle time should be spent at the HIGH pressure. The time at P-Low is deliberately brief so exhalation is incomplete — auto-PEEP is created BY DESIGN to prevent de-recruitment. The release time is tuned so that expiratory flow reaches 50–75% of peak expiratory flow (T-PEFR 50–75%) before the breath returns to P-High.",
        "The patient can breathe spontaneously at BOTH pressure levels — spontaneous breathing during P-High generates negative pleural pressures that add to alveolar stretch and improve ventilation–perfusion matching and venous return. Adding PS on top of P-High further raises transpulmonary pressure and can uncouple flow from effort."
      ],
      equationSide: "Left side — a time-switched two-level Pvent with spontaneous Pmus superimposed",
      settings: [
        { parameter: "P-High", typicalValue: "20–30 cmH2O", note: "Equivalent to a CPAP level; drives oxygenation" },
        { parameter: "T-High", typicalValue: "3–5 s", note: "Majority (80–95%) of total cycle" },
        { parameter: "P-Low", typicalValue: "0–5 cmH2O", note: "Usually 0 — release pressure" },
        { parameter: "T-Low", typicalValue: "0.2–0.8 s", note: "Tune so T-PEFR = 50–75% of PEFR" },
        { parameter: "FiO2", typicalValue: "Titrate", note: "With P-High sets oxygenation" }
      ],
      initialAdult: "P-High 25 · T-High 4.0 s · P-Low 0 · T-Low 0.6 s · FiO2 per SpO2",
      indications: [
        "Refractory hypoxaemia / moderate-severe ARDS as an alternative rescue",
        "Patients needing spontaneous breathing with an open-lung strategy",
        "Difficulty oxygenating on conventional modes"
      ],
      advantages: [
        "High mean airway pressure → excellent recruitment and oxygenation",
        "Preserved spontaneous effort (V/Q matching, haemodynamics, diaphragm)",
        "Freedom to breathe at any point in the cycle — less sedation"
      ],
      disadvantages: [
        "Ventilation (CO2) control is weak — relies on releases and spontaneous effort",
        "T-Low mismanagement: too long → de-recruitment; too short → excessive auto-PEEP and hyperinflation",
        "Spontaneous effort at P-High can cause large transpulmonary swings → pendelluft / VILI risk"
      ],
      waveformData: "APRV",
      pearlPoints: [
        "Auto-PEEP is INTENTIONAL in APRV — it maintains end-expiratory lung volume above closing volume.",
        "Adjust T-Low so expiratory flow falls to 50–75% of its peak before returning to P-High.",
        "Time high:low ratios from 4:1 to 9:1 are typical; 1:1 is not APRV."
      ]
    },
    {
      id: "bipap-niv",
      name: "Bi-Level Positive Airway Pressure (NIV)",
      abbr: "BiPAP / NIV",
      category: "Non-invasive",
      controlVariable: "Pressure",
      breathType: "Spontaneous (pressure-supported)",
      trigger: "Patient",
      limit: "IPAP level",
      cycle: "Flow (like PSV)",
      tagline: "Mask-delivered pressure support — IPAP boosts each breath, EPAP splints the lung.",
      description: [
        "Non-invasive BiPAP delivers two pressure levels through a mask or helmet: IPAP (inspiratory positive airway pressure) works exactly like pressure support — boosting patient-triggered breaths — while EPAP (expiratory) works like PEEP — maintaining FRC and countering intrinsic PEEP. The pressure difference (IPAP − EPAP) is the pressure support that drives ventilation and CO2 clearance.",
        "NIV is first-line in COPD hypercapnic exacerbation (pH 7.25–7.35) and cardiogenic pulmonary oedema (CPAP preferred when pure oxygenation problem), and is used with caution in immunocompromised patients to avoid intubation.",
        "Success depends on selection (drive intact, protective reflexes, correctable precipitant) and on leak-tolerant, flow/pressure-triggered bilevel circuits. Rising respiratory rate, falling pH or worsening consciousness over the first 1–2 hours = failure → intubate."
      ],
      equationSide: "Left side (pressure) delivered non-invasively; Pmus still contributes",
      settings: [
        { parameter: "IPAP", typicalValue: "10–20 cmH2O", note: "Drives ventilation; increase for hypercapnia" },
        { parameter: "EPAP", typicalValue: "4–6 cmH2O", note: "Oxygenation + counter intrinsic PEEP" },
        { parameter: "Backup rate", typicalValue: "Optional 12–16", note: "Only for central hypoventilation" },
        { parameter: "FiO2", typicalValue: "Titrate to SpO2 88–92% in COPD", note: "Avoid hyperoxia in CO2 retainers" }
      ],
      initialAdult: "IPAP 12 · EPAP 5 · O2 to SpO2 88–92% (COPD) / 92–96% (CPE)",
      indications: [
        "COPD exacerbation with respiratory acidosis (pH < 7.35)",
        "Cardiogenic pulmonary oedema (CPAP or BiPAP)",
        "Immunocompromised hypoxaemic failure (selected)",
        "Weaning/extubation support in hypercapnic failure"
      ],
      advantages: [
        "Avoids intubation: preserves cough, speech, swallowing",
        "Rapid application and removal; lower VAP and sedation"
      ],
      disadvantages: [
        "Contraindicated with absent airway reflexes, encephalopathy, facial trauma, haemodynamic instability",
        "Mask leaks, gastric distension, pressure injury",
        "Delayed intubation if failure is not recognized early"
      ],
      pearlPoints: [
        "IPAP − EPAP = the effective pressure support: raise it for CO2, raise EPAP (or FiO2) for O2.",
        "NIV failure predictors: RR > 30 after 1 h, pH < 7.25, Glasgow < 11 — plan intubation early."
      ]
    },
    {
      id: "hfnc",
      name: "High-Flow Nasal Cannula",
      abbr: "HFNC / OHF",
      category: "Non-invasive",
      controlVariable: "Flow",
      breathType: "Spontaneous",
      trigger: "Patient",
      limit: "Set flow (up to 60 L/min)",
      cycle: "Patient",
      tagline: "Heated, humidified high-flow oxygen — dead-space washout with mild PEEP effect and comfort.",
      description: [
        "HFNC delivers up to 60 L/min of heated humidified gas at a precisely set FiO2 through nasal cannulae. At high flow it washes out anatomical dead space (improving alveolar ventilation), generates a small amount of positive pressure (~1–5 cmH2O, flow-dependent), reduces inspiratory resistance work, and provides excellent humidification that helps secretion clearance.",
        "It is the preferred first-line oxygen device in hypoxaemic (non-hypercapnic) respiratory failure — classically COVID/pneumonia-type — when conventional oxygen fails but NIV is not indicated. The ROX index (SpO2/FiO2 ÷ RR) after 2–12 h identifies patients likely to fail (ROX < 3.85 at 12 h → escalate).",
        "HFNC does NOT support ventilation significantly — rising CO2 or worsening acidosis means escalation to NIV or intubation."
      ],
      equationSide: "Supplemental: reduces dead space and inspiratory resistance (right-side terms)",
      settings: [
        { parameter: "Flow", typicalValue: "30–60 L/min", note: "Start 40–50; more flow = more support" },
        { parameter: "FiO2", typicalValue: "21–100%", note: "Independent control" },
        { parameter: "Temperature", typicalValue: "34–37 °C", note: "Humidification comfort" }
      ],
      initialAdult: "Flow 50 L/min · FiO2 to SpO2 ≥ 92%",
      indications: [
        "Hypoxaemic respiratory failure without hypercapnia",
        "Post-extubation support (high-risk patients)",
        "Palliative comfort oxygenation; procedural sedation"
      ],
      advantages: [
        "Comfortable, eat and speak; no mask pressure injury",
        "Dead-space washout improves ventilation efficiency",
        "Easy escalation/de-escalation ladder"
      ],
      disadvantages: [
        "Minimal ventilatory support — not for hypercapnic failure",
        "Can delay needed intubation if not monitored (use ROX index)"
      ],
      pearlPoints: [
        "ROX index = (SpO2/FiO2)/RR. < 2.85 at 2 h, < 3.85 at 12 h → predict HFNC failure.",
        "Each 10 L/min adds roughly 0.5–1 cmH2O pharyngeal pressure — modest, not PEEP-equivalent."
      ]
    },
    {
      id: "vs",
      name: "Volume Support",
      abbr: "VS",
      category: "Invasive",
      controlVariable: "Hybrid",
      breathType: "Spontaneous (assisted)",
      trigger: "Patient",
      limit: "Auto-adjusted pressure",
      cycle: "Flow (like PSV) with volume feedback",
      tagline: "PSV with a volume guarantee — pressure support auto-titrated to a target VT.",
      description: [
        "Volume Support is the spontaneous sibling of PRVC: every breath is patient-triggered and flow-cycled like PSV, but the ventilator adjusts the pressure support level breath-by-breath so that spontaneous tidal volume meets a set target.",
        "As the patient's effort recovers, the machine lowers support; as the patient tires, it raises support. This makes VS a self-weaning mode that maintains a stable VT while letting the patient dictate rate and rhythm."
      ],
      equationSide: "Left side auto-titrated against a volume target",
      settings: [
        { parameter: "Target VT", typicalValue: "6 mL/kg IBW", note: "Machine aims here" },
        { parameter: "PEEP", typicalValue: "5 cmH2O", note: "Standard" },
        { parameter: "Cycle / rise", typicalValue: "As PSV", note: "Flow-cycled" }
      ],
      initialAdult: "Target VT 6 mL/kg IBW · PEEP 5",
      indications: [
        "Weaning-adjacent patients with variable effort",
        "Stabilizing VT during recovery without manual PS changes"
      ],
      advantages: ["Automatic weaning of support level", "Stable VT despite fluctuating drive"],
      disadvantages: [
        "Over-assistance risk if patient passively accepts target",
        "Brand-dependent behaviour; less studied than PSV"
      ],
      pearlPoints: [
        "Watch the support pressure trend — a falling trend = improving effort (weaning trajectory)."
      ]
    },
    {
      id: "pc-simv",
      name: "Pressure-Controlled SIMV",
      abbr: "PC-SIMV",
      category: "Invasive",
      controlVariable: "Pressure",
      breathType: "Mandatory (pressure) + spontaneous",
      trigger: "Time (mandatory) + patient effort (spontaneous)",
      limit: "Pressure (set PIP)",
      cycle: "Time (set Ti) / flow (spontaneous)",
      tagline: "Pressure-targeted mandatory breaths synchronized with spontaneous breathing.",
      description: [
        "Identical architecture to VC-SIMV, but the mandatory breaths are pressure-controlled: the ventilator holds PEEP + set inspiratory pressure for a set Ti, and delivered volume becomes the dependent variable.",
        "Spontaneous breaths between mandatory efforts are typically supported with pressure support (PS) and CPAP. Synchronization windows prevent breath-stacking onto patient effort.",
        "Combines the flow-profile and pressure-limiting advantages of PCV with spontaneous breathing preservation — historically popular for weaning, though evidence favours daily SBTs over gradual SIMV withdrawal."
      ],
      equationSide: "Pressure is preset (clinician side); volume floats with mechanics (patient side).",
      settings: [
        { parameter: "SIMV rate", typicalValue: "4–8 /min", note: "Mandatory backstop; wean by 2/min as spontaneous effort proves reliable" },
        { parameter: "PIP (ΔP)", typicalValue: "10–20 cmH2O above PEEP", note: "Titrate to VT 6–8 mL/kg IBW" },
        { parameter: "Ti", typicalValue: "0.8–1.2 s", note: "Watch delivered VT at every change" },
        { parameter: "Pressure support", typicalValue: "8–12 cmH2O", note: "Supports spontaneous breaths" },
        { parameter: "PEEP / FiO2", typicalValue: "5 cmH2O / titrate", note: "Oxygenation support" }
      ],
      initialAdult: "PIP 15 over PEEP 5 · rate 6 · PS 10 · FiO2 titrated",
      indications: [
        "Weaning with unstable respiratory drive or variable mechanics",
        "Transition patients who fatigue on pure PSV/CPAP",
        "Air leak syndromes where low peak pressure is prioritised"
      ],
      advantages: ["Lower PIP than VC for the same VT", "Preserves spontaneous muscle activity"],
      disadvantages: [
        "Delivered VT varies with compliance — monitor every change",
        "Weaning by SIMV rate reduction is slower than daily SBTs",
        "Dual control settings (PIP + PS) increase complexity and error risk"
      ],
      waveformData: "SIMV",
      pearlPoints: [
        "If the patient triggers above the SIMV rate, each spontaneous breath still gets PS — total support is a blend; check delivered VT of BOTH breath types."
      ]
    },
    {
      id: "asv",
      name: "Adaptive Support Ventilation",
      abbr: "ASV (Hamilton)",
      category: "Hybrid",
      controlVariable: "Hybrid",
      breathType: "Adaptive mandatory + spontaneous",
      trigger: "Time/patient — automatic",
      limit: "Pressure — automatically adjusted",
      cycle: "Automatic (time or flow per breath type)",
      tagline: "Closed-loop mode that computes the least-work breathing pattern for the patient's mechanics (Otis equation) and adapts breath-by-breath.",
      description: [
        "The clinician sets only IBW (adult/paediatric), a minute-ventilation target (%MinVol), PEEP and FiO2. The controller continuously measures compliance and resistance (via minimal occlusion/flow analysis) and calculates an optimal combination of rate and Ti that minimizes total work of breathing.",
        "Mandatory breaths are delivered as pressure-controlled (or pressure-supported when patient-triggered) with inspiratory pressure adjusted breath-to-breath to keep exhaled VT near target; an apnoea backup and an 85% high-pressure limit are automatic.",
        "As the patient recovers, the mode automatically transitions from control → support → near-CPAP, making it a built-in weaning platform."
      ],
      equationSide: "Machine governs both pressure and volume — clinician only sets the minute-ventilation target.",
      settings: [
        { parameter: "IBW", typicalValue: "Patient height/sex", note: "Drives VT target (default ≈ 8 then 6 mL/kg pattern)" },
        { parameter: "%MinVol", typicalValue: "100% (≈ 0.1 L/kg/min)", note: "Lower (60–80%) to wean; raise to wash out CO2" },
        { parameter: "PEEP / FiO2", typicalValue: "5–8 / titrate", note: "Only true oxygenation dials the clinician keeps" },
        { parameter: "High-pressure alarm limit", typicalValue: "auto (≤ 85% of limit)", note: "Working pressure is auto-capped" }
      ],
      initialAdult: "IBW-set · %MinVol 100 · PEEP 5 · FiO2 per SpO2",
      indications: [
        "Full ventilation through weaning without mode changes",
        "Variable-drive patients who move between apnoea and effort",
        "Transport and recovery units where continuous re-titration is impractical"
      ],
      advantages: ["One mode from intubation to extubation", "Auto-adapts to mechanics changes", "Built-in safety backup (apnoea, high pressure)"],
      disadvantages: [
        "Operator surrenders VT/rate control — some findings of VT overshoot early after initiation",
        "Requires correct IBW entry — wrong height = wrong lung-protective target",
        "Black-box behaviour: trend screens needed to understand what it is doing"
      ],
      waveformData: "PSV",
      pearlPoints: [
        "Watch the pressure-support trend line on the Hamilton screen — a steadily falling support level is the weaning trajectory made visible."
      ]
    },
    {
      id: "pav-plus",
      name: "Proportional Assist Ventilation",
      abbr: "PAV+ (Puritan Bennett)",
      category: "Hybrid",
      controlVariable: "Hybrid",
      breathType: "Spontaneous, proportional",
      trigger: "Patient effort (flow + volume shaped)",
      limit: "Proportional (% assist of measured effort)",
      cycle: "Patient effort cessation",
      tagline: "Support is proportional to instantaneous patient effort — the ventilator amplifies what the patient cannot generate.",
      description: [
        "PAV+ briefly interrupts flow (3 s end-inspiratory pause every few breaths) to measure respiratory elastance and resistance, then delivers pressure = %assist × (elastance·volume + resistance·flow) throughout each spontaneous breath.",
        "Because support tracks demand in real time, the patient controls rate, timing, and depth — load-and-capacity relationship is preserved, improving comfort and patient-ventilator synchrony compared with fixed PSV.",
        "The gain is set as a percentage (e.g., 40–60% of the work) — NOT a pressure level. With high assist percentages and normal lung mechanics, runaway support is prevented by the 90% assist ceiling and automatic gain limiting."
      ],
      equationSide: "Clinician sets the amplification gain of the patient side of the equation of motion.",
      settings: [
        { parameter: "Level of assist", typicalValue: "40–60%", note: "Percent of total work of breathing supplied" },
        { parameter: "PEEP", typicalValue: "5 cmH2O", note: "Oxygenation + counteracts auto-PEEP trigger load" },
        { parameter: "FiO2", typicalValue: "Titrate", note: "Oxygenation" },
        { parameter: "Backup ventilation", typicalValue: "Apnoea parameters", note: "Mandatory — PAV cannot ventilate an apnoeic patient" }
      ],
      initialAdult: "Assist 40% · PEEP 5 · apnoea backup armed",
      indications: [
        "Patients with intact drive but weak muscles (weaning, neuromuscular weakness)",
        "Flow starvation and dyssynchrony on fixed PSV",
        "Difficult-to-sedate patients fighting conventional modes"
      ],
      advantages: ["Best synchrony — support follows demand", "Patient retains full control of pattern", "Automatic mechanics measurement displayed"],
      disadvantages: [
        "No guaranteed VT or backup pattern (needs apnoea alarms)",
        "Useless in apnoea or deeply sedated/paralysed patients",
        "Requires reliable effort — not for profound weakness"
      ],
      waveformData: "PSV",
      pearlPoints: [
        "Use the displayed %work target: if the patient's own share stays < 30%, you are over-assisting; > 70% risks fatigue."
      ]
    },
    {
      id: "nava",
      name: "Neurally Adjusted Ventilatory Assist",
      abbr: "NAVA (Maquet/Getinge)",
      category: "Hybrid",
      controlVariable: "Hybrid",
      breathType: "Spontaneous, neurally triggered",
      trigger: "Electrical activity of diaphragm (Edi)",
      limit: "Proportional to Edi (NIV level × gain)",
      cycle: "Neural inspiration end (flow backup)",
      tagline: "Trigger and support driven directly by the diaphragm's electrical signal — the closest technology to physiological breathing.",
      description: [
        "A specialized NG/D tube with embedded oesophageal electrodes captures Edi (diaphragm electrical activity, μV). Each breath is triggered by the neural signal onset and pressure is delivered proportionally: P = NIV level (cmH2O/μV) × Edi.",
        "Because triggering is neural, auto-PEEP cannot hide patient effort (the classic COPD ineffective-trigger problem disappears), and cycling off occurs exactly when the diaphragm relaxes — essentially eliminating trigger and cycle asynchrony.",
        "If the Edi signal is lost (tube displacement), the ventilator falls back to conventional flow-triggered PSV with full alarms."
      ],
      equationSide: "Patient neural effort is the input; the ventilator amplifies it proportionally.",
      settings: [
        { parameter: "NAVA level", typicalValue: "0.5–2.0 cmH2O/μV", note: "Gain — titrate to Edi peak 5–15 μV and VT ≈ 4–6 mL/kg" },
        { parameter: "PEEP", typicalValue: "5 cmH2O", note: "Oxygenation + lung recruitment" },
        { parameter: "Backup", typicalValue: "PSV + apnoea", note: "Mandatory safety net if Edi lost" },
        { parameter: "Edi catheter position", typicalValue: "Verified on screen", note: "Best signal quality at correct depth" }
      ],
      initialAdult: "NAVA level 1.0 · PEEP 5 · PSV backup 12",
      indications: [
        "Severe patient-ventilator asynchrony refractory to conventional settings",
        "Difficult weaning with weak/variable trigger",
        "COPD with high auto-PEEP and ineffective triggering"
      ],
      advantages: ["Neural trigger immune to auto-PEEP", "Near-perfect synchrony; comfort", "Edi is a continuous weaning-monitor (diaphragm effort trend)"],
      disadvantages: [
        "Needs specialized catheter placement and signal verification",
        "No ventilation guarantee in apnoea (backup required)",
        "Availability limited to specific platforms"
      ],
      waveformData: "PSV",
      pearlPoints: [
        "The Edi trace is a free weaning monitor: a falling Edi peak at constant NIV level means improving capacity — plan the SBT."
      ]
    },
    {
      id: "mmv",
      name: "Mandatory Minute Ventilation",
      abbr: "MMV",
      category: "Hybrid",
      controlVariable: "Hybrid",
      breathType: "Spontaneous + variable mandatory",
      trigger: "Patient or automatic backup",
      limit: "Minute-ventilation target",
      cycle: "Automatic",
      tagline: "Guarantees a minute-ventilation floor — spontaneous breathing reduces the machine's contribution automatically.",
      description: [
        "The clinician sets a target minute ventilation. Every spontaneous breath adds to the measured VE; whenever the patient falls below target, the ventilator supplies the deficit with mandatory breaths (rate or support rises); if the patient exceeds it, machine breaths vanish.",
        "Designed as a safety net for patients with fluctuating drive (post-anaesthetic recovery, neuromuscular fluctuation) — the patient can never receive less than the set VE."
      ],
      equationSide: "Volume target on the machine side; patient effort modulates how much is machine-delivered.",
      settings: [
        { parameter: "Target VE", typicalValue: "≈ 0.1 L/kg/min (7–8 L/min adult)", note: "Usually set slightly below full need to encourage effort" },
        { parameter: "Mandatory breath form", typicalValue: "Vendor-specific", note: "VC or PC backup breaths" },
        { parameter: "Alarms", typicalValue: "Low/high VE + apnoea", note: "Essential — MMV can be fooled by rapid shallow breathing" }
      ],
      initialAdult: "Target VE 7 L/min · alarms armed",
      indications: ["Recovery-phase safety net", "Fluctuating respiratory drive", "Weaning with apnoea-prone patients"],
      advantages: ["Hard VE floor with maximum spontaneous freedom", "Automatic compensation for drowsy periods"],
      disadvantages: [
        "Rapid-shallow breathing can meet the VE target with negligible alveolar ventilation (dead-space fraud)",
        "Must pair with RSBI/VT alarms to catch the pattern",
        "Less common on modern platforms than ASV-type modes"
      ],
      waveformData: "PSV",
      pearlPoints: [
        "Check RSBI while on MMV: a patient meeting VE with RR 35 and VT 200 is failing despite a satisfied target."
      ]
    },
    {
      id: "avaps",
      name: "Average Volume-Assured Pressure Support",
      abbr: "AVAPS / iVAPS",
      category: "Non-invasive",
      controlVariable: "Hybrid",
      breathType: "Spontaneous (pressure, volume-targeted)",
      trigger: "Patient effort",
      limit: "IPAP range bounds",
      cycle: "Flow (spontaneous)",
      tagline: "BiPAP that automatically adjusts IPAP within set limits to achieve a target average VT — stable volume with mask comfort.",
      description: [
        "Classic NIV weakness: delivered VT swings with leak, sleep state, and effort. AVAPS continuously measures exhaled VT and modulates IPAP breath-to-breath between an IPAPmin and IPAPmax to hold a running-average target VT (typically 6–8 mL/kg IBW).",
        "iVAPS extends the concept: it learns the patient's alveolar ventilation target and adjusts both support and backup rate (intelligent volume-assured PS) for chronic home ventilators.",
        "Widely used in chronic respiratory failure (obesity hypoventilation, neuromuscular disease, COPD) where long-night stability matters."
      ],
      equationSide: "Dual control — pressure delivery steered by a volume target.",
      settings: [
        { parameter: "Target VT", typicalValue: "6–8 mL/kg IBW", note: "Average target, not per-breath" },
        { parameter: "IPAP range", typicalValue: "min 8–10 · max 20–25 cmH2O", note: "Controller bound — limits aggressiveness" },
        { parameter: "EPAP", typicalValue: "4–6 (OHS often 8–10)", note: "Oxygenation/obstruction; note EPAP counts toward IPAPmax headroom" },
        { parameter: "Backup rate", typicalValue: "Optional (ST mode)", note: "For central hypoventilation/sleep" }
      ],
      initialAdult: "VT 400 · IPAP 10–20 · EPAP 5 · backup 12",
      indications: ["Obesity hypoventilation on NIV", "Neuromuscular chronic failure", "COPD NIV with variable night-time VT"],
      advantages: ["Stable alveolar ventilation across sleep/leak changes", "Prevents both under- and over-ventilation on NIV"],
      disadvantages: ["Slow (breath-to-breath) adaptation — not for acute swings", "IPAPmax bounds can cap achievable VT in very stiff lungs"],
      waveformData: "CPAP",
      pearlPoints: [
        "Set IPAPmin only just below the patient's comfortable pressure — a low floor lets AVAPS ride up smoothly during sleep."
      ]
    },
    {
      id: "bilevel",
      name: "BiLevel Ventilation (non-APRV)",
      abbr: "BiLevel / PCV+PEEP",
      category: "Invasive",
      controlVariable: "Pressure",
      breathType: "Mandatory + spontaneous at both levels",
      trigger: "Time + patient effort at either level",
      limit: "Pressure (Phigh / Plow)",
      cycle: "Time (Thigh / Tlow)",
      tagline: "Two CPAP levels with unrestricted spontaneous breathing at both — APRV's gentler, structured sibling.",
      description: [
        "The ventilator alternates between Plow (PEEP-equivalent) and Phigh for set durations with a set mandatory rate. Unlike APRV, the high-time is short relative to low-time (conventional I:E), and spontaneous effort is allowed throughout both phases.",
        "Each transition from Phigh→Plow generates a pressure gradient that boosts ventilation without high peak pressure; each Plow→Phigh transition aids oxygenation via higher mean airway pressure.",
        "On many platforms (e.g., Draeger Biphasic PAP, BiLevel) this is functionally PCV with an open valve — allowing free breathing that pure PCV would fight."
      ],
      equationSide: "Both pressure levels preset; volume depends on mechanics at each level.",
      settings: [
        { parameter: "Phigh", typicalValue: "15–20 cmH2O", note: "Oxygenation driver (mean pressure)" },
        { parameter: "Plow", typicalValue: "5 cmH2O", note: "Expiration level" },
        { parameter: "Rate / Thigh", typicalValue: "12–16 / 0.8–1.2 s", note: "Conventional timing (vs APRV's 3–5 s Thigh)" },
        { parameter: "Spontaneous support", typicalValue: "PS 0–12 at Plow", note: "Vendor-dependent — boosts spontaneous VT" }
      ],
      initialAdult: "Phigh 18 · Plow 5 · rate 14 · Thigh 1.0",
      indications: [
        "Difficult-to-synchronize patients who fight conventional PCV",
        "Intermediate between conventional PCV and full APRV",
        "Weaning-adjacent ventilation preserving spontaneous effort"
      ],
      advantages: ["Spontaneous breathing anytime — less sedation need", "Higher mPaw than PCV without raising PIP"],
      disadvantages: [
        "Terminology chaos — vendor implementations differ significantly",
        "Spontaneous effort at Phigh can dangerously raise transpulmonary pressure (P-SILI) in strong patients"
      ],
      waveformData: "APRV",
      pearlPoints: [
        "When a patient breathes vigorously on BiLevel, monitor transpulmonary pressure surrogates (driving pressure of spontaneous breaths) — consider lowering Phigh or sedation."
      ]
    },
    {
      id: "hfov",
      name: "High-Frequency Oscillatory Ventilation",
      abbr: "HFOV",
      category: "Invasive",
      controlVariable: "Pressure",
      breathType: "Oscillatory (active inspiration + expiration)",
      trigger: "Continuous oscillation (no breath triggering)",
      limit: "Oscillatory pressure amplitude (ΔP)",
      cycle: "Piston/membrane at set Hz",
      tagline: "Tiny tidal volumes (1–3 mL/kg) delivered at 3–15 Hz around a high constant mean airway pressure — ventilation and oxygenation decoupled.",
      description: [
        "A piston/diaphragm oscillates the airway around a set mean pressure (mPaw, commonly 25–30 cmH2O in adults) 180–900 times per minute. Expiration is ACTIVE (the oscillator pulls gas back), which distinguishes HFOV from other high-frequency strategies and limits breath-stacking.",
        "Gas exchange occurs through bulk flow, Taylor dispersion, pendelluft, and molecular diffusion — VT is deliberately below anatomic dead space.",
        "Oxygenation is set by mPaw + FiO2 (recruitment); CO2 clearance is set by oscillatory amplitude (ΔP/power) and frequency (lower Hz = larger excursion = more CO2 clearance — counterintuitive but key)."
      ],
      equationSide: "Special case — the equation of motion at sub-dead-space volumes; mPaw and ΔP are the control knobs.",
      settings: [
        { parameter: "mPaw", typicalValue: "23–30 cmH2O", note: "Oxygenation driver — titrate by oxygenation + haemodynamics" },
        { parameter: "Frequency", typicalValue: "Adult 3–6 Hz · neonate 8–15 Hz", note: "LOWER Hz = better CO2 clearance" },
        { parameter: "Amplitude (ΔP power)", typicalValue: "To visible chest wiggle", note: "CO2 clearance driver" },
        { parameter: "Bias flow", typicalValue: "20–40 L/min", note: "Fresh gas + CO2 removal" },
        { parameter: "% inspiratory time", typicalValue: "33%", note: "Oscillatory duty cycle" }
      ],
      initialAdult: "mPaw 25 · Hz 5 · ΔP to chest wiggle · FiO2 100 → wean",
      indications: [
        "Refractory hypoxaemia despite conventional optimization (rescue)",
        "Severe air-leak syndromes (bronchopleural fistula) — low swings",
        "Neonatal RDS (established niche, INSURE/SUR2E era)"
      ],
      advantages: ["Minimal volutrauma/atelectrauma swings", "High mPaw holds recruitment", "Active expiration avoids stacking"],
      disadvantages: [
        "Adult evidence poor (OSCAR 2013 — no benefit; OSCILLATE — harm trend) → rescue only",
        "Heavy sedation ± paralysis; haemodynamic compromise from high mPaw",
        "Difficult monitoring: no conventional waveforms, VT often unmeasurable"
      ],
      pearlPoints: [
        "Rising PaCO2 on HFOV? Lower the frequency (bigger excursion) before touching amplitude — the reflex to raise Hz is the classic error."
      ]
    },
    {
      id: "hfjv",
      name: "High-Frequency Jet Ventilation",
      abbr: "HFJV",
      category: "Invasive",
      controlVariable: "Pressure",
      breathType: "Jet pulses + entrainment",
      trigger: "Time (jet driver)",
      limit: "Jet driving pressure",
      cycle: "Time (rate 100–150/min)",
      tagline: "Small high-velocity jets through a narrow cannula entrain humidified gas — peak airway pressure stays low with minimal tidal excursion.",
      description: [
        "A 14–16G cannula (or specialized ETT adapter) delivers pulsed jets at 100–150/min from a high-pressure source; each jet entrains 2–4× its volume of ambient/humidified gas (Bernoulli entrainment), producing effective alveolar ventilation at very low peak pressures.",
        "Expiration is passive — gas escapes around the jet during pauses; intrinsic PEEP is deliberately low, making it ideal where airway leaks or low pressures are mandatory.",
        "Classical niches: laryngeal/tracheal surgery (shared airway, immobile field), large bronchopleural fistula, tracheal rupture, and some severe ARDS rescue strategies (in combination with conventional breaths)."
      ],
      equationSide: "Driving pressure + rate govern delivered volume; measured Paw only approximates alveolar events.",
      settings: [
        { parameter: "Rate", typicalValue: "100–150 /min", note: "Higher rate = lower VT per pulse" },
        { parameter: "Driving pressure", typicalValue: "10–40 psi", note: "Titrate to chest movement + gas exchange" },
        { parameter: "Inspiration time", typicalValue: "30–40%", note: "Duty cycle of the jet" },
        { parameter: "PEEP / humified flow", typicalValue: "5–10 / 8–20 L/min", note: "Supplied through the side port" },
        { parameter: "Monitoring", typicalValue: "Continuous PaCO2 + Paw", note: "TcCO2/ABG mandatory — ETCO2 unreliable with jets" }
      ],
      initialAdult: "Rate 120 · PIP ≤ 30 target · humidified flow 15 L/min",
      indications: [
        "Airway surgery requiring an immobile field",
        "Large bronchopleural or tracheo-oesophageal fistula",
        "Tracheal rupture / iatrogenic airway injury"
      ],
      advantages: ["Very low peak + mean pressure", "Ventilation despite large leaks", "Motionless surgical field"],
      disadvantages: [
        "Special hardware + expertise (cannula, humidification, monitoring)",
        "Mucosal drying/injury if humidification fails — catastrophic airway necrosis risk",
        "Passive expiration → stacking risk if expiratory time short"
      ],
      pearlPoints: [
        "Never run HFJV without active humidification of the entrained gas — dry high-velocity jets destroy airway mucosa within hours."
      ]
    },
    {
      id: "smartcare",
      name: "Closed-Loop Automated Ventilation & Weaning",
      abbr: "SmartCare / INTELLiVENT-ASV",
      category: "Hybrid",
      controlVariable: "Hybrid",
      breathType: "Adaptive (PSV-based)",
      trigger: "Patient / automatic",
      limit: "Auto-adjusted pressure support",
      cycle: "Flow (PSV) — automatic",
      tagline: "Knowledge-based controllers that titrate pressure support (and PEEP/FiO2 on INTELLiVENT) to hold the patient in a physiological 'comfort zone' — an automated weaning brain.",
      description: [
        "SmartCare/PSV (Dräger) classifies the patient each breath cycle into zones — comfortable, respiratory-depressed, dyspnoeic (too much work), or severe distress — using RR, VT, and end-tidal CO2. In the comfort zone it steps pressure support down automatically, running an integrated SBT at minimal support and recommending extubation-readiness.",
        "INTELLiVENT-ASV (Hamilton) adds automatic PEEP and FiO2 titration against SpO2 and etCO2 targets, effectively automating all four main dials of ventilation.",
        "Trials (e.g., Strøm 2010, 2014) show reduced time-to-extubation and less clinician workload without increased reintubation — but the clinician remains responsible for eligibility screening and safety supervision."
      ],
      equationSide: "The controller manipulates both sides — the clinician supervises and defines the target zone.",
      settings: [
        { parameter: "Patient zone inputs", typicalValue: "IBW, ETT size/leak", note: "Defines normal RR/VT boundaries" },
        { parameter: "Automatic adjustment", typicalValue: "± 2 cmH2O steps", note: "PS stepped to keep comfort zone" },
        { parameter: "SBT level", typicalValue: "PS 5–8 cmH2O", note: "Controller initiates automatically" },
        { parameter: "Safety interlocks", typicalValue: "Apnoea backup, alarms", note: "Reverts to controlled ventilation if criteria fail" }
      ],
      initialAdult: "Enter IBW + ETT details → controller starts at moderate PS and titrates",
      indications: [
        "Protocolized weaning when staffing cannot deliver frequent SBTs",
        "Standardized, reproducible weaning in general ICUs"
      ],
      advantages: ["Faster, consistent extubation decisions", "Continuous — never forgets to reassess", "Reduced ventilation duration in trials"],
      disadvantages: [
        "Cannot judge readiness factors outside its inputs (secretions, mental status, airway oedema)",
        "Requires correct ETT/IBW data — garbage in, garbage out",
        "Not for unstable, deeply sedated, or complex ARDS patients"
      ],
      waveformData: "PSV",
      pearlPoints: [
        "The controller can only optimize what it measures — the clinician must still own extubation criteria like cough, secretions, and airway protection."
      ]
    },
    {
      id: "vg",
      name: "Volume Guarantee (Neonatal)",
      abbr: "VG",
      category: "Invasive",
      controlVariable: "Hybrid",
      breathType: "Pressure-limited, volume-targeted",
      trigger: "Patient/time",
      limit: "PIP cap (set maximum)",
      cycle: "Flow / time — per base mode",
      tagline: "The neonatal dual-control mode: breaths are pressure-limited but inspiratory pressure is servo-adjusted breath-to-breath to deliver a set target VT.",
      description: [
        "Neonatal lungs are uniquely vulnerable to volutrauma (VLBW surfactant deficiency) yet classic VCV was harsh at tiny volumes. VG (on Babylog and modern neonatal platforms) couples pressure-controlled breaths with an exhaled-volume feedback loop: each breath's PIP is adjusted (within a set PIPmax) to achieve the target VT.",
        "Typical targets in neonates: 4–6 mL/kg for RDS. The leak-compensation uses exhaled volume, so cuff leaks (uncuffed neonatal ETTs commonly leak) are handled gracefully up to ~40% leak.",
        "Result: volume protection with the gentle pressure rise of PCV — now standard of care on modern neonatal ventilators."
      ],
      equationSide: "Dual control at micro-scale: pressure delivery, volume target, PIP ceiling.",
      settings: [
        { parameter: "Target VT", typicalValue: "4–6 mL/kg", note: "Exhaled, leak-compensated" },
        { parameter: "PIPmax", typicalValue: "Set 5–10 above working PIP", note: "Safety ceiling — alarm if reached" },
        { parameter: "Rise time", typicalValue: "0.05–0.2 s", note: "Gentle for neonatal time constants" },
        { parameter: "Trigger", typicalValue: "Flow-trigger nCPAP/vent", note: "Most sensitive tolerated — neonates trigger weakly" }
      ],
      initialAdult: "Not an adult mode (neonatal/paediatric platforms only)",
      indications: ["Neonatal RDS / prematurity", "Neonatal ventilation needing volume protection", "Bronchopulmonary dysplasia risk reduction"],
      advantages: ["Stable VT despite changing compliance (surfactant, growth)", "Lower PIP than fixed PCV in recovering lungs", "Leak-tolerant volume targeting"],
      disadvantages: ["Only on neonatal platforms", "Wrong PIPmax ceiling can silently cap delivery", "Requires accurate flow sensor at tiny flows"],
      pearlPoints: [
        "A rising working PIP at constant settings means worsening mechanics (or kinked ETT) — treat the cause, not the alarm ceiling."
      ]
    },
    {
      id: "pc-irv",
      name: "Pressure-Controlled Inverse-Ratio Ventilation",
      abbr: "PC-IRV",
      category: "Invasive",
      controlVariable: "Pressure",
      breathType: "Mandatory (pressure, inverted I:E)",
      trigger: "Time (usually)",
      limit: "Pressure (set PIP)",
      cycle: "Time (Ti > Te)",
      tagline: "Deliberately inverted I:E (1.5:1 to 4:1) raising mean airway pressure to recruit alveoli — oxygenation bought with sedation, paralysis, and hypercapnia tolerance.",
      description: [
        "Inverting the ratio lengthens inspiration and shortens expiration. Longer Ti raises mean airway pressure (oxygenation driver) without raising PIP; short Te deliberately leaves insufficient emptying time, creating intrinsic PEEP — historically framed as 'auto-PEEP as a recruitment tool'.",
        "The short expiratory time also causes gas trapping and CO2 retention (permissive hypercapnia mandatory), and the unnatural timing means patients almost always require deep sedation ± neuromuscular blockade.",
        "Modern ARDS practice has largely replaced IRV with PEEP titration, prone positioning, and APRV — but it remains a recognized rescue maneuver for refractory hypoxaemia when other tools are exhausted or unavailable."
      ],
      equationSide: "Pressure preset with an aggressive time-structure — mean pressure is the therapeutic lever.",
      settings: [
        { parameter: "I:E ratio", typicalValue: "1.5:1 → 4:1 (inverse)", note: "Step gradually; watch haemodynamics" },
        { parameter: "PIP", typicalValue: "≤ 30–35 cmH2O plateau-equivalent", note: "PC limit; driving pressure still matters" },
        { parameter: "Set PEEP", typicalValue: "Low (5) — auto-PEEP adds", note: "Total PEEP = set + intrinsic; measure with occlusion" },
        { parameter: "Sedation", typicalValue: "Deep ± paralysis", note: "Near-universal requirement" },
        { parameter: "Monitoring", typicalValue: "Total PEEP + blood gases", note: "Gas trapping quantification is essential" }
      ],
      initialAdult: "PIP 25–30 · I:E 2:1 · rate 10–14 · FiO2 100 → wean",
      indications: [
        "Refractory hypoxaemia rescue (PEEP/apnea approaches exhausted)",
        "Severe oxygenation failure when prone/ECMO unavailable"
      ],
      advantages: ["Raises mPaw without raising PIP", "Recruitment with sustained inspiratory pressure"],
      disadvantages: [
        "Gas trapping + haemodynamic compromise (↑ intrathoracic pressure → ↓ venous return)",
        "Deep sedation/paralysis required — ICU delirium risk",
        "No outcome benefit demonstrated vs conventional ARDS ventilation"
      ],
      pearlPoints: [
        "Measure total PEEP (expiratory hold) before AND after inverting — the intrinsic component is the real recruitment pressure, and it is invisible on the set-PEEP display."
      ]
    }
  ];
  function getMode(id) {
    return VENT_MODES.find((m) => m.id === id);
  }

  // src/lib/ventilator/scenarios.ts
  var PATIENT_SCENARIOS = [
    {
      id: "ards",
      name: "ARDS (Acute Respiratory Distress Syndrome)",
      category: "Respiratory failure",
      emoji: "\uD83E\uDEC1",
      summary: "Acute, diffuse inflammatory lung injury → non-cardiogenic pulmonary oedema, stiff lungs (low compliance), refractory hypoxaemia with bilateral infiltrates.",
      pathophysiology: [
        "Diffuse alveolar damage increases elastance (lowers compliance) — typical Cstat 20–40 mL/cmH2O.",
        "The PV loop flattens (higher pressure for same volume); ventilating above the upper inflection point causes overdistention — a 'beaked' PV loop.",
        "Lung volume is 'baby lung': a small healthy aerated zone that must be protected from both overdistention (volutrauma) and recruitment/derecruitment cycling (atelectrauma)."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Volume control with guaranteed lung-protective VT (4–6 mL/kg IBW) and measurable Pplat / driving pressure. PC or PRVC are acceptable alternatives as long as VT targets are met.",
      alternativeModes: [
        { id: "pc-ac", note: "Pressure control with VT monitoring — equivalent when titrated to 6 mL/kg IBW" },
        { id: "prvc", note: "Self-adapting dual control; watch for silent pressure creep" },
        { id: "aprv", note: "Rescue option in refractory hypoxaemia with spontaneous effort" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "VC-AC (lung-protective)" },
        { parameter: "Tidal volume", value: "4–6 mL/kg IBW (start 6, reduce to 4 if needed)" },
        { parameter: "Rate", value: "20–30/min (watch pH — allow permissive hypercapnia pH ≥ 7.20)" },
        { parameter: "PEEP", value: "ARDSNet table (start 8–10, titrate 5–20+)" },
        { parameter: "FiO2", value: "Target SpO2 88–95% / PaO2 55–80 mmHg" },
        { parameter: "Pplat", value: "< 30 cmH2O (inspiratory pause)" },
        { parameter: "Driving pressure (Pplat−PEEP)", value: "< 15 cmH2O — strongest mortality-linked metric" }
      ],
      targets: [
        "SpO2 88–95%, PaO2 55–80 mmHg, PaCO2 permissive (pH ≥ 7.20)",
        "Pplat < 30 cmH2O, driving pressure < 15 cmH2O",
        "Cstat ≥ 40 mL/cmH2O as lung recovers",
        "P/F ratio improvement (Berlin: mild 200–300, moderate 100–200, severe < 100)"
      ],
      pitfalls: [
        "VT set on ACTUAL body weight in obese/short patients → inadvertent volutrauma",
        "High PEEP without assessing recruitment can overdistend the compliant baby lung",
        "Ignoring driving pressure — normal Pplat + tiny VT can still mean injurious ΔP if compliance is very low",
        "Stress index > 1.1 (upward convexity of pressure scalar) signals hyperinflation"
      ],
      monitoring: [
        "Pplat & driving pressure every shift and after every change",
        "PV loop shape: flattening late inspiration (beaking) = overdistention → reduce VT or PEEP",
        "Stress index on constant-flow VC (target 0.9–1.1)",
        "Consider prone positioning ≥ 16 h if P/F < 150 despite optimization"
      ],
      evidence: "ARDSNet ARMA 2000: 6 vs 12 mL/kg IBW → 22% relative mortality reduction. ALVEOLI 2004: high vs low PEEP — no overall mortality benefit, higher PEEP favoured in moderate-severe ARDS. ART 2017: individualized recruitment maneuvers harmful. Driving pressure (Amato 2015 NEJM) outperformed VT and Pplat as outcome predictor."
    },
    {
      id: "copd",
      name: "COPD Exacerbation (Hypercapnic Failure)",
      category: "Airway obstruction",
      emoji: "\uD83D\uDCA8",
      summary: "Chronic airflow limitation with expiratory flow obstruction → air trapping, dynamic hyperinflation, intrinsic PEEP, increased work of triggering, CO2 retention.",
      pathophysiology: [
        "High airway resistance lengthens the expiratory time constant (τ = R × C, often > 0.8 s) — full exhalation may be impossible at normal rates.",
        "Incomplete emptying leaves positive alveolar pressure at end-expiration = auto-PEEP (intrinsic PEEP) → dynamic hyperinflation → the next breath stacks on trapped volume.",
        "Auto-PEEP imposes a triggering load: patient effort must first overcome intrinsic PEEP before the trigger senses it → ineffective triggering (the commonest asynchrony).",
        "Flow–time scalar: expiratory flow fails to return to zero before the next breath; end-expiratory occlusion reveals total PEEP."
      ],
      primaryMode: "bipap-niv",
      primaryModeNote: "NIV (BiPAP) is first-line for COPD exacerbation with pH 7.25–7.35 — reduces intubation and mortality. EPAP counteracts intrinsic PEEP and eases triggering.",
      alternativeModes: [
        { id: "vc-ac", note: "If intubated: low RR 8–12, long Te (I:E 1:3–1:4), VT 6–8 mL/kg IBW" },
        { id: "psv", note: "Weaning-friendly; raise flow-cycle to 40–50% to shorten Ti and avoid air trapping" },
        { id: "prvc", note: "Acceptable; ensure expiratory time stays long" }
      ],
      initialSettings: [
        { parameter: "First line", value: "NIV: IPAP 10–15 (↑ to 20 for CO2), EPAP 4–6" },
        { parameter: "If intubated — rate", value: "8–12/min (LOW — prioritize expiratory time)" },
        { parameter: "Tidal volume", value: "6–8 mL/kg IBW (smaller if trapping)" },
        { parameter: "I:E", value: "1:3 to 1:4 (long expiration)" },
        { parameter: "PEEP (external)", value: "< 50–80% of measured intrinsic PEEP (often 5–8)" },
        { parameter: "FiO2", value: "Target SpO2 88–92% (avoid hyperoxia → CO2 retention)" }
      ],
      targets: [
        "SpO2 88–92%; pH ≥ 7.35 with falling PaCO2 toward baseline",
        "Auto-PEEP minimized: expiratory flow reaching (or near) zero before next breath",
        "NIV: RR falling, pH rising within 1–2 h — else escalate"
      ],
      pitfalls: [
        "Setting external PEEP HIGHER than intrinsic PEEP → more hyperinflation and hypotension",
        "Rushing the rate to 'normalize' PaCO2 — permissive hypercapnia is safer than breath stacking",
        "Short expiratory time → dynamic hyperinflation → auto-PEEP → hypotension + barotrauma + ineffective triggering",
        "In PSV with default 25% cycle: slow flow decay prolongs Ti → air trapping — raise cycle criterion"
      ],
      monitoring: [
        "Flow–time scalar for expiratory flow reaching zero; end-expiratory hold to measure total PEEP",
        "Haemodynamics: hyperinflation reduces venous return (check for hypotension, pulsus paradoxus)",
        "Triggering efficiency — ineffective efforts visible as pressure dips without delivered breaths"
      ],
      evidence: "Brochard 1995 NEJM & Kramer 1995: NIV in COPD exacerbation reduces intubation, length of stay and mortality. External PEEP ~80% of intrinsic PEEP reduces triggering work without increasing hyperinflation (Appendini 1994)."
    },
    {
      id: "asthma",
      name: "Acute Severe Asthma (Status Asthmaticus)",
      category: "Airway obstruction",
      emoji: "\uD83C\uDF2A️",
      summary: "Severe bronchospasm + mucus plugging → very high airway resistance, critical hyperinflation risk, and life-threatening breath stacking on the ventilator.",
      pathophysiology: [
        "Markedly raised resistance → expiratory time constants > 1 s; even 6–8 s of expiration cannot fully empty the lung.",
        "Dynamic hyperinflation is the KEY danger: each stacked breath raises end-expiratory lung volume, compresses the heart (obstructive shock) and risks barotrauma.",
        "Flow–volume loop shows the classic peripheral obstruction pattern: low PEF, concave-down expiratory limb, flow not reaching zero.",
        "The priority is not gas exchange — it is buying expiratory TIME and minimizing minute ventilation."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Volume control guarantees a small, safe VT and makes hyperinflation visible via Pplat; paralysis + deep sedation usually required early.",
      alternativeModes: [
        { id: "pc-ac", note: "Pressure modes acceptable if VT monitored breath-to-breath" },
        { id: "psv", note: "Only in recovery; slow flow decay → prolonged Ti → trapping" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "VC-AC, paralyzed/sedated" },
        { parameter: "Rate", value: "6–10 /min (deliberately slow)" },
        { parameter: "Tidal volume", value: "6–8 mL/kg IBW" },
        { parameter: "I:E", value: "1:4 to 1:6 (long, long expiration)" },
        { parameter: "PEEP", value: "0–5 (often zero — avoid adding to hyperinflation)" },
        { parameter: "Pplat", value: "< 30 (ideally < 25); check end-inspiratory hold" },
        { parameter: "FiO2", value: "Usually 100% initially, wean to SpO2 > 92%" }
      ],
      targets: [
        "Permissive hypercapnia: pH ≥ 7.10–7.20 tolerated (PaCO2 may climb high)",
        "Pplat < 25–30 cmH2O; inspiratory hold at end-expiration to track auto-PEEP",
        "Haemodynamic stability (no tamponade physiology from hyperinflation)"
      ],
      pitfalls: [
        "'Normalized' blood gases with high rates → catastrophic breath stacking and tension pneumothorax",
        "Aggressive bronchodilator loading without watching tachycardia/hypokalaemia",
        "Missing pneumothorax/muco-plugging when PIP suddenly rises or lung unilateral silence — think DISASTER: Displacement, Obstruction, Pneumothorax, Equipment failure",
        "Rushing extubation before bronchospasm resolves"
      ],
      monitoring: [
        "Serial Pplat and end-expiratory hold (auto-PEEP) every 1–2 h",
        "Flow–time scalar: expiratory flow must approach zero; if not → drop rate",
        "Dynamic hyperinflation signs: hypotension, auto-PEEP rise, rising Pplat at same settings"
      ],
      evidence: "Consensus/anecdote-driven: permissive hypercapnia accepted since Darioli & Perret 1984 (zero mortality series). Lung-protective low-rate strategy standard in guidelines (BTS/SIGN, GINA)."
    },
    {
      id: "tbi",
      name: "Traumatic Brain Injury / Raised ICP",
      category: "Neurocritical",
      emoji: "\uD83E\uDDE0",
      summary: "Ventilation must protect the injured brain: avoid hypoxia, hypotension, and deranged CO2 (cerebral blood flow coupling) while keeping airway pressures from impairing venous return.",
      pathophysiology: [
        "PaCO2 is the fastest cerebral blood flow lever: hypercapnia dilates vessels → ↑ cerebral blood volume → ↑ ICP; aggressive hyperventilation causes cerebral ischaemia.",
        "High intrathoracic pressure (high PEEP/PIP) impedes cerebral venous return → ↑ ICP; hypoxaemia and hypotension are secondary brain insults.",
        "Target normocapnia (PaCO2 35–40 mmHg) after the first hours; transient mild hyperventilation (30–35) ONLY for herniation signs while definitive therapy is prepared."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Volume control gives precise, guaranteed minute ventilation — the fastest way to lock PaCO2 at target, plus Pplat visibility.",
      alternativeModes: [
        { id: "pc-ac", note: "Equivalent if VT is monitored; pressure capped" },
        { id: "prvc", note: "Acceptable; ensure volume target stable" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "VC-AC" },
        { parameter: "Tidal volume", value: "6–8 mL/kg IBW" },
        { parameter: "Rate", value: "Titrate to PaCO2 35–40 mmHg (ETCO2 ≈ 33–38)" },
        { parameter: "PEEP", value: "5 (cautious ↑ only if oxygenation requires; watch ICP/CPP)" },
        { parameter: "FiO2", value: "PaO2 ≥ 80 mmHg / SpO2 ≥ 94%" },
        { parameter: "Avoid", value: "Hyper-/hypoventilation, PEEP > Pplat/ICP conflict, coughing/straining" }
      ],
      targets: [
        "PaO2 80–120 mmHg · PaCO2 35–40 mmHg",
        "CPP 60–70 mmHg (MAP − ICP)",
        "SpO2 ≥ 94% at all times; avoid hypotension SBP < 100–110"
      ],
      pitfalls: [
        "Routine prophylactic hyperventilation (PaCO2 < 30) beyond the first 24 h → cerebral ischaemia",
        "Stacking high PEEP on poor lung compliance in TBI: use Pplat/ICP trade-off, consider recruitment positioning instead",
        "Patient–ventilator asynchrony (bucking) surges ICP — deepen sedation/paralyse early",
        "ETT suctioning without pre-oxygenation → ICP spikes"
      ],
      monitoring: [
        "ETCO2 trend + ABG correlation q2–6h; ICP/CPP if monitored",
        "Cough/suction-induced ICP spikes; keep sedation adequate"
      ],
      evidence: "Brain Trauma Foundation 4th ed: avoid prophylactic severe hyperventilation (PaCO2 ≤ 25) first 24 h; brief hyperventilation as temporizing measure in herniation. SBP < 100–110 strongly associated with worse outcome."
    },
    {
      id: "cpe",
      name: "Cardiogenic Pulmonary Oedema / Acute Heart Failure",
      category: "Cardiac",
      emoji: "❤️",
      summary: "Failing left ventricle → hydrostatic pulmonary oedema, hypoxaemia, high WOB with fatiguing muscles. Positive pressure is both respiratory AND haemodynamic therapy.",
      pathophysiology: [
        "CPAP/BiLevel raises intrathoracic pressure → reduces venous return (preload) and LV afterload → improved oxygenation AND cardiac output in the distended ventricle.",
        "Alveolar oedema floods low V/Q units; positive pressure recruits and re-distributes oedema fluid.",
        "Most patients have high cardiac output demand with sympathetic drive — support early, avoid prolonged intubation."
      ],
      primaryMode: "cpap",
      primaryModeNote: "CPAP 5–10 cmH2O is first-line NIV for pure pulmonary oedema (excellent RCT evidence). BiPAP if hypercapnia coexists — the CO2-retaining fatiguing patient.",
      alternativeModes: [
        { id: "bipap-niv", note: "Add IPAP when CO2 rises / respiratory fatigue (pH < 7.35)" },
        { id: "psv", note: "If intubated: PS 8–15, PEEP 5–10 — afterload-friendly, rapid SBT once oedema resolves" },
        { id: "vc-ac", note: "If exhausted/apnoeic — watch haemodynamics of high intrathoracic pressure" }
      ],
      initialSettings: [
        { parameter: "First line", value: "CPAP 5–10 cmH2O (start 7.5)" },
        { parameter: "If hypercapnic", value: "BiPAP IPAP 10–15 / EPAP 5–8" },
        { parameter: "If intubated", value: "PSV: PS 8–12 · PEEP 5–10 · FiO2 to SpO2 ≥ 94%" },
        { parameter: "Medical", value: "Nitrates/diuretics concurrently — the ventilator buys time" }
      ],
      targets: [
        "SpO2 ≥ 94%, resolution of dyspnoea, RR < 25",
        "Haemodynamic stability (MAP adequate; positive pressure may unmask hypovolaemia after diuresis)"
      ],
      pitfalls: [
        "Delayed intubation in deteriorating patients (NIV failure: persisting RR > 30, pH ↓, encephalopathy)",
        "Hypotension after intubation in a preload-dependent (diuresed) patient",
        "Missing acute MI as the driver — ECG/troponin everyone"
      ],
      monitoring: [
        "RR, pH, lactate trajectory over first 1–2 h of NIV",
        "Pre/post-extubation fluid balance; BNP/troponin trend"
      ],
      evidence: "Gray 2008 Lancet (3CPO trial): CPAP vs BiPAP vs standard O2 — no mortality difference but faster symptom/physiology improvement with NIV; both safe. CPAP reduces intubation vs standard care."
    },
    {
      id: "neuromuscular",
      name: "Neuromuscular Respiratory Failure (GBS / MG / ALS)",
      category: "Special populations",
      emoji: "\uD83E\uDDA0",
      summary: "Lungs are normal — the pump is failing. Ventilation is straightforward; the art is timing intubation, avoiding atrophy from over-assistance, and planning tracheostomy/prolonged support.",
      pathophysiology: [
        "Progressive inspiratory muscle weakness → shallow rapid breathing, ineffective cough, type 2 failure with NORMAL lung compliance.",
        "Compliance normal or reduced slightly by basal atelectasis (weak sigh breaths); resistance normal.",
        "Auto-PEEP and asynchrony are rare; the risks are aspiration, secretion retention and delayed recognition of deterioration (falling VC, rising CO2, weak cough)."
      ],
      primaryMode: "psv",
      primaryModeNote: "Once stabilized, PSV matches fluctuating strength; intubate early when VC < 15 mL/kg, NIF < −25 cmH2O, or CO2 rises. Avoid intubating in extremis.",
      alternativeModes: [
        { id: "bipap-niv", note: "Selected chronic (ALS/kyphoscoliosis) patients — nocturnal NIV" },
        { id: "vc-ac", note: "Initial full rest in weak phase; normal compliance → low pressures" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "PSV (or VC-AC initially)" },
        { parameter: "VT / PS", value: "VT 6–8 mL/kg IBW, PS to achieve it gently" },
        { parameter: "PEEP", value: "5 (prevents basal atelectasis)" },
        { parameter: "Rate", value: "Backup 12–16 (drive may be blunted)" },
        { parameter: "Cough", value: "Manually assisted / mechanical in-exsufflation when VC < 15 mL/kg" }
      ],
      targets: [
        "Normocapnia, SpO2 ≥ 94%, secretion clearance maintained",
        "Serial VC, NIF, cough peak flow to time extubation / tracheostomy"
      ],
      pitfalls: [
        "Waiting for hypercapnia — by then decompensation is imminent (20/30/40 rule: intubate when VC < 20, NIF > −30, PImax < 40)",
        "Over-assistance accelerating disuse atrophy in a slowly reversible disease",
        "Extubating without cough peak flow > 160 L/min (in neuromuscular disease)"
      ],
      monitoring: [
        "Serial VC supine + upright, NIF, SNIP, cough peak flow",
        "Nocturnal hypoventilation symptoms (morning headache, daytime somnolence)"
      ],
      evidence: "GBS: 20/30/40 rule correlates with intubation need ( Lawn 2001 ). MG: worsened by over-assistance;lung-protective VT unnecessary (normal compliance) — focus on strength trajectory and cough."
    },
    {
      id: "postop",
      name: "Routine Post-Operative Ventilation",
      category: "Peri-operative",
      emoji: "\uD83C\uDFE5",
      summary: "Short-term support after major surgery/anæsthesia: residual sedation, atelectasis, mild secretions — plan extubation within hours.",
      pathophysiology: [
        "General anaesthesia reduces FRC → dependent atelectasis and shunt; residual opioid/sedative blunts drive.",
        "Most patients recover drive within 0.5–4 h — the task is supporting the transition, then an SBT.",
        "Obesity/upper-abdominal/thoracic surgery magnify atelectasis: higher PEEP + recruitment improve oxygenation."
      ],
      primaryMode: "psv",
      primaryModeNote: "Light support (PS 8–12 over PEEP 5) as anaesthesia wears off, then an SBT (PS 5–8) and extubate — fastest pathway.",
      alternativeModes: [
        { id: "simv", note: "Traditional stepdown; slower weaning than daily SBTs" },
        { id: "vc-ac", note: "Deeply sedated/paralyzed patients early post-op" },
        { id: "cpap", note: "Post-extubation hypoxaemia in high-risk (obese, thoracic) patients" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "PSV / SIMV+PS" },
        { parameter: "PS", value: "8–12 cmH2O (wean by 2 q30min as awake)" },
        { parameter: "PEEP", value: "5–8 (10 in obese)" },
        { parameter: "VT", value: "6–8 mL/kg IBW" },
        { parameter: "FiO2", value: "↓ toward 40% as SpO2 allows (> 92–94%)" }
      ],
      targets: [
        "Awake, following commands, hemodynamically stable, afebrile",
        "SBT passed: RSBI < 105, SpO2 > 92% on ≤ 40% O2, PS minimal"
      ],
      pitfalls: [
        "Leaving patients on heavy support overnight 'for comfort' — every unnecessary day adds VAP risk",
        "Extubating with residual neuromuscular blockade (TOF < 0.9)",
        "Missing post-op delirium/agitation as an extubation-failure predictor"
      ],
      monitoring: [
        "Train-of-four if rocuronium used; sedation scores (RASS)",
        "Temperature, lactate, drain output before extubation decisions"
      ],
      evidence: "Esteban 1995: daily SBT + immediate extubation outperforms gradual SIMV weaning. Randomized data favour protocolized extubation-early pathways."
    },
    {
      id: "obesity",
      name: "Obesity / Obesity-Hypoventilation Syndrome",
      category: "Special populations",
      emoji: "⚖️",
      summary: "Chest wall mass + abdominal pressure → low FRC, atelectasis, hypoxaemia prone; ALWAYS calculate settings from IBW, NEVER actual weight.",
      pathophysiology: [
        "Expiratory reserve volume collapses when supine → breathing near RV, closed dependent airways, shunt.",
        "Compliance of the respiratory system falls (chest wall component) with relatively preserved lung compliance; airway resistance mildly up.",
        "Hypercapnia in OHS from blunted central drive + load — NIV is the therapy."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "When intubated: VC with IBW-based VT, higher PEEP (10–15) to hold the recruited lung, reverse Trendelenburg positioning.",
      alternativeModes: [
        { id: "bipap-niv", note: "OHS/OSA long-term nocturnal therapy; also post-extubation" },
        { id: "prvc", note: "Comfortable with volume guarantee" },
        { id: "cpap", note: "Pure OSA without nocturnal hypoventilation" }
      ],
      initialSettings: [
        { parameter: "Tidal volume", value: "6–8 mL/kg IBW (height-based, NOT actual weight)" },
        { parameter: "PEEP", value: "10–15 with recruitment manoeuvre as needed" },
        { parameter: "Position", value: "Reverse Trendelenburg 25–45° — mechanically advantageous" },
        { parameter: "Rate", value: "14–20 (mildly higher: low FRC)" },
        { parameter: "FiO2", value: "Titrate; expect higher need supine" }
      ],
      targets: [
        "SpO2 ≥ 92–96%, normocapnia (avoid permissive hypercapnia unless intended)",
        "Extubate UPRIGHT, ideally to NIV prophylaxis in OHS"
      ],
      pitfalls: [
        "VT calculated from actual weight → massive volutrauma (a 160 kg patient may need the same 420 mL as a 70 kg one)",
        "Standard PEEP 5 → persistent shunt from collapsed bases",
        "Extubating flat and unassisted — high reintubation; use planned NIV/HFNC"
      ],
      monitoring: [
        "Pplat/ΔP (chest-wall stiffness raises Pplat without lung overdistension — interpret with care)",
        "Serial ABG overnight (nocturnal hypoventilation)"
      ],
      evidence: "De Oliveira 2009: BMI-appropriate (IBW) VT 6–8 + PEEP 10 vs 5 → better oxygenation/post-op outcomes. Prophylactic NIV after extubation in obesity reduces reintubation (kindly see JAMA review)."
    },
    {
      id: "pregnancy",
      name: "Pregnancy & Peripartum Ventilation",
      category: "Special populations",
      emoji: "\uD83E\uDD30",
      summary: "Physiological anaemia of pregnancy + raised diaphragm + 30–40% ↑ minute ventilation: treat for TWO — keep PaCO2 ~28–32, avoid supine aortocaval compression and alkalosis that harms fetal CO2 transfer.",
      pathophysiology: [
        "Chronic respiratory alkalosis of pregnancy (PaCO2 ~27–32) — 'normal' PaCO2 40 in pregnancy is actually hypercapnia for the fetus.",
        "FRC falls ~20% supine term → rapid desaturation; higher O2 consumption accelerates it.",
        "Over-ventilation (hypocapnia) reduces uteroplacental flow; hypotension from high intrathoracic pressure does too."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Guaranteed minute ventilation for a target PaCO2 28–32 mmHg with lung-protective IBW-based VT (IBW from pre-pregnancy height).",
      alternativeModes: [
        { id: "pc-ac", note: "Equivalent with VT monitoring" },
        { id: "psv", note: "Recovery phase" }
      ],
      initialSettings: [
        { parameter: "Tidal volume", value: "6–8 mL/kg IBW (smaller FRC — avoid high Pplat)" },
        { parameter: "Rate", value: "16–24 (faster to reach low-normal PaCO2 28–32)" },
        { parameter: "PEEP", value: "5–8 — oxygenation protection, watch preload" },
        { parameter: "Position", value: "Left lateral tilt ≥ 30° (relieve IVC compression)" },
        { parameter: "FiO2", value: "Keep maternal SpO2 ≥ 95% (fetal PaO2 depends on it)" }
      ],
      targets: [
        "PaCO2 28–32 mmHg · maternal SpO2 ≥ 95%",
        "Avoid hypotension; maintain left-tilt; continuous fetal monitoring when viable"
      ],
      pitfalls: [
        "Permissive hypercapnia strategies (designed for ARDS) applied to pregnancy — fetal acidosis",
        "Supine ventilation without tilt — aortocaval compression masquerading as 'ARDS'",
        "Desaturation during intubation is RAPID (low FRC, high O2 consumption) — pre-oxygenate fully"
      ],
      monitoring: [
        "ABG q2–4h until stable; ETCO2 approximation only (gradient larger in pregnancy)",
        "Uterine contraction/foetal heart monitoring peri-extubation"
      ],
      evidence: "Physiological references: maternal PaCO2 27–32 sustains fetal CO2 gradient. No RCTs in pregnant ventilation — consensus/best-physiology practice (BTS/SMFM statements)."
    },
    {
      id: "pediatric",
      name: "Paediatric / Neonatal Ventilation",
      category: "Special populations",
      emoji: "\uD83D\uDC76",
      summary: "Small circuits, fast rates, pressure-mode preference: neonates/pædiatrics are ventilated by pressure with leak-friendly uncuffed tubes; per-kg thinking dominates.",
      pathophysiology: [
        "Neonatal alveoli number/gas exchange surface is reduced; FRC is maintained largely by high respiratory rate, not collateral ventilation.",
        "Chest wall compliance is very high with low recoil — collapses easily; PEEP is critical.",
        "Small ETT (often uncuffed) → leak; volume modes measure delivery unreliably → pressure modes with manual VT count dominate."
      ],
      primaryMode: "pc-ac",
      primaryModeNote: "Pressure control with rate appropriate for age (neonate 40–60, infant 30–40, child 20–30), PIP limited to ~ 15–25 with visible chest wiggle.",
      alternativeModes: [
        { id: "simv", note: "With PS as child breathes spontaneously" },
        { id: "psv", note: "Older children, weaning — same principles as adults" },
        { id: "hfnc", note: "Bronchiolitis support (high-flow first line before NIV)" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "PC or PRVC" },
        { parameter: "PIP", value: "Neonate 15–20 · infant 18–22 · child 20–25 cmH2O" },
        { parameter: "PEEP", value: "4–6 (neonate 5–7 for lung protection)" },
        { parameter: "Rate", value: "Neonate 40–60 · infant 30–40 · child 20–30 /min" },
        { parameter: "Ti", value: "0.3–0.5 (neonate) up to 0.6–0.8 (older child)" },
        { parameter: "SpO2 targets", value: "Preterm 90–95% (avoid hyperoxia/ROP); term 92–97%" }
      ],
      targets: [
        "Age-appropriate ETCO2 (permissive hypercapnia often OK in neonates: PaCO2 45–55)",
        "Chest rise 'wiggle' not 'heave'; per-saturation stability"
      ],
      pitfalls: [
        "Adult ETT sizing/depth formulas misapplied in emergencies",
        "Hyperoxia in preterm → retinopathy of prematurity",
        "Uncuffed tube leak making delivered-volume alarms useless — trust colour, motion, gas"
      ],
      monitoring: [
        "Continuous pre-ductal SpO2 (right hand) in neonates",
        "Blood gas from a site that reflects alveolar gas (arterialized capillary acceptable)"
      ],
      evidence: "Neonatal consensus (European Consensus Guidelines on RDS): PEEP 5–6 and PIP limited ventilation; paediatric ARDS PARDS guidelines mirror adult lung protection with per-kg VT (5–8 mL/kg)."
    },
    {
      id: "chest-trauma",
      name: "Chest Trauma / Flail Chest / Contusion",
      category: "Respiratory failure",
      emoji: "\uD83E\uDE79",
      summary: "Pain + unstable chest wall + pulmonary contusion → hypoventilation, V/Q mismatch, and progressive hypoxaemia. Analgesia is the primary 'ventilator'.",
      pathophysiology: [
        "Rib fractures splint ventilation → atelectasis and poor secretion clearance (especially elderly).",
        "Contused lung segment = regional ARDS-like stiff, haemorrhagic alveoli — compliance heterogeneity.",
        "Flail segment paradoxically moves; positive pressure internally splints it — CPAP/PSV particularly effective."
      ],
      primaryMode: "psv",
      primaryModeNote: "If support needed: PSV with PEEP 5–8 provides internal splinting with preserved cough. Epidural/regional analgesia first to spare opioids.",
      alternativeModes: [
        { id: "cpap", note: "Mild cases: CPAP 5–10 + epidural analgesia" },
        { id: "vc-ac", note: "Severe cases/paresthesia; watch air-leak signs (pneumothorax before PPV)" }
      ],
      initialSettings: [
        { parameter: "Analgesia", value: "Epidural/paravertebral/serratus block BEFORE escalation" },
        { parameter: "PS / PEEP", value: "PS 8–14 · PEEP 5–8" },
        { parameter: "VT", value: "6 mL/kg IBW (contused lung is fragile)" },
        { parameter: "FiO2", value: "Titrate SpO2 ≥ 92%" },
        { parameter: "Before PPV", value: "Chest tube if ANY pneumothorax — it will enlarge" }
      ],
      targets: [
        "Pain-controlled deep breathing (NRS ≤ 3), VC improving, SpO2 ≥ 92% on ≤ 50% O2",
        "No new pneumothorax on serial imaging"
      ],
      pitfalls: [
        "Opioid-only analgesia → somnolence-hypoventilation spiral",
        "Missing small pneumothorax before positive pressure → tension",
        "Overlooking aortic injury/haemothorax behind 'poor oxygenation'"
      ],
      monitoring: [
        "Serial CXR/bedside ultrasound for pneumothorax effusion",
        "Incentive spirometry volumes as a recovery trajectory"
      ],
      evidence: "ATLS: epidural analgesia superior for multiple rib fractures; CPAP with analgesia reduces intubation in flail chest vs intubation-only historic series."
    },
    {
      id: "inhalation",
      name: "Burns / Inhalation Injury / Carbon Monoxide",
      category: "Respiratory failure",
      emoji: "\uD83D\uDD25",
      summary: "Upper-airway oedema evolves over hours (intubate EARLY on suspicion), CO poisoning needs high FiO2, and smoke injury creates ARDS-prone lungs with heavy secretions.",
      pathophysiology: [
        "Heat + chemical irritants (HC1, aldehydes) injure airway mucosa → progressive oedema, hypersecretion, cast formation, small-airway obstruction.",
        "Systemic burn + inhalation injury = a 'double hit' ARDS model — lung compliance will fall over 48–72 h.",
        "CO poisoning: pulse oximetry reads SpO2 misleadingly normally (carboxy-Hb); O2 displaces CO from Hb (t½ ~ 74 min on 100% O2, ~20 min on hyperbaric)."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Early controlled intubation with a tube large enough for bronchoscopy (≥ 7.5 if airway burns), then lung-protective VC as ARDS develops.",
      alternativeModes: [
        { id: "hfnc", note: "NOT for suspected airway burns — oedema evolves; secure airway first" },
        { id: "prvc", note: "As mechanics evolve day-to-day" }
      ],
      initialSettings: [
        { parameter: "Timing", value: "Intubate EARLY if stridor, singed nasal hairs, carbonaceous sputum, facial burns" },
        { parameter: "ETT size", value: "≥ 7.5 (bronchoscopic toilet needed)" },
        { parameter: "Tidal volume", value: "6 mL/kg IBW (burn lung is fragile)" },
        { parameter: "PEEP", value: "5–10 (titrate; keeps oedematous airways open)" },
        { parameter: "FiO2", value: "100% initially (CO washout) then wean" },
        { parameter: "Toilet", value: "Regular bronchoscopy for casts/debris" }
      ],
      targets: [
        "SpO2 ≥ 92–94% (carboxyHb < 5–10% before weaning FiO2)",
        "Serial carboxyHb until < 5%",
        "Chest mechanics stabilized (PIP stable as oedema peaks day 2–3)"
      ],
      pitfalls: [
        "Waiting for stridor to worsen — the window closes FAST (oedema peaks 12–36 h)",
        "Trusting a normal-looking SpO2 in CO poisoning",
        "Fluid-timid resuscitation causing hypoperfusion, or fluid-excess drowning the inhalation-injured lung — both worsen lung mechanics"
      ],
      monitoring: [
        "Serial carboxyHb, frequent airway assessment (visualize cords)",
        "PIP trend as airway oedema evolves; bronchoscopy as needed"
      ],
      evidence: "ABA/ISBI practice guidelines: inhalation injury with > 30% TBSA burns doubles mortality; early lung-protective ventilation with airway toilet is standard."
    },
    {
      id: "sepsis",
      name: "Sepsis-Associated Respiratory Failure",
      category: "Respiratory failure",
      emoji: "\uD83E\uDDEB",
      summary: "Sepsis lung (mild ARDS spectrum) plus refractory shock: ventilation must protect the lung WITHOUT crushing the circulation — every cmH2O of mean pressure costs venous return.",
      pathophysiology: [
        "Inflammatory capillary leak → bilateral infiltrates with low-pressure pulmonary oedema (ARDS-spectrum).",
        "Septic vasodilation + positive intrathoracic pressure → perfusion fragility; mean airway pressure is a vasodilator antagonist.",
        "High WOB drives lactate; fully resting the muscles early (deep sedation ± paralysis first 48 h in moderate-severe ARDS) improves survival in P/F < 150."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Lung-protective VC (ARDSNet bundle) with shock-aware PEEP titration — balance oxygenation against MAP.",
      alternativeModes: [
        { id: "prvc", note: "Comfort + volume guarantee" },
        { id: "aprv", note: "Occasionally useful when oxygenation is hard and spontaneous breathing preserves venous return" },
        { id: "psv", note: "Recovery phase after shock resolves" }
      ],
      initialSettings: [
        { parameter: "Tidal volume", value: "6 mL/kg IBW (4–8 range)" },
        { parameter: "Rate", value: "20–30 (permissive hypercapnia pH ≥ 7.20 if needed)" },
        { parameter: "PEEP", value: "ARDSNet table but verify MAP/lactate tolerance at each step" },
        { parameter: "FiO2", value: "SpO2 88–95% goal" },
        { parameter: "Sedation", value: "Deep (RASS −4) ± cisatracurium 48 h if P/F < 150" }
      ],
      targets: [
        "SpO2 88–95%, pH ≥ 7.20, driving pressure < 15",
        "MAP ≥ 65 (vasopressors as needed), lactate clearing"
      ],
      pitfalls: [
        "PEEP escalation in a preload-dependent septic patient → pressure-dependent hypotension spiral",
        "Missing that 'refractory hypoxaemia' is actually septic cardiomyopathy (bedside echo!)",
        "Driving hyperventilation for lactatemia-induced acidosis — the CO2 will come as lactate clears; over-ventilation harms"
      ],
      monitoring: [
        "Driving pressure + MAP + lactate after each PEEP change (the 'triple check')",
        "Early bedside echocardiography for septic cardiomyopathy vs ARDS"
      ],
      evidence: "Papazian 2010 NEJM: 48 h cisatracurium in P/F < 150 improves survival/adjusted analysis. ARDSNet bundle standard; Surviving Sepsis Campaign endorses lung-protective ventilation from intubation."
    },
    {
      id: "post-rosc",
      name: "Post-Cardiac-Arrest (ROSC) Ventilation",
      category: "Cardiac",
      emoji: "\uD83D\uDC93",
      summary: "After ROSC: controlled normoxia (SpO2 94–98%) and normocapnia (PaCO2 35–45) — the injured brain has lost autoregulation, and both hyperoxia and hypoxia/hypocapnia worsen outcome.",
      pathophysiology: [
        "Anoxic–ischaemic brain injury loses CO2 reactivity in injured regions — PaCO2 extremes redistribute flow (steal).",
        "Hyperoxia (PaO2 > 300) after ROSC is associated with worse neurological outcome — titrate DOWN from 100% as soon as SpO2 allows.",
        "Post-arrest myocardial stunning mimics cardiogenic oedema — mild PEEP is usually beneficial."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Precise control of PaO2/PaCO2 from the first minute; sedation ± targeted temperature management makes VC the stable default.",
      alternativeModes: [
        { id: "prvc", note: "Equivalent comfort-adaptive" },
        { id: "psv", note: "After awakening/TTM complete, SBT pathway" }
      ],
      initialSettings: [
        { parameter: "FiO2", value: "Start 100% → titrate to SpO2 94–98% within the first hour (ABG at 30 min)" },
        { parameter: "Tidal volume", value: "6–8 mL/kg IBW" },
        { parameter: "Rate", value: "PaCO2 35–45 mmHg (normocapnia; ETCO2 ≈ 38–42)" },
        { parameter: "PEEP", value: "5–8" },
        { parameter: "Temperature", value: "TTM 36 °C (avoid fever ≥ 37.5)" }
      ],
      targets: [
        "SpO2 94–98% · PaO2 < 200 (ideally 80–120) · PaCO2 35–45",
        "MAP ≥ 65 (≥ 80–85 if chronic hypertension / neurological perfusion targets)",
        "No fever; seizure-free; EEG monitoring in comatose patients"
      ],
      pitfalls: [
        "Leaving FiO2 100% for hours — hyperoxic injury",
        "Aggressive hyperventilation (post-arrest brain loses autoregulation; hypocapnia causes cerebral vasoconstriction → ischaemia)",
        "Confounding: ETCO2 low because of low cardiac output, not low PaCO2 — check ABGs"
      ],
      monitoring: [
        "ABG at 30 min then q2–4h in the first 12 h; ETCO2 trend with cardiac output context",
        "Serial lactate, troponin, echocardiography for stunning"
      ],
      evidence: "Kilgannon 2010 (hyperoxia association worse outcome), ILCOR/ERC/AHA post-arrest care guidelines: normoxia-normocapnia strategy, TTM 36 °C."
    },
    {
      id: "weaning",
      name: "Weaning & Extubation Readiness",
      category: "Weaning",
      emoji: "\uD83E\uDE9C",
      summary: "A daily systematic screen → SBT → extubation decision. RSBI < 105 is the classic gate; cough, mentation and secretions decide the rest.",
      pathophysiology: [
        "Weaning failure = imbalance between load (resistance, elastance) and capacity (drive, muscle strength) — the SBT is a physiological stress test of that balance.",
        "Rapid shallow breathing (high f/VT ratio) is the earliest sign of fatiguing muscles — the RSBI quantifies exactly this.",
        "Even when the SBT passes, extubation can fail from UPPER airway problems (stridor, secretion load, mental status) — cuff-leak test and cough assessment cover these."
      ],
      primaryMode: "psv",
      primaryModeNote: "SBT performed on PS 5–8 over PEEP 5 (or T-piece). PSV is both the test and the post-extubation safety net.",
      alternativeModes: [
        { id: "cpap", note: "SBT alternative; post-extubation prophylaxis in high-risk" },
        { id: "hfnc", note: "Post-extubation support, esp. obese/elderly/high secretions" },
        { id: "bipap-niv", note: "Post-extubation NIV in hypercapnic COPD/OHS patients" }
      ],
      initialSettings: [
        { parameter: "Daily screen", value: "Cause resolving · SpO2 > 92% on ≤ 40% · PEEP ≤ 5–8 · awake · hemodynamically clean" },
        { parameter: "SBT", value: "PS 5–8 + PEEP 5 for 30–120 min" },
        { parameter: "RSBI", value: "f/VT < 105 breaths/min/L (measured during SBT, unassisted)" },
        { parameter: "Cough", value: "Cough peak flow > 60 L/min (ideal > 160)" },
        { parameter: "Cuff leak", value: "Present (> 110 mL or > 10–15% VT) if airway doubt" }
      ],
      targets: [
        "SBT tolerance: RR < 35, HR < 140, SpO2 > 90%, stable ABG, no distress",
        "Extubation success: no reintubation at 48–72 h"
      ],
      pitfalls: [
        "SBT on full PS 15 — false-positive tolerance, extubation failure",
        "RSBI in isolation: elderly/female/neuro patients may pass/fail misleadingly — always combine with clinical gestalt",
        "Extubating straight to room air when the patient qualified with FiO2 40% — plan the O2/NIV ladder",
        "Ignoring delirium — a common hidden extubation-failure cause"
      ],
      monitoring: [
        "RSBI, rapid-shallow index trend; serial maximal inspiratory pressures",
        "Cuff-leak volume; secretion burden score; mental status (CAM-ICU)"
      ],
      evidence: "Yang & Tobin 1991: RSBI < 105 predicts SBT success (PPV 78%). Esteban 1995: daily SBT + immediate extubation beats SIMV/PSV gradual weaning. Girault: NIV post-extubation for hypercapnic patients prevents reintubation."
    },
    {
      id: "dka",
      name: "Diabetic Ketoacidosis (Metabolic Acidosis)",
      category: "Metabolic & toxic",
      emoji: "\uD83E\uDE78",
      summary: "Ketoacidosis drives severe metabolic acidosis → compensatory Kussmaul breathing that the fatiguing patient cannot sustain. Ventilation must MATCH the acidosis, not normalize CO2 reflexively.",
      pathophysiology: [
        "Metabolic acidosis (HCO3 often 5–12) demands extreme minute ventilation — PaCO2 may need to run 15–25 mmHg to compensate; spontaneous Kussmaul breathing at 30–40/min eventually fatigues respiratory muscles.",
        "Intubating and 'normalizing' PaCO2 to 40 causes catastrophic intracellular acidosis and often cardiac arrest — the classic DKA airway disaster.",
        "Insulin therapy shifts potassium intracellularly; combining hyperventilation (further K shift) + insulin risks precipitous hypokalaemia and arrhythmia."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Volume control guarantees the high minute ventilation that metabolic acidosis demands, with precise rate control — essential because the wrong PaCO2 target is lethal in either direction.",
      alternativeModes: [
        { id: "pc-ac", note: "Acceptable if VT is monitored and high RR tolerated" },
        { id: "asv", note: "Closed-loop minute-ventilation control can track changing demand as ketoacidosis resolves" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "VC-AC" },
        { parameter: "Tidal volume", value: "6–8 mL/kg IBW (lungs are usually normal/compliant)" },
        { parameter: "Rate", value: "Set to REPRODUCE the pre-intubation minute ventilation — often 25–35/min (match Kussmaul!)" },
        { parameter: "PEEP", value: "5 cmH2O" },
        { parameter: "FiO2", value: "Titrate (usually 30–40% — no intrinsic lung pathology)" },
        { parameter: "I:E", value: "Short Ti to allow very high rates (watch auto-PEEP)" },
        { parameter: "PaCO2 target", value: "Winter-predicted level (1.5×HCO3+8) — NOT 40" }
      ],
      targets: [
        "pH rising in step with DKA treatment (insulin + fluids), not ventilation",
        "PaCO2 at Winter's-predicted compensation ± 5 mmHg",
        "K+ 4–5 mEq/L during the first hours (replace aggressively)"
      ],
      pitfalls: [
        "Setting a 'normal' rate → iatrogenic acidemia arrest within minutes of intubation",
        "Aggressive PEEP + high intrathoracic pressure → hypotension in a volume-depleted patient",
        "Forgetting that as ketoacidosis resolves, the ventilator demand FALLS — down-titrate rate to avoid respiratory alkalosis"
      ],
      monitoring: [
        "ABG every 15–30 min initially — pH/PaCO2/K+ trajectory",
        "Serum K+ hourly; ECG for peaked T-waves/arrhythmia",
        "Mental status — cerebral oedema risk (especially young patients) if pH/Na corrected too fast"
      ],
      evidence: "Winter's formula (PaCO2 = 1.5×HCO3 + 8 ± 2) defines expected respiratory compensation. Case series and physiologic reviews document circulatory collapse when DKA patients are hypoventilated at intubation; the standard teaching is to set the ventilator to the patient's pre-intubation minute ventilation."
    },
    {
      id: "salicylate",
      name: "Salicylate Poisoning",
      category: "Metabolic & toxic",
      emoji: "\uD83D\uDC8A",
      summary: "Aspirin directly stimulates the respiratory centre → severe respiratory alkalosis, then uncoupled oxidative phosphorylation drives mixed metabolic acidosis. Extreme hyperventilation is therapeutic — the lungs ARE the dialysis.",
      pathophysiology: [
        "Salicylates are weak acids: alkalaemia (high pH) keeps salicylate ionized → less crosses the blood-brain barrier. Hyperventilation to PaCO2 20–25 mmHg is directly protective — never sedate/paralyse it away without replacing it.",
        "At therapeutic intubation, losing the compensatory tachypnoea causes salicylate to flood brain tissue → deterioration (and the classic death-after-intubation pattern).",
        "Serum levels > 90–100 mg/dL (severe) often need haemodialysis; ventilation must maintain extreme minute ventilation until dialysis clears the drug."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Precise, guaranteed extreme minute ventilation (VE may exceed 20 L/min) with full control of rate and flow — the ventilator must replicate and sustain what the poisoned medulla was doing.",
      alternativeModes: [
        { id: "pc-ac", note: "High flow demand may exceed pressure-target delivery; monitor VT closely" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "VC-AC" },
        { parameter: "Tidal volume", value: "6–8 mL/kg IBW" },
        { parameter: "Rate", value: "20–35/min — target PaCO2 20–25 mmHg (intentional severe hyperventilation)" },
        { parameter: "PEEP", value: "0–5 (minimal — avoid impeding venous return)" },
        { parameter: "FiO2", value: "Titrate (pulmonary oedema can develop → higher FiO2)" },
        { parameter: "Sedation", value: "Light — preserve any spontaneous drive; paralytics with care (loss of contribution)" }
      ],
      targets: [
        "PaCO2 20–25 mmHg (alkalaemia pH 7.50–7.55 is therapeutic)",
        "Serum salicylate falling / dialysis initiated if > 90–100 mg/dL or end-organ signs",
        "Urine alkalinization (pH 7.5–8) with K+ repletion running alongside"
      ],
      pitfalls: [
        "Standard ventilator settings (RR 12–14, 'normal' PaCO2) → rapid clinical deterioration and death — the single most feared error",
        "Missing non-cardiogenic pulmonary oedema (salicylate-induced) → unexpected hypoxaemia",
        "Treating the 'acidosis' with bicarbonate alone without hyperventilation"
      ],
      monitoring: [
        "Serial ABG + serum salicylate q2h until falling",
        "Temperature (uncoupling → hyperthermia; avoid over-sedation)",
        "Mental status, hearing (tinnitus/deafness = toxicity marker)"
      ],
      evidence: "Goldfrank's Toxicologic Emergencies and AACT/EAPCCT position statements: maintain hyperventilation after intubation, treat with sodium bicarbonate (alkalinize serum AND urine), and dialyze at >90–100 mg/dL, signs of end-organ injury, or renal failure."
    },
    {
      id: "bpf",
      name: "Bronchopleural Fistula / Persistent Air Leak",
      category: "Special situations",
      emoji: "\uD83E\uDEC1",
      summary: "A pathologic communication between bronchial tree and pleural space — ventilator gas escapes through a chest drain. Every pressure swing and every breath enlarges the leak; the strategy is MINIMIZE peak + mean airway pressure.",
      pathophysiology: [
        "Positive-pressure ventilation preferentially vents through the lowest-resistance path — the fistula — stealing delivered VT, impairing gas exchange, and preventing pleural healing.",
        "Peak pressure and inspiratory time are the main leak drivers; PEEP worsens ongoing loss; large VT swings keep the fistula open.",
        "Post-pneumonectomy (2–4%) and post-lobectomy stump dehiscence, trauma, ARDS barotrauma, and TB are the classic causes."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Lung-protective VC with the lowest acceptable VT/rate/PEEP and the shortest compatible inspiratory time — you must quantify delivered-vs-exhaled volume to know what the patient actually receives.",
      alternativeModes: [
        { id: "hfov", note: "Small pressure swings around high mPaw — rescue for refractory leak" },
        { id: "hfjv", note: "Very low peak pressures — surgical airway injury and large leaks" },
        { id: "pc-irv", note: "Rarely — inverse ratio can paradoxically reduce leak by lowering peak swings" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "VC-AC (leak-minimizing)" },
        { parameter: "Tidal volume", value: "4–6 mL/kg IBW (permissive hypercapnia accepted)" },
        { parameter: "Rate", value: "As high as needed for CO2 — but keep Te ≥ 3τ to limit trapping" },
        { parameter: "PEEP", value: "Lowest tolerated (often 0–5)" },
        { parameter: "Ti / flow", value: "Short Ti, high flow → brief pressure exposure" },
        { parameter: "Chest drain", value: "Water-seal preferred when tolerated; avoid high suction" },
        { parameter: "Positioning", value: "Affected side DOWN (reduces leak in most cases)" }
      ],
      targets: [
        "Leak volume falling on drain charts (inspiratory vs expiratory VT difference)",
        "Pplat < 25–30, driving pressure minimal",
        "Lung re-expansion on imaging; no tension physiology"
      ],
      pitfalls: [
        "High suction on the chest drain → pulls ventilator gas straight through the fistula (can exceed 10 L/min loss)",
        "Tension pneumothorax when a draining leak clots/occludes — have emergency decompression plan",
        "Escalating VT to 'compensate' for leak → bigger pressure swings → bigger leak (vicious cycle)"
      ],
      monitoring: [
        "Continuous insp/exp VT difference (leak quantification)",
        "Subcutaneous emphysema progression",
        "Bronchoscopy for stump evaluation / endobronchial valve candidacy"
      ],
      evidence: "Case series and surgical reviews: independent lung ventilation (double-lumen ETT), HFOV, and endobronchial valves/spirometry-guided coils are salvage options; the unifying principle across all is minimizing airway pressure and inspiratory time."
    },
    {
      id: "ild",
      name: "Interstitial Lung Disease / Pulmonary Fibrosis",
      category: "Respiratory failure",
      emoji: "\uD83E\uDEC1",
      summary: "Stiff, non-recruitable lungs with fixed low compliance and often pulmonary hypertension. Ventilation is a bridge through the acute insult — most chronically fibrotic patients do not tolerate prolonged ventilation.",
      pathophysiology: [
        "Fibrotic remodelling collapses alveolar units permanently: compliance 15–30 mL/cmH2O that does NOT respond to PEEP (recruitment impossible — overdistension is immediate).",
        "The pulmonary vasculature is obliterated in parallel → pulmonary hypertension; hypercapnia/acidosis and high intrathoracic pressure precipitate acute RV failure.",
        "Oxygen diffusion is impaired but FiO2 response is usually preserved — the problem is mechanics, not shunt."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Strict pressure-limited volume control: Pplat < 25–30 and driving pressure < 15 with small VT — fibrotic lungs tolerate hypercapnia poorly (RV strain) so balance targets carefully.",
      alternativeModes: [
        { id: "pc-ac", note: "Decelerating flow suits non-uniform units; VT varies with any compliance change" },
        { id: "prvc", note: "Keeps VT on target within the pressure ceiling" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "VC-AC (pressure-limited)" },
        { parameter: "Tidal volume", value: "4–6 mL/kg IBW" },
        { parameter: "Rate", value: "High enough to avoid acidosis (often 20–30) — fibrosis tolerates hypercapnia poorly" },
        { parameter: "PEEP", value: "Low (5) — minimal recruitment potential; high PEEP only overdistends" },
        { parameter: "FiO2", value: "Titrated — fibrosis usually oxygen-responsive" },
        { parameter: "Pplat / ΔP", value: "< 30 / < 15 cmH2O" }
      ],
      targets: [
        "SpO2 88–92%, avoid profound acidosis (RV afterload)",
        "Lowest driving pressure achievable",
        "Identify the ACUTE reversible component (infection, oedema, PE, acute exacerbation) — treat it"
      ],
      pitfalls: [
        "Chasing oxygenation with PEEP (fibrotic lung is non-recruitable) → overdistension + RV crisis",
        "Permissive hypercapnia borrowed uncritically from ARDS — here acidosis worsens pulmonary vasoconstriction",
        "Missing a pulmonary embolism (common, presents similarly with sudden worsening)"
      ],
      monitoring: [
        "Serial driving pressure/compliance trend",
        "RV function (echo — TAPSE, septal motion)",
        "Early transplant-centre discussion for acute exacerbation of IPF (usually fatal without it)"
      ],
      evidence: "Acute exacerbation of IPF carries > 50% hospital mortality (review series); lung transplantation is the only survival-proven intervention for the fibrotic substrate; ventilation strategy mirrors ARDS with even stricter pressure limits and less PEEP reliance."
    },
    {
      id: "pe",
      name: "Pulmonary Embolism (incl. Massive PE with RV Failure)",
      category: "Cardiac",
      emoji: "\uD83E\uDE7A",
      summary: "Obstructed pulmonary vasculature with a failing, under-filled right ventricle. High intrathoracic pressure is the enemy: every cmH2O of PEEP further obstructs RV filling and raises dead space.",
      pathophysiology: [
        "Embolic obstruction spikes pulmonary vascular resistance; the RV — a thin pressure pump — acutely dilates and fails; systemic pressure falls, coronary perfusion collapses → arrest spiral.",
        "Positive pressure raises intrathoracic pressure → reduces venous return to an already under-filled RV and worsens the obstruction-to-output ratio.",
        "Dead space rises dramatically (high V/Q units) → high ETCO2–PaCO2 gap; oxygenation may be nearly normal while the patient arrests from obstructive shock."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "If intubated: volume control with LOW pressures, LOW PEEP, permissive of mild hypercapnia — the priority is RV preload/output and immediate definitive therapy (lysis/thrombectomy), not perfect gas numbers.",
      alternativeModes: [
        { id: "psv", note: "Early switch to spontaneous support — negative intrathoracic pressure aids RV filling" },
        { id: "hfnc", note: "Dyspnoeic, pre-intubation support — low impact on hemodynamics" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "VC-AC (gentle)" },
        { parameter: "Tidal volume", value: "6 mL/kg IBW (lower if possible)" },
        { parameter: "Rate", value: "12–16 (mild permissive hypercapnia accepted — avoid acidosis worse than pH 7.25)" },
        { parameter: "PEEP", value: "0–5 (minimal!)" },
        { parameter: "FiO2", value: "High — dead-space shunt responds to FiO2 reasonably" },
        { parameter: "Timing", value: "Intubation itself is high-risk in massive PE — consider lysis FIRST if arrest imminent" }
      ],
      targets: [
        "Haemodynamics over gases: MAP ≥ 65, lactate falling",
        "Lowest airway pressures compatible with survival",
        "Definitive clot burden reduction within hours"
      ],
      pitfalls: [
        "Intubating a pre-arrest massive PE — the sedation + positive pressure removes RV preload → cardiac arrest (consider awake lysis)",
        "Standard 5–10 PEEP reflex — even 5 can decompensate the failing RV",
        "Missing the high ETCO2 gradient (dead space) and chasing 'inadequate ventilation' with higher pressures"
      ],
      monitoring: [
        "Continuous ETCO2 (sudden drop = clot propagation / RV collapse)",
        "Bedside echo — RV size/function serially",
        "Lactate, ScvO2 as perfusion markers"
      ],
      evidence: "Guideline consensus (ESC 2019): in haemodynamically unstable PE, primary reperfusion (lysis/surgical or catheter thrombectomy) takes priority over intubation; if ventilation is required, minimise intrathoracic pressure and correct preload."
    },
    {
      id: "drowning",
      name: "Near-Drowning / Submersion Injury",
      category: "Respiratory failure",
      emoji: "\uD83C\uDF0A",
      summary: "Aspiration of water (fresh or salt) strips surfactant and floods alveoli → ARDS-pattern injury within minutes-to-hours, complicated by hypothermia that alters every clinical sign.",
      pathophysiology: [
        "Fresh water destroys surfactant → atelectasis and shunt; salt water draws oedema fluid into alveoli by osmotic gradient — both converge on non-cardiogenic pulmonary oedema with low compliance.",
        "10–20% of drownings show laryngospasm with dry lungs initially — deterioration can be delayed; observation is mandatory.",
        "Hypothermia is neuroprotective (cold-water submersion, children especially) — do not declare futility early; core-temperature-corrected care changes prognostication."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Lung-protective ventilation exactly as ARDS (the pathology IS secondary drowning-ARDS): low VT, PEEP titration, driving-pressure monitoring.",
      alternativeModes: [
        { id: "prvc", note: "Holds VT target within pressure bounds as compliance swings" },
        { id: "hfnc", note: "Mildly affected, cooperative patients with close monitoring" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "VC-AC (ARDS bundle)" },
        { parameter: "Tidal volume", value: "6 mL/kg IBW" },
        { parameter: "PEEP", value: "5–10 then ARDSNet table (titrate to oxygenation + compliance)" },
        { parameter: "FiO2", value: "Start 100% — most submersion patients respond (no intrinsic lung disease)" },
        { parameter: "Rate / PaCO2", value: "Normocapnia (brain injury coexists — avoid hyperventilation)" },
        { parameter: "Temperature", value: "Active rewarming per protocol; > 32 °C targeted normothermia" }
      ],
      targets: [
        "SpO2 ≥ 92%, PaO2 ≥ 60 with falling FiO2",
        "Core temperature per target (32–36 °C debated; no hyperthermia)",
        "Neprognostication deferred ≥ 72 h normothermic"
      ],
      pitfalls: [
        "Routine antibiotics — aspiration of water does not need prophylaxis (treat only documented infection)",
        "Initial 'dry' CXR reassuring — deterioration at 4–6 h is common; observe minimum 6–8 h",
        "Hyperthermia from active rewarming overshoot worsens brain injury"
      ],
      monitoring: [
        "Continuous core temperature",
        "Serial CXR + oxygenation index trend",
        "Neuro exam at normothermia; EEG if seizures/coma"
      ],
      evidence: "ILCOR drowning treatment consensus: lung-protective ventilation, no routine prophylactic antibiotics, and prolonged resuscitation for hypothermic victims ('not dead until warm and dead') with extracorporeal rewarming for deep hypothermia."
    },
    {
      id: "anaphylaxis",
      name: "Anaphylaxis / Airway Angioedema",
      category: "Airway obstruction",
      emoji: "⚠️",
      summary: "Massive histamine release: distributive shock plus upper-airway oedema. The airway can close within minutes — epinephrine FIRST, early intubation with a smaller tube and a multi-plan exit strategy; NIV is contraindicated.",
      pathophysiology: [
        "Mucosal capillary leak swells tongue, epiglottis and subglottis — the airway diameter shrinks (resistance ∝ 1/r⁴): even 1 mm of oedema in a 4 mm airway multiplies resistance ~16-fold.",
        "Simultaneous vasodilation + capillary leak (distributive shock) means sedation for intubation can precipitate arrest — push epinephrine and volume BEFORE the tube.",
        "Anaphylactoid reactions to drugs (NMBAs, contrast, antibiotics) can also cause direct bronchospasm — the result is upper AND lower obstruction plus shock."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Once intubated: volume control guarantees ventilation against high and changing resistance from bronchospasm; pressure modes would deliver shrinking VT as resistance climbs.",
      alternativeModes: [
        { id: "pc-ac", note: "Only if resistance is stable/treating — VT varies with bronchospasm severity" },
        { id: "hfnc", note: "Bridge for isolated laryngeal oedema WITHOUT shock if intubation team ready" }
      ],
      initialSettings: [
        { parameter: "Sequence", value: "IM epinephrine 0.3–0.5 mg FIRST, volume, THEN airway" },
        { parameter: "ETT", value: "6.0–7.0 cuffed (small — oedematous airway)" },
        { parameter: "Mode", value: "VC-AC" },
        { parameter: "VT / rate", value: "6–8 mL/kg · 12–20/min" },
        { parameter: "PEEP / FiO2", value: "5 / 100% initially" },
        { parameter: "Cuff pressure", value: "Check at 20–30 cmH2O — oedema changes leak dynamics" },
        { parameter: "Extubation", value: "Delayed 24–72 h on epinephrine infusion; cuff-leak test mandatory" }
      ],
      targets: [
        "Airway secured before complete obstruction",
        "Bronchospasm resolving (rising compliance, falling PIP)",
        "Shock resolving: epinephrine infusion weaned, lactate clearing"
      ],
      pitfalls: [
        "Attempting NIV/CPAP for 'work of breathing' — masks the deteriorating airway and delays definitive control",
        "Repeated laryngoscopy attempts → worsening oedema; if grade 3-4 view, move to surgical airway early",
        "Stopping epinephrine early — biphasic reactions recur in up to 20% within 72 h"
      ],
      monitoring: [
        "Continuous airway pressures (PIP trend = bronchospasm tracker)",
        "Epinephrine infusion + volume resuscitation response",
        "Skin signs, repeat histamine/tryptase if diagnostic doubt"
      ],
      evidence: "WAO anaphylaxis guidance: IM epinephrine is first-line and delay is the main mortality driver; observational series support awake fibreoptic or gas-induction intubation strategies for angioedema and smaller ETT sizes with delayed extubation after cuff-leak assessment."
    },
    {
      id: "liver-failure",
      name: "Acute Liver Failure (with Cerebral Oedema)",
      category: "Neurocritical",
      emoji: "\uD83E\uDDE0",
      summary: "Fulminant hepatic failure with ammonia-driven cerebral oedema and intracranial hypertension. The ventilator is a neuroprotective tool: CO2 precision, head-up positioning, and cough-line suppression during suction.",
      pathophysiology: [
        "High ammonia is metabolized to glutamine in astrocytes → osmotic swelling; ICP crises can herniate within hours — the leading cause of death in ALF.",
        "Both hypercapnia (cerebral vasodilation → ↑ICP) and hypocapnia (cerebral vasoconstriction → ischaemia) are harmful: PaCO2 35–40 is the narrow target.",
        "Coagulopathy (INR often > 3) makes airway instrumentation and suction traumatic — every ETT manipulation risks bleeding."
      ],
      primaryMode: "pc-ac",
      primaryModeNote: "Pressure control with a long Ti and low flow targets quiet, controlled ventilation; PRVC is equally acceptable — the key is PaCO2 precision and minimizing stimuli that spike ICP.",
      alternativeModes: [
        { id: "prvc", note: "VT guarantee within pressure bounds — good match" },
        { id: "vc-ac", note: "Acceptable; avoid high PIP that may raise ICP" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "PC-AC / PRVC" },
        { parameter: "Tidal volume", value: "6 mL/kg IBW" },
        { parameter: "Rate / PaCO2", value: "PaCO2 35–40 mmHg exactly (normocapnia)" },
        { parameter: "PEEP", value: "Low (≤ 5–8) — every cmH2O impedes cerebral venous return at 30° head-up" },
        { parameter: "FiO2", value: "Per oxygenation targets" },
        { parameter: "Positioning", value: "Head-up 30°, neck neutral (venous drainage)" },
        { parameter: "Suction", value: "Pre-oxygenate, consider lidocaine/cough suppression; brief passes only" }
      ],
      targets: [
        "PaCO2 35–40; SpO2 ≥ 92 (hypoxia is independently neurotoxic)",
        "ICP < 22 mmHg / CPP ≥ 60 if monitored",
        "Ammonia trajectory down (lactulose/Rifaximin, transplant listing)"
      ],
      pitfalls: [
        "Hyperventilation as 'ICP therapy' — only a brief bridge during herniation signs; sustained hypocapnia causes cerebral ischaemia",
        "High PEEP reflexively set — raises ICP in a patient already at the edge",
        "Routine aggressive suctioning → coughing → ICP spikes → herniation"
      ],
      monitoring: [
        "Arterial line + serial ABG (PaCO2 precision)",
        "ICP monitoring in grades III-IV encephalopathy (considered despite coagulopathy)",
        "Neuro exam via FOUR score (validatable in intubated patients)"
      ],
      evidence: "ACG/ESALF guidance: maintain normocapnia, head-up 30°, treat ICP crises with osmotic therapy; intracranial hypertension is the dominant mechanism of death in ALF and transplant remains the definitive therapy."
    },
    {
      id: "donor",
      name: "Organ Donor Management",
      category: "Special situations",
      emoji: "\uD83C\uDF97️",
      summary: "After brain-death determination, ventilation pivots to graft protection: lungs are the most fragile and most frequently lost organ. Evidence-based donor bundles recover 20–30% more lungs for transplant.",
      pathophysiology: [
        "Brain death triggers a catecholamine storm (neurogenic pulmonary oedema), then loss of sympathetic tone → haemodynamic instability, diabetes insipidus, and temperature lability.",
        "Lung donor failure is dominated by atelectasis, neurogenic oedema, and aspiration — most recoverable with a standardized bundle.",
        "The recipient's outcome depends on the graft's final hours of care: lung-protective ventilation + recruitment + haemodynamic targets are a gift multiplier."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Lung-protective VC exactly as an ARDS patient (VT 6–8, Pplat < 30): the goal is delivering the healthiest possible lungs, not comfort.",
      alternativeModes: [
        { id: "pc-ac", note: "Equivalent if VT monitored" },
        { id: "aprv", note: "Occasionally used for alveolar recruitment maintenance" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "VC-AC (graft-protective)" },
        { parameter: "Tidal volume", value: "6–8 mL/kg IBW" },
        { parameter: "PEEP", value: "8–10" },
        { parameter: "FiO2", value: "Titrate to PaO2 ≥ 70 (keep as LOW as possible — FiO2 toxicity matters)" },
        { parameter: "Recruitment", value: "RM then PEEP per response (hypotension-aware)" },
        { parameter: "Rate / PaCO2", value: "Normocapnia (protects other grafts: heart, liver)" },
        { parameter: "Hormonal resuscitation", value: "Vasopressin + methylprednisolone + T3/T4 per protocol" }
      ],
      targets: [
        "PaO2/FiO2 > 300 for lung acceptance (ideal), SpO2 ≥ 95",
        "Sodium 135–155 (treat DI with DDAVP), MAP ≥ 65",
        "Normothermia (36–37.5 °C) — hypothermia worsens coagulopathy"
      ],
      pitfalls: [
        "FiO2 100% 'because they are a donor' — oxygen toxicity damages the graft; titrate down",
        "Allowing repeated atelectasis (under-recruitment) → lungs declined",
        "Under-resuscitation of haemodynamics → warm ischaemia of abdominal organs"
      ],
      monitoring: [
        "Serial blood gases + FiO2/PEEP wean ladder",
        "Bronchoscopy for secretion/aspiration clearance before procurement",
        "Central temperature, urine output, electrolytes q2h"
      ],
      evidence: "The Canadian donor lung bundle (Sugrue 2005 / ISHLT practice guidelines): VT 8 + PEEP 8 + recruitment maneuvers + hormonal resuscitation increased lung donation from 9% to 25% — one of the clearest ventilation-bundle wins in medicine."
    },
    {
      id: "tetanus",
      name: "Tetanus (Severe Spasm)",
      category: "Special situations",
      emoji: "⚡",
      summary: "Clostridium tetani toxin blocks inhibitory neurons → violent muscle spasms and autonomic instability. The airway and ventilation must be secured BEFORE spasm or autonomic storm kills; paralysis and deep sedation run for weeks.",
      pathophysiology: [
        "Risus sardonicus, opisthotonus, and laryngospasm: any stimulus (sound, touch, suction) triggers generalized spasm — aspiration and asphyxiation are the immediate killers.",
        "Autonomic storm (labile catastrophic hypertension/tachycardia alternating with collapse) follows in week 2–3 as toxin ascends to the lateral horn.",
        "Recovery requires axonal regeneration — weeks of ICU care; the patient is fully conscious during spasms (amnestic deep sedation is a mercy and a safety requirement)."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Full control with guaranteed minute ventilation while neuromuscular blockade runs for weeks — spontaneous/triggered modes are impossible during the spasm phase.",
      alternativeModes: [
        { id: "pc-ac", note: "Equivalent control option" },
        { id: "prvc", note: "Keeps VT guaranteed during long paralysis" }
      ],
      initialSettings: [
        { parameter: "Airway", value: "Intubate early (before spasm obstructs) → early tracheostomy" },
        { parameter: "Mode", value: "VC-AC" },
        { parameter: "VT / rate", value: "6–8 mL/kg · 16–20/min" },
        { parameter: "Sedation", value: "Deep benzodiazepine + opioid (magnesium infusion as adjunct)" },
        { parameter: "Paralysis", value: "Vecuronium/cisatracurium infusion during spasm phase" },
        { parameter: "Environment", value: "Quiet dark room — minimize ALL stimuli; pad bed" },
        { parameter: "PEEP / FiO2", value: "5 / titrate (lungs usually normal)" }
      ],
      targets: [
        "No witnessed spasm breakthrough (sedation depth, not just paralysis)",
        "Stable hemodynamics through autonomic phase (magnesium, clonidine, esmolol as needed)",
        "No ventilator-associated events across the long stay"
      ],
      pitfalls: [
        "Light sedation relying on paralysis alone — the patient is awake, terrified, and in pain (paralyzed-but-aware)",
        "Under-dosing benzodiazepines (doses of 100s of mg diazepam/day are normal)",
        "Missing the autonomic phase after the spasm phase — vigilance must continue weeks"
      ],
      monitoring: [
        "Spasm frequency chart; sedation depth awareness monitoring",
        "Autonomic trends (HR/BP lability) + magnesium levels (4–8 mg/dL... keep 4–5)",
        "Early tracheostomy timing discussion day 3–7"
      ],
      evidence: "WHO/clinical reviews: severe tetanus mortality drops from > 50% to < 20% with early airway, deep sedation (benzodiazepines ± magnesium), paralysis, and meticulous long-haul ICU care; spontaneous survivors recover fully as toxin clears."
    },
    {
      id: "pneumonia",
      name: "Severe Pneumonia (CAP / HAP)",
      category: "Respiratory failure",
      emoji: "\uD83E\uDDA0",
      summary: "Lobar consolidation with alveolar flooding: regional shunt, secretions load, and sepsis physiology. Often unilateral/focal — PEEP strategies differ from diffuse ARDS, and secretion clearance is a core ventilation task.",
      pathophysiology: [
        "Consolidated lobe(s) are un-recruitable (airless, fluid-filled): PEEP redistributes blood AWAY from them to healthier units — oxygenation often improves but overdistension of the healthy lung is a real cost.",
        "Purulent secretions occlude airways → atelectasis behind plugs; positional changes and airway toilet deliver more oxygenation benefit than dial increases.",
        "Septic microcirculatory dysfunction and high metabolic demand raise the required minute ventilation above normal baseline."
      ],
      primaryMode: "vc-ac",
      primaryModeNote: "Dependable ventilation for sepsis physiology with measurable Pplat/ΔP; PSV is added early once sepsis stabilizes to preserve conditioning.",
      alternativeModes: [
        { id: "psv", note: "Early spontaneous breathing as soon as sepsis/hypoxaemia allow" },
        { id: "prvc", note: "Dual-control safety as compliance fluctuates with sepsis resolution" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "VC-AC" },
        { parameter: "Tidal volume", value: "6 mL/kg IBW" },
        { parameter: "Rate", value: "18–24 (sepsis drives demand; watch for auto-PEEP at high rates)" },
        { parameter: "PEEP", value: "5–10 — lower than ARDS-diffuse; focal disease overdistends healthy regions at high PEEP" },
        { parameter: "FiO2", value: "Titrate (consolidated shunt responds less to both PEEP and FiO2)" },
        { parameter: "Positioning", value: "Good-lung-UP for unilateral disease (perfuses the healthy side)" },
        { parameter: "Airway toilet", value: "Suction + bronchoscopy for plugs; secretion protocol" }
      ],
      targets: [
        "SpO2 ≥ 92–94%, lactate clearing, source control (antibiotics within 1 h)",
        "Driving pressure < 15 even though non-ARDS",
        "Culture-directed de-escalation"
      ],
      pitfalls: [
        "Applying high-PEEP ARDS strategy to focal pneumonia → healthy-lung overdistension + hypotension",
        "Missing mucus plugging as the cause of sudden desaturation (position, suction, bronchoscope before PEEP escalation)",
        "Forgetting sepsis-adjusted minute ventilation needs (rising PaCO2 with 'normal' settings)"
      ],
      monitoring: [
        "Pplat/ΔP each change (even non-ARDS lungs get injured)",
        "Secretion character/volume chart",
        "Repeat imaging for effusion/empyema requiring drainage"
      ],
      evidence: "ARDSNet physiological principle of baby-lung protection extends to focal pneumonia (consolidated lung behaves as extremely low compliance); ATS/IDSA CAP guidance: early antibiotics + source control; good-lung-up positioning from independent-lung physiology studies."
    },
    {
      id: "dah",
      name: "Diffuse Alveolar Haemorrhage",
      category: "Respiratory failure",
      emoji: "\uD83E\uDE78",
      summary: "Bilateral alveolar flooding with blood from small-vessel vasculitis (ANCA, anti-GBM, SLE) or coagulopathy — sudden hypoxaemia with falling haemoglobin and haemoptysis that may be absent (30%).",
      pathophysiology: [
        "Capillaritis floods alveoli with blood → massive shunt, low compliance, and airway obstruction by clots; the bleeding diathesis can propagate distally as blood tracks through the tracheobronchial tree.",
        "Anti-GBM (Goodpasture) demands urgent plasma exchange + steroids + cyclophosphamide alongside ventilation; delay is lethal.",
        "The bleeding lung can seed the contralateral lung through the bronchial tree — isolation strategies matter in focal variants."
      ],
      primaryMode: "pc-ac",
      primaryModeNote: "Pressure control limits peak airway pressure to reduce shear on bleeding vessels; VT monitoring is essential since compliance shifts with every bleed.",
      alternativeModes: [
        { id: "vc-ac", note: "Only with strict pressure limits — avoid flow-jet shear on the capillary bed" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "PC-AC (low-pressure)" },
        { parameter: "Tidal volume", value: "6 mL/kg (target) with PIP as low as achievable" },
        { parameter: "Rate", value: "20–28 (compensate small VT)" },
        { parameter: "PEEP", value: "Low (5) — tamponade logic is unproven; avoid high pressures shearing clots off" },
        { parameter: "FiO2", value: "100% initially (shunt-heavy, responds poorly)" },
        { parameter: "Suction", value: "Minimal and gentle — clot dislodgement re-bleeds" },
        { parameter: "Bleeding side DOWN", value: "If focal — protect the clean lung" }
      ],
      targets: [
        "Haemoglobin stabilizing (transfusion threshold higher — you are losing blood into the lung)",
        "Immunosuppression initiated within hours (MP 500–1000 mg + CyP)",
        "Renal function — anti-GBM pulmonary-renal syndrome runs the show"
      ],
      pitfalls: [
        "Aggressive suction 'to clear the airway' → strips protective clots → torrential re-bleed",
        "High PEEP to 'tamponade' — no good evidence, adds barotrauma",
        "Delaying high-dose steroids/plasma exchange for diagnostic certainty"
      ],
      monitoring: [
        "Serial Hb, ABG; falling SpO2 + rising CO2 = airway clot obstruction — urgent bronchoscopy",
        "ANCA/anti-GBM serology urgent; bronchoscopic sequential lavage (progressively bloody = DAH)",
        "Urine output + creatinine (pulmonary-renal syndromes)"
      ],
      evidence: "Case series and ACR/SLE reviews: high-dose corticosteroids + cyclophosphamide ± plasma exchange (anti-GBM) reduce DAH mortality; ventilation is supportive with the lowest possible pressures."
    },
    {
      id: "tracheostomy",
      name: "Tracheostomy Patient (Ventilated)",
      category: "Weaning",
      emoji: "\uD83D\uDDE3️",
      summary: "The chronic ventilator phase: a surgical airway changes dead space, resistance, and every weaning dynamic. Unhurried daytime spontaneous-breathing trials, night-time rest, and speaking-valve work define success.",
      pathophysiology: [
        "Bypassing upper airway cuts anatomic dead space ~50% (≈ 1 mL/kg saved per breath) and halves the work of inspiration — the trach patient breathes easier at the same VT.",
        "Chronic critical illness includes ICU-acquired weakness (30–50%), delirium history, and malnutrition — weaning is a rehabilitation project, not a settings problem.",
        "Cuff-down breathing and one-way speaking valves (Passy-Muir) restore glottic closure, phonation, and cough effectiveness — psychological and physiologic weaning accelerators."
      ],
      primaryMode: "psv",
      primaryModeNote: "Daytime PSV with progressive support reduction → T-piece/trach-mask trials; night-time rest ventilation prevents fatigue accumulation — the 'wean by day, rest by night' architecture.",
      alternativeModes: [
        { id: "cpap", note: "With PS 5–8 for trach-mask trials" },
        { id: "smartcare", note: "Closed-loop weaning where available standardizes the ladder" }
      ],
      initialSettings: [
        { parameter: "Daytime", value: "PSV: PS 8–14 over PEEP 5, wean PS by 2 every few hours as tolerated" },
        { parameter: "Night", value: "Rest mode (PSV or SIMV at comfortable support)" },
        { parameter: "Speaking valve", value: "Cuff DOWN, deflate gradually with suction ready; valve trials daily" },
        { parameter: "Humidification", value: "Active heat-moisture exchanger or heated humidifier (trach bypasses nose)" },
        { parameter: "Tube sizing", value: "Downsize for leak/speech; inner cannula care protocol" },
        { parameter: "Secretions", value: "Mobilization + cough assist + Mucolytics as needed" }
      ],
      targets: [
        "Increasing off-ventilator hours per day (document the trend)",
        "Effective cough with cuff deflated (peak cough flow ≥ 60 L/min)",
        "Nutrition, delirium-free days, mobilization (chair + standing)"
      ],
      pitfalls: [
        "Rushing the cannula before decannulation readiness (cuff-leak + cough + mental status)",
        "Ignoring psychological dependence — include speaking, swallowing, and mobility work",
        "Cold dry trach airway → mucus plugging catastrophe within hours (never skip humidification)"
      ],
      monitoring: [
        "Daily spontaneous breathing capacity (SBT tolerance chart)",
        "Trach site care, granulation, stoma infection",
        "Swallow assessment before oral intake with cuff down"
      ],
      evidence: "Tracheostomy timing trials (TracMan): no mortality benefit of early trach, but comfort and weaning logistics improve; long-term weaning reviews support stepwise daytime spontaneous trials with nocturnal rest and early rehabilitation."
    },
    {
      id: "ecmo-rest",
      name: "During ECMO (Lung Rest Ventilation)",
      category: "Respiratory failure",
      emoji: "\uD83E\uDEC0",
      summary: "With VV-ECMO oxygenating and decarboxylating, the ventilator's job inverts: ULTRA-protective settings rest the lungs while they heal — 'doing less is doing more'.",
      pathophysiology: [
        "ECMO sweep gas controls CO2 (rate-independent) and membrane oxygen flow controls O2 — native lungs can be nearly silenced safely.",
        "The injured lung continues to be damaged by every pressure/volume oscillation; on ECMO, VT 2–4 mL/kg and PEEP 8–10 keep the lung open but resting.",
        "Complete lung collapse ('ECMO off ventilation') was tested (resting protocol) — most centres keep gentle ventilation to avoid complete consolidation."
      ],
      primaryMode: "pc-ac",
      primaryModeNote: "Low-amplitude pressure control at low rate: PIP just above PEEP (ΔP 8–14), rate 6–10, FiO2 ≤ 50 — lungs heal while the circuit works.",
      alternativeModes: [
        { id: "aprv", note: "Phigh maintenance keeps recruitment with minimal swings" },
        { id: "hfov", note: "Some centres; largely superseded by ECMO itself" }
      ],
      initialSettings: [
        { parameter: "Mode", value: "PC-AC (ultra-protective)" },
        { parameter: "Driving pressure", value: "ΔP 8–14 cmH2O (VT ~2–4 mL/kg falls out)" },
        { parameter: "Rate", value: "6–10/min (CO2 handled by sweep anyway)" },
        { parameter: "PEEP", value: "8–12 (keep alveoli open, not moving)" },
        { parameter: "FiO2", value: "≤ 50% (lung oxygen toxicity prevention)" },
        { parameter: "Spontaneous", value: "Awake ECMO — encourage as recovery appears" },
        { parameter: "Recovery markers", value: "Improving lung compliance + native PaO2 → trial sweep reduction" }
      ],
      targets: [
        "Lung rest (low ΔP) maintained while gas exchange targets met",
        "Sweep/FiO2 weaned as native compliance improves",
        "Mobilization on ECMO (awake, sitting, standing) — standard at experienced centres"
      ],
      pitfalls: [
        "Continuing full ARDS ventilation on ECMO — double lung insult",
        "Letting lungs fully collapse then fighting recruitment losses later",
        "Heparin/anticoagulation drift with airway instrumentation — coordinate suctioning"
      ],
      monitoring: [
        "Daily native-lung compliance trend (the weaning signal)",
        "Circuit pressures/sweep/FiO2 vs native ABG",
        "Wakefulness and early rehabilitation"
      ],
      evidence: "CESAR 2009 (referral to ECMO centre improved survival) and EOLIA 2018 (60-day mortality 35% vs 46% conventional, stopped early); extrapolation of ARDSNet logic to ultra-protective VT 2–4 mL/kg during ECMO is standard practice guidance from ELSO."
    }
  ];
  function getScenario(id) {
    return PATIENT_SCENARIOS.find((s) => s.id === id);
  }

  // src/lib/ventilator/waveforms.ts
  var DEFAULT_SETTINGS = {
    mode: "VCV",
    rr: 15,
    peep: 5,
    vt: 450,
    flowPattern: "square",
    peakFlow: 30,
    pause: 0.3,
    pip: 15,
    ti: 1,
    riseTime: 0.1,
    cyclePct: 25,
    simvRate: 8,
    ps: 10,
    pHigh: 25,
    pLow: 0,
    tHigh: 4,
    tLow: 0.6,
    pathology: "normal"
  };
  var PATHOLOGY_PRESETS = {
    normal: { c: 60, r: 8, label: "Normal lungs", note: "Crs 60 mL/cmH2O · Raw 8 cmH2O/L/s · τ ≈ 0.5 s" },
    ards: { c: 28, r: 10, label: "ARDS (stiff lungs)", note: "Crs 28 mL/cmH2O · Raw 10 · τ ≈ 0.3 s — high pressures in VCV, low volumes in PCV" },
    copd: { c: 80, r: 20, label: "COPD (obstructed)", note: "Crs 80 · Raw 20 · τ ≈ 1.6 s — slow emptying, auto-PEEP risk" },
    asthma: { c: 55, r: 28, label: "Asthma (severe obstruction)", note: "Crs 55 · Raw 28 · τ ≈ 1.5 s — marked air trapping, beaked PV loop" }
  };
  var DT = 0.01;
  function patho(settings) {
    return PATHOLOGY_PRESETS[settings.pathology];
  }
  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }
  function runExpiration(samples, tStart, vStart, peepEff, pVentDuringExp, C, R, duration, allowTrapped) {
    const tau = C / 1000 * R;
    let v = vStart;
    let t = tStart;
    const steps = Math.max(Math.round(duration / DT), 1);
    for (let i = 0;i < steps; i++) {
      const flow = -v / (tau * 1000);
      const paw = pVentDuringExp + v / 1000 / (C / 1000) * (v > 0 ? 1 : 0);
      samples.push({ t: Math.round(t * 100) / 100, flow, vol: Math.max(v, 0), paw: v > 0 ? pVentDuringExp + v / C : pVentDuringExp });
      v = v + flow * 1000 * DT;
      if (v < 0)
        v = 0;
      t += DT;
    }
    return { vEnd: v };
  }
  function flowAt(pattern, phase, peak) {
    if (pattern === "square")
      return peak;
    if (pattern === "decel")
      return peak * (1 - 0.85 * phase);
    return peak * Math.sin(Math.PI * phase);
  }
  function vcInspiration(samples, tStart, vt, pattern, peakFlowLpm, peep, C, R, pause) {
    const peak = peakFlowLpm / 60;
    let v = 0;
    let t = tStart;
    let lastFlow = peak;
    const maxSteps = Math.ceil(4 / DT);
    for (let i = 0;i < maxSteps && v < vt; i++) {
      const phase = clamp(v / vt, 0, 1);
      const f = Math.max(flowAt(pattern, phase, peak), 0.01);
      lastFlow = f;
      const paw = peep + v / C + f * R;
      samples.push({ t: Math.round(t * 100) / 100, flow: f, vol: v, paw });
      v += f * 1000 * DT;
      t += DT;
    }
    samples.push({ t: Math.round(t * 100) / 100, flow: 0, vol: vt, paw: peep + vt / C });
    t += DT;
    if (pause > 0) {
      const steps = Math.round(pause / DT);
      for (let i = 0;i < steps; i++) {
        samples.push({ t: Math.round(t * 100) / 100, flow: 0, vol: vt, paw: peep + vt / C });
        t += DT;
      }
    }
    return { tEnd: t, v: vt, peakFlowUsed: lastFlow };
  }
  function pcInspiration(samples, tStart, deltaP, peep, C, R, riseTime, duration, cycleAtPctOfPeak) {
    let v = 0;
    let t = tStart;
    let peakFlow = 0;
    const vInfinity = deltaP * C;
    const steps = Math.ceil(duration / DT);
    let cycledEarly = false;
    let ti = 0;
    for (let i = 0;i < steps; i++) {
      const pTarget = peep + deltaP;
      let pApplied;
      if (ti < riseTime)
        pApplied = peep + deltaP * (ti / Math.max(riseTime, 0.02));
      else
        pApplied = pTarget;
      const pAlv = peep + v / C;
      const f = Math.max((pApplied - pAlv) / R, 0);
      if (f > peakFlow)
        peakFlow = f;
      samples.push({ t: Math.round(t * 100) / 100, flow: f, vol: v, paw: pApplied });
      v += f * 1000 * DT;
      t += DT;
      ti += DT;
      if (cycleAtPctOfPeak !== null && peakFlow > 0 && ti > riseTime + 0.05) {
        if (f <= peakFlow * (cycleAtPctOfPeak / 100)) {
          cycledEarly = true;
          break;
        }
      }
    }
    return { tEnd: t, v, peakFlow, cycledEarly };
  }
  function generateWaveforms(s) {
    const { c: C, r: R } = patho(s);
    const samples = [];
    const breathLabels = [];
    let pip = 0;
    let pplat = s.peep;
    let vtDelivered = 0;
    let autoPeep = 0;
    let expIncomplete = false;
    if (s.mode === "VCV" || s.mode === "SIMV") {
      const isSimv = s.mode === "SIMV";
      const ttot = 60 / s.rr;
      const cycles = isSimv ? 3 : 3;
      let t = 0;
      let vResidual = 0;
      const mandEvery = isSimv ? Math.max(Math.round(s.rr / Math.max(s.simvRate, 1)), 2) : 1;
      for (let cyc = 0;cyc < cycles; cyc++) {
        const mandatory = !isSimv || cyc % mandEvery === 0;
        if (mandatory) {
          breathLabels.push({ t, label: "VC" });
          const effectiveVt = s.vt + vResidual * 0;
          const res = vcInspiration(samples, t, effectiveVt, s.flowPattern, s.peakFlow, s.peep, C, R, s.pause);
          const breath = samples.filter((x) => x.t >= t && x.t <= res.tEnd);
          const breathPip = Math.max(...breath.map((x) => x.paw));
          pip = Math.max(pip, breathPip);
          pplat = s.peep + effectiveVt / C;
          vtDelivered = effectiveVt;
          const te = ttot - (res.tEnd - t);
          const exp = runExpiration(samples, res.tEnd, effectiveVt, s.peep, s.peep, C, R, Math.max(te, 0.2), true);
          vResidual = exp.vEnd;
          autoPeep = vResidual > 5 ? vResidual / C : 0;
          if (exp.vEnd > effectiveVt * 0.05)
            expIncomplete = true;
        } else {
          breathLabels.push({ t, label: "PS" });
          const res = pcInspiration(samples, t, s.ps, s.peep, C, R, s.riseTime, 1.2, s.cyclePct);
          vtDelivered = res.v;
          const breath = samples.filter((x) => x.t >= t && x.t <= res.tEnd);
          const breathPip = Math.max(...breath.map((x) => x.paw));
          pip = Math.max(pip, breathPip);
          const te = ttot - (res.tEnd - t);
          const exp = runExpiration(samples, res.tEnd, res.v, s.peep, s.peep, C, R, Math.max(te, 0.2), true);
          vResidual = exp.vEnd;
          if (exp.vEnd > res.v * 0.05)
            expIncomplete = true;
        }
        t += ttot;
      }
    } else if (s.mode === "PCV") {
      const ttot = 60 / s.rr;
      let t = 0;
      let vResidual = 0;
      for (let cyc = 0;cyc < 3; cyc++) {
        breathLabels.push({ t, label: "PC" });
        const res = pcInspiration(samples, t, s.pip, s.peep, C, R, s.riseTime, s.ti, null);
        const breath = samples.filter((x) => x.t >= t && x.t <= res.tEnd);
        pip = Math.max(pip, Math.max(...breath.map((x) => x.paw)));
        vtDelivered = res.v;
        pplat = s.peep + s.pip;
        const te = ttot - (res.tEnd - t);
        const exp = runExpiration(samples, res.tEnd, res.v, s.peep, s.peep, C, R, Math.max(te, 0.2), true);
        vResidual = exp.vEnd;
        autoPeep = vResidual > 5 ? vResidual / C : 0;
        if (exp.vEnd > res.v * 0.05)
          expIncomplete = true;
        t += ttot;
      }
    } else if (s.mode === "PSV") {
      const ttot = 60 / s.rr;
      let t = 0;
      for (let cyc = 0;cyc < 3; cyc++) {
        breathLabels.push({ t, label: "PS" });
        const trigSteps = Math.round(0.15 / DT);
        for (let i = 0;i < trigSteps; i++) {
          const dip = -1.2 * Math.sin(Math.PI * i / trigSteps);
          samples.push({ t: Math.round(t * 100) / 100, flow: 0.1 * (i / trigSteps), vol: 0, paw: s.peep + dip });
          t += DT;
        }
        const res = pcInspiration(samples, t, s.pip, s.peep, C, R, s.riseTime, Math.max(s.ti, 1.5), s.cyclePct);
        const breath = samples.filter((x) => x.t >= t && x.t <= res.tEnd);
        pip = Math.max(pip, Math.max(...breath.map((x) => x.paw)));
        vtDelivered = res.v;
        const te = ttot - (res.tEnd - t);
        const exp = runExpiration(samples, res.tEnd, res.v, s.peep, s.peep, C, R, Math.max(te, 0.2), true);
        if (exp.vEnd > res.v * 0.05)
          expIncomplete = true;
        autoPeep = exp.vEnd > 5 ? exp.vEnd / C : 0;
        t = res.tEnd + Math.max(te, 0.2);
      }
    } else if (s.mode === "APRV") {
      const cycle = s.tHigh + s.tLow;
      const cycles = 2;
      let t = 0;
      for (let cyc = 0;cyc < cycles; cyc++) {
        breathLabels.push({ t, label: "P-High" });
        const nSpont = Math.max(Math.floor(s.tHigh / 1.2), 1);
        const spontPeriod = s.tHigh / nSpont;
        for (let k = 0;k < nSpont; k++) {
          const spontSteps = Math.round(spontPeriod / DT);
          const spontVT = 200;
          let v2 = 0;
          for (let i = 0;i < spontSteps; i++) {
            const ph = i / spontSteps * Math.PI * 2;
            const f = spontVT / 1000 * Math.sin(ph) / (spontPeriod / 2);
            const fInsp = i < spontSteps / 2 ? Math.max(f, 0) : Math.min(f, 0);
            v2 = i < spontSteps / 2 ? v2 + fInsp * 1000 * DT : Math.max(v2 - Math.abs(fInsp) * 1000 * DT * 0.98, 0);
            const dip = i < spontSteps / 2 ? -2.5 * Math.sin(Math.PI * 2 * i / spontSteps) : 0;
            samples.push({ t: Math.round(t * 100) / 100, flow: fInsp, vol: v2, paw: s.pHigh + dip });
            t += DT;
          }
        }
        breathLabels.push({ t, label: "release" });
        const relSteps = Math.round(s.tLow / DT);
        let v = 0;
        const vHigh = s.pHigh * C - s.pLow * C > 0 ? Math.max((s.pHigh - s.pLow) * 0.8 * C, 300) : 300;
        v = vHigh;
        const tau = C / 1000 * R;
        const peakExp = v / (tau * 1000);
        for (let i = 0;i < relSteps; i++) {
          const f = -peakExp * Math.exp(-(i * DT) / (tau * 0.8));
          samples.push({ t: Math.round(t * 100) / 100, flow: f, vol: v, paw: s.pLow + v / C });
          v = Math.max(v + f * 1000 * DT, vHigh * 0.25);
          t += DT;
        }
        vtDelivered = vHigh;
        pip = s.pHigh;
        pplat = s.pHigh;
        autoPeep = 3;
        expIncomplete = true;
      }
    } else {
      let t = 0;
      const ttot = 60 / s.rr;
      for (let cyc = 0;cyc < 4; cyc++) {
        breathLabels.push({ t, label: "spont" });
        const steps = Math.round(ttot / DT);
        const spontVT = 400;
        let v = 0;
        for (let i = 0;i < steps; i++) {
          const ph = i / steps * Math.PI * 2;
          const f = spontVT / 1000 * Math.sin(ph) / (ttot / 2);
          const fInsp = i < steps / 2 ? Math.max(f, 0) : Math.min(f, 0);
          v = i < steps / 2 ? v + fInsp * 1000 * DT : Math.max(v - Math.abs(fInsp) * 1000 * DT * 0.97, 0);
          const dip = i < steps / 2 ? -3.5 * Math.sin(Math.PI * i / (steps / 2)) : 0;
          samples.push({ t: Math.round(t * 100) / 100, flow: fInsp, vol: v, paw: s.peep + dip });
          t += DT;
        }
        vtDelivered = spontVT;
        pip = s.peep;
        pplat = s.peep;
      }
    }
    const totalT = samples.length ? samples[samples.length - 1].t : 0;
    const pvLoop = [];
    const fvLoop = [];
    if (breathLabels.length >= 2) {
      const startT = breathLabels[Math.max(breathLabels.length - 2, 0)].t;
      const endT = totalT;
      const breath = samples.filter((x) => x.t >= startT && x.t <= endT);
      for (const x of breath) {
        pvLoop.push({ p: x.paw, v: x.vol });
        fvLoop.push({ f: x.flow * 60, v: x.vol });
      }
    }
    let ie = "—";
    if (s.mode === "VCV") {
      const ti = s.vt / 1000 / (s.peakFlow / 60) + s.pause;
      ie = `1:${Math.max(60 / s.rr - ti, 0.1) / Math.max(ti, 0.1) < 100 ? ((60 / s.rr - ti) / ti).toFixed(1) : "—"}`;
      ie = `1:${Math.max((60 / s.rr - ti) / ti, 0.1).toFixed(1)}`;
    } else if (s.mode === "PCV") {
      ie = `1:${((60 / s.rr - s.ti) / s.ti).toFixed(1)}`;
    } else if (s.mode === "APRV") {
      ie = `${(s.tHigh / s.tLow).toFixed(1)}:1`;
    }
    return {
      samples,
      totalT,
      pip: Math.round(pip * 10) / 10,
      pplat: Math.round(pplat * 10) / 10,
      peep: s.peep,
      vtDelivered: Math.round(vtDelivered),
      autoPeep: Math.round(autoPeep * 10) / 10,
      ie,
      expIncomplete,
      breathLabels,
      pvLoop,
      fvLoop
    };
  }
  var ASYNCHRONY_PATTERNS = [
    {
      id: "ineffective-trigger",
      name: "Ineffective triggering",
      description: "Patient effort fails to trigger a breath: airway pressure dips below PEEP with a simultaneous small flow blip, but no ventilator breath follows. Commonest asynchrony; wasted work of breathing.",
      recognition: "Pressure–time scalar: downward deflections below PEEP without a delivered breath. Flow–time: small positive blips. In COPD, auto-PEEP is the usual cause — effort must first overcome intrinsic PEEP before the trigger threshold.",
      action: "Reduce trigger threshold (more sensitive); set external PEEP ≈ 80% of intrinsic PEEP to offset triggering load; treat bronchospasm; reduce sedation; check for diaphragmatic weakness."
    },
    {
      id: "double-trigger",
      name: "Double triggering (breath stacking)",
      description: "A second breath is triggered before the first is exhaled — patient effectively receives double tidal volume. Occurs with strong effort + short Ti + small VT; in PSV with low compliance the flow-cycle criterion is met early.",
      recognition: "Two inspirations back-to-back with no expiratory gap; volume scalar shows stacked steps; risk of overdistention injury.",
      action: "Increase VT or prolong Ti; deepen sedation if effort excessive; in PSV lower the flow-cycle % (cycle later); check compliance — treat the cause."
    },
    {
      id: "auto-trigger",
      name: "Auto-triggering",
      description: "Ventilator delivers breaths NOT initiated by the patient — caused by circuit leaks, water in the tubing, cardiac oscillations, or an over-sensitive trigger.",
      recognition: "Machine breaths at irregular intervals with no patient effort visible (no pressure dip, no flow deflection before breath).",
      action: "Make trigger less sensitive; drain circuit water; find and fix leaks; rule out cardiac oscillation (saw-tooth sync with ECG)."
    },
    {
      id: "reverse-trigger",
      name: "Reverse triggering",
      description: "Ventilator insufflation entrains diaphragmatic contraction — the ventilator breath triggers the patient, not vice versa (1:1 to 1:3 entrainment). Seen in deeply sedated patients; may progress to breath stacking.",
      recognition: "Diaphragm deflection (pressure/flow ripple) occurring AFTER each ventilator breath onset, entrained to the machine cycle.",
      action: "Recognize and monitor for breath-stacking; consider adjusting sedation depth; document — no single corrective setting."
    },
    {
      id: "flow-asynchrony",
      name: "Flow asynchrony (flow starvation)",
      description: "Ventilator flow < patient demand: patient 'pulls down' the pressure waveform creating a scooped/concave pressure trace during assisted inspiration.",
      recognition: "Pressure–time scalar in VC: concavity during inspiration; PV loop bows rightward. Patient may show sternal recession and accessory-muscle use.",
      action: "Increase set peak flow; switch square→decelerating pattern; or move to pressure-targeted breath (flow is demand-responsive); assess sedation/pain driving demand."
    },
    {
      id: "cycle-asyn-delayed",
      name: "Delayed cycling",
      description: "Ventilator continues inspiration while the patient has begun exhalation — pressure spike at end of inspiration, followed by ineffective triggering from air trapping.",
      recognition: "Pressure spike at the END of inspiratory phase (patient exhaling against ongoing flow); may see subsequent ineffective efforts.",
      action: "Shorten Ti and/or reduce VT; consider PSV (flow-cycling auto-terminates when patient demand falls); in PSV raise flow-cycle %."
    },
    {
      id: "cycle-asyn-premature",
      name: "Premature cycling",
      description: "Ventilator ends inspiration while the patient is still inhaling — pressure dips below PEEP immediately AFTER the breath ends.",
      recognition: "Negative dip just after inspiration ends (differentiates from ineffective triggering which occurs mid-expiration) + immediate post-inspiratory flow increase.",
      action: "In PSV: lower the flow-cycle % (cycle later) or raise pressure support; lengthen Ti if time-cycled."
    },
    {
      id: "rise-time",
      name: "Rise-time mis-setting",
      description: "Rise time = time to reach set pressure in pressure-targeted breaths. Too fast → pressure overshoot (spike) at inspiration start; too slow → concave pressure start, flow starvation and increased WOB.",
      recognition: "Overshoot spike at the top of the pressure waveform (too fast, usually < 0.05 s) vs a scooped pressure onset (too slow, > 0.2 s).",
      action: "Normally keep rise time < 0.2 s; adjust to demand: high-demand patients faster, COPD patients slower with flow-cycle raised to 40–50%."
    }
  ];

  // src/lib/ventilator/ai-engine.ts
  var S = (s) => s.trim();
  function scenarioAnswer(scenarioId) {
    const sc = PATIENT_SCENARIOS.find((x) => x.id === scenarioId);
    if (!sc)
      return null;
    const mode = VENT_MODES.find((m) => m.id === sc.primaryMode);
    return {
      title: `${sc.emoji} ${sc.name} — ventilation strategy`,
      blocks: [
        { type: "text", content: S(`Recommended primary strategy: **${mode?.name ?? sc.primaryMode}**. ${sc.primaryModeNote}`) },
        { type: "text", content: sc.summary },
        { type: "settings", content: sc.initialSettings.map((x) => `${x.parameter}: ${x.value}`) },
        { type: "list", content: sc.targets.map((x) => `Target — ${x}`) },
        { type: "warning", content: sc.pitfalls.slice(0, 3) }
      ],
      source: "Ventilator AI knowledge base — " + sc.category,
      related: [`Tell me about ${mode?.abbr ?? "this mode"}`, `What are the pitfalls in ${sc.name}?`, `Show monitoring for ${sc.name}`]
    };
  }
  function modeAnswer(modeId) {
    const m = VENT_MODES.find((x) => x.id === modeId);
    if (!m)
      return null;
    return {
      title: `${m.name} (${m.abbr})`,
      blocks: [
        { type: "text", content: m.tagline },
        { type: "text", content: m.description[0] },
        { type: "settings", content: m.settings.map((x) => `${x.parameter}: ${x.typicalValue} — ${x.note}`) },
        { type: "list", content: m.indications.map((x) => `Indication — ${x}`) },
        { type: "list", content: m.advantages.map((x) => `Advantage — ${x}`) },
        { type: "warning", content: m.disadvantages }
      ],
      source: "Ventilator AI knowledge base — Modes library",
      related: [`Initial settings for ${m.abbr}`, `When should I avoid ${m.abbr}?`]
    };
  }
  var KB = [
    {
      id: "ards-strategy",
      keywords: [{ word: "ards", weight: 5 }, { word: "acute respiratory distress", weight: 5 }, { word: "stiff lung", weight: 3 }, { word: "pf ratio", weight: 2 }, { word: "low compliance", weight: 2 }, { word: "bilateral infiltrates", weight: 3 }],
      build: () => scenarioAnswer("ards")
    },
    {
      id: "copd-strategy",
      keywords: [{ word: "copd", weight: 5 }, { word: "emphysema", weight: 3 }, { word: "hypercapnia", weight: 2 }, { word: "hypercarbia", weight: 2 }, { word: "co2 retention", weight: 3 }, { word: "air trapping", weight: 3 }, { word: "auto-peep", weight: 3 }, { word: "intrinsic peep", weight: 4 }],
      build: () => scenarioAnswer("copd")
    },
    {
      id: "asthma-strategy",
      keywords: [{ word: "asthma", weight: 5 }, { word: "status asthmaticus", weight: 5 }, { word: "bronchospasm", weight: 4 }, { word: "wheeze", weight: 3 }, { word: "salbutamol", weight: 1 }],
      build: () => scenarioAnswer("asthma")
    },
    {
      id: "tbi-strategy",
      keywords: [{ word: "brain", weight: 3 }, { word: "tbi", weight: 5 }, { word: "icp", weight: 4 }, { word: "neuro", weight: 3 }, { word: "head injury", weight: 4 }, { word: "intracranial", weight: 4 }, { word: "hyperventilate", weight: 3 }, { word: "stroke", weight: 2 }],
      build: () => scenarioAnswer("tbi")
    },
    {
      id: "cpe-strategy",
      keywords: [{ word: "pulmonary oedema", weight: 5 }, { word: "pulmonary edema", weight: 5 }, { word: "heart failure", weight: 4 }, { word: "cardiogenic", weight: 4 }, { word: "cpap", weight: 2 }, { word: "chf", weight: 4 }, { word: "flash", weight: 1 }],
      build: () => scenarioAnswer("cpe")
    },
    {
      id: "nmd-strategy",
      keywords: [{ word: "neuromuscular", weight: 5 }, { word: "guillain", weight: 5 }, { word: "gbs", weight: 5 }, { word: "myasthenia", weight: 5 }, { word: "als", weight: 3 }, { word: "muscle weakness", weight: 3 }, { word: "paralysis", weight: 2 }],
      build: () => scenarioAnswer("neuromuscular")
    },
    {
      id: "obesity-strategy",
      keywords: [{ word: "obese", weight: 5 }, { word: "obesity", weight: 5 }, { word: "weight", weight: 2 }, { word: "bariatric", weight: 4 }, { word: "ohs", weight: 4 }, { word: "hypoventilation syndrome", weight: 3 }],
      build: () => scenarioAnswer("obesity")
    },
    {
      id: "pregnancy-strategy",
      keywords: [{ word: "pregnant", weight: 5 }, { word: "pregnancy", weight: 5 }, { word: "obstetric", weight: 4 }, { word: "fetal", weight: 3 }, { word: "peripartum", weight: 4 }, { word: "eclampsia", weight: 2 }],
      build: () => scenarioAnswer("pregnancy")
    },
    {
      id: "peds-strategy",
      keywords: [{ word: "child", weight: 4 }, { word: "pediatric", weight: 5 }, { word: "paediatric", weight: 5 }, { word: "neonate", weight: 5 }, { word: "infant", weight: 4 }, { word: "baby", weight: 3 }, { word: "preterm", weight: 4 }],
      build: () => scenarioAnswer("pediatric")
    },
    {
      id: "burns-strategy",
      keywords: [{ word: "burn", weight: 5 }, { word: "smoke", weight: 4 }, { word: "inhalation injury", weight: 5 }, { word: "carbon monoxide", weight: 5 }, { word: "co poisoning", weight: 4 }, { word: "singed", weight: 3 }],
      build: () => scenarioAnswer("inhalation")
    },
    {
      id: "sepsis-strategy",
      keywords: [{ word: "sepsis", weight: 5 }, { word: "septic", weight: 4 }, { word: "infection", weight: 2 }, { word: "lactate", weight: 2 }, { word: "vasopressor", weight: 2 }],
      build: () => scenarioAnswer("sepsis")
    },
    {
      id: "rosc-strategy",
      keywords: [{ word: "cardiac arrest", weight: 5 }, { word: "rosc", weight: 5 }, { word: "resuscitation", weight: 3 }, { word: "post-arrest", weight: 5 }, { word: "cpr", weight: 3 }],
      build: () => scenarioAnswer("post-rosc")
    },
    {
      id: "weaning-strategy",
      keywords: [{ word: "wean", weight: 5 }, { word: "weaning", weight: 5 }, { word: "extubate", weight: 5 }, { word: "extubation", weight: 5 }, { word: "sbt", weight: 4 }, { word: "spontaneous breathing trial", weight: 5 }, { word: "rsbi", weight: 4 }, { word: "liberation", weight: 3 }, { word: "decannulation", weight: 2 }],
      build: () => scenarioAnswer("weaning")
    },
    {
      id: "trauma-strategy",
      keywords: [{ word: "trauma", weight: 4 }, { word: "flail", weight: 5 }, { word: "rib fracture", weight: 4 }, { word: "chest injury", weight: 4 }, { word: "contusion", weight: 3 }],
      build: () => scenarioAnswer("chest-trauma")
    },
    {
      id: "postop-strategy",
      keywords: [{ word: "post-op", weight: 4 }, { word: "postoperative", weight: 5 }, { word: "post-operative", weight: 5 }, { word: "surgery", weight: 3 }, { word: "anaesthesia", weight: 2 }, { word: "anesthesia", weight: 2 }],
      build: () => scenarioAnswer("postop")
    },
    ...VENT_MODES.map((m) => ({
      id: `mode-${m.id}`,
      keywords: [
        { word: m.abbr.toLowerCase().split(/[\s(]/)[0], weight: 5 },
        ...m.name.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3).map((w) => ({ word: w, weight: 4 })),
        { word: m.id, weight: 3 }
      ],
      build: () => modeAnswer(m.id)
    })),
    {
      id: "pressures",
      keywords: [{ word: "transpulmonary", weight: 5 }, { word: "plateau", weight: 3 }, { word: "pplat", weight: 5 }, { word: "intrapleural", weight: 5 }, { word: "alveolar pressure", weight: 4 }, { word: "airway pressure", weight: 3 }, { word: "pressure gradient", weight: 4 }, { word: "palv", weight: 4 }, { word: "pawo", weight: 4 }],
      build: () => ({
        title: "Pressures & gradients in the lung",
        blocks: [
          { type: "text", content: "Four basic pressure gradients describe ventilation (lecture deck, slides 4–11):" },
          { type: "list", content: [
            "Airway opening pressure (Pawo / Paw / mouth pressure) — zero (atmospheric) unless pressure is applied at the airway opening",
            "Body surface pressure (Pbs) — zero unless in a hyperbaric chamber or iron lung",
            "Intrapleural pressure (Ppl) — about −5 cmH2O at end-expiration, −10 during spontaneous inspiration; estimated clinically by esophageal balloon pressure (Pes)",
            "Alveolar pressure (Palv) — about −1 cmH2O during spontaneous inspiration, +1 during exhalation"
          ] },
          { type: "text", content: "**Transpulmonary pressure** PL = Palv − Ppl is the alveolar distending pressure — the pressure that maintains alveolar inflation. Pplat (plateau pressure, measured during an inspiratory hold) is commonly substituted for Palv at the bedside." },
          { type: "warning", content: ["All modes increase transpulmonary pressure during inspiration either by decreasing Ppl (negative-pressure ventilators) or increasing Palv via the upper airway (positive-pressure ventilators)."] }
        ],
        source: "Uploaded lecture deck — 'Definitions of Pressures and Gradients in the Lungs'",
        related: ["What is the equation of motion?", "How do I measure plateau pressure?", "Explain static vs dynamic compliance"]
      })
    },
    {
      id: "equation-motion",
      keywords: [{ word: "equation of motion", weight: 6 }, { word: "elastance", weight: 5 }, { word: "resistance", weight: 4 }, { word: "equation", weight: 2 }, { word: "muscle pressure", weight: 4 }, { word: "pmus", weight: 5 }],
      build: () => ({
        title: "The Equation of Motion",
        blocks: [
          { type: "text", content: "**Pvent + Pmus = (E × V) + (R × V̇)**" },
          { type: "text", content: "Ventilator pressure plus patient muscle pressure equals elastance × volume plus resistance × flow. This single equation is the theoretical basis for defining every mode of ventilation: in pressure control the clinician controls the LEFT side (pressure waveform); in volume control the RIGHT side (volume and flow waveform shapes)." },
          { type: "list", content: [
            "In VC-CMV: if elastance or airway resistance increases → peak inspiratory pressure (PIP) increases; volume stays constant",
            "In PC-CMV: if elastance or resistance increases → delivered volume and flow decrease; pressure looks identical",
            "Spontaneous effort adds Pmus to the left side — patient–ventilator interaction in one line"
          ] },
          { type: "text", content: "Bedside use: interpret every scalar and loop change by asking 'which term changed?'" }
        ],
        source: "Uploaded lecture deck — 'Equation of Motion' and applied respiratory physiology",
        related: ["Explain the pressure-time scalar in volume control", "What is stress index?", "Show me PCV vs VCV waveforms"]
      })
    },
    {
      id: "compliance",
      keywords: [{ word: "compliance", weight: 6 }, { word: "cstat", weight: 5 }, { word: "cdyn", weight: 5 }, { word: "static compliance", weight: 5 }, { word: "dynamic compliance", weight: 5 }, { word: "stiff", weight: 3 }],
      build: () => ({
        title: "Static vs dynamic compliance",
        blocks: [
          { type: "text", content: "**Static compliance** (measured with NO gas flow, from plateau pressure): Cstat = VT / (Pplat − PEEP). **Dynamic compliance** (measured during flow, from peak pressure): Cdyn = VT / (Ppeak − PEEP)." },
          { type: "list", content: [
            "Conditions that stiffen the lung (ARDS, atelectasis, oedema, fibrosis) decrease BOTH Cstat and Cdyn",
            "Conditions that narrow the airway (bronchospasm, secretions, small ETT) decrease Cdyn while Cstat stays normal",
            "Normal adult respiratory-system compliance: 40–80 mL/cmH2O (typical ~50–60)",
            "ARDS severity by compliance: mild > 40, moderate 40–20, severe < 20 mL/cmH2O"
          ] },
          { type: "text", content: "To differentiate low compliance from increased resistance, read the pressure–time scalar in volume control WITH an inspiratory pause: the gap between Ppeak and Pplat is the resistive component." }
        ],
        source: "Uploaded lecture deck — pressure–time scalar & compliance",
        related: ["What causes a raised peak airway pressure?", "How do I calculate driving pressure?", "Explain the PV loop"]
      })
    },
    {
      id: "high-pip",
      keywords: [{ word: "high pip", weight: 6 }, { word: "peak pressure", weight: 4 }, { word: "raised pressure", weight: 4 }, { word: "pressure alarm", weight: 5 }, { word: "pip rising", weight: 5 }, { word: "high pressure", weight: 4 }],
      build: () => ({
        title: "Sudden high peak airway pressure — systematic causes",
        blocks: [
          { type: "text", content: "PIP reflects BOTH airway resistance and compliance (lecture deck, fig 4). Work through causes in this order:" },
          { type: "steps", content: [
            "Patient: biting ETT, coughing, bucking, breath-stacking (asynchrony) → sedation, ETT inspection",
            "Airway: secretions, kinked tube, ETT obstruction, herniated cuff, tube migration to carina → suction, pass catheter, bronchoscope",
            "Pleura: pneumothorax (especially tension) → listen, ultrasound, decompress if tension",
            "Lung: atelectasis, oedema/ARDS worsening, bronchospasm, aspiration → treat cause",
            "Chest wall/abdomen: obesity, abdominal hypertension, bandages, prone position without adjustment",
            "Circuit: water in tubing, kinked circuit, closed HME occlusion → inspect circuit"
          ] },
          { type: "text", content: "Distinguish: PIP high with NORMAL Pplat → resistance problem (airway). PIP AND Pplat both high → compliance/lung problem. This is exactly why the inspiratory pause matters." }
        ],
        source: "Uploaded lecture deck — causes of raised peak airway pressures (fig 4)",
        related: ["Explain plateau pressure", "How do I calculate compliance?", "What is auto-PEEP?"]
      })
    },
    {
      id: "autopeep",
      keywords: [{ word: "auto-peep", weight: 6 }, { word: "autopeep", weight: 6 }, { word: "intrinsic peep", weight: 6 }, { word: "air trapping", weight: 4 }, { word: "dynamic hyperinflation", weight: 5 }, { word: "breath stacking", weight: 4 }],
      build: () => ({
        title: "Auto-PEEP (intrinsic PEEP) & dynamic hyperinflation",
        blocks: [
          { type: "text", content: "When expiratory time is insufficient for the lung's time constant, the next inspiration begins before exhalation completes → trapped gas → dynamic hyperinflation → positive end-expiratory alveolar pressure = auto-PEEP (intrinsic/occult PEEP)." },
          { type: "list", content: [
            "Causes: rapid respiratory rate, high VT, inspiratory time > expiratory time, obstructive disease (COPD/asthma), small-bore ETT",
            "Flow–time scalar: expiratory flow FAILS to return to baseline before the next breath (the key sign)",
            "Pressure–time scalar: end-expiratory occlusion (hold) manoeuvre reveals total PEEP after 2–3 s equilibration",
            "Consequences: hyperinflation raises intrathoracic pressure → hypotension (reduced venous return), barotrauma, and ineffective triggering (effort must first overcome intrinsic PEEP)"
          ] },
          { type: "warning", content: [
            "Fix by: ↓ rate, ↓ VT, prolong expiratory time (I:E 1:3–1:4), treat bronchospasm, larger ETT if needed",
            "External PEEP set BELOW intrinsic PEEP (~80%) eases triggering without increasing hyperinflation — but PEEP set ABOVE intrinsic PEEP worsens it"
          ] }
        ],
        source: "Uploaded lecture deck — dynamic hyperinflation & auto-PEEP",
        related: ["Why is my COPD patient not triggering breaths?", "How do I set external PEEP in COPD?", "Explain the flow-time scalar"]
      })
    },
    {
      id: "pv-loop",
      keywords: [{ word: "pv loop", weight: 6 }, { word: "pressure volume loop", weight: 6 }, { word: "inflection", weight: 5 }, { word: "hysteresis", weight: 6 }, { word: "overdistention", weight: 5 }, { word: "beaking", weight: 5 }, { word: "recruitment", weight: 3 }],
      build: () => ({
        title: "Pressure–Volume loop interpretation",
        blocks: [
          { type: "text", content: "The PV loop plots volume against pressure. Static loops (super-syringe) reveal the sigmoid compliance curve with lower (LIP) and upper (UIP) inflection points; dynamic loops at the bedside guide safe ventilation in the 'safe window' between recruitment and overdistention." },
          { type: "list", content: [
            "Volume control: low compliance → FLATTER loop (more pressure for same volume)",
            "Increased resistance → fatter loop with inspiratory sag (flow-resistive work expands)",
            "Overdistention → 'beaked' upper corner: terminal flattening because the lung stiffens as it fills — reduce VT or PEEP",
            "Pressure support → small trigger tail at bottom-left; a LARGER tail = more patient effort/work",
            "In PCV/PSV you cannot judge compliance from loop steepness (flow is decelerating) — the loop tilts down-right as compliance falls"
          ] },
          { type: "warning", content: ["Ventilating below LIP = atelectrauma (recruitment/de-recruitment cycling); above UIP = volutrauma. Aim for the linear safe window in between.", "In ARDS, recruitment occurs along the ENTIRE inflation limb — the 'single inflection point' model is an oversimplification."] }
        ],
        source: "Uploaded lecture deck — PV loop analysis (figs 6–13)",
        related: ["What is the stress index?", "Explain the flow-volume loop", "How do I set PEEP in ARDS?"]
      })
    },
    {
      id: "fv-loop",
      keywords: [{ word: "flow volume loop", weight: 6 }, { word: "fv loop", weight: 6 }, { word: "obstructive pattern", weight: 5 }, { word: "restrictive pattern", weight: 5 }, { word: "saw tooth", weight: 5 }, { word: "leak", weight: 3 }],
      build: () => ({
        title: "Flow–Volume loop interpretation",
        blocks: [
          { type: "text", content: "Flow–volume loops plot flow against volume. Inspiratory shape is set by the ventilator; expiratory shape is determined by the patient's respiratory mechanics (passive emptying)." },
          { type: "list", content: [
            "Extra-thoracic obstruction (e.g. tracheal lesion above the sternal notch): reduced INSPIRATORY flow, normal expiration",
            "Intra-thoracic obstruction (e.g. intrathoracic tracheomalacia/tumour): reduced EXPIRATORY flow, normal inspiration",
            "Fixed upper-airway obstruction (tracheal stenosis): flattening in BOTH phases",
            "Peripheral obstruction (acute severe asthma): low PEF + concave-down expiratory limb + flow fails to reach zero (intrinsic PEEP)",
            "Restrictive defect (pulmonary fibrosis): normal-shaped but SMALL loop",
            "Secretions: saw-toothed expiratory tracing → suction",
            "Leak (circuit/cuff/bronchopleural fistula): expiratory limb stops short of the volume axis — volume never returns to zero"
          ] }
        ],
        source: "Uploaded lecture deck — FV loop analysis (figs 18–23)",
        related: ["What is auto-PEEP?", "How do I recognize a circuit leak?", "Explain the flow-time scalar"]
      })
    },
    {
      id: "scalars",
      keywords: [{ word: "scalar", weight: 6 }, { word: "waveform", weight: 5 }, { word: "waveforms", weight: 5 }, { word: "pressure time", weight: 4 }, { word: "flow time", weight: 4 }, { word: "volume time", weight: 4 }, { word: "graphics", weight: 3 }],
      build: () => ({
        title: "Scalars (waveforms) — the 3-panel ventilator display",
        blocks: [
          { type: "text", content: "Scalars are real-time plots of a control variable (pressure cmH2O, volume mL, or flow L/min) on the Y axis against time (s) on the X axis. Loops plot one variable against another." },
          { type: "list", content: [
            "Pressure waveforms: rectangular (PCV) or rising-toward-plateau (VCV)",
            "Volume waveforms: ascending ramp (VCV) or S-shaped approaching plateau (PCV)",
            "Flow waveforms: square (VCV constant flow), decelerating ramp (PCV/PSV), sinusoidal (spontaneous), decaying exponential (expiration)",
            "Ramp/exponential patterns are called 'accelerating' or 'decelerating' flow patterns"
          ] },
          { type: "steps", content: [
            "Read flow first: what pattern? where does expiration end?",
            "Read pressure: PIP, shape, plateau, dips below PEEP?",
            "Read volume: delivered VT, stacking, leaks (expiratory VT < inspiratory)?",
            "Only then interpret loops (PV for compliance/overdistention, FV for obstruction)"
          ] }
        ],
        source: "Uploaded lecture deck — ventilator display classification & scalars",
        related: ["Open the Waveform Lab", "Explain the PV loop", "What is flow asynchrony?"]
      })
    },
    {
      id: "stress-index",
      keywords: [{ word: "stress index", weight: 7 }, { word: "stress", weight: 3 }],
      build: () => ({
        title: "Stress index",
        blocks: [
          { type: "text", content: "During constant-flow ventilation (≥ 0.8 s), the SHAPE of the pressure–time scalar tracks tidal recruitment vs overdistention. Fit P = a·tᵇ + c: the exponent b is the stress index." },
          { type: "list", content: [
            "Stress index 0.9–1.1 (straight line): compliance constant through the breath — the safe window",
            "< 0.9 (downward concavity): progressive RECRUITMENT during the breath (atelectrauma risk) → consider more PEEP",
            "> 1.1 (upward convexity): OVERDISTENTION (hyperinflation) → consider less VT or less PEEP"
          ] },
          { type: "text", content: "Grasso 2007: PEEP titrated to stress index 0.9–1.1 was feasible after 12 h of ARDSNet ventilation. Ranieri 2000: straight-line ventilation reduced injurious stress vs concave/convex patterns in the rat model." }
        ],
        source: "Uploaded lecture deck — stress index (Ranieri, Grasso)",
        related: ["How do I set PEEP in ARDS?", "What is driving pressure?", "Explain the PV loop"]
      })
    },
    {
      id: "driving-pressure",
      keywords: [{ word: "driving pressure", weight: 6 }, { word: "delta p", weight: 4 }, { word: "amato", weight: 4 }],
      build: () => ({
        title: "Driving pressure (ΔP = VT / Cstat)",
        blocks: [
          { type: "text", content: "Driving pressure = Pplat − PEEP = VT / Cstat. It captures how much the tidal breath DISTENDS the actually-aerated lung, independent of VT settings based on predicted body weight." },
          { type: "list", content: [
            "Target ≤ 15 cmH2O; each 1 cmH2O above ~15 raises mortality (Amato 2015, NEJM — 3562 ARDS patients)",
            "ΔP outperformed VT and Pplat as an outcome predictor",
            "Lower it by: reducing VT, increasing Cstat (recruitment where recruitable: PEEP titration, prone positioning, draining effusions), or both"
          ] },
          { type: "warning", content: ["Pplat < 30 does NOT guarantee a safe ΔP: a stiff lung with small VT can still generate ΔP > 15 — always compute it."] }
        ],
        source: "Amato 2015 NEJM + Ventilator AI knowledge base",
        related: ["What are ARDSNet settings?", "How do I compute compliance?", "What is the stress index?"]
      })
    },
    {
      id: "peep-setting",
      keywords: [{ word: "peep", weight: 5 }, { word: "best peep", weight: 6 }, { word: "peep titration", weight: 6 }, { word: "ardsnet table", weight: 6 }, { word: "optimal peep", weight: 6 }],
      build: () => ({
        title: "Setting PEEP — practical approaches",
        blocks: [
          { type: "text", content: "PEEP keeps alveoli open above closing volume — above the lower inflection region of the PV curve — trading oxygenation for intrathoracic pressure." },
          { type: "list", content: [
            "ARDSNet FiO2/PEEP tables: lower-PEEP (5–24) and higher-PEEP (5–24) columns — the pragmatic default (use the PEEP/FiO2 calculator in the Calculators tab)",
            "Best-compliance / decremental PEEP: after recruitment, step PEEP down and keep the step with the best compliance (highest recruited volume for the least pressure)",
            "Driving-pressure guided (Amato): choose the PEEP giving lowest ΔP",
            "Stress-index guided: PEEP adjusted until pressure scalar is straight (index 0.9–1.1)",
            "Esophageal manometry: keep end-expiratory transpulmonary pressure ~ 0 to +2 (avoid lung collapse)"
          ] },
          { type: "warning", content: ["In obstructive disease, external PEEP should stay BELOW measured intrinsic PEEP (roughly ≤ 80% of it) — above that you ADD hyperinflation.", "In septic/preload-dependent shock, PEEP escalation can crash MAP — titrate with haemodynamics in view."] }
        ],
        source: "ARDSNet (ARMA/ALVEOLI), Amato 2015, Grasso 2007 + knowledge base",
        related: ["What is the stress index?", "COPD strategy", "ARDS ventilation strategy"]
      })
    },
    {
      id: "asynchrony",
      keywords: [{ word: "asynchrony", weight: 7 }, { word: "asynchronies", weight: 6 }, { word: "triggering", weight: 4 }, { word: "double trigger", weight: 5 }, { word: "ineffective trigger", weight: 5 }, { word: "flow starvation", weight: 5 }, { word: "patient ventilator", weight: 5 }],
      build: () => {
        const lines = ASYNCHRONY_PATTERNS.map((p) => `**${p.name}** — ${p.description.split(".")[0]}. Fix: ${p.action.split(".")[0]}.`);
        return {
          title: "Patient–ventilator asynchrony — the 6 families",
          blocks: [
            { type: "text", content: "Asynchrony is the 'tug of war' between ventilator timing and neural respiratory drive: discomfort, ↑WOB, ↑sedation, weaning failure. It occurs at each phase of the breath cycle: TRIGGER, FLOW (inspiration), and CYCLING (termination)." },
            { type: "list", content: lines },
            { type: "text", content: "Open the Waveform Lab to see how each pattern looks on the scalars, and the Asynchrony panel for recognition/fix details." }
          ],
          source: "Uploaded lecture deck — signs of asynchrony (figs 24–33)",
          related: ["Why does my patient have dips below PEEP?", "What is rise time?", "How do I fix ineffective triggering?"]
        };
      }
    },
    {
      id: "rise-time",
      keywords: [{ word: "rise time", weight: 7 }, { word: "overshoot", weight: 5 }, { word: "concavity", weight: 5 }],
      build: () => ({
        title: "Rise time (pressure ramp)",
        blocks: [
          { type: "text", content: "Rise time = time for the ventilator to reach the set pressure in pressure-targeted breaths (PCV/PSV). It sets initial flow: faster rise = higher initial flow." },
          { type: "list", content: [
            "Normal setting < 0.2 s",
            "Too FAST → pressure overshoot (spike) at inspiration start — initial flow exceeds demand",
            "Too SLOW → concave pressure onset = flow starvation, ↑WOB; patient may fight the ventilator",
            "In PSV with COPD, pair a slower rise with flow-cycle raised to 40–50% to avoid air trapping"
          ] }
        ],
        source: "Uploaded lecture deck — rise time (figs 30–32)",
        related: ["What is flow asynchrony?", "Explain PSV cycling", "Open the Waveform Lab"]
      })
    },
    {
      id: "niv",
      keywords: [{ word: "niv", weight: 6 }, { word: "non-invasive", weight: 6 }, { word: "noninvasive", weight: 5 }, { word: "mask", weight: 3 }, { word: "bipap", weight: 5 }, { word: "helmet", weight: 3 }],
      build: () => modeAnswer("bipap-niv")
    },
    {
      id: "hfnc",
      keywords: [{ word: "hfnc", weight: 6 }, { word: "high flow", weight: 5 }, { word: "nasal cannula", weight: 5 }, { word: "rox", weight: 4 }],
      build: () => modeAnswer("hfnc")
    },
    {
      id: "prone",
      keywords: [{ word: "prone", weight: 7 }, { word: "proning", weight: 7 }, { word: "positioning", weight: 3 }],
      build: () => ({
        title: "Prone positioning in ARDS",
        blocks: [
          { type: "text", content: "Prone positioning recruits the dorsal (dependent) lung regions, homogenizes transpulmonary pressure, reduces shunt, and protects from VILI." },
          { type: "list", content: [
            "Indication: moderate–severe ARDS (P/F < 150) despite optimized ventilation (PEEP, VT 6 mL/kg)",
            "Duration: ≥ 16 consecutive hours per session (PROSEVA)",
            "PROSEVA 2013: 16 h prone sessions reduced 28-day mortality (16% vs 32.8%) in P/F < 150",
            "Complications: pressure sores, tube/catheter dislodgement, facial oedema — team protocol needed"
          ] },
          { type: "warning", content: ["Contraindications: unstable spine, open abdomen, raised ICP with unstable physiology, hemodynamic instability, recent tracheal surgery."] }
        ],
        source: "PROSEVA 2013 NEJM + knowledge base",
        related: ["ARDS ventilation strategy", "How do I set PEEP in ARDS?", "What is the oxygenation index?"]
      })
    },
    {
      id: "hypoxemia",
      keywords: [{ word: "hypoxemia", weight: 6 }, { word: "hypoxaemia", weight: 6 }, { word: "desaturation", weight: 6 }, { word: "saturation falling", weight: 5 }, { word: "low spo2", weight: 5 }, { word: "oxygenation", weight: 3 }],
      build: () => ({
        title: "Sudden hypoxaemia on the ventilator — the DOPE + systematic approach",
        blocks: [
          { type: "steps", content: [
            "D — Displacement of the ETT (extubation, right main-stem) → check depth, listen to both sides",
            "O — Obstruction (secretions, kink, biting) → suction, pass catheter",
            "P — Pneumothorax → listen, ultrasound, chest drain if tension",
            "E — Equipment failure (circuit disconnect, O2 supply, valve) → check FiO2 delivery, circuit integrity",
            "Then patient causes: worsening ARDS/oedema, atelectasis (recruitment manoeuvre), bronchospasm, PE, fever/↑VO2, anaemia, low cardiac output (shunt ↑)"
          ] },
          { type: "text", content: "Quick wins while diagnosing: FiO2 100%, recruitment manoeuvre (CPAP 30–40 for 20–40 s), verify haemodynamics, and look at the scalars — a sudden flat volume trace means circuit disconnect or huge leak." }
        ],
        source: "Ventilator AI knowledge base — emergency algorithms (ATLS-derived DOPE)",
        related: ["What causes a raised PIP?", "ARDS strategy", "How do I do a recruitment manoeuvre?"]
      })
    },
    {
      id: "ibw",
      keywords: [{ word: "ibw", weight: 6 }, { word: "ideal body weight", weight: 6 }, { word: "predicted body weight", weight: 6 }, { word: "tidal volume calculation", weight: 5 }, { word: "ml per kg", weight: 4 }, { word: "how much tidal volume", weight: 5 }],
      build: () => ({
        title: "Ideal body weight & lung-protective tidal volume",
        blocks: [
          { type: "text", content: "Ventilator VT is ALWAYS calculated from IDEAL (predicted) body weight based on HEIGHT and SEX — never actual weight (obese patients get dramatically smaller VT than actual-weight dosing suggests)." },
          { type: "list", content: [
            "Male IBW (kg) = 50 + 2.3 × (inches over 5 feet)",
            "Female IBW (kg) = 45.5 + 2.3 × (inches over 5 feet)",
            "Lung-protective VT: 6 mL/kg IBW standard; 4–6 in ARDS; up to 8 in near-normal lungs",
            "Example: 170 cm male → IBW ≈ 65 kg → VT 6 mL/kg ≈ 390 mL"
          ] },
          { type: "text", content: "Use the IBW/VT calculator in the Calculators tab — it also shows compliance-based driving pressure implications." }
        ],
        source: "ARDSNet ARMA + knowledge base",
        related: ["ARDS strategy", "What is driving pressure?", "Obesity ventilation"]
      })
    },
    {
      id: "greeting",
      keywords: [{ word: "hello", weight: 3 }, { word: "hi", weight: 3 }, { word: "help", weight: 3 }, { word: "what can you do", weight: 5 }],
      build: () => ({
        title: "Ventilator AI — offline clinical assistant",
        blocks: [
          { type: "text", content: "I run 100% locally (no internet needed) on a knowledge base built from the uploaded 'Lungs and Ventilator' lecture plus standard critical-care references (ARDSNet, PROSEVA, Brain Trauma Foundation, etc.)." },
          { type: "list", content: [
            "Ask by CONDITION: 'How do I ventilate ARDS?', 'COPD initial settings', 'Weaning criteria'",
            "Ask by MODE: 'Explain APRV', 'PSV vs PCV', 'When to use PRVC?'",
            "Ask by PROBLEM: 'Why is PIP high?', 'Patient not triggering', 'Explain this PV loop'",
            "Ask by CONCEPT: 'Equation of motion', 'Auto-PEEP', 'Stress index', 'Rise time'"
          ] },
          { type: "text", content: "Try the quick-question chips below, or use the Calculators and Waveform Lab tabs for numbers and graphics." }
        ],
        source: "Ventilator AI engine v1",
        related: ["How do I ventilate ARDS?", "Why is PIP high?", "Explain the equation of motion", "Weaning criteria"]
      })
    },
    {
      id: "capnography",
      keywords: [{ word: "etco2", weight: 6 }, { word: "capnography", weight: 6 }, { word: "end tidal", weight: 5 }, { word: "waveform capno", weight: 4 }],
      build: () => ({
        title: "End-tidal CO2 (capnography) interpretation",
        blocks: [
          { type: "text", content: "ETCO2 tracks alveolar CO2 — normally 2–5 mmHg below PaCO2. The PaCO2–ETCO2 gradient is effectively a dead-space readout (see the Bohr calculator)." },
          { type: "list", content: [
            "Rising ETCO2: hypoventilation (rate/VT too low), ↑ metabolic CO2 (fever, sepsis, malignant hyperthermia), rebreathing (exhausted soda lime)",
            "Falling ETCO2: hyperventilation, falling cardiac output / PE (sudden drop = catastrophic — embolus, arrest), circuit leak, dilution",
            "Sudden ZERO: circuit disconnect, obstructed tube, or apnoea",
            "Gradient widening (PaCO2 ↑, ETCO2 flat): rising dead space — bad prognostic sign in ARDS (Nuckton 2002)"
          ] }
        ],
        source: "Ventilator AI knowledge base",
        related: ["How do I calculate dead space?", "Post-arrest ventilation targets", "Why is my COPD patient hypercapnic?"]
      })
    },
    {
      id: "sedation",
      keywords: [{ word: "sedation", weight: 5 }, { word: "paralysis", weight: 5 }, { word: "neuromuscular blockade", weight: 5 }, { word: "cisatracurium", weight: 5 }, { word: "rass", weight: 4 }],
      build: () => ({
        title: "Sedation & paralysis during ventilation",
        blocks: [
          { type: "text", content: "Most asynchrony is first a sedation problem; most delirium is sedation iatrogenesis. Target light sedation (RASS −2 to 0) once the acute phase allows." },
          { type: "list", content: [
            "Deep sedation/paralysis first 48 h: consider in moderate-severe ARDS (P/F < 150) — Papazian 2010 showed benefit of 48 h cisatracurium",
            "Bucking/ventilator fighting: pain first (analgesia-first), then propofol/midazolam; paralysis LAST — never paralyse an awake patient",
            "Daily sedation interruption + SAT/SBT pairing shortens ventilation days",
            "Early mobility + delirium screening (CAM-ICU) are part of lung-protective care"
          ] }
        ],
        source: "Papazian 2010 NEJM, PADIS guidelines + knowledge base",
        related: ["What is flow asynchrony?", "Weaning criteria", "ARDS strategy"]
      })
    }
  ];
  var STOPWORDS = new Set([
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "what",
    "how",
    "why",
    "when",
    "do",
    "does",
    "did",
    "for",
    "to",
    "of",
    "in",
    "on",
    "with",
    "and",
    "or",
    "my",
    "me",
    "i",
    "should",
    "would",
    "can",
    "could",
    "tell",
    "about",
    "explain",
    "give",
    "show",
    "patient",
    "ventilator",
    "please",
    "find",
    "value",
    "calculate",
    "use",
    "using"
  ]);
  function tokenize(q) {
    return q.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOPWORDS.has(w));
  }
  function askAI(question) {
    const q = question.toLowerCase().trim();
    const tokens = tokenize(question);
    let best = null;
    const scores = [];
    for (const entry of KB) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (q.includes(kw.word)) {
          score += kw.weight;
          if (tokens.includes(kw.word))
            score += kw.weight * 0.5;
        }
      }
      if (score > 0)
        scores.push({ entry, score });
    }
    scores.sort((a, b) => b.score - a.score);
    best = scores[0] ?? null;
    if (best && best.score >= 4) {
      return best.entry.build();
    }
    return {
      title: "I couldn't match that confidently",
      blocks: [
        { type: "text", content: "I'm a rule-based offline assistant, so I answer best when the question mentions a condition (ARDS, COPD, asthma, brain injury...), a mode (PSV, APRV, PRVC...), a problem (high PIP, not triggering, auto-PEEP...), or a concept (equation of motion, stress index, PV loop...)." },
        { type: "list", content: [
          "Try: 'How do I ventilate ARDS?'",
          "Try: 'Why is the peak pressure high?'",
          "Try: 'COPD initial settings'",
          "Try: 'Explain APRV'",
          "Try: 'Weaning criteria'"
        ] }
      ],
      source: "Ventilator AI engine v1",
      related: ["How do I ventilate ARDS?", "Why is PIP high?", "Weaning criteria", "Explain auto-PEEP"]
    };
  }
  function consult(i) {
    if (i.condition !== "unknown") {
      const sc = PATIENT_SCENARIOS.find((s) => s.id === i.condition);
      if (sc) {
        let modeId = sc.primaryMode;
        const rationale = [];
        if (i.hemodynamics === "unstable" && (sc.id === "cpe" || sc.id === "sepsis")) {
          rationale.push("Haemodynamic instability tempers aggressive intrathoracic pressure: prioritize lower mean airway pressure and vasopressor support.");
        }
        if (i.spontEffort === "none" && (modeId === "psv" || modeId === "cpap" || modeId === "bipap-niv" || modeId === "hfnc")) {
          modeId = sc.alternativeModes[0]?.id ?? "vc-ac";
          rationale.push("No spontaneous effort → a spontaneous-only mode is unsafe; switched to a mandatory-support alternative with apnoea backup.");
        }
        if (i.oxygenation === "severe" && sc.id === "ards") {
          rationale.push("Severe hypoxaemia: escalate PEEP per higher-PEEP ARDSNet table, consider prone ≥ 16 h (P/F < 150), paralysis 48 h, and ECMO referral if refractory.");
        }
        if (i.noninvasivePreferred && sc.id !== "asthma" && i.spontEffort !== "none" && i.hemodynamics === "stable" && i.oxygenation !== "severe" && (sc.alternativeModes.some((a) => a.id === "bipap-niv" || a.id === "cpap") || sc.primaryMode === "bipap-niv" || sc.primaryMode === "cpap")) {
          if (sc.primaryMode === "bipap-niv" || sc.primaryMode === "cpap" || sc.primaryMode === "hfnc") {
            modeId = sc.primaryMode;
            rationale.push("Stable haemodynamics with preserved drive → non-invasive support is appropriate first; set clear failure criteria (RR > 30, pH < 7.25, deteriorating consciousness → intubate).");
          }
        }
        const mode = VENT_MODES.find((m) => m.id === modeId) ?? VENT_MODES[0];
        return {
          headline: `${mode.name} — for ${sc.name}${i.oxygenation === "severe" ? " with severe hypoxaemia" : ""}`,
          modeId: mode.id,
          rationale: [sc.primaryModeNote, ...rationale],
          settings: sc.initialSettings.map((x) => `${x.parameter}: ${x.value}`),
          cautions: sc.pitfalls.slice(0, 4),
          alternates: sc.alternativeModes
        };
      }
    }
    if (i.spontEffort === "none") {
      return {
        headline: "Volume Control — Assist/Control (guaranteed ventilation)",
        modeId: "vc-ac",
        rationale: [
          "No spontaneous effort: a fully mandatory mode with apnoea backup is required.",
          "Volume control guarantees minute ventilation and gives measurable Pplat/driving pressure.",
          i.co2 === "retaining" ? "CO2 retention: adjust rate first (watch auto-PEEP), consider permissive hypercapnia pH ≥ 7.20." : "Adjust rate to normalize PaCO2.",
          i.oxygenation === "severe" ? "Severe hypoxaemia: follow ARDSNet higher-PEEP path; reassess for ARDS." : "Titrate FiO2/PEEP to oxygenation targets."
        ],
        settings: ["Mode: VC-AC", "VT: 6 mL/kg IBW (4–6 if ARDS)", "RR: 14–20 (titrate to PaCO2)", "PEEP: 5 → ARDSNet table", "Pplat: < 30 · ΔP: < 15"],
        cautions: ["Rising PIP at constant settings = worsening mechanics or asynchrony — run the high-PIP causes checklist."],
        alternates: [{ modeId: "pc-ac", note: "Equivalent with VT monitoring" }, { modeId: "prvc", note: "Self-adapting dual control" }]
      };
    }
    if (i.oxygenation === "severe" || i.oxygenation === "impaired" && i.spontEffort === "weak") {
      return {
        headline: "Pressure Support (if stable) or PRVC/VC-AC — with escalation pathway",
        modeId: i.spontEffort === "strong" ? "psv" : "prvc",
        rationale: [
          i.spontEffort === "strong" ? "Strong spontaneous drive: PSV matches demand best; ensure adequate support (VT ~ 6 mL/kg, RR < 30)." : "Weak effort with impaired oxygenation: dual-control support protects against fatigue while preserving VT.",
          i.oxygenation === "severe" ? "Severe hypoxaemia: reassess for ARDS; escalate FiO2/PEEP per table; consider prone/ECMO pathway." : ""
        ].filter(Boolean),
        settings: ["Mode: as above", "Support: PS 10–15 (or VT target 6 mL/kg IBW)", "PEEP: 5–10", "FiO2: titrate SpO2 92–96% (88–95 if ARDS)"],
        cautions: ["Reassess frequently — the weak-effort patient can decompensate quietly; have intubation criteria predefined."],
        alternates: [{ modeId: "hfnc", note: "If hypoxaemic WITHOUT hypercapnia and hemodynamically stable" }, { modeId: "bipap-niv", note: "If hypercapnic and NIV-suitable" }]
      };
    }
    return {
      headline: "Trial of non-invasive support first (HFNC or NIV)",
      modeId: i.co2 === "retaining" ? "bipap-niv" : "hfnc",
      rationale: [
        i.co2 === "retaining" ? "Hypercapnia with preserved drive: BiPAP supports ventilation (IPAP−EPAP drives CO2 clearance); first-line in COPD-type failure." : "Hypoxaemic failure without hypercapnia: HFNC is first-line — comfortable, dead-space washout, mild PEEP effect. Track the ROX index.",
        "Predefine failure criteria and an intubation timeline — do not persist if deteriorating."
      ],
      settings: i.co2 === "retaining" ? ["IPAP 10–15 (↑ for CO2)", "EPAP 4–6", "FiO2: SpO2 88–92% in COPD / 92–96% otherwise"] : ["Flow 40–60 L/min", "FiO2: SpO2 ≥ 92%", "Reassess ROX at 2, 6, 12 h"],
      cautions: ["NIV/HFNC failure signs: RR not falling, rising heart rate, acidosis, encephalopathy — escalate early."],
      alternates: [{ modeId: "psv", note: "If intubation becomes needed" }]
    };
  }
  var QUICK_QUESTIONS = [
    "How do I ventilate ARDS?",
    "COPD initial settings",
    "Why is the peak pressure high?",
    "Explain APRV",
    "Weaning criteria",
    "What is auto-PEEP?",
    "Equation of motion",
    "PSV vs PCV",
    "How do I set PEEP?",
    "Acute asthma ventilation"
  ];

  // src/lib/ventilator/calculators.ts
  var fmt = (n, digits = 1) => n === null || !isFinite(n) ? "—" : n.toFixed(digits);
  function calcIBW(sex, heightCm) {
    if (!heightCm || heightCm < 100 || heightCm > 230)
      return null;
    const inchesOver150 = (heightCm - 152.4) / 2.54;
    const base = sex === "male" ? 50 : 45.5;
    return Math.max(base + 2.3 * inchesOver150, 0);
  }
  function calcTidalVolumes(ibw) {
    if (!ibw)
      return null;
    return {
      ml4: Math.round(ibw * 4),
      ml6: Math.round(ibw * 6),
      ml8: Math.round(ibw * 8)
    };
  }
  function calcMinuteVentilation(vt, rr, deadSpace) {
    const ve = vt * rr / 1000;
    const va = (vt - deadSpace) * rr / 1000;
    return { ve, va };
  }
  function calcCompliance(vt, ppeak, pplat, peep, flowLpm) {
    const cstat = pplat - peep > 0 ? vt / (pplat - peep) : null;
    const cdyn = ppeak - peep > 0 ? vt / (ppeak - peep) : null;
    const raw = flowLpm > 0 ? (ppeak - pplat) / (flowLpm / 60) : null;
    return { cstat, cdyn, raw };
  }
  function interpretCstat(c) {
    if (c === null)
      return { label: "Static compliance", value: null, unit: "mL/cmH2O", status: "info", interpretation: "Enter valid values (Pplat must exceed PEEP)." };
    let status = "normal";
    let text = "";
    if (c < 20) {
      status = "danger";
      text = "Severely reduced — late ARDS, chest wall restriction, large effusion, abdominal hypertension, or pneumothorax. Consider ARDS rescue measures.";
    } else if (c < 30) {
      status = "caution";
      text = "Markedly reduced — consistent with moderate-severe ARDS, atelectasis or pulmonary oedema. Keep VT 4–6 mL/kg IBW.";
    } else if (c < 40) {
      status = "caution";
      text = "Mildly reduced — early ARDS/atelectasis range. Monitor driving pressure.";
    } else if (c <= 80) {
      status = "normal";
      text = "Normal respiratory-system compliance (40–80 mL/cmH2O).";
    } else {
      status = "caution";
      text = "Higher than normal — check for auto-PEEP under-measurement, or emphysema. Ensure Pplat measured with true pause.";
    }
    return { label: "Static compliance (Cstat)", value: c, unit: "mL/cmH2O", status, interpretation: text };
  }
  function calcDrivingPressure(vt, cstat, pplat, peep) {
    if (pplat > peep)
      return pplat - peep;
    if (cstat && cstat > 0)
      return vt / cstat;
    return null;
  }
  function interpretDrivingPressure(dp) {
    if (dp === null)
      return { label: "Driving pressure (ΔP)", value: null, unit: "cmH2O", status: "info", interpretation: "Enter Pplat and PEEP (or compliance)." };
    let status = "normal";
    let text = "";
    if (dp <= 15) {
      status = "normal";
      text = "Within the lung-protective target (≤ 15 cmH2O). Amato 2015: ΔP outperformed VT & Pplat as a survival predictor in ARDS.";
    } else if (dp <= 20) {
      status = "caution";
      text = "Elevated — each 1 cmH2O above 15 raises mortality risk. Reduce VT (toward 4 mL/kg IBW) and/or optimize PEEP on the compliant portion of the PV curve.";
    } else {
      status = "danger";
      text = "High — strongly associated with mortality. Reassess: lower VT, reposition, drain effusions, treat obstruction, consider proning/paralysis if P/F < 150.";
    }
    return { label: "Driving pressure (ΔP)", value: dp, unit: "cmH2O", status, interpretation: text };
  }
  var ARDSNET_LOW_PEEP = [
    { fio2: 0.3, peep: 5 },
    { fio2: 0.4, peep: 5 },
    { fio2: 0.4, peep: 8 },
    { fio2: 0.5, peep: 8 },
    { fio2: 0.5, peep: 10 },
    { fio2: 0.6, peep: 10 },
    { fio2: 0.7, peep: 10 },
    { fio2: 0.7, peep: 12 },
    { fio2: 0.7, peep: 14 },
    { fio2: 0.8, peep: 14 },
    { fio2: 0.9, peep: 14 },
    { fio2: 0.9, peep: 16 },
    { fio2: 0.9, peep: 18 },
    { fio2: 1, peep: 18 },
    { fio2: 1, peep: 20 },
    { fio2: 1, peep: 22 },
    { fio2: 1, peep: 24 }
  ];
  var ARDSNET_HIGH_PEEP = [
    { fio2: 0.3, peep: 5 },
    { fio2: 0.3, peep: 8 },
    { fio2: 0.3, peep: 10 },
    { fio2: 0.3, peep: 12 },
    { fio2: 0.3, peep: 14 },
    { fio2: 0.4, peep: 14 },
    { fio2: 0.4, peep: 16 },
    { fio2: 0.4, peep: 18 },
    { fio2: 0.5, peep: 18 },
    { fio2: 0.5, peep: 20 },
    { fio2: 0.5, peep: 22 },
    { fio2: 0.6, peep: 22 },
    { fio2: 0.7, peep: 22 },
    { fio2: 0.8, peep: 22 },
    { fio2: 0.9, peep: 22 },
    { fio2: 1, peep: 22 },
    { fio2: 1, peep: 24 }
  ];
  function ardsnetStep(fio2, table) {
    const rows = table === "low" ? ARDSNET_LOW_PEEP : ARDSNET_HIGH_PEEP;
    const valid = rows.filter((r) => r.fio2 <= fio2 + 0.001);
    const row = valid.length ? valid[valid.length - 1] : rows[0];
    return row.peep;
  }
  function calcRSBI(rr, vtL) {
    if (vtL <= 0)
      return null;
    return rr / vtL;
  }
  function interpretRSBI(rsbi) {
    if (rsbi === null)
      return { label: "RSBI (f/VT)", value: null, unit: "breaths/min/L", status: "info", interpretation: "Enter spontaneous rate and VT (in litres)." };
    let status = "normal";
    let text = "";
    if (rsbi < 80) {
      status = "normal";
      text = "Strongly favourable for weaning. Combine with mental status, secretion control and haemodynamics before extubation.";
    } else if (rsbi < 105) {
      status = "normal";
      text = "Below the classic 105 threshold (Yang & Tobin 1991) — SBT likely to be tolerated. PPV 78% for successful extubation.";
    } else if (rsbi < 130) {
      status = "caution";
      text = "Borderline — rapid shallow breathing is emerging. Look for fatiguing pattern over the SBT; consider 30-min trial with close monitoring.";
    } else {
      status = "danger";
      text = "High — predicts SBT failure. Evaluate the load-capacity imbalance: pain, auto-PEEP, delirium, cardiac load, electrolytes, diaphragm weakness.";
    }
    return { label: "RSBI (f/VT)", value: rsbi, unit: "breaths/min/L", status, interpretation: text };
  }
  function calcPF(pao2, fio2) {
    if (fio2 <= 0)
      return null;
    return pao2 / fio2;
  }
  function interpretPF(pf) {
    if (pf === null)
      return { label: "PaO2/FiO2 (P/F)", value: null, unit: "mmHg", status: "info", interpretation: "Enter PaO2 and FiO2." };
    let status = "normal";
    let text = "";
    if (pf >= 400) {
      status = "normal";
      text = "Normal oxygenation.";
    } else if (pf >= 300) {
      status = "normal";
      text = "Mild impairment (300–400). If acute bilateral infiltrates + non-cardiogenic: Berlin 'mild ARDS' boundary is < 300.";
    } else if (pf >= 200) {
      status = "caution";
      text = "Mild ARDS range (200–300) per Berlin definition (with bilateral infiltrates, non-cardiogenic origin, within 1 week).";
    } else if (pf >= 100) {
      status = "caution";
      text = "Moderate ARDS (100–200). Optimize PEEP, consider proning if < 150 despite 6 mL/kg.";
    } else {
      status = "danger";
      text = "Severe ARDS (< 100). Full rescue pathway: proning ≥ 16 h/day, consider paralysis 48 h, evaluate for ECMO referral.";
    }
    return { label: "PaO2/FiO2 (P/F)", value: pf, unit: "mmHg", status, interpretation: text };
  }
  function calcOI(map, fio2, pao2) {
    if (pao2 <= 0)
      return null;
    return map * fio2 * 100 / pao2;
  }
  function interpretOI(oi) {
    if (oi === null)
      return { label: "Oxygenation Index", value: null, unit: "", status: "info", interpretation: "Enter MAP, FiO2, PaO2." };
    let status = "normal";
    let text = "";
    if (oi < 4) {
      status = "normal";
      text = "OI < 4 — conventional support sufficient.";
    } else if (oi < 16) {
      status = "caution";
      text = "OI 4–16 — significant oxygenation failure; escalate PEEP/optimization strategies.";
    } else {
      status = "danger";
      text = "OI ≥ 16 — severe failure; ECMO consultation thresholds in adults are commonly OI ≥ 20–25 (paediatric ≥ 40).";
    }
    return { label: "Oxygenation Index", value: oi, unit: "", status, interpretation: text };
  }
  function calcAlveolarGas(fio2, paco2, patm = 760, ph2o = 47) {
    const pao2Alv = fio2 * (patm - ph2o) - paco2 / 0.8;
    return pao2Alv;
  }
  function calcAaGradient(pao2Alv, pao2Art, age = 40) {
    const aa = pao2Alv - pao2Art;
    const expected = 2.5 + 0.21 * age;
    return { aa, expected };
  }
  function interpretAa(age, aa) {
    const expected = 2.5 + 0.21 * age;
    const ratio = aa / expected;
    let status = "normal";
    let text = "";
    if (ratio <= 1.5) {
      status = "normal";
      text = `A–a gradient within expected range for age (~${expected.toFixed(0)} mmHg). Hypoxaemia, if present, is likely hypoventilation or low FiO2 rather than V/Q mismatch.`;
    } else if (ratio <= 2.5) {
      status = "caution";
      text = `Mildly widened vs age-expected (~${expected.toFixed(0)} mmHg). Consider early V/Q mismatch, mild ARDS, early pulmonary embolus.`;
    } else {
      status = "danger";
      text = `Markedly widened vs age-expected (~${expected.toFixed(0)} mmHg). Think shunt (ARDS, oedema), V/Q mismatch (PE, pneumonia), or diffusion limitation. On 100% O2, shunt > 30% possible.`;
    }
    return { label: "A–a gradient", value: aa, unit: "mmHg", status, interpretation: text };
  }
  function calcDeadSpace(vt, paco2, etco2) {
    if (paco2 <= 0)
      return null;
    const vdvt = (paco2 - etco2) / paco2;
    const vd = vt * vdvt;
    return { vdvt, vd };
  }
  function interpretVdVt(vdvt) {
    if (vdvt === null)
      return { label: "Vd/Vt (Bohr)", value: null, unit: "", status: "info", interpretation: "Enter PaCO2 and ETCO2." };
    let status = "normal";
    let text = "";
    if (vdvt < 0.4) {
      status = "normal";
      text = "Normal dead-space fraction (~0.2–0.4 in intubated patients; 0.3 anatomical + circuit).";
    } else if (vdvt < 0.6) {
      status = "caution";
      text = "Elevated dead space — seen in ARDS (Vd/Vt independently predicts mortality), PE, COPD, hypovolaemia (West zone 1).";
    } else {
      status = "danger";
      text = "Severely elevated — high dead space is one of the strongest mortality predictors in ARDS (Nuckton 2002). Evaluate for PE, check cardiac output, consider ECLS if refractory.";
    }
    return { label: "Vd/Vt (Bohr)", value: vdvt, unit: "", status, interpretation: text };
  }
  function calcTimeConstant(compliance, resistance) {
    const tau = compliance / 1000 * resistance;
    const t95 = tau * 3;
    const t99 = tau * 5;
    return { tau, t95, t99 };
  }
  function expiratoryEmptying(frac) {
    return [1, 2, 3, 4, 5].map((n) => Math.exp(-n) * 100);
  }
  function autoPeepRisk(te, tau) {
    if (tau <= 0)
      return { risk: "low", remainingPct: 0 };
    const remaining = Math.exp(-te / tau) * 100;
    if (remaining < 5)
      return { risk: "low", remainingPct: remaining };
    if (remaining < 20)
      return { risk: "moderate", remainingPct: remaining };
    return { risk: "high", remainingPct: remaining };
  }
  function calcMeanAirwayPressure(pip, peep, ti, rr, tplat = 0) {
    const ttot = 60 / rr;
    const pmean = peep + (pip - peep) * ((ti + tplat / 2) / ttot);
    return pmean;
  }
  function calcIE(ti, te) {
    if (ti <= 0 || te <= 0)
      return "—";
    const ratio = te / ti;
    return `1:${ratio.toFixed(1)}`;
  }
  function calcCorrectedVt(setVt, circuitCompliance, peakPressure) {
    const lost = circuitCompliance * peakPressure;
    return Math.max(setVt - lost, 0);
  }
  function interpretStressIndex(si) {
    let status = "normal";
    let text = "";
    if (si < 0.9) {
      status = "caution";
      text = "Downward concavity (stress index < 0.9): progressive recruitment during the breath — suggests tidal recruitment / atelectrauma. Consider MORE PEEP (shift to the linear safe window).";
    } else if (si <= 1.1) {
      status = "normal";
      text = "Straight pressure rise (0.9–1.1): compliance constant through the breath — the safe window between recruitment and overdistention (Ranieri, Grasso).";
    } else {
      status = "danger";
      text = "Upward convexity (stress index > 1.1): tidal overdistention — hyperinflation injury. Consider LESS VT or LESS PEEP (or more, if under-recruited regions dominate — interpret with PV loop).";
    }
    return { label: "Stress index", value: si, unit: "", status, interpretation: text };
  }
  function assessWeaning(i) {
    const items = [];
    if (i.rsbi !== null) {
      items.push({ name: "RSBI < 105", pass: i.rsbi < 105, note: `RSBI = ${i.rsbi.toFixed(0)}` });
    }
    if (i.coughPeakFlow !== null) {
      items.push({ name: "Cough peak flow > 60 L/min", pass: i.coughPeakFlow > 60, note: `CPF = ${i.coughPeakFlow} L/min` });
    }
    if (i.pImaxNegative !== null) {
      items.push({ name: "NIF ≤ −25 cmH2O", pass: i.pImaxNegative <= -25, note: `NIF = ${i.pImaxNegative}` });
    }
    if (i.cuffLeakPct !== null) {
      items.push({ name: "Cuff leak ≥ 10% of VT", pass: i.cuffLeakPct >= 10, note: `Leak = ${i.cuffLeakPct}%` });
    }
    items.push({ name: "Mental status adequate", pass: i.mentalStatus === "alert" || i.mentalStatus === "drowsy", note: i.mentalStatus === "alert" ? "Alert" : i.mentalStatus === "drowsy" ? "Drowsy but rousable" : "Not ideal" });
    const scored = items.filter((it) => it.pass !== null);
    const passed = scored.filter((it) => it.pass === true).length;
    const score = passed;
    const maxScore = scored.length;
    const ratio = maxScore > 0 ? score / maxScore : 0;
    let verdict = "";
    if (ratio >= 0.99)
      verdict = "All criteria met — proceed to a 30–120 min SBT (PS 5–8/PEEP 5) and extubate if tolerated.";
    else if (ratio >= 0.7)
      verdict = "Majority of criteria met — proceed to SBT trial with enhanced monitoring; address failing items before extubation.";
    else
      verdict = "Not ready — address failing criteria first (secretion load, delirium, load reduction). Re-screen daily.";
    return { score, maxScore, verdict, items };
  }
  function interpretABG(i) {
    const disorders = [];
    const compensation = [];
    const advice = [];
    let ag = null;
    let agInterp = null;
    let deltaRatio = null;
    let deltaInterp = null;
    let pf = null;
    let pfInterp = null;
    let aa = null;
    let aaInterp = null;
    let hypoxemia = null;
    const { ph, paco2, hco3 } = i;
    const acidemia = ph < 7.35;
    const alkalemia = ph > 7.45;
    let primary = "";
    if (acidemia)
      primary = paco2 > 45 ? "Respiratory acidosis" : "Metabolic acidosis";
    else if (alkalemia)
      primary = paco2 < 35 ? "Respiratory alkalosis" : "Metabolic alkalosis";
    else {
      if (paco2 > 45 && hco3 > 26) {
        disorders.push("Compensated respiratory acidosis (chronic pattern)");
        primary = "Chronic respiratory acidosis";
      } else if (paco2 < 35 && hco3 < 22) {
        disorders.push("Compensated respiratory alkalosis (chronic pattern)");
        primary = "Chronic respiratory alkalosis";
      } else
        primary = "Normal acid–base status";
    }
    if (primary !== "Normal acid–base status" && disorders.length === 0)
      disorders.push(`Primary: ${primary}`);
    if (primary === "Metabolic acidosis") {
      const expected = 1.5 * hco3 + 8;
      compensation.push(`Winter's formula: expected PaCO2 = 1.5 × ${hco3} + 8 = ${expected.toFixed(0)} ± 2 mmHg (measured ${paco2})`);
      if (paco2 > expected + 2) {
        disorders.push("Superimposed respiratory acidosis — ventilation insufficient for the metabolic demand");
        advice.push("Metabolic acidosis with insufficient respiratory compensation: the patient NEEDS high minute ventilation — if intubating, set rate to match pre-intubation Kussmaul pattern (see DKA scenario).");
      } else if (paco2 < expected - 2) {
        disorders.push("Superimposed respiratory alkalosis — ventilation exceeds metabolic demand");
      } else
        compensation.push("Compensation appropriate (within Winter's range).");
    } else if (primary === "Metabolic alkalosis") {
      const expected = 0.7 * hco3 + 20;
      compensation.push(`Expected compensating PaCO2 = 0.7 × ${hco3} + 20 = ${expected.toFixed(0)} ± 5 mmHg (measured ${paco2})`);
      if (paco2 > expected + 5)
        disorders.push("Superimposed respiratory acidosis");
      else if (paco2 < expected - 5)
        disorders.push("Superimposed respiratory alkalosis");
    } else if (primary === "Respiratory acidosis") {
      const dCO2 = paco2 - 40;
      const acuteH = 24 + 0.1 * dCO2;
      const chronicH = 24 + 0.35 * dCO2;
      compensation.push(`Acute compensation: HCO3 → ${acuteH.toFixed(1)} · Chronic: HCO3 → ${chronicH.toFixed(1)} (measured ${hco3})`);
      if (hco3 < acuteH - 2)
        disorders.push("Combined respiratory + metabolic acidosis");
      else if (hco3 > chronicH + 2)
        disorders.push("Superimposed metabolic alkalosis (or chronic CO2 retainer with additional alkali)");
      else
        compensation.push(hco3 > acuteH + 2 ? "Pattern suggests chronic CO2 retention (appropriate renal compensation)" : "Consistent with acute respiratory acidosis");
      advice.push("Rising PaCO2 on the ventilator: check for hypoventilation (rate/leak), increased dead space (PE), or increased CO2 production (fever, sepsis) — and allow permissive hypercapnia only when pH permits.");
    } else if (primary === "Respiratory alkalosis") {
      const dCO2 = 40 - paco2;
      const acuteH = 24 - 0.2 * dCO2;
      const chronicH = 24 - 0.5 * dCO2;
      compensation.push(`Acute compensation: HCO3 → ${acuteH.toFixed(1)} · Chronic: HCO3 → ${chronicH.toFixed(1)} (measured ${hco3})`);
      if (hco3 > acuteH + 2)
        disorders.push("Combined respiratory alkalosis + metabolic acidosis");
      advice.push("Hypocapnia on a ventilator: usually over-ventilation — reduce rate. Consider hidden causes: pain, anxiety, sepsis, early pulmonary embolism, hepatic failure.");
    }
    if (i.na !== null && i.cl !== null) {
      ag = i.na - (i.cl + hco3);
      if (ag > 12) {
        agInterp = `High anion gap (${ag.toFixed(0)} mEq/L) — MUDPILES: Methanol, Uraemia, DKA, Propofol/Paraldehyde, Isoniazid/Iron, Lactic acidosis, Ethylene glycol, Salicylates.`;
        if (ag > 20)
          advice.push("Markedly elevated anion gap: check lactate, ketones, renal function, and toxic alcohol screen.");
      } else if (ag < 8) {
        agInterp = `Low anion gap (${ag.toFixed(0)}) — paraproteinaemia (myeloma), hypoalbuminaemia, lithium.`;
      } else {
        agInterp = `Anion gap normal (${ag.toFixed(0)} mEq/L) — if acidotic, think hyperchloraemic causes (saline, diarrhoea, renal tubular acidosis).`;
      }
      if (ag > 12 && hco3 < 24) {
        deltaRatio = (ag - 12) / (24 - hco3);
        if (deltaRatio < 0.4)
          deltaInterp = "Pure normal-AG (hyperchloraemic) acidosis component.";
        else if (deltaRatio < 0.8)
          deltaInterp = "Mixed high-AG + normal-AG acidosis (e.g. DKA with volume contraction from saline).";
        else if (deltaRatio <= 2)
          deltaInterp = "Typical pure high-AG acidosis.";
        else
          deltaInterp = "Coexisting metabolic alkalosis or pre-existing high bicarbonate (e.g. chronic CO2 retainer + DKA).";
      }
    }
    if (i.pao2 !== null && i.pao2 !== undefined) {
      if (i.fio2 !== null && i.fio2 !== undefined && i.fio2 >= 0.21) {
        pf = i.pao2 / i.fio2;
        if (pf < 100)
          pfInterp = "Severe ARDS range (P/F < 100) — full lung-protective bundle, prone positioning, ECMO referral discussion.";
        else if (pf < 200)
          pfInterp = "Moderate ARDS range — lung-protective ventilation with PEEP titration.";
        else if (pf < 300)
          pfInterp = "Mild ARDS range (P/F 200–300) — lung-protective ventilation.";
        else
          pfInterp = "P/F normal (> 300).";
        const pao2Alv = i.fio2 * (760 - 47) - paco2 / 0.8;
        aa = pao2Alv - i.pao2;
        const age = i.age ?? 40;
        const expectedAa = age / 4 + 4;
        if (i.fio2 <= 0.3) {
          if (aa > expectedAa * 1.5)
            aaInterp = `A–a gradient elevated (${aa.toFixed(0)} vs expected ≈ ${expectedAa.toFixed(0)} for age ${age}) — V/Q mismatch, shunt, or diffusion problem.`;
          else
            aaInterp = `A–a gradient normal for age (${aa.toFixed(0)} ≤ ${expectedAa.toFixed(0)}) — hypoxaemia (if any) is from hypoventilation or low FiO2, not lung disease.`;
        } else {
          aaInterp = `A–a gradient = ${aa.toFixed(0)} mmHg on FiO2 ${(i.fio2 * 100).toFixed(0)}% (gradient normally rises with FiO2; > 100 on 100% suggests significant shunt).`;
        }
      }
      if (i.pao2 < 60) {
        hypoxemia = "Significant hypoxaemia (PaO2 < 60) — assess: FiO2 already high? → shunt pathology (ARDS, oedema, consolidation). FiO2 low? → raise FiO2 first, then find the cause.";
      } else if (i.pao2 < 80)
        hypoxemia = "Mild hypoxaemia (PaO2 60–80) — acceptable permissive range in ARDS (target 55–80).";
    }
    let severity = "normal";
    if (ph < 7.2 || ph > 7.6 || pf !== null && pf < 100)
      severity = "severe";
    else if (ph < 7.28 || ph > 7.52 || pf !== null && pf < 200)
      severity = "moderate";
    else if (primary !== "Normal acid–base status" || pf !== null && pf < 300)
      severity = "mild";
    if (primary === "Metabolic acidosis" && acidemia) {
      advice.push("If intubating a metabolic acidosis patient: the ventilator must maintain (or exceed) the current minute ventilation — normalizing PaCO2 to 40 at induction causes precipitous acidaemia.");
    }
    const summary = disorders.length ? `${acidemia ? "Acidaemia" : alkalemia ? "Alkalaemia" : "Near-normal pH"}: ${disorders[0].replace("Primary: ", "")}` : "No significant acid–base disturbance detected.";
    return { summary, disorders, compensation, ag, agInterp, deltaRatio, deltaInterp, pf, pfInterp, aa, aaInterp, hypoxemia, severity, ventilatorAdvice: advice };
  }
  function calcInfusionRate(dosePerKgPerMin, weightKg, concMcgPerMl) {
    if (weightKg <= 0 || concMcgPerMl <= 0)
      return null;
    return dosePerKgPerMin * weightKg * 60 / concMcgPerMl;
  }
  function calcInfusionDose(rateMlHr, weightKg, concMcgPerMl) {
    if (weightKg <= 0 || concMcgPerMl <= 0)
      return null;
    return rateMlHr * concMcgPerMl / 60 / weightKg;
  }
  function calcETT(ageYears) {
    if (ageYears < 0 || ageYears > 14)
      return null;
    if (ageYears < 1) {
      return { uncuffed: 3.5, cuffed: 3, depthOral: 10, depthNasal: 12, note: "< 1 year: fixed sizes; neonate 3.0–3.5 (cuffed select use only)" };
    }
    const uncuffed = ageYears / 4 + 4;
    const cuffed = ageYears / 4 + 3.5;
    const depthOral = Math.round(3 * cuffed * 10) / 10;
    return {
      uncuffed: Math.round(uncuffed * 2) / 2,
      cuffed: Math.round(cuffed * 2) / 2,
      depthOral,
      depthNasal: depthOral + 2,
      note: "Depth (oral, cm) ≈ 3 × ETT size · nasal + 2 cm. Confirm bilateral breath sounds + CXR tip 3–5 cm above carina."
    };
  }
  function calcOxygenContent(hb, sao2, pao2, cardiacOutput) {
    const cao2 = 1.34 * hb * sao2 + 0.003 * pao2;
    const do2 = cardiacOutput && cardiacOutput > 0 ? cardiacOutput * cao2 * 10 : null;
    return { cao2, do2 };
  }
  function interpretDO2(do2) {
    if (do2 === null)
      return { label: "Oxygen delivery (DO2)", value: null, unit: "mL/min", status: "info", interpretation: "Enter cardiac output to compute DO2." };
    let status = "normal";
    let text = "";
    if (do2 < 400) {
      status = "danger";
      text = "Critical DO2 (< 400 mL/min) — anaerobic metabolism and lactate production expected. Correct the components: Hb, saturation, or cardiac output.";
    } else if (do2 < 600) {
      status = "caution";
      text = "Low-normal DO2 (400–600) — supply–dependency risk in sepsis or exertion; reassess components and lactate trend.";
    } else {
      status = "normal";
      text = "Adequate oxygen delivery (normal ≈ 700–1400 mL/min).";
    }
    return { label: "Oxygen delivery (DO2)", value: do2, unit: "mL/min", status, interpretation: text };
  }
  function checkExpiratoryTime(rr, ti, tau) {
    if (rr <= 0 || ti <= 0)
      return null;
    const tTot = 60 / rr;
    const te = tTot - ti;
    if (te <= 0)
      return { te: 0, teOverTau: 0, verdict: "No expiratory time left — inspiratory time exceeds the breath period. Reduce Ti or rate immediately.", status: "danger" };
    const teOverTau = te / tau;
    let status = "ok";
    let verdict = "";
    if (teOverTau >= 3) {
      status = "ok";
      verdict = `Expiratory time ${te.toFixed(2)} s = ${teOverTau.toFixed(1)}τ — ≥ 95% emptying. Safe.`;
    } else if (teOverTau >= 2) {
      status = "caution";
      verdict = `Expiratory time ${te.toFixed(2)} s = ${teOverTau.toFixed(1)}τ — ~86% emptying; watch for auto-PEEP in obstructive disease (need ≥ 3τ).`;
    } else {
      status = "danger";
      verdict = `Expiratory time ${te.toFixed(2)} s = only ${teOverTau.toFixed(1)}τ — significant gas trapping expected. Lower rate, shorten Ti, or treat obstruction.`;
    }
    return { te, teOverTau, verdict, status };
  }

  // src/lib/ventilator/reference.ts
  var VENT_ALARMS = [
    {
      id: "high-pressure",
      name: "High Pressure (PIP limit)",
      severity: "critical",
      sound: "Continuous high-priority tone",
      immediate: [
        "DISCONNECT the patient from the ventilator and bag with 100% O2 (self-inflating bag).",
        "If bagging is EASY → problem is the VENTILATOR or CIRCUIT (kink, water, blocked filter).",
        "If bagging is HARD → problem is the PATIENT (see DOPE causes).",
        "Reconnect once cause is found; auscultate + check breath sounds bilaterally."
      ],
      causes: [
        { cause: "Circuit kink / compressed tubing", fix: "Trace and straighten the tube; check heat-and-moisture exchanger" },
        { cause: "Water condensed in circuit", fix: "Drain water traps toward the collection point" },
        { cause: "Patient biting ETT (light sedation)", fix: "Oral bite block; deepen sedation; consider soft bite-resistant tube" },
        { cause: "Secretions / mucus plug", fix: "Suction airway; saline instillation if thick; bronchoscopy if refractory" },
        { cause: "Bronchospasm (wheeze, rising PIP with flat pressure curve)", fix: "Salbutamol nebul 2.5–5 mg + ipratropium; corticosteroid" },
        { cause: "Atelectasis / mainstem intubation (unilateral sounds)", fix: "Auscultate; withdraw ETT 1–2 cm if right mainstem; CXR confirm" },
        { cause: "Pneumothorax (unilateral absent sounds + hypotension = tension)", fix: "Immediate decompression: 14G needle 4th–5th ICS mid-axillary, then chest drain" },
        { cause: "Worsening compliance (ARDS, oedema, ARDS progression)", fix: "Reassess Pplat/ΔP; reduce VT; review ARDS bundle" },
        { cause: "Coughing / asynchrony / fighting the ventilator", fix: "Assess pain/sedation; adjust trigger; check for double triggering" },
        { cause: "Expiratory filter occluded (water-saturated or sputum-caked)", fix: "Change filter — can cause complete occlusion and death if missed" }
      ]
    },
    {
      id: "low-pressure",
      name: "Low Pressure / Low Volume (leak or disconnect)",
      severity: "critical",
      sound: "Intermittent priority tone",
      immediate: [
        "Look at the patient FIRST — is the chest moving? Listen for escaping gas.",
        "Run hand along the ENTIRE circuit from ventilator to ETT for disconnection.",
        "Check cuff pressure / pilot balloon — cuff leak is the commonest cause.",
        "Bag manually with 100% O2 if cause not instantly found."
      ],
      causes: [
        { cause: "Circuit disconnect at any joint", fix: "Reconnect; verify with expiratory volume returning" },
        { cause: "Cuff deflated / ruptured (pilot balloon empty or asymmetric leak)", fix: "Inflate to 20–30 cmH2O; if ruptured → replace ETT (airway team ready)" },
        { cause: "ETT migrated out (extubation risk)", fix: "Check depth at teeth (21/23 cm typical); reintubate if needed" },
        { cause: "Circuit leak: cracked humidifier, loose temperature probe, open suction port", fix: "Systematic leak point search; replace components" },
        { cause: "Bronchopleural fistula (known chest drain bubbling)", fix: "Accept some leak; monitor delivered vs exhaled VT; minimize pressures" },
        { cause: "Ventilator flow sensor failure", fix: "Swap sensor; recalibrate per manufacturer" }
      ]
    },
    {
      id: "apnea",
      name: "Apnoea Alarm",
      severity: "critical",
      sound: "High-priority alarm, escalating",
      immediate: [
        "Stimulate the patient — is it genuine apnoea or missed triggering?",
        "Check the mode: is the patient on a spontaneous mode (PSV/CPAP) without adequate backup?",
        "Verify trigger sensitivity setting and circuit integrity.",
        "If true apnoea: switch to mandatory backup (SIMV/AC) and assess sedation/neurological cause."
      ],
      causes: [
        { cause: "Excessively deep sedation / recent paralytic + opioid", fix: "Reverse agents where appropriate; review sedation targets (RASS −2 to 0)" },
        { cause: "Ineffective triggering (COPD, auto-PEEP, weak patient)", fix: "Increase trigger sensitivity; set external PEEP ≈ 80% of intrinsic; consider NAVA/PAV" },
        { cause: "Brainstem event (new stroke, seizure, raised ICP)", fix: "Neurological exam; urgent imaging once stabilized" },
        { cause: "Backup rate set OFF in spontaneous mode", fix: "Always arm apnoea backup parameters on PSV/CPAP" },
        { cause: "Post-hyperventilation apnoea (CO2 washed out)", fix: "Reduce minute ventilation; allow PaCO2 to normalize" }
      ]
    },
    {
      id: "desaturation",
      name: "Sudden Desaturation on the Ventilator",
      severity: "critical",
      sound: "Oxygen saturation alarm",
      immediate: [
        "FiO2 to 100% immediately while diagnosing.",
        "Hand-ventilate with 100% O2: feels STIFF? → compliance problem. Feels LEAKY? → circuit problem. Absent chest rise → DOPE.",
        "DOPE sequence: Displacement, Obstruction, Pneumothorax, Equipment, Stacking.",
        "Bedside ultrasound / CXR after immediate stabilization; call for help early."
      ],
      causes: [
        { cause: "ETT displacement (extubation / mainstem)", fix: "Direct laryngoscopy; reintubate or reposition" },
        { cause: "Obstruction (bite, plug, kink)", fix: "Pass suction catheter — if it will NOT pass, the tube is obstructed → replace ETT" },
        { cause: "Pneumothorax (especially tension in ventilated patients)", fix: "Needle decompression then drain; do not wait for CXR if unstable" },
        { cause: "Equipment failure (gas supply, ventilator, O2 blender)", fix: "Bag on 100% from O2 wall source; change ventilator if confirmed" },
        { cause: "Breath stacking / auto-PEEP (COPD, asthma, high rate)", fix: "Disconnect briefly (cough-like decompression); lower rate, shorten Ti, treat obstruction" },
        { cause: "New shunt: atelectasis, secretions, oedema, pulmonary embolism", fix: "Position up, suction, diurese if overloaded, echo/CT for PE" },
        { cause: "Mucus plug with lobar collapse", fix: "Suction + position + bronchoscopy" }
      ]
    },
    {
      id: "high-rate",
      name: "High Respiratory Rate / High Minute Ventilation",
      severity: "warning",
      sound: "Advisory tone",
      immediate: [
        "Is the patient distressed (dyssynchrony, pain, anxiety) or is this compensation?",
        "Check ABG: metabolic acidosis or hypoxaemia driving tachypnoea?",
        "Review sedation and trigger sensitivity (auto-triggering from leaks/water)."
      ],
      causes: [
        { cause: "Pain / anxiety / delirium", fix: "Analgesia-first sedation; RASS target review" },
        { cause: "Metabolic acidosis compensation (DKA, sepsis, salicylate)", fix: "Treat the acidosis; support the minute ventilation it demands" },
        { cause: "Auto-triggering (circuit water, leak, cardiac oscillation)", fix: "Drain water; adjust trigger sensitivity" },
        { cause: "Flow starvation (demand > set flow)", fix: "Raise peak flow; decelerating pattern; or pressure mode" },
        { cause: "Impending weaning failure (RSBI rising)", fix: "Reassess weaning criteria; consider rest mode" }
      ]
    },
    {
      id: "low-minute",
      name: "Low Minute Ventilation",
      severity: "warning",
      sound: "Advisory tone",
      immediate: [
        "Check delivered VT and rate versus set values — leak or hypoventilation?",
        "Rising PaCO2 with normal settings: dead space, metabolism, or mechanics worsening."
      ],
      causes: [
        { cause: "Leak (cuff, circuit, fistula)", fix: "Quantify inspiratory vs expiratory VT difference; fix source" },
        { cause: "Rising dead space (PE, low cardiac output)", fix: "Consider perfusion cause; echo; ETCO2–PaCO2 gradient widening" },
        { cause: "Increased CO2 production (fever, sepsis, overfeeding)", fix: "Treat fever; review nutrition carbohydrate load" },
        { cause: "Machine rate set too low / patient over-sedated", fix: "Increase backup rate; lighten sedation" }
      ]
    },
    {
      id: "gas-supply",
      name: "Gas Supply / Power Failure",
      severity: "critical",
      sound: "Distinctive continuous tone",
      immediate: [
        "IMMEDIATELY bag the patient with 100% O2 from the wall source (self-inflating bag works on any gas).",
        "Check wall O2 and air pressure gauges; check power cords/battery indicator.",
        "Switch to the backup ventilator (every ICU has one) while diagnosing.",
        "Never leave a ventilator-dependent patient without a manual device at the bedside."
      ],
      causes: [
        { cause: "Wall O2 or medical-air supply lost (pipeline fault)", fix: "Switch to cylinder O2; alert engineering; hospital-wide alert" },
        { cause: "Power outage + battery exhausted", fix: "Manual bagging; move to cylinder-driven transport ventilator" },
        { cause: "Internal ventilator fault ('ventilator inoperative')", fix: "Replace ventilator; tag faulty unit for biomedical engineering" }
      ]
    }
  ];
  var DOPE_STEPS = [
    { letter: "D", name: "Displacement", action: "ETT displaced — pulled out to cords or pushed to right mainstem. Check depth marking at teeth, auscultate both sides; laryngoscopy if in doubt." },
    { letter: "O", name: "Obstruction", action: "Bite, kink, mucus plug, blood clot. Pass a suction catheter: if it fails to pass → tube obstructed → replace the ETT NOW." },
    { letter: "P", name: "Pneumothorax", action: "Especially tension physiology under positive pressure. Unilateral breath sounds + distended neck veins + hypotension → needle decompression before imaging." },
    { letter: "E", name: "Equipment", action: "Ventilator, circuit, gas supply, sensor failure. Hand-ventilate with a bag: this instantly isolates patient vs machine." },
    { letter: "S", name: "Stacking (breath)", action: "Auto-PEEP / breath-stacking in obstructive disease. Brief circuit disconnect produces cough-like deflation; then lower rate, shorten Ti, lengthen expiration." }
  ];
  var VAP_BUNDLE = [
    { item: "Head of bed 30–45° elevation", rationale: "Gravitational protection against gastric reflux micro-aspiration — the single most consistent VAP-prevention measure.", level: "core" },
    { item: "Daily sedation interruption + daily assessment of extubation readiness (SAT + SBT)", rationale: "Every ventilator day avoided is VAP risk avoided (Ventilator days = VAP risk).", level: "core" },
    { item: "Subglottic secretion drainage (SSD) ETT for expected ventilation > 48–72 h", rationale: "Removes the pooled secretions ABOVE the cuff that seed the lower airway.", level: "core" },
    { item: "Chlorhexidine oral care (0.12–0.2%) + toothbrushing", rationale: "Reduces oropharyngeal bacterial load colonizing pooled subglottic secretions.", level: "core" },
    { item: "Cuff pressure maintained 20–30 cmH2O (measure every shift)", rationale: "Under-inflation leaks bacteria-laden secretions past the cuff; over-inflation causes tracheal mucosal injury.", level: "core" },
    { item: "Avoid unplanned (self-)extubation", rationale: "Reintubation carries a high VAP risk multiplier — secure tube, assess readiness before lightening.", level: "extended" },
    { item: "Circuit changes only when visibly soiled (NOT routine)", rationale: "Randomized trials: routine changes INCREASE VAP (break the closed system more often).", level: "extended" },
    { item: "Drain circuit condensate away from the patient (check q shift)", rationale: "Contaminated condensate that refluxes toward the airway is an inoculum.", level: "extended" },
    { item: "Peptic ulcer + DVT prophylaxis", rationale: "Bundle companions from the original ventilator bundle (survival benefits).", level: "core" },
    { item: "Early mobilization", rationale: "Faster weaning = fewer ventilator days; functional recovery improves.", level: "extended" },
    { item: "Minimize patient transport off the ICU", rationale: "Position changes and circuit manipulation during transport aspirate secretions.", level: "extended" }
  ];
  var RASS_SCALE = [
    { score: 4, term: "Combative", description: "Overtly combative or violent; immediate danger to staff" },
    { score: 3, term: "Very agitated", description: "Pulls at or removes tube(s)/catheters; aggressive behaviour toward staff" },
    { score: 2, term: "Agitated", description: "Frequent non-purposeful movement; fights the ventilator" },
    { score: 1, term: "Restless", description: "Anxious or apprehensive; movements not aggressive or vigorous" },
    { score: 0, term: "Alert and calm", description: "The usual target for most ventilated patients" },
    { score: -1, term: "Drowsy", description: "Not fully alert; sustained (≥ 10 s) eye contact to voice" },
    { score: -2, term: "Light sedation", description: "Briefly (< 10 s) awakens with eye contact to voice" },
    { score: -3, term: "Moderate sedation", description: "Any movement (but no eye contact) to voice" },
    { score: -4, term: "Deep sedation", description: "No response to voice; any movement to physical stimulation" },
    { score: -5, term: "Unrousable", description: "No response to voice or physical stimulation" }
  ];
  var CPOT_SCALE = [
    { item: "Facial expression", points: ["0 — No muscle tension observed", "1 — Presenting/frowning", "2 — Grimacing"] },
    { item: "Body movements", points: ["0 — Does not move at all", "1 — Protection or slow cautious movements", "2 — Restlessness, pulling at tube"] },
    { item: "Muscle tension", points: ["0 — Relaxed", "1 — Tense, rigid", "2 — Very tense or spastic"] },
    { item: "Ventilator compliance (intubated)", points: ["0 — Tolerating ventilator", "1 — Coughing but tolerating", "2 — Fighting ventilator"] }
  ];
  var BERLIN_ARDS = {
    criteria: [
      { item: "Timing", detail: "Within 1 week of a known clinical insult or new/worsening respiratory symptoms" },
      { item: "Imaging", detail: "Bilateral opacities not fully explained by effusion, lobar/lung collapse, or nodules" },
      { item: "Origin of oedema", detail: "Respiratory failure not fully explained by cardiac failure or fluid overload (objective assessment e.g. echo when needed)" },
      { item: "Oxygenation (P/F, PEEP ≥ 5)", detail: "Mild 200–300 · Moderate 100–200 · Severe < 100 mmHg" }
    ],
    mortality: [
      { level: "Mild", pf: "200–300", mortality: "~27%" },
      { level: "Moderate", pf: "100–200", mortality: "~32%" },
      { level: "Severe", pf: "< 100", mortality: "~45%" }
    ]
  };
  var MURRAY_LIS = {
    components: [
      { component: "Chest radiograph score", detail: "No alveolar consolidation = 0 … 4 quadrants = 4" },
      { component: "Hypoxaemia score (PaO2/FiO2)", detail: "> 300 = 0 · 225–299 = 1 · 175–224 = 2 · 100–174 = 3 · < 100 = 4" },
      { component: "PEEP score", detail: "≤ 5 = 0 · 6–8 = 1 · 9–11 = 2 · 12–14 = 3 · ≥ 15 = 4" },
      { component: "Compliance score (mL/cmH2O)", detail: "≥ 80 = 0 · 60–79 = 1 · 40–59 = 2 · 20–39 = 3 · ≤ 19 = 4" }
    ],
    interpretation: "LIS = sum ÷ 4. > 2.5 = severe ARDS (classic criterion); 0.1–2.5 = mild-moderate."
  };
  var ABG_NORMALS = [
    { parameter: "pH", range: "7.35–7.45", note: "Acidaemia < 7.35 · alkalaemia > 7.45" },
    { parameter: "PaCO2", range: "35–45 mmHg", note: "Respiratory component; chronic COPD/HO patients may baseline 50–60" },
    { parameter: "HCO3⁻", range: "22–26 mEq/L", note: "Metabolic component (24 ± 2)" },
    { parameter: "PaO2", range: "80–100 mmHg (room air)", note: "Falls with age: ≈ 100 − (age/3)" },
    { parameter: "SpO2", range: "95–98%", note: "88–92% target in COPD at risk of CO2 retention" },
    { parameter: "Base excess", range: "−2 to +2 mEq/L", note: "Quantifies the metabolic derangement" },
    { parameter: "Lactate", range: "0.5–2.0 mmol/L", note: "> 4 = severe tissue hypoperfusion" },
    { parameter: "Anion gap", range: "8–12 mEq/L (no K) · 12–16 (with K)", note: "Na⁺ − (Cl⁻ + HCO3⁻)" }
  ];
  var OXYGEN_DEVICES = [
    { device: "Nasal cannula", flow: "1–6 L/min", fio2: "24–44%", note: "≈ 4% FiO2 per L/min; uncomfortable > 4 L; no precise control" },
    { device: "Simple face mask", flow: "5–10 L/min", fio2: "40–60%", note: "Keep ≥ 5 L/min to wash out rebreathed CO2" },
    { device: "Venturi (controlled) mask", flow: "Per colour code", fio2: "24/28/31/35/40/50%", note: "Precise FiO2 for CO2-retainers (blue 24%, white 28%)" },
    { device: "Partial-rebreather mask", flow: "8–12 L/min", fio2: "60–80%", note: "Reservoir bag fills on expiration; no one-way valve between bag and mask" },
    { device: "Non-rebreather mask", flow: "10–15 L/min", fio2: "60–90%+", note: "One-way valves; NEVER run below 10 L/min (bag collapse)" },
    { device: "High-flow nasal cannula (HFNC)", flow: "20–60 L/min", fio2: "21–100% (precise)", note: "Washes out dead space, small PEEP effect (≈ 3–5 cmH2O), best comfort; track ROX index" },
    { device: "Non-invasive BPAP", flow: "IPAP/EPAP driven", fio2: "21–100% (via O2 bleed-in or built-in blender)", note: "First-line for COPD hypercapnia and cardiogenic pulmonary oedema" },
    { device: "Bag-valve-mask + reservoir", flow: "15 L/min O2 source", fio2: "≈ 100% (two-person, sealed)", note: "BLS airway; watch gastric insufflation" }
  ];
  var PEDIATRIC_TABLE = [
    { age: "Neonate (term)", weightKg: "3–4", ettUncuffed: "3.0–3.5", ettCuffed: "3.0 (select)", depthOral: "9–10.5 cm (weight+6)", ventRate: "30–40", normalRR: "40–60", normalHR: "100–180", vtPerKg: "4–6" },
    { age: "1–6 months", weightKg: "4–7", ettUncuffed: "3.5–4.0", ettCuffed: "3.0–3.5", depthOral: "10–11 cm", ventRate: "25–35", normalRR: "30–60", normalHR: "100–160", vtPerKg: "6–8" },
    { age: "6–12 months", weightKg: "7–10", ettUncuffed: "4.0", ettCuffed: "3.5", depthOral: "11–12 cm", ventRate: "20–30", normalRR: "24–48", normalHR: "100–160", vtPerKg: "6–8" },
    { age: "1–3 years", weightKg: "10–15", ettUncuffed: "4.5 (age/4+4)", ettCuffed: "3.5–4.0 (age/4+3.5)", depthOral: "3 × ETT size", ventRate: "20–28", normalRR: "22–37", normalHR: "90–150", vtPerKg: "6–8" },
    { age: "3–8 years", weightKg: "15–25", ettUncuffed: "4.5–6.0", ettCuffed: "4.0–5.5", depthOral: "3 × ETT size", ventRate: "16–24", normalRR: "20–28", normalHR: "80–140", vtPerKg: "6–8" },
    { age: "> 8 years", weightKg: "25+", ettUncuffed: "6.0+ (age/4+4)", ettCuffed: "5.5+ (age/4+3.5)", depthOral: "3 × ETT size", ventRate: "12–20", normalRR: "12–20", normalHR: "70–120", vtPerKg: "6–8" }
  ];
  var PEDS_FORMULAS = {
    ett: "Uncuffed ID (mm) = (age/4) + 4 · Cuffed ID = (age/4) + 3.5",
    depth: "Oral depth (cm) = 3 × ETT size · Nasal = oral + 2 · Neonate = weight(kg) + 6",
    hypotension: "Systolic BP < 70 + (2 × age in years) = hypotension (1–10 y)",
    shock: "Urine output < 1 mL/kg/h (infants) / < 0.5 (older) signals shock",
    resus: "Weight (kg) = (age × 2) + 4 for 1–10 y (APLS); eBL and Broselow tape override"
  };
  var INFUSION_DRUGS = [
    { id: "norepi", name: "Norepinephrine", cls: "Vasopressor", units: "mcg/kg/min", standardMix: "4 mg in 50 mL (80 mcg/mL) or 8 mg/250 mL", doseRange: "0.01–1.0 mcg/kg/min", notes: "First-line septic shock; central line preferred; watch digit ischaemia at high dose" },
    { id: "epi", name: "Epinephrine", cls: "Vasopressor + Inotrope", units: "mcg/kg/min", standardMix: "4 mg in 50 mL", doseRange: "0.01–0.5 mcg/kg/min", bolus: "Arrest: 1 mg IV q3–5min · Anaphylaxis: 0.3–0.5 mg IM", notes: "Tachyarrhythmia, lactate rise (physiologic); anaphylaxis drug of choice" },
    { id: "vasopressin", name: "Vasopressin", cls: "Vasopressor (adjunct)", units: "units/hr", standardMix: "20 units in 50 mL", doseRange: "0.03 units/min (fixed) = 1.8/hr", notes: "Catecholamine-sparing adjunct in septic shock; bolus 40 U in arrest with shockable rhythm debate" },
    { id: "phenylephrine", name: "Phenylephrine", cls: "Pure alpha vasopressor", units: "mcg/kg/min", standardMix: "40 mg in 250 mL (160 mcg/mL)", doseRange: "0.1–3 mcg/kg/min", notes: "Tachycardia-avoidant pressor; pure vasoconstriction — may drop cardiac output in weak hearts" },
    { id: "dobutamine", name: "Dobutamine", cls: "Inotrope", units: "mcg/kg/min", standardMix: "250 mg in 250 mL (1 mg/mL)", doseRange: "2.5–20 mcg/kg/min", notes: "Cardiogenic hypoperfusion with adequate BP; vasodilates → may need pressor companion" },
    { id: "milrinone", name: "Milrinone", cls: "Inodilator (PDE3)", units: "mcg/kg/min", standardMix: "20 mg in 100 mL (200 mcg/mL)", doseRange: "0.125–0.75 mcg/kg/min", notes: "RV failure / pulmonary hypertension; accumulates in renal failure; hypotension risk" },
    { id: "propofol", name: "Propofol", cls: "Sedative", units: "mg/kg/hr", standardMix: "10 mg/mL (1 or 2%)", doseRange: "0.5–4 mg/kg/hr", bolus: "0.5–1 mg/kg (hemodynamics permitting)", notes: "PRIS (rare, > 4 mg/kg/hr × > 48 h); hypotension; lipid load counts as calories" },
    { id: "midazolam", name: "Midazolam", cls: "Sedative (benzodiazepine)", units: "mg/kg/hr", standardMix: "100 mg in 100 mL (1 mg/mL)", doseRange: "0.02–0.1 mg/kg/hr", bolus: "0.01–0.05 mg/kg", notes: "Delirium risk in ICU — keep courses short; accumulate in renal failure" },
    { id: "dexmedetomidine", name: "Dexmedetomidine", cls: "Alpha-2 sedative (arousable)", units: "mcg/kg/hr", standardMix: "200 mcg in 50 mL (4 mcg/mL)", doseRange: "0.2–1.5 mcg/kg/hr", notes: "Rousable light sedation without respiratory depression — can continue off-tube; bradycardia" },
    { id: "fentanyl", name: "Fentanyl", cls: "Opioid analgesic", units: "mcg/kg/hr", standardMix: "1 mg or 2.5 mg in 50 mL", doseRange: "0.7–10 mcg/kg/hr", bolus: "0.35–1.5 mcg/kg", notes: "Analgesia-first sedation; chest-wall rigidity if rapid high bolus in neonates" },
    { id: "morphine", name: "Morphine", cls: "Opioid analgesic", units: "mg/kg/hr", standardMix: "100 mg in 100 mL", doseRange: "0.01–0.05 mg/kg/hr", bolus: "0.02–0.1 mg/kg", notes: "Histamine-mediated hypotension; active metabolite accumulates in renal failure" },
    { id: "ketamine", name: "Ketamine", cls: "Dissociative analgesic-sedative", units: "mg/kg/hr", standardMix: "500 mg in 100 mL", doseRange: "0.1–2 mg/kg/hr", bolus: "0.5–1 mg/kg", notes: "Preserves respiratory drive + bronchodilation; secretion increase; emerges hallucinations (co-give benzo in adults)" },
    { id: "rocuronium", name: "Rocuronium", cls: "Neuromuscular blocker (non-depolarizing)", units: "mcg/kg/min", standardMix: "500 mg in 250 mL", doseRange: "8–12 mcg/kg/min infusion", bolus: "RSI 1.2 mg/kg · Maintenance 0.4–0.6 mg/kg", notes: "Monitor TOF (target 1–2/4); steroid myopathy + critical illness polyneuropathy risk with prolonged use" },
    { id: "cisatracurium", name: "Cisatracurium", cls: "Neuromuscular blocker (organ-independent clearance)", units: "mcg/kg/min", standardMix: "200 mg in 200 mL", doseRange: "0.5–10 mcg/kg/min", bolus: "0.15–0.2 mg/kg", notes: "Hofmann elimination — ideal in renal/hepatic failure; the ARDS 48-h paralysis choice (ACURASAS)" },
    { id: "nitroglycerin", name: "Nitroglycerin", cls: "Vasodilator", units: "mcg/min", standardMix: "50 mg in 250 mL", doseRange: "5–200 mcg/min", notes: "Preload reducer for pulmonary oedema; tachyphylaxis at 24–48 h" },
    { id: "heparin", name: "Heparin (unfractionated)", cls: "Anticoagulant", units: "units/hr", standardMix: "25,000 units in 250 mL", doseRange: "Protocol-driven (DVT ppx: 5,000 u SC q8–12h)", notes: "Monitor aPTT (therapeutic 1.5–2.5×) or anti-Xa; protamine reverses" }
  ];
  var SETUP_STEPS = [
    { step: 1, title: "Pre-oxygenate & prepare", detail: "100% O2 via mask/NRB 3–5 min; suction ready; check cuff/syringe, waveform capnography attached, drugs drawn." },
    { step: 2, title: "Choose mode", detail: "Default VC-AC (guaranteed ventilation, measurable Pplat). PC-AC if peak-pressure sensitive. PSV only for spontaneously breathing." },
    { step: 3, title: "Set VT 6–8 mL/kg IBW", detail: "Calculate IBW from height & sex (male: 50 + 2.3 × inches >60; female: 45.5 + ...). ARDS: 4–6." },
    { step: 4, title: "Set rate 14–18/min", detail: "Higher if acidotic; COPD/asthma: 8–10 with long expiration. Target PaCO2 per condition." },
    { step: 5, title: "PEEP 5 & FiO2 100%→titrate", detail: "Start PEEP 5; ARDS: use the ARDSNet table. FiO2 100% initially then wean to SpO2 92–96% (88–92 COPD)." },
    { step: 6, title: "Flow 40–60 L/min, I:E 1:2", detail: "Obstructive: 1:3–1:4 (flow 80–100 to shorten Ti). Rise time fine-tune if pressure mode." },
    { step: 7, title: "Set alarm limits", detail: "High pressure ~15 above expected PIP; low pressure/low MV near settings; apnoea backup ARMED." },
    { step: 8, title: "Connect & verify", detail: "Bilateral chest rise + breath sounds, ETCO2 waveform confirming intubation, SpO2 response, gastric insufflation absent." },
    { step: 9, title: "First ABG at 15–20 min", detail: "Adjust rate for PaCO2/pH; FiO2/PEEP for PaO2; recheck after every meaningful change." },
    { step: 10, title: "CXR & documentation", detail: "Confirm ETT tip 3–5 cm above carina, no barotrauma; document settings, mechanics (Pplat/ΔP/Cstat) and plan." }
  ];
  var PRONE_PROTOCOL = {
    indications: [
      "Moderate–severe ARDS (P/F < 150) despite optimized PEEP/FiO2 after 6–12 h",
      "Early application (within 36 h of ARDS onset) in suitable patients"
    ],
    exclusion: [
      "Unstable spine, open chest/abdomen, raised ICP with external ventricular drain (relative)",
      "Shock on escalating vasopressors, recent tracheal surgery, pregnancy (relative)",
      "Facial/pelvic fractures, morbid obesity (relative — feasible with adequate staffing)"
    ],
    technique: [
      "Team of 4–6 (airway, torso, legs, coordinator); pre-oxygenate FiO2 100%",
      "Suction airway before turn; secure lines/tubes with slack; eyes lubricated & padded",
      "Turn head-to-toe or side-to-side; pillow support chest/pelvis to free abdomen",
      "Duration ≥ 16 continuous hours per session (PROSEVA protocol); 2 sessions/day typical",
      "Monitor pressure points q2h; keep arms swimmer-position alternating"
    ],
    benefits: [
      "Dorsal recruitment → shunt falls (typically P/F +20–40 mmHg)",
      "More uniform transpulmonary pressure → less VILI",
      "PROSEVA 2013: 16-day mortality 16% vs 32.8% — the strongest ARDS intervention after ARDSNet"
    ],
    watch: [
      "Pressure necrosis (face!) — dedicated padding and q2h checks",
      "Accidental extubation/line loss during turns — first 30 min is highest risk",
      "Transient desaturation at turn (expected, resolves)",
      "Facial/airway oedema on return to supine — plan extubation timing around sessions"
    ]
  };
  var ECMO_CRITERIA = {
    when: [
      "Severe ARDS: P/F < 80 despite optimization (or < 50 immediately) for > 3 h",
      "PaO2/FiO2 < 100 for > 7 days of ventilation despite full lung-protective care",
      "Refractory respiratory acidosis pH < 7.18 not manageable within lung-protective limits",
      "Severe air leak syndromes failing conventional strategies"
    ],
    cautions: [
      "Ventilation > 7 days at cannulation = rising mortality (futility discussion)",
      "Irreversible lung disease without transplant candidacy",
      "Uncontrolled bleeding / catastrophic multi-organ failure",
      "Age and frailty alone are NOT contraindications — functional status drives decisions"
    ],
    referral: "Refer EARLY to an ECMO centre before crash — inter-hospital transfer on ECMO is routine at regional networks (CESAR: centre referral itself improved survival)."
  };
  var SBT_PROTOCOL = {
    precheck: [
      "Underlying cause improving · Hemodynamically stable (no/rising vasopressors) · FiO2 ≤ 0.4 · PEEP ≤ 5–8",
      "Awake/calm (RASS −1 to +1) · Cough present · Secretions manageable · No ongoing myocardial ischaemia"
    ],
    trial: [
      "30–120 min trial: PSV 5–8 cmH2O over PEEP 5, or T-piece, or CPAP 5",
      "Pass criteria: RR < 35, SpO2 ≥ 90%, HR < 120–140, no agitation/diaphoresis, stable gases",
      "Fail criteria: RR > 35, rising PaCO2 > 10 mmHg, pH < 7.32, distress signs → return to rest settings"
    ],
    post: [
      "If PASS: consider extubation the SAME hour (don't wait for the next day — each delay is a VAP-day)",
      "High-risk extubation (age > 65, chronic respiratory, cardiac): prophylactic NIV 24–48 h",
      "If FAIL: rest 24 h then re-trial — repeated daily SBTs beat gradual SIMV withdrawal (Esteban)"
    ]
  };
  var EXTUBATION_CHECK = [
    { item: "SBT passed", detail: "30–120 min spontaneous trial with PS ≤ 8 tolerated" },
    { item: "Mental status", detail: "Follows commands; CAM-ICU negative or delirium controlled" },
    { item: "Airway protection", detail: "Cough with suction stimulus (peak cough flow ≥ 60 L/min); secretions thin/sparse; gag present" },
    { item: "Cuff-leak test", detail: "Positive leak ≥ 10–15% of VT (or 110 mL absolute) predicts no post-extubation stridor — absence of leak: consider steroids 12 h before (dexamethasone)" },
    { item: "Strength", detail: "Head lift > 5 s sustained, RSBI < 105" },
    { item: "Optimize timing", detail: "Morning, full staff, post-absorption (not immediately after big sedation bolus); have reintubation kit AT BEDSIDE" },
    { item: "After extubation", detail: "Sit up, humidified O2 (HFNC in high-risk), voice rest 30 min, watch 30 min for stridor — nebulized epinephrine if stridor" }
  ];
  var EQUATIONS = [
    { name: "Equation of motion", formula: "Pmus + Pvent = (V/C) + (R × V̇)", note: "Everything the ventilator does; pressure = elastic + resistive load" },
    { name: "Static compliance", formula: "Cstat = VT / (Pplat − PEEPtotal)", note: "Normal 40–80 mL/cmH2O (ARDS 20–40); use inspiratory-hold Pplat & total PEEP" },
    { name: "Dynamic compliance", formula: "Cdyn = VT / (PIP − PEEP)", note: "Includes resistive component — falls with bronchospasm even if Cstat normal" },
    { name: "Airway resistance", formula: "Raw = (PIP − Pplat) / flow(L/s)", note: "Normal 5–15 cmH2O/L/s intubated; > 20 = obstruction" },
    { name: "Driving pressure", formula: "ΔP = VT / Cstat = Pplat − PEEP", note: "< 15 cmH2O target; the Amato 2015 outcome-linked metric" },
    { name: "Alveolar ventilation", formula: "VA = (VT − Vd) × RR", note: "Only alveolar ventilation clears CO2" },
    { name: "Minute ventilation", formula: "VE = VT × RR", note: "~ 6–8 L/min adult at rest, 0.1 L/kg/min reference" },
    { name: "Bohr dead space", formula: "Vd/Vt = (PaCO2 − ETCO2) / PaCO2", note: "Normal 0.2–0.4; > 0.6 = very high dead space (PE, late ARDS)" },
    { name: "Time constant", formula: "τ = R × C", note: "63% emptying per τ; 3–5 τ for near-complete emptying" },
    { name: "Ideal body weight (Devine)", formula: "M: 50 + 2.3 × (inches > 60) · F: 45.5 + 2.3 × (inches > 60)", note: "The denominator of all lung-protective VT" },
    { name: "P/F ratio", formula: "PaO2 / FiO2", note: "Berlin ARDS: < 300 mild · < 200 moderate · < 100 severe" },
    { name: "Oxygenation index", formula: "OI = (Pawm × FiO2 × 100) / PaO2", note: "> 16 severe (paediatric ARDS severity), > 40 ECMO range in neonates" },
    { name: "Alveolar gas equation", formula: "PAO2 = FiO2 × (Patm − PH2O) − PaCO2/R (+F)", note: "R = 0.8; the basis of A-a gradient" },
    { name: "A–a gradient", formula: "A–a = PAO2 − PaO2", note: "Age-adjusted normal ≈ (age/4) + 4 on room air" },
    { name: "RSBI (f/VT)", formula: "RSBI = RR / (VT in L)", note: "< 105 predicts SBT success (Yang & Tobin)" },
    { name: "Arterial O2 content", formula: "CaO2 = (1.34 × Hb × SaO2) + (0.003 × PaO2)", note: "mL O2/dL; the delivery currency of the circulation" },
    { name: "O2 delivery", formula: "DO2 = CO × CaO2 × 10", note: "≈ 1000 mL/min normally; < 400 critical" },
    { name: "Winter's formula", formula: "Expected PaCO2 = 1.5 × HCO3 + 8 ± 2", note: "Metabolic acidosis respiratory compensation adequacy" },
    { name: "Anion gap", formula: "AG = Na − (Cl + HCO3)", note: "8–12 mEq/L; MUDPILES for high-AG acidosis" },
    { name: "Mean airway pressure (PCV)", formula: "Pawm ≈ PEEP + (PIP − PEEP) × (Ti/Ttot)", note: "The oxygenation driver short of ECMO" },
    { name: "Stress index", formula: "Shape exponent of the pressure curve (constant flow)", note: "0.9–1.1 safe; < 0.9 recruitment possible; > 1.1 overdistension" },
    { name: "Corrected VT (circuit)", formula: "VTdelivered = VTset − (circuit compliance × Ppeak)", note: "~2–3 mL/cmH2O lost to tubing compression in adults" },
    { name: "Lung stress/strain", formula: "Stress = PTP (transpulmonary) · Strain = VT / FRC", note: "Injurious strain > 2 (VT > 2× FRC)" }
  ];
  var TAXONOMY = {
    breathTypes: [
      { term: "Volume control (VC)", detail: "Volume (and flow pattern) preset; pressure depends on mechanics" },
      { term: "Pressure control (PC)", detail: "Pressure preset; volume depends on mechanics" },
      { term: "Dual control", detail: "Volume target reached by adjusting pressure breath-to-breath (PRVC, ASV, VG)" }
    ],
    sequences: [
      { term: "CMV / Assist-Control", detail: "Every breath (mandatory or patient-triggered) gets the full set support" },
      { term: "IMV / SIMV", detail: "Mandatory breaths at set rate; spontaneous breaths between (synchronized windows)" },
      { term: "CSV (spontaneous)", detail: "All breaths patient-triggered/cycled (PSV, CPAP, PAV, NAVA)" }
    ],
    targeting: [
      { term: "Set-point", detail: "Operator fixes the variable (classic VCV/PCV/PSV)" },
      { term: "Dual", detail: "Volume target, pressure delivery, breath-to-breath adaptation (PRVC)" },
      { term: "Servo", detail: "Output proportional to continuous patient input (PAV, NAVA)" },
      { term: "Adaptive", detail: "Algorithm seeks set goal automatically (ASV, SmartCare)" },
      { term: "Optimal", detail: "Controller minimizes a cost function, e.g. work of breathing (Otis)" },
      { term: "Intelligent", detail: "Rule/knowledge-based expert systems (INTELLiVENT)" }
    ],
    glossary: [
      { term: "Trigger", detail: "WHAT starts inspiration: time, pressure, flow, or neural (Edi/NAVA)" },
      { term: "Limit", detail: "The variable held CONSTANT during inspiration (pressure or volume/flow)" },
      { term: "Cycle", detail: "WHAT ENDS inspiration: volume, flow decay %, time, or neural signal" },
      { term: "PEEP", detail: "Positive end-expiratory pressure — keeps alveoli open at end-exhalation" },
      { term: "Auto-PEEP (intrinsic)", detail: "Trapped alveolar pressure from incomplete emptying; measured by expiratory hold" },
      { term: "Pplat", detail: "Plateau pressure — measured at zero-flow inspiratory pause; reflects alveolar pressure" },
      { term: "Rise time", detail: "Slope to target pressure in pressure modes; demand-matched" },
      { term: "Bias flow", detail: "Continuous baseline flow used for flow-triggering (2–20 L/min)" }
    ]
  };
  var HUMIDIFICATION = {
    why: "The nose warms/filters/humidifies inspired gas; an ETT bypasses ALL of it. Dry cold gas destroys mucociliary clearance within 1–2 h → thick plugs → atelectasis → infection.",
    hme: {
      what: "Heat & moisture exchanger (HME) — passive ceramic/paper core capturing exhaled heat/moisture",
      pros: "Simple, no power, no condensate, infection-friendly",
      cons: "Adds dead space (30–90 mL — matters in small patients/CO2 retainers), clogs with bloody/purulent secretions → occlusion alarm (a cause of death if missed)",
      avoid: "Huge leaks (bronchopleural fistula, uncuffed neonatal tubes), thick secretions, low VT weaning, hypothermia"
    },
    heated: {
      what: "Active heated humidifier — water bath 37 °C + heated wire circuit",
      pros: "Full physiologic humidity (44 mg H2O/L), no added dead space",
      cons: "Condensate management (drain AWAY from patient), equipment, water reservoir infection hygiene"
    },
    rules: [
      "One humidification device at a time (HME + heated together = soaked HME)",
      "Change HME every 24 h or when soiled/loaded",
      "Never let an HME fully occlude — rising PIP with a 'loaded' HME is an emergency swap",
      "Target: 33–37 °C / 100% RH at the Y-piece (ISO standard)"
    ]
  };
  var CIRCUIT_CARE = [
    { item: "Circuit change", detail: "NOT routine — only when visibly soiled or malfunctioning (routine changes ↑ VAP)" },
    { item: "Condensate", detail: "Drain q-shift toward the expiratory side; NEVER let it reflux toward the patient" },
    { item: "Cuff pressure", detail: "20–30 cmH2O q-shift (manometer); high → necrosis, low → leak + micro-aspiration" },
    { item: "ETT depth", detail: "Document cm at teeth/lip q-shift + after any repositioning (21–23 cm adults oral typical)" },
    { item: "In-line suction (closed)", detail: "Preferred for ventilated patients — no disconnection, no desaturation, less VAP" },
    { item: "NIF/cough recheck", detail: "Weaning surveillance: NIF < −30 cmH2O and cough peak flow ≥ 60 L/min predict extubation success" }
  ];
  var NORMAL_RANGES = [
    {
      group: "Ventilator mechanics (adult, intubated)",
      rows: [
        { label: "Pplat", value: "< 30 cmH2O (ARDS: < 28–30)" },
        { label: "Driving pressure (ΔP)", value: "< 15 cmH2O" },
        { label: "Cstat", value: "40–80 mL/cmH2O" },
        { label: "Airway resistance", value: "5–15 cmH2O/L/s (intubated)" },
        { label: "Mean airway pressure", value: "5–15 cmH2O (conventional)" },
        { label: "Time constant (τ)", value: "≈ 0.3–0.7 s (disease raises it)" },
        { label: "Auto-PEEP", value: "0 (anything measurable is pathological in most cases)" },
        { label: "Stress index", value: "0.9–1.1" }
      ]
    },
    {
      group: "Gas exchange targets",
      rows: [
        { label: "SpO2 (general ICU)", value: "92–96%" },
        { label: "SpO2 (COPD/CO2-retention risk)", value: "88–92%" },
        { label: "SpO2 (ARDS, conservative O2)", value: "88–95%" },
        { label: "PaO2", value: "55–80 mmHg (ARDS) · 80–100 normal" },
        { label: "PaCO2", value: "35–45 (permissive hypercapnia pH ≥ 7.20–7.25 in ARDS)" },
        { label: "ETCO2 − PaCO2 gap", value: "2–5 mmHg normal; widens with dead space" },
        { label: "P/F", value: "> 400 normal · < 300 ARDS threshold" }
      ]
    },
    {
      group: "Oxygenation device logic",
      rows: [
        { label: "ROX index (HFNC failure)", value: "SpO2/FiO2 ÷ RR — < 2.85 at 6 h predicts intubation; ≥ 3.85 predicts success" },
        { label: "HACOR score (NIV)", value: "≥ 11 after 1 h NIV → high failure — prepare intubation" }
      ]
    }
  ];

  // scripts/vai_entry.ts
  globalThis.VAI = {
    askAI,
    consult,
    QUICK_QUESTIONS,
    VENT_MODES,
    getMode,
    PATIENT_SCENARIOS,
    getScenario,
    calc: {
      fmt,
      calcIBW,
      calcTidalVolumes,
      calcMinuteVentilation,
      calcCompliance,
      interpretCstat,
      calcDrivingPressure,
      interpretDrivingPressure,
      ARDSNET_LOW_PEEP,
      ARDSNET_HIGH_PEEP,
      ardsnetStep,
      calcRSBI,
      interpretRSBI,
      calcPF,
      interpretPF,
      calcOI,
      interpretOI,
      calcAlveolarGas,
      calcAaGradient,
      interpretAa,
      calcDeadSpace,
      interpretVdVt,
      calcTimeConstant,
      expiratoryEmptying,
      autoPeepRisk,
      calcMeanAirwayPressure,
      calcIE,
      calcCorrectedVt,
      interpretStressIndex,
      assessWeaning,
      interpretABG,
      calcInfusionRate,
      calcInfusionDose,
      calcETT,
      calcOxygenContent,
      interpretDO2,
      checkExpiratoryTime
    },
    ref: {
      VENT_ALARMS,
      DOPE_STEPS,
      VAP_BUNDLE,
      RASS_SCALE,
      CPOT_SCALE,
      BERLIN_ARDS,
      MURRAY_LIS,
      ABG_NORMALS,
      OXYGEN_DEVICES,
      PEDIATRIC_TABLE,
      PEDS_FORMULAS,
      INFUSION_DRUGS,
      SETUP_STEPS,
      PRONE_PROTOCOL,
      ECMO_CRITERIA,
      SBT_PROTOCOL,
      EXTUBATION_CHECK,
      EQUATIONS,
      TAXONOMY,
      HUMIDIFICATION,
      CIRCUIT_CARE,
      NORMAL_RANGES
    },
    sim: { generateWaveforms, DEFAULT_SETTINGS, PATHOLOGY_PRESETS, ASYNCHRONY_PATTERNS }
  };
})();
