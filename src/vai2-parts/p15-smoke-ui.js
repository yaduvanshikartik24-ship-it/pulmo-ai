<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI — NICOTINE CENTER VIEW
   cigarette calculator (with live API console) · quit timeline ·
   pharmacotherapy · 5A/5R protocol · Fagerström · organ harm map
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

let smokeTab = "calc";
function smokeGoTab(id){ const b = $('#smokeTabs [data-stab2="' + id + '"]'); if (b) b.click(); }
function buildSmokeView(){
  const tabs = [
    ["calc", "calc", "Cigarette Calculator"], ["clock", "clock", "Quit Clock"],
    ["quit", "check", "Quit Timeline"], ["pharm", "pill", "Pharmacotherapy"],
    ["proto", "form", "5A / 5R Protocol"], ["ftnd", "gauge", "Fagerström Test"],
    ["harm", "alert", "Harm Map"],
  ];
  $("#smokeTabs").innerHTML = tabs.map(t =>
    `<button class="stab${t[0] === smokeTab ? " on" : ""}" data-stab2="${t[0]}"><span data-ic="${t[1]}"></span>${t[2]}</button>`).join("");
  $$("#smokeTabs [data-stab2]").forEach(b => b.addEventListener("click", () => {
    smokeTab = b.getAttribute("data-stab2");
    $$("#smokeTabs [data-stab2]").forEach(x => x.classList.toggle("on", x === b));
    $$("#smokePanes .spane").forEach(p => p.classList.toggle("on", p.id === "spane-" + smokeTab));
    if (smokeTab === "calc") drawSmokeCharts();
  }));
  $("#smokePanes").innerHTML = `
    <div class="spane${smokeTab === "calc" ? " on" : ""}" id="spane-calc"></div>
    <div class="spane" id="spane-clock"></div>
    <div class="spane" id="spane-quit"></div>
    <div class="spane" id="spane-pharm"></div>
    <div class="spane" id="spane-proto"></div>
    <div class="spane" id="spane-ftnd"></div>
    <div class="spane" id="spane-harm"></div>`;
  hydrateIcons($("#smokeTabs"));
  buildSmokeCalc(); buildQuitClock(); buildQuitTimeline(); buildPharm(); buildProto(); buildFtnd(); buildHarm();
  setInterval(tickQuitClock, 1000);
}

