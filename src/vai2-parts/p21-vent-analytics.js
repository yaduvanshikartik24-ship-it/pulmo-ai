<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-IV — WAVEFORM LAB · STATISTICAL ANALYTICS
   Exponential exhalation (linear + log-linear) · interactive mechanics
   z-score · compliance & resistance 95% CI forests · weaning/ARDS ROC ·
   ΔP mortality risk curve · log-log pathology mechanics map
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

/* respiratory mechanics by pathology: C [mL/cmH₂O], R [cmH₂O/L/s], n */
const VENT_MECH = [
  { id:"normal",    name:"Normal (intubated)", color:"#8fa3c8", n:40, C:[58, 12],  R:[7, 1.8] },
  { id:"ards_mild", name:"ARDS mild",          color:"#ffb454", n:55, C:[38, 8],   R:[8.2, 1.8] },
  { id:"ards_sev",  name:"ARDS severe",        color:"#ff3860", n:60, C:[27, 6],   R:[9, 2] },
  { id:"copd",      name:"COPD (emphysema)",   color:"#00e5ff", n:45, C:[88, 18],  R:[13.5, 3.2] },
  { id:"asthma",    name:"Asthma (acute)",     color:"#ff2d78", n:30, C:[55, 14],  R:[19, 6] },
  { id:"fibrosis",  name:"Pulmonary fibrosis", color:"#b18cff", n:25, C:[34, 9],   R:[7.5, 1.7] },
  { id:"obesity",   name:"Obesity / chest wall", color:"#3dffb0", n:35, C:[42, 10], R:[7, 1.6] },
];
const mechTau = m => m.R[0] * m.C[0] / 1000;    /* τ = R·C seconds */
const VENT_REF_M = { C:{ label:"Cstat", unit:"mL/cmH₂O", mean:58, sd:14, lo:0, hi:120 },
                     R:{ label:"Raw", unit:"cmH₂O/L/s", mean:7, sd:1.8, lo:0, hi:30 },
                     dp:{ label:"ΔP", unit:"cmH₂O", mean:12, sd:3, lo:0, hi:30 },
                     vtkg:{ label:"VT/kg PBW", unit:"mL/kg", mean:6.2, sd:0.9, lo:0, hi:14 } };
const VENT_ROC = [
  { id:"rsbi", label:"RSBI ≤ thresh", color:"#00e5ff", pts:[[.07, .48, "≤60"], [.27, .63, "≤75"], [.42, .77, "≤90"], [.58, .88, "≤105"], [.70, .94, "≤120"]] },
  { id:"dp",   label:"ΔP ≤ thresh (ARDS survival)", color:"#3dffb0", pts:[[.12, .52, "≤10"], [.25, .68, "≤13"], [.42, .82, "≤15"], [.60, .91, "≤18"], [.78, .97, "≤22"]] },
  { id:"vt",   label:"VT/kg ≤ thresh", color:"#ffb454", pts:[[.15, .30, "≤4"], [.30, .45, "≤5"], [.45, .58, "≤6"], [.58, .70, "≤7"], [.72, .82, "≤8"]] },
];

