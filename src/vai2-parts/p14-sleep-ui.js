<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI — SLEEP LAB VIEW (tabs: simulator · atlas · disorders · PAP ·
   scoring rules · interactive scores)
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

let sleepTab = "sim";
function sleepGoTab(id){ const b = $('#sleepTabs [data-stab="' + id + '"]'); if (b) b.click(); }
const SLEEP_TAB_HOOKS = {
  cmp: () => { if (typeof PSG_CMP !== "undefined" && PSG_CMP.onShow) PSG_CMP.onShow(); },
  anx: () => { if (typeof renderPsgAnalytics === "function") renderPsgAnalytics(); },
};
function buildSleepView(){
  const tabs = [
    ["sim", "wave", "PSG Simulator"], ["cmp", "split", "A/B Compare"], ["anx", "sigma", "PSG Analytics"],
    ["atlas", "brain", "Stages Atlas"],
    ["dx", "steth", "Disorders"], ["pap", "lungs", "PAP Therapy"],
    ["rules", "book", "AASM Rules"], ["scores", "form", "Sleep Scores"],
  ];
  $("#sleepTabs").innerHTML = tabs.map(t =>
    `<button class="stab${t[0] === sleepTab ? " on" : ""}" data-stab="${t[0]}"><span data-ic="${t[1]}"></span>${t[2]}</button>`).join("");
  $$("#sleepTabs [data-stab]").forEach(b => b.addEventListener("click", () => {
    sleepTab = b.getAttribute("data-stab");
    $$("#sleepTabs [data-stab]").forEach(x => x.classList.toggle("on", x === b));
    $$("#sleepPanes .spane").forEach(p => p.classList.toggle("on", p.id === "spane-" + sleepTab));
    const hook = SLEEP_TAB_HOOKS[sleepTab];
    if (hook) setTimeout(() => { try { hook(); } catch (e) {} }, 60);
  }));
  $("#sleepPanes").innerHTML = `
    <div class="spane${sleepTab === "sim" ? " on" : ""}" id="spane-sim"></div>
    <div class="spane" id="spane-cmp"></div>
    <div class="spane" id="spane-anx"></div>
    <div class="spane" id="spane-atlas"></div>
    <div class="spane" id="spane-dx"></div>
    <div class="spane" id="spane-pap"></div>
    <div class="spane" id="spane-rules"></div>
    <div class="spane" id="spane-scores"></div>`;
  hydrateIcons($("#sleepTabs"));
  buildPsgPane();
  if (typeof buildCmpPane === "function") buildCmpPane();
  if (typeof buildPsgAnalyticsPane === "function") buildPsgAnalyticsPane();
  buildAtlasPane(); buildDxPane(); buildPapPane(); buildRulesPane(); buildScoresPane();
}

/* ── PSG simulator pane ────────────────────────────────────────────────── */
function buildPsgPane(){
  const el = $("#spane-sim");
  el.innerHTML = `
    <div class="panel brk" style="margin-bottom:14px">
      <div class="panel-b" style="padding:12px">
        <div class="flex wrap" style="gap:10px;align-items:flex-start">
          <div style="flex:1;min-width:260px">
            <div style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--cyan)">REAL-TIME POLYSOMNOGRAPH · 13 CHANNELS · 30-SECOND EPOCHS</div>
            <p class="small muted" style="margin-top:6px;line-height:1.6">A full night of physiology synthesized locally: EEG with stage-specific rhythms and transients (spindles, K-complexes, vertex waves, sawtooth), out-of-phase EOG, chin/leg EMG, ECG with brady–tachy dynamics, thermistor + nasal-pressure airflow with flow-limitation, RIP effort belts, snore microphone and SpO₂ plethysmography with physiologic desaturation lag. Pick a scenario, throttle the speed to 60×, and watch the hypnogram build while the AASM auto-scorer tallies apneas, hypopneas, arousals and PLMs.</p>
          </div>
          <div style="flex:0 0 300px;max-width:100%">
            <div class="ai-block info" style="margin:0">
              <b>Reading the traces</b>
              <ul style="margin:6px 0 0 16px">
                <li class="warn">Effort continues + flow flat = <b>obstructive</b></li>
                <li class="warn">Effort AND flow both flat = <b>central</b></li>
                <li>Flattened nasal-pressure inspiration = flow limitation (UARS/hypopnea)</li>
                <li>Out-of-phase EOG deflections = true eye movements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="psgMount"></div>`;
  PSG.mount($("#psgMount", el));
}

