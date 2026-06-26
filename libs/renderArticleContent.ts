const URL_PATTERN = /^(https?:\/\/|\/(?!\/))/i;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeBasicEntities(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function textFromEditorHtml(value: string) {
  return decodeBasicEntities(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n")
    .replace(/<\/?p[^>]*>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function textFromHtml(value: string) {
  return textFromEditorHtml(value).replace(/\s+/g, " ").trim();
}

function safeUrl(value: string) {
  const url = decodeBasicEntities(value).trim();
  return URL_PATTERN.test(url) ? url : "";
}

function externalLinkAttrs(url: string) {
  return /^https?:\/\//i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
}

function shortcodeAttribute(attrs: string, name: string) {
  const pattern = new RegExp(`${name}=(?:"|&quot;)(.*?)(?:"|&quot;)`, "i");
  return attrs.match(pattern)?.[1] ?? "";
}

function headingIdFromAttrs(attrs: string) {
  const match = attrs.match(/\sid=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

function renderButtonShortcodes(content: string) {
  return content.replace(
    /(?:<p[^>]*>\s*)?\[\[button\s+href=(?:"|&quot;)([^"&]+)(?:"|&quot;)\]\](?:\s*<\/p>)?([\s\S]*?)(?:<p[^>]*>\s*)?\[\[\/button\]\](?:\s*<\/p>)?/gi,
    (_match, href: string, labelContent: string) => {
      const hrefValue = safeUrl(href);
      const label = textFromEditorHtml(labelContent);
      if (!hrefValue || !label) return "";

      return `<div class="wp-block-button"><a class="wp-block-button__link" href="${escapeHtml(hrefValue)}"${externalLinkAttrs(hrefValue)}>${escapeHtml(label)}</a></div>`;
    },
  );
}

function renderImageTextShortcodes(content: string) {
  return content.replace(
    /(?:<p[^>]*>\s*)?\[\[image-text\s+([^\]]+)\]\](?:\s*<\/p>)?([\s\S]*?)(?:<p[^>]*>\s*)?\[\[\/image-text\]\](?:\s*<\/p>)?/gi,
    (_match, attrs: string, bodyContent: string) => {
      const src = safeUrl(shortcodeAttribute(attrs, "image") || shortcodeAttribute(attrs, "src"));
      if (!src) return "";

      const alt = shortcodeAttribute(attrs, "alt");
      const body = bodyContent.trim();
      if (!body) return "";

      return `<div class="article-image-text"><figure class="article-image-text__figure"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" fetchpriority="low" /></figure><div class="article-image-text__body">${body}</div></div>`;
    },
  );
}

function renderGalleryShortcodes(content: string) {
  return content.replace(
    /(?:<p[^>]*>\s*)?\[\[gallery(?:\s+columns=(?:"|&quot;)(\d+)(?:"|&quot;))?\]\](?:\s*<\/p>)?([\s\S]*?)(?:<p[^>]*>\s*)?\[\[\/gallery\]\](?:\s*<\/p>)?/gi,
    (_match, columns: string | undefined, itemsContent: string) => {
      const columnCount = Math.min(Math.max(Number(columns ?? 2) || 2, 1), 4);
      const itemsText = textFromEditorHtml(itemsContent);
      const figures = itemsText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [rawUrl, ...captionParts] = line.split("|");
          const src = safeUrl(rawUrl);
          if (!src) return "";

          const caption = captionParts.join("|").trim();
          const alt = caption || "";
          const figcaption = caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : "";
          return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" fetchpriority="low" />${figcaption}</figure>`;
        })
        .filter(Boolean)
        .join("");

      if (!figures) return "";

      return `<div class="wp-block-gallery article-shortcode-gallery" style="--gallery-columns: ${columnCount};">${figures}</div>`;
    },
  );
}

function uniqueHeadingId(base: string, usedIds: Set<string>) {
  let id = base;
  let index = 2;
  while (usedIds.has(id)) {
    id = `${base}-${index}`;
    index += 1;
  }
  usedIds.add(id);
  return id;
}

function addHeadingIdsAndRenderToc(content: string) {
  const headings: Array<{ id: string; level: number; text: string }> = [];
  const usedIds = new Set<string>();
  let generatedIndex = 0;

  const contentWithIds = content.replace(
    /<h([1-5])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, level: string, attrs: string, innerHtml: string) => {
      const existingId = headingIdFromAttrs(attrs);
      const id = existingId || uniqueHeadingId(`article-heading-${generatedIndex + 1}`, usedIds);
      if (existingId) usedIds.add(existingId);
      generatedIndex += 1;

      const text = textFromHtml(innerHtml);
      if (text) headings.push({ id, level: Number(level), text });
      if (existingId) return match;
      return `<h${level}${attrs} id="${escapeHtml(id)}">${innerHtml}</h${level}>`;
    },
  );

  const tocHtml = headings.length
    ? `<nav class="article-toc" aria-label="目次"><p class="article-toc__title">目次</p><ol>${headings
        .map(
          ({ id, level, text }) =>
            `<li class="article-toc__item article-toc__item--h${level}"><a href="#${escapeHtml(id)}">${escapeHtml(text)}</a></li>`,
        )
        .join("")}</ol></nav>`
    : "";

  return contentWithIds.replace(/(?:<p[^>]*>\s*)?\[\[toc\]\](?:\s*<\/p>)?/gi, tocHtml);
}

function addLazyLoadingToImages(content: string) {
  return content.replace(/<img\b([^>]*)>/gi, (_match, attrs: string) => {
    let nextAttrs = attrs;
    if (!/\sloading\s*=/i.test(nextAttrs)) {
      nextAttrs += ' loading="lazy"';
    }
    if (!/\sdecoding\s*=/i.test(nextAttrs)) {
      nextAttrs += ' decoding="async"';
    }
    if (!/\sfetchpriority\s*=/i.test(nextAttrs)) {
      nextAttrs += ' fetchpriority="low"';
    }
    return `<img${nextAttrs}>`;
  });
}

function renderRestoredImageFigures(urls: string[]) {
  if (!urls.length) return "";
  const figures = urls
    .map(
      (url) =>
        `<figure><img src="${escapeHtml(url)}" alt="" loading="lazy" decoding="async" fetchpriority="low" /></figure>`,
    )
    .join("");
  return `<div class="restored-body-images">${figures}</div>`;
}

export function renderArticleContent(content: string, restoredImageUrls: string[] = []) {
  const renderedShortcodes = renderGalleryShortcodes(renderImageTextShortcodes(renderButtonShortcodes(content)));
  return addLazyLoadingToImages(addHeadingIdsAndRenderToc(renderedShortcodes)) + renderRestoredImageFigures(restoredImageUrls);
}
