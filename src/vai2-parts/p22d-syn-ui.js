<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-V · SYNAPSE VIEW
   Sub-tabs · vision console wiring · vent consult · sleep consult · reports
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

const SYN_VIEW = { tab: "vent", sampling: false, ventForm: null, sleepForm: null };

/* ── flow strips ─────────────────────────────────────────────────────────── */
const SYN_FLOW_V = [
  ["01", "UPLOAD / DEMO", "Photo of the ventilator screen (or the built-in demo). Nothing leaves the device — colour segmentation runs locally in canvas."],
  ["02", "TRACE EXTRACTION", "Column-centroid extraction per waveform colour → shape classification (heuristic + DTW) → autocorrelation periodicity (RR, I:E, auto-PEEP sign)."],
  ["03", "STRUCTURED FACTS", "Patient + settings + blood gas from the form; numeric settings are transcribed by you — the image adds waveform evidence, and the engine cross-checks both."],
  ["04", "8-ALGORITHM INFERENCE", "Rule induction → fuzzy grading → neural action lattice → corpus cross-reference → confidence-calibrated management report."],
];
const SYN_FLOW_S = [
  ["01", "PARAMETERS", "Enter the sleep-study numbers the way the report states them — indices, architecture, oxygenation, symptoms, comorbidity, current PAP status."],
  ["02", "BAYESIAN DIFFERENTIAL", "15-disorder differential ranked by log-odds with likelihood ratios — OSA phenotypes, OHS, CSA/CSR, narcolepsy, RBD, PLMD, insomnia, UARS, TECSA."],
  ["03", "POPULATION Z-SCORES", "Every metric placed against the healthy-reference mean ± SD (±2σ flagging) — the same statistics engine that powers the PSG Analytics suite."],
  ["04", "NEXT STEP + PLAN", "Sequenced diagnostic next-steps (HSAT upgrade, ABG/PFTs, MSLT pre-conditions, iron studies) + phased management plan with corpus citations."],
];
function synFlowHtml(steps){
  return steps.map(s => `<div class="sfstep"><div class="sfn">${esc(s[0])}</div><div class="sft">${esc(s[1])}</div><div class="sfd">${esc(s[2])}</div></div>`).join("");
}

/* ── severity label maps ─────────────────────────────────────────────────── */
const VENT_SEV = { crit: "CRITICAL", high: "HIGH-RISK", mod: "ADJUST", info: "REVIEW", ok: "PROTECTIVE" };
const SLEEP_SEV = { crit: "SEVERE", high: "MOD–HIGH", mod: "MILD–MOD", info: "REVIEW", ok: "NORMAL" };

