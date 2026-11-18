import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SiteAnalytics from "./components/SiteAnalytics";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_TITLE, SITE_URL } from "../libs/siteMetadata";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | NovolBa",
  },
  description:
    "スタートアップに特化したオフィスサービス。家具ホーダイ・BASIC OFFICE・ノボルバディ・買取大助の4サービスを展開。初期費用ゼロ、月額定額制で理想のオフィスを実現します。",
  keywords: ["NovolBa", "スタートアップ", "オフィス", "家具サブスク", "家具ホーダイ", "BASIC OFFICE", "買取大助", "オフィス移転"],
  authors: [{ name: "株式会社NovolBa" }],
  // og:title, og:description and twitter:* take each page's own title and description.
  // No site-wide og:url: Facebook builds the card from the page that og:url names,
  // so only pages that know their canonical URL (articles) set one.
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/NovolBa_logo_sq_wt-2.webp",
    apple: "/NovolBa_logo_sq_wt-2.webp",
  },
  robots: {
    index: true,
    follow: true,
  },
  // Google Search Console ownership (URL prefix property https://novolba.com/). Keep this tag.
  verification: {
    google: "STAMJqTmqUPxHUfUdKe0xQL30isyuA7rL1uMVOT2xdI",
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
        <div className="flex-1 pt-20">{children}</div>
        <Footer />
      </body>
      <SiteAnalytics />
    </html>
  );
}
