import type { Metadata } from "next";
import { extractFirstImage } from "./extractFirstImage";

export const SITE_URL = "https://novolba.com";
export const SITE_NAME = "NovolBa";
export const SITE_TITLE = "NovolBa | 挑戦するスタートアップの昇る場";

// Shown when a page or article has no image of its own. Facebook caches shared
// images by URL, so give a replacement image a new file name.
export const DEFAULT_OG_IMAGE = {
  url: "/og-default-v1.png",
  width: 1200,
  height: 630,
  alt: SITE_TITLE,
};

const EXCERPT_LENGTH = 100;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

type ArticleImageField = {
  url?: string | null;
  width?: number | null;
  height?: number | null;
} | null;

export type ArticleMetadataSource = {
  title: string;
  content?: string | null;
  eyecatch?: ArticleImageField;
  publishedAt?: string;
  revisedAt?: string;
};

type ArticleOgImage = {
  url: string;
  width?: number;
  height?: number;
  alt: string;
};

/** Absolute URL in the same form as the sitemap. */
export function toSiteUrl(path: string) {
  return `${SITE_URL}${encodeURI(path)}`;
}

function decodeEntities(value: string) {
  return value.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const code = /^#x/i.test(entity) ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

/** Plain-text opening of an article for descriptions. Headings, captions and shortcode blocks are left out. */
export function toArticleExcerpt(html: string | null | undefined, maxLength = EXCERPT_LENGTH) {
  if (!html) return "";
  const text = decodeEntities(
    html
      // Galleries hold image URLs and buttons hold call-to-action labels: drop the whole block.
      .replace(/\[\[(gallery|button)\b[\s\S]*?\[\[\/\1\]\]/gi, " ")
      // Other shortcode markers such as [[toc]] or [[image-text ...]]; their body text is kept.
      .replace(/\[\[\/?[a-z-]+\b[^\]]*\]\]/gi, " ")
      .replace(/<(h[1-6]|figcaption|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<\/?(p|div|br|li|ul|ol|tr|td|th|table|blockquote|figure|hr)\b[^>]*>/gi, " ")
      .replace(/<[^>]*>/g, ""),
  )
    .replace(/\s+/g, " ")
    .trim();
  const characters = Array.from(text);
  return characters.length > maxLength ? `${characters.slice(0, maxLength).join("").trimEnd()}…` : text;
}

/** Same order as the article cards: eyecatch, then the first body image, then the site default. */
export function pickArticleOgImage(article: ArticleMetadataSource): ArticleOgImage {
  const eyecatch = article.eyecatch;
  if (eyecatch?.url) {
    return eyecatch.width && eyecatch.height
      ? { url: eyecatch.url, width: eyecatch.width, height: eyecatch.height, alt: article.title }
      : { url: eyecatch.url, alt: article.title };
  }
  const firstImage = article.content ? extractFirstImage(article.content) : null;
  if (firstImage) return { url: firstImage.replace(/[?#].*$/, ""), alt: article.title };
  return DEFAULT_OG_IMAGE;
}

/** Title, description, canonical URL, Open Graph and Twitter card for one article page. */
export function buildArticleMetadata(article: ArticleMetadataSource, canonicalPath: string): Metadata {
  const url = toSiteUrl(canonicalPath);
  const description = toArticleExcerpt(article.content) || article.title;
  const images = [pickArticleOgImage(article)];
  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "ja_JP",
      siteName: SITE_NAME,
      url,
      title: article.title,
      description,
      images,
      publishedTime: article.publishedAt,
      modifiedTime: article.revisedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images,
    },
  };
}
