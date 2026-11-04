
import { connection } from "next/server";
import Link from "next/link";

import IngredientForm from "@/components/admin/ingredient-form";

export const instant = false;

export default async function NewIngredientPage() {
  await connection();

  return (
    <section>
      <div>
        <h1>Add Ingredient</h1>
        <p>Add an ingredient to your recipe database.</p>

        <Link href="/admin/ingredients">
          Back to Ingredients
        </Link>
      </div>

      <IngredientForm />
    </section>
  );
}
