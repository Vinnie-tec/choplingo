"use client";

import { startTransition, useOptimistic, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { deleteIngredient } from "@/app/admin/ingredients/actions";
import { useToast } from "@/components/toast-provider";
import DeleteIngredientButton from "@/components/admin/delete-ingredient-button";

import styles from "./ingredient-list.module.scss";

type AdminIngredient = {
  id: number;
  name: string;
  recipeCount: number;
};

type IngredientListProps = {
  ingredients: AdminIngredient[];
};

export default function AdminIngredientList({
  ingredients,
}: IngredientListProps) {
  const [pendingIngredientId, setPendingIngredientId] = useState<number | null>(
    null,
  );
  const [optimisticIngredients, setOptimisticIngredients] = useOptimistic(
    ingredients,
    (currentIngredients, deletedIngredientId: number) =>
      currentIngredients.filter(
        (ingredient) => ingredient.id !== deletedIngredientId,
      ),
  );
  const router = useRouter();
  const { showToast } = useToast();

  function handleDelete(ingredientId: number) {
    setPendingIngredientId(ingredientId);

    startTransition(async () => {
      setOptimisticIngredients(ingredientId);

      try {
        const result = await deleteIngredient(ingredientId);

        if (!result.success) {
          showToast(result.message, "error");
          return;
        }

        showToast(result.message, "success");
        router.refresh();
      } catch {
        showToast("Something went wrong. Please try again.", "error");
      } finally {
        setPendingIngredientId(null);
      }
    });
  }

  return (
    <section className={styles.list} aria-label="Shared ingredients">
      <div className={styles.listHeader}>
        <div>
          <h2>Ingredient library</h2>
          <p>Ingredients in use are protected from accidental removal.</p>
        </div>
        <span className={styles.countBadge}>
          {optimisticIngredients.length}{" "}
          {optimisticIngredients.length === 1 ? "ingredient" : "ingredients"}
        </span>
      </div>

      {optimisticIngredients.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">✦</span>
          <h2>
            {ingredients.length === 0
              ? "Your ingredient library is ready to grow"
              : "All unused ingredients have been removed"}
          </h2>
          <p>
            {ingredients.length === 0
              ? "Add ingredients here to reuse them easily in recipes."
              : "Add another ingredient whenever your recipe collection needs it."}
          </p>
          <Link className={styles.emptyAction} href="/admin/ingredients/new">
            Add an ingredient <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <div className={styles.tableScroller}>
          <table className={styles.ingredientTable}>
            <thead>
              <tr>
                <th scope="col">Ingredient</th>
                <th scope="col">Used in</th>
                <th scope="col"><span className={styles.srOnly}>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {optimisticIngredients.map((ingredient) => {
                const isPending = pendingIngredientId === ingredient.id;
                const isUsed = ingredient.recipeCount > 0;

                return (
                  <tr key={ingredient.id} aria-busy={isPending}>
                    <td>
                      <div className={styles.ingredientCell}>
                        <span className={styles.ingredientMark} aria-hidden="true">
                          {ingredient.name.trim().charAt(0).toUpperCase() || "✦"}
                        </span>
                        <div className={styles.ingredientIdentity}>
                          <strong>{ingredient.name}</strong>
                          <span>Shared recipe ingredient</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.usageBadge}>
                        <strong>{ingredient.recipeCount}</strong>
                        {ingredient.recipeCount === 1 ? " recipe" : " recipes"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          className={styles.editLink}
                          href={`/admin/ingredients/${ingredient.id}/edit`}
                          aria-label={`Edit ${ingredient.name}`}
                        >
                          Edit
                        </Link>
                        <DeleteIngredientButton
                          ingredientId={ingredient.id}
                          ingredientName={ingredient.name}
                          isPending={isPending}
                          disabled={pendingIngredientId !== null}
                          isUsed={isUsed}
                          onConfirm={() => handleDelete(ingredient.id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