let ventAnxBuilt = false;
function buildVentAnalytics(){
  const el = $("#ventAnxMount"); if (!el || ventAnxBuilt) return;
  ventAnxBuilt = true;
  el.innerHTML = `
  <div class="vhead" style="margin-top:8px"><h2><span class="slash">▸</span> STATISTICAL ANALYTICS · NORMAL vs PATHOLOGY LUNGS</h2>
    <span class="sub">LOG · EXPONENTIAL · Z-SCORE · 95% CI · ROC — THE SAME MACHINERY AS THE PSG SUITE, TURNED ON THE VENTILATOR</span></div>
  <div class="anx-intro">
    <div class="ttl">FROM WAVEFORMS TO POPULATION STATISTICS</div>
    <p>The scalars above are one patient; the charts below place that patient among populations. Exhalation is a physical <b>exponential</b> (V = VT·e<sup>−t/τ</sup>, τ = R·C) — obstructive disease stretches τ four-fold and that is <b>why</b> auto-PEEP exists. Mechanics are compared as <b class="cy">z-scores</b> and <b class="cy">95% confidence intervals</b> across pathologies; the price of violating lung-protective thresholds is quantified with an illustrative <b>logistic risk curve</b> (Amato: ΔP outperformed VT and Pplat) and <b>ROC curves</b> for the weaning cutoffs you use daily.</p>
  </div>
  <div class="anxgrid">
    <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">EXPONENTIAL EXHALATION · V(t) = VT·e^(−t/τ)</span><span class="chip">τ = R·C</span></div>
      <div class="ab"><div class="chart-toggles"><span class="tg on" data-vaexp="lin">LINEAR V</span><span class="tg" data-vaexp="log">LOG-LINEAR ln V</span></div>
        <div class="chartbox"><canvas id="vax-exp" height="300"></canvas></div>
        <div class="eqline" id="vaxExpEq"></div>
        <p>Passive expiration empties the lung exponentially. At t = τ, <b>63.2%</b> of the tidal volume is out; <b>95% needs 3τ</b>. Normal intubated lungs (τ ≈ 0.4 s) empty in under a second — but COPD (τ ≈ 1.2 s) and acute asthma (τ ≈ 1.0 s) need 3–4 s. Set a rate faster than 3τ allows and the next breath traps its predecessor: <b class="mg">that is auto-PEEP, drawn as physics, not an alarm</b>. On the log-linear view each pathology becomes a straight line with slope −1/τ — the steeper, the faster the lung.</p></div>
    </div>
    <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">YOUR PATIENT AS A Z-SCORE</span><span class="chip">INTERACTIVE</span></div>
      <div class="ab">
        <div class="grid g2" style="gap:10px">
          <div>${fR("vaz_c", "Static compliance mL/cmH₂O", 10, 120, 1, 28, "")}</div>
          <div>${fR("vaz_r", "Airway resistance cmH₂O/L/s", 2, 30, .5, 8.5, "")}</div>
          <div>${fR("vaz_dp", "Driving pressure cmH₂O", 4, 30, .5, 18, "")}</div>
          <div>${fR("vaz_vt", "Tidal volume mL/kg PBW", 3, 12, .1, 6.5, "")}</div>
        </div>
        <div class="chartbox" style="margin-top:10px"><canvas id="vax-z"></canvas></div>
        <div id="vaxVerdict" style="margin-top:10px"></div>
        <p>Slide your patient's numbers and watch the z-bars migrate. A compliance of 28 sits at <b class="rd">z −2.1</b> (ARDS/fibrosis territory); resistance 8.5 is unremarkable; driving pressure 18 is <b class="am">z +2.0</b> — beyond the ≤ 15 ceiling that Amato's NEJM analysis nailed to survival. The ventilator displays numbers; this chart tells you how abnormal each one is.</p></div>
    </div>
    <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">STATIC COMPLIANCE · 95% CI FOREST</span><span class="chip">MEAN ± 1.96·SE</span></div>
      <div class="ab"><div class="chartbox"><canvas id="vax-c"></canvas></div>
        <p>Compliance — the slope of the P–V loop — separates the pathologies into families: the <b>stiff low-C family</b> (ARDS severe ≈ 27, fibrosis ≈ 34, obesity/chest wall ≈ 42) and the <b>flaccid high-C family</b> (emphysema ≈ 88 — the only common condition with compliance above normal). The 95% CIs barely overlap between severe ARDS and COPD: one glance at Cstat + the P–V loop's slope is a differential diagnosis.</p></div>
    </div>
    <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">AIRWAY RESISTANCE · 95% CI FOREST</span><span class="chip">INTUBATED</span></div>
      <div class="ab"><div class="chartbox"><canvas id="vax-r"></canvas></div>
        <p>Resistance lives in the airways, not the parenchyma: the parenchymal diseases (fibrosis, obesity) sit on the normal reference, while <b class="mg">acute asthma (≈ 19)</b> and <b class="cy">COPD (≈ 13.5)</b> tower above it. Combined with the compliance panel this is the two-axis mechanical fingerprint: asthma = high R + normal C; ARDS = normal R + low C; emphysema = high-ish R + high C.</p></div>
    </div>
    <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">ROC · WEANING & ARDS-SURVIVAL PREDICTORS</span><span class="chip">AUC RANKED</span></div>
      <div class="ab"><div class="chartbox"><canvas id="vax-roc" height="320"></canvas></div>
        <p>Three classic thresholds as full ROC curves. <b class="gr">Driving pressure</b> discriminates ARDS survival best (AUC ≈ 0.78 — Amato's 2015 finding that killed the VT-only dogma). The <b class="cy">RSBI ≤ 105</b> cut-off is a useful screen (AUC ≈ 0.77) but far from a verdict — which is why an SBT, not a number, decides extubation. <b class="am">VT/kg alone</b> hugs the diagonal (AUC ≈ 0.60): how big the breath is matters far less than how much pressure it costs.</p></div>
    </div>
    <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">DRIVING PRESSURE vs MORTALITY · LOGISTIC RISK CURVE</span><span class="chip">ILLUSTRATIVE</span></div>
      <div class="ab"><div class="chartbox"><canvas id="vax-risk" height="300"></canvas></div>
        <p>A logistic risk surface over ΔP: roughly a quarter of patients die below ΔP 10–12, and the curve then steepens through the protective ceiling — each cmH₂O above <b class="rd">15</b> buys measurable mortality (in ARDSnet-era analyses, ΔP > 15 carried roughly double the risk of ΔP ≤ 15). The clinical lever: at fixed VT, <b>raise PEEP to recruit</b> (raises Cstat, lowers ΔP) or <b>shrink VT</b> — but never trade ΔP for comfort.</p></div>
    </div>
  </div>
  <div class="anxcard"><div class="ah"><span class="ic" data-ic="chart"></span><span class="at">PATHOLOGY MECHANICS MAP · LOG–LOG</span><span class="chip">R vs C BOTH LOG</span></div>
    <div class="ab"><div class="chartbox"><canvas id="vax-map" height="340"></canvas></div>
    <p>The whole mechanical differential on one log–log plane: resistance on the x-axis, compliance on the y. The shaded cross marks the <b>normal intubated reference box</b> (±2 SD). Pathologies displace in characteristic vectors — ARDS and fibrosis drop vertically (pure compliance loss), asthma and COPD shift right (pure resistance), emphysema drifts up-right, obesity slides straight down. Two numbers place your patient on this map; the vector points at the disease family.</p></div>
  </div>`;
  hydrateIcons(el);
  $$("[data-vaexp]").forEach(b => b.addEventListener("click", () => {
    $$("[data-vaexp]").forEach(x => x.classList.toggle("on", x === b));
    drawVaExp(b.getAttribute("data-vaexp") === "log");
  }));
  [["vaz_c", "c"], ["vaz_r", "r"], ["vaz_dp", "dp"], ["vaz_vt", "vt"]].forEach(([id]) => {
    const r = $("#" + id); r.addEventListener("input", () => { $("#" + id + "v").textContent = r.value; drawVaZ(); });
  });
  drawVaExp(false); drawVaZ(); drawVaForest(); drawVaRoc(); drawVaRisk(); drawVaMap();
  regRedraw("wave", () => {
    if (!ventAnxBuilt) return;
    drawVaExp($("[data-vaexp].on") ? $("[data-vaexp].on").getAttribute("data-vaexp") === "log" : false);
    drawVaZ(); drawVaForest(); drawVaRoc(); drawVaRisk(); drawVaMap();
  });
}

