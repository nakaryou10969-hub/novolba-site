import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { client, type Blog, type Category } from "../../../../libs/client";
import { extractFirstImage } from "../../../../libs/extractFirstImage";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const data = await client.getList<Category>({
    endpoint: "categories",
    queries: { limit: 20 },
  });
  return data.contents.map((cat) => ({ id: cat.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const cat = await client.get<Category>({
      endpoint: "categories",
      contentId: id,
    });
    return { title: `${cat.name} | NovolBa` };
  } catch {
    return { title: "カテゴリー | NovolBa" };
  }
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;

  let category: Category;
  try {
    category = await client.get<Category>({
      endpoint: "categories",
      contentId: id,
    });
  } catch {
    notFound();
  }

  const [blogsData, allCategories, latestBlogs] = await Promise.all([
    client.getList<Blog>({
      endpoint: "blogs",
      queries: {
        limit: 100,
        orders: "-publishedAt",
        filters: `category[equals]${id}`,
      },
    }),
    client.getList<Category>({
      endpoint: "categories",
      queries: { limit: 20 },
    }),
    client.getList<Blog>({
      endpoint: "blogs",
      queries: { limit: 5, orders: "-publishedAt" },
    }),
  ]);

  return (
    <main className="bg-white">

      {/* ===== カテゴリーヘッダー ===== */}
      <section className="py-8 px-6 bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-gray-400 mb-1">カテゴリー</p>
          <h1 className="text-2xl font-bold text-gray-800">{category.name}</h1>
        </div>
      </section>

      {/* ===== コンテンツ ===== */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">

          {/* ===== 記事一覧（左） ===== */}
          <div className="flex-1 min-w-0">
            {blogsData.contents.length === 0 ? (
              <p className="text-gray-400">記事はまだありません。</p>
            ) : (
              <ul className="flex flex-col gap-8">
                {blogsData.contents.map((blog) => {
                  const thumb = blog.eyecatch?.url ?? extractFirstImage(blog.content) ?? null;
                  return (
                    <li key={blog.id}>
                      <Link
                        href={`/news/${blog.id}`}
                        className="flex gap-5 group hover:opacity-80 transition-opacity"
                      >
                        {/* サムネイル */}
                        <div className="shrink-0 w-48 h-32 relative rounded-lg overflow-hidden bg-gray-100">
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={blog.title}
                              fill
                              className="object-cover"
                              sizes="192px"
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

                        {/* テキスト */}
                        <div className="flex flex-col gap-2 min-w-0">
                          {blog.category && (
                            <span
                              className="text-xs font-bold tracking-widest uppercase"
                              style={{ color: "#3dbdac" }}
                            >
                              {blog.category.name}
                            </span>
                          )}
                          <h2 className="text-lg font-bold text-gray-800 leading-snug group-hover:underline">
                            {blog.title}
                          </h2>
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                            {blog.content.replace(/<[^>]*>/g, "").slice(0, 100)}…
                          </p>
                          <time dateTime={blog.publishedAt} className="text-xs text-gray-400 mt-auto">
                            {new Date(blog.publishedAt).toLocaleDateString("ja-JP", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </time>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ===== サイドバー（右） ===== */}
          <aside className="lg:w-64 shrink-0 flex flex-col gap-8">

            {/* カテゴリー */}
            <div>
              <h3
                className="text-sm font-bold text-white px-3 py-2 rounded mb-4"
                style={{ backgroundColor: "#3dbdac" }}
              >
                カテゴリー
              </h3>
              <div className="flex flex-wrap gap-2">
                {allCategories.contents.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/news/category/${cat.id}`}
                    className={`text-sm px-3 py-1 rounded hover:opacity-80 transition-opacity ${
                      cat.id === id
                        ? "text-white font-bold"
                        : "text-gray-600 bg-gray-100"
                    }`}
                    style={cat.id === id ? { backgroundColor: "#3dbdac" } : {}}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* 最新の投稿 */}
            <div>
              <h3
                className="text-sm font-bold text-white px-3 py-2 rounded mb-4"
                style={{ backgroundColor: "#3dbdac" }}
              >
                最新の投稿
              </h3>
              <ul className="flex flex-col gap-3">
                {latestBlogs.contents.map((blog) => (
                  <li key={blog.id}>
                    <Link
                      href={`/news/${blog.id}`}
                      className="text-sm text-gray-700 hover:text-teal-500 transition-colors leading-snug line-clamp-2"
                    >
                      {blog.title}
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
