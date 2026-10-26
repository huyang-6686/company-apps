import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Database = ReturnType<typeof createDatabase>;
let database: Database | undefined;

function createDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle(pool, { schema });
}

export function getDb(): Database {
  database ??= createDatabase();
  return database;
}

export const db = new Proxy({} as Database, {
  get(_target, property) {
    const value = Reflect.get(getDb(), property, getDb());
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});
