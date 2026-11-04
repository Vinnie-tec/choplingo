"use client";

import { useState } from "react";

import styles from "./recipe-list.module.scss";

type DeleteRecipeButtonProps = {
  recipeId: number;
  recipeTitle: string;
  isPending: boolean;
  disabled: boolean;
  onConfirm: () => void;
};

export default function DeleteRecipeButton({
  recipeId,
  recipeTitle,
  isPending,
  disabled,
  onConfirm,
}: DeleteRecipeButtonProps) {
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
            aria-labelledby={`delete-title-${recipeId}`}
            aria-describedby={`delete-description-${recipeId}`}
          >
            <span className={styles.dialogIcon} aria-hidden="true">!</span>
            <p className={styles.dialogEyebrow}>REMOVE RECIPE</p>
            <h2 id={`delete-title-${recipeId}`}>Delete {recipeTitle}?</h2>
            <p id={`delete-description-${recipeId}`}>
              This cannot be undone. The recipe, its reviews, and its favourites
              will be permanently deleted.
            </p>
            <div className={styles.dialogActions}>
              <button
                className={styles.cancelButton}
                type="button"
                onClick={() => setShowConfirmation(false)}
                disabled={isPending}
              >
                Keep recipe
              </button>
              <button
                className={styles.confirmDeleteButton}
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending ? "Deleting…" : "Delete recipe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
