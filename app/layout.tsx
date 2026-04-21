import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const siteUrl = "https://novolba-site-zkzn.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NovolBa | 挑戦するスタートアップの昇る場",
    template: "%s | NovolBa",
  },
  description:
    "スタートアップに特化したオフィスサービス。家具ホーダイ・BASIC OFFICE・ノボルバディの3サービスを展開。初期費用ゼロ、月額定額制で理想のオフィスを実現します。",
  keywords: ["NovolBa", "スタートアップ", "オフィス", "家具サブスク", "家具ホーダイ", "BASIC OFFICE", "オフィス移転"],
  authors: [{ name: "株式会社NovolBa" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "NovolBa",
    title: "NovolBa | 挑戦するスタートアップの昇る場",
    description:
      "スタートアップに特化したオフィスサービス。家具ホーダイ・BASIC OFFICE・ノボルバディの3サービスを展開。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NovolBa | 挑戦するスタートアップの昇る場",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NovolBa | 挑戦するスタートアップの昇る場",
    description:
      "スタートアップに特化したオフィスサービス。家具ホーダイ・BASIC OFFICE・ノボルバディの3サービスを展開。",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <Header />
        <div className="flex-1 pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
