import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client, type WithArticle } from "../../libs/client";
import { extractFirstImage } from "../../libs/extractFirstImage";
import MediaSearch from "./MediaSearch";

export const metadata: Metadata = {
  title: "MEDIA | NovolBa",
  description: "WITH by NovolBa。スタートアップのリアルを届けるメディア。インタビュー・イベント・コラムなど。",
};

// withAPIのカテゴリー順序
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
  const data = await client.getList<WithArticle>({
    endpoint: "with",
    queries: { limit: 100, orders: "-publishedAt" },
  });
  return data.contents;
}

function ArticleCard({ article }: { article: WithArticle }) {
  const thumb = article.eyecatch?.url ?? extractFirstImage(article.content) ?? null;

  return (
    <Link
      href={`/with/${article.id}`}
      className="flex flex-col rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow group border border-gray-100"
    >
      <div className="relative w-full aspect-[16/9] bg-gray-100">
        {thumb ? (
          <Image
            src={thumb}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-3xl"
            style={{ backgroundColor: "#e6f7f5" }}
          >
            📝
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1">
        {article.category && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full w-fit"
            style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
          >
            {article.category}
          </span>
        )}
        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:underline">
          {article.title}
        </h3>
        <time dateTime={article.publishedAt} className="mt-auto text-xs text-gray-400">
          {new Date(article.publishedAt).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>
    </Link>
  );
}

export default async function MediaPage() {
  const allArticles = await getAllWithArticles();

  // ピックアップ（pickup=trueのもの、なければ最新3件）
  const pickupArticles = allArticles.filter((a) => a.pickup === true).slice(0, 3);
  const featuredArticles = pickupArticles.length > 0 ? pickupArticles : allArticles.slice(0, 3);

  // カテゴリーごとに振り分け（最新3件）
  const categoryGroups = CATEGORY_ORDER.map((cat) => ({
    name: cat,
    articles: allArticles
      .filter((a) => a.category === cat)
      .slice(0, 3),
  }));

  return (
    <main className="bg-white">

      {/* ===== ページヘッダー ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-24 px-6"
        style={{ background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "#3dbdac" }} />
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">Media</p>
        <h1 className="text-4xl font-bold tracking-widest text-gray-800 mb-2">WITH by NovolBa</h1>
        <p className="text-sm text-gray-500">スタートアップのリアルを届けるメディア</p>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
      </section>

      {/* ===== 検索 ===== */}
      <section className="py-10 px-6 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <MediaSearch allBlogs={allArticles as any} />
        </div>
      </section>

      {/* ===== PICKUP ===== */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1 h-6 rounded-full" style={{ backgroundColor: "#3dbdac" }} />
            <h2 className="text-lg font-bold text-gray-800 tracking-wide">PICKUP</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== カテゴリー別 ===== */}
      {categoryGroups.map((group, index) => (
        <section
          key={group.name}
          className={`py-16 px-6 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full" style={{ backgroundColor: "#3dbdac" }} />
                <h2 className="text-lg font-bold tracking-wide" style={{ color: "#3dbdac" }}>
                  {group.name}
                </h2>
              </div>
              {group.articles.length >= 3 && (
                <Link
                  href={`/with/category/${encodeURIComponent(group.name)}`}
                  className="text-xs font-medium hover:opacity-70 transition-opacity flex items-center gap-1"
                  style={{ color: "#3dbdac" }}
                >
                  もっと見る <span>→</span>
                </Link>
              )}
            </div>

            {group.articles.length < 3 ? (
              <div className="flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-400 mb-1">記事の更新をお待ちください</p>
                <p className="text-xs text-gray-300">Coming Soon...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {group.articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      {/* ===== 全記事へのリンク ===== */}
      <section className="py-12 px-6 text-center bg-white border-t border-gray-100">
        <Link
          href="/with"
          className="inline-block px-10 py-3 text-sm font-medium border-2 rounded-full transition-colors hover:text-white hover:bg-teal-500"
          style={{ borderColor: "#3dbdac", color: "#3dbdac" }}
        >
          すべての記事を見る
        </Link>
      </section>

    </main>
  );
}
