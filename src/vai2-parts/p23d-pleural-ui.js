<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-VI · PLEURAL VIEW (p23d) — approach · atlas · procedures
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

let plTab = "approach";
const PL_TAB_HOOKS = {
  calc: () => { plLightRun(); plPpeRun(); plPnxRun(); plManoRun(); plChyloRun(); plHemoRun(); plRocRun(); plLentRun(); plVolRun(); },
  anx: () => { if (typeof plLabRun === "function") plLabRun(); else plFluidRun(); },
};
function plGoTab(id){ const b = $("#plTabs [data-ptab=\"" + id + "\"]"); if (b) b.click(); }

function buildPleuralView(){
  const tabs = [
    ["approach", "flow", "Approach"], ["atlas", "layers", "Disease Atlas"],
    ["calc", "calc", "Calculators"], ["anx", "drop", "Fluid Lab"],
    ["consult", "steth", "AI Consult"], ["proc", "needle", "Procedures"],
  ];
  $("#plTabs").innerHTML = tabs.map(t =>
    `<button class="stab${t[0] === plTab ? " on" : ""}" data-ptab="${t[0]}"><span data-ic="${t[1]}"></span>${t[2]}</button>`).join("");
  $$("#plTabs [data-ptab]").forEach(b => b.addEventListener("click", () => {
    plTab = b.getAttribute("data-ptab");
    $$("#plTabs [data-ptab]").forEach(x => x.classList.toggle("on", x === b));
    $$("#plPanes .spane").forEach(p => p.classList.toggle("on", p.id === "plpane-" + plTab));
    const hook = PL_TAB_HOOKS[plTab];
    if (hook) setTimeout(() => { try { hook(); } catch (e) {} }, 60);
  }));
  $("#plPanes").innerHTML = `
    <div class="spane${plTab === "approach" ? " on" : ""}" id="plpane-approach"></div>
    <div class="spane" id="plpane-atlas"></div>
    <div class="spane" id="plpane-calc"></div>
    <div class="spane" id="plpane-anx"></div>
    <div class="spane" id="plpane-consult"></div>
    <div class="spane" id="plpane-proc"></div>`;
  hydrateIcons($("#plTabs"));
  buildPlApproach(); buildPlAtlas(); buildPlCalcPane(); buildPlAnalyzerPane(); buildPlConsultPane(); buildPlProcPane();
}

