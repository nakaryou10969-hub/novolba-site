import Image from "next/image";
import Link from "next/link";
import { client, type Blog, type Service, type MicroCMSListResponse } from "../libs/client";

// ---- データ取得 ----

async function getBlogs(): Promise<MicroCMSListResponse<Blog>> {
  return client.getList<Blog>({
    endpoint: "blogs",
    queries: { limit: 6, orders: "-publishedAt" },
  });
}

async function getServices(): Promise<MicroCMSListResponse<Service>> {
  return client.getList<Service>({
    endpoint: "service",
    queries: { limit: 10 },
  });
}

// ---- ページ ----

export default async function Home() {
  const [blogsData, servicesData] = await Promise.all([
    getBlogs(),
    getServices(),
  ]);

  return (
    <main className="bg-white">

      {/* ===== Hero ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center min-h-[90vh] px-6"
        style={{
          background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)",
        }}
      >
        {/* アクセントライン */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: "#3dbdac" }}
        />

        <p className="text-xs tracking-[0.3em] text-gray-400 mb-4 uppercase">
          Office Service for Startups
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 leading-tight mb-6">
          挑戦するスタートアップの
          <br />
          <span style={{ color: "#3dbdac" }}>"昇る場"</span>を提供します。
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-xl leading-relaxed mb-10">
          オフィス移転もその後も。手軽に家具を入替えて、いつも最高の空間を！
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/inquiry"
            className="px-8 py-3 text-sm font-medium text-white rounded-full shadow-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#3dbdac" }}
          >
            お問い合わせ
          </Link>
          <Link
            href="#service"
            className="px-8 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            サービスを見る
          </Link>
        </div>

        {/* スクロール矢印 */}
        <div className="absolute bottom-8 flex flex-col items-center gap-1 text-gray-400">
          <span className="text-xs tracking-widest">SCROLL</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none" aria-hidden="true">
            <path d="M8 0v20M1 13l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ===== Service ===== */}
      <section id="service" className="py-24 px-6 bg-white">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-2">Our Services</p>
          <h2 className="text-3xl font-bold tracking-widest text-gray-800">
            Service
          </h2>
          <div className="mt-3 mx-auto w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
        </div>

        {servicesData.contents.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">サービス情報はまだありません。</p>
        ) : (
          <div className="max-w-5xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-3">
            {servicesData.contents.map((service) => (
              <div
                key={service.id}
                className="flex flex-col rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow"
              >
                {/* カード画像 */}
                {service.image ? (
                  <div className="relative w-full aspect-[4/3] bg-gray-100">
                    <Image
                      src={service.image.url}
                      alt={service.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
                    <span className="text-4xl">🏢</span>
                  </div>
                )}

                {/* カード本文 */}
                <div className="flex flex-col gap-3 px-6 py-6 flex-1">
                  <h3 className="text-base font-bold text-gray-800 text-center">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-500 text-center leading-relaxed">
                    {service.description}
                  </p>

                  {service.bullets && service.bullets.length > 0 && (
                    <ul className="flex flex-col gap-2 mt-2">
                      {service.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <svg
                            className="mt-0.5 shrink-0"
                            style={{ color: "#3dbdac" }}
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                          >
                            <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
                            <path
                              d="M4.5 8.5l2.5 2.5 4.5-5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto pt-4">
                    <Link
                      href="/inquiry"
                      className="block text-center text-xs font-medium py-2 px-4 rounded-full border transition-colors hover:text-white"
                      style={{ borderColor: "#3dbdac", color: "#3dbdac" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#3dbdac";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#3dbdac";
                      }}
                    >
                      詳細を見る
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== News / Blog ===== */}
      <section id="news" className="py-24 px-6 bg-gray-50">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-2">Latest Posts</p>
          <h2 className="text-3xl font-bold tracking-widest text-gray-800">
            News
          </h2>
          <div className="mt-3 mx-auto w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
        </div>

        {blogsData.contents.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">記事はまだありません。</p>
        ) : (
          <>
            <div className="max-w-5xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {blogsData.contents.map((blog) => (
                <article
                  key={blog.id}
                  className="flex flex-col rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-xl transition-shadow"
                >
                  {/* サムネイル */}
                  {blog.eyecatch ? (
                    <div className="relative w-full aspect-[16/9] bg-gray-100">
                      <Image
                        src={blog.eyecatch.url}
                        alt={blog.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full aspect-[16/9] flex items-center justify-center"
                      style={{ backgroundColor: "#e6f7f5" }}
                    >
                      <span className="text-3xl">📝</span>
                    </div>
                  )}

                  {/* 記事情報 */}
                  <div className="flex flex-col gap-2 px-5 py-5 flex-1">
                    {blog.category && (
                      <span
                        className="text-xs font-medium uppercase tracking-wide"
                        style={{ color: "#3dbdac" }}
                      >
                        {blog.category.name}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
                      {blog.title}
                    </h3>
                    <time
                      dateTime={blog.publishedAt}
                      className="mt-auto pt-2 text-xs text-gray-400"
                    >
                      {new Date(blog.publishedAt).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/news"
                className="inline-block px-8 py-3 text-sm font-medium border rounded-full transition-colors hover:text-white"
                style={{ borderColor: "#3dbdac", color: "#3dbdac" }}
              >
                記事をもっと見る
              </Link>
            </div>
          </>
        )}
      </section>

      {/* ===== CTA ===== */}
      <section
        className="py-24 px-6 text-center text-white"
        style={{ backgroundColor: "#3dbdac" }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          まずはお気軽にご相談ください
        </h2>
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
