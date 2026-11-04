
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { ingredients } from "@/lib/db/schema/recipe";

import IngredientForm from "@/components/admin/ingredient-form";

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
    <section>
      <div>
        <h1>Edit Ingredient</h1>
        <p>Update the ingredient name.</p>

        <Link href="/admin/ingredients">
          Back to Ingredients
        </Link>
      </div>

      <IngredientForm
        key={ingredient.id}
        ingredient={ingredient}
      />
    </section>
  );
}