/* ═══ VIEW BUILDER ═════════════════════════════════════════════════════════ */
function buildSynapseView(){
  const panes = $("#synPanes");
  panes.innerHTML = `
  <div class="spane on" id="synPaneVent">
    <div class="synflow">${synFlowHtml(SYN_FLOW_V)}</div>
    <div class="panel brk" style="margin-bottom:16px">
      <div class="panel-h"><div class="pt"><span data-ic="camera"></span>VISION CONSOLE — VENTILATOR SCREEN ANALYSIS</div>
        <span class="chip warn" id="synVisState">NO IMAGE</span></div>
      <div class="panel-b">
        <div style="display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:14px" class="synvisgrid">
          <div style="min-width:0">
            <div class="dropzone" id="synDrop" role="button" tabindex="0" aria-label="Upload ventilator screen photo">
              <div class="dz-ic" data-ic="upload"></div>
              <div class="dz-t">DROP VENTILATOR SCREEN PHOTO — OR CLICK TO BROWSE</div>
              <div class="dz-s">Runs 100% locally: colour segmentation → waveform-trace extraction → shape/periodicity analysis. No OCR of numerals — you transcribe settings into the form (more reliable than any offline OCR), the image contributes waveform evidence.</div>
            </div>
            <input type="file" id="synFile" accept="image/*" style="display:none">
            <div class="vpreview" id="synPrev" style="display:none">
              <canvas id="synVCanvas"></canvas><canvas id="synVOverlay"></canvas>
              <span class="vlbl">SYNAPSE VISION · TRACE EXTRACTION</span>
            </div>
            <div class="visctl">
              <div class="field" style="min-width:96px"><label>Known PIP</label><input id="calPip" type="number" value="25"></div>
              <div class="field" style="min-width:96px"><label>Known PEEP</label><input id="calPeep" type="number" value="5"></div>
              <div class="field" style="min-width:96px"><label>Known VT</label><input id="calVt" type="number" value="450"></div>
              <div class="field" style="min-width:96px"><label>Screen window <small>s</small></label><input id="calTw" type="number" value="12"></div>
              <button class="btn" id="synDemo"><span data-ic="wand"></span>Demo screen</button>
              <button class="btn" id="synSample"><span data-ic="scan"></span>Sample trace</button>
            </div>
            <div class="tracebar" id="synTraces"></div>
          </div>
          <div style="min-width:0">
            <div class="engstats" style="grid-template-columns:repeat(auto-fit,minmax(118px,1fr))">
              <div class="es"><b id="vfcN">0</b><span>traces</span></div>
              <div class="es"><b id="vfcRR">—</b><span>RR from image</span></div>
              <div class="es"><b id="vfcPEP">—</b><span>auto-PEEP sign</span></div>
            </div>
            <div id="synVisFacts" style="display:grid;gap:6px"></div>
            <div class="ai-block info" style="margin-top:10px">Calibration: type the two pressures you can read off the screen (PIP/PEEP) and the time window visible — the engine then maps trace geometry onto physical units. Wrong calibration ≈ wrong numbers: sanity-check RR against the displayed rate.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="synwork">
      <div style="min-width:0">
        <div class="presets" id="vcPresets"></div>
        <div id="vcFormMount"></div>
        <div class="analyzebar">
          <button class="btn" id="vcGo" style="border-color:rgba(0,255,198,.4)"><span data-ic="zap"></span>ANALYZE — VENT CONSULT</button>
          <button class="btn" id="vcReset"><span data-ic="x"></span>Reset</button>
        </div>
      </div>
      <div class="synout" id="vcOut">
        <div class="ai-block info">Load a preset or type the case, optionally add a screen photo above, then press ANALYZE. The engine derives PBW, VT/kg, ΔP, P/F, RSBI, acid-base — fires guardrail rules, ranks management actions on a neural lattice and writes a sequenced plan.</div>
      </div>
    </div>
  </div>
  <div class="spane" id="synPaneSleep">
    <div class="synflow">${synFlowHtml(SYN_FLOW_S)}</div>
    <div class="synwork">
      <div style="min-width:0">
        <div class="presets" id="slPresets"></div>
        <div id="slFormMount"></div>
        <div class="analyzebar">
          <button class="btn" id="slGo" style="border-color:rgba(0,255,198,.4)"><span data-ic="zap"></span>ANALYZE — SLEEP CONSULT</button>
          <button class="btn" id="slReset"><span data-ic="x"></span>Reset</button>
        </div>
      </div>
      <div class="synout" id="slOut">
        <div class="ai-block info">Enter sleep-study parameters from the report (AHI, ODI, nadir, T90, architecture, REM latency, SOREMPs, ESS, comorbidity, current PAP status) — the engine ranks a 15-disorder Bayesian differential, computes population z-scores, and writes the next diagnostic step plus a phased management plan.</div>
      </div>
    </div>
  </div>`;
  /* tabs */
  $("#synTabs").innerHTML = `
    <button class="stab on" data-syn="vent"><span data-ic="camera"></span>Ventilator — Image + Data</button>
    <button class="stab" data-syn="sleep"><span data-ic="moon2"></span>Sleep Study — Parameters</button>`;
  $$("#synTabs .stab").forEach(b => b.addEventListener("click", () => synSetTab(b.getAttribute("data-syn"))));
  hydrateIcons(panes);
  /* forms */
  SYN_VIEW.ventForm = FormKit.build($("#vcFormMount"), VC_SCHEMA, "vc");
  SYN_VIEW.sleepForm = FormKit.build($("#slFormMount"), SL_SCHEMA, "sl");
  renderSynPresets($("#vcPresets"), VC_PRESETS, VC_SCHEMA, "vc", "#vcFormMount");
  renderSynPresets($("#slPresets"), SL_PRESETS, SL_SCHEMA, "sl", "#slFormMount");
  wireVision();
  $("#vcGo").addEventListener("click", synVentGo);
  $("#slGo").addEventListener("click", synSleepGo);
  $("#vcReset").addEventListener("click", () => { rebuildSynForms(); toast("Vent form reset to defaults"); });
  $("#slReset").addEventListener("click", () => { rebuildSynForms(); toast("Sleep form reset to defaults"); });
}
function synSetTab(t){
  SYN_VIEW.tab = t;
  $$("#synTabs .stab").forEach(b => b.classList.toggle("on", b.getAttribute("data-syn") === t));
  $("#synPaneVent").classList.toggle("on", t === "vent");
  $("#synPaneSleep").classList.toggle("on", t === "sleep");
}
function rebuildSynForms(){
  /* clear stale check states so rebuilds render clean */
  [].concat(VC_SCHEMA, SL_SCHEMA).forEach(g => (g.checks || []).forEach(f => { if (f.t === "check") ckStates[f.id] = false; }));
  SYN_VIEW.ventForm = FormKit.build($("#vcFormMount"), VC_SCHEMA, "vc");
  SYN_VIEW.sleepForm = FormKit.build($("#slFormMount"), SL_SCHEMA, "sl");
}
function renderSynPresets(el, presets, schema, prefix, mountSel){
  el.innerHTML = "<span class='small muted' style='align-self:center;letter-spacing:.12em'>PRESETS ▸</span> " +
    Object.keys(presets).map(k => `<button class="pbtn" data-p="${esc(k)}">${esc(k)}</button>`).join("");
  $$(".pbtn", el).forEach(b => b.addEventListener("click", () => {
    /* FULL RESET: clear stale check states, rebuild the form from schema defaults,
       then overlay the preset — prevents cross-preset field leakage */
    schema.forEach(g => (g.checks || []).forEach(f => { if (f.t === "check") ckStates[f.id] = false; }));
    const fresh = FormKit.build($(mountSel), schema, prefix);
    if (prefix === "vc") SYN_VIEW.ventForm = fresh; else SYN_VIEW.sleepForm = fresh;
    fresh.set(presets[b.getAttribute("data-p")] || {});
    toast("Preset loaded — review the form, then ANALYZE");
  }));
}

