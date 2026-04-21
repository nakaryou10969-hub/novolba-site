import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - ページが見つかりません | NovolBa",
};

export default function NotFound() {
  return (
    <main className="bg-white min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <p
        className="text-8xl font-bold mb-4"
        style={{ color: "#3dbdac" }}
      >
        404
      </p>
      <h1 className="text-xl font-bold text-gray-800 mb-3">
        ページが見つかりません
      </h1>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-md">
        お探しのページは移動または削除された可能性があります。<br />
        URLをご確認いただくか、トップページからお探しください。
      </p>
      <Link
        href="/"
        className="inline-block px-8 py-3 text-sm font-medium text-white rounded-full hover:opacity-90 transition-opacity"
        style={{ backgroundColor: "#3dbdac" }}
      >
        トップページへ戻る
      </Link>
    </main>
  );
}
