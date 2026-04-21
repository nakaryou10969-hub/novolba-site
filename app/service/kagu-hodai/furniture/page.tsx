import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "家具ホーダイ!! 製品ラインナップ | NovolBa",
  description: "NovolBa家具ホーダイ!!の製品ラインナップ。オカムラのリユース家具をリーズナブルな月額制でご提供します。",
};

const furnitureCategories = [
  {
    id: "chair",
    label: "A. ワークチェア",
    count: 28,
    items: [
      { name: "ワークチェア コンテッサ", price: "¥2,300/月〜", note: "新品市場価格 170,000円" },
      { name: "ワークチェア シルフィー", price: "¥1,100/月〜", note: "新品市場価格 150,000円" },
      { name: "ワークチェア フルーエント", price: "¥1,100/月〜", note: "" },
    ],
  },
  {
    id: "meeting-chair",
    label: "B. ミーティングチェア",
    count: 23,
    items: [],
  },
  {
    id: "high-chair",
    label: "C. ハイチェア、他",
    count: 11,
    items: [],
  },
  {
    id: "solo-desk",
    label: "D. ソロワークデスク",
    count: 1,
    items: [],
  },
  {
    id: "group-desk",
    label: "E. グループデスク",
    count: 18,
    items: [],
  },
  {
    id: "lift-desk",
    label: "F. 昇降デスク",
    count: 19,
    items: [
      { name: "上下昇降デスク Swift", price: "¥4,000/月〜", note: "新品市場価格 170,000円" },
    ],
  },
  {
    id: "other-desk",
    label: "G. その他デスク・ハイテーブルなど",
    count: 8,
    items: [],
  },
  {
    id: "booth",
    label: "H. ワークブース・ソファ",
    count: 13,
    items: [
      { name: "ドレープ ハイタイプ・テトラ", price: "¥6,800/月〜", note: "新品市場価格 320,000円" },
      { name: "ファミレスブース Lives", price: "¥6,800/月〜", note: "" },
    ],
  },
  {
    id: "tool",
    label: "I. ツール・ホワイトボード・モニタ",
    count: 3,
    items: [
      { name: "三段引き出し収納", price: "¥1,000/月〜", note: "" },
    ],
  },
];

const services = [
  { icon: "🚀", text: "サブスクリプション型の家具サービスで、理想のオフィスを実現" },
  { icon: "📦", text: "すぐにオフィス開設したい！在庫あれば来週にも届けます！" },
  { icon: "💬", text: "レイアウトや移転などの丸ごと相談も！" },
];

export default function FurniturePage() {
  return (
    <main className="bg-white">

      {/* ===== ページヘッダー ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-24 px-6"
        style={{ background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "#3dbdac" }} />
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">Furniture List</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
          家具ホーダイ!! 製品ラインナップ
        </h1>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
      </section>

      {/* ===== ABOUT ===== */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-6 tracking-wide">ABOUT</h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            挑戦するスタートアップのために、NovolBaの出資元である大手オフィス家具メーカー
            <strong>『オカムラ』</strong>の状態の良いリユース家具をリーズナブルな金額で提供します。<br />
            月額制、返却OKな家具のサブスクリプションサービスで、変化の激しいスタートアップの働く環境をサポート。
          </p>
        </div>
      </section>

      {/* ===== SERVICE ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-gray-800 mb-8 text-center tracking-wide">SERVICE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {services.map((s) => (
              <div key={s.text} className="bg-white rounded-2xl p-6 shadow-md text-center">
                <span className="text-3xl mb-3 block">{s.icon}</span>
                <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          {/* 連絡先 */}
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "#e6f7f5" }}
          >
            <p className="text-sm font-bold text-gray-700 mb-4">お気軽にご連絡ください 😊</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-gray-600">
              <a href="mailto:support@novolba.com" className="hover:underline" style={{ color: "#3dbdac" }}>
                📧 support@novolba.com
              </a>
              <a href="tel:08047206472" className="hover:underline" style={{ color: "#3dbdac" }}>
                📞 080-4720-6472
              </a>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              選ぶのがめんどくさい、こんな条件なんだけど…など、まずは気軽にご連絡ください。<br />
              FaceBookメッセンジャーでのお気軽チャットも可能です。
              <a
                href="https://www.facebook.com/hayashi.masaki.33"
                target="_blank"
                rel="noopener noreferrer"
                className="underline ml-1"
                style={{ color: "#3dbdac" }}
              >
                NovolBaオフィスコンサル 林（はやし）
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ===== FURNITURE LIST ===== */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-bold text-gray-800 mb-2 text-center tracking-wide">FURNITURE LIST</h2>
          <p className="text-xs text-center text-gray-400 mb-10">※ 表記はすべて月額・税別となります。</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {furnitureCategories.map((cat) => (
              <div key={cat.id} className="rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-700">{cat.label}</h3>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
                  >
                    {cat.count}点
                  </span>
                </div>
                {cat.items.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {cat.items.map((item) => (
                      <li key={item.name} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                        <p className="text-xs font-semibold text-gray-700">{item.name}</p>
                        <p className="text-sm font-bold mt-0.5" style={{ color: "#3dbdac" }}>{item.price}</p>
                        {item.note && <p className="text-xs text-gray-400 mt-0.5">{item.note}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400">詳細はお問い合わせください</p>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-gray-500 mb-4">全ラインナップの詳細はこちら</p>
            <a
              href="https://bit.ly/novolba-kagu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 text-sm font-medium text-white rounded-full hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#3dbdac" }}
            >
              家具リストを見る →
            </a>
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section
        className="py-20 px-6 text-center text-white"
        style={{ backgroundColor: "#3dbdac" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-6">CONTACT</h2>
        <div className="max-w-md mx-auto text-sm text-white/90 leading-relaxed mb-8 text-left space-y-1">
          <p>会社名：株式会社NovolBa</p>
          <p>代表取締役：鄧 雯（トウ ブン）</p>
          <p>営業所：東京都千代田区神田錦町3-15-16 錦町ブンカイサン 2階</p>
          <p>Email：support@novolba.com</p>
          <p>電話：080-4720-6472</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/inquiry"
            className="px-8 py-3 text-sm font-medium bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            style={{ color: "#3dbdac" }}
          >
            お問い合わせ
          </Link>
          <Link
            href="/service/kagu-hodai"
            className="px-8 py-3 text-sm font-medium border-2 border-white text-white rounded-full hover:bg-white/10 transition-colors"
          >
            家具ホーダイ!! 詳細へ
          </Link>
        </div>
      </section>

    </main>
  );
}
