import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as recipeSchema from "./schema/recipe";

/**
 * Pool manages reusable PostgreSQL connections.
 *
 * We create one shared pool rather than opening a brand-new
 * database connection for every query.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Drizzle uses the pool to communicate with PostgreSQL.
 *
 * We'll add the generated Better Auth schema here in the next step,
 * so both authentication and recipe queries use the same database.
 */
export const db = drizzle(pool, {
  schema: {
    ...recipeSchema,
  },
});