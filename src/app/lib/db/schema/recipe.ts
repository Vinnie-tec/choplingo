import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * A recipe's preparation instructions.
 *
 * JSONB lets us store an ordered list of steps inside the recipe record,
 * rather than creating a separate table just for instructions.
 */
export type RecipeStep = {
  step: number;
  instruction: string;
};

/**
 * Categories group recipes into useful collections.
 *
 * Examples:
 * - Rice dishes
 * - Soups
 * - Snacks
 */
export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),

    name: varchar("name", { length: 100 }).notNull(),

    // A URL-friendly identifier, e.g. "rice-dishes".
    slug: varchar("slug", { length: 120 }).notNull(),

    description: text("description"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("categories_slug_unique").on(table.slug),
  ],
);

/**
 * The main recipe record.
 *
 * Keep the core recipe information here.
 * Ingredients remain in separate tables because they are reusable
 * and each recipe needs its own ingredient quantities.
 */
export const recipes = pgTable(
  "recipes",
  {
    id: serial("id").primaryKey(),

    title: varchar("title", { length: 180 }).notNull(),

    slug: varchar("slug", { length: 200 }).notNull(),

    description: text("description").notNull(),

    // A recipe belongs to one category.
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),

    preparationMinutes: integer("preparation_minutes")
      .notNull(),

    cookingMinutes: integer("cooking_minutes")
      .notNull(),

    // Number of people the original ingredient quantities serve.
    servings: integer("servings").notNull().default(4),

    difficulty: varchar("difficulty", { length: 20 })
      .notNull()
      .default("medium"),

    /**
     * Example:
     * [
     *   { "step": 1, "instruction": "Wash the rice." },
     *   { "step": 2, "instruction": "Prepare the sauce." }
     * ]
     */
    instructions: jsonb("instructions")
      .$type<RecipeStep[]>()
      .notNull(),

    // We'll connect image uploads to Cloudinary later.
    imageUrl: text("image_url"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("recipes_slug_unique").on(table.slug),
  ],
);

/**
 * Reusable ingredient records.
 *
 * "Tomatoes" should be one ingredient, even if several recipes use it.
 */
export const ingredients = pgTable(
  "ingredients",
  {
    id: serial("id").primaryKey(),

    name: varchar("name", { length: 120 }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("ingredients_name_unique").on(table.name),
  ],
);

/**
 * Connects recipes to ingredients.
 *
 * The same ingredient can appear in multiple recipes, but its quantity
 * can differ for each recipe.
 */
export const recipeIngredients = pgTable(
  "recipe_ingredients",
  {
    id: serial("id").primaryKey(),

    recipeId: integer("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),

    ingredientId: integer("ingredient_id")
      .notNull()
      .references(() => ingredients.id, { onDelete: "restrict" }),

    // Example: 2, with the unit recorded as "cups".
    quantity: integer("quantity").notNull(),

    unit: varchar("unit", { length: 40 }).notNull(),

    // Optional notes such as "finely chopped".
    notes: text("notes"),
  },
  (table) => [
    uniqueIndex("recipe_ingredients_recipe_ingredient_unique").on(
      table.recipeId,
      table.ingredientId,
    ),
  ],
);