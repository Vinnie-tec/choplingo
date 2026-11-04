"use client";

import { useState } from "react";

import styles from "./user-management.module.scss";

type DeleteUserButtonProps = {
  userId: string;
  userName: string;
  isCurrentUser: boolean;
  disabled: boolean;
  isPending: boolean;
  onConfirm: () => void;
};

export default function DeleteUserButton({
  userId,
  userName,
  isCurrentUser,
  disabled,
  isPending,
  onConfirm,
}: DeleteUserButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  function handleConfirm() {
    setShowConfirmation(false);
    onConfirm();
  }

  return (
    <>
      <button
        className={styles.deleteButton}
        type="button"
        onClick={() => setShowConfirmation(true)}
        disabled={disabled || isPending || isCurrentUser}
        aria-label={`Delete ${userName}'s account`}
        title={isCurrentUser ? "You cannot delete your own account" : undefined}
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>

      {showConfirmation && (
        <div className={styles.dialogBackdrop}>
          <div
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-user-title-${userId}`}
            aria-describedby={`delete-user-description-${userId}`}
          >
            <span className={styles.dialogIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false">
                <path
                  d="M4.5 7h15m-13.5 0 .8 13h10.4L18 7M9 7V4.5h6V7m-4.5 3v6m3-6v6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </svg>
            </span>
            <p className={styles.dialogEyebrow}>DELETE ACCOUNT</p>
            <h2 id={`delete-user-title-${userId}`}>Remove {userName}?</h2>
            <p id={`delete-user-description-${userId}`}>
              This account and its associated data will be permanently deleted.
              This action cannot be undone.
            </p>
            <p className={styles.dialogNotice}>
              <span aria-hidden="true">!</span> Permanent account deletion
            </p>
            <div className={styles.dialogActions}>
              <button
                className={styles.cancelButton}
                type="button"
                onClick={() => setShowConfirmation(false)}
                disabled={isPending}
              >
                Keep account
              </button>
              <button
                className={styles.confirmDeleteButton}
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
