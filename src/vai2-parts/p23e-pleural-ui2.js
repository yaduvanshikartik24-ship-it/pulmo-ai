<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-VI · PLEURAL VIEW PART 2 (p23e) — calculators · analyzer ·
   AI consult (patient data + history + scan + fluid → dx & differential)
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

/* ─── small form helpers for calculator cards ─────────────────────────── */
function plIn(id, label, ph, unit, step){
  return `<div><label>${label}${unit ? ` <span style="opacity:.6">(${unit})</span>` : ""}</label><input id="${id}" type="number" step="${step || "any"}" placeholder="${ph || ""}"></div>`;
}
function plSel(id, label, opts, w2){
  return `<div${w2 ? " style=\"grid-column:span 2\"" : ""}><label>${label}</label><select id="${id}">${opts.map(o => `<option value="${o[0]}">${o[1]}</option>`).join("")}</select></div>`;
}
function plSeg(id, label, opts){
  return `<div style="grid-column:1/-1"><label>${label}</label><div class="plseg" id="${id}">${opts.map((o, i) => `<button type="button" data-v="${o[0]}"${i === 0 ? " class=\"on\"" : ""}>${o[1]}</button>`).join("")}</div></div>`;
}
function plWireseg(id){
  $$("#" + id + " button").forEach(b => b.addEventListener("click", () => { $$("#" + id + " button").forEach(x => x.classList.remove("on")); b.classList.add("on"); }));
}
function plBtn(fn, label, pdfId){ return `<div style="grid-column:1/-1" class="flex" ><button class="btn mini" onclick="${fn}">${label || "ANALYZE ▸"}</button>${pdfId ? `<button class="btn mini ghost" onclick="plPdfCalc('${pdfId}')">PDF ANSWER ▸</button>` : ""}</div>`; }

