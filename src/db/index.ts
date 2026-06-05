import { drizzle } from "drizzle-orm/libsql/web";
import { createClient } from "@libsql/client/web";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    _db = drizzle(
      createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      }),
      { schema }
    );
  }
  return _db;
}

const throwIfMissing = () => {
  throw new Error(
    "Database not initialized. Call getDb() first, or ensure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars are set."
  );
};

export const db = new Proxy(
  {} as ReturnType<typeof drizzle>,
  { get: (_, prop) => (getDb() as any)[prop] ?? throwIfMissing }
);
