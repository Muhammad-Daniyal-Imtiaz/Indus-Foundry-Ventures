import { sql } from "drizzle-orm";

export const CREATE_JOBS_FTS_SQL = `CREATE VIRTUAL TABLE IF NOT EXISTS jobs_fts USING fts5(
  title,
  description,
  location,
  company_name,
  skills,
  tokenize='porter unicode61'
)`;

export const POPULATE_JOBS_FTS_SQL = `INSERT INTO jobs_fts (rowid, title, description, location, company_name, skills)
SELECT rowid, title, description, location, company_name, skills_json
FROM job_postings
WHERE is_open = 1`;

export const REBUILD_JOBS_FTS_SQL = `INSERT INTO jobs_fts(jobs_fts) VALUES('rebuild')`;

export const DELETE_ALL_JOBS_FTS_SQL = `DELETE FROM jobs_fts`;

export async function ensureFtsIndex(db: any) {
  await db.run(sql.raw(CREATE_JOBS_FTS_SQL));
  const row = await db.get(sql`SELECT count(*) as cnt FROM jobs_fts`);
  if (row.cnt === 0) {
    await db.run(sql.raw(POPULATE_JOBS_FTS_SQL));
  }
}

export async function syncJobToFts(db: any, jobPostingRowid: number, title: string, description: string, location: string, companyName: string, skillsJson: string) {
  await db.run(sql`DELETE FROM jobs_fts WHERE rowid = ${jobPostingRowid}`);
  await db.run(sql`INSERT INTO jobs_fts (rowid, title, description, location, company_name, skills)
    VALUES (${jobPostingRowid}, ${title}, ${description}, ${location}, ${companyName}, ${skillsJson})`);
}

export async function removeJobFromFts(db: any, jobPostingRowid: number) {
  await db.run(sql`DELETE FROM jobs_fts WHERE rowid = ${jobPostingRowid}`);
}
