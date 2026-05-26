import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// In Vercel serverless, each function invocation gets a fresh process.
// max:1 prevents connection pool exhaustion across concurrent cold starts.
// In local dev (long-lived process), a larger pool is fine — detect via NODE_ENV.
const isServerless =
  process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

// Module-level singleton so the connection is reused within a single
// invocation (and across hot-reloads in dev).
let _client: postgres.Sql | undefined;
let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

function getClient(): postgres.Sql {
  if (!_client) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL environment variable is not set. " +
          "Add it to .env.local for local dev or to Vercel env vars for production."
      );
    }

    _client = postgres(connectionString, {
      max: isServerless ? 1 : 10,
      idle_timeout: isServerless ? 20 : 30,
      connect_timeout: 10,
      // Disable prepared statements in serverless — connections don't live
      // long enough to amortise the setup cost, and PgBouncer in transaction
      // mode doesn't support them.
      prepare: false,
      // Railway's postgres:alpine image does not configure SSL certs by default.
      // Connections via the Railway TCP proxy are plain TCP — no SSL needed.
      ssl: false,
    });
  }
  return _client;
}

export function getDb() {
  if (!_db) {
    _db = drizzle(getClient(), { schema });
  }
  return _db;
}

// Convenience re-export so callers can do: import { db } from "@/lib/db"
export const db = getDb();
