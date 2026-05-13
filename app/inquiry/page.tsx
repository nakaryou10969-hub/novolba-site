"use client";

import { useState } from "react";
import Link from "next/link";

const inquiryOptions = [
  "物件を探してほしい",
  "オススメ物件について",
  "家具のサブスク「家具ホーダイ!!」について",
  "場づくりの右腕「ノボルバディ」",
  "優待について",
  "その他",
];

const budgetOptions = [
  "20万円", "25万円", "30万円", "40万円", "50万円",
  "60万円", "70万円", "80万円", "90万円", "100万円", "それ以上",
];

const areaOptions = ["渋谷・新宿", "五反田・品川・芝浦", "神田・人形町", "その他"];

const howOptions = [
  "Google検索広告", "Facebook広告", "Twitter", "note",
  "プレスリリース", "アメリカン・エキスプレス", "ダイレクトメール", "知人からの紹介", "その他",
];

type Status = "idle" | "loading" | "success" | "error";

export default function InquiryPage() {
  const [inquiryType, setInquiryType] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [areaOther, setAreaOther] = useState("");
  const [budget, setBudget] = useState("");
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [howList, setHowList] = useState<string[]>([]);
  const [howOther, setHowOther] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const toggleCheck = (
    value: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  };

  // --- バリデーション ---
  const sanitize = (str: string) => str.replace(/<[^>]*>/g, "").trim();
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidPhone = (v: string) => /^[0-9\-+() ]{8,20}$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    // クライアント側バリデーション
    if (!inquiryType) {
      setStatus("error");
      setErrorMsg("お問い合わせ種別を選択してください。");
      return;
    }
    if (areas.length === 0) {
      setStatus("error");
      setErrorMsg("希望エリアを1つ以上選択してください。");
      return;
    }
    if (!budget) {
      setStatus("error");
      setErrorMsg("月額予算を選択してください。");
      return;
    }
    if (!sanitize(company)) {
      setStatus("error");
      setErrorMsg("会社名を入力してください。");
      return;
    }
    if (!sanitize(name)) {
      setStatus("error");
      setErrorMsg("氏名を入力してください。");
      return;
    }
    if (!isValidEmail(email)) {
      setStatus("error");
      setErrorMsg("正しいメールアドレスを入力してください。");
      return;
    }
    if (!isValidPhone(phone)) {
      setStatus("error");
      setErrorMsg("正しい電話番号を入力してください。（半角数字・ハイフン）");
      return;
    }
    if (howList.length === 0) {
      setStatus("error");
      setErrorMsg("サービスを知ったきっかけを1つ以上選択してください。");
      return;
    }

    const areaValue = [
      ...areas.filter((a) => a !== "その他"),
      ...(areas.includes("その他") && areaOther ? [`その他: ${sanitize(areaOther)}`] : []),
    ].join("、");

    const howValue = [
      ...howList.filter((h) => h !== "その他"),
      ...(howList.includes("その他") && howOther ? [`その他: ${sanitize(howOther)}`] : []),
    ].join("、");

    const payload = {
      お問い合わせ種別: inquiryType,
      希望エリア: areaValue,
      月額予算: budget,
      会社名: sanitize(company),
      氏名: sanitize(name),
      メールアドレス: email.trim(),
      電話番号: phone.trim(),
      サービスを知ったきっかけ: howValue,
    };

    try {
      const res = await fetch("https://formspree.io/f/xlgaoovr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "送信に失敗しました。");

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "送信に失敗しました。");
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const requiredMark = <span className="text-red-500 text-xs ml-1">※必須</span>;

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
        <div className="max-w-6xl mx-auto">

          {/* 送信成功 */}
          {status === "success" && (
            <div className="rounded-2xl p-8 text-center mb-8" style={{ backgroundColor: "#e6f7f5" }}>
              <p className="text-2xl mb-3">✅</p>
              <h2 className="text-lg font-bold text-gray-800 mb-2">お問い合わせを受け付けました</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
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

          {status !== "success" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">

              {status === "error" && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                  {errorMsg}
                </div>
              )}

              {/* お問い合わせ種別 */}
              <div>
                <label className={labelClass}>
                  お問い合わせ種別{requiredMark}
                </label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">選択してください</option>
                  {inquiryOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* 希望エリア */}
              <div>
                <label className={labelClass}>
                  希望エリア{requiredMark}
                </label>
                <p className="text-xs text-red-500 mb-1">（複数選択可）</p>
                <p className="text-xs text-gray-500 mb-3">エリアから選択</p>
                <div className="flex flex-wrap gap-4">
                  {areaOptions.map((area) => (
                    <label key={area} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={areas.includes(area)}
                        onChange={() => toggleCheck(area, areas, setAreas)}
                        className="w-4 h-4"
                      />
                      {area}
                    </label>
                  ))}
                  {areas.includes("その他") && (
                    <input
                      type="text"
                      value={areaOther}
                      onChange={(e) => setAreaOther(e.target.value)}
                      placeholder="エリアを入力"
                      className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* 月額予算 */}
              <div>
                <label className={labelClass}>
                  月額予算{requiredMark}
                </label>
                <p className="text-xs text-gray-500 mb-1">（目安：坪単価2万円前後）</p>
                <p className="text-xs text-gray-500 mb-3">※月額料金には、人数分の家具、Wi-Fi、プリンター、ホワイトボードが含まれます。</p>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">選択してください</option>
                  {budgetOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* 会社名 */}
              <div>
                <label className={labelClass}>
                  会社名{requiredMark}
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  placeholder="例) 株式会社ノボルバ"
                  className={inputClass}
                />
              </div>

              {/* 氏名 */}
              <div>
                <label className={labelClass}>
                  氏名{requiredMark}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="例) 昇場 二郎"
                  className={inputClass}
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label className={labelClass}>
                  メールアドレス{requiredMark}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="例) example@company.com"
                  className={inputClass}
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label className={labelClass}>
                  電話番号{requiredMark}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="例) 09012345678"
                  className={inputClass}
                />
              </div>

              {/* 何でこのサービスを知りましたか */}
              <div>
                <label className={labelClass}>
                  何でこのサービスを知りましたか{requiredMark}
                </label>
                <p className="text-xs text-red-500 mb-1">（複数選択可）</p>
                <p className="text-xs text-gray-500 mb-3">※その他を選ばれた方はテキストボックスへ詳細をご記載ください</p>
                <div className="flex flex-wrap gap-4">
                  {howOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={howList.includes(opt)}
                        onChange={() => toggleCheck(opt, howList, setHowList)}
                        className="w-4 h-4"
                      />
                      {opt}
                    </label>
                  ))}
                  {howList.includes("その他") && (
                    <input
                      type="text"
                      value={howOther}
                      onChange={(e) => setHowOther(e.target.value)}
                      placeholder="詳細を入力"
                      className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none w-full mt-1"
                    />
                  )}
                </div>
              </div>

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
        <div className="max-w-6xl mx-auto text-center">
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
