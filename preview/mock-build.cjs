"use strict";

// Test-only preload for `NODE_OPTIONS=--require=./preview/mock-build.cjs`.
// Use PREVIEW_MOCK_BUILD=1, MICROCMS_SERVICE_DOMAIN=microcms-demo,
// MICROCMS_API_KEY=mock-build-key, and NEXT_TELEMETRY_DISABLED=1.
// Every fetch is handled here or rejected; no request falls through to a network.
if (process.env.PREVIEW_MOCK_BUILD !== "1") {
  throw new Error("mock-build.cjs is test-only; PREVIEW_MOCK_BUILD=1 is required.");
}
if (process.env.MICROCMS_SERVICE_DOMAIN !== "microcms-demo") {
  throw new Error("Mock builds must use MICROCMS_SERVICE_DOMAIN=microcms-demo.");
}
if (process.env.MICROCMS_API_KEY !== "mock-build-key") {
  throw new Error("Mock builds must use the placeholder MICROCMS_API_KEY=mock-build-key.");
}

const timestamps = {
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  publishedAt: "2026-01-02T00:00:00.000Z",
  revisedAt: "2026-01-02T00:00:00.000Z",
};
const categories = [
  { ...timestamps, id: "announcements", name: "Announcements" },
  { ...timestamps, id: "users-voice", name: "User's Voice" },
];
const withCategories = [
  "\u30a4\u30f3\u30bf\u30d3\u30e5\u30fc",
  "\u30a4\u30d9\u30f3\u30c8",
  "\u30ec\u30dd\u30fc\u30c8",
  "\u901f\u5831\u30a4\u30f3\u30bf\u30d3\u30e5\u30fc",
  "\u5bfe\u8ac7",
  "\u30b9\u30bf\u30fc\u30c8\u30a2\u30c3\u30d7\u6607\u308b\u5834",
  "\u30b3\u30e9\u30e0",
];
const withArticles = withCategories.map((category, index) => ({
  ...timestamps,
  id: ["ro-jkc4eqh", "vq8cy5oohds", "l9c6pmq0cht"][index] ?? `mock-with-${index + 1}`,
  slug: `mock-with-slug-${index + 1}`,
  title: `Mock WITH article ${index + 1}`,
  content: '<h2>Mock article heading</h2><p>Fixture content for static build verification.</p><img src="/header.img.png" alt="Fixture" />',
  category,
  author: "Mock author",
  pickup: index < 3,
  eyecatch: { url: "/header.img.png", width: 1200, height: 630 },
}));
const blogs = Array.from({ length: 4 }, (_, index) => ({
  ...timestamps,
  id: `mock-blog-${index + 1}`,
  slug: `mock-news-slug-${index + 1}`,
  title: `Mock news article ${index + 1}`,
  content: '<h2>Mock news heading</h2><p>Fixture content for static build verification.</p>',
  category: categories[index === 3 ? 1 : 0],
  author: "Mock author",
  eyecatch: { url: "/header.img.png", width: 1200, height: 630 },
}));
const services = [
  {
    ...timestamps,
    id: "mock-service",
    title: "Mock service",
    description: "Static build fixture",
    image: { url: "/header.img.png", width: 1200, height: 630 },
    bullets: ["Fixture only"],
  },
];
const fixtureCollections = { with: withArticles, blogs, categories, services };

function selectFields(value, fields) {
  if (!fields) return value;
  return Object.fromEntries(fields.split(",").map((field) => [field, value[field]]));
}

function filterRecords(records, filters) {
  if (!filters) return records;
  // These are the predicates used by the current public site. Fail when a new
  // unsupported query is introduced so a mock build cannot silently mislead.
  if (filters === "category[exists]") return records.filter((record) => record.category);
  const categoryId = /^category\[equals\]([a-zA-Z0-9_-]+)$/.exec(filters)?.[1];
  if (categoryId) return records.filter((record) => record.category?.id === categoryId);
  throw new Error("The mock build does not implement this filter.");
}

globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  const method = (init?.method ?? (typeof input === "object" ? input.method : undefined) ?? "GET").toUpperCase();
  if (url.origin !== "https://microcms-demo.microcms.io" || method !== "GET") {
    throw new Error("Network fetch blocked by the test-only mock build.");
  }
  const path = /^\/api\/v1\/(with|blogs|categories|services)(?:\/([a-zA-Z0-9_-]+))?$/.exec(url.pathname);
  if (!path || url.searchParams.has("draftKey")) {
    throw new Error("Unexpected microCMS request blocked by the test-only mock build.");
  }
  const [, endpoint, contentId] = path;
  const collection = fixtureCollections[endpoint];
  const headers = { "content-type": "application/json", "cache-control": "no-store" };
  if (contentId) {
    const record = collection.find((value) => value.id === contentId);
    return new Response(JSON.stringify(record ? selectFields(record, url.searchParams.get("fields")) : { message: "Not found" }), { status: record ? 200 : 404, headers });
  }
  let records = filterRecords(collection, url.searchParams.get("filters"));
  const ids = url.searchParams.get("ids")?.split(",");
  if (ids) records = records.filter((record) => ids.includes(record.id));
  const orders = url.searchParams.get("orders");
  if (orders) {
    const descending = orders.startsWith("-");
    const field = orders.replace(/^-/, "");
    records = [...records].sort((first, second) => String(first[field] ?? "").localeCompare(String(second[field] ?? "")) * (descending ? -1 : 1));
  }
  const offset = Number(url.searchParams.get("offset") ?? 0);
  const limit = Number(url.searchParams.get("limit") ?? 10);
  if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Unexpected pagination blocked by the test-only mock build.");
  }
  return new Response(JSON.stringify({
    contents: records.slice(offset, offset + limit).map((record) => selectFields(record, url.searchParams.get("fields"))),
    totalCount: records.length,
    offset,
    limit,
  }), { status: 200, headers });
};
