import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function run() {
  try {
    const tables = await client.execute(`SELECT name FROM sqlite_master WHERE type='table'`);
    console.log("Tables:", tables.rows.map(r => r.name).join(", "));
    
    for (const table of tables.rows.map(r => r.name)) {
      const count = await client.execute(`SELECT count(*) as c FROM ${table}`);
      console.log(`${table} count:`, count.rows[0].c);
    }
  } catch (e) {
    console.error(e);
  }
}

run();