/* ── cigarette calculator ──────────────────────────────────────────────── */
function smokeModel(){
  const cigs = clamp(+($("#smCigs") ? $("#smCigs").value : 20) || 20, 0, 80);
  const yrs = clamp(+($("#smYears") ? $("#smYears").value : 10) || 10, 0, 70);
  const cur = SMOKE_MODEL.currencies.find(c => c.code === ($("#smCur") ? $("#smCur").value : "INR")) || SMOKE_MODEL.currencies[0];
  const price = clamp(+($("#smPrice") ? $("#smPrice").value : cur.pack) || cur.pack, 0, 100000);
  const age = clamp(+($("#smAge") ? $("#smAge").value : 40) || 40, 12, 100);
  const packs = cigs / 20;
  const packYears = packs * yrs;
  const totalCigs = cigs * 365.25 * yrs;
  const spend = packs * price * 365.25 * yrs;
  const perYear = packs * price * 365.25;
  const y10 = perYear * 10, y20 = perYear * 20;
  const lifeMin = totalCigs * SMOKE_MODEL.minutesPerCig;
  const lifeYr = lifeMin / (60 * 24 * 365.25);
  const quitYr = SMOKE_MODEL.quitGainYears[Math.floor(age / 5) * 5] || (age < 30 ? 10 : age >= 65 ? 2.5 : 3);
  const cohB = clamp(2 + 0.42 * cigs, 2, 15);
  return { cigs, yrs, cur, price, packs, packYears, totalCigs, spend, perYear, y10, y20, lifeMin, lifeYr, quitYr, cohB, age };
}
function money(m, cur){ return cur.sym + Math.round(m).toLocaleString("en-IN"); }
function buildSmokeCalc(){
  const el = $("#spane-calc");
  el.innerHTML = `
    <div class="grid g32" style="margin-bottom:14px">
      <div class="panel brk">
        <div class="panel-h"><div class="pt"><span data-ic="cigarette"></span>CIGARETTE CALCULATOR · INPUT DECK</div><span class="chip ok"><span class="dot"></span>LIVE</span></div>
        <div class="panel-b">
          <div class="formgrid">
            <div class="field"><label>Cigarettes / day</label><input type="number" id="smCigs" value="20" min="0" max="80"></div>
            <div class="field"><label>Years smoking</label><input type="number" id="smYears" value="10" min="0" max="70"></div>
            <div class="field"><label>Age now</label><input type="number" id="smAge" value="40" min="12" max="100"></div>
            <div class="field"><label>Currency</label><select id="smCur">${SMOKE_MODEL.currencies.map(c => `<option value="${c.code}"${c.code === "INR" ? " selected" : ""}>${c.code} — ${c.name}</option>`).join("")}</select></div>
            <div class="field"><label>Price / pack (20)</label><input type="number" id="smPrice" value="340" min="0" step="0.5"></div>
          </div>
          <div class="ctrgrid" style="margin-top:16px" id="smCounters"></div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px;min-width:0">
        <div class="chartbox"><div class="ct">PACK-YEARS EXPOSURE</div><canvas id="smgPY" height="128"></canvas></div>
        <div class="chartbox"><div class="ct">PROJECTED SPEND IF SMOKING CONTINUES</div><canvas id="smgCost" height="150"></canvas></div>
      </div>
    </div>
    <div class="grid g32" style="margin-bottom:14px">
      <div class="chartbox"><div class="ct">DISEASE RISK MULTIPLIER vs PACK-YEARS</div><canvas id="smgRisk" height="230"></canvas></div>
      <div>
        <div class="res info" id="smVerdict" style="margin-bottom:12px"></div>
        <div class="panel" style="border-color:rgba(255,180,84,.35)">
          <div class="panel-h"><div class="pt" style="color:var(--amber)"><span data-ic="alert"></span>WHAT THE NUMBERS MEAN</div></div>
          <div class="panel-b"><ul class="small">
            <li><b>Pack-years</b> = (cigarettes/day ÷ 20) × years — the exposure currency of pulmonology (LDCT screening ≥ 20, 'heavy' ≥ 30).</li>
            <li><b>Life-minutes lost</b> uses ~ 14 min/cigarette (published estimates 11–20 min) — a motivational number, not an actuarial table.</li>
            <li><b>Risk multipliers</b> are approximate population relative risks vs never-smokers (lung cancer up to ~ 40× at extreme exposure; COPD ~ 25× male / 40× female at 45+ pack-years).</li>
            <li><b>Quitting still pays</b>: at your age, quitting now recovers ≈ <b id="smQy">—</b> life-years on population averages (Doll & Peto).</li>
            <li><b>COHb estimate</b> (~ <span id="smCohb">—</span>%) is why SpO₂ looks 'fine' while oxygen delivery is not — CO occupies haemoglobin.</li>
          </ul></div>
        </div>
      </div>
    </div>
    ${smokeApiConsole()}`;
  hydrateIcons(el);
  ["smCigs", "smYears", "smAge", "smPrice"].forEach(id => $("#" + id).addEventListener("input", drawSmokeCharts));
  $("#smCur").addEventListener("change", () => {
    const cur = SMOKE_MODEL.currencies.find(c => c.code === $("#smCur").value);
    $("#smPrice").value = cur.pack;
    drawSmokeCharts();
  });
  drawSmokeCharts();
}
function drawSmokeCharts(){
  const m = smokeModel();
  const ctr = $("#smCounters"); if (!ctr) return;
  ctr.innerHTML = [
    { v:m.packYears.toFixed(1), l:"PACK-YEARS", s:"(cigs/day ÷ 20) × years", c:"" },
    { v:Math.round(m.totalCigs).toLocaleString("en-IN"), l:"CIGARETTES SMOKED", s:"in " + m.yrs + " years", c:"" },
    { v:money(m.spend, m.cur), l:"MONEY SPENT", s:"at " + money(m.price, m.cur) + "/pack", c:"money" },
    { v:money(m.perYear, m.cur) + "/yr", l:"BURN RATE", s:"+ " + money(m.y10, m.cur) + " by 10 y · " + money(m.y20, m.cur) + " by 20 y", c:"money" },
    { v:m.lifeYr.toFixed(1) + " yr", l:"LIFE EXPECTANCY LOST", s:Math.round(m.lifeMin / 1440).toLocaleString() + " days · ~ 14 min/cig", c:"loss" },
    { v:"+" + m.quitYr + " yr", l:"REGAIN IF QUIT NOW", s:"Doll & Peto 50-year data, age " + m.age, c:"gain" },
  ].map(x => `<div class="ctr"><div class="cv ${x.c}">${x.v}</div><div class="cl">${x.l}</div><div class="cs">${x.s}</div></div>`).join("");
  gauge($("#smgPY"), { value:m.packYears, min:0, max:60, h:128,
    zones:[{ to:10, color:"rgba(61,255,176,.75)", label:"light" }, { to:20, color:"rgba(255,180,84,.75)", label:"moderate" }, { to:30, color:"rgba(255,120,84,.8)" }, { to:60, color:"rgba(255,56,96,.8)", label:"heavy" }],
    unit:"pack-years", label:"cumulative exposure" });
  hbars($("#smgCost"), { rows:[
    { label:"Spent to date", value:m.spend, max:Math.max(m.y20, m.spend, 1), color:"#ffb454", disp:money(m.spend, m.cur) },
    { label:"Next 10 years", value:m.y10, max:Math.max(m.y20, m.spend, 1), color:"#ff8054", disp:money(m.y10, m.cur) },
    { label:"Next 20 years", value:m.y20, max:Math.max(m.y20, m.spend, 1), color:"#ff3860", disp:money(m.y20, m.cur) },
  ] });
  const lc = SMOKE_MODEL.lungCaRisk, copd = SMOKE_MODEL.copdRisk;
  const lerp = (arr, x) => { for (let i = 1; i < arr.length; i++){ if (x <= arr[i][0]){ const u = (x - arr[i - 1][0]) / (arr[i][0] - arr[i - 1][0]); return arr[i - 1][1] + u * (arr[i][1] - arr[i - 1][1]); } } return arr[arr.length - 1][1]; };
  const userPY = clamp(m.packYears, 0, 60);
  const lcU = lerp(lc, userPY), cpU = lerp(copd, userPY);
  plot($("#smgRisk"), { h:230, xr:[0, 60], yr:[0, 45],
    series:[
      { pts:lc.map(p => [p[0], p[1]]), color:"#ff3860", label:"Lung cancer ×" },
      { pts:copd.map(p => [p[0], p[1]]), color:"#ffb454" },
    ],
    points:[
      { x:userPY, y:lcU, color:"#ff3860", label:"YOU · LC × " + lcU.toFixed(0) },
      { x:userPY, y:cpU, color:"#ffb454", label:"COPD × " + cpU.toFixed(0) },
    ],
    hlines:[{ y:20, color:"rgba(255,56,96,.5)", label:"20× threshold" }],
    legend:[{ color:"#ff3860", label:"Lung cancer risk ×" }, { color:"#ffb454", label:"COPD risk ×" }],
    xLabel:"pack-years", yLabel:"risk multiplier vs never-smoker" });
  const pyCls = m.packYears >= 30 ? "danger" : m.packYears >= 20 ? "warn" : m.packYears >= 10 ? "caution" : "ok";
  const v = $("#smVerdict");
  v.className = "res " + pyCls;
  v.innerHTML = `<div class="rh"><span class="rl">EXPOSURE VERDICT</span><span class="rv">${m.packYears.toFixed(1)} pack-years</span></div>
    <div class="ri">${m.packYears >= 20 ? "Meets USPSTF LDCT screening threshold (≥ 20 pack-years, 50–80 y) — order annual low-dose CT if age fits." : "Below the 20 pack-year LDCT screening threshold — cessation counselling remains the single highest-yield intervention."} Relative-risk estimate vs never-smoker: lung cancer × ${lcU.toFixed(0)}, COPD × ${cpU.toFixed(0)}. Quitting today recovers ≈ ${m.quitYr} life-years on average.</div>`;
  $("#smQy").textContent = m.quitYr + " years";
  $("#smCohb").textContent = m.cohB.toFixed(0);
}

