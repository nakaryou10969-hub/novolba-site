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
          <h2 className="text-xl font-bold text-center text-gray-800 mb-8">
            しかし、オフィス移転には<br />
            様々な<span style={{ color: "#3dbdac" }}>課題</span>が生じます。
          </h2>

          {/* problem.png */}
          <div className="flex justify-center mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/problem.png"
              alt="従来のオフィス移転の課題"
              className="w-full sm:w-4/5 h-auto"
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
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-16">
            NovolBaならすべて<span style={{ color: "#3dbdac" }}>解決</span>
          </h2>

          {/* ===== 費用 01 ===== */}
          <div className="mb-16 rounded-3xl border-2 p-8" style={{ borderColor: "#3dbdac", backgroundColor: "#f0fdfb" }}>
            <div className="flex items-center gap-4 mb-6 justify-center">
              <div className="rounded-full border-2 px-4 sm:px-6 py-3 flex items-center gap-3" style={{ borderColor: "#3dbdac" }}>
                <span className="text-2xl sm:text-3xl font-bold" style={{ color: "#3dbdac" }}>01</span>
                <span className="text-base sm:text-xl font-bold text-gray-800">入退去月の出費を大幅カット</span>
              </div>
            </div>
            <p className="text-center text-sm sm:text-lg text-gray-600 mb-2">
              通常賃貸オフィスでかかる <span className="underline font-bold">契約時初期費用（敷金・礼金・仲介手数料）</span>や、
            </p>
            <p className="text-center text-sm sm:text-lg font-bold text-gray-800 mb-1">
              入退去時工事費用、家具購入費用がかかりません。
            </p>
            <p className="text-center text-sm text-gray-400 mb-8">※初月のみ契約金が別途発生します。</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "敷金", suffix: "不要" },
                { label: "入居退去工事", suffix: "不要" },
                { label: "家具購入・廃棄", suffix: "不要" },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
                  <p className="text-2xl font-bold text-gray-800">
                    ✅ {item.label}<span style={{ color: "#3dbdac" }}>{item.suffix}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* コスト比較 */}
            <div className="flex justify-center"><div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 w-full sm:w-[70%] lg:w-1/2">
              <h4 className="text-sm sm:text-base font-bold text-gray-700 mb-4 border-l-4 pl-3" style={{ borderColor: "#3dbdac" }}>入居月コスト</h4>
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="shrink-0 text-xs sm:text-sm font-bold text-white px-3 py-1 rounded" style={{ backgroundColor: "#9ca3af" }}>通常賃貸</span>
                  <div className="flex flex-wrap gap-1 flex-1">
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-2 rounded">敷金・礼金・仲介手数料</span>
                    <span className="bg-gray-300 text-gray-600 text-xs px-2 sm:px-4 py-2 rounded flex-1 text-center">内装・家具</span>
                    <span className="bg-gray-400 text-gray-600 text-xs px-2 py-2 rounded">賃料</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="shrink-0 text-xs sm:text-sm font-bold text-white px-3 py-1 rounded" style={{ backgroundColor: "#3dbdac" }}>NovolBa</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-white text-xs px-3 py-2 rounded font-bold" style={{ backgroundColor: "#3dbdac" }}>サービス利用料</span>
                    <span className="text-white text-xs px-3 py-2 rounded" style={{ backgroundColor: "#3dbdac" }}>契約金</span>
                    <span className="text-yellow-500 font-bold text-sm ml-2 flex items-center">← カット</span>
                  </div>
                </div>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-gray-700 mb-4 border-l-4 pl-3" style={{ borderColor: "#3dbdac" }}>退去月コスト</h4>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="shrink-0 text-xs sm:text-sm font-bold text-white px-3 py-1 rounded" style={{ backgroundColor: "#9ca3af" }}>通常賃貸</span>
                  <div className="flex flex-wrap gap-1 flex-1">
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-2 rounded">原状回復費用</span>
                    <span className="bg-gray-300 text-gray-600 text-xs px-2 py-2 rounded">不要家具処分費</span>
                    <span className="bg-gray-400 text-gray-600 text-xs px-2 py-2 rounded">賃料</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="shrink-0 text-xs sm:text-sm font-bold text-white px-3 py-1 rounded" style={{ backgroundColor: "#3dbdac" }}>NovolBa</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-white text-xs px-3 py-2 rounded font-bold" style={{ backgroundColor: "#3dbdac" }}>サービス利用料</span>
                    <span className="text-yellow-500 font-bold text-sm ml-2 flex items-center">← カット</span>
                  </div>
                </div>
              </div>
            </div></div>
          </div>

          {/* ===== 費用 02 ===== */}
          <div className="mb-16 rounded-3xl border-2 p-8" style={{ borderColor: "#3dbdac", backgroundColor: "#f0fdfb" }}>
            <div className="flex items-center gap-4 mb-6 justify-center">
              <div className="rounded-full border-2 px-4 sm:px-6 py-3 flex items-center gap-3" style={{ borderColor: "#3dbdac" }}>
                <span className="text-2xl sm:text-3xl font-bold" style={{ color: "#3dbdac" }}>02</span>
                <span className="text-base sm:text-xl font-bold text-gray-800">月額定額制</span>
              </div>
            </div>
            <p className="text-center text-lg text-gray-600 mb-1">初月のみ契約金がかかりますが、</p>
            <p className="text-center text-lg text-gray-800 mb-1">
              毎月お支払い頂くのは<strong>サービス利用料</strong>と <span className="underline font-bold">水道光熱費等の実費のみ。</span>
            </p>
            <p className="text-center text-lg text-gray-600 mb-8">キャッシュフローが安定し、資金計画が容易になります。</p>

            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/subscription.png" alt="月額定額制の図解" className="w-full sm:w-3/4 lg:w-1/2 h-auto" />
            </div>
          </div>

          {/* ===== 手間 01 ===== */}
          <div className="mb-16 rounded-3xl border-2 p-8" style={{ borderColor: "#3dbdac", backgroundColor: "#f0fdfb" }}>
            <div className="flex items-center gap-4 mb-6 justify-center">
              <div className="rounded-full border-2 px-4 sm:px-6 py-3 flex items-center gap-3" style={{ borderColor: "#3dbdac" }}>
                <span className="text-2xl sm:text-3xl font-bold" style={{ color: "#3dbdac" }}>03</span>
                <span className="text-base sm:text-xl font-bold text-gray-800">各種契約不要！契約・支払いを一本化</span>
              </div>
            </div>
            <p className="text-center text-lg text-gray-600 mb-1">
              ご希望をヒアリングし、通常の賃貸オフィスを <span className="underline font-bold">「家具付き占有オフィス」</span> としてご用意します。
            </p>
            <p className="text-center text-lg text-gray-600 mb-8">面倒な契約や手続きがなく、身軽に移転できます。</p>

            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/remove.png" alt="契約・支払いを一本化の図解" className="w-full sm:w-3/4 lg:w-1/2 h-auto" />
            </div>
          </div>

          {/* ===== 手間 02 ===== */}
          <div className="mb-16 rounded-3xl border-2 p-8" style={{ borderColor: "#3dbdac", backgroundColor: "#f0fdfb" }}>
            <div className="flex items-center gap-4 mb-6 justify-center">
              <div className="rounded-full border-2 px-4 sm:px-6 py-3 flex items-center gap-3" style={{ borderColor: "#3dbdac" }}>
                <span className="text-2xl sm:text-3xl font-bold" style={{ color: "#3dbdac" }}>04</span>
                <span className="text-base sm:text-xl font-bold text-gray-800">家具付き・一社占有オフィス</span>
              </div>
            </div>
            <p className="text-center text-lg text-gray-600 mb-1">入居初日からすぐに働ける環境を完備！</p>
            <p className="text-center text-lg font-bold text-gray-800 mb-1">
              オカムラ社製の高品質な執務家具、Wi-Fi、プリンター、ホワイトボードが設置済みで、
            </p>
            <p className="text-center text-lg text-gray-600 mb-1">手軽に快適な環境が手に入ります。</p>
            <p className="text-center text-lg text-gray-600 mb-8">退去する際に、大型家具の移動や廃棄の心配も不要です。</p>

            <div className="flex justify-center"><div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 w-full sm:w-[70%] lg:w-1/2">
              <div className="border-2 border-yellow-300 rounded-2xl p-4 mb-4">
                <p className="text-center font-bold text-gray-700 bg-yellow-100 rounded-lg py-2 mb-4">基本サービス</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  {[
                    { icon: "🪑", label: "オカムラ社製執務家具" },
                    { icon: "📶", label: "Wi-fi" },
                    { icon: "🖨️", label: "プリンター" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center text-2xl mx-auto mb-2">{item.icon}</div>
                      <p className="text-sm text-gray-600">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* オプションサービス */}
              <div className="rounded-2xl p-4" style={{ backgroundColor: "#e6f7f5" }}>
                <p className="text-center font-bold text-white rounded-lg py-2 mb-4" style={{ backgroundColor: "#3dbdac" }}>オプションサービス</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  {[
                    { icon: "👥", label: "MTGスペース" },
                    { icon: "🗄️", label: "キャビネット" },
                    { icon: "🛋️", label: "リフレッシュスペース" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="w-16 h-16 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center text-2xl mx-auto mb-2">{item.icon}</div>
                      <p className="text-sm text-gray-600">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div></div>
          </div>

          {/* ===== 手間 03 ===== */}
          <div className="mb-8 rounded-3xl border-2 p-8" style={{ borderColor: "#3dbdac", backgroundColor: "#f0fdfb" }}>
            <div className="flex items-center gap-4 mb-6 justify-center">
              <div className="rounded-full border-2 px-4 sm:px-6 py-3 flex items-center gap-3" style={{ borderColor: "#3dbdac" }}>
                <span className="text-2xl sm:text-3xl font-bold" style={{ color: "#3dbdac" }}>05</span>
                <span className="text-base sm:text-xl font-bold text-gray-800">用途に合わせたレイアウト</span>
              </div>
            </div>
            <p className="text-center text-lg text-gray-600 mb-1">
              <span className="underline font-bold">スタートアップに特化した専任のコンサルタント</span>が、
            </p>
            <p className="text-center text-lg text-gray-600 mb-1">お客様のご希望に合わせてレイアウトをご提案します。</p>
            <p className="text-center text-lg font-bold text-gray-800 mb-8">
              半年、一年後の人員変化にも対応できるフレキシブルなオフィス作りを目指しています。
            </p>
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/layout.png" alt="レイアウトの一例" className="w-full sm:w-3/4 lg:w-1/2 h-auto" />
            </div>
            <p className="text-sm text-gray-400 mt-4 text-center">※レイアウトの一例です</p>
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
        <p className="text-sm sm:text-lg text-white/90 mb-8 mx-auto leading-relaxed">
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
