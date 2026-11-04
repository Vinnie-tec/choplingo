import { connection } from "next/server";

import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";

import { recipes, categories } from "@/lib/db/schema/recipe";

import AdminRecipeList from "@/components/admin/recipe-list";

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

      <AdminRecipeList recipes={allRecipes} />
    </main>
  );
}
