# Authenticated microCMS preview runtime

Production remains a Next.js static export. This separate, dependency-free Node
server serves the `out/preview/index.html` shell and static assets, and retrieves one draft through
`POST /api/preview`. It does not deploy itself or change the production S3 and
CloudFront workflow. The optional Lambda deployment below has its own manual workflow.
Run from the repository root using a maintained Node.js 22
or newer runtime.

This is a dedicated preview origin. `/preview/`, `/preview` and
`/preview/index.html` serve the same preview shell. Other HTML pages, including
published article HTML, return a private JSON 404 even when present in `out/`.
Public rich text therefore cannot acquire this origin's authenticated shell CSP.
Existing compiled JS, CSS, images and exported RSC text assets remain available.
Direct requests to other HTML pages return 404; use the production host for
normal site navigation. Client navigation through exported RSC assets may work,
but a direct load or refresh of those public routes remains unavailable here.

## Required configuration

Inject these variables through the approved runtime's secret/environment
mechanism. The server intentionally does not load `.env.local` automatically.
Never use a `NEXT_PUBLIC_` variable for any credential, commit secret files,
include credentials in URLs, or paste secrets into logs or review documents.

| Variable | Requirement |
| --- | --- |
| `MICROCMS_SERVICE_DOMAIN` | Existing service's subdomain only, without scheme/path; server constructs the fixed `https://<service>.microcms.io` origin. |
| `MICROCMS_API_KEY` | Existing approved key with GET access to `with` and `blogs`; runtime only, never returned to the browser. |
| `PREVIEW_BASIC_USERNAME` | Approved preview access account; 1–128 characters, no colon or control characters. |
| `PREVIEW_BASIC_PASSWORD` | Approved preview credential; 16–512 characters, no control characters. |
| `PREVIEW_PUBLIC_ORIGIN` | Exact external HTTPS origin, e.g. `https://preview.example.test`; no trailing slash, path, query, fragment or credentials. |
| `PREVIEW_HOST` | Optional; default `127.0.0.1`. `0.0.0.0` is for an isolated container/private ingress only. |
| `PREVIEW_PORT` | Optional; default `3001`, integer 1–65535. |

Build the ordinary static site with its existing build configuration, inject
the preview runtime variables, and run `npm run preview:serve`. All required
variables and the `out/` directory must be valid or startup fails closed.
For loopback testing only, `PREVIEW_PUBLIC_ORIGIN=http://127.0.0.1:3001` is allowed
with a loopback bind. Tests use fake keys and never contact real microCMS.

