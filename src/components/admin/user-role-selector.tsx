
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateUserRole } from "@/app/admin/users/actions";
import { useToast } from "@/components/toast-provider";

type UserRole = "user" | "admin";

type UserRoleSelectorProps = {
  userId: string;
  currentRole: UserRole;
  userName: string;
  isCurrentUser: boolean;
};

export default function UserRoleSelector({
  userId,
  currentRole,
  userName,
  isCurrentUser,
}: UserRoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const { showToast } = useToast();

  function handleRoleChange(newRole: UserRole) {
    if (newRole === currentRole) return;

    const confirmed = window.confirm(
      `Are you sure you want to change ${userName}'s role from ${currentRole} to ${newRole}?`
    );

    if (!confirmed) {
      setSelectedRole(currentRole);
      return;
    }

    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);

      if (!result.success) {
        showToast(result.message, "error");
        setSelectedRole(currentRole);
        return;
      }

      showToast(result.message, "success");
      router.refresh();
    });
  }

  return (
    <select
      value={selectedRole}
      disabled={isPending || isCurrentUser}
      onChange={(event) =>
        handleRoleChange(event.target.value as UserRole)
      }
      aria-label={`Change role for ${userName}`}
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  );
}
