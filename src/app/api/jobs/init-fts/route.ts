/**
 * POST /api/jobs/init-fts
 * One-time bootstrap: creates the FTS5 table and populates it from job_postings.
 * Secured by NEXTAUTH_SECRET (pass as Bearer token).
 * Call once after first deploy: curl -X POST https://yourdomain.com/api/jobs/init-fts -H "Authorization: Bearer <NEXTAUTH_SECRET>"
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureFtsIndex } from "@/db/search-schema";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "").trim();

  if (!process.env.NEXTAUTH_SECRET || token !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureFtsIndex(db);
    const res = await db.execute(`SELECT count(*) AS cnt FROM jobs_fts`);
    const cnt = res.rows?.[0]?.cnt ?? 0;
    return NextResponse.json({ success: true, indexedRows: cnt });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
