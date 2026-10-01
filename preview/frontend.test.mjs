import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import { JSDOM } from "jsdom";

// Run the actual TypeScript helpers with Node's built-in test runner. The DOM is
// inert: jsdom loads no external resources and does not execute article scripts.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://preview.example.test/preview/" });
globalThis.window = dom.window;
const moduleCache = new Map();

function loadTypeScript(filename) {
  if (moduleCache.has(filename)) return moduleCache.get(filename).exports;
  const source = readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    fileName: filename,
  });
  const loadedModule = { exports: {} };
  moduleCache.set(filename, loadedModule);
  const localRequire = (specifier) => specifier.startsWith(".")
    ? loadTypeScript(path.resolve(path.dirname(filename), `${specifier}.ts`))
    : require(specifier);
  new Function("require", "module", "exports", outputText)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const { parsePreviewLocation } = loadTypeScript(path.join(root, "libs", "previewRequest.ts"));
const { readPreviewContent, sanitizePreviewHtml, safePreviewImageUrl } = loadTypeScript(path.join(root, "libs", "previewContent.ts"));
const { renderArticleContent } = loadTypeScript(path.join(root, "libs", "renderArticleContent.ts"));
const { formatArticleDate } = loadTypeScript(path.join(root, "libs", "articlePresentation.ts"));
const draftKey = "mock_draft_key-1234567890";
const validSearch = "?endpoint=with&contentId=unpublished_123&view=with";
const validHash = `#draftKey=${draftKey}`;
const unpublished = { id: "unpublished_123", title: "Unpublished article", content: "<h2>Draft heading</h2><p>Draft body</p>" };

function parsedHtml(html) {
  const container = dom.window.document.createElement("div");
  container.innerHTML = html;
  return container;
}

test("accepts all supported endpoint/view pairs with the draft key in the fragment", () => {
  for (const [endpoint, view] of [["with", "with"], ["with", "media"], ["blogs", "news"]]) {
    assert.deepEqual(parsePreviewLocation(`?view=${view}&contentId=unpublished_123&endpoint=${endpoint}`, validHash), {
      endpoint, view, contentId: "unpublished_123", draftKey,
    });
  }
});

test("rejects missing, duplicate and unknown query or fragment parameters", () => {
  const invalidLocations = [
    ["", validHash],
    ["?endpoint=with&contentId=unpublished_123", validHash],
    ["?endpoint=with&view=with", validHash],
    ["?contentId=unpublished_123&view=with", validHash],
    [`${validSearch}&endpoint=with`, validHash],
    [`${validSearch}&contentId=another`, validHash],
    [`${validSearch}&view=media`, validHash],
    [`${validSearch}&url=https%3A%2F%2Fexample.test`, validHash],
    [`${validSearch}&draftKey=${draftKey}`, validHash],
    [`${validSearch}&draftKey=${draftKey}`, ""],
    [validSearch, ""],
    [validSearch, "#draftKey="],
    [validSearch, `${validHash}&draftKey=another`],
    [validSearch, `${validHash}&endpoint=with`],
    [validSearch, `${validHash}&url=https%3A%2F%2Fexample.test`],
  ];
  for (const [search, hash] of invalidLocations) assert.throws(() => parsePreviewLocation(search, hash), /Invalid preview URL/);
});

test("rejects unsupported API endpoints and mismatched page views", () => {
  for (const [endpoint, view] of [["blog", "with"], ["categories", "news"], ["with", "news"], ["blogs", "with"], ["blogs", "media"], ["with", "events"], ["https://example.test", "with"]]) {
    assert.throws(() => parsePreviewLocation(`?endpoint=${encodeURIComponent(endpoint)}&contentId=unpublished_123&view=${view}`, validHash), /Invalid preview URL/);
  }
});

