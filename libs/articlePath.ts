type ArticlePathSource = {
  id: string;
  slug?: string;
};

export function getMediaArticlePath(article: ArticlePathSource) {
  return `/media/${article.slug || article.id}/`;
}