/* ─── CALCULATORS PANE ────────────────────────────────────────────────── */
function buildPlCalcPane(){
  const el = $("#plpane-calc");
  el.innerHTML = `
    <div class="panel brk" style="margin-bottom:14px"><div class="panel-b" style="padding:12px">
      <div style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--cyan)">PLEURAL CALCULATION SUITE — 10 GRAPHED TOOLS</div>
      <p class="small muted" style="margin-top:6px;line-height:1.6">Every quantitative decision point from Light's Pleural Diseases: classification (Light's criteria, pseudoexudate rescue), drainage decisions (parapneumonic classes, manometry, re-expansion risk), sizing (pneumothorax, effusion volume), special fluids (chylous vs chyliform, hemothorax criterion, LENT prognosis) and diagnostic performance (ROC, 95% CI).</p>
    </div></div>
    <div class="pl-grid2">

      <div class="panel brk plcalc" id="plcard-lc"><div class="panel-b" style="padding:12px">
        <div style="font-weight:700;font-size:12.5px;color:#dff3ff">01 · LIGHT'S CRITERIA INTERPRETER</div>
        <div class="plcalc-form">
          ${plIn("lc-pfprot", "PF protein", "e.g. 4.2", "g/dL")}${plIn("lc-seprot", "Serum protein", "e.g. 7.0", "g/dL")}
          ${plIn("lc-pfldh", "PF LDH", "e.g. 600", "U/L")}${plIn("lc-seldh", "Serum LDH", "e.g. 220", "U/L")}
          ${plIn("lc-uln", "LDH upper limit", "300", "U/L")}
          ${plIn("lc-nt", "NT-proBNP (optional)", "—", "pg/mL")}${plIn("lc-salb", "Serum albumin (optional)", "—", "g/dL")}${plIn("lc-palb", "PF albumin (optional)", "—", "g/dL")}
          ${plBtn("plLightRun()", null, "lc")}
        </div>
        <div id="lc-out"></div><canvas id="lc-bars"></canvas><canvas id="lc-prob"></canvas>
      </div></div>

      <div class="panel brk plcalc" id="plcard-pp"><div class="panel-b" style="padding:12px">
        <div style="font-weight:700;font-size:12.5px;color:#dff3ff">02 · PARAPNEUMONIC CLASSIFIER</div>
        <div class="plcalc-form">
          ${plSel("pp-size", "Effusion size", [["small", "Small < 10 mm decubitus"], ["mod", "Moderate > 10 mm"], ["half", "> ½ hemithorax"], ["large", "Large, free-flowing"]], true)}
          ${plSel("pp-loc", "Loculated?", [["n", "No"], ["y", "Yes"]])}${plSel("pp-pus", "Frank pus?", [["n", "No"], ["y", "Yes"]])}
          ${plSel("pp-gram", "Gram stain", [["na", "Not sent"], ["neg", "Negative"], ["pos", "Positive"]])}${plSel("pp-cult", "Culture", [["na", "Not sent"], ["neg", "Negative"], ["pos", "Positive"]])}
          ${plIn("pp-ph", "PF pH", "7.—", "", "0.01")}${plIn("pp-glu", "PF glucose", "—", "mg/dL")}${plIn("pp-ldhx", "PF LDH × ULN", "e.g. 2.5", "×")}
          ${plBtn("plPpeRun()", null, "pp")}
        </div>
        <div id="pp-out"></div><canvas id="pp-chart"></canvas>
      </div></div>

      <div class="panel brk plcalc" id="plcard-mn"><div class="panel-b" style="padding:12px">
        <div style="font-weight:700;font-size:12.5px;color:#dff3ff">03 · MANOMETRY / ELASTANCE SIMULATOR</div>
        <div class="plcalc-form">
          ${plIn("mn-p0", "Initial pleural pressure", "3", "cmH₂O")}${plIn("mn-el", "Baseline elastance", "15", "cmH₂O/L")}
          ${plIn("mn-vol", "Volume removed", "1.0", "L")}
          ${plSel("mn-type", "Lung phenotype", [["normal", "Expandable lung"], ["entrap", "Active entrapment"], ["trapped", "Trapped lung (mature peel)"]], true)}
          ${plBtn("plManoRun()", null, "mn")}
        </div>
        <canvas id="mn-chart"></canvas><canvas id="mn-gauge"></canvas><div id="mn-out" style="margin-top:10px"></div>
      </div></div>

      <div class="panel brk plcalc" id="plcard-px"><div class="panel-b" style="padding:12px">
        <div style="font-weight:700;font-size:12.5px;color:#dff3ff">04 · PNEUMOTHORAX SIZE + PLAN</div>
        <div class="plcalc-form">
          ${plIn("px-a", "A · apical distance", "—", "cm")}${plIn("px-b", "B · upper-hilum rim", "—", "cm")}${plIn("px-c", "C · lower-hilum rim", "—", "cm")}
          ${plSel("px-type", "Type", [["psp", "Primary spontaneous"], ["ssp", "Secondary (COPD/CF…)"], ["tension", "TENSION — unstable"], ["trauma", "Traumatic"], ["iatro", "Iatrogenic"], ["catamenial", "Catamenial"]], true)}
          ${plSel("px-symp", "Symptomatic?", [["n", "No / mild"], ["y", "Yes"]])}
          ${plBtn("plPnxRun()", null, "px")}
        </div>
        <div id="px-out"></div><canvas id="px-chart"></canvas>
      </div></div>

      <div class="panel brk plcalc" id="plcard-ch"><div class="panel-b" style="padding:12px">
        <div style="font-weight:700;font-size:12.5px;color:#dff3ff">05 · CHYLOTHORAX DISCRIMINATOR</div>
        <div class="plcalc-form">
          ${plSel("ch-app", "Appearance", [["milky", "Milky / turbid"], ["clear", "Clear"], ["other", "Other"]], true)}
          ${plIn("ch-tg", "PF triglycerides", "—", "mg/dL")}${plIn("ch-chol", "PF cholesterol", "—", "mg/dL")}${plIn("ch-schol", "Serum cholesterol", "—", "mg/dL")}
          ${plSel("ch-cent", "Supernatant after centrifugation", [["na", "Not done"], ["clear", "Clears (cells)"], ["turbid", "Stays turbid (lipid)"]], true)}
          ${plSel("ch-chronic", "Effusion duration", [["acute", "Days–weeks"], ["years", "Years + thickened pleura"]])}
          ${plSel("ch-crys", "Cholesterol crystals on sediment", [["n", "Not seen / not done"], ["y", "Present"]])}
          ${plBtn("plChyloRun()", null, "ch")}
        </div>
        <div id="ch-out"></div><canvas id="ch-chart"></canvas>
      </div></div>

      <div class="panel brk plcalc" id="plcard-hx"><div class="panel-b" style="padding:12px">
        <div style="font-weight:700;font-size:12.5px;color:#dff3ff">06 · HEMOTHORAX CRITERION</div>
        <div class="plcalc-form">
          ${plIn("hx-hctp", "PF hematocrit", "—", "%")}${plIn("hx-hctb", "Blood hematocrit", "—", "%")}
          ${plIn("hx-rbc", "PF RBC count (optional)", "—", "/mm³")}${plIn("hx-rcbb", "Blood RBC (optional)", "—", "/mm³")}
          ${plBtn("plHemoRun()", null, "hx")}
        </div>
        <div id="hx-out"></div><canvas id="hx-chart"></canvas>
      </div></div>

      <div class="panel brk plcalc" id="plcard-le"><div class="panel-b" style="padding:12px">
        <div style="font-weight:700;font-size:12.5px;color:#dff3ff">07 · LENT SCORE — MPE PROGNOSIS</div>
        <div class="plcalc-form">
          ${plIn("le-ldh", "Pleural fluid LDH", "—", "U/L")}${plIn("le-neut", "PF neutrophils", "—", "%")}
          ${plSel("le-ecog", "ECOG", [["0", "0 — fully active"], ["1", "1 — restricted"], ["2", "2 — ambulatory < 50% day"], ["3", "3 — limited self-care"], ["4", "4 — completely disabled"]], true)}
          ${plSel("le-type", "Tumor type", [["lung", "Lung (high-risk)"], ["gi", "GI (high-risk)"], ["breast", "Breast"], ["lymphoma", "Lymphoma"], ["gyn", "Gynecologic"], ["other", "Other / unknown"]], true)}
          ${plBtn("plLentRun()", null, "le")}
        </div>
        <div id="le-out"></div><canvas id="le-chart"></canvas>
      </div></div>

      <div class="panel brk plcalc" id="plcard-v"><div class="panel-b" style="padding:12px">
        <div style="font-weight:700;font-size:12.5px;color:#dff3ff">08 · EFFUSION VOLUME ESTIMATOR</div>
        <div class="pl-chiprow" id="volChips">
          <span class="pl-chip" id="v-men" data-vv="v-men">Posterior meniscus (lateral)</span>
          <span class="pl-chip" id="v-lat" data-vv="v-lat">Blunted lateral CPA (PA)</span>
          <span class="pl-chip" id="v-pa" data-vv="v-pa">PA meniscus present</span>
          <span class="pl-chip" id="v-dia" data-vv="v-dia">Hemidiaphragm obscured</span>
          <span class="pl-chip" id="v-mass" data-vv="v-mass">Massive opacification</span>
        </div>
        <button class="btn mini" onclick="plVolRun()">ESTIMATE ▸</button>
        <button class="btn mini ghost" onclick="plPdfCalc('v')">PDF ANSWER ▸</button>
        <div id="v-out" style="margin-top:10px"></div><canvas id="v-chart"></canvas>
      </div></div>

      <div class="panel brk plcalc" id="plcard-roc" style="grid-column:1/-1"><div class="panel-b" style="padding:12px">
        <div style="font-weight:700;font-size:12.5px;color:#dff3ff">09 · DIAGNOSTIC PERFORMANCE ANALYTICS — ROC + 95% CI</div>
        <p class="small muted" style="margin-top:6px">Receiver-operating curves reconstructed from the sensitivity/specificity pairs quoted in Light 6e (ADA meta-analysis Liang n = 8,093; interferon-γ meta Jiang n = 2,101; NT-proBNP pooled; SMRP for mesothelioma; Light's criteria for exudate identification; cytology for malignancy). The CI forest displays the uncertainty around each estimate — ADA and IFN-γ dominate TB diagnosis; Light's criteria sacrifice specificity (77%) to catch virtually every exudate (98%).</p>
        <canvas id="roc-cv"></canvas><canvas id="roc-ci" style="margin-top:12px"></canvas>
        <div class="flex" style="gap:8px;margin-top:10px"><button class="btn mini ghost" onclick="plPdfCalc('roc')">PDF ANSWER ▸</button></div>
      </div></div>

    </div>`;
  ["pp-loc", "pp-pus", "pp-gram", "pp-cult", "px-symp"].forEach(plWireseg);
  $$("#volChips .pl-chip").forEach(c => c.addEventListener("click", () => c.classList.toggle("on")));
  setTimeout(() => { try { plRocRun(); } catch (e) {} }, 100);
}

