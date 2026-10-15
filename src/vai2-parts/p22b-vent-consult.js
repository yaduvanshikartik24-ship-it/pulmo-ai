<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-V · VENT CONSULTANT (SYNAPSE)
   Image + patient/vent data → facts → rules → neural lattice → management.
   Includes the generic FormKit, shared report renderer and neural visualizer.
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

Object.assign(ICONS, {
  camera:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8a2 2 0 0 1 2-2h1.6l1.2-1.8h6.4L15.4 6H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/><circle cx="12" cy="13" r="3.6"/></svg>',
  scan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M4 12h16" stroke-dasharray="3 3"/></svg>',
  network:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="4.5" r="2.3"/><circle cx="5" cy="19" r="2.3"/><circle cx="19" cy="19" r="2.3"/><circle cx="12" cy="12.5" r="2.1"/><path d="M11 6.6L6 17M13 6.6L18 17M7.2 19h9.6M10.6 14.2L6.3 18M13.4 14.2l4.3 3.8"/></svg>',
  wand:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20L15.5 8.5"/><path d="M18 3v3M22 7h-3M19.5 10.5L18 9M13 3.5l.7 2M20.8 12.9l-1.9.6"/><path d="M15.5 8.5l2-2" opacity=".7"/></svg>',
  upload:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/></svg>',
  listcheck:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5l1.5 1.5L8 5.5M4 12.5l1.5 1.5L8 11.5M4 18.5l1.5 1.5L8 17.5M11.5 7H20M11.5 13H20M11.5 19H20"/></svg>',
});

/* ═══ FORMKIT — schema-driven form builder (shared by both consultants) ═══ */
const ckStates = {};
const FormKit = {
  fieldHtml(prefix, f){
    const id = prefix + "-" + f.id;
    if (f.t === "check"){
      const on = !!(f.v || ckStates[f.id]);
      return `<label class="ck${on ? " on" : ""}" data-ck="${esc(f.id)}" data-pre="${esc(prefix)}" style="display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--txt);cursor:pointer;border:1px solid ${on ? "var(--teal)" : "var(--line-soft)"};border-radius:8px;padding:6px 9px;background:rgba(4,9,18,.5);user-select:none">${on ? "◼" : "◻"} ${esc(f.l)}</label>`;
    }
    let inner = "";
    if (f.t === "seg"){
      inner = `<div class="seg" id="${id}" style="display:flex;width:100%">` + f.o.map((o, i) => {
        const v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o.toUpperCase();
        const on = (f.v !== undefined ? String(v) === String(f.v) : i === 0);
        return `<button type="button" data-v="${esc(v)}" class="${on ? "on" : ""}">${esc(l)}</button>`;
      }).join("") + "</div>";
    } else if (f.t === "sel"){
      inner = `<select id="${id}">` + f.o.map(o => {
        const v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o;
        return `<option value="${esc(v)}"${f.v !== undefined && String(v) === String(f.v) ? " selected" : ""}>${esc(l)}</option>`;
      }).join("") + "</select>";
    } else {
      inner = `<input id="${id}" type="${f.t === "num" ? "number" : "text"}" value="${f.v !== undefined && f.v !== null ? esc(f.v) : ""}" placeholder="${f.ph ? esc(f.ph) : ""}" step="${f.step || "any"}" autocomplete="off">`;
    }
    return `<div class="${f.w2 ? "w2 " : ""}" style="min-width:0"><label for="${id}">${esc(f.l)}${f.u ? ` <small style="color:var(--dim)">(${esc(f.u)})</small>` : ""}</label>${inner}</div>`;
  },
  build(container, schema, prefix){
    container.innerHTML = schema.map(g => {
      const fields = g.checks || g.f;
      const body = g.checks
        ? `<div class="chkgrid">${fields.map(c => this.fieldHtml(prefix, c)).join("")}</div>`
        : `<div class="fgrid-syn">${fields.map(x => this.fieldHtml(prefix, x)).join("")}</div>`;
      return `<div class="fgroup${g.open ? " open" : ""}"><div class="fgroup-h"><span class="gno">${esc(g.no || "▪")}</span> ${esc(g.t)}<span class="caret">▸</span></div>
        <div class="fgroup-b">${body}</div></div>`;
    }).join("");
    $$(".fgroup-h", container).forEach(h => h.addEventListener("click", () => h.parentElement.classList.toggle("open")));
    $$(".seg", container).forEach(sg => $$("button", sg).forEach(b => b.addEventListener("click", () => {
      $$("button", sg).forEach(x => x.classList.remove("on")); b.classList.add("on");
    })));
    $$("[data-ck]", container).forEach(ck => ck.addEventListener("click", () => {
      ck.classList.toggle("on");
      const k = ck.getAttribute("data-ck");
      ckStates[k] = ck.classList.contains("on");
      ck.firstChild.textContent = ckStates[k] ? "◼ " : "◻ ";
    }));
    return {
      collect(){
        const out = {};
        schema.forEach(g => (g.checks || g.f).forEach(f => {
          const el = document.getElementById(prefix + "-" + f.id);
          if (f.t === "check") out[f.id] = ckStates[f.id] || false;
          else if (f.t === "seg") out[f.id] = el && el.querySelector("button.on") ? el.querySelector("button.on").getAttribute("data-v") : null;
          else if (f.t === "sel") out[f.id] = el ? el.value : null;
          else {
            const raw = el ? String(el.value).trim() : "";
            out[f.id] = raw === "" ? null : (f.t === "num" ? parseFloat(raw) : raw);
          }
        }));
        return out;
      },
      set(vals){
        if (!vals) return;
        schema.forEach(g => (g.checks || g.f).forEach(f => {
          if (!(f.id in vals)) return;
          const el = document.getElementById(prefix + "-" + f.id);
          if (f.t === "check"){
            ckStates[f.id] = !!vals[f.id];
            const ckel = container.querySelector('[data-ck="' + f.id + '"]');
            if (ckel){
              ckel.classList.toggle("on", !!vals[f.id]);
              ckel.style.borderColor = vals[f.id] ? "var(--teal)" : "var(--line-soft)";
              ckel.firstChild.textContent = vals[f.id] ? "◼ " : "◻ ";
            }
          } else if (f.t === "seg"){
            if (el) $$("button", el).forEach(b => b.classList.toggle("on", b.getAttribute("data-v") === String(vals[f.id])));
          } else if (el) el.value = vals[f.id] == null ? "" : vals[f.id];
        }));
      },
    };
  },
};

/* ═══ SHARED ANALYSIS HELPERS ════════════════════════════════════════════ */
function synAcidBase(ph, paco2, hco3, na, cl){
  if (ph == null || paco2 == null || hco3 == null) return null;
  const dis = [], notes = [];
  let ag = null;
  if (na != null && cl != null){
    ag = Math.round(na - cl - hco3);
    if (ag > 12) dis.push("Elevated anion gap (" + ag + " mmol/L) — consider lactic/keto/renal/toxic causes");
    else if (ag < 3 && ph < 7.35) notes.push("Normal-gap acidosis — think GI HCO₃ loss / renal tubular acidosis");
  }
  const winter = 1.5 * hco3 + 8;
  if (ph < 7.35){
    if (paco2 > 45){
      const acuteH = 24 + (paco2 - 40) / 10, chronH = 24 + (paco2 - 40) / 10 * 3.5;
      let timing = "acute";
      if (hco3 >= chronH - 2) timing = "chronic / fully compensated (bicarbonate profile fits long-standing hypercapnia)";
      else if (hco3 > acuteH + 2) timing = "sub-acute, partially compensated";
      dis.push("Respiratory acidosis (" + timing + ")");
      if (hco3 < acuteH - 3) dis.push("+ concomitant metabolic acidosis (HCO₃ below acute-compensation expectation)");
    }
    if (hco3 < 22){
      if (!dis.some(d => d.indexOf("Metabolic acidosis") === 0)) dis.push("Metabolic acidosis");
      if (paco2 > winter + 3) dis.push("+ concomitant respiratory acidosis (PaCO₂ " + paco2 + " above Winter expectation ≈ " + winter.toFixed(0) + " ± 2)");
      else if (paco2 < winter - 3) dis.push("+ concomitant respiratory alkalosis (over-compensation vs Winter ≈ " + winter.toFixed(0) + ")");
      else notes.push("Respiratory compensation appropriate (Winter: expected PaCO₂ ≈ " + winter.toFixed(0) + " ± 2, measured " + paco2 + ")");
    }
  } else if (ph > 7.45){
    if (paco2 < 35){
      const acuteH = 24 - (40 - paco2) / 10 * 2, chronH = 24 - (40 - paco2) / 10 * 5;
      let timing = "acute";
      if (hco3 <= chronH + 2) timing = "chronic / compensated";
      else if (hco3 < acuteH - 2) timing = "partially compensated";
      dis.push("Respiratory alkalosis (" + timing + ")");
      if (hco3 < 18) dis.push("+ concomitant metabolic acidosis");
    }
    if (hco3 > 26){
      dis.push("Metabolic alkalosis");
      const exp = 40 + 0.7 * (hco3 - 24);
      if (paco2 > exp + 4) dis.push("+ concomitant respiratory acidosis (PaCO₂ above expected ≈ " + exp.toFixed(0) + ")");
      else notes.push("Compensation appropriate (expected PaCO₂ ≈ " + exp.toFixed(0) + " for HCO₃ " + hco3 + ")");
    }
  } else {
    if (paco2 > 45 && hco3 > 26) dis.push("Compensated (chronic) respiratory acidosis — normal pH at the cost of high bicarbonate");
    else if (hco3 < 22 && paco2 < 35) dis.push("Compensated metabolic acidosis (Kussmaul physiology)");
    else if (paco2 < 35) dis.push("Compensated respiratory alkalosis");
    else dis.push("Normal acid-base balance");
  }
  return { dis, notes, ag, ph, paco2, hco3 };
}
function synBerlin(pf){
  if (pf == null) return null;
  if (pf <= 100) return "severe";
  if (pf <= 200) return "moderate";
  if (pf <= 300) return "mild";
  return "none";
}
const SYN_PEEP_LOW  = [[0.3, 5], [0.4, 5], [0.5, 8], [0.6, 10], [0.7, 10], [0.8, 14], [0.9, 14], [1.01, 18]];
const SYN_PEEP_HIGH = [[0.3, 8], [0.4, 10], [0.5, 10], [0.6, 12], [0.7, 14], [0.8, 16], [0.9, 18], [1.01, 22]];
function synPeepFor(fio2, high){
  const f = clamp(fio2 == null ? 0.5 : fio2, 0.21, 1.0);
  const tbl = high ? SYN_PEEP_HIGH : SYN_PEEP_LOW;
  for (const row of tbl) if (f <= row[0]) return row[1];
  return high ? 22 : 18;
}

