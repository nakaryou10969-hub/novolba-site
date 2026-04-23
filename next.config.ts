import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      // microCMS の画像
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
      },
      // WordPress の既存画像（本番）
      {
        protocol: "https",
        hostname: "novolba.com",
      },
      {
        protocol: "https",
        hostname: "www.novolba.com",
      },
      // WordPress の既存画像（開発環境）
      {
        protocol: "https",
        hostname: "dev.novolba.com",
      },
      // Notion の画像
      {
        protocol: "https",
        hostname: "novolba.notion.site",
      },
      {
        protocol: "https",
        hostname: "s3-us-west-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
