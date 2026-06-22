import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function run() {
  try {
    await client.execute(`DROP TABLE IF EXISTS jobs_fts`);
    console.log("Dropped jobs_fts virtual table.");
  } catch (e) {
    console.error(e);
  }
}

run();