/* ─── APPROACH pane ───────────────────────────────────────────────────── */
function buildPlApproach(){
  const el = $("#plpane-approach");
  el.innerHTML = `
    <div class="panel brk" style="margin-bottom:14px"><div class="panel-b" style="padding:12px">
      <div style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--cyan)">LIGHT'S PLEURAL DISEASES 6E — CHAPTER 8 MASTER ALGORITHM</div>
      <p class="small muted" style="margin-top:6px;line-height:1.6">The complete diagnostic pathway for the patient with a pleural effusion, transcribed from Chapter 8 (Approach to the Patient) with quantitative thresholds from Chapters 6, 7, 12, 24 and 28. Follow the eight steps in order — each adds tests only when they change management. The engine on the AI Consult tab implements this algorithm as a 4-way fusion: Light's-criteria classification → rule guardrails → Bayesian differential (26 diseases, book-derived likelihood ratios) → data-driven next-step ladder.</p>
    </div></div>
    <div class="pl-grid2" style="gap:12px">
      ${PL_ALGORITHM.map((s, i) => `
        <div class="panel brk"><div class="panel-b" style="padding:12px">
          <div class="flex" style="gap:10px;align-items:flex-start">
            <div class="gic" style="width:34px;height:34px;border:1px solid var(--line2);border-radius:9px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-weight:700;color:var(--cyan);flex:0 0 34px">${String(i + 1).padStart(2, "0")}</div>
            <div style="min-width:0">
              <div style="font-weight:700;font-size:12.5px;color:#dff3ff;margin-bottom:5px">${esc(s.h)}</div>
              <div class="small" style="color:var(--txt);line-height:1.65">${esc(s.body)}</div>
            </div>
          </div>
        </div></div>`).join("")}
    </div>
    <div class="panel brk" style="margin-top:14px"><div class="panel-b" style="padding:12px">
      <div style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--am)">ETIOLOGIC FREQUENCY (≈1 MILLION US EFFUSIONS/YR)</div>
      <div class="pl-grid2" style="gap:6px;margin-top:10px">
        ${PL_EPID.map(e => `<div class="small" style="border:1px solid var(--line-soft);border-radius:8px;padding:7px 9px"><b style="color:#dff3ff">${esc(e[0])}</b><br><span class="muted">${esc(e[1])}</span></div>`).join("")}
      </div>
    </div></div>
    <div class="pl-grid2" style="gap:12px;margin-top:14px">
      <div class="panel brk"><div class="panel-b" style="padding:12px">
        <div style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--tl)">DECISION THRESHOLDS — CHEMISTRY</div>
        <table class="pl-table" style="margin-top:8px"><thead><tr><th>Test</th><th>Threshold</th><th>Meaning</th></tr></thead>
        <tbody>${PL_REF.chem.map(r => `<tr><td><b>${esc(r.k)}</b></td><td class="am">${esc(r.cut)}</td><td class="muted">${esc(r.note)}</td></tr>`).join("")}
        ${PL_REF.cells.map(r => `<tr><td><b>${esc(r.k)}</b></td><td class="am">${esc(r.cut)}</td><td class="muted">${esc(r.note)}</td></tr>`).join("")}</tbody></table>
      </div></div>
      <div class="panel brk"><div class="panel-b" style="padding:12px">
        <div style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--tl)">MANOMETRY · VOLUME · BLOOD</div>
        <table class="pl-table" style="margin-top:8px"><thead><tr><th>Test</th><th>Threshold</th><th>Meaning</th></tr></thead>
        <tbody>${PL_REF.manometry.map(r => `<tr><td><b>${esc(r.k)}</b></td><td class="am">${esc(r.cut)}</td><td class="muted">${esc(r.note)}</td></tr>`).join("")}
        ${PL_REF.volume.map(r => `<tr><td><b>${esc(r.k)}</b></td><td class="am">${esc(r.cut)}</td><td class="muted">${esc(r.note)}</td></tr>`).join("")}
        ${PL_REF.blood.map(r => `<tr><td><b>${esc(r.k)}</b></td><td class="am">—</td><td class="muted">${esc(r.note)}</td></tr>`).join("")}</tbody></table>
      </div></div>
    </div>
    <div class="panel brk" style="margin-top:14px"><div class="panel-b" style="padding:12px">
      <div style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--mg)">TEST PERFORMANCE (META-ANALYSES QUOTED IN LIGHT 6E)</div>
      <table class="pl-table" style="margin-top:8px"><thead><tr><th>Test</th><th>Sens</th><th>Spec</th><th>Note</th></tr></thead>
      <tbody>${PL_REF.perf.map(r => `<tr><td><b>${esc(r[0])}</b></td><td class="tl">${esc(r[1])}</td><td class="am">${esc(r[2])}</td><td class="muted">${esc(r[3])}</td></tr>`).join("")}</tbody></table>
      <div class="flex wrap" style="gap:8px;margin-top:12px">
        <button class="btn mini" data-plnav="consult">RUN THE AI CONSULT →</button>
        <button class="btn mini ghost" data-plnav="calc">OPEN CALCULATORS →</button>
      </div>
    </div></div>`;
  $$("#plpane-approach [data-plnav]").forEach(b => b.addEventListener("click", () => plGoTab(b.getAttribute("data-plnav"))));
}

