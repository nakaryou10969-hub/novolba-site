import type { Metadata } from "next";
import Link from "next/link";
import FaqList, { basicOfficeFaqs } from "../../components/FaqList";

export const metadata: Metadata = {
  title: "BASIC OFFICE Service | NovolBa",
  description: "5〜30人用の一社占有家具付きオフィス。渋谷・新宿・五反田・東日本橋エリアを中心に展開。",
};

const problems = [
  {
    title: "キャッシュフローを圧迫",
    description:
      "オフィス移転は保証金・仲介手数料、家具・内装費をはじめとする入居費用、原状回復などの退去費用など高額な出費がかさむ。",
    icon: "💸",
  },
  {
    title: "契約期間の縛り",
    description:
      "2年間契約の縛りがあり、退去の半年以上前にオーナーへの通知が必要になる。",
    icon: "📅",
  },
  {
    title: "手間と時間がかかる",
    description:
      "物件探しから内見、様々な契約締結や、家具選び、レイアウト作成などに、多くの手間と時間がかかる。",
    icon: "⏰",
  },
];

const points = [
  {
    number: "01",
    category: "費用",
    title: "安心の定額制",
    description:
      "入退去時にかかる高額な費用がかからず、支払いは毎月定額制。大切な資金を事業に有効活用でき、キャッシュフローが安定します。",
    detail: [
      "敷金・礼金・仲介手数料：不要",
      "家具・内装費：不要",
      "原状回復費：不要",
      "毎月のサービス利用料のみ",
    ],
  },
  {
    number: "02",
    category: "期間",
    title: "入退去時期を柔軟に",
    description:
      "契約は6カ月毎更新、3か月前通知で退去できます。契約期間に縛られず、スピーディーな拡張移転が可能です。",
    detail: [
      "通常の賃貸：2年契約・退去6か月前通知",
      "NovolBa：6か月更新・退去3か月前通知",
    ],
  },
  {
    number: "03",
    category: "手間",
    title: "移転の手間を最小化",
    description:
      "ご希望をヒアリングし、通常の賃貸オフィスを「家具付き占有オフィス」としてご用意します。面倒な契約や手続きがなく、身軽に移転できます。",
    detail: [
      "不動産・保証の手配",
      "内装・レイアウトの設計",
      "家具・備品の調達",
      "各種契約の代行",
    ],
  },
];

const phases = [
  { label: "創業期", range: "0〜10人", stage: "プロダクト・サービスの模索" },
  { label: "成長期", range: "10〜30人", stage: "プロダクト・サービスの確立" },
  { label: "拡大期", range: "30〜100人", stage: "組織づくり" },
];

const pricing = [
  { members: "5名", size: "8〜10坪", price: "230,000円〜/月" },
  { members: "10名", size: "〜20坪", price: "380,000円〜/月" },
  { members: "20名", size: "〜30坪", price: "550,000円〜/月" },
];

