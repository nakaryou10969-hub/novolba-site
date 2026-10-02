# draftKeyリンクによるmicroCMSプレビュー

追加のID・パスワードは不要です。microCMSの画面プレビューから渡される、記事ごとのdraftKeyを使います。そのキーを含む元のリンクを持つ人はmicroCMS未ログインでも閲覧できます。

## 必要な設定
- MICROCMS_SERVICE_DOMAIN: 既存サービスのサブドメイン（スキーム・pathを含めない）。
- MICROCMS_API_KEY: 対象APIの既存GETキー。CIとNodeサーバー内でのみ利用し、ブラウザへ返さない。
- PREVIEW_PUBLIC_ORIGIN: 外部HTTPS origin。path・query・fragment・末尾slashを含めない。
- PREVIEW_HOST / PREVIEW_PORT: 既定127.0.0.1 / 3001。Lambdaは同じ値。
- Basic認証やPREVIEW_BASIC_USERNAME/PASSWORDは使用しません。dotenvを自動読取せず、NEXT_PUBLIC_にキーを設定しません。

## 取得・保護の条件
- プレビューshellと必要assetsは認証なしで配信する。shell自体は記事本文を含まない。他のHTMLは404。
- 記事はPOST /api/previewのみで取得する。入力はendpoint・contentId・draftKeyの3つの文字列のみ。非空draftKeyが必須。
- endpointはレビュー済みのサイト別allowlistに限定する。リクエスト側でサービス、URL、redirect、追加queryを指定できない。
- Origin・Hostは正規originに一致し、Content-Typeはapplication/json、X-Preview-Requestは1が必須。Authorizationヘッダは閲覧許可に使用しない。
- まず同一記事にランダムな不一致draftKeyを付け、fields=idの最小GETが400/404で拒否されることを確認する。本文を読まず破棄する。拒否が確認できなければ502で停止する。
- その後、指定draftKeyを含む単一記事GETを行う。取得失敗時にキー無しGETや公開版へフォールバックしない。APIキーの「下書き全取得」が必要な構成にはしない。
- 1プレビューAPIにつきmicroCMS GETは通常2回。合計10秒、本文上限2MiB、リクエスト上限4KiB。画像はmicroCMSから直接配信する。
- 全route・全statusはno-store/no-referrer/noindex。サニタイズとCSPを保持する。
- draftKeyはfragmentで受け、通信前にURLから消去する。queryでのdraftKeyを拒否し、キーと記事本文をcookie・browser storage・ログへ保存しない。ページ再読込はmicroCMSからプレビューを開き直す。
- 元のキー付きリンクを共有した相手も閲覧できるため、共有先を確認する。microCMSログイン状態を外部で検証する方式ではない。
- upstream URL・本文・APIキー・draftKeyをログに出さない。HTTP tracingやupstream URLログも無効化する。APIエラーは内容を転送しない。
- peer別の制限は全体240req/分・プレビューAPI60req/分。X-Forwarded-Forを信頼しない。Lambdaでは各実行環境別となり、月間料金上限ではない。

## microCMSの画面プレビューURL
配備・承認後、API設定→画面プレビューに以下を設定します。placeholderはそれぞれ1回だけ使用します。

```text
WITH: https://<preview-host>/preview/?endpoint=with&view=with&contentId={CONTENT_ID}#draftKey={DRAFT_KEY}
MEDIA: https://<preview-host>/preview/?endpoint=with&view=media&contentId={CONTENT_ID}#draftKey={DRAFT_KEY}
NEWS: https://<preview-host>/preview/?endpoint=blogs&view=news&contentId={CONTENT_ID}#draftKey={DRAFT_KEY}
```
with APIにはWITH/MEDIAの一方を設定し、必要時に許可されたviewを切り替えてもう一方を確認できます。

fragment内の置換は実microCMSで確認が必要です。保存済みの新規下書きと、公開済み記事の保存済み改稿を確認します。未保存の編集内容の表示は保証しません。404はキー/記事が利用不可、502はAPI設定・不一致キー検査・データ/通信失敗、504はtimeoutです。元のエラー詳細は表示しません。

