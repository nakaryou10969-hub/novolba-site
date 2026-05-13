"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { extractFirstImage } from "../../libs/extractFirstImage";

type Article = {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  category?: string | { id: string; name: string };
  eyecatch?: { url: string };
};

function ArticleCard({ article }: { article: Article }) {
  const thumb = article.eyecatch?.url ?? extractFirstImage(article.content) ?? null;
  const categoryName = typeof article.category === "string"
    ? article.category
    : article.category?.name;

  return (
    <Link
      href={`/with/${article.id}/`}
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
        {categoryName && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full w-fit"
            style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
          >
            {categoryName}
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

export default function MediaSearch({ allBlogs }: { allBlogs: Article[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allBlogs.filter((b) => {
      const categoryName = typeof b.category === "string"
        ? b.category
        : b.category?.name ?? "";
      return (
        b.title.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q)
      );
    });
  }, [query, allBlogs]);

  const isSearching = query.trim().length > 0;

  return (
    <div>
      {/* 検索ボックス */}
      <div className="relative max-w-xl mx-auto">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="記事タイトル・カテゴリーで検索"
          className="w-full pl-10 pr-10 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white shadow-sm"
          style={{ "--tw-ring-color": "#3dbdac" } as React.CSSProperties}
        />
        {isSearching && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="検索をクリア"
          >
            ×
          </button>
        )}
      </div>

      {/* 検索結果 */}
      {isSearching && (
        <div className="mt-8">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400">「{query}」に一致する記事が見つかりませんでした。</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-6 text-center">
                「{query}」の検索結果：{results.length}件
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {results.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
