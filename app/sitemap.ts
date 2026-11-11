import type { MetadataRoute } from "next";
import { client, type Blog, type Category, type WithArticle } from "../libs/client";
import { getMediaArticlePath, getNewsArticlePath } from "../libs/articlePath";
import { CATEGORY_SLUG_MAP } from "./media/constants";

// Built once per deploy; the microCMS webhook redeploy keeps it current.
export const dynamic = "force-static";

const SITE_URL = "https://novolba.com";

// Public pages. Excluded on purpose: /preview/ (draft review), the legacy
// /service/kaitori-oodasukari/ redirect, and the /with/ duplicates of /media/.
const STATIC_PATHS = [
  "/",
  "/company/",
  "/message/",
  "/service/",
  "/service/kagu-hodai/",
  "/service/kagu-hodai/furniture/",
  "/service/basic-office/",
  "/service/basic-office/offices/",
  "/service/novolba-buddy/",
  "/service/kaitori-daisuke/",
  "/faq/",
  "/inquiry/",
  "/news/",
  "/news/all/",
  "/media/",
  "/media/all/",
  "/media/about/",
];

type Endpoint = "blogs" | "with";

async function fetchAll<T>(endpoint: Endpoint): Promise<T[]> {
  const first = await client.getList<T>({
    endpoint,
    queries: { limit: 100, offset: 0, orders: "-publishedAt" },
  });
  let all = first.contents;
  for (let offset = 100; offset < first.totalCount; offset += 100) {
    const next = await client.getList<T>({
      endpoint,
      queries: { limit: 100, offset, orders: "-publishedAt" },
    });
    all = [...all, ...next.contents];
  }
  return all;
}

function toUrl(path: string) {
  return `${SITE_URL}${encodeURI(path)}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, mediaArticles, newsCategories] = await Promise.all([
    fetchAll<Blog>("blogs"),
    fetchAll<WithArticle>("with"),
    client.getList<Category>({ endpoint: "categories", queries: { limit: 20 } }),
  ]);

  return [
    ...STATIC_PATHS.map((path) => ({ url: toUrl(path) })),
    ...newsCategories.contents.map((category) => ({ url: toUrl(`/news/category/${category.id}/`) })),
    ...Object.values(CATEGORY_SLUG_MAP).map((slug) => ({ url: toUrl(`/media/category/${slug}/`) })),
    ...blogs.map((blog) => ({
      url: toUrl(getNewsArticlePath(blog)),
      lastModified: blog.revisedAt || blog.updatedAt,
    })),
    ...mediaArticles.map((article) => ({
      url: toUrl(getMediaArticlePath(article)),
      lastModified: article.revisedAt || article.updatedAt,
    })),
  ];
}
