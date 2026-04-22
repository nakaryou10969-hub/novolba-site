import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client, type Blog, type Category, type MicroCMSListResponse } from "../../libs/client";
import { extractFirstImage } from "../../libs/extractFirstImage";

export const metadata: Metadata = {
  title: "MEDIA | NovolBa",
  description: "WITH by NovolBa。スタートアップのリアルを届けるメディア。インタビュー・イベント・コラムなど。",
};

// ---- データ取得 ----

async function getPickupBlogs(): Promise<Blog[]> {
  const data = await client.getList<Blog>({
    endpoint: "blogs",
    queries: { limit: 3, filters: "pickup[equals]true", orders: "-publishedAt" },
  });
  return data.contents;
}

async function getLatestBlogs(): Promise<Blog[]> {
  const data = await client.getList<Blog>({
    endpoint: "blogs",
    queries: { limit: 10, orders: "-publishedAt" },
  });
  return data.contents;
}

async function getCategories(): Promise<Category[]> {
  const data = await client.getList<Category>({
    endpoint: "categories",
    queries: { limit: 20 },
  });
  return data.contents;
}

async function getBlogsByCategory(categoryId: string): Promise<Blog[]> {
  const data = await client.getList<Blog>({
    endpoint: "blogs",
    queries: {
      limit: 3,
      orders: "-publishedAt",
      filters: `category[equals]${categoryId}`,
    },
  });
  return data.contents;
}

// ---- サブコンポーネント ----

function BlogCard({ blog, size = "normal" }: { blog: Blog; size?: "large" | "normal" }) {
  const thumb = blog.eyecatch?.url ?? extractFirstImage(blog.content) ?? null;

  return (
    <Link
      href={`/news/${blog.id}`}
      className="flex flex-col rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-xl transition-shadow group"
    >
      <div className={`relative w-full bg-gray-100 ${size === "large" ? "aspect-[16/9]" : "aspect-[16/9]"}`}>
        {thumb ? (
          <Image
            src={thumb}
            alt={blog.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl" style={{ backgroundColor: "#e6f7f5" }}>
            📝
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1">
        {blog.category && (
          <span className="text-xs font-medium" style={{ color: "#3dbdac" }}>
            {blog.category.name}
          </span>
        )}
        <h3 className={`font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:underline ${size === "large" ? "text-base" : "text-sm"}`}>
          {blog.title}
        </h3>
        <time dateTime={blog.publishedAt} className="mt-auto text-xs text-gray-400">
          {new Date(blog.publishedAt).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>
    </Link>
  );
}

// ---- ページ ----

export default async function MediaPage() {
  const [pickupBlogs, latestBlogs, categories] = await Promise.all([
    getPickupBlogs(),
    getLatestBlogs(),
    getCategories(),
  ]);

  // カテゴリー別記事を並列取得
  const categoryBlogs = await Promise.all(
    categories.map(async (cat) => ({
      category: cat,
      blogs: await getBlogsByCategory(cat.id),
    }))
  );

  return (
    <main className="bg-white">

      {/* ===== ページヘッダー ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-24 px-6"
        style={{ background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "#3dbdac" }} />
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">Media</p>
        <h1 className="text-4xl font-bold tracking-widest text-gray-800 mb-2">WITH by NovolBa</h1>
        <p className="text-sm text-gray-500">スタートアップのリアルを届けるメディア</p>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
      </section>

      {/* ===== PICKUP ===== */}
      {pickupBlogs.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-lg font-bold text-gray-800 tracking-wide">PICKUP</h2>
              <span className="text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: "#3dbdac" }}>
                ピックアップ記事
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {pickupBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} size="large" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 新着記事 ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-bold text-gray-800 tracking-wide mb-8">新着記事</h2>
          {latestBlogs.length === 0 ? (
            <p className="text-sm text-gray-400">記事はまだありません。</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link
              href="/news"
              className="inline-block px-8 py-3 text-sm font-medium border rounded-full transition-colors hover:text-white hover:bg-teal-500"
              style={{ borderColor: "#3dbdac", color: "#3dbdac" }}
            >
              記事をもっと見る
            </Link>
          </div>
        </div>
      </section>

      {/* ===== カテゴリー別 ===== */}
      {categoryBlogs
        .filter((cb) => cb.blogs.length > 0)
        .map((cb) => (
          <section key={cb.category.id} className="py-16 px-6 border-t border-gray-100">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold text-gray-800 tracking-wide">
                  {cb.category.name}
                </h2>
                <Link
                  href={`/news/category/${cb.category.id}`}
                  className="text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "#3dbdac" }}
                >
                  もっと見る →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {cb.blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            </div>
          </section>
        ))}

      {/* ===== CTA ===== */}
      <section
        className="py-20 px-6 text-center text-white"
        style={{ backgroundColor: "#3dbdac" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4">まずはお気軽にご相談ください</h2>
        <p className="text-sm text-white/80 mb-8 max-w-md mx-auto leading-relaxed">
          スタートアップに特化したコンサルタントが個別にヒアリングし、最適なオフィスをご提案します。
        </p>
        <Link
          href="/inquiry"
          className="inline-block px-10 py-3 text-sm font-medium bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          style={{ color: "#3dbdac" }}
        >
          お問い合わせ
        </Link>
      </section>

    </main>
  );
}
