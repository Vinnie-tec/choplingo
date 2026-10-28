
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { recipes } from "@/lib/db/schema/recipe";
import { recipeReviews } from "@/lib/db/schema/review";

const reviewSchema = z.object({
  recipeId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .max(1000, "Your review must be 1000 characters or fewer.")
    .optional()
    .transform((value) => value || null),
});

type ReviewResult = {
  success: boolean;
  message: string;
};

export async function submitReview(
  input: {
    recipeId: number;
    rating: number;
    comment?: string;
  },
): Promise<ReviewResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      success: false,
      message: "Please sign in to review a recipe.",
    };
  }

  const parsed = reviewSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid review details.",
    };
  }

  const { recipeId, rating, comment } = parsed.data;

  try {
    const [recipe] = await db
      .select({ id: recipes.id, slug: recipes.slug })
      .from(recipes)
      .where(eq(recipes.id, recipeId))
      .limit(1);

    if (!recipe) {
      return {
        success: false,
        message: "Recipe not found.",
      };
    }

    // If this user already reviewed the recipe, update their review.
    // Otherwise, create a new review.
    await db
      .insert(recipeReviews)
      .values({
        userId: session.user.id,
        recipeId,
        rating,
        comment,
      })
      .onConflictDoUpdate({
        target: [recipeReviews.userId, recipeReviews.recipeId],
        set: {
          rating,
          comment,
          updatedAt: new Date(),
        },
      });

    revalidatePath(`/recipes/${recipe.slug}`);
    revalidatePath("/recipes");

    return {
      success: true,
      message: "Your review has been saved.",
    };
  } catch (error) {
    console.error("Failed to submit recipe review:", error);

    return {
      success: false,
      message: "We couldn't save your review. Please try again.",
    };
  }
}
