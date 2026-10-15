<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-IV — PSG ANALYTICS TAB
   Normal-vs-disorder statistical suite: z-score matrix · 95% CI forest ·
   log-scale EEG spectra · exponential desaturation kinetics · ROC ·
   Bland–Altman · correlation · overnight trend with CI band · hypnogram atlas
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";
let paxSel = ["osa-severe", "csa"];
const PAX_MAX = 4;

function paxGroups(){ return paxSel.map(psgGroup).filter(Boolean); }

const PSG_ZONE_DEFS = {
  ahi:   [[0, 5, "NORMAL", "rgba(61,255,176,.10)"], [5, 15, "MILD", "rgba(255,180,84,.10)"], [15, 30, "MOD", "rgba(255,120,80,.12)"], [30, 70, "SEVERE", "rgba(255,56,96,.13)"]],
  ai:    [[0, 15, "OK", "rgba(61,255,176,.10)"], [15, 30, "ELEVATED", "rgba(255,180,84,.10)"], [30, 60, "HIGH", "rgba(255,56,96,.12)"]],
  plmi:  [[0, 15, "OK", "rgba(61,255,176,.10)"], [15, 50, "HIGH", "rgba(255,56,96,.12)"]],
  nadir: [[70, 85, "SEVERE DIP", "rgba(255,56,96,.13)"], [85, 90, "MILD DIP", "rgba(255,180,84,.11)"], [90, 100, "OK", "rgba(61,255,176,.10)"]],
  se:    [[40, 75, "POOR", "rgba(255,56,96,.12)"], [75, 85, "BORDERLINE", "rgba(255,180,84,.10)"], [85, 100, "OK", "rgba(61,255,176,.10)"]],
  n3:    [[0, 8, "BLUNTED", "rgba(255,56,96,.12)"], [8, 13, "LOW", "rgba(255,180,84,.10)"], [13, 35, "OK", "rgba(61,255,176,.10)"]],
  rem:   [[0, 15, "LOW", "rgba(255,180,84,.10)"], [15, 40, "OK", "rgba(61,255,176,.10)"]],
  sl:    [[0, 20, "OK", "rgba(61,255,176,.10)"], [20, 45, "PROLONGED", "rgba(255,180,84,.10)"], [45, 80, "INSOMNIA-RANGE", "rgba(255,56,96,.12)"]],
  reml:  [[0, 15, "SOREMP", "rgba(255,45,120,.14)"], [15, 60, "SHORT", "rgba(255,180,84,.08)"], [60, 120, "OK", "rgba(61,255,176,.10)"], [120, 220, "DELAYED", "rgba(255,180,84,.10)"]],
};

