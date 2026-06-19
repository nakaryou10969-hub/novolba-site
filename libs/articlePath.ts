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

export function getArticleStaticParamIds(article: ArticlePathSource) {
  const ids = new Set([article.id]);
  if (article.slug) ids.add(safeDecodeURIComponent(article.slug));
  return [...ids].map((id) => ({ id }));
}

export function getMediaArticlePath(article: ArticlePathSource) {
  return `/media/${article.id}/`;
}

export function getNewsArticlePath(article: ArticlePathSource) {
  return `/news/${article.id}/`;
}
