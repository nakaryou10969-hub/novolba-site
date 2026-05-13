import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SERVICE | NovolBa",
  description: "NovolBaが提供する3つのサービス。家具ホーダイ!! Service、BASIC OFFICE Service、ノボルバディ Serviceをご紹介します。",
};

const services = [
  {
    id: "kagu-hodai",
    title: "家具ホーダイ!! Service",
    description: "入替え可能な中古家具のサブスクリプション",
    bullets: [
      "1年目 坪3,000円〜",
      "23区内、横浜",
      "月額費用内で、家具の入替え可能",
      "要件に合わせたレイアウト提案",
    ],
    imageSrc: "/service-kagu.jpg",
    detailHref: "/service/kagu-hodai",
    actionLabel: "家具を探す",
    actionHref: "/service/kagu-hodai/furniture",
  },
  {
    id: "basic-office",
    title: "BASIC OFFICE Service",
    description: "5〜30人用の一社占有家具付きオフィス",
    bullets: [
      "10坪 5名利用で月額16万円〜",
      "渋谷、新宿、五反田、東日本橋 等",
      "最低6か月から契約",
      "入居人数分の家具、Wi-Fi、プリンター込",
    ],
    imageSrc: "/service-basic.jpg",
    detailHref: "/service/basic-office",
    actionLabel: "物件を探す",
    actionHref: "/service/basic-office/offices",
  },
  {
    id: "novolba-buddy",
    title: "ノボルバディ Service",
    description: "場づくりの右腕に、移転を丸ごとお任せ！",
    bullets: [
      "移転プロジェクトマネジメント",
      "ワークショップ",
      "レイアウト設計",
      "移転PR戦略",
    ],
    imageSrc: "/service-buddy.jpg",
    detailHref: "/service/novolba-buddy",
    actionLabel: "相談する",
    actionHref: "/inquiry",
  },
];

export default function ServicePage() {
  return (
    <main className="bg-white">

      {/* ===== ページヘッダー ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-24 px-6"
        style={{ background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "#3dbdac" }} />
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">Our Services</p>
        <h1 className="text-4xl font-bold tracking-widest text-gray-800">SERVICE</h1>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
        <p className="mt-4 text-sm text-gray-500 max-w-md leading-relaxed">
          スタートアップのオフィス課題を、3つのサービスで解決します。
        </p>
      </section>

      {/* ===== サービス一覧 ===== */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow"
            >
              {/* カード画像 */}
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.imageSrc}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* カード本文 */}
              <div className="flex flex-col gap-3 px-6 py-6 flex-1">
                <h2 className="text-base font-bold text-gray-800 text-center">
                  {service.title}
                </h2>
                <p className="text-sm text-gray-500 text-center leading-relaxed">
                  {service.description}
                </p>
                <ul className="flex flex-col gap-2 mt-2">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-sm text-gray-600">
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

                {/* ボタン */}
                <div className="mt-auto pt-4 flex gap-2">
                  <Link
                    href={service.detailHref}
                    className="flex-1 text-center text-xs font-medium py-2 px-3 rounded-full text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#3dbdac" }}
                  >
                    詳細を見る
                  </Link>
                  <Link
                    href={service.actionHref}
                    className="flex-1 text-center text-xs font-medium py-2 px-3 rounded-full border-2 transition-colors hover:text-white hover:bg-yellow-400 hover:border-yellow-400"
                    style={{ borderColor: "#d4a017", color: "#d4a017" }}
                  >
                    {service.actionLabel}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== お問い合わせCTA ===== */}
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
