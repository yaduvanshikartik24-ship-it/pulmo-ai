<script>
/* ═══════════════════════════════════════════════════════════════════════════
   UI RENDERERS — dashboard · modes · scenarios · reference · search
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";
const V = window.VAI;

/* ── detail sheet ──────────────────────────────────────────────────────── */
function openSheet(title, sub, html) {
  $("#sheetTitle").textContent = stripEmoji(title);
  $("#sheetSub").textContent = sub || "";
  $("#sheetBody").innerHTML = html;
  $("#overlay").classList.add("open");
  document.body.style.overflow = "hidden";
  hydrateIcons($("#sheetBody"));
}
function closeSheet() { $("#overlay").classList.remove("open"); document.body.style.overflow = ""; }
$("#sheetX").addEventListener("click", closeSheet);
$("#overlay").addEventListener("click", e => { if (e.target === $("#overlay")) closeSheet(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeSheet(); $("#searchPop").classList.remove("open"); } });

function imgBox(src, cap) {
  if (!src) return "";
  const im = (typeof VAI_IMG !== "undefined" && VAI_IMG[src]) ? VAI_IMG[src] : src;
  return `<div class="imgbox"><img src="${im}" alt="${esc(cap || "lecture figure")}"><div class="cap">${esc(cap || "")}</div></div>`;
}

/* ══ DASHBOARD ════════════════════════════════════════════════════════════ */
function buildDashboard() {
  const nCalc = Object.keys(CALC_TOOLS).length;
  const stats = [
    { v: V.VENT_MODES.length, n: "Ventilator modes", s: "conventional → neural" },
    { v: V.PATIENT_SCENARIOS.length, n: "Condition protocols", s: "ARDS → ECMO rest" },
    { v: nCalc, n: "Calculators", s: "graphed, live" },
    { v: SLEEP_DX.length, n: "Sleep disorders", s: "AASM corpus" },
    { v: PSG_SCEN.length, n: "PSG scenarios", s: "live 13-channel sim" },
    { v: GUIDELINES.length, n: "Guideline modules", s: "GOLD · GINA · ESC · ATS" },
    { v: SMOKE_PHARM.length, n: "Cessation agents", s: "varenicline → NRT" },
    { v: VAI_GLOSSARY.length + VAI_PEARLS.length + SLEEP_PEARLS.length + SMOKE_PEARLS.length, n: "Terms & pearls", s: "searchable" },
    { v: PL_DX.length, n: "Pleural diseases", s: "Light 6e corpus" },
  ];
  $("#kbStats").innerHTML = stats.map(s =>
    `<div class="stat"><span class="sv neon">${s.v}</span><span class="sn">${s.n}</span><span class="sn dim" style="font-size:8.5px;letter-spacing:.12em">${s.s}</span></div>`).join("");
  /* vitals */
  $("#vitals").innerHTML = [
    { k: "hr", cls: "hb", ic: "heart", v: "72", u: "bpm", l: "HEART RATE" },
    { k: "spo2", cls: "o2", ic: "drop", v: "97", u: "%", l: "SpO₂" },
    { k: "etco2", cls: "co2", ic: "capno", v: "36", u: "mmHg", l: "etCO₂" },
    { k: "paw", cls: "paw", ic: "gauge", v: "14", u: "cmH₂O", l: "PAW MEAN" },
  ].map(x => `<div class="vit ${x.cls}"><div class="vic" data-ic="${x.ic}"></div>
    <div style="min-width:0"><div class="vv" id="vit-${x.k}">${x.v}<small> ${x.u}</small></div><div class="vl">${x.l}</div></div></div>`).join("");
  /* quick nav */
  const qn = [
    { v: "ai", ic: "cpu", t: "AI Consult", s: "Structured plans + console Q&A" },
    { v: "scn", ic: "steth", t: "Scenario Protocols", s: `${V.PATIENT_SCENARIOS.length} condition playbooks` },
    { v: "sleep", ic: "moon", t: "Sleep Lab", s: `Live PSG sim · ${SLEEP_DX.length} disorders · AASM rules` },
    { v: "pleural", ic: "drop", t: "Pleural Diseases", s: `Light 6e · ${PL_DX.length} diseases · fluid lab · consult · PDF` },
    { v: "smoke", ic: "nosmoke", t: "Nicotine Center", s: "Cigarette calculator API · quit tools" },
    { v: "guide", ic: "layers", t: "Guideline Corpus", s: `${GUIDELINES.length} modules · GOLD · GINA · ESC` },
    { v: "calc", ic: "calc", t: "Calculator Array", s: `${nCalc} live tools with graphs` },
    { v: "wave", ic: "wave", t: "Waveform Lab", s: "Physics sim · loops · capnography" },
    { v: "modes", ic: "book", t: "Mode Matrix", s: `${V.VENT_MODES.length} modes, settings & waveforms` },
    { v: "ref", ic: "db", t: "Reference Core", s: "Tables, scales, protocols, history" },
  ];
  $("#quickNav").innerHTML = qn.map(q => `<div class="card qcard" data-goto="${q.v}">
    <div class="big-ic" data-ic="${q.ic}"></div><div class="qt">${q.t}</div><div class="qs">${q.s}</div></div>`).join("");
  $$("#quickNav [data-goto]").forEach(c => c.addEventListener("click", () => gotoView(c.getAttribute("data-goto"))));
  hydrateIcons($("#quickNav")); hydrateIcons($("#vitals"));
  /* ticker */
  $("#ticker").innerHTML = "<b>CLINICAL PEARLS ▸ </b>" + VAI_PEARLS.concat(SLEEP_PEARLS, SMOKE_PEARLS).map(p => esc(p)).join(' <span class="cy">◆</span> ') + ' <span class="cy">◆</span> ';
  /* dashboard wave chips */
  $("#dashWaveChips").innerHTML = ["VCV", "PCV", "PSV", "SIMV", "APRV", "CPAP"].map(m =>
    `<button class="qchip ${m === "VCV" ? "on" : ""}" style="${m === "VCV" ? "color:var(--cyan);border-color:var(--line2)" : ""}" data-dwm="${m}">${m}</button>`).join("") +
    `<span class="chip" style="margin-left:4px">${DASHW.pathology.toUpperCase()}</span>`;
  $$("#dashWaveChips [data-dwm]").forEach(b => b.addEventListener("click", () => {
    $$("#dashWaveChips [data-dwm]").forEach(x => { x.classList.remove("on"); x.style.cssText = ""; });
    b.classList.add("on"); b.style.cssText = "color:var(--cyan);border-color:var(--line2)";
    DASHW.mode = b.getAttribute("data-dwm"); dashRegen();
    $("#dashWaveChips .chip").textContent = DASHW.pathology.toUpperCase();
  }));
  const pchip = $("#dashWaveChips .chip");
  if (pchip) pchip.style.cursor = "pointer", pchip.title = "Click to switch lung model",
    pchip.addEventListener("click", () => {
      const order = ["normal", "ards", "copd", "asthma"];
      DASHW.pathology = order[(order.indexOf(DASHW.pathology) + 1) % order.length];
      pchip.textContent = DASHW.pathology.toUpperCase(); dashRegen();
      toast("Lung model → " + DASHW.pathology.toUpperCase() + " — see Waveform Lab for full control");
    });
  dashRegen();
}

