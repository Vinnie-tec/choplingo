"use client";

import { useState } from "react";

import styles from "./category-list.module.scss";

type DeleteCategoryButtonProps = {
  categoryId: number;
  categoryName: string;
  isPending: boolean;
  disabled: boolean;
  onConfirm: () => void;
};

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
  isPending,
  disabled,
  onConfirm,
}: DeleteCategoryButtonProps) {
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
        disabled={disabled}
      >
        Delete
      </button>

      {showConfirmation && (
        <div className={styles.dialogBackdrop}>
          <div
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-category-title-${categoryId}`}
            aria-describedby={`delete-category-description-${categoryId}`}
          >
            <span className={styles.dialogIcon} aria-hidden="true">!</span>
            <p className={styles.dialogEyebrow}>REMOVE CATEGORY</p>
            <h2 id={`delete-category-title-${categoryId}`}>
              Delete {categoryName}?
            </h2>
            <p id={`delete-category-description-${categoryId}`}>
              Categories can only be deleted when no recipes are assigned to
              them. This action cannot be undone.
            </p>
            <div className={styles.dialogActions}>
              <button
                className={styles.cancelButton}
                type="button"
                onClick={() => setShowConfirmation(false)}
                disabled={isPending}
              >
                Keep category
              </button>
              <button
                className={styles.confirmDeleteButton}
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending ? "Deleting…" : "Delete category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
