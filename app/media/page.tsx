import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client, type Blog, type Category, type MicroCMSListResponse } from "../../libs/client";
import { extractFirstImage } from "../../libs/extractFirstImage";

export const metadata: Metadata = {
  title: "MEDIA | NovolBa",
  description: "WITH by NovolBa。スタートアップのリアルを届けるメディア。インタビュー・イベント・コラムなど。",
};

// 表示するカテゴリーの順序を固定
const CATEGORY_ORDER = [
  "インタビュー",
  "コラム",
  "対談",
  "checkレポート",
  "イベント",
  "スタートアップ昇る場速報",
  "インタビュー組織作りの問い",
];

async function getAllBlogs(): Promise<Blog[]> {
  const data = await client.getList<Blog>({
    endpoint: "blogs",
    queries: { limit: 100, orders: "-publishedAt" },
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

function BlogCard({ blog }: { blog: Blog }) {
  const thumb = blog.eyecatch?.url ?? extractFirstImage(blog.content) ?? null;

  return (
    <Link
      href={`/news/${blog.id}`}
      className="flex flex-col rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow group border border-gray-100"
    >
      <div className="relative w-full aspect-[16/9] bg-gray-100">
        {thumb ? (
          <Image
            src={thumb}
            alt={blog.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-3xl"
            style={{ backgroundColor: "#e6f7f5" }}
          >
            📝
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1">
        {blog.category && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full w-fit"
            style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
          >
            {blog.category.name}
          </span>
        )}
        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:underline">
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

export default async function MediaPage() {
  const [allBlogs, categories] = await Promise.all([
    getAllBlogs(),
    getCategories(),
  ]);

  // ピックアップ記事（pickup=trueのもの、なければ最新3件）
  const pickupBlogs = allBlogs.filter((b) => b.pickup === true).slice(0, 3);
  const featuredBlogs = pickupBlogs.length > 0 ? pickupBlogs : allBlogs.slice(0, 3);

  // カテゴリーをCATEGORY_ORDERの順に並べ替え
  // microCMSのカテゴリー名と完全一致するものだけを指定順で表示
  const orderedCategories: Category[] = [];
  for (const name of CATEGORY_ORDER) {
    const cat = categories.find((c) => c.name === name);
    if (cat) orderedCategories.push(cat);
  }
  // CATEGORY_ORDERにないカテゴリーは表示しない（指定外は除外）

  // カテゴリー別に記事を振り分け（最新3件）
  const categoryBlogs = orderedCategories.map((cat) => ({
    category: cat,
    blogs: allBlogs
      .filter((b) => b.category?.id === cat.id)
      .slice(0, 3),
  }));

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
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: "#3dbdac" }}
            />
            <h2 className="text-lg font-bold text-gray-800 tracking-wide">PICKUP</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== カテゴリー別 ===== */}
      {categoryBlogs.map((cb, index) => (
        <section
          key={cb.category.id}
          className={`py-16 px-6 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
        >
          <div className="max-w-5xl mx-auto">
            {/* カテゴリーヘッダー */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span
                  className="w-1 h-6 rounded-full"
                  style={{ backgroundColor: "#3dbdac" }}
                />
                <h2 className="text-lg font-bold text-gray-800 tracking-wide">
                  {cb.category.name}
                </h2>
              </div>
              {cb.blogs.length >= 3 && (
                <Link
                  href={`/news/category/${cb.category.id}`}
                  className="text-xs font-medium hover:opacity-70 transition-opacity flex items-center gap-1"
                  style={{ color: "#3dbdac" }}
                >
                  もっと見る
                  <span>→</span>
                </Link>
              )}
            </div>

            {/* 記事が3件未満の場合 */}
            {cb.blogs.length < 3 ? (
              <div className="flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-400 mb-1">記事の更新をお待ちください</p>
                <p className="text-xs text-gray-300">Coming Soon...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {cb.blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      {/* ===== 全記事へのリンク ===== */}
      <section className="py-12 px-6 text-center bg-white border-t border-gray-100">
        <Link
          href="/news"
          className="inline-block px-10 py-3 text-sm font-medium border-2 rounded-full transition-colors hover:text-white hover:bg-teal-500"
          style={{ borderColor: "#3dbdac", color: "#3dbdac" }}
        >
          すべての記事を見る
        </Link>
      </section>

    </main>
  );
}
