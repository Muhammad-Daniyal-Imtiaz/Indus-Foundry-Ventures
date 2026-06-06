import { NextRequest, NextResponse } from "next/server";
import { searchJobs, rebuildSearchIndex } from "@/lib/search";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const start = Date.now();
  const { searchParams } = new URL(request.url);

  try {
    const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
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
        success: true, jobs: [], nextCursor: null,
        meta: { tookMs: Date.now() - start, cacheHit: false, matchCount: 0 },
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

    return NextResponse.json({
      success: true,
      jobs: result.jobs,
      nextCursor: result.nextCursor,
      totalEstimate: result.totalEstimate,
      meta: { tookMs: Date.now() - start, cacheHit: false, matchCount: result.jobs.length },
    });
  } catch (err: any) {
    console.error("Job search error:", err);
    try { await rebuildSearchIndex(); } catch { }
    return NextResponse.json(
      { success: false, jobs: [], nextCursor: null, error: err.message || "Search failed" },
      { status: 500 }
    );
  }
}
