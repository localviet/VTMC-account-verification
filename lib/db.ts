import postgres from "postgres";


declare global {
  // eslint-disable-next-line no-var
  var __sql: ReturnType<typeof postgres> | undefined;
}

export function getSql() {
  const url = process.env.DATABASE_URL;

  // Put the check here (runtime), not at module top-level
  if (!url) {
    throw new Error("Missing DATABASE_URL (process.env.DATABASE_URL is undefined)");
  }

  // Reuse connection in dev hot-reload
  if (!globalThis.__sql) {
    globalThis.__sql = postgres(url);
  }

  return globalThis.__sql;
}


/*
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}

// In dev, Next may hot-reload a lot; this keeps one connection.
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

export const sql =
  globalForDb.sql ??
  postgres(DATABASE_URL, {
    ssl: "require",
  });

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;
*/
