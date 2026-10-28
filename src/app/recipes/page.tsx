import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { recipes, categories } from "@/lib/db/schema/recipe";

import RecipeList from "@/components/recipe-list";
import { getUserFavouriteRecipeIds } from "@/lib/db/queries/favourites";

export const instant = false;

export default async function RecipesPage() {
  // Wait for an incoming request instead of prerendering
  // this personalized page ahead of time.
  await connection();
  // 1. Read the incoming request headers.
  const requestHeaders = await headers();

  // 2. Ask Better Auth whether this request has a valid session.
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  // 3. Keep signed-out users away from this page.
  if (!session) {
    redirect("/login");
  }

  const favouriteIds = await getUserFavouriteRecipeIds(session.user.id);

  // 4. Fetch recipes and their category names from PostgreSQL.
  const recipeList = await db
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
    .from(recipes)
    .innerJoin(categories, eq(recipes.categoryId, categories.id))
    .orderBy(desc(recipes.createdAt));

  const recipesWithFavourites = recipeList.map((recipe) => ({
    ...recipe,
    isFavourite: favouriteIds.has(recipe.id),
  }));

  return (
    <main>
      <header>
        <h1>Explore Nigerian Recipes</h1>
        <p>
          Welcome, {session.user.name}. Discover something delicious to cook.
        </p>
      </header>

      {recipeList.length === 0 ? (
        <section aria-labelledby="empty-recipes-heading">
          <h2 id="empty-recipes-heading">Our recipe collection is growing</h2>
          <p>
            There are no recipes to explore just yet. Check back soon for
            delicious Nigerian dishes.
          </p>
        </section>
      ) : (
        <RecipeList recipes={recipesWithFavourites} />
      )}
    </main>
  );
}
