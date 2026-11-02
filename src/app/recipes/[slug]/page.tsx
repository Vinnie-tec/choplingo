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
import { getRecipeReviews } from "@/lib/db/queries/reviews";
import CookingAssistant from "@/components/cooking-assistant";

import styles from "./page.module.scss";

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

  const reviewData = await getRecipeReviews(recipe.id, session.user.id);

  // 6. Render the recipe.
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <p className={styles.category}>{recipe.categoryName}</p>
          <h1>{recipe.title}</h1>
          <p className={styles.description}>{recipe.description}</p>
        </header>

        <section
          aria-label="Recipe information"
          className={styles.recipeFacts}
        >
          <p>Preparation: {recipe.preparationMinutes} minutes</p>
          <p>Cooking: {recipe.cookingMinutes} minutes</p>
          <p>Servings: {recipe.servings}</p>
          <p>Difficulty: {recipe.difficulty}</p>
        </section>

        <div className={styles.contentGrid}>
          <div className={styles.ingredientsCard}>
            <ServingCalculator
              originalServings={recipe.servings}
              ingredients={recipeIngredientList}
            />
          </div>

          <section className={styles.instructionsCard}>
            <h2>Preparation steps</h2>

            <ol>
              {recipe.instructions.map((step) => (
                <li key={step.step}>{step.instruction}</li>
              ))}
            </ol>
          </section>
        </div>

        <section className={styles.reviewFormCard}>
          <h2>Rate this recipe</h2>
          <ReviewForm
            recipeId={recipe.id}
            initialRating={reviewData.myReview?.rating ?? 0}
            initialComment={reviewData.myReview?.comment ?? ""}
          />
        </section>

        <section className={styles.reviewsCard}>
          <h2>Reviews and ratings</h2>

          <p className={styles.reviewSummary}>
            {reviewData.totalReviews > 0
              ? `★ ${reviewData.averageRating} / 5 (${reviewData.totalReviews} ${
                  reviewData.totalReviews === 1 ? "review" : "reviews"
                })`
              : "No reviews yet. Be the first to review this recipe!"}
          </p>

          {reviewData.reviews.map((review) => (
            <article key={review.id} className={styles.reviewCard}>
              <h3>{review.reviewerName}</h3>
              <p aria-label={`${review.rating} out of 5 stars`}>
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>

              {review.comment && <p>{review.comment}</p>}

              <time dateTime={review.createdAt.toISOString()}>
                {review.createdAt.toLocaleDateString()}
              </time>
            </article>
          ))}
        </section>

        <CookingAssistant recipeId={recipe.id} recipeTitle={recipe.title} />
      </div>
    </main>
  );
}
