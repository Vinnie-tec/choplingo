import { connection } from "next/server";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { ingredients, recipeIngredients } from "@/lib/db/schema/recipe";
import AdminIngredientList from "@/components/admin/ingredient-list";
import styles from "../admin.module.scss";

export const instant = false;

export default async function AdminIngredientsPage() {
  await connection();

  // Fetch ingredients and count how many recipes use each one.
  const ingredientList = await db
    .select({
      id: ingredients.id,
      name: ingredients.name,
      recipeCount: count(recipeIngredients.recipeId),
    })
    .from(ingredients)
    .leftJoin(
      recipeIngredients,
      eq(ingredients.id, recipeIngredients.ingredientId),
    )
    .groupBy(ingredients.id)
    .orderBy(asc(ingredients.name));

  return (
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>YOUR KITCHEN ESSENTIALS</p>
          <h1>Ingredients</h1>
          <p className={styles.subtitle}>
            Keep the shared ingredient library tidy and ready for every recipe.
          </p>
        </div>
        <Link className={styles.primaryButton} href="/admin/ingredients/new">
          <span aria-hidden="true">＋</span> Add an ingredient
        </Link>
      </div>
      <div className={styles.collectionSummary}>
        <span className={styles.summaryIcon} aria-hidden="true">🎨</span>
        <p>
          <strong>{ingredientList.length}</strong>{" "}
          {ingredientList.length === 1 ? "ingredient" : "ingredients"} in your
          shared library
        </p>
      </div>
      <AdminIngredientList ingredients={ingredientList} />
    </main>
  );
}
