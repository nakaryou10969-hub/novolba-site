import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client, type WithArticle } from "../../libs/client";
import { extractFirstImage } from "../../libs/extractFirstImage";
import MediaSearch from "./MediaSearch";
import LatestSlider from "./LatestSlider";
import { CATEGORY_ORDER, CATEGORY_SLUG_MAP, PICKUP_IDS } from "./constants";

export const metadata: Metadata = {
  title: "MEDIA | NovolBa",
  description: "WITH by NovolBa - Media for startups.",
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

function ArticleCard({ article, large = false }: { article: WithArticle; large?: boolean }) {
  const thumb = article.eyecatch?.url ?? extractFirstImage(article.content) ?? null;
  return (
    <Link
      href={`/media/${article.id}/`}
      className="flex flex-col rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow group border border-gray-100 h-full"
    >
      <div className={`relative w-full bg-gray-100 ${large ? "aspect-[4/3]" : "aspect-[16/9]"}`}>
        {thumb ? (
          <Image src={thumb} alt={article.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl" style={{ backgroundColor: "#3dbdac" }}>
            <span className="text-white text-sm font-bold px-4 text-center">{article.title}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1">
        {article.category && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full w-fit" style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}>
            {getCategoryName(article)}
          </span>
        )}
        <h3 className={`font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:underline ${large ? "text-base" : "text-sm"}`}>
          {article.title}
        </h3>
        <time dateTime={article.publishedAt} className="mt-auto text-xs text-gray-400">
          {new Date(article.publishedAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
        </time>
      </div>
    </Link>
  );
}

export default async function MediaPage() {
  const allArticles = await getAllWithArticles();

  const pickupArticles = PICKUP_IDS
    .map((id) => allArticles.find((a) => a.id === id))
    .filter((a): a is WithArticle => !!a);

  const categoryGroups = CATEGORY_ORDER.map((cat) => ({
    name: cat,
    articles: allArticles.filter((a) => getCategoryName(a) === cat).slice(0, 3),
  }));

  return (
    <main className="bg-white">

      <section className="py-5 px-6 text-center bg-white border-b-4" style={{ borderColor: "#3dbdac" }}>
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/withlogo.png" alt="WITH by NovolBa" className="w-1/2 sm:w-1/3 h-auto object-contain" />
        </div>
      </section>

      <section className="px-4 sm:px-6 py-0" style={{ backgroundColor: "#3dbdac" }}>
        <div className="w-full sm:w-[85%] lg:w-[70%] mx-auto">
          {pickupArticles.length >= 3 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1">
              <div className="sm:col-span-2">
                <Link
                  href={`/media/${pickupArticles[0].id}/`}
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
              <div className="flex flex-col gap-1">
                {[pickupArticles[1], pickupArticles[2]].map((article) => {
                  const thumb = article.eyecatch?.url ?? extractFirstImage(article.content) ?? null;
                  return (
                    <Link
                      key={article.id}
                      href={`/media/${article.id}/`}
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

      <section className="py-10 px-6 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <MediaSearch allBlogs={allArticles} />
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1 h-6 rounded-full" style={{ backgroundColor: "#3dbdac" }} />
            <h2 className="text-xl font-bold tracking-wide" style={{ color: "#3dbdac" }}>
              新着記事
            </h2>
          </div>
          <LatestSlider articles={allArticles.slice(0, 10)} />
        </div>
      </section>

      {categoryGroups.map((group, index) => (
        <section key={group.name} className={`py-16 px-6 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full" style={{ backgroundColor: "#3dbdac" }} />
                <h2 className="text-xl font-bold tracking-wide" style={{ color: "#3dbdac" }}>
                  {group.name}
                </h2>
              </div>
            </div>
            {group.articles.length < 3 ? (
              <div className="flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-400 mb-1">Coming Soon...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {group.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <Link
                    href={`/media/category/${CATEGORY_SLUG_MAP[group.name]}/`}
                    className="inline-block px-8 py-3 text-sm font-medium text-white rounded-full hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#3dbdac" }}
                  >
                    More
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      ))}

      <section className="py-8 px-6 text-center bg-white">
        <Link
          href="/media/about"
          className="inline-flex items-center gap-2 px-10 py-3 text-sm font-medium text-white rounded-full hover:opacity-90 transition-opacity shadow-sm"
          style={{ backgroundColor: "#3dbdac" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          WITH?
        </Link>
      </section>

      <section className="py-12 px-6 text-center bg-white border-t border-gray-100">
        <Link
          href="/media/all/"
          className="inline-block px-10 py-3 text-sm font-medium border-2 rounded-full transition-colors hover:text-white hover:bg-teal-500"
          style={{ borderColor: "#3dbdac", color: "#3dbdac" }}
        >
          All Articles
        </Link>
      </section>

    </main>
  );
}
