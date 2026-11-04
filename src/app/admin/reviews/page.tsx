
import { connection } from "next/server";
import { and, desc, eq, ilike } from "drizzle-orm";

import { db } from "@/lib/db";
import { recipes } from "@/lib/db/schema/recipe";
import { user } from "@/lib/db/schema/auth";
import { recipeReviews } from "@/lib/db/schema/review";
import AdminReviewList from "@/components/admin/review-list";
import Link from "next/link";
import styles from "../admin.module.scss";

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
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>COMMUNITY FEEDBACK</p>
          <h1>Review moderation</h1>
          <p className={styles.subtitle}>
            Keep an eye on the feedback your recipes are receiving.
          </p>
        </div>
      </div>

      <section className={styles.reviewFilters} aria-label="Review filters">
        <form className={styles.reviewFilterForm} method="GET">
          <div className={styles.reviewSearchField}>
            <label htmlFor="recipe">Search recipes</label>
            <input
              id="recipe"
              type="search"
              name="recipe"
              placeholder="Search by recipe name"
              defaultValue={search}
            />
          </div>
          <div className={styles.reviewRatingField}>
            <label htmlFor="rating">Rating</label>
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
          <div className={styles.reviewFilterActions}>
            <button className={styles.reviewApplyButton} type="submit">
              Apply filters
            </button>
            {(search || rating !== undefined) && (
              <Link className={styles.reviewClearLink} href="/admin/reviews">
                Clear
              </Link>
            )}
          </div>
        </form>
        <p className={styles.reviewResultCount}>
          <strong>{reviewList.length}</strong>{" "}
          {reviewList.length === 1 ? "review" : "reviews"} found
        </p>
      </section>

      <AdminReviewList
        reviews={reviewList}
        hasFilters={Boolean(search || rating !== undefined)}
      />
    </main>
  );
}