/* ═══ VENT CONSULTANT SCHEMA ═════════════════════════════════════════════ */
const VC_SCHEMA = [
  { t: "PATIENT PROFILE", no: "01", open: true, f: [
    { id: "age", l: "Age", u: "yr", t: "num", v: 58 },
    { id: "sex", l: "Sex", t: "seg", o: ["male", "female"], v: "male" },
    { id: "height", l: "Height", u: "cm", t: "num", v: 170 },
    { id: "weight", l: "Weight", u: "kg actual", t: "num", v: 75 },
    { id: "condition", l: "Working condition", t: "sel", w2: true, v: "unknown", o: [
      ["unknown", "Unknown / undifferentiated"], ["ards", "ARDS (confirmed or suspected)"], ["copd", "COPD exacerbation"],
      ["asthma", "Acute severe asthma"], ["cpe", "Cardiogenic pulmonary edema"], ["ohs", "Obesity-hypoventilation (OHS)"],
      ["neuro", "Neuromuscular weakness (GBS / ALS / MG)"], ["tbi", "Head injury / raised ICP"],
      ["sepsis", "Sepsis / severe pneumonia"], ["postop", "Post-operative"], ["trauma", "Chest trauma"],
      ["toxic", "Overdose / toxic"], ["wean", "Weaning assessment"] ] },
    { id: "phase", l: "Phase", t: "seg", o: [["setup", "INITIAL SETUP"], ["trouble", "ON VENT — TROUBLESHOOT"], ["wean", "WEANING"]], v: "trouble" },
  ] },
  { t: "VITALS & STATUS", no: "02", f: [
    { id: "hr", l: "HR", u: "bpm", t: "num", ph: "—" },
    { id: "map", l: "MAP", u: "mmHg", t: "num", ph: "—" },
    { id: "spo2", l: "SpO₂", u: "%", t: "num", ph: "92" },
    { id: "temp", l: "Temp", u: "°C", t: "num", ph: "—" },
    { id: "rass", l: "Sedation depth", t: "sel", o: [
      ["unknown", "— not assessed —"], ["coma", "Unresponsive / RASS −5/−4"], ["deep", "Deep sedation / RASS −3/−2"],
      ["light", "Light / RASS −1/0"], ["calm", "Alert-calm / RASS 0"], ["agitated", "Agitated / RASS +1/+2"] ], v: "light" },
  ] },
  { t: "CURRENT RESPIRATORY SUPPORT", no: "03", open: true, f: [
    { id: "mode", l: "Mode", t: "sel", w2: true, v: "VCV", o: [
      ["VCV", "VC-AC (volume control)"], ["PCV", "PC-AC (pressure control)"], ["PRVC", "PRVC"], ["PSV", "PSV (invasive)"],
      ["SIMV", "SIMV"], ["CPAP", "CPAP + PS"], ["APRV", "APRV"], ["NIV", "NIV / BiPAP (mask)"],
      ["HFNC", "HFNC (high-flow nasal O₂)"], ["O2", "None / mask O₂ only"] ] },
    { id: "vt", l: "Tidal volume", u: "mL", t: "num", v: 450 },
    { id: "rr", l: "Set / spontaneous RR", u: "/min", t: "num", v: 20 },
    { id: "peep", l: "PEEP / EPAP", u: "cmH₂O", t: "num", v: 8 },
    { id: "fio2", l: "FiO₂", u: "%", t: "num", v: 50 },
    { id: "pip", l: "PIP", u: "cmH₂O", t: "num", ph: "—" },
    { id: "pplat", l: "Pplat (insp pause)", u: "cmH₂O", t: "num", ph: "—" },
    { id: "ps", l: "Pressure support", u: "cmH₂O", t: "num", ph: "—" },
    { id: "ie", l: "I:E ratio", t: "txt", ph: "1:2", v: "1:2" },
    { id: "pflow", l: "Peak insp flow", u: "L/min", t: "num", ph: "60" },
  ] },
  { t: "BLOOD GAS & ELECTROLYTES", no: "04", open: true, f: [
    { id: "ph", l: "pH", t: "num", ph: "7.40", step: "0.01" },
    { id: "paco2", l: "PaCO₂", u: "mmHg", t: "num", ph: "40", step: "0.1" },
    { id: "pao2", l: "PaO₂", u: "mmHg", t: "num", ph: "80", step: "0.1" },
    { id: "hco3", l: "HCO₃⁻", u: "mmol/L", t: "num", ph: "24", step: "0.1" },
    { id: "na", l: "Na⁺", u: "mmol/L", t: "num", ph: "140" },
    { id: "cl", l: "Cl⁻", u: "mmol/L", t: "num", ph: "102" },
  ] },
  { t: "WAVEFORM & BEDSIDE OBSERVATIONS", no: "05", checks: [
    { id: "expFlowNotZero", l: "Expiratory flow does NOT reach zero (auto-PEEP sign)" },
    { id: "flowStarvation", l: "Flow starvation — pressure dips during inspiration" },
    { id: "doubleTrigger", l: "Double triggering / breath stacking seen" },
    { id: "weakCough", l: "Weak cough / unable to clear secretions" },
    { id: "absentCuffLeak", l: "Absent cuff-leak test (pre-extubation)" },
    { id: "highSecretions", l: "High secretion burden" },
  ] },
];

const VC_PRESETS = {
  "ARDS severe": { condition: "ards", phase: "trouble", age: 45, sex: "male", height: 175, weight: 78, mode: "VCV", vt: 480, rr: 24, peep: 10, fio2: 80, pip: 38, pplat: 34, ie: "1:2", ph: 7.28, paco2: 55, pao2: 68, hco3: 25, spo2: 89, map: 72, hr: 118, rass: "light" },
  "ARDS moderate": { condition: "ards", phase: "trouble", age: 62, sex: "female", height: 160, weight: 68, mode: "PCV", vt: 360, rr: 22, peep: 12, fio2: 70, pip: 30, pplat: 27, ie: "1:2", ph: 7.33, paco2: 48, pao2: 90, hco3: 25, spo2: 93, map: 78 },
  "COPD on vent": { condition: "copd", phase: "trouble", age: 68, sex: "male", height: 170, weight: 62, mode: "VCV", vt: 480, rr: 16, peep: 5, fio2: 40, pip: 34, pplat: 22, ie: "1:2", ph: 7.28, paco2: 78, pao2: 58, hco3: 35, spo2: 90, expFlowNotZero: true },
  "Asthma crisis": { condition: "asthma", phase: "trouble", age: 24, sex: "female", height: 165, weight: 60, mode: "VCV", vt: 420, rr: 14, peep: 5, fio2: 60, pip: 42, pplat: 28, ie: "1:3", ph: 7.22, paco2: 62, pao2: 74, hco3: 24, spo2: 92, expFlowNotZero: true, doubleTrigger: true, rass: "deep" },
  "CPE pre-intubation": { condition: "cpe", phase: "setup", age: 77, sex: "female", height: 158, weight: 82, mode: "O2", fio2: 60, ph: 7.31, paco2: 52, pao2: 58, hco3: 24, spo2: 86, map: 88, hr: 122 },
  "Obesity / OHS": { condition: "ohs", phase: "setup", age: 50, sex: "male", height: 168, weight: 130, mode: "NIV", vt: 500, rr: 18, peep: 6, fio2: 40, ph: 7.33, paco2: 58, pao2: 62, hco3: 32, spo2: 88 },
  "TBI protective": { condition: "tbi", phase: "trouble", age: 34, sex: "male", height: 180, weight: 80, mode: "VCV", vt: 550, rr: 26, peep: 5, fio2: 40, ph: 7.49, paco2: 29, pao2: 120, hco3: 24, spo2: 99, map: 80 },
  "Weaning check": { condition: "wean", phase: "wean", age: 61, sex: "male", height: 172, weight: 70, mode: "PSV", vt: 400, rr: 24, peep: 5, fio2: 35, ps: 8, ph: 7.42, paco2: 41, pao2: 88, hco3: 26, spo2: 96, map: 84 },
  "Sepsis → ARDS watch": { condition: "sepsis", phase: "trouble", age: 71, sex: "female", height: 162, weight: 66, mode: "VCV", vt: 420, rr: 26, peep: 8, fio2: 60, pip: 29, pplat: 25, ph: 7.29, paco2: 33, pao2: 70, hco3: 16, na: 138, cl: 104, spo2: 92, map: 66 },
  "Neuromuscular": { condition: "neuro", phase: "setup", age: 55, sex: "male", height: 176, weight: 74, mode: "PSV", vt: 320, rr: 22, peep: 5, fio2: 30, ph: 7.38, paco2: 52, pao2: 78, hco3: 28, spo2: 95, weakCough: true, highSecretions: true },
};

