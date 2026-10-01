import createDOMPurify from "dompurify";
import type { NewsArticleDisplay, WithArticleDisplay } from "./articlePresentation";
import type { PreviewEndpoint } from "./previewRequest";
import { renderArticleContent } from "./renderArticleContent";
import { getRestoredNewsBodyImages } from "./restoredArticleImages";

const IMAGE_HOSTS = new Set([
  "images.microcms-assets.io", "novolba.com", "www.novolba.com", "dev.novolba.com",
  "novolba.notion.site", "s3-us-west-2.amazonaws.com",
]);
const ARTICLE_CLASSES = new Set([
  "wp-block-gallery", "blocks-gallery-grid", "blocks-gallery-item", "article-shortcode-gallery",
  "article-toc", "article-toc__title", "article-toc__item", "article-toc__item--h1",
  "article-toc__item--h2", "article-toc__item--h3", "article-toc__item--h4", "article-toc__item--h5",
  "article-image-text", "article-image-text__figure", "article-image-text__body",
  "wp-block-button", "wp-block-buttons", "wp-block-button__link", "wp-element-button",
  "wp-block-cover", "restored-body-images", "alignleft", "alignright", "aligncenter",
]);

export function safePreviewImageUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 4096 || /[\u0000-\u0020\\]/.test(value)) return undefined;
  if (/^\/(?!\/)/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port && IMAGE_HOSTS.has(url.hostname)
      ? url.href : undefined;
  } catch { return undefined; }
}

function safeLink(value: string) {
  if (/^#[A-Za-z0-9_-]{1,200}$/.test(value)) return value;
  if (/^\/(?!\/)/.test(value) && !/[\u0000-\u0020\\]/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}

function safeStyle(value: string) {
  return value.split(";").map((declaration) => {
    const colon = declaration.indexOf(":");
    if (colon < 0) return "";
    const property = declaration.slice(0, colon).trim().toLowerCase();
    const setting = declaration.slice(colon + 1).trim().toLowerCase();
    if (property === "--gallery-columns" && /^[1-4]$/.test(setting)) return `${property}: ${setting}`;
    if (["color", "background-color"].includes(property) && /^(#[0-9a-f]{3,8}|[a-z]{1,20}|rgba?\([\d\s.,%]+\))$/.test(setting)) return `${property}: ${setting}`;
    if (property === "text-align" && /^(left|right|center|justify)$/.test(setting)) return `${property}: ${setting}`;
    if (property === "font-weight" && /^(normal|bold|[1-9]00)$/.test(setting)) return `${property}: ${setting}`;
    if (["width", "max-width", "height", "font-size"].includes(property) && /^(auto|\d{1,4}(?:\.\d{1,2})?(?:px|em|rem|%))$/.test(setting)) return `${property}: ${setting}`;
    return "";
  }).filter(Boolean).join("; ");
}

/** Run after ALL article/shortcode/restored-image transformations. */
export function sanitizePreviewHtml(renderedHtml: string) {
  const purifier = createDOMPurify(window);
  purifier.addHook("uponSanitizeAttribute", (_node, data) => {
    if (data.attrName === "src") {
      data.attrValue = safePreviewImageUrl(data.attrValue) ?? "";
      data.keepAttr = Boolean(data.attrValue);
    } else if (data.attrName === "href") {
      data.attrValue = safeLink(data.attrValue);
      data.keepAttr = Boolean(data.attrValue);
    } else if (data.attrName === "class") {
      data.attrValue = data.attrValue.split(/\s+/).filter((name) => ARTICLE_CLASSES.has(name)).join(" ");
      data.keepAttr = Boolean(data.attrValue);
    } else if (data.attrName === "style") {
      data.attrValue = safeStyle(data.attrValue);
      data.keepAttr = Boolean(data.attrValue);
    } else if (data.attrName === "id") {
      data.keepAttr = /^[A-Za-z0-9_-]{1,200}$/.test(data.attrValue);
    }
  });
  purifier.addHook("afterSanitizeAttributes", (node) => {
    if (node instanceof window.HTMLAnchorElement) {
      node.setAttribute("rel", "noopener noreferrer");
      node.setAttribute("referrerpolicy", "no-referrer");
      if (node.getAttribute("href")?.startsWith("https:")) node.setAttribute("target", "_blank");
      else node.removeAttribute("target");
    }
    if (node instanceof window.HTMLImageElement) node.setAttribute("referrerpolicy", "no-referrer");
  });
  return purifier.sanitize(renderedHtml, {
    ALLOWED_TAGS: ["p", "br", "div", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a", "img", "figure", "figcaption", "nav", "ul", "ol", "li", "blockquote", "strong", "b", "em", "i", "u", "s", "hr", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "pre", "code", "ruby", "rt", "rp", "sup", "sub"],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "style", "id", "lang", "width", "height", "colspan", "rowspan", "scope", "loading", "decoding", "fetchpriority", "aria-label"],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    SANITIZE_DOM: true,
  });
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid preview content");
  return value as Record<string, unknown>;
}

function optionalText(value: unknown, limit = 1000) {
  return typeof value === "string" && value.length <= limit ? value : undefined;
}

export type PreviewArticle = { kind: "with"; article: WithArticleDisplay } | { kind: "news"; article: NewsArticleDisplay };

export function readPreviewContent(value: unknown, endpoint: PreviewEndpoint): PreviewArticle {
  const source = record(value);
  if (typeof source.id !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(source.id)
    || typeof source.title !== "string" || source.title.length > 1000
    || typeof source.content !== "string" || source.content.length > 2 * 1024 * 1024) throw new Error("Invalid preview content");
  const image = source.eyecatch && typeof source.eyecatch === "object" && !Array.isArray(source.eyecatch)
    ? source.eyecatch as Record<string, unknown> : undefined;
  const imageUrl = safePreviewImageUrl(image?.url);
  const publishedAt = optionalText(source.publishedAt, 50);
  const base = {
    id: source.id,
    title: source.title || "（タイトル未入力）",
    createdAt: optionalText(source.createdAt, 50) ?? "",
    updatedAt: optionalText(source.updatedAt, 50) ?? "",
    revisedAt: optionalText(source.revisedAt, 50) ?? "",
    publishedAt: publishedAt && Number.isFinite(new Date(publishedAt).getTime()) ? publishedAt : undefined,
    author: optionalText(source.author),
    content: sanitizePreviewHtml(renderArticleContent(source.content, endpoint === "blogs" ? getRestoredNewsBodyImages(source.id) : [])),
    eyecatch: imageUrl ? { url: imageUrl, width: 0, height: 0 } : undefined,
  };
  if (endpoint === "with") return { kind: "with", article: { ...base, category: optionalText(source.category, 200) } };
  const category = source.category && typeof source.category === "object" && !Array.isArray(source.category)
    ? source.category as Record<string, unknown> : undefined;
  const categoryId = optionalText(category?.id, 128);
  const categoryName = optionalText(category?.name, 200);
  return { kind: "news", article: { ...base, category: categoryId && /^[A-Za-z0-9_-]+$/.test(categoryId) && categoryName ? { id: categoryId, name: categoryName } : undefined } };
}
