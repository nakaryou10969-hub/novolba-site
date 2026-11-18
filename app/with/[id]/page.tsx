import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { client, type WithArticle } from "../../../libs/client";
import { getArticleStaticParamIds, getMediaArticlePath, toArticleRouteKeyCandidates } from "../../../libs/articlePath";
import { buildArticleMetadata } from "../../../libs/siteMetadata";
import WithArticleView from "../../components/WithArticleView";

type Props = {
  params: Promise<{ id: string }>;
};

let allWithArticlesPromise: Promise<WithArticle[]> | null = null;

async function fetchAllWithArticles(): Promise<WithArticle[]> {
  const first = await client.getList<WithArticle>({
    endpoint: "with",
    queries: { limit: 100, offset: 0, orders: "-publishedAt" },
  });
  let all = first.contents;
  for (let offset = 100; offset < first.totalCount; offset += 100) {
    const next = await client.getList<WithArticle>({
      endpoint: "with",
      queries: { limit: 100, offset, orders: "-publishedAt" },
    });
    all = [...all, ...next.contents];
  }
  return all;
}

function getAllWithArticles(): Promise<WithArticle[]> {
  allWithArticlesPromise ??= fetchAllWithArticles();
  return allWithArticlesPromise;
}

async function getArticleByIdOrSlug(idOrSlug: string): Promise<WithArticle | null> {
  const all = await getAllWithArticles();
  const idOrSlugCandidates = toArticleRouteKeyCandidates(idOrSlug);
  return all.find((article) => {
    const articleCandidates = toArticleRouteKeyCandidates(article.slug || article.id);
    return article.id === idOrSlug || [...articleCandidates].some((candidate) => idOrSlugCandidates.has(candidate));
  }) ?? null;
}

export async function generateStaticParams() {
  const all = await getAllWithArticles();
  return all.flatMap(getArticleStaticParamIds);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleByIdOrSlug(id);
  if (article) {
    // /with/ duplicates /media/ (only /media/ is in the sitemap), so the canonical URL is the /media/ one.
    return buildArticleMetadata(article, getMediaArticlePath(article));
  }
  return { title: "記事が見つかりません" };
}

export default async function WithArticlePage({ params }: Props) {
  const { id } = await params;

  const article = await getArticleByIdOrSlug(id);
  if (!article) {
    notFound();
  }

  const allArticles = await getAllWithArticles();
  const latestArticles = allArticles.filter((a) => a.id !== article.id).slice(0, 5);
  return <WithArticleView article={article} latestArticles={latestArticles} view="with" />;
}
