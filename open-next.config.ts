import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({
  // cloudflare overrides here
});

// Override the cloudflare settings to disable workerd condition
// This prevents @libsql/isomorphic-ws from resolving to web.mjs (which doesn't exist)
(config as any).cloudflare = {
  ...(config as any).cloudflare,
  useWorkerdCondition: false,
};

export default config;
