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
  const match = name.match(/^(__next\.[^.]+)\.(\$d[^.]+)(?:\.(.+))?\.txt$/);
  if (!match) return null;

  const [, routePayload, dynamicSegment, leaf] = match;
  if (leaf) {
    return path.join(dir, routePayload, dynamicSegment, `${leaf}.txt`);
  }
  return path.join(dir, routePayload, `${dynamicSegment}.txt`);
}

function nestedToFlatTarget(file) {
  const name = path.basename(file);
  const parent = path.basename(path.dirname(file));
  const grandParent = path.basename(path.dirname(path.dirname(file)));

  if (parent.startsWith("$d") && grandParent.startsWith("__next.")) {
    const routeDir = path.dirname(path.dirname(path.dirname(file)));
    return path.join(routeDir, `${grandParent}.${parent}.${name}`);
  }

  if (name.startsWith("$d") && name.endsWith(".txt") && parent.startsWith("__next.")) {
    const routeDir = path.dirname(path.dirname(file));
    return path.join(routeDir, `${parent}.${name}`);
  }

  return null;
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