function buildPsgAnalyticsPane(){
  const el = $("#spane-anx"); if (!el) return;
  const chips = PSG_GROUPS.filter(g => g.id !== "normal").map(g =>
    `<button class="qchip${paxSel.indexOf(g.id) >= 0 ? " on" : ""}" data-pax="${g.id}"${paxSel.indexOf(g.id) >= 0 ? " style='color:var(--cyan);border-color:var(--line2)'" : ""}><i style="background:${g.color};width:8px;height:8px;border-radius:2px;display:inline-block;margin-right:5px"></i>${esc(g.name)}</button>`).join("");
  el.innerHTML = `
    <div class="anx-intro">
      <div class="ttl">STATISTICAL BATTLEFIELD · NORMAL POPULATION vs SLEEP DISORDERS</div>
      <p>Every chart below holds the <b>normal reference population</b> fixed and asks the same question nine ways: <b>how far does this disorder drift from normal, in which metric, and with what certainty?</b> Distances are expressed as <b class="cy">z-scores</b>, uncertainty as <b class="cy">95% confidence intervals</b>, spectral signatures on <b class="cy">logarithmic axes</b>, desaturation shape as <b class="cy">exponential kinetics (τ)</b>, and diagnostic performance as <b class="cy">ROC curves</b>. Group values are illustrative literature composites for education — not for scoring real patients.</p>
    </div>
    <div class="anx-controls" id="paxCtl">
      <span class="lbl">COMPARE vs NORMAL</span>${chips}
      <span class="chip" style="margin-left:auto">${paxSel.length}/${PAX_MAX} SELECTED</span>
    </div>
    <div class="anxgrid">
      <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">Z-SCORE MATRIX</span><span class="chip">|z| ≥ 2 = ABNORMAL</span></div>
        <div class="ab"><div class="chartbox"><canvas id="pax-z"></canvas></div>
        <p>Each bar is a disorder's group mean converted to <b>z = (value − μ) / σ</b> of the normal reference population. Green sits inside ±1σ, teal reaches ±2σ, amber ±3σ, red beyond. Notice the fingerprint: <b class="mg">severe OSA</b> lives at z +40 on AHI but z −7 on N3 share; <b class="cy">insomnia</b> is normal on every respiratory metric and only surfaces on sleep latency (+4.9) and efficiency (−5.6); <b class="gr">narcolepsy</b> is the only disorder with a <b>negative</b> REM-latency z (−3.1 — REM arriving at the front door).</p></div>
      </div>
      <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">95% CONFIDENCE INTERVAL FOREST</span><span class="chip">MEAN ± 1.96·SE</span></div>
        <div class="ab"><div class="chartbox"><canvas id="pax-ci"></canvas></div>
        <p>Group means with their <b>95% CIs</b> (mean ± 1.96 SD/√n) over clinical severity zones. Where a disorder's whiskers clear the normal zone boundary entirely, the separation is statistically unambiguous — e.g., OSA nadir SpO₂ (78%, CI 76.7–79.3) vs the normal 90% floor. Where whiskers overlap the boundary, the metric alone cannot adjudicate — which is exactly why PSG reports a battery, not a single number.</p></div>
      </div>
      <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">EEG SPECTRAL POWER</span><span class="chip">LOG AXIS</span></div>
        <div class="ab"><div class="chart-toggles"><span class="tg on" data-paxeeg="log">LOG Y</span><span class="tg" data-paxeeg="lin">LINEAR Y</span></div>
        <div class="chartbox"><canvas id="pax-eeg" height="290"></canvas></div>
        <p>Band power in µV² spans three orders of magnitude — a <b>logarithmic y-axis</b> is the only way delta (hundreds of µV²) and beta (single digits) share one plot. Read the pathologies: <b class="rd">OSA</b> loses delta power (fragmented N3) and gains alpha (arousal intrusion); <b class="cy">insomnia</b> carries the highest alpha and beta of the set — the EEG signature of cortical hyperarousal; <b class="gr">narcolepsy</b> degrades delta while theta dominates (shallow, REM-prone sleep).</p></div>
      </div>
      <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">DESATURATION KINETICS · EXPONENTIAL FIT</span><span class="chip">SpO₂(t) MODEL</span></div>
        <div class="ab"><div class="chart-toggles"><span class="tg on" data-paxdes="lin">LINEAR</span><span class="tg" data-paxdes="log">LOG Y</span></div>
        <div class="chartbox"><canvas id="pax-des" height="300"></canvas></div>
        <div class="eqline" id="paxDesEq"></div>
        <p>One respiratory event, modelled physically: an ~8-s lung→oximeter circulation lag, then exponential decay <b>SpO₂(t) = 97 − D·(1 − e^(−t/τ↓))</b> to a nadir, then exponential recovery with τ↑. The time constants are the diagnosis's fingerprint — <b class="mg">severe OSA</b>: τ↓ 7 s, deep nadir 84.9%; <b class="vt">CSA</b>: faster recovery (τ↑ 6 s, no obstruction to re-open); <b class="am">OHS</b>: the slowest recovery (τ↑ 11 s) because stores must refill against hypoventilation. On log-y the early decay segments straighten — slope = −1/τ.</p></div>
      </div>
      <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">ROC · DIAGNOSTIC DISCRIMINATION</span><span class="chip">AASM AHI ≥ 15/hr</span></div>
        <div class="ab"><div class="chartbox"><canvas id="pax-roc" height="320"></canvas></div>
        <p>How well do surrogate tests detect PSG-confirmed moderate-severe OSA? The <b>home-sleep-apnea-test AHI</b> hugs the top-left corner (AUC ≈ 0.90) — it counts the same events with fewer channels. Oximetry-derived <b>ODI</b> follows (≈ 0.85): desats are downstream but still discriminant. The <b>snore index</b> drags near the diagonal (≈ 0.65) — snoring is common in normal sleepers too, so it raises suspicion without confirming anything. Threshold markers show where each test trades sensitivity for specificity.</p></div>
      </div>
      <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">AGREEMENT · HSAT vs PSG AHI</span><span class="chip">BLAND–ALTMAN</span></div>
        <div class="ab"><div class="chartbox"><canvas id="pax-ba" height="290"></canvas></div>
        <p>Two methods, one patient: each dot is a night. The <b>bias line</b> (HSAT − PSG ≈ −3.2/hr) says home testing systematically under-counts — no flow limitation, no cortical arousals, fewer channels. The <b>±1.96 SD limits of agreement</b> (±11/hr) are wide: an individual HSAT can miss or exaggerate by double digits, which is why HSAT is reserved for high-pretest-probability OSA without comorbidity suspicion.</p></div>
      </div>
      <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">CORRELATION · HSAT vs PSG</span><span class="chip">r ≈ 0.88</span></div>
        <div class="ab"><div class="chartbox"><canvas id="pax-corr" height="290"></canvas></div>
        <p>The same pairs on a scatter with the identity line: strong monotone agreement (r ≈ 0.88) — high HSAT values track high PSG values. But correlation ≠ agreement: points sit systematically <b>below</b> the identity line (the negative bias from the Bland–Altman panel), and dispersion widens in the 20–40/hr band where hypopnea definitions and desaturation criteria diverge most between devices.</p></div>
      </div>
      <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">OVERNIGHT SpO₂ TREND · 95% CI BAND</span><span class="chip">8 HOURS</span></div>
        <div class="ab"><div class="chartbox"><canvas id="pax-trend" height="300"></canvas></div>
        <p>The shaded band is the <b>normal population's hourly mean ± 95% CI</b> — where a healthy sleeper's oximetry lives all night. Disorder trajectories tell stories: <b class="rd">severe OSA</b> oscillates below band with REM-period dives (marked); <b class="am">OHS</b> walks monotonically downhill as recumbent hypoventilation compounds hour by hour — the classic saw-tooth-free decline; <b class="cy">insomnia</b> rides dead-center inside the band: severe complaint, pristine physiology.</p></div>
      </div>
    </div>
    <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">8-HOUR HYPNOGRAM ATLAS · NORMAL vs DISORDERS</span><span class="chip">SAME TIMEBASE</span></div>
      <div class="ab"><div class="chartbox"><canvas id="pax-hyp"></canvas></div>
      <p>Whole-night architecture, compressed to one glance. <b>Normal</b> shows textbook ultradian cycling with deepening N3 early and lengthening REM late. Against it: <b class="rd">severe OSA's</b> shredded, Wake-stitched profile that never consolidates N3; <b class="cy">insomnia's</b> long dark onset latency and repeated returns to Wake; <b class="gr">narcolepsy's</b> REM parked minutes after sleep onset. Tick marks are respiratory events (magenta) or limb movements (green) — watch OSA's dust-storm density against normal's near-empty night.</p></div>
    </div>`;
  hydrateIcons(el);
  $$("#paxCtl [data-pax]").forEach(b => b.addEventListener("click", () => {
    const id = b.getAttribute("data-pax");
    const ix = paxSel.indexOf(id);
    if (ix >= 0){ if (paxSel.length > 1) paxSel.splice(ix, 1); }
    else { if (paxSel.length >= PAX_MAX) paxSel.shift(); paxSel.push(id); }
    $$("#paxCtl [data-pax]").forEach(x => {
      const on = paxSel.indexOf(x.getAttribute("data-pax")) >= 0;
      x.classList.toggle("on", on); x.style.cssText = on ? "color:var(--cyan);border-color:var(--line2)" : "";
    });
    $("#paxCtl .chip").textContent = paxSel.length + "/" + PAX_MAX + " SELECTED";
    renderPsgAnalytics();
  }));
  $$("[data-paxeeg]").forEach(b => b.addEventListener("click", () => {
    $$("[data-paxeeg]").forEach(x => x.classList.toggle("on", x === b));
    drawPaxEeg(b.getAttribute("data-paxeeg") === "log");
  }));
  $$("[data-paxdes]").forEach(b => b.addEventListener("click", () => {
    $$("[data-paxdes]").forEach(x => x.classList.toggle("on", x === b));
    drawPaxDesat(b.getAttribute("data-paxdes") === "log");
  }));
  renderPsgAnalytics();
  regRedraw("sleep", () => { if ($("#spane-anx") && $("#spane-anx").classList.contains("on")) renderPsgAnalytics(); });
}

