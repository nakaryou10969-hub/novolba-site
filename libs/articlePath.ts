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

export function getArticleRouteSegment(article: ArticlePathSource) {
  return article.slug ? safeDecodeURIComponent(article.slug) : article.id;
}

export function getArticleStaticParamIds(article: ArticlePathSource) {
  const ids = new Set([getArticleRouteSegment(article), article.id]);
  return [...ids].map((id) => ({ id }));
}

export function toArticleRouteKeyCandidates(value: string) {
  const decoded = safeDecodeURIComponent(value);
  return new Set([
    value,
    value.toLowerCase(),
    decoded,
    decoded.toLowerCase(),
    encodeURIComponent(decoded).toLowerCase(),
  ]);
}

export function getMediaArticlePath(article: ArticlePathSource) {
  return `/media/${getArticleRouteSegment(article)}/`;
}

export function getNewsArticlePath(article: ArticlePathSource) {
  return `/news/${getArticleRouteSegment(article)}/`;
}

export function getWithArticlePath(article: ArticlePathSource) {
  return `/with/${getArticleRouteSegment(article)}/`;
}
