<script>
/* ═══════════════════════════════════════════════════════════════════════════
   CALCULATOR ARRAY — 19 live tools · graphed outputs · clinical verdicts
   (engine functions come from the bundled VAI.calc)
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";
const C_ = V.calc;

/* ── form helpers ──────────────────────────────────────────────────────── */
const fN = (id, label, val, attrs) => `<div class="field"><label>${label}</label><input type="number" id="${id}" value="${val}" ${attrs || ""}></div>`;
const fR = (id, label, min, max, step, val, unit) => `<div class="field"><label>${label} <b class="mono" id="${id}v" style="float:right">${val}${unit || ""}</b></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`;
const fS = (id, label, opts, cur) => `<div class="field"><label>${label}</label><div class="seg" id="${id}">${opts.map(o => `<button data-v="${o[0]}" class="${o[0] === cur ? "on" : ""}">${o[1]}</button>`).join("")}</div></div>`;
const fD = (id, label, opts, cur) => `<div class="field"><label>${label}</label><select id="${id}">${opts.map(o => `<option value="${o[0]}" ${o[0] === cur ? "selected" : ""}>${o[1]}</option>`).join("")}</select></div>`;
const fgrid = h => `<div class="formgrid">${h}</div>`;
const cbox = (id, title, h) => `<div class="chartbox"><div class="ct">${title}</div><canvas id="${id}" height="${h || 210}"></canvas></div>`;
const nv = id => { const e = $("#" + id); if (!e) return null; const v = parseFloat(e.value); return isFinite(v) ? v : null; };
function segWire(scope, fn) { $$(".seg", scope).forEach(sg => { $$("button", sg).forEach(b => b.addEventListener("click", () => { $$("button", sg).forEach(x => x.classList.remove("on")); b.classList.add("on"); fn(); })); }); }
function segVal(id) { const b = $("#" + id + " button.on"); return b ? b.getAttribute("data-v") : null; }
function wire(scope, fn) { $$("input,select", scope).forEach(i => i.addEventListener("input", fn)); segWire(scope, fn); }

