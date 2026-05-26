import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit reads .env by default; load .env.local for local dev
config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
