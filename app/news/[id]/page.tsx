import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client, type Blog } from "../../../libs/client";
import { extractFirstImage } from "../../../libs/extractFirstImage";
import { getArticleStaticParamIds, getNewsArticlePath } from "../../../libs/articlePath";
import { renderArticleContent } from "../../../libs/renderArticleContent";

type Props = {
  params: Promise<{ id: string }>;
};

let allBlogsPromise: Promise<Blog[]> | null = null;

async function fetchAllBlogs(): Promise<Blog[]> {
  const first = await client.getList<Blog>({
    endpoint: "blogs",
    queries: { limit: 100, offset: 0, orders: "-publishedAt" },
  });
  let all = first.contents;
  for (let offset = 100; offset < first.totalCount; offset += 100) {
    const next = await client.getList<Blog>({
      endpoint: "blogs",
      queries: { limit: 100, offset, orders: "-publishedAt" },
    });
    all = [...all, ...next.contents];
  }
  return all;
}

function getAllBlogs(): Promise<Blog[]> {
  allBlogsPromise ??= fetchAllBlogs();
  return allBlogsPromise;
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toRouteKeyCandidates(value: string) {
  const decoded = safeDecodeURIComponent(value);
  return new Set([
    value,
    value.toLowerCase(),
    decoded,
    encodeURIComponent(decoded).toLowerCase(),
  ]);
}

async function getBlogByIdOrSlug(idOrSlug: string): Promise<Blog | null> {
  const all = await getAllBlogs();
  const idOrSlugCandidates = toRouteKeyCandidates(idOrSlug);
  return all.find((item) => {
    const blogCandidates = toRouteKeyCandidates(item.slug || item.id);
    return item.id === idOrSlug || [...blogCandidates].some((candidate) => idOrSlugCandidates.has(candidate));
  }) ?? null;
}

export async function generateStaticParams() {
  const all = await getAllBlogs();
  return all.flatMap(getArticleStaticParamIds);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const blog = await getBlogByIdOrSlug(id);
  if (blog) {
    const firstImage = extractFirstImage(blog.content);
    return {
      title: `${blog.title} | NEWS | NovolBa`,
      description: blog.title,
      openGraph: {
        title: blog.title,
        images: blog.eyecatch?.url
          ? [blog.eyecatch.url]
          : firstImage
          ? [firstImage]
        : [],
      },
    };
  }
  return { title: "記事が見つかりません | NovolBa" };
}

async function getLatestBlogs(excludeId: string): Promise<Blog[]> {
  const all = await getAllBlogs();
  return all.filter((blog) => blog.id !== excludeId).slice(0, 5);
}

async function getRelatedBlogs(blog: Blog): Promise<Blog[]> {
  if (!blog.category) return [];
  const all = await getAllBlogs();
  return all
    .filter((candidate) => candidate.id !== blog.id && candidate.category?.id === blog.category?.id)
    .slice(0, 3);
}

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params;

  const resolvedBlog = await getBlogByIdOrSlug(id);
  if (!resolvedBlog) {
    notFound();
  }
  const blog = resolvedBlog;

  const [latestBlogsData, relatedBlogs] = await Promise.all([
    getLatestBlogs(blog.id),
    getRelatedBlogs(blog),
  ]);

  const latestBlogs = latestBlogsData;
  const thumbnailUrl = blog.eyecatch?.url ?? extractFirstImage(blog.content) ?? null;

  return (
    <main className="bg-white">

      {/* ===== ページヘッダー ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-16 px-6"
        style={{
          background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "#3dbdac" }} />
        <div className="max-w-3xl">
          {blog.category && (
            <Link
              href={`/news/category/${blog.category.id}`}
              className="inline-block text-xs px-3 py-1 rounded-full mb-4 hover:opacity-80 transition-opacity"
              style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
            >
              {blog.category.name}
            </Link>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight mb-4">
            {blog.title}
          </h1>
          <time dateTime={blog.publishedAt} className="text-xs text-gray-400">
            {new Date(blog.publishedAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </section>

      {/* ===== コンテンツ ===== */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">

          {/* ===== 記事本文（左） ===== */}
          <article className="flex-1 min-w-0">

            {/* アイキャッチ */}
            {thumbnailUrl && (
              <div className="w-full rounded-2xl overflow-hidden mb-8 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl}
                  alt={blog.title}
                  className="w-full h-auto block"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
            )}

            {/* 本文 */}
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: renderArticleContent(blog.content) }}
            />

            {/* カテゴリー・著者 */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500">
              {blog.category && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">カテゴリー:</span>
                  <Link
                    href={`/news/category/${blog.category.id}`}
                    className="px-3 py-1 rounded-full text-xs hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
                  >
                    {blog.category.name}
                  </Link>
                </div>
              )}
              {blog.author && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">著者:</span>
                  <span>{blog.author}</span>
                </div>
              )}
            </div>

            {/* 記事一覧に戻る */}
            <div className="mt-8">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: "#3dbdac" }}
              >
                <span>←</span>
                記事一覧に戻る
              </Link>
            </div>
          </article>

          {/* ===== サイドバー（右） ===== */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-20 flex flex-col gap-8">

              {/* 最新の投稿 */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 tracking-widest mb-4 pb-2 border-b border-gray-200">
                  最新の投稿
                </h3>
                <ul className="flex flex-col gap-4">
                  {latestBlogs.map((latestBlog) => {
                    const thumb = latestBlog.eyecatch?.url ?? extractFirstImage(latestBlog.content);
                    return (
                      <li key={latestBlog.id}>
                        <a
                          href={getNewsArticlePath(latestBlog)}
                          className="flex gap-3 group hover:opacity-80 transition-opacity"
                        >
                          <div className="shrink-0 w-14 h-10 relative rounded overflow-hidden bg-gray-100">
                            {thumb ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={thumb}
                                alt={latestBlog.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                                fetchPriority="low"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-sm"
                                style={{ backgroundColor: "#e6f7f5" }}
                              >
                                📝
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 mb-0.5">
                              {new Date(latestBlog.publishedAt).toLocaleDateString("ja-JP", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-gray-700 leading-snug line-clamp-2 group-hover:underline">
                              {latestBlog.title}
                            </p>
                          </div>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

            </div>
          </aside>
        </div>
      </section>

      {/* ===== 関連記事 ===== */}
      {relatedBlogs.length > 0 && (
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-8 text-center tracking-wide">
              関連記事
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedBlogs.map((related) => {
                const thumb = related.eyecatch?.url ?? extractFirstImage(related.content);
                return (
                  <a
                    key={related.id}
                    href={getNewsArticlePath(related)}
                    className="flex flex-col rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow group"
                  >
                    <div className="w-full aspect-[16/9] bg-gray-100 overflow-hidden rounded-t-xl">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt={related.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
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
                    <div className="p-4 flex flex-col gap-1">
                      <time className="text-xs text-gray-400">
                        {new Date(related.publishedAt).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:underline">
                        {related.title}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
