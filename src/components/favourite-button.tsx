
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { saveFavourite, removeFavourite } from "@/app/recipes/actions";
import { useToast } from "@/components/toast-provider";

type FavouriteButtonProps = {
  recipeId: number;
  initialIsFavourite: boolean;
};

export default function FavouriteButton({
  recipeId,
  initialIsFavourite,
}: FavouriteButtonProps) {
  const [isFavourite, setIsFavourite] = useState(initialIsFavourite);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  function handleToggle() {
    startTransition(async () => {
      const result = isFavourite
        ? await removeFavourite(recipeId)
        : await saveFavourite(recipeId);

      if (!result.success) {
        showToast(result.message, "error");
        return;
      }

      setIsFavourite((current) => !current);
      showToast(result.message, "success");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={isFavourite}
      aria-label={
        isFavourite ? "Remove from favourites" : "Add to favourites"
      }
    >
      {isPending
        ? "Saving..."
        : isFavourite
          ? "♥ Saved"
          : "♡ Add to favourites"}
    </button>
  );
}
