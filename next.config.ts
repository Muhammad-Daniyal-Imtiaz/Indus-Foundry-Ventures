import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    cacheLife: {
      feed: { revalidate: 300, expire: 3600 },
      marketplace: { revalidate: 600, expire: 7200 },
      challenges: { revalidate: 300, expire: 3600 },
      freelance: { revalidate: 600, expire: 7200 },
      companies: { revalidate: 600, expire: 7200 },
      jobs: { revalidate: 600, expire: 7200 },
      users: { revalidate: 300, expire: 3600 },
      network: { revalidate: 120, expire: 1800 },
    },
  },
  serverExternalPackages: [
    "@libsql/client",
    "@libsql/hrana-client",
    "@libsql/isomorphic-ws",
    "@libsql/isomorphic-fetch",
    "libsql",
    "openid-client",
    "@panva/oauth4webapi",
    "jose",
  ],
};

export default nextConfig;
