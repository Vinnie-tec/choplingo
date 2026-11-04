"use server";

import { createCategorySchema } from "@/lib/validators/category";
import { updateCategorySchema } from "@/lib/validators/category";

import { and, eq, ne, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, recipes } from "@/lib/db/schema/recipe";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

import { z } from "zod";

export async function createCategory(input: unknown) {
  // 1. Verify admin authorization.
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return {
      success: false,
      message: "You are not authorised to create categories.",
    };
  }

  // 2. Validate incoming data.
  const parsed = createCategorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid category details.",
    };
  }

  const { name, slug, description } = parsed.data;

  try {
    // 3. Check whether the slug already exists.
    const [existingCategory] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (existingCategory) {
      return {
        success: false,
        message: "A category with this slug already exists.",
      };
    }

    // 4. Create the category.
    await db.insert(categories).values({
      name,
      slug,
      description: description || null,
    });

    // 5. Refresh pages that depend on categories.
    revalidatePath("/admin/categories");
    revalidatePath("/admin/recipes/new");
    revalidatePath("/recipes");

    return {
      success: true,
      message: "Category created successfully.",
    };
  } catch (error) {
    console.error("Create category error:", error);

    // PostgreSQL unique constraint violation.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return {
        success: false,
        message: "A category with this slug already exists.",
      };
    }

    return {
      success: false,
      message: "We couldn't create the category. Please try again.",
    };
  }
}

export async function updateCategory(input: unknown) {
  // 1. Verify admin authorization.
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return {
      success: false,
      message: "You are not authorised to update categories.",
    };
  }

  // 2. Validate the submitted data.
  const parsed = updateCategorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid category details.",
    };
  }

  const { categoryId, name, slug, description } = parsed.data;

  try {
    // 3. Check whether another category already uses this slug.
    const [existingCategory] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.slug, slug),
          ne(categories.id, categoryId),
        ),
      )
      .limit(1);

    if (existingCategory) {
      return {
        success: false,
        message: "Another category already uses this slug.",
      };
    }

    // 4. Update the category.
    const [updatedCategory] = await db
      .update(categories)
      .set({
        name,
        slug,
        description: description || null,
      })
      .where(eq(categories.id, categoryId))
      .returning({ id: categories.id });

    if (!updatedCategory) {
      return {
        success: false,
        message: "Category not found.",
      };
    }

    // 5. Refresh affected pages.
    revalidatePath("/admin/categories");
    revalidatePath("/admin/recipes/new");
    revalidatePath("/admin/recipes");
    revalidatePath("/recipes");

    return {
      success: true,
      message: "Category updated successfully.",
    };
  } catch (error) {
    console.error("Update category error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return {
        success: false,
        message: "Another category already uses this slug.",
      };
    }

    return {
      success: false,
      message: "We couldn't update the category. Please try again.",
    };
  }
}

export async function deleteCategory(categoryId: unknown) {
  // 1. Only administrators can delete categories.
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return {
      success: false,
      message: "You are not authorized to perform this action.",
    };
  }

  // 2. Validate the category ID.
  const parsedId = z.coerce.number().int().positive().safeParse(categoryId);

  if (!parsedId.success) {
    return {
      success: false,
      message: "Invalid category ID.",
    };
  }

  try {
    // 3. Check whether recipes still use this category.
    const [result] = await db
      .select({ total: count() })
      .from(recipes)
      .where(eq(recipes.categoryId, parsedId.data));

    if (result.total > 0) {
      return {
        success: false,
        message: `Cannot delete this category because it contains ${result.total} recipe(s). Reassign those recipes first.`,
      };
    }

    // 4. Delete the category.
    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, parsedId.data))
      .returning({ id: categories.id });

    if (!deletedCategory) {
      return {
        success: false,
        message: "Category not found.",
      };
    }

    // 5. Refresh affected pages.
    revalidatePath("/admin/categories");
    revalidatePath("/admin/recipes/new");
    revalidatePath("/recipes");

    return {
      success: true,
      message: "Category deleted successfully.",
    };
  } catch (error) {
    console.error("Delete category error:", error);

    return {
      success: false,
      message: "Unable to delete category. Please try again.",
    };
  }
}