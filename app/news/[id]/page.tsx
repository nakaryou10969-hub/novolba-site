import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client, type Blog, type MicroCMSListResponse } from "../../../libs/client";
import { extractFirstImage } from "../../../libs/extractFirstImage";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const blog = await client.get<Blog>({
      endpoint: "blogs",
      contentId: id,
    });
    return {
      title: `${blog.title} | NEWS | NovolBa`,
      description: blog.title,
    };
  } catch {
    return {
      title: "記事が見つかりません | NovolBa",
    };
  }
}

async function getLatestBlogs(): Promise<MicroCMSListResponse<Blog>> {
  return client.getList<Blog>({
    endpoint: "blogs",
    queries: { limit: 5, orders: "-publishedAt" },
  });
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

  const latestBlogs = await getLatestBlogs();

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
            <span
              className="inline-block text-xs px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
            >
              {blog.category.name}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight mb-4">
            {blog.title}
          </h1>
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
        </div>
      </section>

      {/* ===== コンテンツ ===== */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">

          {/* ===== 記事本文（左） ===== */}
          <article className="flex-1 min-w-0">
            {/* アイキャッチ */}
            {blog.eyecatch && (
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-gray-100">
                <Image
                  src={blog.eyecatch.url}
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

            {/* 記事一覧に戻る */}
            <div className="mt-12 pt-8 border-t border-gray-100">
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
            <div className="sticky top-20">
              <h3 className="text-sm font-bold text-gray-700 tracking-widest mb-4 pb-2 border-b border-gray-200">
                最新の投稿
              </h3>
              <ul className="flex flex-col gap-4">
                {latestBlogs.contents.map((latestBlog) => (
                  <li key={latestBlog.id}>
                    <Link
                      href={`/news/${latestBlog.id}`}
                      className="flex gap-3 group hover:opacity-80 transition-opacity"
                    >
                      <div className="shrink-0 w-14 h-10 relative rounded overflow-hidden bg-gray-100">
                        {latestBlog.eyecatch ? (
                          <Image
                            src={latestBlog.eyecatch.url}
                            alt={latestBlog.title}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : extractFirstImage(latestBlog.content) ? (
                          <Image
                            src={extractFirstImage(latestBlog.content)!}
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
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

    </main>
  );
}
