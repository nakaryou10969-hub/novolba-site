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
        <div className="mt-6 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
      </section>

      {/* ===== 従来の課題 ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
            しかし、オフィス移転には<br />
            様々な<span style={{ color: "#3dbdac" }}>課題</span>が生じます。
          </h2>
          <h3 className="text-lg font-bold text-center text-gray-700 mb-8">
            従来のオフィス移転の<span style={{ color: "#3dbdac" }}>課題</span>
          </h3>

          {/* problem.png */}
          <div className="flex justify-center mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/problem.png"
              alt="従来のオフィス移転の課題"
              style={{ width: "80%", height: "auto" }}
            />
          </div>

          {/* 費用の内訳 */}
          <div
            className="rounded-2xl p-8 mb-8 text-center"
            style={{ backgroundColor: "#e6f7f5" }}
          >
            <p className="text-base text-gray-600 mb-4">
              30坪/坪単価1.4万円のオフィスに一年間入居した際の費用内訳
            </p>
            <p className="text-4xl font-bold mb-4" style={{ color: "#3dbdac" }}>
              870<span className="text-2xl">万円</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-base">
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

        </div>
      </section>

      {/* ===== NovolBaならすべて解決 ===== */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-12">
            NovolBaならすべて<span style={{ color: "#3dbdac" }}>解決</span>
          </h2>

          {/* 費用について */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-8 rounded-full" style={{ backgroundColor: "#3dbdac" }} />
              <h3 className="text-xl font-bold text-gray-800">費用について</h3>
              <span className="text-sm px-3 py-1 rounded-full font-bold" style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}>Point 01</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-800 mb-4">安心の定額制</h4>
                <p className="text-lg text-gray-600 leading-relaxed mb-4">
                  入退去時にかかる高額な費用がかからず、支払いは毎月定額制。大切な資金を事業に有効活用でき、キャッシュフローが安定します。
                </p>
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#e6f7f5" }}>
                  <p className="text-lg font-bold text-gray-700 mb-3">NovolBaなら不要な費用</p>
                  <ul className="flex flex-col gap-2">
                    {["敷金・礼金・仲介手数料：不要", "家具・内装費：不要", "原状回復費：不要", "毎月のサービス利用料のみ"].map((d) => (
                      <li key={d} className="flex items-start gap-2 text-lg text-gray-700">
                        <span style={{ color: "#3dbdac" }} className="shrink-0">✓</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex-1 rounded-2xl p-6 bg-white border border-gray-100 shadow-sm">
                <p className="text-lg font-bold text-gray-700 mb-4 text-center">従来 vs NovolBa（30坪・1年間）</p>
                <div className="flex gap-4 items-end justify-center mb-2">
                  <div className="text-center">
                    <div className="bg-gray-200 rounded-t-lg w-20 flex items-end justify-center" style={{ height: "120px" }}>
                      <span className="text-sm text-gray-500 pb-2">従来</span>
                    </div>
                    <p className="text-lg font-bold text-gray-700 mt-1">870万円</p>
                  </div>
                  <div className="text-center">
                    <div className="rounded-t-lg w-20 flex items-end justify-center" style={{ height: "30px", backgroundColor: "#3dbdac" }}>
                      <span className="text-sm text-white pb-1">NovolBa</span>
                    </div>
                    <p className="text-lg font-bold mt-1" style={{ color: "#3dbdac" }}>約97%削減</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 text-center">月額定額で低コスト運用</p>
              </div>
            </div>
          </div>

          {/* 期間について */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-8 rounded-full" style={{ backgroundColor: "#3dbdac" }} />
              <h3 className="text-xl font-bold text-gray-800">期間について</h3>
              <span className="text-sm px-3 py-1 rounded-full font-bold" style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}>Point 02</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-800 mb-4">入退去時期を柔軟に</h4>
                <p className="text-lg text-gray-600 leading-relaxed mb-4">
                  契約は6カ月毎更新、3か月前通知で退去できます。契約期間に縛られず、スピーディーな拡張移転が可能です。
                </p>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <table className="w-full text-lg">
                  <thead>
                    <tr style={{ backgroundColor: "#3dbdac" }} className="text-white">
                      <th className="py-3 px-4 text-left"></th>
                      <th className="py-3 px-4 text-left">契約期間</th>
                      <th className="py-3 px-4 text-left">退去通知</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 text-gray-500 text-base">通常の賃貸</td>
                      <td className="py-3 px-4 text-gray-700">2年契約</td>
                      <td className="py-3 px-4 text-gray-700">6か月前</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-3 px-4 font-bold text-base" style={{ color: "#3dbdac" }}>NovolBa</td>
                      <td className="py-3 px-4 font-bold" style={{ color: "#3dbdac" }}>6か月更新</td>
                      <td className="py-3 px-4 font-bold" style={{ color: "#3dbdac" }}>3か月前</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 手間について */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-8 rounded-full" style={{ backgroundColor: "#3dbdac" }} />
              <h3 className="text-xl font-bold text-gray-800">手間について</h3>
              <span className="text-sm px-3 py-1 rounded-full font-bold" style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}>Point 03</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-800 mb-4">移転の手間を最小化</h4>
                <p className="text-lg text-gray-600 leading-relaxed mb-4">
                  ご希望をヒアリングし、通常の賃貸オフィスを「家具付き占有オフィス」としてご用意します。面倒な契約や手続きがなく、身軽に移転できます。
                </p>
              </div>
              <div className="flex-1 rounded-2xl p-6" style={{ backgroundColor: "#e6f7f5" }}>
                <p className="text-lg font-bold text-gray-700 mb-3">NovolBaが代行するもの</p>
                <ul className="flex flex-col gap-2">
                  {["不動産・保証の手配", "内装・レイアウトの設計", "家具・備品の調達", "各種契約の代行"].map((d) => (
                    <li key={d} className="flex items-start gap-2 text-lg text-gray-700">
                      <span style={{ color: "#3dbdac" }} className="shrink-0">✓</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
            <table className="w-full text-base">
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
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">まずはお気軽にご相談ください</h2>
        <p className="text-lg text-white/90 mb-8 mx-auto leading-relaxed whitespace-nowrap">
          渋谷・新宿・人形町・五反田エリアを中心に「NovolBaオフィス」を展開しています。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/inquiry"
            className="px-8 py-3 text-base font-medium bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            style={{ color: "#3dbdac" }}
          >
            お問い合わせ
          </Link>
          <a
            href="https://novolba.notion.site/NovolBa-OFFICE-8d4465cf3502496386ab0cfdea5c2172"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 text-base font-medium border-2 border-white text-white rounded-full hover:bg-white/10 transition-colors"
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