/* ═══ VISION WIRING ═══════════════════════════════════════════════════════ */
function wireVision(){
  VISION.init("synVCanvas", "synVOverlay");
  const dz = $("#synDrop"), fi = $("#synFile");
  dz.addEventListener("click", () => fi.click());
  dz.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") fi.click(); });
  fi.addEventListener("change", () => { if (fi.files && fi.files[0]) VISION.loadFile(fi.files[0], afterVisionLoad); fi.value = ""; });
  ["dragenter", "dragover"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add("over"); }));
  ["dragleave", "drop"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove("over"); }));
  dz.addEventListener("drop", e => {
    const fl = e.dataTransfer.files && e.dataTransfer.files[0];
    if (fl && /^image\//.test(fl.type)) VISION.loadFile(fl, afterVisionLoad);
    else if (fl) toast("Not an image file");
  });
  $("#synDemo").addEventListener("click", () => { VISION.demo(); afterVisionLoad(); });
  const bind = (id, key) => {
    const el = $("#" + id);
    el.addEventListener("input", () => { const v = parseFloat(el.value); if (isFinite(v)) VISION.cal[key] = v; });
  };
  bind("calPip", "pip"); bind("calPeep", "peep"); bind("calVt", "vt"); bind("calTw", "tw");
  $("#synSample").addEventListener("click", () => {
    SYN_VIEW.sampling = !SYN_VIEW.sampling;
    $("#synSample").classList.toggle("on", SYN_VIEW.sampling);
    toast(SYN_VIEW.sampling ? "Sample mode ON — click a colored waveform pixel" : "Sample mode off");
  });
  $("#synVOverlay").addEventListener("click", e => {
    if (!SYN_VIEW.sampling || !VISION.iData) return;
    const rect = e.target.getBoundingClientRect();
    const sx = VISION.W / rect.width, sy = VISION.H / rect.height;
    const t = VISION.addTraceAt((e.clientX - rect.left) * sx, (e.clientY - rect.top) * sy);
    if (t){ VISION.analyze(); renderTraceCards(); updateVisionStatus(); }
  });
}
function afterVisionLoad(){
  $("#synDrop").style.display = "none";
  $("#synPrev").style.display = "block";
  VISION.analyze();
  renderTraceCards();
  updateVisionStatus();
  toast("Image ingested — " + VISION.results.length + " waveform traces extracted");
}
function renderTraceCards(){
  const bar = $("#synTraces");
  if (!bar) return;
  bar.innerHTML = VISION.results.map(r => `
    <div class="tracecard${r.skip ? " toff" : ""}">
      <div class="tc-h"><span class="sw" style="background:${r.hex};box-shadow:0 0 8px ${r.hex}"></span>
        <span class="tc-t">${esc((r.type || "?").toUpperCase())}</span>
        <span class="mono" style="margin-left:auto;color:var(--dim)">Q ${r.quality}%</span></div>
      <div class="tc-m">${r.type === "pressure"
          ? `PIP ≈ ${r.pip || "—"} · PEEP ≈ ${r.peep || "—"} cmH₂O`
          : r.type === "flow"
          ? `I:E ≈ ${r.ie || "—"} · end-exp flow ${r.endExpFlow != null ? Math.round(r.endExpFlow * 100) + "%" : "—"}${r.autoPeepSign ? " ⚠ auto-PEEP sign" : ""}`
          : `VT ≈ ${r.vtEst || "—"} mL`}
        <br>RR ≈ ${r.rr || "—"}/min · periodicity r=${f1(r.periodicity)} · coverage ${Math.round((r.cov || 0) * 100)}%</div>
      <div class="tc-q"><i style="width:${r.quality || 0}%"></i></div>
    </div>`).join("") || "<span class='small muted'>No traces detected yet — try the demo screen or sample a trace colour manually.</span>";
}
function synImgFacts(){
  const out = {};
  if (!VISION.results || !VISION.results.length) return out;
  const pr = VISION.results.find(r => r.type === "pressure");
  const fl = VISION.results.find(r => r.type === "flow");
  const vl = VISION.results.find(r => r.type === "volume");
  if (pr){ out.pip = pr.pip; out.peep = pr.peep; out.pipN = pr.pipN; out.peepN = pr.peepN; if (pr.rr) out.rr = pr.rr; }
  if (fl){ out.ie = fl.ie; out.autoPeep = !!fl.autoPeepSign; out.endExpFlow = fl.endExpFlow; if (fl.rr) out.rr = out.rr || fl.rr; }
  if (vl && vl.vtEst) out.vtEst = vl.vtEst;
  out.count = VISION.results.length;
  out.kinds = VISION.results.map(r => (r.type || "?").toUpperCase()).join(" + ");
  return out;
}
function updateVisionStatus(){
  const chip = $("#synVisState");
  $("#vfcN").textContent = String(VISION.results.length);
  if (!VISION.results.length){
    if (chip){ chip.textContent = "NO TRACES"; chip.className = "chip warn"; }
    $("#vfcRR").textContent = "—"; $("#vfcPEP").textContent = "—";
    $("#synVisFacts").innerHTML = "<span class='small muted'>No waveform traces detected. Load the demo screen to see the pipeline, or enable Sample-trace and click a waveform colour.</span>";
    return;
  }
  if (chip){ chip.textContent = VISION.results.length + " TRACES"; chip.className = "chip ok"; }
  const img = synImgFacts();
  $("#vfcRR").textContent = img.rr ? String(img.rr) : "—";
  $("#vfcPEP").textContent = img.autoPeep ? "YES" : "no";
  const rows = [];
  rows.push(["Traces", img.kinds]);
  if (img.pip) rows.push(["Image PIP / PEEP", img.pip + " / " + img.peep + " cmH₂O"]);
  if (img.ie) rows.push(["Image I:E", img.ie]);
  if (img.vtEst) rows.push(["Image VT", img.vtEst + " mL"]);
  if (img.rr) rows.push(["Image RR", img.rr + "/min"]);
  rows.push(["End-expiratory flow", img.endExpFlow != null ? Math.round(img.endExpFlow * 100) + "%" + (img.autoPeep ? " — positive auto-PEEP sign" : "") : "—"]);
  $("#synVisFacts").innerHTML = rows.map(r => `<div class="visfact"><span class="vf-k">${esc(r[0])}</span><span class="vf-v">${esc(r[1])}</span></div>`).join("");
}
/* ═══ VENT CONSULT ANALYZE ════════════════════════════════════════════════ */
function synVentGo(){
  const i = SYN_VIEW.ventForm.collect();
  if (i.height == null || i.sex == null || i.age == null){
    toast("Patient profile needs age + sex + height — they drive every PBW target");
    return;
  }
  const img = synImgFacts();
  const merged = Object.assign({}, i);
  /* image fills GAPS only — clinician-transcribed numbers win */
  if (img.vtEst && merged.vt == null) merged.vt = img.vtEst;
  if (img.rr && merged.rr == null) merged.rr = img.rr;
  if (img.pip && merged.pip == null) merged.pip = img.pip;
  if (img.peep && merged.peep == null) merged.peep = img.peep;
  const model = analyzeVent(merged, img);
  model.sev = model.worst === "ok" ? "ok" : model.worst;
  const f = model.f;
  /* derived-parameter chips */
  const facts = [];
  const chip = (k, v, u, cls) => { if (v != null && v !== "" && !isNaN(v)) facts.push({ k, v, u: u || "", cls: cls || "" }); };
  chip("PBW", f0(f.pbw), "kg");
  chip("VT/kg PBW", f1(f.vtKg), "mL/kg", gt(f.vtKg, 8) ? "bad" : gt(f.vtKg, 6.5) ? "warn" : "good");
  chip("VT target 6 mL/kg", f.vtTarget, "mL");
  chip("ΔP", f0(f.dp), "cmH₂O", gt(f.dp, 15) ? "bad" : gt(f.dp, 12) ? "warn" : "good");
  chip("P/F", f0(f.pf), "", lt(f.pf, 150) ? "bad" : lt(f.pf, 250) ? "warn" : "good");
  chip("Berlin", (f.berlin || "—").toUpperCase(), "", f.berlin === "severe" ? "bad" : f.berlin === "moderate" ? "warn" : "good");
  chip("RSBI", f0(f.rsbi), "", f.rsbi != null ? (f.rsbi > 105 ? "bad" : "good") : "");
  chip("Cstat", f0(f.cstat), "mL/cmH₂O", f.cstat != null ? (f.cstat < 30 ? "bad" : "good") : "");
  chip("MV", f1(f.mv), "L/min");
  chip("Te", f1(f.te), "s");
  chip("τ", f1(f.tau), "s", f.tau != null ? (f.te != null && f.te < 3 * f.tau ? "bad" : "good") : "");
  chip("PEEP target", f.peepTarget, "cmH₂O");
  if (img.count) chip("Image traces", img.kinds, "", "good");
  /* console animation lines */
  const lines = [
    "SYNAPSE CORE v5.0 — 8-ALGORITHM ENSEMBLE · VENTILATOR MODE",
    img.count ? "▸ vision layer: " + img.count + " traces (" + img.kinds + ") — geometry mapped to physical units" : "▸ vision layer: no image — structured-form inference only",
    img.autoPeep ? "▸ image evidence: expiratory flow fails to reach zero — auto-PEEP signature" : "▸ periodicity + DTW shape analysis complete",
    "▸ rule induction: " + model.fired.length + "/" + VC_RULES.length + " guardrails evaluated",
    "▸ fuzzy grading: ΔP " + model.fz.dp.label + " · VT " + model.fz.vt.label,
    "▸ neural action lattice: " + model.ranked.length + " actions above threshold",
    "▸ corpus cross-reference: " + model.cites.length + " guideline modules cited",
    "▸ confidence calibration: " + model.conf + "%",
    "COMPILING REPORT ▸",
  ];
  /* corrections + mode cards */
  const corr = ventCorrections(f);
  const corrHtml = corr.length ? `<table class="corrt"><thead><tr><th>Parameter</th><th>Current</th><th>Target</th><th>Rationale</th></tr></thead><tbody>` +
    corr.map(r => `<tr><td>${esc(r.param)}</td><td class="cur">${esc(r.cur)}</td><td class="rec">${esc(r.rec)}</td><td class="why">${esc(r.why)} ${r.cite ? citeChip(r.cite) : ""}</td></tr>`).join("") + "</tbody></table>"
    : "<span class='small muted'>No corrections flagged — settings align with protective targets.</span>";
  const cards = ventModeAdvice(f);
  const cardHtml = cards.length ? cards.map((c, idx) => `
    <div class="modecard"><div class="mc-rank">${idx + 1}</div>
      <div style="flex:1;min-width:0"><div class="mc-t">${esc(c.m)}</div><div class="mc-w">${esc(c.why)}${c.cite ? " " + citeChip(c.cite) : ""}</div></div>
      <div class="mc-conf"><b>${c.conf}%</b><i><b style="width:${c.conf}%"></b></i></div></div>`).join("")
    : "<span class='small muted'>No mode changes indicated.</span>";
  synConsole($("#vcOut"), lines, () => {
    renderSynReport($("#vcOut"), model, {
      idp: "vrep", vizId: "vviz", sevLabels: VENT_SEV,
      findingsTitle: "CLINICAL FINDINGS — GUARDRAIL RULE OUTPUT",
      facts,
      blocks: [
        { n: "E", t: "SETTING CORRECTIONS — CURRENT → TARGET", ic: "target", html: corrHtml },
        { n: "F", t: "MODE / STRATEGY RECOMMENDATION RANKING", ic: "settings", html: cardHtml },
      ],
      file: "pulmo-vent-consult.txt",
      textFacts: facts.map(x => x.k + ": " + x.v + " " + (x.u || "")),
      textBlocks: [
        { t: "Corrections", items: corr.map(r => r.param + ": " + r.cur + " → " + r.rec + " (" + r.why + ")") },
        { t: "Mode advice", items: cards.map(c => c.m + " [" + c.conf + "%] — " + c.why) },
      ],
    });
    SynViz.run("vviz", VC_NET, buildActiveV(f), model.ranked, VC_ACT);
  }, "SYNAPSE CORE v5.0 — VENTILATOR CONSULT");
}

