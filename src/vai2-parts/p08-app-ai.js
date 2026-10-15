<script>
/* ═══════════════════════════════════════════════════════════════════════════
   AI CONSULT — console chat + structured consultation + report export
   Engine: bundled V.askAI / V.consult (100% local rule base)
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const mdInline = s => esc(s);

/* ── console log helpers ───────────────────────────────────────────────── */
function conLine(text, cls) {
  const c = $("#aiConsole");
  const d = document.createElement("div");
  d.className = "ln " + (cls || "sys");
  d.innerHTML = text;
  c.appendChild(d); c.scrollTop = c.scrollHeight;
  return d;
}
function conClear() { $("#aiConsole").innerHTML = ""; }

/* ── render an AIAnswer into the console ──────────────────────────────── */
function renderAnswer(a) {
  const c = $("#aiConsole");
  const wrap = document.createElement("div");
  let blocks = `<div class="ai-title"><span class="cy">◈</span> ${esc(stripEmoji(a.title))}</div>`;
  a.blocks.forEach(b => {
    if (b.type === "text") blocks += `<div class="ai-block">${md(b.content)}</div>`;
    else if (b.type === "list") blocks += `<div class="ai-block"><ul>${b.content.map(x => `<li>${md(x)}</li>`).join("")}</ul></div>`;
    else if (b.type === "steps") blocks += `<div class="ai-block"><ul>${b.content.map((x, i) => `<li><b class="cy">${i + 1}.</b> ${md(x)}</li>`).join("")}</ul></div>`;
    else if (b.type === "settings") blocks += `<div class="ai-block settings"><ul>${b.content.map(x => `<li>${md(x)}</li>`).join("")}</ul></div>`;
    else if (b.type === "warning") blocks += `<div class="ai-block warn"><ul>${b.content.map(x => `<li>${md(x)}</li>`).join("")}</ul></div>`;
  });
  blocks += `<div class="ai-src">SOURCE ▸ ${esc(a.source)} · OFFLINE RULE ENGINE</div>`;
  wrap.innerHTML = blocks;
  c.appendChild(wrap); c.scrollTop = c.scrollHeight;
  /* related follow-ups */
  if (a.related && a.related.length) {
    $("#aiRel").innerHTML = a.related.slice(0, 4).map(q => `<button class="qchip" data-q="${esc(q)}">↳ ${esc(q)}</button>`).join("");
    $$("#aiRel [data-q]").forEach(b => b.addEventListener("click", () => AI.ask(b.getAttribute("data-q"))));
  }
}

/* ── AI namespace ──────────────────────────────────────────────────────── */
const AI = {
  busy: false,
  ask(q) {
    q = (q || "").trim();
    if (!q || AI.busy) return;
    AI.busy = true;
    conLine(`<span class="cy">▸</span> <span class="usr">${esc(q)}</span>`, "usr");
    const think = conLine(`<span class="teal">AI</span> scanning knowledge nodes<span class="cursor"></span>`, "hint");
    setTimeout(() => {
      think.innerHTML = `<span class="teal">AI</span> matched knowledge node — composing answer`;
      renderAnswer(V.askAI(q));
      AI.busy = false;
    }, 420);
  },
  init() {
    conLine("VENTILATOR AI · MK-II — offline rule engine online.", "sys");
    conLine("22 modes · 29 protocols · 40+ knowledge nodes · zero network calls.", "hint");
    $("#aiQuick").innerHTML = V.QUICK_QUESTIONS.map(q => `<button class="qchip" data-q="${esc(q)}">${esc(q)}</button>`).join("");
    $$("#aiQuick [data-q]").forEach(b => b.addEventListener("click", () => AI.ask(b.getAttribute("data-q"))));
    $("#aiSend").addEventListener("click", () => { AI.ask($("#aiInput").value); $("#aiInput").value = ""; });
    $("#aiInput").addEventListener("keydown", e => { if (e.key === "Enter") { AI.ask($("#aiInput").value); $("#aiInput").value = ""; } });
  },
};