test("enforces ASCII content IDs and opaque draft key length and control character limits", () => {
  for (const contentId of ["", ".", "..", "../secret", "a/b", "a\\b", "space id", "日本語", "a\n", "a".repeat(129)]) {
    assert.throws(() => parsePreviewLocation(`?endpoint=with&contentId=${encodeURIComponent(contentId)}&view=with`, validHash), /Invalid preview URL/);
  }
  for (const key of ["", "key\n", "key\u0000", "key\u007f", "key\u0090", "a".repeat(513)]) {
    assert.throws(() => parsePreviewLocation(validSearch, `#draftKey=${encodeURIComponent(key)}`), /Invalid preview URL/);
  }
  assert.equal(parsePreviewLocation(`?endpoint=with&contentId=${"a".repeat(128)}&view=media`, `#draftKey=${"b".repeat(512)}`).draftKey.length, 512);
  for (const key of ["+&/= token", " 日本語とemoji😀 ", "https://example.test/opaque+token", "../opaque-key"]) {
    assert.equal(parsePreviewLocation(validSearch, `#${new URLSearchParams({ draftKey: key })}`).draftKey, key);
  }
  assert.equal(parsePreviewLocation("?endpoint=blogs&contentId=x&view=news", "#draftKey=y").contentId, "x");
  assert.throws(() => parsePreviewLocation(`?${"x".repeat(1024)}`, validHash), /Invalid preview URL/);
  assert.throws(() => parsePreviewLocation(validSearch, `#${"x".repeat(8192)}`), /Invalid preview URL/);
});

test("sanitizes active HTML and obfuscated links after rendering", () => {
  const html = sanitizePreviewHtml(`
    <script>alert(1)</script><iframe srcdoc="<script>alert(2)</script>"></iframe>
    <svg><a href="javascript:alert(3)">SVG link</a></svg><math><mtext>Math</mtext></math>
    <form action="https://example.test"><input name="secret"></form>
    <base href="https://example.test"><meta http-equiv="refresh" content="0;url=https://example.test">
    <object data="https://example.test"></object><embed src="https://example.test">
    <p onclick="alert(4)" data-secret="hidden" class="hidden article-image-text__body">Visible paragraph</p>
    <a href="java&#x73;cript:alert(5)">bad scheme</a>
    <a href="//example.test/">protocol-relative</a><a href="data:text/html,hi">data link</a>
    <a href="https://user:password@example.test/">credentials</a>
    <img src="/header.img.png" onerror="alert(6)"><img src="https://example.test/tracker">
  `);
  const container = parsedHtml(html);
  assert.equal(container.querySelector("script, iframe, svg, math, form, input, base, meta, object, embed"), null);
  for (const element of container.querySelectorAll("*")) {
    for (const attribute of element.attributes) assert.ok(!/^on|^data-/i.test(attribute.name), `Unexpected active attribute ${attribute.name}`);
  }
  assert.equal(container.querySelector("p").className, "article-image-text__body");
  for (const link of container.querySelectorAll("a")) assert.equal(link.getAttribute("href"), null);
  assert.equal(container.querySelectorAll("img")[0].getAttribute("src"), "/header.img.png");
  assert.equal(container.querySelectorAll("img")[1].getAttribute("src"), null);
});

