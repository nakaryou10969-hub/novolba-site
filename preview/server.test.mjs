import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer, request } from "node:http";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, writeFile, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createPreviewServer, parsePreviewInput, readConfig } from "./server.mjs";
import { SITE } from "./site-config.mjs";

const endpoint = SITE.endpoints[0];
const env = {
  MICROCMS_SERVICE_DOMAIN: "test-service", MICROCMS_API_KEY: "test-only-api-key",
  PREVIEW_PUBLIC_ORIGIN: "https://preview.example.test", PREVIEW_PORT: "3001",
};
const input = { endpoint, contentId: "article_1", draftKey: "test-draft-one" };

async function listen(server) {
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  return server.address().port;
}

async function fixture(t, options = {}) {
  const directory = await mkdtemp(path.join(tmpdir(), "microcms-preview-test-"));
  const root = path.join(directory, "out");
  await mkdir(path.join(root, "preview"), { recursive: true });
  const script = "globalThis.testPreview = true;";
  const bootstrap = "(self.__next_f=self.__next_f||[]).push([0])";
  await writeFile(path.join(root, "preview", "index.html"), `<html><body><script>${script}</script><script>${bootstrap}</script></body></html>`);
  await mkdir(path.join(root, "articles", "published"), { recursive: true });
  const cmsScript = "globalThis.untrustedCmsScript = true;";
  const publicHtml = `<html><body>PUBLIC_CMS_BODY<script>${cmsScript}</script></body></html>`;
  await writeFile(path.join(root, "articles", "published", "index.html"), publicHtml);
  await writeFile(path.join(root, "index.html"), publicHtml);
  await writeFile(path.join(root, "404.html"), publicHtml);
  await writeFile(path.join(root, ".env.local"), "MUST_NOT_BE_SERVED");
  await writeFile(path.join(root, "server.mjs"), "MUST_NOT_BE_SERVED");
  await writeFile(path.join(root, "bundle.js.map"), "MUST_NOT_BE_SERVED");
  await writeFile(path.join(root, "asset.css"), "body {color:black}");
  const upstreamCalls = [];
  const upstream = createServer((req, res) => {
    const url = new URL(req.url, "http://mock.invalid");
    upstreamCalls.push({ url, headers: req.headers });
    if (url.searchParams.get("fields") === "id" && !options.acceptInvalidKey) {
      res.statusCode = 404; res.end(); return;
    }
    if (options.upstream) return options.upstream(req, res, url);
    if (!["test-draft-one", "test-edited-published"].includes(url.searchParams.get("draftKey"))) {
      res.statusCode = 404; res.end(); return;
    }
    const published = url.searchParams.get("draftKey") === "test-edited-published";
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ id: "article_1", title: published ? "Edited published draft" : "Unpublished draft",
      content: "<p>Draft body</p>", ...(published ? { publishedAt: "2026-01-01T00:00:00.000Z" } : {}),
      apiKey: "MUST_NOT_BE_RETURNED", draftKey: "MUST_NOT_BE_RETURNED", secretCustomField: "MUST_NOT_BE_RETURNED",
      eyecatch: { url: "https://images.microcms-assets.io/assets/test/image.png", width: 100, height: 50, secret: "MUST_NOT_BE_RETURNED" } }));
  });
  const upstreamPort = await listen(upstream);
  const fetchImpl = (url, init) => {
    const target = new URL(url);
    assert.equal(target.origin, "https://test-service.microcms.io");
    assert.equal(init.cache, "no-store");
    assert.equal(init.redirect, "error");
    return fetch(`http://127.0.0.1:${upstreamPort}${target.pathname}${target.search}`, init);
  };
  const server = await createPreviewServer({ config: readConfig(env, root), fetchImpl,
    ...(options.timeout ? { upstreamTimeoutMs: options.timeout } : {}) });
  const port = await listen(server);
  t.after(async () => {
    for (const instance of [server, upstream]) { instance.closeAllConnections(); await new Promise((resolve) => instance.close(resolve)); }
    await rm(directory, { recursive: true, force: true });
  });
  const call = (route = "/api/preview", extra = {}) => new Promise((resolve, reject) => {
    const isApi = route.startsWith("/api/preview");
    const body = extra.body ?? (isApi ? JSON.stringify(input) : undefined);
    const headers = { Host: "preview.example.test",
      ...(isApi ? { Origin: env.PREVIEW_PUBLIC_ORIGIN, "Content-Type": "application/json", "X-Preview-Request": "1" } : {}),
      ...extra.headers };
    for (const key of Object.keys(headers)) if (headers[key] === undefined) delete headers[key];
    const req = request({ hostname: "127.0.0.1", port, path: route, method: extra.method || (isApi ? "POST" : "GET"), headers }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, text: Buffer.concat(chunks).toString("utf8") }));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.end(body);
  });
  return { call, upstreamCalls, root, directory, script, bootstrap, cmsScript };
}

