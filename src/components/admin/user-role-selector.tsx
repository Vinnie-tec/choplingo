"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateUserRole } from "@/app/admin/users/actions";
import { useToast } from "@/components/toast-provider";

import styles from "./user-management.module.scss";

type UserRole = "user" | "admin";

type UserRoleSelectorProps = {
  userId: string;
  currentRole: UserRole;
  userName: string;
  isCurrentUser: boolean;
  disabled: boolean;
};

export default function UserRoleSelector({
  userId,
  currentRole,
  userName,
  isCurrentUser,
  disabled,
}: UserRoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [proposedRole, setProposedRole] = useState<UserRole | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  function handleRoleChange(newRole: UserRole) {
    if (newRole === currentRole) return;

    setSelectedRole(newRole);
    setProposedRole(newRole);
  }

  function cancelRoleChange() {
    setSelectedRole(currentRole);
    setProposedRole(null);
  }

  function confirmRoleChange() {
    if (!proposedRole) return;

    startTransition(async () => {
      try {
        const result = await updateUserRole(userId, proposedRole);

        if (!result.success) {
          setSelectedRole(currentRole);
          showToast(result.message, "error");
          setProposedRole(null);
          return;
        }

        showToast(result.message, "success");
        setProposedRole(null);
        router.refresh();
      } catch {
        setSelectedRole(currentRole);
        setProposedRole(null);
        showToast("Something went wrong. Please try again.", "error");
      }
    });
  }

  return (
    <>
      <select
        className={styles.roleSelect}
        value={selectedRole}
        disabled={isPending || disabled || isCurrentUser}
        onChange={(event) =>
          handleRoleChange(event.target.value as UserRole)
        }
        aria-label={`Change role for ${userName}`}
      >
        <option value="user">Member</option>
        <option value="admin">Admin</option>
      </select>

      {proposedRole && (
        <div className={styles.dialogBackdrop}>
          <div
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`change-role-title-${userId}`}
            aria-describedby={`change-role-description-${userId}`}
          >
            <span className={`${styles.dialogIcon} ${styles.roleDialogIcon}`} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false">
                <path
                  d="M12 3.75 14.5 9l5.75.75-4.25 4 .95 5.75L12 16.75l-4.95 2.75.95-5.75-4.25-4L9.5 9 12 3.75Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </span>
            <p className={styles.roleDialogEyebrow}>UPDATE ACCOUNT ACCESS</p>
            <h2 id={`change-role-title-${userId}`}>
              {proposedRole === "admin"
                ? "Make this member an admin?"
                : "Remove admin access?"}
            </h2>
            <p id={`change-role-description-${userId}`}>
              {proposedRole === "admin" ? (
                <>
                  <strong>{userName}</strong> will be able to access and manage
                  the ChopLingo admin workspace.
                </>
              ) : (
                <>
                  <strong>{userName}</strong> will lose access to the admin
                  workspace and become a regular member.
                </>
              )}
            </p>
            <div className={styles.dialogActions}>
              <button
                className={styles.cancelButton}
                type="button"
                onClick={cancelRoleChange}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                className={styles.confirmRoleButton}
                type="button"
                onClick={confirmRoleChange}
                disabled={isPending}
              >
                {isPending
                  ? "Updating…"
                  : proposedRole === "admin"
                    ? "Grant admin access"
                    : "Remove admin access"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
