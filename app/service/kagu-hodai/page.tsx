import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "家具ホーダイ!! Service | NovolBa",
  description: "入替え可能な中古家具のサブスクリプション。1年目は坪3,000円〜、2年目から坪1,000円〜。",
};

const points = [
  {
    number: "01",
    title: "オフィス家具大手\nオカムラの\nリユース家具使用",
  },
  {
    number: "02",
    title: "サブスク型で\n初期費用削減",
  },
  {
    number: "03",
    title: "オフィスのプロに\nいつでも相談可能",
  },
  {
    number: "04",
    title: "働き方の変化に\n対応して\n入れ替えできる",
  },
];

const marugotoPricing = [
  { period: "1〜12か月", price: "1坪あたり 3,000円" },
  { period: "13〜24か月", price: "1坪あたり 1,000円" },
  { period: "25か月目〜", price: "1坪あたり 1,000円（+1か月で買取も可能）" },
];

const tanpinItems = [
  { name: "ワークチェア コンテッサ", price: "¥2,300/月〜", retail: "新品市場価格 170,000円" },
  { name: "ワークチェア シルフィー", price: "¥1,100/月〜", retail: "新品市場価格 150,000円" },
  { name: "上下昇降デスク Swift", price: "¥4,000/月〜", retail: "新品市場価格 170,000円" },
  { name: "ドレープ ハイタイプ・テトラ", price: "¥6,800/月〜", retail: "新品市場価格 320,000円" },
  { name: "ファミレスブース Lives", price: "¥6,800/月〜", retail: "" },
  { name: "三段引き出し収納", price: "¥1,000/月〜", retail: "" },
];

const steps = [
  { step: "STEP 1.", label: "お問合せ" },
  { step: "STEP 2.", label: "家具選び/レイアウト" },
  { step: "STEP 3.", label: "見積/決定" },
  { step: "STEP 4.", label: "利用開始" },
];

