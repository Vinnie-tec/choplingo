
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createIngredient,
  updateIngredient,
} from "@/app/admin/ingredients/actions";

import { useToast } from "@/components/toast-provider";

import type { ingredients } from "@/lib/db/schema/recipe";
import styles from "./ingredient-form.module.scss";

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
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formCard}>
        <div className={styles.formIntro}>
          <span className={styles.formIcon} aria-hidden="true">🎨</span>
          <div>
            <h2>{isEditing ? "Ingredient details" : "One ingredient, many recipes"}</h2>
            <p>
              {isEditing
                ? "Ingredient names are shared wherever they appear in recipes."
                : "Add a clear, familiar name so it can be reused across your recipes."}
            </p>
          </div>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label htmlFor="name">Ingredient name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Groundnut oil"
              required
              minLength={2}
              maxLength={100}
              disabled={isPending}
              autoComplete="off"
            />
            <small>
              Use the common ingredient name. Duplicate names are not allowed.
            </small>
          </div>
        </div>

        <div className={styles.preview}>
          <span className={styles.previewMark} aria-hidden="true">
            {name.trim().charAt(0).toUpperCase() || "🎨"}
          </span>
          <div className={styles.previewCopy}>
            <span className={styles.previewLabel}>INGREDIENT PREVIEW</span>
            <strong>{name.trim() || "Your ingredient name"}</strong>
            <span>Shared across your recipe library</span>
          </div>
        </div>
      </div>

      <div className={styles.formFooter}>
        <p>Changes apply to this ingredient wherever it is used.</p>
        <button className={styles.submitButton} type="submit" disabled={isPending}>
          {isPending
            ? isEditing
              ? "Saving changes…"
              : "Adding ingredient…"
            : isEditing
              ? "Save changes"
              : "Add ingredient"}
          {!isPending && <span aria-hidden="true">→</span>}
        </button>
      </div>
    </form>
  );
}
