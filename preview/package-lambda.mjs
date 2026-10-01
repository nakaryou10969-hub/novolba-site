import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const MIB = 1024 * 1024;
export const LIMITS = Object.freeze({ asset: 4 * MIB, zip: 50 * MIB, expanded: 200 * MIB });
const ASSET_EXTENSIONS = new Set([".css", ".js", ".json", ".txt", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".woff", ".woff2", ".ttf", ".otf", ".mp4", ".webm", ".mp3", ".pdf"]);
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let bit = 0; bit < 8; bit++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function inside(root, target) { return target === root || target.startsWith(`${root}${path.sep}`); }
function safeRelative(name) {
  return !name.split("/").some((part) => !part || part.startsWith(".") || /[\\<>:"|?*\u0000-\u001f\u007f]/.test(part) || /(?:^|\.)map$/i.test(part));
}
export function createZip(entries) {
  const chunks = []; const central = []; let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const compressed = deflateRawSync(entry.bytes, { level: 9 });
    const crc = crc32(entry.bytes);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8); local.writeUInt16LE(0x0021, 12); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(entry.bytes.length, 22); local.writeUInt16LE(name.length, 26);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50, 0); directory.writeUInt16LE(0x0314, 4); directory.writeUInt16LE(20, 6);
    directory.writeUInt16LE(0x0800, 8); directory.writeUInt16LE(8, 10); directory.writeUInt16LE(0x0021, 14);
    directory.writeUInt32LE(crc, 16); directory.writeUInt32LE(compressed.length, 20); directory.writeUInt32LE(entry.bytes.length, 24);
    directory.writeUInt16LE(name.length, 28); directory.writeUInt32LE(((0o100000 | entry.mode) << 16) >>> 0, 38); directory.writeUInt32LE(offset, 42);
    chunks.push(local, name, compressed); central.push(directory, name); offset += local.length + name.length + compressed.length;
  }
  if (entries.length > 65535) throw new Error("Too many package files.");
  const centralBytes = Buffer.concat(central); const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBytes.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, centralBytes, end]);
}
export async function collectEntries(buildOut, root = ROOT) {
  const buildRoot = await realpath(buildOut);
  if ((await lstat(buildOut)).isSymbolicLink()) throw new Error("Build output must not be a symlink.");
  const entries = [];
  for (const [source, name, mode] of [["preview/server.mjs", "preview/server.mjs", 0o644], ["preview/site-config.mjs", "preview/site-config.mjs", 0o644], ["preview/lambda/run.sh", "run.sh", 0o755]]) {
    const sourcePath = path.join(root, source); const info = await lstat(sourcePath);
    if (!info.isFile() || info.isSymbolicLink()) throw new Error("Runtime source must be a regular file.");
    let bytes = await readFile(sourcePath);
    if (name === "run.sh") bytes = Buffer.from(bytes.toString("utf8").replace(/\r\n/g, "\n"));
    entries.push({ name, bytes, mode });
  }
  async function walk(directory, prefix = "") {
    for (const item of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, "en"))) {
      const relative = prefix ? `${prefix}/${item.name}` : item.name;
      if (["preview-mock-build.txt", ".preview-mock"].includes(item.name)) throw new Error("Mock builds cannot be packaged for AWS.");
      if (!safeRelative(relative) || item.isSymbolicLink()) throw new Error("Build contains forbidden files or symlinks.");
      const source = path.join(directory, item.name);
      if (!inside(buildRoot, await realpath(source))) throw new Error("Build contains a path outside its output root.");
      if (item.isDirectory()) { await walk(source, relative); continue; }
      if (!item.isFile()) throw new Error("Build contains a non-regular file.");
      const extension = path.extname(relative).toLowerCase();
      if (extension === ".html" && relative !== "preview/index.html") continue;
      if (relative !== "preview/index.html" && !ASSET_EXTENSIONS.has(extension)) throw new Error("Build contains an unsupported file type.");
      // Published route payloads are unnecessary on this dedicated preview origin.
      if ([".txt", ".json"].includes(extension) && !relative.startsWith("_next/static/") && !relative.startsWith("preview/")) continue;
      const bytes = await readFile(source);
      // Buffered Lambda responses also contain base64 and a JSON envelope.
      if (bytes.length > LIMITS.asset) throw new Error("A preview asset exceeds the safe buffered response limit.");
      entries.push({ name: `out/${relative}`, bytes, mode: 0o644 });
    }
  }
  await walk(buildRoot);
  if (!entries.some((entry) => entry.name === "out/preview/index.html")) throw new Error("Preview shell is missing. Run the dedicated preview build first.");
  if (entries.reduce((sum, entry) => sum + entry.bytes.length, 0) > LIMITS.expanded) throw new Error("Package exceeds its expanded budget; retain 50 MiB for the adapter layer.");
  return entries;
}
export async function packageLambda({ buildOut = path.join(ROOT, ".preview-lambda-build/out"), output = path.join(ROOT, ".preview-lambda-build/preview.zip"), root = ROOT } = {}) {
  const resolvedOut = path.resolve(buildOut); const resolvedOutput = path.resolve(output);
  if (inside(resolvedOut, resolvedOutput)) throw new Error("Package output must be outside the build output.");
  const entries = await collectEntries(resolvedOut, root); const zip = createZip(entries);
  if (zip.length > LIMITS.zip) throw new Error("Package exceeds the 50 MiB direct upload limit.");
  await mkdir(path.dirname(resolvedOutput), { recursive: true });
  await writeFile(resolvedOutput, zip);
  const manifest = {
    format: 1, sha256: createHash("sha256").update(zip).digest("hex"), zipBytes: zip.length,
    expandedBytes: entries.reduce((sum, entry) => sum + entry.bytes.length, 0), adapterLayerHeadroomBytes: 50 * MIB,
    files: entries.map(({ name, bytes, mode }) => ({ name, bytes: bytes.length, mode: mode.toString(8) }))
  };
  await writeFile(`${resolvedOutput}.manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}
async function main() {
  const options = {};
  for (let i = 2; i < process.argv.length; i += 2) {
    const key = ({ "--out-dir": "buildOut", "--output": "output" })[process.argv[i]];
    if (!key || !process.argv[i + 1]) throw new Error("Use --out-dir <directory> and/or --output <zip path>.");
    options[key] = process.argv[i + 1];
  }
  const manifest = await packageLambda(options);
  console.info(`Preview package ready: ${manifest.files.length} files, ${manifest.zipBytes} ZIP bytes, ${manifest.expandedBytes} expanded bytes.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
