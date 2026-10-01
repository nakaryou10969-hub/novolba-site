import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { client, type WithArticle } from "../../../libs/client";
import { getArticleStaticParamIds, toArticleRouteKeyCandidates } from "../../../libs/articlePath";
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
  return all.find((item) => {
    const articleCandidates = toArticleRouteKeyCandidates(item.slug || item.id);
    return item.id === idOrSlug || [...articleCandidates].some((candidate) => idOrSlugCandidates.has(candidate));
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
    return {
      title: `${article.title} | WITH by NovolBa`,
      description: article.title,
    };
  }
  return { title: "記事が見つかりません | NovolBa" };
}

export default async function MediaArticlePage({ params }: Props) {
  const { id } = await params;

  const resolvedArticle = await getArticleByIdOrSlug(id);
  if (!resolvedArticle) {
    notFound();
  }
  const article = resolvedArticle;

  const allArticles = await getAllWithArticles();
  const latestArticles = allArticles.filter((a) => a.id !== article.id).slice(0, 5);
  return <WithArticleView article={article} latestArticles={latestArticles} view="media" />;
}