export default function KaguHodaiPage() {
  return (
    <main className="bg-white">

      {/* ===== ページヘッダー ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-24 px-6"
        style={{ background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "#3dbdac" }} />
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">Service</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
          家具ホーダイ!! Service
        </h1>
        <p className="text-base text-gray-500 mb-2">椅子１脚から借りられて、入替え可能</p>
        <p className="text-lg font-semibold" style={{ color: "#3dbdac" }}>
          家具のサブスクサービス『家具ホーダイ!!』
        </p>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
      </section>

      {/* ===== リード文 ===== */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
            成長スピードが速いスタートアップは、増員に伴って空間の利用方法や働き方もどんどん変化します。<br />
            『家具ホーダイ!!』は、お客様のフェーズに合わせて<strong>必要な家具をサブスクで借りることができ、月額費用内で入替えもできる</strong>サービスです。
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            家具を買ったら、家具を借りたら「サイズが合わなかった」、「使い勝手が良くない」、「思ったより利用しなかった」、「もう１つ欲しい」<br />
            <span className="font-semibold text-gray-700">NovolBa『家具ホーダイ!!』で解決できます。</span>
          </p>
        </div>
      </section>

      {/* ===== 4つのポイント ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-10">
            選ばれる<span style={{ color: "#3dbdac" }}>4つのポイント</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {points.map((point) => (
              <div
                key={point.number}
                className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md"
              >
                <span
                  className="text-2xl font-bold mb-3"
                  style={{ color: "#3dbdac" }}
                >
                  Point {point.number}
                </span>
                <p className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-line">
                  {point.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 2つのプラン ===== */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-10">
            提供するのは<span style={{ color: "#3dbdac" }}>2つのプラン</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

            {/* 丸ごとプラン */}
            <div className="rounded-2xl border-2 p-8" style={{ borderColor: "#3dbdac" }}>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                空間レイアウトをご提案する
                <span style={{ color: "#3dbdac" }}>「丸ごとプラン」</span>
              </h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                月額でオフィス全体（又は一部）の家具をサブスクで利用できて、いつでも入替可能。
              </p>
              <h4 className="text-sm font-bold text-gray-700 mb-3">■ 月額利用料金（税抜）</h4>
              <ul className="flex flex-col gap-2 mb-6">
                {marugotoPricing.map((item) => (
                  <li key={item.period} className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-2">
                    <span>{item.period}</span>
                    <span className="font-semibold">{item.price}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 mb-4">
                <p className="font-semibold text-gray-700 mb-2">【サービスに含まれるもの】</p>
                <ul className="flex flex-col gap-1">
                  <li>✓ リユース家具の提供</li>
                  <li>✓ オフィス/レイアウトのコンサルティング</li>
                  <li>✓ 家具メンテナンス / 引取り費用</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
                <p className="font-semibold text-gray-700 mb-2">【追加費用がかかるもの】</p>
                <ul className="flex flex-col gap-1">
                  <li>＊ 施工が必要な家具の設置作業費</li>
                  <li>＊ 家具の配送費用</li>
                  <li>＊ 家具入替え時の配送＆設置費用</li>
                  <li>＊ 故意や過失による損壊、汚れの損害補償</li>
                </ul>
              </div>
            </div>

            {/* 単品プラン */}
            <div className="rounded-2xl border-2 p-8" style={{ borderColor: "#3dbdac" }}>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                椅子１脚から借りられる
                <span style={{ color: "#3dbdac" }}>「単品プラン」</span>
              </h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                エンジニアの為に良い椅子を用意したい、会議用ブースが欲しい、など必要な家具を１点からサブスクで利用できます。
              </p>
              <h4 className="text-sm font-bold text-gray-700 mb-3">■ 主な料金例</h4>
              <ul className="flex flex-col gap-2 mb-6">
                <li className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-2">
                  <span>オフィスチェア（Fluent）</span>
                  <span className="font-semibold">1,100円/月〜</span>
                </li>
                <li className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-2">
                  <span>上下昇降デスク（Swift）</span>
                  <span className="font-semibold">4,000円/月〜</span>
                </li>
                <li className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-2">
                  <span>集中ブース（drape）</span>
                  <span className="font-semibold">12,000円/月〜</span>
                </li>
              </ul>
              <div className="grid grid-cols-2 gap-3">
                {tanpinItems.map((item) => (
                  <div key={item.name} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs font-semibold text-gray-700 mb-1">{item.name}</p>
                    <p className="text-sm font-bold" style={{ color: "#3dbdac" }}>{item.price}</p>
                    {item.retail && <p className="text-xs text-gray-400 mt-1">{item.retail}</p>}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <a
                  href="https://bit.ly/novolba-kagu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline"
                  style={{ color: "#3dbdac" }}
                >
                  詳しくは、家具リストをご覧ください →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 料金例 ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">料金例</h2>
          <div
            className="rounded-2xl p-8 text-left"
            style={{ backgroundColor: "#e6f7f5" }}
          >
            <p className="text-sm font-semibold text-gray-700 mb-4">（例）30坪のオフィスの場合</p>
            <ul className="flex flex-col gap-2 text-sm text-gray-600">
              <li>・1〜12か月：3,000円 × 30坪 = <strong>90,000円/月</strong></li>
              <li>・13〜24か月：1,000円 × 30坪 = <strong>30,000円/月</strong></li>
              <li>・25か月〜：1,000円 × 30坪 = <strong>30,000円/月</strong></li>
              <li className="mt-2 font-semibold" style={{ color: "#3dbdac" }}>
                又は、1か月分（30,000円）を払って買取も可能
              </li>
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              ※ 1年目は坪3,000円〜、2年目から坪1,000円〜でグっとお得にオフィス家具をサブスク。6か月以上利用すれば違約金無し。
            </p>
          </div>
        </div>
      </section>

      {/* ===== ご利用の流れ ===== */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-10">ご利用の流れ</h2>
          <p className="text-sm text-center text-gray-500 mb-8">
            必要な家具の種類と個数をお伝え頂くか、家具リストで気に入ったものをご指定いただければ、在庫と金額をお知らせします。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-0">
            {steps.map((s, i) => (
              <div key={s.step} className="flex items-center">
                <div
                  className="flex flex-col items-center justify-center text-center px-6 py-4 rounded-xl text-white min-w-[120px]"
                  style={{ backgroundColor: "#3dbdac" }}
                >
                  <span className="text-xs font-bold mb-1">{s.step}</span>
                  <span className="text-sm font-semibold">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <span className="text-2xl text-gray-300 mx-2 hidden sm:block">→</span>
                )}
                {i < steps.length - 1 && (
                  <span className="text-2xl text-gray-300 my-2 sm:hidden">↓</span>
                )}
              </div>
            ))}
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
          E-mail: support@novolba.com<br />
          携帯: 080-4720-6472
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
            href="https://novolba.notion.site/NovolBa-d056c89cda3d4a2fb3a48a236c3a2907"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 text-sm font-medium border-2 border-white text-white rounded-full hover:bg-white/10 transition-colors"
          >
            家具を探す
          </a>
        </div>
      </section>

    </main>
  );
}