/* ─── FLUID ANALYZER PANE → ADVANCED FLUID LAB (p23f) ──────────── */
function buildPlAnalyzerPane(){
  if (typeof buildAdvFluidLab === "function") { buildAdvFluidLab(); return; }
}

/* ─── AI CONSULT PANE ─────────────────────────────────────────────────── */
let plForm = null;
function buildPlConsultPane(){
  const el = $("#plpane-consult");
  el.innerHTML = `
    <div class="panel brk" style="margin-bottom:14px"><div class="panel-b" style="padding:12px">
      <div style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--cyan)">PLEURAL AI CONSULT — PATIENT + HISTORY + IMAGING + FLUID → DIAGNOSIS & DIFFERENTIAL</div>
      <p class="small muted" style="margin-top:6px;line-height:1.6">The full case engine: 4-way algorithm fusion (Light's-criteria branch logic → hard-rule guardrails → Bayesian log-odds differential across ${PL_DX.length} diseases with book-derived likelihood ratios → data-driven next-step ladder). Fill anything you know; every field is optional. Imaging findings and pleural-fluid parameters sharpen the posterior the most.</p>
      <div class="pl-chiprow" id="plPresets">
        ${PL_PRESETS.map(p => `<span class="pl-chip" data-preset="${p.id}">${esc(p.n)}</span>`).join("")}
      </div>
    </div></div>
    <div id="plConsultForm"></div>
    <div class="flex" style="gap:10px;margin:14px 0">
      <button class="btn" id="plGo">▸ ANALYZE CASE</button>
      <button class="btn ghost" id="plClear">RESET FORM</button>
    </div>
    <div id="plReport"></div>`;
  plForm = FormKit.build($("#plConsultForm"), PL_SCHEMA, "pl");
  $$("#plPresets [data-preset]").forEach(c => c.addEventListener("click", () => {
    const p = PL_PRESETS.find(x => x.id === c.getAttribute("data-preset"));
    if (!p) return;
    plForm = FormKit.build($("#plConsultForm"), PL_SCHEMA, "pl"); /* full rebuild clears stale fields */
    const d = p.v;
    Object.keys(d).forEach(k => {
      if (k === "smoking" || k === "sex" || k === "cyto" || k === "gram" || k === "side" || k === "size" || k === "mediastinum" || k === "app") plForm.set({ [k]: d[k] });
      else if (typeof d[k] === "boolean" && d[k]) plForm.set({ [k]: true });
      else plForm.set({ [k]: d[k] });
    });
    $$("#plPresets .pl-chip").forEach(x => x.classList.toggle("on", x === c));
    toast("Preset loaded: " + p.n);
  }));
  $("#plGo").addEventListener("click", plConsultGo);
  $("#plClear").addEventListener("click", () => {
    plForm = FormKit.build($("#plConsultForm"), PL_SCHEMA, "pl");
    $$("#plPresets .pl-chip").forEach(x => x.classList.remove("on"));
    $("#plReport").innerHTML = "";
    toast("Form reset");
  });
}

