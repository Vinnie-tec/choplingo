"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteReview } from "@/app/admin/reviews/actions";
import { useToast } from "@/components/toast-provider";

type DeleteReviewButtonProps = {
  reviewId: number;
  recipeTitle: string;
};

export default function DeleteReviewButton({
  reviewId,
  recipeTitle,
}: DeleteReviewButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete this review for "${recipeTitle}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteReview(reviewId);

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