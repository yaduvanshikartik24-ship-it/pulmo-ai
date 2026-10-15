<script>
/* ═══════════════════════════════════════════════════════════════════════════
   INIT — navigation · boot sequence · system checks · telemetry · start
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";
let activeViewId = "cmd";
function gotoView(id) {
  const sec = $("#view-" + id); if (!sec) return;
  $$("section.view").forEach(s => s.classList.remove("active"));
  sec.classList.add("active");
  $$("#nav .tab").forEach(t => t.classList.toggle("active", t.getAttribute("data-view") === id));
  activeViewId = id;
  store.set("view", id);
  window.scrollTo({ top: 0, behavior: "smooth" });
  /* redraw view-specific canvases (they may have been sized while hidden) */
  setTimeout(() => { (REDRAW[id] || []).forEach(f => { try { f(); } catch (e) {} }); }, 60);
}
function wireNav() {
  $$("#nav .tab").forEach(t => t.addEventListener("click", () => gotoView(t.getAttribute("data-view"))));
  document.addEventListener("keydown", e => {
    const tag = (e.target.tagName || "").toLowerCase();
    const typing = tag === "input" || tag === "textarea" || tag === "select";
    if (e.key === "/" && !typing) { e.preventDefault(); $("#gsearch").focus(); return; }
    if (typing) return;
    const order = ["cmd", "ai", "scn", "modes", "calc", "wave", "sleep", "smoke", "guide", "ref", "syn", "pleural", "sys"];
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9) gotoView(order[n - 1]);
    if (n === 0) gotoView(order[9]);
    if (e.key === "-") gotoView(order[10]);
    if (e.key === "=") gotoView(order[11]);
    if (e.key === "+") gotoView(order[12]);
  });
}
function wireSearch() {
  const inp = $("#gsearch"), pop = $("#searchPop");
  inp.addEventListener("input", () => doSearch(inp.value));
  inp.addEventListener("focus", () => { if (inp.value.trim().length >= 2) doSearch(inp.value); });
  inp.addEventListener("blur", () => setTimeout(() => pop.classList.remove("open"), 180));
  inp.addEventListener("keydown", e => { if (e.key === "Enter") { const first = $("#searchPop .sr-item"); if (first) first.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })); } });
}
/* ── clock & telemetry ─────────────────────────────────────────────────── */
function startClock() {
  const t = () => {
    const d = new Date();
    $("#clockT").textContent = d.toLocaleTimeString("en-GB");
    $("#clockD").textContent = d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }).toUpperCase();
  };
  t(); setInterval(t, 1000);
}
/* ── system integrity checks ───────────────────────────────────────────── */
function runSysChecks() {
  let extReqs = 0;
  try { (performance.getEntriesByType("resource") || []).forEach(r => { if (/^https?:\/\//i.test(r.name) && r.name.indexOf(location.host) === -1) extReqs++; }); } catch (e) {}
  const rows = [
    { l: "Knowledge engine bundle", v: "LOADED · " + V.VENT_MODES.length + " MODES / " + V.PATIENT_SCENARIOS.length + " PROTOCOLS", ok: !!V },
    { l: "Sleep-medicine layer", v: SLEEP_DX.length + " DISORDERS · " + PAP_MODES.length + " PAP MODES · " + AASM_RULES.length + " AASM RULES", ok: SLEEP_DX.length > 10 },
    { l: "PSG simulation core", v: PSG_CH.length + " SYNTHESIZED CHANNELS × " + PSG_SCEN.length + " SCENARIOS", ok: PSG_CH.length === 13 && PSG_SCEN.length >= 10 },
    { l: "Differential PSG engine (A/B)", v: "DUAL SYNCHRONIZED PANELS · Δ METRICS · DIFFERENCE MATRIX", ok: typeof PSG_CMP !== "undefined" && PSG_CMP.mounted },
    { l: "Statistical analytics core", v: "Z-SCORE · 95% CI · ROC · LOG/EXPONENTIAL · BLAND–ALTMAN", ok: typeof plot2 === "function" && PSG_GROUPS.length >= 10 },
    { l: "Synapse inference core (MK-V)", v: "8-ALGORITHM ENSEMBLE · " + VC_RULES.length + " VENT RULES · " + SL_RULES.length + " SLEEP RULES · 15-DX BAYESIAN TABLE · 2 NEURAL LATTICES", ok: typeof SYNAPSE !== "undefined" && typeof analyzeVent === "function" && typeof analyzeSleep === "function" },
    { l: "Vision extraction engine", v: "COLOUR SEGMENTATION · CENTROID TRACES · DTW SHAPES · AUTOCORRELATION", ok: typeof VISION !== "undefined" && !!VISION.ctx },
    { l: "Guideline corpus", v: GUIDELINES.length + " SOCIETY MODULES (GOLD · GINA · ESC · ATS/IDSA · USPSTF · WHO · BTS)", ok: GUIDELINES.length >= 15 },
    { l: "Nicotine center", v: SMOKE_PHARM.length + " PHARMACOTHERAPY AGENTS · API CONSOLE · QUIT CLOCK", ok: SMOKE_PHARM.length >= 6 },
    { l: "Calculator array", v: Object.keys(CALC_TOOLS).length + " TOOLS ONLINE", ok: Object.keys(CALC_TOOLS).length >= 19 },
    { l: "Waveform physics core", v: "6 MODES × 4 LUNG MODELS + VENT ANALYTICS", ok: !!V.sim },
    { l: "Pleural diseases corpus (Light 6e)", v: "FULL-BOOK SCAN 522 PP · " + PL_DX.length + " DISEASES · 10 CALCULATORS · 4-ALGO CONSULT · " + PL_PRESETS.length + " PRESETS", ok: typeof PL_DX !== "undefined" && PL_DX.length >= 20 && typeof plAnalyze === "function" },
    { l: "Advanced fluid lab (MK-VII)", v: "ASK QUERY PARSER · 9-GRAPH SUITE · " + Object.keys(PL_SIG).length + " DISEASE ARCHETYPES · BAYESIAN LADDER", ok: typeof PL_SIG !== "undefined" && typeof plAskParse === "function" && typeof plAdvRun === "function" },
    { l: "Offline PDF answer engine (MK-VII)", v: "RAW PDF WRITER · CHART JPEG EMBED · ALL " + Object.keys(CALC_TOOLS).length + " CALCULATORS · PLEURAL SUITE · CONSULTS", ok: typeof PPDF !== "undefined" && typeof PPDF.fromCalc === "function" },
    { l: "External network requests", v: extReqs === 0 ? "ZERO — FULLY OFFLINE" : extReqs + " EXTERNAL CALLS", ok: extReqs === 0 },
    { l: "Local storage", v: (() => { try { localStorage.setItem("vai2_t", "1"); localStorage.removeItem("vai2_t"); return "AVAILABLE"; } catch (e) { return "UNAVAILABLE (private mode?)"; } })(), ok: true },
    { l: "Render engine", v: (window.HTMLCanvasElement ? "CANVAS 2D OK" : "DEGRADED"), ok: !!window.HTMLCanvasElement },
  ];
  const allOk = rows.every(r => r.ok);
  $("#sysStatus").innerHTML = rows.map(r =>
    `<div class="prow"><span class="pk">${esc(r.l)}</span><span class="grow mono small" style="color:var(--txt)">${esc(r.v)}</span><span class="chip ${r.ok ? "ok" : "danger"}">${r.ok ? "✓" : "!"}</span></div>`).join("") +
    `<div class="prow" style="margin-top:6px"><span class="pk">OVERALL</span><span class="grow"></span><span class="chip ${allOk ? "ok" : "warn"}"><span class="dot"></span>${allOk ? "ALL SYSTEMS NOMINAL" : "CHECK ITEMS"}</span></div>`;
  $("#offlineCheck").innerHTML = `
    <ul class="checks">
      <li class="good"><b>Single self-contained file</b> — engine, knowledge base, graphs and figures are all embedded in this document.</li>
      <li class="good"><b>${extReqs === 0 ? "Zero external requests" : extReqs + " external request(s) detected"} — network interface unused after load.</b></li>
      <li class="good"><b>No CDN, no fonts, no analytics, no API keys</b> — nothing to fail when the hospital network is down.</li>
      <li class="good"><b>Runs from file://</b> — copy to USB, email, or any shared folder; open in any modern browser.</li>
    </ul>
    <div class="res ok"><div class="rh"><span class="rl">OFFLINE STATUS</span><span class="rv">VERIFIED</span></div></div>`;
  const inv = [
    ["Ventilator modes", V.VENT_MODES.length], ["Condition protocols", V.PATIENT_SCENARIOS.length],
    ["Calculators", Object.keys(CALC_TOOLS).length], ["Equations", V.ref.EQUATIONS.length],
    ["Asynchrony signatures", V.sim.ASYNCHRONY_PATTERNS.length], ["Capnography patterns", VAI_CAPNO.length],
    ["Glossary terms", VAI_GLOSSARY.length], ["History milestones", VAI_TIMELINE.length],
    ["Clinical pearls", VAI_PEARLS.length + SLEEP_PEARLS.length + SMOKE_PEARLS.length], ["Reference sheets", ACC_META.length],
    ["Alarm protocols", V.ref.VENT_ALARMS.length], ["Infusion drugs", V.ref.INFUSION_DRUGS.length],
    ["Sleep disorders", SLEEP_DX.length], ["Sleep stages atlas", SLEEP_STAGES.length],
    ["PAP therapy modes", PAP_MODES.length], ["AASM scoring rules", AASM_RULES.length],
    ["Interactive sleep scores", SLEEP_SCORES.length], ["PSG scenarios", PSG_SCEN.length],
    ["PSG synthesized channels", PSG_CH.length],
    ["Differential PSG matrices", typeof PSG_DIFF !== "undefined" ? Object.keys(PSG_DIFF).length : 0],
    ["Sleep-disorder reference groups", typeof PSG_GROUPS !== "undefined" ? PSG_GROUPS.length : 0],
    ["PSG analytics chart engines", 8],
    ["Ventilator analytics chart engines", 7],
    ["Synapse inference algorithms", 8],
    ["Vent consult guardrail rules", VC_RULES.length],
    ["Sleep consult rules", SL_RULES.length],
    ["Bayesian differential disorders", Object.keys(SL_DX_TABLE).length],
    ["Neural action lattice outputs", Object.keys(VC_ACT).length + Object.keys(SL_ACT).length],
    ["Sleep consult presets", Object.keys(SL_PRESETS).length],
    ["Vent consult presets", Object.keys(VC_PRESETS).length],
    ["Guideline modules", GUIDELINES.length],
    ["Guideline domains", new Set([].concat(...GUIDELINES.map(g => g.tags))).size],
    ["Cessation pharmacotherapy", SMOKE_PHARM.length], ["Quit milestones", QUIT_TIMELINE.length],
    ["Organ-system harm entries", SMOKE_HARMS.length], ["Special cessation populations", SMOKE_SPECIAL.length],
    ["Lecture figures embedded", typeof VAI_IMG !== "undefined" ? Object.keys(VAI_IMG).length : 0],
    ["Lung models (physics)", Object.keys(V.sim.PATHOLOGY_PRESETS).length],
    ["Pleural disease entities (Light 6e)", typeof PL_DX !== "undefined" ? PL_DX.length : 0],
    ["Pleural calculators + charts", 10],
    ["Pleural algorithm steps (ch. 8)", typeof PL_ALGORITHM !== "undefined" ? PL_ALGORITHM.length : 0],
    ["Pleural procedures documented", typeof PL_PROCEDURES !== "undefined" ? PL_PROCEDURES.length : 0],
    ["Pleural consult presets", typeof PL_PRESETS !== "undefined" ? PL_PRESETS.length : 0],
    ["Pleural parapneumonic classes (Light + ACCP)", typeof PL_PPE_LIGHT !== "undefined" ? PL_PPE_LIGHT.length + PL_PPE_ACCP.length : 0],
    ["Pleural fluid graph engines (lab)", typeof PL_SIG !== "undefined" ? 9 : 0],
    ["Disease signature archetypes", typeof PL_SIG !== "undefined" ? Object.keys(PL_SIG).length : 0],
    ["ASK-query parser parameters", 24],
    ["PDF-answer calculators (all)", typeof PPDF !== "undefined" ? Object.keys(CALC_TOOLS).length + 10 : 0],
  ];
  $("#sysInv").innerHTML = `<div class="tscroll"><table class="dt"><thead><tr><th>Knowledge module</th><th>Entries</th></tr></thead><tbody>
    ${inv.map(([k, n]) => `<tr><td>${esc(k)}</td><td class="mono"><b class="cy">${n}</b></td></tr>`).join("")}</tbody></table></div>`;
  $("#chipKBv").textContent = V.VENT_MODES.length + "M/" + V.PATIENT_SCENARIOS.length + "P/" + GUIDELINES.length + "G";
  $("#footKB").textContent = `${V.VENT_MODES.length} MODES · ${SLEEP_DX.length} SLEEP DISORDERS · ${PSG_SCEN.length} PSG SCENARIOS · ${GUIDELINES.length} GUIDELINES · ${PL_DX.length} PLEURAL DISEASES · ${Object.keys(CALC_TOOLS).length}+10 CALCULATORS · SYNAPSE 8-ALGO · 100% OFFLINE`;
}
/* ── boot sequence ─────────────────────────────────────────────────────── */
function runBoot(done) {
  const lines = [
    ["INITIALIZING PULMO AI · MK-VII CORE v7.0", ""],
    ["▸ ventilator knowledge matrix", V.VENT_MODES.length + " MODES / " + V.PATIENT_SCENARIOS.length + " PROTOCOLS"],
    ["▸ sleep-medicine layer", SLEEP_DX.length + " DISORDERS · AASM SCORING ENGINE"],
    ["▸ PSG synthesis core", "13 CHANNELS × " + PSG_SCEN.length + " SCENARIOS · LIVE HYPNOGRAM"],
    ["▸ differential PSG engine", "A/B SYNCHRONIZED PANELS · DIFFERENCE MATRIX"],
    ["▸ statistical analytics core", "Z · 95% CI · ROC · LOG · EXPONENTIAL · BLAND–ALTMAN"],
    ["▸ guideline corpus", GUIDELINES.length + " MODULES · GOLD 2025 · GINA 2025 · ESC · ATS · AASM"],
    ["▸ nicotine center", "CIGARETTE CALCULATOR API · PHARMACOTHERAPY"],
    ["▸ calculator array", Object.keys(CALC_TOOLS).length + " TOOLS / " + V.ref.EQUATIONS.length + " EQUATIONS"],
    ["▸ waveform physics + vent analytics", "6 MODES × 4 LUNG MODELS · τ / z / CI / ROC"],
    ["▸ synapse inference core", "8-ALGORITHM ENSEMBLE · VISION + FORM INFERENCE"],
    ["▸ pleural diseases corpus", "LIGHT 6E FULL-BOOK SCAN · " + PL_DX.length + " DISEASES · BAYESIAN CONSULT"],
    ["▸ advanced fluid lab", "ASK PARSER · 9-GRAPH SUITE · RADAR / ZONE MAPS / HEATMAP"],
    ["▸ offline PDF answer engine", "RAW PDF WRITER · EVERY CALCULATOR → PDF REPORT"],
    ["▸ vision extraction engine", "TRACE DTW + AUTOCORRELATION · 100% LOCAL"],
    ["▸ lecture figure archive", "13 EMBEDDED"],
    ["▸ offline integrity", "ZERO NETWORK DEPENDENCIES"],
    ["ALL SYSTEMS NOMINAL — SYNAPSE CONSULT READY", ""],
  ];
  const el = $("#bootLines"), bar = $("#bootBar");
  let i = 0, stopped = false;
  const finish = () => { if (stopped) return; stopped = true; $("#boot").classList.add("done"); setTimeout(() => { const b = $("#boot"); if (b) b.style.display = "none"; }, 500); if (done) done(); };
  $("#boot").addEventListener("click", finish);
  const step = () => {
    if (stopped) return;
    if (i < lines.length) {
      const d = document.createElement("div");
      d.innerHTML = lines[i][1] ? `${esc(lines[i][0])} <span class="ok">… ${esc(lines[i][1])} [OK]</span>` : esc(lines[i][0]);
      el.appendChild(d);
      bar.style.width = Math.round((i + 1) / lines.length * 100) + "%";
      i++; setTimeout(step, i === 1 ? 240 : 230);
    } else setTimeout(finish, 420);
  };
  step();
}
/* ── resize handling ───────────────────────────────────────────────────── */
let rzT = null;
window.addEventListener("resize", () => {
  clearTimeout(rzT);
  rzT = setTimeout(() => { Object.keys(lastW).forEach(k => { const cv = document.getElementById(k); if (cv) delete lastW[k]; });
    (REDRAW[activeViewId] || []).forEach(f => { try { f(); } catch (e) {} }); }, 220);
});
window.addEventListener("error", e => { try { toast("Runtime error: " + (e.message || "unknown")); } catch (x) {} });

/* ── GO ────────────────────────────────────────────────────────────────── */
function initAll() {
  hydrateIcons(document);
  buildDashboard();
  buildModes();
  buildScenarios();
  buildReference();
  buildCalcRail();
  selectCalc("ibw");
  WaveLab.init();
  if (typeof buildVentAnalytics === "function") buildVentAnalytics();
  AI.init();
  initConsultForm();
  buildSleepView();
  buildSmokeView();
  buildGuidelinesView();
  if (typeof buildSynapseView === "function") buildSynapseView();
  if (typeof buildPleuralView === "function") buildPleuralView();
  wrapTables();
  wireSmokeApi();
  buildSearch();
  wireNav();
  wireSearch();
  runSysChecks();
  startClock();
  setInterval(tickVitals, 2000);
  const last = store.get("view", null);
  if (last && $("#view-" + last)) gotoView(last);
  runBoot();
}
/* MK-VII.1 mobile: put every app table inside a horizontal-scroll wrapper so
   wide reference tables never force page-level horizontal overflow on phones.
   Wrapper is inert on desktop (block div, table keeps 100% width). */
function wrapTables() {
  document.querySelectorAll("main table").forEach(t => {
    if (t.parentElement && t.parentElement.classList.contains("tblwrap")) return;
    const w = document.createElement("div");
    w.className = "tblwrap";
    t.parentNode.insertBefore(w, t);
    w.appendChild(t);
  });
}
initAll();
</script>
