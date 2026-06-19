import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = process.env.NEXT_EXPORT_OUT_DIR || "out";

async function listFiles(dir, files = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await listFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function copyIfDifferent(source, target) {
  const sourceStat = await stat(source);
  try {
    const targetStat = await stat(target);
    if (targetStat.size === sourceStat.size) return false;
  } catch {
    // Missing target; create it below.
  }

  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
  return true;
}

function flatToNestedTarget(file) {
  const dir = path.dirname(file);
  const name = path.basename(file);
  if (!name.startsWith("__next.") || !name.endsWith(".txt")) return null;

  const parts = name.slice(0, -4).split(".");
  if (parts.length < 3) return null;

  const routePayload = `${parts[0]}.${parts[1]}`;
  const nestedParts = parts.slice(2);
  const leaf = nestedParts.pop();
  if (!leaf) return null;

  return path.join(dir, routePayload, ...nestedParts, `${leaf}.txt`);
}

function nestedToFlatTarget(file) {
  const name = path.basename(file);
  const parts = path.normalize(file).split(path.sep);
  const payloadIndex = parts.findLastIndex((part) => part.startsWith("__next."));
  if (payloadIndex === -1) return null;

  const routeDir = parts.slice(0, payloadIndex).join(path.sep);
  const flatName = [...parts.slice(payloadIndex, -1), name].join(".");
  return path.join(routeDir, flatName);
}

async function main() {
  const files = await listFiles(OUT_DIR);
  let copied = 0;

  for (const file of files) {
    const targets = [flatToNestedTarget(file), nestedToFlatTarget(file)].filter(Boolean);
    for (const target of targets) {
      if (await copyIfDifferent(file, target)) copied++;
    }
  }

  console.log(`next export payload aliases created: ${copied}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
