
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { connection } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  recipes,
  categories,
} from "@/lib/db/schema/recipe";
import { recipeFavourites } from "@/lib/db/schema/favourite";
import RecipeList from "@/components/recipe-list";
import Link from "next/link";

import styles from "./page.module.scss";

export const instant = false;

export default async function FavouritesPage() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const favouriteRecipes = await db
    .select({
      id: recipes.id,
      title: recipes.title,
      description: recipes.description,
      slug: recipes.slug,
      preparationMinutes: recipes.preparationMinutes,
      cookingMinutes: recipes.cookingMinutes,
      servings: recipes.servings,
      difficulty: recipes.difficulty,
      categoryName: categories.name,
    })
    .from(recipeFavourites)
    .innerJoin(
      recipes,
      eq(recipeFavourites.recipeId, recipes.id),
    )
    .innerJoin(
      categories,
      eq(recipes.categoryId, categories.id),
    )
    .where(eq(recipeFavourites.userId, session.user.id))
    .orderBy(desc(recipeFavourites.createdAt));

  const recipesWithFavourites = favouriteRecipes.map((recipe) => ({
    ...recipe,
    isFavourite: true,
  }));

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <span aria-hidden="true" className={styles.eyebrow}>
            Saved with love
          </span>
          <h1>My Favourite Recipes</h1>
          <p>Your saved recipes, all in one place.</p>
        </header>

        {recipesWithFavourites.length > 0 ? (
          <RecipeList recipes={recipesWithFavourites} />
        ) : (
          <section
            aria-labelledby="empty-favourites-heading"
            className={styles.emptyState}
          >
            <span aria-hidden="true" className={styles.heart}>♡</span>
            <h2 id="empty-favourites-heading">No favourites yet</h2>
            <p>
              Explore our recipes and save the ones you want to cook later.
            </p>
            <Link href="/recipes">
              Explore recipes <span aria-hidden="true">→</span>
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
