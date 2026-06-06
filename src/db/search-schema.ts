/**
 * FTS5 virtual table helpers for job search.
 * Uses db.execute() — compatible with @libsql/client/web (workerd + Node.js).
 */

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

/**
 * Create the FTS5 table and populate it from job_postings if empty.
 * Call once at startup or via a migration script.
 */
export async function ensureFtsIndex(db: any): Promise<void> {
  await db.execute(CREATE_JOBS_FTS_SQL);
  const res = await db.execute(`SELECT count(*) AS cnt FROM jobs_fts`);
  const cnt = res.rows?.[0]?.cnt ?? 0;
  if (Number(cnt) === 0) {
    await db.execute(POPULATE_JOBS_FTS_SQL);
  }
}

/**
 * Upsert a single job into the FTS index.
 * Delete-then-insert keeps the index consistent.
 */
export async function syncJobToFts(
  db: any,
  jobRowid: number,
  title: string,
  description: string,
  location: string,
  companyName: string,
  skillsJson: string
): Promise<void> {
  await db.execute(`DELETE FROM jobs_fts WHERE rowid = ${jobRowid}`);
  const t   = title.replace(/'/g, "''");
  const d   = description.replace(/'/g, "''");
  const l   = location.replace(/'/g, "''");
  const cn  = companyName.replace(/'/g, "''");
  const skl = skillsJson.replace(/'/g, "''");
  await db.execute(
    `INSERT INTO jobs_fts (rowid, title, description, location, company_name, skills)
     VALUES (${jobRowid}, '${t}', '${d}', '${l}', '${cn}', '${skl}')`
  );
}

/**
 * Remove a job from the FTS index on delete.
 */
export async function removeJobFromFts(db: any, jobRowid: number): Promise<void> {
  await db.execute(`DELETE FROM jobs_fts WHERE rowid = ${jobRowid}`);
}