/* ═══ FACTS DERIVATION (flat: inputs + derived + _i) ════════════════════ */
function deriveVentFacts(i, img){
  const f = Object.assign({}, i);
  f.cond = i.condition;
  f.intubated = ["VCV", "PCV", "PRVC", "PSV", "SIMV", "CPAP", "APRV"].indexOf(i.mode) >= 0;
  try { f.pbw = C_.calcIBW(i.sex, i.height); } catch (e) { f.pbw = null; }
  const dosingW = f.pbw || i.weight || null;
  f.dosingW = dosingW;
  f.vtKg = (i.vt != null && dosingW) ? i.vt / dosingW : null;
  f.mv = (i.vt != null && i.rr != null) ? i.vt * i.rr / 1000 : null;
  f.dp = (i.pplat != null && i.peep != null) ? i.pplat - i.peep : ((i.pip != null && i.peep != null) ? i.pip - i.peep : null);
  f.dpExact = i.pplat != null;
  f.pf = (i.pao2 != null && i.fio2) ? i.pao2 / (i.fio2 / 100) : null;
  f.sf = (i.spo2 != null && i.fio2) ? i.spo2 / (i.fio2 / 100) : null;
  f.berlin = synBerlin(f.pf);
  f.cstat = (i.pplat != null && i.peep != null && i.vt != null) ? i.vt / Math.max(1, i.pplat - i.peep) : null;
  f.raw = (i.pip != null && i.pplat != null && i.pflow != null) ? (i.pip - i.pplat) / (i.pflow / 60) : null;
  f.tau = (f.raw != null && f.cstat != null) ? f.raw * f.cstat / 1000 : null;
  let ieE = null;
  if (typeof i.ie === "string"){ const m = i.ie.match(/1\s*[:/]\s*([\d.]+)/); if (m) ieE = parseFloat(m[1]); }
  f.ieE = ieE;
  f.te = (i.rr != null && ieE != null) ? (60 / i.rr) * (ieE / (1 + ieE)) : null;
  f.rsbi = (i.rr != null && i.vt != null && (i.phase === "wean" || i.mode === "PSV" || i.mode === "CPAP")) ? i.rr / (i.vt / 1000) : null;
  f.rox = (i.mode === "HFNC" && f.sf != null && i.rr != null) ? f.sf / i.rr : null;
  f.abg = synAcidBase(i.ph, i.paco2, i.hco3, i.na, i.cl);
  f.obese = (i.weight != null && f.pbw != null) ? i.weight / f.pbw > 1.3 : (i.weight != null && i.height != null ? i.weight / Math.pow(i.height / 100, 2) > 30 : false);
  f.img = img || {};
  f.vtTarget = f.pbw ? Math.round(6 * f.pbw) : null;
  f.peepTarget = (f.berlin === "moderate" || f.berlin === "severe") ? synPeepFor(i.fio2 == null ? 0.5 : i.fio2 / 100, true) : synPeepFor(i.fio2 == null ? 0.5 : i.fio2 / 100, false);
  f._i = i;
  return f;
}
/* null-safe numeric guards for rule predicates */
const nn = (v) => v != null && isFinite(v);
const gt = (v, lim) => nn(v) && v > lim;
const lt = (v, lim) => nn(v) && v < lim;
const between = (v, a, b) => nn(v) && v >= a && v <= b;

