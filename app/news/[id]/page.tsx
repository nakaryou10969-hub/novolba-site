import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client, type Blog, type MicroCMSListResponse } from "../../../libs/client";
import { extractFirstImage } from "../../../libs/extractFirstImage";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const data = await client.getList<Blog>({
    endpoint: "blogs",
    queries: { limit: 100, fields: "id" },
  });
  return data.contents.map((blog) => ({ id: blog.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const blog = await client.get<Blog>({
      endpoint: "blogs",
      contentId: id,
    });
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
  } catch {
    return { title: "記事が見つかりません | NovolBa" };
  }
}

async function getLatestBlogs(excludeId: string): Promise<MicroCMSListResponse<Blog>> {
  return client.getList<Blog>({
    endpoint: "blogs",
    queries: { limit: 6, orders: "-publishedAt" },
  });
}

async function getRelatedBlogs(blog: Blog): Promise<Blog[]> {
  if (!blog.category) return [];
  try {
    const data = await client.getList<Blog>({
      endpoint: "blogs",
      queries: {
        limit: 3,
        orders: "-publishedAt",
        filters: `category[equals]${blog.category.id}`,
      },
    });
    return data.contents.filter((b) => b.id !== blog.id).slice(0, 3);
  } catch {
    return [];
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params;

  let blog: Blog;
  try {
    blog = await client.get<Blog>({
      endpoint: "blogs",
      contentId: id,
    });
  } catch {
    notFound();
  }

  const [latestBlogsData, relatedBlogs] = await Promise.all([
    getLatestBlogs(id),
    getRelatedBlogs(blog),
  ]);

  const latestBlogs = latestBlogsData.contents.filter((b) => b.id !== id).slice(0, 5);
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
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-gray-100">
                <Image
                  src={thumbnailUrl}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 800px"
                  priority
                />
              </div>
            )}

            {/* 本文 */}
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
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
                        <Link
                          href={`/news/${latestBlog.id}`}
                          className="flex gap-3 group hover:opacity-80 transition-opacity"
                        >
                          <div className="shrink-0 w-14 h-10 relative rounded overflow-hidden bg-gray-100">
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt={latestBlog.title}
                                fill
                                className="object-cover"
                                sizes="56px"
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
                        </Link>
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
                  <Link
                    key={related.id}
                    href={`/news/${related.id}`}
                    className="flex flex-col rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative w-full aspect-[16/9] bg-gray-100">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={related.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 33vw"
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
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
