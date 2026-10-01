import type { Blog, WithArticle } from "./client";

// Unpublished microCMS drafts do not necessarily have a publishedAt value.
export type WithArticleDisplay = Omit<WithArticle, "publishedAt"> & { publishedAt?: string };
export type NewsArticleDisplay = Omit<Blog, "publishedAt"> & { publishedAt?: string };

export function formatArticleDate(value?: string, month: "long" | "short" = "long") {
  if (!value || !Number.isFinite(new Date(value).getTime())) return "公開日未設定";
  return new Date(value).toLocaleDateString("ja-JP", { year: "numeric", month, day: "numeric" });
}
