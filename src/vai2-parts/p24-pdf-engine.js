<script>
/* ═══════════════════════════════════════════════════════════════════════════
   PULMO AI MK-VII · OFFLINE PDF REPORT ENGINE (p24)
   Zero-dependency raw PDF writer: Helvetica core fonts, word wrap, tables,
   colored blocks, live-canvas charts embedded as JPEG (DCTDecode) —
   works on file:// with no network, no libraries, no fonts.
   ═══════════════════════════════════════════════════════════════════════════ */
"use strict";

const PPDF = (function () {

  /* ── page geometry (A4 portrait, points) ─────────────────────────────── */
  const PW = 595.28, PH = 841.89, MARG = 46;
  const CW = PW - MARG * 2;                 /* content width 503.28 */
  const COL = {
    bg: "#0B1320", panel: "#101B2E", line: "#24344F", text: "#E6F1FF", muted: "#8DA3C7",
    cy: "#27C8FF", tl: "#00E5B0", am: "#FFB454", rd: "#FF5570", gr: "#3DFFB0", mg: "#FF4D9D", vt: "#B18CFF",
  };
  const F = { reg: "F1", bold: "F2", ital: "F3" };
  const ENDASH = String.fromCharCode(0x96); /* CP1252 en-dash byte for raw PDF streams */
  const CLS_COLOR = { bad: COL.rd, warn: COL.am, good: COL.gr, info: COL.cy };

  /* ── character sanitation: unicode → CP1252 bytes + transliteration ──── */
  const CP1252 = { 0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C, 0x0178: 0x9F };
  const XLATE = {
    "\u2265": ">=", "\u2264": "<=", "\u2248": "~", "\u2192": "->", "\u2190": "<-", "\u21D2": "=>",
    "\u2080": "0", "\u2081": "1", "\u2082": "2", "\u2083": "3", "\u2084": "4", "\u2085": "5", "\u2086": "6", "\u2087": "7", "\u2088": "8", "\u2089": "9",
    "\u2070": "0", "\u00B9": "\u00B9", "\u00B2": "\u00B2", "\u00B3": "\u00B3", "\u2074": "4", "\u2075": "5",
    "\u03C4": "tau", "\u0394": "Delta", "\u03B1": "alpha", "\u03B2": "beta", "\u03B3": "gamma", "\u03B4": "delta", "\u03BC": "u", "\u03C3": "sigma", "\u03BB": "lambda", "\u03B8": "theta", "\u03C1": "rho", "\u03C0": "pi", "\u03C7": "chi", "\u03C9": "omega", "\u03A9": "ohm",
    "\u2153": "1/3", "\u2154": "2/3", "\u2155": "1/5", "\u2156": "2/5", "\u2044": "/",
    "\u26A0": "[!]", "\u25B8": ">", "\u25B6": ">", "\u25AA": "-", "\u25CF": "o", "\u2713": "v", "\u2714": "v", "\u2715": "x", "\u2717": "x", "\u00D7": "\u00D7",
    "\u25B2": "^", "\u25BC": "v", "\u25C4": "<", "\u2500": "-", "\u2502": "|", "\u2550": "=", "\u2551": "|", "\u2015": "\u2014",
    "\u20AC": "EUR", "\u2122": "(TM)", "\uF8FF": "*",
  };
  function sanitize(s) {
    s = String(s == null ? "" : s);
    let out = "";
    for (let i = 0; i < s.length; i++) {
      let ch = s[i], code = s.charCodeAt(i);
      if (code === 9) { out += "    "; continue; }
      if (code === 10 || code === 13) { out += " "; continue; }
      if (code < 32) continue;
      if (code <= 255) { out += ch; continue; }
      if (CP1252[code] != null) { out += String.fromCharCode(CP1252[code]); continue; }
      if (XLATE[ch] != null) {
        const rep = XLATE[ch];
        out += (rep.length === 1 && rep.charCodeAt(0) > 255) ? sanitize(rep) : rep;
        continue;
      }
      out += "?";
    }
    return out;
  }
  /* escape a sanitized string for use inside ( ) PDF literal */
  function esc(s) { return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); }

  /* ── text measurement via shared offscreen canvas ────────────────────── */
  let mctx = null;
  function measure(str, size, font) {
    if (!mctx) { const c = document.createElement("canvas"); mctx = c.getContext("2d"); }
    mctx.font = (font === F.bold ? "bold " : font === F.ital ? "italic " : "") + size + "px Helvetica, Arial, sans-serif";
    return mctx.measureText(str).width * 1.02; /* small safety margin */
  }

  /* ── colors ──────────────────────────────────────────────────────────── */
  function hex(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h.replace(/./g, m => m + m);
    const n = parseInt(h, 16);
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const rgb = (h) => hex(h).map(v => +v.toFixed(3)).join(" ");

  /* ══ DOCUMENT ══════════════════════════════════════════════════════════ */
  function Doc(opts) {
    opts = opts || {};
    this.title = opts.title || "REPORT";
    this.subtitle = opts.subtitle || "";
    this.pages = [];       /* ops arrays */
    this.pageImgs = [];    /* per page: array of image indices */
    this.images = [];      /* {bytes:Uint8Array, w, h} */
    this.y = 0;
    this.pageNo = 0;
    this._newPage(true);
  }
  Doc.prototype._newPage = function (first) {
    this.pages.push([]);
    this.pageImgs.push([]);
    this.pageNo = this.pages.length;
    const ops = this.pages[this.pages.length - 1];
    /* page background */
    ops.push(rgb(COL.bg) + " rg 0 0 " + PW.toFixed(2) + " " + PH.toFixed(2) + " re f");
    if (first) {
      /* big banner */
      ops.push("q 0 0 0.06 0.12 RG 0.8 w " + (MARG - 8) + " " + (PH - 74) + " m " + (PW - MARG + 8) + " " + (PH - 74) + " l S Q");
      ops.push("BT /F2 17 Tf " + rgb(COL.cy) + " rg 1 0 0 1 " + MARG + " " + (PH - 52) + " Tm (PULMO AI) Tj ET");
      ops.push("BT /F1 8.2 Tf " + rgb(COL.muted) + " rg 1 0 0 1 " + (MARG + 74) + " " + (PH - 50) + " Tm (OFFLINE PULMONOLOGY INTELLIGENCE " + ENDASH + " MK-VII) Tj ET");
      ops.push("BT /F1 8.2 Tf " + rgb(COL.muted) + " rg 1 0 0 1 " + MARG + " " + (PH - 66) + " Tm (" + esc(sanitize(this.subtitle)) + ") Tj ET");
      let tDisp = sanitize(this.title);
      while (measure(tDisp, 15, F.bold) > PW - MARG * 2 - 205 && tDisp.length > 12) tDisp = tDisp.slice(0, -2);
      if (tDisp !== sanitize(this.title)) tDisp += "...";
      const tw = measure(tDisp, 15, F.bold);
      ops.push("BT /F2 15 Tf " + rgb(COL.text) + " rg 1 0 0 1 " + Math.max(MARG + 195, PW - MARG - tw).toFixed(1) + " " + (PH - 52) + " Tm (" + esc(tDisp) + ") Tj ET");
      this.y = PH - 92;
    } else {
      ops.push("q " + rgb(COL.line) + " 0.7 w " + MARG + " " + (PH - 40) + " m " + (PW - MARG) + " " + (PH - 40) + " l S Q");
      ops.push("BT /F2 8.2 Tf " + rgb(COL.cy) + " rg 1 0 0 1 " + MARG + " " + (PH - 36) + " Tm (PULMO AI " + ENDASH + " " + esc(sanitize(this.title.slice(0, 60))) + ") Tj ET");
      this.y = PH - 58;
    }
  };
  Doc.prototype.ensure = function (h) {
    if (this.y - h < MARG + 26) { this._newPage(false); return true; }
    return false;
  };
  Doc.prototype.spacer = function (h) { this.y -= (h || 8); };
  Doc.prototype.text = function (str, x, y, size, font, color, opsIn) {
    const ops = opsIn || this.pages[this.pages.length - 1];
    ops.push("BT /" + font + " " + size.toFixed(1) + " Tf " + rgb(color) + " rg 1 0 0 1 " + x.toFixed(1) + " " + y.toFixed(1) + " Tm (" + esc(sanitize(str)) + ") Tj ET");
  };
  Doc.prototype.textW = function (str, xRight, y, size, font, color) {
    const ops = this.pages[this.pages.length - 1];
    ops.push("BT /" + font + " " + size.toFixed(1) + " Tf " + rgb(color) + " rg 1 0 0 1 " + (xRight - measure(str, size, font)).toFixed(1) + " " + y.toFixed(1) + " Tm (" + esc(sanitize(str)) + ") Tj ET");
  };
  Doc.prototype.wrap = function (str, size, font, maxW) {
    const words = sanitize(str).split(/\s+/).filter(Boolean);
    const lines = []; let cur = "";
    words.forEach(w => {
      const t = cur ? cur + " " + w : w;
      if (measure(t, size, font) <= maxW || !cur) cur = t;
      else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  };
  Doc.prototype.rule = function (color, w) {
    const ops = this.pages[this.pages.length - 1];
    ops.push("q " + rgb(color || COL.line) + " RG " + (w || 0.8).toFixed(1) + " w " + MARG + " " + this.y.toFixed(1) + " m " + (PW - MARG) + " " + this.y.toFixed(1) + " l S Q");
    this.y -= 7;
  };
  Doc.prototype.h2 = function (str) {
    this.ensure(30);
    const ops = this.pages[this.pages.length - 1];
    this.text(str.toUpperCase(), MARG, this.y, 10.5, F.bold, COL.cy, ops);
    this.y -= 5;
    ops.push("q " + rgb(COL.line) + " RG 0.8 w " + MARG + " " + this.y.toFixed(1) + " m " + (PW - MARG) + " " + this.y.toFixed(1) + " l S Q");
    this.y -= 11;
  };
  Doc.prototype.p = function (str, opts) {
    opts = opts || {};
    const size = opts.size || 8.8, font = opts.font || F.reg, color = opts.color || COL.text;
    const lh = size * 1.5;
    this.wrap(str, size, font, opts.w || CW).forEach(line => {
      this.ensure(lh);
      this.text(line, opts.x || MARG, this.y, size, font, color);
      this.y -= lh;
    });
  };
  Doc.prototype.kvTable = function (rows) {
    /* rows: [[k, v], …] — 2-col grid, wraps value */
    const colK = Math.min(210, CW * 0.42), colV = CW - colK - 10;
    const rowH = 14, padV = 6;
    rows.forEach((r, i) => {
      const vLines = this.wrap(String(r[1] == null ? "—" : r[1]), 8.3, F.reg, colV);
      const h = rowH * Math.max(1, vLines.length) - 2;
      this.ensure(h + 2);
      const ops = this.pages[this.pages.length - 1];
      if (i % 2 === 0) ops.push("q " + rgb(COL.panel) + " rg " + (MARG - 3) + " " + (this.y - h + 6).toFixed(1) + " " + CW.toFixed(1) + " " + (h + 4).toFixed(1) + " re f Q");
      this.text(String(r[0]), MARG, this.y, 8.4, F.bold, COL.muted, ops);
      let yy = this.y;
      vLines.forEach(l => { this.text(l, MARG + colK + 10, yy, 8.4, F.reg, COL.text, ops); yy -= rowH; });
      this.y -= Math.max(rowH, rowH * vLines.length);
    });
    this.y -= 6;
  };
  Doc.prototype.dataTable = function (head, rows, widths, colors) {
    /* widths: fractions summing to 1 */
    const colW = widths.map(f => f * CW);
    const rowH = 13, headH = 16;
    const drawHead = () => {
      const ops = this.pages[this.pages.length - 1];
      ops.push("q " + rgb("#152238") + " rg " + (MARG - 3) + " " + (this.y - headH + 11).toFixed(1) + " " + CW.toFixed(1) + " " + headH.toFixed(1) + " re f Q");
      let x = MARG;
      head.forEach((hh, i) => { this.text(String(hh).toUpperCase(), x, this.y, 8.0, F.bold, COL.cy); x += colW[i]; });
      this.y -= headH;
    };
    this.ensure(headH + rowH * 2);
    drawHead();
    rows.forEach((r, ri) => {
      /* wrap each cell */
      const cellLines = r.map((c, ci) => this.wrap(String(c == null ? "—" : c), 8.1, F.reg, colW[ci] - 6));
      const nL = Math.max(...cellLines.map(l => l.length));
      const h = rowH * nL;
      if (this.ensure(h + rowH)) drawHead();
      const ops = this.pages[this.pages.length - 1];
      if (ri % 2 === 0) ops.push("q " + rgb(COL.panel) + " rg " + (MARG - 3) + " " + (this.y - h + 7).toFixed(1) + " " + CW.toFixed(1) + " " + (h + 4).toFixed(1) + " re f Q");
      let x = MARG;
      r.forEach((c, ci) => {
        let yy = this.y;
        const cc = colors && colors[ci] ? colors[ci] : (ci === 0 ? COL.text : COL.text);
        cellLines[ci].forEach(l => { this.text(l, x, yy, 8.1, ci === 0 ? F.bold : F.reg, cc, ops); yy -= rowH; });
        x += colW[ci];
      });
      this.y -= Math.max(rowH, h);
    });
    this.y -= 8;
  };
  Doc.prototype.block = function (label, value, body, cls) {
    /* colored left-bar result block */
    const color = CLS_COLOR[cls] || COL.cy;
    const size = 8.8;
    const head = value ? label + ":  " + value : label;
    const headLines = this.wrap(head, size, F.bold, CW - 14);
    const bodyLines = body ? this.wrap(body, 8.4, F.reg, CW - 14) : [];
    const h = headLines.length * 13 + bodyLines.length * 12.5 + 12;
    this.ensure(h);
    const ops = this.pages[this.pages.length - 1];
    const top = this.y + 6;
    ops.push("q " + rgb(color) + " RG 2.2 w " + (MARG - 8) + " " + (top - h + 12).toFixed(1) + " m " + (MARG - 8) + " " + top.toFixed(1) + " l S Q");
    let yy = this.y;
    headLines.forEach(l => { this.text(l, MARG, yy, size, F.bold, color, ops); yy -= 13; });
    yy -= 1;
    bodyLines.forEach(l => { this.text(l, MARG, yy, 8.4, F.reg, COL.text, ops); yy -= 12.5; });
    this.y = yy - 8;
  };
  Doc.prototype.bullets = function (arr, color) {
    arr.forEach(b => {
      const lines = this.wrap(b, 8.6, F.reg, CW - 14);
      this.ensure(lines.length * 12.5 + 2);
      const ops = this.pages[this.pages.length - 1];
      this.text("\u2022", MARG, this.y, 9.5, F.bold, color || COL.tl, ops);
      let yy = this.y;
      lines.forEach(l => { this.text(l, MARG + 12, yy, 8.6, F.reg, COL.text, ops); yy -= 12.5; });
      this.y = yy - 2.5;
    });
    this.y -= 4;
  };
  /* embed a live chart canvas (drawn onto navy background → JPEG) */
  Doc.prototype.chart = function (cv, caption) {
    if (!cv || !cv.width || !cv.height) return false;
    try {
      const off = document.createElement("canvas");
      off.width = cv.width; off.height = cv.height;
      const c2 = off.getContext("2d");
      c2.fillStyle = COL.bg; c2.fillRect(0, 0, off.width, off.height);
      c2.drawImage(cv, 0, 0);
      const url = off.toDataURL("image/jpeg", 0.87);
      const b64 = url.slice(url.indexOf(",") + 1);
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const imgW = CW, imgH = Math.min(300, CW * cv.height / cv.width);
      const scale = Math.min(imgW / cv.width, imgH / cv.height);
      const drawW = cv.width * scale, drawH = cv.height * scale;
      const capLines = caption ? this.wrap(caption, 8.2, F.bold, CW) : [];
      const totalH = drawH + capLines.length * 11 + 14;
      this.ensure(totalH);
      const ops = this.pages[this.pages.length - 1];
      if (capLines.length) {
        let yy = this.y;
        capLines.forEach(l => { this.text(l, MARG, yy, 8.2, F.bold, COL.am, ops); yy -= 11; });
        this.y = yy - 2;
      }
      const idx = this.images.length;
      this.images.push({ bytes, w: cv.width, h: cv.height });
      this.pageImgs[this.pages.length - 1].push(idx);
      ops.push("q " + drawW.toFixed(1) + " 0 0 " + drawH.toFixed(1) + " " + MARG.toFixed(1) + " " + (this.y - drawH).toFixed(1) + " cm /Im" + (idx + 1) + " Do Q");
      this.y -= drawH + 12;
      return true;
    } catch (e) { return false; }
  };

  /* ── serialization ───────────────────────────────────────────────────── */
  function l1(str) { /* string of chars ≤ 0xFF → bytes */
    const u = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) u[i] = str.charCodeAt(i) & 0xFF;
    return u;
  }
  Doc.prototype.build = function () {
    const nPages = this.pages.length, nImgs = this.images.length;
    /* footers on every page */
    this.pages.forEach((ops, pi) => {
      ops.push("q " + rgb(COL.line) + " RG 0.7 w " + MARG + " " + (MARG + 16) + " m " + (PW - MARG) + " " + (MARG + 16) + " l S Q");
      const ftxt = "PULMO AI \u2013 offline clinical decision support \u2013 educational use only \u2013 verify against local protocols";
      const fops = [];
      this.text(ftxt, MARG, MARG + 5, 7.0, F.reg, COL.muted, fops);
      this.textW("page " + (pi + 1) + " / " + nPages, PW - MARG, MARG + 5, 7.0, F.reg, COL.muted, fops);
      fops.forEach(o => ops.push(o));
    });
    /* object numbering:
       1 catalog · 2 pages · 3-5 fonts · 6..5+nImgs images · then per page: page obj + content obj */
    const fontObjs = [
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>",
    ];
    const pageObjNum = (p) => 6 + nImgs + p * 2;
    const chunks = [];
    let len = 0;
    const pushStr = (s) => { const u = l1(s); chunks.push(u); len += u.length; };
    const pushRaw = (u) => { chunks.push(u); len += u.length; };
    const total = 5 + nImgs + nPages * 2;   /* number of real PDF objects */
    const offsets = new Array(total).fill(0);
    pushStr("%PDF-1.4\n%\u00E2\u00E3\u00CF\u00D3\n");
    const writeObj = (num, body) => { offsets[num - 1] = len; pushStr(num + " 0 obj\n" + body + "\nendobj\n"); };
    writeObj(1, "<< /Type /Catalog /Pages 2 0 R >>");
    const kids = [];
    for (let p = 0; p < nPages; p++) kids.push(pageObjNum(p) + " 0 R");
    writeObj(2, "<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + nPages + " >>");
    writeObj(3, fontObjs[0]); writeObj(4, fontObjs[1]); writeObj(5, fontObjs[2]);
    this.images.forEach((im, i) => {
      const num = 6 + i;
      offsets[num - 1] = len;
      pushStr(num + " 0 obj\n<< /Type /XObject /Subtype /Image /Width " + im.w + " /Height " + im.h + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + im.bytes.length + " >>\nstream\n");
      pushRaw(im.bytes);
      pushStr("\nendstream\nendobj\n");
    });
    this.pages.forEach((ops, p) => {
      const used = this.pageImgs[p];
      const xo = used.length ? " /XObject << " + used.map(i => "/Im" + (i + 1) + " " + (6 + i) + " 0 R").join(" ") + " >>" : "";
      const content = ops.join("\n");
      const cbytes = l1(content);
      const pNum = pageObjNum(p);
      writeObj(pNum, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + PW.toFixed(2) + " " + PH.toFixed(2) + "] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >>" + xo + " >> /Contents " + (pNum + 1) + " 0 R >>");
      offsets[pNum] = len; /* pNum+1 obj = content */
      pushStr((pNum + 1) + " 0 obj\n<< /Length " + cbytes.length + " >>\nstream\n");
      pushRaw(cbytes);
      pushStr("\nendstream\nendobj\n");
    });
    let xref = "xref\n0 " + (total + 1) + "\n0000000000 65535 f \n";
    for (let i = 0; i < total; i++) {
      xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    }
    const xrefPos = len;
    pushStr(xref + "trailer\n<< /Size " + (total + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefPos + "\n%%EOF");
    /* assemble final bytes */
    const out = new Uint8Array(len);
    let o = 0;
    chunks.forEach(c => { out.set(c, o); o += c.length; });
    return out;
  };

  /* ══ REPORT COMPOSITOR ═════════════════════════════════════════════════ */
  function answer(cfg, opts) {
    opts = opts || {};
    const doc = new Doc({ title: cfg.title || "CONSULT ANSWER", subtitle: cfg.subtitle || "PULMO AI offline report" });
    if (cfg.meta && cfg.meta.length) doc.kvTable(cfg.meta);
    (cfg.sections || []).forEach(sec => {
      if (sec.h) doc.h2(sec.h);
      if (sec.text) doc.p(sec.text, { color: sec.color || COL.text });
      if (sec.muted) doc.p(sec.muted, { color: COL.muted, size: 8.2 });
      if (sec.kvs) doc.kvTable(sec.kvs);
      if (sec.table) doc.dataTable(sec.table.head, sec.table.rows, sec.table.widths || sec.table.head.map(() => 1 / sec.table.head.length), sec.table.colors);
      (sec.blocks || []).forEach(b => doc.block(b.label, b.value || "", b.body || "", b.cls));
      if (sec.bullets) doc.bullets(sec.bullets, sec.bulletColor);
      (sec.charts || []).forEach(ch => doc.chart(ch.cv, ch.title || ""));
      if (sec.spacer) doc.spacer(sec.spacer);
    });
    if (cfg.source) {
      doc.ensure(30);
      doc.rule();
      doc.p(cfg.source, { size: 7.4, color: COL.muted });
    }
    const bytes = doc.build();
    if (!opts.silent) save(cfg.filename || "pulmo-ai-report.pdf", bytes);
    return bytes;
  }

  function save(name, bytes) {
    try {
      const blob = new Blob([bytes], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 5000);
      toast("PDF answer generated \u2014 " + name);
    } catch (e) { toast("PDF download failed in this browser"); }
  }

  /* ══ GENERIC CALCULATOR → PDF EXTRACTOR ════════════════════════════════ */
  function labelOf(el) {
    const wrap = el.closest && el.closest("div");
    if (!wrap) return "";
    const l = wrap.querySelector("label");
    if (!l) return "";
    const clone = l.cloneNode(true);
    clone.querySelectorAll("b,small,span").forEach(n => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function fromCalc(root, meta) {
    meta = meta || {};
    if (!root) return null;
    /* inputs */
    const inputs = [];
    root.querySelectorAll("input,select").forEach(el => {
      if (el.type === "button" || el.type === "submit" || el.tagName === "TEXTAREA") return;
      if (!el.closest(".calcgrid, .plcalc-form, .field") && el.tagName === "INPUT" && el.type !== "range") return;
      let val = el.value;
      if (el.tagName === "SELECT") val = el.selectedIndex >= 0 ? el.options[el.selectedIndex].textContent : "";
      if (val === "" || val == null) return;
      const lab = labelOf(el) || el.id || "input";
      inputs.push([lab, String(val)]);
    });
    root.querySelectorAll(".seg,.plseg").forEach(sg => {
      const on = sg.querySelector("button.on");
      if (!on) return;
      const wrap = sg.closest("div");
      let lab = "";
      if (wrap) { const l = wrap.querySelector("label"); if (l) { const c = l.cloneNode(true); c.querySelectorAll("b,small,span").forEach(n => n.remove()); lab = c.textContent.replace(/\s+/g, " ").trim(); } }
      inputs.push([lab || "option", on.textContent.trim()]);
    });
    const chips = [];
    root.querySelectorAll(".pl-chip.on").forEach(c => { if (!c.hasAttribute("data-preset")) chips.push(c.textContent.trim()); });
    if (chips.length) inputs.push(["Selected findings", chips.join(" \u00B7 ")]);
    /* results */
    const blocks = [];
    root.querySelectorAll(".res").forEach(r => {
      const rl = r.querySelector(".rl"), rv = r.querySelector(".rv"), ri = r.querySelector(".ri");
      const cls = r.classList.contains("danger") ? "bad" : r.classList.contains("caution") ? "warn" : r.classList.contains("ok") ? "good" : "info";
      if (!ri && !rv) return;
      blocks.push({ label: rl ? rl.textContent.trim() : "RESULT", value: rv ? rv.textContent.replace(/\s+/g, " ").trim() : "", body: ri ? ri.innerText.replace(/\s+/g, " ").trim() : "", cls });
    });
    root.querySelectorAll(".ai-block").forEach(b => {
      if (b.closest(".res")) return;
      const head = b.querySelector("b");
      const full = b.innerText.replace(/\s+/g, " ").trim();
      const headTxt = head ? head.textContent.replace(/\s+/g, " ").trim() : "RESULT";
      const cls = b.classList.contains("bad") ? "bad" : b.classList.contains("warn") ? "warn" : b.classList.contains("good") ? "good" : "info";
      blocks.push({ label: headTxt, value: "", body: full === headTxt ? "" : full.replace(headTxt, "").trim(), cls });
    });
    root.querySelectorAll("ul.checks li").forEach(li => {
      const cls = li.classList.contains("bad") ? "bad" : li.classList.contains("warn") ? "warn" : "good";
      blocks.push({ label: "", value: "", body: li.innerText.replace(/\s+/g, " ").trim(), cls });
    });
    /* charts */
    const charts = [];
    const canvases = Array.from(root.querySelectorAll("canvas")).filter(cv => cv.width > 4 && cv.height > 4);
    canvases.forEach((cv, i) => {
      let title = "";
      if (meta.titles && meta.titles[i]) title = meta.titles[i];
      else { const prev = cv.previousElementSibling; if (prev && prev.classList && prev.classList.contains("ct")) title = prev.textContent.trim(); }
      charts.push({ cv, title });
    });
    const sections = [];
    if (meta.query) sections.push({ h: "QUERY ASKED", text: meta.query });
    if (inputs.length) sections.push({ h: "Inputs", table: { head: ["Parameter", "Value"], rows: inputs, widths: [0.55, 0.45] } });
    if (blocks.length) sections.push({ h: "Answer & interpretation", blocks });
    if (charts.length) sections.push({ h: "Graphs", charts });
    const now = new Date();
    const ts = now.toLocaleString ? now.toLocaleString() : now.toISOString();
    return answer({
      title: (meta.name || "CALCULATOR").toUpperCase(),
      subtitle: meta.subtitle || "Calculator answer report \u00B7 generated offline",
      filename: "pulmo-" + (meta.slug || "calculator") + "-answer.pdf",
      meta: [["Generated", ts], ["Engine", "PULMO AI offline calculator suite \u2014 " + (meta.engine || "live graphed engine")]],
      sections,
      source: (meta.source || "") + "  Educational decision support \u2014 not a substitute for clinical judgement. All computation performed locally on this device.",
    }, { silent: false });
  }

  /* answer for the 19 general calculators (CALC view) */
  function answerCalc(id) {
    const t = typeof CALC_TOOLS !== "undefined" ? CALC_TOOLS[id] : null;
    const root = document.getElementById("calcBody");
    if (!t || !root) { toast("Calculator not found"); return; }
    fromCalc(root, {
      name: t.name, slug: id, subtitle: t.group + " \u00B7 live graphed calculator",
      engine: "general calculator array", source: "Reference thresholds encoded in the PULMO AI knowledge base.",
    });
  }

  return { Doc, answer, save, fromCalc, answerCalc, sanitize };
})();
</script>
