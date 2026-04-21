"use client";

import { useState } from "react";
import Link from "next/link";
import type { Metadata } from "next";

const faqs = [
  {
    question: "NovolBaを利用するとどんなメリットがあるの？",
    answer: `オフィス移転の初期費用と煩雑な手続きが大幅に削減できます。通常オフィスを賃貸契約すると、敷金や保証金などで家賃の何倍もの初期費用が必要になります。また、移転に伴う様々な契約手続き、内装に合わせたレイアウトや家具選び、回線工事等、多くの時間を要します。ご契約から入居までの手間のかかる手続きは、全てNovolBaにお任せください！

また、備え付けの家具は大手オフィス家具メーカー・オカムラ社製。高機能で快適な備え付け家具も月々のサービス利用料金だけでご利用いただけます。

もちろん退去の際の原状回復工事も不要。最低入居期間の制限もないため、頻繁に増床が必要なスタートアップにもピッタリです！

与信が通りにくい契約も、独自の審査方法でスピーディーに行います。`,
  },
  {
    question: "契約までの流れは？",
    answer: "コンサルタントが、物件選び、内見、契約、ご入居までをサポートいたします。お問い合わせよりご希望条件をお知らせください。お客様の条件にあった物件をご提案させて頂きます。",
  },
  {
    question: "料金について",
    answer: `月々の定額で、サービス利用料金を頂戴しております。基本サービス利用料の中には、ご入居人数様分の高品質なオフィス家具、Wi-Fi、プリンター、ホワイドボードなどが含まれております。なお、水道光熱費、ごみ処理代等は実費となります。

※契約時に、契約料としてサービス利用料の1か月分が必要です。

通常の賃貸物件とNovolBaを利用した場合の料金比較がございますので、NovolBaがどれくらいお得かぜひご覧ください！`,
  },
  {
    question: "オプションの内容は？",
    answer: "基本サービス利用料に含まれるもの以外で、物件ごとに様々なオプションをご用意しております。パーテーション、来客用のミーティングスペースや集中作業用の半個室、くつろげるソファーなど、ご希望に合わせて追加することが可能です。（別途費用がかかります）",
  },
  {
    question: "物件はどういうものがあるの？",
    answer: "ウェブサイトで掲載中の物件以外で、希望条件を頂ければお客様にオススメの物件をご提案させていただきます。現在、「希望物件をNovolBa化しちゃおう！」キャンペーン実施中です。NovolBaで敷金・礼金・仲介手数料をゼロにして、必要なオフィス環境が整った素敵なオフィスに、身軽にお得にお引越ししませんか。",
  },
  {
    question: "レンタルオフィス、シェアオフィスと何が違うの？",
    answer: `レンタルオフィス、シェアオフィスの柔軟性と、賃貸契約の安心感を両立するのがNovolBaです！

シェアオフィスは共用スペースが隣接するため、どうしても情報セキュリティーや一時利用者が気になります。NovolBaならすべて独立した物件となりますので、セキュアな環境をご提供します。

初期費用を抑えつつ、自分たちの城として独立したオフィスを構える。NovolBaは「柔軟性と安心感」の両方を兼ね揃えた新しいオフィス移転サービスです。`,
  },
  {
    question: "NovolBa物件からNovolBa物件への移転は？",
    answer: `大歓迎です。私達NovolBaが目指すのは、「エネルギー溢れる組織の人生に寄り添い続ける」事です。会社の成長にあわせてNovolBaの利便性を最大限にご活用ください。

移転の費用が最小限に抑えられる為、キャッシュフローへの影響を気にすることなくオフィス移転が可能になります。

NovolBaは「昇る場」及び「昇るばっかり！」に由来しています。スタートアップの皆様と共に、事業成長の階段を昇る事ができれば、嬉しい限りです。`,
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-6 text-left"
        aria-expanded={open}
      >
        <div className="flex items-start gap-4">
          <span
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
            style={{ backgroundColor: "#3dbdac" }}
          >
            Q
          </span>
          <span className="text-sm sm:text-base font-semibold text-gray-800 leading-relaxed">
            {question}
          </span>
        </div>
        <span
          className="shrink-0 text-xl font-light transition-transform duration-200"
          style={{
            color: "#3dbdac",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>

      {open && (
        <div className="pb-6 pl-11">
          <div className="flex items-start gap-4">
            <span
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
              style={{ backgroundColor: "#e6f7f5", color: "#3dbdac" }}
            >
              A
            </span>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {answer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
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
          Frequently Asked Questions
        </p>
        <h1 className="text-4xl font-bold tracking-widest text-gray-800">FAQ</h1>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
        <p className="mt-4 text-sm text-gray-500">よくある質問</p>
      </section>

      {/* ===== FAQ一覧 ===== */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq) => (
            <FaqItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 px-6 text-center bg-gray-50">
        <p className="text-sm text-gray-600 mb-6">
          ご不明な点がございましたら、お気軽にご相談ください。
        </p>
        <Link
          href="/inquiry"
          className="inline-block px-10 py-3 text-sm font-medium text-white rounded-full shadow-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#3dbdac" }}
        >
          お問い合わせ
        </Link>
      </section>

    </main>
  );
}
