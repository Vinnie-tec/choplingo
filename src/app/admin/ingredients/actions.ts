
"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { recipeIngredients } from "@/lib/db/schema/recipe";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { ingredients } from "@/lib/db/schema/recipe";
import { requireAdmin } from "@/lib/admin-auth";

import { z } from "zod";

import {
  createIngredientSchema,
  updateIngredientSchema,
} from "@/lib/validators/ingredient";

// CREATE INGREDIENT
export async function createIngredient(input: unknown) {
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return {
      success: false,
      message: "You are not authorized to perform this action.",
    };
  }

  const parsed = createIngredientSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid ingredient data.",
    };
  }

  const { name } = parsed.data;

  try {
    // Prevent duplicate ingredient names.
    const [existingIngredient] = await db
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(eq(ingredients.name, name))
      .limit(1);

    if (existingIngredient) {
      return {
        success: false,
        message: "An ingredient with this name already exists.",
      };
    }

    await db.insert(ingredients).values({ name });

    revalidatePath("/admin/ingredients");
    revalidatePath("/admin/recipes/new");

    return {
      success: true,
      message: "Ingredient created successfully.",
    };
  } catch (error) {
    // PostgreSQL unique constraint violation.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return {
        success: false,
        message: "An ingredient with this name already exists.",
      };
    }

    console.error("Create ingredient error:", error);

    return {
      success: false,
      message: "Unable to create ingredient. Please try again.",
    };
  }
}

// UPDATE INGREDIENT
export async function updateIngredient(input: unknown) {
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return {
      success: false,
      message: "You are not authorized to perform this action.",
    };
  }

  const parsed = updateIngredientSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid ingredient data.",
    };
  }

  const { ingredientId, name } = parsed.data;

  try {
    // Check for another ingredient with the same name.
    const [existingIngredient] = await db
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(
        and(
          eq(ingredients.name, name),
          ne(ingredients.id, ingredientId)
        )
      )
      .limit(1);

    if (existingIngredient) {
      return {
        success: false,
        message: "Another ingredient with this name already exists.",
      };
    }

    const [updatedIngredient] = await db
      .update(ingredients)
      .set({ name })
      .where(eq(ingredients.id, ingredientId))
      .returning({ id: ingredients.id });

    if (!updatedIngredient) {
      return {
        success: false,
        message: "Ingredient not found.",
      };
    }

    revalidatePath("/admin/ingredients");
    revalidatePath("/admin/recipes/new");
    revalidatePath("/recipes");

    return {
      success: true,
      message: "Ingredient updated successfully.",
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return {
        success: false,
        message: "An ingredient with this name already exists.",
      };
    }

    console.error("Update ingredient error:", error);

    return {
      success: false,
      message: "Unable to update ingredient. Please try again.",
    };
  }
}


export async function deleteIngredient(ingredientId: unknown) {
  // 1. Verify administrator access.
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return {
      success: false,
      message: "You are not authorized to perform this action.",
    };
  }

  // 2. Validate the ingredient ID.
  const parsedId = z.coerce.number().int().positive().safeParse(ingredientId);

  if (!parsedId.success) {
    return {
      success: false,
      message: "Invalid ingredient ID.",
    };
  }

  try {
    // 3. Check whether recipes use this ingredient.
    const [result] = await db
      .select({ total: count() })
      .from(recipeIngredients)
      .where(eq(recipeIngredients.ingredientId, parsedId.data));

    if (result.total > 0) {
      return {
        success: false,
        message: `Cannot delete this ingredient because it is used by ${result.total} recipe(s). Remove it from those recipes first.`,
      };
    }

    // 4. Delete the unused ingredient.
    const [deletedIngredient] = await db
      .delete(ingredients)
      .where(eq(ingredients.id, parsedId.data))
      .returning({ id: ingredients.id });

    if (!deletedIngredient) {
      return {
        success: false,
        message: "Ingredient not found.",
      };
    }

    // 5. Refresh affected pages.
    revalidatePath("/admin/ingredients");
    revalidatePath("/admin/recipes/new");

    return {
      success: true,
      message: "Ingredient deleted successfully.",
    };
  } catch (error) {
    console.error("Delete ingredient error:", error);

    return {
      success: false,
      message: "Unable to delete ingredient. Please try again.",
    };
  }
}
