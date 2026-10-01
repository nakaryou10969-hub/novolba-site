# microCMS プレビューの作業仕様

## 目的と対象
main 0bb96517e798c070384bda65767957af48ced772 の分離コピーへ with と blogs のプレビューを実装する。with は /with と /media、blogs は /news の既存デザインを再利用する。

## 要件と制約
静的 export と trailingSlash を維持し、本番のデザインと取得方式を保つ。既存記事表示を共有部品に抽出し、下書き取得は認証付き別 Node サーバーの POST /api/preview のみで行う。サーバー側の既存 microCMS 読取キーを使用し、任意 endpoint・URL・redirect を拒否する。全レスポンス no-store。プレビュー HTML は全変換後サニタイズする。URL fragment の draftKey を消去し永続保存しない。AGENTS.mdのNext.js 16.2.4同梱docsを読む。

## ゴールと非ゴール
独立レビューで、専用ホストの HTML 配信を out/preview/index.html のみに限定する要件を追加した。公開記事由来の未サニタイズ HTML とプレビュー認証 origin の信頼境界を分離する。公開ページへの相対リンクは専用ホストで利用できない場合があり、公開サイトは別に開く。

モックで未公開・公開済み編集中の双方、認証・入力・キャッシュ・HTML安全性を検証し、作業用ブランチ codex/microcms-preview の commit/push と main を base にする draft PR でレビュー可能にする。main push/merge、AWS変更、microCMSキー・AWS資格情報・IAM権限の新規作成、SSR本番移行は対象外。

## 未解決事項
実データ・実AWSの検証、previewホスト/TLS/費用の承認、microCMSのfragment置換挙動は未確認。Node版は実装済みだが、Lambda用包装・起動設定と本番プレビュー配備は未実装。モック out/ は配備せず、実環境では承認済みの既存キーで通常buildをやり直す。作業手順書はDOCXのみ納品する。

## リモートレビューと検証
所有者 nakaryou10969-hub の標準CLI認証と対象repoの push 権限を確認済み。作業用認証を使い、既存アカウントの認証を削除せず、.auth・資格情報・生成物をcommitに含めない。originと最新mainを再確認し、最終テスト・型・変更ファイルLint・差分チェック後に作業用ブランチだけをpushする。CIが起動すれば該当commitの結果を確認し、未起動ならその事実をPRに記載する。

最終実装の検証実績は44/44テスト成功、型チェック・変更ファイルLint・モック静的build成功。全体Lintには未変更 app/service/novolba-buddy/page.tsx の引用符エラー4件があり、本変更には含めない。ブラウザ検証は2サイト合計で初回24件・追加12件成功、実microCMSと実AWSは未検証。
