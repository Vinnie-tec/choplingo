import { connection } from "next/server";

import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { recipes, categories } from "@/lib/db/schema/recipe";
import AdminRecipeList from "@/components/admin/recipe-list";
import styles from "../admin.module.scss";

export const instant = false;

export default async function AdminRecipesPage() {
  await connection();

  const allRecipes = await db
    .select({
      id: recipes.id,
      title: recipes.title,
      slug: recipes.slug,
      difficulty: recipes.difficulty,
      preparationMinutes: recipes.preparationMinutes,
      cookingMinutes: recipes.cookingMinutes,
      categoryName: categories.name,
      status: recipes.status,
    })
    .from(recipes)
    .leftJoin(categories, eq(recipes.categoryId, categories.id))
    .orderBy(desc(recipes.createdAt));

  return (
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>THE CHOPLINGO COLLECTION</p>
          <h1>Recipe management</h1>
          <p className={styles.subtitle}>
            Keep your recipes organised, polished, and ready to share.
          </p>
        </div>
        <Link className={styles.primaryButton} href="/admin/recipes/new">
          <span aria-hidden="true">＋</span> Add a recipe
        </Link>
      </div>
      <div className={styles.collectionSummary}>
        <span className={styles.summaryIcon} aria-hidden="true">🎨</span>
        <p>
          <strong>{allRecipes.length}</strong>{" "}
          {allRecipes.length === 1 ? "recipe" : "recipes"} in your collection
        </p>
      </div>
      <AdminRecipeList recipes={allRecipes} />
    </main>
  );
}
