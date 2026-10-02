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

## 2026-10-03 CLI入力互換性の修正
実CIでcreate-stackがcli-input-fileに分類され、AWS要求前の入力失敗と判明。Linuxの匿名メモリファイル(memfd)をPython標準ライブラリで作り、AWS CLIへ継承する。秘密値をディスク・引数・ログに保存しない。Lambda invokeの応答もmemfdで回収する。実AWS CLIの非通信スケルトン生成で入力経路を検証してから配備する。対象IAM・公開範囲・本番workflowは変更しない。

## 2026-10-03 再実装と通知影響を抑える検証条件
ユーザーは、GitHub Actionsの失敗がメンバー全員へ通知されることを指摘した後、再実装を指示した。GitHubへ診断目的のworkflow・試行配備を送らず、main反映前に手元の隔離環境で原因を再現し、修正と異常終了を検証する。
- cli-input-fileは独自分類であり、具体的原因の特定完了ではない。旧節の『判明』は根本原因特定を意味しない。
- memfd案は実Linux未検証の候補。モック成功と実CLI成功を区別する。子プロセスの終了保証と出力上限も検証する。
- このPCにはDocker/Podman/WSLのLinux環境がない。システム変更や再起動を避け、公式配布元の一時的な検証環境を検討する。実AWS資格情報・CMSキーは検証環境へ渡さない。
- 配備前にテンプレートと限定IAMの必要操作を照合する。main反映は本番自動配備を起動するため、ローカル検証を終えるまで行わない。
- 本番配備は片方だけ1回実行し、結果確認後に他方へ進む。未知エラー・同じ失敗・タイムアウトでは停止し、実状態確認前に再送・権限追加・削除しない。
- microCMSのURL設定と新規下書き/公開済み改稿の実表示まで完了条件とする。秘密値を取得・保存せず、記事変更・公開を行わない。

### 配備処理をAWS SDK v3へ切替え
手元のLinux環境導入は約0.9GBの追加検証環境を要するため採用しない。CLIの根本原因は未特定として残し、問題のCLI/標準入力/子プロセス経路自体を削除する。公式AWS SDK v3を開発依存に固定し、CI内の既存資格情報で直接呼び出す。実SDKとloopbackの模擬AWSエンドポイントをWindowsで検証する。
- 既存runAwsテストインターフェースと配備順序・公開前検査は維持する。リージョン固定・アカウント照合・既存スタック所有タグ確認を保持する。
- SDK clientは書込の自動再試行をしない(maxAttempts=1)。期限をAbortSignalで設定し、応答stream上限・安全なエラー分類を設ける。CLI child/秘密argv/一時ファイルは使わない。
- local検証のSDK接続先は明示したloopbackだけ。実AWS/CMS秘密値を渡さない。非漏えい、入力一致、Invoke応答、期限・出力上限・エラー時非公開を検証する。
- CloudFormationのスタックTagsに必要なTagResource/UntagResourceを対象2スタックのみ追加する案を事前整備する。権限境界の変更・削除・対象外拡張は行わない。

### CloudFormationとSDKの責務・中間構成の整合
CFのinline ZipFileが生成するindex.jsとrun.shの不整合、後続CF更新による仮コードへの上書きを根本的に避ける。CFは実行ロール・ロググループ・Function URL・公開許可を管理し、通常Lambda本体はSDKが実ZIP/設定/タグ/RevisionIdを管理する。新規S3バケット/成果物保存は追加しない。
- 新規CFはFunctionPrepared=falseで権限・ログのみを作成し、SDKで実ZIPのLambdaを作成する。既存Lambdaはタグ・実行ロール・Runtime/Architectureを確認してから更新する。
- 実関数作成後にFunctionPrepared=true/EnablePublicAccess=falseでURLを作る。URL originをSDK環境変数へ設定してから非公開Invokeで検査し、最終CF更新は2公開許可のみを有効にする。
- CFへCMS秘密値を渡す必要がなくなるため、MicrocmsApiKey/ServiceDomain/PublicOriginパラメータは廃止する。既存CI SecretsはSDKからLambda環境変数へ直接渡す。既存記事・本番配備workflowは変更しない。
- Lambda更新前のRevisionIdと更新後CodeSha256/State/LastUpdateStatusを確認する。CFの管理外Lambdaを自動削除しない。今後の削除手順は専用LambdaとCFスタックの両方が対象になることをREADMEへ明記する。

### 初回IAM反映の分離
CloudFormationコンソールのテンプレートアップロードはS3保存を伴うため採用しない。ログイン済みAWS ConsoleのCloudShellから、秘密を含まないTemplateBodyを直接指定し、専用2スタックのFunctionPrepared=false/EnablePublicAccess=falseの基盤だけを先に作る。新規S3・資格情報発行・秘密情報取得は行わない。CREATE_COMPLETEとロール境界/inlineを確認し、GitHubコード反映の間に反映待ち時間を確保する。CloudShellはAWS公式で追加利用料金なし、他AWSリソースと通信の料金は通常どおり。CreateStackは1サイトずつ、失敗/timeoutで停止・状態確認する。

## 2026-10-03 WITH新規下書きの表示失敗調査と型修正
- 本人がWITHで新規・未公開下書きを作成し、画面プレビューで失敗。再読み込み有効なのでURL解析は成功している。実HTTP statusと実CMS取得段階は確認待ち。
- microCMS公式仕様ではセレクト項目は単一選択でも文字列配列、未選択は空配列。現サーバーのカテゴリ配列拒否は仕様との不整合として、まず秘密なしモックで再現する。
- NovolBa専用プレビューのWITHカテゴリだけを既存表示部品へ渡せる単一文字列へ正規化する。空配列はカテゴリ無し、複数値は最初の選択を表示する。数・長さ・要素型を検証し、NEWSの参照カテゴリと本番取得/表示は変更しない。
- 非空draftKey、不一致キー検査、Host/Origin/CSP/サニタイズ/no-store/秘密非保存を保持。IAM・APIキー権限は変更しない。
- GitHub Actionsを原因診断に使わず、再現テストと修正、既存テスト・差分確認を手元で完了してから外部反映を判断する。実記事の表示成功までは修正完了と扱わない。
ローカル検証結果: 修正前にカテゴリ単一配列で502を再現。修正後test:preview 70/70、Lambda専用27/27、変更コードESLint・差分検査成功。独立レビューで指摘なし。修正済みZIPは36 files / 341887 bytes、展開1046267 bytes。現在mainはdcdd2d41a4e3030225a04d4be061cd594748b253で変更なし。実HTTP status確認待ち、未配備、実記事表示は未確認。

ブラウザー検証: Chromeで既存の実Nextビルドと修正済みNodeサーバーをloopbackモックで組み合わせ、カテゴリ配列を含む記事本文・カテゴリ・公開日未設定を表示。POST200、正規Origin一致、Referer無し、URLキー消去を確認。実キー・外部CMS通信なし。これを根拠に承認済みのNovolBaプレビュー修正を反映する。対象はserver.mjs/server.test.mjs/workspace-spec.mdの3ファイル。コミットのskip ci指定で変更不要な本番push配備を起動せず、手動プレビュー配備だけ1回実行する。保護された必須チェックの迂回やworkflow設定変更は行わない。
