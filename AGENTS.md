<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## microCMS preview review scope

Read `workspace-spec.md` before continuing this work. Preserve the production static export, existing article presentation, and S3/CloudFront deployment workflow. Preview retrieval uses the separately authenticated Node server; keep microCMS keys and draft content out of public bundles, persistent browser storage, and logs.

The authorized review delivery is a commit/push to `codex/microcms-preview` and a draft PR targeting `main`. Do not push to or merge `main`, dispatch deployment workflows, change AWS resources/IAM, create credentials, or deploy mock `out/`. Never commit `.auth`, credential files, or local environment values.

Real microCMS preview-placeholder substitution, live draft data, and AWS hosting are not yet verified. Lambda packaging and deployment settings are not implemented. Existing unrelated lint violations remain outside this change.
