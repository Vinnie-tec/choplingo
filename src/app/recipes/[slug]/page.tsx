import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  recipes,
  categories,
  recipeIngredients,
  ingredients,
} from "@/lib/db/schema/recipe";

import ServingCalculator from "@/components/serving-calculator";
import ReviewForm from "@/components/review-form";

export const instant = false;

type RecipeDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RecipeDetailPage({
  params,
}: RecipeDetailPageProps) {
  // 1. Require the user to be signed in.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // 2. Read the slug from the URL.
  const { slug } = await params;

  // 3. Fetch the recipe and its category.
  const [recipe] = await db
    .select({
      id: recipes.id,
      title: recipes.title,
      slug: recipes.slug,
      description: recipes.description,
      preparationMinutes: recipes.preparationMinutes,
      cookingMinutes: recipes.cookingMinutes,
      servings: recipes.servings,
      difficulty: recipes.difficulty,
      instructions: recipes.instructions,
      imageUrl: recipes.imageUrl,
      categoryName: categories.name,
    })
    .from(recipes)
    .innerJoin(categories, eq(recipes.categoryId, categories.id))
    .where(eq(recipes.slug, slug))
    .limit(1);

  // 4. Show Next.js's 404 page for an unknown recipe.
  if (!recipe) {
    notFound();
  }

  // 5. Fetch ingredients and their recipe-specific quantities.
  const recipeIngredientList = await db
    .select({
      name: ingredients.name,
      quantity: recipeIngredients.quantity,
      unit: recipeIngredients.unit,
      notes: recipeIngredients.notes,
    })
    .from(recipeIngredients)
    .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
    .where(eq(recipeIngredients.recipeId, recipe.id));

  // 6. Render the recipe.
  return (
    <main>
      <header>
        <p>{recipe.categoryName}</p>
        <h1>{recipe.title}</h1>
        <p>{recipe.description}</p>
      </header>

      <section aria-label="Recipe information">
        <p>Preparation: {recipe.preparationMinutes} minutes</p>
        <p>Cooking: {recipe.cookingMinutes} minutes</p>
        <p>Servings: {recipe.servings}</p>
        <p>Difficulty: {recipe.difficulty}</p>
      </section>

      <ServingCalculator
        originalServings={recipe.servings}
        ingredients={recipeIngredientList}
      />

      <section>
        <h2>Preparation steps</h2>

        <ol>
          {recipe.instructions.map((step) => (
            <li key={step.step}>{step.instruction}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Rate this recipe</h2>
        <ReviewForm recipeId={recipe.id} />
      </section>
    </main>
  );
}