/* ═══ RULE BASE (forward-chaining; t/why may be functions of facts) ══════ */
const VC_RULES = [
  { id: "vt_crit", sev: "crit", when: f => gt(f.vtKg, 10), cite: "icuvent", act: "reduceVT",
    t: f => "Tidal volume " + f1(f.vtKg) + " mL/kg PBW — deep volutrauma zone",
    why: "ARDSNet (NEJM 2000): 4–8 mL/kg PBW with 6 as the target; VT above 10 mL/kg multiplies barotrauma and mortality risk in injured lungs." },
  { id: "vt_high", sev: "high", when: f => between(f.vtKg, 8, 10), cite: "icuvent", act: "reduceVT",
    t: f => "Tidal volume " + f1(f.vtKg) + " mL/kg PBW exceeds the protective range",
    why: f => "Reduce toward 6 mL/kg PBW (≈ " + (f.vtTarget || "—") + " mL for this patient) — every mL/kg above 6 adds stress on the injured lung." },
  { id: "pplat_crit", sev: "crit", when: f => gt(f.pplat, 35), cite: "icuvent", act: "reduceVT",
    t: f => "Plateau pressure " + f0(f.pplat) + " cmH₂O — dangerous overdistention",
    why: "Pplat reflects end-inspiratory alveolar stress; > 35 cmH₂O demands immediate correction (target ≤ 30, ideally ≤ 28)." },
  { id: "pplat_high", sev: "high", when: f => between(f.pplat, 30, 35), cite: "icuvent", act: "reduceVT",
    t: f => "Plateau pressure " + f0(f.pplat) + " cmH₂O above the 30 cmH₂O ceiling",
    why: "Lower VT / driving pressure until Pplat ≤ 30; in pressure modes lower the inspiratory target." },
  { id: "dp_crit", sev: "crit", when: f => gt(f.dp, 20), cite: "icuvent", act: "correctDP",
    t: f => "Driving pressure ≈ " + f0(f.dp) + " cmH₂O — the strongest mortality predictor",
    why: "Amato (NEJM 2015): ΔP (Pplat−PEEP) predicts survival better than VT or Pplat; every cmH₂O above 15 raises mortality ≈ 5%. Lower VT, or raise PEEP only if it improves compliance." },
  { id: "dp_high", sev: "high", when: f => between(f.dp, 15, 20), cite: "icuvent", act: "correctDP",
    t: f => "Driving pressure " + f0(f.dp) + " cmH₂O above the ≤ 15 target",
    why: "ΔP = VT / Crs — correct by lowering VT or redistributing PEEP toward recruitable lung." },
  { id: "vt_low", sev: "mod", when: f => between(f.vtKg, 0, 4), cite: "icuvent",
    t: f => "Very low VT (" + f1(f.vtKg) + " mL/kg) — atelectasis trade-off",
    why: "Acceptable for permissive hypercapnia if pH ≥ 7.25; otherwise raise RR or reduce dead space rather than enlarging breaths." },
  { id: "ards_mild", sev: "high", when: f => f.berlin === "mild", cite: "icuvent",
    t: f => "P/F " + f0(f.pf) + " — mild ARDS range (Berlin)",
    why: "Confirm criteria: within 1 week of insult, bilateral opacities not fully explained by effusion/atelectasis/nodules/cardiac failure, PEEP ≥ 5. Start protective ventilation immediately — mild ARDS commonly progresses." },
  { id: "ards_mod", sev: "crit", when: f => f.berlin === "moderate", cite: "icuvent", act: "peepTable",
    t: f => "P/F " + f0(f.pf) + " — moderate ARDS (Berlin)",
    why: "Full protective bundle: VT 6 mL/kg PBW, Pplat ≤ 30, ΔP ≤ 15, higher-PEEP table, conservative fluids after stabilization, consider dexamethasone 20 mg × 5 d if within 24–48 h of onset (DEXA-ARDS)." },
  { id: "ards_sev", sev: "crit", when: f => f.berlin === "severe", cite: "icuvent", act: "prone",
    t: f => "P/F " + f0(f.pf) + " — severe ARDS (Berlin)",
    why: "Prone ≥ 16 h/day (PROSEVA: mortality 33%→16% at P/F < 150), NMBA ≤ 48 h if dyssynchrony, early dexamethasone, ECMO-centre discussion per EOLIA." },
  { id: "refractory", sev: "crit", when: f => lt(f.pf, 80), cite: "ecmo", act: "ecmo",
    t: f => "Refractory hypoxemia territory (P/F " + f0(f.pf) + ")",
    why: "EOLIA referral thresholds: P/F < 50 > 3 h, pH < 7.25 with PaCO₂ ≥ 60 > 3 h, or P/F < 80 > 6 h despite optimization — call the ECMO centre EARLY, before the last-resort hour." },
  { id: "peep_fio2", sev: "high", when: f => f.berlin && f.berlin !== "none" && gt(f.fio2, 59) && nn(f.peep) && f.peep < 10, cite: "icuvent", act: "peepTable",
    t: f => "FiO₂ " + f0(f.fio2) + "% with PEEP " + f0(f.peep) + " — oxygenation unbalanced",
    why: f => "Apply the PEEP/FiO₂ tables — the higher-PEEP strategy for moderate-severe ARDS suggests PEEP ≈ " + f.peepTarget + " cmH₂O at this FiO₂. Aim SpO₂ 88–95%; sustained FiO₂ > 0.6 drives absorptive atelectasis and O₂ toxicity." },
  { id: "ph_crit", sev: "crit", when: f => lt(f.ph, 7.20), cite: "icuvent", act: "raiseRR",
    t: f => "Severe acidemia (pH " + f.ph.toFixed(2) + ")",
    why: "Raise RR toward 30–35/min to defend pH ≥ 7.20–7.25 (permissive hypercapnia), simultaneously exclude auto-PEEP which sabotages CO₂ clearance; buffers rarely help." },
  { id: "acid_resp", sev: "mod", when: f => lt(f.ph, 7.35) && gt(f.paco2, 45), cite: "icuvent",
    t: f => "Respiratory acidosis — " + (f.abg && f.abg.dis.length ? f.abg.dis[0] : "PaCO₂ " + f0(f.paco2)),
    why: "If pH ≥ 7.25 with obstructive disease, permissive hypercapnia is the accepted trade for lung protection. If pH < 7.25: raise RR, reduce dead space, check auto-PEEP." },
  { id: "alk_resp", sev: "mod", when: f => gt(f.ph, 7.45) && lt(f.paco2, 35),
    t: f => "Respiratory alkalosis (pH " + f.ph.toFixed(2) + ", PaCO₂ " + f0(f.paco2) + ")",
    why: "Over-ventilation — lower RR / PS. In TBI, review cerebral goals; in weaning candidates this often means readiness for an SBT." },
  { id: "met_acid", sev: "high", when: f => lt(f.hco3, 22) && lt(f.ph, 7.35), act: "raiseRR",
    t: f => "Metabolic acidosis with HCO₃⁻ " + f0(f.hco3),
    why: "Ventilation must compensate — expect high minute-ventilation demand; verify Winter compensation and hunt the cause (lactate/sepsis/keto/renal). If VT is cut for protection, RR must rise substantially." },
  { id: "ag_up", sev: "mod", when: f => f.abg && f.abg.ag != null && f.abg.ag > 12,
    t: f => "Anion gap " + f.abg.ag + " mmol/L",
    why: "Separate lactic (sepsis/shock), ketoacidosis, toxic and renal causes — each reshapes the ventilator strategy (high MV demand during compensation)." },
  { id: "copd_dynh", sev: "high", when: f => (f.cond === "copd" || f.cond === "asthma") && gt(f.rr, 12) && f.intubated, cite: "icuvent", act: "longTe",
    t: f => "Obstructive disease ventilated at RR " + f0(f.rr) + " — dynamic hyperinflation risk",
    why: "Time constant τ in COPD reaches 2–4 s; allow Te ≥ 3τ. Set RR 8–10, I:E 1:3–1:4, and accept permissive hypercapnia (pH ≥ 7.25) rather than stacking breaths." },
  { id: "autopeep", sev: "high", when: f => f.expFlowNotZero || (f.tau != null && f.te != null && f.te < 3 * f.tau) || f.img.autoPeep, cite: "icuvent", act: "treatAutoPeep",
    t: "Auto-PEEP signature detected",
    why: f => (f.img.autoPeep ? "Vision layer: expiratory flow fails to return to zero on the uploaded screen. " : "") + "Management: brief disconnect for full exhalation, ↓RR, ↑Te, bronchodilators, minimize dead space; haemodynamic collapse from intrathoracic pressure is the emergency." },
  { id: "asthma_stack", sev: "crit", when: f => f.cond === "asthma" && f.doubleTrigger, cite: "icuvent", act: "deepenSed",
    t: "Status asthmaticus with breath-stacking signature",
    why: "Deep sedation ± short NMBA, RR 6–10, long Te, permissive hypercapnia to pH ≥ 7.15–7.20, vigilant for tension pneumothorax and hypotension at every step." },
  { id: "tbi_hypocap", sev: "high", when: f => f.cond === "tbi" && lt(f.paco2, 34), cite: "icuvent", act: "normocapniaTBI",
    t: f => "Hyperventilation driving PaCO₂ to " + f0(f.paco2) + " mmHg",
    why: "Prophylactic hyperventilation causes cerebral vasoconstriction → secondary ischaemia. Target PaCO₂ 35–40; use 30–34 ONLY transiently for herniation signs while definitive therapy proceeds." },
  { id: "tbi_peep", sev: "mod", when: f => f.cond === "tbi" && gt(f.peep, 10) && lt(f.map, 85),
    t: "High PEEP with borderline MAP in TBI",
    why: "CPP = MAP − ICP; when raising PEEP, keep MAP supporting CPP ≥ 60 mmHg — vasopressors first-line, not PEEP surrender, when oxygenation demands pressure." },
  { id: "cpe_pre", sev: "high", when: f => f.cond === "cpe" && !f.intubated, cite: "nivhfn", act: "startNIV",
    t: "Cardiogenic pulmonary edema before intubation",
    why: "CPAP 5–10 cmH₂O (or BiPAP 10/5) is first-line: preload ↓, afterload ↓, alveolar oedema resolves — intubation rate and mortality fall. Add diuresis, nitrates per BP, and cause-directed therapy." },
  { id: "cpe_vent", sev: "mod", when: f => f.cond === "cpe" && f.intubated, cite: "nivhfn", act: "diuresis",
    t: "CPE on invasive ventilation",
    why: "Moderate PEEP (8–12) assists afterload; VT 6–8 mL/kg, wean PEEP as diuresis works, strict fluid balance, echocardiography to define the phenotype." },
  { id: "obese_peep", sev: "mod", when: f => (f.obese || f.cond === "ohs") && nn(f.peep) && f.peep < 10 && f.intubated, act: "recruitPosture",
    t: "Obesity + low PEEP — basal collapse guaranteed",
    why: "Raise PEEP to 10–12 (some need 14+), reverse Trendelenburg 25–30°, watch ΔP: compliance improves only while recruitment outweighs overdistention." },
  { id: "neuro_airway", sev: "high", when: f => f.cond === "neuro" && (f.weakCough || f.highSecretions),
    t: "Neuromuscular weak cough / secretions — aspiration trajectory",
    why: "Mechanical insufflation-exsufflation, structured secretion plan, early tracheostomy discussion from week 2 if prolonged; cough peak flow < 60 L/min predicts extubation failure." },
  { id: "postop_atel", sev: "mod", when: f => f.cond === "postop" && lt(f.spo2, 94), act: "recruitPosture",
    t: f => "Post-operative hypoxemia pattern" + (f.spo2 != null ? " (SpO₂ " + f0(f.spo2) + "%)" : ""),
    why: "Atelectasis dominates — recruitment maneuvers + PEEP 5–8, sit up, early ambulation; high-risk abdominal/cardiac surgery benefits from prophylactic NIV or HFNC." },
  { id: "sepsis_watch", sev: "high", when: f => f.cond === "sepsis", cite: "icuvent",
    t: "Sepsis / severe pneumonia on the ventilator",
    why: "Source control + antimicrobials within 1 h of shock recognition; lung-protective ventilation even BEFORE ARDS criteria (Briel meta-analysis prevents ARDS development); reassess P/F frequently — deterioration is the rule." },
  { id: "trauma_peep", sev: "mod", when: f => f.cond === "trauma",
    t: "Chest trauma on positive pressure",
    why: "Exclude pneumo/hemothorax BEFORE escalating PEEP (tension physiology = decompress first). Epidural analgesia improves ventilation more than most ventilator adjustments in rib fractures." },
  { id: "wean_ready", sev: "ok", when: f => f.rsbi != null && f.rsbi < 105, cite: "weaning", act: "startSBT",
    t: f => "Weaning profile favourable (RSBI " + f0(f.rsbi) + ")",
    why: "Daily SAT→SBT pairing (ABC trial). SBT: PSV 5–8 cmH₂O + PEEP ≤ 5 for 30–120 min. Before extubation confirm cough, secretions, mental status, cuff leak (if upper-airway risk), haemodynamics." },
  { id: "wean_delay", sev: "high", when: f => f.rsbi != null && f.rsbi >= 105, cite: "weaning",
    t: f => "RSBI " + f0(f.rsbi) + " — predicts difficult weaning",
    why: "Optimize: lightest safe sedation, nutrition, delirium control, diaphragm loading (progressive PS reduction), fix fluid overload and weakness; reassess daily." },
  { id: "rox_fail", sev: "high", when: f => f.rox != null && f.rox < 3.85, cite: "nivhfn",
    t: f => "ROX index " + f1(f.rox) + " — HFNC failure likely",
    why: "ROX = (SpO₂/FiO₂)/RR; < 3.85 at ≥ 2 h predicts failure — prepare intubation early rather than chasing desaturation." },
  { id: "rox_ok", sev: "ok", when: f => f.rox != null && f.rox >= 4.85, cite: "nivhfn",
    t: f => "ROX index " + f1(f.rox) + " — HFNC succeeding",
    why: "≥ 4.85 predicts HFNC success; continue monitored step-down and watch for fatigue (accessory muscles, RR creep)." },
  { id: "hypot", sev: "crit", when: f => lt(f.map, 65),
    t: f => "MAP " + f0(f.map) + " mmHg on positive-pressure ventilation",
    why: "Ventilation causes hypotension until proven otherwise: auto-PEEP / dynamic hyperinflation, pneumothorax, overdistention, sedation, hypovolaemia, sepsis. The disconnect test (BP returns) diagnoses hyperinflation in seconds." },
  { id: "deep_sed", sev: "mod", when: f => (f.rass === "coma" || f.rass === "deep") && f.cond !== "asthma" && f.berlin !== "severe", cite: "sedation", act: "lightenSed",
    t: "Deep sedation without severe-disease indication",
    why: "PADIS guidance: analgesia-first, target RASS 0/−2, daily SAT paired with SBT, prefer dexmedetomidine over benzodiazepines (less delirium); deep sedation prolongs ventilation." },
  { id: "img_mismatch", sev: "mod", when: f => f.img.rr && f.rr != null && Math.abs(f.img.rr - f.rr) > 4,
    t: f => "Screen RR " + f0(f.rr) + " vs vision-measured " + f0(f.img.rr) + " — spontaneous effort above set rate",
    why: "Patient is triggering beyond the mandatory rate (or asynchrony). Consider PSV/SBT if weaning, review trigger sensitivity and sedation; verify the time-window calibration first." },
  { id: "img_confirm", sev: "ok", when: f => f.img.pip && f.pip != null && Math.abs(f.img.pip - f.pip) <= 3,
    t: "Vision layer corroborates PIP (± 3 cmH₂O) — cross-modal validation passed",
    why: "Extracted waveform geometry matches the transcribed numeric — raises the confidence score of the whole data set." },
  { id: "flow_starve", sev: "mod", when: f => f.flowStarvation, act: "switchPRVC",
    t: "Flow-starvation signature",
    why: "Demand exceeds delivered flow: raise peak flow (60–90 L/min), shorten Ti, or move to flow-cycled support (PSV) so the patient sets their own pace." },
  { id: "dbl_trig", sev: "mod", when: f => f.doubleTrigger && f.cond !== "asthma",
    t: "Double triggering",
    why: "Inspiratory effort outlasts set inspiratory time — breath stacking with every double. Lengthen Ti slightly, adjust trigger sensitivity, or switch to PRVC/PAV+." },
  { id: "spo2_low", sev: "high", when: f => lt(f.spo2, 88),
    t: f => "SpO₂ " + f0(f.spo2) + "% — below the ARDS target band (88–95%)",
    why: "Escalate the oxygenation ladder: PEEP/FiO₂ table → position/prone → NIV or intubation if on ward O₂ alone. Simultaneously fix delivery: tube patency, circuit, secretions, agitation." },
  { id: "sf_ards", sev: "mod", when: f => f.pf == null && f.sf != null && f.sf < 315,
    t: f => "S/F ratio " + f0(f.sf) + " — predicts P/F < 300 (ARDS range)",
    why: "SpO₂/FiO₂ < 315 is a validated ARDS-range screen when ABG is pending — obtain the ABG and start protective settings rather than waiting." },
  { id: "ck_leak", sev: "high", when: f => f.absentCuffLeak && f.phase === "wean",
    t: "Absent cuff leak before planned extubation",
    why: "Predicts post-extubation stridor (upper-airway oedema). Options: delay 24–48 h with dexamethasone 4 mg q6h × 4 doses starting 12 h pre-extubation, and prepare for re-intubation." },
];

