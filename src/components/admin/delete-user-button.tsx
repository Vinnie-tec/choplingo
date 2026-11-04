
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteUserAccount } from "@/app/admin/users/actions";
import { useToast } from "@/components/toast-provider";

type DeleteUserButtonProps = {
  userId: string;
  userName: string;
  isCurrentUser: boolean;
};

export default function DeleteUserButton({
  userId,
  userName,
  isCurrentUser,
}: DeleteUserButtonProps) {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const { showToast } = useToast();

  function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${userName}'s account? This action cannot be undone.`
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteUserAccount(userId);

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
      disabled={isPending || isCurrentUser}
      aria-label={`Delete ${userName}'s account`}
    >
      {isPending ? "Deleting..." : "Delete Account"}
    </button>
  );
}
