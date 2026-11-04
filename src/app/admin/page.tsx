import { avg, count, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { recipes, categories, ingredients } from "@/lib/db/schema/recipe";
import { recipeReviews } from "@/lib/db/schema/review";

import { redirect } from "next/navigation";
import { connection } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import styles from "./admin.module.scss";

export const instant = false;

export default async function AdminPage() {
  // Tell Next.js this page depends on an incoming request.
  await connection();

  const adminSession = await requireAdmin();

  if (!adminSession.authorized) {
    if (adminSession.reason === "unauthenticated") {
      redirect("/login");
    }

    // We'll replace this with a proper forbidden page shortly.
    redirect("/");
  }

  // Fetch dashboard statistics directly from PostgreSQL.
  const [
    totalUsers,
    totalRecipes,
    publishedRecipes,
    draftRecipes,
    totalCategories,
    totalIngredients,
    totalReviews,
  ] = await Promise.all([
    db.select({ total: count() }).from(user),

    db.select({ total: count() }).from(recipes),

    db
      .select({ total: count() })
      .from(recipes)
      .where(eq(recipes.status, "published")),

    db
      .select({ total: count() })
      .from(recipes)
      .where(eq(recipes.status, "draft")),

    db.select({ total: count() }).from(categories),

    db.select({ total: count() }).from(ingredients),

    db.select({ total: count() }).from(recipeReviews),
  ]);

  // Fetch the five most recently registered users.
  const recentUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(5);

  // Fetch the five most recently created recipes.
  const recentRecipes = await db
    .select({
      id: recipes.id,
      title: recipes.title,
      slug: recipes.slug,
      status: recipes.status,
      createdAt: recipes.createdAt,
    })
    .from(recipes)
    .orderBy(desc(recipes.createdAt))
    .limit(5);

  // Fetch the five most recently submitted reviews.
  const recentReviews = await db
    .select({
      id: recipeReviews.id,
      rating: recipeReviews.rating,
      comment: recipeReviews.comment,
      createdAt: recipeReviews.createdAt,
      recipeTitle: recipes.title,
      recipeSlug: recipes.slug,
      reviewerName: user.name,
    })
    .from(recipeReviews)
    .innerJoin(recipes, eq(recipeReviews.recipeId, recipes.id))
    .innerJoin(user, eq(recipeReviews.userId, user.id))
    .orderBy(desc(recipeReviews.createdAt))
    .limit(5);

  // Calculate the overall average rating and total number of ratings.
  const [reviewSummary] = await db
    .select({
      averageRating: avg(recipeReviews.rating),
      totalRatings: count(),
    })
    .from(recipeReviews);

  // Find the five recipes with the most reviews.
  const mostReviewedRecipes = await db
    .select({
      id: recipes.id,
      title: recipes.title,
      slug: recipes.slug,
      reviewCount: count(recipeReviews.id),
      averageRating: avg(recipeReviews.rating),
    })
    .from(recipes)
    .innerJoin(recipeReviews, eq(recipes.id, recipeReviews.recipeId))
    .groupBy(recipes.id, recipes.title, recipes.slug)
    .orderBy(desc(count(recipeReviews.id)))
    .limit(5);

  return (
    <main className={styles.dashboard}>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>YOUR KITCHEN, IN CONTROL</p>
          <h1>Dashboard overview</h1>
          <p className={styles.subtitle}>
            Manage the recipes and content that bring ChopLingo to life.
          </p>
        </div>
      </div>

      <section className={styles.welcomeCard}>
        <div className={styles.welcomeCopy}>
          <p className={styles.cardEyebrow}>WELCOME TO THE STUDIO</p>
          <h2>A little inspiration goes a long way.</h2>
          <p>
            Curate the collection, keep your recipes up to date, and make it
            easier for everyone to find their next favourite meal.
          </p>
          <Link className={styles.primaryButton} href="/admin/recipes">
            Explore recipes <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className={styles.welcomeArt} aria-hidden="true">
          <span className={styles.artHalo} />
          <span className={styles.artPlate}>
            <svg viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="44" />
              <circle cx="60" cy="60" r="34" />
              <path d="M37 64c8-13 17-17 26-11 7 5 13 3 21-7" />
              <path d="M42 75c10 6 25 7 37-1" />
              <circle cx="46" cy="48" r="3" />
              <circle cx="73" cy="46" r="3" />
              <path d="M54 39c-2-5 0-8 4-10m8 11c0-5 3-7 7-8" />
            </svg>
          </span>
          <span className={styles.artSparkle}>🎨</span>
          <span className={styles.artSparkleSecondary}>🎁</span>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>AT A GLANCE</p>
            <h2>Your ChopLingo numbers</h2>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <article className={styles.statCard}>
            <p>Total users</p>
            <strong>{totalUsers[0].total}</strong>
          </article>

          <article className={styles.statCard}>
            <p>Total recipes</p>
            <strong>{totalRecipes[0].total}</strong>
          </article>

          <article className={styles.statCard}>
            <p>Published recipes</p>
            <strong>{publishedRecipes[0].total}</strong>
          </article>

          <article className={styles.statCard}>
            <p>Draft recipes</p>
            <strong>{draftRecipes[0].total}</strong>
          </article>

          <article className={styles.statCard}>
            <p>Categories</p>
            <strong>{totalCategories[0].total}</strong>
          </article>

          <article className={styles.statCard}>
            <p>Ingredients</p>
            <strong>{totalIngredients[0].total}</strong>
          </article>

          <article className={styles.statCard}>
            <p>Total reviews</p>
            <strong>{totalReviews[0].total}</strong>
          </article>
        </div>
      </section>

      <section className={styles.activitySection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>WHAT&apos;S HAPPENING</p>
            <h2>Recent activity</h2>
          </div>
        </div>

        <div className={styles.activityGrid}>
          {/* Recently registered users */}
          <article className={styles.activityCard}>
            <h3>New users</h3>

            {recentUsers.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <ul>
                {recentUsers.map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.email}</small>
                    </div>

                    <small>{item.createdAt.toLocaleDateString()}</small>
                  </li>
                ))}
              </ul>
            )}
          </article>

          {/* Recently created recipes */}
          <article className={styles.activityCard}>
            <h3>Recent recipes</h3>

            {recentRecipes.length === 0 ? (
              <p>No recipes found.</p>
            ) : (
              <ul>
                {recentRecipes.map((item) => (
                  <li key={item.id}>
                    <div>
                      <Link href={`/recipes/${item.slug}`}>{item.title}</Link>

                      <small>{item.status}</small>
                    </div>

                    <small>{item.createdAt.toLocaleDateString()}</small>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <section className={styles.performanceSection}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>CONTENT PERFORMANCE</p>
                <h2>Recipe insights</h2>
              </div>
            </div>

            <div className={styles.performanceStats}>
              <article className={styles.statCard}>
                <p>Average recipe rating</p>
                <strong>
                  {reviewSummary.averageRating
                    ? Number(reviewSummary.averageRating).toFixed(1)
                    : "0.0"}
                  /5
                </strong>
              </article>

              <article className={styles.statCard}>
                <p>Total ratings submitted</p>
                <strong>{reviewSummary.totalRatings}</strong>
              </article>
            </div>

            <div className={styles.activityCard}>
              <h3>Most reviewed recipes</h3>

              {mostReviewedRecipes.length === 0 ? (
                <p>No reviewed recipes yet.</p>
              ) : (
                <ul>
                  {mostReviewedRecipes.map((recipe) => (
                    <li key={recipe.id}>
                      <div>
                        <Link href={`/recipes/${recipe.slug}`}>
                          {recipe.title}
                        </Link>

                        <small>{recipe.reviewCount} reviews</small>
                      </div>

                      <strong>
                        {Number(recipe.averageRating).toFixed(1)}/5
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Recently submitted reviews */}
          <article className={styles.activityCard}>
            <h3>Recent reviews</h3>

            {recentReviews.length === 0 ? (
              <p>No reviews found.</p>
            ) : (
              <ul>
                {recentReviews.map((item) => (
                  <li key={item.id}>
                    <div>
                      <Link href={`/recipes/${item.recipeSlug}`}>
                        {item.recipeTitle}
                      </Link>

                      <small>
                        By {item.reviewerName} · {item.rating}/5
                      </small>

                      {item.comment && <small>{item.comment}</small>}
                    </div>

                    <small>{item.createdAt.toLocaleDateString()}</small>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </section>

      <div className={styles.quickLinks}>
        <Link className={styles.quickLink} href="/admin/recipes">
          <span className={styles.quickIcon} aria-hidden="true">
            ↗
          </span>
          <span>
            <strong>Manage recipes</strong>
            <small>Review, edit, and publish your collection</small>
          </span>
          <span className={styles.quickArrow} aria-hidden="true">
            →
          </span>
        </Link>
        <Link className={styles.quickLink} href="/admin/recipes/new">
          <span
            className={`${styles.quickIcon} ${styles.quickIconAccent}`}
            aria-hidden="true"
          >
            ＋
          </span>
          <span>
            <strong>Create a recipe</strong>
            <small>Add a new dish to the ChopLingo kitchen</small>
          </span>
          <span className={styles.quickArrow} aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </main>
  );
}