/* ═══ NEURAL ACTION LATTICE (hand-weighted) ═════════════════════════════ */
const VC_NET = {
  feats: ["ards","severeARDS","refractory","vtHigh","pplatHigh","dpHigh","peepLowRel","hypox","acidResp","phCrit","alkResp","metAcid","copd","asthma","autoPeep","cpe","obese","tbi","postop","weanReady","sbtFail","hfncFail","hfncOk","hypotension","deepSed","asynchrony","imgConfirm","sepsis"],
  outs: ["reduceVT","correctDP","peepTable","prone","nmb","ecmo","raiseRR","longTe","treatAutoPeep","switchPRVC","startNIV","startSBT","diuresis","bronchodilate","lightenSed","deepenSed","normocapniaTBI","recruitPosture"],
  bias: { prone: -1.2, nmb: -1.6, ecmo: -2.2, startNIV: -0.8, startSBT: -1.4, deepenSed: -1.5, diuresis: -0.8 },
  W: {
    ards:        { reduceVT: 1.6, peepTable: 1.7, prone: 0.9 },
    severeARDS:  { prone: 2.8, nmb: 1.5, peepTable: 1.3, ecmo: 0.8, reduceVT: 1.1 },
    refractory:  { ecmo: 3.0, prone: 1.7, nmb: 0.9 },
    vtHigh:      { reduceVT: 3.2, switchPRVC: 0.7 },
    pplatHigh:   { reduceVT: 2.7, switchPRVC: 1.3 },
    dpHigh:      { correctDP: 3.1, reduceVT: 1.5, peepTable: 0.5 },
    peepLowRel:  { peepTable: 2.5 },
    hypox:       { peepTable: 1.5, recruitPosture: 0.6 },
    acidResp:    { raiseRR: 0.9, longTe: 0.4 },
    phCrit:      { raiseRR: 2.6, treatAutoPeep: 0.6 },
    alkResp:     { startSBT: 0.7, lightenSed: 0.4 },
    metAcid:     { raiseRR: 1.9 },
    copd:        { longTe: 2.6, bronchodilate: 2.4, treatAutoPeep: 1.2 },
    asthma:      { longTe: 2.7, bronchodilate: 2.6, deepenSed: 1.5, treatAutoPeep: 1.1 },
    autoPeep:    { treatAutoPeep: 3.3, longTe: 1.4, bronchodilate: 0.8 },
    cpe:         { startNIV: 2.6, diuresis: 1.8 },
    obese:       { recruitPosture: 2.2, peepTable: 0.9 },
    tbi:         { normocapniaTBI: 2.9 },
    postop:      { recruitPosture: 2.3, peepTable: 0.7 },
    weanReady:   { startSBT: 3.2 },
    sbtFail:     { lightenSed: 0.8 },
    hfncFail:    { startNIV: 1.0, ecmo: 0.3 },
    hfncOk:      { lightenSed: 0.3 },
    hypotension: { treatAutoPeep: 1.1, lightenSed: 0.5 },
    deepSed:     { lightenSed: 2.7 },
    asynchrony:  { switchPRVC: 2.2, deepenSed: 0.5 },
    imgConfirm:  {},
    sepsis:      { reduceVT: 0.8, peepTable: 0.6 },
  },
};
const VC_ACT = {
  reduceVT:       { t: "Reduce VT to 6 mL/kg PBW", d: "Lung-protective foundation — ARDSNet." },
  correctDP:      { t: "Re-aim driving pressure ≤ 15 cmH₂O", d: "ΔP = VT/Crs — the mortality-linked variable." },
  peepTable:      { t: "Titrate PEEP on the PEEP/FiO₂ table", d: "Higher-PEEP strategy for moderate-severe ARDS." },
  prone:          { t: "Prone positioning ≥ 16 h/day", d: "PROSEVA — mortality 33% → 16% at P/F < 150." },
  nmb:            { t: "Consider NMBA ≤ 48 h", d: "For severe dyssynchrony / P/F < 150 (ACURASYS)." },
  ecmo:           { t: "ECMO centre referral", d: "EOLIA thresholds — refer early, not last." },
  raiseRR:        { t: "Raise RR to defend pH ≥ 7.25", d: "Up to ~35/min after excluding auto-PEEP." },
  longTe:         { t: "Lengthen expiration: RR 8–10 · I:E 1:3–4", d: "Defeat dynamic hyperinflation in obstruction." },
  treatAutoPeep:  { t: "Decompress auto-PEEP", d: "Disconnect-exhale, ↓RR, ↑Te, bronchodilate." },
  switchPRVC:     { t: "Consider PRVC / PCV (pressure-limited)", d: "Decelerating flow, pressure-capped delivery." },
  startNIV:       { t: "NIV / BiPAP trial", d: "IPAP 10–15 / EPAP 4–5, titrate to pH & RR." },
  startSBT:       { t: "Initiate SAT → SBT", d: "PSV 5–8 / PEEP ≤ 5, 30–120 min, then extubation checklist." },
  diuresis:       { t: "De-escalate fluids / diurese", d: "Conservative fluid strategy once stabilized (FACTT)." },
  bronchodilate:  { t: "Bronchodilators + systemic steroid", d: "Lower resistance → shorter τ → complete emptying." },
  lightenSed:     { t: "Lighten sedation → RASS 0/−2 + daily SAT", d: "PADIS — analgesia-first, dexmedetomidine preferred." },
  deepenSed:      { t: "Deepen sedation ± NMBA (specific indications)", d: "Asthma / severe dyssynchrony only — then lighten ASAP." },
  normocapniaTBI: { t: "Normalize PaCO₂ to 35–40 mmHg", d: "Prophylactic hyperventilation harms the injured brain." },
  recruitPosture: { t: "Recruitment + positioning", d: "PEEP 10–12 in obesity, reverse Trendelenburg, post-op sighs." },
};
function buildActiveV(f){
  const a = {};
  if (f.berlin && f.berlin !== "none") a.ards = 1;
  if (f.berlin === "severe" || (f.berlin === "moderate" && f.dp != null && f.dp > 18)) a.severeARDS = 1;
  if (f.pf != null && f.pf < 100) a.refractory = 1;
  if (gt(f.vtKg, 8)) a.vtHigh = clamp((f.vtKg - 8) / 3, 0.4, 1);
  if (gt(f.pplat, 30)) a.pplatHigh = 1;
  if (gt(f.dp, 15)) a.dpHigh = clamp((f.dp - 15) / 6, 0.5, 1);
  if (f.berlin && f.berlin !== "none" && nn(f.peep) && f.peep < 10 && gt(f.fio2, 59)) a.peepLowRel = 1;
  if ((f.pf != null && f.pf < 200) || lt(f.spo2, 90)) a.hypox = 1;
  if (lt(f.ph, 7.35) && gt(f.paco2, 45)) a.acidResp = 1;
  if (lt(f.ph, 7.20)) a.phCrit = 1;
  if (gt(f.ph, 7.45) && lt(f.paco2, 35)) a.alkResp = 1;
  if (lt(f.hco3, 22) && lt(f.ph, 7.35)) a.metAcid = 1;
  if (f.cond === "copd") a.copd = 1;
  if (f.cond === "asthma") a.asthma = 1;
  if (f.expFlowNotZero || (f.tau != null && f.te != null && f.te < 3 * f.tau) || f.img.autoPeep) a.autoPeep = 1;
  if (f.cond === "cpe") a.cpe = 1;
  if (f.obese || f.cond === "ohs") a.obese = 1;
  if (f.cond === "tbi") a.tbi = 1;
  if (f.cond === "postop") a.postop = 1;
  if (f.cond === "sepsis") a.sepsis = 1;
  if (f.rsbi != null && f.rsbi < 105) a.weanReady = 1;
  if (f.rsbi != null && f.rsbi >= 105) a.sbtFail = 1;
  if (f.rox != null && f.rox < 3.85) a.hfncFail = 1;
  if (f.rox != null && f.rox >= 4.85) a.hfncOk = 1;
  if (lt(f.map, 65)) a.hypotension = 1;
  if ((f.rass === "coma" || f.rass === "deep") && f.cond !== "asthma" && f.berlin !== "severe") a.deepSed = 1;
  if (f.flowStarvation || f.doubleTrigger) a.asynchrony = 1;
  if (f.img.pip && f.pip != null && Math.abs(f.img.pip - f.pip) <= 3) a.imgConfirm = 1;
  return a;
}

