import { Pool } from "pg";

const rawConnectionString =
  process.env.POSTGRES_URL || process.env.DATABASE_URL || "";

if (!rawConnectionString) {
  throw new Error("Missing POSTGRES_URL or DATABASE_URL");
}

const connectionString = rawConnectionString.includes("?")
  ? `${rawConnectionString}&sslmode=no-verify`
  : `${rawConnectionString}?sslmode=no-verify`;

const globalForDb = globalThis as typeof globalThis & {
  pgPool?: Pool;
};

export const db =
  globalForDb.pgPool ??
  new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = db;
}