/* ── API console (the calculator's callable API) ───────────────────────── */
function smokeApiConsole(){
  return `
  <div class="grid g32">
    <div class="apiterm">
      <div class="ahead"><div class="dots"><i style="background:#ff3860"></i><i style="background:#ffb454"></i><i style="background:#3dffb0"></i></div>
        PULMO-API · CIGARETTE CALCULATOR ENDPOINT · LOCAL EXECUTION</div>
      <div class="aout" id="apiOut">
        <div class="ln dim2">PULMO-API v3.0 — offline expression engine. Type <span class="cy">help</span> and press Enter.</div>
      </div>
      <div class="ain"><span class="pr">❯</span><input id="apiIn" placeholder="packyears(20, 10)   ·   cost(20, 10, 340)   ·   risk(25)   ·   help" autocomplete="off" aria-label="API command"></div>
    </div>
    <div class="panel">
      <div class="panel-h"><div class="pt"><span data-ic="cpu"></span>ENDPOINT REFERENCE</div><span class="chip">ZERO-NETWORK API</span></div>
      <div class="panel-b"><div class="apidocs">
        <code>packyears(cigs, years)</code> → pack-year exposure + screening flag<br>
        <code>cigs(cigs, years)</code> → total cigarettes consumed<br>
        <code>cost(cigs, years, price, [years_ahead])</code> → spend projection (price per pack)<br>
        <code>risk(packyears)</code> → lung-cancer &amp; COPD multipliers + verdict<br>
        <code>cohb(cigs)</code> → estimated carboxyhaemoglobin %<br>
        <code>quit(age)</code> → years of life regained by quitting now<br>
        <code>minutes(cigarettes)</code> → life-minutes estimate (≈ 14 min/cig)<br>
        <code>lungage(age, sex, fev1, height_cm)</code> → motivational lung age (ECSC inversion)<br>
        <code>screening(age, packyears, quit_years)</code> → USPSTF 2021 LDCT eligibility<br>
        <code>help</code> · <code>list</code> — this reference
      </div>
      <div class="flex wrap" style="gap:6px;margin-top:12px" id="apiQuick"></div></div>
    </div>
  </div>`;
}
const SMOKE_API = {
  help(){ return "Endpoints: " + Object.keys(SMOKE_API).filter(k => k !== "help" && k !== "list").join(" · ") + ". Usage: name(arg1, arg2 …) — decimals allowed. Example: risk(32.5)"; },
  list(){ return Object.keys(SMOKE_API).filter(k => k !== "help" && k !== "list").join("\n"); },
  packyears(c, y){ const py = (c / 20) * y; return { cigs_per_day:c, years:y, pack_years:+py.toFixed(1), ldct_screen_flag:py >= 20 ? "MEETS ≥ 20 pack-year threshold" : "below 20 threshold" }; },
  cigs(c, y){ return { cigs_per_day:c, years:y, total_cigarettes:Math.round(c * 365.25 * y) }; },
  cost(c, y, price){ const ahead = arguments[3] || 0; const perYear = (c / 20) * price * 365.25; return { spent_to_date:Math.round(perYear * y), per_year:Math.round(perYear), projection_ahead_years:ahead ? Math.round(perYear * ahead) : undefined }; },
  risk(py){
    const lerp = (a, x) => { for (let i = 1; i < a.length; i++){ if (x <= a[i][0]){ const u = (x - a[i - 1][0]) / (a[i][0] - a[i - 1][0]); return +(a[i - 1][1] + u * (a[i][1] - a[i - 1][1])).toFixed(1); } } return a[a.length - 1][1]; };
    return { pack_years:py, lung_cancer_x:lerp(SMOKE_MODEL.lungCaRisk, clamp(py, 0, 60)), copd_x:lerp(SMOKE_MODEL.copdRisk, clamp(py, 0, 60)),
      verdict:py >= 30 ? "HEAVY EXPOSURE — cessation + LDCT discussion urgent" : py >= 20 ? "HIGH — LDCT screening threshold met (age 50–80)" : py >= 10 ? "MODERATE — cessation counselling" : "LIGHT — advise & support cessation" };
  },
  cohb(c){ return { cigs_per_day:c, estimated_cohb_pct:+clamp(2 + 0.42 * c, 2, 15).toFixed(1), note:"rough estimate; smoker's SpO₂ overreads true oxygen content" }; },
  quit(age){ const k = Math.floor(age / 5) * 5; return { quit_age:age, years_regained:SMOKE_MODEL.quitGainYears[k] || (age < 30 ? 10 : age >= 65 ? 2.5 : 3), source:"Doll & Peto 50-year follow-up (BMJ 2004)" }; },
  minutes(n){ return { cigarettes:n, life_minutes:Math.round(n * SMOKE_MODEL.minutesPerCig), life_days:(n * SMOKE_MODEL.minutesPerCig / 1440).toFixed(1), basis:"~ 14 min/cigarette (estimates 11–20)" }; },
  lungage(age, sex, fev1, h){
    const sx = typeof sex === "string" ? sex.toLowerCase() : (sex >= 1 ? "f" : "m");
    const male = sx.startsWith("m");
    const pred = male ? 4.3 * (h / 100) - 0.029 * age - 2.49 : 3.95 * (h / 100) - 0.025 * age - 2.6;
    const la = male ? (4.3 * (h / 100) - 2.49 - fev1) / 0.029 : (3.95 * (h / 100) - 2.6 - fev1) / 0.025;
    return { chronological_age:age, sex:male ? "male" : "female", fev1_L:fev1, predicted_fev1_L:+pred.toFixed(2), lung_age:clamp(Math.round(la), 18, 100), message:la > age + 5 ? "Lung age ≫ chronological — powerful motivational feedback" : "Lung age near chronological" };
  },
  screening(age, py, quitYears){
    quitYears = quitYears || 0;
    const ok = age >= 50 && age <= 80 && py >= 20 && quitYears < 15;
    return { age, pack_years:py, years_since_quit:quitYears, uspstf_2021_ldct:ok ? "ELIGIBLE — annual low-dose CT" : "NOT ELIGIBLE",
      reason:!ok ? (age < 50 || age > 80 ? "age outside 50–80" : py < 20 ? "pack-years < 20" : "quit ≥ 15 years ago") : "all criteria met" };
  },
};
function apiPrint(out, cls){
  const box = $("#apiOut"); if (!box) return;
  const d = document.createElement("div");
  d.className = "ln " + (cls || "");
  d.textContent = out;
  box.appendChild(d); box.scrollTop = box.scrollHeight;
}
function runSmokeApi(line){
  const s = (line || "").trim(); if (!s) return;
  apiPrint("❯ " + s, "in");
  const m = s.match(/^([a-z_]+)\s*(?:\((.*)\))?\s*$/i);
  if (!m){ apiPrint("✕ Parse error — expected name(arg1, arg2 …). Try help", "err"); return; }
  const fn = m[1].toLowerCase();
  if (!(fn in SMOKE_API)){ apiPrint("✕ Unknown endpoint: " + fn + " — try list", "err"); return; }
  let args = [];
  if (m[2] && m[2].trim()){
    for (const part of m[2].split(",")){
      const kv = part.split("=");
      const raw = (kv.length > 1 ? kv[1] : part).trim();
      const v = parseFloat(raw);
      if (!isFinite(v)){
        if (/^(m|male|f|female)$/i.test(raw)){ args.push(raw.toLowerCase()); continue; }
        apiPrint("✕ Bad argument: " + raw + " — numbers (or m/f) only", "err"); return;
      }
      args.push(v);
    }
  }
  try {
    const need = SMOKE_API[fn].length;
    if (args.length < need){ apiPrint("✕ " + fn + " needs " + need + " argument(s) — see reference", "err"); return; }
    const r = SMOKE_API[fn].apply(null, args);
    if (typeof r === "string") r.split("\n").forEach(l => apiPrint(l, "ok"));
    else { apiPrint(JSON.stringify(r, (k, v) => v === undefined ? undefined : v, 2), "ok"); }
  } catch (e){ apiPrint("✕ " + e.message, "err"); }
}
function wireSmokeApi(){
  const inp = $("#apiIn"); if (!inp) return;
  inp.addEventListener("keydown", e => { if (e.key === "Enter"){ runSmokeApi(inp.value); inp.value = ""; } });
  const q = $("#apiQuick"); if (q){
    const samples = ["packyears(20, 10)", "cost(20, 10, 340, 10)", "risk(32.5)", "quit(45)", "lungage(48, m, 2.4, 172)", "screening(62, 35, 0)", "minutes(73000)", "help"];
    q.innerHTML = samples.map(s => `<button class="qchip" data-api="${esc(s)}">${esc(s)}</button>`).join("");
    $$("[data-api]", q).forEach(b => b.addEventListener("click", () => runSmokeApi(b.getAttribute("data-api"))));
  }
}

