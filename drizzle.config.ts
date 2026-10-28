import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Drizzle Kit runs outside the normal Next.js runtime.
// Load the local environment variables explicitly.
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from .env.local");
}

export default defineConfig({
  // Include both our recipe schema and the schema Better Auth generates.
  schema: "./src/lib/db/schema/*.ts",

  // Migration files will be stored here.
  out: "./drizzle",

  dialect: "postgresql",

  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});