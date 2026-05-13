import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client, type WithArticle } from "../../../libs/client";
import { extractFirstImage } from "../../../libs/extractFirstImage";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const data = await client.getList<WithArticle>({
    endpoint: "with",
    queries: { limit: 100, fields: "id" },
  });
  return data.contents.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const article = await client.get<WithArticle>({ endpoint: "with", contentId: id });
    return {
      title: `${article.title} | WITH by NovolBa`,
      description: article.title,
    };
  } catch {
    return { title: "記事が見つかりません | NovolBa" };
  }
}

export default async function WithArticlePage({ params }: Props) {
  const { id } = await params;

  let article: WithArticle;
  try {
    article = await client.get<WithArticle>({ endpoint: "with", contentId: id });
  } catch {
    notFound();
  }

  const latestData = await client.getList<WithArticle>({
    endpoint: "with",
    queries: { limit: 5, orders: "-publishedAt" },
  });
  const latestArticles = latestData.contents.filter((a) => a.id !== id);
  const thumb = article.eyecatch?.url ?? extractFirstImage(article.content) ?? null;

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
            href={`/with/category/${encodeURIComponent(article.category)}`}
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
          {new Date(article.publishedAt).toLocaleDateString("ja-JP", {
            year: "numeric", month: "long", day: "numeric",
          })}
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
            <div className="prose-content" dangerouslySetInnerHTML={{ __html: article.content }} />
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
              <ul className="flex flex-col gap-4">
                {latestArticles.map((a) => {
                  const t = a.eyecatch?.url ?? extractFirstImage(a.content);
                  return (
                    <li key={a.id}>
                      <Link href={`/with/${a.id}`} className="flex gap-3 group hover:opacity-80 transition-opacity">
                        <div className="shrink-0 w-14 h-10 relative rounded overflow-hidden bg-gray-100">
                          {t ? (
                            <Image src={t} alt={a.title} fill className="object-cover" sizes="56px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm" style={{ backgroundColor: "#e6f7f5" }}>📝</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 mb-0.5">
                            {new Date(a.publishedAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" })}
                          </p>
                          <p className="text-xs text-gray-700 leading-snug line-clamp-2 group-hover:underline">{a.title}</p>
                        </div>
                      </Link>
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
