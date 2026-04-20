import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "COMPANY | NovolBa",
  description: "株式会社NovolBaの会社概要。代表取締役・事業内容・所在地などをご紹介します。",
};

const companyInfo = [
  { label: "社名", value: "株式会社NovolBa" },
  { label: "代表取締役", value: "鄧 雯（トウ ブン）" },
  {
    label: "事業内容",
    value: "家具付きオフィス及び家具のサブスクリプションサービス、Webメディア運営、コミュニティ運営",
  },
  { label: "設立", value: "2021年11月12日" },
  {
    label: "本社",
    value: "東京都渋谷区渋谷2-24-12 渋谷スクランブルスクエア 44階",
  },
  {
    label: "営業所",
    value: "東京都千代田区神田錦町3-15-16 錦町ブンカイサン 2階",
  },
  { label: "主要株主", value: "株式会社オカムラ／株式会社ボーンレックス" },
];

export default function CompanyPage() {
  return (
    <main className="bg-white">

      {/* ===== ページヘッダー ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-24 px-6"
        style={{
          background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: "#3dbdac" }}
        />
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">About Us</p>
        <h1 className="text-4xl font-bold tracking-widest text-gray-800">COMPANY</h1>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
      </section>

      {/* ===== 会社概要テーブル ===== */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-10 text-center tracking-wide">
            会社概要
          </h2>

          <dl className="divide-y divide-gray-100 border-t border-gray-100">
            {companyInfo.map((item) => (
              <div
                key={item.label}
                className="flex flex-col sm:flex-row py-5 gap-2 sm:gap-8"
              >
                <dt className="sm:w-32 shrink-0 text-sm font-semibold text-gray-500">
                  {item.label}
                </dt>
                <dd className="text-sm text-gray-700 leading-relaxed">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section
        className="py-20 px-6 text-center text-white"
        style={{ backgroundColor: "#3dbdac" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
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
