import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // World HTML is immutable per deploy and is the slow part of a slug
        // page (the iframe waits on it). Let the browser keep it around so a
        // return visit, or a hover-prefetch from the grid, is a cache hit.
        source: "/tests/:slug/:file.html",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
