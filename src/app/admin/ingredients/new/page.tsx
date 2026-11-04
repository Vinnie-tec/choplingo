
import { connection } from "next/server";
import Link from "next/link";

import IngredientForm from "@/components/admin/ingredient-form";
import styles from "../../admin.module.scss";

export const instant = false;

export default async function NewIngredientPage() {
  await connection();

  return (
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.eyebrow}>GROW YOUR INGREDIENT LIBRARY</p>
          <h1>Add an ingredient</h1>
          <p className={styles.subtitle}>
            Add a reusable ingredient that can be shared across recipes.
          </p>
        </div>
        <Link className={styles.secondaryButton} href="/admin/ingredients">
          <span aria-hidden="true">←</span> Back to ingredients
        </Link>
      </div>
      <IngredientForm />
    </main>
  );
}