test("preserves article layout, safe inline styles, TOC links and no-referrer behavior", () => {
  const container = parsedHtml(sanitizePreviewHtml(`
    <div class="wp-block-gallery arbitrary-class" style="--gallery-columns:3;background-image:url(https://example.test/);position:fixed;text-align:center;color:#123;font-weight:700">Gallery</div>
    <h2 id="article-heading-1">Heading</h2><a href="#article-heading-1" target="_blank">TOC</a>
    <a href="/news/mock-article/" target="_blank">Internal</a><a href="https://novolba.com/about/" target="_self">External</a>
    <img src="https://images.microcms-assets.io/assets/mock/image.png" alt="Allowed image">
  `));
  const gallery = container.querySelector("div");
  assert.equal(gallery.className, "wp-block-gallery");
  assert.match(gallery.getAttribute("style"), /--gallery-columns: 3/);
  assert.match(gallery.getAttribute("style"), /text-align: center/);
  assert.doesNotMatch(gallery.getAttribute("style"), /url\(|position|background-image/);
  const links = [...container.querySelectorAll("a")];
  assert.equal(links[0].getAttribute("href"), "#article-heading-1");
  assert.equal(links[0].getAttribute("target"), null);
  assert.equal(links[1].getAttribute("target"), null);
  assert.equal(links[2].getAttribute("target"), "_blank");
  for (const link of links) {
    assert.equal(link.getAttribute("rel"), "noopener noreferrer");
    assert.equal(link.getAttribute("referrerpolicy"), "no-referrer");
  }
  assert.equal(container.querySelector("img").getAttribute("referrerpolicy"), "no-referrer");
});

test("sanitizes shortcode output after entity decoding and retains expected design classes", () => {
  const content = `
    [[toc]]<h2>Shortcode heading</h2>
    [[button href="https://novolba.com/"]]Read more[[/button]]
    [[image-text image="/header.img.png" alt="Mock image"]]<p>Text</p>&lt;img src="/header.img.png" onerror="alert(1)"&gt;[[/image-text]]
    [[gallery columns="3"]]/header.img.png|Caption[[/gallery]]
  `;
  const article = readPreviewContent({ ...unpublished, content }, "with").article;
  const container = parsedHtml(article.content);
  assert.ok(container.querySelector(".article-toc a[href='#article-heading-1']"));
  assert.ok(container.querySelector(".wp-block-button .wp-block-button__link"));
  assert.ok(container.querySelector(".article-image-text__figure img"));
  assert.ok(container.querySelector(".article-image-text__body p"));
  assert.ok(container.querySelector(".article-shortcode-gallery figure figcaption"));
  assert.match(container.querySelector(".article-shortcode-gallery").getAttribute("style"), /--gallery-columns: 3/);
  assert.equal(container.querySelector("[onerror], [onclick], script"), null);
  assert.equal(container.textContent.includes("[["), false);
  assert.equal(sanitizePreviewHtml(renderArticleContent(content)), article.content);
});

test("allows known image hosts and local paths and rejects credentials, trackers and active schemes", () => {
  for (const url of ["/header.img.png", "https://images.microcms-assets.io/assets/example/image.png", "https://novolba.com/microcms-assets/assets/example/image.png", "https://www.novolba.com/image.png"]) assert.ok(safePreviewImageUrl(url));
  for (const url of [null, {}, "javascript:alert(1)", "data:image/svg+xml,<svg></svg>", "//example.test/tracker", "https://example.test/tracker", "http://novolba.com/image.png", "https://user:password@novolba.com/image.png", "https://novolba.com:8080/image.png", "/\\example.test/image.png", "/image\n.png", "https://novolba.com.evil.test/image.png", "x".repeat(4097)]) assert.equal(safePreviewImageUrl(url), undefined);
});

test("reads unpublished WITH and NEWS drafts with missing or invalid publication dates", () => {
  const withDraft = readPreviewContent({ ...unpublished, category: "Interview", draftKey: "must-not-be-returned", unexpected: "must-not-be-returned" }, "with");
  assert.equal(withDraft.kind, "with");
  assert.equal(withDraft.article.publishedAt, undefined);
  assert.equal(withDraft.article.category, "Interview");
  assert.equal(withDraft.article.createdAt, "");
  assert.equal("draftKey" in withDraft.article, false);
  assert.equal("unexpected" in withDraft.article, false);
  const newsDraft = readPreviewContent({ ...unpublished, publishedAt: "invalid date", category: { id: "announcements", name: "Announcements" } }, "blogs");
  assert.equal(newsDraft.kind, "news");
  assert.equal(newsDraft.article.publishedAt, undefined);
  assert.deepEqual(newsDraft.article.category, { id: "announcements", name: "Announcements" });
  assert.equal(formatArticleDate(undefined), formatArticleDate("invalid date"));
  assert.doesNotMatch(formatArticleDate(undefined), /Invalid Date|NaN/);
});

test("reads an edited published draft and preserves the server-provided draft content", () => {
  const edited = readPreviewContent({ ...unpublished, publishedAt: "2026-01-02T00:00:00.000Z", content: "<p>Edited published draft</p>", category: "Interview", eyecatch: { url: "/header.img.png", width: 100, height: 50 } }, "with");
  assert.equal(edited.article.publishedAt, "2026-01-02T00:00:00.000Z");
  assert.match(edited.article.content, /Edited published draft/);
  assert.equal(edited.article.eyecatch.url, "/header.img.png");
  assert.match(formatArticleDate(edited.article.publishedAt), /2026/);
});

test("rejects malformed API records and drops unsafe optional fields", () => {
  for (const value of [null, [], "text", {}, { ...unpublished, id: "../bad" }, { ...unpublished, title: {} }, { ...unpublished, title: "x".repeat(1001) }, { ...unpublished, content: null }, { ...unpublished, content: "x".repeat(2 * 1024 * 1024 + 1) }]) assert.throws(() => readPreviewContent(value, "with"), /Invalid preview content/);
  const withDraft = readPreviewContent({ ...unpublished, category: { id: "wrong-type", name: "Wrong type" }, author: {}, eyecatch: { url: "https://example.test/tracker" } }, "with");
  assert.equal(withDraft.article.category, undefined);
  assert.equal(withDraft.article.author, undefined);
  assert.equal(withDraft.article.eyecatch, undefined);
  const newsDraft = readPreviewContent({ ...unpublished, category: { id: "../bad", name: "Unsafe ID" } }, "blogs");
  assert.equal(newsDraft.article.category, undefined);
});

test("mock build serves current site queries and blocks every non-fixture fetch", () => {
  const script = `
    import assert from 'node:assert/strict';
    const response = await fetch('https://microcms-demo.microcms.io/api/v1/with?limit=2&offset=1&orders=-publishedAt');
    const data = await response.json();
    assert.equal(data.contents.length, 2);
    assert.equal(data.totalCount, 7);
    assert.equal(data.offset, 1);
    const categories = await (await fetch('https://microcms-demo.microcms.io/api/v1/categories?limit=100')).json();
    assert.equal(categories.contents.length, 2);
    const blogs = await (await fetch('https://microcms-demo.microcms.io/api/v1/blogs?filters=category%5Bequals%5Dannouncements&fields=id,title')).json();
    assert.equal(blogs.totalCount, 3);
    assert.deepEqual(Object.keys(blogs.contents[0]), ['id', 'title']);
    const single = await (await fetch('https://microcms-demo.microcms.io/api/v1/categories/announcements')).json();
    assert.equal(single.id, 'announcements');
    assert.equal((await fetch('https://microcms-demo.microcms.io/api/v1/with/missing')).status, 404);
    for (const url of [
      'https://real-service.microcms.io/api/v1/with',
      'https://example.test/',
      'http://microcms-demo.microcms.io/api/v1/with',
      'https://microcms-demo.microcms.io/api/v1/unknown',
      'https://microcms-demo.microcms.io/api/v1/with?draftKey=mock',
      'https://microcms-demo.microcms.io/api/v1/blogs?filters=unsupported',
    ]) await assert.rejects(() => fetch(url));
    await assert.rejects(() => fetch('https://microcms-demo.microcms.io/api/v1/with', { method: 'POST' }));
  `;
  execFileSync(process.execPath, ["--require", path.join(root, "preview", "mock-build.cjs"), "--input-type=module", "-e", script], {
    cwd: root,
    env: { ...process.env, NODE_OPTIONS: "", PREVIEW_MOCK_BUILD: "1", MICROCMS_SERVICE_DOMAIN: "microcms-demo", MICROCMS_API_KEY: "mock-build-key", NEXT_TELEMETRY_DISABLED: "1" },
    stdio: "pipe",
  });
});
