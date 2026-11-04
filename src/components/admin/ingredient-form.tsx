
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createIngredient,
  updateIngredient,
} from "@/app/admin/ingredients/actions";

import { useToast } from "@/components/toast-provider";

import type { ingredients } from "@/lib/db/schema/recipe";

type Ingredient = typeof ingredients.$inferSelect;

type IngredientFormProps = {
  ingredient?: Ingredient;
};

export default function IngredientForm({
  ingredient,
}: IngredientFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(ingredient?.name ?? "");

  const isEditing = ingredient !== undefined;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = isEditing
        ? await updateIngredient({
            ingredientId: ingredient.id,
            name,
          })
        : await createIngredient({ name });

      if (!result.success) {
        showToast(result.message, "error");
        return;
      }

      showToast(result.message, "success");

      router.push("/admin/ingredients");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Ingredient Name</label>

        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Groundnut Oil"
          required
          minLength={2}
          maxLength={100}
          disabled={isPending}
        />
      </div>

      <button type="submit" disabled={isPending}>
        {isPending
          ? isEditing
            ? "Saving..."
            : "Creating..."
          : isEditing
            ? "Update Ingredient"
            : "Create Ingredient"}
      </button>
    </form>
  );
}
