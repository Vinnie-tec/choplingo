
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
    <main>
      <header>
        <h1>My Favourite Recipes</h1>
        <p>Your saved recipes, all in one place.</p>
      </header>

      {recipesWithFavourites.length > 0 ? (
        <RecipeList recipes={recipesWithFavourites} />
      ) : (
        <section>
          <h2>No favourites yet</h2>
          <p>
            Explore our recipes and save the ones you want
            to cook later.
          </p>
          <a href="/recipes">Explore recipes</a>
        </section>
      )}
    </main>
  );
}