/* ═══ CORRECTIONS + MODE ADVISOR ════════════════════════════════════════ */
function ventCorrections(f){
  const i = f._i;
  const rows = [];
  const push = (param, cur, rec, why, sev, cite) => rows.push({ param, cur, rec, why, sev, cite });
  if (gt(f.vtKg, 8) || (f.berlin && f.berlin !== "none" && gt(f.vtKg, 6.5)))
    push("Tidal volume", f0(i.vt) + " mL (" + f1(f.vtKg) + " mL/kg PBW)", f.vtTarget + " mL (6 mL/kg PBW)", "ARDSNet protective target", f.vtKg > 10 ? "crit" : "high", "icuvent");
  if (gt(i.pplat, 30))
    push("Plateau pressure", f0(i.pplat) + " cmH₂O", "≤ 30 (ideally ≤ 28)", "Alveolar stress ceiling", i.pplat > 35 ? "crit" : "high", "icuvent");
  if (gt(f.dp, 15))
    push("Driving pressure", f0(f.dp) + " cmH₂O" + (f.dpExact ? "" : " (estimated from PIP — do an inspiratory pause)"), "≤ 15 cmH₂O", "Amato NEJM 2015 — strongest survival predictor", f.dp > 20 ? "crit" : "high", "icuvent");
  if ((f.berlin === "moderate" || f.berlin === "severe") && nn(i.peep) && i.peep < f.peepTarget)
    push("PEEP", f0(i.peep) + " cmH₂O @ FiO₂ " + f0(i.fio2) + "%", f.peepTarget + " cmH₂O (higher-PEEP table)", "Moderate-severe ARDS: ALVEOLI/LOVS-derived strategy", "high", "icuvent");
  if ((f.cond === "copd" || f.cond === "asthma") && f.intubated && (gt(i.rr, 12) || (f.ieE != null && f.ieE < 3)))
    push("Rate / I:E", "RR " + f0(i.rr) + " · I:E " + (i.ie || "—"), "RR 8–10 · I:E 1:3–1:4", "τ up to 2–4 s — Te ≥ 3τ prevents breath stacking", "high", "icuvent");
  if (lt(i.ph, 7.25) && gt(i.paco2, 45) && f.cond !== "copd" && f.cond !== "asthma")
    push("Respiratory rate", f0(i.rr) + " /min", "↑ to 28–35 /min (pH " + i.ph.toFixed(2) + ")", "Defend pH ≥ 7.25 while VT stays protective", i.ph < 7.20 ? "crit" : "high", "icuvent");
  if (gt(i.fio2, 60) && (i.spo2 == null || i.spo2 > 96))
    push("FiO₂", f0(i.fio2) + "%", "Wean toward ≤ 60% (SpO₂ 88–95% in ARDS)", "Hyperoxia: absorptive atelectasis + O₂ toxicity", "mod", "icuvent");
  if (f.cond === "tbi" && lt(i.paco2, 35))
    push("Minute ventilation", "PaCO₂ " + f0(i.paco2) + " mmHg", "Reduce RR toward PaCO₂ 35–40", "Cerebral perfusion protection", "high", "icuvent");
  return rows;
}
function ventModeAdvice(f){
  const i = f._i;
  const cards = [];
  const add = (m, why, conf, cite) => cards.push({ m, why, conf, cite });
  if (f.berlin && f.berlin !== "none" && f.intubated)
    add("VC-AC / PC-AC — lung-protective baseline", "Volume-guaranteed 6 mL/kg PBW with Pplat ≤ 30 and ΔP ≤ 15 remains the standard of care; PC-AC is equally valid provided the volume is checked breath-by-breath.", 92, "icuvent");
  if ((gt(i.pplat, 30) || gt(f.dp, 15) || i.flowStarvation) && i.mode === "VCV")
    add("→ PRVC (or PC-AC)", "Pressure-limited, decelerating-flow breaths with a volume guarantee — resolves flow starvation and caps Pplat automatically; watch for auto-triggering in tachypnoeic patients.", 78, "adv-modes");
  if (f.berlin === "severe" || (f.berlin === "moderate" && f.pf != null && f.pf < 150))
    add("→ Add prone ≥ 16 h/day (same mode)", "Mode change is NOT the rescue — position and PEEP are. PROSEVA halved mortality at P/F < 150; add NMBA ≤ 48 h for dyssynchrony and ECMO referral if P/F < 80 (EOLIA).", 88, "ecmo");
  if ((f.cond === "copd" || f.cond === "asthma") && !f.intubated && nn(i.ph) && i.ph >= 7.25 && i.ph < 7.35)
    add("NIV BiPAP — IPAP 10–15 / EPAP 4–5", "First-line for COPD exacerbation with respiratory acidosis (pH 7.25–7.35): titrate IPAP for Vt 6–8 mL/kg, RR < 25, leak 30–40%; alternate interface ready if it fails.", 90, "nivhfn");
  if (f.cond === "copd" && f.intubated)
    add("Stay VC-AC @ RR 8–10 · I:E 1:3–1:4", "Guaranteed small volumes with maximal expiratory time; permissive hypercapnia to pH ≥ 7.25 beats breath-stacking every time.", 85, "icuvent");
  if (f.cond === "asthma" && f.intubated)
    add("Controlled hypoventilation + deep sedation", "RR 6–10, long Te, accept acidemia (pH ≥ 7.15–7.20); brief NMBA if fighting; mechanical gas trapping = imminent hypotension — disconnect if BP collapses.", 85, "icuvent");
  if (f.cond === "cpe" && !f.intubated)
    add("CPAP 5–10 cmH₂O (NIV)", "Cardiogenic edema: CPAP first-line — preload ↓ afterload ↓ and alveolar fluid re-absorption; escalate only for exhaustion or shock.", 90, "nivhfn");
  if (f.rsbi != null && f.rsbi < 105 && (i.phase === "wean" || i.mode === "PSV" || i.mode === "CPAP"))
    add("→ PSV SBT 5–8 cmH₂O · PEEP ≤ 5", "30–120 min trial after SAT passes; extubate if RR < 35, SpO₂ ≥ 90%, HR < 140, no distress; high-risk extubations get prophylactic NIV or HFNC.", 86, "weaning");
  if (i.mode === "HFNC")
    add(f.rox != null && f.rox < 3.85 ? "→ Early intubation (ROX " + f1(f.rox) + ")" : "Continue HFNC with serial ROX", "ROX < 3.85 at ≥ 2 h = failure trajectory; ≥ 4.85 = success trajectory. Do not let HFNC mask evolving fatigue — monitor accessory muscles and RR trend.", f.rox != null && f.rox < 3.85 ? 84 : 70, "nivhfn");
  if (i.flowStarvation || i.doubleTrigger)
    add("→ PAV+ / NAVA where available", "Proportional assist tracks patient effort breath-by-breath — the definitive fix for effort-flow mismatch; otherwise adjust flow, Ti and trigger sensitivity first.", 66, "adv-modes");
  if (f.cond === "postop" && !f.intubated)
    add("Prophylactic HFNC post-extubation", "High-risk abdominal and cardiac surgery: HFNC halves reintubation in selected groups; add recruitment maneuvers and sitting position.", 68, "nivhfn");
  return cards.sort((a, b) => b.conf - a.conf).slice(0, 5);
}

