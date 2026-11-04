
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { ingredients } from "@/lib/db/schema/recipe";

import IngredientForm from "@/components/admin/ingredient-form";
import styles from "@/app/admin/admin.module.scss";

type EditIngredientPageProps = {
  params: Promise<{ id: string }>;
};

export const instant = false;

export default async function EditIngredientPage({
  params,
}: EditIngredientPageProps) {
  await connection();

  const { id } = await params;
  const ingredientId = Number(id);

  // Validate the URL parameter.
  if (!Number.isInteger(ingredientId) || ingredientId <= 0) {
    notFound();
  }

  // Fetch the ingredient.
  const [ingredient] = await db
    .select()
    .from(ingredients)
    .where(eq(ingredients.id, ingredientId))
    .limit(1);

  if (!ingredient) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>REFINE YOUR LIBRARY</p>
          <h1>Edit ingredient</h1>
          <p className={styles.subtitle}>
            Update the shared name for <strong>{ingredient.name}</strong>.
          </p>
        </div>
        <Link className={styles.secondaryButton} href="/admin/ingredients">
          <span aria-hidden="true">←</span> Back to ingredients
        </Link>
      </div>
      <IngredientForm key={ingredient.id} ingredient={ingredient} />
    </main>
  );
}
