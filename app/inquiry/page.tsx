"use client";

import { useState } from "react";
import Link from "next/link";

const serviceOptions = [
  "家具ホーダイ!! Service",
  "BASIC OFFICE Service",
  "ノボルバディ Service",
  "その他・複数のサービス",
];

type FormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

type Status = "idle" | "loading" | "success" | "error";

export default function InquiryPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    company: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "送信に失敗しました。");
      }

      setStatus("success");
      setForm({ name: "", company: "", email: "", phone: "", service: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "送信に失敗しました。");
    }
  };

  return (
    <main className="bg-white">

      {/* ===== ページヘッダー ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-24 px-6"
        style={{ background: "linear-gradient(135deg, #f0fdfb 0%, #e6f7f5 50%, #f8fafc 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: "#3dbdac" }} />
        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">Contact Us</p>
        <h1 className="text-4xl font-bold tracking-widest text-gray-800">お問い合わせ</h1>
        <div className="mt-4 w-12 h-0.5" style={{ backgroundColor: "#3dbdac" }} />
        <p className="mt-4 text-sm text-gray-500 max-w-md leading-relaxed">
          サービスに関するご質問・ご相談はお気軽にお問い合わせください。<br />
          担当者より2営業日以内にご連絡いたします。
        </p>
      </section>

      {/* ===== フォーム ===== */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">

          {/* 送信成功 */}
          {status === "success" && (
            <div
              className="rounded-2xl p-8 text-center mb-8"
              style={{ backgroundColor: "#e6f7f5" }}
            >
              <p className="text-2xl mb-3">✅</p>
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                お問い合わせを受け付けました
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                ご入力いただいたメールアドレスに確認メールをお送りしました。<br />
                担当者より2営業日以内にご連絡いたします。
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-3 text-sm font-medium text-white rounded-full hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#3dbdac" }}
              >
                トップページへ戻る
              </Link>
            </div>
          )}

          {/* フォーム */}
          {status !== "success" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* エラーメッセージ */}
              {status === "error" && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                  {errorMsg}
                </div>
              )}

              {/* お名前 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  お名前 <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="山田 太郎"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ "--tw-ring-color": "#3dbdac" } as React.CSSProperties}
                />
              </div>

              {/* 会社名 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  会社名
                </label>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="株式会社〇〇"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="example@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  電話番号
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="03-0000-0000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                />
              </div>

              {/* ご興味のサービス */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ご興味のサービス
                </label>
                <select
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                >
                  <option value="">選択してください</option>
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* お問い合わせ内容 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  お問い合わせ内容 <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="ご質問・ご相談内容をご記入ください"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                />
              </div>

              {/* プライバシーポリシー */}
              <p className="text-xs text-gray-400 leading-relaxed">
                送信いただいた個人情報は、お問い合わせへの回答および関連するご連絡のみに使用いたします。
              </p>

              {/* 送信ボタン */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-4 text-sm font-bold text-white rounded-full transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#3dbdac" }}
              >
                {status === "loading" ? "送信中..." : "送信する"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ===== 直接連絡先 ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-4">お急ぎの場合は直接ご連絡ください</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@novolba.com"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ borderColor: "#3dbdac", color: "#3dbdac" }}
            >
              📧 support@novolba.com
            </a>
            <a
              href="tel:08047206472"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ borderColor: "#3dbdac", color: "#3dbdac" }}
            >
              📞 080-4720-6472
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
