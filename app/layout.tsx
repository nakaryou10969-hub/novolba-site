import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "NovolBa | 挑戦するスタートアップの昇る場",
  description: "スタートアップに特化したオフィスサービス。家具ホーダイ・BASIC OFFICE・ノボルバディの3サービスを展開。",
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
