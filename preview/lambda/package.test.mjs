import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { inflateRawSync } from "node:zlib";
import { collectEntries, LIMITS, packageLambda } from "../package-lambda.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "preview-package-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "preview/lambda"), { recursive: true });
  await mkdir(path.join(root, "out/preview"), { recursive: true });
  await mkdir(path.join(root, "out/_next/static"), { recursive: true });
  await writeFile(path.join(root, "preview/server.mjs"), "// public test fixture\n");
  await writeFile(path.join(root, "preview/site-config.mjs"), "// public test fixture\n");
  await writeFile(path.join(root, "preview/lambda/run.sh"), "#!/bin/sh\r\nexec node preview/server.mjs\r\n");
  await writeFile(path.join(root, "out/preview/index.html"), "<!doctype html><p>Preview shell</p>");
  await writeFile(path.join(root, "out/_next/static/app.js"), "console.log('public test fixture');");
  return root;
}
function parseZip(bytes) {
  const files = new Map(); let position = 0;
  while (bytes.readUInt32LE(position) === 0x04034b50) {
    const compressed = bytes.readUInt32LE(position + 18); const nameLength = bytes.readUInt16LE(position + 26);
    const extraLength = bytes.readUInt16LE(position + 28); const start = position + 30;
    const name = bytes.subarray(start, start + nameLength).toString("utf8");
    const contentStart = start + nameLength + extraLength;
    files.set(name, { bytes: inflateRawSync(bytes.subarray(contentStart, contentStart + compressed)) });
    position = contentStart + compressed;
  }
  while (bytes.readUInt32LE(position) === 0x02014b50) {
    const nameLength = bytes.readUInt16LE(position + 28); const extraLength = bytes.readUInt16LE(position + 30); const commentLength = bytes.readUInt16LE(position + 32);
    const name = bytes.subarray(position + 46, position + 46 + nameLength).toString("utf8");
    files.get(name).mode = (bytes.readUInt32LE(position + 38) >>> 16) & 0o777;
    position += 46 + nameLength + extraLength + commentLength;
  }
  assert.equal(bytes.readUInt32LE(position), 0x06054b50);
  return files;
}
test("ZIP has only approved runtime and preview documents, with Linux executable LF startup", async (t) => {
  const root = await fixture(t);
  await writeFile(path.join(root, "out/index.html"), "Published article HTML must not ship");
  await writeFile(path.join(root, "out/index.txt"), "Published RSC must not ship");
  const output = path.join(root, "package.zip");
  const manifest = await packageLambda({ root, buildOut: path.join(root, "out"), output });
  const files = parseZip(await readFile(output));
  assert.equal(files.get("run.sh").mode, 0o755);
  assert.equal(files.get("run.sh").bytes.includes(13), false);
  assert.equal(files.has("out/index.html"), false); assert.equal(files.has("out/index.txt"), false);
  assert.deepEqual([...files.keys()].sort(), ["out/_next/static/app.js", "out/preview/index.html", "preview/server.mjs", "preview/site-config.mjs", "run.sh"].sort());
  assert.equal(manifest.adapterLayerHeadroomBytes, 50 * 1024 * 1024);
  assert.equal((await readFile(`${output}.manifest.json`, "utf8")).includes("MICROCMS_API_KEY"), false);
});
test("packaging rejects mock build markers and secret/source/map files", async (t) => {
  const root = await fixture(t); const buildOut = path.join(root, "out");
  for (const name of ["preview-mock-build.txt", ".preview-mock", ".env", "source.ts", "app.js.map"]) {
    await writeFile(path.join(buildOut, name), "public test fixture");
    await assert.rejects(collectEntries(buildOut, root));
    await rm(path.join(buildOut, name));
  }
});
test("packaging rejects an asset too large for base64 buffered Lambda responses", async (t) => {
  const root = await fixture(t);
  await writeFile(path.join(root, "out/large.pdf"), Buffer.alloc(LIMITS.asset + 1));
  await assert.rejects(collectEntries(path.join(root, "out"), root), /buffered response limit/);
});
test("package output cannot be written into the build output", async (t) => {
  const root = await fixture(t);
  await assert.rejects(packageLambda({ root, buildOut: path.join(root, "out"), output: path.join(root, "out/package.zip") }), /outside/);
});
