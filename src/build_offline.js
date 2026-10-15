/* Build script: assembles the single-file offline PULMO AI (MK-VII).
   - base64-inlines the 13 lecture figures
   - concatenates CSS parts + body + engine bundle + app scripts (vent + sleep + smoke + guidelines + compare + analytics + synapse + pleural + PDF engine)
   - syntax-checks every app script block
   - writes PULMO-AI.html at the repo root
   Run: node src/build_offline.js  (from the repo root) */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const PARTS = path.join(ROOT, "src/vai2-parts");
const read = f => fs.readFileSync(path.join(PARTS, f), "utf8");

/* 1. inline images */
const gfxDir = path.join(ROOT, "public/ventilator-graphics");
const imgs = {};
fs.readdirSync(gfxDir).forEach(f => {
  if (/\.(png|jpg|jpeg)$/i.test(f)) {
    const key = "/ventilator-graphics/" + f;
    const mime = f.endsWith(".png") ? "image/png" : "image/jpeg";
    imgs[key] = "data:" + mime + ";base64," + fs.readFileSync(path.join(gfxDir, f)).toString("base64");
  }
});
const imgJs = "<script>\n/* embedded lecture figures (base64) */\nconst VAI_IMG = " + JSON.stringify(imgs) + ";\n</script>\n";
console.log("images inlined:", Object.keys(imgs).length);

/* 2. assemble */
const bundle = fs.readFileSync(path.join(ROOT, "src/vai-engine.bundle.js"), "utf8");
const html = [
  read("p01-css-a.html"), read("p01-css-b.html"), read("p01c-css-pulmo.html"), read("p17-mk4-css.html"),
  "<style>\n" + read("p22-mkv-css.html") + "\n</style>\n",
  read("p23-pleural-css.html"),
  read("p02-body.html"),
  "<script>\n" + bundle + "\n</script>\n",
  imgJs,
  read("p03-app-data.js"), read("p04-app-core.js"), read("p24-pdf-engine.js"), read("p05-app-ui.js"),
  read("p06-app-calc-a.js"), read("p06-app-calc-b.js"), read("p07-app-wave.js"),
  read("p08-app-ai.js"),
  read("p10-sleep-data.js"), read("p11-psg-engine.js"), read("p18-psg-scen2.js"),
  read("p12-smoke-data.js"), read("p13a-guide-data.js"), read("p13b-guide-data.js"),
  read("p19-stats-engine.js"), read("p20-psg-analytics.js"), read("p21-vent-analytics.js"),
  read("p22a-syn-core.js"), read("p22b-vent-consult.js"), read("p22c-sleep-consult.js"), read("p22d-syn-ui.js"),
  read("p23a-pleural-data.js"), read("p23b-pleural-calc.js"), read("p23b2-pleural-calc2.js"),
  read("p23c-pleural-consult.js"), read("p23f-pleural-adv.js"),
  read("p14-sleep-ui.js"), read("p15-smoke-ui.js"), read("p16-guide-ui.js"),
  read("p23d-pleural-ui.js"), read("p23e-pleural-ui2.js"),
  read("p09-app-init.js"),
  "</body>\n</html>\n",
].join("\n");

/* 3. syntax-check each app script block (skip bundle + images) */
const appParts = ["p03-app-data.js", "p04-app-core.js", "p05-app-ui.js", "p06-app-calc-a.js",
  "p24-pdf-engine.js", "p06-app-calc-b.js", "p07-app-wave.js", "p08-app-ai.js",
  "p10-sleep-data.js", "p11-psg-engine.js", "p18-psg-scen2.js", "p12-smoke-data.js", "p13a-guide-data.js",
  "p13b-guide-data.js", "p19-stats-engine.js", "p20-psg-analytics.js", "p21-vent-analytics.js",
  "p22a-syn-core.js", "p22b-vent-consult.js", "p22c-sleep-consult.js", "p22d-syn-ui.js",
  "p23a-pleural-data.js", "p23b-pleural-calc.js", "p23b2-pleural-calc2.js", "p23c-pleural-consult.js", "p23f-pleural-adv.js",
  "p14-sleep-ui.js", "p15-smoke-ui.js", "p16-guide-ui.js",
  "p23d-pleural-ui.js", "p23e-pleural-ui2.js", "p09-app-init.js"];
let bad = 0;
for (const f of appParts) {
  let src = read(f).replace(/^<script>/, "").replace(/<\/script>\s*$/, "");
  try { new Function(src); console.log("SYNTAX OK  ", f); }
  catch (e) { bad++; console.error("SYNTAX FAIL", f, "→", e.message); }
}
if (bad) { console.error(bad + " script(s) failed — aborting"); process.exit(1); }

/* 4. structural sanity */
const openTags = (html.match(/<script/g) || []).length;
const closeTags = (html.match(/<\/script>/g) || []).length;
console.log("script tags:", openTags, "open /", closeTags, "close");
if (openTags !== closeTags) { console.error("script tag mismatch"); process.exit(1); }
if (/<\/script/i.test(html.replace(/<\/script>/g, ""))) { console.error("stray </script found inside JS"); process.exit(1); }
const cdnRefs = html.slice(0, html.indexOf("</head>")).match(/https?:\/\/[^"'\s)]+/g) || [];
console.log("external refs in head/css:", cdnRefs.length, cdnRefs.slice(0, 5));

/* 5. write output */
fs.writeFileSync(path.join(ROOT, "PULMO-AI.html"), html);
console.log("WROTE PULMO-AI.html —", (html.length / 1024 / 1024).toFixed(2), "MB");