function privateHeaders(response) {
  assert.match(response.headers["cache-control"], /private/);
  assert.match(response.headers["cache-control"], /no-store/);
  assert.equal(response.headers["surrogate-control"], "no-store");
  assert.equal(response.headers["referrer-policy"], "no-referrer");
  assert.match(response.headers["x-robots-tag"], /noindex/);
  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.equal(response.headers["access-control-allow-origin"], undefined);
}

test("configuration fails closed and never includes provided secrets in validation errors", () => {
  for (const key of ["MICROCMS_SERVICE_DOMAIN", "MICROCMS_API_KEY", "PREVIEW_PUBLIC_ORIGIN"]) {
    assert.throws(() => readConfig({ ...env, [key]: "" }), /missing or invalid/);
  }
  for (const value of ["http://preview.example.test", "https://user:password@preview.example.test", "https://preview.example.test/path", "https://preview.example.test/?draftKey=x", "https://preview.example.test#x"]) {
    assert.throws(() => readConfig({ ...env, PREVIEW_PUBLIC_ORIGIN: value }), /HTTPS origin/);
  }
  assert.throws(() => readConfig({ ...env, MICROCMS_SERVICE_DOMAIN: "evil.test/path" }), /MICROCMS_SERVICE_DOMAIN/);
  assert.throws(() => readConfig({ ...env, PREVIEW_PORT: "3001invalid" }), /PREVIEW_PORT/);
  assert.throws(() => readConfig({ ...env, PREVIEW_HOST: "0.0.0.0", PREVIEW_PUBLIC_ORIGIN: "http://localhost:3001" }), /HTTPS origin/);
  const local = readConfig({ ...env, PREVIEW_PUBLIC_ORIGIN: "http://127.0.0.1:3001" });
  assert.equal(local.host, "127.0.0.1");
  assert.equal(local.publicHost, "127.0.0.1:3001");
});

test("request parser rejects unknown, duplicate, nested, malformed and invalid token fields", () => {
  const malformed = ["{}", "[]", "null", "", JSON.stringify({ ...input, url: "https://evil.invalid" }),
    `{"endpoint":"${endpoint}","contentId":"article_1","draftKey":"x","draftKey":"y"}`,
    `{"endpoint":"${endpoint}","contentId":"article_1","draftKey":"x","\\u0064raftKey":"y"}`,
    JSON.stringify({ ...input, contentId: "../secret" }), JSON.stringify({ ...input, contentId: "a".repeat(129) }),
    JSON.stringify({ ...input, endpoint: "https://evil.invalid" }), JSON.stringify({ ...input, draftKey: "" }),
    JSON.stringify({ ...input, draftKey: "a".repeat(513) }), JSON.stringify({ ...input, draftKey: "x\n" }),
    JSON.stringify({ ...input, draftKey: "x\u0085" }), JSON.stringify({ ...input, draftKey: "\ud800" }),
    JSON.stringify({ ...input, draftKey: {} }), JSON.stringify({ ...input, contentId: null }),
    `{"endpoint":"${endpoint}","contentId":"article_1","draftKey":"x",}`, JSON.stringify(input) + "false"];
  for (const value of malformed) assert.throws(() => parsePreviewInput(value), /Invalid preview request/);
  assert.equal(parsePreviewInput(JSON.stringify({ ...input, contentId: "A_1-2", draftKey: "opaque+&/= token" })).draftKey, "opaque+&/= token");
  for (const allowed of SITE.endpoints) assert.equal(parsePreviewInput(JSON.stringify({ ...input, endpoint: allowed })).endpoint, allowed);
});

