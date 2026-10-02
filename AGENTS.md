<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## microCMS preview review scope

Read `workspace-spec.md` before continuing this work. Preserve the production static export, existing article presentation, and S3/CloudFront deployment workflow. Preview retrieval uses the separately authenticated Node server; keep microCMS keys and draft content out of public bundles, persistent browser storage, and logs.

The authorized review delivery is a commit/push to `codex/microcms-preview` and a draft PR targeting `main`. Do not push to or merge `main`, dispatch deployment workflows, change AWS resources/IAM, create credentials, or deploy mock `out/`. Never commit `.auth`, credential files, or local environment values.

Real microCMS preview-placeholder substitution, live draft data, and AWS hosting are not yet verified. Lambda packaging and deployment settings are not implemented. Existing unrelated lint violations remain outside this change.

## AWS preview implementation authorized on 2026-10-02

The user's later instruction authorizes implementation of the dedicated Lambda
preview. Read the appended requirements in `workspace-spec.md`. Work on
`codex/aws-microcms-preview`, preserve the production workflow, and use a separate
manual preview deployment workflow. The previous review-only scope applies to
the original implementation stage, not this newly authorized code work.

Complete tests and packaging before live deployment. Creating the dedicated IAM
role and public Function URL permissions through browser actions still requires
the concrete action-time confirmation. Never retrieve secret values; the owner
enters new Basic authentication secrets. Keep mock builds out of hosted previews.

## Passwordless preview authorized on 2026-10-02
The latest user approval replaces Basic authentication with article-specific draftKey links. No new Basic secrets are required. Keep all other restrictions and fail closed if upstream does not reject a nonmatching draftKey. Read the appended workspace requirements.
