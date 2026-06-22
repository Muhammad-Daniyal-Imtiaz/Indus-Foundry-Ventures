import { createClient } from "@libsql/client";
import dotenv from "dotenv";

// Load the current env file (which has the new DB uncommented)
dotenv.config({ path: ".env.local" });

const newDbUrl = process.env.TURSO_DATABASE_URL!;
const newDbToken = process.env.TURSO_AUTH_TOKEN!;

// The old DB credentials (commented out in .env.local)
const oldDbUrl = "libsql://indus-foundry-ventures-muhammad-daniyal-imtiaz-tfwzds.aws-us-east-1.turso.io";
const oldDbToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODAyNTQzMzksImlkIjoiMDE5ZTdmNmItYWMwMS03M2MzLWI4OTgtZjQ3NGRhZDEwODQxIiwicmlkIjoiZWMzMjhkMzItNmE5Zi00MGMxLWFhNDUtN2FjYjQ0MTI4OTUyIn0.KboGtNTaFOI_m3XhSo6fW_vye21qqzGYo_0A2MPd9NBbd8ntqfA-TyylaB6a-f-wheZMAvzf7nsEf_5rQQ-CCQ";

const oldClient = createClient({ url: oldDbUrl, authToken: oldDbToken });
const newClient = createClient({ url: newDbUrl, authToken: newDbToken });

const tablesToMigrate = [
  "users",
  "profiles",
  "company_pages",
  "connections",
  "follows",
  "posts",
  "post_likes",
  "job_postings",
  "job_applications",
  "mvps",
  "freelance_projects",
  "freelance_submissions",
  "challenges",
  "challenge_teams",
  "challenge_submissions"
];

async function run() {
  console.log("Starting migration...");
  for (const table of tablesToMigrate) {
    try {
      console.log(`Migrating table: ${table}...`);
      
      // Get old data
      const oldData = await oldClient.execute(`SELECT * FROM ${table}`);
      if (oldData.rows.length === 0) {
        console.log(`  No data in ${table}`);
        continue;
      }
      
      // Get new table columns
      const newTableInfo = await newClient.execute(`PRAGMA table_info(${table})`);
      const newColumns = newTableInfo.rows.map(r => r.name as string);
      
      // Filter out columns that don't exist in the new schema
      const columnsToInsert = newColumns.filter(col => oldData.columns.includes(col));
      
      if (columnsToInsert.length === 0) {
         console.log(`  No matching columns for ${table}`);
         continue;
      }

      console.log(`  Found ${oldData.rows.length} rows to migrate.`);

      // Insert data row by row
      for (const row of oldData.rows) {
        const columnsStr = columnsToInsert.map(c => `"${c}"`).join(", ");
        const placeholdersStr = columnsToInsert.map(() => "?").join(", ");
        const values = columnsToInsert.map(c => row[c]);
        
        try {
          await newClient.execute({
            sql: `INSERT INTO ${table} (${columnsStr}) VALUES (${placeholdersStr})`,
            args: values
          });
        } catch (insertErr: any) {
          if (insertErr.message && insertErr.message.includes('UNIQUE constraint failed')) {
            console.log(`  Row already exists in ${table}, skipping.`);
          } else {
             console.error(`  Error inserting into ${table}:`, insertErr.message);
          }
        }
      }
      console.log(`  Finished ${table}.`);
    } catch (e: any) {
      console.error(`Error processing table ${table}:`, e.message);
    }
  }
  
  console.log("Migration complete!");
}

run();
