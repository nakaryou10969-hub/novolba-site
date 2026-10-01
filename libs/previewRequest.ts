export type PreviewEndpoint = "with" | "blogs";
export type PreviewView = "with" | "media" | "news";
export type PreviewRequest = {
  endpoint: PreviewEndpoint;
  view: PreviewView;
  contentId: string;
  draftKey: string;
};

const CONTENT_ID = /^[A-Za-z0-9_-]{1,128}$/;

function validDraftKey(value: string) {
  return value.length >= 1 && value.length <= 512
    && !/[\u0000-\u001f\u007f-\u009f]/.test(value)
    && !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(value);
}

function exactParameters(value: string, allowed: string[]) {
  const parameters = new URLSearchParams(value);
  for (const key of parameters.keys()) {
    if (!allowed.includes(key) || parameters.getAll(key).length !== 1) throw new Error("Invalid preview URL");
  }
  if (allowed.some((key) => !parameters.has(key))) throw new Error("Invalid preview URL");
  return parameters;
}

/** draftKey is accepted only in the fragment, which is never sent in HTTP URLs. */
export function parsePreviewLocation(search: string, hash: string): PreviewRequest {
  if (search.length > 1024 || hash.length > 8192) throw new Error("Invalid preview URL");
  const query = exactParameters(search, ["endpoint", "contentId", "view"]);
  const fragment = exactParameters(hash.replace(/^#/, ""), ["draftKey"]);
  const endpoint = query.get("endpoint");
  const view = query.get("view");
  const contentId = query.get("contentId") ?? "";
  const draftKey = fragment.get("draftKey") ?? "";
  if (!CONTENT_ID.test(contentId) || !validDraftKey(draftKey)) throw new Error("Invalid preview URL");
  if (!((endpoint === "with" && (view === "with" || view === "media")) || (endpoint === "blogs" && view === "news"))) {
    throw new Error("Invalid preview URL");
  }
  return { endpoint: endpoint as PreviewEndpoint, view: view as PreviewView, contentId, draftKey };
}
