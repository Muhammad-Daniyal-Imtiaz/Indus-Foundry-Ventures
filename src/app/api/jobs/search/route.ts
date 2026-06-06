import { NextRequest, NextResponse } from "next/server";
import { searchJobs, rebuildSearchIndex } from "@/lib/search";
import { generateSearchKey, getCachedResult, setCachedResult } from "@/lib/cache";
import { checkRateLimit } from "@/lib/rate-limit";

// NOTE: Do NOT use edge runtime here — this route uses Node.js APIs (Turso DB, KV cache)
// OpenNext requires edge routes to be in a separate function config.
// Runs in the default Node.js / Cloudflare Workers (Node compat) runtime.

function getClientIp(request: NextRequest): string {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
}

export async function GET(request: NextRequest) {
  const start = Date.now();
  const { searchParams } = new URL(request.url);

  try {
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`search:${clientIp}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Try again shortly." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateCheck.retryAfter || 60),
            "Retry-After": String(rateCheck.retryAfter || 60),
          },
        }
      );
    }

    const q = searchParams.get("q")?.trim() || "";
    const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "20"), 1), 50);
    const cursor = searchParams.get("cursor") || undefined;

    if (!q) {
      return NextResponse.json({
        success: true,
        jobs: [],
        nextCursor: null,
        meta: { tookMs: Date.now() - start, cacheHit: false, matchCount: 0 },
      });
    }

    const cacheKey = await generateSearchKey({
      query: q,
      cursor,
      filters: {
        industry: searchParams.get("industry") || "",
        experienceLevel: searchParams.get("experienceLevel") || "",
        employmentType: searchParams.get("employmentType") || "",
        locationType: searchParams.get("locationType") || "",
        salaryMin: searchParams.get("salaryMin") || "",
        salaryMax: searchParams.get("salaryMax") || "",
      },
    });

    const cached = await getCachedResult(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        jobs: cached.jobs,
        nextCursor: cached.cursor || null,
        meta: { tookMs: Date.now() - start, cacheHit: true, matchCount: cached.jobs.length },
      });
    }

    const result = await searchJobs({
      query: q,
      location: searchParams.get("location") || undefined,
      industry: searchParams.get("industry") || undefined,
      employmentType: searchParams.get("employmentType") || undefined,
      experienceLevel: searchParams.get("experienceLevel") || undefined,
      locationType: searchParams.get("locationType") || undefined,
      salaryMin: searchParams.get("salaryMin") ? parseInt(searchParams.get("salaryMin")!) : undefined,
      salaryMax: searchParams.get("salaryMax") ? parseInt(searchParams.get("salaryMax")!) : undefined,
      cursor,
      pageSize,
    });

    await setCachedResult(cacheKey, {
      jobs: result.jobs,
      total: result.totalEstimate,
      cursor: result.nextCursor || undefined,
    }, 600);

    return NextResponse.json({
      success: true,
      jobs: result.jobs,
      nextCursor: result.nextCursor,
      totalEstimate: result.totalEstimate,
      meta: {
        tookMs: Date.now() - start,
        cacheHit: result.meta?.cacheHit || false,
        matchCount: result.jobs.length,
      },
    });
  } catch (err: any) {
    console.error("Job search error:", err);

    try {
      await rebuildSearchIndex();
    } catch {
      // index rebuild failed silently
    }

    return NextResponse.json(
      { success: false, jobs: [], nextCursor: null, error: err.message || "Search failed" },
      { status: 500 }
    );
  }
}