/* ── quit clock (real-time) ────────────────────────────────────────────── */
function buildQuitClock(){
  const el = $("#spane-clock");
  el.innerHTML = `
    <div class="panel brk">
      <div class="panel-h"><div class="pt"><span data-ic="clock"></span>QUIT CLOCK · REAL-TIME RECOVERY TRACKER</div><span class="chip ok"><span class="dot"></span>TICKING</span></div>
      <div class="panel-b">
        <div class="formgrid" style="grid-template-columns:200px 200px 1fr;align-items:end">
          <div class="field"><label>Quit date</label><input type="date" id="qcDate"></div>
          <div class="field"><label>Cigarettes/day before quitting</label><input type="number" id="qcCigs" value="20" min="1" max="80"></div>
          <div class="field"><label>Price per pack</label><input type="number" id="qcPrice" value="340" min="1"></div>
        </div>
        <div class="ctrgrid" style="margin-top:16px" id="qcOut">
          <div class="ctr"><div class="cv">—</div><div class="cl">SET YOUR QUIT DATE ABOVE</div><div class="cs">Every second smoke-free is repair in progress.</div></div>
        </div>
        <div id="qcMilestones" style="margin-top:16px"></div>
      </div>
    </div>`;
  const saved = store.get("quitdate", "");
  if (saved){ $("#qcDate").value = saved; $("#qcCigs").value = store.get("quitcigs", 20); $("#qcPrice").value = store.get("quitprice", 340); }
  ["qcDate", "qcCigs", "qcPrice"].forEach(id => $("#" + id).addEventListener("change", () => {
    store.set("quitdate", $("#qcDate").value); store.set("quitcigs", +$("#qcCigs").value); store.set("quitprice", +$("#qcPrice").value);
    tickQuitClock(true);
  }));
  tickQuitClock(true);
}
function tickQuitClock(force){
  const dateEl = $("#qcDate"); if (!dateEl) return;
  const dv = dateEl.value;
  const out = $("#qcOut"); if (!out) return;
  if (!dv){ return; }
  const cigs = clamp(+$("#qcCigs").value || 20, 0.5, 80);
  const price = clamp(+$("#qcPrice").value || 340, 0.5, 100000);
  const days = (Date.now() - new Date(dv + "T00:00:00")) / 86400000;
  if (days < 0){ out.innerHTML = `<div class="ctr"><div class="cv">—</div><div class="cl">QUIT DATE IS IN THE FUTURE</div><div class="cs">Lock it in — a date makes it real.</div></div>`; return; }
  const hrs = days * 24;
  const avoided = cigs * days;
  const saved = (cigs / 20) * price * days;
  const mins = avoided * SMOKE_MODEL.minutesPerCig;
  out.innerHTML = `
    <div class="ctr"><div class="cv countup">${Math.floor(days)}d ${Math.floor(days * 24 % 24)}h ${Math.floor(days * 1440 % 60)}m</div><div class="cl">SMOKE-FREE TIME</div><div class="cs">since ${esc(dv)}</div></div>
    <div class="ctr"><div class="cv gain">${Math.round(avoided).toLocaleString()}</div><div class="cl">CIGARETTES NOT SMOKED</div><div class="cs">at ${cigs}/day</div></div>
    <div class="ctr"><div class="cv money">${"₹" + Math.round(saved).toLocaleString("en-IN")}</div><div class="cl">MONEY SAVED</div><div class="cs">redirected from tobacco</div></div>
    <div class="ctr"><div class="cv gain">${(mins / 1440).toFixed(1)} days</div><div class="cl">LIFE-EXPECTED RECOVERED</div><div class="cs">~ 14 min per avoided cigarette</div></div>
    <div class="ctr"><div class="cv">${mins >= 2880 ? (mins / 525949).toFixed(2) + " yr" : (mins / 1440).toFixed(1) + " d"}</div><div class="cl">MILESTONE ENGINE</div><div class="cs">${esc(quitMilestone(days))}</div></div>`;
  const ms = $("#qcMilestones");
  if (ms){
    ms.innerHTML = `<div class="qt">${QUIT_TIMELINE.map(t => {
      const d = quitMilestoneDays(t.t);
      const done = days >= d;
      return `<div class="ev${done ? " done" : ""}"><div class="yr">${esc(t.t)}</div><div class="tt">${esc(t.h)}</div><div class="td">${esc(t.d)}</div></div>`;
    }).join("")}</div>`;
  }
}
function quitMilestoneDays(t){
  if (t.includes("min")) return 20 / 1440;
  if (t.includes("hour")) return 0.5;
  if (t === "24 hours") return 1;
  if (t === "48 hours") return 2;
  if (t === "72 hours") return 3;
  if (t.includes("week")) return 21;
  if (t.includes("month")) return 30;
  if (t.includes("year")) return 365 * parseFloat(t);
  return 99999;
}
function quitMilestone(days){
  const next = QUIT_TIMELINE.map(t => ({ t:t.t, h:t.h, d:quitMilestoneDays(t.t) })).find(x => x.d > days);
  const last = QUIT_TIMELINE.map(t => ({ t:t.t, d:quitMilestoneDays(t.t) })).filter(x => x.d <= days).pop();
  return (last ? "Achieved: " + last.t + " ✓" : "First minutes count") + (next ? " · Next: " + next.t + " — " + next.h : " · All milestones achieved");
}