/* ═══ ANALYZER ══════════════════════════════════════════════════════════ */
function analyzeVent(i, img){
  SYNAPSE.reset();
  const f = deriveVentFacts(i, img);
  const fired = VC_RULES.filter(r => { try { return !!r.when(f); } catch (e) { return false; } })
    .map(r => ({
      id: r.id, sev: r.sev, cite: r.cite, act: r.act,
      t: typeof r.t === "function" ? (() => { try { return r.t(f); } catch (e) { return r.id; } })() : r.t,
      why: typeof r.why === "function" ? (() => { try { return r.why(f); } catch (e) { return ""; } })() : r.why,
    }));
  SYNAPSE.pass("Rule induction", fired.length + "/" + VC_RULES.length + " rules fired");
  const sevRank = { crit: 0, high: 1, mod: 2, ok: 3 };
  const worst = fired.reduce((w, r) => (sevRank[r.sev] < sevRank[w] ? r.sev : w), "ok");
  const fz = {
    vt: SYNAPSE.softGrade(f.vtKg == null ? 6 : f.vtKg, [4, 6, 8, 10], ["minimal", "protective", "elevated", "high", "volutrauma-zone"]),
    dp: SYNAPSE.softGrade(f.dp == null ? 10 : f.dp, [10, 15, 20], ["gentle", "acceptable", "high", "dangerous"]),
  };
  SYNAPSE.pass("Fuzzy severity grading", "ΔP " + fz.dp.label + " · VT " + fz.vt.label);
  const active = buildActiveV(f);
  const scores = SYNAPSE.net(VC_NET, active);
  const ranked = Object.keys(VC_ACT).map(k => ({ k, p: scores[k] ? scores[k].p : 0 }))
    .filter(x => x.p > 0.5).sort((a, b) => b.p - a.p);
  SYNAPSE.pass("Neural action lattice", ranked.length + " management actions above threshold");
  const keys = ["age", "height", "weight", "mode", "vt", "rr", "peep", "fio2", "ph", "paco2", "pao2", "hco3", "spo2"];
  const prov = keys.filter(k => i[k] != null).length / keys.length;
  let conf = Math.round(46 + prov * 38 + (active.imgConfirm ? 9 : 0) + (i.pplat != null ? 7 : 0));
  conf = clamp(conf, 30, 97);
  const cites = [...new Set(fired.map(r => r.cite).filter(Boolean))];
  SYNAPSE.pass("Corpus cross-reference", cites.length + " guideline modules cited");
  SYNAPSE.pass("Confidence calibration", conf + "%");
  /* headline */
  const cls = f.berlin === "severe" ? "SEVERE" : f.berlin === "moderate" ? "MODERATE" : f.berlin === "mild" ? "MILD" : null;
  let head = "";
  if (cls) head += cls + " ARDS physiology (P/F " + f0(f.pf) + ") — ";
  else if (f.cond === "copd") head += "COPD exacerbation physiology — ";
  else if (f.cond === "asthma") head += "Near-fatal asthma physiology — ";
  else if (f.cond === "cpe") head += "Cardiogenic pulmonary edema — ";
  else if (f.cond === "wean" && f.rsbi != null) head += "Weaning assessment (RSBI " + f0(f.rsbi) + ") — ";
  const dangers = [];
  if (gt(f.vtKg, 8)) dangers.push("VT " + f1(f.vtKg) + " mL/kg");
  if (gt(i.pplat, 30)) dangers.push("Pplat " + f0(i.pplat));
  if (gt(f.dp, 15)) dangers.push("ΔP " + f0(f.dp));
  if (lt(i.ph, 7.25)) dangers.push("pH " + i.ph.toFixed(2));
  if (f.img.rr) dangers.push("measured RR " + f.img.rr);
  head += dangers.length
    ? (dangers.length > 1 ? "unsafe settings: " : "correction target: ") + dangers.join(" · ")
    : "settings broadly aligned with protective targets";
  /* management plan (phased, from top actions + condition-specific) */
  const plan = [];
  const has = k => ranked.some(x => x.k === k);
  if (worst === "crit" || has("reduceVT")) plan.push({ ph: "IMMEDIATE", t: "Correct the dangerous variables first", d: "VT → 6 mL/kg PBW, Pplat ≤ 30, ΔP ≤ 15 — recheck with an inspiratory pause after each change.", cite: "icuvent" });
  if (has("prone")) plan.push({ ph: "FIRST 6 H", t: "Prone positioning ≥ 16 h/day (P/F < 150)", d: "PROSEVA protocol: first session early, dedicated turning team, pressure-point care, resume supine for daily awakening.", cite: "ecmo" });
  if (has("ecmo")) plan.push({ ph: "FIRST 6 H", t: "Contact ECMO centre", d: "EOLIA thresholds approaching — early referral allows transfer while the patient still tolerates it.", cite: "ecmo" });
  if (has("treatAutoPeep") || has("longTe")) plan.push({ ph: "IMMEDIATE", t: "Break the hyperinflation cycle", d: "Disconnect for full exhalation, ↓RR to 8–10, I:E 1:3–4, bronchodilators — reassess BP immediately after changes.", cite: "icuvent" });
  if (has("startNIV")) plan.push({ ph: "NOW", t: "Trial NIV before intubation", d: "IPAP 10–15 / EPAP 4–5; success signs within 1–2 h: pH ↑, RR ↓, distress resolving. Failure = do not persist beyond 2 h.", cite: "nivhfn" });
  if (has("startSBT")) plan.push({ ph: "TODAY", t: "Daily SAT → SBT", d: "PSV 5–8 / PEEP ≤ 5 × 30–120 min; extubation checklist: cough, secretions, mental status, cuff leak, haemodynamics.", cite: "weaning" });
  if (has("peepTable")) plan.push({ ph: "ONGOING", t: "PEEP/FiO₂ table titration", d: f.peepTarget ? "Current FiO₂ maps to PEEP ≈ " + f.peepTarget + " cmH₂O (higher-PEEP strategy in moderate-severe ARDS); reassess ΔP response to each step." : "Follow the ARDSNet tables.", cite: "icuvent" });
  if (has("lightenSed")) plan.push({ ph: "DAILY", t: "Sedation minimization", d: "Analgesia-first, RASS 0/−2 target, daily SAT paired with SBT, CAM-ICU delirium screening.", cite: "sedation" });
  if (has("raiseRR")) plan.push({ ph: "IMMEDIATE", t: "Defend pH 7.25–7.30", d: "Raise RR toward 30–35 after excluding auto-PEEP; permissive hypercapnia is the trade for protection.", cite: "icuvent" });
  if (has("diuresis")) plan.push({ ph: "ONGOING", t: "Fluid de-escalation", d: "Conservative strategy once shock resolves (FACTT); daily balance targets with echocardiography guidance.", cite: "icuvent" });
  if (has("recruitPosture")) plan.push({ ph: "ONGOING", t: "Recruitment + positioning", d: "PEEP 10–12 for obesity/OHS, reverse Trendelenburg, sigh breaths post-op, early mobility.", cite: "icuvent" });
  plan.push({ ph: "ALWAYS", t: "Ventilator bundle", d: "Head-up 30–45°, subglottic suction ETT, cuff pressure 20–30 cmH₂O, circuit condensate drainage, no routine circuit changes.", cite: "vap" });
  return { f, fired, ranked, fz, conf, cites, head, worst, plan };
}

