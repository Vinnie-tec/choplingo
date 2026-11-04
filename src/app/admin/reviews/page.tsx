
import { connection } from "next/server";
import Link from "next/link";
import { and, desc, eq, ilike } from "drizzle-orm";

import { db } from "@/lib/db";
import { recipes } from "@/lib/db/schema/recipe";
import { user } from "@/lib/db/schema/auth";
import { recipeReviews } from "@/lib/db/schema/review";
import DeleteReviewButton from "@/components/admin/delete-review-button";

export const instant = false;

type AdminReviewsPageProps = {
  searchParams: Promise<{
    recipe?: string;
    rating?: string;
  }>;
};

export default async function AdminReviewsPage({
  searchParams,
}: AdminReviewsPageProps) {
  await connection();

  // Read the search parameters from the URL.
  const params = await searchParams;

  const search = params.recipe?.trim() ?? "";

  // Only accept ratings between 1 and 5.
  const rating =
    params.rating && /^[1-5]$/.test(params.rating)
      ? Number(params.rating)
      : undefined;

  // Build the database conditions.
  const conditions = [];

  if (search) {
    conditions.push(ilike(recipes.title, `%${search}%`));
  }

  if (rating !== undefined) {
    conditions.push(eq(recipeReviews.rating, rating));
  }

  // Fetch reviews with the selected filters.
  const reviewList = await db
    .select({
      id: recipeReviews.id,
      rating: recipeReviews.rating,
      comment: recipeReviews.comment,
      createdAt: recipeReviews.createdAt,
      recipeTitle: recipes.title,
      recipeSlug: recipes.slug,
      reviewerName: user.name,
      reviewerEmail: user.email,
    })
    .from(recipeReviews)
    .innerJoin(recipes, eq(recipeReviews.recipeId, recipes.id))
    .innerJoin(user, eq(recipeReviews.userId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(recipeReviews.createdAt));

  return (
    <section>
      <div>
        <h1>Review Moderation</h1>
        <p>Monitor reviews submitted by ChopLingo users.</p>
      </div>

      {/* Search and rating filters */}
      <form method="GET">
        <div>
          <label htmlFor="recipe">Search by recipe</label>

          <input
            id="recipe"
            type="search"
            name="recipe"
            placeholder="e.g. Nigerian Jollof Rice"
            defaultValue={search}
          />
        </div>

        <div>
          <label htmlFor="rating">Filter by rating</label>

          <select
            id="rating"
            name="rating"
            defaultValue={rating?.toString() ?? ""}
          >
            <option value="">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </div>

        <button type="submit">Apply Filters</button>

        <Link href="/admin/reviews">Clear Filters</Link>
      </form>

      <p>Matching reviews: {reviewList.length}</p>

      {reviewList.length === 0 ? (
        <p>
          {search || rating !== undefined
            ? "No reviews match your selected filters."
            : "No reviews have been submitted yet."}
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Recipe</th>
              <th>Reviewer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {reviewList.map((review) => (
              <tr key={review.id}>
                <td>
                  <Link href={`/recipes/${review.recipeSlug}`}>
                    {review.recipeTitle}
                  </Link>
                </td>

                <td>
                  <div>{review.reviewerName}</div>
                  <small>{review.reviewerEmail}</small>
                </td>

                <td>{review.rating}/5</td>

                <td>{review.comment || "No comment"}</td>

                <td>{review.createdAt.toLocaleDateString()}</td>

                <td>
                  <DeleteReviewButton
                    reviewId={review.id}
                    recipeTitle={review.recipeTitle}
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
