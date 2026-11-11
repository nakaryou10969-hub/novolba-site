import type { Metadata } from "next";

// 旧URL（2026-11-05〜11 公開）からの転送用ページ。
// 静的書き出しでは next.config の redirects が使えないため、
// meta refresh と location.replace で新URLへ移し、検索エンジンには noindex と canonical で新URLを示す。
const NEW_PATH = "/service/kaitori-daisuke/";
const NEW_URL = `https://novolba.com${NEW_PATH}`;

export const metadata: Metadata = {
  title: "買取大助（ページ移動のお知らせ）",
  robots: { index: false, follow: true },
  alternates: { canonical: NEW_URL },
};

export default function KaitoriDaisukeLegacyRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${NEW_PATH}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `location.replace(${JSON.stringify(NEW_PATH)} + location.search + location.hash);`,
        }}
      />
      <main className="bg-white px-6 py-24 text-center">
        <p className="text-base leading-relaxed text-gray-800">
          買取大助のページは移動しました。
        </p>
        <p className="mt-4 text-base">
          <a href={NEW_PATH} className="underline" style={{ color: "#147D6F" }}>
            新しいページへ移動する
          </a>
        </p>
      </main>
    </>
  );
}
