import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface SearchResult {
  jobs: any[];
  total: number;
  cursor?: string;
  facets?: Record<string, Record<string, number>>;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, string>;
  cursor?: string;
  [key: string]: unknown;
}

async function hash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
}

function normalizedParams(params: SearchParams): string {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(params).sort()) {
    const val = params[key];
    if (typeof val === "string") {
      sorted[key] = val.toLowerCase();
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      const lower: Record<string, string> = {};
      for (const k of Object.keys(val as Record<string, string>).sort()) {
        lower[k] = (val as Record<string, string>)[k].toLowerCase();
      }
      sorted[key] = lower;
    } else {
      sorted[key] = val;
    }
  }
  return JSON.stringify(sorted);
}

export function getCacheKey(params: {
  query: string;
  filters?: Record<string, string>;
  cursor?: string;
}): string {
  const query = params.query.toLowerCase();
  const filters = params.filters ? JSON.stringify(Object.keys(params.filters).sort().reduce((acc: Record<string, string>, k: string) => {
    acc[k] = params.filters![k];
    return acc;
  }, {})) : "{}";
  const cursor = params.cursor || "first";
  return `search:jobs:v1:${query}:${filters}:${cursor}`;
}

export async function getCachedResult(key: string): Promise<SearchResult | null> {
  try {
    const ctx = getCloudflareContext();
    if (!ctx.env?.SEARCH_CACHE) return null;
    const cached = await ctx.env.SEARCH_CACHE.get(key);
    if (!cached) return null;
    return JSON.parse(cached) as SearchResult;
  } catch {
    return null;
  }
}

export async function setCachedResult(key: string, result: SearchResult, ttl = 600): Promise<void> {
  try {
    const ctx = getCloudflareContext();
    if (!ctx.env?.SEARCH_CACHE) return;
    await ctx.env.SEARCH_CACHE.put(key, JSON.stringify(result), { expirationTtl: ttl });
  } catch {
    // silently fail outside Cloudflare env
  }
}

export async function invalidateSearchCache(jobId?: string): Promise<void> {
  try {
    const ctx = getCloudflareContext();
    if (!ctx.env?.SEARCH_CACHE) return;
    if (jobId) {
      let cursor: string | undefined;
      do {
        const listed = await ctx.env.SEARCH_CACHE.list({ prefix: "search:jobs:v1:*", cursor });
        for (const key of listed.keys) {
          await ctx.env.SEARCH_CACHE.delete(key.name);
        }
        cursor = listed.list_complete ? undefined : listed.cursor;
      } while (cursor);
    }
    const version = await getCacheVersion();
    await ctx.env.SEARCH_CACHE.put("search:jobs:cache_version", String(version + 1));
  } catch {
    // silently fail outside Cloudflare env
  }
}

export async function getCacheVersion(): Promise<number> {
  try {
    const ctx = getCloudflareContext();
    if (!ctx.env?.SEARCH_CACHE) return 0;
    const version = await ctx.env.SEARCH_CACHE.get("search:jobs:cache_version");
    return version ? parseInt(version, 10) : 0;
  } catch {
    return 0;
  }
}

export async function generateSearchKey(params: SearchParams): Promise<string> {
  const version = await getCacheVersion();
  const hashVal = await hash(normalizedParams(params));
  return `search:jobs:v${version}:${hashVal}`;
}
