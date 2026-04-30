import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
  return CATEGORY_ORDER.map((cat) => ({
    name: encodeURIComponent(cat),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const categoryName = decodeURIComponent(name);
  return {
    title: `${categoryName} | WITH by NovolBa`,
    description: `WITH by NovolBaの「${categoryName}」カテゴリの記事一覧。`,
  };
}

export default async function WithCategoryPage({ params }: Props) {
  const { name } = await params;
  const categoryName = decodeURIComponent(name);
  const allArticles = await getAllWithArticles();
  const categoryArticles = allArticles.filter(
    (a) => getCategoryName(a) === categoryName
  );
  const latestArticles = allArticles.slice(0, 5);

  return (
    <main className="bg-white">

      {/* ===== ページヘッダー ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-24 px-6"
        style={{ background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "#3dbdac" }} />
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">WITH by NovolBa</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-widest text-gray-800">{categoryName}</h1>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
        <p className="mt-3 text-sm text-gray-400">{categoryArticles.length}件</p>
      </section>

      {/* ===== コンテンツ ===== */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">

          {/* ===== 記事一覧（左） ===== */}
          <div className="flex-1 min-w-0">
            {categoryArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-400 mb-1">このカテゴリの記事はまだありません</p>
                <p className="text-xs text-gray-300">Coming Soon...</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {categoryArticles.map((article) => {
                  const thumb = article.eyecatch?.url ?? extractFirstImage(article.content) ?? null;
                  return (
                    <li key={article.id}>
                      <Link
                        href={`/with/${article.id}/`}
                        className="flex gap-4 py-6 group hover:opacity-80 transition-opacity"
                      >
                        <div className="shrink-0 w-40 h-28 sm:w-52 sm:h-36 relative rounded-lg overflow-hidden bg-gray-100">
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={article.title}
                              fill
                              className="object-cover"
                              sizes="208px"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-xl"
                              style={{ backgroundColor: "#e6f7f5" }}
                            >
                              📝
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <time
                              dateTime={article.publishedAt}
                              className="text-xs text-gray-400"
                            >
                              {new Date(article.publishedAt).toLocaleDateString("ja-JP", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </time>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
                            >
                              {categoryName}
                            </span>
                          </div>
                          <h2 className="text-sm font-semibold text-gray-800 leading-snug truncate group-hover:underline">
                            {article.title}
                          </h2>
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
              <h3 className="text-sm font-bold text-gray-700 tracking-widest mb-4 pb-2 border-b border-gray-200">
                カテゴリー
              </h3>
              <ul className="flex flex-col gap-2">
                {CATEGORY_ORDER.map((cat) => (
                  <li key={cat}>
                    <Link
                      href={`/with/category/${encodeURIComponent(cat)}/`}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        cat === categoryName
                          ? "font-bold"
                          : "text-gray-600 hover:text-teal-500"
                      }`}
                      style={cat === categoryName ? { color: "#3dbdac" } : undefined}
                    >
                      <span style={{ color: "#3dbdac" }}>›</span>
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 最新の投稿 */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 tracking-widest mb-4 pb-2 border-b border-gray-200">
                最新の投稿
              </h3>
              <ul className="flex flex-col gap-4">
                {latestArticles.map((article) => {
                  const thumb = article.eyecatch?.url ?? extractFirstImage(article.content);
                  return (
                    <li key={article.id}>
                      <Link
                        href={`/with/${article.id}/`}
                        className="flex gap-3 group hover:opacity-80 transition-opacity"
                      >
                        <div className="shrink-0 w-14 h-10 relative rounded overflow-hidden bg-gray-100">
                          {thumb ? (
                            <Image src={thumb} alt={article.title} fill className="object-cover" sizes="56px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm" style={{ backgroundColor: "#e6f7f5" }}>
                              📝
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 mb-0.5">
                            {new Date(article.publishedAt).toLocaleDateString("ja-JP", {
                              year: "numeric", month: "short", day: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-gray-700 leading-snug line-clamp-2 group-hover:underline">
                            {article.title}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
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
