
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as authSchema from "./schema/auth";
import * as recipeSchema from "./schema/recipe";
import * as favouriteSchema from "./schema/favourite";
import * as reviewSchema from "./schema/review";
import * as assistantRateLimitSchema from "./schema/assistant-rate-limit";

// Create one shared PostgreSQL connection pool.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Maximum number of connections in this pool.
  max: 10,

  // Close idle connections after 30 seconds.
  idleTimeoutMillis: 30_000,

  // Wait up to 10 seconds when establishing a connection.
  connectionTimeoutMillis: 10_000,

  // Allow the pool to keep connections alive.
  keepAlive: true,
});

// Log unexpected errors from idle connections.
pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

// Register all application tables with Drizzle.
export const db = drizzle(pool, {
  schema: {
    ...recipeSchema,
    ...authSchema,
    ...favouriteSchema,
    ...reviewSchema,
    ...assistantRateLimitSchema,
  },
});
