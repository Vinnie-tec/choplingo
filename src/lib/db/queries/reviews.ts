import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { recipeReviews } from "@/lib/db/schema/review";
import { user } from "@/lib/db/schema/auth";

export async function getRecipeReviews(
  recipeId: number,
  currentUserId: string,
) {
  const reviews = await db
    .select({
      id: recipeReviews.id,
      rating: recipeReviews.rating,
      comment: recipeReviews.comment,
      createdAt: recipeReviews.createdAt,
      updatedAt: recipeReviews.updatedAt,
      userId: recipeReviews.userId,
      reviewerName: user.name,
    })
    .from(recipeReviews)
    .innerJoin(user, eq(recipeReviews.userId, user.id))
    .where(eq(recipeReviews.recipeId, recipeId))
    .orderBy(desc(recipeReviews.createdAt));

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) /
        totalReviews;

  const myReview =
    reviews.find((review) => review.userId === currentUserId) ?? null;

  return {
    reviews,
    totalReviews,
    averageRating: Number(averageRating.toFixed(1)),
    myReview,
  };
}