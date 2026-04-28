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

// ピックアップ記事のID（固定）
const PICKUP_IDS = [
  "ro-jkc4eqh",
  "vq8cy5oohds",
  "l9c6pmq0cht",
];

async function getAllWithArticles(): Promise<WithArticle[]> {
  // 全件取得（最大200件）
  const first = await client.getList<WithArticle>({
    endpoint: "with",
    queries: { limit: 100, offset: 0, orders: "-publishedAt" },
  });
  const total = first.totalCount;
  if (total <= 100) return first.contents;

  // 100件超の場合は追加取得
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

function ArticleCard({ article, large = false }: { article: WithArticle; large?: boolean }) {
  const thumb = article.eyecatch?.url ?? extractFirstImage(article.content) ?? null;

  return (
    <Link
      href={`/with/${article.id}/`}
      className="flex flex-col rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow group border border-gray-100 h-full"
    >
      <div className={`relative w-full bg-gray-100 ${large ? "aspect-[4/3]" : "aspect-[16/9]"}`}>
        {thumb ? (
          <Image
            src={thumb}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-3xl"
            style={{ backgroundColor: "#3dbdac" }}
          >
            <span className="text-white text-sm font-bold px-4 text-center">{article.title}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1">
        {article.category && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full w-fit"
            style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
          >
            {getCategoryName(article)}
          </span>
        )}
        <h3 className={`font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:underline ${large ? "text-base" : "text-sm"}`}>
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

  // ピックアップ記事（固定ID）
  const pickupArticles = PICKUP_IDS
    .map((id) => allArticles.find((a) => a.id === id))
    .filter((a): a is WithArticle => !!a);

  // カテゴリーごとに振り分け（最新3件）
  const categoryGroups = CATEGORY_ORDER.map((cat) => ({
    name: cat,
    articles: allArticles
      .filter((a) => getCategoryName(a) === cat)
      .slice(0, 3),
  }));

  return (
    <main className="bg-white">

      {/* ===== ページヘッダー ===== */}
      <section className="py-10 px-6 text-center bg-white border-b-4" style={{ borderColor: "#3dbdac" }}>
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/withlogo.png"
            alt="WITH by NovolBa"
            style={{ height: "48px", width: "auto" }}
            className="object-contain mb-2"
          />
          <p className="text-sm text-gray-500">スタートアップと共に</p>
        </div>
      </section>

      {/* ===== PICKUP ===== */}
      <section className="px-6 py-0" style={{ backgroundColor: "#3dbdac" }}>
        <div className="max-w-5xl mx-auto">
          {pickupArticles.length >= 3 ? (
            <div className="grid grid-cols-3 gap-1 py-1">
              {/* 左：大きいカード */}
              <div className="col-span-2">
                <Link
                  href={`/with/${pickupArticles[0].id}/`}
                  className="flex flex-col rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow group border border-gray-100 h-full"
                >
                  <div className="relative w-full aspect-[16/9] bg-gray-100">
                    {(() => {
                      const thumb = pickupArticles[0].eyecatch?.url ?? extractFirstImage(pickupArticles[0].content) ?? null;
                      return thumb ? (
                        <Image src={thumb} alt={pickupArticles[0].title} fill className="object-cover" sizes="66vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#3dbdac" }}>
                          <span className="text-white text-sm font-bold px-4 text-center">{pickupArticles[0].title}</span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex flex-col gap-2 p-4 flex-1">
                    {pickupArticles[0].category && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full w-fit" style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}>
                        {getCategoryName(pickupArticles[0])}
                      </span>
                    )}
                    <h3 className="text-base font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:underline">
                      {pickupArticles[0].title}
                    </h3>
                    <time dateTime={pickupArticles[0].publishedAt} className="mt-auto text-xs text-gray-400">
                      {new Date(pickupArticles[0].publishedAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
                    </time>
                  </div>
                </Link>
              </div>
              {/* 右：小さい2枚（同じアスペクト比） */}
              <div className="flex flex-col gap-1">
                {[pickupArticles[1], pickupArticles[2]].map((article) => {
                  const thumb = article.eyecatch?.url ?? extractFirstImage(article.content) ?? null;
                  return (
                    <Link
                      key={article.id}
                      href={`/with/${article.id}/`}
                      className="flex flex-col rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow group border border-gray-100 flex-1"
                    >
                      <div className="relative w-full aspect-[16/9] bg-gray-100">
                        {thumb ? (
                          <Image src={thumb} alt={article.title} fill className="object-cover" sizes="33vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#3dbdac" }}>
                            <span className="text-white text-xs font-bold px-2 text-center">{article.title}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 p-3 flex-1">
                        {article.category && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full w-fit" style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}>
                            {getCategoryName(article)}
                          </span>
                        )}
                        <h3 className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:underline">
                          {article.title}
                        </h3>
                        <time dateTime={article.publishedAt} className="mt-auto text-xs text-gray-400">
                          {new Date(article.publishedAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" })}
                        </time>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1">
              {pickupArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== 検索 ===== */}
      <section className="py-10 px-6 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <MediaSearch allBlogs={allArticles} />
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
                <h2 className="text-xl font-bold tracking-wide" style={{ color: "#3dbdac" }}>
                  {group.name}
                </h2>
              </div>
              {group.articles.length >= 3 && (
                <Link
                  href={`/with/category/${encodeURIComponent(group.name)}/`}
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
          href="/with/all/"
          className="inline-block px-10 py-3 text-sm font-medium border-2 rounded-full transition-colors hover:text-white hover:bg-teal-500"
          style={{ borderColor: "#3dbdac", color: "#3dbdac" }}
        >
          すべての記事を見る
        </Link>
      </section>

    </main>
  );
}
