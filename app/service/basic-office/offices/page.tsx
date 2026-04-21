import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NovolBa OFFICE 拠点情報 | NovolBa",
  description: "スタートアップのフェーズに合わせた家具・WiFi付きサブスクオフィス。渋谷・新宿・五反田・東日本橋エリアを中心に展開。",
};

const features = [
  { icon: "✅", text: "敷金・礼金なし（契約金のみ）" },
  { icon: "🪑", text: "家具・WiFiセットアップ済み（レイアウト・内装変更も可能）" },
  { icon: "📅", text: "6ヵ月〜契約、3ヵ月前予告で退去OK" },
  { icon: "🏢", text: "原状回復費用不要" },
];

const differences = [
  {
    title: "手間なく、効率的に。起業家の大切な時間を奪いません",
    items: [
      "まるっとレイアウト・家具はお任せ",
      "現場に来なくても、オンライン内見も可能",
      "クラウドサインで契約可能（オーナーとの面倒な紙の書面手続き・郵送・返却は不要）",
      "Messenger、Slack等でのご連絡（管理会社と電話・メール・FAXでのやり取りなし）",
    ],
  },
  {
    title: "家具のサブスク「家具ホーダイ!!」も併用できます",
    items: [
      "NovolBaのオフィスはオカムラ製の家具を使用しています",
      "オフィスチェアなど1台からのサブスクが可能。月額定額制です",
      "家具は多くのエンジニアが愛用する「オカムラ製」。高品質な家具でメンバーがモチベーション高く仕事ができます",
    ],
  },
];

const phases = [
  {
    label: "創業期",
    range: "〜10人",
    stage: "シード",
    description: "創業フェーズのスタートアップのために気軽に利用できるオフィスをご用意しました。",
    count: "2拠点",
    color: "#3dbdac",
    opacity: "0.6",
  },
  {
    label: "成長期",
    range: "10〜50人",
    stage: "アーリー・ミドル",
    description: "事業が軌道に乗り、チームが拡大するフェーズに対応したオフィスです。",
    count: "5拠点",
    color: "#3dbdac",
    opacity: "0.8",
  },
  {
    label: "拡大期",
    range: "50人〜",
    stage: "レイター",
    description: "上場を前にしたレイターステージのようなスタートアップが利用できるNovolBaオフィス！",
    count: "準備中",
    color: "#3dbdac",
    opacity: "1",
  },
];

const qaItems = [
  {
    q: "オカムラ製の家具だと価格が高くないですか？",
    a: "NovolBaではオカムラのリユース家具を使用しているため、新品と比べてリーズナブルな月額でご利用いただけます。",
  },
  {
    q: "サブスク利用後に、買取することは可能ですか？",
    a: "はい、可能です。詳しくはお問い合わせください。",
  },
  {
    q: "運搬・施工に費用はかかりますか？",
    a: "基本的な家具のセットアップは含まれますが、特殊な施工が必要な場合は別途費用がかかる場合があります。",
  },
];

