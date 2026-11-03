
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteRecipe } from "@/app/admin/recipes/actions";
import { useToast } from "@/components/toast-provider";

type DeleteRecipeButtonProps = {
  recipeId: number;
  recipeTitle: string;
};

export default function DeleteRecipeButton({
  recipeId,
  recipeTitle,
}: DeleteRecipeButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isPending, startTransition] = useTransition();
  const [showConfirmation, setShowConfirmation] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteRecipe(recipeId);

      if (!result.success) {
        showToast(result.message, "error");
        setShowConfirmation(false);
        return;
      }

      showToast(result.message, "success");
      setShowConfirmation(false);

      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowConfirmation(true)}
        disabled={isPending}
      >
        Delete
      </button>

      {showConfirmation && (
        <div role="alertdialog" aria-labelledby={`delete-title-${recipeId}`}>
          <h3 id={`delete-title-${recipeId}`}>
            Delete {recipeTitle}?
          </h3>

          <p>
            This action cannot be undone. The recipe, its reviews,
            and its favourites will be permanently deleted.
          </p>

          <button
            type="button"
            onClick={() => setShowConfirmation(false)}
            disabled={isPending}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
