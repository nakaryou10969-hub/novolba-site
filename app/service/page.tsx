import type { Metadata } from "next";
import Link from "next/link";
import ServiceCards from "../components/ServiceCards";

export const metadata: Metadata = {
  title: "SERVICE | NovolBa",
  description: "NovolBaが提供する4つのサービス。家具ホーダイ!! Service、BASIC OFFICE Service、ノボルバディ Service、買取大助をご紹介します。",
};

export default function ServicePage() {
  return (
    <main className="bg-white">

      {/* ===== ページヘッダー ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-24 px-6"
        style={{ background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "#3dbdac" }} />
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">Our Services</p>
        <h1 className="text-4xl font-bold tracking-widest text-gray-800">SERVICE</h1>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
      </section>

      {/* ===== サービス一覧 ===== */}
      <section className="py-24 px-6">
        <ServiceCards headingLevel={2} />
      </section>

      {/* ===== お問い合わせCTA ===== */}
      <section
        className="py-24 px-6 text-center text-white"
        style={{ backgroundColor: "#3dbdac" }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
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