/* ── structured consult ────────────────────────────────────────────────── */
function consultInputs() {
  return {
    condition: $("#cCond").value,
    sex: segVal("cSex") || "male",
    height: parseFloat($("#cHeight").value) || null,
    spontEffort: segVal("cEffort") || "weak",
    oxygenation: segVal("cOxy") || "adequate",
    co2: segVal("cCo2") || "adequate",
    hemodynamics: segVal("cHemo") || "stable",
    noninvasivePreferred: !!$("#cNiv").checked,
  };
}
function consultIbwSync() {
  const i = consultInputs();
  const ibw = C_.calcIBW(i.sex, i.height);
  const tv = C_.calcTidalVolumes(ibw);
  $("#cIbw").innerHTML = ibw && tv ? `
    <div class="rh"><span class="rl">PBW (${i.sex === "male" ? "male" : "female"}, ${i.height} cm)</span><span class="rv">${ibw.toFixed(1)}<small>kg</small></span></div>
    <div class="ri">Protective VT: <b class="cy">${tv.ml6} mL</b> at 6 mL/kg · range ${tv.ml4}–${tv.ml8} mL · minute ventilation at RR 18 ≈ ${(tv.ml6 * 18 / 1000).toFixed(1)} L/min</div>` :
    `<div class="ri">Enter height to compute predicted body weight.</div>`;
}
function buildConsultReport() {
  const i = consultInputs();
  const saved = { c: i.condition, s: i.sex, h: i.height, e: i.spontEffort, o: i.oxygenation, co: i.co2, hm: i.hemodynamics, niv: i.noninvasivePreferred };
  store.set("consult", saved);
  /* console animation */
  conClear();
  conLine("STRUCTURED CONSULTATION INITIATED", "sys");
  const labels = { none: "no spontaneous effort", weak: "weak effort", strong: "strong effort" };
  const lines = [
    `▸ profile: ${i.condition === "unknown" ? "condition UNKNOWN — generic pathway" : "condition = " + i.condition.toUpperCase()}`,
    `▸ effort: ${labels[i.spontEffort]} · O₂: ${i.oxygenation} · CO₂: ${i.co2} · haemodynamics: ${i.hemodynamics}`,
    `▸ NIV preference: ${i.noninvasivePreferred ? "YES" : "NO"} · PBW: ${i.height ? C_.calcIBW(i.sex, i.height).toFixed(1) + " kg" : "not entered"}`,
    "▸ loading protocol matrix … OK",
    "▸ running decision rules (pass 1: mode selection · pass 2: overrides · pass 3: safety) … OK",
    "▸ ANALYSIS COMPLETE — rendering plan",
  ];
  let li = 0;
  const out = $("#consultOut");
  out.innerHTML = `<div class="panel brk"><div class="panel-h"><div class="pt"><span data-ic="cpu"></span>VENTILATION PLAN</div><span class="chip warn">GENERATING…</span></div>
    <div class="panel-b"><div class="console" id="consultConsole"></div><div class="pbar"><i id="consultBar"></i></div></div></div>`;
  const cc = $("#consultConsole");
  const step = () => {
    if (li < lines.length) {
      const d = document.createElement("div"); d.className = "ln sys"; d.textContent = lines[li];
      cc.appendChild(d); cc.scrollTop = cc.scrollHeight;
      $("#consultBar").style.width = Math.round((li + 1) / lines.length * 100) + "%";
      li++; setTimeout(step, 260);
    } else { renderConsultResult(i); }
  };
  setTimeout(step, 250);
}
function renderConsultResult(i) {
  const r = V.consult({ condition: i.condition, spontEffort: i.spontEffort, oxygenation: i.oxygenation, co2: i.co2, hemodynamics: i.hemodynamics, noninvasivePreferred: i.noninvasivePreferred });
  const ibw = C_.calcIBW(i.sex, i.height);
  const tv = C_.calcTidalVolumes(ibw);
  const mode = V.getMode(r.modeId);
  const sc = i.condition !== "unknown" ? V.getScenario(i.condition) : null;
  const note = (VAI_CONSULT_NOTES[r.modeId] || "");
  const settingsRows = r.settings.map(s => { const ix = s.indexOf(":"); return `<tr><td class="mono cy">${esc(s.slice(0, ix))}</td><td class="mono"><b>${esc(s.slice(ix + 1).trim())}</b></td></tr>`; }).join("");
  const html = `
    <div class="panel brk" style="margin-top:14px;animation:fadeup .3s ease-out">
      <div class="panel-h"><div class="pt"><span data-ic="zap"></span>RECOMMENDED STRATEGY</div>
        <div class="flex wrap" style="gap:6px">
          <span class="chip ok">CONFIDENCE: RULE-BASED</span>
          <button class="btn sm" id="cpCopy"><span data-ic="copy"></span>Copy</button>
          <button class="btn sm" id="cpDl"><span data-ic="download"></span>.txt</button>
        </div></div>
      <div class="panel-b">
        <div class="res ok" style="border-left-width:4px"><div class="rh"><span class="rl">HEADLINE</span>
          <span class="rv" style="font-size:15px;line-height:1.5">${esc(stripEmoji(r.headline))}</span></div>
          ${note ? `<div class="ri">${esc(note)}</div>` : ""}</div>
        ${ibw && tv ? `<div class="res info"><div class="rh"><span class="rl">Computed for this patient (PBW ${ibw.toFixed(1)} kg)</span>
          <span class="rv">${tv.ml6}<small>mL VT @6 mL/kg</small></span></div>
          <div class="ri">Protective range ${tv.ml4}–${tv.ml8} mL · always verify Pplat ≤ 30 and ΔP ≤ 15 after 30 min, then q4h.</div></div>` : ""}
        <h4 style="font-family:var(--mono);font-size:11px;letter-spacing:.2em;color:var(--cyan);margin:14px 0 8px">RATIONALE</h4>
        <ul class="checks">${r.rationale.map(x => `<li class="good">${esc(x)}</li>`).join("")}</ul>
        <h4 style="font-family:var(--mono);font-size:11px;letter-spacing:.2em;color:var(--cyan);margin:14px 0 8px">SETTINGS</h4>
        <div class="tscroll"><table class="dt"><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>${settingsRows}</tbody></table></div>
        ${r.cautions.length ? `<h4 style="font-family:var(--mono);font-size:11px;letter-spacing:.2em;color:var(--amber);margin:14px 0 8px">CAUTIONS</h4>
        <ul>${r.cautions.map(x => `<li class="warn">${esc(x)}</li>`).join("")}</ul>` : ""}
        ${r.alternates.length ? `<h4 style="font-family:var(--mono);font-size:11px;letter-spacing:.2em;color:var(--cyan);margin:14px 0 8px">ALTERNATIVES</h4>
        <div class="flex wrap" style="gap:7px">${r.alternates.map(a => `<button class="btn ghost sm" data-alt="${a.modeId}">${esc((V.getMode(a.modeId) || { abbr: a.modeId }).abbr)} — ${esc(a.note)}</button>`).join("")}</div>` : ""}
        <div class="flex wrap" style="gap:9px;margin-top:18px">
          ${sc ? `<button class="btn" id="cpProto"><span data-ic="steth"></span>Open full ${esc(stripEmoji(sc.name))} protocol</button>` : ""}
          ${mode ? `<button class="btn ghost" id="cpMode"><span data-ic="book"></span>${esc(mode.abbr)} dossier</button>` : ""}
          <button class="btn ghost" id="cpWave"><span data-ic="wave"></span>Simulate in Waveform Lab</button>
        </div>
      </div>
    </div>`;
  const holder = document.createElement("div");
  holder.innerHTML = html;
  $("#consultOut").appendChild(holder);
  hydrateIcons(holder);
  $("#consultOut").scrollIntoView({ behavior: "smooth", block: "nearest" });
  const plain = `VENTILATOR AI MK-II — OFFLINE CONSULT REPORT
${new Date().toLocaleString()}
==================================================
CONDITION : ${i.condition}
PATIENT   : ${i.sex} · ${i.height || "?"} cm · PBW ${ibw ? ibw.toFixed(1) : "?"} kg
STATUS    : effort=${i.spontEffort} oxygenation=${i.oxygenation} co2=${i.co2} hemo=${i.hemodynamics} nivPreferred=${i.noninvasivePreferred}
--------------------------------------------------
RECOMMENDED: ${r.headline}
${r.rationale.map(x => "  • " + x).join("\n")}
SETTINGS:
${r.settings.map(x => "  " + x).join("\n")}
CAUTIONS:
${r.cautions.map(x => "  ! " + x).join("\n")}
ALTERNATIVES:
${r.alternates.map(a => "  - " + (V.getMode(a.modeId) || { abbr: a.modeId }).abbr + ": " + a.note).join("\n")}
==================================================
Educational decision support — verify against local protocols.`;
  $("#cpCopy").addEventListener("click", () => copyText(plain));
  $("#cpDl").addEventListener("click", () => downloadText("ventilator-ai-consult.txt", plain));
  const pp = $("#cpProto"); if (pp) pp.addEventListener("click", () => showScenario(sc.id));
  const pm = $("#cpMode"); if (pm) pm.addEventListener("click", () => showMode(r.modeId));
  $("#cpWave").addEventListener("click", () => { gotoView("wave"); if (SIM_MODE_OF[r.modeId]) WaveLab.setMode(SIM_MODE_OF[r.modeId]); });
  $$("[data-alt]", holder).forEach(b => b.addEventListener("click", () => showMode(b.getAttribute("data-alt"))));
}
function initConsultForm() {
  $("#cCond").innerHTML = `<option value="unknown">— Not known / mixed picture —</option>` +
    V.PATIENT_SCENARIOS.map(s => `<option value="${s.id}">${esc(stripEmoji(s.name))}</option>`).join("");
  const segs = ["cSex", "cEffort", "cOxy", "cCo2", "cHemo"];
  segs.forEach(id => segWire($("#" + id), () => consultIbwSync()));
  $("#cHeight").addEventListener("input", consultIbwSync);
  $("#consultGo").addEventListener("click", buildConsultReport);
  /* restore last session */
  const s = store.get("consult", null);
  if (s) {
    $("#cCond").value = s.c;
    $("#cHeight").value = s.h || 170;
    $("#cNiv").checked = s.niv !== false;
    const set = (id, v) => { const b = $("#" + id + " button[data-v='" + v + "']"); if (b) { $$("#" + id + " button").forEach(x => x.classList.remove("on")); b.classList.add("on"); } };
    set("cSex", s.s); set("cEffort", s.e); set("cOxy", s.o); set("cCo2", s.co); set("cHemo", s.hm);
  }
  consultIbwSync();
}
</script>
