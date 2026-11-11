# 買取大助のサイト組み込み

- 本番用URL: `https://novolba.com/service/kaitori-daisuke/`（2026-11-11 に `/service/kaitori-oodasukari/` から変更。旧URLは転送用ページで新URLへ移す）
- トップと `/service/` は `libs/services.ts` と `app/components/ServiceCards.tsx` を共有する。
- カード順は家具ホーダイ!!、BASIC OFFICE、ノボルバディ、買取大助。
- グリッド最大960px、800px以上で2列、それ未満は1列。カード最大464px、中央配置。画像は16:9。
- 詳細リンクは上記サービスURL、相談リンクは `/inquiry/`。既存3サービスの文言とリンクは維持。
- 買取大助は `app/service/kaitori-daisuke/page.tsx`。共通Header/Footerを使用し、承認済みの本文・図・レイアウトを移植した。
- 子ページCSSはCSS Moduleのルート配下に限定し、他ページの色・フォント・最大幅に影響させない。
- 素材は `public/images/kaitori-daisuke/` のWebP12点。承認済みPNGから表示サイズに合わせて変換（合計880,806 bytes）。追加生成画像はない。
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

## 買取大助への遷移位置（2026-11-05修正）

トップや一覧で4枚目までスクロールしてNext.jsのクライアント遷移を使うと、長い移動先ページにも同じスクロール位置が残る問題を再現した。買取大助の詳細リンクのみ通常の文書遷移に変更し、新しく開くと先頭を表示する。共通ServiceCardsで両方の入口に適用し、他のサービス・問い合わせ先・本文・画像・配置は変更しない。

回帰確認はURLへの直接移動だけでは不十分。トップ/一覧の下まで実際にスクロールし、「詳細を見る」をクリックして、到着時と読込後のscrollY=0を確認する。320/393/768/1440pxの8条件、戻る位置の復元8条件と再遷移8条件、直リンク、静的build・型検査・変更コードLintをローカルで確認した。

## URL変更・トップのフリガナ・説明文（2026-11-11）

- 読み仮名は「かいとりだいすけ」が正しいため、URLを `/service/kaitori-daisuke/` に変更。ページ・画像フォルダ・本書の `oodasukari` 綴りも `daisuke` に揃えた（画像は `public/images/kaitori-daisuke/`）。
- 旧URL `/service/kaitori-oodasukari/` は11/5〜本番公開済みのため、`app/service/kaitori-oodasukari/page.tsx` に転送用ページを残す。静的書き出しでは `next.config` の redirects が使えないので、`<meta http-equiv="refresh" content="0; url=/service/kaitori-daisuke/">` と `location.replace`（クエリ・ハッシュを引き継ぐ）で移し、`noindex, follow` と新URLのcanonicalで検索エンジンに移転先を示す。JavaScriptもmeta refreshも効かない環境向けに新URLへの文字リンクを置く。HTTP 301が必要になった場合はCloudFront側の設定が別途必要（今回はAWS設定を変更していない）。
- 旧画像URL `/images/kaitori-oodasukari/*.webp` は本番配備時の `s3 sync --delete` で削除される。11/5〜のSNS共有でOG画像として参照されていた場合、そのカード画像は表示されなくなる。
- `libs/services.ts` の買取大助に `titleRuby`（買取大助／かいとりだいすけ）と `descriptionHighlight` を追加。`ServiceCards` が見出しの該当語を `<ruby>` にし、説明文の強調語句を `<strong>`（700、文字用グリーン #147D6F、16px、`inline-block` で幅が足りれば1行にまとめる）で描画する。トップと `/service/` は同じデータを使うため、両方に反映される。
- 説明文: 「オフィス移転で残していく家具の買取から、廃棄処分、退去時の原状回復まで。事務所移転時の面倒ごとをまるごとNovolBaが引き受ける、事務所退去の大助かりサービスです。」強調は「事務所退去の大助かりサービス」。
- 検証: モックCMSでの静的build成功、変更ファイルのESLint成功（全体lintの4 errors/12 warningsは未変更ファイルの既存分）。ローカル配信で、トップ・`/service/` を1440/375/320px、`/service/kaitori-daisuke/` を1440/375px、旧URL転送（クエリ・ハッシュ保持）を1440/375pxで確認。一覧の「詳細を見る」から新URLの先頭（scrollY=0）に着くこと、子ページ画像13点の読込、横はみ出しなしを確認。