/* ── stages atlas ──────────────────────────────────────────────────────── */
function demoBeats(n, rr){ const a = []; for (let t = 0.1; t < n; t += rr) a.push(t); return a; }
function demoState(stage, t){ return { t:t, stage:stage, stageHist:[{ t:0, stage:stage }], arousal:null, apnea:null, leg:null,
  beats:demoBeats(12, 0.85), respRate:14, respAmp:0.9, flowLimit:0.1, effortAmp:1, paradox:0, snore:0, spO2:96 }; }
function drawStageDemo(cv, stage){
  const { ctx, w, h } = cvSetup(cv, 64);
  ctx.clearRect(0, 0, w, h);
  const T = 10, t1 = performance === undefined ? 0 : 0; /* static window */
  const st = demoState(stage);
  const rows = [["EEG", h * 0.28, eegGen, "#00e5ff"], ["EOG", h * 0.74, eogGen, "#b18cff"]];
  rows.forEach(r => {
    ctx.strokeStyle = "rgba(120,170,230,.12)"; ctx.beginPath(); ctx.moveTo(0, r[1]); ctx.lineTo(w, r[1]); ctx.stroke();
    ctx.strokeStyle = r[3]; ctx.lineWidth = 1.1; ctx.shadowColor = r[3]; ctx.shadowBlur = 3;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 1){
      const t = x / w * T; st.t = t;
      let v = r[2](t, st, r[0] === "EEG" ? "C" : "L");
      if (r[0] === "EOG") v = r[2](t, st, "L");
      const y = r[1] - clamp(v, -1, 1) * (h * 0.2);
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(130,152,189,.8)"; ctx.font = "8px monospace"; ctx.textAlign = "left";
    ctx.fillText(r[0], 4, r[1] - h * 0.2 - 2);
  });
}
function buildAtlasPane(){
  const el = $("#spane-atlas");
  el.innerHTML = `
    <div class="grid g3" style="margin-bottom:14px">
      ${SLEEP_STAGES.map(s => `
        <div class="stagecard"><div class="band" style="background:${s.band}"></div>
          <span class="pct mono">${esc(s.pct.split("(")[0])}</span>
          <h4 style="color:${s.band}">${esc(s.id)} · ${esc(s.name.split("—")[0])}</h4>
          <div class="small muted" style="line-height:1.55">${esc(s.pct)}</div>
          <div class="wave-demo"><canvas id="stagedemo-${s.id}" height="64"></canvas></div>
          <ul class="small">
            <li><b class="cy">EEG</b> — ${esc(s.eeg)}</li>
            <li><b class="vt">EOG</b> — ${esc(s.eog)}</li>
            <li><b class="am">EMG</b> — ${esc(s.emg)}</li>
          </ul>
        </div>`).join("")}
    </div>
    <div class="grid g2">
      <div class="panel"><div class="panel-h"><div class="pt"><span data-ic="clock"></span>SLEEP ARCHITECTURE FACTS</div></div>
        <div class="panel-b"><ul>
          <li><b>Cycles.</b> ${esc(SLEEP_ARCH.cycles)}</li>
          <li><b>Latencies.</b> ${esc(SLEEP_ARCH.latency)}</li>
          <li><b>Continuity.</b> ${esc(SLEEP_ARCH.waso)}</li>
          <li><b>Aging.</b> ${esc(SLEEP_ARCH.aging)}</li>
        </ul></div></div>
      <div class="panel"><div class="panel-h"><div class="pt"><span data-ic="settings"></span>PSG MONTAGE & TECHNICAL</div></div>
        <div class="panel-b"><ul>
          <li><b>Channels.</b> ${esc(SLEEP_ARCH.montage)}</li>
          <li><b>Settings.</b> ${esc(SLEEP_ARCH.filters)}</li>
        </ul></div></div>
    </div>`;
  const drawAll = () => SLEEP_STAGES.forEach(s => { const cv = $("#stagedemo-" + s.id); if (cv) drawStageDemo(cv, s.id); });
  drawAll();
  regRedraw("sleep", drawAll);
}