/* ─── ATLAS pane ──────────────────────────────────────────────────────── */
let plAtlasQ = "";
function buildPlAtlas(){
  const el = $("#plpane-atlas");
  el.innerHTML = `
    <div class="panel brk" style="margin-bottom:14px"><div class="panel-b" style="padding:12px">
      <div class="flex wrap" style="gap:10px;align-items:center">
        <div style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--cyan)">PLEURAL DISEASE ATLAS — ${PL_DX.length} ENTITIES</div>
        <input id="plAtlasQ" placeholder="search diseases, features…" style="flex:1;min-width:160px;max-width:340px" value="${esc(plAtlasQ)}">
      </div>
    </div></div>
    <div id="plAtlasGrid" class="pl-grid3"></div>
    <div id="plAtlasSheet"></div>`;
  $("#plAtlasQ").addEventListener("input", e => { plAtlasQ = e.target.value; renderPlAtlas(); });
  renderPlAtlas();
}
function renderPlAtlas(){
  const q = plAtlasQ.toLowerCase();
  const list = PL_DX.filter(d => !q || d.n.toLowerCase().indexOf(q) >= 0 || d.keys.join(" ").indexOf(q) >= 0 || d.summ.toLowerCase().indexOf(q) >= 0);
  $("#plAtlasGrid").innerHTML = list.map(d => `
    <div class="panel brk plcard" data-pldx="${d.id}" style="cursor:pointer">
      <div class="panel-b" style="padding:11px">
        <div class="flex" style="gap:9px;align-items:center;margin-bottom:6px">
          <div class="gic" style="width:30px;height:30px;border-radius:8px;border:1px solid var(--line2);display:flex;align-items:center;justify-content:center"><span data-ic="${d.ic}"></span></div>
          <div style="font-weight:700;font-size:12px;color:#dff3ff;line-height:1.25;min-width:0">${esc(d.n)}</div>
        </div>
        <span class="chip ${d.grp === "T" ? "info" : "warn"}">${d.grp === "T" ? "TRANSUDATE" : "EXUDATE"}</span>
        <span class="chip danger">${d.bl >= 3 ? "COMMON" : d.bl >= 1 ? "UNCOMMON" : "RARE"}</span>
        <div class="small muted" style="margin-top:7px;line-height:1.5">${esc(d.summ.slice(0, 130))}…</div>
      </div>
    </div>`).join("") || `<div class="small muted" style="padding:20px">No disease matches “${esc(plAtlasQ)}”.</div>`;
  hydrateIcons($("#plAtlasGrid"));
  $$("#plAtlasGrid [data-pldx]").forEach(c => c.addEventListener("click", () => openPlDx(c.getAttribute("data-pldx"))));
}
function openPlDx(id){
  const d = PL_DX.find(x => x.id === id); if (!d) return;
  $("#plAtlasSheet").innerHTML = `
    <div class="panel brk" id="plDxSheet" style="margin-top:14px;border-color:var(--cyan)">
      <div class="panel-b" style="padding:14px">
        <div class="flex" style="gap:10px;align-items:center">
          <div class="gic" style="width:38px;height:38px;border-radius:10px;border:1px solid var(--cyan);display:flex;align-items:center;justify-content:center"><span data-ic="${d.ic}"></span></div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:800;font-size:15px;color:#eaf8ff">${esc(d.n)}</div>
            <div class="small muted">${d.grp === "T" ? "Transudative physiology" : "Exudative physiology"} · relative frequency ${d.bl >= 5 ? "very common" : d.bl >= 2 ? "common" : d.bl >= 1 ? "uncommon" : "rare"}</div>
          </div>
          <button class="btn mini ghost" id="plDxClose">CLOSE ✕</button>
        </div>
        <div class="ai-block info" style="margin-top:12px">${esc(d.summ)}</div>
        <h4 style="margin:14px 0 6px;color:var(--tl);font-size:11px;letter-spacing:.12em">MANAGEMENT (LIGHT 6E)</h4>
        <ul class="checks" style="margin:0">${d.mgmt.map(m => `<li class="good">${esc(m)}</li>`).join("")}</ul>
        <h4 style="margin:14px 0 6px;color:var(--am);font-size:11px;letter-spacing:.12em">DIAGNOSTIC KEYWORDS INDEXED</h4>
        <div class="flex wrap" style="gap:6px">${d.keys.map(k => `<span class="chip info">${esc(k.toUpperCase())}</span>`).join("")}</div>
      </div>
    </div>`;
  hydrateIcons($("#plDxSheet"));
  $("#plDxClose").addEventListener("click", () => { $("#plAtlasSheet").innerHTML = ""; });
  $("#plDxSheet").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─── PROCEDURES pane ─────────────────────────────────────────────────── */
function buildPlProcPane(){
  const el = $("#plpane-proc");
  el.innerHTML = `
    <div class="panel brk" style="margin-bottom:14px"><div class="panel-b" style="padding:12px">
      <div style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--cyan)">PROCEDURE GUIDE — CHAPTERS 28–30</div>
      <p class="small muted" style="margin-top:6px;line-height:1.6">Technique, volumes, safety thresholds and complications for every pleural procedure, from the book's three procedural chapters. Ultrasound guidance halves pneumothorax (4.9% vs 10.3%) and chest-tube rates (0.7% vs 4.1%); pleural pressure monitoring prevents re-expansion edema; pH is valid only on a blood-gas analyzer.</p>
    </div></div>
    <div id="plProcList">${PL_PROCEDURES.map((p, i) => `
      <div class="panel brk" style="margin-bottom:12px">
        <div class="panel-b" style="padding:12px">
          <div class="flex" style="gap:10px;align-items:center;margin-bottom:8px">
            <div class="gic" style="width:32px;height:32px;border-radius:9px;border:1px solid var(--line2);display:flex;align-items:center;justify-content:center"><span data-ic="${p.ic}"></span></div>
            <div style="font-weight:700;font-size:13px;color:#dff3ff">${esc(p.n)}</div>
          </div>
          <table class="pl-table"><tbody>
            ${p.detail.map(r => `<tr><td style="width:130px"><b class="tl">${esc(r[0])}</b></td><td class="small" style="color:var(--txt);line-height:1.6">${esc(r[1])}</td></tr>`).join("")}
          </tbody></table>
        </div>
      </div>`).join("")}</div>
    <div class="panel brk"><div class="panel-b" style="padding:12px">
      <div style="font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--rd)">PNEUMOTHORAX MANAGEMENT MATRIX (CH. 24)</div>
      <table class="pl-table" style="margin-top:8px"><tbody>
        ${PL_PNX.mgmt.map(m => `<tr><td style="width:220px"><b class="am">${esc(m[0])}</b></td><td class="small" style="color:var(--txt);line-height:1.6">${esc(m[1])}</td></tr>`).join("")}
      </tbody></table>
    </div></div>`;
  hydrateIcons(el);
}
</script>