test("shell and assets need no additional login, while missing or wrong draft keys return no content", async (t) => {
  const { call, upstreamCalls } = await fixture(t);
  for (const route of ["/preview/", "/asset.css"]) {
    const response = await call(route);
    assert.equal(response.status, 200); assert.equal(response.headers["www-authenticate"], undefined); privateHeaders(response);
  }
  assert.equal(upstreamCalls.length, 0);
  for (const body of ["{}", JSON.stringify({ endpoint, contentId: input.contentId }), JSON.stringify({ ...input, draftKey: "" })]) {
    const response = await call("/api/preview", { body });
    assert.equal(response.status, 400); assert.ok(!response.text.includes("Draft body")); privateHeaders(response);
  }
  assert.equal(upstreamCalls.length, 0);
  const wrong = await call("/api/preview", { body: JSON.stringify({ ...input, draftKey: "wrong-article-key" }) });
  assert.equal(wrong.status, 404); assert.ok(!wrong.text.includes("Draft body")); privateHeaders(wrong);
});

test("CMS accepting a nonmatching key fails closed without returning any article or reading the real-key body", async (t) => {
  const { call, upstreamCalls } = await fixture(t, { acceptInvalidKey: true,
    upstream: (_req, res) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ id: input.contentId, title: "Private fallback", content: "MUST_NOT_BE_RETURNED" })); } });
  const response = await call();
  assert.equal(response.status, 502); privateHeaders(response);
  assert.equal(upstreamCalls.length, 1);
  assert.equal(upstreamCalls[0].url.searchParams.get("fields"), "id");
  assert.notEqual(upstreamCalls[0].url.searchParams.get("draftKey"), input.draftKey);
  assert.ok(!response.text.includes("MUST_NOT_BE_RETURNED"));
});

test("unpublished content and edits to published content use draftKey without caching or secret fields", async (t) => {
  const { call, upstreamCalls } = await fixture(t);
  const unpublished = await call();
  assert.equal(unpublished.status, 200); privateHeaders(unpublished);
  const content = JSON.parse(unpublished.text).content;
  assert.equal(content.title, "Unpublished draft");
  assert.equal(content.publishedAt, undefined);
  assert.equal(content.apiKey, undefined); assert.equal(content.draftKey, undefined);
  assert.equal(content.secretCustomField, undefined); assert.equal(content.eyecatch.secret, undefined);
  const edited = await call("/api/preview", { body: JSON.stringify({ ...input, draftKey: "test-edited-published" }) });
  assert.equal(edited.status, 200); privateHeaders(edited);
  assert.equal(JSON.parse(edited.text).content.title, "Edited published draft");
  assert.equal(upstreamCalls.length, 4);
  assert.equal(upstreamCalls[0].url.searchParams.get("fields"), "id");
  assert.notEqual(upstreamCalls[0].url.searchParams.get("draftKey"), input.draftKey);
  assert.equal(upstreamCalls[1].url.pathname, `/api/v1/${endpoint}/article_1`);
  assert.equal(upstreamCalls[1].url.searchParams.get("draftKey"), "test-draft-one");
  assert.equal(upstreamCalls[3].url.searchParams.get("draftKey"), "test-edited-published");
  assert.equal(upstreamCalls[1].headers["x-microcms-api-key"], env.MICROCMS_API_KEY);
  assert.equal(upstreamCalls[1].headers["cache-control"], "no-store");
  assert.equal(upstreamCalls[1].url.searchParams.get("fields"), SITE.fields.join(","));
  assert.ok(!unpublished.text.includes(env.MICROCMS_API_KEY));
  assert.ok(!unpublished.text.includes(input.draftKey));
});

const withSchemaDraft = {
  id: input.contentId, title: "Schema-shaped draft", content: "<p>Draft body</p>", slug: "schema-draft",
  category: [], author: [], pickup: false, eyecatch: null,
  createdAt: "2026-10-03T00:00:00.000Z", updatedAt: "2026-10-03T01:00:00.000Z",
  publishedAt: null, revisedAt: "2026-10-03T01:00:00.000Z",
  tag: ["MUST_NOT_BE_RETURNED"], ahthor: ["MUST_NOT_BE_RETURNED"],
};

async function authorFixture(t, author, extra = {}) {
  return fixture(t, { upstream: (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ...withSchemaDraft, author, ...extra }));
  } });
}

