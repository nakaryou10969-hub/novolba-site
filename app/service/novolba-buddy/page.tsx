import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ノボルバディ Service | NovolBa",
  description: "挑戦するスタートアップの「場創り」の右腕に。移転・構築・運用改善の一括サポート。",
};

const strongPoints = [
  {
    keyword: "IMAGINATION",
    icon: "💡",
    title: "創造性を膨らませ、スタートアップの成長に寄与するオフィスを実現する。",
    description:
      "オフィスのプロであるオカムラの経験値に加え、創造ワークショップやDIYなど、一方的な提案に留まることなく創造性を膨らませ、スタートアップの成長に寄与するオフィスを実現する。",
  },
  {
    keyword: "MAXIMIZATION",
    icon: "📐",
    title: "ステージに合わせた空間効率の最大化を実現する。",
    description:
      "企画から設計・施工までを全て一貫して行うからこそ、コミュニケーションを必要とする組織はフリーアドレスに適したレイアウト、エンジニアが多い組織は高機能オフィスチェア・デスクなど、ステージに合わせた空間効率の最大化を実現する。",
  },
  {
    keyword: "SUSTAINABILITY",
    icon: "🪑",
    title: "入れ替えできる家具のシェアリング。改善し続けられるオフィスを実現する。",
    description:
      "変化に応じて、定額で家具を増減、入れ替えできる家具のシェアリング。加えて、創って終わりでない、チームの人数・状況変化に応じて改善し続けられるオフィスを実現する。",
  },
];

const services = [
  {
    phase: "移転前",
    label: "企画",
    theme: "「場」を自分事化させる",
    items: [
      "社員のみんなの意見をとりいれたオフィス作りのワークショップ",
      "社員のみんなで家具の一部を制作",
    ],
    tags: ["#戦略的なオフィス計画", "#移転を機に、組織力を高めたい", "#組織力を見直したい"],
  },
  {
    phase: "移転時",
    label: "プランニング",
    theme: "「場」をデザインする",
    items: [
      "要件、今後の展開を見据えた設計",
      "数々のオフィス設計事例を元としたレイアウトを作成",
    ],
    tags: ["#移転計画を取りまとめてほしい", "#コスト内で納得する場をつくりたい", "#プロジェクト方針をまとめたい"],
  },
  {
    phase: "移転後",
    label: "運営 / 発信",
    theme: "「場」を届ける",
    items: [
      "オフィスのお披露目会・PR",
      "オフィスガイドブック作成＆贈呈",
      "家具の入れ替え",
    ],
    tags: ["#場を中心とした仲間集め", "#場の活用価値の最大化", "#変化に対応した場創り"],
  },
];

const seedSteps = [
  { label: "物件確定" },
  { label: "ヒアリング" },
  { label: "レイアウト見積", note: "→最短翌日" },
  { label: "現地調査・着工・引越" },
  { label: "オープン", note: "→2週間" },
];

const earlySteps = [
  { label: "移転検討" },
  { label: "物件探し" },
  { label: "物件確定" },
  { label: "レイアウト見積", note: "→2週間" },
  { label: "現地調査", note: "→1週間" },
  { label: "着工", note: "→2週間" },
  { label: "引越" },
  { label: "オープン", note: "3週間" },
];

