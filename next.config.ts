import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // microCMS の画像
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
      },
      // WordPress の既存画像
      {
        protocol: "https",
        hostname: "novolba.com",
      },
      {
        protocol: "https",
        hostname: "www.novolba.com",
      },
    ],
  },
};

export default nextConfig;