公式: [画面プレビュー](https://document.microcms.io/manual/screen-preview)、[単一記事API](https://document.microcms.io/content-api/get-content)。

## ビルドとLambda配備
- npm run test:preview / npm run test:preview:lambda: 秘密情報・実CMSを使わないテスト。
- npm run build:preview:lambda: 実画面部品からプレビューだけを独立stagingへ静的生成。キー・記事・mockデータ不要。本番app・Next設定・out・S3/CloudFront配備workflowは変更しない。
- npm run package:preview:lambda: Node HTTPサーバーと専用shell/assetsだけをZIP化。source map・dotenv・node_modules・他記事HTML・mock成果物・symlinkを除外。run.shは755/LF。ZIP50MiB・展開200MiB・asset4MiB以下。
- Deploy draftKey preview to Lambdaはworkflow_dispatchのみ。既存AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY/MICROCMS_SERVICE_DOMAIN/MICROCMS_API_KEYを不透明なCI Secretsとして利用する。追加パスワードSecrets不要。
- PREVIEW_AWS_ACCOUNT_IDをrepository variableに設定する。対象accountをSTSで検証してから変更し、対象stackのタグ・名前を確認する。
- 配備認証には対象CloudFormation/Lambda/IAM role/pass-role/logの権限が必要。不足する場合は対象を限定して所有者に確認する。キーの新規作成・値の取得をしない。
- 実行ロール名はFunctionNameに-executionを付ける。microcms-preview-logs-boundaryを事前作成し、専用ログへの書き込みだけを権限上限とする。CIはこの境界が付く2ロールのみ作成・管理でき、境界の変更・除去はできない。
- us-east-1、Node.js22、x86_64、512MB、上限30秒。公式Lambda Web Adapterを使用。ログ保存14日・WARN。アカウント同時実行上限10を既存関数と共有する。予約枠・quota変更・VPC/NAT・常時起動・Provisioned Concurrency・有料Secrets Manager・独自KMS鍵を追加しない。
- AWS SDK v3を固定した開発依存で利用する。既存CI Secretsはメモリ内からLambda環境変数へ直接渡す。CloudFormationはロール・ログ・URL・公開許可を管理し、秘密パラメータと仮コードは持たない。SDKが実ZIPとRevisionIdを管理し、CodeSha256を照合する。CLI・子プロセス・秘密入り一時ファイルを使用しない。
- まずFunction URLの公開呼出し権限を無効にして配備する。非公開のLambda invokeでshellの200とキー無しPOSTの400、no-store、認証ダイアログ無しを確認してから、承認された公開権限を有効にする。
- URLのAWS認証はNONE。記事の閲覧条件はdraftKey。キーがないアクセスもLambdaの利用量になる。Function URL自体の追加固定料金はないが、無料枠を超えれば従量課金される。
- 手元では実SDKとloopback模擬AWSを使い、秘密情報なしで通信・状態遷移・期限・応答上限・公開前検査を確認する。書き込みは自動再試行しない。実AWS・実CMSの成功は別途確認する。GitHub Actionsを診断に使わず、ローカル検証後に1サイトずつ配備する。

## 配備の所有範囲と停止・削除手順
- Lambda本体はSDK管理、実行ロール・ログ・Function URL・2つの公開許可はCloudFormation管理。新規作成は基盤のみ、実ZIP、非公開URL、origin設定、非公開Invoke検査、公開許可の順。
- 初回のIAM反映遅延を避けるため、基盤を先に作成し、CREATE_COMPLETEと境界・inline policyを確認してから配備する。時間を置いても反映完了を保証できないため、失敗・timeout時は状態を確認するまで再送しない。
- CFスタック削除だけではSDK管理のLambda本体は削除されない。削除依頼時は、公開許可を無効化し、専用Lambdaを削除し、専用CFスタックを削除する各対象を確認する。自動で削除・権限拡張しない。
