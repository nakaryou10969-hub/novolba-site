"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import WithArticleView from "../components/WithArticleView";
import NewsArticleView from "../components/NewsArticleView";
import { parsePreviewLocation, type PreviewRequest, type PreviewView } from "../../libs/previewRequest";
import { readPreviewContent, type PreviewArticle } from "../../libs/previewContent";

const ERROR_MESSAGE = "プレビューを表示できませんでした。認証とmicroCMSのプレビュー設定を確認し、microCMSから開き直してください。";

export default function PreviewClient() {
  const request = useRef<PreviewRequest | null>(null);
  const controller = useRef<AbortController | null>(null);
  const initialized = useRef(false);
  const [article, setArticle] = useState<PreviewArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canReload, setCanReload] = useState(false);
  const [view, setView] = useState<PreviewView>("with");

  const loadPreview = useCallback(async () => {
    const parameters = request.current;
    if (!parameters) return;
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setLoading(true);
    setError("");
    setArticle(null);
    setView(parameters.view);
    try {
      const response = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Preview-Request": "1" },
        credentials: "same-origin",
        cache: "no-store",
        redirect: "error",
        referrerPolicy: "no-referrer",
        signal: current.signal,
        body: JSON.stringify({ endpoint: parameters.endpoint, contentId: parameters.contentId, draftKey: parameters.draftKey }),
      });
      if (!response.ok) throw new Error("Preview unavailable");
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || Array.isArray(payload) || !("content" in payload)) throw new Error("Preview unavailable");
      const next = readPreviewContent(payload.content, parameters.endpoint);
      if (next.article.id !== parameters.contentId) throw new Error("Preview unavailable");
      if (!current.signal.aborted) setArticle(next);
    } catch {
      if (!current.signal.aborted) setError(ERROR_MESSAGE);
    } finally {
      if (!current.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (!initialized.current) {
      initialized.current = true;
      const search = window.location.search;
      const hash = window.location.hash;
      // Remove URL parameters before parsing, requesting, or rendering draft content.
      window.history.replaceState(null, "", window.location.pathname);
      try { request.current = parsePreviewLocation(search, hash); }
      catch { request.current = null; }
    }
    queueMicrotask(() => {
      if (!active) return;
      if (!request.current) { setError(ERROR_MESSAGE); setLoading(false); return; }
      setCanReload(true);
      void loadPreview();
    });
    const discardPreview = () => {
      controller.current?.abort();
      request.current = null;
      setArticle(null);
      setCanReload(false);
      setLoading(false);
      setError(ERROR_MESSAGE);
    };
    const restorePage = (event: PageTransitionEvent) => { if (event.persisted) discardPreview(); };
    window.addEventListener("pagehide", discardPreview);
    window.addEventListener("pageshow", restorePage);
    return () => {
      active = false;
      controller.current?.abort();
      window.removeEventListener("pagehide", discardPreview);
      window.removeEventListener("pageshow", restorePage);
    };
  }, [loadPreview]);

  return (
    <>
      <section className="bg-teal-50 border-b border-teal-200 px-6 py-5 text-gray-800" aria-label="プレビュー操作" style={{ lineBreak: "strict", overflowWrap: "anywhere" }}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold text-base">下書きプレビュー</p>
            <p className="text-sm leading-relaxed mt-1">保存した下書きの内容を表示します。更新後は「再読み込み」を押してください。</p>
            <p className="text-sm leading-relaxed">ページを開き直す場合は、microCMSのプレビューボタンを使用してください。</p>
          </div>
          <button type="button" onClick={() => void loadPreview()} disabled={loading || !canReload} className="rounded-full bg-teal-700 px-5 py-2 text-white text-sm font-bold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            再読み込み
          </button>
        </div>
        <div className="max-w-6xl mx-auto" aria-live="polite" aria-atomic="true">
          {loading && <p className="mt-4 text-base">プレビューを読み込んでいます…</p>}
          {error && <p role="alert" className="mt-4 text-base text-red-800">{error}</p>}
        </div>
      </section>
      {article?.kind === "with" && <WithArticleView article={article.article} view={view === "media" ? "media" : "with"} contentHtml={article.article.content} preview />}
      {article?.kind === "news" && <NewsArticleView blog={article.article} contentHtml={article.article.content} preview />}
      {!article && <main className="min-h-64" aria-label="記事プレビュー" />}
    </>
  );
}
