/**
 * FTS5-based job search on Turso/libSQL.
 * Uses SQLite FTS5 with porter + unicode61 tokenizer for BM25 ranking.
 * Cursor pagination via base64-encoded (rank,id) tuples — no Buffer (workerd safe).
 */

import { sql } from "drizzle-orm";
import { db } from "@/db";

export interface SearchParams {
  query: string;
  location?: string;
  industry?: string;
  employmentType?: string;
  experienceLevel?: string;
  locationType?: string;
  salaryMin?: number;
  salaryMax?: number;
  remote?: boolean;
  cursor?: string;
  pageSize?: number;
}

export interface JobResult {
  id: string;
  title: string;
  description: string;
  companyName: string;
  companyLogo: string | null;
  companySlug: string | null;
  companyPageId: string | null;
  location: string;
  locationType: string;
  employmentType: string;
  experienceLevel: string;
  industry: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
  skills: string[];
  requirements: string[];
  benefits: string[];
  isOpen: boolean;
  isFeatured: boolean;
  applicationsCount: number;
  viewsCount: number;
  createdAt: string;
  rank?: number;
}

export interface SearchResult {
  jobs: JobResult[];
  nextCursor: string | null;
  totalEstimate: number;
  meta: { tookMs: number; cacheHit: boolean; matchCount: number };
}

// ── cursor encode/decode (workerd-safe, no Buffer) ───────────────────────────

function encodeCursor(rank: number, id: string): string {
  return btoa(`${rank},${id}`);
}

function decodeCursor(cursor: string): { rank: number; id: string } | null {
  try {
    const [rankStr, id] = atob(cursor).split(",");
    return { rank: parseFloat(rankStr), id };
  } catch {
    return null;
  }
}

// ── row mapper ───────────────────────────────────────────────────────────────

function mapRow(row: Record<string, any>): JobResult {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    companyName: row.company_name,
    companyLogo: row.company_logo ?? null,
    companySlug: row.company_slug ?? null,
    companyPageId: row.company_page_id ?? null,
    location: row.location,
    locationType: row.location_type,
    employmentType: row.employment_type,
    experienceLevel: row.experience_level,
    industry: row.industry,
    salaryMin: row.salary_min ?? null,
    salaryMax: row.salary_max ?? null,
    salaryCurrency: row.salary_currency ?? "PKR",
    salaryPeriod: row.salary_period ?? "Monthly",
    skills: tryParse(row.skills_json),
    requirements: tryParse(row.requirements_json),
    benefits: tryParse(row.benefits_json),
    isOpen: Boolean(row.is_open),
    isFeatured: Boolean(row.is_featured),
    applicationsCount: row.applications_count ?? 0,
    viewsCount: row.views_count ?? 0,
    createdAt: row.created_at ?? "",
    rank: row.rank,
  };
}

function tryParse(val: any): string[] {
  if (!val) return [];
  try { return JSON.parse(val) as string[]; } catch { return []; }
}

// ── sanitise FTS query (prevent injection / empty match) ────────────────────

function sanitiseFtsQuery(q: string): string {
  // Strip characters that could break FTS5 syntax; wrap in quotes for exact phrase
  const safe = q.trim().replace(/["*]/g, "").slice(0, 200);
  if (!safe) return "";
  // Allow multi-word prefix search: "machine learning" → machine* learning*
  return safe.split(/\s+/).filter(Boolean).map(w => `${w}*`).join(" ");
}

// ── main search ──────────────────────────────────────────────────────────────

export async function searchJobs(params: SearchParams): Promise<SearchResult> {
  const start = Date.now();
  const pageSize = Math.min(params.pageSize ?? 20, 50);

  const ftsQuery = sanitiseFtsQuery(params.query);
  if (!ftsQuery) {
    return { jobs: [], nextCursor: null, totalEstimate: 0, meta: { tookMs: 0, cacheHit: false, matchCount: 0 } };
  }

  // Build WHERE clause pieces as raw SQL strings (libsql/drizzle doesn't support
  // complex parameterised sql.join in all versions — we sanitise inputs manually)
  const filters: string[] = ["jp.is_open = 1"];

  if (params.industry)        filters.push(`jp.industry = '${params.industry.replace(/'/g, "''")}'`);
  if (params.employmentType)  filters.push(`jp.employment_type = '${params.employmentType.replace(/'/g, "''")}'`);
  if (params.experienceLevel) filters.push(`jp.experience_level = '${params.experienceLevel.replace(/'/g, "''")}'`);
  if (params.locationType)    filters.push(`jp.location_type = '${params.locationType.replace(/'/g, "''")}'`);
  if (params.remote)          filters.push(`jp.location_type = 'Remote'`);
  if (params.location)        filters.push(`jp.location LIKE '%${params.location.replace(/'/g, "''").replace(/[%_]/g, "\\$&")}%' ESCAPE '\\'`);
  if (params.salaryMin != null) filters.push(`(jp.salary_max IS NULL OR jp.salary_max >= ${params.salaryMin})`);
  if (params.salaryMax != null) filters.push(`(jp.salary_min IS NULL OR jp.salary_min <= ${params.salaryMax})`);

  // Cursor: keyset on (rank ASC, id ASC) — FTS5 rank is negative (lower = better)
  let cursorClause = "";
  if (params.cursor) {
    const dec = decodeCursor(params.cursor);
    if (dec) {
      cursorClause = `AND (rank > ${dec.rank} OR (rank = ${dec.rank} AND jp.id > '${dec.id.replace(/'/g, "''")}'))`;
    }
  }

  const whereStr = filters.join(" AND ");

  // Data query
  const dataSQL = `
    SELECT jobs_fts.rank, jp.*
    FROM jobs_fts
    JOIN job_postings jp ON jp.rowid = jobs_fts.rowid
    WHERE jobs_fts MATCH '${ftsQuery.replace(/'/g, "''")}'
      AND ${whereStr}
      ${cursorClause}
    ORDER BY rank ASC, jp.id ASC
    LIMIT ${pageSize + 1}
  `;

  // Count query (approximate — omit cursor for total)
  const countSQL = `
    SELECT count(*) AS total
    FROM jobs_fts
    JOIN job_postings jp ON jp.rowid = jobs_fts.rowid
    WHERE jobs_fts MATCH '${ftsQuery.replace(/'/g, "''")}'
      AND ${whereStr}
  `;

  const [dataRows, countRows] = await Promise.all([
    db.execute(dataSQL) as Promise<{ rows: Record<string, any>[] }>,
    db.execute(countSQL) as Promise<{ rows: Record<string, any>[] }>,
  ]);

  const rows = dataRows.rows ?? [];
  const hasMore = rows.length > pageSize;
  if (hasMore) rows.pop();

  let nextCursor: string | null = null;
  if (hasMore && rows.length > 0) {
    const last = rows[rows.length - 1];
    nextCursor = encodeCursor(last.rank as number, last.id as string);
  }

  const total = (countRows.rows?.[0]?.total as number) ?? 0;

  return {
    jobs: rows.map(mapRow),
    nextCursor,
    totalEstimate: total,
    meta: { tookMs: Date.now() - start, cacheHit: false, matchCount: rows.length },
  };
}

export async function rebuildSearchIndex(): Promise<void> {
  await db.execute(`INSERT INTO jobs_fts(jobs_fts) VALUES('rebuild')`);
}