/* ── disorders ─────────────────────────────────────────────────────────── */
let sleepDxCat = "All";
function buildDxPane(){
  const el = $("#spane-dx");
  const cats = ["All", ...new Set(SLEEP_DX.map(d => d.cat))];
  const render = () => {
    const list = SLEEP_DX.filter(d => sleepDxCat === "All" || d.cat === sleepDxCat);
    el.innerHTML = `
      <div class="flex wrap" style="gap:7px;margin-bottom:14px" id="dxFilt">
        ${cats.map(c => `<button class="qchip${c === sleepDxCat ? " on" : ""}" data-dxc="${c}"${c === sleepDxCat ? " style='color:var(--cyan);border-color:var(--line2)'" : ""}>${c}</button>`).join("")}
        <span class="chip" style="margin-left:auto">${list.length} OF ${SLEEP_DX.length} DISORDERS</span>
      </div>
      <div class="grid g4">
        ${list.map(d => `
          <div class="card" data-sdx="${d.id}"><span class="arrow">▸</span>
            <div class="cid"><div class="ic" data-ic="${d.ic}"></div>
              <div style="min-width:0"><div class="abbr">${esc(d.name.split("(")[0])}</div><div class="lbl">${esc(d.cat)}</div></div></div>
            <div class="nm" style="min-height:56px;font-size:12px">${esc(d.tag)}</div>
            <div class="foot"><span class="chip info">${esc(d.summ.slice(0, 34))}…</span></div>
          </div>`).join("")}
      </div>`;
    hydrateIcons(el);
    $$("#dxFilt [data-dxc]").forEach(b => b.addEventListener("click", () => { sleepDxCat = b.getAttribute("data-dxc"); render(); }));
    $$("[data-sdx]", el).forEach(c => c.addEventListener("click", () => showSleepDx(c.getAttribute("data-sdx"))));
  };
  render();
}
function showSleepDx(id){
  const d = SLEEP_DX.find(x => x.id === id); if (!d) return;
  openSheet(d.name, d.cat + " · " + d.tag, `
    <p>${esc(d.summ)}</p>
    <h4>Clinical detail</h4>
    <ul>${d.det.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
    <h4>Treatment</h4>
    <div class="ai-block settings" style="border-color:var(--line2)">${esc(d.tx)}</div>
    <h4>References</h4>
    <p class="mono small" style="color:var(--teal)">${esc(d.refs)}</p>`);
}

/* ── PAP therapy ───────────────────────────────────────────────────────── */
function buildPapPane(){
  const el = $("#spane-pap");
  el.innerHTML = `
    <div class="panel brk" style="margin-bottom:14px">
      <div class="panel-h"><div class="pt"><span data-ic="lungs"></span>POSITIVE AIRWAY PRESSURE MODE SELECTOR</div><span class="chip">6 DELIVERY MODES</span></div>
      <div class="panel-b">
        <div class="papgrid">
          ${PAP_MODES.map(p => `
            <div class="papcard">
              <h4><span data-ic="gauge" style="color:var(--cyan)"></span>${esc(p.name)} <span class="rng">${esc(p.range)}</span></h4>
              <div class="small" style="color:var(--muted);margin:6px 0 2px"><b class="gr">${esc(p.full)}</b></div>
              <div class="small" style="margin:6px 0"><b class="cy">INDICATION</b> — ${esc(p.ind)}</div>
              <p class="small muted" style="line-height:1.6">${esc(p.mech)}</p>
              <p class="small" style="line-height:1.6"><b class="am">TITRATION</b> — ${esc(p.tit)}</p>
              <p class="small muted" style="line-height:1.6;border-top:1px dashed var(--line-soft);padding-top:8px;margin-top:8px">${esc(p.notes)}</p>
            </div>`).join("")}
        </div>
      </div>
    </div>
    <div class="grid g2">
      <div class="panel"><div class="panel-h"><div class="pt"><span data-ic="alert"></span>WHEN NOT TO USE WHAT</div></div>
        <div class="panel-b"><ul>
          <li class="warn"><b>APAP</b> — avoid in central/mixed apnea, OHS hypoventilation, HF with CSR, chronic opioids: use BPAP/ASV/NIV.</li>
          <li class="warn"><b>ASV</b> — contraindicated in HFrEF LVEF ≤ 45%/≤ 35% (SERVE-HF mortality signal).</li>
          <li class="warn"><b>CPAP alone</b> in OHS with significant nocturnal hypoventilation — expect residual hypercapnia; BPAP-ST preferred.</li>
          <li class="good"><b>BPAP-ST/AVAPS</b> — the chronic hypercapnic failure workhorse (COPD PaCO₂ ≥ 52, OHS, NMD, kyphoscoliosis).</li>
        </ul></div></div>
      <div class="panel"><div class="panel-h"><div class="pt"><span data-ic="check"></span>ADHERENCE ENGINEERING</div></div>
        <div class="panel-b"><ul>
          <li>First-week intensive follow-up (mask-fit clinic, leak data review) doubles 90-day adherence.</li>
          <li>Heated humidification + heated tube: rhinitis and dryness are the top modifiable quit-reasons.</li>
          <li>Download review beats hours-of-use self-report — discuss residual AHI, leak and mask-off times as data, not judgement.</li>
          <li>Desensitization (daytime wear), interface menu (nasal → pillows → FFM), and positional coaching rescue most 'CPAP failures'.</li>
        </ul></div></div>
    </div>`;
  hydrateIcons(el);
}

