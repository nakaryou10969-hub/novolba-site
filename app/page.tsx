import Image from "next/image";
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

// ---- ページコンポーネント ----

export default async function Home() {
  const [blogsData, servicesData] = await Promise.all([
    getBlogs(),
    getServices(),
  ]);

  return (
    <main className="min-h-screen bg-white">
      {/* ===== サービス一覧 ===== */}
      <section className="py-20 px-4 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light tracking-widest text-gray-800 font-serif">
            Service
          </h2>
          <div className="mt-2 mx-auto w-24 h-px bg-teal-400" />
        </div>

        {servicesData.contents.length === 0 && (
          <p className="text-center text-gray-400 text-sm">サービス情報はまだありません。</p>
        )}
        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-3">
          {servicesData.contents.map((service) => (
            <div
              key={service.id}
              className="flex flex-col rounded-2xl overflow-hidden shadow-md bg-white"
            >
              {/* カード画像 */}
              {service.image && (
                <div className="relative w-full aspect-[4/3] bg-gray-100">
                  <Image
                    src={service.image.url}
                    alt={service.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
              )}

              {/* カード本文 */}
              <div className="flex flex-col gap-3 px-5 py-5">
                <h3 className="text-base font-semibold text-gray-800 text-center">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-500 text-center leading-relaxed">
                  {service.description}
                </p>

                {service.bullets && service.bullets.length > 0 && (
                  <ul className="flex flex-col gap-1 mt-1">
                    {service.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <svg
                          className="mt-0.5 shrink-0 text-teal-500"
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
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ブログ一覧 ===== */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light tracking-widest text-gray-800 font-serif">
            Blog
          </h2>
          <div className="mt-2 mx-auto w-24 h-px bg-teal-400" />
        </div>

        {blogsData.contents.length === 0 && (
          <p className="text-center text-gray-400 text-sm">ブログ記事はまだありません。</p>
        )}
        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogsData.contents.map((blog) => (
            <article
              key={blog.id}
              className="flex flex-col rounded-2xl overflow-hidden shadow-md bg-white"
            >
              {/* サムネイル */}
              {blog.eyecatch && (
                <div className="relative w-full aspect-[16/9] bg-gray-100">
                  <Image
                    src={blog.eyecatch.url}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}

              {/* 記事情報 */}
              <div className="flex flex-col gap-2 px-5 py-5 flex-1">
                {blog.category && (
                  <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">
                    {blog.category.name}
                  </span>
                )}
                <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
                  {blog.title}
                </h3>
                <time
                  dateTime={blog.publishedAt}
                  className="mt-auto text-xs text-gray-400"
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
      </section>
    </main>
  );
}
