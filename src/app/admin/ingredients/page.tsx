import { connection } from "next/server";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";

import DeleteIngredientButton from "@/components/admin/delete-ingredient-button";

import { db } from "@/lib/db";
import { ingredients, recipeIngredients } from "@/lib/db/schema/recipe";

export const instant = false;

export default async function AdminIngredientsPage() {
  await connection();

  // Fetch ingredients and count how many recipes use each one.
  const ingredientList = await db
    .select({
      id: ingredients.id,
      name: ingredients.name,
      recipeCount: count(recipeIngredients.recipeId),
    })
    .from(ingredients)
    .leftJoin(
      recipeIngredients,
      eq(ingredients.id, recipeIngredients.ingredientId),
    )
    .groupBy(ingredients.id)
    .orderBy(asc(ingredients.name));

  return (
    <section>
      <div>
        <h1>Ingredients</h1>
        <p>Manage the ingredients used across your recipes.</p>

        <Link href="/admin/ingredients/new">Add Ingredient</Link>
      </div>

      {ingredientList.length === 0 ? (
        <p>No ingredients found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Recipes Using Ingredient</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {ingredientList.map((ingredient) => (
              <tr key={ingredient.id}>
                <td>{ingredient.name}</td>
                <td>{ingredient.recipeCount}</td>
                <td>
                  <Link href={`/admin/ingredients/${ingredient.id}/edit`}>
                    Edit
                  </Link>

                  <DeleteIngredientButton
                    ingredientId={ingredient.id}
                    ingredientName={ingredient.name}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
