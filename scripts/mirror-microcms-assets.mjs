import { createWriteStream, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const OUT_DIR = process.env.MIRROR_OUT_DIR || "out";
const S3_BUCKET = process.env.S3_BUCKET;
const PUBLIC_BASE = (process.env.MICROCMS_ASSET_PUBLIC_BASE || "https://novolba.com/microcms-assets").replace(/\/$/, "");
const LIMIT_BYTES = Number(process.env.MICROCMS_MIRROR_LIMIT_BYTES || 2 * 1024 * 1024 * 1024);
const CONCURRENCY = Number(process.env.MICROCMS_MIRROR_CONCURRENCY || 6);
const SCAN_ONLY = process.argv.includes("--scan-only");

const MICROCMS_ASSET_RE =
  /https:\/\/images\.microcms-assets\.io\/assets\/[^"'<>\\ )]+?\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?[^"'<>\\ )]+)?/gi;

const TEXT_EXTENSIONS = new Set([".html", ".txt", ".json", ".js"]);
const CONTENT_TYPES = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".gif", "image/gif"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"],
]);

function runAws(args, options = {}) {
  const result = spawnSync("aws", args, {
    encoding: "utf8",
    stdio: options.quiet ? "pipe" : "inherit",
    env: {
      ...process.env,
      PYTHONUTF8: "1",
      PYTHONIOENCODING: "utf-8",
    },
  });
  return result;
}

function runAwsJson(args) {
  const result = runAws(args, { quiet: true });
  if (result.status !== 0) {
    throw new Error(`aws ${args.join(" ")} failed\n${result.stderr || ""}`.trim());
  }
  return JSON.parse(result.stdout || "null");
}

function runAwsAsync(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("aws", args, {
      stdio: "inherit",
      env: {
        ...process.env,
        PYTHONUTF8: "1",
        PYTHONIOENCODING: "utf-8",
      },
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`aws ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}

function cleanupTempDir(dir) {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`warning: failed to remove temp directory ${dir}: ${message}`);
  }
}

function assertAwsAccess() {
  const identity = runAws(["sts", "get-caller-identity"], { quiet: true });
  if (identity.status !== 0) {
    throw new Error(`AWS credentials are required before mirroring assets.\n${identity.stderr || ""}`.trim());
  }

  const bucket = runAws(["s3api", "head-bucket", "--bucket", S3_BUCKET], { quiet: true });
  if (bucket.status !== 0) {
    throw new Error(`S3 bucket is not accessible: ${S3_BUCKET}\n${bucket.stderr || ""}`.trim());
  }
}

async function listFiles(dir, files = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await listFiles(fullPath, files);
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

function normalizeUrl(rawUrl) {
  return rawUrl.replace(/\\u0026/g, "&").replace(/&apos;/g, "'").replace(/\\+$/, "");
}

function toMirrorUrl(sourceUrl) {
  const parsed = new URL(sourceUrl);
  return `${PUBLIC_BASE}${parsed.pathname}`;
}

function toS3Key(sourceUrl) {
  const parsed = new URL(sourceUrl);
  return `microcms-assets${decodeURI(parsed.pathname)}`;
}

function contentTypeFor(sourceUrl) {
  const ext = path.extname(new URL(sourceUrl).pathname).toLowerCase();
  return CONTENT_TYPES.get(ext) || "application/octet-stream";
}

function tempFilenameFor(key) {
  const ext = path.extname(key);
  const hash = createHash("sha256").update(key).digest("hex");
  return `${hash}${ext}`;
}

async function collectUrls(files) {
  const urls = new Set();
  const filesByUrl = new Map();

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const match of content.matchAll(MICROCMS_ASSET_RE)) {
      const url = normalizeUrl(match[0]);
      urls.add(url);
      if (!filesByUrl.has(url)) filesByUrl.set(url, new Set());
      filesByUrl.get(url).add(file);
    }
  }

  return { urls: [...urls].sort(), filesByUrl };
}

function listExistingS3Keys() {
  const keys = runAwsJson([
    "s3api",
    "list-objects-v2",
    "--bucket",
    S3_BUCKET,
    "--prefix",
    "microcms-assets/assets/",
    "--query",
    "Contents[].Key",
    "--output",
    "json",
  ]);
  return new Set(Array.isArray(keys) ? keys : []);
}

async function contentLength(url) {
  const response = await fetch(url, { method: "HEAD" });
  if (!response.ok) throw new Error(`HEAD ${response.status} ${response.statusText}`);
  const value = response.headers.get("content-length");
  return value ? Number(value) : null;
}

async function downloadWithLimit(url, destination, transferredBefore) {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`GET ${response.status} ${response.statusText}`);
  }

  let downloaded = 0;
  const guard = new TransformStream({
    transform(chunk, controller) {
      downloaded += chunk.byteLength;
      if (transferredBefore + downloaded > LIMIT_BYTES) {
        throw new Error(`mirror transfer limit exceeded: ${transferredBefore + downloaded} > ${LIMIT_BYTES}`);
      }
      controller.enqueue(chunk);
    },
  });

  await pipeline(response.body.pipeThrough(guard), createWriteStream(destination));
  return downloaded;
}

async function uploadToS3(file, key, sourceUrl) {
  await runAwsAsync([
    "s3",
    "cp",
    file,
    `s3://${S3_BUCKET}/${key}`,
    "--only-show-errors",
    "--content-type",
    contentTypeFor(sourceUrl),
    "--cache-control",
    "public, max-age=31536000, immutable",
  ]);
}

