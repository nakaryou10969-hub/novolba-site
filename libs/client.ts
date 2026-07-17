import { createClient } from "microcms-js-sdk";
import { mirrorMicrocmsAssetsInValue } from "./microcmsAssets";

if (!process.env.MICROCMS_SERVICE_DOMAIN) {
  throw new Error("MICROCMS_SERVICE_DOMAIN is not defined in .env.local");
}
if (!process.env.MICROCMS_API_KEY) {
  throw new Error("MICROCMS_API_KEY is not defined in .env.local");
}

const rawClient = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

type NextRequestInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

function withFreshMicrocmsData<T>(args: T): T {
  const requestArgs = args as T & { customRequestInit?: NextRequestInit };
  return {
    ...requestArgs,
    customRequestInit: {
      ...requestArgs.customRequestInit,
      next: {
        ...requestArgs.customRequestInit?.next,
        revalidate: 1,
      },
    },
  } as T;
}

async function requestWithRetry<T>(request: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      if (attempt === 2) break;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  throw lastError;
}

export const client: typeof rawClient = {
  ...rawClient,
  async get(args) {
    return mirrorMicrocmsAssetsInValue(await requestWithRetry(() => rawClient.get(withFreshMicrocmsData(args))));
  },
  async getList(args) {
    return mirrorMicrocmsAssetsInValue(await requestWithRetry(() => rawClient.getList(withFreshMicrocmsData(args))));
  },
  async getListDetail(args) {
    return mirrorMicrocmsAssetsInValue(await requestWithRetry(() => rawClient.getListDetail(withFreshMicrocmsData(args))));
  },
};

// ---- 型定義 ----

export type Blog = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  content: string;
  slug?: string;
  author?: string;
  pickup?: boolean;
  eyecatch?: {
    url: string;
    height: number;
    width: number;
  };
  category?: {
    id: string;
    name: string;
  };
};

// with APIの記事型（categoryはセレクトフィールド=文字列）
export type WithArticle = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  content: string;
  slug?: string;
  author?: string;
  pickup?: boolean;
  category?: string;
  eyecatch?: {
    url: string;
    height: number;
    width: number;
  };
};

export type Service = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  description: string;
  image?: {
    url: string;
    height: number;
    width: number;
  };
  bullets?: string[];
};

export type Category = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  name: string;
};

export type MicroCMSListResponse<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};