export default function BasicOfficePage() {
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
          BASIC OFFICE Service
        </h1>
        <p className="text-base text-gray-600 leading-relaxed max-w-xl">
          事業の成長には、それを支える<strong style={{ color: "#3dbdac" }}>メンバーの増員</strong>が不可欠です。<br />
          メンバーが快適に働き、活躍できるオフィスが、
          <mark className="bg-yellow-100 px-1">更に事業を加速させます。</mark>
        </p>
        <div className="mt-6 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
      </section>

      {/* ===== 成長フェーズ ===== */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-10">
            スタートアップの成長フェーズに合わせて
          </h2>
          <div className="flex flex-col sm:flex-row items-end justify-center gap-4">
            {phases.map((phase, i) => (
              <div
                key={phase.label}
                className="flex flex-col items-center"
                style={{ flex: i + 1 }}
              >
                <div
                  className="w-full rounded-t-2xl flex items-center justify-center font-bold text-white text-lg py-4"
                  style={{
                    backgroundColor: "#3dbdac",
                    opacity: 0.5 + i * 0.25,
                    minHeight: `${80 + i * 60}px`,
                  }}
                >
                  {phase.label}
                </div>
                <div className="w-full bg-gray-50 rounded-b-2xl p-4 text-center border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">{phase.range}</p>
                  <p className="text-xs font-semibold text-gray-700">{phase.stage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 従来の課題 ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
            しかし、オフィス移転には<br />
            様々な<span style={{ color: "#3dbdac" }}>課題</span>が生じます。
          </h2>
          <h3 className="text-lg font-bold text-center text-gray-700 mb-10">
            従来のオフィス移転の<span style={{ color: "#3dbdac" }}>課題</span>
          </h3>

          {/* 費用の内訳 */}
          <div
            className="rounded-2xl p-8 mb-8 text-center"
            style={{ backgroundColor: "#e6f7f5" }}
          >
            <p className="text-sm text-gray-600 mb-4">
              30坪/坪単価1.4万円のオフィスに一年間入居した際の費用内訳
            </p>
            <p className="text-4xl font-bold mb-4" style={{ color: "#3dbdac" }}>
              870<span className="text-2xl">万円</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                { label: "賃料（12ヶ月）", value: "504万" },
                { label: "保証金・仲介手数料", value: "294万" },
                { label: "家具・内装", value: "384万" },
                { label: "原状回復", value: "192万" },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="font-bold text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              ※内装工事や原状回復工事費用には工事期間中空室料も含まれます。
            </p>
          </div>

          {/* 3つの課題 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {problems.map((problem) => (
              <div key={problem.title} className="bg-white rounded-2xl p-6 shadow-md text-center">
                <span className="text-3xl mb-3 block">{problem.icon}</span>
                <h4 className="text-base font-bold text-gray-800 mb-3">{problem.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NovolBaならすべて解決 ===== */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-12">
            NovolBaならすべて<span style={{ color: "#3dbdac" }}>解決</span>
          </h2>

          <div className="flex flex-col gap-16">
            {points.map((point, i) => (
              <div
                key={point.number}
                className={`flex flex-col ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"} gap-8 items-center`}
              >
                {/* テキスト */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
                    >
                      Point {point.number}
                    </span>
                    <span className="text-xs text-gray-400">{point.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{point.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {point.description}
                  </p>
                </div>

                {/* 詳細カード */}
                <div
                  className="flex-1 rounded-2xl p-6"
                  style={{ backgroundColor: "#e6f7f5" }}
                >
                  <ul className="flex flex-col gap-3">
                    {point.detail.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm text-gray-700">
                        <span style={{ color: "#3dbdac" }} className="mt-0.5 shrink-0">✓</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 料金 ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
            サービス利用料金の目安
          </h2>
          <p className="text-xs text-center text-gray-400 mb-8">
            ※サービス利用料の他に、水道光熱費等の実費が別途かかります。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#3dbdac" }} className="text-white">
                  <th className="py-3 px-4 text-left rounded-tl-xl">利用人数</th>
                  <th className="py-3 px-4 text-left">広さの目安</th>
                  <th className="py-3 px-4 text-left rounded-tr-xl">月額料金</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((row, i) => (
                  <tr
                    key={row.members}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="py-3 px-4 font-semibold text-gray-700">{row.members}</td>
                    <td className="py-3 px-4 text-gray-600">{row.size}</td>
                    <td className="py-3 px-4 font-bold" style={{ color: "#3dbdac" }}>{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-center text-gray-400 mt-4">
            スタートアップに特化したコンサルタントが個別にヒアリングし、「家具付き占有オフィス」としてご用意いたします。
          </p>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section
        className="py-20 px-6 text-center text-white"
        style={{ backgroundColor: "#3dbdac" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4">まずはお気軽にご相談ください</h2>
        <p className="text-sm text-white/80 mb-8 max-w-md mx-auto leading-relaxed">
          渋谷・新宿・人形町・五反田エリアを中心に「NovolBaオフィス」を展開しています。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/inquiry"
            className="px-8 py-3 text-sm font-medium bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            style={{ color: "#3dbdac" }}
          >
            お問い合わせ
          </Link>
          <a
            href="https://novolba.notion.site/NovolBa-OFFICE-8d4465cf3502496386ab0cfdea5c2172"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 text-sm font-medium border-2 border-white text-white rounded-full hover:bg-white/10 transition-colors"
          >
            物件を探す
          </a>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-10">
            よくある質問
          </h2>
          <FaqList faqs={basicOfficeFaqs} />
        </div>
      </section>

    </main>
  );
}
