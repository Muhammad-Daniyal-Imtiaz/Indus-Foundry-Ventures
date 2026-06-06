import { sql } from "drizzle-orm";
import { db } from "@/db";
import { REBUILD_JOBS_FTS_SQL } from "@/db/search-schema";

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

export interface SearchResult {
  jobs: JobResult[];
  nextCursor: string | null;
  totalEstimate: number;
  meta: {
    tookMs: number;
    cacheHit: boolean;
    matchCount: number;
  };
}

export interface JobResult {
  id: string;
  title: string;
  description: string;
  companyName: string;
  companyLogo: string | null;
  companySlug: string | null;
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
  createdAt: string;
  rank?: number;
}

function mapRow(row: any): JobResult {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    companyName: row.company_name,
    companyLogo: row.company_logo,
    companySlug: row.company_slug,
    location: row.location,
    locationType: row.location_type,
    employmentType: row.employment_type,
    experienceLevel: row.experience_level,
    industry: row.industry,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    salaryCurrency: row.salary_currency,
    salaryPeriod: row.salary_period,
    skills: JSON.parse(row.skills_json || "[]"),
    requirements: JSON.parse(row.requirements_json || "[]"),
    benefits: JSON.parse(row.benefits_json || "[]"),
    isOpen: Boolean(row.is_open),
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at,
    rank: row.rank,
  };
}

const FILTER_MAP: Record<string, string> = {
  industry: "jp.industry",
  employmentType: "jp.employment_type",
  experienceLevel: "jp.experience_level",
  locationType: "jp.location_type",
};

export async function searchJobs(params: SearchParams): Promise<SearchResult> {
  const start = Date.now();
  const pageSize = Math.min(params.pageSize || 20, 50);
  const searchQuery = params.query?.trim() || "*";

  const ftsCondition = sql`jobs_fts MATCH ${searchQuery}`;
  const filterParts: ReturnType<typeof sql>[] = [];

  if (params.location?.trim()) {
    filterParts.push(sql`jp.location LIKE ${"%" + params.location.trim() + "%"}`);
  }
  for (const [key, col] of Object.entries(FILTER_MAP)) {
    const val = (params as any)[key];
    if (val) {
      filterParts.push(sql`${sql.raw(col)} = ${val}`);
    }
  }
  if (params.salaryMin !== undefined) {
    filterParts.push(sql`jp.salary_min >= ${params.salaryMin}`);
  }
  if (params.salaryMax !== undefined) {
    filterParts.push(sql`jp.salary_max <= ${params.salaryMax}`);
  }
  if (params.remote) {
    filterParts.push(sql`jp.location_type = 'Remote'`);
  }

  const baseConditions = [ftsCondition, ...filterParts];
  const dataConditions = [...baseConditions];

  if (params.cursor) {
    const decoded = Buffer.from(params.cursor, "base64").toString();
    const [rankStr, id] = decoded.split(",");
    const rank = parseFloat(rankStr);
    dataConditions.push(sql`(rank < ${rank} OR (rank = ${rank} AND jp.id < ${id}))`);
  }

  const dataWhere = sql.join(dataConditions, sql` AND `);
  const rows = await db.all(sql`
    SELECT jobs_fts.rank, jp.*
    FROM jobs_fts
    JOIN job_postings jp ON jp.rowid = jobs_fts.rowid
    WHERE ${dataWhere}
    ORDER BY rank
    LIMIT ${pageSize + 1}
  `) as any[];

  const hasMore = rows.length > pageSize;
  if (hasMore) rows.pop();

  let nextCursor: string | null = null;
  if (hasMore && rows.length > 0) {
    const last = rows[rows.length - 1];
    nextCursor = Buffer.from(`${last.rank},${last.id}`).toString("base64");
  }

  const countRows = await db.all(sql`
    SELECT count(*) as total
    FROM jobs_fts
    JOIN job_postings jp ON jp.rowid = jobs_fts.rowid
    WHERE ${sql.join(baseConditions, sql` AND `)}
  `) as any[];
  const totalEstimate = countRows[0]?.total ?? 0;

  const jobs = rows.map(mapRow);

  return {
    jobs,
    nextCursor,
    totalEstimate,
    meta: {
      tookMs: Date.now() - start,
      cacheHit: false,
      matchCount: jobs.length,
    },
  };
}

export async function getJobById(id: string): Promise<JobResult | null> {
  const rows = await db.all(sql`SELECT * FROM job_postings WHERE id = ${id} LIMIT 1`) as any[];
  if (!rows.length) return null;
  return mapRow(rows[0]);
}

export async function rebuildSearchIndex(): Promise<void> {
  await db.run(sql.raw(REBUILD_JOBS_FTS_SQL));
}