export default function NovolBaBuddyPage() {
  return (
    <main className="bg-white">

      {/* ===== ページヘッダー ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-24 px-6"
        style={{ background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "#3dbdac" }} />
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">Service</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          ノボルバディ Service
        </h1>
        <p className="text-lg text-gray-500 mb-2">場づくりの右腕に、移転を丸ごとお任せ！</p>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
      </section>

      {/* ===== WHO WE ARE ===== */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-6 text-center">WHO WE ARE</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8 leading-tight">
            挑戦するスタートアップの<br />
            「場創り」の<span style={{ color: "#3dbdac" }}>右腕</span>に
          </h2>
          <div className="space-y-4 text-base text-gray-600 leading-relaxed text-center">
            <p>場というものは、急成長するスタートアップにとって必要だ。</p>
            <p>仲間と共創し、想像力を掻き立て、強いチームを創る</p>
            <p>
              「場創り」＝「移転」という<strong>"手間"</strong>と捉えられている機会を<br />
              <strong style={{ color: "#3dbdac" }}>"価値"に変えること</strong>が、スタートアップの挑戦を加速させることになる。
            </p>
            <p className="font-semibold text-gray-800">
              NovolBaはそれを実現するパートナー＝右腕となる。
            </p>
          </div>
        </div>
      </section>

      {/* ===== WHAT WE MAKE ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-6 text-center">WHAT WE MAKE</p>
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "#e6f7f5" }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              移転という<mark className="bg-yellow-100 px-1">点</mark>でなく<br />
              先を見据え、<mark className="bg-yellow-100 px-1">線</mark>で捉える
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-base">
              <div className="bg-white rounded-xl px-6 py-3 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">現在</p>
                <p className="font-bold text-gray-700">移転準備・構築</p>
              </div>
              <span className="text-2xl" style={{ color: "#3dbdac" }}>→</span>
              <div className="bg-white rounded-xl px-6 py-3 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">数年後</p>
                <p className="font-bold text-gray-700">移転後・増員計画</p>
              </div>
              <span className="text-2xl" style={{ color: "#3dbdac" }}>→</span>
              <div
                className="rounded-xl px-6 py-3 shadow-sm text-white"
                style={{ backgroundColor: "#3dbdac" }}
              >
                <p className="text-xs text-white/80 mb-1">将来</p>
                <p className="font-bold">成長を共にする</p>
              </div>
            </div>
            <p className="mt-6 text-base font-bold" style={{ color: "#3dbdac" }}>
              ノボルバディ — 成長を共にする
            </p>
          </div>
        </div>
      </section>

      {/* ===== OUR SERVICE ===== */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-6 text-center">OUR SERVICE</p>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-10">
            移転・構築・運用改善の<span style={{ color: "#3dbdac" }}>一括サポート</span>を行う
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {services.map((s) => (
              <div key={s.phase} className="rounded-2xl overflow-hidden shadow-md">
                <div
                  className="py-4 text-center text-white font-bold text-base"
                  style={{ backgroundColor: "#3dbdac" }}
                >
                  {s.phase}｜{s.label}
                </div>
                <div className="bg-white p-6">
                  <p className="text-base font-bold text-gray-800 mb-4 text-center">{s.theme}</p>
                  <ul className="flex flex-col gap-2 mb-4">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                        <span style={{ color: "#3dbdac" }} className="shrink-0">・</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 底部ラベル */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 rounded-xl border-2 py-3 text-center text-base font-bold text-gray-700" style={{ borderColor: "#3dbdac" }}>
              プロジェクトマネジメント
            </div>
            <div className="flex-1 rounded-xl border-2 py-3 text-center text-base font-bold text-gray-700" style={{ borderColor: "#3dbdac" }}>
              家具ホーダイ!!
            </div>
          </div>
          <div
            className="mt-4 rounded-xl py-4 text-center text-white text-xl font-bold"
            style={{ backgroundColor: "#3dbdac" }}
          >
            ノボルバディ
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section
        className="py-20 px-6 text-center text-white"
        style={{ backgroundColor: "#3dbdac" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4">まずはお気軽にご相談ください</h2>
        <p className="text-sm text-white/80 mb-8 max-w-md mx-auto leading-relaxed">
          移転プロジェクトマネジメント・ワークショップ・レイアウト設計・移転PR戦略など、<br />
          移転を丸ごとサポートします。
        </p>
        <Link
          href="/inquiry"
          className="inline-block px-10 py-3 text-base font-medium bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          style={{ color: "#3dbdac" }}
        >
          相談する
        </Link>
      </section>

    </main>
  );
}