test("WITH schema-shaped draft accepts all selected fields with empty selects and a null image", async (t) => {
  const { call, upstreamCalls } = await authorFixture(t, []);
  const response = await call("/api/preview", { body: JSON.stringify({ ...input, endpoint: "with" }) });
  assert.equal(response.status, 200); privateHeaders(response);
  assert.deepEqual(JSON.parse(response.text).content, {
    id: input.contentId, title: withSchemaDraft.title, content: withSchemaDraft.content, slug: withSchemaDraft.slug,
    pickup: false, createdAt: withSchemaDraft.createdAt, updatedAt: withSchemaDraft.updatedAt, revisedAt: withSchemaDraft.revisedAt,
  });
  assert.equal(upstreamCalls.length, 2);
  assert.equal(upstreamCalls[1].url.searchParams.get("fields"), SITE.fields.join(","));
  assert.ok(!response.text.includes("MUST_NOT_BE_RETURNED"));
});

test("WITH author selections normalize the first value after validating every selection and boundary", async (t) => {
  const cases = [
    { author: ["著者"], expected: "著者" },
    { author: ["最初の著者", "次の著者"], expected: "最初の著者" },
    { author: Array.from({ length: 64 }, (_, index) => `著者${index}`), expected: "著者0" },
    { author: ["x".repeat(1000)], expected: "x".repeat(1000) },
    { author: ["first", "x".repeat(1000)], expected: "first" },
    { author: [""], expected: "" },
  ];
  for (const [index, example] of cases.entries()) {
    await t.test(String(index), async (subtest) => {
      const { call } = await authorFixture(subtest, example.author);
      const response = await call("/api/preview", { body: JSON.stringify({ ...input, endpoint: "with" }) });
      assert.equal(response.status, 200); privateHeaders(response);
      assert.equal(JSON.parse(response.text).content.author, example.expected);
    });
  }
});

test("WITH author selections reject malformed elements, nesting and excessive counts or lengths", async (t) => {
  const cases = [[null], [1], [true], [["nested"]], ["valid", {}], ["valid", null],
    ["x".repeat(1001)], ["valid", "x".repeat(1001)], Array.from({ length: 65 }, () => "author"),
    { invalid: "object" }, false, 1];
  for (const [index, author] of cases.entries()) {
    await t.test(String(index), async (subtest) => {
      const { call } = await authorFixture(subtest, author);
      const response = await call("/api/preview", { body: JSON.stringify({ ...input, endpoint: "with" }) });
      assert.equal(response.status, 502); privateHeaders(response);
      assert.deepEqual(JSON.parse(response.text), { error: "Preview content is unavailable." });
    });
  }
});

test("legacy WITH and NEWS author strings retain their existing shapes", async (t) => {
  for (const selectedEndpoint of ["with", "blogs"]) {
    await t.test(selectedEndpoint, async (subtest) => {
      const { call } = await authorFixture(subtest, "Legacy author", {
        category: { id: "category_1", name: "Category" }, publishedAt: "2026-10-02T00:00:00.000Z",
      });
      const response = await call("/api/preview", { body: JSON.stringify({ ...input, endpoint: selectedEndpoint }) });
      assert.equal(response.status, 200); privateHeaders(response);
      assert.equal(JSON.parse(response.text).content.author, "Legacy author");
      assert.equal(JSON.parse(response.text).content.publishedAt, "2026-10-02T00:00:00.000Z");
      assert.ok(!response.text.includes("MUST_NOT_BE_RETURNED"));
    });
  }
});

test("NEWS authors continue to reject arrays", async (t) => {
  for (const [index, author] of [[], ["author"], [{ id: "author_1", name: "Author" }]].entries()) {
    await t.test(String(index), async (subtest) => {
      const { call } = await authorFixture(subtest, author, { category: { id: "category_1", name: "Category" } });
      const response = await call("/api/preview", { body: JSON.stringify({ ...input, endpoint: "blogs" }) });
      assert.equal(response.status, 502); privateHeaders(response);
      assert.deepEqual(JSON.parse(response.text), { error: "Preview content is unavailable." });
    });
  }
});

async function categoryFixture(t, category) {
  return fixture(t, { upstream: (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ id: input.contentId, title: "Category draft", content: "<p>Draft body</p>", category }));
  } });
}

test("WITH select categories normalize single selections from real CMS responses", async (t) => {
  const { call, upstreamCalls } = await categoryFixture(t, ["お知らせ"]);
  const response = await call("/api/preview", { body: JSON.stringify({ ...input, endpoint: "with" }) });
  assert.equal(response.status, 200); privateHeaders(response);
  assert.equal(JSON.parse(response.text).content.category, "お知らせ");
  assert.equal(upstreamCalls.length, 2);
});

