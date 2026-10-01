// The NEWS API is "blogs"; WITH and MEDIA share the "with" API.
// These are reviewed server-side constants, never request-supplied URLs.
export const SITE = Object.freeze({
  name: "NovolBa",
  endpoints: Object.freeze(["with", "blogs"]),
  fields: Object.freeze([
    "id", "title", "content", "slug", "author", "pickup", "category", "eyecatch",
    "createdAt", "updatedAt", "publishedAt", "revisedAt",
  ]),
});
