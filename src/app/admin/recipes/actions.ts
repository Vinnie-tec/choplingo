"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import {
  categories,
  ingredients,
  recipes,
  recipeIngredients,
} from "@/lib/db/schema/recipe";

import { requireAdmin } from "@/lib/admin-auth";
import { createRecipeSchema } from "@/lib/validators/recipe";
import { recipeStatusSchema } from "@/lib/validators/recipe-status";

export async function createRecipe(formData: unknown) {
  // 1. Check administrator permissions.
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return {
      success: false,
      message:
        admin.reason === "unauthenticated"
          ? "Please sign in to continue."
          : "You are not authorised to perform this action.",
    };
  }

  // 2. Validate incoming data on the server.
  const parsed = createRecipeSchema.safeParse(formData);

  if (!parsed.success) {
    console.error(
      "Recipe validation errors:",
      parsed.error.flatten().fieldErrors,
    );
    return {
      success: false,
      message: "Please check the recipe details.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    // 3. Save everything in one transaction.
    const recipeId = await db.transaction(async (tx) => {
      // Confirm that the selected category exists.
      const [category] = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, data.categoryId))
        .limit(1);

      if (!category) {
        throw new Error("The selected category does not exist.");
      }

      // Create the main recipe record.
      const [newRecipe] = await tx
        .insert(recipes)
        .values({
          title: data.title,
          slug: data.slug,
          description: data.description,
          categoryId: data.categoryId,
          preparationMinutes: data.preparationMinutes,
          cookingMinutes: data.cookingMinutes,
          servings: data.servings,
          difficulty: data.difficulty,
          imageUrl: data.imageUrl || null,
          instructions: data.instructions,
          status: data.status,
        })
        .returning({ id: recipes.id });

      // Create or reuse each ingredient.
      for (const item of data.ingredients) {
        // Avoid creating duplicate ingredient records.
        await tx
          .insert(ingredients)
          .values({ name: item.name })
          .onConflictDoNothing({
            target: ingredients.name,
          });

        // Retrieve the existing or newly created ingredient.
        const [ingredient] = await tx
          .select({ id: ingredients.id })
          .from(ingredients)
          .where(eq(ingredients.name, item.name))
          .limit(1);

        if (!ingredient) {
          throw new Error(`Could not find ingredient: ${item.name}`);
        }

        // Connect the ingredient to this recipe.
        await tx.insert(recipeIngredients).values({
          recipeId: newRecipe.id,
          ingredientId: ingredient.id,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes || null,
        });
      }

      return newRecipe.id;
    });

    // 4. Refresh pages that display recipe information.
    revalidatePath("/admin");
    revalidatePath("/admin/recipes");
    revalidatePath("/recipes");

    return {
      success: true,
      message: "Recipe created successfully.",
      recipeId,
    };
  } catch (error) {
    console.error("Create recipe error:", error);

    // PostgreSQL unique constraint violation.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return {
        success: false,
        message: "A recipe with this slug already exists.",
      };
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the recipe.",
    };
  }
}