/* vitals random-walk */
function tickVitals() {
  const set = (k, v, u) => { const e = $("#vit-" + k); if (e) e.innerHTML = v + "<small> " + u + "</small>"; };
  VITALS.hr = clamp(VITALS.hr + (Math.random() - 0.5) * 2.4, 66, 88);
  VITALS.spo2 = clamp(VITALS.spo2 + (Math.random() - 0.5) * 0.5, 95, 98.5);
  VITALS.etco2 = clamp(VITALS.etco2 + (Math.random() - 0.5) * 0.7, 33, 39);
  VITALS.paw = clamp(VITALS.paw + (Math.random() - 0.5) * 0.5, 12.5, 16);
  set("hr", Math.round(VITALS.hr), "bpm"); set("spo2", VITALS.spo2.toFixed(0), "%");
  set("etco2", VITALS.etco2.toFixed(0), "mmHg"); set("paw", VITALS.paw.toFixed(1), "cmH₂O");
}
const VITALS = { hr: 74, spo2: 97, etco2: 36, paw: 14 };

/* ══ MODES ════════════════════════════════════════════════════════════════ */
let modeFilterCat = "All";
function buildModes() {
  const cats = ["All", ...new Set(V.VENT_MODES.map(m => m.category))];
  $("#modeFilter").innerHTML = cats.map(c => `<button class="qchip ${c === modeFilterCat ? "on" : ""}" style="${c === modeFilterCat ? "color:var(--cyan);border-color:var(--line2)" : ""}" data-mc="${c}">${c}</button>`).join("");
  $$("#modeFilter [data-mc]").forEach(b => b.addEventListener("click", () => { modeFilterCat = b.getAttribute("data-mc"); buildModes(); }));
  const list = V.VENT_MODES.filter(m => modeFilterCat === "All" || m.category === modeFilterCat);
  $("#modeCount").textContent = `${list.length} OF ${V.VENT_MODES.length} MODES · TAP FOR FULL DOSSIER`;
  $("#modesGrid").innerHTML = list.map(m => `
    <div class="card" data-mode="${m.id}">
      <span class="arrow">▸</span>
      <div class="cid"><div class="ic" data-ic="lung"></div>
        <div style="min-width:0"><div class="abbr">${esc(m.abbr)}</div><div class="lbl">${esc(m.category)} · ${esc(m.controlVariable)} control</div></div></div>
      <div class="nm">${esc(m.tagline)}</div>
      <div class="foot">
        <span class="chip">${esc(m.trigger.split("(")[0].trim())}</span>
        <span class="chip info">${esc(m.cycle.split("(")[0].trim().slice(0, 22))}</span>
      </div>
    </div>`).join("");
  $$("#modesGrid [data-mode]").forEach(c => c.addEventListener("click", () => showMode(c.getAttribute("data-mode"))));
}
const SIM_MODE_OF = { "vc-ac": "VCV", "pc-ac": "PCV", "prvc": "PCV", "simv": "SIMV", "psv": "PSV", "cpap": "CPAP", "aprv": "APRV", "bipap-niv": "PSV", "hfnc": "CPAP", "vs": "PSV", "pc-simv": "SIMV", "bilevel": "APRV", "pc-irv": "PCV", "vg": "PCV" };
function showMode(id) {
  const m = V.getMode(id); if (!m) return;
  const tbl = m.settings.map(s => `<tr><td class="mono cy">${esc(s.parameter)}</td><td class="mono"><b>${esc(s.typicalValue)}</b></td><td class="muted">${esc(s.note)}</td></tr>`).join("");
  const simMode = SIM_MODE_OF[m.id];
  const html = `
    <p class="mono" style="color:var(--teal);font-size:12px">${esc(m.tagline)}</p>
    ${m.description.map(d => `<p>${esc(d)}</p>`).join("")}
    <div class="grid g2" style="margin:12px 0">
      <div class="kv"><dt>Trigger</dt><dd>${esc(m.trigger)}</dd><dt>Limit</dt><dd>${esc(m.limit)}</dd><dt>Cycle</dt><dd>${esc(m.cycle)}</dd><dt>Breath type</dt><dd>${esc(m.breathType)}</dd></div>
      <div class="kv"><dt>Control variable</dt><dd>${esc(m.controlVariable)}</dd><dt>Category</dt><dd>${esc(m.category)}</dd><dt>Equation side</dt><dd>${esc(m.equationSide || "—")}</dd><dt>Initial (adult)</dt><dd class="mono">${esc(m.initialAdult || "—")}</dd></div>
    </div>
    <h4>Settings</h4>
    <div class="tscroll"><table class="dt"><thead><tr><th>Parameter</th><th>Typical</th><th>Note</th></tr></thead><tbody>${tbl}</tbody></table></div>
    <h4>Indications</h4><ul class="checks">${m.indications.map(x => `<li class="good">${esc(x)}</li>`).join("")}</ul>
    <h4>Advantages</h4><ul class="checks">${m.advantages.map(x => `<li class="good">${esc(x)}</li>`).join("")}</ul>
    <h4>Disadvantages & cautions</h4><ul>${m.disadvantages.map(x => `<li class="warn">${esc(x)}</li>`).join("")}</ul>
    ${m.pearlPoints && m.pearlPoints.length ? `<h4>Pearls</h4><ul>${m.pearlPoints.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
    ${m.referenceImage ? `<h4>Lecture figure</h4>${imgBox(m.referenceImage, m.abbr + " — source deck")}` : ""}
    <div class="flex wrap" style="gap:9px;margin-top:18px">
      ${simMode ? `<button class="btn" id="mWave"><span data-ic="wave"></span>Simulate ${simMode} in Waveform Lab</button>` : ""}
      <button class="btn ghost" id="mAsk"><span data-ic="cpu"></span>Ask AI about ${esc(m.abbr.split(" ")[0])}</button>
    </div>`;
  openSheet(m.name, m.abbr + " · " + m.category, html);
  const w = $("#mWave"); if (w) w.addEventListener("click", () => { closeSheet(); gotoView("wave"); WaveLab.setMode(simMode); });
  $("#mAsk").addEventListener("click", () => { closeSheet(); gotoView("ai"); AI.ask("Explain " + m.abbr.replace(/\(.*\)/, "").trim()); });
}

/* ══ SCENARIOS ════════════════════════════════════════════════════════════ */
let scnFilterCat = "All";
function buildScenarios() {
  const cats = ["All", ...new Set(V.PATIENT_SCENARIOS.map(s => s.category))];
  $("#scnFilter").innerHTML = cats.map(c => `<button class="qchip ${c === scnFilterCat ? "on" : ""}" style="${c === scnFilterCat ? "color:var(--cyan);border-color:var(--line2)" : ""}" data-sc="${c}">${c}</button>`).join("");
  $$("#scnFilter [data-sc]").forEach(b => b.addEventListener("click", () => { scnFilterCat = b.getAttribute("data-sc"); buildScenarios(); }));
  const list = V.PATIENT_SCENARIOS.filter(s => scnFilterCat === "All" || s.category === scnFilterCat);
  $("#scnCount").textContent = `${list.length} OF ${V.PATIENT_SCENARIOS.length} CONDITION PROTOCOLS`;
  $("#scnGrid").innerHTML = list.map(s => `
    <div class="card" data-scn="${s.id}">
      <span class="arrow">▸</span>
      <div class="nm" style="font-size:13px;font-weight:600;color:#fff;line-height:1.35">${esc(stripEmoji(s.name))}</div>
      <div class="lbl" style="margin:6px 0 8px">${esc(s.category)}</div>
      <div class="nm" style="min-height:44px">${esc(s.summary.slice(0, 120))}…</div>
      <div class="foot"><span class="chip ok">PRIMARY: ${esc((V.getMode(s.primaryMode) || { abbr: "?" }).abbr.split(" ")[0])}</span></div>
    </div>`).join("");
  $$("#scnGrid [data-scn]").forEach(c => c.addEventListener("click", () => showScenario(c.getAttribute("data-scn"))));
}
function showScenario(id) {
  const s = V.getScenario(id); if (!s) return;
  const pm = V.getMode(s.primaryMode);
  const html = `
    <p>${esc(s.summary)}</p>
    <h4>Pathophysiology → ventilator implications</h4>
    <ul>${s.pathophysiology.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
    <h4>Primary strategy</h4>
    <div class="ai-block settings" style="border-color:var(--line2)">
      <b>${esc(pm ? pm.name : s.primaryMode)}</b> — ${esc(s.primaryModeNote)}
    </div>
    ${s.alternativeModes && s.alternativeModes.length ? `<h4>Alternatives</h4>
      <ul>${s.alternativeModes.map(a => `<li><span class="modelink" data-mgoto="${a.id}">${esc((V.getMode(a.id) || { abbr: a.id }).abbr)}</span> — ${esc(a.note)}</li>`).join("")}</ul>` : ""}
    <h4>Initial settings</h4>
    <div class="tscroll"><table class="dt"><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>
      ${s.initialSettings.map(x => `<tr><td class="mono cy">${esc(x.parameter)}</td><td class="mono"><b>${esc(x.value)}</b></td></tr>`).join("")}
    </tbody></table></div>
    <h4>Targets</h4><ul class="checks">${s.targets.map(x => `<li class="good">${esc(x)}</li>`).join("")}</ul>
    <h4>Pitfalls</h4><ul>${s.pitfalls.map(x => `<li class="warn">${esc(x)}</li>`).join("")}</ul>
    <h4>Monitoring</h4><ul>${s.monitoring.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
    <h4>Evidence</h4><p class="mono small" style="color:var(--teal)">${esc(s.evidence)}</p>
    <div class="flex wrap" style="gap:9px;margin-top:16px">
      <button class="btn primary" id="sConsult"><span data-ic="zap"></span>Run AI consult for this case</button>
    </div>`;
  openSheet(s.name, s.category, html);
  $$("[data-mgoto]", $("#sheetBody")).forEach(l => l.addEventListener("click", () => showMode(l.getAttribute("data-mgoto"))));
  $("#sConsult").addEventListener("click", () => {
    closeSheet(); gotoView("ai");
    $("#cCond").value = s.id; consultIbwSync();
    $("#consultGo").click();
  });
}

/* ══ REFERENCE CORE ═══════════════════════════════════════════════════════ */
const ACC_META = [
  ["ranges", "Normal ranges & limits", "chart"], ["alarms", "Alarm crisis manual", "alert"],
  ["dope", "DOPE — sudden deterioration", "activity"], ["setup", "Initial setup — 10 steps", "settings"],
  ["sbt", "Weaning · SBT · extubation", "check"], ["prone", "Prone positioning protocol", "steth"],
  ["ecmo", "ECMO referral criteria", "shield"], ["berlin", "Berlin ARDS & Murray LIS", "db"],
  ["abg", "Blood gas & acid–base", "capno"], ["o2", "Oxygen targets & devices", "drop"],
  ["scales", "RASS · CPOT scales", "gauge"], ["vap", "VAP prevention bundle", "shield"],
  ["drugs", "ICU infusion reference", "form"], ["humid", "Humidification & circuit care", "settings"],
  ["tax", "Ventilator taxonomy", "book"], ["eq", "Equation compendium", "calc"],
  ["peds", "Paediatric quick reference", "steth"], ["hist", "History of ventilation", "clock"],
  ["gloss", "Glossary — 40 terms", "book"],
];
function kvTable(rows, h1, h2) {
  return `<div class="tscroll"><table class="dt"><thead><tr><th>${h1}</th><th>${h2}</th></tr></thead><tbody>${
    rows.map(r => `<tr><td class="mono cy">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")}</tbody></table></div>`;
}
function buildReference() {
  const R = V.ref;
  const body = {
    ranges: R.NORMAL_RANGES.map(g => `<h4>${esc(g.group)}</h4>` + kvTable(g.rows.map(r => [r.label, r.value]), "Parameter", "Target / range")).join(""),
    alarms: R.VENT_ALARMS.map(a => `
      <div class="ai-block ${a.severity === "critical" ? "warn" : ""}" style="margin-bottom:10px">
        <b>${esc(a.name)}</b> <span class="chip danger" style="float:right">${esc(a.severity)}</span>
        <div class="small muted" style="margin:4px 0">SOUND: ${esc(a.sound)}</div>
        <b class="gr" style="font-size:12px">IMMEDIATE</b>
        <ul>${a.immediate.map(x => `<li class="good">${esc(x)}</li>`).join("")}</ul>
        <b class="am" style="font-size:12px">CAUSES</b>
        <ul>${a.causes.map(x => `<li class="warn">${esc(x)}</li>`).join("")}</ul>
      </div>`).join(""),
    dope: `<div class="grid g2">${R.DOPE_STEPS.map(d => `
        <div class="ai-block"><b class="cy" style="font-size:15px">${d.letter}</b> — <b>${esc(d.name)}</b>
        <div style="margin-top:6px">${esc(d.action)}</div></div>`).join("")}</div>`,
    setup: `<div class="tl">${R.SETUP_STEPS.map(s => `
        <div class="ev"><div class="yr">STEP ${s.step}</div><div class="tt">${esc(s.title)}</div><div class="td">${esc(s.detail)}</div></div>`).join("")}</div>`,
    sbt: (() => { const p = R.SBT_PROTOCOL; const sec = (t, arr) => `<h4>${t}</h4><ul>${arr.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
      return sec("Pre-check screen", p.precheck) + sec("Trial", p.trial) + sec("Post-trial", p.post) +
        `<h4>Extubation checklist</h4><ul class="checks">${R.EXTUBATION_CHECK.map(x => `<li class="good"><b>${esc(x.item)}</b> — ${esc(x.detail)}</li>`).join("")}</ul>`; })(),
    prone: (() => { const p = R.PRONE_PROTOCOL; const sec = (t, arr, cls) => `<h4>${t}</h4><ul class="${cls || ""}">${arr.map(x => `<li class="${cls || ""}">${esc(x)}</li>`).join("")}</ul>`;
      return sec("Indications", p.indications) + sec("Exclusions", p.exclusion, "warn") + sec("Technique", p.technique) + sec("Benefits", p.benefits, "good") + sec("Watch for", p.watch, "warn"); })(),
    ecmo: (() => { const p = R.ECMO_CRITERIA; const sec = (t, arr, cls) => `<h4>${t}</h4><ul class="${cls || ""}">${arr.map(x => `<li class="${cls || ""}">${esc(x)}</li>`).join("")}</ul>`;
      return sec("When to refer", p.when) + sec("Cautions", p.cautions, "warn") +
        (Array.isArray(p.referral) ? sec("Referral checklist", p.referral) : `<h4>Referral pearls</h4><div class="ai-block info">${esc(p.referral)}</div>`); })(),
    berlin: `<div class="grid g2">
        <div><h4>Berlin definition</h4>${kvTable(R.BERLIN_ARDS.criteria.map(c => [c.item, c.detail]), "Criterion", "Detail")}
          <h4>Mortality by severity</h4>${kvTable(R.BERLIN_ARDS.mortality.map(m => [m.level + " (P/F " + m.pf + ")", m.mortality]), "Severity", "Mortality")}</div>
        <div><h4>Murray lung injury score</h4>${kvTable(R.MURRAY_LIS.components.map(c => [c.component, c.detail]), "Component", "Scoring")}
          <div class="ai-block info">${esc(R.MURRAY_LIS.interpretation)}</div></div></div>`,
    abg: `<h4>Normal values</h4>${kvTable(R.ABG_NORMALS.map(a => [a.parameter + " — " + a.note, a.range]), "Parameter", "Range")}
      <h4>Compensation formulas</h4><div class="tscroll"><table class="dt"><thead><tr><th>Disorder</th><th>Formula</th><th>Reading it</th></tr></thead><tbody>
      ${VAI_ACIDBASE.map(a => `<tr><td class="mono cy">${esc(a.d)}</td><td class="mono"><b>${esc(a.f)}</b></td><td class="muted">${esc(a.n)}</td></tr>`).join("")}</tbody></table></div>`,
    o2: `<h4>Oxygen targets by condition</h4><div class="tscroll"><table class="dt"><thead><tr><th>Condition</th><th>Target</th><th>Note</th></tr></thead><tbody>
        ${VAI_O2_TARGETS.map(o => `<tr><td>${esc(o.c)}</td><td class="mono"><b class="cy">${esc(o.t)}</b></td><td class="muted">${esc(o.n)}</td></tr>`).join("")}</tbody></table></div>
      <h4>Oxygen delivery devices</h4><div class="tscroll"><table class="dt"><thead><tr><th>Device</th><th>Flow</th><th>FiO₂</th><th>Note</th></tr></thead><tbody>
        ${R.OXYGEN_DEVICES.map(o => `<tr><td>${esc(o.device)}</td><td class="mono">${esc(o.flow)}</td><td class="mono cy">${esc(o.fio2)}</td><td class="muted">${esc(o.note)}</td></tr>`).join("")}</tbody></table></div>`,
    scales: `<h4>RASS — Richmond Agitation-Sedation Scale</h4><div class="tscroll"><table class="dt"><thead><tr><th>Score</th><th>Term</th><th>Description</th></tr></thead><tbody>
        ${R.RASS_SCALE.map(r => `<tr><td class="mono ${r.score >= 0 ? "am" : "cy"}"><b>${r.score > 0 ? "+" : ""}${r.score}</b></td><td>${esc(r.term)}</td><td class="muted">${esc(r.description)}</td></tr>`).join("")}</tbody></table></div>
      <h4>CPOT — Critical-Care Pain Observation Tool</h4>${kvTable(R.CPOT_SCALE.map(c => [c.item, c.points.join(" · ")]), "Domain", "Scoring")}
      <div class="ai-block info">CPOT > 2 suggests significant pain — treat pain before sedation (analgesia-first).</div>`,
    vap: `<h4>Core bundle</h4><ul class="checks">${R.VAP_BUNDLE.filter(b => b.level === "core").map(b => `<li class="good"><b>${esc(b.item)}</b> — ${esc(b.rationale)}</li>`).join("")}</ul>
      <h4>Extended measures</h4><ul>${R.VAP_BUNDLE.filter(b => b.level !== "core").map(b => `<li><b>${esc(b.item)}</b> — ${esc(b.rationale)}</li>`).join("")}</ul>`,
    drugs: `<div class="tscroll"><table class="dt"><thead><tr><th>Drug</th><th>Class</th><th>Units</th><th>Standard mix</th><th>Dose range</th><th>Notes</th></tr></thead><tbody>
      ${R.INFUSION_DRUGS.map(d => `<tr><td><b>${esc(d.name)}</b></td><td class="muted">${esc(d.cls)}</td><td class="mono">${esc(d.units)}</td><td class="mono muted small">${esc(d.standardMix)}</td><td class="mono cy">${esc(d.doseRange)}</td><td class="muted small">${esc(d.notes)}</td></tr>`).join("")}</tbody></table></div>
      <div class="ai-block warn">Reference only — verify concentrations and doses against local policy. Use the Calculator Array → Infusion tool for rate conversions.</div>`,
    humid: (() => { const H = R.HUMIDIFICATION;
      const block = (t, o) => `<div class="ai-block"><b>${t}</b><div class="small muted" style="margin-top:4px">${esc(o.what)}</div>
        <ul>${o.pros ? `<li class="good">+ ${esc(o.pros)}</li>` : ""}${o.cons ? `<li class="warn">− ${esc(o.cons)}</li>` : ""}${o.avoid ? `<li class="warn">AVOID IF: ${esc(o.avoid)}</li>` : ""}</ul></div>`;
      return `<p>${esc(H.why)}</p><div class="grid g2">${block("HME (passive)", H.hme)}${block("Heated humidifier (active)", H.heated)}</div>
        ${Array.isArray(H.rules) ? `<h4>Choosing between them</h4><ul>${H.rules.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        <h4>Circuit care</h4><ul>${R.CIRCUIT_CARE.map(c => `<li><b>${esc(c.item)}</b> — ${esc(c.detail)}</li>`).join("")}</ul>`; })(),
    tax: (() => { const T = R.TAXONOMY; const sec = (t, arr) => `<h4>${t}</h4>${kvTable(arr.map(x => [x.term, x.detail]), "Term", "Detail")}`;
      return sec("Breath types", T.breathTypes) + sec("Breath sequences", T.sequences) + sec("Targeting schemes", T.targeting) +
        (Array.isArray(T.glossary) ? sec("Mode vocabulary", T.glossary) : ""); })(),
    eq: `<div class="grid g2">${R.EQUATIONS.map(e => `
        <div class="ai-block settings"><b>${esc(e.name)}</b>
        <div class="mono" style="color:var(--teal);margin:5px 0;font-size:13px">${esc(e.formula)}</div>
        <div class="small muted">${esc(e.note)}</div></div>`).join("")}</div>`,
    peds: `<h4>Age-based quick table</h4><div class="tscroll"><table class="dt"><thead><tr><th>Age</th><th>Weight</th><th>ETT uncuffed</th><th>ETT cuffed</th><th>Oral depth</th><th>Vent RR</th><th>Normal RR</th><th>HR</th><th>VT mL/kg</th></tr></thead><tbody>
      ${R.PEDIATRIC_TABLE.map(p => `<tr><td><b>${esc(p.age)}</b></td><td class="mono">${esc(p.weightKg)}</td><td class="mono">${esc(p.ettUncuffed)}</td><td class="mono">${esc(p.ettCuffed)}</td><td class="mono">${esc(p.depthOral)}</td><td class="mono cy">${esc(p.ventRate)}</td><td class="mono">${esc(p.normalRR)}</td><td class="mono">${esc(p.normalHR)}</td><td class="mono">${esc(p.vtPerKg)}</td></tr>`).join("")}</tbody></table></div>
      <h4>Formulas</h4>${kvTable(Object.entries(R.PEDS_FORMULAS).map(([k, v]) => [k.toUpperCase(), v]), "Formula", "Value")}
      <div class="ai-block info">Use Calculator Array → Paediatric ETT for live computation.</div>`,
    hist: `<div class="tl">${VAI_TIMELINE.map(e => `
        <div class="ev"><div class="yr">${esc(e.yr)}</div><div class="tt">${esc(e.t)}</div><div class="td">${esc(e.d)}</div></div>`).join("")}</div>`,
    gloss: `<div class="glossary">${VAI_GLOSSARY.map(g => `
        <div class="gitem"><div class="gt">${esc(g.t)}</div><div class="gd">${esc(g.d)}</div></div>`).join("")}</div>`,
  };
  $("#refAcc").innerHTML = ACC_META.map(([id, title, ic], i) => `
    <details class="acc" id="acc-${id}"><summary><span class="ic" data-ic="${ic}"></span>${i + 1 < 10 ? "0" + (i + 1) : i + 1} · ${title}</summary>
    <div class="accb">${body[id] || ""}</div></details>`).join("");
}
function openRef(id) { gotoView("ref"); const d = $("#acc-" + id); if (d) { d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); } }

/* ══ GLOBAL SEARCH ════════════════════════════════════════════════════════ */
const SEARCH_IX = [];
function buildSearch() {
  V.VENT_MODES.forEach(m => SEARCH_IX.push({ k: "MODE", t: stripEmoji(m.name), s: m.abbr + " · " + m.tagline, go: () => showMode(m.id) }));
  V.PATIENT_SCENARIOS.forEach(s => SEARCH_IX.push({ k: "PROTO", t: stripEmoji(s.name), s: s.category + " · " + s.summary.slice(0, 80) + "…", go: () => showScenario(s.id) }));
  V.ref.EQUATIONS.forEach((e, i) => SEARCH_IX.push({ k: "FORMULA", t: e.name, s: e.formula, go: () => openRef("eq") }));
  VAI_GLOSSARY.forEach(g => SEARCH_IX.push({ k: "TERM", t: g.t, s: g.d.slice(0, 90) + "…", go: () => openRef("gloss") }));
  ACC_META.forEach(([id, title]) => SEARCH_IX.push({ k: "REF", t: title, s: "reference sheet", go: () => openRef(id) }));
  Object.entries(CALC_TOOLS).forEach(([id, t]) => SEARCH_IX.push({ k: "CALC", t: t.name, s: "calculator", go: () => { gotoView("calc"); selectCalc(id); } }));
  /* pulmo modules */
  SLEEP_DX.forEach(d => SEARCH_IX.push({ k: "SLEEP", t: stripEmoji(d.name), s: d.cat + " · " + d.tag, go: () => { gotoView("sleep"); sleepGoTab("dx"); showSleepDx(d.id); } }));
  SLEEP_STAGES.forEach(s => SEARCH_IX.push({ k: "STAGE", t: "Sleep stage " + s.id + " — " + s.name.split("—")[0], s: s.eeg.slice(0, 90) + "…", go: () => { gotoView("sleep"); sleepGoTab("atlas"); } }));
  PAP_MODES.forEach(p => SEARCH_IX.push({ k: "PAP", t: p.name + " — " + p.full, s: p.ind, go: () => { gotoView("sleep"); sleepGoTab("pap"); } }));
  AASM_RULES.forEach(r => SEARCH_IX.push({ k: "AASM", t: r.h, s: r.rule.slice(0, 90) + "…", go: () => { gotoView("sleep"); sleepGoTab("rules"); } }));
  SLEEP_SCORES.forEach(sc => SEARCH_IX.push({ k: "SCALE", t: sc.name, s: "interactive sleep score", go: () => { gotoView("sleep"); sleepGoTab("scores"); } }));
  PSG_SCEN.forEach(sc => SEARCH_IX.push({ k: "PSG", t: "PSG simulation — " + sc.name, s: sc.note.slice(0, 90) + "…", go: () => { gotoView("sleep"); sleepGoTab("sim"); PSG.scenId = sc.id; PSG.restart(); } }));
  GUIDELINES.forEach(g => SEARCH_IX.push({ k: "GUIDE", t: g.name, s: g.org + " · " + g.summ.slice(0, 80) + "…", go: () => openGuideline(g.id) }));
  SMOKE_PHARM.forEach(p => SEARCH_IX.push({ k: "DRUG", t: p.name + " (" + p.brand + ")", s: p.cls + " · " + p.eff, go: () => { gotoView("smoke"); smokeGoTab("pharm"); } }));
  QUIT_TIMELINE.forEach(q => SEARCH_IX.push({ k: "QUIT", t: "Quit milestone — " + q.t, s: q.h, go: () => { gotoView("smoke"); smokeGoTab("quit"); } }));
  SMOKE_HARMS.forEach(h => SEARCH_IX.push({ k: "HARM", t: "Smoking harm — " + h.organ, s: h.d.slice(0, 90) + "…", go: () => { gotoView("smoke"); smokeGoTab("harm"); } }));
  SEARCH_IX.push({ k: "API", t: "PULMO-API console", s: "cigarette calculator endpoint — packyears(20, 10), risk(32.5)…", go: () => { gotoView("smoke"); smokeGoTab("calc"); setTimeout(() => { const i = $("#apiIn"); if (i) i.focus(); }, 300); } });
  /* pleural module (Light 6e) */
  if (typeof PL_DX !== "undefined") {
    PL_DX.forEach(d => SEARCH_IX.push({ k: "PLEURAL", t: d.n, s: (d.grp === "T" ? "transudate" : "exudate") + " · " + d.summ.slice(0, 80) + "…", go: () => { gotoView("pleural"); plGoTab("atlas"); openPlDx(d.id); } }));
    SEARCH_IX.push({ k: "PLEURAL", t: "Light's criteria interpreter", s: "exudate vs transudate + pseudoexudate rescue + LR probability curve", go: () => { gotoView("pleural"); plGoTab("calc"); } });
    SEARCH_IX.push({ k: "PLEURAL", t: "Pleural AI consult", s: "patient + history + imaging + fluid → diagnosis & differential (4-algorithm fusion)", go: () => { gotoView("pleural"); plGoTab("consult"); } });
    SEARCH_IX.push({ k: "PLEURAL", t: "Advanced pleural fluid lab", s: "ASK any query · 9 graphs · radar · zone maps · heatmap · Bayesian differential · PDF answer", go: () => { gotoView("pleural"); plGoTab("anx"); } });
    SEARCH_IX.push({ k: "PLEURAL", t: "Parapneumonic classifier (Light 7-class / ACCP)", s: "pH, glucose, Gram, loculation → drainage decision + MIST2 tPA/DNase", go: () => { gotoView("pleural"); plGoTab("calc"); } });
    SEARCH_IX.push({ k: "PLEURAL", t: "Pleural manometry / elastance", s: "pressure-volume during thoracentesis · trapped-lung prediction · −20 stop rule", go: () => { gotoView("pleural"); plGoTab("calc"); } });
    SEARCH_IX.push({ k: "PLEURAL", t: "Chylothorax discriminator", s: "triglycerides vs cholesterol → chylothorax vs pseudochylothorax", go: () => { gotoView("pleural"); plGoTab("calc"); } });
    SEARCH_IX.push({ k: "PLEURAL", t: "Pneumothorax size & plan", s: "Collins · Rhea · BTS 2-cm · ACCP 3-cm + recurrence data", go: () => { gotoView("pleural"); plGoTab("calc"); } });
    SEARCH_IX.push({ k: "PLEURAL", t: "LENT score — malignant effusion", s: "LDH · ECOG · neutrophils · tumor type → survival", go: () => { gotoView("pleural"); plGoTab("calc"); } });
    SEARCH_IX.push({ k: "PLEURAL", t: "Effusion approach algorithm (Light ch. 8)", s: "8-step master pathway — suspect → confirm → tap → classify → workup", go: () => { gotoView("pleural"); plGoTab("approach"); } });
    PL_PROCEDURES.forEach(p => SEARCH_IX.push({ k: "PROC", t: p.n, s: p.detail[0][1].slice(0, 90) + "…", go: () => { gotoView("pleural"); plGoTab("proc"); } }));
  }
}
function doSearch(q) {
  const pop = $("#searchPop");
  q = q.trim().toLowerCase();
  if (q.length < 2) { pop.classList.remove("open"); return; }
  const scored = [];
  SEARCH_IX.forEach(e => {
    const t = e.t.toLowerCase(), s = e.s.toLowerCase();
    let sc = 0;
    if (t.startsWith(q)) sc += 8;
    if (t.includes(q)) sc += 5;
    if (s.includes(q)) sc += 2;
    if (sc) scored.push({ e, sc });
  });
  scored.sort((a, b) => b.sc - a.sc);
  const res = scored.slice(0, 12);
  pop.innerHTML = res.length ? res.map(({ e }) => `
    <div class="sr-item" data-si="${SEARCH_IX.indexOf(e)}"><span class="k">${e.k}</span>
      <div style="min-width:0"><div class="n">${esc(e.t)}</div><div class="s">${esc(e.s)}</div></div></div>`).join("")
    : `<div class="sr-empty">No matches for “${esc(q)}” — try a mode (APRV), a condition (ARDS), or a term (driving pressure).</div>`;
  pop.classList.add("open");
  $$("#searchPop .sr-item").forEach(it => it.addEventListener("mousedown", ev => {
    ev.preventDefault();
    const e = SEARCH_IX[+it.getAttribute("data-si")];
    pop.classList.remove("open"); $("#gsearch").value = ""; e.go();
  }));
}
</script>
