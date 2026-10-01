import Image from "next/image";
import Link from "next/link";
import type { WithArticle } from "../../libs/client";
import { type WithArticleDisplay, formatArticleDate } from "../../libs/articlePresentation";
import { extractFirstImage } from "../../libs/extractFirstImage";
import { getWithArticlePath, getMediaArticlePath } from "../../libs/articlePath";
import { renderArticleContent } from "../../libs/renderArticleContent";
import { CATEGORY_SLUG_MAP } from "../media/constants";

type Props = {
  article: WithArticleDisplay;
  latestArticles?: WithArticle[];
  view?: "with" | "media";
  contentHtml?: string;
  preview?: boolean;
};

export default function WithArticleView({ article, latestArticles = [], view = "with", contentHtml, preview = false }: Props) {
  const thumb = article.eyecatch?.url ?? extractFirstImage(article.content) ?? null;
  const LatestArticleLink = view === "media" ? "a" : Link;
  return (
    <main className="bg-white">

      {/* ページヘッダー */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-16 px-6"
        style={{ background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "#3dbdac" }} />
        {article.category && (
          <Link
            href={`/${view}/category/${CATEGORY_SLUG_MAP[article.category] ?? encodeURIComponent(article.category)}/`}
            className="inline-block text-xs px-3 py-1 rounded-full mb-4 hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
          >
            {article.category}
          </Link>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight mb-4 max-w-3xl">
          {article.title}
        </h1>
        <time dateTime={article.publishedAt} className="text-xs text-gray-400">
          {formatArticleDate(article.publishedAt)}
        </time>
      </section>

      {/* コンテンツ */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">

          {/* 記事本文 */}
          <article className="flex-1 min-w-0">
            {thumb && (
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-gray-100">
                <Image src={thumb} alt={article.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 800px" priority />
              </div>
            )}
            <div className="prose-content" dangerouslySetInnerHTML={{ __html: contentHtml ?? renderArticleContent(article.content) }} />
            <div className="mt-8">
              <Link
                href="/media"
                className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: "#3dbdac" }}
              >
                ← メディアトップへ戻る
              </Link>
            </div>
          </article>

          {/* サイドバー */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-20">
              <h3 className="text-sm font-bold text-gray-700 tracking-widest mb-4 pb-2 border-b border-gray-200">
                最新の投稿
              </h3>
              {preview && <p className="text-sm text-gray-500 leading-relaxed mb-4">プレビューでは最新の投稿を取得していません。</p>}
              <ul className="flex flex-col gap-4">
                {latestArticles.map((a) => {
                  const t = a.eyecatch?.url ?? extractFirstImage(a.content);
                  return (
                    <li key={a.id}>
                      <LatestArticleLink href={view === "media" ? getMediaArticlePath(a) : getWithArticlePath(a)} className="flex gap-3 group hover:opacity-80 transition-opacity">
                        <div className="shrink-0 w-14 h-10 relative rounded overflow-hidden bg-gray-100">
                          {t ? (
                            <Image src={t} alt={a.title} fill className="object-cover" sizes="56px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm" style={{ backgroundColor: "#e6f7f5" }}>📝</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 mb-0.5">
                            {formatArticleDate(a.publishedAt, "short")}
                          </p>
                          <p className="text-xs text-gray-700 leading-snug line-clamp-2 group-hover:underline">{a.title}</p>
                        </div>
                      </LatestArticleLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </section>

    </main>
  );
}
