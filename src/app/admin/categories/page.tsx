import { connection } from "next/server";
import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { categories, recipes } from "@/lib/db/schema/recipe";
import AdminCategoryList from "@/components/admin/category-list";
import styles from "../admin.module.scss";

export const instant = false;

export default async function AdminCategoriesPage() {
  await connection();

  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      recipeCount: count(recipes.id),
    })
    .from(categories)
    .leftJoin(recipes, eq(recipes.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));

  return (
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>ORGANISE YOUR COLLECTION</p>
          <h1>Recipe categories</h1>
          <p className={styles.subtitle}>
            Group recipes into collections that make discovery feel effortless.
          </p>
        </div>
        <Link className={styles.primaryButton} href="/admin/categories/new">
          <span aria-hidden="true">＋</span> Add a category
        </Link>
      </div>
      <div className={styles.collectionSummary}>
        <span className={styles.summaryIcon} aria-hidden="true">🎨</span>
        <p>
          <strong>{allCategories.length}</strong>{" "}
          {allCategories.length === 1 ? "category" : "categories"} organizing
          your recipes
        </p>
      </div>
      <AdminCategoryList categories={allCategories} />
    </main>
  );
}