export default function OfficesPage() {
  return (
    <main className="bg-white">

      {/* ===== ページヘッダー ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-24 px-6"
        style={{ background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "#3dbdac" }} />
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">Office Locations</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          NovolBa OFFICE 拠点情報
        </h1>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
      </section>

      {/* ===== ご案内 ===== */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            株式会社NovolBaは、シード〜レイターステージのスタートアップが利用できる<br />
            サブスクオフィス＝<strong style={{ color: "#3dbdac" }}>昇る場（NovolBa）</strong>を提供しています。
          </p>
          <p className="mt-4 text-sm text-gray-500 leading-relaxed">
            スタートアップは事業の拡大による人数変化が激しく、オフィスは1〜2年程度で出入りを繰り返します。
            それなら、私たちがオフィスに必要なものを提供して、スタートアップ・起業家には「成長」に集中してもらおう。
            だから、オフィスの名前は「昇る場」。その想いから、スタートアップのためのオフィスサービスを創りました。
          </p>
        </div>
      </section>

      {/* ===== オフィスの特徴 ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-10">
            NovolBa Officeの<span style={{ color: "#3dbdac" }}>特徴</span>
          </h2>
          <p className="text-sm text-center text-gray-500 mb-8 leading-relaxed">
            短期間で移転を繰り返すスタートアップに不利な敷金・礼金、原状回復などが不要で、<br />
            家具・WiFi付きのサブスクオフィスになっております。<br />
            シェアオフィス・サービスオフィスと違い、スタートアップのニーズに合わせたレイアウト変更や内装工事も可能です。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.text} className="flex items-start gap-3 bg-white rounded-2xl p-5 shadow-sm">
                <span className="text-xl shrink-0">{f.icon}</span>
                <p className="text-sm text-gray-700 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="rounded-2xl p-6 text-center text-white"
              style={{ backgroundColor: "#3dbdac" }}
            >
              <p className="text-sm font-bold mb-2">NovolBaがオフィスに必要なものを揃えます</p>
              <p className="text-xs text-white/80">家具・WiFi・レイアウト・各種契約をまとめてサポート</p>
            </div>
            <div className="rounded-2xl p-6 text-center bg-white border-2" style={{ borderColor: "#3dbdac" }}>
              <p className="text-sm font-bold text-gray-800 mb-2">ずっと定額なのでキャッシュフローも読みやすい</p>
              <p className="text-xs text-gray-500">毎月のサービス利用料のみ。予算管理が簡単です</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 拠点一覧 ===== */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
            NovolBa Office 拠点一覧
          </h2>
          <p className="text-sm text-center text-gray-500 mb-10 leading-relaxed">
            創業期（シード）、成長期（アーリー・ミドル）、拡大期（レイター）など、<br />
            フェーズにあわせたサービス拠点をご用意しております！<br />
            一覧にない拠点も随時準備しておりますので、ぜひお問合せください！
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {phases.map((phase) => (
              <div
                key={phase.label}
                className="rounded-2xl overflow-hidden shadow-md"
              >
                <div
                  className="py-6 text-center text-white"
                  style={{ backgroundColor: phase.color, opacity: parseFloat(phase.opacity) }}
                >
                  <p className="text-lg font-bold">{phase.label}</p>
                  <p className="text-sm text-white/80">{phase.range}</p>
                  <p className="text-xs text-white/70 mt-1">{phase.stage}</p>
                </div>
                <div className="bg-white p-5">
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{phase.description}</p>
                  <span
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
                  >
                    {phase.count}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 mb-4">最新の拠点情報はこちら</p>
            <a
              href="https://novolba.notion.site/NovolBa-OFFICE-8d4465cf3502496386ab0cfdea5c2172"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 text-sm font-medium text-white rounded-full hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#3dbdac" }}
            >
              拠点一覧を見る →
            </a>
          </div>
        </div>
      </section>

      {/* ===== ここが違う ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-10">
            NovolBa Officeは<span style={{ color: "#3dbdac" }}>ここが違う</span>
          </h2>
          <div className="flex flex-col gap-8">
            {differences.map((diff, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-md">
                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-start gap-2">
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                    style={{ backgroundColor: "#3dbdac" }}
                  >
                    {i + 1}
                  </span>
                  {diff.title}
                </h3>
                <ul className="flex flex-col gap-2">
                  {diff.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span style={{ color: "#3dbdac" }} className="shrink-0 mt-0.5">−</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {i === 1 && (
                  <div className="mt-4">
                    <Link
                      href="/service/kagu-hodai/furniture"
                      className="text-xs underline"
                      style={{ color: "#3dbdac" }}
                    >
                      家具ホーダイ!! 製品ラインナップを見る →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Q&A ===== */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-10">Q&A</h2>
          <div className="flex flex-col gap-6">
            {qaItems.map((qa) => (
              <div key={qa.q} className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div
                  className="flex items-start gap-3 px-6 py-4"
                  style={{ backgroundColor: "#e6f7f5" }}
                >
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                    style={{ backgroundColor: "#3dbdac" }}
                  >
                    Q
                  </span>
                  <p className="text-sm font-semibold text-gray-800">{qa.q}</p>
                </div>
                <div className="flex items-start gap-3 px-6 py-4 bg-white">
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
                  >
                    A
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">{qa.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== お問合せ ===== */}
      <section
        className="py-20 px-6 text-center text-white"
        style={{ backgroundColor: "#3dbdac" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-6">お問合せ先</h2>
        <p className="text-sm text-white/80 mb-2">Messenger、Email等でお気軽にご連絡ください！</p>
        <div className="max-w-sm mx-auto text-sm text-white/90 leading-relaxed mb-8 space-y-1">
          <p>株式会社NovolBa</p>
          <p>Email: support@novolba.com</p>
          <p>電話: 080-4720-6472</p>
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
            href="/service/basic-office"
            className="px-8 py-3 text-sm font-medium border-2 border-white text-white rounded-full hover:bg-white/10 transition-colors"
          >
            BASIC OFFICE 詳細へ
          </Link>
        </div>
      </section>

    </main>
  );
}