/* ─── the consult run + report ────────────────────────────────────────── */
function plConsultGo(){
  const d = plForm.collect();
  const box = $("#plReport");
  box.innerHTML = `<div class="ai-block info">Analyzing case across ${PL_DX.length} disease models…</div>`;
  setTimeout(() => {
    try {
      const r = plAnalyze(d);
      window._plLast = { d, r };
      box.innerHTML = plReportHtml(d, r);
      hydrateIcons(box);
      const g = document.getElementById("plConfGauge");
      if (g) gauge(g, { value: r.conf, min: 0, max: 100, unit: "%", label: "engine confidence",
        zones: [ { to: 55, color: "rgba(255,56,96,.7)", label: "LOW" }, { to: 75, color: "rgba(255,180,84,.8)", label: "MOD" }, { to: 100, color: "rgba(61,255,176,.8)", label: "HIGH" } ] });
      const cv = document.getElementById("plDxBars");
      if (cv) hbars(cv, { rows: r.scored.slice(0, 8).map((s, i) => ({
        label: s.dx.n, value: s.p * 100, max: Math.max(10, r.scored[0].p * 100),
        disp: (s.p * 100).toFixed(1) + "%",
        color: [C.rd, C.am, C.cy, C.vt, C.tl, C.mg, "#7aa7ff", "#6fe0c8"][i] || C.txt2,
        note: i === 0 ? "leading diagnosis" : "" })) });
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err){
      box.innerHTML = `<div class="ai-block bad">Engine error: ${esc(String(err && err.message || err))}</div>`;
    }
  }, 260);
}

