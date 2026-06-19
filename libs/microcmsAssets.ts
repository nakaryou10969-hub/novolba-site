const MICROCMS_ASSET_BASE = "https://images.microcms-assets.io/assets/";

export const MICROCMS_ASSET_PUBLIC_BASE = (
  process.env.MICROCMS_ASSET_PUBLIC_BASE || "https://novolba.com/microcms-assets"
).replace(/\/$/, "");

const MIRRORED_ASSET_BASE = `${MICROCMS_ASSET_PUBLIC_BASE}/assets/`;

export function toMirroredMicrocmsAssetUrl(url: string) {
  return url.startsWith(MICROCMS_ASSET_BASE)
    ? `${MIRRORED_ASSET_BASE}${url.slice(MICROCMS_ASSET_BASE.length)}`
    : url;
}

export function mirrorMicrocmsAssetUrlsInString(value: string) {
  return value.includes(MICROCMS_ASSET_BASE)
    ? value.split(MICROCMS_ASSET_BASE).join(MIRRORED_ASSET_BASE)
    : value;
}

export function mirrorMicrocmsAssetsInValue<T>(value: T): T {
  if (typeof value === "string") {
    return mirrorMicrocmsAssetUrlsInString(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => mirrorMicrocmsAssetsInValue(item)) as T;
  }

  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = mirrorMicrocmsAssetsInValue(item);
    }
    return next as T;
  }

  return value;
}