/* ══ CALC TOOLS ══════════════════════════════════════════════════════════ */
const CALC_TOOLS = {

/* ── 1 · IBW & protective VT ──────────────────────────────────────────── */
ibw: { name: "IBW & Lung-Protective VT", group: "Lung protective", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fS("ibwSex", "Sex", [["male", "MALE"], ["female", "FEMALE"]], "male") + fN("ibwH", "Height (cm)", 170, 'min="120" max="230"'))}
      <div id="ibwOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">Devine formula. <b>Never dose VT on actual body weight</b> — in a 140 kg patient that error delivers ~400 mL of extra, potentially injurious volume. ARDS: 6 mL/kg PBW (range 4–8).</div></div>
    </div>
    <div>${cbox("ibwChart", "TIDAL VOLUME LADDER · mL", 240)}</div></div>`;
  const upd = () => {
    const sex = segVal("ibwSex"), h = nv("ibwH");
    const ibw = C_.calcIBW(sex, h); const tv = C_.calcTidalVolumes(ibw);
    $("#ibwOut").innerHTML = ibw ? `<div class="res ok"><div class="rh"><span class="rl">Predicted body weight</span><span class="rv">${ibw.toFixed(1)}<small>kg</small></span></div>
      <div class="ri">RR 14–18 → minute ventilation ${(ibw * 6 * 16 / 1000).toFixed(1)}–${(ibw * 6 * 20 / 1000).toFixed(1)} L/min at 6 mL/kg</div></div>` :
      `<div class="res danger"><div class="ri">Enter a valid height (120–230 cm).</div></div>`;
    if (tv) hbars($("#ibwChart"), { rows: [
      { label: "4 mL/kg — severe ARDS", value: tv.ml4, max: tv.ml8 * 1.1, color: C.vt, disp: tv.ml4 + " mL" },
      { label: "6 mL/kg — ARDS target", value: tv.ml6, max: tv.ml8 * 1.1, color: C.cy, disp: tv.ml6 + " mL" },
      { label: "8 mL/kg — healthy lungs", value: tv.ml8, max: tv.ml8 * 1.1, color: C.gr, disp: tv.ml8 + " mL" },
    ]});
    else plot($("#ibwChart"), { series: [] });
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 2 · ARDSNet PEEP/FiO2 ────────────────────────────────────────────── */
peep: { name: "ARDSNet PEEP / FiO₂", group: "Lung protective", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fR("peepF", "Current FiO₂", 30, 100, 5, 50, "%"))
      }<div id="peepOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">Move along the ladder as oxygenation changes: adjust PEEP and FiO₂ together, targeting SpO₂ 88–95%. The higher-PEEP table suits moderate–severe ARDS; verify with Pplat/ΔP response, and de-escalate when stable.</div></div></div>
    <div>${cbox("peepChart", "PEEP vs FiO₂ · BOTH ARDSNET LADDERS", 250)}</div></div>`;
  const stepPts = (rows, pad) => { const p = []; rows.forEach((r, i) => { const x = i / (rows.length - 1); if (i) p.push([x, r.peep]); p.push([x, r.peep]); }); p.push([1.02, rows[rows.length - 1].peep]); return p; };
  const upd = () => {
    const fio2 = (nv("peepF") || 50) / 100;
    const lo = C_.ardsnetStep(fio2, "low"), hi = C_.ardsnetStep(fio2, "high");
    const x0 = clamp((fio2 - 0.3) / 0.7, 0, 1);
    $("#peepOut").innerHTML = `
      <div class="res ok"><div class="rh"><span class="rl">Lower-PEEP table</span><span class="rv">${lo}<small>cmH₂O</small></span></div></div>
      <div class="res caution"><div class="rh"><span class="rl">Higher-PEEP table</span><span class="rv">${hi}<small>cmH₂O</small></span></div>
      <div class="ri">For FiO₂ ${(fio2 * 100).toFixed(0)}%. Higher PEEP suits moderate–severe ARDS; recheck ΔP and MAP after each change.</div></div>`;
    plot($("#peepChart"), { h: 250, xr: [0, 1.03], yr: [0, 27],
      series: [
        { pts: stepPts(C_.ARDSNET_LOW_PEEP), color: C.gr, w: 2, dash: [6, 4] },
        { pts: stepPts(C_.ARDSNET_HIGH_PEEP), color: C.cy, w: 2.5 }],
      vlines: [{ x: x0, color: C.mg, label: "FiO₂ " + (fio2 * 100).toFixed(0) + "%" }],
      points: [{ x: x0, y: lo, color: C.gr, label: String(lo) }, { x: x0, y: hi, color: C.cy, label: String(hi) }],
      xLabel: "FiO₂ 0.3 → 1.0", yLabel: "PEEP", legend: [{ color: C.gr, label: "lower-PEEP" }, { color: C.cy, label: "higher-PEEP" }] });
  };
  const r = $("#peepF"); r.addEventListener("input", () => { $("#peepFv").textContent = r.value + "%"; });
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 3 · Corrected VT (circuit compliance) ────────────────────────────── */
vtcorr: { name: "Circuit-Compliance Corrected VT", group: "Lung protective", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fN("cvVt", "Set VT (mL)", 450) + fN("cvCc", "Circuit compliance (mL/cmH₂O)", 2, 'step="0.5"') + fN("cvP", "Peak pressure (cmH₂O)", 28))
      }<div id="cvOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">Part of every set VT is lost compressing the circuit gas (~1–3 mL/cmH₂O). ARDSNet counts VOLUME DELIVERED TO THE PATIENT — in small patients and high pressures the loss is clinically meaningful.</div></div></div>
    <div>${cbox("cvChart", "WHERE THE VOLUME GOES · mL", 220)}</div></div>`;
  const upd = () => {
    const vt = nv("cvVt"), cc = nv("cvCc"), p = nv("cvP");
    if (vt != null && cc != null && p != null) {
      const del = C_.calcCorrectedVt(vt, cc, p), lost = Math.max(vt - del, 0);
      const pct = vt > 0 ? (lost / vt * 100) : 0;
      $("#cvOut").innerHTML = `<div class="res ${pct > 15 ? "caution" : "ok"}"><div class="rh"><span class="rl">Delivered to patient</span><span class="rv">${Math.round(del)}<small>mL</small></span></div>
        <div class="ri">${Math.round(lost)} mL (${pct.toFixed(0)}%) compressed in the circuit${pct > 15 ? " — clinically significant: raise set VT or use a compliant-corrected circuit" : ""}.</div></div>`;
      hbars($("#cvChart"), { rows: [
        { label: "Set VT", value: vt, max: vt * 1.15, color: C.cy, disp: vt + " mL" },
        { label: "Lost to circuit", value: lost, max: vt * 1.15, color: C.rd, disp: Math.round(lost) + " mL" },
        { label: "Patient receives", value: del, max: vt * 1.15, color: C.gr, disp: Math.round(del) + " mL" }] });
    } else { $("#cvOut").innerHTML = ""; plot($("#cvChart"), { series: [] }); }
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 4 · Compliance & resistance ──────────────────────────────────────── */
comp: { name: "Compliance & Resistance", group: "Mechanics", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fN("cpVt", "VT (mL)", 450) + fN("cpPip", "PIP (cmH₂O)", 26) + fN("cpPplat", "Pplat — inspiratory hold (cmH₂O)", 22) + fN("cpPeep", "PEEP (cmH₂O)", 5) + fN("cpFlow", "End-inspiratory flow (L/min)", 30, 'step="5"'))
      }<div id="cpOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">Measure Pplat with a 0.3–0.8 s inspiratory hold on a VC breath. Cstat = VT/(Pplat−PEEP) · Cdyn = VT/(PIP−PEEP) · Raw = (PIP−Pplat)/flow(L/s).</div></div></div>
    <div>${cbox("cpChart", "PRESSURE–VOLUME LINE · PATIENT vs NORMAL", 250)}</div></div>`;
  const upd = () => {
    const vt = nv("cpVt"), pip = nv("cpPip"), plat = nv("cpPplat"), peep = nv("cpPeep"), fl = nv("cpFlow");
    const r = C_.calcCompliance(vt, pip, plat, peep, fl);
    $("#cpOut").innerHTML =
      resCard(C_.interpretCstat(r.cstat)) +
      (r.cdyn != null ? `<div class="res info"><div class="rh"><span class="rl">Dynamic compliance (includes resistance)</span><span class="rv">${r.cdyn.toFixed(1)}<small>mL/cmH₂O</small></span></div></div>` : "") +
      (r.raw != null ? `<div class="res ${r.raw > 20 ? "caution" : "ok"}"><div class="rh"><span class="rl">Airway resistance Raw</span><span class="rv">${r.raw.toFixed(1)}<small>cmH₂O/L/s</small></span></div>
        <div class="ri">${r.raw > 20 ? "Elevated — secretions, kink, bronchospasm, small ETT, or expiratory flow limitation." : r.raw < 5 ? "Unusually low — check the flow value at end-inspiration." : "Typical intubated range (10–15; ETT alone contributes ~5–8)."}</div></div>` : "");
    if (r.cstat) {
      const pat = [], nor = [];
      for (let p = peep; p <= 40; p += 1) { pat.push([p, (p - peep) * r.cstat]); nor.push([p, 60 * (p - peep)]); }
      plot($("#cpChart"), { h: 250, xr: [0, 40], yr: [0, Math.max(1400, vt * 1.6)],
        series: [{ pts: nor, color: C.gr, w: 1.5, dash: [5, 5], glow: false }, { pts: pat, color: C.cy, w: 2.5 }],
        hlines: peep > 0 ? [{ y: 0 }] : [],
        vlines: plat != null ? [{ x: plat, color: C.am, label: "Pplat" }] : [],
        points: [{ x: plat, y: vt, color: C.mg, label: "you", size: 5 }],
        xLabel: "Paw cmH₂O", yLabel: "Volume mL",
        legend: [{ color: C.cy, label: "patient Cstat " + r.cstat.toFixed(0) }, { color: C.gr, label: "normal C=60" }] });
    } else plot($("#cpChart"), { series: [] });
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 5 · Driving pressure ─────────────────────────────────────────────── */
dp: { name: "Driving Pressure (ΔP)", group: "Mechanics", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fN("dpVt", "VT (mL)", 450) + fN("dpPplat", "Pplat (cmH₂O)", 22) + fN("dpPeep", "Total PEEP (cmH₂O)", 10))
      }<div id="dpOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">ΔP = VT / Cstat = Pplat − PEEP. Amato (NEJM 2015): ΔP outperformed VT and Pplat as a mortality predictor — every cmH₂O above 15 costs ~5% survival. Reduce by lowering VT or improving effective compliance (positioning, drainage, PEEP optimization).</div></div></div>
    <div>${cbox("dpGauge", "ΔP SAFETY GAUGE · cmH₂O", 190)}</div></div>`;
  const upd = () => {
    const vt = nv("dpVt"), plat = nv("dpPplat"), peep = nv("dpPeep");
    const cstat = (plat != null && peep != null && plat > peep && vt) ? vt / (plat - peep) : null;
    const dp = C_.calcDrivingPressure(vt, cstat, plat, peep);
    $("#dpOut").innerHTML = resCard(C_.interpretDrivingPressure(dp)) + (cstat ? `<div class="res info"><div class="rh"><span class="rl">Implied compliance</span><span class="rv">${cstat.toFixed(1)}<small>mL/cmH₂O</small></span></div></div>` : "");
    gauge($("#dpGauge"), { value: dp, min: 0, max: 25, h: 190,
      zones: [{ to: 15, color: C.gr, label: "SAFE" }, { to: 20, color: C.am, label: "ELEVATED" }, { to: 25, color: C.rd, label: "HIGH" }],
      unit: "cmH₂O", label: "driving pressure" });
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 6 · Time constants & auto-PEEP risk ──────────────────────────────── */
tau: { name: "Time Constant & Auto-PEEP Risk", group: "Mechanics", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fN("tcC", "Cstat (mL/cmH₂O)", 60) + fN("tcR", "Raw (cmH₂O/L/s)", 12) + fN("tcRr", "Rate (/min)", 14) + fN("tcTi", "Ti (s)", 0.8, 'step="0.05"'))
      }<div id="tcOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">τ = R × C. Passive expiration empties 63% in 1τ, 95% in 3τ, 99% in 5τ. If expiratory time < 3τ, gas traps and auto-PEEP builds — the silent killer in obstructive disease at high rates.</div></div></div>
    <div>${cbox("tcChart", "EXPIRATORY EMPTYING · % VOLUME REMAINING", 250)}</div></div>`;
  const upd = () => {
    const c = nv("tcC"), r = nv("tcR"), rr = nv("tcRr"), ti = nv("tcTi");
    const tc = (c && r && c > 0 && r > 0) ? C_.calcTimeConstant(c, r) : null;
    let out = "";
    if (tc && tc.tau > 0) out += `<div class="res ok"><div class="rh"><span class="rl">Time constant τ</span><span class="rv">${tc.tau.toFixed(2)}<small>s</small></span></div>
      <div class="ri">95% emptying at ${tc.t95.toFixed(1)} s · 99% at ${tc.t99.toFixed(1)} s. ${tc.tau > 0.8 ? "Prolonged — obstructive pattern; protect expiratory time." : tc.tau < 0.35 ? "Short — stiff (ARDS-like) lungs empty fast; rate can go higher safely." : "Normal range (0.4–0.7 s)."}</div></div>`;
    else out += `<div class="res info"><div class="ri">Enter compliance and resistance to compute the time constant.</div></div>`;
    const chk = (rr && ti && tc && tc.tau > 0) ? C_.checkExpiratoryTime(rr, ti, tc.tau) : null;
    if (chk) out += `<div class="res ${chk.status === "ok" ? "ok" : chk.status === "caution" ? "caution" : "danger"}"><div class="rh"><span class="rl">Expiratory time check</span><span class="rv">${chk.te.toFixed(2)}<small>s = ${(chk.teOverTau).toFixed(1)}τ</small></span></div><div class="ri">${chk.verdict}</div></div>`;
    if (chk) { const ap = C_.autoPeepRisk(chk.te, tc.tau);
      out += `<div class="res ${ap.risk === "low" ? "ok" : ap.risk === "moderate" ? "caution" : "danger"}"><div class="rh"><span class="rl">Auto-PEEP risk</span><span class="rv">${ap.risk.toUpperCase()}</span></div>
        <div class="ri">~${ap.remainingPct < 1 ? "<1" : ap.remainingPct.toFixed(0)}% of VT still intrathoracic at the next breath. Confirm at the bedside with an expiratory hold.</div></div>`; }
    $("#tcOut").innerHTML = out;
    if (tc && tc.tau > 0) {
      const tmax = Math.max(tc.t99 * 1.4, chk ? chk.te * 1.2 : 3);
      plot($("#tcChart"), { h: 250, xr: [0, tmax], yr: [0, 105],
        series: [
          { pts: decayPts(0.5, 100, 60, tmax), color: C.gr, w: 1.5, dash: [4, 4], glow: false },
          { pts: decayPts(tc.tau, 100, 80, tmax), color: C.cy, w: 2.5 }],
        hlines: [{ y: 5, color: C.am, label: "5% (3τ)" }],
        vlines: chk && chk.te > 0 ? [{ x: chk.te, color: C.mg, label: "your Te" }] : [],
        points: chk && chk.te > 0 ? [{ x: chk.te, y: ap.remainingPct, color: C.mg, label: ap.remainingPct.toFixed(0) + "%" }] : [],
        xLabel: "expiration time (s)", yLabel: "% VT remaining",
        legend: [{ color: C.cy, label: "τ " + tc.tau.toFixed(2) + "s (yours)" }, { color: C.gr, label: "normal τ 0.5s" }] });
    } else plot($("#tcChart"), { series: [] });
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 7 · Stress index ─────────────────────────────────────────────────── */
stress: { name: "Stress Index", group: "Mechanics", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fR("siV", "Stress index (shape of Paw rise in constant-flow VCV)", 70, 140, 1, 100, "")}
      <div id="siOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">With constant inspiratory flow, Paw = elastic + resistive rise. Its SHAPE reveals the tidal zone: <b class="gr">straight (0.9–1.1)</b> = safe linearity; <b class="am">concave (&lt;0.9)</b> = tidal recruitment (raise PEEP); <b class="rd">convex (&gt;1.1)</b> = overdistension (lower VT/PEEP).</div></div></div>
    <div>${cbox("siChart", "PRESSURE RISE SHAPE · Paw vs TIME", 250)}</div></div>`;
  const upd = () => {
    const raw = nv("siV"), si = raw != null ? raw / 100 : null;
    if (si != null) {
      const r = C_.interpretStressIndex(si);
      $("#siOut").innerHTML = `<div class="res ${r.status}"><div class="rh"><span class="rl">${r.label}</span><span class="rv">${si.toFixed(2)}</span></div><div class="ri">${r.interpretation}</div></div>`;
      const pts = []; for (let t = 0; t <= 1.001; t += 0.02) pts.push([t, 2 + 26 * Math.pow(t, si)]);
      const lin = []; for (let t = 0; t <= 1.001; t += 0.05) lin.push([t, 2 + 26 * t]);
      plot($("#siChart"), { h: 250, xr: [0, 1], yr: [0, 32],
        series: [{ pts: lin, color: C.gr, w: 1.2, dash: [4, 4], glow: false }, { pts, color: si < 0.9 ? C.am : si > 1.1 ? C.rd : C.cy, w: 3 }],
        xLabel: "inspiratory time (normalized)", yLabel: "Paw cmH₂O",
        legend: [{ color: C.gr, label: "linear (si=1.0)" }, { color: si < 0.9 ? C.am : si > 1.1 ? C.rd : C.cy, label: "si " + si.toFixed(2) }] });
    }
  };
  const r = $("#siV"); r.addEventListener("input", () => { $("#siVv").textContent = (r.value / 100).toFixed(2); });
  wire(scope, upd); CALC_UPD = upd; upd();
} },

/* ── 8 · Mean airway pressure & I:E ───────────────────────────────────── */
map: { name: "Mean Airway Pressure & I:E", group: "Mechanics", render(scope) {
  scope.innerHTML = `<div class="calcgrid">
    <div>${fgrid(fN("mpPip", "PIP (cmH₂O)", 24) + fN("mpPeep", "PEEP (cmH₂O)", 8) + fN("mpTi", "Ti + pause (s)", 1.0, 'step="0.05"') + fN("mpRr", "Rate (/min)", 16))
      }<div id="mpOut" style="margin-top:12px"></div>
      <div class="res info"><div class="ri">MAP drives oxygenation (alveolar recruiting pressure over time) but taxes haemodynamics. Raising Ti or PEEP raises MAP — trade oxygenation against venous return, especially in RV failure or hypovolaemia.</div></div></div>
    <div>${cbox("mpChart", "PRESSURE ENVELOPE · MEAN LINE", 240)}</div></div>`;
  const upd = () => {
    const pip = nv("mpPip"), peep = nv("mpPeep"), ti = nv("mpTi"), rr = nv("mpRr");
    if (pip != null && peep != null && ti != null && rr != null && rr > 0) {
      const ttot = 60 / rr, te = ttot - ti;
      const map_ = C_.calcMeanAirwayPressure(pip, peep, ti, rr);
      const ie = C_.calcIE(ti, te);
      $("#mpOut").innerHTML = `<div class="res ok"><div class="rh"><span class="rl">Mean airway pressure</span><span class="rv">${map_.toFixed(1)}<small>cmH₂O</small></span></div></div>
        <div class="res ${te < ti ? "danger" : "ok"}"><div class="rh"><span class="rl">I:E ratio</span><span class="rv" style="font-size:17px">${ie}</span></div>
        <div class="ri">Ti ${ti.toFixed(2)}s · Te ${te.toFixed(2)}s${te < 0 ? " — impossible: Ti exceeds the breath period" : te < ti ? " — reversed/I:E; only intentional in IRV with full monitoring" : ""}</div></div>`;
      const pts = [];
      for (let t = 0; t < ttot * 2.2; t += 0.02) {
        const ph = t % ttot; let p;
        if (ph < 0.1) p = peep + (pip - peep) * (ph / 0.1);
        else if (ph < ti) p = pip;
        else p = peep + (pip - peep) * Math.max(0, 1 - (ph - ti) / 0.25);
        pts.push([t, p]);
      }
      plot($("#mpChart"), { h: 240, xr: [0, ttot * 2.2], yr: [0, Math.max(pip + 4, 20)],
        series: [{ pts, color: C.cy, w: 2 }],
        hlines: [{ y: map_, color: C.am, label: "MAP " + map_.toFixed(1) }],
        xLabel: "time (s) · 2 cycles", yLabel: "Paw" });
    } else { $("#mpOut").innerHTML = ""; plot($("#mpChart"), { series: [] }); }
  };
  wire(scope, upd); CALC_UPD = upd; upd();
} },
};
</script>
