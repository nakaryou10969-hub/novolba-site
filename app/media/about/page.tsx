import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WITHとは | NovolBa",
  description: "WITH by NovolBa。スタートアップの挑戦に「光」を当てるメディア。",
};

export default function WithAboutPage() {
  return (
    <main className="bg-white">

      {/* ===== ヘッダー ===== */}
      <section className="py-5 px-6 text-center bg-white border-b-4" style={{ borderColor: "#3dbdac" }}>
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/withlogo.png"
            alt="WITH by NovolBa"
            className="w-1/2 sm:w-1/3 h-auto object-contain"
          />
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">

          {/* タイトル */}
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">About</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">ABOUT</h1>
            <div className="w-12 h-0.5 mx-auto" style={{ backgroundColor: "#3dbdac" }} />
          </div>

          {/* メイン画像 */}
          <div className="w-full rounded-2xl overflow-hidden mb-12 shadow-md bg-gray-50">
            <Image
              src="/with.png"
              alt="WITH by NovolBa"
              width={1200}
              height={800}
              className="w-full h-auto"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>

          {/* キャッチコピー */}
          <div className="text-center mb-10">
            <p className="text-xl sm:text-2xl font-bold text-gray-800 leading-relaxed mb-1">
              共に 夢を魅せ
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 leading-relaxed mb-4">
              共に 社会を変える
            </p>
            <p className="text-lg font-bold tracking-widest" style={{ color: "#3dbdac" }}>
              WITH STARTUPS
            </p>
          </div>

          {/* 本文 */}
          <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-6 text-base">
            <p>
              『WITH』は、スタートアップの挑戦に「光」を当てるメディアです。
            </p>
            <p>
              スタートアップが乗り越えてきた困難や、起業家のパーソナリティー、ベンチャーキャピタルから見た投資基準等を発信しています。
            </p>
            <p>
              スタートアップと共に（＝WITH）歩んでいきたいという意味を込めて『WITH』という名前にしました。
            </p>
            <p>
              このメディアを通して、スタートアップがより注目され、一緒に夢を見る仲間が集まり、より良い社会を作る起業家が増える。そんな未来の実現を目指します。
            </p>
          </div>

          {/* 区切り */}
          <div className="my-12 border-t border-gray-100" />

          {/* 運営会社情報 */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-6">【運営会社】</h2>
            <dl className="space-y-4 text-sm text-gray-600">
              {[
                { label: "会社名", value: "株式会社NovolBa" },
                { label: "代表者", value: "鄧 雯（トウ ブン）" },
                {
                  label: "事業内容",
                  value: "スタートアップ向けオフィス空間サービス、家具のサブスクリプションサービス、メディア事業、企業ロゴ・デザイン作成 等",
                },
              ].map((item) => (
                <div key={item.label} className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                  <dt className="shrink-0 font-semibold text-gray-700 sm:w-24">{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                <dt className="shrink-0 font-semibold text-gray-700 sm:w-24">WEB</dt>
                <dd>
                  <a
                    href="https://novolba.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-70 transition-opacity"
                    style={{ color: "#3dbdac" }}
                  >
                    https://novolba.com/
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* 区切り */}
          <div className="my-12 border-t border-gray-100" />

          {/* SNSリンク */}
          <div className="flex items-center justify-center gap-6">
            <a href="https://www.facebook.com/WITHNovolBa" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a href="https://twitter.com/novolba" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="http://instagram.com/with_novolba" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="https://www.youtube.com/channel/UCGSvVbXQhKWjPW-ybTItfDQ" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>

          {/* 区切り */}
          <div className="my-12 border-t border-gray-100" />

          {/* メディアへ戻るボタン */}
          <div className="text-center">
            <Link
              href="/media"
              className="inline-block px-10 py-3 text-sm font-medium border-2 rounded-full transition-colors hover:text-white hover:bg-teal-500"
              style={{ borderColor: "#3dbdac", color: "#3dbdac" }}
            >
              ← メディアトップへ戻る
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}