/* 1 · exponential exhalation */
function drawVaExp(logLin){
  const VT = 450, tmax = 6;
  const series = VENT_MECH.map(m => {
    const tau = mechTau(m);
    const pts = [];
    for (let t = 0; t <= tmax; t += .05){
      const v = VT * Math.exp(-t / tau);
      pts.push([t, logLin ? Math.max(Math.log(v / VT), -6) : v]);
    }
    return { pts, color:m.color, label:m.name + " τ " + tau.toFixed(2) + "s" };
  });
  const annots = [];
  if (!logLin){
    annots.push({ x:0.41, y:VT * Math.exp(-1), text:"63.2% at t = τ", color:C.txt, bold:true, align:"left", dy:-8 });
    annots.push({ x:1.23, y:VT * Math.exp(-3), text:"95% at t = 3τ (normal)", color:C.txt, align:"left", dy:-8 });
  }
  plot2($("#vax-exp"), { h:300, xr:[0, tmax], yr:logLin ? [-6, .3] : [0, 470],
    series, annots,
    hlines:logLin ? [{ y:-1, color:"rgba(255,180,84,.5)", label:"ln(V/VT) = −1 → 63% emptied" }] : [{ y:450 * .368, color:"rgba(255,180,84,.5)", label:"63% emptied" }],
    legend:series.map(s => ({ label:s.label, color:s.color })),
    title:(logLin ? "LOG-LINEAR · ln(V/VT) — SLOPE = −1/τ" : "VOLUME REMAINING vs TIME · V(t) = VT·e^(−t/τ)"), xLabel:"seconds of expiration", yLabel:logLin ? "ln(V / VT)" : "volume mL" });
  $("#vaxExpEq").innerHTML = VENT_MECH.map(m => "<span style='color:" + m.color + "'>■</span> " + m.name + ": τ = " +
    m.R[0] + " × " + m.C[0] + "/1000 = <b>" + mechTau(m).toFixed(2) + " s</b> · 95% emptying needs " + (3 * mechTau(m)).toFixed(1) + " s").join(" &nbsp;·&nbsp; ");
}
/* 2 · interactive z-score */
function drawVaZ(){
  const c = +$("#vaz_c").value, r = +$("#vaz_r").value, dp = +$("#vaz_dp").value, vt = +$("#vaz_vt").value;
  const rows = [
    { label:"Cstat", unit:"mL/cmH₂O", ref:{ mean:VENT_REF_M.C.mean, sd:VENT_REF_M.C.sd }, groups:[{ color:C.cy, val:c }] },
    { label:"Raw", unit:"cmH₂O/L/s", ref:{ mean:VENT_REF_M.R.mean, sd:VENT_REF_M.R.sd }, groups:[{ color:C.cy, val:r }] },
    { label:"ΔP", unit:"cmH₂O", ref:{ mean:VENT_REF_M.dp.mean, sd:VENT_REF_M.dp.sd }, groups:[{ color:C.cy, val:dp }] },
    { label:"VT/kg PBW", unit:"mL/kg", ref:{ mean:VENT_REF_M.vtkg.mean, sd:VENT_REF_M.vtkg.sd }, groups:[{ color:C.cy, val:vt }] },
  ];
  zbarChart($("#vax-z"), { rows, zMax:4, title:"PATIENT vs INTUBATED-NORMAL REFERENCE (μ ± σ)" });
  const zc = (c - 58) / 14, zr = (r - 7) / 1.8, zd = (dp - 12) / 3, zv = (vt - 6.2) / 0.9;
  const cards = [];
  cards.push(resCard({ label:"Compliance " + c + " mL/cmH₂O (z " + (zc >= 0 ? "+" : "") + zc.toFixed(1) + ")", value:c, unit:"mL/cmH₂O",
    status:Math.abs(zc) < 1 ? "normal" : zc > 0 ? (zc > 2 ? "info" : "normal") : (zc < -2 ? "danger" : "caution"),
    interpretation:zc < -1 ? "Stiff lungs — ARDS / fibrosis / atelectasis / chest-wall family. Slope of the P–V loop flattens." : zc > 1 ? "Hypercompliant — emphysema pattern. Watch for over-distention at modest VT." : "Within the normal intubated band." }));
  cards.push(resCard({ label:"Resistance " + r + " cmH₂O/L/s (z " + (zr >= 0 ? "+" : "") + zr.toFixed(1) + ")", value:r, unit:"",
    status:zr < 1 ? "normal" : zr < 2 ? "caution" : "danger",
    interpretation:zr >= 2 ? "Obstructive physiology — bronchospasm, secretions, small ETT. Lengthen Te, lower rate, expect auto-PEEP." : "Airway resistance acceptable." }));
  cards.push(resCard({ label:"Driving pressure " + dp + " cmH₂O (z " + (zd >= 0 ? "+" : "") + zd.toFixed(1) + ")", value:dp, unit:"cmH₂O",
    status:dp <= 15 ? "normal" : dp <= 18 ? "caution" : "danger",
    interpretation:dp > 15 ? "Above the Amato ceiling — reduce VT or improve Cstat (recruitment/positioning) to pull ΔP ≤ 15." : "Inside the lung-protective envelope (ΔP ≤ 15)." }));
  cards.push(resCard({ label:"VT " + vt + " mL/kg PBW (z " + (zv >= 0 ? "+" : "") + zv.toFixed(1) + ")", value:vt, unit:"mL/kg",
    status:vt <= 8 && vt >= 4 ? "normal" : "caution",
    interpretation:vt > 8 ? "Exceeds 6–8 mL/kg PBW protective window — ARDSNet lineage: drop toward 6." : "Lung-protective range." }));
  $("#vaxVerdict").innerHTML = '<div class="grid g2">' + cards.join("") + "</div>";
}
/* 3+4 · compliance & resistance forests */
function drawVaForest(){
  const mk = (key, zones, lo, hi, title) => {
    const groups = VENT_MECH.map(m => {
      const [mean, sd] = m[key];
      return { label:m.name, color:m.color, mean, lo:mean - ciOf(mean, sd, m.n), hi:mean + ciOf(mean, sd, m.n) };
    });
    const mn = Math.min(lo, ...groups.map(g => g.lo - 2)), mx = Math.max(hi, ...groups.map(g => g.hi + 2));
    forestChart($(key === "C" ? "#vax-c" : "#vax-r"),
      [{ label:key === "C" ? "Cstat" : "Raw", unit:key === "C" ? "mL/cmH₂O" : "cmH₂O/L/s", min:mn, max:mx,
        zones:zones.map(z => ({ from:z[0], to:z[1], color:z[3], label:z[2] })), groups }],
      { rowH:132, gut:148, title });
  };
  mk("C", [[0, 25, "SEVERELY REDUCED", "rgba(255,56,96,.13)"], [25, 35, "REDUCED", "rgba(255,180,84,.11)"], [35, 70, "NORMAL (INTUBATED)", "rgba(61,255,176,.10)"], [70, 120, "HYPERCOMPLIANT", "rgba(177,140,255,.11)"]], 0, 120,
    "STATIC COMPLIANCE BY PATHOLOGY · 95% CI");
  mk("R", [[0, 10, "NORMAL", "rgba(61,255,176,.10)"], [10, 15, "ELEVATED", "rgba(255,180,84,.11)"], [15, 25, "SEVERE OBSTRUCTION", "rgba(255,56,96,.13)"], [25, 32, "EXTREME", "rgba(255,45,120,.15)"]], 0, 32,
    "AIRWAY RESISTANCE BY PATHOLOGY · 95% CI (INTUBATED)");
}
/* 5 · ROC */
function drawVaRoc(){
  rocChart($("#vax-roc"), VENT_ROC, { h:320, title:"PREDICTING WEANING SUCCESS / ARDS SURVIVAL" });
}
/* 6 · ΔP risk curve */
function drawVaRisk(){
  const pts = []; for (let d = 4; d <= 26; d += .25) pts.push([d, 24 + 46 / (1 + Math.exp(-(d - 15.5) / 2.3))]);
  const annots = [{ x:15, y:24 + 46 / (1 + Math.exp(-(-0.5) / 2.3)), text:"ΔP 15 — protective ceiling", color:C.rd, bold:true, align:"left", dy:14 }];
  plot2($("#vax-risk"), { h:300, xr:[4, 26], yr:[10, 80],
    series:[{ pts, color:"#ff3860", w:2.6 }], annots,
    bands:[{ x0:4, x1:15, color:"rgba(61,255,176,.07)", label:"PROTECTIVE ZONE" }],
    vlines:[{ x:15, color:"rgba(255,56,96,.6)", label:"Amato ceiling" }],
    hlines:[{ y:40, color:"rgba(130,152,189,.4)", label:"40%" }],
    legend:[{ label:"illustrative logistic composite", color:"#ff3860" }],
    title:"ILLUSTRATIVE MORTALITY RISK vs DRIVING PRESSURE · ARDS", xLabel:"ΔP = Pplat − PEEPtot cmH₂O", yLabel:"mortality %" });
}
/* 7 · log-log mechanics map */
function drawVaMap(){
  const pts = VENT_MECH.map(m => ({ x:m.R[0], y:m.C[0], color:m.color, label:m.name.split(" ")[0], size:5 }));
  const ref = VENT_MECH[0];
  plot2($("#vax-map"), { h:340, logX:true, logY:true, xr:[4, 26], yr:[18, 120],
    bands:[{ x0:ref.R[0] - 2 * ref.R[1], x1:ref.R[0] + 2 * ref.R[1], color:"rgba(143,163,200,.10)" },
           { y0:ref.C[0] - 2 * ref.C[1], y1:ref.C[0] + 2 * ref.C[1], color:"rgba(143,163,200,.10)" }],
    points:pts,
    legend:VENT_MECH.map(m => ({ label:m.name.split(" (")[0], color:m.color })),
    title:"RESISTANCE vs COMPLIANCE · BOTH LOG · NORMAL = ±2 SD CROSS", xLabel:"Raw cmH₂O/L/s", yLabel:"Cstat mL/cmH₂O" });
}
</script>
