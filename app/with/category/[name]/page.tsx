import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client, type WithArticle } from "../../../../libs/client";
import { extractFirstImage } from "../../../../libs/extractFirstImage";

type Props = {
  params: Promise<{ name: string }>;
};

const CATEGORY_ORDER = [
  "インタビュー",
  "速報インタビュー",
  "対談",
  "スタートアップ昇る場",
  "イベント",
  "レポート",
  "コラム",
];

// スラッグ→カテゴリ名のマッピング
const SLUG_TO_CATEGORY: Record<string, string> = {
  "interview": "インタビュー",
  "flash-interview": "速報インタビュー",
  "talk": "対談",
  "startup-novolba": "スタートアップ昇る場",
  "event": "イベント",
  "report": "レポート",
  "column": "コラム",
};

// カテゴリ名→スラッグのマッピング
const CATEGORY_TO_SLUG: Record<string, string> = {
  "インタビュー": "interview",
  "速報インタビュー": "flash-interview",
  "対談": "talk",
  "スタートアップ昇る場": "startup-novolba",
  "イベント": "event",
  "レポート": "report",
  "コラム": "column",
};

async function getAllWithArticles(): Promise<WithArticle[]> {
  const first = await client.getList<WithArticle>({
    endpoint: "with",
    queries: { limit: 100, offset: 0, orders: "-publishedAt" },
  });
  const total = first.totalCount;
  if (total <= 100) return first.contents;
  const second = await client.getList<WithArticle>({
    endpoint: "with",
    queries: { limit: 100, offset: 100, orders: "-publishedAt" },
  });
  return [...first.contents, ...second.contents];
}

const getCategoryName = (article: WithArticle): string => {
  if (!article.category) return "";
  if (typeof article.category === "string") return article.category;
  if (typeof article.category === "object" && "name" in (article.category as object)) {
    return (article.category as { name: string }).name;
  }
  return String(article.category);
};

export async function generateStaticParams() {
  return Object.keys(SLUG_TO_CATEGORY).map((slug) => ({
    name: slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const categoryName = SLUG_TO_CATEGORY[name];
  if (!categoryName) return { title: "カテゴリー | WITH by NovolBa" };
  return {
    title: `${categoryName} | WITH by NovolBa`,
    description: `WITH by NovolBaの「${categoryName}」カテゴリの記事一覧。`,
  };
}

export default async function WithCategoryPage({ params }: Props) {
  const { name } = await params;
  const categoryName = SLUG_TO_CATEGORY[name];
  if (!categoryName) notFound();

  const allArticles = await getAllWithArticles();
  const categoryArticles = allArticles.filter(
    (a) => getCategoryName(a) === categoryName
  );
  const latestArticles = allArticles.slice(0, 5);

  return (
    <main className="bg-white">

      {/* ===== カテゴリーヘッダー ===== */}
      <section className="py-8 px-6 bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-gray-400 mb-1">カテゴリー</p>
          <h1 className="text-2xl font-bold text-gray-800">{categoryName}</h1>
        </div>
      </section>

      {/* ===== コンテンツ ===== */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">

          {/* ===== 記事一覧（左） ===== */}
          <div className="flex-1 min-w-0">
            {categoryArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-400 mb-1">このカテゴリの記事はまだありません</p>
                <p className="text-xs text-gray-300">Coming Soon...</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-8">
                {categoryArticles.map((article) => {
                  const thumb = article.eyecatch?.url ?? extractFirstImage(article.content) ?? null;
                  return (
                    <li key={article.id}>
                      <Link
                        href={`/with/${article.id}/`}
                        className="flex gap-5 group hover:opacity-80 transition-opacity"
                      >
                        {/* サムネイル */}
                        <div className="shrink-0 w-32 h-24 sm:w-48 sm:h-32 relative rounded-lg overflow-hidden bg-gray-100">
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={article.title}
                              fill
                              className="object-cover"
                              sizes="192px"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-2xl"
                              style={{ backgroundColor: "#e6f7f5" }}
                            >
                              📝
                            </div>
                          )}
                        </div>

                        {/* テキスト */}
                        <div className="flex flex-col gap-2 min-w-0">
                          <span
                            className="text-xs font-bold tracking-widest uppercase"
                            style={{ color: "#3dbdac" }}
                          >
                            {categoryName}
                          </span>
                          <h2 className="text-base sm:text-lg font-bold text-gray-800 leading-snug group-hover:underline">
                            {article.title}
                          </h2>
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 hidden sm:block">
                            {article.content.replace(/<[^>]*>/g, "").slice(0, 100)}…
                          </p>
                          <time dateTime={article.publishedAt} className="text-xs text-gray-400 mt-auto">
                            {new Date(article.publishedAt).toLocaleDateString("ja-JP", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </time>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ===== サイドバー（右） ===== */}
          <aside className="lg:w-64 shrink-0 flex flex-col gap-8">

            {/* カテゴリー */}
            <div>
              <h3
                className="text-sm font-bold text-white px-3 py-2 rounded mb-4"
                style={{ backgroundColor: "#3dbdac" }}
              >
                カテゴリー
              </h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_ORDER.map((cat) => {
                  const slug = CATEGORY_TO_SLUG[cat];
                  return (
                    <Link
                      key={cat}
                      href={`/with/category/${slug}/`}
                      className={`text-sm px-3 py-1 rounded hover:opacity-80 transition-opacity ${
                        cat === categoryName
                          ? "text-white font-bold"
                          : "text-gray-600 bg-gray-100"
                      }`}
                      style={cat === categoryName ? { backgroundColor: "#3dbdac" } : {}}
                    >
                      {cat}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 最新の投稿 */}
            <div>
              <h3
                className="text-sm font-bold text-white px-3 py-2 rounded mb-4"
                style={{ backgroundColor: "#3dbdac" }}
              >
                最新の投稿
              </h3>
              <ul className="flex flex-col gap-3">
                {latestArticles.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/with/${article.id}/`}
                      className="text-sm text-gray-700 hover:text-teal-500 transition-colors leading-snug line-clamp-2"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* メディアトップへ */}
            <div className="pt-4 border-t border-gray-100">
              <Link
                href="/media"
                className="text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: "#3dbdac" }}
              >
                ← メディアトップへ戻る
              </Link>
            </div>

          </aside>
        </div>
      </section>

    </main>
  );
}
