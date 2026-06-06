export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // ── CORS preflight ────────────────────────────────────────────────────────
    if (method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(request),
      });
    }

    // ── POST /purge — invalidate all cached search results ────────────────────
    // Called by the Pages app after creating/updating/deleting a job.
    if (method === "POST" && url.pathname === "/purge") {
      const auth = request.headers.get("authorization") || "";
      if (!env.PURGE_SECRET || auth !== `Bearer ${env.PURGE_SECRET}`) {
        return json({ success: false, error: "Unauthorized" }, 401, request);
      }
      const cur = await env.SEARCH_CACHE.get("cache_version");
      const next = String((parseInt(cur || "0") + 1) % 1_000_000);
      await env.SEARCH_CACHE.put("cache_version", next, { expirationTtl: 86400 * 30 });
      return json({ success: true, version: next }, 200, request);
    }

    // ── GET /search — search jobs (with KV cache) ────────────────────────────
    if (method === "GET" && url.pathname === "/search") {
      return handleSearch(request, url, env, ctx);
    }

    return new Response("Not Found — try GET /search?q=...", { status: 404 });
  },
};

// ── Types ────────────────────────────────────────────────────────────────────

interface Env {
  SEARCH_CACHE: KVNamespace;
  PAGES_URL: string;         // e.g. "https://indus-foundry-ventures.pages.dev"
  PURGE_SECRET: string;      // matches NEXTAUTH_SECRET
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
}

interface SearchResult {
  success: boolean;
  jobs: any[];
  nextCursor: string | null;
  totalEstimate?: number;
  meta?: { tookMs: number; cacheHit: boolean; matchCount: number };
}

// ── Search handler ────────────────────────────────────────────────────────────

async function handleSearch(
  request: Request,
  url: URL,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const start = Date.now();
  const q = url.searchParams.get("q")?.trim() || "";
  const pageSize = Math.min(parseInt(url.searchParams.get("pageSize") || "20"), 50);
  const cursor = url.searchParams.get("cursor") || "";

  if (!q) {
    return json({ success: true, jobs: [], nextCursor: null, meta: { tookMs: 0, cacheHit: false, matchCount: 0 } }, 200, request);
  }

  // ── Cache key: versioned so one /purge invalidates everything ───────────────
  const version = await env.SEARCH_CACHE.get("cache_version").then(v => v || "0");
  const filterStr = serializeFilters(url);
  const key = `search:jobs:v${version}:${hash(q)}:${hash(filterStr)}:${hash(cursor)}`;

  // ── Cache hit ───────────────────────────────────────────────────────────────
  const cached = await env.SEARCH_CACHE.get(key);
  if (cached) {
    return json(JSON.parse(cached), 200, request, "HIT");
  }

  // ── Cache miss → proxy to Pages API ─────────────────────────────────────────
  if (!env.PAGES_URL || !env.PURGE_SECRET) {
    return json({ success: false, jobs: [], nextCursor: null, error: "Worker not configured: PAGES_URL and PURGE_SECRET required" }, 500, request);
  }

  const pagesUrl = new URL(`${env.PAGES_URL}/api/jobs/search`);
  pagesUrl.searchParams.set("q", q);
  pagesUrl.searchParams.set("pageSize", String(pageSize));
  if (cursor) pagesUrl.searchParams.set("cursor", cursor);
  for (const p of ["industry", "experienceLevel", "employmentType", "locationType", "salaryMin", "salaryMax"]) {
    const v = url.searchParams.get(p);
    if (v) pagesUrl.searchParams.set(p, v);
  }

  const proxyRes = await fetch(pagesUrl.toString(), {
    headers: { "User-Agent": "SearchCacheWorker/1.0" },
  });

  const body: SearchResult = await proxyRes.json();
  body.meta = { ...body.meta, cacheHit: false, tookMs: Date.now() - start };

  // ── Cache the result for 10 minutes ─────────────────────────────────────────
  if (proxyRes.ok && body.success && body.jobs?.length > 0) {
    ctx.waitUntil(
      env.SEARCH_CACHE.put(key, JSON.stringify(body), { expirationTtl: 600 }),
    );
  }

  return json(body, proxyRes.status, request, "MISS");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function serializeFilters(url: URL): string {
  const parts: string[] = [];
  for (const p of ["industry", "experienceLevel", "employmentType", "locationType", "salaryMin", "salaryMax"]) {
    const v = url.searchParams.get(p);
    if (v) parts.push(`${p}=${v}`);
  }
  return parts.sort().join("&");
}

function hash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

function json(data: any, status: number, request: Request, cacheStatus?: string): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  if (cacheStatus) headers["X-Cache"] = cacheStatus;
  return new Response(JSON.stringify(data), { status, headers });
}

function corsHeaders(request: Request): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}
