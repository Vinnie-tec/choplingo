import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { recipes } from "@/lib/db/schema/recipe";
import { recipeFavourites } from "@/lib/db/schema/favourite";

export async function getUserFavouriteRecipeIds(userId: string) {
  const favourites = await db
    .select({
      recipeId: recipeFavourites.recipeId,
    })
    .from(recipeFavourites)
    .innerJoin(recipes, eq(recipeFavourites.recipeId, recipes.id))
    .where(
      and(eq(recipeFavourites.userId, userId), eq(recipes.status, "published")),
    );

  return new Set(favourites.map((favourite) => favourite.recipeId));
}

export async function isRecipeFavourite(userId: string, recipeId: number) {
  const [favourite] = await db
    .select({ recipeId: recipeFavourites.recipeId })
    .from(recipeFavourites)
    .innerJoin(recipes, eq(recipeFavourites.recipeId, recipes.id))
    .where(
      and(
        eq(recipeFavourites.userId, userId),
        eq(recipeFavourites.recipeId, recipeId),
        eq(recipes.status, "published"),
      ),
    )
    .limit(1);

  return Boolean(favourite);
}
