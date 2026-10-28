import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as authSchema from "./schema/auth";
import * as recipeSchema from "./schema/recipe";
import * as favouriteSchema from "./schema/favourite";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Register every table schema with Drizzle.
 *
 * Better Auth and our recipe features now share one database connection
 * and one schema-aware Drizzle instance.
 */
export const db = drizzle(pool, {
  schema: {
    ...recipeSchema,
    ...authSchema,
    ...favouriteSchema,
  },
});
