import { createHash, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { open, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "./site-config.mjs";

const BODY_LIMIT = 4096;
const UPSTREAM_LIMIT = 2 * 1024 * 1024;
const UPSTREAM_TIMEOUT_MS = 10_000;
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/;
const CONTENT_ID = /^[A-Za-z0-9_-]{1,128}$/;
const TYPES = new Map(Object.entries({
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".gif": "image/gif", ".webp": "image/webp", ".avif": "image/avif",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
  ".ttf": "font/ttf", ".otf": "font/otf", ".mp4": "video/mp4",
  ".webm": "video/webm", ".mp3": "audio/mpeg", ".pdf": "application/pdf",
}));

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function requireSecret(value, name, min, max, forbidColon = false) {
  if (typeof value !== "string" || value.length < min || value.length > max ||
      CONTROL.test(value) || !value.isWellFormed() || (forbidColon && value.includes(":"))) {
    // Deliberately never include the provided value.
    throw new Error(`${name} is missing or invalid.`);
  }
  return value;
}

export function readConfig(env = process.env, root = path.resolve("out")) {
  const serviceDomain = env.MICROCMS_SERVICE_DOMAIN;
  if (typeof serviceDomain !== "string" || !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(serviceDomain)) {
    throw new Error("MICROCMS_SERVICE_DOMAIN is missing or invalid.");
  }
  const apiKey = requireSecret(env.MICROCMS_API_KEY, "MICROCMS_API_KEY", 1, 1024);
  const username = requireSecret(env.PREVIEW_BASIC_USERNAME, "PREVIEW_BASIC_USERNAME", 1, 128, true);
  const password = requireSecret(env.PREVIEW_BASIC_PASSWORD, "PREVIEW_BASIC_PASSWORD", 16, 512);
  const host = env.PREVIEW_HOST || "127.0.0.1";
  if (!["127.0.0.1", "::1", "localhost", "0.0.0.0"].includes(host)) {
    throw new Error("PREVIEW_HOST is invalid.");
  }
  const portText = env.PREVIEW_PORT || "3001";
  if (!/^\d{1,5}$/.test(portText) || Number(portText) < 1 || Number(portText) > 65535) {
    throw new Error("PREVIEW_PORT is invalid.");
  }
  let publicUrl;
  try { publicUrl = new URL(env.PREVIEW_PUBLIC_ORIGIN); } catch { throw new Error("PREVIEW_PUBLIC_ORIGIN is missing or invalid."); }
  if (publicUrl.username || publicUrl.password || publicUrl.pathname !== "/" || publicUrl.search || publicUrl.hash ||
      env.PREVIEW_PUBLIC_ORIGIN !== publicUrl.origin ||
      (publicUrl.protocol !== "https:" && !(publicUrl.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(publicUrl.hostname) && host !== "0.0.0.0"))) {
    throw new Error("PREVIEW_PUBLIC_ORIGIN must be an HTTPS origin (loopback HTTP is allowed locally).");
  }
  return Object.freeze({ serviceDomain, apiKey, username, password, host, port: Number(portText),
    publicOrigin: publicUrl.origin, publicHost: publicUrl.host, root: path.resolve(root) });
}

function digest(value) { return createHash("sha256").update(value).digest(); }

function authenticated(header, expected) {
  if (typeof header !== "string" || !/^Basic [A-Za-z0-9+/]+={0,2}$/i.test(header)) return false;
  const encoded = header.slice(6);
  const bytes = Buffer.from(encoded, "base64");
  if (bytes.toString("base64") !== encoded || bytes.length > 2600) return false;
  let decoded;
  try { decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { return false; }
  return timingSafeEqual(digest(decoded), expected);
}

function securityHeaders(res, httpsOrigin) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Content-Security-Policy", "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  if (httpsOrigin) res.setHeader("Strict-Transport-Security", "max-age=31536000");
}

function htmlPolicy(html) {
  const hashes = new Set();
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (!/\bsrc\s*=/i.test(match[1])) hashes.add(`'sha256-${createHash("sha256").update(match[2].replace(/\r\n?/g, "\n")).digest("base64")}'`);
  }
  return ["default-src 'none'", `script-src 'self' ${[...hashes].join(" ")}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' https: data:", "media-src 'self' https:", "connect-src 'self'",
    "base-uri 'none'", "frame-src 'none'", "object-src 'none'", "form-action 'self'", "frame-ancestors 'none'"].join("; ");
}

function json(res, status, payload) {
  res.statusCode = status;
  res.removeHeader("Content-Length");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

class RateLimiter {
  constructor(now) { this.now = now; this.buckets = new Map(); }
  take(key, limit) {
    const now = this.now();
    for (const [name, bucket] of this.buckets) if (now >= bucket.expires) this.buckets.delete(name);
    let bucket = this.buckets.get(key);
    if (!bucket) {
      if (this.buckets.size >= 2048) return false;
      bucket = { expires: now + 60_000, count: 0 };
      this.buckets.set(key, bucket);
    }
    bucket.count += 1;
    return bucket.count <= limit;
  }
}

// This intentionally parses only an object of string values, so duplicate keys
// (including escaped equivalents), nested values and unknown fields cannot slip
// through JSON.parse's last-key-wins behavior.
export function parsePreviewInput(text, endpoints = SITE.endpoints) {
  let index = 0;
  const skip = () => { while (/[ \t\r\n]/.test(text[index] || "x")) index += 1; };
  const fail = () => { throw new HttpError(400, "Invalid preview request."); };
  const string = () => {
    if (text[index] !== '"') return fail();
    const start = index++;
    while (index < text.length) {
      if (text[index] === "\\") { index += 2; continue; }
      if (text[index++] === '"') {
        try { return JSON.parse(text.slice(start, index)); } catch { return fail(); }
      }
    }
    return fail();
  };
  skip();
  if (text[index++] !== "{") return fail();
  const result = Object.create(null);
  skip();
  if (text[index] !== "}") {
    while (true) {
      skip(); const key = string(); skip();
      if (text[index++] !== ":") return fail();
      skip(); const value = string();
      if (!["endpoint", "contentId", "draftKey"].includes(key) || Object.hasOwn(result, key)) return fail();
      result[key] = value;
      skip();
      if (text[index] === "}") break;
      if (text[index++] !== ",") return fail();
    }
  }
  index += 1; skip();
  if (index !== text.length || Object.keys(result).length !== 3 || !endpoints.includes(result.endpoint) ||
      !CONTENT_ID.test(result.contentId) || result.draftKey.length < 1 || result.draftKey.length > 512 ||
      CONTROL.test(result.draftKey) || !result.draftKey.isWellFormed()) return fail();
  return result;
}

function readBody(req) {
  if (Number(req.headers["content-length"] || 0) > BODY_LIMIT) {
    req.resume(); return Promise.reject(new HttpError(413, "Preview request is too large."));
  }
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    const cleanup = () => { req.removeListener("data", data); req.removeListener("end", end);
      req.removeListener("error", error); req.removeListener("aborted", aborted); };
    const error = () => { cleanup(); reject(new HttpError(400, "Invalid preview request.")); };
    const aborted = error;
    const data = (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT) { cleanup(); req.resume(); reject(new HttpError(413, "Preview request is too large.")); }
      else chunks.push(chunk);
    };
    const end = () => {
      cleanup();
      try { resolve(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks))); } catch { reject(new HttpError(400, "Invalid preview request.")); }
    };
    req.on("data", data); req.on("end", end); req.on("error", error); req.on("aborted", aborted);
  });
}

async function boundedResponse(response) {
  if (Number(response.headers.get("content-length") || 0) > UPSTREAM_LIMIT) {
    await response.body?.cancel(); throw new HttpError(502, "Preview content is unavailable.");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new HttpError(502, "Preview content is unavailable.");
  const chunks = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > UPSTREAM_LIMIT) { await reader.cancel(); throw new HttpError(502, "Preview content is unavailable."); }
      chunks.push(Buffer.from(value));
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks))); }
  catch { throw new HttpError(502, "Preview content is unavailable."); }
}

function selectContent(raw, input, fields) {
  const fail = () => { throw new HttpError(502, "Preview content is unavailable."); };
  if (!raw || Array.isArray(raw) || typeof raw !== "object" || raw.id !== input.contentId || typeof raw.title !== "string") return fail();
  const result = { id: raw.id, title: raw.title, content: "" };
  const textFields = ["content", "date", "summary", "slug", "author", "createdAt", "updatedAt", "publishedAt", "revisedAt"];
  for (const key of textFields) {
    if (!fields.includes(key) || raw[key] === undefined || raw[key] === null) continue;
    if (typeof raw[key] !== "string") return fail();
    result[key] = raw[key];
  }
  if (fields.includes("pickup") && raw.pickup !== undefined) {
    if (typeof raw.pickup !== "boolean") return fail();
    result.pickup = raw.pickup;
  }
  if (fields.includes("tag") && raw.tag != null) {
    if (!Array.isArray(raw.tag) || raw.tag.length > 64 || !raw.tag.every((item) => typeof item === "string")) return fail();
    result.tag = raw.tag;
  }
  if (fields.includes("category") && raw.category != null) {
    if (typeof raw.category === "string") result.category = raw.category;
    else if (typeof raw.category === "object" && !Array.isArray(raw.category) &&
      typeof raw.category.id === "string" && typeof raw.category.name === "string") {
      result.category = { id: raw.category.id, name: raw.category.name };
    } else return fail();
  }
  if (fields.includes("eyecatch") && raw.eyecatch != null) {
    let image;
    try { image = new URL(raw.eyecatch.url); } catch { return fail(); }
    if (image.protocol !== "https:" || image.username || image.password) return fail();
    result.eyecatch = { url: image.href };
    for (const dimension of ["width", "height"]) {
      if (raw.eyecatch[dimension] === undefined) continue;
      if (!Number.isFinite(raw.eyecatch[dimension]) || raw.eyecatch[dimension] < 1 || raw.eyecatch[dimension] > 100_000) return fail();
      result.eyecatch[dimension] = raw.eyecatch[dimension];
    }
  }
  return result;
}

async function fetchDraft(config, site, input, fetchImpl, timeoutMs, res) {
  const url = new URL(`https://${config.serviceDomain}.microcms.io/api/v1/${input.endpoint}/${encodeURIComponent(input.contentId)}`);
  url.searchParams.set("draftKey", input.draftKey);
  url.searchParams.set("fields", site.fields.join(","));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const cancel = () => { if (!res.writableEnded) controller.abort(); };
  res.on("close", cancel);
  try {
    const upstream = await fetchImpl(url, { method: "GET", cache: "no-store", redirect: "error", signal: controller.signal,
      headers: { "X-MICROCMS-API-KEY": config.apiKey, Accept: "application/json", "Cache-Control": "no-store" } });
    if (!upstream.ok) {
      await upstream.body?.cancel();
      throw new HttpError(upstream.status === 404 ? 404 : 502, "Preview content is unavailable.");
    }
    if (!/^application\/json(?:\s*;|$)/i.test(upstream.headers.get("content-type") || "")) {
      await upstream.body?.cancel(); throw new HttpError(502, "Preview content is unavailable.");
    }
    return selectContent(await boundedResponse(upstream), input, site.fields);
  } catch (error) {
    if (controller.signal.aborted) throw new HttpError(504, "Preview content request timed out.");
    if (error instanceof HttpError) throw error;
    // Fetch exceptions may contain the full URL and token. Never forward or log them.
    throw new HttpError(502, "Preview content is unavailable.");
  } finally { clearTimeout(timer); res.removeListener("close", cancel); }
}

function inside(root, target) {
  const relative = path.relative(root, target);
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function staticTarget(rawUrl, root) {
  let decoded;
  try { decoded = decodeURIComponent(rawUrl.split("?")[0]); } catch { throw new HttpError(400, "Invalid path."); }
  if (!decoded.startsWith("/") || decoded.startsWith("//") || /[\\<>:"|?*%\u0000-\u001f\u007f]/.test(decoded)) throw new HttpError(400, "Invalid path.");
  const parts = decoded.split("/").filter(Boolean);
  if (parts.some((part) => part.startsWith(".") || part.endsWith(".") || part.endsWith(" ") || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part))) {
    throw new HttpError(404, "Page not found.");
  }
  const target = path.resolve(root, ...parts, ...(decoded.endsWith("/") ? ["index.html"] : []));
  if (!inside(root, target)) throw new HttpError(404, "Page not found.");
  return target;
}

async function serveStatic(req, res, root, previewHtml) {
  let target = staticTarget(req.url, root);
  let info;
  try {
    info = await stat(target);
    if (info.isDirectory()) { target = path.join(target, "index.html"); info = await stat(target); }
    if (!info.isFile() || !TYPES.has(path.extname(target).toLowerCase())) throw new Error("unsupported");
    target = await realpath(target);
    if (!inside(root, target)) throw new Error("escape");
    // Public article HTML can contain existing, unsanitized CMS rich text. Do
    // not grant that HTML the preview origin's Basic credentials or shell CSP.
    // Only the independently built preview shell may be a document here.
    if (path.extname(target).toLowerCase() === ".html" && target !== previewHtml) throw new Error("not-preview-shell");
  } catch { throw new HttpError(404, "Page not found."); }
  const file = await open(target, "r");
  try {
    res.setHeader("Content-Type", TYPES.get(path.extname(target).toLowerCase()));
    const size = (await file.stat()).size;
    res.setHeader("Content-Length", size);
    if (path.extname(target).toLowerCase() === ".html") {
      const html = await file.readFile();
      res.setHeader("Content-Security-Policy", htmlPolicy(html.toString("utf8")));
      res.end(req.method === "HEAD" ? undefined : html);
    } else if (req.method === "HEAD") res.end();
    else await new Promise((resolve, reject) => {
      const stream = file.createReadStream({ autoClose: false });
      stream.on("error", reject); res.on("finish", resolve); res.on("close", resolve);
      stream.pipe(res);
    });
  } finally { await file.close(); }
}

/** Dependencies are explicit for offline mock tests; the CLI uses global fetch. */
export async function createPreviewServer({ config, site = SITE, fetchImpl = globalThis.fetch,
  now = Date.now, upstreamTimeoutMs = UPSTREAM_TIMEOUT_MS } = {}) {
  if (!config) throw new Error("Preview configuration is required.");
  const root = await realpath(config.root);
  if (!(await stat(root)).isDirectory() || !path.isAbsolute(root)) throw new Error("Static output is unavailable. Build the site first.");
  const expectedPreviewHtml = path.join(root, "preview", "index.html");
  const previewHtml = await realpath(expectedPreviewHtml);
  if (previewHtml !== expectedPreviewHtml || !inside(root, previewHtml) || !(await stat(previewHtml)).isFile()) {
    throw new Error("Preview shell is unavailable. Build the preview route first.");
  }
  const expected = digest(`${config.username}:${config.password}`);
  const limiter = new RateLimiter(now);
  const server = createServer({ maxHeaderSize: 16 * 1024 }, async (req, res) => {
    securityHeaders(res, config.publicOrigin.startsWith("https:"));
    try {
      const sensitive = new Set(["authorization", "host", "origin", "content-type", "x-preview-request"]);
      const counts = new Map();
      for (let i = 0; i < req.rawHeaders.length; i += 2) {
        const key = req.rawHeaders[i].toLowerCase();
        if (sensitive.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
      }
      if ([...counts.values()].some((count) => count > 1)) throw new HttpError(400, "Invalid request headers.");
      if (req.headers.host?.toLowerCase() !== config.publicHost) throw new HttpError(421, "Invalid request host.");
      const peer = req.socket.remoteAddress || "unknown"; // Do not trust X-Forwarded-For.
      if (!limiter.take(`all:${peer}`, 240)) { res.setHeader("Retry-After", "60"); throw new HttpError(429, "Too many preview requests."); }
      if (!authenticated(req.headers.authorization, expected)) {
        if (!limiter.take(`auth:${peer}`, 30)) { res.setHeader("Retry-After", "60"); throw new HttpError(429, "Too many preview requests."); }
        res.setHeader("WWW-Authenticate", 'Basic realm="Site preview", charset="UTF-8"');
        throw new HttpError(401, "Preview authentication is required.");
      }
      if (typeof req.url !== "string" || !req.url.startsWith("/") || req.url.startsWith("//") || req.url.includes("#") || CONTROL.test(req.url)) throw new HttpError(400, "Invalid path.");
      if (req.url.split("?")[0] === "/api/preview") {
        if (req.method !== "POST") { res.setHeader("Allow", "POST"); throw new HttpError(405, "Method not allowed."); }
        if (req.url !== "/api/preview" || req.headers.origin !== config.publicOrigin || req.headers["x-preview-request"] !== "1") throw new HttpError(403, "Invalid preview request origin.");
        if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers["content-type"] || "") || req.headers["content-encoding"]) throw new HttpError(415, "JSON content is required.");
        if (!limiter.take(`api:${peer}`, 60)) { res.setHeader("Retry-After", "60"); throw new HttpError(429, "Too many preview requests."); }
        const input = parsePreviewInput(await readBody(req), site.endpoints);
        json(res, 200, { content: await fetchDraft(config, site, input, fetchImpl, upstreamTimeoutMs, res) });
      } else {
        if (!["GET", "HEAD"].includes(req.method)) { res.setHeader("Allow", "GET, HEAD"); throw new HttpError(405, "Method not allowed."); }
        await serveStatic(req, res, root, previewHtml);
      }
    } catch (error) {
      if (!res.headersSent && !res.destroyed) {
        // Unexpected filesystem/network errors can contain secrets or paths.
        json(res, error instanceof HttpError ? error.status : 500,
          { error: error instanceof HttpError ? error.message : "Preview request failed." });
      } else if (!res.writableEnded) res.destroy();
    }
  });
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;
  // Avoid Node's automatic per-socket 503 response, which would bypass our headers.
  server.maxRequestsPerSocket = 0;
  server.on("clientError", (_error, socket) => {
    if (socket.writable) socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\nCache-Control: private, no-store, max-age=0\r\nSurrogate-Control: no-store\r\nReferrer-Policy: no-referrer\r\nX-Robots-Tag: noindex, nofollow, noarchive\r\nX-Content-Type-Options: nosniff\r\nContent-Security-Policy: default-src 'none'; frame-ancestors 'none'\r\nContent-Length: 0\r\n\r\n");
    else socket.destroy();
  });
  return server;
}

async function main() {
  try {
    const config = readConfig();
    const server = await createPreviewServer({ config });
    server.on("error", () => { console.error("Preview server could not start."); process.exitCode = 1; });
    server.listen(config.port, config.host, () => console.info(`${SITE.name} preview server is ready.`));
    const stop = () => { server.close(); server.closeIdleConnections(); };
    process.once("SIGINT", stop); process.once("SIGTERM", stop);
  } catch {
    console.error("Preview server refused to start. Check required environment settings and the out/ build.");
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
