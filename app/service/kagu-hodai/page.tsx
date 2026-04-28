import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "家具ホーダイ!! Service | NovolBa",
  description: "入替え可能な中古家具のサブスクリプション。1年目は坪3,000円〜。オカムラのリユース家具を月額で利用できます。",
};

const personas = [
  {
    number: "1",
    title: "レイアウトや家具選びをお任せしたい",
    type: "エンジニア社長 型",
    description: "プロダクト開発に情熱と時間を注いでいる。レイアウトを考えたり家具を選ぶのは、誰かに任せたい。",
  },
  {
    number: "2",
    title: "家具購入の初期費用を抑えたい",
    type: "キャッシュキープ 型",
    description: "家具を一括購入することで、まとまったキャッシュが出ていくのは避けたい。",
  },
  {
    number: "3",
    title: "すぐ必要！すぐほしい！",
    type: "SaaS系・急成長 型",
    description: "急成長の時期になり、1日でも早くオフィスに集まってBoostしたい！新品選んで買ってる時間ももったいない。",
  },
  {
    number: "4",
    title: "買ったものが無駄になったら嫌だ",
    type: "家具は試したい 型",
    description: "できれば家具を試して、合わない家具は取り替えたい。スペースも無駄にしたくない。",
  },
];

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

const comparison = [
  { item: "家具の品質", novolba: "○", s: "○", c: "△", ec: "×" },
  { item: "家具の種類", novolba: "◎", s: "◎", c: "△", ec: "△" },
  { item: "初期費用が安い", novolba: "○", s: "○", c: "○", ec: "×" },
  { item: "月額費用お得", novolba: "○", s: "○", c: "○", ec: "-" },
  { item: "中途解約", novolba: "○", s: "×", c: "△", ec: "-" },
  { item: "家具の入替え可能", novolba: "○", s: "×", c: "×", ec: "-" },
  { item: "家具の購入へ切り替え", novolba: "◎", s: "△", c: "△", ec: "-" },
  { item: "無料レイアウト提案", novolba: "○", s: "△", c: "△", ec: "×" },
];

const tanpinItems = [
  { name: "高機能ワークチェア", price: "月額2,000円〜/台" },
  { name: "上下昇降デスク", price: "月額4,000円〜/台" },
  { name: "カフェテーブル・チェア", price: "月額1,000円〜/台" },
  { name: "ソファ", price: "月額2,300円〜/台" },
  { name: "ファミレス席", price: "月額6,300円〜/セット" },
  { name: "集中吸音ブース", price: "月額3,400円〜/台" },
  { name: "会議用テーブル", price: "月額3,000円〜/台" },
  { name: "キャビネット", price: "月額900円〜/台" },
  { name: "個人ロッカー", price: "月額4,000円〜/台" },
  { name: "ホワイトボード", price: "月額600円〜/台" },
];

const additionalServices = [
  { name: "TELECUBE", description: "個室型集中ブース" },
  { name: "TALKHUB", description: "オンライン会議システム" },
  { name: "OC: モバイルバッテリー", description: "充電設備" },
  { name: "電源工事", description: "オフィス電源整備" },
  { name: "スチールパーテーション", description: "空間仕切り" },
];