function renderPsgAnalytics(){
  if (!$("#pax-z")) return;
  drawPaxZ(); drawPaxCi(); drawPaxEeg($("[data-paxeeg].on") ? $("[data-paxeeg].on").getAttribute("data-paxeeg") === "log" : true);
  drawPaxDesat($("[data-paxdes].on") ? $("[data-paxdes].on").getAttribute("data-paxdes") === "log" : false);
  drawPaxRoc(); drawPaxBa(); drawPaxCorr(); drawPaxTrend(); drawPaxHyp();
}

/* 1 · z-score matrix */
function drawPaxZ(){
  const rows = Object.keys(PSG_REF).map(id => {
    const r = PSG_REF[id];
    return { label:r.label, unit:r.unit, ref:{ mean:r.mean, sd:r.sd },
      groups:paxGroups().map(g => ({ label:g.name, color:g.color, val:g.v[id][0] })) };
  });
  zbarChart($("#pax-z"), { rows, zMax:45, title:"GROUP MEAN AS Z-SCORE vs NORMAL REFERENCE (μ ± σ)" });
}
/* 2 · forest 95% CI */
function drawPaxCi(){
  const sel = paxGroups();
  const rows = Object.keys(PSG_REF).map(id => {
    const r = PSG_REF[id];
    const allG = [{ label:"Normal", color:"#8fa3c8", mean:r.mean, lo:r.mean - ciOf(r.mean, r.sd, 40), hi:r.mean + ciOf(r.mean, r.sd, 40) }];
    sel.forEach(g => { const [m, sd] = g.v[id]; allG.push({ label:g.name, color:g.color, mean:m, lo:m - ciOf(m, sd, g.n), hi:m + ciOf(m, sd, g.n) }); });
    const lo = Math.min(r.lo, ...allG.map(g => g.lo - (r.hi - r.lo) * 0.04));
    const hi = Math.max(r.hi, ...allG.map(g => g.hi + (r.hi - r.lo) * 0.04));
    return { label:r.label, unit:r.unit, min:lo, max:hi, zones:(PSG_ZONE_DEFS[id] || []).map(z => ({ from:Math.max(lo, z[0]), to:Math.min(hi, z[1]), color:z[3], label:z[2] })), groups:allG };
  });
  forestChart($("#pax-ci"), rows, { rowH:56, title:"GROUP MEANS WITH 95% CI OVER CLINICAL SEVERITY ZONES" });
}
/* 3 · EEG spectra (log/linear) */
function drawPaxEeg(logY){
  const ids = ["normal", ...paxSel].filter(id => PSG_EEG.find(g => g.id === id));
  const series = ids.map(id => {
    const g = PSG_EEG.find(x => x.id === id);
    return { color:g.color, label:(psgGroup(id) || { name:id }).name,
      pts:PSG_EEG_BANDS.map((b, i) => [i + 1, Math.max(g.vals[i], 0.8)]) , dots:true };
  });
  plot2($("#pax-eeg"), { h:290, logY:!!logY, xr:[0.6, 5.6], yr:logY ? [1, 500] : [0, 380],
    series, legend:series.map(s => ({ label:s.label, color:s.color })),
    title:"EEG BAND POWER · N3 (INSOMNIA: N2)" + (logY ? " · LOG SCALE" : ""),
    xLabel:"band", yLabel:"µV²",
    annots:PSG_EEG_BANDS.map((b, i) => ({ x:i + 1, y:1, dy:250, text:b[1], color:C.txt })) });
}
/* 4 · desaturation kinetics */
function drawPaxDesat(logY){
  const ids = ["normal", ...paxSel].filter(id => PSG_DESAT.find(g => g.id === id));
  const groups = ids.map(id => PSG_DESAT.find(x => x.id === id));
  const series = groups.map(g => {
    const pts = []; for (let t = 0; t <= 62; t += .5) pts.push([t, Math.max(desatCurve(g, t), 60)]);
    return { color:g.color, label:(psgGroup(g.id) || { name:g.id }).name, pts };
  });
  const annots = [];
  groups.forEach(g => {
    const nad = desatNadir(g);
    annots.push({ x:8 + g.dur, y:nad, text:"nadir " + nad.toFixed(1) + "%", color:g.color, align:"left", dy:12, bold:true });
  });
  plot2($("#pax-des"), { h:300, logY:!!logY, xr:[0, 62], yr:logY ? [70, 100] : [76, 100],
    series, annots,
    vlines:[{ x:8, color:"rgba(130,152,189,.6)", label:"circulation lag 8 s" }],
    hlines:[{ y:90, color:"rgba(255,180,84,.55)", label:"90% threshold" }],
    legend:series.map(s => ({ label:s.label, color:s.color })),
    title:"EVENT SpO₂ KINETICS · 97 − D·(1 − e^(−t/τ↓)) THEN e^(−t/τ↑)", xLabel:"seconds from event onset", yLabel:"SpO₂ %" });
  $("#paxDesEq").innerHTML = groups.map(g => "<span style='color:" + g.color + "'>■</span> " +
    (psgGroup(g.id) || { name:g.id }).name + ": D " + g.depth + " · τ↓ " + g.tDown + "s · τ↑ " + g.tUp + "s · event " + g.dur + "s (" + g.note + ")").join(" &nbsp;·&nbsp; ");
}
/* 5 · ROC */
function drawPaxRoc(){
  rocChart($("#pax-roc"), PSG_ROC, { h:320, title:"DETECTING PSG-AHI ≥ 15/hr · SENSITIVITY vs 1−SPECIFICITY" });
}
/* 6 · Bland–Altman */
function drawPaxBa(){
  const pts = [];
  for (let i = 0; i < 52; i++){
    const mean = 3 + phash(i * 17 + 5) * 62;
    const diff = -3.2 + (phash(i * 31 + 9) + phash(i * 47 + 13) - 1) * 5.8;
    pts.push([mean, diff]);
  }
  baChart($("#pax-ba"), { pts, bias:-3.2, loa:[-14.6, 8.2], h:290,
    title:"BLAND–ALTMAN · HSAT vs PSG APNEA-HYPAPNEA INDEX", xLabel:"mean of both methods (AHI/hr)", yLabel:"HSAT − PSG (AHI/hr)" });
}
/* 7 · correlation */
function drawPaxCorr(){
  const pts = [];
  for (let i = 0; i < 52; i++){
    const psgv = 3 + phash(i * 23 + 3) * 62;
    const noise = (phash(i * 37 + 11) + phash(i * 53 + 7) - 1) * 9;
    pts.push({ x:psgv, y:Math.max(0, psgv - 3.2 + noise), color:"rgba(0,229,255,.8)", size:3 });
  }
  const idline = []; for (let v = 0; v <= 65; v += 5) idline.push([v, v]);
  const reg = []; for (let v = 0; v <= 65; v += 5) reg.push([v, Math.max(0, -3.2 + 0.94 * v)]);
  plot2($("#pax-corr"), { h:290, xr:[0, 66], yr:[0, 66],
    series:[{ pts:idline, color:"rgba(130,152,189,.6)", dash:[5, 4], label:"identity", glow:false },
            { pts:reg, color:C.tl, dash:[2, 3], label:"regression", glow:false }],
    points:pts,
    legend:[{ label:"identity", color:"rgba(130,152,189,.7)" }, { label:"fit: y = 0.94x − 3.2", color:C.tl }],
    title:"HSAT vs PSG AHI · r ≈ 0.88 · SYSTEMATIC UNDER-COUNT", xLabel:"PSG AHI /hr", yLabel:"HSAT AHI /hr" });
}
/* 8 · overnight trend + CI band */
function drawPaxTrend(){
  const hrs = [], bandT = [], bandB = [], line = [];
  for (let i = 0; i <= 8; i += .5){
    const h = i;
    hrs.push(h);
    bandT.push([h, 96.2 + 0.55 + 0.4 * Math.sin(i)]);
    bandB.push([h, 96.2 - 0.55 - 0.4 * Math.cos(i * .9)]);
    line.push([h, 96.2 + 0.18 * Math.sin(i * 2)]);
  }
  const series = [{ pts:line, color:"#8fa3c8", dash:[2, 3], w:1.5 }];
  const annots = [];
  PSG_TREND.forEach(t => {
    if (paxSel.indexOf(t.id) < 0) return;
    const pts = t.v.map((v, i) => [i, v]);
    series.push({ pts, color:t.color, w:2.4, label:(psgGroup(t.id) || { name:t.id }).name });
    t.rem.forEach(h => annots.push({ x:h, y:82.5, text:"REM", color:t.color, bold:true }));
  });
  plot2($("#pax-trend"), { h:300, xr:[0, 8], yr:[82, 98],
    areas:[{ top:bandT, bot:bandB, color:"rgba(143,163,200,.16)", edge:"rgba(143,163,200,.35)" }],
    series, annots,
    hlines:[{ y:90, color:"rgba(255,180,84,.5)", label:"90% hypoxemia line" }],
    legend:[{ label:"normal 95% CI band", color:"#8fa3c8" }, ...series.slice(1).map(s => ({ label:s.label || "", color:s.color }))],
    title:"HOURLY MEAN SpO₂ · NORMAL 95% CI BAND vs DISORDER TRAJECTORIES", xLabel:"hours into the study", yLabel:"SpO₂ %" });
}
/* 9 · hypnogram atlas */
function drawPaxHyp(){
  const panels = [{ label:"NORMAL", color:"#8fa3c8", gid:"normal" }];
  paxGroups().slice(0, PAX_MAX).forEach(g => panels.push({ label:g.name.toUpperCase(), color:g.color, gid:g.id }));
  const built = panels.map(p => {
    const h = genHypno(p.gid, 480);
    const g = psgGroup(p.gid) || { v:{}, n:"" };
    return { label:p.label, color:p.color, segs:h.segs, events:h.events, evColor:h.evColor,
      sub:"AHI " + (g.v.ahi ? g.v.ahi[0] : "—") + " · SE " + (g.v.se ? g.v.se[0] : "—") + "%" };
  });
  hypnoAtlas($("#pax-hyp"), built, 480);
}
</script>
