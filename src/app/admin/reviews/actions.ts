
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { recipeReviews } from "@/lib/db/schema/review";
import { recipes } from "@/lib/db/schema/recipe";

import { requireAdmin } from "@/lib/admin-auth";

export async function deleteReview(reviewId: unknown) {
  // 1. Verify administrator access.
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return {
      success: false,
      message: "You are not authorized to perform this action.",
    };
  }

  // 2. Validate the review ID.
  if (
    typeof reviewId !== "number" ||
    !Number.isInteger(reviewId) ||
    reviewId <= 0
  ) {
    return {
      success: false,
      message: "Invalid review ID.",
    };
  }

  try {
    // 3. Fetch the recipe ID before deleting the review.
    const [review] = await db
      .select({
        recipeId: recipeReviews.recipeId,
        recipeSlug: recipes.slug,
      })
      .from(recipeReviews)
      .innerJoin(
        recipes,
        eq(recipeReviews.recipeId, recipes.id)
      )
      .where(eq(recipeReviews.id, reviewId))
      .limit(1);

    if (!review) {
      return {
        success: false,
        message: "Review not found.",
      };
    }

    // 4. Delete only the selected review.
    await db
      .delete(recipeReviews)
      .where(eq(recipeReviews.id, reviewId));

    // 5. Refresh affected pages.
    revalidatePath("/admin/reviews");
    revalidatePath(`/recipes/${review.recipeSlug}`);
    revalidatePath("/recipes");

    return {
      success: true,
      message: "Review deleted successfully.",
    };
  } catch (error) {
    console.error("Delete review error:", error);

    return {
      success: false,
      message: "Unable to delete review. Please try again.",
    };
  }
}
