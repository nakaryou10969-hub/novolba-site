"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { extractFirstImage } from "../../libs/extractFirstImage";
import type { WithArticle } from "../../libs/client";

const ITEMS_PER_PAGE = 3;

function getCategoryName(article: WithArticle): string {
  if (!article.category) return "";
  if (typeof article.category === "string") return article.category;
  if (typeof article.category === "object" && "name" in (article.category as object)) {
    return (article.category as { name: string }).name;
  }
  return String(article.category);
}

function ArticleCard({ article }: { article: WithArticle }) {
  const thumb = article.eyecatch?.url ?? extractFirstImage(article.content) ?? null;

  return (
    <Link
      href={`/media/${article.id}/`}
      className="flex flex-col rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow group border border-gray-100 h-full"
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
            className="w-full h-full flex items-center justify-center"
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

export default function LatestSlider({ articles }: { articles: WithArticle[] }) {
  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
  const [page, setPage] = useState(0);

  const prev = () => setPage((p) => Math.max(p - 1, 0));
  const next = () => setPage((p) => Math.min(p + 1, totalPages - 1));

  const visible = articles.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

  return (
    <div>
      {/* カード */}
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {visible.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="flex items-center justify-center gap-4 mt-8">
        {/* 左矢印 */}
        <button
          onClick={prev}
          disabled={page === 0}
          aria-label="前へ"
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderColor: "#3dbdac", color: "#3dbdac" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* ドット */}
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={`${i + 1}ページ目`}
              className="w-2.5 h-2.5 rounded-full transition-colors"
              style={{ backgroundColor: i === page ? "#3dbdac" : "#d1d5db" }}
            />
          ))}
        </div>

        {/* 右矢印 */}
        <button
          onClick={next}
          disabled={page === totalPages - 1}
          aria-label="次へ"
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderColor: "#3dbdac", color: "#3dbdac" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* ページ表示 */}
      <p className="text-center text-xs text-gray-400 mt-3">
        {page * ITEMS_PER_PAGE + 1}〜{Math.min((page + 1) * ITEMS_PER_PAGE, articles.length)} / {articles.length}件
      </p>
    </div>
  );
}
