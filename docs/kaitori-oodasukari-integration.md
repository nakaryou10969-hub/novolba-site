# 買取大助のサイト組み込み

- 本番用URL: `https://novolba.com/service/kaitori-oodasukari/`
- トップと `/service/` は `libs/services.ts` と `app/components/ServiceCards.tsx` を共有する。
- カード順は家具ホーダイ!!、BASIC OFFICE、ノボルバディ、買取大助。
- グリッド最大960px、800px以上で2列、それ未満は1列。カード最大464px、中央配置。画像は16:9。
- 詳細リンクは上記サービスURL、相談リンクは `/inquiry/`。既存3サービスの文言とリンクは維持。
- 買取大助は `app/service/kaitori-oodasukari/page.tsx`。共通Header/Footerを使用し、承認済みの本文・図・レイアウトを移植した。
- 子ページCSSはCSS Moduleのルート配下に限定し、他ページの色・フォント・最大幅に影響させない。
- 素材は `public/images/kaitori-oodasukari/` のWebP12点。承認済みPNGから表示サイズに合わせて変換（合計880,806 bytes）。追加生成画像はない。
- 個別canonical、OG、TwitterのURL/説明を設定。トップ/一覧のサービス数に関する説明を4サービスへ更新した。

## ローカル検証（2026-11-05）

- 既存 `preview/mock-build.cjs` を利用したNext.js静的ビルド成功。CMS資格情報は取得していない。
- TypeScript、変更TS/TSXのESLint、`git diff --check` 成功。
- トップと一覧: 320/390/768/799/800/960/1440pxで計14条件、カード数4、列数切替、最大幅、中央配置、横はみ出しなしを確認。
- 子ページ: 320/390/768/800/960/1440pxで6条件、12画像の読み込み、最大幅960px、見出し/本文配置、Header/Footer各1個、問い合わせ2か所を確認。
- カードから詳細へ遷移、FAQ開閉、モバイルメニューから一覧への遷移を確認。ページ実行エラーなし。
- 承認済み版の可視本文との一致、CSSの局所化を別レビューでも確認。
- PC・スマホのスクリーンショットを目視確認。

## 本番反映時

現在の検証用 `out/` はCMS記事をテストデータで生成しているため、アップロードしない。実ソースをレビューし、承認後に通常のGitHub Actionsと既存Secretsでビルドする。本変更は本番ワークフロー・AWS設定・既存CMS/プレビュー機能を変更していない。

`main` へのpush/mergeは本番S3/CloudFront配備を起動する。2026-11-05にユーザーが本番実装を明示承認したため、今回の承認済み変更をmainへ統合し、既存ワークフローで配備する。実行結果は作業記録とGitHub Actionsで確認する。
