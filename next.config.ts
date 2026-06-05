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
  },
  // Mark @libsql/client as external so it isn’t bundled for the edge worker
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Preserve any existing externals and add libsql client
      config.externals = [...(config.externals ?? []), "@libsql/client"];
    }
    return config;
  },
};

export default nextConfig;
