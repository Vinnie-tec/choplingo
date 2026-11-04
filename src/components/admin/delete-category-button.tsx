
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteCategory } from "@/app/admin/categories/actions";
import { useToast } from "@/components/toast-provider";

type DeleteCategoryButtonProps = {
  categoryId: number;
  categoryName: string;
};

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
}: DeleteCategoryButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteCategory(categoryId);

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
