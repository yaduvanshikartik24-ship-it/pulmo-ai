#!/usr/bin/env node
/* PULMO AI · MK-VII — zero-dependency static server
   Serves the single-file offline app on any Node host:
   Railway / Render / Fly / any VPS / LAN.
   Run:  node server.js   →  http://localhost:8080  */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2"
};

/* Explicit allowlist — only the app + public assets are reachable */
const ROUTES = {
  "/": "PULMO-AI.html",
  "/index.html": "PULMO-AI.html",
  "/PULMO-AI.html": "PULMO-AI.html",
  "/app": "PULMO-AI.html",
  "/robots.txt": "public/robots.txt",
  "/logo.svg": "public/logo.svg",
  "/favicon.ico": "public/logo.svg"
};

function resolvePath(url) {
  const clean = decodeURIComponent((url || "/").split("?")[0].split("#")[0]);
  if (ROUTES[clean]) return ROUTES[clean];
  if (clean.startsWith("/public/")) {
    const rel = path.normalize(clean.slice(1)); /* → "public/…" */
    if (rel.split(path.sep)[0] === "public" && !rel.includes("..")) return rel;
  }
  return null;
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return res.writeHead(405, { "content-type": "text/plain" }).end("405 method not allowed");
  }
  if ((req.url || "").split("?")[0] === "/healthz") {
    return res.writeHead(200, { "content-type": "text/plain", "cache-control": "no-store" }).end("ok");
  }
  const file = resolvePath(req.url);
  if (!file) return res.writeHead(404, { "content-type": "text/plain" }).end("404 not found");
  const full = path.join(ROOT, file);
  fs.readFile(full, (err, buf) => {
    if (err) return res.writeHead(404, { "content-type": "text/plain" }).end("404 not found");
    const ext = path.extname(full).toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";
    const cacheable = file.startsWith("public" + path.sep);
    const headers = {
      "content-type": mime,
      "cache-control": cacheable ? "public, max-age=86400" : "no-cache",
      "x-content-type-options": "nosniff",
      "referrer-policy": "same-origin"
    };
    const wantsGzip = /\bgzip\b/.test(req.headers["accept-encoding"] || "");
    const compressible = /^(text\/|application\/(json|javascript))/.test(mime) && buf.length > 1024;
    if (wantsGzip && compressible) {
      zlib.gzip(buf, { level: 6 }, (e, zbuf) => {
        if (e) { headers["content-length"] = buf.length; res.writeHead(200, headers); return res.end(req.method === "HEAD" ? undefined : buf); }
        headers["content-encoding"] = "gzip";
        headers["content-length"] = zbuf.length;
        res.writeHead(200, headers);
        res.end(req.method === "HEAD" ? undefined : zbuf);
      });
    } else {
      headers["content-length"] = buf.length;
      res.writeHead(200, headers);
      res.end(req.method === "HEAD" ? undefined : buf);
    }
  });
});

server.listen(PORT, () => console.log("PULMO AI serving on :" + PORT + " — single-file app, zero dependencies"));
