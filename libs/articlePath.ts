type ArticlePathSource = {
  id: string;
  slug?: string;
};

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getMediaArticlePath(article: ArticlePathSource) {
  return `/media/${safeDecodeURIComponent(article.slug || article.id)}/`;
}

export function getNewsArticlePath(article: ArticlePathSource) {
  return `/news/${safeDecodeURIComponent(article.slug || article.id)}/`;
}
