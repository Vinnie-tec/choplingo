import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { recipeFavourites } from "@/lib/db/schema/favourite";

export async function getUserFavouriteRecipeIds(userId: string) {
  const favourites = await db
    .select({
      recipeId: recipeFavourites.recipeId,
    })
    .from(recipeFavourites)
    .where(eq(recipeFavourites.userId, userId));

  return new Set(favourites.map((favourite) => favourite.recipeId));
}

export async function isRecipeFavourite(
  userId: string,
  recipeId: number,
) {
  const [favourite] = await db
    .select({ recipeId: recipeFavourites.recipeId })
    .from(recipeFavourites)
    .where(
      and(
        eq(recipeFavourites.userId, userId),
        eq(recipeFavourites.recipeId, recipeId),
      ),
    )
    .limit(1);

  return Boolean(favourite);
}