test("WITH select categories omit empty selections and use the first of multiple validated selections", async (t) => {
  const cases = [
    { category: [], expected: undefined },
    { category: ["最初", "次の選択"], expected: "最初" },
    { category: Array.from({ length: 64 }, (_, index) => `選択${index}`), expected: "選択0" },
    { category: ["x".repeat(200)], expected: "x".repeat(200) },
  ];
  for (const [index, example] of cases.entries()) {
    await t.test(String(index), async (subtest) => {
      const { call } = await categoryFixture(subtest, example.category);
      const response = await call("/api/preview", { body: JSON.stringify({ ...input, endpoint: "with" }) });
      assert.equal(response.status, 200); privateHeaders(response);
      const content = JSON.parse(response.text).content;
      assert.equal(content.category, example.expected);
      assert.equal(Object.hasOwn(content, "category"), example.expected !== undefined);
    });
  }
});

test("WITH select categories reject malformed elements, nesting and excessive counts or lengths", async (t) => {
  const cases = [[null], [1], [true], [["nested"]], ["valid", {}], ["valid", "x".repeat(201)],
    Array.from({ length: 65 }, () => "selection"), { invalid: "object" }];
  for (const [index, category] of cases.entries()) {
    await t.test(String(index), async (subtest) => {
      const { call } = await categoryFixture(subtest, category);
      const response = await call("/api/preview", { body: JSON.stringify({ ...input, endpoint: "with" }) });
      assert.equal(response.status, 502); privateHeaders(response);
      assert.deepEqual(JSON.parse(response.text), { error: "Preview content is unavailable." });
    });
  }
});

test("legacy category strings and NEWS reference objects retain their existing shapes", async (t) => {
  const cases = [
    { endpoint: "with", category: "Legacy category" },
    { endpoint: "blogs", category: { id: "category_1", name: "NEWS category", privateField: "MUST_NOT_BE_RETURNED" },
      expected: { id: "category_1", name: "NEWS category" } },
  ];
  for (const example of cases) {
    await t.test(example.endpoint, async (subtest) => {
      const { call } = await categoryFixture(subtest, example.category);
      const response = await call("/api/preview", { body: JSON.stringify({ ...input, endpoint: example.endpoint }) });
      assert.equal(response.status, 200); privateHeaders(response);
      assert.deepEqual(JSON.parse(response.text).content.category, example.expected ?? example.category);
      assert.ok(!response.text.includes("MUST_NOT_BE_RETURNED"));
    });
  }
});

test("NEWS categories continue to reject arrays", async (t) => {
  for (const [index, category] of [[], ["category"], [{ id: "category_1", name: "Category" }]].entries()) {
    await t.test(String(index), async (subtest) => {
      const { call } = await categoryFixture(subtest, category);
      const response = await call("/api/preview", { body: JSON.stringify({ ...input, endpoint: "blogs" }) });
      assert.equal(response.status, 502); privateHeaders(response);
      assert.deepEqual(JSON.parse(response.text), { error: "Preview content is unavailable." });
    });
  }
});

test("each explicitly allowlisted endpoint works and other endpoints never reach upstream", async (t) => {
  const { call, upstreamCalls } = await fixture(t);
  for (const allowed of SITE.endpoints) {
    assert.equal((await call("/api/preview", { body: JSON.stringify({ ...input, endpoint: allowed }) })).status, 200);
  }
  for (const denied of ["services", "blog/other", "with?url=evil", ...(SITE.endpoints.includes("blog") ? ["blogs", "with"] : ["blog"])]) {
    assert.equal((await call("/api/preview", { body: JSON.stringify({ ...input, endpoint: denied }) })).status, 400);
  }
  assert.equal(upstreamCalls.length, SITE.endpoints.length * 2);
});

