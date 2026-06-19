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

function safeUrl(value: string) {
  const url = decodeBasicEntities(value).trim();
  return URL_PATTERN.test(url) ? url : "";
}

function externalLinkAttrs(url: string) {
  return /^https?:\/\//i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
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

export function renderArticleContent(content: string) {
  return addLazyLoadingToImages(renderGalleryShortcodes(renderButtonShortcodes(content)));
}
