import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildEnvironment, prepareLambdaBuild, STAGING_DIRECTORY, verifyLambdaBuildOutput } from "./build-lambda.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const digest = (contents) => createHash("sha256").update(contents).digest("hex");

test("preview build subprocess receives only build essentials, never credentials or preload hooks", () => {
  const env = buildEnvironment({
    Path: "build-bin", TEMP: "temp", CI: "true", MICROCMS_API_KEY: "fake-key",
    MICROCMS_SERVICE_DOMAIN: "fixture-service", AWS_SESSION_TOKEN: "fake-token",
    PREVIEW_BASIC_PASSWORD: "fake-password", NODE_OPTIONS: "--require fake-fixture.cjs",
    NEXT_PUBLIC_FAKE_KEY: "fake-key", CUSTOM_TOKEN: "fake-token",
  });
  assert.deepEqual(env, { Path: "build-bin", TEMP: "temp", CI: "true", NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1" });
});

test("the real reviewed source stages only preview routes and leaves production inputs unchanged", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "preview-shell-source-"));
  try {
    const packageData = JSON.parse(await readFile(path.join(repositoryRoot, "package.json"), "utf8"));
    // Use the real source allowlist, without building or fetching any CMS data.
    const { cp } = await import("node:fs/promises");
    for (const relative of ["app", "libs", "public", "package.json", "package-lock.json", "tsconfig.json", "postcss.config.mjs", "next.config.ts"]) {
      await cp(path.join(repositoryRoot, relative), path.join(fixture, relative), { recursive: true });
    }
    await writeFile(path.join(fixture, ".env.local"), "MICROCMS_API_KEY=fake-file-secret\n", "utf8");
    const before = await Promise.all(["app/layout.tsx", "app/globals.css", "next.config.ts"].map(async (name) => digest(await readFile(path.join(fixture, name)))));
    const result = await prepareLambdaBuild(fixture);
    assert.equal(result.output, path.join(fixture, STAGING_DIRECTORY, "out"));
    const after = await Promise.all(["app/layout.tsx", "app/globals.css", "next.config.ts"].map(async (name) => digest(await readFile(path.join(fixture, name)))));
    assert.deepEqual(after, before);
    assert.ok(!(await readdir(result.stage)).some((name) => name.startsWith(".env") || name === "node_modules"));
    const appEntries = await readdir(path.join(result.stage, "app"));
    assert.ok(appEntries.includes("preview"));
    assert.ok(!appEntries.includes("page.tsx"));
    assert.ok(!appEntries.includes("events") && !appEntries.includes("news") && !appEntries.includes("with"));
    const css = await readFile(path.join(result.stage, "app", "globals.css"), "utf8");
    assert.match(css, /@source "\.";/);
    assert.match(css, /@source "\.\.\/libs";/);
    const publicEntries = await readdir(path.join(result.stage, "public"));
    assert.ok(!publicEntries.some((name) => /\.pdf$/i.test(name)));
    if (packageData.name === "novolba-site") assert.deepEqual(publicEntries.sort(), ["NovolBa_logo_sq_wt-2.webp", "logo.png"].sort());
  } finally { await rm(fixture, { recursive: true, force: true }); }
});

test("a staging symlink or junction is rejected without touching its destination", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "preview-shell-path-"));
  const elsewhere = await mkdtemp(path.join(os.tmpdir(), "preview-shell-elsewhere-"));
  try {
    await writeFile(path.join(fixture, "package.json"), '{"name":"ksc-site"}', "utf8");
    await writeFile(path.join(elsewhere, "retain.txt"), "retain", "utf8");
    await symlink(elsewhere, path.join(fixture, STAGING_DIRECTORY), process.platform === "win32" ? "junction" : "dir");
    await assert.rejects(prepareLambdaBuild(fixture), /staging path/);
    assert.equal(await readFile(path.join(elsewhere, "retain.txt"), "utf8"), "retain");
  } finally { await rm(fixture, { recursive: true, force: true }); await rm(elsewhere, { recursive: true, force: true }); }
});

test("output validation rejects public article routes, missing shells and unrelated large assets", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "preview-shell-output-"));
  try {
    await mkdir(path.join(fixture, "preview"));
    await assert.rejects(verifyLambdaBuildOutput(fixture), /lacks the preview shell/);
    await writeFile(path.join(fixture, "preview", "index.html"), "<html>記事プレビュー</html>", "utf8");
    await verifyLambdaBuildOutput(fixture);
    await mkdir(path.join(fixture, "404"));
    await writeFile(path.join(fixture, "404", "index.html"), "Next built-in missing page", "utf8");
    await verifyLambdaBuildOutput(fixture);
    await mkdir(path.join(fixture, "news"));
    await writeFile(path.join(fixture, "news", "index.html"), "unrelated article", "utf8");
    await assert.rejects(verifyLambdaBuildOutput(fixture), /unexpected route/);
    await rm(path.join(fixture, "news"), { recursive: true });
    await writeFile(path.join(fixture, "catalog.pdf"), "unrelated", "utf8");
    await assert.rejects(verifyLambdaBuildOutput(fixture), /unrelated asset/);
  } finally { await rm(fixture, { recursive: true, force: true }); }
});