/* ── AASM rules ────────────────────────────────────────────────────────── */
function buildRulesPane(){
  const el = $("#spane-rules");
  el.innerHTML = `
    <div class="grid g2">
      ${AASM_RULES.map((r, i) => `
        <div class="ai-block${i < 4 ? " settings" : ""}" style="border-color:var(--line-soft)">
          <b class="cy">${esc(r.h)}</b>
          <p class="small" style="margin:6px 0 0;line-height:1.6">${esc(r.rule)}</p>
          <p class="small muted" style="margin:6px 0 0;line-height:1.55;border-left:2px solid var(--line2);padding-left:9px">${esc(r.note)}</p>
        </div>`).join("")}
    </div>`;
}

/* ── interactive scores ────────────────────────────────────────────────── */
const scoreState = {};
function buildScoresPane(){
  const el = $("#spane-scores");
  el.innerHTML = SLEEP_SCORES.map(s => `
    <div class="panel brk" style="margin-bottom:14px">
      <div class="panel-h"><div class="pt"><span data-ic="form"></span>${esc(s.name).toUpperCase()}</div>
        <span class="chip">MAX ${s.max}</span></div>
      <div class="panel-b">
        <p class="small muted" style="margin-bottom:12px">${esc(s.what)}</p>
        <div class="qlist">
          ${s.items.map((it, i) => `
            <div class="qrow">
              <div class="qq">${i + 1}. ${esc(it)}</div>
              <div class="qopts" data-score="${s.id}" data-item="${i}">
                ${s.id === "ess" ? [0, 1, 2, 3].map(v => `<button class="qopt" data-v="${v}">${["never", "slight", "moderate", "high"][v]}<b>${v}</b></button>`).join("") : ""}
                ${s.id === "stopbang" ? `<button class="qopt" data-v="0">NO<b>0</b></button><button class="qopt" data-v="1">YES<b>1</b></button>` : ""}
                ${s.id === "berlinq" ? `<button class="qopt" data-v="0">NEGATIVE<b>0</b></button><button class="qopt" data-v="1">POSITIVE<b>1</b></button>` : ""}
              </div>
            </div>`).join("")}
        </div>
        <div class="grid g32" style="margin-top:14px;align-items:center">
          <div class="chartbox"><div class="ct">SCORE</div><canvas id="scoreG-${s.id}" height="130"></canvas></div>
          <div><div class="res info" id="scoreRes-${s.id}"><div class="rh"><span class="rl">SCORE</span><span class="rv">—</span></div></div>
            <p class="small muted" style="margin-top:10px;line-height:1.6">${esc(s.note)}</p></div>
        </div>
      </div>
    </div>`).join("");
  hydrateIcons(el);
  SLEEP_SCORES.forEach(s => { scoreState[s.id] = s.items.map(() => null); });
  $$("#spane-scores .qopt").forEach(b => b.addEventListener("click", () => {
    const holder = b.closest(".qopts");
    const sid = holder.getAttribute("data-score"), item = +holder.getAttribute("data-item");
    $$(".qopt", holder).forEach(x => x.classList.remove("on"));
    b.classList.add("on");
    scoreState[sid][item] = +b.getAttribute("data-v");
    updateScore(sid);
  }));
}
function updateScore(sid){
  const s = SLEEP_SCORES.find(x => x.id === sid); if (!s) return;
  const vals = scoreState[sid] || [];
  const answered = vals.filter(v => v !== null).length;
  const total = vals.reduce((a, v) => a + (v || 0), 0);
  const res = $("#scoreRes-" + sid);
  const interp = answered === s.items.length ? s.interp(total) : null;
  res.className = "res " + (interp ? (interp.c === "ok" ? "ok" : interp.c === "caution" ? "info" : interp.c === "warn" ? "warn" : "danger") : "info");
  res.innerHTML = `<div class="rh"><span class="rl">${esc(s.name)} · ${answered}/${s.items.length} answered</span><span class="rv">${total}<small> /${s.max}</small></span></div>
    ${interp ? `<div class="ri">${esc(interp.t)}</div>` : `<div class="ri">Answer all items for interpretation.</div>`}`;
  gauge($("#scoreG-" + sid), { value:answered ? total : null, min:0, max:s.max, h:130,
    zones:[{ to:s.max * 0.35, color:"rgba(61,255,176,.75)" }, { to:s.max * 0.7, color:"rgba(255,180,84,.75)" }, { to:s.max, color:"rgba(255,56,96,.8)" }],
    unit:"points", label:s.name.split(" ")[0] + " score" });
}
</script>
