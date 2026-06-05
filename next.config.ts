import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Fix for @libsql/isomorphic-ws not resolving properly for Cloudflare
      config.resolve.conditionNames = ["workerd", "worker", ...(config.resolve.conditionNames || [])];
      
      // Alias @libsql/isomorphic-ws directly to web.mjs
      config.resolve.alias["@libsql/isomorphic-ws"] = path.resolve(
        process.cwd(),
        "node_modules/@libsql/isomorphic-ws/web.mjs"
      );

      // Also ensure we handle .mjs files correctly
      config.resolve.extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ...(config.resolve.extensions || [])];
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
