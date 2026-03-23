import type { NextConfig } from "next";

/** Backend for Next.js rewrites (browser uses same-origin `/api/*`). */
const proxyTarget =
  process.env.STORIES_API_PROXY_TARGET?.replace(/\/$/, "") ||
  "http://127.0.0.1:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${proxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