/* ── static panes ──────────────────────────────────────────────────────── */
function buildQuitTimeline(){
  $("#spane-quit").innerHTML = `
    <div class="grid g32">
      <div class="panel brk">
        <div class="panel-h"><div class="pt"><span data-ic="check"></span>BODY RECOVERY TIMELINE — FROM THE LAST CIGARETTE</div></div>
        <div class="panel-b"><div class="qt">${QUIT_TIMELINE.map(t => `
          <div class="ev"><div class="yr">${esc(t.t)}</div><div class="tt">${esc(t.h)}</div><div class="td">${esc(t.d)}</div></div>`).join("")}
        </div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="panel"><div class="panel-h"><div class="pt"><span data-ic="alert"></span>THE STAKES</div></div>
          <div class="panel-b"><p class="small muted" style="line-height:1.7">${esc(SMOKE_FACTS.headline)}</p>
          <p class="small muted" style="line-height:1.7;margin-top:8px">${esc(SMOKE_FACTS.attribution)}</p>
          <p class="small muted" style="line-height:1.7;margin-top:8px">${esc(SMOKE_FACTS.quitting)}</p></div></div>
        <div class="panel"><div class="panel-h"><div class="pt"><span data-ic="flame"></span>WHAT'S IN THE SMOKE</div></div>
          <div class="panel-b"><p class="small muted" style="line-height:1.7">${esc(SMOKE_FACTS.chem)}</p>
          <p class="small muted" style="line-height:1.7;margin-top:8px">${esc(SMOKE_FACTS.epidemic)}</p></div></div>
      </div>
    </div>`;
  hydrateIcons($("#spane-quit"));
}
function buildPharm(){
  $("#spane-pharm").innerHTML = `
    <div class="panel brk" style="margin-bottom:14px">
      <div class="panel-h"><div class="pt"><span data-ic="pill"></span>PHARMACOTHERAPY ARSENAL · ABSTINENCE EFFICACY</div><span class="chip">6 AGENTS/CLASSES</span></div>
      <div class="panel-b"><div class="grid g2">
        ${SMOKE_PHARM.map(p => `
          <div class="pharm">
            <div class="ph"><span data-ic="pill" style="color:var(--cyan)"></span>
              <div><div class="pn">${esc(p.name)}</div><div class="small muted">${esc(p.brand)} · ${esc(p.cls)}</div></div>
              <span class="eff">${esc(p.eff)}</span></div>
            <div class="pb">
              <h5>Dosing</h5><ul><li>${esc(p.dose)}</li></ul>
              <h5>Cautions</h5><ul><li><span class="rd">${esc(p.ci)}</span></li></ul>
              <h5>Side effects</h5><ul><li>${esc(p.ae)}</li></ul>
              <h5>Pearls</h5><ul><li><b>${esc(p.pearls)}</b></li></ul>
            </div>
          </div>`).join("")}
      </div></div>
    </div>`;
  hydrateIcons($("#spane-pharm"));
}
function buildProto(){
  $("#spane-proto").innerHTML = `
    <div class="grid g2" style="margin-bottom:14px">
      <div class="panel brk">
        <div class="panel-h"><div class="pt"><span data-ic="arrow"></span>THE 5 A's — EVERY VISIT</div></div>
        <div class="panel-b"><div class="tl">${FIVE_A.map((a, i) => `
          <div class="ev"><div class="yr">STEP ${i + 1} · ${a.k}</div><div class="td">${esc(a.d)}</div></div>`).join("")}</div></div>
      </div>
      <div class="panel brk">
        <div class="panel-h"><div class="pt"><span data-ic="brain"></span>THE 5 R's — FOR THE UNWILLING</div></div>
        <div class="panel-b"><div class="tl">${FIVE_R.map((a, i) => `
          <div class="ev"><div class="yr">STEP ${i + 1} · ${a.k}</div><div class="td">${esc(a.d)}</div></div>`).join("")}</div>
        <p class="small muted" style="margin-top:10px;line-height:1.6">Time-limited variant for busy clinics: <b>Ask–Advise–Refer</b> (2 A's + R) to a quitline (India: 1800-11-2356 · US: 1-800-QUIT-NOW) or text program — takes under a minute and still raises quit attempts.</p></div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-h"><div class="pt"><span data-ic="users"></span>SPECIAL POPULATIONS</div></div>
      <div class="panel-b"><div class="grid g2">
        ${SMOKE_SPECIAL.map(s => `<div class="ai-block"><b class="cy">${esc(s.p)}</b><p class="small muted" style="margin-top:4px;line-height:1.6">${esc(s.d)}</p></div>`).join("")}
      </div></div>
    </div>`;
  hydrateIcons($("#spane-proto"));
}
const ftndState = FTND.map(() => null);
function buildFtnd(){
  const el = $("#spane-ftnd");
  el.innerHTML = `
    <div class="grid g32">
      <div class="panel brk">
        <div class="panel-h"><div class="pt"><span data-ic="gauge"></span>FAGERSTRÖM TEST FOR NICOTINE DEPENDENCE (FTND)</div><span class="chip">MAX 10</span></div>
        <div class="panel-b">
          <div class="qlist">
            ${FTND.map((q, i) => `
              <div class="qrow"><div class="qq">${i + 1}. ${esc(q.q)}</div>
                <div class="qopts" data-ftnd="${i}">
                  ${q.opts.map(o => `<button class="qopt" data-v="${o[1]}">${esc(o[0])}<b>${o[1]}</b></button>`).join("")}
                </div></div>`).join("")}
          </div>
        </div>
      </div>
      <div>
        <div class="chartbox"><div class="ct">DEPENDENCE SCORE</div><canvas id="ftndG" height="140"></canvas></div>
        <div class="res info" id="ftndRes" style="margin-top:12px"></div>
        <div class="ai-block info" style="margin-top:12px"><b>Why it matters</b>
          <p class="small muted" style="margin-top:5px;line-height:1.6">Score ≥ 6 = high dependence → prefer varenicline or combination NRT (patch + short-acting) + intensive follow-up. Time-to-first-cigarette (question 1) alone is the best single-item proxy — ≤ 5 min marks severe dependence.</p></div>
      </div>
    </div>`;
  $$("#spane-ftnd .qopt").forEach(b => b.addEventListener("click", () => {
    const holder = b.closest(".qopts"); const i = +holder.getAttribute("data-ftnd");
    $$(".qopt", holder).forEach(x => x.classList.remove("on")); b.classList.add("on");
    ftndState[i] = +b.getAttribute("data-v");
    const total = ftndState.reduce((a, v) => a + (v || 0), 0);
    const answered = ftndState.filter(v => v !== null).length;
    const cls = total >= 6 ? "danger" : total >= 4 ? "warn" : "ok";
    const r = $("#ftndRes"); r.className = "res " + cls;
    r.innerHTML = `<div class="rh"><span class="rl">FTND · ${answered}/6 answered</span><span class="rv">${total}<small>/10</small></span></div>
      <div class="ri">${answered < 6 ? "Complete all six items." : total >= 6 ? "HIGH DEPENDENCE — varenicline or combination NRT + close follow-up" : total >= 4 ? "MODERATE DEPENDENCE — pharmacotherapy + behavioural support" : "LOW DEPENDENCE — behavioural support ± short-acting NRT"}</div>`;
    gauge($("#ftndG"), { value:answered ? total : null, min:0, max:10, h:140,
      zones:[{ to:4, color:"rgba(61,255,176,.75)", label:"low" }, { to:6, color:"rgba(255,180,84,.75)", label:"moderate" }, { to:10, color:"rgba(255,56,96,.8)", label:"high" }],
      unit:"points", label:"Fagerström FTND" });
  }));
}
function buildHarm(){
  $("#spane-harm").innerHTML = `
    <div class="panel brk">
      <div class="panel-h"><div class="pt"><span data-ic="alert"></span>SMOKING HARM MAP — ORGAN BY ORGAN</div><span class="chip danger">EVERY SYSTEM</span></div>
      <div class="panel-b">
        <div class="organgrid">
          ${SMOKE_HARMS.map(h => `<div class="organ"><div class="on"><span data-ic="alert"></span>${esc(h.organ)}</div><div class="od">${esc(h.d)}</div></div>`).join("")}
        </div>
      </div>
    </div>`;
  hydrateIcons($("#spane-harm"));
}
</script>