An existing GET key plus the individual draft's `draftKey` is sufficient for
this request pattern according to the [microCMS content API documentation](https://document.microcms.io/content-api/get-content).
This implementation does not create an API key or enable broad draft retrieval.

## Hosting prerequisites

Choose and approve a separate preview hostname/runtime before hosting. S3 static
hosting alone cannot run this server. A trusted TLS reverse proxy must preserve
the external `Host` header exactly as the configured origin's host and forward
`Authorization`, `Origin` and `X-Preview-Request`. Expose only HTTPS at that proxy;
keep the Node HTTP port private. Configure its health probe to use an approved
authenticated request. There is intentionally no unauthenticated health route.

Disable proxy/CDN caching on **every** preview route and every status, including
static assets and errors, and retain the server's no-store and privacy headers.
Do not log Authorization headers, request bodies or full upstream request URLs.
The upstream draft request contains the token in its query string, so upstream
HTTP tracing and egress URL logging must also be disabled/redacted. Keep build
output immutable and owned by the deployment user; never put source files,
credentials or symlinks in `out/`. The runtime checks resolved paths, but a
concurrent privileged filesystem writer could race file checks and opening.

Rate limits are in-memory and keyed by socket peer: 240 total requests/minute,
30 failed authentication attempts/minute, and 60 authenticated preview API
requests/minute. `X-Forwarded-For` is deliberately ignored. Users behind the same
proxy therefore share one bucket; multiple runtime replicas have independent
buckets. Apply per-client and fleet-wide limits at the trusted ingress as needed.
The HTTP server creates no AWS services or permissions. The optional deployment
script below creates a dedicated Lambda stack only after its explicit manual run.

## microCMS screen preview configuration

After approval and hosting, open the existing service's `with` or `blogs` API
settings, choose screen preview, and use the appropriate destination URL with
the approved preview hostname. NEWS uses the plural endpoint `blogs`; WITH and
MEDIA share `with`:

```text
WITH: https://<preview-host>/preview/?endpoint=with&view=with&contentId={CONTENT_ID}#draftKey={DRAFT_KEY}
NEWS: https://<preview-host>/preview/?endpoint=blogs&view=news&contentId={CONTENT_ID}#draftKey={DRAFT_KEY}
MEDIA: https://<preview-host>/preview/?endpoint=with&view=media&contentId={CONTENT_ID}#draftKey={DRAFT_KEY}
```

One destination is configured per API. Choose WITH or MEDIA for the `with` API's
primary preview; changing the approved `view` manually can inspect its other
layout. Use each placeholder once. The [official screen preview guide](https://document.microcms.io/manual/screen-preview)
documents these replacements. Replacement within a URL fragment must still be
verified in the actual microCMS service; that service was not accessed here.
Keep the token in the fragment. The frontend rejects `draftKey` in the query,
holds it in page memory for requests, and clears the visible preview URL before
fetching. Leaving or reloading the page clears that page's retained token.

Sign into the browser's native Basic authentication dialog with the approved
preview account, save a draft, and test both an unpublished article and edits to
an already published article. Compare title, date, image, rich text and links
with the editor. `401` means preview authentication is required; `404` can mean
the content/token is unavailable; `502` can indicate API access, invalid upstream
data or network failure; `504` means the upstream timeout was reached. Errors
intentionally contain no upstream URL, key, token or original error body.

The application does not store credentials in cookies or browser storage.
Browsers can cache Basic authentication credentials for the browser session,
and this implementation has no logout endpoint. Use a separate/private browser
session and close that session after reviewing. Clearing the preview URL also
means reloading requires opening screen preview again from microCMS.

## API and security contract

- The only accepted endpoints are the reviewed server-side `with` and `blogs`
  allowlist entries. `view` is a frontend layout selector, never an upstream input.
  Request input cannot choose a service domain, protocol, upstream URL or query.
- Authenticated `POST /api/preview` requires the exact configured `Origin`,
  `Content-Type: application/json` (optional UTF-8 charset), and
  `X-Preview-Request: 1`. It accepts exactly three string fields:
  `{ "endpoint": "with", "contentId": "...", "draftKey": "..." }` (or `blogs`).
  Unknown fields, duplicates including escaped key equivalents, nested objects,
  query parameters and unsupported content encodings are rejected.
- `contentId` is restricted to ASCII letters, digits, `_` and `-`, 1–128
  characters. This is a local implementation bound, not a claim about the entire
  microCMS specification. `draftKey` is an opaque, untrimmed string of 1–512 UTF-16
  code units; C0/C1 controls and malformed surrogate sequences are forbidden.
- Request bodies are limited to 4 KiB. Draft response bodies are limited to
  2 MiB including streamed bodies, with a 10-second upstream timeout and no
  redirects or retry. The request explicitly disables upstream caching.
- Responses contain `{ "content": { ... } }` with the requested ID and only
  reviewed display fields from `site-config.mjs`. Unknown content/asset fields
  are removed and known field types are checked. `publishedAt` may be absent
  for unpublished articles; absent body content is returned as an empty string.
- All responses use private/no-store, no-referrer, noindex and nosniff headers.
  Static HTML uses a CSP with hashes for exported Next inline boot scripts,
  and reviewed layout scripts in the standalone preview shell only,
  same-origin scripts/API access, HTTPS images/media and Google font sources.
  Inline styles are permitted for existing designs. Frames/objects are blocked;
  CMS iframe embeds therefore require a separately reviewed policy change.
  HTML sanitization is also applied by the preview frontend before display.
- Static serving only uses the fixed `out/` root, reviewed asset extensions and
  resolved paths. Dotfiles, source-map extensions, source code extensions,
  traversal, Windows special paths and escaping symlinks/junctions are rejected.
  After resolving a requested file, HTML is additionally restricted to the
  canonical `out/preview/index.html` file; public article documents are denied.
- Request/response contents and unexpected errors are never logged by this
  runtime. Startup messages contain no supplied configuration values.

## Verification

Run `node --test preview/server.test.mjs` for the independent runtime suite, or
`npm run test:preview` for the combined runtime/frontend suite. The runtime suite
starts a local HTTP mock microCMS server and exercises unpublished and published
drafts, field selection, authentication, Origin/Host/JSON validation, duplicate
fields, input bounds, cache/privacy headers, inline-script CSP, path traversal,
public article HTML isolation, preview-shell aliases,
Windows junction/symlink escape, upstream errors/redirects/timeouts/size limits,
and authentication/API rate limits. No real microCMS or AWS access is performed.
Actual service credentials, draft substitution, TLS/proxy behavior and hosted
preview operation still require authorized environment verification.

Any `build:preview:mock` output is test fixture data only. It is suitable for
local visual QA and must never be deployed to the production or hosted preview
environment. Lambda uses the credential-free preview-only build described below.

## AWS Lambda deployment

`npm run build:preview:lambda` builds only the real preview route and its layout
in an isolated `.preview-lambda-build/` staging directory. It needs no CMS key,
fetches no articles, uses no mock content, and leaves the production `app/`,
Next configuration, and `out/` unchanged. WITH, MEDIA, and NEWS use the same
reviewed article components as production.

`npm run package:preview:lambda` packages the dedicated output and dependency-free
HTTP server. Only the preview HTML and required assets are included. Source maps,
other article HTML, environment files, dependencies, mock output, symlinks, and
oversized buffered responses are rejected or excluded. The ZIP has Linux file
permissions, and `run.sh` has LF line endings and execute permissions.

The `Deploy authenticated preview to Lambda` workflow is manual only. It does
not run on `main` pushes or CMS updates and does not deploy to production S3 or
invalidate CloudFront. Before its first run, the owner must approve creating
the `novolba-microcms-preview` CloudFormation stack in `us-east-1` with a dedicated
execution role, log group, Lambda Web Adapter layer, and Function URL.

Repository configuration, entered by the owner:

- Keep the existing `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
  `MICROCMS_SERVICE_DOMAIN`, and `MICROCMS_API_KEY` secrets. Their values are
  never downloaded or printed by the implementation.
- Add `PREVIEW_BASIC_USERNAME` and `PREVIEW_BASIC_PASSWORD` repository secrets.
  The password must have at least 16 characters. Do not send it in chat.
- Add the `PREVIEW_AWS_ACCOUNT_ID` repository variable for the approved AWS
  account. Deployment checks the active caller against this value first.
- The deployment credential needs CloudFormation, Lambda, IAM role/pass-role,
  and CloudWatch Logs management rights for this dedicated stack. Changing its
  existing permissions requires a separate review; do not broaden them silently.

Run `node preview/lambda/deploy.mjs` through the manual workflow. Secrets pass
to AWS CLI through stdin as CloudFormation `NoEcho` parameters; they are not
placed in CLI arguments or temporary files. CloudFormation and Lambda retain
the runtime secrets encrypted. Stack parameters and environment values must
never be exported into logs or screenshots.

Deployment first removes public invocation access, applies code and configuration,
then enables the exact Function URL origin. `AuthType: NONE` means AWS-level
invocation is public; the existing Basic authentication protects every HTTP
route. Both public invocation permissions are restricted to Function URL use.
Unsuccessful and unauthenticated invocations still count toward Lambda usage.
During an update, preview access can be temporarily unavailable.

The runtime uses Node.js 22, 512 MB memory, a 30-second timeout, standard
environment encryption, and a TCP readiness probe. Debug logging, active tracing,
VPC/NAT, provisioned concurrency, custom KMS keys, Secrets Manager, deployment
S3 buckets, and container registries are not added. Logs expire after 14 days.
Reserved concurrency is not configured. The observed us-east-1 account limit
is 10 concurrent executions, shared with existing functions; the deployment
does not request a quota increase. This is not a monthly cost cap.

After deployment, the workflow prints only the non-secret HTTPS origin. Configure
the `with` and `blogs` screen preview templates above with that origin, then verify
saved unpublished articles and saved edits to published articles in the actual
CMS. Do not treat a successful build or stack creation as live verification.
