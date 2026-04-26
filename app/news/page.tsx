import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client, type Blog, type Category, type MicroCMSListResponse } from "../../libs/client";
import { extractFirstImage } from "../../libs/extractFirstImage";

export const metadata: Metadata = {
  title: "NEWS | NovolBa",
  description: "NovolBaの最新ニュース・イベント情報・メディア掲載情報をお届けします。",
};

async function getBlogs(): Promise<MicroCMSListResponse<Blog>> {
  return client.getList<Blog>({
    endpoint: "blogs",
    queries: {
      limit: 100,
      orders: "-publishedAt",
      filters: "category[exists]",
    },
  });
}

async function getBlogsWithoutCategory(): Promise<MicroCMSListResponse<Blog>> {
  // カテゴリーなしの記事を取得（全件取得してJS側でフィルタ）
  const all = await client.getList<Blog>({
    endpoint: "blogs",
    queries: { limit: 100, orders: "-publishedAt" },
  });
  return {
    ...all,
    contents: all.contents.filter((b) => !b.category),
  };
}

async function getCategories(): Promise<MicroCMSListResponse<Category>> {
  return client.getList<Category>({
    endpoint: "categories",
    queries: { limit: 20 },
  });
}

export default async function NewsPage() {
  const [blogsData, categoriesData] = await Promise.all([
    getBlogsWithoutCategory(),
    getCategories(),
  ]);

  const latestBlogs = blogsData.contents.slice(0, 5);

  return (
    <main className="bg-white">

      {/* ===== ページヘッダー ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-24 px-6"
        style={{
          background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "#3dbdac" }} />
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">Latest Information</p>
        <h1 className="text-4xl font-bold tracking-widest text-gray-800">NEWS</h1>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
      </section>

      {/* ===== コンテンツ ===== */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">

          {/* ===== 記事一覧（左） ===== */}
          <div className="flex-1 min-w-0">
            {blogsData.contents.length === 0 ? (
              <p className="text-gray-400 text-sm">記事はまだありません。</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {blogsData.contents.map((blog) => (
                  <li key={blog.id}>
                    <Link
                      href={`/news/${blog.id}`}
                      className="flex gap-4 py-6 group hover:opacity-80 transition-opacity"
                    >
                      {/* サムネイル */}
                      <div className="shrink-0 w-40 h-28 sm:w-52 sm:h-36 relative rounded-lg overflow-hidden bg-gray-100">
                        {blog.eyecatch ? (
                          <Image
                            src={blog.eyecatch.url}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        ) : extractFirstImage(blog.content) ? (
                          <Image
                            src={extractFirstImage(blog.content)!}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-xl"
                            style={{ backgroundColor: "#e6f7f5" }}
                          >
                            📝
                          </div>
                        )}
                      </div>

                      {/* テキスト */}
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <time
                            dateTime={blog.publishedAt}
                            className="text-xs text-gray-400"
                          >
                            {new Date(blog.publishedAt).toLocaleDateString("ja-JP", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </time>
                          {blog.category && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
                            >
                              {blog.category.name}
                            </span>
                          )}
                        </div>
                        <h2 className="text-sm font-semibold text-gray-800 leading-snug truncate group-hover:underline">
                          {blog.title}
                        </h2>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ===== サイドバー（右） ===== */}
          <aside className="lg:w-64 shrink-0 flex flex-col gap-8">

            {/* カテゴリー */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 tracking-widest mb-4 pb-2 border-b border-gray-200">
                カテゴリー
              </h3>
              {categoriesData.contents.length === 0 ? (
                <p className="text-xs text-gray-400">カテゴリーはありません。</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {categoriesData.contents.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/news/category/${cat.id}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-500 transition-colors"
                      >
                        <span style={{ color: "#3dbdac" }}>›</span>
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 最新の投稿 */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 tracking-widest mb-4 pb-2 border-b border-gray-200">
                最新の投稿
              </h3>
              <ul className="flex flex-col gap-4">
                {latestBlogs.map((blog) => (
                  <li key={blog.id}>
                    <Link
                      href={`/news/${blog.id}`}
                      className="flex gap-3 group hover:opacity-80 transition-opacity"
                    >
                      <div className="shrink-0 w-14 h-10 relative rounded overflow-hidden bg-gray-100">
                        {blog.eyecatch ? (
                          <Image
                            src={blog.eyecatch.url}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : extractFirstImage(blog.content) ? (
                          <Image
                            src={extractFirstImage(blog.content)!}
                            alt={blog.title}
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
                          {new Date(blog.publishedAt).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-gray-700 leading-snug line-clamp-2 group-hover:underline">
                          {blog.title}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </aside>
        </div>
      </section>

    </main>
  );
}
