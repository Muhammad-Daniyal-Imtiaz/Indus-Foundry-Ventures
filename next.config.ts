import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for @libsql/isomorphic-ws not resolving properly for Cloudflare
      config.resolve.conditionNames = ["workerd", "worker", ...(config.resolve.conditionNames || [])];
      config.resolve.alias["@libsql/isomorphic-ws"] = require.resolve("@libsql/isomorphic-ws/web.mjs");
    }
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
