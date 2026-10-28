
import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { user } from "./auth";
import { recipes } from "./recipe";

export const recipeReviews = pgTable(
  "recipe_reviews",
  {
    id: serial("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    recipeId: integer("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),

    rating: integer("rating").notNull(),

    comment: text("comment"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("recipe_reviews_user_recipe_unique").on(
      table.userId,
      table.recipeId,
    ),

    check(
      "recipe_reviews_rating_range",
      // PostgreSQL enforces this even if a request bypasses our UI.
      // The rating must be between 1 and 5.
      // SQL expression:
      // rating >= 1 AND rating <= 5
      sql`${table.rating} >= 1 AND ${table.rating} <= 5`,
    ),
  ],
);