test("Origin, host, custom header, method and JSON content type are enforced", async (t) => {
  const { call, upstreamCalls } = await fixture(t);
  for (const origin of [undefined, "null", "https://evil.invalid", "https://preview.example.test.evil.invalid", "https://preview.example.test/"]) {
    const response = await call("/api/preview", { headers: { Origin: origin } });
    assert.equal(response.status, 403); privateHeaders(response);
  }
  assert.equal((await call("/api/preview", { headers: { "X-Preview-Request": undefined } })).status, 403);
  assert.equal((await call("/api/preview", { headers: { Host: "evil.invalid", "X-Forwarded-Host": "preview.example.test" } })).status, 421);
  assert.equal((await call("/api/preview", { method: "GET" })).status, 405);
  assert.equal((await call("/api/preview", { method: "OPTIONS" })).status, 405);
  assert.equal((await call("/api/preview?draftKey=query-value")).status, 403);
  for (const type of [undefined, "text/plain", "application/x-www-form-urlencoded", "application/json; charset=latin1"]) {
    assert.equal((await call("/api/preview", { headers: { "Content-Type": type } })).status, 415);
  }
  assert.equal((await call("/api/preview", { headers: { "Content-Encoding": "gzip" } })).status, 415);
  assert.equal(upstreamCalls.length, 0);
});

test("duplicate sensitive headers are rejected before upstream access", async (t) => {
  const { call, upstreamCalls } = await fixture(t);
  for (const [name, value] of [["Authorization", "unused-header"], ["Origin", env.PREVIEW_PUBLIC_ORIGIN],
    ["Content-Type", "application/json"], ["X-Preview-Request", "1"]]) {
    const response = await call("/api/preview", { headers: { [name]: [value, value] } });
    assert.equal(response.status, 400); privateHeaders(response);
  }
  assert.equal(upstreamCalls.length, 0);
});

test("malformed or oversized request bodies never reach upstream", async (t) => {
  const { call, upstreamCalls } = await fixture(t);
  assert.equal((await call("/api/preview", { body: JSON.stringify({ ...input, arbitrary: "value" }) })).status, 400);
  assert.equal((await call("/api/preview", { body: "{" })).status, 400);
  assert.equal((await call("/api/preview", { body: "x".repeat(4097) })).status, 413);
  assert.equal((await call("/api/preview", { body: "x".repeat(4097), headers: { "Content-Length": "4097" } })).status, 413);
  assert.equal(upstreamCalls.length, 0);
});

test("static output uses hash CSP for Next inline boot scripts and private headers on success and errors", async (t) => {
  const { call, script, bootstrap } = await fixture(t);
  for (const route of ["/preview/", "/preview", "/preview/index.html", "/asset.css", "/missing/"]) {
    const response = await call(route); privateHeaders(response);
    assert.equal(response.status, route === "/missing/" ? 404 : 200);
    if (route.startsWith("/preview")) {
      const hash = createHash("sha256").update(script).digest("base64");
      assert.ok(response.headers["content-security-policy"].includes(`'sha256-${hash}'`));
      const bootHash = createHash("sha256").update(bootstrap).digest("base64");
      assert.ok(response.headers["content-security-policy"].includes(`'sha256-${bootHash}'`));
      assert.match(response.headers["content-security-policy"], /connect-src 'self'/);
      assert.ok(!response.headers["content-security-policy"].includes("script-src 'self' 'unsafe-inline'"));
    }
  }
  const head = await call("/preview/", { method: "HEAD" });
  assert.equal(head.status, 200); assert.equal(head.text, ""); privateHeaders(head);
});

test("public CMS article HTML is unavailable on the dedicated preview origin", async (t) => {
  const { call, cmsScript } = await fixture(t);
  const cmsHash = createHash("sha256").update(cmsScript).digest("base64");
  for (const route of ["/", "/index.html", "/404.html", "/articles/published/", "/articles/published", "/articles/published/index.html"]) {
    const response = await call(route);
    assert.equal(response.status, 404); privateHeaders(response);
    assert.match(response.headers["content-type"], /application\/json/);
    assert.ok(!response.text.includes("PUBLIC_CMS_BODY"));
    assert.ok(!response.text.includes(cmsScript));
    assert.ok(!response.headers["content-security-policy"].includes(cmsHash));
    assert.match(response.headers["content-security-policy"], /default-src 'none'/);
  }
});

test("a symlinked preview directory cannot promote public CMS HTML to the trusted shell", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "microcms-preview-shell-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const root = path.join(directory, "out");
  const article = path.join(root, "articles", "published");
  await mkdir(article, { recursive: true });
  await writeFile(path.join(article, "index.html"), "<script>globalThis.untrustedCmsScript = true;</script>");
  await symlink(article, path.join(root, "preview"), process.platform === "win32" ? "junction" : "dir");
  await assert.rejects(createPreviewServer({ config: readConfig(env, root) }), /Preview shell is unavailable/);
});