const steps = [
  { step: "STEP 1", label: "お問合せ" },
  { step: "STEP 2", label: "家具選び/レイアウト" },
  { step: "STEP 3", label: "見積/決定" },
  { step: "STEP 4", label: "利用開始" },
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
        <p className="text-lg text-gray-500 mb-2">椅子１脚から借りられて、入替え可能</p>
        <p className="text-lg font-semibold" style={{ color: "#3dbdac" }}>
          家具のサブスクサービス『家具ホーダイ!!』
        </p>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
        <p className="mt-6 text-base text-gray-500 max-w-xl leading-relaxed">
          成長スピードが速いスタートアップは、増員に伴って空間の利用方法や働き方もどんどん変化します。<br />
          必要な家具をサブスクで借りることができ、<strong>月額費用内で入替えもできる</strong>サービスです。
        </p>
      </section>

      {/* ===== こんなスタートアップにピッタリ ===== */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
            家具ホーダイ!! サービスは、こんなスタートアップに
            <span style={{ color: "#3dbdac" }}>ピッタリ</span>です。
          </h2>
          <p className="text-center text-sm text-gray-400 mb-10">顧客像</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {personas.map((p) => (
              <div
                key={p.number}
                className="rounded-2xl p-6 border border-gray-100 shadow-sm"
                style={{ backgroundColor: "#f0fdfb" }}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: "#3dbdac" }}
                  >
                    {p.number}
                  </span>
                  <div>
                    <p className="text-base font-bold text-gray-800 mb-1">{p.title}</p>
                    <span
                      className="text-sm px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
                    >
                      {p.type}
                    </span>
                    <p className="text-sm text-gray-500 leading-relaxed mt-2">{p.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 選ばれる4つのポイント ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-10">
            家具ホーダイ!! が<span style={{ color: "#3dbdac" }}>選ばれる理由</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {points.map((point) => (
              <div
                key={point.number}
                className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-md"
              >
                <span
                  className="text-sm font-bold px-3 py-1 rounded-full mb-4"
                  style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
                >
                  Point {point.number}
                </span>
                <p className="text-lg text-gray-700 font-bold leading-relaxed whitespace-pre-line">
                  {point.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 他社との比較 ===== */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-10">
            他社サブスク / 家具購入 との<span style={{ color: "#3dbdac" }}>違い</span>
          </h2>
          <div className="flex justify-center">
            <div className="overflow-x-auto" style={{ width: "70%" }}>
            <table className="w-full text-lg">
              <thead>
                <tr className="text-center">
                  <th className="py-3 px-4 text-left text-gray-500 font-medium"></th>
                  <th
                    className="py-3 px-4 font-bold rounded-t-xl"
                    style={{ backgroundColor: "#3dbdac", color: "white" }}
                  >
                    NovolBa
                  </th>
                  <th className="py-3 px-4 text-gray-500 font-medium bg-gray-50">A社</th>
                  <th className="py-3 px-4 text-gray-500 font-medium bg-gray-50">B社</th>
                  <th className="py-3 px-4 text-gray-500 font-medium bg-gray-50">EC家具購入</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.item} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3 px-4 text-gray-700 font-medium">{row.item}</td>
                    <td
                      className="py-3 px-4 text-center font-bold text-3xl"
                      style={{ color: "#3dbdac", backgroundColor: "#f0fdfb" }}
                    >
                      {row.novolba}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500 text-3xl font-bold">{row.s}</td>
                    <td className="py-3 px-4 text-center text-gray-500 text-3xl font-bold">{row.c}</td>
                    <td className="py-3 px-4 text-center text-gray-500 text-3xl font-bold">{row.ec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2つのプラン ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-10">
            提供するのは<span style={{ color: "#3dbdac" }}>2つのプラン</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

            {/* 丸ごとプラン */}
            <div className="rounded-2xl border-2 p-8 bg-white" style={{ borderColor: "#3dbdac" }}>
              <div
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
                style={{ backgroundColor: "#3dbdac", color: "white" }}
              >
                丸ごとプラン
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                空間レイアウトをご提案する<br />
                <span style={{ color: "#3dbdac" }}>「丸ごとプラン」</span>
              </h3>
              <p className="text-base text-gray-500 mb-6 leading-relaxed">
                坪3,000円/月〜で、オフィス全体の家具をサブスクで利用可能。増員や働き方の変化に合わせた入替えも、月額費用内で対応できます。
              </p>
              <h4 className="text-base font-bold text-gray-700 mb-3">■ 月額利用料金（税抜）</h4>
              <div className="rounded-xl overflow-hidden mb-4">
                <table className="w-full text-base">
                  <thead>
                    <tr style={{ backgroundColor: "#3dbdac" }} className="text-white">
                      <th className="py-2 px-3 text-left">期間</th>
                      <th className="py-2 px-3 text-left">料金</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-3 text-gray-600">1〜24か月</td>
                      <td className="py-2 px-3 font-semibold text-gray-800">1坪あたり 3,000円</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-2 px-3 text-gray-600">25か月目〜</td>
                      <td className="py-2 px-3 font-semibold" style={{ color: "#3dbdac" }}>1坪あたり 2,000円</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 mb-3">
                <p className="font-semibold text-gray-700 mb-2">【サービスに含まれるもの】</p>
                <ul className="flex flex-col gap-1">
                  <li>✓ オフィス/レイアウトのコンサルティング</li>
                  <li>✓ リユース家具の提供</li>
                  <li>✓ 家具メンテナンス ※都内</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
                <p className="font-semibold text-gray-700 mb-2">【追加費用がかかるもの】</p>
                <ul className="flex flex-col gap-1">
                  <li>＊ 初期費用：搬入・配送・施工</li>
                  <li>＊ 引取費用：搬出・配送・施工</li>
                  <li>＊ 家具入替え時の配送＆設置費用</li>
                  <li>＊ 故意や過失による損壊・汚れの損害補償</li>
                </ul>
              </div>
            </div>

            {/* 単品プラン */}
            <div className="rounded-2xl border-2 p-8 bg-white" style={{ borderColor: "#3dbdac" }}>
              <div
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
                style={{ backgroundColor: "#3dbdac", color: "white" }}
              >
                単品プラン
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                椅子１脚から借りられる<br />
                <span style={{ color: "#3dbdac" }}>「単品プラン」</span>
              </h3>
              <p className="text-base text-gray-500 mb-4 leading-relaxed">
                オカムラのリユース家具がリーズナブルな値段で利用できます。オフィスチェア1脚 1,100円/月より。
              </p>
              <h4 className="text-base font-bold text-gray-700 mb-3">■ 月額利用料金（税抜）</h4>
              <div className="rounded-xl overflow-hidden mb-4">
                <table className="w-full text-base">
                  <thead>
                    <tr style={{ backgroundColor: "#3dbdac" }} className="text-white">
                      <th className="py-2 px-3 text-left">期間</th>
                      <th className="py-2 px-3 text-left">料金</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-3 text-gray-600">1〜24か月</td>
                      <td className="py-2 px-3 font-semibold text-gray-800">月額 1,000円〜</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-2 px-3 text-gray-600">25か月目〜</td>
                      <td className="py-2 px-3 font-semibold" style={{ color: "#3dbdac" }}>月額 700円〜</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h4 className="text-sm font-bold text-gray-700 mb-3">■ 提供家具一例</h4>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {tanpinItems.map((item) => (
                  <div key={item.name} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">{item.name}</p>
                    <p className="text-xs font-bold" style={{ color: "#3dbdac" }}>{item.price}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <a
                  href="https://bit.ly/novolba_kagu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline"
                  style={{ color: "#3dbdac" }}
                >
                  最新の在庫は家具リストをご確認ください →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 一括サービス ===== */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
            スタートアップのオフィス移転の<span style={{ color: "#3dbdac" }}>一括サービス</span>
          </h2>
          <p className="text-center text-sm text-gray-400 mb-10">
            家具サブスク以外の工事・販売もワンストップで対応します
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {additionalServices.map((s) => (
              <div
                key={s.name}
                className="flex flex-col items-center text-center p-4 rounded-2xl border border-gray-100 shadow-sm"
                style={{ backgroundColor: "#f0fdfb" }}
              >
                <p className="text-base font-bold text-gray-800 mb-1">{s.name}</p>
                <p className="text-xs text-gray-500">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ご利用の流れ ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-10">ご利用の流れ</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-0">
            {steps.map((s, i) => (
              <div key={s.step} className="flex items-center">
                <div
                  className="flex flex-col items-center justify-center text-center px-6 py-4 rounded-xl text-white min-w-[120px]"
                  style={{ backgroundColor: "#3dbdac" }}
                >
                  <span className="text-xs font-bold mb-1">{s.step}</span>
                  <span className="text-base font-semibold">{s.label}</span>
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
            className="px-8 py-3 text-base font-medium bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            style={{ color: "#3dbdac" }}
          >
            お問い合わせ
          </Link>
          <a
            href="https://bit.ly/novolba_kagu"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 text-base font-medium border-2 border-white text-white rounded-full hover:bg-white/10 transition-colors"
          >
            家具を探す
          </a>
        </div>
      </section>

    </main>
  );
}
