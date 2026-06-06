/**
 * Edge-cached search results via Cloudflare KV (SEARCH_CACHE binding).
 * Gracefully degrades to no-cache when running outside Cloudflare (local dev).
 */

export interface SearchResult {
  jobs: any[];
  total: number;
  cursor?: string;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, string>;
  cursor?: string;
  [key: string]: unknown;
}

// ── helpers ─────────────────────────────────────────────────────────────────

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

function normalise(params: SearchParams): string {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(params).sort()) {
    const v = params[key];
    if (typeof v === "string") {
      out[key] = v.toLowerCase();
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      const inner: Record<string, string> = {};
      for (const k of Object.keys(v as Record<string, string>).sort()) {
        inner[k] = (v as Record<string, string>)[k]?.toLowerCase() ?? "";
      }
      out[key] = inner;
    } else {
      out[key] = v;
    }
  }
  return JSON.stringify(out);
}

// ── KV accessor — safe in Node.js & workerd ─────────────────────────────────

function getKV(): KVNamespace | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    return ctx?.env?.SEARCH_CACHE ?? null;
  } catch {
    return null;
  }
}

// ── public API ───────────────────────────────────────────────────────────────

export async function generateSearchKey(params: SearchParams): Promise<string> {
  const version = await getCacheVersion();
  const h = await sha256(normalise(params));
  return `search:jobs:v${version}:${h}`;
}

export async function getCachedResult(key: string): Promise<SearchResult | null> {
  try {
    const kv = getKV();
    if (!kv) return null;
    const raw = await kv.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as SearchResult;
  } catch {
    return null;
  }
}

export async function setCachedResult(key: string, result: SearchResult, ttl = 600): Promise<void> {
  try {
    const kv = getKV();
    if (!kv) return;
    await kv.put(key, JSON.stringify(result), { expirationTtl: ttl });
  } catch {
    // non-fatal
  }
}

export async function invalidateSearchCache(): Promise<void> {
  try {
    const kv = getKV();
    if (!kv) return;
    const cur = await getCacheVersion();
    await kv.put("search:jobs:cache_version", String(cur + 1), { expirationTtl: 86400 * 30 });
  } catch {
    // non-fatal
  }
}

export async function getCacheVersion(): Promise<number> {
  try {
    const kv = getKV();
    if (!kv) return 0;
    const v = await kv.get("search:jobs:cache_version");
    return v ? parseInt(v, 10) : 0;
  } catch {
    return 0;
  }
}