/* ═══ SLEEP CONSULT ANALYZE ═══════════════════════════════════════════════ */
function synSleepGo(){
  const i = SYN_VIEW.sleepForm.collect();
  if (i.ahi == null && i.odi == null && i.plmi == null){
    toast("Enter at least the core indices — AHI (or ODI/PLMI if that is all the report gives)");
    return;
  }
  const model = analyzeSleep(i);
  const f = model.f;
  /* derived chips */
  const facts = [];
  const chip = (k, v, u, cls) => { if (v != null && v !== "" && !isNaN(v)) facts.push({ k, v, u: u || "", cls: cls || "" }); };
  chip("AHI", f1(f.ahi), "/hr", f.ahi >= 30 ? "bad" : f.ahi >= 15 ? "warn" : "good");
  chip("AHI severity", (f.sev || "—").toUpperCase(), "", f.ahi >= 30 ? "bad" : f.ahi >= 15 ? "warn" : "good");
  chip("ODI", f1(f.odi), "/hr", gt(f.odi, 30) ? "bad" : "good");
  chip("Nadir", f0(f.nadir), "%", lt(f.nadir, 80) ? "bad" : lt(f.nadir, 88) ? "warn" : "good");
  chip("T90", f0(f.t90), "%", gt(f.t90, 30) ? "bad" : "good");
  chip("ESS", f0(f.ess), "/24", f.ess >= 16 ? "bad" : f.ess >= 11 ? "warn" : "good");
  chip("CAI", f1(f.cai), "/hr", gt(f.cai, 5) ? "bad" : "good");
  chip("PLMI", f1(f.plmi), "/hr", gt(f.plmi, 15) ? "warn" : "good");
  chip("REM latency", f0(f.reml), "min", f.reml != null && f.reml <= 15 ? "bad" : "good");
  chip("SE", f0(f.se), "%", lt(f.se, 75) ? "warn" : "good");
  chip("PaCO₂", f0(f.paco2), "mmHg", gt(f.paco2, 45) ? "bad" : "good");
  if (f.remPred) chip("REM/NREM AHI", f1(f.ahiRatio) + "×", "", "warn");
  if (f.supinePred) chip("Supine/non-supine", f1(f.supineAhi / Math.max(0.5, f.nonSupineAhi)) + "×", "", "warn");
  /* console lines */
  const lead = model.dxRank.length ? model.dxRank[0] : null;
  const lines = [
    "SYNAPSE CORE v5.0 — 8-ALGORITHM ENSEMBLE · SLEEP-MEDICINE MODE",
    "▸ study type: " + ($("select#sl-study") ? $("select#sl-study").selectedOptions[0].textContent : i.study),
    "▸ rule induction: " + model.fired.length + "/" + SL_RULES.length + " sleep rules fired",
    "▸ fuzzy grading: AHI " + model.fz.ahi.label + " · ESS " + model.fz.ess.label + " · SE " + model.fz.se.label,
    "▸ Bayesian differential: " + (lead ? lead.dx + " " + lead.pct + "% (LR-weighted log-odds)" : "no dominant phenotype"),
    "▸ neural action lattice: " + model.ranked.length + " actions above threshold",
    "▸ population z-scores: " + model.zrows.filter(z => z.flag !== "ok").length + "/" + model.zrows.length + " metrics outside ±2σ",
    "▸ corpus cross-reference: " + model.cites.length + " sleep guideline modules cited",
    "▸ confidence calibration: " + model.conf + "%",
    "COMPILING REPORT ▸",
  ];
  /* differential rows */
  const dxHtml = model.dxRank.slice(0, 7).map(d => {
    const meta = SL_DX_META[d.dx] || {};
    return `<div class="dxrow"><div class="dx-h"><b>${esc(d.dx)}</b>
      <span class="mono" style="color:${meta.c || "var(--cyan)"};font-size:12px">${d.pct}%</span></div>
      <div class="dx-bar"><i style="width:${clamp(d.pct, 2, 100)}%;background:linear-gradient(90deg,${meta.c || "#00e5ff"},#00ffc6)"></i></div>
      <div class="dx-n">${esc(meta.n || "")} <span class="muted">· evidence: ${esc(d.hits.join(", ") || "—")} · prior ${Math.round(d.prior * 100)}%</span></div></div>`;
  }).join("") || "<span class='small muted'>No differential reached threshold.</span>";
  /* z table */
  const zHtml = model.zrows.length ? `<table class="corrt"><thead><tr><th>Metric</th><th>Patient</th><th>Healthy ref</th><th>z</th><th>Reading</th></tr></thead><tbody>` +
    model.zrows.map(z => `<tr><td>${esc(z.label)}</td><td class="mono">${f1(z.val)} ${esc(z.unit)}</td>
      <td class="mono" style="color:var(--muted)">${esc(z.ref)}${esc(z.unit)}</td>
      <td class="mono" style="font-weight:700;color:${z.flag === "bad" ? "#ff7d96" : z.flag === "warn" ? "var(--amber)" : "var(--teal)"}">${z.z > 0 ? "+" : ""}${f1(z.z)}</td>
      <td class="why">${z.flag === "bad" ? "far outside reference (>|3.5|σ)" : z.flag === "warn" ? "outside ±2σ" : "within reference"}</td></tr>`).join("") + "</tbody></table>"
    : "<span class='small muted'>Not enough metrics for z-scoring.</span>";
  /* next steps */
  const nsHtml = model.nextSteps.map((s, idx) => `
    <div class="planstep"><span class="ps-ph">STEP ${idx + 1}</span>
      <div class="ps-b">${esc(s.t)}<small>${esc(s.d)}</small>${s.cite ? " " + citeChip(s.cite) : ""}</div></div>`).join("");
  /* mode cards */
  const cardHtml = model.modeCards.length ? model.modeCards.map((c, idx) => `
    <div class="modecard"><div class="mc-rank">${idx + 1}</div>
      <div style="flex:1;min-width:0"><div class="mc-t">${esc(c.m)}</div><div class="mc-w">${esc(c.why)}${c.cite ? " " + citeChip(c.cite) : ""}</div></div>
      <div class="mc-conf"><b>${c.conf}%</b><i><b style="width:${c.conf}%"></b></i></div></div>`).join("")
    : "<span class='small muted'>No therapy escalation indicated.</span>";
  synConsole($("#slOut"), lines, () => {
    renderSynReport($("#slOut"), model, {
      idp: "srep", vizId: "sviz", sevLabels: SLEEP_SEV,
      findingsTitle: "CLINICAL FINDINGS — SLEEP RULE OUTPUT",
      facts,
      blocks: [
        { n: "E", t: "BAYESIAN DIFFERENTIAL RANKING (15 DISORDERS)", ic: "network", html: dxHtml },
        { n: "F", t: "POPULATION Z-SCORES — HEALTHY REFERENCE", ic: "sigma", html: zHtml },
        { n: "G", t: "NEXT DIAGNOSTIC STEP — SEQUENCED", ic: "arrow", html: nsHtml },
        { n: "H", t: "THERAPY / PAP MODE SELECTION RANKING", ic: "settings", html: cardHtml },
      ],
      file: "pulmo-sleep-consult.txt",
      textFacts: facts.map(x => x.k + ": " + x.v + " " + (x.u || "")),
      textBlocks: [
        { t: "Differential", items: model.dxRank.slice(0, 7).map(d => d.dx + " — " + d.pct + "% (evidence: " + (d.hits.join(", ") || "—") + ")") },
        { t: "Z-scores", items: model.zrows.map(z => z.label + ": " + f1(z.val) + z.unit + " (z " + (z.z > 0 ? "+" : "") + f1(z.z) + " vs " + z.ref + ")") },
        { t: "Next steps", items: model.nextSteps.map((s, i2) => (i2 + 1) + ". " + s.t + " — " + s.d) },
        { t: "Therapy modes", items: model.modeCards.map(c => c.m + " [" + c.conf + "%] — " + c.why) },
      ],
    });
    SynViz.run("sviz", SL_NET, buildActiveS(f, buildSleepFeats(f)), model.ranked, SL_ACT);
  }, "SYNAPSE CORE v5.0 — SLEEP CONSULT");
}
</script>
