import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { client, type Blog } from "../../../libs/client";
import { extractFirstImage } from "../../../libs/extractFirstImage";
import { getArticleStaticParamIds, toArticleRouteKeyCandidates } from "../../../libs/articlePath";
import NewsArticleView from "../../components/NewsArticleView";

type Props = {
  params: Promise<{ id: string }>;
};

let allBlogsPromise: Promise<Blog[]> | null = null;

async function fetchAllBlogs(): Promise<Blog[]> {
  const first = await client.getList<Blog>({
    endpoint: "blogs",
    queries: { limit: 100, offset: 0, orders: "-publishedAt" },
  });
  let all = first.contents;
  for (let offset = 100; offset < first.totalCount; offset += 100) {
    const next = await client.getList<Blog>({
      endpoint: "blogs",
      queries: { limit: 100, offset, orders: "-publishedAt" },
    });
    all = [...all, ...next.contents];
  }
  return all;
}

function getAllBlogs(): Promise<Blog[]> {
  allBlogsPromise ??= fetchAllBlogs();
  return allBlogsPromise;
}

async function getBlogByIdOrSlug(idOrSlug: string): Promise<Blog | null> {
  const all = await getAllBlogs();
  const idOrSlugCandidates = toArticleRouteKeyCandidates(idOrSlug);
  return all.find((item) => {
    const blogCandidates = toArticleRouteKeyCandidates(item.slug || item.id);
    return item.id === idOrSlug || [...blogCandidates].some((candidate) => idOrSlugCandidates.has(candidate));
  }) ?? null;
}

export async function generateStaticParams() {
  const all = await getAllBlogs();
  return all.flatMap(getArticleStaticParamIds);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const blog = await getBlogByIdOrSlug(id);
  if (blog) {
    const firstImage = extractFirstImage(blog.content);
    return {
      title: `${blog.title} | NEWS | NovolBa`,
      description: blog.title,
      openGraph: {
        title: blog.title,
        images: blog.eyecatch?.url
          ? [blog.eyecatch.url]
          : firstImage
          ? [firstImage]
        : [],
      },
    };
  }
  return { title: "記事が見つかりません | NovolBa" };
}

async function getLatestBlogs(excludeId: string): Promise<Blog[]> {
  const all = await getAllBlogs();
  return all.filter((blog) => blog.id !== excludeId).slice(0, 5);
}

async function getRelatedBlogs(blog: Blog): Promise<Blog[]> {
  if (!blog.category) return [];
  const all = await getAllBlogs();
  return all
    .filter((candidate) => candidate.id !== blog.id && candidate.category?.id === blog.category?.id)
    .slice(0, 3);
}

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params;

  const resolvedBlog = await getBlogByIdOrSlug(id);
  if (!resolvedBlog) {
    notFound();
  }
  const blog = resolvedBlog;

  const [latestBlogsData, relatedBlogs] = await Promise.all([
    getLatestBlogs(blog.id),
    getRelatedBlogs(blog),
  ]);

  const latestBlogs = latestBlogsData;
  return <NewsArticleView blog={blog} latestBlogs={latestBlogs} relatedBlogs={relatedBlogs} />;
}
