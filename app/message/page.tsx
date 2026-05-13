import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MESSAGE | NovolBa",
  description: "エネルギー溢れるスタートアップの皆様へ。NovolBaからのメッセージ。",
};

export default function MessagePage() {
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
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">
          From NovolBa
        </p>
        <h1 className="text-4xl font-bold tracking-widest text-gray-800">
          MESSAGE
        </h1>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
      </section>

      {/* ===== メッセージ本文 ===== */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">

          {/* リード */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-12 leading-relaxed">
            エネルギー溢れるスタートアップの皆様へ
          </h2>

          {/* 本文 */}
          <div className="space-y-6 text-gray-600 leading-[2] text-base text-center">
            <p>
              未来を創る挑戦者たち——
              <br />
              汗をかき、知恵を絞り、仲間を集め、前を向き…
            </p>
            <p>
              ただ、今の日本では仲間と集まる場所を作ることに、労力とコストがかかる。
            </p>
            <p>
              仲間たちと語り合いたい未来を創ることに全力を注ぎたい。
              <br />
              そんな場所が当たり前に用意されていれば…
            </p>
            <p className="font-semibold text-gray-800 text-lg">
              エネルギー溢れるスタートアップを支えたい！
            </p>
            <p
              className="text-2xl font-bold tracking-widest"
              style={{ color: "#3dbdac" }}
            >
              立ち止まるな。KEEP MOVING FORWARD!
            </p>
            <p>
              NovolBaは、挑戦し続けるスタートアップのための最適なワークプレイスを提供します。
            </p>
            <p className="font-semibold text-gray-800">
              昇りたい企業に、昇る場を。
            </p>
          </div>

          {/* 署名 */}
          <div className="mt-16 pt-8 border-t border-gray-100" />

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
