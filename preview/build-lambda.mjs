import { spawn } from "node:child_process";
import { copyFile, lstat, mkdir, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const STAGING_DIRECTORY = ".preview-lambda-build";
const COMMON_SOURCES = [
  "app/layout.tsx", "app/globals.css", "app/preview/page.tsx", "app/preview/PreviewClient.tsx",
  "app/components/Header.tsx", "app/components/Footer.tsx",
  "package.json", "package-lock.json", "tsconfig.json", "postcss.config.mjs", "next.config.ts",
];
const PLANS = Object.freeze({
  "ksc-site": {
    sources: [
      "app/preview/preview.module.css", "app/components/EventArticle.tsx",
      "libs/types.ts", "libs/formatEventDate.ts", "libs/previewInput.ts", "libs/previewContent.ts",
      "libs/renderEventContent.ts", "libs/renderArticleContent.ts",
    ],
    assets: ["favicon.ico", "favicon-32.png", "favicon.png", "apple-touch-icon.png", "images/events/kansta-logo.png"],
  },
  "novolba-site": {
    sources: [
      "app/components/WithArticleView.tsx", "app/components/NewsArticleView.tsx", "app/media/constants.ts",
      "libs/client.ts", "libs/microcmsAssets.ts", "libs/articlePresentation.ts", "libs/extractFirstImage.ts", "libs/articlePath.ts",
      "libs/renderArticleContent.ts", "libs/restoredArticleImages.ts", "libs/previewRequest.ts", "libs/previewContent.ts",
    ],
    assets: ["logo.png", "NovolBa_logo_sq_wt-2.webp"],
  },
});

// The preview shell needs no CMS/AWS credentials, NODE_OPTIONS hooks, or .env files.
export function buildEnvironment(input = process.env) {
  const permitted = new Set([
    "path", "systemroot", "windir", "comspec", "pathext", "temp", "tmp", "tmpdir",
    "home", "userprofile", "localappdata", "appdata", "number_of_processors", "processor_architecture",
    "ci", "lang", "lc_all", "lc_ctype", "tz",
  ]);
  const environment = Object.fromEntries(Object.entries(input).filter(([name]) => permitted.has(name.toLowerCase())));
  return { ...environment, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1" };
}

async function copyReviewedFile(root, relative, destinationRoot) {
  const source = path.resolve(root, relative);
  if (await realpath(source) !== source || !(await lstat(source)).isFile()) {
    throw new Error("Preview build source must be a regular file within the repository.");
  }
  const destination = path.resolve(destinationRoot, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

export async function prepareLambdaBuild(repositoryRoot) {
  const root = await realpath(path.resolve(repositoryRoot));
  const packageData = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  const plan = PLANS[packageData.name];
  if (!plan) throw new Error("Unsupported preview build project.");
  const stage = path.join(root, STAGING_DIRECTORY);
  // Only this fixed generated directory may be replaced; never follow a junction.
  try {
    const existing = await lstat(stage);
    if (!existing.isDirectory() || existing.isSymbolicLink() || await realpath(stage) !== stage) {
      throw new Error("Preview staging path is not a regular repository directory.");
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (path.dirname(stage) !== root || path.basename(stage) !== STAGING_DIRECTORY) {
    throw new Error("Invalid preview staging directory.");
  }
  await rm(stage, { recursive: true, force: true });
  await mkdir(stage, { recursive: true });
  for (const relative of [...COMMON_SOURCES, ...plan.sources]) await copyReviewedFile(root, relative, stage);
  for (const asset of plan.assets) await copyReviewedFile(root, `public/${asset}`, stage);
  // Tailwind ignores generated/gitignored folders unless these sources are explicit.
  const stylesheet = path.join(stage, "app", "globals.css");
  await writeFile(stylesheet, `${await readFile(stylesheet, "utf8")}\n@source ".";\n@source "../libs";\n`, "utf8");
  return { root, stage, output: path.join(stage, "out") };
}

export async function verifyLambdaBuildOutput(output) {
  const root = await realpath(output);
  const htmlPaths = [];
  async function visit(directory, prefix = "") {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = `${prefix}${entry.name}`;
      const target = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error("Preview build output must not contain symlinks.");
      if (entry.isDirectory()) await visit(target, `${relative}/`);
      else if (entry.isFile()) {
        if (/\.html$/i.test(relative)) htmlPaths.push(relative);
        if (/preview-mock-build|\.preview-mock|\.(?:pdf|heic)$/i.test(relative)) {
          throw new Error("Unexpected mock or unrelated asset in preview build output.");
        }
      }
    }
  }
  await visit(root);
  const allowed = new Set(["preview/index.html", "404.html", "404/index.html", "500.html", "_not-found/index.html", "_global-error/index.html"]);
  if (!htmlPaths.includes("preview/index.html") || htmlPaths.some((relative) => !allowed.has(relative))) {
    throw new Error("Preview build output contains an unexpected route or lacks the preview shell.");
  }
  const shell = await readFile(path.join(root, "preview", "index.html"), "utf8");
  if (!shell.includes("記事プレビュー") || /preview-mock-build|fixture-key|mock-preview/i.test(shell)) {
    throw new Error("Preview shell was not built from the approved source.");
  }
  return { htmlPaths };
}

export async function buildLambdaShell(repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")) {
  const prepared = await prepareLambdaBuild(repositoryRoot);
  const cli = path.join(prepared.root, "node_modules", "next", "dist", "bin", "next");
  if (!(await lstat(cli)).isFile()) throw new Error("Install the locked build dependencies first.");
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, "build", prepared.stage, "--webpack"], {
      cwd: prepared.stage, env: buildEnvironment(), stdio: "inherit", windowsHide: true,
    });
    child.once("error", () => reject(new Error("Preview shell build could not start.")));
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error("Preview shell build failed.")));
  });
  await verifyLambdaBuildOutput(prepared.output);
  return prepared;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await buildLambdaShell();
    console.info("Preview-only static shell built without CMS credentials or fixture data.");
  } catch {
    console.error("Preview-only shell build failed. Check the reviewed source and locked dependencies.");
    process.exitCode = 1;
  }
}