test("static path traversal, dotfiles, source files and Windows special paths are blocked", async (t) => {
  const { call } = await fixture(t);
  for (const route of ["/.env.local", "/%2eenv.local", "/server.mjs", "/bundle.js.map", "/../outside.txt", "/%2e%2e/outside.txt",
    "/%252e%252e/outside.txt", "/%2f%2fevil.invalid/x", "/..%5coutside.txt", "/asset.css:secret", "/nul.txt", "/preview./", "/preview%20/"]) {
    const response = await call(route);
    assert.ok([400, 404].includes(response.status)); privateHeaders(response);
    assert.ok(!response.text.includes("MUST_NOT_BE_SERVED"));
  }
});

test("symlink or directory junction cannot escape the static output root", async (t) => {
  const { call, root, directory } = await fixture(t);
  const external = path.join(directory, "external");
  await mkdir(external); await writeFile(path.join(external, "private.txt"), "MUST_NOT_BE_SERVED");
  await symlink(external, path.join(root, "escape"), process.platform === "win32" ? "junction" : "dir");
  const response = await call("/escape/private.txt");
  assert.equal(response.status, 404); privateHeaders(response);
  assert.ok(!response.text.includes("MUST_NOT_BE_SERVED"));
});

test("upstream errors are generic and never forward key, URL or draft token", async (t) => {
  for (const status of [401, 403, 404, 429, 500]) {
    await t.test(String(status), async (subtest) => {
      const { call } = await fixture(subtest, { upstream: (_req, res) => {
        res.statusCode = status; res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: `${env.MICROCMS_API_KEY} ${input.draftKey}` }));
      } });
      const response = await call();
      assert.equal(response.status, status === 404 ? 404 : 502); privateHeaders(response);
      assert.deepEqual(JSON.parse(response.text), { error: "Preview content is unavailable." });
    });
  }
});

test("upstream redirects are never followed", async (t) => {
  const { call, upstreamCalls } = await fixture(t, { upstream: (_req, res) => {
    res.statusCode = 302; res.setHeader("Location", "http://127.0.0.1:9/private"); res.end();
  } });
  const response = await call();
  assert.equal(response.status, 502); privateHeaders(response);
  assert.equal(upstreamCalls.length, 2);
});

test("upstream timeout aborts the draft request", async (t) => {
  const { call } = await fixture(t, { timeout: 50, upstream: () => {} });
  const response = await call();
  assert.equal(response.status, 504); privateHeaders(response);
  assert.deepEqual(JSON.parse(response.text), { error: "Preview content request timed out." });
});

test("upstream JSON shape, type and declared response size are validated", async (t) => {
  const cases = [
    { contentType: "text/html", body: "<html>bad</html>" },
    { contentType: "application/json", body: "not-json" },
    { contentType: "application/json", body: "[]" },
    { contentType: "application/json", body: JSON.stringify({ id: "other", title: "Wrong content" }) },
    { contentType: "application/json", body: JSON.stringify({ id: input.contentId, title: "Title", content: {} }) },
    { contentType: "application/json", body: JSON.stringify({ id: input.contentId, title: "Title", eyecatch: { url: "javascript:alert(1)" } }) },
    { contentType: "application/json", body: "{}", declaredSize: String(2 * 1024 * 1024 + 1) },
  ];
  for (const [index, example] of cases.entries()) {
    await t.test(String(index), async (subtest) => {
      const { call } = await fixture(subtest, { upstream: (_req, res) => {
        res.setHeader("Content-Type", example.contentType);
        if (example.declaredSize) res.setHeader("Content-Length", example.declaredSize);
        res.end(example.body);
      } });
      const response = await call(); assert.equal(response.status, 502); privateHeaders(response);
    });
  }
});

test("streamed upstream bodies are limited even without Content-Length", async (t) => {
  const { call } = await fixture(t, { upstream: (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.write("x".repeat(1024 * 1024)); res.end("x".repeat(1024 * 1024 + 1));
  } });
  const response = await call(); assert.equal(response.status, 502); privateHeaders(response);
});

test("preview API rate limit prevents additional upstream reads", async (t) => {
  const { call, upstreamCalls } = await fixture(t);
  for (let i = 0; i < 61; i += 1) {
    const response = await call(); assert.equal(response.status, i < 60 ? 200 : 429); privateHeaders(response);
  }
  assert.equal(upstreamCalls.length, 120);
});
