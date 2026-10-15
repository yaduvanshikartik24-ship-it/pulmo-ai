<script>
/* ══ CALCULATORS part B — oxygenation · weaning · acid–base · pharm ══════ */
"use strict";
Object.assign(CALC_TOOLS, {

/* ── 9 · P/F ratio & Berlin ───────────────────────────────────────────── */
pf: { name: "P/F Ratio & Berlin ARDS", group: "Oxygenation", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fN("pfPa", "PaO₂ (mmHg)", 85) + fN("pfFi", "FiO₂ (0.21–1.0)", 0.6, 'step="0.05"'))
      }<div id="pfOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">Berlin requires: PEEP ≥ 5 · bilateral opacities · non-cardiogenic origin · within 1 week of insult. P/F is measured at that PEEP — a P/F of 150 on PEEP 5 is not the same lung as 150 on PEEP 20.</div></div></div>
    <div>${cbox("pfGauge", "BERLIN SEVERITY · P/F", 190)}</div></div>`;
  const upd = () => {
    const pa = nv("pfPa"), fi = nv("pfFi");
    const pf = C_.calcPF(pa, fi);
    $("#pfOut").innerHTML = resCard(C_.interpretPF(pf));
    gauge($("#pfGauge"), { value: pf, min: 0, max: 500, h: 190,
      zones: [{ to: 100, color: C.rd, label: "SEVERE" }, { to: 200, color: C.am, label: "MODERATE" }, { to: 300, color: "#d8c34a", label: "MILD" }, { to: 500, color: C.gr, label: "NORMAL" }],
      unit: "PaO₂/FiO₂", label: "berlin p/f" });
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 10 · Oxygenation index ───────────────────────────────────────────── */
oi: { name: "Oxygenation Index (OI)", group: "Oxygenation", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fN("oiMap", "Mean airway pressure (cmH₂O)", 16) + fN("oiFi", "FiO₂", 0.8, 'step="0.05"') + fN("oiPa", "PaO₂ (mmHg)", 60))
      }<div id="oiOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">OI = MAP × FiO₂ × 100 / PaO₂ — the cost-of-oxygenation index. Adult practice: OI > 20–25 refractory = ECMO conversation; paediatric ELSO uses OI > 40 as severe. Rising OI on constant settings = deterioration.</div></div></div>
    <div>${cbox("oiGauge", "OXYGENATION COST INDEX", 190)}</div></div>`;
  const upd = () => {
    const oi = C_.calcOI(nv("oiMap"), nv("oiFi"), nv("oiPa"));
    $("#oiOut").innerHTML = resCard(C_.interpretOI(oi));
    gauge($("#oiGauge"), { value: oi, min: 0, max: 40, h: 190,
      zones: [{ to: 4, color: C.gr, label: "OK" }, { to: 16, color: C.am, label: "SIGNIFICANT" }, { to: 25, color: "#ff7043", label: "SEVERE" }, { to: 40, color: C.rd, label: "ECMO ZONE" }],
      unit: "OI", label: "oxygenation index" });
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 11 · Alveolar gas & A–a gradient ─────────────────────────────────── */
aa: { name: "Alveolar Gas & A–a Gradient", group: "Oxygenation", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fN("aaFi", "FiO₂", 0.21, 'step="0.05"') + fN("aaCo2", "PaCO₂ (mmHg)", 40) + fN("aaPa", "PaO₂ (mmHg)", 60) + fN("aaAge", "Age (years)", 45))
      }<div id="aaOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">PAO₂ = FiO₂ × (Patm − 47) − PaCO₂/0.8 (sea level). Normal A–a ≈ 2.5 + 0.21 × age on room air. A NORMAL gradient with hypoxaemia points to hypoventilation or low FiO₂ — not lung disease.</div></div></div>
    <div>${cbox("aaChart", "ALVEOLAR vs ARTERIAL OXYGEN · mmHg", 250)}</div></div>`;
  const upd = () => {
    const fi = nv("aaFi"), co2 = nv("aaCo2"), pa = nv("aaPa"), age = nv("aaAge");
    if (fi && co2 && pa) {
      const alv = C_.calcAlveolarGas(fi, co2);
      const g = C_.calcAaGradient(alv, pa, age || 40);
      $("#aaOut").innerHTML = `<div class="res info"><div class="rh"><span class="rl">Alveolar PAO₂</span><span class="rv">${alv.toFixed(0)}<small>mmHg</small></span></div></div>` +
        resCard(C_.interpretAa(age || 40, g.aa)) +
        `<div class="res ${g.aa > g.expected * 1.5 ? "caution" : "ok"}"><div class="rh"><span class="rl">Age-expected A–a</span><span class="rv">${g.expected.toFixed(0)}<small>mmHg</small></span></div>
        <div class="ri">Gradient normally rises with FiO₂ — on 100% O₂ up to ~100–150 is tolerated; a much wider gap implies shunt > 25–30%.</div></div>`;
      hbars($("#aaChart"), { rows: [
        { label: "Alveolar PAO₂", value: alv, max: Math.max(alv, pa) * 1.15, color: C.cy, disp: alv.toFixed(0) },
        { label: "Arterial PaO₂", value: pa, max: Math.max(alv, pa) * 1.15, color: C.tl, disp: pa.toFixed(0) },
        { label: "A–a gradient", value: Math.max(g.aa, 0), max: Math.max(alv, pa) * 1.15, color: g.aa > g.expected * 1.5 ? C.rd : C.gr, disp: g.aa.toFixed(0), note: "expected for age ≈ " + g.expected.toFixed(0) }] });
    } else { $("#aaOut").innerHTML = ""; plot($("#aaChart"), { series: [] }); }
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 12 · Dead space (Bohr) ───────────────────────────────────────────── */
vd: { name: "Dead Space (Bohr-Enghoff)", group: "Oxygenation", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fN("vdVt", "VT (mL)", 450) + fN("vdPa", "PaCO₂ (mmHg)", 45) + fN("vdEt", "etCO₂ (mmHg)", 33))
      }<div id="vdOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">Vd/Vt = (PaCO₂ − etCO₂)/PaCO₂. A widening PaCO₂–etCO₂ gradient is the earliest capnographic red flag for pulmonary embolism, falling cardiac output, or worsening ARDS dead space.</div></div></div>
    <div>${cbox("vdGauge", "DEAD-SPACE FRACTION", 190)}</div></div>`;
  const upd = () => {
    const r = C_.calcDeadSpace(nv("vdVt"), nv("vdPa"), nv("vdEt"));
    $("#vdOut").innerHTML = resCard(C_.interpretVdVt(r ? r.vdvt : null)) +
      (r ? `<div class="res info"><div class="rh"><span class="rl">Dead-space volume per breath</span><span class="rv">${Math.round(r.vd)}<small>mL</small></span></div>
      <div class="ri">Of ${nv("vdVt")} mL delivered, ~${Math.round(r.vd)} mL ventilates no perfused alveoli.</div></div>` : "");
    gauge($("#vdGauge"), { value: r ? r.vdvt : null, min: 0, max: 1, h: 190,
      zones: [{ to: 0.4, color: C.gr, label: "NORMAL" }, { to: 0.6, color: C.am, label: "ELEVATED" }, { to: 1, color: C.rd, label: "SEVERE" }],
      unit: "Vd/Vt", label: "physiologic dead space" });
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 13 · Oxygen content & delivery ───────────────────────────────────── */
o2: { name: "O₂ Content & DO₂", group: "Oxygenation", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fN("oxHb", "Haemoglobin (g/dL)", 10) + fN("oxSat", "SaO₂ (%)", 95) + fN("oxPa", "PaO₂ (mmHg)", 70) + fN("oxCo", "Cardiac output (L/min)", 5, 'step="0.1"'))
      }<div id="oxOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">CaO₂ = 1.34 × Hb × SaO₂ + 0.003 × PaO₂ (mL/dL) · DO₂ = CO × CaO₂ × 10. Almost all oxygen rides on haemoglobin — a saturation of 100% with Hb 6 delivers less than 88% with Hb 14. Fix anaemia and output before chasing FiO₂.</div></div></div>
    <div>${cbox("oxChart", "OXYGEN CONTENT BREAKDOWN · mL/dL", 250)}</div></div>`;
  const upd = () => {
    const hb = nv("oxHb"), sat = nv("oxSat"), pa = nv("oxPa"), co = nv("oxCo");
    if (hb && sat && pa) {
      const r = C_.calcOxygenContent(hb, sat / 100, pa, co);
      const bound = 1.34 * hb * (sat / 100), diss = 0.003 * pa;
      $("#oxOut").innerHTML = `<div class="res ok"><div class="rh"><span class="rl">Arterial O₂ content</span><span class="rv">${r.cao2.toFixed(1)}<small>mL/dL</small></span></div></div>` + resCard(C_.interpretDO2(r.do2));
      hbars($("#oxChart"), { rows: [
        { label: "Hb-bound O₂", value: bound, max: r.cao2 * 1.2, color: C.cy, disp: bound.toFixed(1) },
        { label: "Dissolved O₂", value: Math.max(diss, 0.2), max: r.cao2 * 1.2, color: C.vt, disp: diss.toFixed(1) },
        { label: "Total CaO₂", value: r.cao2, max: r.cao2 * 1.2, color: C.gr, disp: r.cao2.toFixed(1), note: r.do2 ? "DO₂ ≈ " + Math.round(r.do2) + " mL/min at CO " + co : "" }] });
    } else { $("#oxOut").innerHTML = ""; plot($("#oxChart"), { series: [] }); }
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 14 · Minute & alveolar ventilation ───────────────────────────────── */
mv: { name: "Minute & Alveolar Ventilation", group: "Oxygenation", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fN("mvVt", "VT (mL)", 450) + fN("mvRr", "Rate (/min)", 16) + fN("mvDs", "Dead space (mL)", 150) + fN("mvPa", "Current PaCO₂ (mmHg, optional)", 40))
      }<div id="mvOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">VE = VT × RR · VA = (VT − Vd) × RR. PaCO₂ is inversely proportional to alveolar ventilation (constant CO₂ production): to halve PaCO₂ you must DOUBLE VA — the hyperbola explains why small rate changes matter in acidosis.</div></div></div>
    <div>${cbox("mvChart", "THE PaCO₂ HYPERBOLA · PaCO₂ vs ALVEOLAR VENTILATION", 260)}</div></div>`;
  const upd = () => {
    const vt = nv("mvVt"), rr = nv("mvRr"), ds = nv("mvDs"), pa = nv("mvPa");
    if (vt && rr) {
      const r = C_.calcMinuteVentilation(vt, rr, ds || 0);
      $("#mvOut").innerHTML = `<div class="res ok"><div class="rh"><span class="rl">Minute ventilation</span><span class="rv">${r.ve.toFixed(1)}<small>L/min</small></span></div></div>
        <div class="res ${r.va < 4 ? "caution" : "ok"}"><div class="rh"><span class="rl">Alveolar ventilation</span><span class="rv">${r.va.toFixed(1)}<small>L/min</small></span></div>
        <div class="ri">${r.va < 4 ? "Low alveolar ventilation — PaCO₂ will climb; raise rate or VT (respecting ΔP limits)." : "Typical adult VA 4–5 L/min maintains normocapnia at rest."}</div></div>`;
      if (pa) {
        const k = r.va * pa;
        const pts = []; for (let va = 1.5; va <= 12; va += 0.15) pts.push([va, k / va]);
        plot($("#mvChart"), { h: 260, xr: [0, 12], yr: [20, 80],
          series: [{ pts, color: C.cy, w: 2.5 }],
          hlines: [{ y: 45, color: C.am, label: "PaCO₂ 45" }, { y: 35, color: C.tl, label: "35" }],
          points: [{ x: r.va, y: pa, color: C.mg, label: "you: " + pa.toFixed(0) }],
          xLabel: "alveolar ventilation L/min", yLabel: "PaCO₂ mmHg" });
      } else plot($("#mvChart"), { series: [] });
    } else { $("#mvOut").innerHTML = ""; plot($("#mvChart"), { series: [] }); }
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 15 · RSBI ────────────────────────────────────────────────────────── */
rsbi: { name: "RSBI (f/VT)", group: "Weaning", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fN("rsRr", "Spontaneous rate (/min)", 26) + fN("rsVt", "Spontaneous VT (mL)", 320))
      }<div id="rsOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">Measure during 1 min of unassisted or minimal-support (PS ≤ 5–8) breathing. Yang & Tobin 1991: f/VT < 105 predicts SBT success (PPV 78%). Values < 60–65 are even more reassuring. RSBI alone never decides extubation — pair with airway & secretion assessment.</div></div></div>
    <div>${cbox("rsGauge", "WEANING INDEX · f/VT", 190)}</div></div>`;
  const upd = () => {
    const vt = nv("rsVt"), rr = nv("rsRr");
    const rsbi = C_.calcRSBI(rr, vt ? vt / 1000 : 0);
    $("#rsOut").innerHTML = resCard(C_.interpretRSBI(rsbi));
    gauge($("#rsGauge"), { value: rsbi, min: 0, max: 200, h: 190,
      zones: [{ to: 65, color: C.gr, label: "STRONG" }, { to: 105, color: "#7dd8a8", label: "PASS" }, { to: 130, color: C.am, label: "BORDERLINE" }, { to: 200, color: C.rd, label: "FAIL" }],
      unit: "breaths/min/L", label: "rapid shallow breathing index" });
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 16 · Weaning composite ───────────────────────────────────────────── */
wean: { name: "Weaning Composite Score", group: "Weaning", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fN("wnRsbi", "RSBI", 92) + fN("wnCough", "Cough peak flow (L/min)", 65) + fN("wnNif", "NIF (negative, cmH₂O)", -28, 'step="1"') + fN("wnLeak", "Cuff leak (% of VT)", 15) + fD("wnMental", "Mental status", [["alert", "Alert"], ["drowsy", "Drowsy"], ["agitated", "Agitated"], ["comatose", "Comatose"]], "alert"))
      }<div id="wnOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">Composite of the classic wean screens. In neuromuscular disease, cough peak flow > 160 L/min (Bach criteria) is the dominant predictor — see the Neuromuscular protocol.</div></div></div>
    <div>${cbox("wnGauge", "CRITERIA MET", 190)}</div></div>`;
  const upd = () => {
    const i = { rsbi: nv("wnRsbi"), coughPeakFlow: nv("wnCough"), pImaxNegative: nv("wnNif"), cuffLeakPct: nv("wnLeak"), mentalStatus: ($("#wnMental") || {}).value || "alert" };
    const r = C_.assessWeaning(i);
    $("#wnOut").innerHTML = `<div class="res ${r.maxScore && r.score === r.maxScore ? "ok" : r.score / Math.max(r.maxScore, 1) >= 0.7 ? "caution" : "danger"}">
        <div class="rh"><span class="rl">Composite verdict</span><span class="rv" style="font-size:15px">${r.score}/${r.maxScore} criteria</span></div><div class="ri">${r.verdict}</div></div>` +
      r.items.map(it => `<div class="res ${it.pass === null ? "info" : it.pass ? "ok" : "danger"}" style="padding:8px 14px">
        <div class="flex spread"><span class="rl" style="font-size:10px">${esc(it.name)}</span><span class="mono small ${it.pass ? "gr" : "rd"}">${it.pass ? "✓ PASS" : "✕ FAIL"} · ${esc(it.note)}</span></div></div>`).join("");
    gauge($("#wnGauge"), { value: r.maxScore ? r.score / r.maxScore * 100 : null, min: 0, max: 100, h: 190,
      zones: [{ to: 50, color: C.rd, label: "NOT READY" }, { to: 70, color: C.am, label: "MIXED" }, { to: 100, color: C.gr, label: "READY" }],
      unit: "% criteria", label: "weaning readiness" });
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 17 · ABG interpreter ─────────────────────────────────────────────── */
abg: { name: "ABG Interpreter", group: "Acid–base", render(scope) {
  scope.innerHTML = `<div class="calcgrid"><div class="full">
    ${fgrid(fN("abPh", "pH", 7.28, 'step="0.01"') + fN("abCo2", "PaCO₂", 62, 'step="1"') + fN("abHco3", "HCO₃⁻", 28, 'step="0.5"') + fN("abPa", "PaO₂ (optional)", 58) + fN("abFi", "FiO₂ (optional)", 0.4, 'step="0.05"') + fN("abNa", "Na⁺ (optional)", 138) + fN("abCl", "Cl⁻ (optional)", 102) + fN("abAge", "Age (optional)", 50))}
    <div id="abOut" style="margin-top:14px"></div></div></div>`;
  const upd = () => {
    const ph = nv("abPh"), co2 = nv("abCo2"), hco3 = nv("abHco3");
    if (!(ph && co2 && hco3)) { $("#abOut").innerHTML = `<div class="res danger"><div class="ri">Enter pH, PaCO₂ and HCO₃⁻.</div></div>`; return; }
    const r = C_.interpretABG({ ph, paco2: co2, hco3, pao2: nv("abPa"), fio2: nv("abFi"), na: nv("abNa"), cl: nv("abCl"), age: nv("abAge") });
    const sev = { normal: "ok", mild: "caution", moderate: "caution", severe: "danger" }[r.severity];
    function card(t, v, cls, note) { return v == null ? "" : `<div class="res ${cls || "info"}" style="padding:9px 14px"><div class="flex spread"><span class="rl" style="font-size:10px">${t}</span><span class="mono" style="font-size:12px"><b>${esc(v)}</b></span></div>${note ? `<div class="ri small">${esc(note)}</div>` : ""}</div>`; }
    $("#abOut").innerHTML = `
      <div class="res ${sev}" style="border-left-width:4px"><div class="rh"><span class="rl">VERDICT</span><span class="rv" style="font-size:14px;line-height:1.5">${esc(r.summary)}</span></div>
        <div class="flex" style="gap:7px;margin-top:8px"><span class="chip ${sev}">${r.severity.toUpperCase()}</span>${r.pf ? `<span class="chip">P/F ${Math.round(r.pf)}</span>` : ""}${r.ag != null ? `<span class="chip ${r.ag > 12 ? "warn" : "ok"}">AG ${Math.round(r.ag)}</span>` : ""}</div></div>
      ${r.disorders.length ? `<div class="res danger"><div class="rl">DISORDERS</div><ul class="checks" style="margin-top:6px">${r.disorders.map(d => `<li class="warn" style="font-size:12.5px">${esc(d)}</li>`).join("")}</ul></div>` : ""}
      ${r.compensation.length ? `<div class="res info"><div class="rl">COMPENSATION ANALYSIS</div><ul style="margin-top:6px">${r.compensation.map(c => `<li style="font-size:12.5px;color:var(--txt)">${esc(c)}</li>`).join("")}</ul></div>` : ""}
      <div class="grid g2">
        ${r.agInterp ? card("ANION GAP", Math.round(r.ag), r.ag > 12 ? "caution" : "ok", esc(r.agInterp)) : ""}
        ${r.deltaInterp ? card("DELTA RATIO", r.deltaRatio == null ? "—" : (+r.deltaRatio).toFixed(2), "info", esc(r.deltaInterp)) : ""}
        ${r.pfInterp ? card("P/F RATIO", Math.round(r.pf), r.pf < 200 ? "danger" : r.pf < 300 ? "caution" : "ok", esc(r.pfInterp)) : ""}
        ${r.aaInterp ? card("A–a GRADIENT", Math.round(r.aa), "info", esc(r.aaInterp)) : ""}
        ${r.hypoxemia ? card("OXYGENATION", "▼", "caution", esc(r.hypoxemia)) : ""}
      </div>
      ${r.ventilatorAdvice.length ? `<div class="res caution"><div class="rl">VENTILATOR ACTIONS</div><ul style="margin-top:6px">${r.ventilatorAdvice.map(a => `<li class="warn" style="font-size:12.5px">${esc(a)}</li>`).join("")}</ul></div>` : ""}`;
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 18 · Infusion dose ⇄ rate ────────────────────────────────────────── */
infus: { name: "Infusion Dose ⇄ Rate", group: "Pharm & paed", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fD("inDrug", "Drug", V.ref.INFUSION_DRUGS.map(d => [d.id, d.name + " — " + d.cls]))}
      <div class="formgrid" style="margin-top:12px">
      ${fN("inWt", "Weight (kg)", 70)}${fN("inConc", "Concentration (mcg/mL)", 80)}
      ${fN("inDose", "Dose (mcg/kg/min)", 0.1, 'step="0.01"')}${fN("inRate", "Rate (mL/h)", 5.25, 'step="0.25"')}
      </div><div id="inOut" style="margin-top:12px"></div>
      <div id="inNote"></div></div>
    <div>${cbox("inChart", "WHERE YOU SIT ON THE DOSE LADDER", 210)}</div></div>`;
  const upd = () => {
    const drug = V.ref.INFUSION_DRUGS.find(d => d.id === ($("#inDrug") || {}).value);
    const wt = nv("inWt"), conc = nv("inConc"), dose = nv("inDose"), rate = nv("inRate");
    let out = "";
    if (wt && conc && dose != null) {
      const r = C_.calcInfusionRate(dose, wt, conc);
      if (r != null) out += `<div class="res ok"><div class="rh"><span class="rl">Dose → Rate</span><span class="rv">${r.toFixed(1)}<small>mL/h</small></span></div></div>`;
    }
    if (wt && conc && rate != null) {
      const d = C_.calcInfusionDose(rate, wt, conc);
      if (d != null) out += `<div class="res ok"><div class="rh"><span class="rl">Rate → Dose</span><span class="rv">${d.toFixed(3)}<small>mcg/kg/min</small></span></div></div>`;
    }
    if (drug) out += `<div class="res info"><div class="rh"><span class="rl">${esc(drug.name)}</span><span class="rv" style="font-size:13px">${esc(drug.doseRange)}</span></div>
      <div class="ri"><b>Mix:</b> ${esc(drug.standardMix)} · <b>Units:</b> ${esc(drug.units)}. ${esc(drug.notes)}
      ${drug.units && drug.units.indexOf("mcg/kg/min") === -1 ? '<br><b class="am">⚠ This drug is not dosed in mcg/kg/min — the converter assumes per-kg dosing. For weight-independent units (e.g. mg/h): rate (mL/h) = dose ÷ concentration (mg/mL).</b>' : ""}</div></div>`;
    $("#inOut").innerHTML = out;
    /* dose ladder: draw user's dose position within 0..max of range if numeric parse works */
    const m = drug && drug.doseRange.match(/([\d.]+)\s*[–-]\s*([\d.]+)/);
    if (m && dose != null) {
      const lo = parseFloat(m[1]), hi = parseFloat(m[2]);
      hbars($("#inChart"), { rows: [
        { label: "Range minimum", value: lo, max: hi, color: C.gr, disp: lo + "" },
        { label: "Your dose", value: clamp(dose, 0, hi), max: hi, color: dose > hi ? C.rd : dose < lo ? C.am : C.cy, disp: dose.toFixed(2), note: "range " + lo + "–" + hi },
        { label: "Range maximum", value: hi, max: hi, color: C.rd, disp: hi + "" }] });
    } else if (rate != null && wt && conc) {
      const d = C_.calcInfusionDose(rate, wt, conc) || 0;
      hbars($("#inChart"), { rows: [{ label: "Current dose (mcg/kg/min)", value: d, max: Math.max(d * 1.3, 1), color: C.cy, disp: d.toFixed(3) }] });
    }
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 19 · Paediatric ETT ──────────────────────────────────────────────── */
ett: { name: "Paediatric ETT & Sizes", group: "Pharm & paed", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fN("etAge", "Age (years)", 4, 'min="0" max="14" step="0.5"')}
      <div id="etOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">Cuffed ETTs are now standard in most paediatric ICUs (leak-free, less pollution). Depth (oral, cm) ≈ 3 × ID. Always confirm with bilateral auscultation + CXR tip 3–5 cm above the carina. For < 1 year use fixed sizes (3.0–3.5).</div></div></div>
    <div>${cbox("etChart", "TUBE DIAMETER vs AGE · mm", 240)}</div></div>`;
  const upd = () => {
    const age = nv("etAge");
    const r = C_.calcETT(age);
    if (r) {
      $("#etOut").innerHTML = `<div class="grid g2">
        <div class="res ok"><div class="rh"><span class="rl">Uncuffed ID</span><span class="rv">${r.uncuffed}<small>mm</small></span></div></div>
        <div class="res ok"><div class="rh"><span class="rl">Cuffed ID</span><span class="rv">${r.cuffed}<small>mm</small></span></div></div>
        <div class="res info"><div class="rh"><span class="rl">Oral depth</span><span class="rv">${r.depthOral}<small>cm</small></span></div></div>
        <div class="res info"><div class="rh"><span class="rl">Nasal depth</span><span class="rv">${r.depthNasal}<small>cm</small></span></div></div></div>
        <div class="res info" style="margin-top:10px"><div class="ri">${esc(r.note)}</div></div>`;
      const unc = [], cuf = [];
      for (let a = 1; a <= 14; a += 0.5) { unc.push([a, a / 4 + 4]); cuf.push([a, a / 4 + 3.5]); }
      plot($("#etChart"), { h: 240, xr: [0, 14], yr: [3, 8.5],
        series: [{ pts: unc, color: C.gr, w: 1.5, dash: [5, 4], glow: false }, { pts: cuf, color: C.cy, w: 2.5 }],
        points: [{ x: age, y: r.cuffed, color: C.mg, label: "cuffed " + r.cuffed + "mm" }, { x: age, y: r.uncuffed, color: C.gr, label: r.uncuffed + "mm" }],
        xLabel: "age (years)", yLabel: "ETT ID mm",
        legend: [{ color: C.cy, label: "cuffed (age/4+3.5)" }, { color: C.gr, label: "uncuffed (age/4+4)" }] });
    } else { $("#etOut").innerHTML = `<div class="res danger"><div class="ri">Enter age 0–14 years (neonates: cuffed 3.0 select-use, uncuffed 3.5; depth = weight + 6 cm).</div></div>`; plot($("#etChart"), { series: [] }); }
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },
});

/* ══ RAIL + SELECT ═══════════════════════════════════════════════════════ */
var CALC_UPD = CALC_UPD || null;
let curCalc = null;
function buildCalcRail() {
  const groups = [];
  Object.entries(CALC_TOOLS).forEach(([id, t]) => {
    let g = groups.find(x => x.name === t.group);
    if (!g) { g = { name: t.group, items: [] }; groups.push(g); }
    g.items.push([id, t]);
  });
  let n = 0;
  $("#calcRail").innerHTML = groups.map(g => `<div class="rgroup">◈ ${esc(g.name.toUpperCase())}</div>` +
    g.items.map(([id, t]) => `<button data-calc="${id}"><span class="no">${(++n) < 10 ? "0" + n : n}</span> ${esc(t.name)}</button>`).join("")).join("");
  $$("#calcRail [data-calc]").forEach(b => b.addEventListener("click", () => selectCalc(b.getAttribute("data-calc"))));
}
function selectCalc(id) {
  curCalc = id;
  $$("#calcRail [data-calc]").forEach(b => b.classList.toggle("on", b.getAttribute("data-calc") === id));
  const t = CALC_TOOLS[id]; if (!t) return;
  $("#calcBody").innerHTML = `<div class="vhead" style="margin:2px 0 14px"><h2 style="font-size:16px"><span class="slash">▸</span> ${esc(t.name.toUpperCase())}</h2><span class="sub">${esc(t.group.toUpperCase())} · LIVE</span><button class="btn mini" id="calcPdfBtn" title="Generate a full offline PDF answer for this query — inputs, verdict, graphs" style="margin-left:auto;align-self:center">PDF ANSWER ▸</button></div>`;
  const scope = document.createElement("div");
  $("#calcBody").appendChild(scope);
  t.render(scope);
  const pdfBtn = document.getElementById("calcPdfBtn");
  if (pdfBtn) pdfBtn.addEventListener("click", () => { if (typeof PPDF !== "undefined" && PPDF.answerCalc) PPDF.answerCalc(id); else toast("PDF engine not loaded"); });
  REDRAW.calc = []; regRedraw("calc", () => { if (CALC_UPD && curCalc === id) CALC_UPD(); });
}
</script>
