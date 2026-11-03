import { notFound } from "next/navigation";
import { connection } from "next/server";
import { eq, asc } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  recipes,
  categories,
  recipeIngredients,
  ingredients,
} from "@/lib/db/schema/recipe";

import RecipeForm from "@/components/admin/recipe-form";

export const instant = false;

type EditRecipePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  await connection();

  const { id } = await params;
  const recipeId = Number(id);

  if (!Number.isSafeInteger(recipeId) || recipeId <= 0) {
    notFound();
  }

  // Fetch the recipe.
  const [recipe] = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipe) {
    notFound();
  }

  // Fetch the recipe's ingredients and their quantities.
  const recipeIngredientList = await db
    .select({
      name: ingredients.name,
      quantity: recipeIngredients.quantity,
      unit: recipeIngredients.unit,
      notes: recipeIngredients.notes,
    })
    .from(recipeIngredients)
    .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
    .where(eq(recipeIngredients.recipeId, recipeId));

  // Fetch available categories.
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .orderBy(asc(categories.name));

  const validDifficulties = ["easy", "medium", "hard"] as const;

  const difficulty = validDifficulties.includes(
    recipe.difficulty as (typeof validDifficulties)[number],
  )
    ? (recipe.difficulty as (typeof validDifficulties)[number])
    : "medium";

  const initialData = {
    ...recipe,
    difficulty,
    ingredients: recipeIngredientList,
  };

  return (
    <main>
      <h1>Edit Recipe: {recipe.title}</h1>

      <RecipeForm categories={allCategories} initialData={initialData} />
    </main>
  );
}
