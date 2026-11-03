
import { asc } from "drizzle-orm";
import { connection } from "next/server";

import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/recipe";
import RecipeForm from "@/components/admin/recipe-form";

export const instant = false;

export default async function NewRecipePage() {
  await connection();

  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .orderBy(asc(categories.name));

  return (
    <main>
      <h1>Create a New Recipe</h1>

      {allCategories.length === 0 ? (
        <p>
          You need to create a category before adding recipes.
        </p>
      ) : (
        <RecipeForm categories={allCategories} />
      )}
    </main>
  );
}
