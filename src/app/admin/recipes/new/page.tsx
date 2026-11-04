
import { asc } from "drizzle-orm";
import { connection } from "next/server";

import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/recipe";
import RecipeForm from "@/components/admin/recipe-form";
import Link from "next/link";
import styles from "../../admin.module.scss";

export const instant = false;

export default async function NewRecipePage() {
  await connection();

  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .orderBy(asc(categories.name));

  return (
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>ADD TO THE COLLECTION</p>
          <h1>Create a new recipe</h1>
          <p className={styles.subtitle}>
            Capture the ingredients, steps, and details that make it special.
          </p>
        </div>
        <Link className={styles.secondaryButton} href="/admin/recipes">
          <span aria-hidden="true">←</span> Back to recipes
        </Link>
      </div>

      {allCategories.length === 0 ? (
        <section className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">✦</span>
          <h2>Your kitchen needs a category first</h2>
          <p>You need to create a category before adding recipes.</p>
        </section>
      ) : (
        <RecipeForm categories={allCategories} />
      )}
    </main>
  );
}
