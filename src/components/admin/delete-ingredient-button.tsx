
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteIngredient } from "@/app/admin/ingredients/actions";
import { useToast } from "@/components/toast-provider";

type DeleteIngredientButtonProps = {
  ingredientId: number;
  ingredientName: string;
};

export default function DeleteIngredientButton({
  ingredientId,
  ingredientName,
}: DeleteIngredientButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${ingredientName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteIngredient(ingredientId);

      if (!result.success) {
        showToast(result.message, "error");
        return;
      }

      showToast(result.message, "success");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