function replaceUrls(urls, files) {
  const replacements = new Map(urls.map((url) => [url, toMirrorUrl(url)]));
  for (const file of files) {
    let content = readFileSync(file, "utf8");
    let changed = false;
    for (const [source, mirrored] of replacements) {
      if (content.includes(source)) {
        content = content.split(source).join(mirrored);
        changed = true;
      }
      const escaped = source.replace(/&/g, "\\u0026");
      if (content.includes(escaped)) {
        content = content.split(escaped).join(mirrored.replace(/&/g, "\\u0026"));
        changed = true;
      }
      const htmlEntityEscaped = source.replace(/'/g, "&apos;");
      if (content.includes(htmlEntityEscaped)) {
        content = content.split(htmlEntityEscaped).join(mirrored);
        changed = true;
      }
    }
    if (changed) writeFileSync(file, content);
  }
}

function replaceResidualHosts(files) {
  const sourceHost = "https://images.microcms-assets.io/assets/";
  const mirroredHost = `${PUBLIC_BASE}/assets/`;

  for (const file of files) {
    let content = readFileSync(file, "utf8");
    let changed = false;

    if (content.includes(sourceHost)) {
      content = content.split(sourceHost).join(mirroredHost);
      changed = true;
    }

    const splitSourceHost = 'https://images.microcms-assets.io/as"])</script><script>self.__next_f.push([1,"sets/';
    const splitMirroredHost = `${PUBLIC_BASE}/as"])</script><script>self.__next_f.push([1,"sets/`;
    if (content.includes(splitSourceHost)) {
      content = content.split(splitSourceHost).join(splitMirroredHost);
      changed = true;
    }

    if (content.includes("logo_J-Tama\\u0026apos;s.jpg")) {
      content = content.split("logo_J-Tama\\u0026apos;s.jpg").join("logo_J-Tama%27s.jpg");
      changed = true;
    }

    if (content.includes("logo_J-Tama&apos;s.jpg")) {
      content = content.split("logo_J-Tama&apos;s.jpg").join("logo_J-Tama%27s.jpg");
      changed = true;
    }

    if (changed) writeFileSync(file, content);
  }
}

async function main() {
  const files = await listFiles(OUT_DIR);
  const { urls } = await collectUrls(files);

  console.log(`microCMS asset URLs found: ${urls.length}`);
  console.log(`public base: ${PUBLIC_BASE}`);
  console.log(`transfer limit: ${Math.round(LIMIT_BYTES / 1024 / 1024)} MiB`);

  if (SCAN_ONLY) return;
  if (!S3_BUCKET) throw new Error("S3_BUCKET is required");
  assertAwsAccess();

  const tmp = mkdtempSync(path.join(tmpdir(), "microcms-assets-"));
  let plannedBytes = 0;
  let transferredBytes = 0;
  let uploaded = 0;
  const existingKeys = listExistingS3Keys();
  const missingUrls = [];
  const mirroredUrls = [];
  const skippedUrls = [];

  for (const url of urls) {
    const key = toS3Key(url);
    if (existingKeys.has(key)) {
      mirroredUrls.push(url);
    } else {
      missingUrls.push(url);
    }
  }

  let completed = mirroredUrls.length;
  console.log(`already mirrored: ${mirroredUrls.length}`);
  console.log(`to upload: ${missingUrls.length}`);

  try {
    let nextIndex = 0;
    async function worker() {
      for (;;) {
        const currentIndex = nextIndex++;
        if (currentIndex >= missingUrls.length) return;
        const url = missingUrls[currentIndex];
        const key = toS3Key(url);

        try {
          const length = await contentLength(url);
          if (length != null) {
            plannedBytes += length;
            if (plannedBytes > LIMIT_BYTES) {
              throw new Error(`planned mirror transfer exceeds limit: ${plannedBytes} > ${LIMIT_BYTES}`);
            }
          }

          const destination = path.join(tmp, tempFilenameFor(key));
          const downloaded = await downloadWithLimit(url, destination, transferredBytes);
          transferredBytes += downloaded;
          await uploadToS3(destination, key, url);
          mirroredUrls.push(url);
          uploaded++;
          completed++;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (message.includes("transfer limit")) throw error;
          skippedUrls.push(url);
          completed++;
          console.warn(`warning: skipped ${url}: ${message}`);
        }

        if (completed % 25 === 0 || completed === urls.length) {
          console.log(`processed ${completed}/${urls.length}, uploaded ${uploaded}, skipped ${skippedUrls.length}, transferred ${(transferredBytes / 1024 / 1024).toFixed(1)} MiB`);
        }
      }
    }

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, missingUrls.length) }, () => worker()));
    replaceUrls(mirroredUrls, files);
    replaceResidualHosts(files);
    console.log(`mirror complete: uploaded ${uploaded}, already mirrored ${urls.length - uploaded - skippedUrls.length}, skipped ${skippedUrls.length}, transferred ${(transferredBytes / 1024 / 1024).toFixed(1)} MiB`);
  } finally {
    cleanupTempDir(tmp);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