export async function updateRecipe(recipeId: number, formData: unknown) {
  // 1. Only administrators can edit recipes.
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return {
      success: false,
      message: "You are not authorised to edit recipes.",
    };
  }

  // 2. Validate the recipe ID.
  if (!Number.isSafeInteger(recipeId) || recipeId <= 0) {
    return {
      success: false,
      message: "Invalid recipe ID.",
    };
  }

  // 3. Validate the submitted recipe data.
  const parsed = createRecipeSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check the recipe details.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // Prevent duplicate ingredient names in one recipe,
  // ignoring differences in letter casing.
  const ingredientNames = data.ingredients.map((item) =>
    item.name.trim().toLowerCase(),
  );

  if (new Set(ingredientNames).size !== ingredientNames.length) {
    return {
      success: false,
      message: "An ingredient cannot appear twice in the same recipe.",
    };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // Find the existing recipe.
      const [existingRecipe] = await tx
        .select({ slug: recipes.slug })
        .from(recipes)
        .where(eq(recipes.id, recipeId))
        .limit(1);

      if (!existingRecipe) {
        throw new Error("Recipe not found.");
      }

      // Check whether another recipe already uses this slug.
      const [slugConflict] = await tx
        .select({ id: recipes.id })
        .from(recipes)
        .where(and(eq(recipes.slug, data.slug), ne(recipes.id, recipeId)))
        .limit(1);

      if (slugConflict) {
        throw new Error("A recipe with this slug already exists.");
      }

      // Verify that the selected category exists.
      const [category] = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, data.categoryId))
        .limit(1);

      if (!category) {
        throw new Error("The selected category does not exist.");
      }

      // Update the main recipe record.
      await tx
        .update(recipes)
        .set({
          title: data.title,
          slug: data.slug,
          description: data.description,
          categoryId: data.categoryId,
          preparationMinutes: data.preparationMinutes,
          cookingMinutes: data.cookingMinutes,
          servings: data.servings,
          difficulty: data.difficulty,
          imageUrl: data.imageUrl || null,
          instructions: data.instructions,
          status: data.status,
          updatedAt: new Date(),
        })
        .where(eq(recipes.id, recipeId));

      // Remove the old ingredient relationships.
      await tx
        .delete(recipeIngredients)
        .where(eq(recipeIngredients.recipeId, recipeId));

      // Recreate the ingredient relationships.
      for (const item of data.ingredients) {
        await tx
          .insert(ingredients)
          .values({ name: item.name })
          .onConflictDoNothing({
            target: ingredients.name,
          });

        const [ingredient] = await tx
          .select({ id: ingredients.id })
          .from(ingredients)
          .where(eq(ingredients.name, item.name))
          .limit(1);

        if (!ingredient) {
          throw new Error(`Could not find ingredient: ${item.name}`);
        }

        await tx.insert(recipeIngredients).values({
          recipeId,
          ingredientId: ingredient.id,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes || null,
        });
      }

      return {
        oldSlug: existingRecipe.slug,
        newSlug: data.slug,
      };
    });

    // Refresh affected pages.
    revalidatePath("/admin");
    revalidatePath("/admin/recipes");
    revalidatePath("/recipes");
    revalidatePath(`/recipes/${result.oldSlug}`);
    revalidatePath(`/recipes/${result.newSlug}`);

    return {
      success: true,
      message: "Recipe updated successfully.",
    };
  } catch (error) {
    console.error("Update recipe error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the recipe.",
    };
  }
}

export async function deleteRecipe(recipeId: number) {
  // 1. Verify administrator permissions.
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return {
      success: false,
      message: "You are not authorised to delete recipes.",
    };
  }

  // 2. Validate the recipe ID.
  if (!Number.isSafeInteger(recipeId) || recipeId <= 0) {
    return {
      success: false,
      message: "Invalid recipe ID.",
    };
  }

  try {
    // 3. Find and delete the recipe.
    const [deletedRecipe] = await db
      .delete(recipes)
      .where(eq(recipes.id, recipeId))
      .returning({
        id: recipes.id,
        slug: recipes.slug,
      });

    if (!deletedRecipe) {
      return {
        success: false,
        message: "Recipe not found.",
      };
    }

    // 4. Refresh pages affected by the deletion.
    revalidatePath("/admin");
    revalidatePath("/admin/recipes");
    revalidatePath("/recipes");
    revalidatePath("/favourites");
    revalidatePath(`/recipes/${deletedRecipe.slug}`);

    return {
      success: true,
      message: "Recipe deleted successfully.",
    };
  } catch (error) {
    console.error("Delete recipe error:", error);

    return {
      success: false,
      message: "Something went wrong while deleting the recipe.",
    };
  }
}

export async function updateRecipeStatus(input: unknown) {
  // 1. Verify administrator permissions.
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return {
      success: false,
      message: "You are not authorised to change recipe status.",
    };
  }

  // 2. Validate the submitted data.
  const parsed = recipeStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid recipe status details.",
    };
  }

  const { recipeId, status } = parsed.data;

  try {
    // 3. Update the recipe's publication status.
    const [updatedRecipe] = await db
      .update(recipes)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, recipeId))
      .returning({
        id: recipes.id,
        slug: recipes.slug,
      });

    if (!updatedRecipe) {
      return {
        success: false,
        message: "Recipe not found.",
      };
    }

    // 4. Refresh affected pages.
    revalidatePath("/admin");
    revalidatePath("/admin/recipes");
    revalidatePath("/recipes");
    revalidatePath("/favourites");
    revalidatePath(`/recipes/${updatedRecipe.slug}`);

    return {
      success: true,
      message:
        status === "published"
          ? "Recipe published successfully."
          : "Recipe unpublished successfully.",
    };
  } catch (error) {
    console.error("Update recipe status error:", error);

    return {
      success: false,
      message: "We couldn't update the recipe status. Please try again.",
    };
  }
}