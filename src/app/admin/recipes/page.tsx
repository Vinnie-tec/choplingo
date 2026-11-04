import { connection } from "next/server";

import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";

import { recipes, categories } from "@/lib/db/schema/recipe";
import DeleteRecipeButton from "@/components/admin/delete-recipe-button";

export const instant = false;

export default async function AdminRecipesPage() {
  await connection();

  const allRecipes = await db
    .select({
      id: recipes.id,
      title: recipes.title,
      slug: recipes.slug,
      difficulty: recipes.difficulty,
      preparationMinutes: recipes.preparationMinutes,
      cookingMinutes: recipes.cookingMinutes,
      categoryName: categories.name,
      status: recipes.status,
    })
    .from(recipes)
    .leftJoin(categories, eq(recipes.categoryId, categories.id))
    .orderBy(desc(recipes.createdAt));

  return (
    <main>
      <h1>Recipe Management</h1>

      <p>Total recipes: {allRecipes.length}</p>

      <Link href="/admin/recipes/new">Add New Recipe</Link>

      {allRecipes.length === 0 ? (
        <p>No recipes have been added yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Recipe</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Preparation</th>
              <th>Cooking</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {allRecipes.map((recipe) => (
              <tr key={recipe.id}>
                <td>{recipe.title}</td>
                <td>{recipe.categoryName}</td>
                <td>{recipe.difficulty}</td>
                <td>{recipe.preparationMinutes} mins</td>
                <td>{recipe.cookingMinutes} mins</td>
                <td>
                  <Link href={`/recipes/${recipe.slug}`}>View</Link>
                </td>
                <td>
                  <Link href={`/admin/recipes/${recipe.id}/edit`}>Edit</Link>
                </td>
                <td>
                  <DeleteRecipeButton
                    recipeId={recipe.id}
                    recipeTitle={recipe.title}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
