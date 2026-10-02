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

## 2026-10-02 AWSプレビュー実装の追加承認

ユーザーが調査報告後に実装を承認した。AWSアカウントは共通、microCMSサービスは別。今回の承認は上記の旧レビュー限定スコープを、Lambda向けコード・起動・梱包・配備手順の実装まで拡張する。

- 本番の静的export、既存記事デザイン、S3/CloudFront配備処理は維持する。
- サイト別の通常Lambda、AWS公式Lambda Web Adapter、Function URL、既存Basic認証を使用する。us-east-1、固定費のある追加サービス無しを基本とする。
- 認証・Host/Origin検証、許可APIの限定、全レスポンスno-store、draftKey非保存、秘密の非ログ出力を保持する。
- IAM実行ロール・Function URLの公開権限は完成した具体案を示し、必要なブラウザ操作時の承認後に設定する。
- 秘密情報を取得・転記・ローカル保存・コミットしない。既存GitHub SecretsのCI内利用は値を表示せず、追加のBasic認証情報は本人が入力する。
- mock build成果物を実AWSへ配備しない。梱包はプレビューshellと必要assets、Node runtimeのみとし、公開記事HTMLやsource/map/envファイルを除外する。
- 開発はcodex/aws-microcms-previewブランチで行い、support側nakaryou10969-hubの認証を確認してからリモートへ反映する。別の連携アカウントでは書き込まない。
- テスト・パッケージ検証の完了と、AWS配備・microCMS設定・実下書きの確認は区別して報告する。


### 専用プレビュービルド
- CMSキーやモック記事を使わず、元layout・previewルートとレビュー済み依存だけを独立stagingにコピーしてNext.js静的exportを行う。
- 専用成果物は `.preview-lambda-build/out`。本番app/next.config/outを変更しない。
- Lambda梱包と配備は専用成果物を使用し、mock marker付き成果物を拒否する。

### 今回のローカル検証結果
- プレビューおよびLambda専用テスト計58件成功。キー不要の実Next.jsビルドと型検査、変更ファイルESLint、差分チェック成功。
- Lambda ZIP 341,956 bytes、展開1,046,747 bytes。標準ZIP CRC、run.shの755/LF、プレビューHTML限定、CloudFormation JSONと手動workflow YAMLの解析を確認。
- 両サイトの既存GitHub Secretsは必要な名前の存在のみ確認。値は取得していない。Basic認証2種類の追加は本人の入力待ち。
- AWS配備、実LinuxでのAWS CLI処理、実microCMS記事・draftKey置換は未検証。GitHubの作業用ブランチへChromeで反映済み。対象14ファイルの内容一致を匿名git読取で確認した。
- Chromeのus-east-1 Lambdaダッシュボードで、アカウント全体10・未予約10の同時実行上限を確認。各5枠の予約はAWS条件を満たさないため設定しない。上限変更は行わず、既存関数と共有する。


## 2026-10-02 追加パスワードを使わないプレビューへの変更
ユーザーは、microCMSログイン状態を外部で検証せず、draftKey付きリンクを持つ人が閲覧できる方式を理解し、実装を承認した。この節が以前のBasic認証要件に優先する。
- Basic認証、追加ID・パスワード、PREVIEW_BASIC_USERNAME/PASSWORDの必須設定を撤去する。画面shell/assetsは認証なしで開く。
- 記事取得はPOST /api/previewへ許可endpoint・contentId・非空draftKeyが揃った場合だけ行う。APIキーは既存CI Secretsからサーバー内で使用する。
- 誤ったキーを受け付けるCMS設定や公開記事へのフォールバックを避けるため、同一記事にランダムな不一致キーを付けた最小GETが拒否されることを確認してから実キーで取得する。拒否が確認できない場合は本文を返さない。
- no-store/no-referrer/noindex、URL fragment消去、HTMLサニタイズ、Host/Origin制限、サイズ・時間・回数制限を保持する。認証ヘッダでプレビューを許可する経路は作らない。
- 配備前の非公開Lambda検査は、shellの200、キー無しPOSTの400、キャッシュ禁止と認証ダイアログ無しを確認してから公開権限を有効にする。
- KSC PR #3 / NovolBa PR #2を修正する。本番記事・本番配備設定は変更しない。
- AWS IAMとFunction URL公開の具体的な実行確認は配備直前に行う。実CMSのdraftKey置換と不正キー拒否、新規下書き・公開済み改稿の確認は別途必要。

追加パスワード撤去後の検証: プレビュー・Lambda合計59件成功。変更コードESLintとgit diff --check成功。ZIP 341,787 bytes、CRC/run.sh755・LF/プレビューHTML限定を再確認。実AWS・実CMSは未配備・未検証。

## 2026-10-02 配備権限の限定
既存のgithub-actions-novolbaにはS3・CloudFront権限のみがあり、CloudFormation配備権限が不足している。新しい配備権限案はus-east-1のksc-microcms-preview/novolba-microcms-previewのstack・Lambda・ログと、同名-executionの2ロールに限定する。ロール作成時にはmicrocms-preview-logs-boundaryを必須とし、権限の上限を2つの専用ロググループへのCreateLogStream/PutLogEventsに固定する。配備ユーザーに境界ポリシーの変更・除去、他ロール操作、新しいアクセスキー作成の権限を与えない。境界ポリシー作成・既存配備ユーザーへの限定権限追加は、具体的なポリシーを提示した上でブラウザ規則に基づく追加確認待ちとする。それ以外の承認済み実装・main更新・検証は進める。
## 2026-10-03 配備失敗の安全な診断
専用ポリシー付与後の実CIはCloudFormation create-stackで失敗し、秘密を含むCLI詳細は抑止されている。エラー全文・要求JSON・秘密値を返さず、固定allowlistのエラー種別だけを出力する診断を追加する。対象の配備機能・秘密stdin・権限限定・本番workflowは維持する。未知のエラーや診断文に秘密値が混ざった場合も転記しないことをテストする。