function plReportHtml(d, r){
  const top = r.scored[0];
  const facts = [];
  if (d.age != null) facts.push(d.age + (d.sex === "female" ? " F" : " M"));
  if (d.side) facts.push(d.side + "-sided");
  if (d.size && d.size !== "none") facts.push(d.size + " effusion");
  if (r.f.exudate) facts.push("EXUDATE by Light's criteria");
  if (r.f.pseudoex) facts.push("PSEUDOEXUDATE — rescued to transudate");
  if (r.f.transudate && !r.f.pseudoex && r.f.hadLight) facts.push("TRANSUDATE by Light's criteria");
  if (r.f.neutro) facts.push("neutrophilic");
  if (r.f.lympho) facts.push("lymphocyte-predominant");
  if (r.f.lymph95) facts.push("lymphocytes > 95%");
  if (r.f.eosino) facts.push("eosinophilia > 10%");
  if (r.f.lowGlucose) facts.push("glucose < 60");
  if (r.f.phLow) facts.push("pH < 7.20");
  if (r.f.adaHigh) facts.push("ADA > 40");
  if (r.f.cytologyPos) facts.push("cytology " + (d.cyto === "pos" ? "POSITIVE" : "atypical"));
  const mgmt = top.dx.mgmt;
  return `
  <div class="panel brk pl-report" style="border-color:var(--cyan)">
    <div class="panel-b" style="padding:14px">
      <div class="flex wrap" style="gap:12px;align-items:center;margin-bottom:8px">
        <div style="font-family:var(--mono);font-size:11px;letter-spacing:.16em;color:var(--cyan)">PLEURAL CONSULT REPORT</div>
        <div style="flex:1"></div>
        <button class="btn mini ghost" id="plCopy">COPY</button>
        <button class="btn mini" id="plDl">DOWNLOAD ▸</button>
        <button class="btn mini" id="plPdfBtn">PDF REPORT ▸</button>
      </div>
      <div class="flex wrap" style="gap:6px;margin-bottom:12px">${facts.map(f => `<span class="chip info">${esc(f.toUpperCase())}</span>`).join("") || "<span class='chip info'>MINIMAL DATA</span>"}</div>

      ${r.alerts.length ? r.alerts.map(a => `<div class="ai-block ${a.c}"><b>⚠ ${esc(a.t)}</b><br><span class="small">${esc(a.w)}</span></div>`).join("") : ""}

      <h4>Leading diagnosis</h4>
      <div class="ai-block bad" style="border-left:3px solid var(--rd)">
        <b style="font-size:14px">${esc(top.dx.n)}</b> <span class="chip danger" style="margin-left:6px">${(top.p * 100).toFixed(1)}%</span>
        <br><span class="small">${esc(top.dx.summ)}</span></div>

      <h4>Bayesian differential (log-odds fusion, ${PL_DX.length} disease models)</h4>
      <canvas id="plDxBars"></canvas>
      <div class="small muted" style="margin-top:6px">Posterior probabilities from baseline prevalence × likelihood ratios for every present/absent feature (Light 6e data), constrained by transudate/exudate branch logic. Bars are relative — use them to rank the workup, not as a biopsy result.</div>

      <h4>Confidence</h4>
      <canvas id="plConfGauge"></canvas>

      <h4>Next diagnostic steps (data-driven ladder — Light ch. 8)</h4>
      <ul class="checks">${r.steps.map(s => `<li class="warn">${esc(s)}</li>`).join("")}</ul>

      <h4>Management — ${esc(top.dx.n)}</h4>
      <ul class="checks">${mgmt.map(m => `<li class="good">${esc(m)}</li>`).join("")}</ul>

      <h4>Second-consideration checklist</h4>
      <ul class="checks">${r.scored.slice(1, 4).map(s => `<li class="warn"><b>${esc(s.dx.n)}</b> (${(s.p * 100).toFixed(1)}%) — ${esc(s.dx.mgmt[0])}</li>`).join("")}</ul>

      <div class="small muted" style="margin-top:14px;border-top:1px solid var(--line-soft);padding-top:10px">
        Source corpus: Light's Pleural Diseases 6th Edition (Richard W. Light), full 522-page scan. Engine: ${PL_DX.length}-disease Bayesian differential + Light's-criteria classifier + rule guardrails + next-step ladder. Educational decision support — not a substitute for clinical judgement, local protocols, or specialist consultation.</div>
    </div>
  </div>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest("#plCopy, #plDl, #plPdfBtn");
  if (!b) return;
  if (b.id === "plPdfBtn") { if (typeof plPdfConsult === "function") plPdfConsult(); return; }
  const panel = b.closest(".pl-report");
  const txt = panel ? panel.innerText : "";
  if (b.id === "plCopy"){ navigator.clipboard && navigator.clipboard.writeText(txt).then(() => toast("Report copied")); }
  else { downloadText("pulmo-pleural-consult.txt", txt); toast("Report downloaded"); }
});
</script>