/* ═══ NEURAL LATTICE VISUALIZER ═════════════════════════════════════════ */
const SynViz = {
  raf: null,
  stop(){ if (this.raf) cancelAnimationFrame(this.raf); this.raf = null; },
  run(cvId, net, active, outs, actMap){
    const cv = document.getElementById(cvId); if (!cv) return;
    this.stop();
    const AM = actMap || VC_ACT;
    const feats = net.feats.filter(x => (active[x] || 0) > 0).slice(0, 9);
    const outsR = (outs || []).slice(0, 8);
    const t0 = performance.now();
    const draw = () => {
      const { ctx, w, h } = cvSetup(cv, 300);
      const el = (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      const xF = 118, xM = w / 2, xO = w - 150;
      const nF = Math.max(1, feats.length), nO = Math.max(1, outsR.length);
      const yF = i => 34 + i * (h - 62) / (nF - 1 || 1);
      const yO = i => 40 + i * (h - 82) / (nO - 1 || 1);
      const bus = 6;
      const yM = j => 30 + j * (h - 58) / (bus - 1);
      ctx.save();
      ctx.lineWidth = 1; ctx.setLineDash([2, 5]); ctx.lineDashOffset = -(el * 26) % 7;
      feats.forEach((ft) => {
        const wgt = net.W[ft] || {};
        if (!Object.keys(wgt).length) return;
        ctx.strokeStyle = "rgba(0,229,255,.16)";
        ctx.beginPath(); ctx.moveTo(xF + 26, yF(feats.indexOf(ft))); ctx.lineTo(xM - 16, yM(feats.indexOf(ft) % bus)); ctx.stroke();
      });
      ctx.strokeStyle = "rgba(255,45,120,.16)";
      outsR.forEach((o, i3) => {
        ctx.beginPath(); ctx.moveTo(xM + 16, yM(i3 % bus)); ctx.lineTo(xO - 74, yO(i3)); ctx.stroke();
      });
      ctx.restore();
      for (let j = 0; j < bus; j++){
        const pulse = 0.5 + 0.5 * Math.sin(el * 2.2 + j);
        ctx.save();
        ctx.fillStyle = "rgba(255,45,120," + (0.25 + pulse * 0.3) + ")";
        ctx.shadowColor = "#ff2d78"; ctx.shadowBlur = 8 + pulse * 8;
        ctx.beginPath(); ctx.arc(xM, yM(j), 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.font = "8.5px monospace"; ctx.textAlign = "right";
      feats.forEach((ft, i4) => {
        const yy = yF(i4);
        ctx.save();
        ctx.fillStyle = "rgba(0,229,255,.25)"; ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 7;
        ctx.beginPath(); ctx.arc(xF, yy, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        ctx.fillStyle = "#8fd8ff";
        ctx.fillText(ft.length > 16 ? ft.slice(0, 15) + "…" : ft, xF - 10, yy + 3);
      });
      ctx.textAlign = "left";
      outsR.forEach((o, i5) => {
        const yy = yO(i5);
        const act = clamp(o.p, 0, 1);
        const lbl = AM[o.k] ? AM[o.k].t : o.k;
        ctx.fillStyle = "#3dffb0"; ctx.font = "8.5px monospace";
        ctx.fillText(lbl.length > 32 ? lbl.slice(0, 31) + "…" : lbl, xO - 64, yy - 4);
        ctx.fillStyle = "rgba(120,170,230,.15)";
        ctx.beginPath(); ctx.roundRect(xO - 64, yy + 1, 140, 7, 3); ctx.fill();
        const g = ctx.createLinearGradient(xO - 64, 0, xO + 76, 0);
        g.addColorStop(0, "#00ffc6"); g.addColorStop(1, "#00e5ff");
        ctx.fillStyle = g; ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.roundRect(xO - 64, yy + 1, Math.max(4, 140 * act), 7, 3); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#d9e8ff"; ctx.font = "700 8.5px monospace";
        ctx.fillText(Math.round(act * 100) + "%", xO + 80, yy + 8);
      });
      ctx.fillStyle = "#5a6d8f"; ctx.font = "8px monospace"; ctx.textAlign = "center";
      ctx.fillText("FEATURE LAYER", xF, 14); ctx.fillText("SYNAPSE BUS", xM, 14); ctx.fillText("ACTION LAYER (σ)", xO - 30, 14);
      if (el < 14) this.raf = requestAnimationFrame(draw); else this.raf = null;
    };
    draw();
  },
};

/* ═══ SHARED REPORT RENDERER ═════════════════════════════════════════════ */
function citeChip(id){
  const g = (typeof GUIDELINES !== "undefined" ? GUIDELINES : []).find(x => x.id === id);
  const label = g ? g.name.split("—")[0].trim() : id.toUpperCase();
  return `<span class="citechip" data-cite="${esc(id)}" title="${esc(g ? g.org + " · " + g.upd : "corpus module")}">▸ ${esc(label)}</span>`;
}
function renderSynReport(cont, model, opts){
  const o = opts || {};
  const sec = (n, t, body, ic) => `
    <div class="rsec" id="sr-${n}-${o.idp}"><div class="rs-h"><span data-ic="${ic}"></span><span class="n">${n}</span>${esc(t)}</div>
    <div class="rs-b">${body}</div></div>`;
  let html = "";
  html += `<div class="rh-line"><span class="rh-sev ${model.sev}">${esc(o.sevLabels ? o.sevLabels[model.sev] : model.sev.toUpperCase())}</span>
    <div class="rh-txt">${esc(model.head)}</div></div>`;
  if (model.ranked && model.ranked.length)
    html += `<div class="neurwrap" style="margin-bottom:12px"><canvas id="${o.vizId}" height="300"></canvas>
      <div class="nlbl">SYNAPSE LATTICE · <b>${model.ranked.length}</b> ACTIONS · FEATURE → ACTION WEIGHTED PATHS</div></div>`;
  if (o.facts && o.facts.length)
    html += sec("A", "DERIVED PARAMETERS", `<div class="factchips">` + o.facts.map(x =>
      `<div class="fc ${x.cls || ""}"><div class="fk">${esc(x.k)}</div><div class="fv">${x.v}${x.u ? "<small> " + esc(x.u) + "</small>" : ""}</div></div>`).join("") + "</div>", "sigma");
  if (model.fired && model.fired.length)
    html += sec("B", o.findingsTitle || "CLINICAL FINDINGS — RULE OUTPUT", model.fired.map(r => `
      <div class="finditem"><span class="fi-sev ${r.sev}">${r.sev.toUpperCase()}</span>
        <div class="fi-t">${esc(r.t)}${r.why ? `<small>${esc(r.why)}</small>` : ""}</div>
        <div>${r.cite ? citeChip(r.cite) : ""}</div></div>`).join(""), "listcheck");
  (o.blocks || []).forEach(b => { html += sec(b.n, b.t, b.html, b.ic); });
  if (model.plan && model.plan.length)
    html += sec("C", "MANAGEMENT PLAN — SEQUENCED", model.plan.map(p => `
      <div class="planstep"><span class="ps-ph">${esc(p.ph)}</span><div class="ps-b">${esc(p.t)}${p.d ? `<small>${esc(p.d)}</small>` : ""}${p.cite ? " " + citeChip(p.cite) : ""}</div></div>`).join(""), "zap");
  html += sec("D", "ENGINE TRACE & CONFIDENCE", `
    <div class="synconf"><span>CONFIDENCE</span><div class="sc-bar"><i style="width:${model.conf}%"></i></div><b>${model.conf}%</b>
      <span style="margin-left:10px;flex:1;min-width:200px">TRAIL ▸ ${SYNAPSE.trail.map(t => esc(t.name) + " (" + esc(t.detail) + ")").join(" · ")}</span></div>
    <div style="margin-top:10px">${model.cites && model.cites.length ? model.cites.map(citeChip).join("") : "<span class='small muted'>no citations fired</span>"}</div>
    <div class="flex" style="gap:8px;margin-top:12px">
      <button class="btn" id="${o.idp}-copy"><span data-ic="copy"></span>Copy report</button>
      <button class="btn" id="${o.idp}-dl"><span data-ic="download"></span>Download .txt</button>
    </div>`, "shield");
  cont.innerHTML = html;
  hydrateIcons(cont);
  $$(".rsec", cont).forEach((s, i2) => setTimeout(() => s.classList.add("in"), 130 + i2 * 150));
  $$("[data-cite]", cont).forEach(c => c.addEventListener("click", () => openGuideline(c.getAttribute("data-cite"))));
  const cp = document.getElementById(o.idp + "-copy"), dl = document.getElementById(o.idp + "-dl");
  if (cp) cp.addEventListener("click", () => copyText(synReportText(model, o)));
  if (dl) dl.addEventListener("click", () => downloadText(o.file || "pulmo-synapse-report.txt", synReportText(model, o)));
}
function synReportText(model, o){
  const L = [];
  L.push("PULMO AI · SYNAPSE CONSULT REPORT (MK-V, offline)");
  L.push("=".repeat(64));
  L.push("SEVERITY: " + (o.sevLabels ? o.sevLabels[model.sev] : model.sev.toUpperCase()));
  L.push("ASSESSMENT: " + model.head);
  if (o.textFacts) { L.push(""); L.push("PARAMETERS:"); o.textFacts.forEach(x => L.push("  " + x)); }
  L.push("");
  L.push("FINDINGS:");
  model.fired.forEach(r => { L.push(" [" + r.sev.toUpperCase() + "] " + r.t); if (r.why) L.push("        " + r.why); });
  if (o.textBlocks) o.textBlocks.forEach(b => { L.push(""); L.push(b.t.toUpperCase() + ":"); b.items.forEach(x => L.push(" • " + x)); });
  if (model.plan){ L.push(""); L.push("MANAGEMENT PLAN:"); model.plan.forEach(p => L.push(" [" + p.ph + "] " + p.t + (p.d ? " — " + p.d : ""))); }
  L.push("");
  L.push("CONFIDENCE: " + model.conf + "%");
  L.push("ENGINE TRAIL: " + SYNAPSE.trail.map(t => t.name + " (" + t.detail + ")").join(" | "));
  L.push("");
  L.push("Educational decision support — verify against local protocols and current primary literature.");
  return L.join("\n");
}
/* animated console → then report */
function synConsole(out, lines, cb, title){
  out.innerHTML = `<div class="panel brk"><div class="panel-h"><div class="pt"><span data-ic="cpu"></span>${esc(title || "SYNAPSE CORE v5.0")}</div>
    <span class="chip warn"><span class="dot"></span>PROCESSING</span></div>
    <div class="panel-b"><div class="console" id="synCon"></div><div class="pbar"><i id="synBar"></i></div></div></div>`;
  hydrateIcons(out);
  const c = $("#synCon");
  let li = 0;
  const step = () => {
    if (li < lines.length){
      const d = document.createElement("div");
      d.className = "ln " + (li === 0 || li === lines.length - 1 ? "sys" : "hint");
      d.textContent = lines[li];
      c.appendChild(d); c.scrollTop = c.scrollHeight;
      $("#synBar").style.width = Math.round((li + 1) / lines.length * 100) + "%";
      li++; setTimeout(step, 220);
    } else setTimeout(cb, 280);
  };
  setTimeout(step, 180);
}
</script>
