
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { recipes } from "@/lib/db/schema/recipe";
import { recipeFavourites } from "@/lib/db/schema/favourite";

type FavouriteResult = {
  success: boolean;
  message: string;
};

export async function saveFavourite(
  recipeId: number,
): Promise<FavouriteResult> {
  // 1. Confirm that the request belongs to a signed-in user.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      success: false,
      message: "Please sign in to save favourites.",
    };
  }

  // 2. Validate the recipe ID.
  if (!Number.isInteger(recipeId) || recipeId <= 0) {
    return {
      success: false,
      message: "Invalid recipe.",
    };
  }

  // 3. Confirm that the recipe actually exists.
  const [recipe] = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipe) {
    return {
      success: false,
      message: "Recipe not found.",
    };
  }

  // 4. Save this recipe for the authenticated user.
  // The composite primary key prevents duplicate entries.
  await db
    .insert(recipeFavourites)
    .values({
      userId: session.user.id,
      recipeId,
    })
    .onConflictDoNothing();

  // 5. Refresh pages that display favourite information.
  revalidatePath("/recipes");
  revalidatePath("/favourites");
  revalidatePath(`/recipes/${recipeId}`);

  return {
    success: true,
    message: "Recipe added to your favourites.",
  };
}

export async function removeFavourite(
  recipeId: number,
): Promise<FavouriteResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      success: false,
      message: "Please sign in to manage favourites.",
    };
  }

  if (!Number.isInteger(recipeId) || recipeId <= 0) {
    return {
      success: false,
      message: "Invalid recipe.",
    };
  }

  // Both conditions are essential:
  // the recipe ID and the authenticated user's ID must match.
  await db
    .delete(recipeFavourites)
    .where(
      and(
        eq(recipeFavourites.recipeId, recipeId),
        eq(recipeFavourites.userId, session.user.id),
      ),
    );

  revalidatePath("/recipes");
  revalidatePath("/favourites");
  revalidatePath(`/recipes/${recipeId}`);

  return {
    success: true,
    message: "Recipe removed from your favourites.",
  };
}
