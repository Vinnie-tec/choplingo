import {
  pgTable,
  integer,
  timestamp,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { recipes } from "./recipe";

export const recipeFavourites = pgTable(
  "recipe_favourites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    recipeId: integer("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.recipeId],
    }),
  ],
);
