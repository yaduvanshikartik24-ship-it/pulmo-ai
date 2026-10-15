<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI — GUIDELINE CORPUS VIEW (filterable accordion)
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

let guideTag = "All";
function buildGuidelinesView(){
  const tags = ["All", ...new Set([].concat(...GUIDELINES.map(g => g.tags)))];
  $("#guideFilter").innerHTML = tags.map(t =>
    `<button class="qchip${t === guideTag ? " on" : ""}" data-gt="${esc(t)}"${t === guideTag ? " style='color:var(--cyan);border-color:var(--line2)'" : ""}>${esc(t.toUpperCase())}</button>`).join("");
  $$("#guideFilter [data-gt]").forEach(b => b.addEventListener("click", () => { guideTag = b.getAttribute("data-gt"); buildGuidelinesView(); }));
  const list = GUIDELINES.filter(g => guideTag === "All" || g.tags.indexOf(guideTag) >= 0);
  $("#guideCount").textContent = `${list.length} OF ${GUIDELINES.length} GUIDELINE MODULES · ${tags.length - 1} DOMAINS · SOCIETY EDITIONS AS INDICATED`;
  $("#guideList").innerHTML = list.map(g => `
    <div class="gdl" id="gdl-${g.id}">
      <div class="gh" data-gdl="${g.id}">
        <div class="gic"><span data-ic="${g.ic}"></span></div>
        <div class="gt"><div class="gn">${esc(g.name)}</div><div class="gs">${esc(g.org)} · ${esc(g.upd)}</div></div>
        <div class="tags">${g.tags.map(t => `<span class="chip info">${esc(t.toUpperCase())}</span>`).join("")}</div>
        <span class="caret">▸</span>
      </div>
      <div class="gb">
        <div class="ai-block info" style="margin-top:14px">${esc(g.summ)}</div>
        ${g.sections.map(s => `<h4>${esc(s.h)}</h4><div>${s.html}</div>`).join("")}
        <h4>Field pearls</h4>
        <ul class="checks">${g.pearls.map(p => `<li class="good">${esc(p)}</li>`).join("")}</ul>
      </div>
    </div>`).join("");
  $$("#guideList .gh").forEach(h => h.addEventListener("click", () => {
    const card = $("#gdl-" + h.getAttribute("data-gdl"));
    card.classList.toggle("open");
  }));
  hydrateIcons($("#guideList"));
}
function openGuideline(id){
  gotoView("guide");
  const g = GUIDELINES.find(x => x.id === id); if (!g) return;
  if (guideTag !== "All" && g.tags.indexOf(guideTag) < 0){ guideTag = "All"; buildGuidelinesView(); }
  const card = $("#gdl-" + id); if (!card) return;
  card.classList.add("open"); card.scrollIntoView({ behavior:"smooth", block:"start" });
}
</script>
